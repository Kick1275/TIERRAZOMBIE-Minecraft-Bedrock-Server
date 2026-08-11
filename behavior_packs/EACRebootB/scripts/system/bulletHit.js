import { world, system, EntityDamageCause } from "@minecraft/server";

const WEAPONS = {
    "type95": { damage: 6.5, maxDistance: 100, adsSpread: 0.01, hipSpread: 0.12, armorPen: 0.3, protPen: 0.2 },
    "qjb95":  { damage: 6.2, maxDistance: 120, adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.3, protPen: 0.2 },
    "qjb201": { damage: 6.2, maxDistance: 120, adsSpread: 0.01, hipSpread: 0.25, armorPen: 0.3, protPen: 0.2 },
    "ak12":   { damage: 6.2, maxDistance: 80,  adsSpread: 0.01, hipSpread: 0.18, armorPen: 0.4, protPen: 0.3 },
    "t112":   { damage: 6.0, maxDistance: 100, adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "arka":   { damage: 6.0, maxDistance: 100, adsSpread: 0.007,hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "hk416":  { damage: 6.0, maxDistance: 80,  adsSpread: 0.01, hipSpread: 0.19, armorPen: 0.4, protPen: 0.3 },
    "m16a4":  { damage: 6.0, maxDistance: 130, adsSpread: 0.006,hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "k2":     { damage: 6.1, maxDistance: 90,  adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "type89": { damage: 6.5, maxDistance: 90,  adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "qsz92":  { damage: 6.0, maxDistance: 20,  adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "qcq171": { damage: 4.6, maxDistance: 50,  adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "type88": { damage: 6.0, maxDistance: 100, adsSpread: 0.01, hipSpread: 0.2,  armorPen: 0.4, protPen: 0.3 },
    "type882": { damage: 5.5, maxDistance: 80, adsSpread: 0.015, hipSpread: 0.25,  armorPen: 0.4, protPen: 0.3 },
    "m7":     { damage: 8.0, maxDistance: 150, adsSpread: 0.01, hipSpread: 0.25, armorPen: 0.3, protPen: 0.2 },
    "m8":     { damage: 7.8, maxDistance: 75,  adsSpread: 0.012,hipSpread: 0.25, armorPen: 0.3, protPen: 0.2 },
    "qbz191": { damage: 6.2, maxDistance: 100, adsSpread: 0.01, hipSpread: 0.17, armorPen: 0.4, protPen: 0.3 },
    "qbu191": { damage: 8.0, maxDistance: 150, adsSpread: 0.003,hipSpread: 0.3,  armorPen: 0.4, protPen: 0.3 },
};

const ARMOR_VALS = {
    leather:   [1, 3, 2, 1, 0],
    iron:      [2, 6, 5, 2, 0],
    diamond:   [3, 8, 6, 3, 2],
    netherite: [3, 8, 6, 3, 3]
};


const DESTRUCTIBLE_BLOCKS = new Set([
    "minecraft:short_grass",
    "minecraft:grass",
    "minecraft:tall_grass",
    "minecraft:large_fern",
    "minecraft:peony",
    "minecraft:rose_bush",
    "minecraft:fern",
    "minecraft:glass",
    "minecraft:glass_pane",
    "minecraft:white_stained_glass",
    "minecraft:orange_stained_glass",
    "minecraft:magenta_stained_glass",
    "minecraft:light_blue_stained_glass",
    "minecraft:yellow_stained_glass",
    "minecraft:lime_stained_glass",
    "minecraft:pink_stained_glass",
    "minecraft:gray_stained_glass",
    "minecraft:light_gray_stained_glass",
    "minecraft:cyan_stained_glass",
    "minecraft:purple_stained_glass",
    "minecraft:blue_stained_glass",
    "minecraft:brown_stained_glass",
    "minecraft:green_stained_glass",
    "minecraft:red_stained_glass",
    "minecraft:black_stained_glass",
    "minecraft:white_stained_glass_pane",
    "minecraft:orange_stained_glass_pane",
    "minecraft:magenta_stained_glass_pane",
    "minecraft:light_blue_stained_glass_pane",
    "minecraft:yellow_stained_glass_pane",
    "minecraft:lime_stained_glass_pane",
    "minecraft:pink_stained_glass_pane",
    "minecraft:gray_stained_glass_pane",
    "minecraft:light_gray_stained_glass_pane",
    "minecraft:cyan_stained_glass_pane",
    "minecraft:purple_stained_glass_pane",
    "minecraft:blue_stained_glass_pane",
    "minecraft:brown_stained_glass_pane",
    "minecraft:green_stained_glass_pane",
    "minecraft:red_stained_glass_pane",
    "minecraft:black_stained_glass_pane",
]);

const PENETRABLE_BLOCKS = new Map([
    
    ["minecraft:oak_planks",       0.6],
    ["minecraft:spruce_planks",    0.6],
    ["minecraft:birch_planks",     0.6],
    ["minecraft:jungle_planks",    0.6],
    ["minecraft:acacia_planks",    0.6],
    ["minecraft:dark_oak_planks",  0.6],
    ["minecraft:crimson_planks",  0.5],
    ["minecraft:mangrove_planks",  0.6],
    ["minecraft:pale_oak_planks",  0.6],
    ["minecraft:warped_planks",  0.5],
    ["minecraft:oak_log",       0.6],
    ["minecraft:spruce_log",    0.6],
    ["minecraft:birch_log",     0.6],
    ["minecraft:jungle_log",    0.6],
    ["minecraft:acacia_log",    0.6],
    ["minecraft:dark_oak_log",  0.6],
    ["minecraft:mangrove_log",  0.6],
    ["minecraft:pale_oak_log",  0.6],
    ["minecraft:oak_fence",        0.5],
    ["minecraft:oak_door",         0.55],
    ["minecraft:oak_trapdoor",     0.55],
    ["minecraft:hay_block",        0.4],
    ["minecraft:short_grass",       0.8],
    ["minecraft:grass",       0.8],
    ["minecraft:tall_grass",       0.8],
    ["minecraft:large_fern",       0.8],
    ["minecraft:peony",       0.8],
    ["minecraft:rose_bush",       0.8],
    ["minecraft:fern",       0.8],
    ["minecraft:glass",       0.8],
    ["minecraft:glass_pane",       0.8],
    ["minecraft:white_stained_glass",       0.8],
    ["minecraft:orange_stained_glass",       0.8],
    ["minecraft:magenta_stained_glass",       0.8],
    ["minecraft:light_blue_stained_glass",       0.8],
    ["minecraft:yellow_stained_glass",       0.8],
    ["minecraft:lime_stained_glass",       0.8],
    ["minecraft:pink_stained_glass",       0.8],
    ["minecraft:gray_stained_glass",       0.8],
    ["minecraft:light_gray_stained_glass",       0.8],
    ["minecraft:cyan_stained_glass",       0.8],
    ["minecraft:purple_stained_glass",       0.8],
    ["minecraft:blue_stained_glass",       0.8],
    ["minecraft:brown_stained_glass",       0.8],
    ["minecraft:green_stained_glass",       0.8],
    ["minecraft:red_stained_glass",       0.8],
    ["minecraft:black_stained_glass",       0.8],
    ["minecraft:white_stained_glass_pane",       0.8],
    ["minecraft:orange_stained_glass_pane",       0.8],
    ["minecraft:magenta_stained_glass_pane",       0.8],
    ["minecraft:light_blue_stained_glass_pane",       0.8],
    ["minecraft:yellow_stained_glass_pane",       0.8],
    ["minecraft:lime_stained_glass_pane",       0.8],
    ["minecraft:pink_stained_glass_pane",       0.8],
    ["minecraft:gray_stained_glass_pane",       0.8],
    ["minecraft:light_gray_stained_glass_pane",       0.8],
    ["minecraft:cyan_stained_glass_pane",       0.8],
    ["minecraft:purple_stained_glass_pane",       0.8],
    ["minecraft:blue_stained_glass_pane",       0.8],
    ["minecraft:brown_stained_glass_pane",       0.8],
    ["minecraft:green_stained_glass_pane",       0.8],
    ["minecraft:red_stained_glass_pane",       0.8],
    ["minecraft:black_stained_glass_pane",       0.8],
    
    
]);

const MAX_PENETRATION_DEPTH = 2;


const DIMENSIONS = ["overworld", "nether", "the_end"];

function getArmorStats(entity) {
    let def = 0, tough = 0, prot = 0;
    const equip = entity.getComponent("minecraft:equippable");
    if (!equip) return { def, tough, prot };
    ["Head", "Chest", "Legs", "Feet"].forEach((s, i) => {
        const item = equip.getEquipmentSlot(s).getItem();
        if (!item) return;
        const type = Object.keys(ARMOR_VALS).find(k => item.typeId.includes(k));
        if (type) { def += ARMOR_VALS[type][i]; tough += ARMOR_VALS[type][4]; }
        const enchants = item.getComponent("minecraft:enchantments")?.enchantments;
        prot += enchants?.getEnchantment("protection")?.level || 0;
    });
    return { def, tough, prot };
}

function isADS(player) {
    return player.isSneaking;
}

function getShootVector(player, spread) {
    const rot = player.getRotation();
    const p = (rot.x * Math.PI) / 180;
    const y = ((rot.y + 90) * Math.PI) / 180;

    const base  = { x: Math.cos(y) * Math.cos(p), y: Math.sin(-p), z: Math.sin(y) * Math.cos(p) };
    const right = { x: Math.sin(y), y: 0, z: -Math.cos(y) };
    const up    = { x: -Math.sin(p) * Math.cos(y), y: Math.cos(p), z: -Math.sin(p) * Math.sin(y) };

    const angle     = Math.random() * 2 * Math.PI;
    const magnitude = Math.random() * spread;

    return {
        x: base.x + (right.x * Math.cos(angle) + up.x * Math.sin(angle)) * magnitude,
        y: base.y + (right.y * Math.cos(angle) + up.y * Math.sin(angle)) * magnitude,
        z: base.z + (right.z * Math.cos(angle) + up.z * Math.sin(angle)) * magnitude,
    };
}

function calcDamage(base, armorStats, armorPen, protPen) {
    const { def, tough, prot } = armorStats;
    const effDef  = def  * (1 - armorPen);
    const effTough = tough * (1 - armorPen);
    const effProt = prot * (1 - protPen);
    const defReduction  = Math.min(20, Math.max(effDef / 5, effDef - (4 * base) / (effTough + 8))) / 25;
    const protReduction = Math.min(0.8, 0.04 * effProt);
    return base * (1 - defReduction) * (1 - protReduction);
}

function getImpactLocation(blockHit, shootVector) {
    const b = blockHit.block;
    const len = Math.sqrt(shootVector.x ** 2 + shootVector.y ** 2 + shootVector.z ** 2);
    const nx = shootVector.x / len;
    const ny = shootVector.y / len;
    const nz = shootVector.z / len;
    return {
        x: b.x + 0.5 - nx * 0.5,
        y: b.y + 0.5 - ny * 0.5,
        z: b.z + 0.5 - nz * 0.5,
    };
}

function spawnBulletImpactEffects(player, location) {
    const dimension = player.dimension;
    dimension.spawnParticle("deltan:inwa_bullet_spark", location);
    dimension.spawnParticle("deltan:inwa_bullet_smoke", {
        x: location.x,
        y: location.y + 0.05,
        z: location.z,
    });
    dimension.playSound("impact", location, { volume: 0.7, pitch: 1.0 });
}



function tryDestroyBlock(blockHit, dimension) {
    const block = blockHit.block;
    const typeId = block.typeId;

    if (!DESTRUCTIBLE_BLOCKS.has(typeId)) return;

    
    const isDoubleBlock = typeId === "minecraft:tall_grass" || typeId === "minecraft:large_fern";

    if (isDoubleBlock) {
        
        const states = block.permutation.getAllStates();
        const isUpperHalf = states["minecraft:double_plant_type"] === "top" 
                         || states["half"] === "upper";

        if (isUpperHalf) {
            
            block.setType("minecraft:air");
            const below = dimension.getBlock({ x: block.x, y: block.y - 1, z: block.z });
            if (below && below.typeId === typeId) below.setType("minecraft:air");
        } else {
            
            block.setType("minecraft:air");
            const above = dimension.getBlock({ x: block.x, y: block.y + 1, z: block.z });
            if (above && above.typeId === typeId) above.setType("minecraft:air");
        }
    } else {
        block.setType("minecraft:air");
    }
}

function getExitPoint(blockHit, shootVector) {
    const b = blockHit.block;
    const len = Math.sqrt(shootVector.x ** 2 + shootVector.y ** 2 + shootVector.z ** 2);
    const nx = shootVector.x / len;
    const ny = shootVector.y / len;
    const nz = shootVector.z / len;
    
    return {
        x: b.x + 0.5 + nx * 0.55,
        y: b.y + 0.5 + ny * 0.55,
        z: b.z + 0.5 + nz * 0.55,
    };
}

function fireHitscan(player, weaponName, depth = 0, damageMult = 1.0, overrideOrigin = null, overrideVector = null) {
    const weapon = WEAPONS[weaponName];
    if (!weapon) {
        if (depth === 0) player.sendMessage(`§cUnknown weapon: "${weaponName}"`);
        return;
    }

    const { damage, maxDistance, adsSpread, hipSpread, armorPen, protPen } = weapon;
    const dimension = player.dimension;
    
    
    const headLoc   = overrideOrigin ?? player.getHeadLocation();
    const spread    = (overrideVector != null) ? 0 : (isADS(player) ? adsSpread : hipSpread);
    const shootVector = overrideVector ?? getShootVector(player, spread);

    
    const effectiveMaxDistance = maxDistance * (depth === 0 ? 1.0 : 0.8);

    const blockHit = dimension.getBlockFromRay(headLoc, shootVector, {
        maxDistance: effectiveMaxDistance,
        includeLiquidBlocks: false,
    });

    let blockDistance = effectiveMaxDistance;
    if (blockHit) {
        const b = blockHit.block;
        const dx = b.x - headLoc.x;
        const dy = b.y - headLoc.y;
        const dz = b.z - headLoc.z;
        blockDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const entityHits = dimension.getEntitiesFromRay(headLoc, shootVector, {
        maxDistance: effectiveMaxDistance,
        ignoreBlockCollision: true,
    });

    let hitEntity = false;

    for (const hit of entityHits) {
        if (hit.entity.id === player.id) continue;

        const eLoc = hit.entity.location;
        const dx = eLoc.x - headLoc.x;
        const dy = eLoc.y - headLoc.y;
        const dz = eLoc.z - headLoc.z;
        const entityDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (entityDistance > blockDistance) break;

        
        const baseDmg = damage * damageMult;
        const dmg = calcDamage(baseDmg, getArmorStats(hit.entity), armorPen, protPen);
        hit.entity.setDynamicProperty("eac:ticking_damage",
            (hit.entity.getDynamicProperty("eac:ticking_damage") ?? 0) + dmg
        );

        
        player.playSound("hitmark", { pitch: depth > 0 ? 0.75 : 1.0, volume: 0.8 });
        hitEntity = true;
        break;
    }

    if (!hitEntity && blockHit) {
    const typeId = blockHit.block.typeId;
    const penMult = PENETRABLE_BLOCKS.get(typeId);
    const isDestructible = DESTRUCTIBLE_BLOCKS.has(typeId);

    if (penMult !== undefined && depth < MAX_PENETRATION_DEPTH) {
        const impactLoc = getImpactLocation(blockHit, shootVector);
        spawnBulletImpactEffects(player, impactLoc);

        
        if (isDestructible) {
            tryDestroyBlock(blockHit, dimension);
        }

        const exitPoint = getExitPoint(blockHit, shootVector);
        const newDamageMult = damageMult * penMult;

        system.run(() => {
            fireHitscan(player, weaponName, depth + 1, newDamageMult, exitPoint, shootVector);
        });
    } else {
        
        tryDestroyBlock(blockHit, dimension);
        const impactLoc = getImpactLocation(blockHit, shootVector);
        spawnBulletImpactEffects(player, impactLoc);
    }
}
}


system.runInterval(() => {
    for (const dimId of DIMENSIONS) {
        for (const entity of world.getDimension(dimId).getEntities()) {
            const dmg = entity.getDynamicProperty("eac:ticking_damage");
            if (dmg > 0) {
                entity.applyDamage(dmg, { cause: EntityDamageCause.override });
                entity.setDynamicProperty("eac:ticking_damage", 0);
            }
        }
    }
}, 1);

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id !== "eac:hitscan_activate") return;

    const weaponName = e.message?.trim();
    if (!weaponName) {
        e.sourceEntity?.sendMessage("§cUsage: /scriptevent eac:hitscan_activate <weapon>");
        return;
    }

    const player = e.sourceEntity;
    if (!player) return;

    fireHitscan(player, weaponName);
});