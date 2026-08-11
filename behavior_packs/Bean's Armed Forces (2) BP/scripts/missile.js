import { world, system } from "@minecraft/server";
/** @typedef {{ x: number, y: number, z: number }} Vector3 */
import { GeneralUtils } from "utils.js"

const missileIds = {
    "af:guided_missile": "af:GM_detonated"
}

/**
 * @param {import("@minecraft/server").Entity} entity
 */
function explode_missile(entity) {
    // Congelar de inmediato para que no siga penetrando bloques
    // mientras el componente minecraft:explode termina de detonar.
    try {
        entity.clearVelocity();
        entity.setDynamicProperty("af:missile.exploded", true);
    } catch { }

    entity.triggerEvent("minecraft:explode")

    /*entity.dimension.createExplosion(entity.location, 10, {
        breaksBlocks: true,
        source: entity,
        allowUnderwater: true,
        causesFire: true
    })*/

    try {
        const turretId = entity.getDynamicProperty("af:missile.turret-id");
        if (turretId) {
            const turret = world.getEntity(turretId);
            if (turret) {
                for (const [id, event] of Object.entries(missileIds)) {
                    if (entity.typeId === id) {
                        turret.triggerEvent(event);
                    }
                }
            }
        }
    } catch { }

    // Matar con un pequeño retraso, dando tiempo al fuse del componente
    // minecraft:explode (y al queue_command) para completar la explosión
    // antes de eliminar la entidad.
    system.runTimeout(() => {
        try {
            if (entity?.isValid()) entity.kill();
        } catch { }
    }, 4);
}

/**
 * @param {import("@minecraft/server").DataDrivenEntityTriggerAfterEvent} event
 */
export function missileEventTrigger(event) {
    switch (event.eventId) {
        case "af:GM_fired": {
            const turret = event.entity;
            const vehicleId = turret.getDynamicProperty("af:turret.vehicle_id");
            let rideableComponent;
            if (vehicleId) {
                const vehicle = world.getEntity(vehicleId);
                if (!vehicle) break;

                rideableComponent = vehicle.getComponent("rideable")
            } else {
                rideableComponent = turret.getComponent("rideable")
            }
            if (!rideableComponent) break;
            const playerRider = GeneralUtils.world.getPlayerFromEntity(rideableComponent.getRiders()[rideableComponent.controllingSeat])
            if (!playerRider) break;

            const missileSpawnDist = turret.getProperty("af:turret.missile-spawn-dist") ?? 4;
            const spawnHeight = turret.getProperty("af:turret.missile-spawn-height") ?? 3.5;

            const turretRotation = turret.getRotation();
            const forwardVector = GeneralUtils.math.vectors.getForwardVector(turretRotation);
            const spawnLocation = GeneralUtils.math.vectors.vectorAdd(
                { x: turret.location.x, y: turret.location.y + spawnHeight, z: turret.location.z },
                forwardVector,
                missileSpawnDist
            );

            const missile = turret.dimension.spawnEntity("af:guided_missile", spawnLocation)
            missile.setRotation(turretRotation)
            missile.setDynamicProperty("af:missile.turret-id", turret.id)
            missile.setDynamicProperty("af:player.controller", playerRider.id)

            break;
        }
    }
}

/**
 * @param {import("@minecraft/server").Entity} missileEntity
 * @param {Vector3} targetLocation
 * @param {number} turnRate - degrees per second
 */
export function steerMissileToTarget(missileEntity, targetLocation, turnRate) {
    if (!missileEntity || !targetLocation) return missileEntity.location

    const d = {
        x: targetLocation.x - missileEntity.location.x,
        y: targetLocation.y - missileEntity.location.y,
        z: targetLocation.z - missileEntity.location.z
    }

    const targetRot = {
        x: -GeneralUtils.math.toDeg(Math.atan2(d.y, Math.hypot(d.x, d.z))),
        y: GeneralUtils.math.toDeg(Math.atan2(-d.x, d.z))
    }

    const easedRot = GeneralUtils.world.rotateByEasedRotation(
        missileEntity,
        targetRot,
        { x: turnRate, y: turnRate }
    )

    const forward = GeneralUtils.math.vectors.getForwardVector(easedRot)
    return [GeneralUtils.math.vectors.vectorAdd(
        missileEntity.location,
        forward,
        100
    ), easedRot]
}

/**
 * @param {import("@minecraft/server").Entity} missileEntity
 * @param {{x: number, y: number}} targetRot
 * @param {number} turnRate - degrees per second
 */
function steerMissileToRotation(missileEntity, targetRot, turnRate) {
    if (!missileEntity || !targetRot) return missileEntity?.getRotation();

    return GeneralUtils.world.rotateByEasedRotation(
        missileEntity,
        targetRot,
        { x: turnRate, y: turnRate }
    );
}

/**
 * @param {import("@minecraft/server").Entity[]} entities
 * @param {import("@minecraft/server").Entity} missileEntity
 * @param {number} missileTurnRate
 */
function homingMissile(entities, missileEntity, missileTurnRate) {
    let missileConeAngle = missileEntity.getProperty("af:radar-angle") ?? 40;

    const missilePos = missileEntity.location
    const missileRotation = missileEntity.getRotation();
    const forwardVector = GeneralUtils.math.vectors.getForwardVector(missileRotation)

    let bestTarget = null
    let bestAngle = Infinity

    for (const entity of entities) {
        if (entity.id === missileEntity.id) continue;

        const dx = entity.location.x - missilePos.x;
        const dy = entity.location.y - missilePos.y;
        const dz = entity.location.z - missilePos.z;

        const dist = Math.hypot(dx, dy, dz);
        if (dist === 0) continue;

        const toTarget = {
            x: dx / dist,
            y: dy / dist,
            z: dz / dist
        };

        const dot = forwardVector.x * toTarget.x + forwardVector.y * toTarget.y + forwardVector.z * toTarget.z;
        const angleDeg = Math.acos(Math.min(Math.max(dot, -1), 1)) * (180 / Math.PI);

        if (angleDeg > missileConeAngle / 2) continue;

        if (angleDeg < bestAngle) {
            /**world.sendMessage("target: " + entity.typeId + ", " + dist)**/
            bestAngle = angleDeg;
            bestTarget = entity;
        }
    }

    if (bestTarget) {
        const turn = steerMissileToTarget(missileEntity, bestTarget.location, missileTurnRate);

        missileEntity.lookAt(turn[0])

        return turn[1]
    }
}

/**
 * @param {import("@minecraft/server").Entity} missileEntity
 */
export function missileEntityTick(missileEntity) {
    if (!missileEntity) return;

    // Si ya explotó, no lo muevas más: solo espera al kill() diferido
    // en explode_missile(), que le da tiempo al fuse a romper bloques
    // exactamente en el punto de impacto.
    if (missileEntity.getDynamicProperty("af:missile.exploded")) return;

    const missileSpeed = missileEntity.getProperty("af:missile.speed") / 10
    if (!missileSpeed) return;

    let armedTimer = missileEntity.getDynamicProperty("af:missile.armed-timer") ?? 0;
    let missileTurnRate = missileEntity.getProperty("af:missile.turn-rate") ?? 100;

    let missilePitch = missileEntity.getDynamicProperty("af:missile.pitch") ?? missileEntity.getRotation().x;

    const playerGuiderId = missileEntity.getDynamicProperty("af:player.controller");

    let player;

    if (playerGuiderId) {
        player = GeneralUtils.world.getPlayerFromEntity(
            world.getEntity(playerGuiderId)
        );
    }

    //find nearest player
    if (!player) {
        const nearestPlayer = missileEntity.dimension.getPlayers({
            location: missileEntity.location,
            closest: 1,
            maxDistance: 256
        })[0];

        if (nearestPlayer) {
            player = nearestPlayer;

            missileEntity.setDynamicProperty(
                "af:player.controller",
                nearestPlayer.id
            );
        }
    }

    switch (missileEntity.typeId) {
        case "af:guided_missile": {
            if (!player) break;
            const guidedRotation = steerMissileToRotation(missileEntity, player.getRotation(), missileTurnRate);
            missileEntity.setRotation(guidedRotation);
            missilePitch = guidedRotation.x

            break;
        }
        case "af:missile_ground": {
            let missileVisionRange = missileEntity.getDynamicProperty("af:radar-range") ?? 64;

            const entities = missileEntity.dimension.getEntities({
                tags: ["on_radar"],
                families: ["vehicle"],
                excludeFamilies: ["aerial"],
                maxDistance: missileVisionRange,
                location: missileEntity.location
            })

            let rot = homingMissile(entities, missileEntity, missileTurnRate);

            if (rot) {
                missilePitch = rot.x
            }

            break;

        }
        case "af:missile_air": {
            let missileVisionRange = missileEntity.getDynamicProperty("af:radar-range") ?? 64;

            const entities = missileEntity.dimension.getEntities({
                tags: ["on_radar"],
                families: ["aerial"],
                maxDistance: missileVisionRange,
                location: missileEntity.location
            })

            let rot = homingMissile(entities, missileEntity, missileTurnRate);

            if (rot) {
                missilePitch = rot.x
            }

            break;
        }
        case "af:torpedo": {
            let missileVisionRange = missileEntity.getDynamicProperty("af:radar-range") ?? 64;

            const entities = missileEntity.dimension.getEntities({
                tags: ["on_radar"],
                families: ["boat"],
                maxDistance: missileVisionRange,
                location: missileEntity.location
            })

            let rot = homingMissile(entities, missileEntity, missileTurnRate);

            if (rot) {
                missilePitch = rot.x
            }

            break;

        }
    }

    missileEntity.setRotation({
        x: missilePitch,
        y: missileEntity.getRotation().y
    })

    const forwardVector = GeneralUtils.math.vectors.getForwardVector(missileEntity.getRotation())
    missileEntity.clearVelocity()
    missileEntity.applyImpulse(GeneralUtils.math.vectors.vectorAdd({ x: 0, y: 0, z: 0 }, forwardVector, missileSpeed))

    if (player) {
        if (Math.hypot(
            (missileEntity.location.x - player.location.x),
            (missileEntity.location.y - player.location.y),
            (missileEntity.location.z - player.location.z)
        ) >= 100) {
            if (armedTimer > 10) {
                if (player) {
                    player.onScreenDisplay.setActionBar("Missile Detonated")
                }
                explode_missile(missileEntity);
                return;
            }
        }
    }

    const entities = missileEntity.dimension.getEntities({ location: missileEntity.location, maxDistance: 3 });

    for (const entity of entities) {
        if (entity.id == missileEntity.id) continue;
        if (armedTimer > 10) {
            if (player) {
                player.onScreenDisplay.setActionBar("Missile Detonated")
            }
            explode_missile(missileEntity);
            return;
        }
    }
    if (!missileEntity) return;

    const block = missileEntity.dimension.getBlock(missileEntity.location);

    if (!block.isLiquid && !block.isAir) {
        if (player) {
            player.onScreenDisplay.setActionBar("Missile Detonated")
        }
        explode_missile(missileEntity);
        return;
    }
    if (!missileEntity) return;

    armedTimer++;
    missileEntity.setDynamicProperty("af:missile.armed-timer", armedTimer);
    missileEntity.setDynamicProperty("af:missile.pitch", missilePitch)
};