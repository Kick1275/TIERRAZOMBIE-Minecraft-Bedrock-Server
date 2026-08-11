import { EntitySpawnAfterEvent, EntityDieAfterEvent, world, Entity, InvalidEntityError } from "@minecraft/server"
import { GeneralUtils } from "../utils.js";

/**
 * @param {EntitySpawnAfterEvent} spawnEvent
 */
export function colliderSpawner(spawnEvent) {
    try {
        const entity = spawnEvent.entity;
        if (entity.typeId.includes("_collider")) return;
        const dimension = entity.dimension;

        let i = 1;
        while (true) {
            try {
                const colliderEntity = dimension.spawnEntity(entity.typeId + "_collider" + i, entity.location);
                if (!colliderEntity?.isValid) break;
                colliderEntity.setDynamicProperty("collider", entity.id);
            } catch {
                break;
            }
            i++;
        }
    } catch (err) {
        if (!(err instanceof InvalidEntityError)) throw err;
    }
}

/**
 * @param {EntityDieAfterEvent} deathEvent
 */
export function colliderDeath(deathEvent) {
    try {
        if (!deathEvent.deadEntity.typeId.includes("_collider")) {
            deathEvent.deadEntity.dimension.getEntities().forEach(e => {
                if (e.getDynamicProperty("collider") == deathEvent.deadEntity.id) {
                    e.kill()
                }
            })
        }
    } catch (err) {
        if (!(err instanceof InvalidEntityError)) throw err;
    }
}

/**
 * @param {Entity} colliderEntity
 */
export function colliderEntityTick(colliderEntity) {
    const collider = colliderEntity.getDynamicProperty("collider");
    if (!collider) return;

    const offsetX = (colliderEntity.getProperty("af:collider.offset-x") ?? 0) / 10;
    const offsetY = (colliderEntity.getProperty("af:collider.offset-y") ?? 0) / 10;
    const offsetZ = (colliderEntity.getProperty("af:collider.offset-z") ?? 0) / 10;

    const entity = world.getEntity(collider);
    if (!entity) return;

    const entityRot = entity.getRotation();
    const entityPos = entity.location;

    const yawRad = GeneralUtils.math.toRad(entityRot.y);

    colliderEntity.teleport(
        {
            x: entityPos.x + ((offsetX * Math.cos(yawRad)) - (offsetZ * Math.sin(yawRad))),
            y: entityPos.y + offsetY,
            z: entityPos.z + ((offsetX * Math.sin(yawRad)) + (offsetZ * Math.cos(yawRad)))
        },
        { rotation: entityRot }
    );

    colliderEntity.applyImpulse(entity.getVelocity());
    colliderEntity.setRotation(entityRot);
}