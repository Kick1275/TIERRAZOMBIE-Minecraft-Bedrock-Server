import { world } from "@minecraft/server";

const STORAGE_KEY = "minepvp:config";

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
    enabled: true,

    // Timers
    woodRefillSeconds: 600,
    mineRegenSeconds:  3600,

    // Zona de la mina completa (detección de jugadores, protección, evacuación)
    mineBoundsMinX: -1523, mineBoundsMinY: -60, mineBoundsMinZ: 3070,
    mineBoundsMaxX: -1369, mineBoundsMaxY:  63, mineBoundsMaxZ: 3259,

    // Zona de generación (fill + minerales + cuevas)
    genMinX: -1514, genMinY: -60, genMinZ: 3079,
    genMaxX: -1378, genMaxY:  62, genMaxZ: 3154,

    // Zona segura
    safeMinX: -1522, safeMinY: 63, safeMinZ: 3238,
    safeMaxX: -1370, safeMaxY: 103, safeMaxZ: 3258,

    // Línea de salida (cruzar hacia Z < exitLineZ desde zona segura)
    exitLineZ:    3238,
    exitLineMinX: -1522,
    exitLineMaxX: -1370,

    // TP al entrar a la mina (área random)
    spawnAreaMinX: -1523, spawnAreaMinZ: 3071,
    spawnAreaMaxX: -1370, spawnAreaMaxZ: 3237,
    spawnAreaY:    102,

    // TP de regreso a zona segura
    safeSpawnX: -1443, safeSpawnY: 63, safeSpawnZ: 3250,

    // Floating text de la mina
    mineFTX: -1449.22, mineFTY: 66.30, mineFTZ: 3155.69,

    // Generación: minerales (multiplicador de cantidad de venas, 1.0 = normal)
    oreMultiplier: 1.0,
    // Generación: cuevas
    tunnelCount:  20,
    chamberCount: 12,
};

// ─── Getters dinámicos (leen de la config guardada) ───────────────────────────

export function getMineConfig() {
    try {
        const raw = world.getDynamicProperty(STORAGE_KEY);
        if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch (_) {}
    return { ...DEFAULT_CONFIG };
}

export function setMineConfig(cfg) {
    try {
        world.setDynamicProperty(STORAGE_KEY, JSON.stringify(cfg));
    } catch (_) {}
}

// Helpers para obtener bounds dinámicos desde la config
export function getMineBounds()    { const c = getMineConfig(); return { minX: c.mineBoundsMinX, minY: c.mineBoundsMinY, minZ: c.mineBoundsMinZ, maxX: c.mineBoundsMaxX, maxY: c.mineBoundsMaxY, maxZ: c.mineBoundsMaxZ }; }
export function getMineGenBounds() { const c = getMineConfig(); return { minX: c.genMinX, minY: c.genMinY, minZ: c.genMinZ, maxX: c.genMaxX, maxY: c.genMaxY, maxZ: c.genMaxZ }; }
export function getSafeZone()      { const c = getMineConfig(); return { minX: c.safeMinX, minY: c.safeMinY, minZ: c.safeMinZ, maxX: c.safeMaxX, maxY: c.safeMaxY, maxZ: c.safeMaxZ }; }
export function getSafeSpawn()     { const c = getMineConfig(); return { x: c.safeSpawnX, y: c.safeSpawnY, z: c.safeSpawnZ }; }
export function getSpawnArea()     { const c = getMineConfig(); return { minX: c.spawnAreaMinX, minZ: c.spawnAreaMinZ, maxX: c.spawnAreaMaxX, maxZ: c.spawnAreaMaxZ, y: c.spawnAreaY }; }
export function getMineFTLocation(){ const c = getMineConfig(); return { x: c.mineFTX, y: c.mineFTY, z: c.mineFTZ }; }
export function getExitLine()      { const c = getMineConfig(); return { z: c.exitLineZ, minX: c.exitLineMinX, maxX: c.exitLineMaxX }; }

// ─── Constantes estáticas (no cambian en runtime, solo para compatibilidad) ───
// Estas se usan en archivos que aún referencian las constantes viejas.
// Los archivos que necesiten valores dinámicos deben usar los getters de arriba.
export const WOOD_ZONES = [
    { name: "jungle",   block: "minecraft:jungle_log",   minX: -1491, minY: 63, minZ: 3161, maxX: -1472, maxY: 78, maxZ: 3168 },
    { name: "mangrove", block: "minecraft:mangrove_log", minX: -1478, minY: 63, minZ: 3174, maxX: -1471, maxY: 78, maxZ: 3193 },
    { name: "oak",      block: "minecraft:oak_log",      minX: -1478, minY: 63, minZ: 3198, maxX: -1471, maxY: 78, maxZ: 3217 },
    { name: "pale_oak", block: "minecraft:pale_oak_log", minX: -1492, minY: 63, minZ: 3198, maxX: -1485, maxY: 78, maxZ: 3217 },
    { name: "cherry",   block: "minecraft:cherry_log",   minX: -1505, minY: 63, minZ: 3174, maxX: -1498, maxY: 78, maxZ: 3193 },
    { name: "warped",   block: "minecraft:warped_stem",  minX: -1505, minY: 63, minZ: 3198, maxX: -1498, maxY: 78, maxZ: 3217 },
    { name: "crimson",  block: "minecraft:crimson_stem", minX: -1519, minY: 63, minZ: 3198, maxX: -1512, maxY: 78, maxZ: 3217 },
    { name: "acacia",   block: "minecraft:acacia_log",   minX: -1519, minY: 63, minZ: 3174, maxX: -1512, maxY: 78, maxZ: 3193 },
    { name: "dark_oak", block: "minecraft:dark_oak_log", minX: -1518, minY: 63, minZ: 3161, maxX: -1499, maxY: 78, maxZ: 3168 },
    { name: "spruce",   block: "minecraft:spruce_log",   minX: -1485, minY: 63, minZ: 3174, maxX: -1471, maxY: 78, maxZ: 3193 },
];

export const WOOD_REFILL_TICKS = 10 * 60 * 20;
export const MINE_REGEN_TICKS  = 60 * 60 * 20;

// Compatibilidad con imports existentes (valores estáticos iniciales)
export const MINE_BOUNDS     = DEFAULT_CONFIG; // no usado directamente, usar getMineBounds()
export const MINE_GEN_BOUNDS = DEFAULT_CONFIG; // no usado directamente, usar getMineGenBounds()
export const SAFE_ZONE       = DEFAULT_CONFIG; // no usado directamente, usar getSafeZone()
export const SAFE_SPAWN      = { x: DEFAULT_CONFIG.safeSpawnX, y: DEFAULT_CONFIG.safeSpawnY, z: DEFAULT_CONFIG.safeSpawnZ };
export const SPAWN_AREA      = { minX: DEFAULT_CONFIG.spawnAreaMinX, minZ: DEFAULT_CONFIG.spawnAreaMinZ, maxX: DEFAULT_CONFIG.spawnAreaMaxX, maxZ: DEFAULT_CONFIG.spawnAreaMaxZ, y: DEFAULT_CONFIG.spawnAreaY };
export const EXIT_LINE_Z     = DEFAULT_CONFIG.exitLineZ;
export const EXIT_LINE_MIN_X = DEFAULT_CONFIG.exitLineMinX;
export const EXIT_LINE_MAX_X = DEFAULT_CONFIG.exitLineMaxX;
export const MINE_FT_LOCATION = { x: DEFAULT_CONFIG.mineFTX, y: DEFAULT_CONFIG.mineFTY, z: DEFAULT_CONFIG.mineFTZ };

// ─── Bloques/mobs bloqueados (estáticos) ──────────────────────────────────────
export const BLOCKED_ITEMS = new Set([
    "krep:rpg",
    "mcpe:frag_grenade", "mcpe:pipe_bomb", "mcpe:c4_explosive",
    "mcpe:c4_detonator", "mcpe:landmine", "mcpe:smoke_grenade",
    "minecraft:tnt", "minecraft:end_crystal", "minecraft:respawn_anchor",
    "minecraft:flint_and_steel", "minecraft:fire_charge", "minecraft:ender_pearl",
]);

export const BLOCKED_BLOCKS = new Set([
    "minecraft:tnt", "minecraft:end_crystal", "minecraft:respawn_anchor",
]);

export const BLOCKED_MOB_TYPES = new Set([
    "minecraft:zombie", "minecraft:skeleton", "minecraft:creeper",
    "minecraft:spider", "minecraft:cave_spider", "minecraft:enderman",
    "minecraft:witch", "minecraft:slime", "minecraft:phantom",
    "minecraft:drowned", "minecraft:husk", "minecraft:stray",
    "minecraft:pillager", "minecraft:vindicator", "minecraft:ravager",
    "minecraft:blaze", "minecraft:ghast", "minecraft:magma_cube",
    "minecraft:wither_skeleton", "minecraft:piglin", "minecraft:hoglin",
    "minecraft:zoglin", "minecraft:piglin_brute", "minecraft:bogged",
    "minecraft:breeze",
]);

// ─── Helpers de geometría ─────────────────────────────────────────────────────
export function inBounds(loc, bounds) {
    return loc.x >= Math.min(bounds.minX, bounds.maxX) &&
           loc.x <= Math.max(bounds.minX, bounds.maxX) &&
           loc.y >= Math.min(bounds.minY, bounds.maxY) &&
           loc.y <= Math.max(bounds.minY, bounds.maxY) &&
           loc.z >= Math.min(bounds.minZ, bounds.maxZ) &&
           loc.z <= Math.max(bounds.minZ, bounds.maxZ);
}

export function inSafeZone(loc)    { return inBounds(loc, getSafeZone()); }
export function inMineBounds(loc)  { return inBounds(loc, getMineBounds()); }

export function centerOf(zone) {
    return {
        x: Math.floor((zone.minX + zone.maxX) / 2),
        y: Math.floor((zone.minY + zone.maxY) / 2),
        z: Math.floor((zone.minZ + zone.maxZ) / 2),
    };
}
