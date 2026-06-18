import * as mc from "@minecraft/server";
import { EquipmentSlot } from "@minecraft/server";

const ENTITY_CAN_HEADSHOT = [
    "minecraft:player",
    "minecraft:zombie",
    "minecraft:zombie_villager",
    "minecraft:skeleton",
    "minecraft:bogged",
    "minecraft:creeper",
    "minecraft:villager",
    "minecraft:pillager",
    "minecraft:drowned",
    "minecraft:husk",
    "minecraft:piglin",
    "minecraft:piglin_brute",
    "minecraft:wandering_trader",
    "minecraft:wither_skeleton",
    "minecraft:vindicator",
    "minecraft:zombie_pigman",
    "minecraft:evocation_illager",
    "mcpe:civilian_male",
    "mcpe:civilian_female",
    "mcpe:commander_artic",
    "mcpe:commander_desert",
    "mcpe:commander_woodland",
    "mcpe:hazmat_female",
    "mcpe:hazmat_male",
    "mcpe:military_artic_female",
    "mcpe:military_artic_male",
    "mcpe:military_desert_female",
    "mcpe:military_desert_male",
    "mcpe:military_woodland_female",
    "mcpe:military_woodland_male",
    "mcpe:militia_female",
    "mcpe:militia_male",
    "mcpe:screamer",
    "mcpe:brute",
    "mcpe:riot",
    "mcpe:scavenger",
    "mcpe:marauder",
    "mcpe:civilian",
    "mcpe:military",
    "mcpe:militia",
    "mcpe:hazmat",
    "mcpe:commander"
];

const ARMOR_PROTECTION = {
	"minecraft:netherite_chestplate": 0.9,
    "mcpe:assault_vest_black": 0.6,
    "mcpe:assault_vest_olive": 0.6,
    "mcpe:tactical_vest_white": 0.8,
    "mcpe:tactical_vest_black": 0.8,
    "mcpe:tactical_vest_olive": 0.8,
    "mcpe:tactical_vest_tan": 0.8,
    "mcpe:plate_vest_black": 0.7,
    "mcpe:plate_vest_white": 0.7,
    "mcpe:plate_vest_olive": 0.7,
    "mcpe:plate_vest_tan": 0.7,
    "mcpe:webbing_black": 0.2,
    "mcpe:webbing_white": 0.2,
    "mcpe:webbing_olive": 0.2,
    "mcpe:webbing_tan": 0.2,
    "mcpe:reflective_vest_yellow": 0.2,
    "mcpe:reflective_vest_green": 0.2,
    "mcpe:reflective_vest_orange": 0.2,
    "mcpe:biker_vest": 0.2,
    "mcpe:biker_skull_vest": 0.2,
    "mcpe:hunting_vest_brown": 0.2,
    "mcpe:chest_rig_black": 0.3,
    "mcpe:chest_rig_white": 0.3,
    "mcpe:chest_rig_olive": 0.3,
    "mcpe:chest_rig_tan": 0.3,
    "mcpe:stab_vest_grey": 0.5,
    "mcpe:stab_vest_white": 0.5,
    "mcpe:stab_vest_tan": 0.5,
    "mcpe:combat_vest_white": 0.8,
    "mcpe:combat_vest_olive": 0.8,
    "mcpe:combat_vest_tan": 0.8,
    "mcpe:press_vest": 0.5,
    "mcpe:police_vest": 0.6,
    // Helmet
    "minecraft:golden_helmet": 0.2,
    "mcpe:assult_helmet_olive": 0.9,
    "mcpe:assult_helmet_black": 0.9,
    "mcpe:tactical_helmet_olive": 0.7,
    "mcpe:tactical_helmet_black": 0.7,
    "mcpe:tactical_helmet_white": 0.7,
    "mcpe:tactical_helmet_tan": 0.7,
    "mcpe:ballistic_helmet_black": 0.8,
    "mcpe:ballistic_helmet_olive": 0.8,
    "mcpe:ballistic_helmet_white": 0.8,
    "mcpe:ballistic_helmet_tan": 0.8,
    "mcpe:biker_helmet_blue": 0.4,
    "mcpe:biker_helmet_white": 0.4,
    "mcpe:biker_helmet_red": 0.4,
    "mcpe:biker_helmet_yellow": 0.4,
    "mcpe:biker_helmet_black": 0.4,
    "mcpe:great_helm": 0.6,
    "mcpe:untar_helmet": 0.7,
    "mcpe:hard_helm_red": 0.3,
    "mcpe:hard_helm_yellow": 0.3,
    "mcpe:hard_helm_white": 0.3,
    "mcpe:hard_helm_orange": 0.3,
    "mcpe:mask_troll": 0.2,
    "mcpe:mask_smile": 0.2,
    "mcpe:mask_anonymous": 0.2,
    "mcpe:welder_mask": 0.3,
    "mcpe:firefighter_helm": 0.4,
    "mcpe:spec_helmet": 0.8,
    "mcpe:riot_helmet": 0.7,
    "mcpe:tac_gasmask": 0.4,
    "mcpe:gasmask_white": 0.3,
    "mcpe:gasmask_black": 0.3,
    "mcpe:respirator": 0.2,
    "mcpe:army_helmet_woodland": 0.7,
    "mcpe:army_helmet_snow": 0.7,
    "mcpe:army_helmet_sand": 0.7
};

const BULLET_TYPE = {
    "bullet:ak47": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:ak74": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:aks74u": { "damage": 10, "headshotMultiplier": 2.2 },
    "bullet:anaconda": { "damage": 10, "headshotMultiplier": 3 },
    "bullet:asval": { "damage": 10, "headshotMultiplier": 2.7 },
    "bullet:famas": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:m4a1": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:m16a1": { "damage": 9, "headshotMultiplier": 2.8 },
    "bullet:m16a2": { "damage": 9, "headshotMultiplier": 2.8 },
    "bullet:m1014": { "damage": 12, "knockback": true, "headshotMultiplier": 2 },
    "bullet:m1894c": { "damage": 12, "knockback": false, "headshotMultiplier": 2 },
    "bullet:mp5": { "damage": 10, "headshotMultiplier": 2.3 },
    "bullet:rpk": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:ss1": { "damage": 12, "headshotMultiplier": 2.8 },
    "bullet:l2a3": { "damage": 10, "headshotMultiplier": 2.3 },
    "bullet:ump45": { "damage": 9, "headshotMultiplier": 2.1 },
    "bullet:izh43": { "damage": 13, "knockback": true, "headshotMultiplier": 4 },
    "bullet:m870": { "damage": 13, "knockback": true, "headshotMultiplier": 4 },
    "bullet:m1897": { "damage": 13, "knockback": true, "headshotMultiplier": 4 },
    "bullet:m1911": { "damage": 7, "headshotMultiplier": 2 },
    "bullet:makarov": { "damage": 8, "headshotMultiplier": 2 },
    "bullet:glock17": { "damage": 8, "headshotMultiplier": 2 },
    "bullet:python": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:vz65": { "damage": 8, "headshotMultiplier": 2 },
    "bullet:l96a1": { "damage": 17, "headshotMultiplier": 3 },
    "bullet:cz527": { "damage": 15, "headshotMultiplier": 3 },
    "bullet:fal": { "damage": 10, "headshotMultiplier": 2.8 },
    "bullet:garand": { "damage": 15, "headshotMultiplier": 3 },
    "bullet:m14": { "damage": 13, "headshotMultiplier": 2.7 },
    "bullet:mosin": { "damage": 15, "headshotMultiplier": 3 },
    "bullet:sks": { "damage": 14, "headshotMultiplier": 2.8 },
    "bullet:svd": { "damage": 15, "headshotMultiplier": 3.2 }
};


const blockTags = {
    "dirt": {
        tags: ["dirt", "sand", "grass", "gravel", "snow", "plant", "crop", "fertilize_area"],
        impact_sound: "impact.dirt"
    },
    "metal": {
        tags: ["metal", "rail", "mob_spawner"],
        impact_sound: "impact.metal",
        impact_bounce: "impact.bounce"
    },
    "stone": {
        tags: ["stone", "cobblestone", "brick"],
        impact_sound: "impact.stone",
        impact_bounce: "impact.bounce"
    },
    "wood": {
        tags: ["wood", "pumpkin", "text_sign"],
        impact_sound: "impact.wood",
        impact_bounce: "impact.bounce"
    }
};

function getImpactSoundForBlock(block) {
    for (const [key, date] of Object.entries(blockTags)) {
        for (const tag of date.tags) {
            if (block.hasTag(tag)) {
                return date.impact_sound;
            }
        }
    }
    return null;
}

mc.world.afterEvents.projectileHitBlock.subscribe(async (event) => {
    const blockHitInfo = event.getBlockHit();
    if (!blockHitInfo) return;

    const block = blockHitInfo.block;
    const blockLocation = block.location;
    const dimension = mc.world.getDimension(block.dimension.id);

    // ตรวจสอบว่าบล็อกที่โดนเป็นระเบิดหรือไม่
    if (block.typeId === "mcpe:barrel_explosive") {
        const command = `execute positioned ${blockLocation.x} ${blockLocation.y} ${blockLocation.z} run function explode`;
        try {
            await dimension.runCommandAsync(command);
        } catch (error) {
            console.error(`Failed to run command: ${error}`);
        }
    }

    // เล่นเสียงผลกระทบตามบล็อกที่โดน
    const impactSound = getImpactSoundForBlock(block);
    if (impactSound) {
        const command = `playsound ${impactSound} @a ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`;
        try {
            await dimension.runCommandAsync(command);
        } catch (error) {
            console.error(`Failed to run command: ${error}`);
        }
    }

    try {
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x} ${blockLocation.y - 0.1} ${blockLocation.z} air if block ${blockLocation.x + 0.1} ${blockLocation.y} ${blockLocation.z} air run particle mcpe:bullet_hole1 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z + 0.01} air if block ${blockLocation.x} ${blockLocation.y - 0.01} ${blockLocation.z} air run particle mcpe:bullet_hole2 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x + 0.01} ${blockLocation.y} ${blockLocation.z} air if block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z - 0.01} air unless block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z + 0.1} air run particle mcpe:bullet_hole3 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z - 0.01} air if block ${blockLocation.x + 0.01} ${blockLocation.y} ${blockLocation.z} air run particle mcpe:bullet_hole4 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x - 0.01} ${blockLocation.y} ${blockLocation.z} air if block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z + 0.01} air run particle mcpe:bullet_hole5 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);
        await dimension.runCommandAsync(`execute at @s unless block ${blockLocation.x} ${blockLocation.y} ${blockLocation.z + 0.01} air if block ${blockLocation.x - 0.01} ${blockLocation.y} ${blockLocation.z} air run particle mcpe:bullet_hole6 ${blockLocation.x} ${blockLocation.y} ${blockLocation.z}`);

        await dimension.runCommandAsync(`playsound impact.bounce @a[r=15] ${blockLocation.x} ${blockLocation.y} ${blockLocation.z} 10 1 0.01`);
        
        await dimension.runCommandAsync(`particle mcpe:smoke ${blockLocation.x} ${blockLocation.y + 0.5} ${blockLocation.z}`);
    } catch (error) {
        console.error(`Failed to run particle commands: ${error}`);
    }

    //console.log(`Projectile hit block at location: x=${blockLocation.x}, y=${blockLocation.y}, z=${blockLocation.z}`);
});


mc.world.afterEvents.projectileHitEntity.subscribe(async (event) => {
    const source = event.source;
    const projectile = event.projectile;

    if (!projectile || !BULLET_TYPE[projectile.typeId]) return;

    // Si esta bala también existe en el sistema TACZBE, dejar que ese sistema la maneje
    const taczbeId = projectile.typeId.replace("bullet:", "");
    if (globalThis.Indoarsenal?.bullets?.[taczbeId]) return;

    const bullet = BULLET_TYPE[projectile.typeId];
    const entityHit = event.getEntityHit();

    if (!entityHit) return;

    const entity = entityHit.entity;
    if (!entity) return;

    const hitVector = event.hitVector;
    const location = event.location;
    
    let hitPart = "Body";
    let damageMultiplier = 1;
    let shouldBrokenLeg = false;

    if (ENTITY_CAN_HEADSHOT.includes(entity.typeId)) {
        if (location.y > entity.location.y + 1.5) {
            hitPart = "Head";
            damageMultiplier *= bullet.headshotMultiplier || 4;
            const command = `playsound headshot.sound @a ${location.x} ${location.y} ${location.z}`;
            try {
                await mc.world.getDimension(entity.dimension.id).runCommandAsync(command);
            } catch (error) {
                console.error(`Failed to run headshot sound command: ${error}`);
            }
        } else if (location.y < entity.location.y + 0.5) {
            hitPart = "Leg";
            damageMultiplier *= 0.25;
            shouldBrokenLeg = true;
        }
    }
    
    const equipmentInventory = entity.getComponent(mc.EntityEquippableComponent.componentId);
    if (equipmentInventory) {
        const chestArmor = equipmentInventory.getEquipment(mc.EquipmentSlot.Chest)?.typeId;
        const headArmor = equipmentInventory.getEquipment(mc.EquipmentSlot.Head)?.typeId;

        if (chestArmor && ARMOR_PROTECTION[chestArmor]) {
            mc.world.getDimension(entity.dimension.id).runCommandAsync(`playsound impact.metal @a ${location.x} ${location.y} ${location.z}`);
            damageMultiplier -= ARMOR_PROTECTION[chestArmor];
        }

        if (headArmor && ARMOR_PROTECTION[headArmor] && hitPart === "Head") {
            mc.world.getDimension(entity.dimension.id).runCommandAsync(`playsound impact.metal @a ${location.x} ${location.y} ${location.z}`);
            damageMultiplier -= ARMOR_PROTECTION[headArmor];
        }
    }

    let calculatedDamage = bullet.damage * damageMultiplier;

    if (source.isSneaking) {
        calculatedDamage *= 1.64;
    }

    const damageApplied = entity.applyDamage(calculatedDamage, {
        cause: mc.EntityDamageCause.entityAttack,
        damagingEntity: source
    });
    
    let savedEntity = entity;

    if (damageApplied) {
        const health = entity.getComponent(mc.EntityHealthComponent.componentId)?.currentValue;

        if (health === 0 && savedEntity instanceof mc.Player && source instanceof mc.Player) {
            if (hitPart === "Head") {
            	source.runCommand(`tellraw @a {"rawtext":[{"text":"${savedEntity.nameTag}"},{"translate":"death.message.bullet.headshot"},{"text":"${source.nameTag}"}]}`);
            } else if (hitPart === "Body" || hitPart === "Leg") {
            	source.runCommand(`tellraw @a {"rawtext":[{"text":"${savedEntity.nameTag}"},{"translate":"death.message.bullet"},{"text":"${source.nameTag}"}]}`);
            }
        }

        const knockbackStrength = bullet.knockback ? 0.5 : 0;
        entity.applyKnockback(hitVector.x, hitVector.z, knockbackStrength, knockbackStrength);

        if (shouldBrokenLeg) {
            const chanceToCrawl = Math.random();
            if (chanceToCrawl < 0.5) {
                entity.runCommandAsync('event entity @s[type=player] shot_at_broken_bones');
            }
        }
    }
});
