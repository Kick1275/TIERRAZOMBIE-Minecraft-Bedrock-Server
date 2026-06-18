import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { registerCustomResolver } from "../Core/PlaceholderResolver.js";
import { giveMenuBook } from "../Server/UserUI.js";
import { onDeploy } from "./DailyMissions.js";
import {
    getAirdropMatchCount, getAirdropDropState, getAirdropDropPos,
    getAirdropUnlockAt, getAirdropClearAt, forceAirdrop, resetMatchCount,
    getAirdropConfig, setAirdropConfig, clearActiveDrop,
} from "./AirDropSystem.js";
import {
    forcePetroEvent, onPetroMatchEnded, enterPetroMap, getPetroEventState,
    getPetroDropUnlockAt, getPetroDropClearAt, getPetroConfig, setPetroConfig,
    randomBorderSpawn,
} from "./PetroEventSystem.js";
import { allowLeaveContainZone } from "./TradeZoneProtection.js";

console.warn("[GameMode] v3 lite - iniciando...");

// ─── CONFIG ───────────────────────────────────────────────────────────────────

/** Zonas de spawn aleatorio (bounds listos para el mapa único futuro). */
const MAPS = [
    { id: "green_city", name: { es: "The Green City", en: "The Green City" },
      min: { x: -45,  y: 80,  z: -45  }, max: { x: 302,  y: 110, z: 642  } },
    { id: "downtown",   name: { es: "The DownTown",  en: "The DownTown"  },
      min: { x: 315,  y: 118, z: 199  }, max: { x: 985,  y: 159, z: 1014 } },
    { id: "airport",    name: { es: "The Air Port",   en: "The Air Port"   },
      min: { x: 1042, y: 94,  z: -591 }, max: { x: 1741, y: 144, z: 463  } },
    { id: "desert",     name: { es: "The Desert",     en: "The Desert"     },
      min: { x: 1545, y: 53,  z: 1246 }, max: { x: 2208, y: 53,  z: 2752 } },
];

const REFUGE = { x: 1600, y: 50, z: 1489 };
const SUPPLY_POST = { x: 1600, y: 50, z: 1489 };
const OPEN_WORLD_TAG = "gm:in_open_world";
const COLISEUM_TAG = "gm:in_coliseum";
const PLAY_MAPS = MAPS;

const COLISEUM = {
    min:   { x: 1369, y: 51, z: 1666 },
    max:   { x: 1497, y: 52, z: 1794 },
    spawn: { x: 1433, y: 52, z: 1730 },
};

const KIT_GOLDEN_APPLES = { id: "minecraft:golden_apple", count: 64 };
const PROP_COLISEUM_KIT = "col:kit";

const WEAPON_POOL = [
    { cmds: ["give @s krep:m4a1 1",    "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:akm 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:hk416 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:scarl 1",   "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:m16 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:g36 1",     "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:mp5 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:vector 1",  "give @s krep:acp45 256"]    },
    { cmds: ["give @s krep:ump 1",     "give @s krep:acp45 256"]    },
    { cmds: ["give @s krep:g17 1",     "give @s krep:mm9 256"]      },
    { cmds: ["give @s krep:deagle 1",  "give @s krep:ae50 256"]     },
    { cmds: ["give @s krep:m870 1",    "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:aa12 1",    "give @s krep:gauge12 256"]  },
    { cmds: ["give @s krep:awp 1",     "give @s krep:lapua338 256"] },
    { cmds: ["give @s krep:mk14 1",    "give @s krep:m43 256"]      },
    { cmds: ["give @s krep:p90 1",     "give @s krep:mm5728 256"]   },
];
const CANCEL_ITEM = "minecraft:paper";
const UI_SLOT = 8;
const CANCEL_LOCK = `{"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}`;

const cancelEntryPlayers = new Map();
const enteringMap = new Set();
const guardiaFormOpen = new Set();
const respawnLocked = new Set();
const ANTI_BLOCK_TICKS = 600; // 30 segundos
// ─── HELPERS ──────────────────────────────────────────────────────────────────

function L(player) {
    try {
        const s = player.getDynamicProperty("playerSettings");
        if (s) return JSON.parse(s).language ?? "es";
    } catch {}
    return "es";
}

function fmtTime(s) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function randomInMap(map) {
    const minX = Math.min(map.min.x, map.max.x);
    const maxX = Math.max(map.min.x, map.max.x);
    const minZ = Math.min(map.min.z, map.max.z);
    const maxZ = Math.max(map.min.z, map.max.z);
    return {
        x: Math.floor(minX + Math.random() * (maxX - minX)),
        y: Math.min(map.min.y, map.max.y) + 2,
        z: Math.floor(minZ + Math.random() * (maxZ - minZ)),
    };
}

function doTP(player, dest, destName) {
    const lang = L(player);
    player.sendMessage(lang === "es" ? `§7Viajando a §e${destName}§7...` : `§7Traveling to §e${destName}§7...`);
    player.runCommand("camera @s fade time 0.1 10 2");
    system.runTimeout(() => {
        try {
            player.teleport(dest, { dimension: world.getDimension("minecraft:overworld") });
        } catch (e) {
            console.warn("[GameMode] TP error: " + e);
        }
    }, 10);
}

function doWarpTP(player, dest, destName) {
    const lang = L(player);
    player.sendMessage(lang === "es" ? `§7Viajando a §e${destName}§7...` : `§7Traveling to §e${destName}§7...`);
    player.runCommand("camera @s fade time 0.1 0.5 0.5");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => {
        try {
            player.teleport(dest, { dimension: world.getDimension("minecraft:overworld") });
        } catch (e) {
            console.warn("[GameMode] TP error: " + e);
        }
    }, 5);
}

// Export vacío — Downed.js lo importa; misiones desactivadas en main.js
export function onDownedKill(_executor) {}

// ─── CANCEL ENTRY (papel 30s) ───────────────────────────────────────────────

function giveCancelItem(player) {
    try {
        player.runCommand(`replaceitem entity @s slot.hotbar ${UI_SLOT} ${CANCEL_ITEM} 1 0 ${CANCEL_LOCK}`);
        system.runTimeout(() => {
            try {
                const inv = player.getComponent("minecraft:inventory")?.container;
                if (!inv) return;
                const item = inv.getItem(UI_SLOT);
                if (!item || item.typeId !== CANCEL_ITEM) return;
                item.nameTag = "§c§lVolver al Refugio";
                item.setLore([
                    "§7Cancela tu despliegue",
                    "§7y regresa al refugio.",
                    "",
                    "§e► Click derecho §7para cancelar",
                ]);
                inv.setItem(UI_SLOT, item);
            } catch {}
        }, 5);
        player.addTag("gm:cancel_entry");
        player.sendMessage("§e⚠ §fTienes §e30 segundos §fpara cancelar.\n§7Usa el §cpapel §7en la barra.");
    } catch (e) {
        console.warn("[GameMode] giveCancelItem: " + e);
    }
}

function restoreUIItem(player) {
    try {
        player.removeTag("gm:cancel_entry");
        cancelEntryPlayers.delete(player.id);
        system.runTimeout(() => { try { giveMenuBook(player); } catch {} }, 5);
    } catch (e) {
        console.warn("[GameMode] restoreUIItem: " + e);
    }
}

function startCancelEntryWindow(player) {
    const prev = cancelEntryPlayers.get(player.id);
    if (prev) try { system.clearRun(prev.timeoutId); } catch {}

    giveCancelItem(player);
    const timeoutId = system.runTimeout(() => {
        if (cancelEntryPlayers.has(player.id)) restoreUIItem(player);
    }, 600);
    cancelEntryPlayers.set(player.id, { timeoutId });
}

function cancelDeploy(player) {
    const prev = cancelEntryPlayers.get(player.id);
    if (prev) try { system.clearRun(prev.timeoutId); } catch {}
    restoreUIItem(player);
    player.removeTag(OPEN_WORLD_TAG);
    player.setDynamicProperty("gm:mapId", undefined);
    player.runCommand("effect @s clear");
    doWarpTP(player, REFUGE, L(player) === "es" ? "Refugio" : "Refuge");
    player.sendMessage("§a✓ Despliegue cancelado.");
}

// ─── JUGAR (TP aleatorio) ─────────────────────────────────────────────────────

function enterMap(player, map, pos) {
    if (enteringMap.has(player.id)) return;
    enteringMap.add(player.id);
    system.runTimeout(() => enteringMap.delete(player.id), 100);

    doTP(player, pos ?? randomInMap(map), map.name[L(player)]);
    player.addTag(OPEN_WORLD_TAG);
    player.setDynamicProperty("gm:mapId", map.id);
    try { onDeploy(player); } catch {}
    player.runCommand("stopsound @s");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => {
        player.playSound("play.music", { volume: 1, pitch: 1 });
    }, 20 * 2);
    system.runTimeout(() => {
        try {
            player.runCommand("effect @s resistance 20 255 true");
            player.runCommand("effect @s slow_falling 5 1 true");
        } catch {}
    }, 15);

    system.runTimeout(() => {
        try { startCancelEntryWindow(player); } catch {}
    }, 20);

    // Anti-atrapamiento en bloques: 30 segundos tras el TP
    system.runTimeout(() => {
        let elapsed = 0;
        const blockCheckId = system.runInterval(() => {
            elapsed += 5;
            if (elapsed > ANTI_BLOCK_TICKS) {
                system.clearRun(blockCheckId);
                return;
            }
            try {
                if (!player.hasTag(OPEN_WORLD_TAG)) {
                    system.clearRun(blockCheckId);
                    return;
                }
                const pos = player.location;
                const dim = player.dimension;
                const fx = Math.floor(pos.x), fy = Math.floor(pos.y), fz = Math.floor(pos.z);
                const feet = dim.getBlock({ x: fx, y: fy,     z: fz });
                const head = dim.getBlock({ x: fx, y: fy + 1, z: fz });
                if ((feet && !feet.isAir) || (head && !head.isAir)) {
                    player.teleport({ x: pos.x, y: pos.y + 1, z: pos.z }, { dimension: dim });
                }
            } catch {
                system.clearRun(blockCheckId);
            }
        }, 5);
    }, 15);
}
function enterPetroEvent(player) {
    const petroState = getPetroEventState();
    if (petroState !== "active" && petroState !== "drop_open") {
        player.sendMessage("§cEl evento La Petro no está activo.");
        return;
    }
    enterPetroMap(player, randomBorderSpawn());
}

// ─── COLISEUM ─────────────────────────────────────────────────────────────────

function isInColiseum(player) {
    const p = player.location;
    return p.x >= COLISEUM.min.x && p.x <= COLISEUM.max.x &&
           p.z >= COLISEUM.min.z && p.z <= COLISEUM.max.z;
}

function getUIItem() {
    try {
        const r = world.getDynamicProperty("server:config");
        if (r) return JSON.parse(r).uiItem ?? "mcpe:addon_menu";
    } catch {}
    return "mcpe:addon_menu";
}

function invIsEmptyForColiseum(player) {
    const uiItem = getUIItem();
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item) continue;
            if (item.typeId === uiItem) continue;
            if (item.typeId === "minecraft:book" || item.typeId === "minecraft:written_book") continue;
            return false;
        }
    }
    try {
        const eq = player.getComponent("minecraft:equippable");
        for (const slot of ["Head", "Chest", "Legs"]) {
            if (eq.getEquipment(slot)) return false;
        }
    } catch {}
    return true;
}

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

function giveColiseumExitItem(player) {
    try {
        const item = new ItemStack("minecraft:paper", 1);
        item.nameTag = "§c§lSalir del Coliseo\n§r§7Usa este item para salir";
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (inv) inv.setItem(UI_SLOT, item);
    } catch (e) { console.warn("[Coliseum] giveExitItem: " + e); }
}

function giveColiseumKit(player) {
    const LOCK = `{"minecraft:item_lock":{"mode":"lock_in_inventory"}}`;
    const pool = [...WEAPON_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = pool.slice(0, 3);

    let hasBoot = false;
    try { hasBoot = !!player.getComponent("minecraft:equippable")?.getEquipment("Feet"); } catch {}

    system.runTimeout(() => {
        try {
            player.runCommand(`give @s mcpe:spec_helmet 1 0 ${LOCK}`);
            player.runCommand(`give @s mcpe:tactical_vest_black 1 0 ${LOCK}`);
            player.runCommand(`give @s mcpe:special_top 1 0 ${LOCK}`);
            if (!hasBoot) player.runCommand(`give @s mcpe:special_bottom 1 0 ${LOCK}`);
        } catch {}
    }, 0);

    for (let i = 0; i < chosen.length; i++) {
        system.runTimeout(() => {
            try {
                const weaponParts = chosen[i].cmds[0].split(" ");
                player.runCommand(`${weaponParts.slice(0, 4).join(" ")} 0 ${LOCK}`);
                const ammoParts = chosen[i].cmds[1].split(" ");
                chosen[i]._ammoCmd = `${ammoParts.slice(0, 4).join(" ")} 0 ${LOCK}`;
            } catch {}
        }, 5 + i * 5);
    }

    system.runTimeout(() => {
        try { player.runCommand(`give @s ${KIT_GOLDEN_APPLES.id} ${KIT_GOLDEN_APPLES.count} 0 ${LOCK}`); } catch {}
    }, 25);

    for (let i = 0; i < chosen.length; i++) {
        system.runTimeout(() => {
            try { if (chosen[i]._ammoCmd) player.runCommand(chosen[i]._ammoCmd); } catch {}
        }, 35 + i * 5);
    }

    player.sendMessage("§a✓ Kit asignado. §c¡No podrás salir con estos items!");

    system.runTimeout(() => {
        try {
            player.setDynamicProperty(PROP_COLISEUM_KIT, JSON.stringify(collectKitTypeIds(player)));
        } catch {}
    }, 60);
}

function randomColiseumPos(yOffset = 0) {
    return {
        x: COLISEUM.min.x + Math.random() * (COLISEUM.max.x - COLISEUM.min.x),
        y: COLISEUM.spawn.y + yOffset,
        z: COLISEUM.min.z + Math.random() * (COLISEUM.max.z - COLISEUM.min.z),
    };
}

function enterColiseum(player) {
    if (!invIsEmptyForColiseum(player)) {
        player.sendMessage("§cDebes tener el inventario vacío (solo se permite el menú y botas equipadas).");
        return;
    }

    const spawnPos = randomColiseumPos(20);
    player.sendMessage(L(player) === "es" ? "§7Viajando a §eColiseo§7..." : "§7Traveling to §eColiseum§7...");
    player.runCommand("camera @s fade time 0.1 0.5 0.5");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => {
        try {
            player.teleport(spawnPos, { dimension: world.getDimension("minecraft:overworld") });
            player.addTag(COLISEUM_TAG);
            player.runCommand("effect @s resistance 10 255 true");
            system.runTimeout(() => giveColiseumKit(player), 5);
            system.runTimeout(() => giveColiseumExitItem(player), 100);
        } catch (e) { console.warn("[Coliseum] enterColiseum: " + e); }
    }, 5);
}

function exitColiseum(player) {
    clearKitItems(player);
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item?.typeId === "minecraft:paper") inv.setItem(i, undefined);
        }
    }
    player.removeTag(COLISEUM_TAG);
    player.runCommand("camera @s fade time 0.1 0.5 0.5");
    player.teleport(SUPPLY_POST, { dimension: world.getDimension("minecraft:overworld") });
    player.sendMessage(L(player) === "es"
        ? "§7Saliste del Coliseo. Inventario limpiado."
        : "§7You left the Coliseum. Inventory cleared.");
    system.runTimeout(() => { try { giveMenuBook(player); } catch {} }, 5);
}

// ─── GUARDIA UI ───────────────────────────────────────────────────────────────
export async function showGuardiaForm(player) {
    const isAdmin = player.hasTag("admin");
    const petroState = getPetroEventState();
    const petroAvailable = petroState === "active" || petroState === "drop_open";

    const form = new ActionFormData()
        .title("§l§6Centro de Operaciones")
        .body("§7Selecciona una acción.")
        .button("§l§a▶ JUGAR\n§r§7§oDespliegue táctico aleatorio", "textures/ui/icon_map.png")
        .button("§l§c⚔ Coliseo\n§r§7PvP con kits aleatorios", "textures/ui/strength_effect.png")
        .button("§l§e Puesto de Suministros\n§r§7Compra y vende objetos", "textures/ui/icon_deals.png")
        .button("§l§b Refugio\n§r§7Tu base segura", "textures/ui/fire_resistance_effect.png");

    if (petroAvailable) {
        form.button("§l§6⚡ IR AL EVENTO\n§r§7La Petro está activa", "textures/ui/world_glyph_color_2x.png");
    }
    if (isAdmin) {
        form.button("§c[Admin] Panel\n§r§7Eventos y controles", "textures/ui/op.png");
    }

    const res = await form.show(player);
    if (res.canceled) return;

    let idx = 0;
    if (res.selection === idx++) {
        allowLeaveContainZone(player.id);
        const map = PLAY_MAPS[Math.floor(Math.random() * PLAY_MAPS.length)];
        enterMap(player, map);
        return;
    }
    if (res.selection === idx++) {
        allowLeaveContainZone(player.id);
        enterColiseum(player);
        return;
    }
    if (res.selection === idx++) {
        allowLeaveContainZone(player.id);
        doWarpTP(player, SUPPLY_POST, L(player) === "es" ? "Puesto de Suministros" : "Supply Post");
        return;
    }
    if (res.selection === idx++) {
        allowLeaveContainZone(player.id);
        doWarpTP(player, REFUGE, L(player) === "es" ? "Refugio" : "Refuge");
        return;
    }

    if (petroAvailable && res.selection === idx++) {
        allowLeaveContainZone(player.id);
        enterPetroEvent(player);
        return;
    }

    if (isAdmin && res.selection === idx) {
        await showAdminPanel(player);
    }
}
// ─── ADMIN ────────────────────────────────────────────────────────────────────

async function showAdminPanel(player) {
    const dropState = getAirdropDropState();
    const petroState = getPetroEventState();

    const res = await new ActionFormData()
        .title("§c[Admin] Panel")
        .body(
            `§7Air Drop: §f${dropState}\n` +
            `§7La Petro: §f${petroState}\n\n` +
            `§7Gestiona eventos del servidor.`
        )
        .button("§6 Air Drop\n§r§7Estado y configuración")
        .button("§5 La Petro\n§r§7Evento especial")
        .button("§8Cerrar")
        .show(player);

    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) await showAdminAirdropPanel(player);
    if (res.selection === 1) await showAdminPetroPanel(player);
}

async function showAdminPetroPanel(player) {
    const c = getPetroConfig();
    const petroState = getPetroEventState();
    const now = Math.floor(Date.now() / 1000);

    const stateLabels = { none: "§8Inactivo", active: "§6Drop bloqueado", drop_open: "§aAbierto" };
    let timerStr = "§8—";
    if (petroState === "active") {
        timerStr = `§cAbre en §e${fmtTime(Math.max(0, getPetroDropUnlockAt() - now))}`;
    } else if (petroState === "drop_open") {
        timerStr = `§aLimpia en §e${fmtTime(Math.max(0, getPetroDropClearAt() - now))}`;
    }

    const res = await new ActionFormData()
        .title("§5[Admin] La Petro")
        .body(
            `§7Estado: ${stateLabels[petroState] ?? "§8Inactivo"}\n` +
            `§7Timer: ${timerStr}\n\n` +
            `§7Activación: §emanual (admin)\n` +
            `§7Drop bloqueado: §e${c.dropLockMins} min\n` +
            `§7Drop abierto: §e${c.dropClearMins} min\n` +
            `§7Bote: §e${c.boatDurationSecs}s §7| Protección: §e${c.protectionSecs}s`
        )
        .button("§a▶ Forzar evento ahora")
        .button("§c✖ Limpiar evento activo")
        .button("§b⚙ Configurar")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 3) return;

    if (res.selection === 0) {
        try {
            forcePetroEvent();
            player.sendMessage("§a✓ Evento La Petro activado.");
        } catch (e) {
            player.sendMessage("§cError: " + e);
        }
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
        .title("§b[Admin] La Petro - Config")
        .textField("Minutos bloqueado el drop", "ej: 15", { defaultValue: String(c.dropLockMins) })
        .textField("Minutos drop abierto", "ej: 5", { defaultValue: String(c.dropClearMins) })
        .textField("Segundos del bote", "ej: 300", { defaultValue: String(c.boatDurationSecs) })
        .textField("Segundos protección inicial", "ej: 60", { defaultValue: String(c.protectionSecs) })
        .textField("Segundos ventana cancelación", "ej: 60", { defaultValue: String(c.cancelWindowSecs) })
        .toggle("Sistema activado", { defaultValue: c.enabled })
        .show(player);

    if (res.canceled) return;

    const [lockMins, clearMins, boatSecs, protSecs, cancelSecs, enabled] = res.formValues;
    setPetroConfig({
        ...c,
        dropLockMins: parseFloat(lockMins) || c.dropLockMins,
        dropClearMins: parseFloat(clearMins) || c.dropClearMins,
        boatDurationSecs: parseInt(boatSecs) || c.boatDurationSecs,
        protectionSecs: parseInt(protSecs) || c.protectionSecs,
        cancelWindowSecs: parseInt(cancelSecs) || c.cancelWindowSecs,
        enabled: !!enabled,
    });
    player.sendMessage("§a✓ Configuración de La Petro guardada.");
}

async function showAdminAirdropPanel(player) {
    const dropState = getAirdropDropState();
    const dropPos = getAirdropDropPos();
    const matchCount = getAirdropMatchCount();
    const adCfg = getAirdropConfig();
    const now = Math.floor(Date.now() / 1000);

    let timerStr = "§8—";
    if (dropState === "landed") {
        timerStr = `§cAbre en §e${fmtTime(Math.max(0, getAirdropUnlockAt() - now))}`;
    } else if (dropState === "open") {
        timerStr = `§aLimpia en §e${fmtTime(Math.max(0, getAirdropClearAt() - now))}`;
    }

    const res = await new ActionFormData()
        .title("§6[Admin] Air Drop")
        .body(
            `§7Ciclos: §e${matchCount}\n` +
            `§7Estado: §f${dropState}\n` +
            `§7Posición: §f${dropPos ? `${dropPos.x}, ${dropPos.y}, ${dropPos.z}` : "—"}\n` +
            `§7Timer: ${timerStr}\n\n` +
            `§7Intervalo: §ecada §f${adCfg.matchInterval} §eciclos\n` +
            `§7Delay: §e${adCfg.spawnDelayMins} min §7| Bloqueo: §e${adCfg.lockMins} min\n` +
            `§7Abierto: §e${adCfg.clearMins} min\n` +
            `§7Sistema: ${adCfg.enabled ? "§aActivado" : "§cDesactivado"}`
        )
        .button("§a▶ Forzar drop ahora")
        .button("§c✖ Limpiar drop activo")
        .button("§e↺ Resetear contador")
        .button("§b⚙ Configurar tiempos")
        .button("§d⚙ Configurar textos")
        .button("§8Volver")
        .show(player);

    if (res.canceled || res.selection === 5) return;

    if (res.selection === 0) {
        forceAirdrop();
        player.sendMessage("§a✓ Drop forzado.");
        await showAdminAirdropPanel(player);
    } else if (res.selection === 1) {
        clearActiveDrop();
        player.sendMessage("§a✓ Drop limpiado.");
        await showAdminAirdropPanel(player);
    } else if (res.selection === 2) {
        resetMatchCount();
        player.sendMessage("§a✓ Contador reseteado.");
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
        .textField("Ciclos entre drops", "ej: 3", { defaultValue: String(c.matchInterval) })
        .textField("Minutos de delay al spawnear", "ej: 1", { defaultValue: String(c.spawnDelayMins) })
        .textField("Minutos bloqueado", "ej: 5", { defaultValue: String(c.lockMins) })
        .textField("Minutos abierto", "ej: 10", { defaultValue: String(c.clearMins) })
        .toggle("Sistema activado", { defaultValue: c.enabled })
        .show(player);

    if (res.canceled) return;

    const [interval, delay, lock, clear, enabled] = res.formValues;
    setAirdropConfig({
        ...c,
        matchInterval: parseInt(interval) || c.matchInterval,
        spawnDelayMins: parseFloat(delay) ?? c.spawnDelayMins,
        lockMins: parseFloat(lock) ?? c.lockMins,
        clearMins: parseFloat(clear) ?? c.clearMins,
        enabled: !!enabled,
    });
    player.sendMessage("§a✓ Configuración guardada.");
}

async function showAdminAirdropTexts(player) {
    const c = getAirdropConfig();
    const res = await new ModalFormData()
        .title("§d[Admin] Air Drop - Textos")
        .textField("Nombre waypoint", "Air Drop", { defaultValue: c.wpName })
        .textField("Texto FT bloqueado ({time})", "", { defaultValue: c.ftLocked })
        .textField("Texto FT abierto", "", { defaultValue: c.ftUnlocked })
        .textField("Chat al caer ({coords})", "", { defaultValue: c.chatMsg })
        .textField("Chat al abrir ({mins})", "", { defaultValue: c.chatUnlock })
        .textField("Title al caer", "", { defaultValue: c.titleDrop })
        .textField("Subtitle al caer ({coords})", "", { defaultValue: c.subtitleDrop })
        .textField("Title al abrir", "", { defaultValue: c.titleUnlock })
        .textField("Subtitle al abrir", "", { defaultValue: c.subtitleUnlock })
        .show(player);

    if (res.canceled) return;

    const [wpName, ftLocked, ftUnlocked, chatMsg, chatUnlock, titleDrop, subtitleDrop, titleUnlock, subtitleUnlock] = res.formValues;
    setAirdropConfig({
        ...c,
        wpName: wpName?.trim() || c.wpName,
        ftLocked: ftLocked?.trim() || c.ftLocked,
        ftUnlocked: ftUnlocked?.trim() || c.ftUnlocked,
        chatMsg: chatMsg?.trim() || c.chatMsg,
        chatUnlock: chatUnlock?.trim() || c.chatUnlock,
        titleDrop: titleDrop?.trim() || c.titleDrop,
        subtitleDrop: subtitleDrop?.trim() || c.subtitleDrop,
        titleUnlock: titleUnlock?.trim() || c.titleUnlock,
        subtitleUnlock: subtitleUnlock?.trim() || c.subtitleUnlock,
    });
    player.sendMessage("§a✓ Textos guardados.");
}

// ─── EVENTOS ──────────────────────────────────────────────────────────────────

async function safeShowGuardiaForm(player) {
    if (guardiaFormOpen.has(player.id)) return;
    guardiaFormOpen.add(player.id);
    try {
        await showGuardiaForm(player);
    } finally {
        guardiaFormOpen.delete(player.id);
    }
}

// Límite del coliseo: no salir del área
// Optimización: sólo iterar cuando existe al menos un jugador en el Coliseo
system.runInterval(() => {
    const players = world.getAllPlayers();
    // Quick exit if no players in coliseum — avoids scanning on empty servers
    const anyInColiseum = players.some(p => p.hasTag && p.hasTag(COLISEUM_TAG));
    if (!anyInColiseum) return;

    for (const p of players) {
        if (!p.hasTag || !p.hasTag(COLISEUM_TAG)) continue;
        if (isInColiseum(p)) continue;

        const pos = p.location;
        const MARGIN = 2;
        const safeX = Math.min(COLISEUM.max.x - MARGIN, Math.max(COLISEUM.min.x + MARGIN, pos.x));
        const safeZ = Math.min(COLISEUM.max.z - MARGIN, Math.max(COLISEUM.min.z + MARGIN, pos.z));
        const centerX = (COLISEUM.min.x + COLISEUM.max.x) / 2;
        const centerZ = (COLISEUM.min.z + COLISEUM.max.z) / 2;
        const yaw = Math.atan2(-(centerX - safeX), centerZ - safeZ) * (180 / Math.PI);

        try {
            p.teleport({ x: safeX, y: pos.y, z: safeZ }, { dimension: p.dimension, rotation: { x: 0, y: yaw } });
            p.sendMessage("§c⚠ No puedes salir del Coliseo.");
            p.runCommand("playsound note.bass @s ~ ~ ~ 1 0.5");
        } catch {}
    }
}, 200);

world.afterEvents.playerInteractWithEntity.subscribe(ev => {
    if (ev.target.typeId === "tz:guardia_1") safeShowGuardiaForm(ev.player);
});

world.afterEvents.entityHitEntity.subscribe(ev => {
    if (ev.damagingEntity?.typeId === "minecraft:player" && ev.hitEntity?.typeId === "tz:guardia_1") {
        safeShowGuardiaForm(ev.damagingEntity);
    }
});

world.beforeEvents.itemUse.subscribe(ev => {
    try {
        const player = ev.source;
        if (!player) return;

        if (player.hasTag("gm:cancel_entry") && ev.itemStack?.typeId === CANCEL_ITEM) {
            ev.cancel = true;
            system.run(() => { try { cancelDeploy(player); } catch {} });
            return;
        }

        if (player.hasTag(COLISEUM_TAG) && ev.itemStack?.typeId === "minecraft:paper") {
            ev.cancel = true;
            system.run(() => { try { exitColiseum(player); } catch {} });
        }
    } catch {}
});

world.beforeEvents.itemDrop?.subscribe?.(ev => {
    const src = ev.source;
    if (!src) return;
    if (src.hasTag(COLISEUM_TAG) || respawnLocked.has(src.id)) {
        ev.cancel = true;
        if (src.hasTag(COLISEUM_TAG)) src.sendMessage("§c[Arena] No puedes tirar items dentro de la arena.");
    }
});

world.afterEvents.entityDie.subscribe(ev => {
    if (ev.deadEntity?.typeId !== "minecraft:player") return;
    const player = ev.deadEntity;

    if (player.hasTag(COLISEUM_TAG)) {
        clearKitItems(player);
        system.runTimeout(() => {
            try {
                const items = player.dimension.getEntities({
                    type: "minecraft:item",
                    location: player.location,
                    maxDistance: 10,
                });
                for (const itemEntity of items) {
                    try { itemEntity.kill(); } catch {}
                }
            } catch {}
        }, 2);
        return;
    }

    if (!player.hasTag(OPEN_WORLD_TAG)) return;
    player.removeTag(OPEN_WORLD_TAG);
    if (cancelEntryPlayers.has(player.id)) {
        const prev = cancelEntryPlayers.get(player.id);
        try { system.clearRun(prev.timeoutId); } catch {}
        restoreUIItem(player);
    }
}, { entityTypes: ["minecraft:player"] });

world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    system.runTimeout(() => {
        try {
            if (ev.initialSpawn === false && player.hasTag(COLISEUM_TAG)) {
                player.teleport(randomColiseumPos(20), { dimension: world.getDimension("minecraft:overworld") });
                player.runCommand("effect @s resistance 10 255 true");
                system.runTimeout(() => giveColiseumKit(player), 5);
                system.runTimeout(() => giveColiseumExitItem(player), 100);
                return;
            }

            if (player.getDynamicProperty(PROP_COLISEUM_KIT)) {
                clearKitItems(player);
            }

            if (player.hasTag(COLISEUM_TAG) && !isInColiseum(player)) {
                clearKitItems(player);
                player.removeTag(COLISEUM_TAG);
            }

            if (ev.initialSpawn === false) {
                respawnLocked.add(player.id);
                system.runTimeout(() => respawnLocked.delete(player.id), 100);
            }
        } catch {}
    }, 5);
});

system.runTimeout(() => {
    registerCustomResolver("maptime", () => "§aLibre");
    registerCustomResolver("mapname", () => "§fMundo Abierto");
}, 40);

console.warn("[GameMode] v3 lite cargado");