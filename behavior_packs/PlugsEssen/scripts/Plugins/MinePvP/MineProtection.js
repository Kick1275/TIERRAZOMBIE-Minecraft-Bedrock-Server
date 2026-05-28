import { world, system } from "@minecraft/server";
import {
    MINE_BOUNDS, SAFE_ZONE, BLOCKED_ITEMS, BLOCKED_BLOCKS,
    BLOCKED_MOB_TYPES, inMineBounds, inSafeZone, inBounds
} from "./MineConfig.js";

// ─── Jugadores con protección temporal (invulnerables) ────────────────────────
const protectedPlayers = new Set(); // player.id

export function addProtection(playerId) {
    protectedPlayers.add(playerId);
}

export function removeProtection(playerId) {
    protectedPlayers.delete(playerId);
}

export function hasProtection(playerId) {
    return protectedPlayers.has(playerId);
}

// ─── Inicializar todos los sistemas de protección ────────────────────────────
export function initializeProtection() {

    // 1. Bloquear uso de items explosivos dentro de la mina
    world.beforeEvents.itemUse.subscribe((event) => {
        const player = event.source;
        if (!player || !inMineBounds(player.location)) return;
        const item = event.itemStack;
        if (!item) return;
        if (BLOCKED_ITEMS.has(item.typeId)) {
            event.cancel = true;
            system.run(() => {
                try {
                    player.sendMessage("§c[MinePvP] §fNo puedes usar ese item dentro de la mina.");
                } catch (_) {}
            });
        }
    });

    // 2. Bloquear colocación de bloques explosivos
    world.beforeEvents.playerPlaceBlock.subscribe((event) => {
        const player = event.player;
        if (!player || !inMineBounds(player.location)) return;
        const block = event.block;
        if (BLOCKED_BLOCKS.has(block.typeId)) {
            event.cancel = true;
            system.run(() => {
                try {
                    player.sendMessage("§c[MinePvP] §fNo puedes colocar ese bloque aquí.");
                } catch (_) {}
            });
        }
    });

    // 3. Bloquear spawn de mobs vanilla en la mina
    world.beforeEvents.entitySpawn?.subscribe?.((event) => {
        const entity = event.entity;
        if (!entity) return;
        if (!BLOCKED_MOB_TYPES.has(entity.typeId)) return;
        try {
            if (inMineBounds(entity.location)) {
                event.cancel = true;
            }
        } catch (_) {}
    });

    // 4. Zona segura: bloquear daño entre jugadores
    world.beforeEvents.entityHurt?.subscribe?.((event) => {
        const entity = event.hurtEntity;
        if (!entity) return;
        try {
            // Protección temporal post-spawn
            if (entity.typeId === "minecraft:player" && hasProtection(entity.id)) {
                event.cancel = true;
                return;
            }
            // Zona segura
            if (inSafeZone(entity.location)) {
                event.cancel = true;
            }
        } catch (_) {}
    });

    // 5. Bloquear ataques cuerpo a cuerpo en zona segura
    world.beforeEvents.entityHitEntity?.subscribe?.((event) => {
        const attacker = event.damagingEntity;
        const target = event.hitEntity;
        if (!attacker || !target) return;
        try {
            if (inSafeZone(attacker.location) || inSafeZone(target.location)) {
                event.cancel = true;
            }
        } catch (_) {}
    });

    // 6. Bloquear proyectiles del RPG (TACZBE) en la mina
    world.beforeEvents.projectileHitEntity?.subscribe?.((event) => {
        const projectile = event.projectile;
        if (!projectile) return;
        try {
            if (projectile.typeId === "bullet:rpg" && inMineBounds(event.location)) {
                event.cancel = true;
                try { projectile.remove?.(); } catch (_) {}
            }
        } catch (_) {}
    });

    // 7. Bloquear explosiones dentro de la mina
    world.beforeEvents.explosion?.subscribe?.((event) => {
        try {
            if (inMineBounds(event.center)) {
                event.cancel = true;
            }
        } catch (_) {}
    });

    // 8. Bloquear uso de items a jugadores con protección temporal
    world.beforeEvents.itemUse.subscribe((event) => {
        const player = event.source;
        if (!player) return;
        if (hasProtection(player.id)) {
            event.cancel = true;
        }
    });

    // 9. Eliminar entidades explosivas que entren a la mina (RPG rockets, granadas)
    // system.runInterval(() => {
    //     try {
    //         const dim = world.getDimension("overworld");
    //         const explosives = dim.getEntities({
    //             families: ["projectile"],
    //         });
    //         for (const e of explosives) {
    //             try {
    //                 if (!inMineBounds(e.location)) continue;
    //                 const id = e.typeId;
    //                 if (id === "bullet:rpg" || id === "mcpe:frag_grenade" ||
    //                     id === "mcpe:pipe_bomb" || id === "mcpe:c4_explosive") {
    //                     e.remove?.();
    //                 }
    //             } catch (_) {}
    //         }
    //     } catch (_) {}
    // }, 10);
}
