import { system, Entity, EntityRideableComponent, InvalidEntityError } from "@minecraft/server";
import { GeneralUtils } from "../utils.js"

/**
 * @param {EntityLoadAfterEvent} event - The event to use
 */
export function groundHandleEntityLoad(event) {
    try {
        const entity = event.entity;
        if (entity.getDynamicProperty("af:vehicle.spin-animation")) {
            entity.playAnimation("brake");
            entity.setDynamicProperty("af:vehicle.spin-animation", false);
        }
    } catch (err) {
        if (!(err instanceof InvalidEntityError)) throw err;
    }
}

/**
 * @param {Entity} groundEntity - The entity to use for the tick
 * @param {EntityRideableComponent} rideableComponent - The rideable component
 */
export function groundEntityTick(groundEntity, rideableComponent) {
    const transmission = groundEntity.getProperty("af:vehicle.transmission");
    if (!transmission) return;

    const amphibious = !!groundEntity.getProperty("af:vehicle.amphibious")
    const waterSpeed = (groundEntity.getProperty("af:vehicle.amphibious") ?? 2) / 20
    const turretEndDeadzoneMax = groundEntity.getProperty("af:vehicle.turret.end-deadzone-max") ?? 20
    const turretEndDeadzoneMin = groundEntity.getProperty("af:vehicle.turret.end-deadzone-min") ?? 10
    const reverseModifier = (groundEntity.getProperty("af:vehicle.reverse-modifier") ?? 5) / 10;
    const maxSpeed = (groundEntity.getComponent("movement")?.currentValue ?? 0.2) * (groundEntity.isInWater ? waterSpeed : 1);
    const rotationSpeed = groundEntity.getProperty("af:vehicle.rotation-speed") ?? 40;
    const acceleration = groundEntity.getProperty("af:vehicle.acceleration") ?? 2
    const brakeSpeed = groundEntity.getProperty("af:vehicle.brake-speed") ?? 0.5

    let velocity = {
        x: 0,
        y: -0.1,
        z: 0
    };

    const pos = groundEntity.location;
    const dimension = groundEntity.dimension;
    const groundAmphibious = groundEntity.hasTag("amphibious");
    const navalSubmarine = groundEntity.hasTag("submarine");

    const currentBlock = dimension.getBlock({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
    });

    const belowBlock = dimension.getBlock({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y - 2),
        z: Math.floor(pos.z)
    });

    const aboveBlock = dimension.getBlock({
        x: Math.floor(pos.x),
        y: Math.floor(pos.y + 2),
        z: Math.floor(pos.z)
    });

    const nearWater =
        currentBlock?.isLiquid &&
        belowBlock?.isLiquid;

    //boats
    if (amphibious && !groundAmphibious && !navalSubmarine) {
        let y = Math.floor(pos.y);

        while (
            dimension.getBlock({
                x: Math.floor(pos.x),
                y: y + 1,
                z: Math.floor(pos.z)
            })?.isLiquid
        ) {
            y++;
        }

        const offset = (amphibious && groundAmphibious) ? -1 : 0.25;

        const surfaceY = y + offset;

        const difference = surfaceY - pos.y;

        velocity.y = difference * 0.1;

        velocity.y = Math.max(
            -0.08,
            Math.min(0.08, velocity.y)
        );
    }

    //amphibious vehicles
    if (nearWater && amphibious && groundAmphibious && !navalSubmarine) {
        let y = Math.floor(pos.y);

        while (
            dimension.getBlock({
                x: Math.floor(pos.x),
                y: y + 1,
                z: Math.floor(pos.z)
            })?.isLiquid
        ) {
            y++;
        }

        const offset = (amphibious && groundAmphibious) ? -1 : 0.25;

        const surfaceY = y + offset;

        const difference = surfaceY - pos.y;

        velocity.y = difference * 0.1;

        velocity.y = Math.max(
            -0.08,
            Math.min(0.08, velocity.y)
        );
    }

    let spinning = groundEntity.getDynamicProperty("af:vehicle.spin-animation") ?? false;
    let currentSpeed = groundEntity.getDynamicProperty("af:vehicle.current-speed") ?? 0;
    let dir = groundEntity.getDynamicProperty("af:vehicle.direction") ?? groundEntity.getRotation().y;
    let oldDir = dir;
    let throttling = false;

    const rider = rideableComponent.getRiders()[rideableComponent.controllingSeat];
    const playerRider = GeneralUtils.world.getPlayerFromEntity(rider);

    if (playerRider) {
        const inputVector = playerRider.inputInfo.getMovementVector();

        const reverseFactor = (currentSpeed >= 0 ? 1 : reverseModifier);

        if (currentSpeed <= maxSpeed * Math.abs(inputVector.y)) {
            currentSpeed += Math.sign(inputVector.y) * ((maxSpeed / 20) / acceleration) * reverseFactor
        }

        if (Math.abs(inputVector.y) > 0.2) throttling = true

        if (transmission === "mono") {
            dir += GeneralUtils.math.toRad(rotationSpeed / 20) * inputVector.x * currentSpeed / maxSpeed
        };
        if (transmission === "dual") {
            dir += GeneralUtils.math.toRad(rotationSpeed / 20) * inputVector.x * (currentSpeed >= 0 ? currentSpeed / 2 + 0.5 : currentSpeed / 2 - 0.5)
        };

        if (transmission === "dual") {
            if (inputVector.x !== 0 && inputVector.y === 0) {
                try {
                    groundEntity.triggerEvent("af:is_moving");
                } catch { }
            }
            if (inputVector.x !== 0 && inputVector.y === 0 && !spinning) {
                groundEntity.playAnimation("move");
                spinning = true
                system.runTimeout(() => {
                    groundEntity.setDynamicProperty("af:vehicle.spin-animation", false)
                }, 20)
            }
            if (inputVector.x === 0 && inputVector.y === 0 && spinning) {
                groundEntity.playAnimation("brake");
                spinning = false
            }
        }
    }

    currentSpeed = GeneralUtils.math.lerp(currentSpeed, 0, !throttling * (brakeSpeed / 20));
    currentSpeed = GeneralUtils.math.clamp(currentSpeed, -maxSpeed * reverseModifier, maxSpeed)

    const forwardVector = GeneralUtils.math.vectors.getForwardVector({ x: 0, y: -GeneralUtils.math.toDeg(dir) });
    velocity = GeneralUtils.math.vectors.vectorAdd(velocity, forwardVector, currentSpeed)

    const entityVelocity = groundEntity.getVelocity()

    if (Math.abs(entityVelocity.x) == 0 && Math.abs(velocity.x) > 0.2) {
        currentSpeed = GeneralUtils.math.lerp(currentSpeed, 0, 0.1)
        velocity.x = 0
    }

    if (Math.abs(entityVelocity.z) == 0 && Math.abs(velocity.z) > 0.2) {
        currentSpeed = GeneralUtils.math.lerp(currentSpeed, 0, 0.1)
        velocity.z = 0
    }

    if (groundEntity.isOnGround || (amphibious && groundEntity.isInWater)) {
        groundEntity.clearVelocity()
        groundEntity.applyImpulse(velocity);
    }

    let turretPitch = groundEntity.getDynamicProperty("turret-pitch") ?? 0;

    if (turretEndDeadzoneMax >= 0 && turretEndDeadzoneMin >= 0) {
        turretPitch = GeneralUtils.math.clamp(turretPitch, -turretEndDeadzoneMax, turretEndDeadzoneMin);
    }

    turretPitch = GeneralUtils.math.toRad(turretPitch);

    //submarine
    if (navalSubmarine && aboveBlock?.isLiquid && !rider) {
        groundEntity.applyImpulse({
            x: currentSpeed / maxSpeed,
            y: 0.1,
            z: currentSpeed / maxSpeed
        });
    }
    if (navalSubmarine && aboveBlock?.isLiquid && rider) {
        const rot = groundEntity.getRotation();
        const dir = groundEntity.getViewDirection();
        const dir_y = rider.getViewDirection();

        groundEntity.setRotation({
            x: rot.x,
            y: rot.y
        });

        groundEntity.clearVelocity();

        groundEntity.applyImpulse({
            x: dir.x * currentSpeed / maxSpeed,
            y: dir_y.y * currentSpeed / maxSpeed,
            z: dir.z * currentSpeed / maxSpeed
        });
    }

    groundEntity.setRotation({ x: turretPitch, y: dir });

    groundEntity.lookAt({
        x: groundEntity.location.x + Math.sin(dir) * 100,
        y: groundEntity.location.y - Math.sin(turretPitch) * 100,
        z: groundEntity.location.z + Math.cos(dir) * 100
    });

    groundEntity.setDynamicProperties({
        "af:vehicle.spin-animation": spinning,
        "af:vehicle.turret-drag": oldDir - dir,
        "af:vehicle.direction": dir,
        "af:vehicle.current-speed": currentSpeed
    })
}