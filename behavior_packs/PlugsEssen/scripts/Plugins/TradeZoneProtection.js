import { world, system } from "@minecraft/server";

console.warn("[TradeZone] Sistema de protección iniciando...");

// ─── BOUNDS ───────────────────────────────────────────────────────────────────

const MIN_X = 1589, MAX_X = 1662;
const MIN_Y =   45, MAX_Y =  200;
const MIN_Z = 1439, MAX_Z = 1526;

function inZone(loc) {
    return loc.x >= MIN_X && loc.x <= MAX_X &&
           loc.y >= MIN_Y && loc.y <= MAX_Y &&
           loc.z >= MIN_Z && loc.z <= MAX_Z;
}

function isAdmin(p) { return p.hasTag("admin"); }
function deny(p, msg) { try { p.sendMessage(`§c⚠ ${msg}`); } catch {} }

// ─── ITEMS BLOQUEADOS ─────────────────────────────────────────────────────────
// Armas TACZ (prefijo krep:), explosivos DeadZone y vanilla peligrosos

const BLOCKED_ITEMS = new Set([
    // Explosivos / incendiarios DeadZone
    "mcpe:frag_grenade", "mcpe:pipe_bomb", "mcpe:c4_explosive",
    "mcpe:c4_detonator", "mcpe:landmine", "mcpe:smoke_grenade",
    // Vanilla peligrosos
    "minecraft:tnt", "minecraft:flint_and_steel", "minecraft:fire_charge",
    // Cubetas — manejadas también por el fill de seguridad abajo
    "minecraft:water_bucket", "minecraft:lava_bucket",
    "minecraft:powder_snow_bucket",
]);

// Prefijos de armas TACZ (krep:) y otras que quieras agregar
const BLOCKED_PREFIXES = ["krep:"];

function isBlockedItem(typeId) {
    if (!typeId) return false;
    for (const prefix of BLOCKED_PREFIXES) {
        if (typeId.startsWith(prefix)) return true;
    }
    return BLOCKED_ITEMS.has(typeId);
}

// ─── 1 & 2. Romper / colocar bloques ─────────────────────────────────────────

world.beforeEvents.playerBreakBlock.subscribe(ev => {
    try {
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.block.location)) return;
        ev.cancel = true;
        system.run(() => deny(ev.player, "No puedes romper bloques aquí."));
    } catch {}
});

world.beforeEvents.playerPlaceBlock.subscribe(ev => {
    try {
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.block.location)) return;
        ev.cancel = true;
        system.run(() => deny(ev.player, "No puedes colocar bloques aquí."));
    } catch {}
});

// ─── 3. Bloquear uso de items peligrosos + fill de seguridad para fluidos ─────

world.beforeEvents.itemUse.subscribe(ev => {
    try {
        const typeId = ev.itemStack?.typeId;
        if (!isBlockedItem(typeId)) return;
        if (isAdmin(ev.source)) return;
        if (!inZone(ev.source.location)) return;
        ev.cancel = true;

        // Fill de seguridad solo para cubetas de fluido
        if (typeId === "minecraft:water_bucket" || typeId === "minecraft:lava_bucket") {
            const loc = ev.source.location;
            const x = Math.floor(loc.x), y = Math.floor(loc.y), z = Math.floor(loc.z);
            system.run(() => {
                try {
                    world.getDimension("minecraft:overworld").runCommand(
                        `fill ${x-5} ${y-5} ${z-5} ${x+5} ${y+5} ${z+5} air replace water`
                    );
                    world.getDimension("minecraft:overworld").runCommand(
                        `fill ${x-5} ${y-5} ${z-5} ${x+5} ${y+5} ${z+5} air replace lava`
                    );
                } catch {}
            });
        }

        system.run(() => deny(ev.source, "No puedes usar ese item aquí."));
    } catch {}
});

// También bloquear interactWithBlock con cubeta (colocar fluido sobre bloque)
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    try {
        const inv  = ev.player.getComponent("minecraft:inventory")?.container;
        const item = inv?.getItem(ev.player.selectedSlotIndex);
        if (!item || !isBlockedItem(item.typeId)) return;
        if (isAdmin(ev.player)) return;
        if (!inZone(ev.player.location)) return;
        ev.cancel = true;

        if (item.typeId === "minecraft:water_bucket" || item.typeId === "minecraft:lava_bucket") {
            const loc = ev.player.location;
            const x = Math.floor(loc.x), y = Math.floor(loc.y), z = Math.floor(loc.z);
            system.run(() => {
                try {
                    world.getDimension("minecraft:overworld").runCommand(
                        `fill ${x-5} ${y-5} ${z-5} ${x+5} ${y+5} ${z+5} air replace water`
                    );
                    world.getDimension("minecraft:overworld").runCommand(
                        `fill ${x-5} ${y-5} ${z-5} ${x+5} ${y+5} ${z+5} air replace lava`
                    );
                } catch {}
            });
        }

        system.run(() => deny(ev.player, "No puedes usar ese item aquí."));
    } catch {}
});

// ─── 4. Bloquear daño / PvP ───────────────────────────────────────────────────

world.beforeEvents.entityHurt.subscribe(ev => {
    try {
        if (!inZone(ev.hurtEntity.location)) return;
        if (ev.hurtEntity.typeId === "minecraft:player" && isAdmin(ev.hurtEntity)) return;
        ev.cancel = true;
    } catch {}
});

// ─── 5. Bloquear explosiones ──────────────────────────────────────────────────

world.beforeEvents.explosion.subscribe(ev => {
    try { if (inZone(ev.center)) ev.cancel = true; } catch {}
});

// ─── 6. Expulsar mobs hostiles de la zona ─────────────────────────────────────
// runCommand fill/kill acotado por volumen — sin getEntities global.
// Cada 5 segundos (100 ticks). El fill-kill es procesado en el game thread,
// no en el script thread, así que no bloquea.

system.runInterval(() => {
    try {
        world.getDimension("minecraft:overworld").runCommand(
            `execute as @e[type=!player,family=monster,x=${MIN_X},y=${MIN_Y},z=${MIN_Z},dx=${MAX_X-MIN_X},dy=${MAX_Y-MIN_Y},dz=${MAX_Z-MIN_Z}] run tp @s 9999999 90 9999999`
        );
    } catch {}
}, 200);

// allowLeaveContainZone se mantiene como no-op por compatibilidad con GameModeSystem
export function allowLeaveContainZone(playerId) {}

console.warn("[TradeZone] Protección activa");
