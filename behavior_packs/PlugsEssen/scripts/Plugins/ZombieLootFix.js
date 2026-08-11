import { world, system, ItemStack, EntityDamageCause } from '@minecraft/server';

// ═══════════════════════════════════════════════════════════════════
//  ZOMBIE LOOT FIX v5
//  Solo da loot cuando la muerte fue causada directamente por un jugador
//  (ataque cuerpo a cuerpo o proyectil disparado por un jugador).
//  Sin esto, cualquier muerte de zombie (kill, caída, lava, otro mob...)
//  con un jugador cerca regalaba el loot igual.
// ═══════════════════════════════════════════════════════════════════

const LOOT_POOL = [
    { id: 'minecraft:rotten_flesh',     weight: 80, min: 0, max: 2 },
    { id: 'minecraft:gunpowder',        weight: 10, min: 1, max: 2 },
    { id: 'minecraft:bone',             weight: 50, min: 0, max: 2 },
    { id: 'minecraft:iron_nugget',      weight: 40, min: 0, max: 2 },
    { id: 'minecraft:gold_nugget',      weight: 30, min: 0, max: 2 },
    { id: 'minecraft:string',           weight: 30, min: 0, max: 2 },
    { id: 'minecraft:spider_eye',       weight: 20, min: 0, max: 1 },
    { id: 'minecraft:ender_pearl',      weight: 10, min: 0, max: 2 },
    { id: 'minecraft:iron_ingot',       weight: 10, min: 0, max: 2 },
    { id: 'minecraft:gold_ingot',       weight: 10, min: 0, max: 2 },
    { id: 'minecraft:blaze_rod',        weight: 5,  min: 0, max: 2 },
    { id: 'minecraft:magma_cream',      weight: 5,  min: 0, max: 2 },
];
const TOTAL_WEIGHT = LOOT_POOL.reduce((s, e) => s + e.weight, 0);

function rollLoot() {
    let roll = Math.random() * TOTAL_WEIGHT;
    for (const entry of LOOT_POOL) {
        roll -= entry.weight;
        if (roll <= 0) {
            const count = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
            return { id: entry.id, count };
        }
    }
    return LOOT_POOL[0];
}

/**
 * Determina quién es el jugador responsable real de la muerte, o null si
 * no fue un jugador quien la causó (kill, caída, fuego, otro mob, etc.).
 *
 * @param {import("@minecraft/server").EntityDieAfterEvent} ev
 * @returns {import("@minecraft/server").Player | null}
 */
function getResponsiblePlayer(ev) {
    const src = ev.damageSource;
    if (!src) return null;

    // Golpe directo de un jugador (espada, puño, etc.)
    if (src.cause === EntityDamageCause.entityAttack && src.damagingEntity?.typeId === 'minecraft:player') {
        return src.damagingEntity;
    }

    // Proyectil (flecha, bola de nieve encantada, etc.) — el disparador debe ser el jugador
    if (src.cause === EntityDamageCause.projectile) {
        const shooter = src.damagingEntity;
        if (shooter?.typeId === 'minecraft:player') return shooter;

        // Si el proyectil es una entidad con componente projectile y owner
        const projectileComp = shooter?.getComponent?.('minecraft:projectile');
        const owner = projectileComp?.owner;
        if (owner?.typeId === 'minecraft:player') return owner;
    }

    return null;
}

world.afterEvents.entityDie.subscribe(ev => {
    try {
        if (ev.deadEntity?.typeId !== 'minecraft:zombie') return;

        const killer = getResponsiblePlayer(ev);
        if (!killer) return; // no fue un jugador quien lo mató -> sin loot

        const loc = ev.deadEntity.location;
        const dim = ev.deadEntity.dimension;

        // Tirar 1-2 items
        const drops = [rollLoot()];
        if (Math.random() < 0.5) drops.push(rollLoot());

        for (const drop of drops) {
            if (!drop) continue;
            try {
                killer.getComponent('minecraft:inventory')
                    ?.container
                    ?.addItem(new ItemStack(drop.id, drop.count));
            } catch {
                try { dim.spawnItem(new ItemStack(drop.id, drop.count), loc); } catch {}
            }
        }
    } catch {}
});

