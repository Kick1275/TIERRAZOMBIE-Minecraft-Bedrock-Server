import { world, system } from "@minecraft/server";
import { giveMenuBook } from "../Server/UserUI.js";
import { onPetroEnter } from "./DailyMissions.js";

console.warn("[PetroEvent] Sistema iniciando...");

// ─── CONSTANTES DEL MAPA ──────────────────────────────────────────────────────

export const PETRO_MAP = {
    id:  "la_petro",
    name: { es: "La Petro", en: "La Petro" },
    min: { x: -2007, y: 0,   z: 1877 },
    max: { x: -1657, y: 150, z: 2208 },
};

// Genera una posición aleatoria en el borde del mapa a nivel del agua
export function randomBorderSpawn() {
    const minX = PETRO_MAP.min.x + 5;
    const maxX = PETRO_MAP.max.x - 5;
    const minZ = PETRO_MAP.min.z + 5;
    const maxZ = PETRO_MAP.max.z - 5;
    const Y = 62;

    // Elegir uno de los 4 bordes aleatoriamente
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: // Norte (Z mínimo)
            return { x: minX + Math.random() * (maxX - minX), y: Y, z: minZ };
        case 1: // Sur (Z máximo)
            return { x: minX + Math.random() * (maxX - minX), y: Y, z: maxZ };
        case 2: // Oeste (X mínimo)
            return { x: minX, y: Y, z: minZ + Math.random() * (maxZ - minZ) };
        case 3: // Este (X máximo)
            return { x: maxX, y: Y, z: minZ + Math.random() * (maxZ - minZ) };
    }
}

// Puntos de extracción
const EXTRACTION_POINTS = [
    { name: "Extracción A", pos: { x: -1801.25, y: 113.50, z: 2031.72 }, color: 7, icon: 2 },
    { name: "Extracción B", pos: { x: -1740.70, y: 63.00,  z: 2053.56 }, color: 7, icon: 3 },
];

// Posición del Air Drop grande (centro de los 4 bloques 2x2)
const BIG_DROP_POS = { x: -1842.00, y: 112.00, z: 2054.03 };
// Fill del drop 2x2
const BIG_DROP_FILL_MIN = { x: -1843, y: 111, z: 2054 };
const BIG_DROP_FILL_MAX = { x: -1842, y: 110, z: 2053 };

// Soldados a spawnear
const SOLDIER_TYPE  = "af:telslakian_soldier";
const SOLDIER_COUNT = 0;
const SOLDIER_SPAWN = { x: -1842, y: 112, z: 2054 };

// Entidad bote
const BOAT_ENTITY = "pubg:pg117";
const BOAT_MAX_CAPACITY = 6;

// ─── PROP KEYS ────────────────────────────────────────────────────────────────

const PROP_CONFIG      = "petro:config";
const PROP_EVENT_STATE = "petro:eventState";
const PROP_DROP_UNLOCK = "petro:dropUnlockAt";
const PROP_DROP_CLEAR  = "petro:dropClearAt";
const PROP_ACTIVE_MAP  = "gm:active_map";

// ─── CONFIG DEFAULT ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
    enabled:          true,
    dropLockMins:     15,
    dropClearMins:    5,
    boatDurationSecs: 300,
    protectionSecs:   60,
    cancelWindowSecs: 60,
};

export function getPetroConfig() {
    try {
        const raw = world.getDynamicProperty(PROP_CONFIG);
        if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_CONFIG };
}

export function setPetroConfig(c) {
    world.setDynamicProperty(PROP_CONFIG, JSON.stringify(c));
}

function cfg() { return getPetroConfig(); }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const nowSec  = () => Math.floor(Date.now() / 1000);
const fmtTime = s  => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

function getEventState() { try { return world.getDynamicProperty(PROP_EVENT_STATE) ?? "none"; } catch { return "none"; } }
function getDropUnlock() { try { return world.getDynamicProperty(PROP_DROP_UNLOCK) ?? 0; } catch { return 0; } }
function getDropClear()  { try { return world.getDynamicProperty(PROP_DROP_CLEAR)  ?? 0; } catch { return 0; } }

function setEventState(s) { world.setDynamicProperty(PROP_EVENT_STATE, s); }

function setActiveMap(mapId) {
    try {
        // Poner/quitar tag gm:map_{mapId} en el guardia — método que usa el mapWaypoints del addon
        const dim = world.getDimension("minecraft:overworld");
        const guardias = dim.getEntities({ type: "tz:guardia_1" });
        const allMapIds = ["green_city","downtown","airport","desert","la_petro"];
        for (const g of guardias) {
            for (const id of allMapIds) {
                if (g.hasTag(`gm:map_${id}`)) g.removeTag(`gm:map_${id}`);
            }
            if (mapId) g.addTag(`gm:map_${mapId}`);
        }
    } catch (e) {
        console.warn("[PetroEvent] setActiveMap error: " + e);
    }
}

// ─── WAYPOINTS ────────────────────────────────────────────────────────────────
// Los waypoints son manejados por mapWaypoints.js via gm:active_map
// Cuando active_map = "la_petro", mapWaypoints.js crea Extracción A, B y Air Drop automáticamente

function setWaypoint(player, name, pos, colorIdx, icon) {
    // No-op: mapWaypoints.js maneja esto
}

function removeWaypoint(player, name) {
    // No-op: mapWaypoints.js maneja esto
}

const PETRO_WP_NAMES = ["Extracción A", "Extracción B", "Air Drop Grande"];
function addPetroWaypoints(player) {
    // mapWaypoints.js se encarga cuando gm:active_map = "la_petro"
}

function removePetroWaypoints(player) {
    // mapWaypoints.js se encarga cuando gm:active_map = undefined
}

function addPetroWaypointsAll() {
    // mapWaypoints.js detecta gm:active_map y actualiza todos los jugadores
}

function removePetroWaypointsAll() {
    // mapWaypoints.js detecta gm:active_map = undefined y limpia todos
}

// ─── FLOATING TEXT ────────────────────────────────────────────────────────────

let _ftId = null;

function getFTManager() {
    try { if (globalThis.__plugsFloatingTextManager) return globalThis.__plugsFloatingTextManager; } catch {}
    return null;
}

function createDropFT(text) {
    const manager = getFTManager();
    if (!manager) return;
    try {
        const result = manager.createFloatingText({
            name: "petro_drop_countdown",
            location: { x: BIG_DROP_POS.x + 0.5, y: BIG_DROP_POS.y + 1, z: BIG_DROP_POS.z + 0.5 },
            lines: [{ text }],
            createdBy: "PetroEvent"
        });
        if (result?.success) _ftId = result.id;
    } catch (e) { console.warn("[PetroEvent] FT create error: " + e); }
}

function updateDropFT(text) {
    const manager = getFTManager();
    if (!manager || !_ftId) return;
    try { manager.updateFloatingText(_ftId, { lines: [{ text }] }); } catch {}
}

function deleteDropFT() {
    const manager = getFTManager();
    if (manager && _ftId) { try { manager.deleteFloatingText(_ftId); } catch {} }
    _ftId = null;
}

function buildFTText(secsLeft, unlocked) {
    if (unlocked) return "§a§l✔ AIR DROP GRANDE\n§7¡Disponible!";
    return `§6§l✈ AIR DROP GRANDE\n§cBloqueado: §e${fmtTime(Math.max(0, secsLeft))}`;
}

// ─── ANUNCIOS DEL EVENTO ──────────────────────────────────────────────────────

function announceEventStart() {
    for (const p of world.getAllPlayers()) {
        try {
            //p.runCommand("camerashake add @s 0.5 1 positional");
            p.onScreenDisplay.setTitle("§6§l EVENTO ESPECIAL ", {
                subtitle: "§e¡La Petro ha comenzado! §cAir Drop masivo en camino...",
                fadeInDuration: 10, stayDuration: 100, fadeOutDuration: 20
            });
            p.sendMessage("§6§l[EVENTO] §r§e¡Un evento especial ha comenzado! §f\"§6La Petro§f\" está activa.");
            p.sendMessage("§7Un Air Drop masivo aterrizará en §c-1842, 112, 2054§7. ¡Prepárate!");
            p.runCommand("playsound  walkie.talkie @s ~ ~ ~ 1 1");
            p.runCommand("playsound  radio.ham @s ~ ~ ~ 1 1");
        } catch {}
    }
}

function announceDropUnlocked() {
    for (const p of world.getAllPlayers()) {
        try {
            p.onScreenDisplay.setTitle("§a§l✔ DROP ABIERTO", {
                subtitle: "§7¡El Air Drop Grande ya está disponible!",
                fadeInDuration: 5, stayDuration: 80, fadeOutDuration: 20
            });
            p.sendMessage("§a§l[PETRO] §r§a¡El Air Drop Grande ya está abierto! §7Tienes §e" + cfg().dropClearMins + " minutos§7.");
            p.runCommand("playsound  walkie.talkie @s ~ ~ ~ 1 1");
            p.runCommand("playsound supply.drop @s ~ ~ ~ 1 2");
        } catch {}
    }
}

// ─── SPAWN DEL DROP GRANDE ────────────────────────────────────────────────────

function spawnBigDrop() {
    const dim = world.getDimension("minecraft:overworld");
    try {
        // Fill 2x2 de bloques de supply
        dim.runCommand(
            `fill ${BIG_DROP_FILL_MIN.x} ${BIG_DROP_FILL_MIN.y} ${BIG_DROP_FILL_MIN.z} ` +
            `${BIG_DROP_FILL_MAX.x} ${BIG_DROP_FILL_MAX.y} ${BIG_DROP_FILL_MAX.z} mcpe:supply_block`
        );
        console.warn("[PetroEvent] Drop 2x2 spawneado");
    } catch (e) { console.warn("[PetroEvent] Error spawneando drop: " + e); }

    // Spawnear soldados
    for (let i = 0; i < SOLDIER_COUNT; i++) {
        system.runTimeout(() => {
            try {
                dim.runCommand(
                    `summon ${SOLDIER_TYPE} ${SOLDIER_SPAWN.x} ${SOLDIER_SPAWN.y} ${SOLDIER_SPAWN.z}`
                );
            } catch {}
        }, i * 2);
    }

    // Calcular tiempos
    const c = cfg();
    const unlockAt = nowSec() + c.dropLockMins * 60;
    const clearAt  = unlockAt + c.dropClearMins * 60;
    world.setDynamicProperty(PROP_DROP_UNLOCK, unlockAt);
    world.setDynamicProperty(PROP_DROP_CLEAR,  clearAt);
    setEventState("active");

    // Waypoints para todos
    addPetroWaypointsAll();

    // Floating text
    createDropFT(buildFTText(c.dropLockMins * 60, false));
    startFTLoop();

    console.warn("[PetroEvent] Evento activo, drop bloqueado por " + c.dropLockMins + " min");
}

function clearBigDrop() {
    const dim = world.getDimension("minecraft:overworld");
    try {
        dim.runCommand(
            `fill ${BIG_DROP_FILL_MIN.x} ${BIG_DROP_FILL_MIN.y} ${BIG_DROP_FILL_MIN.z} ` +
            `${BIG_DROP_FILL_MAX.x} ${BIG_DROP_FILL_MAX.y} ${BIG_DROP_FILL_MAX.z} air`
        );
    } catch {}
    deleteDropFT();
    removePetroWaypointsAll();
    setEventState("none");
    setActiveMap(undefined);
    world.setDynamicProperty(PROP_DROP_UNLOCK, undefined);
    world.setDynamicProperty(PROP_DROP_CLEAR,  undefined);
    console.warn("[PetroEvent] Drop limpiado");
}

// ─── FT LOOP ──────────────────────────────────────────────────────────────────

let _ftInterval = null;

function startFTLoop() {
    if (_ftInterval !== null) { system.clearRun(_ftInterval); _ftInterval = null; }
    _ftInterval = system.runInterval(() => {
        try {
            const state = getEventState();
            if (state === "none") { system.clearRun(_ftInterval); _ftInterval = null; return; }
            const now = nowSec();
            if (state === "active") {
                const secsLeft = getDropUnlock() - now;
                if (secsLeft <= 0) {
                    setEventState("drop_open");
                    world.setDynamicProperty(PROP_DROP_UNLOCK, undefined);
                    updateDropFT(buildFTText(0, true));
                    announceDropUnlocked();
                } else {
                    updateDropFT(buildFTText(secsLeft, false));
                }
            } else if (state === "drop_open") {
                if (getDropClear() - now <= 0) {
                    system.clearRun(_ftInterval); _ftInterval = null;
                    clearBigDrop();
                }
            }
        } catch (e) { console.warn("[PetroEvent] FT loop error: " + e); }
    }, 20);
}

// ─── BLOQUEAR INTERACCIÓN CON DROP MIENTRAS ESTÁ CERRADO ─────────────────────

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    try {
        if (ev.block.typeId !== "mcpe:supply_block") return;
        const state = getEventState();
        if (state !== "active") return;
        // Solo bloquear si el bloque está en la zona del drop grande
        const bp = ev.block.location;
        if (bp.x < BIG_DROP_FILL_MAX.x - 1 || bp.x > BIG_DROP_FILL_MIN.x + 1) return;
        if (bp.z < BIG_DROP_FILL_MAX.z - 1 || bp.z > BIG_DROP_FILL_MIN.z + 1) return;
        ev.cancel = true;
        system.run(() => {
            try {
                const secsLeft = getDropUnlock() - nowSec();
                ev.player.sendMessage("§c⚠ El Air Drop Grande está bloqueado.");
                if (secsLeft > 0) ev.player.sendMessage(`§7Disponible en: §e${fmtTime(secsLeft)}`);
            } catch {}
        });
    } catch {}
});

// ─── SISTEMA DE BOTES ─────────────────────────────────────────────────────────

// Map: playerId → { entityId, timeoutId }
const playerBoats = new Map();

function spawnBoatForPlayer(player, spawnPos) {
    const dim = world.getDimension("minecraft:overworld");

    // Mantener al jugador levitando mientras cargan los chunks (5 segundos)
    try {
        player.runCommand("effect @s levitation 8 2 true");
    } catch {}

    // Esperar 5 segundos (100 ticks) antes de spawnear el bote
    system.runTimeout(() => {
        let boat = null;
        try {
            boat = dim.spawnEntity(BOAT_ENTITY, spawnPos);
        } catch (e) {
            console.warn("[PetroEvent] Error spawneando bote: " + e);
            return;
        }

        // Quitar levitación y avisar al jugador
        try {
            player.runCommand("effect @s levitation 0 0 true");
            player.sendMessage("§e§fTu bote está cerca. §e¡Súbete antes de que desaparezca!");
            player.onScreenDisplay.setTitle("§e¡BOTE CERCA!", {
                subtitle: "§7Súbete antes de que desaparezca",
                fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 10
            });
        } catch {}

        // Guardar referencia y programar destrucción
        const boatId = boat.id;
        const c = cfg();
        const timeoutId = system.runTimeout(() => {
            try {
                const entities = dim.getEntities({ type: BOAT_ENTITY });
                for (const e of entities) {
                    if (e.id === boatId) { e.kill(); break; }
                }
            } catch {}
            playerBoats.delete(player.id);
        }, c.boatDurationSecs * 20);

        playerBoats.set(player.id, { boatId, timeoutId });
    }, 100); // 5 segundos
}

// ─── PROTECCIÓN INICIAL (1 MINUTO) ───────────────────────────────────────────

// Set de jugadores con protección activa
const petroProtected = new Set();

function applyProtection(player) {
    petroProtected.add(player.id);
    player.runCommand("effect @s resistance 70 255 true");
    player.sendMessage("§a§l[PETRO] §r§a¡Tienes §e1 minuto §ade protección! §7No puedes recibir ni hacer daño.");

    const c = cfg();
    system.runTimeout(() => {
        petroProtected.delete(player.id);
        try {
            player.runCommand("effect @s resistance 0 0 true");
            player.onScreenDisplay.setTitle("§c§l¡PROTECCIÓN TERMINADA!", {
                subtitle: "§7Ya puedes recibir y hacer daño",
                fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 20
            });
            player.sendMessage("§c§l[PETRO] §r§c¡Tu protección ha terminado! §7Ahora estás en combate.");
            player.runCommand("playsound note.bass @s ~ ~ ~ 1 0.5");
        } catch {}
    }, c.protectionSecs * 20);
}

// Bloquear daño cuando la víctima O el atacante estén protegidos.
// Un solo subscriber cubre ambos casos (antes eran dos callbacks por cada golpe).
world.beforeEvents.entityHurt.subscribe(ev => {
    try {
        // Víctima protegida
        if (ev.hurtEntity?.typeId === "minecraft:player" && petroProtected.has(ev.hurtEntity.id)) {
            ev.cancel = true;
            return;
        }
        // Atacante protegido
        const source = ev.damageSource?.damagingEntity;
        if (source && source.typeId === "minecraft:player" && petroProtected.has(source.id)) {
            ev.cancel = true;
        }
    } catch {}
});

// ─── ITEM DE CANCELACIÓN (HOJA DE PAPEL) ─────────────────────────────────────

const petroCancelPlayers = new Map(); // playerId → timeoutId
const PETRO_CANCEL_ITEM  = "minecraft:paper";
const PETRO_UI_SLOT      = 8;

function givePetroCancelItem(player) {
    try {
        const LOCK = `{"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}`;
        player.runCommand(`replaceitem entity @s slot.hotbar ${PETRO_UI_SLOT} ${PETRO_CANCEL_ITEM} 1 0 ${LOCK}`);
        system.runTimeout(() => {
            try {
                const inv = player.getComponent("minecraft:inventory")?.container;
                if (!inv) return;
                const item = inv.getItem(PETRO_UI_SLOT);
                if (!item || item.typeId !== PETRO_CANCEL_ITEM) return;
                item.nameTag = "§c§lVolver al Puesto de Suministros";
                item.setLore([
                    "§7Cancela tu entrada a La Petro",
                    "§7y regresa al puesto de suministros.",
                    "",
                    "§e► Click derecho §7para cancelar"
                ]);
                inv.setItem(PETRO_UI_SLOT, item);
            } catch {}
        }, 5);
        player.addTag("petro:cancel_entry");
        player.sendMessage("§e⚠ §fTienes §e1 minuto §fpara cancelar la entrada a La Petro.\n§7Haz clic derecho con la §choja de papel§7.");
    } catch (e) { console.warn("[PetroEvent] giveCancelItem error: " + e); }
}

function restorePetroUIItem(player) {
    try {
        player.removeTag("petro:cancel_entry");
        petroCancelPlayers.delete(player.id);
        system.runTimeout(() => { try { giveMenuBook(player); } catch {} }, 5);
    } catch {}
}

function startPetroCancelWindow(player) {
    if (petroCancelPlayers.has(player.id)) {
        try { system.clearRun(petroCancelPlayers.get(player.id)); } catch {}
    }
    givePetroCancelItem(player);
    const c = cfg();
    const timeoutId = system.runTimeout(() => {
        if (petroCancelPlayers.has(player.id)) restorePetroUIItem(player);
    }, c.cancelWindowSecs * 20);
    petroCancelPlayers.set(player.id, timeoutId);
}

// Listener para usar la hoja de papel
world.beforeEvents.itemUse.subscribe(ev => {
    try {
        const player = ev.source;
        if (!player.hasTag("petro:cancel_entry")) return;
        if (ev.itemStack?.typeId !== PETRO_CANCEL_ITEM) return;
        ev.cancel = true;
        system.run(() => {
            try {
                const prev = petroCancelPlayers.get(player.id);
                if (prev !== undefined) { try { system.clearRun(prev); } catch {} }
                restorePetroUIItem(player);
                exitPetroMap(player, true);
            } catch (e) { console.warn("[PetroEvent] cancel error: " + e); }
        });
    } catch {}
});

// ─── ENTRAR AL MAPA ───────────────────────────────────────────────────────────

const enteringPetro = new Set();

export function enterPetroMap(player, spawnPos) {
    if (enteringPetro.has(player.id)) return;
    enteringPetro.add(player.id);
    system.runTimeout(() => enteringPetro.delete(player.id), 100);

    player.sendMessage("§7Viajando a §6La Petro§7...");
    player.runCommand("camera @s fade time 0.1 10 2");
    player.runCommand("stopsound @s");
    player.runCommand("playsound go.play @s");
    system.runTimeout(() => player.runCommand("playsound play.music @s"), 60);

    system.runTimeout(() => {
        try {
            player.teleport(spawnPos, { dimension: world.getDimension("minecraft:overworld") });
            player.addTag("petro:in_map");
            player.setDynamicProperty("petro:mapId", PETRO_MAP.id);
            onPetroEnter(player);
            spawnBoatForPlayer(player, spawnPos);
            system.runTimeout(() => applyProtection(player), 15);
            system.runTimeout(() => startPetroCancelWindow(player), 20);
            system.runTimeout(() => addPetroWaypoints(player), 30);
        } catch (e) { console.warn("[PetroEvent] enterPetroMap error: " + e); }
    }, 10);
}

export function exitPetroMap(player, toSupply = false) {
    player.removeTag("petro:in_map");
    player.setDynamicProperty("petro:mapId", undefined);
    petroProtected.delete(player.id);
    removePetroWaypoints(player);

    // Limpiar bote si existe
    if (playerBoats.has(player.id)) {
        const { boatId, timeoutId } = playerBoats.get(player.id);
        try { system.clearRun(timeoutId); } catch {}
        try {
            const dim = world.getDimension("minecraft:overworld");
            const entities = dim.getEntities({ type: BOAT_ENTITY });
            for (const e of entities) { if (e.id === boatId) { e.kill(); break; } }
        } catch {}
        playerBoats.delete(player.id);
    }

    const SUPPLY_POST = { x: 1600, y: 50, z: 1489 };
    if (toSupply) {
        player.runCommand("camera @s fade time 0.1 0.5 0.5");
        player.runCommand("playsound go.play @s");
        system.runTimeout(() => {
            try {
                player.teleport(SUPPLY_POST, { dimension: world.getDimension("minecraft:overworld") });
                player.sendMessage("§a✓ Regresaste al Puesto de Suministros.");
            } catch {}
        }, 5);
    }
}

// ─── FLUJO DEL EVENTO ─────────────────────────────────────────────────────────

export function forcePetroEvent() {
    _activatePetroEvent();
}

function _activatePetroEvent() {
    if (getEventState() !== "none") return;
    setActiveMap(PETRO_MAP.id);
    announceEventStart();
    system.runTimeout(() => { try { spawnBigDrop(); } catch (e) { console.warn("[PetroEvent] spawnBigDrop: " + e); } }, 20);
}

export function onPetroMatchEnded() {
    if (getEventState() !== "none") clearBigDrop();
    if (_ftInterval !== null) { system.clearRun(_ftInterval); _ftInterval = null; }
    setActiveMap(undefined);

    const dim = world.getDimension("minecraft:overworld");
    const SUPPLY = { x: 1600, y: 50, z: 1489 };

    try {
        for (const s of dim.getEntities({ type: SOLDIER_TYPE })) { try { s.kill(); } catch {} }
        for (const b of dim.getEntities({ type: BOAT_ENTITY })) { try { b.kill(); } catch {} }
    } catch {}
    playerBoats.clear();

    for (const p of world.getAllPlayers()) {
        if (!p.hasTag("petro:in_map")) continue;
        try {
            p.runCommand("playsound lose @s");
            p.runCommand("camera @s fade time 0.1 10 5");
            p.runCommand("clear @s");
            p.teleport(SUPPLY, { dimension: dim });
        } catch {}
        exitPetroMap(p, false);
    }
}

export function getPetroEventState()   { return getEventState(); }
export function getPetroDropUnlockAt() { return getDropUnlock(); }
export function getPetroDropClearAt()  { return getDropClear(); }

// ─── PROTECCIONES DEL MAPA (CONTENEDORES) ────────────────────────────────────

const PETRO_CONTAINER_BLOCKS = new Set([
    "minecraft:chest","minecraft:trapped_chest","minecraft:ender_chest",
    "minecraft:barrel","minecraft:furnace","minecraft:blast_furnace",
    "minecraft:smoker","minecraft:hopper","minecraft:dropper","minecraft:dispenser",
    "minecraft:shulker_box","minecraft:undyed_shulker_box",
    "minecraft:white_shulker_box","minecraft:orange_shulker_box",
    "minecraft:magenta_shulker_box","minecraft:light_blue_shulker_box",
    "minecraft:yellow_shulker_box","minecraft:lime_shulker_box",
    "minecraft:pink_shulker_box","minecraft:gray_shulker_box",
    "minecraft:light_gray_shulker_box","minecraft:cyan_shulker_box",
    "minecraft:purple_shulker_box","minecraft:blue_shulker_box",
    "minecraft:brown_shulker_box","minecraft:green_shulker_box",
    "minecraft:red_shulker_box","minecraft:black_shulker_box",
    "minecraft:brewing_stand","minecraft:anvil","minecraft:grindstone",
    "minecraft:enchanting_table","minecraft:crafting_table","minecraft:loom",
    "minecraft:cartography_table","minecraft:stonecutter","minecraft:smithing_table",
]);

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const player = ev.player;
    if (!player.hasTag("petro:in_map")) return;
    if (!PETRO_CONTAINER_BLOCKS.has(ev.block.typeId)) return;
    ev.cancel = true;
    player.sendMessage("§c⚠ No puedes usar contenedores dentro de La Petro.");
});

// Limpiar tag petro:in_map cuando el jugador muere dentro de La Petro
world.afterEvents.entityDie.subscribe(ev => {
    if (ev.deadEntity?.typeId !== "minecraft:player") return;
    const player = ev.deadEntity;
    if (!player.hasTag("petro:in_map")) return;

    // Mismos efectos que los mapas normales al morir
    try { player.runCommand("playsound lose @s"); } catch {}
    try { player.runCommand("playsound lose2 @s"); } catch {}
    try { player.runCommand("camera @s fade time 0.1 10 5"); } catch {}
    try { player.runCommand("clear @s"); } catch {}

    system.runTimeout(() => {
        try {
            player.onScreenDisplay.setTitle("§c§lCAÍSTE EN COMBATE", {
                subtitle: "§7La Petro te reclamó... esta vez.",
                fadeInDuration: 10, stayDuration: 80, fadeOutDuration: 20
            });
            player.teleport(
                { x: 1600, y: 50, z: 1489 },
                { dimension: world.getDimension("minecraft:overworld") }
            );
        } catch {}
    }, 5);

    exitPetroMap(player, false);
}, { entityTypes: ["minecraft:player"] });

export function checkPetroBoundaries(players = null) {
    const map = PETRO_MAP;
    const minX = Math.min(map.min.x, map.max.x);
    const maxX = Math.max(map.min.x, map.max.x);
    const minZ = Math.min(map.min.z, map.max.z);
    const maxZ = Math.max(map.min.z, map.max.z);
    const MARGIN = 2;
    const allPlayers = players ?? world.getAllPlayers();

    for (const player of allPlayers) {
        if (!player.hasTag("petro:in_map")) continue;
        const pos = player.location;
        if (pos.x >= minX && pos.x <= maxX && pos.z >= minZ && pos.z <= maxZ) continue;

        const safeX = Math.min(maxX - MARGIN, Math.max(minX + MARGIN, pos.x));
        const safeZ = Math.min(maxZ - MARGIN, Math.max(minZ + MARGIN, pos.z));
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const dx = centerX - safeX;
        const dz = centerZ - safeZ;
        const yaw = Math.atan2(-dx, dz) * (180 / Math.PI);

        try {
            player.teleport(
                { x: safeX, y: pos.y, z: safeZ },
                { dimension: world.getDimension("minecraft:overworld"), rotation: { x: 0, y: yaw } }
            );
            player.sendMessage("§c⚠ No puedes salir del área de La Petro.");
            player.runCommand("playsound note.bass @s ~ ~ ~ 1 0.5");
        } catch {}
    }
}

world.afterEvents.playerSpawn.subscribe(ev => {
    // mapWaypoints.js maneja la restauración de waypoints al spawnar
});

// ─── RECUPERACIÓN TRAS REINICIO ───────────────────────────────────────────────

system.runTimeout(() => {
    try {
        const state = getEventState();
        if (state === "active" || state === "drop_open") {
            setActiveMap(PETRO_MAP.id);
            const secsLeft = getDropUnlock() - nowSec();
            createDropFT(buildFTText(secsLeft, state === "drop_open"));
            startFTLoop();
            // mapWaypoints.js detecta gm:active_map y restaura waypoints automáticamente
        }
    } catch (e) { console.warn("[PetroEvent] Error en recuperación: " + e); }
}, 140);

// Límites del mapa: solo jugadores dentro de La Petro
system.runInterval(() => {
    try {
        const inPetro = world.getAllPlayers().filter(p => p.hasTag("petro:in_map"));
        if (inPetro.length) checkPetroBoundaries(inPetro);
    } catch (e) { console.warn("[PetroEvent] boundary check error: " + e); }
}, 40);

console.warn("[PetroEvent] v2 lite cargado");
