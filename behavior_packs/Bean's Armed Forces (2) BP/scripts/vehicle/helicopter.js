import { world, system, EasingType, EntityRideableComponent, Entity, Player } from "@minecraft/server";
import { GeneralUtils } from "../utils.js"

export function helicopterEntityTick(helicopterEntity, rideableComponent) {
    const rider = rideableComponent.getRiders()[rideableComponent.controllingSeat];
    const player_rider = GeneralUtils.world.getPlayerFromEntity(rider);

    const helicopterSpeed = helicopterEntity.getProperty("af:helicopter.speed") / 5;
    const helicopterTurnSpeed = helicopterEntity.getProperty("af:helicopter.turn-speed") ?? 100;
    const helicopterTakeOffTime = helicopterEntity.getProperty("af:helicopter.take-off-time") ?? 1;
    if (!helicopterSpeed) return;

    let helicopterRotorSpeed = helicopterEntity.getDynamicProperty("af:helicopter.rotor-speed") ?? 0;

    let velocity = helicopterEntity.getVelocity();
    const isGrounded = helicopterEntity.isOnGround;

    let input = { x: 0, y: 0 };
    let rot, yaw, pitch;

    if (player_rider) {
        input = player_rider.inputInfo.getMovementVector();

        rot = player_rider.getRotation();
        pitch = GeneralUtils.math.toRad(rot.x + 90);
        yaw = GeneralUtils.math.toRad(rot.y);

        const upX = Math.sin(yaw) * Math.cos(pitch);
        const upY = Math.sin(pitch);
        const upZ = -Math.cos(yaw) * Math.cos(pitch);

        if (input.y !== 0) {
            velocity.x += upX * input.y / 6;
            velocity.y += upY * input.y / 6;
            velocity.z += upZ * input.y / 6;
        }

        velocity.x += Math.sin(yaw - Math.PI / 2) * -input.x / 8;
        velocity.z += -Math.cos(yaw - Math.PI / 2) * -input.x / 8;

        velocity = GeneralUtils.math.vectors.clampVector(velocity, helicopterSpeed);

        rot.x = rot.x / 2;

        const rotation = GeneralUtils.world.rotateByEasedRotation(
            helicopterEntity,
            rot,
            { x: helicopterTurnSpeed, y: helicopterTurnSpeed }
        );

        helicopterEntity.setRotation(rotation);

        helicopterRotorSpeed += 1 / (helicopterTakeOffTime * 10);
    } else {
        helicopterRotorSpeed -= 0.1;
    }

    helicopterRotorSpeed = GeneralUtils.math.clamp(helicopterRotorSpeed, 0, 3);

    const canFly = helicopterRotorSpeed >= 1;

    if (!canFly) {
        velocity.y -= 0.08;
    }

    if (canFly) {
        if (Math.abs(input.x) < 0.01 && Math.abs(input.y) < 0.01) {
            velocity.y = 0;
            velocity.x *= -0.5;
            velocity.z *= -0.5;
        }
    }

    if (isGrounded) {
        velocity.x = 0;
        velocity.z = 0;
    }

    helicopterEntity.setDynamicProperty("af:helicopter.rotor-speed", helicopterRotorSpeed);

    if (canFly) {
        helicopterEntity.clearVelocity();
        helicopterEntity.applyImpulse(velocity);
    }
}