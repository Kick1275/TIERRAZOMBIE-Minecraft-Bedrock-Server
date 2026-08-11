import { Entity, world, InvalidEntityError, EntityRideableComponent, EntitySpawnAfterEvent } from "@minecraft/server"
import { GeneralUtils } from "../utils.js"

/**
 * @param {EntitySpawnAfterEvent} event - The event to use
 */
export function turretHandleEntitySpawn(event) {
    try {
        const entity = event.entity;
        if (entity.getProperty("af:has_turret")) {
            const spawned = entity.dimension.spawnEntity(`${entity.typeId}_turret`, entity.location);
            if (spawned) {
                entity.setDynamicProperty("af:vehicle.turret_id", spawned.id)
                spawned.setDynamicProperty("af:turret.vehicle_id", entity.id)
            }
        }
    } catch (err) {
        if (!(err instanceof InvalidEntityError)) throw err;
    }
}

/**
 * @param {Entity} turretedEntity - The entity to use for the tick
 * @param {EntityRideableComponent} rideableComponent - The rideablle component to control the turret
 */
export function turretEntityTick(turretedEntity, rideableComponent) {
    const turret_id = turretedEntity.getDynamicProperty("af:vehicle.turret_id");
    if (!turret_id) return;

    const turret = world.getEntity(turret_id);
    if (!turret) return;

    const offsetX = (turretedEntity.getProperty("af:turret.offset-x") ?? 0) / 10
    const offsetY = (turretedEntity.getProperty("af:turret.offset-y") ?? 0) / 10
    const offsetZ = (turretedEntity.getProperty("af:turret.offset-z") ?? 0) / 10
    const endDeadzonePitchMax = turretedEntity.getProperty("af:turret.elevation") ?? 20
    const endDeadzonePitchMin = turretedEntity.getProperty("af:turret.depression") ?? 15
    const endDeadzoneYaw = turretedEntity.getProperty("af:turret.end-deadzone-yaw") ?? -1
    const turretSpeedDPS = turretedEntity.getProperty("af:turret.speed") ?? 90;
    const turretDrag = GeneralUtils.math.toDeg(turretedEntity.getDynamicProperty("af:vehicle.turret-drag")) ?? 0;

    const riders = rideableComponent.getRiders();

    let turretController;

    if (turretedEntity.hasTag("second_gunner") && riders.length > 1) {
        turretController = riders[1];
    } else {
        turretController = riders[rideableComponent.controllingSeat];
    }
    //above controls if the second rider becomes the gunner

    var targetRot = turretController ? turretController.getRotation() : undefined

    if (targetRot) {
        if (turretController) {
            if (!turretController.hasTag("scopeview")) {
                targetRot.x -= 20
            }
        }
        if (endDeadzonePitchMin >= 0 && endDeadzonePitchMax >= 0) {
            targetRot.x = GeneralUtils.math.clamp(targetRot.x, -endDeadzonePitchMax, endDeadzonePitchMin);
        }
        if (endDeadzoneYaw >= 0) {
            targetRot.y = GeneralUtils.math.clamp(targetRot.y, -endDeadzoneYaw, endDeadzoneYaw);
        }
    }

    var rotation = GeneralUtils.world.rotateByEasedRotation(turret, targetRot, { x: turretSpeedDPS, y: turretSpeedDPS }, { x: 0, y: turretDrag });

    const entityRot = turretedEntity.getRotation();
    const entityPos = turretedEntity.location;

    const yawRad = GeneralUtils.math.toRad(entityRot.y);
    const pitchRad = GeneralUtils.math.toRad(entityRot.x);

    const yawCos = Math.cos(yawRad), yawSin = Math.sin(yawRad);
    const pitchCos = Math.cos(pitchRad), pitchSin = Math.sin(pitchRad);

    turret.teleport(
        {
            x: entityPos.x + offsetX * yawCos - offsetZ * yawSin,
            y: entityPos.y + offsetY * pitchCos,
            z: entityPos.z + offsetX * yawSin + offsetZ * yawCos
        }
    );

    turret.setRotation(rotation);

    turretedEntity.setDynamicProperty("turret-pitch", rotation.x);
    turretedEntity.setDynamicProperty("turret-yaw", rotation.y);
}