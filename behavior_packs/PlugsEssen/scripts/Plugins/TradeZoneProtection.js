import { world, system } from "@minecraft/server";

console.warn("[TradeZone] Sistema de protección iniciando...");

// ─── BOUNDS ───────────────────────────────────────────────────────────────────

const MIN_X = -1338, MAX_X = -985;
const MIN_Y =     0, MAX_Y =  150;
const MIN_Z =  -217, MAX_Z =   25;

function inZone(loc) {
    return loc.x >= MIN_X && loc.x <= MAX_X &&
           loc.y >= MIN_Y && loc.y <= MAX_Y &&
           loc.z >= MIN_Z && loc.z <= MAX_Z;
}

function isAdmin(player) { return player.hasTag("admin"); }

function deny(player, msg) {
    try { player.sendMessage(`§c⚠ ${msg}`); } catch {}
}

// ─── ITEMS COMPLETAMENTE BLOQUEADOS (uso) ─────────────────────────────────────
// Mecheros, explosivos, agua, lava, armas TACZ (krep:) detectadas por prefijo

function isBlockedItem(typeId) {
    if (!typeId) return false;
    // Armas de fuego TACZ
    if (typeId.startsWith("krep:")) return true;
    // Explosivos y mecheros
    const blocked = new Set([
        "mcpe:frag_grenade", "mcpe:pipe_bomb", "mcpe:c4_explosive",
        "mcpe:c4_detonator", "mcpe:landmine", "mcpe:smoke_grenade",
        "minecraft:tnt", "minecraft:flint_and_steel", "minecraft:fire_charge",
        "minecraft:water_bucket", "minecraft:lava_bucket",
        "minecraft:powder_snow_bucket",
    ]);
    return blocked.has(typeId);
}

// ─── 1. Bloquear romper bloques ───────────────────────────────────────────────

world.beforeEvents.playerBreakBlock.subscribe(ev => {
    try {
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.player.location)) return;
        ev.cancel = true;
        system.run(() => deny(ev.player, "No puedes romper bloques aquí."));
    } catch {}
});

// ─── 2. Bloquear colocar bloques ─────────────────────────────────────────────

world.beforeEvents.playerPlaceBlock.subscribe(ev => {
    try {
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.player.location)) return;
        ev.cancel = true;
        system.run(() => deny(ev.player, "No puedes colocar bloques aquí."));
    } catch {}
});

// ─── 3. Bloquear uso de items (agua, lava, mecheros, armas TACZ, explosivos) ──

world.beforeEvents.itemUse.subscribe(ev => {
    try {
        if (isAdmin(ev.source)) return;
        if (!inZone(ev.source.location)) return;
        if (!isBlockedItem(ev.itemStack?.typeId)) return;
        ev.cancel = true;
        system.run(() => deny(ev.source, "No puedes usar ese item aquí."));
    } catch {}
});

// playerInteractWithBlock cubre colocar agua/lava sobre un bloque
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    try {
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.player.location)) return;
        const inv = ev.player.getComponent("minecraft:inventory")?.container;
        const item = inv?.getItem(ev.player.selectedSlotIndex);
        if (!item || !isBlockedItem(item.typeId)) return;
        ev.cancel = true;
        system.run(() => deny(ev.player, "No puedes usar ese item aquí."));
    } catch {}
});

// Respaldo: limpiar fluidos que hayan escapado
const FLUID_BLOCKS = new Set([
    "minecraft:water", "minecraft:flowing_water",
    "minecraft:lava",  "minecraft:flowing_lava",
]);

system.runInterval(() => {
    try {
        const dim = world.getDimension("minecraft:overworld");
        // Barrer una cuadrícula dentro de la zona buscando fluidos
        for (let x = MIN_X; x <= MAX_X; x += 4) {
            for (let z = MIN_Z; z <= MAX_Z; z += 4) {
                for (let y = MIN_Y; y <= MAX_Y; y += 4) {
                    try {
                        const block = dim.getBlock({ x, y, z });
                        if (block && FLUID_BLOCKS.has(block.typeId)) {
                            block.setType("minecraft:air");
                        }
                    } catch {}
                }
            }
        }
    } catch {}
}, 20);

// ─── 4. Bloquear daño (PvP y cualquier daño) ─────────────────────────────────

world.beforeEvents.entityHurt.subscribe(ev => {
    try {
        if (!inZone(ev.hurtEntity.location)) return;
        // Admins pueden recibir daño
        if (ev.hurtEntity.typeId === "minecraft:player" && isAdmin(ev.hurtEntity)) return;
        ev.cancel = true;
    } catch {}
});

// ─── 5. Bloquear explosiones ──────────────────────────────────────────────────

world.beforeEvents.explosion.subscribe(ev => {
    try {
        if (inZone(ev.center)) ev.cancel = true;
    } catch {}
});

// ─── 6. Eliminar proyectiles explosivos ───────────────────────────────────────

const EXPLOSIVE_PROJ = new Set([
    "bullet:rpg", "mcpe:frag_grenade", "mcpe:pipe_bomb", "mcpe:c4_explosive",
]);

system.runInterval(() => {
    try {
        const dim = world.getDimension("minecraft:overworld");
        for (const e of dim.getEntities({ families: ["projectile"] })) {
            try {
                if (EXPLOSIVE_PROJ.has(e.typeId) && inZone(e.location)) e.remove?.();
            } catch {}
        }
    } catch {}
}, 5);

// ─── 7. Eliminar mobs hostiles (family monster) ───────────────────────────────

system.runInterval(() => {
    try {
        const dim = world.getDimension("minecraft:overworld");
        for (const e of dim.getEntities({ families: ["monster"] })) {
            try {
                if (inZone(e.location)) e.kill();
            } catch {}
        }
    } catch {}
}, 40);

// ─── ZONA DE CONTENCIÓN (Spawn inicial) ──────────────────────────────────────

const CONTAIN_MIN_X = -1244, CONTAIN_MAX_X = -1079;
const CONTAIN_MIN_Y =    60, CONTAIN_MAX_Y =   120;
const CONTAIN_MIN_Z =  -122, CONTAIN_MAX_Z =   -54;

function inContainZone(loc) {
    return loc.x >= CONTAIN_MIN_X && loc.x <= CONTAIN_MAX_X &&
           loc.y >= CONTAIN_MIN_Y && loc.y <= CONTAIN_MAX_Y &&
           loc.z >= CONTAIN_MIN_Z && loc.z <= CONTAIN_MAX_Z;
}

const CONTAIN_CENTER = { x: -1161, y: 87, z: -88 };
const allowedToLeave = new Set();

export function allowLeaveContainZone(playerId) {
    allowedToLeave.add(playerId);
    system.runTimeout(() => allowedToLeave.delete(playerId), 100);
}

system.runInterval(() => {
    try {
        for (const player of world.getAllPlayers()) {
            try {
                if (isAdmin(player)) continue;
                if (allowedToLeave.has(player.id)) continue;
                if (!player.hasTag("tz:in_spawn")) continue;
                if (!inContainZone(player.location)) {
                    player.teleport(CONTAIN_CENTER, {
                        dimension: world.getDimension("minecraft:overworld")
                    });
                    player.sendMessage("§c⚠ Debes usar el §eNPC Guardia §cpara salir del área de inicio.");
                }
            } catch {}
        }
    } catch {}
}, 10);

system.runInterval(() => {
    try {
        for (const player of world.getAllPlayers()) {
            try {
                if (inContainZone(player.location)) {
                    if (!player.hasTag("tz:in_spawn")) player.addTag("tz:in_spawn");
                } else {
                    if (player.hasTag("tz:in_spawn")) player.removeTag("tz:in_spawn");
                }
            } catch {}
        }
    } catch {}
}, 20);

console.warn("[TradeZone] Protección activa");
