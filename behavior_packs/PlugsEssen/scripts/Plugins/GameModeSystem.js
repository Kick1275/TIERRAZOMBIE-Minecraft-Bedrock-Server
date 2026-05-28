﻿import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { registerCustomResolver } from "../Core/PlaceholderResolver.js";
import { giveMenuBook } from "../Server/UserUI.js";
import { progressMission, SHOTGUN_IDS, PISTOL_IDS } from "./DailyMissions.js";
import { onMatchStarted, onMatchEnded, getAirdropMatchCount, getAirdropDropState, getAirdropDropPos, getAirdropUnlockAt, getAirdropClearAt, forceAirdrop, resetMatchCount, getAirdropConfig, setAirdropConfig } from "./AirDropSystem.js";
import { PETRO_MAP, onPetroMatchStarted, onPetroMatchEnded, forcePetroEvent, isPetroEvent, enterPetroMap, exitPetroMap, checkPetroBoundaries, getPetroEventState, getPetroMatchCount, getPetroDropUnlockAt, getPetroDropClearAt, getPetroConfig, setPetroConfig, randomBorderSpawn } from "./PetroEventSystem.js";
import { allowLeaveContainZone } from "./TradeZoneProtection.js";

console.warn("[GameMode] v2 - Módulo iniciando...");

// ─── KILL MISSION HOOKS ───────────────────────────────────────────────────────
// TACZ doesn't use native damage — it applies HP directly via projectileHitEntity
// and adds the "murder" tag to the shooter when the target dies.
// We detect kills by watching entityDie + checking who has the "murder" tag,
// OR via onDownedKill() called from downed.js when a player is finished off.

// Store last weapon used per player (set when projectile hits)
const lastWeaponUsed = new Map(); // playerId -> weaponTypeId

// Export for downed.js to call when a player is finished off
export function onDownedKill(executor) {
    try {
        _processMissionKill(executor, lastWeaponUsed.get(executor.id) ?? "");
    } catch (e) { console.warn("[GameMode] onDownedKill error: " + e); }
}

function _processMissionKill(killer, weaponId) {
    const inMap      = killer.hasTag("gm:in_map");
    const inColiseum = killer.hasTag("gm:in_coliseum");
    if (!inMap && !inColiseum) return;

    const mapId     = killer.getDynamicProperty("gm:mapId");
    const isShotgun = SHOTGUN_IDS.has(weaponId);
    const isPistol  = PISTOL_IDS.has(weaponId);

    progressMission(killer, "kills", 1);

    if (inMap) {
        if (mapId) progressMission(killer, "kills_map", 1, { map: mapId });
        if (isShotgun) progressMission(killer, "kills_shotgun", 1);
        if (isPistol)  progressMission(killer, "kills_pistol", 1);
        // nodeath tracking
        const nd = killer.getDynamicProperty("dm:nodeath");
        const ndData = nd ? JSON.parse(nd) : { count: 0 };
        ndData.count = (ndData.count ?? 0) + 1;
        killer.setDynamicProperty("dm:nodeath", JSON.stringify(ndData));
        if (ndData.count >= 10) progressMission(killer, "kills_nodeath", 1);
    }
    if (inColiseum) {
        progressMission(killer, "coliseum_kills", 1);
        if (isPistol) progressMission(killer, "coliseum_pistol_kills", 1);
    }
    // Team kills
    try {
        const teams = getTeams();
        for (const [oid, t] of Object.entries(teams)) {
            if (oid === killer.id || t.members?.includes(killer.id)) {
                progressMission(killer, "team_kills", 1);
                break;
            }
        }
    } catch {}
}

// Track last weapon used via projectile hits (TACZ fires projectiles)
world.afterEvents.projectileHitEntity.subscribe(ev => {
    try {
        const shooter = ev.source;
        if (!shooter || shooter.typeId !== "minecraft:player") return;
        const inv = shooter.getComponent("minecraft:inventory")?.container;
        const weapon = inv?.getItem(shooter.selectedSlotIndex);
        if (weapon) lastWeaponUsed.set(shooter.id, weapon.typeId);
    } catch {}
});

// entityDie: catches kills from melee, explosions, and any native damage
// TACZ kills are caught via the "murder" tag watcher below
world.afterEvents.entityDie.subscribe(ev => {
    try {
        if (ev.deadEntity?.typeId !== "minecraft:player") return;
        const killer = ev.damageSource?.damagingEntity;
        if (!killer || killer.typeId !== "minecraft:player") return;
        if (killer.name === ev.deadEntity.name) return;
        // This fires for melee/explosion kills — TACZ kills are handled by murder tag
        const weaponId = lastWeaponUsed.get(killer.id) ?? "";
        _processMissionKill(killer, weaponId);
    } catch (e) { console.warn("[GameMode] entityDie kill error: " + e); }
});

// TACZ kill detection via "murder" tag
// TACZ adds "murder" tag to the shooter when target HP reaches 0
// We watch for players who have the tag and haven't been processed yet
const processedMurderTick = new Map(); // playerId -> tick when processed
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            if (!player.hasTag("murder")) continue;
            const lastTick = processedMurderTick.get(player.id) ?? -99;
            if (system.currentTick - lastTick < 3) continue; // debounce
            processedMurderTick.set(player.id, system.currentTick);
            const weaponId = lastWeaponUsed.get(player.id) ?? "";
            _processMissionKill(player, weaponId);
        } catch {}
    }
}, 10 * 5);

// Reset nodeath counter on player death in map
world.afterEvents.entityDie.subscribe(ev => {
    if (ev.deadEntity?.typeId !== "minecraft:player") return;
    try { ev.deadEntity.setDynamicProperty("dm:nodeath", JSON.stringify({ count: 0 })); } catch {}
}, { entityTypes: ["minecraft:player"] });

function L(player) {
    try {
        const s = player.getDynamicProperty("playerSettings");
        if (s) return JSON.parse(s).language ?? "es";
    } catch {}
    return "es";
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const PROP_STATE             = "gm:state";
const PROP_MAP_IDX           = "gm:mapIdx";
const PROP_END_TIME          = "gm:endTime";
const PROP_TEAMS             = "gm:teams";
const PROP_COOLDOWN_DURATION = "gm:cooldownDuration";
const PROP_ACTIVE_DURATION   = "gm:activeDuration";
const PROP_ACTIVE_BORDER     = "gm:activeBorder"; // ID del área delimitada activa

const ACTIVE_DURATION   = 20 * 60;
const COOLDOWN_DURATION = 10 * 60;

const getActiveDuration   = () => { try { return world.getDynamicProperty(PROP_ACTIVE_DURATION)   ?? ACTIVE_DURATION;   } catch { return ACTIVE_DURATION; } };
const getCooldownDuration = () => { try { return world.getDynamicProperty(PROP_COOLDOWN_DURATION) ?? COOLDOWN_DURATION; } catch { return COOLDOWN_DURATION; } };

const MAPS = [
    { id: "green_city", name: { es: "The Green City", en: "The Green City" },
      min: { x: -45,  y: 80,  z: -45  }, max: { x: 302,  y: 110, z: 642  } },
    { id: "downtown",   name: { es: "The Down Town",  en: "The Down Town"  },
      min: { x: 315,  y: 118, z: 199  }, max: { x: 985,  y: 159, z: 1014 } },
    { id: "airport",    name: { es: "The Air Port",   en: "The Air Port"   },
      min: { x: 1042, y: 94,  z: -591 }, max: { x: 1741, y: 144, z: 463  } },
    { id: "desert",     name: { es: "The Desert",     en: "The Desert"     },
      min: { x: 1545, y: 53,  z: 1246 }, max: { x: 2208, y: 53,  z: 2752 } },
    // La Petro — evento especial, mismo flujo que mapa normal
    { id: "la_petro",   name: { es: "⚡ La Petro [EVENTO]", en: "⚡ La Petro [EVENT]" },
      min: { x: -2007, y: 0,   z: 1877 }, max: { x: -1657, y: 150, z: 2208 } },
];

const PETRO_MAP_IDX = MAPS.findIndex(m => m.id === "la_petro");

const SUPPLY_POST = { x: -1241.69, y: 80.00, z: -87.01 };
const REFUGE      = { x: -1892.51, y: 65.00, z: 2643.73 };

const COLISEUM = {
    min:   { x: 1369, y: 51, z: 1666 },
    max:   { x: 1497, y: 52, z: 1794 },
    spawn: { x: 1433, y: 52, z: 1730 },
};

// Armadura spec ops con su slot de equip correspondiente
const KIT_BASE_ARMOR = [
    { id: "mcpe:spec_helmet",         slot: "Head"  },
    { id: "mcpe:tactical_vest_black", slot: "Chest" },
    { id: "mcpe:special_top",         slot: "Legs"  },
    { id: "mcpe:special_bottom",      slot: "Feet"  },
];
const KIT_GOLDEN_APPLES = { id: "minecraft:golden_apple", count: 64 };

// Pool de armas TACZ completo (sin RPG, sin minigun, sin LMGs pesadas)
// Mapeado: arma → bala correcta según calibre real
// Ammos: m43(5.56/7.62), mm9(9mm), gauge12(12ga), lapua338(.338),
//        mag357(.357), mm5728(5.7x28), acp45(.45acp), ae50(.50AE), mm4630(4.6x30)
const WEAPON_POOL = [
    // Rifles de asalto → m43
    { cmds: ["give @s krep:m4a1 1",    "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:akm 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:hk416 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:scarl 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:m16 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:m16a1 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:g36 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:qbz95 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:qbz191 1",  "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:type81 1",  "give @s krep:m43 256"]      },
    // Battle rifles → m43
    { cmds: ["give @s krep:scarh 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:fal 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:g3 1",      "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:mk14 1",    "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:sks 1",     "give @s krep:m43 256"]      },
    // SMGs → mm9 / acp45 / mm4630 / mm5728
    { cmds: ["give @s krep:mp5 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:uzi 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:vector 1",  "give @s krep:acp45 256"]    },
    { cmds: ["give @s krep:ump 1",     "give @s krep:acp45 256"]    },
    { cmds: ["give @s krep:mp7 1",     "give @s krep:mm4630 256"]   },
    { cmds: ["give @s krep:p90 1",     "give @s krep:mm5728 256"]   },
    // Pistolas → mm9 / acp45 / ae50
    { cmds: ["give @s krep:g17 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:g18 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:m1911 1",   "give @s krep:acp45 256"]    },
    { cmds: ["give @s krep:p320 1",    "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:b93 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:cp 1",      "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:deagle 1",  "give @s krep:ae50 256"]     },
    { cmds: ["give @s krep:deagleg 1", "give @s krep:ae50 256"]     },
    { cmds: ["give @s krep:t50 1",     "give @s krep:ae50 256"]     },
    // Escopetas → gauge12
    { cmds: ["give @s krep:m870 1",    "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:aa12 1",    "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:saiga12 1", "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:m1014 1",   "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:db 1",      "give @s krep:gauge12 256"]  },
    // Francotiradores → lapua338
    { cmds: ["give @s krep:awp 1",     "give @s krep:lapua338 256"] },
    { cmds: ["give @s krep:m885 1",    "give @s krep:lapua338 256"] },
    { cmds: ["give @s krep:win308 1",  "give @s krep:lapua338 256"] },
];

// Prop para guardar los typeIds del kit dado (para clear selectivo)
const PROP_COLISEUM_KIT = "col:kit"; // dynamic property del jugador

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const T = {
    es: {
        mainTitle:      "§l§6Centro de Operaciones",
        mainBody:       "§7¿A dónde quieres ir?",
        btnMap:         n => `§´§l§aIr a ${n}\n§r§7Recolecta Recursos`,
        btnColiseum:    "§´§cIr al Coliseo\n§r§7¡Practica PvP con kits random!",

        btnSupply:      "§´§eIr al Puesto de Suministros\n§r§7Vende y Compra Objetos",
        btnRefuge:      "§´§bIr al Refugio\n§r§7Crea tu Base y Raidea Otras",
        mapTitle:       n => `§l§a${n}`,
        mapTimeLeft:    t => `§7Tiempo restante: §e${t}`,
        mapCooldown:    t => `§7Enfriamiento: §c${t}`,
        btnPlay:        "§aJugar\n§r§7Entrar al mapa",
        btnTeam:        "§´§eFormar Equipo\n§r§7Jugar con amigos",
        teamTitle:      "§´§l§eFormar Equipo",
        teamBody:       "§7Selecciona un jugador para invitar:",
        teamDropdown:   "Jugador",
        teamInviteSent: p => `§a✓ Invitación enviada a §f${p}`,
        teamInviteRecv: f => `§e[Equipo] §f${f} §7te invitó. Escribe §e!accept-team §7para aceptar.`,
        teamJoined:     p => `§a${p} §7se unió a tu equipo.`,
        teamLeft:       p => `§c${p} §7salió del equipo.`,
        teamNoPlayers:  "§cNo hay jugadores disponibles para invitar.",
        teamAlready:    "§cYa estás en un equipo.",
        noTeamInMap:    "§cNo puedes entrar al mapa sin ser el dueño del equipo.",
        exitTeam:       "§7Saliste del equipo.",
        coliseumFull:   "§cTu inventario no está vacío. Vacíalo antes de entrar.",
        coliseumKit:    k => `§a✓ Kit: §f${k}§a. ¡Buena suerte!`,
        coliseumLeft:   "§7Saliste del Coliseo. Inventario limpiado.",
        tpFade:         d => `§7Viajando a §e${d}§7...`,
        died:           "§c¡El tiempo se acabó! Fuiste eliminado.",
        warning:        n => `§c⚠ ¡El tiempo en ${n} está por terminar!`,
        noPending:      "§cNo tienes invitaciones pendientes.",
        notInTeam:      "§cNo estás en ningún equipo.",
        mapClosed:      "§cEl mapa está en enfriamiento. Espera el próximo.",
    },
    en: {
        mainTitle:      "§l§6Operations Center",
        mainBody:       "§7Where do you want to go?",
        btnMap:         n => `§aGo to ${n}\n§r§7Collect Resources`,
        btnColiseum:    "§cGo to the Coliseum\n§r§7Practice PvP with random kits!",
        btnSupply:      "§eGo to Supply Post\n§r§7Buy and Sell Items",
        btnRefuge:      "§bGo to the Refuge\n§r§7Build your Base and Raid Others",
        mapTitle:       n => `§l§a${n}`,
        mapTimeLeft:    t => `§7Time left: §e${t}`,
        mapCooldown:    t => `§7Cooldown: §c${t}`,
        btnPlay:        "§aPlay\n§r§7Enter the map",
        btnTeam:        "§eForm Team\n§r§7Play with friends",
        teamTitle:      "§l§eForm Team",
        teamBody:       "§7Select a player to invite:",
        teamDropdown:   "Player",
        teamInviteSent: p => `§a✓ Invitation sent to §f${p}`,
        teamInviteRecv: f => `§e[Team] §f${f} §7invited you. Type §e!accept-team §7to accept.`,
        teamJoined:     p => `§a${p} §7joined your team.`,
        teamLeft:       p => `§c${p} §7left the team.`,
        teamNoPlayers:  "§cNo players available to invite.",
        teamAlready:    "§cYou are already in a team.",
        noTeamInMap:    "§cYou can't enter the map without being the team owner.",
        exitTeam:       "§7You left the team.",
        coliseumFull:   "§cYour inventory is not empty. Clear it before entering.",
        coliseumKit:    k => `§a✓ Kit: §f${k}§a. Good luck!`,
        coliseumLeft:   "§7You left the Coliseum. Inventory cleared.",
        tpFade:         d => `§7Traveling to §e${d}§7...`,
        died:           "§cTime's up! You were eliminated.",
        warning:        n => `§c⚠ Time in ${n} is almost up!`,
        noPending:      "§cYou have no pending invitations.",
        notInTeam:      "§cYou are not in a team.",
        mapClosed:      "§cThe map is on cooldown. Wait for the next one.",
    },
};

function tx(player, key, ...a) {
    const v = T[L(player)][key];
    return typeof v === "function" ? v(...a) : v;
}
function fmtTime(s) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

// ─── STATE ────────────────────────────────────────────────────────────────────

const getState   = () => { try { return world.getDynamicProperty(PROP_STATE)    ?? "cooldown"; } catch { return "cooldown"; } };
const getMapIdx  = () => { try { const v = world.getDynamicProperty(PROP_MAP_IDX); return (typeof v === "number" && v >= 0 && v < MAPS.length) ? v : 0; } catch { return 0; } };
const getEndTime = () => { try { return world.getDynamicProperty(PROP_END_TIME) ?? 0;          } catch { return 0; } };
let teamsCache = null;
const getTeams   = () => { try { if (teamsCache !== null) return teamsCache; const r = world.getDynamicProperty(PROP_TEAMS); return teamsCache = r ? JSON.parse(r) : {}; } catch { return teamsCache = {}; } };
const saveTeams  = t  => { teamsCache = t; world.setDynamicProperty(PROP_TEAMS, JSON.stringify(t)); };
const invalidateTeamsCache = () => { teamsCache = null; };
const nowSec     = () => Math.floor(Date.now() / 1000);
const secsLeft   = () => Math.max(0, getEndTime() - nowSec());
const curMap     = () => MAPS[getMapIdx()] ?? MAPS[0];

function startActive() {
    world.setDynamicProperty(PROP_STATE,    "active");
    world.setDynamicProperty(PROP_END_TIME, nowSec() + getActiveDuration());

    // Resetear flags de eventos únicos por partida
    _warned170 = false;
    _warned30  = false;

    // Notificar al sistema de airdrops para incrementar el contador
    try { onMatchStarted(); } catch (e) { console.warn("[GameMode] onMatchStarted error: " + e); }

    // Comprobar si esta partida es evento Petro
    const nextCount = getAirdropMatchCount();
    const petroCfg  = getPetroConfig();
    const isPetro   = petroCfg.enabled && (nextCount % petroCfg.matchInterval === 0);

    if (isPetro) {
        // La Petro es el mapa — seleccionarlo como mapa activo
        world.setDynamicProperty(PROP_MAP_IDX, PETRO_MAP_IDX);
        updateGuardiaMapTag("la_petro");
        try { onPetroMatchStarted(nextCount); } catch (e) { console.warn("[GameMode] onPetroMatchStarted error: " + e); }
        console.warn("[GameMode] Evento La Petro — mapa seleccionado: la_petro");
    } else {
        // Mapa normal — elegir entre los 4 normales (excluir la_petro)
        const normalMaps = MAPS.length - 1; // todos menos la_petro
        const prevIdx = getMapIdx();
        let idx;
        if (normalMaps > 1) {
            do { idx = Math.floor(Math.random() * normalMaps); } while (idx === prevIdx);
        } else {
            idx = 0;
        }
        world.setDynamicProperty(PROP_MAP_IDX, idx);
        updateGuardiaMapTag(MAPS[idx].id);
        createMapBorder(MAPS[idx]);
    }
}

function startCooldown() {
    world.setDynamicProperty(PROP_STATE,    "cooldown");
    world.setDynamicProperty(PROP_END_TIME, nowSec() + getCooldownDuration());
    updateGuardiaMapTag(null);
    
    // Eliminar área delimitada del mapa anterior
    removeMapBorder();

    // Notificar al sistema de airdrops
    try { onMatchEnded(); } catch (e) { console.warn("[GameMode] onMatchEnded error: " + e); }

    // Notificar al sistema de eventos especiales
    try { onPetroMatchEnded(); } catch (e) { console.warn("[GameMode] onPetroMatchEnded error: " + e); }
}

function updateGuardiaMapTag(mapId) {
    try {
        const guardias = world.getDimension("minecraft:overworld")
            .getEntities({ type: "tz:guardia_1" });
        for (const g of guardias) {
            // Quitar tags de mapa anteriores
            for (const map of MAPS) {
                if (g.hasTag(`gm:map_${map.id}`)) g.removeTag(`gm:map_${map.id}`);
            }
            // Poner tag del mapa activo
            if (mapId) g.addTag(`gm:map_${mapId}`);
        }
    } catch(e) { console.warn("[GameMode] updateGuardiaMapTag error: " + e); }
}

// ─── DELIMITED AREA (BORDER) ──────────────────────────────────────────────────
// Nota: el tickingarea fue eliminado — cargaba miles de chunks innecesariamente.
// Los chunks alrededor de los jugadores ya se cargan automáticamente por
// simulation distance. checkMapBoundaries solo necesita player.location.

function createMapBorder(map) {
    // Solo guardamos el nombre para compatibilidad con removeMapBorder
    const borderName = `gm_border_${map.id}`;
    world.setDynamicProperty(PROP_ACTIVE_BORDER, borderName);
    console.warn(`[GameMode] Borde lógico activado para ${map.id} (sin tickingarea)`);
}

function removeMapBorder() {
    try {
        world.setDynamicProperty(PROP_ACTIVE_BORDER, undefined);
    } catch(e) {
        console.warn("[GameMode] Error eliminando borde: " + e);
    }
}

function checkMapBoundaries(map, players = null) {
    const minX = Math.min(map.min.x, map.max.x);
    const maxX = Math.max(map.min.x, map.max.x);
    const minZ = Math.min(map.min.z, map.max.z);
    const maxZ = Math.max(map.min.z, map.max.z);
    const minY = 0;
    const maxY = 200;
    const MARGIN = 2; // empujar 2 bloques hacia adentro del borde
    const allPlayers = players ?? world.getAllPlayers();

    for (const player of allPlayers) {
        if (!player.hasTag("gm:in_map")) continue;

        const pos = player.location;
        if (pos.x >= minX && pos.x <= maxX &&
            pos.y >= minY && pos.y <= maxY &&
            pos.z >= minZ && pos.z <= maxZ) continue; // dentro, no hacer nada

        // Clamp al borde + margen interior
        const safeX = Math.min(maxX - MARGIN, Math.max(minX + MARGIN, pos.x));
        const safeY = Math.min(maxY - MARGIN, Math.max(minY + MARGIN, pos.y));
        const safeZ = Math.min(maxZ - MARGIN, Math.max(minZ + MARGIN, pos.z));

        // Calcular dirección hacia el interior para girar la cámara
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const dx = centerX - safeX;
        const dz = centerZ - safeZ;
        const yaw = Math.atan2(-dx, dz) * (180 / Math.PI);

        try {
            player.teleport(
                { x: safeX, y: safeY, z: safeZ },
                { dimension: world.getDimension("minecraft:overworld"),
                  rotation: { x: 0, y: yaw } }
            );
            player.sendMessage("§c⚠ No puedes salir del área del mapa.");
            player.runCommand("playsound note.bass @s ~ ~ ~ 1 0.5");
        } catch(e) {
            console.warn(`[GameMode] Error teleportando jugador fuera de límites: ${e}`);
        }
    }
}


// ─── TEAMS ────────────────────────────────────────────────────────────────────

const pendingInvites = new Map();

function getPlayerTeam(id) {
    const teams = getTeams();
    for (const [oid, t] of Object.entries(teams)) {
        if (oid === id || t.members.includes(id)) return { ownerId: oid, team: t };
    }
    return null;
}

function createTeam(ownerId) {
    if (getPlayerTeam(ownerId)) return false;
    const t = getTeams(); t[ownerId] = { members: [] }; saveTeams(t); return true;
}

function addToTeam(ownerId, memberId) {
    const t = getTeams();
    if (!t[ownerId]) return false;
    if (!t[ownerId].members.includes(memberId)) { t[ownerId].members.push(memberId); saveTeams(t); }
    return true;
}

function removeFromTeam(playerId) {
    const t = getTeams();
    if (t[playerId]) { delete t[playerId]; saveTeams(t); return "dissolved"; }
    for (const [oid, team] of Object.entries(t)) {
        const i = team.members.indexOf(playerId);
        if (i !== -1) { team.members.splice(i, 1); saveTeams(t); return oid; }
    }
    return null;
}

// Obtener nombre de jugador por ID (puede estar offline)
function getPlayerName(id) {
    const p = world.getAllPlayers().find(p => p.id === id);
    return p ? p.name : `(${id.slice(0, 6)}...)`;
}

// Formulario principal de equipo — accesible siempre
async function showTeamPanel(player) {
    const myTeam = getPlayerTeam(player.id);

    if (!myTeam) {
        // Sin equipo → mostrar opciones: crear/invitar o nada
        await showTeamInviteMenu(player);
        return;
    }

    const isLeader = myTeam.ownerId === player.id;
    const leaderName = getPlayerName(myTeam.ownerId);
    const members = myTeam.team.members.map(id => getPlayerName(id));

    // Construir body con info del equipo
    let body = `§l§eTu Equipo\n\n`;
    body += `§6★ Líder: §f${leaderName}\n`;
    if (members.length > 0) {
        body += `§7Miembros:\n`;
        for (const m of members) body += `  §f• ${m}\n`;
    } else {
        body += `§8Sin miembros aún.\n`;
    }

    const form = new ActionFormData()
        .title("§l§eEquipo")
        .body(body);

    if (isLeader) {
        form.button("§a+ Invitar jugador\n§r§7Enviar invitación");
        if (members.length > 0) form.button("§c✖ Expulsar miembro\n§r§7Sacar a alguien del equipo");
        form.button("§4Disolver equipo\n§r§7Elimina el equipo");
    } else {
        form.button("§c✗ Salir del equipo\n§r§7Abandonar");
    }
    form.button("§8Cerrar");

    const res = await form.show(player);
    if (res.canceled) return;

    if (isLeader) {
        if (res.selection === 0) {
            await showTeamInviteMenu(player);
        } else if (members.length > 0 && res.selection === 1) {
            await showTeamKickMenu(player, myTeam);
        } else if (res.selection === (members.length > 0 ? 2 : 1)) {
            // Disolver
            removeFromTeam(player.id);
            player.sendMessage("§c✗ Equipo disuelto.");
            // Notificar a miembros
            for (const mid of myTeam.team.members) {
                const m = world.getAllPlayers().find(p => p.id === mid);
                if (m) m.sendMessage(`§c[Equipo] §fEl líder §c${player.name} §fdisolvió el equipo.`);
            }
        }
    } else {
        if (res.selection === 0) {
            // Salir
            const ownerId = removeFromTeam(player.id);
            player.sendMessage("§7Saliste del equipo.");
            if (ownerId && ownerId !== "dissolved") {
                const owner = world.getAllPlayers().find(p => p.id === ownerId);
                if (owner) owner.sendMessage(`§c[Equipo] §f${player.name} §7salió del equipo.`);
            }
        }
    }
}

// Submenú: invitar jugador
async function showTeamInviteMenu(player) {
    const available = world.getAllPlayers().filter(p => p.id !== player.id && !getPlayerTeam(p.id));
    if (!available.length) {
        player.sendMessage("§cNo hay jugadores disponibles para invitar.");
        return;
    }

    const res = await new ModalFormData()
        .title("§l§aInvitar Jugador")
        .dropdown("Selecciona un jugador:", available.map(p => p.name), { defaultValueIndex: 0 })
        .show(player);

    if (res.canceled) return;
    const target = available[res.formValues[0]];
    if (!target) return;

    if (!getPlayerTeam(player.id)) createTeam(player.id);
    pendingInvites.set(target.id, player.id);
    player.sendMessage(`§a✓ Invitación enviada a §f${target.name}`);
    target.sendMessage(`§e[Equipo] §f${player.name} §7te invitó a su equipo.\n§7Escribe §e!accept-team §7para aceptar o §c!deny-team §7para rechazar.`);
    try { progressMission(player, "team_invites", 1); } catch {}
}

// Submenú: expulsar miembro
async function showTeamKickMenu(player, myTeam) {
    const memberNames = myTeam.team.members.map(id => getPlayerName(id));
    if (!memberNames.length) { player.sendMessage("§cNo hay miembros para expulsar."); return; }

    const res = await new ModalFormData()
        .title("§l§cExpulsar Miembro")
        .dropdown("Selecciona a quién expulsar:", memberNames, { defaultValueIndex: 0 })
        .show(player);

    if (res.canceled) return;
    const kickId = myTeam.team.members[res.formValues[0]];
    if (!kickId) return;

    const t = getTeams();
    if (t[myTeam.ownerId]) {
        const idx = t[myTeam.ownerId].members.indexOf(kickId);
        if (idx !== -1) { t[myTeam.ownerId].members.splice(idx, 1); saveTeams(t); }
    }
    const kickedName = getPlayerName(kickId);
    player.sendMessage(`§c✗ Expulsaste a §f${kickedName}§c del equipo.`);
    const kicked = world.getAllPlayers().find(p => p.id === kickId);
    if (kicked) kicked.sendMessage(`§c[Equipo] §fFuiste expulsado del equipo por §c${player.name}§f.`);
}

// Alias para compatibilidad con showMapMenu
async function showTeamMenu(player) {
    await showTeamPanel(player);
}

// ─── MUSIC ────────────────────────────────────────────────────────────────────

const playerMusicIntervals = new Map(); // playerId -> intervalId

function startMapMusic(player) {
    stopMapMusic(player);
    // Restart play.music every 3:45 min (4500 ticks)
    const id = system.runInterval(() => {
        try {
            if (!player.hasTag("gm:in_map")) { stopMapMusic(player); return; }
            player.runCommand("stopsound @s play.music");
            system.runTimeout(() => {
                try { player.runCommand("playsound play.music @s"); } catch {}
            }, 20);
        } catch { stopMapMusic(player); }
    }, 4500);
    playerMusicIntervals.set(player.id, id);
}

function stopMapMusic(player) {
    const id = playerMusicIntervals.get(player.id);
    if (id !== undefined) {
        system.clearRun(id);
        playerMusicIntervals.delete(player.id);
    }
    try { player.runCommand("stopsound @s play.music"); } catch {}
    try { player.runCommand("stopsound @s min"); } catch {}
}

// ─── TELEPORT ─────────────────────────────────────────────────────────────────

function randomInMap(map) {
    const minX = Math.min(map.min.x, map.max.x);
    const maxX = Math.max(map.min.x, map.max.x);
    const minZ = Math.min(map.min.z, map.max.z);
    const maxZ = Math.max(map.min.z, map.max.z);
    return {
        x: Math.floor(minX + Math.random() * (maxX - minX)),
        y: Math.min(map.min.y, map.max.y) + 2, // +2 para no spawnear dentro del suelo
        z: Math.floor(minZ + Math.random() * (maxZ - minZ)),
    };
}

function doTP(player, dest, destName) {
    player.sendMessage(tx(player, "tpFade", destName));
    player.runCommand("camera @s fade time 0.1 10 2");
    system.runTimeout(() => {
        try { player.teleport(dest, { dimension: world.getDimension("minecraft:overworld") }); }
        catch (e) { console.warn("[GameMode] TP error: " + e); }
    }, 10);
}

// Teleport rápido para warps (refugio, suministros, coliseo)
function doWarpTP(player, dest, destName) {
    player.sendMessage(tx(player, "tpFade", destName));
    player.runCommand("camera @s fade time 0.1 0.5 0.5");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => {
        try { player.teleport(dest, { dimension: world.getDimension("minecraft:overworld") }); }
        catch (e) { console.warn("[GameMode] TP error: " + e); }
    }, 5);

    // Misiones: extracción exitosa cuando el jugador va al refugio desde el mapa
    if (dest === REFUGE && player.hasTag("gm:in_map")) {
        const mapId = player.getDynamicProperty("gm:mapId");
        try {
            progressMission(player, "extractions", 1);
            progressMission(player, "refuge_returns", 1);
            if (mapId) progressMission(player, "extractions_map", 1, { map: mapId });
            // Check inventory for blood bag and item count
            const inv = player.getComponent("minecraft:inventory")?.container;
            if (inv) {
                let hasBloodBag = false, itemCount = 0;
                for (let i = 0; i < inv.size; i++) {
                    const item = inv.getItem(i);
                    if (!item) continue;
                    itemCount += item.amount ?? 1;
                    if (item.typeId.startsWith("mcpe:blood_bag")) hasBloodBag = true;
                }
                if (hasBloodBag) progressMission(player, "extractions_bloodbag", 1);
                if (itemCount >= 15) progressMission(player, "extractions_15items", 1);
            }
            // Extraction streak
            const prog = player.getDynamicProperty("dm:extstreak");
            const streakData = prog ? JSON.parse(prog) : { count: 0 };
            streakData.count = (streakData.count ?? 0) + 1;
            player.setDynamicProperty("dm:extstreak", JSON.stringify(streakData));
            if (streakData.count >= 3) progressMission(player, "extraction_streak", 1);
            // Team extraction — check if all team members extracted
            try {
                const teams = JSON.parse(world.getDynamicProperty("gm:teams") ?? "{}");
                for (const [oid, t] of Object.entries(teams)) {
                    if (oid === player.id || t.members?.includes(player.id)) {
                        progressMission(player, "team_extractions", 1);
                        break;
                    }
                }
            } catch {}
        } catch (e) { console.warn("[GameMode] extraction mission error: " + e); }
    }
    // Supply post visit
    if (dest === SUPPLY_POST) {
        try { progressMission(player, "supply_visits", 1); } catch {}
    }
}

// Set de jugadores que están siendo teleportados actualmente (evita doble TP)
const enteringMap = new Set();

// ─── CANCEL ENTRY SYSTEM ──────────────────────────────────────────────────────
// Mapa: playerId → { slot, timeoutId }
const cancelEntryPlayers = new Map();
const CANCEL_ITEM = "minecraft:paper";
const CANCEL_DURATION_TICKS = 600; // 30 segundos

const UI_SLOT = 8;
const CANCEL_LOCK = `{"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}`;

function giveCancelItem(player) {
    try {
        // Poner el bloque con locks via replaceitem
        player.runCommand(`replaceitem entity @s slot.hotbar ${UI_SLOT} ${CANCEL_ITEM} 1 0 ${CANCEL_LOCK}`);
        // Aplicar nombre y lore via API (igual que giveMenuBook)
        system.runTimeout(() => {
            try {
                const inv = player.getComponent("minecraft:inventory")?.container;
                if (!inv) return;
                const item = inv.getItem(UI_SLOT);
                if (!item || item.typeId !== CANCEL_ITEM) return;
                item.nameTag = "§c§lVolver al Refugio";
                item.setLore([
                    "§7Cancela tu entrada al mapa",
                    "§7y regresa al refugio.",
                    "",
                    "§e► Click derecho §7para cancelar"
                ]);
                inv.setItem(UI_SLOT, item);
            } catch {}
        }, 5);
        player.addTag("gm:cancel_entry");
        player.sendMessage("§e⚠ §fTienes §e30 segundos §fpara cancelar la entrada al mapa.\n§7Haz clic derecho con el §cbloque de redstone§7.");
    } catch (e) {
        console.warn("[GameMode] giveCancelItem error: " + e);
    }
}

function restoreUIItem(player) {
    try {
        player.removeTag("gm:cancel_entry");
        cancelEntryPlayers.delete(player.id);
        // Dejar que UserUI restaure el item correctamente (con nombre, lore y locks)
        system.runTimeout(() => { try { giveMenuBook(player); } catch {} }, 5);
    } catch (e) {
        console.warn("[GameMode] restoreUIItem error: " + e);
    }
}

function startCancelEntryWindow(player) {
    // Si ya tiene una ventana activa, limpiarla primero
    if (cancelEntryPlayers.has(player.id)) {
        const prev = cancelEntryPlayers.get(player.id);
        try { system.clearRun(prev.timeoutId); } catch {}
    }
    giveCancelItem(player);
    const timeoutId = system.runTimeout(() => {
        if (cancelEntryPlayers.has(player.id)) {
            restoreUIItem(player);
        }
    }, CANCEL_DURATION_TICKS);
    cancelEntryPlayers.set(player.id, { timeoutId });
}

async function showCancelEntryForm(player) {
    const res = await new ActionFormData()
        .title("§c§lCancelar Entrada")
        .body("§f¿Deseas §ccancelar §fla entrada al mapa y volver al refugio?")
        .button("§c✗ Sí, cancelar entrada")
        .button("§a✓ No, continuar en el mapa")
        .show(player);

    if (res.canceled || res.selection === 1) return;

    // Cancelar: sacar del mapa
    try {
        const prev = cancelEntryPlayers.get(player.id);
        if (prev) { try { system.clearRun(prev.timeoutId); } catch {} }
        restoreUIItem(player);
        player.removeTag("gm:in_map");
        player.setDynamicProperty("gm:mapId", undefined);
        stopMapMusic(player);
        // TP al refugio (doWarpTP al spawn/refugio)
        player.runCommand("effect @s clear");
        doWarpTP(player, REFUGE, L(player) === "es" ? "Refugio" : "Refuge");
        player.sendMessage("§a✓ Entrada cancelada. Regresando al refugio...");
    } catch (e) {
        console.warn("[GameMode] cancelEntry error: " + e);
    }
}

// Listener para el bloque de cancelación
world.beforeEvents.itemUse.subscribe(ev => {
    try {
        const player = ev.source;
        if (!player) return;

        if (player.hasTag("gm:cancel_entry") && ev.itemStack?.typeId === CANCEL_ITEM) {
            ev.cancel = true;
            system.run(() => {
                try {
                    const prev = cancelEntryPlayers.get(player.id);
                    if (prev) { try { system.clearRun(prev.timeoutId); } catch {} }
                    restoreUIItem(player);
                    player.removeTag("gm:in_map");
                    player.setDynamicProperty("gm:mapId", undefined);
                    stopMapMusic(player);
                    player.runCommand("effect @s clear");
                    doWarpTP(player, REFUGE, L(player) === "es" ? "Refugio" : "Refuge");
                    player.sendMessage("§a✓ Entrada cancelada. Regresando al refugio...");
                } catch (e) { console.warn("[GameMode] cancelEntry error: " + e); }
            });
            return;
        }

        if (player.hasTag("gm:in_coliseum") && ev.itemStack?.typeId === "minecraft:paper") {
            ev.cancel = true;
            system.run(() => {
                try {
                    clearKitItems(player);
                    const inv = player.getComponent("minecraft:inventory")?.container;
                    if (inv) {
                        for (let i = 0; i < inv.size; i++) {
                            const item = inv.getItem(i);
                            if (item?.typeId === "minecraft:paper") inv.setItem(i, undefined);
                        }
                    }
                    player.removeTag("gm:in_coliseum");
                    player.runCommand("camera @s fade time 0.1 0.5 0.5");
                    player.teleport(
                        { x: -1241.69, y: 80.00, z: -87.01 },
                        { dimension: world.getDimension("minecraft:overworld") }
                    );
                    player.sendMessage(L(player) === "es"
                        ? "§7Saliste del Coliseo. Inventario limpiado."
                        : "§7You left the Coliseum. Inventory cleared.");
                } catch (e) { console.warn("[Coliseum] exit error: " + e); }
            });
        }
    } catch {}
});

function enterMap(player, map, pos) {
    if (enteringMap.has(player.id)) return; // ya está siendo teleportado
    enteringMap.add(player.id);
    system.runTimeout(() => enteringMap.delete(player.id), 100); // limpiar tras 5s

    doTP(player, pos ?? randomInMap(map), map.name[L(player)]);
    player.addTag("gm:in_map");
    player.setDynamicProperty("gm:mapId", map.id);
    player.runCommand("stopsound @s");
    player.runCommand("playsound go.play @s");

    // Misiones: entrada al mapa
    try {
        progressMission(player, "map_entries", 1);
        // Track unique maps visited today
        const visitKey = "dm:mapstoday";
        const raw = player.getDynamicProperty(visitKey);
        const visited = raw ? JSON.parse(raw) : { date: 0, maps: [] };
        const today = getMidnightUTC();
        if (visited.date !== today) { visited.date = today; visited.maps = []; }
        if (!visited.maps.includes(map.id)) {
            visited.maps.push(map.id);
            player.setDynamicProperty(visitKey, JSON.stringify(visited));
            progressMission(player, "maps_visited", 1);
            if (visited.maps.length >= 4) progressMission(player, "maps_visited_day", visited.maps.length);
        }
        // Early entry (within 60s of round start)
        if (secsLeft() >= getActiveDuration() - 60) progressMission(player, "early_entries", 1);
        // Early entry 30s
        if (secsLeft() >= getActiveDuration() - 30) progressMission(player, "early_entries_30s", 1);        // Reset extraction streak on entry (streak only counts consecutive extractions)
        player.setDynamicProperty("dm:extstreak", JSON.stringify({ count: 0 }));
        // Team entry missions
        try {
            const teams = getTeams();
            for (const [oid, t] of Object.entries(teams)) {
                if (oid === player.id || t.members?.includes(player.id)) {
                    const teamSize = 1 + (t.members?.length ?? 0);
                    progressMission(player, "team_entries", 1);
                    if (teamSize >= 5) progressMission(player, "team_entries_5", 1);
                    break;
                }
            }
        } catch {}
    } catch (e) { console.warn("[GameMode] entry mission error: " + e); }
    // Efectos después del TP (doTP hace el teleport a los 10 ticks)
    system.runTimeout(() => {
        try {
            player.runCommand("effect @s resistance 20 255 true");
            player.runCommand("effect @s slow_falling 5 1 true");
        } catch {}
    }, 15);

    // Iniciar música según tiempo restante al entrar
    system.runTimeout(() => {
        try {
            const s = secsLeft();
            if (s <= 170 && s > 30) {
                // Quedan menos de 2:50 → saltar directo a 3min
                player.runCommand("playsound min @s");
                // No iniciar play.music interval, 3min ya cubre el resto
            } else if (s > 170) {
                // Tiempo normal → play.music + iniciar intervalo de reinicio
                player.runCommand("playsound play.music @s");
                startMapMusic(player);
            }
            // Si s <= 30 no reproducir nada (cuenta regresiva ya activa)
        } catch {}
    }, 200);

    // Ventana de cancelación: 30s tras el TP para que el jugador pueda salir
    system.runTimeout(() => {
        try { startCancelEntryWindow(player); } catch (e) { console.warn("[GameMode] cancelEntry init error: " + e); }
    }, 20); // justo después del TP (10 ticks) + margen

    // Detector de bloques: esperar a que el TP ocurra (doTP tarda 10 ticks),
    // luego durante 10 segundos comprobar si el jugador está dentro de un bloque y subirlo.
    system.runTimeout(() => {
        const MAX_TICKS = 200; // 10 segundos
        let elapsed = 0;
        const blockCheckId = system.runInterval(() => {
            elapsed += 5;
            if (elapsed > MAX_TICKS) { system.clearRun(blockCheckId); return; }
            try {
                const pos = player.location; // lanza excepción si el jugador se desconectó
                const dim = player.dimension;
                const fx = Math.floor(pos.x), fy = Math.floor(pos.y), fz = Math.floor(pos.z);
                const feet = dim.getBlock({ x: fx, y: fy,     z: fz });
                const head = dim.getBlock({ x: fx, y: fy + 1, z: fz });
                const feetSolid = feet != null && !feet.isAir;
                const headSolid = head != null && !head.isAir;
                if (feetSolid || headSolid) {
                    player.teleport({ x: pos.x, y: pos.y + 1, z: pos.z }, { dimension: dim });
                }
            } catch { system.clearRun(blockCheckId); } // jugador desconectado u otro error
        }, 5);
    }, 15); // arrancar justo después del TP (doTP usa 10 ticks)
}

// ─── MAP MENU ─────────────────────────────────────────────────────────────────

async function showMapMenu(player) {
    const state = getState(), secs = secsLeft();
    const map = curMap();
    const isPetro = map.id === "la_petro";

    const timeText = state === "active"
        ? tx(player, "mapTimeLeft", fmtTime(secs))
        : tx(player, "mapCooldown", fmtTime(secs));

    const res = await new ActionFormData()
        .title(tx(player, "mapTitle", map.name[L(player)]))
        .body(timeText)
        .button(tx(player, "btnPlay"))
        .button(tx(player, "btnTeam"))
        .show(player);

    if (res.canceled) return;
    if (state !== "active") { player.sendMessage(tx(player, "mapClosed")); return; }

    if (res.selection === 0) {
        if (isPetro) {
            enterPetroEvent(player);
        } else {
            const myTeam = getPlayerTeam(player.id);
            if (myTeam && myTeam.ownerId !== player.id) { player.sendMessage(tx(player, "noTeamInMap")); return; }
            if (myTeam) {
                const spawn = randomInMap(map);
                enterMap(player, map, spawn);
                for (const mid of myTeam.team.members) {
                    const m = world.getAllPlayers().find(p => p.id === mid);
                    if (m) enterMap(m, map, spawn);
                }
            } else {
                enterMap(player, map);
            }
        }
    } else if (res.selection === 1) {
        await showTeamMenu(player);
    }
}

// ─── COLISEUM ─────────────────────────────────────────────────────────────────

function isInColiseum(player) {
    const p = player.location;
    return p.x >= COLISEUM.min.x && p.x <= COLISEUM.max.x &&
           p.z >= COLISEUM.min.z && p.z <= COLISEUM.max.z;
}

function getUIItem() {
    try { const r = world.getDynamicProperty("server:config"); if (r) return JSON.parse(r).uiItem ?? "mcpe:addon_menu"; } catch {}
    return "mcpe:addon_menu";
}

// Verifica si el inventario está vacío (permite el item de UI y botas equipadas)
function invIsEmptyForColiseum(player) {
    const uiItem = getUIItem();
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            // Permitir: vacío, item de UI, o libro (minecraft:book / minecraft:written_book)
            if (!item) continue;
            if (item.typeId === uiItem) continue;
            if (item.typeId === "minecraft:book" || item.typeId === "minecraft:written_book") continue;
            return false; // tiene algo más
        }
    }
    try {
        const eq = player.getComponent("minecraft:equippable");
        // Permitir botas equipadas, bloquear el resto
        for (const slot of ["Head", "Chest", "Legs"]) {
            if (eq.getEquipment(slot)) return false;
        }
        // Feet (botas) se permite
    } catch {}
    return true;
}

// Recoge todos los typeIds del kit dado para poder hacer clear selectivo después
// También registra la versión empty de cada arma TACZ (krep:xxx → krep:xxx_emp)
function collectKitTypeIds(player) {
    const uiItem = getUIItem();
    const ids = new Set();
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item && item.typeId !== uiItem &&
                item.typeId !== "minecraft:book" &&
                item.typeId !== "minecraft:written_book") {
                ids.add(item.typeId);
                // Registrar también la versión empty de armas TACZ (krep:xxx → krep:xxx_emp)
                if (item.typeId.startsWith("krep:") && !item.typeId.endsWith("_emp")) {
                    ids.add(item.typeId + "_emp");
                }
            }
        }
    }
    try {
        const eq = player.getComponent("minecraft:equippable");
        for (const slot of ["Head", "Chest", "Legs", "Feet"]) {
            const item = eq.getEquipment(slot);
            if (item) ids.add(item.typeId);
        }
    } catch {}
    return [...ids];
}

// Borra exactamente los items del kit (por typeId guardado, incluyendo versiones empty)
function clearKitItems(player) {
    let kitIds;
    try {
        const raw = player.getDynamicProperty(PROP_COLISEUM_KIT);
        kitIds = raw ? new Set(JSON.parse(raw)) : null;
    } catch { kitIds = null; }

    const uiItem = getUIItem();
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item || item.typeId === uiItem) continue;
            // Si tenemos lista del kit → borrar solo esos typeIds (incluye _emp registrados)
            // Si no tenemos lista (edge case) → borrar todo krep: y mcpe: excepto UI y libro
            const inKit = kitIds
                ? kitIds.has(item.typeId)
                : (item.typeId.startsWith("krep:") || item.typeId.startsWith("mcpe:"));
            if (inKit) inv.setItem(i, undefined);
        }
    }
    try {
        const eq = player.getComponent("minecraft:equippable");
        for (const slot of ["Head", "Chest", "Legs", "Feet"]) {
            const item = eq.getEquipment(slot);
            if (item && (!kitIds || kitIds.has(item.typeId))) {
                eq.setEquipment(slot, undefined);
            }
        }
    } catch {}

    try { player.setDynamicProperty(PROP_COLISEUM_KIT, undefined); } catch {}
}

// Da el item de salida del coliseo (redstone en slot 8)
function giveColiseumExitItem(player) {
    try {
        const item = new ItemStack("minecraft:paper", 1);
        item.nameTag = "§c§lSalir del Coliseo\n§r§7Usa este bloque para salir";
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (inv) inv.setItem(8, item);
    } catch (e) { console.warn("[Coliseum] giveExitItem error: " + e); }
}

// Da el kit: armadura base + 3 armas random + manzanas doradas
function giveColiseumKit(player) {
    const LOCK = `{"minecraft:item_lock":{"mode":"lock_in_inventory"}}`;

    // Shuffle del pool y elegir exactamente 3 armas distintas
    const pool = [...WEAPON_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = pool.slice(0, 3);

    // Verificar si el jugador ya tiene botas equipadas (no reemplazarlas)
    let hasBoot = false;
    try {
        const eq = player.getComponent("minecraft:equippable");
        hasBoot = !!eq.getEquipment("Feet");
    } catch {}

    // PASO 1 (tick 0): Equipar armadura directamente en los slots
    system.runTimeout(() => {
        try {
            const eq = player.getComponent("minecraft:equippable");
            const { ItemStack } = globalThis["@minecraft/server"] ?? {};
            // Usar give con lock para cada pieza de armadura
            player.runCommand(`give @s mcpe:spec_helmet 1 0 ${LOCK}`);
            player.runCommand(`give @s mcpe:tactical_vest_black 1 0 ${LOCK}`);
            player.runCommand(`give @s mcpe:special_top 1 0 ${LOCK}`);
            if (!hasBoot) player.runCommand(`give @s mcpe:special_bottom 1 0 ${LOCK}`);
        } catch {}
    }, 0);

    // PASO 2 (tick 5-15): Las 3 armas con lock
    for (let i = 0; i < chosen.length; i++) {
        system.runTimeout(() => {
            try {
                // Arma con lock
                const weaponCmd = chosen[i].cmds[0]; // ej: "give @s krep:m4a1 1"
                const parts = weaponCmd.split(" "); // ["give","@s","krep:m4a1","1"]
                player.runCommand(`${parts.slice(0, 4).join(" ")} 0 ${LOCK}`);
                // Balas con lock
                const ammoCmd = chosen[i].cmds[1]; // ej: "give @s krep:m43 256"
                const amParts = ammoCmd.split(" ");
                // Las balas se dan después de las manzanas (paso 4)
                chosen[i]._ammoCmd = `${amParts.slice(0, 4).join(" ")} 0 ${LOCK}`;
            } catch {}
        }, 5 + i * 5);
    }

    // PASO 3 (tick 25): Manzanas doradas con lock
    system.runTimeout(() => {
        try {
            player.runCommand(`give @s ${KIT_GOLDEN_APPLES.id} ${KIT_GOLDEN_APPLES.count} 0 ${LOCK}`);
        } catch {}
    }, 25);

    // PASO 4 (tick 35-45): Balas con lock
    for (let i = 0; i < chosen.length; i++) {
        system.runTimeout(() => {
            try {
                if (chosen[i]._ammoCmd) player.runCommand(chosen[i]._ammoCmd);
            } catch {}
        }, 35 + i * 5);
    }

    player.sendMessage("§a✓ Kit asignado. §c¡No podrás salir con estos items!");

    // Guardar typeIds del kit para clear selectivo
    system.runTimeout(() => {
        try {
            const ids = collectKitTypeIds(player);
            player.setDynamicProperty(PROP_COLISEUM_KIT, JSON.stringify(ids));
        } catch {}
    }, 60);
}

// Genera una posición random dentro del coliseo a una altura dada
function randomColiseumPos(yOffset = 0) {
    const x = COLISEUM.min.x + Math.random() * (COLISEUM.max.x - COLISEUM.min.x);
    const z = COLISEUM.min.z + Math.random() * (COLISEUM.max.z - COLISEUM.min.z);
    const y = COLISEUM.spawn.y + yOffset;
    return { x, y, z };
}

function enterColiseum(player) {
    if (!invIsEmptyForColiseum(player)) {
        player.sendMessage("§cDebes tener el inventario vacío (solo se permite un libro y botas equipadas).");
        return;
    }

    // TP a posición random elevada (caída libre)
    const spawnPos = randomColiseumPos(20);
    player.sendMessage(L(player) === "es" ? "§7Viajando a §eColiseo§7..." : "§7Traveling to §eColiseum§7...");
    player.runCommand("camera @s fade time 0.1 0.5 0.5");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => {
        try {
            player.teleport(spawnPos, { dimension: world.getDimension("minecraft:overworld") });
            player.addTag("gm:in_coliseum");
            // Protección 250 por 10 segundos (200 ticks)
            player.runCommand("effect @s resistance 10 255 true");
            system.runTimeout(() => giveColiseumKit(player), 5);
            // Dar redstone en slot 8 para salir (100 ticks = 5s, después del item UI de PlugsEssen)
            system.runTimeout(() => giveColiseumExitItem(player), 100);
            try { progressMission(player, "coliseum_entries", 1); } catch {}
        } catch (e) { console.warn("[Coliseum] enterColiseum error: " + e); }
    }, 5);
}

// ─── MAIN MENU ────────────────────────────────────────────────────────────────

export async function showGuardiaForm(player) {
    const map = curMap();
    const isAdmin = player.hasTag("admin");

    const form = new ActionFormData()
        .title(tx(player, "mainTitle"))
        .body(tx(player, "mainBody"))
        .button(tx(player, "btnMap", map.name[L(player)]), "textures/ui/icon_map.png")
        .button("§c⛏ Mina PvP\n§r§7Ir a la zona segura de la mina", "textures/ui/haste_effect.png")
        .button(tx(player, "btnColiseum"),                 "textures/ui/strength_effect.png")
        .button(tx(player, "btnSupply"),                   "textures/ui/icon_deals.png")
        .button(tx(player, "btnRefuge"),                   "textures/ui/fire_resistance_effect.png")
        .button("§´§eEquipo\n§r§7Ver / gestionar tu equipo", "textures/ui/dressing_room_skins.png");

    if (isAdmin) form.button("§c[Admin] Ir a mapa\n§r§7Seleccionar mapa directo", "textures/ui/op.png");
    if (isAdmin) form.button("§c[Admin] Panel\n§r§7Controles del servidor", "textures/ui/op.png");

    const res = await form.show(player);
    if (res.canceled) return;

    switch (res.selection) {
        case 0: allowLeaveContainZone(player.id); await showMapMenu(player); break;
        case 1:
            try {
                allowLeaveContainZone(player.id);
                player.runCommand("stopsound @s");
                player.runCommand("playsound go.play @s");
                player.runCommand("camera @s fade time 0.1 10 5");
                player.teleport({ x: -1443, y: 63, z: 3250 }, { dimension: player.dimension });
                player.sendMessage(L(player) === "es" ? "§a[Guardia] §fBienvenido a la §cMina PvP§f." : "§a[Guard] §fWelcome to the §cPvP Mine§f.");
                system.runTimeout(() => {
                    try { player.runCommand("playsound play.music @s"); } catch (_) {}
                }, 50);
            } catch (_) {}
            break;
        case 2: allowLeaveContainZone(player.id); enterColiseum(player); break;
        case 3: allowLeaveContainZone(player.id); doWarpTP(player, SUPPLY_POST, L(player) === "es" ? "Puesto de Suministros" : "Supply Post"); break;
        case 4: allowLeaveContainZone(player.id); doWarpTP(player, REFUGE,      L(player) === "es" ? "Refugio" : "Refuge"); break;
        case 5: await showTeamPanel(player); break;
        case 6: if (isAdmin) await showAdminMapSelect(player); break;
        case 7: if (isAdmin) await showAdminPanel(player); break;
    }
}

// ─── PETRO EVENT MENU ────────────────────────────────────────────────────────

async function showPetroEventMenu(player) {
    const petroState = getPetroEventState();
    const dropUnlock = getPetroDropUnlockAt();
    const now = Math.floor(Date.now() / 1000);
    const secsToUnlock = Math.max(0, dropUnlock - now);

    let dropInfo = "";
    if (petroState === "active") {
        dropInfo = `§6Air Drop Grande: §cBloqueado §7- Abre en §e${fmtTime(secsToUnlock)}`;
    } else if (petroState === "drop_open") {
        dropInfo = `§aAir Drop Grande: §2¡ABIERTO!`;
    }

    const body =
        `§6§l⚡ EVENTO ESPECIAL: LA PETRO ⚡\n\n` +
        `§7Un Air Drop masivo ha aterrizado.\n` +
        `§720 soldados enemigos custodian el área.\n\n` +
        `${dropInfo}\n\n` +
        `§7Puntos de extracción:\n` +
        `§f• §aExtracción A §7- Plataforma central\n` +
        `§f• §aExtracción B §7- Costa sur\n\n` +
        `§cAtención: §7Los botes duran §e5 minutos§7.\n` +
        `§7Aparecerás montado en un bote con tu squad.`;

    const res = await new ActionFormData()
        .title("§6§l⚡ La Petro")
        .body(body)
        .button("§a▶ Entrar al evento\n§r§7Ir a La Petro")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 1) return;
    if (res.selection === 0) enterPetroEvent(player);
}

function enterPetroEvent(player) {
    if (getState() !== "active") {
        player.sendMessage("§cNo hay partida activa.");
        return;
    }

    const myTeam = getPlayerTeam(player.id);

    // Verificar límite de squad para La Petro
    if (myTeam && myTeam.ownerId !== player.id) {
        player.sendMessage("§cSolo el líder del equipo puede iniciar la entrada a La Petro.");
        return;
    }

    const c = getPetroConfig();

    if (myTeam) {
        const teamSize = 1 + (myTeam.team.members?.length ?? 0);
        if (teamSize > c.squadMaxSize) {
            player.sendMessage(`§c⚠ Tu squad tiene ${teamSize} jugadores. El máximo para La Petro es §e${c.squadMaxSize}§c.\n§7Reduce el tamaño del squad antes de entrar.`);
            return;
        }
        // Cada miembro del squad aparece en un borde aleatorio distinto
        enterPetroMap(player, randomBorderSpawn());
        for (const mid of myTeam.team.members) {
            const m = world.getAllPlayers().find(p => p.id === mid);
            if (m) enterPetroMap(m, randomBorderSpawn());
        }
    } else {
        enterPetroMap(player, randomBorderSpawn());
    }
}

async function showAdminMapSelect(player) {
    const form = new ActionFormData()
        .title("§c[Admin] Seleccionar Mapa")
        .body("§7Elige el mapa al que quieres ir:");

    for (const map of MAPS) {
        form.button(`§a${map.name[L(player)]}`, "textures/ui/icon_recipe_nature.png");
    }

    const res = await form.show(player);
    if (res.canceled) return;

    const map = MAPS[res.selection];
    if (map) enterMap(player, map);
}

async function showAdminPanel(player) {
    const state = getState();
    const secs  = secsLeft();
    const stateText = state === "active"
        ? `§aPartida activa §7- §e${fmtTime(secs)} §7restantes`
        : `§cEnfriamiento §7- §e${fmtTime(secs)} §7restantes`;

    // Info del airdrop
    const matchCount   = getAirdropMatchCount();
    const adCfg        = getAirdropConfig();
    const interval     = adCfg.matchInterval;
    const remainder    = matchCount % interval;
    const partidas_hasta_drop = remainder === 0 ? interval : interval - remainder;
    const dropState    = getAirdropDropState();

    let dropLine = "";
    if (!adCfg.enabled) {
        dropLine = `§8Air Drop: §cDesactivado`;
    } else if (dropState === "falling") {
        dropLine = `§6Air Drop: §eCayendo...`;
    } else if (dropState === "landed") {
        const secsUnlock = Math.max(0, getAirdropUnlockAt() - Math.floor(Date.now() / 1000));
        dropLine = `§6Air Drop: §eAterrizó §7- Abre en §a${fmtTime(secsUnlock)}`;
    } else if (dropState === "open") {
        const secsClear = Math.max(0, getAirdropClearAt() - Math.floor(Date.now() / 1000));
        dropLine = `§aAir Drop: §2Abierto §7- Limpia en §e${fmtTime(secsClear)}`;
    } else {
        const esEsta = (state === "active" && remainder === 0);
        if (esEsta) {
            dropLine = `§6Air Drop: §e¡Esta partida tiene drop!`;
        } else {
            dropLine = `§7Air Drop: §fEn §e${partidas_hasta_drop} §fpartida(s)`;
        }
    }

    // Info de La Petro
    const petroCfg   = getPetroConfig();
    const petroState = getPetroEventState();
    const globalCount = getAirdropMatchCount(); // contador global que sube cada partida
    const petroRem   = globalCount % petroCfg.matchInterval;
    const petroHasta = petroRem === 0 ? petroCfg.matchInterval : petroCfg.matchInterval - petroRem;

    let petroLine = "";
    if (!petroCfg.enabled) {
        petroLine = `§8La Petro: §cDesactivado`;
    } else if (petroState === "active") {
        const secsU = Math.max(0, getPetroDropUnlockAt() - Math.floor(Date.now() / 1000));
        petroLine = `§5La Petro: §6Drop bloqueado §7- Abre en §e${fmtTime(secsU)}`;
    } else if (petroState === "drop_open") {
        petroLine = `§5La Petro: §a¡Drop abierto!`;
    } else {
        const esEsta = (state === "active" && curMap().id === "la_petro");
        petroLine = esEsta
            ? `§5La Petro: §e¡Esta partida es el evento!`
            : `§5La Petro: §fEn §e${petroHasta} §fpartida(s)`;
    }

    const body = `§7Estado: ${stateText}\n§7Duración partida: §e${fmtTime(getActiveDuration())}\n§7Duración enfriamiento: §e${fmtTime(getCooldownDuration())}\n\n§7Partidas jugadas: §e${matchCount}\n${dropLine}\n${petroLine}`;

    const res = await new ActionFormData()
        .title("§c[Admin] Panel de Control")
        .body(body)
        .button("§aIniciar partida ahora\n§r§7Salta el enfriamiento")
        .button("§eAdelantar fin de partida\n§r§7Termina la partida actual")
        .button("§bConfigurar duraciones\n§r§7Partida y enfriamiento")
        .button("§6✈ Air Drop\n§r§7Estado y configuración")
        .button("§5⚡ La Petro\n§r§7Evento especial - Estado y config")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 5) return;

    if (res.selection === 0) {
        if (state === "cooldown") {
            startActive();
            player.sendMessage("§a✓ Partida iniciada.");
        } else {
            player.sendMessage("§eYa hay una partida activa.");
        }
    } else if (res.selection === 1) {
        if (state === "active") {
            await showAdminSetTime(player);
        } else {
            player.sendMessage("§eNo hay partida activa.");
        }
    } else if (res.selection === 2) {
        await showAdminDurations(player);
    } else if (res.selection === 3) {
        await showAdminAirdropPanel(player);
    } else if (res.selection === 4) {
        await showAdminPetroPanel(player);
    }
}

// ─── ADMIN PANEL: LA PETRO ────────────────────────────────────────────────────

async function showAdminPetroPanel(player) {
    const c = getPetroConfig();
    const petroState = getPetroEventState();
    const globalCount = getAirdropMatchCount(); // contador global de partidas
    const now = Math.floor(Date.now() / 1000);

    const stateLabels = { none: "§8Inactivo", active: "§6Drop bloqueado", drop_open: "§aAbierto" };
    const stateStr = stateLabels[petroState] ?? "§8Inactivo";

    let timerStr = "§8—";
    if (petroState === "active") {
        const s = Math.max(0, getPetroDropUnlockAt() - now);
        timerStr = `§cAbre en §e${fmtTime(s)}`;
    } else if (petroState === "drop_open") {
        const s = Math.max(0, getPetroDropClearAt() - now);
        timerStr = `§aLimpia en §e${fmtTime(s)}`;
    }

    const remainder = globalCount % c.matchInterval;
    const hasta = remainder === 0 ? c.matchInterval : c.matchInterval - remainder;
    const nextInfo = c.enabled ? (petroState !== "none" ? "Evento activo" : `En ${hasta} partida(s)`) : "Desactivado";

    const body =
        `§7Partidas jugadas: §e${globalCount}\n` +
        `§7Próximo evento: §f${nextInfo}\n` +
        `§7Estado actual: ${stateStr}\n` +
        `§7Timer drop: ${timerStr}\n\n` +
        `§7Intervalo: §ecada §f${c.matchInterval} §epartidas\n` +
        `§7Drop bloqueado: §e${c.dropLockMins} min\n` +
        `§7Drop abierto: §e${c.dropClearMins} min\n` +
        `§7Duración bote: §e${c.boatDurationSecs} seg\n` +
        `§7Protección inicial: §e${c.protectionSecs} seg\n` +
        `§7Ventana cancelación: §e${c.cancelWindowSecs} seg\n` +
        `§7Max squad: §e${c.squadMaxSize} jugadores\n` +
        `§7Sistema: ${c.enabled ? "§aActivado" : "§cDesactivado"}`;

    const res = await new ActionFormData()
        .title("§5[Admin] La Petro")
        .body(body)
        .button("§a▶ Forzar evento ahora\n§r§7Activa el evento inmediatamente")
        .button("§c✖ Limpiar evento activo\n§r§7Elimina el evento en curso")
        .button("§b⚙ Configurar\n§r§7Intervalo, tiempos, bote, squad...")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 3) return;

    if (res.selection === 0) {
        if (getState() !== "active") {
            world.setDynamicProperty(PROP_STATE,    "active");
            world.setDynamicProperty(PROP_END_TIME, nowSec() + getActiveDuration());
        }
        // Siempre apuntar curMap() a La Petro
        world.setDynamicProperty(PROP_MAP_IDX, PETRO_MAP_IDX);
        try { forcePetroEvent(); player.sendMessage("§a✓ Evento La Petro forzado."); } catch (e) { player.sendMessage("§cError: " + e); }
        await showAdminPetroPanel(player);
    } else if (res.selection === 1) {
        if (petroState === "none") {
            player.sendMessage("§eNo hay evento activo.");
        } else {
            try { onPetroMatchEnded(); player.sendMessage("§a✓ Evento limpiado."); } catch {}
        }
        await showAdminPetroPanel(player);
    } else if (res.selection === 2) {
        await showAdminPetroConfig(player);
    }
}

async function showAdminPetroConfig(player) {
    const c = getPetroConfig();

    const res = await new ModalFormData()
        .title("§b[Admin] La Petro - Configuración")
        .textField(`§7Cada cuántas partidas se activa\n§8Actual: §e${c.matchInterval}`,
            "ej: 5", { defaultValue: String(c.matchInterval) })
        .textField(`§7Minutos bloqueado el drop\n§8Actual: §e${c.dropLockMins}`,
            "ej: 15", { defaultValue: String(c.dropLockMins) })
        .textField(`§7Minutos disponible el drop\n§8Actual: §e${c.dropClearMins}`,
            "ej: 5", { defaultValue: String(c.dropClearMins) })
        .textField(`§7Segundos que dura el bote\n§8Actual: §e${c.boatDurationSecs}`,
            "ej: 300", { defaultValue: String(c.boatDurationSecs) })
        .textField(`§7Segundos de protección inicial\n§8Actual: §e${c.protectionSecs}`,
            "ej: 60", { defaultValue: String(c.protectionSecs) })
        .textField(`§7Segundos de ventana de cancelación\n§8Actual: §e${c.cancelWindowSecs}`,
            "ej: 60", { defaultValue: String(c.cancelWindowSecs) })
        .textField(`§7Máximo jugadores por squad\n§8Actual: §e${c.squadMaxSize}`,
            "ej: 6", { defaultValue: String(c.squadMaxSize) })
        .toggle(`§7Sistema activado`, { defaultValue: c.enabled })
        .show(player);

    if (res.canceled) return;

    const [v0, v1, v2, v3, v4, v5, v6, v7] = res.formValues;
    const interval   = parseInt(v0);
    const lockMins   = parseFloat(v1);
    const clearMins  = parseFloat(v2);
    const boatSecs   = parseInt(v3);
    const protSecs   = parseInt(v4);
    const cancelSecs = parseInt(v5);
    const squadMax   = parseInt(v6);
    const enabled    = v7;

    const errors = [];
    if (isNaN(interval)   || interval < 1)   errors.push("Intervalo inválido (mín 1)");
    if (isNaN(lockMins)   || lockMins < 0)   errors.push("Bloqueo inválido (mín 0)");
    if (isNaN(clearMins)  || clearMins < 1)  errors.push("Tiempo abierto inválido (mín 1)");
    if (isNaN(boatSecs)   || boatSecs < 10)  errors.push("Duración bote inválida (mín 10s)");
    if (isNaN(protSecs)   || protSecs < 0)   errors.push("Protección inválida (mín 0)");
    if (isNaN(cancelSecs) || cancelSecs < 0) errors.push("Ventana cancelación inválida (mín 0)");
    if (isNaN(squadMax)   || squadMax < 1)   errors.push("Max squad inválido (mín 1)");

    if (errors.length) {
        player.sendMessage(`§c✖ Errores:\n${errors.map(e => `§c• ${e}`).join("\n")}`);
        return;
    }

    setPetroConfig({ ...c, matchInterval: interval, dropLockMins: lockMins, dropClearMins: clearMins,
        boatDurationSecs: boatSecs, protectionSecs: protSecs, cancelWindowSecs: cancelSecs,
        squadMaxSize: squadMax, enabled });
    player.sendMessage(`§a✓ Configuración de La Petro guardada.`);
}

async function showAdminAirdropPanel(player) {
    const dropState  = getAirdropDropState();
    const dropPos    = getAirdropDropPos();
    const matchCount = getAirdropMatchCount();
    const adCfg      = getAirdropConfig();
    const now        = Math.floor(Date.now() / 1000);

    const stateLabels = {
        none:    "§8Ninguno",
        falling: "§6Cayendo...",
        landed:  "§eBloqueado",
        open:    "§aAbierto",
    };
    const stateStr = stateLabels[dropState] ?? "§8Ninguno";

    let posStr = "§8—";
    if (dropPos) posStr = `§f${dropPos.x}, ${dropPos.y}, ${dropPos.z}`;

    let timerStr = "§8—";
    if (dropState === "landed") {
        const s = Math.max(0, getAirdropUnlockAt() - now);
        timerStr = `§cAbre en §e${fmtTime(s)}`;
    } else if (dropState === "open") {
        const s = Math.max(0, getAirdropClearAt() - now);
        timerStr = `§aLimpia en §e${fmtTime(s)}`;
    }

    const remainder = matchCount % adCfg.matchInterval;
    const hasta     = remainder === 0 ? adCfg.matchInterval : adCfg.matchInterval - remainder;
    const dropInfo  = adCfg.enabled
        ? (dropState !== "none" ? `Drop activo` : `En ${hasta} partida(s)`)
        : "Desactivado";

    const body =
        `§7Partidas jugadas: §e${matchCount}\n` +
        `§7Próximo drop: §f${dropInfo}\n` +
        `§7Estado actual: ${stateStr}\n` +
        `§7Posición: ${posStr}\n` +
        `§7Timer: ${timerStr}\n\n` +
        `§7Intervalo: §ecada §f${adCfg.matchInterval} §epartidas\n` +
        `§7Delay spawn: §e${adCfg.spawnDelayMins} min §7tras inicio\n` +
        `§7Bloqueo: §e${adCfg.lockMins} min\n` +
        `§7Tiempo abierto: §e${adCfg.clearMins} min\n` +
        `§7Altura spawn: §eY=${adCfg.spawnY}\n` +
        `§7Sistema: ${adCfg.enabled ? "§aActivado" : "§cDesactivado"}`;

    const res = await new ActionFormData()
        .title("§6[Admin] Air Drop")
        .body(body)
        .button("§a▶ Forzar drop ahora\n§r§7Spawna un drop inmediatamente")
        .button("§c✖ Limpiar drop activo\n§r§7Elimina el drop en curso")
        .button("§e↺ Resetear contador\n§r§7Vuelve el contador a 0")
        .button("§b⚙ Configurar tiempos\n§r§7Intervalo, delays, bloqueo")
        .button("§d⚙ Configurar textos\n§r§7Mensajes, waypoint, FT")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 5) return;

    if (res.selection === 0) {
        if (getState() !== "active") {
            player.sendMessage("§cSolo puedes forzar un drop con una partida activa.");
        } else {
            forceAirdrop();
            player.sendMessage("§a✓ Drop forzado.");
        }
        await showAdminAirdropPanel(player);
    } else if (res.selection === 1) {
        if (dropState === "none") {
            player.sendMessage("§eNo hay drop activo.");
        } else {
            onMatchEnded();
            player.sendMessage("§a✓ Drop limpiado.");
        }
        await showAdminAirdropPanel(player);
    } else if (res.selection === 2) {
        resetMatchCount();
        player.sendMessage("§a✓ Contador de partidas reseteado a 0.");
        await showAdminAirdropPanel(player);
    } else if (res.selection === 3) {
        await showAdminAirdropTimings(player);
    } else if (res.selection === 4) {
        await showAdminAirdropTexts(player);
    }
}

async function showAdminAirdropTimings(player) {
    const c = getAirdropConfig();

    const res = await new ModalFormData()
        .title("§b[Admin] Air Drop - Tiempos")
        .textField(
            `§7Cada cuántas partidas cae un drop\n§8Actual: §e${c.matchInterval}`,
            "ej: 3", { defaultValue: String(c.matchInterval) }
        )
        .textField(
            `§7Minutos tras inicio de partida para spawnear\n§8Actual: §e${c.spawnDelayMins}`,
            "ej: 1", { defaultValue: String(c.spawnDelayMins) }
        )
        .textField(
            `§7Minutos bloqueado tras aterrizar\n§8Actual: §e${c.lockMins}`,
            "ej: 5", { defaultValue: String(c.lockMins) }
        )
        .textField(
            `§7Minutos disponible antes de limpiarse\n§8Actual: §e${c.clearMins}`,
            "ej: 10", { defaultValue: String(c.clearMins) }
        )
        .toggle(`§7Sistema activado`, { defaultValue: c.enabled })
        .show(player);

    if (res.canceled) return;

    const [v0, v1, v2, v3, v4] = res.formValues;
    const interval  = parseInt(v0);
    const delay     = parseFloat(v1);
    const lock      = parseFloat(v2);
    const clear     = parseFloat(v3);
    const enabled   = v4;

    const errors = [];
    if (isNaN(interval) || interval < 1) errors.push("Intervalo inválido (mín 1)");
    if (isNaN(delay)    || delay < 0)    errors.push("Delay inválido (mín 0)");
    if (isNaN(lock)     || lock < 0)     errors.push("Bloqueo inválido (mín 0)");
    if (isNaN(clear)    || clear < 1)    errors.push("Tiempo abierto inválido (mín 1)");

    if (errors.length) {
        player.sendMessage(`§c✖ Errores:\n${errors.map(e => `§c• ${e}`).join("\n")}`);
        return;
    }

    const newCfg = { ...getAirdropConfig(), matchInterval: interval, spawnDelayMins: delay, lockMins: lock, clearMins: clear, enabled };
    setAirdropConfig(newCfg);
    player.sendMessage(
        `§a✓ Configuración guardada:\n` +
        `§7Intervalo: §ecada ${interval} partidas\n` +
        `§7Delay: §e${delay} min\n` +
        `§7Bloqueo: §e${lock} min\n` +
        `§7Abierto: §e${clear} min\n` +
        `§7Sistema: ${enabled ? "§aActivado" : "§cDesactivado"}`
    );
}

async function showAdminAirdropTexts(player) {
    const c = getAirdropConfig();

    const res = await new ModalFormData()
        .title("§d[Admin] Air Drop - Textos")
        .textField(
            `§7Nombre del Waypoint\n§8Actual: §f${c.wpName}`,
            "ej: Air Drop", { defaultValue: c.wpName }
        )
        .textField(
            `§7Texto flotante (bloqueado) — usa {time}\n§8Actual: §f${c.ftLocked}`,
            "ej: §6§l✈ AIR DROP\\n§cBloqueado: §e{time}", { defaultValue: c.ftLocked }
        )
        .textField(
            `§7Texto flotante (abierto)\n§8Actual: §f${c.ftUnlocked}`,
            "ej: §a§l✔ AIR DROP\\n§7Disponible", { defaultValue: c.ftUnlocked }
        )
        .textField(
            `§7Mensaje chat al caer — usa {coords}\n§8Actual: §f${c.chatMsg}`,
            "ej: §6§l[AIR DROP] §r§e...{coords}...", { defaultValue: c.chatMsg }
        )
        .textField(
            `§7Mensaje chat al abrirse — usa {mins}\n§8Actual: §f${c.chatUnlock}`,
            "ej: §a§l[AIR DROP] §r§a...{mins}...", { defaultValue: c.chatUnlock }
        )
        .textField(
            `§7Title al caer\n§8Actual: §f${c.titleDrop}`,
            "ej: §6§l✈ AIR DROP", { defaultValue: c.titleDrop }
        )
        .textField(
            `§7Subtitle al caer — usa {coords}\n§8Actual: §f${c.subtitleDrop}`,
            "ej: §eCoordenadas: §f{coords}", { defaultValue: c.subtitleDrop }
        )
        .textField(
            `§7Title al abrirse\n§8Actual: §f${c.titleUnlock}`,
            "ej: §a§l✔ AIR DROP ABIERTO", { defaultValue: c.titleUnlock }
        )
        .textField(
            `§7Subtitle al abrirse\n§8Actual: §f${c.subtitleUnlock}`,
            "ej: §7El suministro está disponible", { defaultValue: c.subtitleUnlock }
        )
        .show(player);

    if (res.canceled) return;

    const [wpName, ftLocked, ftUnlocked, chatMsg, chatUnlock, titleDrop, subtitleDrop, titleUnlock, subtitleUnlock] = res.formValues;

    const newCfg = {
        ...getAirdropConfig(),
        wpName:        wpName.trim()        || c.wpName,
        ftLocked:      ftLocked.trim()      || c.ftLocked,
        ftUnlocked:    ftUnlocked.trim()    || c.ftUnlocked,
        chatMsg:       chatMsg.trim()       || c.chatMsg,
        chatUnlock:    chatUnlock.trim()    || c.chatUnlock,
        titleDrop:     titleDrop.trim()     || c.titleDrop,
        subtitleDrop:  subtitleDrop.trim()  || c.subtitleDrop,
        titleUnlock:   titleUnlock.trim()   || c.titleUnlock,
        subtitleUnlock: subtitleUnlock.trim() || c.subtitleUnlock,
    };
    setAirdropConfig(newCfg);
    player.sendMessage("§a✓ Textos del Air Drop guardados.");
}

async function showAdminDurations(player) {
    const activeMins   = Math.floor(getActiveDuration()   / 60);
    const cooldownMins = Math.floor(getCooldownDuration() / 60);

    const res = await new ModalFormData()
        .title("§b[Admin] Configurar Duraciones")
        .textField(`§7Duración de partida actual: §e${activeMins} min\n§7Nueva duración (minutos):`,   "ej: 20", { defaultValue: String(activeMins) })
        .textField(`§7Duración de enfriamiento actual: §e${cooldownMins} min\n§7Nueva duración (minutos):`, "ej: 10", { defaultValue: String(cooldownMins) })
        .show(player);

    if (res.canceled) return;

    const newActive   = parseFloat(res.formValues[0]);
    const newCooldown = parseFloat(res.formValues[1]);

    if (isNaN(newActive) || newActive < 1)   { player.sendMessage("§cDuración de partida inválida (mínimo 1 min)."); return; }
    if (isNaN(newCooldown) || newCooldown < 1) { player.sendMessage("§cDuración de enfriamiento inválida (mínimo 1 min)."); return; }

    world.setDynamicProperty(PROP_ACTIVE_DURATION,   Math.floor(newActive   * 60));
    world.setDynamicProperty(PROP_COOLDOWN_DURATION, Math.floor(newCooldown * 60));
    player.sendMessage(`§a✓ Duraciones guardadas:\n§7Partida: §e${newActive} min §7| Enfriamiento: §e${newCooldown} min`);
}

async function showAdminSetTime(player) {
    const secs = secsLeft();
    const res = await new ModalFormData()
        .title("§e[Admin] Adelantar Tiempo")
        .textField(`§7Tiempo restante actual: §e${fmtTime(secs)}\n§7Minutos que quieres que queden:`, "ej: 5", { defaultValue: "5" })
        .show(player);

    if (res.canceled) return;
    const mins = parseFloat(res.formValues[0]);
    if (isNaN(mins) || mins < 0) { player.sendMessage("§cValor inválido."); return; }

    const newSecs = Math.floor(mins * 60);
    world.setDynamicProperty(PROP_END_TIME, nowSec() + newSecs);
    player.sendMessage(`§a✓ Tiempo ajustado a §e${fmtTime(newSecs)}§a restantes.`);
}

// ─── TICK LOOP ────────────────────────────────────────────────────────────────

let _warned170 = false; // flag para música de 3min (evita saltarse por lag)
let _warned30  = false; // flag para aviso de 30s

system.runInterval(() => {
    const secs = secsLeft();
    const state = getState();
    const map = curMap();
    const players = world.getAllPlayers();
    const inMapPlayers = [];
    const inColiseumPlayers = [];

    for (const p of players) {
        if (p.hasTag("gm:in_map")) inMapPlayers.push(p);
        if (p.hasTag("gm:in_coliseum")) inColiseumPlayers.push(p);
    }

    // Misiones: tiempo en mapa y coliseo (cada segundo)
    for (const p of players) {
        try {
            if (p.hasTag("gm:in_map"))      progressMission(p, "time_in_map", 1);
            if (p.hasTag("gm:in_coliseum")) progressMission(p, "coliseum_time", 1);
        } catch {}
    }

    // Resetear flags al iniciar nueva partida activa
    if (state === "cooldown") { _warned170 = false; _warned30 = false; }
    
    // Verificar límites del mapa para jugadores dentro
    if (state === "active") {
        checkMapBoundaries(map, players);
        try { checkPetroBoundaries(players); } catch {}
    }

    if (secs <= 0) {
        if (state === "active") {
            for (const p of inMapPlayers) {
                const pos = p.location;
                const inMap = pos.x >= Math.min(map.min.x, map.max.x) &&
                              pos.x <= Math.max(map.min.x, map.max.x) &&
                              pos.z >= Math.min(map.min.z, map.max.z) &&
                              pos.z <= Math.max(map.min.z, map.max.z);
                if (inMap) {
                    stopMapMusic(p);
                    // Sonidos, fade y clear inmediatos
                    p.runCommand("playsound lose @s");
                    p.runCommand("playsound lose2 @s");
                    p.runCommand("camera @s fade time 0.1 10 5");
                    p.runCommand("clear @s");
                    
                    // Título y teleport después del fade
                    system.runTimeout(() => {
                        try {
                            // Título durante la pantalla negra
                            p.onScreenDisplay.setTitle(
                                L(p) === "es" ? "§c§lCAÍSTE EN COMBATE" : "§c§lYOU FELL IN COMBAT",
                                {
                                    subtitle: L(p) === "es"
                                        ? "§7La zona te reclamó... esta vez."
                                        : "§7The zone claimed you... this time.",
                                    fadeInDuration: 10, stayDuration: 80, fadeOutDuration: 20
                                }
                            );
                            
                            // Teleport durante la pantalla negra
                            p.teleport(
                                { x: -1241.69, y: 80.00, z: -87.01 },
                                { dimension: world.getDimension("minecraft:overworld") }
                            );
                        } catch {}
                    }, 5);
                }
            }
            // Team match completion — ANTES de quitar el tag
            try {
                const teams = getTeams();
                for (const p2 of inMapPlayers) {
                    for (const [oid, t] of Object.entries(teams)) {
                        if (oid === p2.id || t.members?.includes(p2.id)) {
                            progressMission(p2, "team_matches", 1);
                            break;
                        }
                    }
                }
            } catch {}
            // Quitar tag después de procesar misiones
            for (const p of inMapPlayers) {
                p.removeTag("gm:in_map");
            }
            startCooldown();
        } else if (state === "cooldown") {
            startActive();
        }
        return; // no procesar más eventos este tick
    }

    // Música de 3 minutos cuando quedan ≤ 170 segundos (usa flag para no disparar dos veces por lag)
    if (state === "active" && secs <= 170 && !_warned170) {
        _warned170 = true;
        for (const p of inMapPlayers) {
            stopMapMusic(p);
            p.runCommand("playsound min @s");
            p.onScreenDisplay.setTitle("§c§lATENCION", {
                subtitle: "§eTienes §c2:50 §epara extraerte",
                fadeInDuration: 5, stayDuration: 80, fadeOutDuration: 20
            });
        }
    }

    // Title cada 5 minutos cuando el mapa está activo
    if (state === "active" && secs > 0 && secs % 300 === 0) {
        const mapName = map.name;
        for (const p of inMapPlayers) {
            p.onScreenDisplay.setTitle(`§e${fmtTime(secs)}`, {
                subtitle: `§7${mapName[L(p)]}`,
                fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 20
            });
        }
    }

    // Aviso de 30 segundos (flag para no repetir)
    if (state === "active" && secs <= 30 && !_warned30) {
        _warned30 = true;
        const name = map.name;
        for (const p of inMapPlayers) {
            p.sendMessage(tx(p, "warning", name[L(p)]));
            p.runCommand("playsound note.pling @s ~ ~ ~ 1 0.5");
        }
    }

    // Cuenta regresiva en título cuando quedan 30 segundos o menos
    if (state === "active" && secs > 0 && secs <= 30) {
        for (const p of inMapPlayers) {
            const color = secs <= 10 ? "§c" : "§e";
            p.onScreenDisplay.setTitle(`${color}§l${fmtTime(secs)}`, {
                subtitle: "§c¡EXTRÁETE AHORA!",
                fadeInDuration: 0, stayDuration: 25, fadeOutDuration: 0
            });
        }
    }

    for (const p of inColiseumPlayers) {
        if (isInColiseum(p)) continue;

        // Clamp al borde del coliseo + 2 bloques de margen interior
        const pos = p.location;
        const MARGIN = 2;
        const safeX = Math.min(COLISEUM.max.x - MARGIN, Math.max(COLISEUM.min.x + MARGIN, pos.x));
        const safeZ = Math.min(COLISEUM.max.z - MARGIN, Math.max(COLISEUM.min.z + MARGIN, pos.z));

        // Yaw mirando al centro del coliseo
        const centerX = (COLISEUM.min.x + COLISEUM.max.x) / 2;
        const centerZ = (COLISEUM.min.z + COLISEUM.max.z) / 2;
        const dx = centerX - safeX;
        const dz = centerZ - safeZ;
        const yaw = Math.atan2(-dx, dz) * (180 / Math.PI);

        try {
            p.teleport(
                { x: safeX, y: pos.y, z: safeZ },
                { dimension: p.dimension, rotation: { x: 0, y: yaw } }
            );
            p.sendMessage("§c⚠ No puedes salir del Coliseo.");
            p.runCommand("playsound note.bass @s ~ ~ ~ 1 0.5");
        } catch {}
    }
}, 20 * 10);

// ─── GUARDIA INTERACTION ──────────────────────────────────────────────────────

// Cooldown para evitar abrir múltiples formularios simultáneos
const guardiaFormOpen = new Set(); // playerIds con formulario actualmente abierto

async function safeShowGuardiaForm(player) {
    if (guardiaFormOpen.has(player.id)) return; // ya tiene un formulario abierto
    guardiaFormOpen.add(player.id);
    try {
        await showGuardiaForm(player);
    } finally {
        guardiaFormOpen.delete(player.id);
    }
}

// Limpiar tag gm:in_map cuando el jugador muere dentro del mapa
// También limpia kit del coliseo si murió en la arena
world.afterEvents.entityDie.subscribe(ev => {
    if (ev.deadEntity.typeId !== "minecraft:player") return;
    const player = ev.deadEntity;

    if (player.hasTag("gm:in_coliseum")) {
        const deathPos = player.location;
        const dim = player.dimension;

        // 1. Limpiar inventario y equipo inmediatamente
        clearKitItems(player);
        // NO quitar el tag — el jugador respawneará en el coliseo

        // 2. Eliminar items dropeados en el suelo cerca del punto de muerte
        system.runTimeout(() => {
            try {
                const items = dim.getEntities({
                    type: "minecraft:item",
                    location: deathPos,
                    maxDistance: 10
                });
                for (const itemEntity of items) {
                    try { itemEntity.kill(); } catch {}
                }
            } catch {}
        }, 2);

        // 3. Al respawnear, teleportar a posición random del coliseo con kit nuevo
        //    Usamos playerSpawn para detectar el respawn
        // (manejado en el playerSpawn handler de abajo)
    }

    if (player.hasTag("gm:in_map")) {
        player.removeTag("gm:in_map");
        stopMapMusic(player);
        // Limpiar ventana de cancelación si aún estaba activa
        if (cancelEntryPlayers.has(player.id)) {
            const prev = cancelEntryPlayers.get(player.id);
            try { system.clearRun(prev.timeoutId); } catch {}
            restoreUIItem(player);
        }
    }
}, { entityTypes: ["minecraft:player"] });

// Coliseo: al respawnear → clear de nuevo como segunda capa de seguridad
// Cubre el caso del item "sostenido con el cursor" y cualquier item que haya escapado
// También bloquea drop e interacción por 5 segundos tras respawn
const respawnLocked = new Set(); // playerIds bloqueados temporalmente tras respawn

world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    system.runTimeout(() => {
        try {
            // Respawn dentro del coliseo → TP random + kit nuevo
            if (ev.initialSpawn === false && player.hasTag("gm:in_coliseum")) {
                const spawnPos = randomColiseumPos(20);
                player.teleport(spawnPos, { dimension: world.getDimension("minecraft:overworld") });
                player.runCommand("effect @s resistance 10 255 true");
                system.runTimeout(() => giveColiseumKit(player), 5);
                system.runTimeout(() => giveColiseumExitItem(player), 100);
                return;
            }

            // Si respawneó con la prop del kit aún activa → clear inmediato
            const raw = player.getDynamicProperty(PROP_COLISEUM_KIT);
            if (raw) {
                clearKitItems(player);
                player.sendMessage("§c[Arena] Items del coliseo eliminados.");
            }

            // Si tiene la tag pero está fuera del área → clear + quitar tag
            if (player.hasTag("gm:in_coliseum") && !isInColiseum(player)) {
                clearKitItems(player);
                player.removeTag("gm:in_coliseum");
            }

            // Si se reconectó con gm:in_map pero la partida ya no está activa → limpiar y teleportar
            if (player.hasTag("gm:in_map")) {
                const state = getState();
                if (state !== "active") {
                    player.removeTag("gm:in_map");
                    player.runCommand("clear @s");
                    player.teleport(
                        { x: -1241.69, y: 80.00, z: -87.01 },
                        { dimension: world.getDimension("minecraft:overworld") }
                    );
                    player.sendMessage("§e[Mapa] La partida terminó mientras estabas desconectado. Fuiste enviado al refugio.");
                }
            }

            // Bloquear drop e interacción por 5 segundos como medida de seguridad
            if (ev.initialSpawn === false) {
                respawnLocked.add(player.id);
                system.runTimeout(() => respawnLocked.delete(player.id), 100);
            }
        } catch {}
    }, 5);
});

// Bloquear drop durante los 5 segundos post-respawn Y mientras está en la arena
world.beforeEvents.itemDrop?.subscribe?.(ev => {
    const src = ev.source;
    if (!src) return;
    if (src.hasTag("gm:in_coliseum") || respawnLocked.has(src.id)) {
        ev.cancel = true;
        if (src.hasTag("gm:in_coliseum"))
            src.sendMessage("§c[Arena] No puedes tirar items dentro de la arena.");
    }
});

world.afterEvents.playerInteractWithEntity.subscribe(ev => {
    if (ev.target.typeId === "tz:guardia_1") safeShowGuardiaForm(ev.player);
});

world.afterEvents.entityHitEntity.subscribe(ev => {
    if (ev.damagingEntity?.typeId === "minecraft:player" && ev.hitEntity?.typeId === "tz:guardia_1")
        safeShowGuardiaForm(ev.damagingEntity);
});

// ─── CHAT COMMANDS ────────────────────────────────────────────────────────────

world.beforeEvents.chatSend.subscribe(ev => {
    const player = ev.sender;
    const msg = ev.message.trim().toLowerCase();

    let prefix = "!";
    try { const r = world.getDynamicProperty("customcommands:config"); if (r) prefix = JSON.parse(r).prefix ?? "!"; } catch {}

    if (msg === `${prefix}accept-team`) {
        ev.cancel = true;
        system.run(() => {
            const ownerId = pendingInvites.get(player.id);
            if (!ownerId) { player.sendMessage(tx(player, "noPending")); return; }
            pendingInvites.delete(player.id);
            if (getPlayerTeam(player.id)) { player.sendMessage(tx(player, "teamAlready")); return; }
            addToTeam(ownerId, player.id);
            const owner = world.getAllPlayers().find(p => p.id === ownerId);
            player.sendMessage(`§a✓ Te uniste al equipo de §f${owner?.name ?? "?"}\n§7Para salir escribe §e!exit-team §7o abre el menú de equipo.`);
            if (owner) owner.sendMessage(tx(owner, "teamJoined", player.name));
        });
    }

    if (msg === `${prefix}deny-team`) {
        ev.cancel = true;
        system.run(() => {
            if (!pendingInvites.has(player.id)) { player.sendMessage("§cNo tienes invitaciones pendientes."); return; }
            const ownerId = pendingInvites.get(player.id);
            pendingInvites.delete(player.id);
            player.sendMessage("§7Rechazaste la invitación.");
            const owner = world.getAllPlayers().find(p => p.id === ownerId);
            if (owner) owner.sendMessage(`§c[Equipo] §f${player.name} §7rechazó tu invitación.`);
        });
    }

    if (msg === `${prefix}team`) {
        ev.cancel = true;
        system.run(() => showTeamPanel(player));
    }

    if (msg === `${prefix}exit-team`) {
        ev.cancel = true;
        system.run(() => {
            const result = removeFromTeam(player.id);
            if (!result) { player.sendMessage(tx(player, "notInTeam")); return; }
            player.sendMessage(tx(player, "exitTeam"));
            if (result !== "dissolved") {
                const owner = world.getAllPlayers().find(p => p.id === result);
                if (owner) owner.sendMessage(tx(owner, "teamLeft", player.name));
            }
        });
    }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

system.runTimeout(() => {
    if (!world.getDynamicProperty(PROP_STATE)) startCooldown();

    // Registrar variables $ para el ItemSidebar
    registerCustomResolver("maptime", () => {
        const s = secsLeft(), state = getState();
        return state === "active" ? fmtTime(s) : `❄ ${fmtTime(s)}`;
    });
    registerCustomResolver("mapname", () => {
        const state = getState();
        return state === "active" ? curMap().name.es : "Enfriamiento";
    });
    console.warn("[GameMode] Sistema cargado");
}, 40);

// ─── BLOQUEAR CONTENEDORES EN MAPA Y COLISEO ─────────────────────────────────

const CONTAINER_BLOCKS = new Set([
    "minecraft:chest",
    "minecraft:trapped_chest",
    "minecraft:ender_chest",
    "minecraft:barrel",
    "minecraft:furnace",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:hopper",
    "minecraft:dropper",
    "minecraft:dispenser",
    "minecraft:shulker_box",
    "minecraft:undyed_shulker_box",
    "minecraft:white_shulker_box",
    "minecraft:orange_shulker_box",
    "minecraft:magenta_shulker_box",
    "minecraft:light_blue_shulker_box",
    "minecraft:yellow_shulker_box",
    "minecraft:lime_shulker_box",
    "minecraft:pink_shulker_box",
    "minecraft:gray_shulker_box",
    "minecraft:light_gray_shulker_box",
    "minecraft:cyan_shulker_box",
    "minecraft:purple_shulker_box",
    "minecraft:blue_shulker_box",
    "minecraft:brown_shulker_box",
    "minecraft:green_shulker_box",
    "minecraft:red_shulker_box",
    "minecraft:black_shulker_box",
    "minecraft:brewing_stand",
    "minecraft:anvil",
    "minecraft:grindstone",
    "minecraft:enchanting_table",
    "minecraft:crafting_table",
    "minecraft:loom",
    "minecraft:cartography_table",
    "minecraft:stonecutter",
    "minecraft:smithing_table",
]);

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const player = ev.player;
    if (!player.hasTag("gm:in_map") && !player.hasTag("gm:in_coliseum")) return;

    const block = ev.block;
    // Chequear el typeId base (sin estados)
    const typeId = block.typeId;
    if (!CONTAINER_BLOCKS.has(typeId)) return;

    ev.cancel = true;
    player.sendMessage("§c⚠ No puedes usar contenedores dentro del mapa.");
});

