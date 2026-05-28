import { world, Player, GameMode, EquipmentSlot, system } from "@minecraft/server";
import { armorProtection, deadzonVestProtection, deadzonHelmetProtection, deadzonTopProtection, deadzonBottomProtection } from "./armorDetection.js";

const processedProjectiles = new Set();

// Devuelve { vestReduction, helmetReduction, topReduction, bottomReduction } como valores 0.0-1.0
function getReductions(entity) {
    let vestReduction = 0;
    let helmetReduction = 0;
    let topReduction = 0;
    let bottomReduction = 0;

    if (entity instanceof Player) {
        const equip = entity.getComponent("equippable");
        if (!equip) return { vestReduction, helmetReduction, topReduction, bottomReduction };

        // Chaleco (chest) — o ropa si no hay chaleco
        const chestItem = equip.getEquipment(EquipmentSlot.Chest);
        if (chestItem) {
            const id = chestItem.typeId;
            if (deadzonVestProtection[id] !== undefined) {
                vestReduction = deadzonVestProtection[id];
            } else if (deadzonTopProtection[id] !== undefined) {
                topReduction = deadzonTopProtection[id];
            } else {
                const mat = _vanillaMat(id);
                if (mat) vestReduction = armorProtection[mat]["chestplate"] || 0;
            }
        }

        // Casco (head) — o cosmético
        const headItem = equip.getEquipment(EquipmentSlot.Head);
        if (headItem) {
            const id = headItem.typeId;
            if (deadzonHelmetProtection[id] !== undefined) {
                helmetReduction = deadzonHelmetProtection[id];
            } else {
                const mat = _vanillaMat(id);
                if (mat) helmetReduction = armorProtection[mat]["helmet"] || 0;
            }
        }

        // Pantalón (legs) — suma al body
        const legsItem = equip.getEquipment(EquipmentSlot.Legs);
        if (legsItem) {
            const id = legsItem.typeId;
            if (deadzonBottomProtection[id] !== undefined) {
                bottomReduction = deadzonBottomProtection[id];
            } else {
                const mat = _vanillaMat(id);
                if (mat) bottomReduction = armorProtection[mat]["leggings"] || 0;
            }
        }
    } else {
        const vestTags = ["leather_chestplate","chainmail_chestplate","iron_chestplate","diamond_chestplate","netherite_chestplate","golden_chestplate"];
        const helmTags = ["leather_helmet","chainmail_helmet","iron_helmet","diamond_helmet","netherite_helmet","golden_helmet"];
        for (const tag of vestTags) {
            if (entity.hasTag(tag)) {
                const mat = tag.split("_")[0];
                vestReduction = armorProtection[mat] ? (armorProtection[mat]["chestplate"] || 0) : 0;
                break;
            }
        }
        for (const tag of helmTags) {
            if (entity.hasTag(tag)) {
                const mat = tag.split("_")[0];
                helmetReduction = armorProtection[mat] ? (armorProtection[mat]["helmet"] || 0) : 0;
                break;
            }
        }
    }

    return { vestReduction, helmetReduction, topReduction, bottomReduction };
}

function _vanillaMat(typeId) {
    const id = typeId.replace("minecraft:", "").toLowerCase();
    if (id.includes("netherite")) return "netherite";
    if (id.includes("diamond"))   return "diamond";
    if (id.includes("iron"))      return "iron";
    if (id.includes("chainmail")) return "chainmail";
    if (id.includes("golden"))    return "golden";
    if (id.includes("leather"))   return "leather";
    return null;
}

// pen 0.9 → penFactor 0.55 (armadura aplica 55%)
// pen 0.7 → penFactor 0.65 (armadura aplica 65%)
// pen 0.3 → penFactor 0.85 (armadura aplica 85%)
function applyReduction(damage, reduction, penetration) {
    const penFactor = 1 - (penetration * 0.45);
    return Math.max(1, damage * (1 - reduction * penFactor));
}

world.afterEvents.projectileHitEntity.subscribe(function(event) {
    const projectile = event.projectile;
    const source = event.source;
    const location = event.location;
    const hitInfo = event.getEntityHit();
    const target = hitInfo ? hitInfo.entity : null;

    if (!target) return;
    if (target.matches && target.matches({ gameMode: GameMode.creative })) return;
    if (target.hasTag("spectator")) return;
    if (!(source instanceof Player)) return;

    // Deduplicar por posición de impacto
    const projKey = projectile.typeId + "_" + location.x.toFixed(1) + "_" + location.y.toFixed(1) + "_" + location.z.toFixed(1);
    if (processedProjectiles.has(projKey)) return;
    processedProjectiles.add(projKey);
    system.runTimeout(function() { processedProjectiles.delete(projKey); }, 5);

    const healthComp = target.getComponent("minecraft:health");
    if (!healthComp) return;

    const bulletId = projectile.typeId.replace("bullet:", "");
    const bulletData = (Indoarsenal && Indoarsenal.bullets) ? Indoarsenal.bullets[bulletId] : null;
    if (!bulletData) return;

    const penetration = bulletData.penetration !== undefined ? bulletData.penetration : 0.3;
    const isHeadshot = location.y > target.location.y + 1.5;

    const { vestReduction, helmetReduction, topReduction, bottomReduction } = getReductions(target);

    // DEBUG temporal
    if (target instanceof Player) {
        console.warn("[ARMOR] vest=" + vestReduction + " top=" + topReduction + " bottom=" + bottomReduction + " helmet=" + helmetReduction + " hs=" + isHeadshot);
    }

    let finalDamage;
    if (isHeadshot) {
        // Headshot: daño x2, reducido por casco/cosmético
        finalDamage = applyReduction(bulletData.damage * 2, helmetReduction, penetration);
        source.runCommand("playsound headshot_sound @s");
    } else {
        // Body shot: chaleco + top + bottom suman todos
        const totalBodyReduction = Math.min(0.90, vestReduction + topReduction + bottomReduction);
        finalDamage = applyReduction(bulletData.damage, totalBodyReduction, penetration);
        source.runCommand("playsound hitmark @s");
    }

    healthComp.setCurrentValue(Math.max(0, healthComp.currentValue - finalDamage));

    if (healthComp.currentValue <= 0) {
        source.addTag("murderer");
        source.addTag("murderEntityTime:" + system.currentTick);
        manageMurderTagRemoval();
    }
});

let murderTagCheckInterval = null;

function manageMurderTagRemoval() {
    const playersWithTag = world.getAllPlayers().filter(function(p) { return p.hasTag("murderer"); });
    if (playersWithTag.length === 0) return;
    if (!murderTagCheckInterval) {
        murderTagCheckInterval = system.runInterval(function() {
            const tagged = world.getAllPlayers().filter(function(p) { return p.hasTag("murderer"); });
            if (tagged.length === 0) {
                system.clearRun(murderTagCheckInterval);
                murderTagCheckInterval = null;
                return;
            }
            for (const player of tagged) {
                const timeTag = player.getTags().find(function(t) { return t.startsWith("murderEntityTime:"); });
                if (!timeTag) {
                    player.addTag("murderEntityTime:" + system.currentTick);
                } else {
                    const tick = parseInt(timeTag.split(":")[1]);
                    if (system.currentTick - tick >= 2) {
                        player.removeTag("murderer");
                        player.removeTag(timeTag);
                    }
                }
            }
        }, 2);
    }
}

world.afterEvents.worldInitialize.subscribe(function() {
    system.runTimeout(function() { manageMurderTagRemoval(); }, 2);
});
