import { Entity, PlayerInteractWithEntityAfterEvent, DataDrivenEntityTriggerAfterEvent, world } from "@minecraft/server"
import { GeneralUtils } from "../utils.js"

/**
 * @param {Entity} entity
 */
export function droneEntityTick(entity) {
    const exitPosX = entity.getDynamicProperty("af:drone.exit-pos.x")
    const exitPosY = entity.getDynamicProperty("af:drone.exit-pos.y")
    const exitPosZ = entity.getDynamicProperty("af:drone.exit-pos.z")
    const exitRotX = entity.getDynamicProperty("af:drone.exit-rot.x")
    const exitRotY = entity.getDynamicProperty("af:drone.exit-rot.y")

    if (exitPosX && exitPosY && exitPosZ && exitRotX && exitRotY && !entity.getComponent("riding")) {
        entity.teleport({ x: exitPosX, y: exitPosY, z: exitPosZ }, { rotation: { x: exitRotX, y: exitRotY } })
        entity.setDynamicProperties({
            "af:drone.exit-pos.x": undefined,
            "af:drone.exit-pos.y": undefined,
            "af:drone.exit-pos.z": undefined,
            "af:drone.exit-rot.x": undefined,
            "af:drone.exit-rot.y": undefined
        })
    }
}

/**
 * @param {DataDrivenEntityTriggerAfterEvent} event
 */
export function droneEventTrigger(event) {
    const entity = event.entity;
    if (!entity) return;
    if (event.eventId != "af:control_drone") return;

    const players = entity.dimension.getPlayers({ location: entity.location, closest: 1 });
    const player = players[0];

    const faction = player.hasTag("libernia")
        ? "libernia"
        : (player.hasTag("telslakia")
            ? "telslakia"
            : null);

    if (!faction) {
        player.onScreenDisplay.setActionBar(
            "first, hold passport in hand to join faction."
        );
        return;
    }

    if (!player.isSneaking) {
        const entities = entity.dimension.getEntities({ location: entity.location, maxDistance: 16, closest: 1, propertyOptions: [{ propertyId: "af:drone", value: true }], families: [faction] });

        const drone = entities[0]
        if (!drone) {
            player.onScreenDisplay.setActionBar("you must be in the same faction to use this.")
            return
        }
        if (!drone.hasComponent("rideable")) return
        const rideableComponent = drone.getComponent("rideable")
        const playerRot = player.getRotation()
        player.setDynamicProperty("af:drone.exit-pos.x", player.location.x)
        player.setDynamicProperty("af:drone.exit-pos.y", player.location.y)
        player.setDynamicProperty("af:drone.exit-pos.z", player.location.z)
        player.setDynamicProperty("af:drone.exit-rot.x", playerRot.x)
        player.setDynamicProperty("af:drone.exit-rot.y", playerRot.y)
        rideableComponent.addRider(player)
    }
}