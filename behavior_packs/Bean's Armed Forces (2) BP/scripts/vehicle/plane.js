import { EntityRideableComponent, Entity } from "@minecraft/server";
import { GeneralUtils } from "../utils.js";

const CRUISING_SPEED = 0.8;

/**
 * @param {Entity} planeEntity - The entity to use for the tick
 * @param {EntityRideableComponent} rideableComponent - The rideable component to use for the tick
 */
export function planeEntityTick(planeEntity, rideableComponent) {
    const maxSpeed = planeEntity.getProperty("af:plane.max-speed") / 10;
    if (!maxSpeed) return

    const turnRatePitch = planeEntity.getProperty("af:plane.turnrate-pitch") ?? 40
    const turnRateYaw = planeEntity.getProperty("af:plane.turnrate-yaw") ?? 20
    const takenOffSpeed = planeEntity.getProperty("af:plane.takeoffspeed") / 15 ?? maxSpeed / 2;

    let gravVelocity = planeEntity.getDynamicProperty("af.plane.gravity-y") ?? 0;

    let rotation = planeEntity.getRotation()
    let velocity = { x: 0, y: 0, z: 0 }
    const entityVelocity = planeEntity.getVelocity();

    let currentThrottle = planeEntity.getDynamicProperty("af:plane.throttle") ?? 0;
    let airTime = planeEntity.getDynamicProperty("af:plane.air-time") ?? 0;

    let takenOff = planeEntity.getDynamicProperty("af:plane.taken-off");

    const rider = rideableComponent.getRiders()[rideableComponent.controllingSeat];
    const playerRider = GeneralUtils.world.getPlayerFromEntity(rider);

    let throttling = false;

    if (playerRider) {
        const inputVector = playerRider.inputInfo.getMovementVector();

        if (planeEntity.isOnGround || takenOff) {
            currentThrottle += GeneralUtils.math.clamp(inputVector.y, -planeEntity.isOnGround, 1) * GeneralUtils.math.clamp(Math.abs(currentThrottle), 0.1, CRUISING_SPEED) / 20;
        } else {
            currentThrottle = GeneralUtils.math.lerp(currentThrottle, 0, 0.01)
        }

        if (Math.abs(inputVector.y) > 0.2) throttling = true

        const velocityHypot = Math.hypot(...Object.values(entityVelocity));
        rotation = GeneralUtils.world.rotateByEasedRotation(planeEntity, playerRider.getRotation(), { x: turnRatePitch, y: turnRateYaw * Math.sign(velocityHypot) });

        if (airTime <= 1) {
            rotation.x = rotation.x * (currentThrottle - takenOffSpeed) * airTime;
        }

        if (!planeEntity.isOnGround && !throttling && !planeEntity.hasTag("vtol")) {
            currentThrottle = GeneralUtils.math.lerp(currentThrottle, CRUISING_SPEED, 0.2)
        } else if (!planeEntity.isOnGround && !throttling && planeEntity.hasTag("vtol")) {
            currentThrottle = GeneralUtils.math.lerp(currentThrottle, CRUISING_SPEED * 0, 0.2)
        }


    } else {
        currentThrottle = GeneralUtils.math.lerp(currentThrottle, 0, 0.001)
        takenOff = false
    }

    if ((planeEntity.isOnGround || !takenOff) && !throttling) {
        currentThrottle = GeneralUtils.math.lerp(currentThrottle, 0, 0.01)
    }

    currentThrottle = GeneralUtils.math.clamp(currentThrottle, -0.4, maxSpeed);

    const forwardVector = GeneralUtils.math.vectors.getForwardVector({
        x: planeEntity.isOnGround ? 0 : rotation.x,
        y: rotation.y
    });
    velocity = GeneralUtils.math.vectors.vectorAdd(velocity, forwardVector, currentThrottle);

    if (currentThrottle < CRUISING_SPEED) {
        if (!planeEntity.isOnGround) {
            rotation.x += (90 - rotation.x) * ((CRUISING_SPEED - currentThrottle) / 6);
        }
        gravVelocity += Math.min(0, currentThrottle - CRUISING_SPEED) * 0.1;
    }

    if (gravVelocity < -3 && planeEntity.isOnGround) {
        const damage = (Math.abs(entityVelocity.y) * 10)
        if (damage > 0) planeEntity.applyDamage(damage);
        if (!playerRider && damage > 5) {
            planeEntity.runCommand('summon af:vehicle_explosion ~ ~ ~ ~ ~'),
                planeEntity.kill();
        }
    }

    if (planeEntity.isOnGround) {
        airTime = 0;
        takenOff = false
        gravVelocity = -2;
    }

    if (currentThrottle >= takenOffSpeed) {
        takenOff = true
    }

    if (airTime < 3 && throttling && planeEntity.hasTag("vtol")) {
        gravVelocity = 0.5
        airTime += 0.05;
    }

    if (airTime > 3 && !takenOff && planeEntity.hasTag("vtol")) {
        takenOff = true
    }

    if (!throttling && takenOff && planeEntity.hasTag("vtol")) {
        velocity = { x: 0, y: -0.05, z: 0 }
    }

    const velocityHypotTarget = Math.hypot(velocity.x, velocity.z);
    const velocityHypotCurrent = Math.hypot(entityVelocity.x, entityVelocity.z);

    if (takenOff) {
        if (planeEntity.isOnGround) {
            gravVelocity = 0.1
        } else {
            gravVelocity = 0;
        }
        airTime += 0.05;
    }

    gravVelocity = GeneralUtils.math.clamp(gravVelocity, -2, 0.1)

    velocity = GeneralUtils.math.vectors.vectorAdd(velocity, { x: 0, y: 1, z: 0 }, gravVelocity);

    if (velocityHypotCurrent < velocityHypotTarget - 0.3 && !takenOff) {
        currentThrottle = 0
        velocity = { x: 0, y: -1, z: 0 }
    }

    if (((entityVelocity.x == 0 && Math.abs(velocity.x) > 0.3) || (entityVelocity.z == 0 && Math.abs(velocity.z) > 0.3)) && takenOff) {
        planeEntity.runCommand('summon af:vehicle_explosion ~ ~ ~ ~ ~'),
            planeEntity.kill();

        currentThrottle = 0
        velocity = { x: 0, y: -1, z: 0 }
    }

    if (planeEntity.getRotation().x > 25 && planeEntity.isOnGround) {
        planeEntity.runCommand('summon af:vehicle_explosion ~ ~ ~ ~ ~'),
            planeEntity.kill();
    }

    planeEntity.clearVelocity();
    planeEntity.applyImpulse(velocity);
    planeEntity.setRotation(rotation);

    planeEntity.setDynamicProperties({
        "af:plane.throttle": currentThrottle,
        "af:plane.taken-off": takenOff,
        "af:plane.air-time": airTime,
        "af.plane.gravity-y": gravVelocity
    })
}