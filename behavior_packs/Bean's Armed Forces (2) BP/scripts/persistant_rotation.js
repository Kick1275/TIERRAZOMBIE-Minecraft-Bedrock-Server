import { Entity } from "@minecraft/server";

/**
 * @param {Entity} entity - The entity to use for the tick
 */
export function persistantEntityRotationTick(entity) {
    if (!entity.hasTag("persistantRotation")) return;

    const entityRotation = entity.getRotation();

    if (entity.hasTag("adjustable")) {
        entity.setDynamicProperty("persistantPitch", entityRotation.x)
        entity.setDynamicProperty("persistantYaw", entityRotation.y)
    } else {
        if (entity.getDynamicProperty("persistantPitch") == undefined || entity.getDynamicProperty("persistantYaw") == undefined) return;

        entity.teleport(entity.location, {
            keepVelocity: true,
            rotation: {
                x: entity.getDynamicProperty("persistantPitch"),
                y: entity.getDynamicProperty("persistantYaw")
            }
        })
    }
}