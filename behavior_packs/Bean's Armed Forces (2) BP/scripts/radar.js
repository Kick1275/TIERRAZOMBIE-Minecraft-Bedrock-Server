import { Entity, world, system } from "@minecraft/server"
import { GeneralUtils } from "utils.js"

/**
 * @param {Entity} radarEntity
 */
export function radarEntityTick(radarEntity) {
    if (radarEntity.hasTag("radar_off")) return;

    let coneAngle = radarEntity.getProperty("af:radar-angle");
    let range = radarEntity.getProperty("af:radar-range");

    if (!range || !coneAngle) return;

    const radarPos = radarEntity.location
    const forwardVector = GeneralUtils.math.vectors.getForwardVector(radarEntity.getRotation())

    const entities = radarEntity.dimension.getEntities()

    for (const entity of entities) {
        if (entity.id === radarEntity.id) continue

        const family = entity.getComponent("type_family")

        if (!family) continue;

        if (entity.typeId == "minecraft:item" || !family.hasTypeFamily("vehicle")) continue

        const dx = entity.location.x - radarPos.x;
        const dy = entity.location.y - radarPos.y;
        const dz = entity.location.z - radarPos.z;

        const dist = Math.hypot(dx, dy, dz);
        if (dist === 0) continue;

        const toTarget = {
            x: dx / dist,
            y: dy / dist,
            z: dz / dist
        };

        const dot = forwardVector.x * toTarget.x + forwardVector.y * toTarget.y + forwardVector.z * toTarget.z;
        const angleDeg = Math.acos(Math.min(Math.max(dot, -1), 1)) * (180 / Math.PI);

        if (family.hasTypeFamily("stealth")) {
            const stealthModifier = (entity.getProperty("af:stealth-detect-modifier") ?? 25) / 100;

            const modifiedAngle = coneAngle / 2 * stealthModifier;
            const modifiedRange = range * stealthModifier;

            if (angleDeg <= modifiedAngle && dist < modifiedRange) {
                if (!entity.hasTag("on_radar")) {
                    entity.addTag("on_radar")
                }
            }
        } else {
            if (angleDeg <= coneAngle / 2 && dist < range) {
                if (!entity.hasTag("on_radar")) {
                    entity.addTag("on_radar")
                }
            }
        }
    }
}

/**
 * @param {Entity} entities
 */
export function clearEntityRadars(entities) {
    for (const entity of entities) {
        try {
            entity.removeTag("on_radar");
        } catch { }
    }
}