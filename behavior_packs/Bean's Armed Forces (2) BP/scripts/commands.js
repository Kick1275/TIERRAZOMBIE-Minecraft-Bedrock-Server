import { world, Entity, system } from "@minecraft/server"
import { spawnNuke } from "nuke.js"

// StartupEvent, CommandPermissionLevel y CustomCommandParamType son beta
// y no existen en @minecraft/server@2.4.0 estable. Se definen como undefined
// para que el código no rompa al importar.
const StartupEvent = undefined;
const CommandPermissionLevel = undefined;
const CustomCommandParamType = undefined;

/**
 * @param {StartupEvent} startupEvent
 */
export function commandStartupEvent(startupEvent) {
    // Custom Commands API (StartupEvent, CommandPermissionLevel, CustomCommandParamType)
    // requieren @minecraft/server beta. En versión 2.4.0 estable no están disponibles.
    // Los comandos af:givecoords y af:nuke se deshabilitan hasta que se actualice la API.
    try {
        if (!startupEvent?.customCommandRegistry) return;
        const commandReg = startupEvent.customCommandRegistry;

    commandReg.registerCommand({
        name: "af:givecoords",
        description: "gets the coordinates of a projectile and displays it to the players around the owner of the projectile",
        permissionLevel: CommandPermissionLevel.Any,
        cheatsRequired: false,
        mandatoryParameters: [
            {
                name: "target entity",
                type: CustomCommandParamType.EntitySelector
            }
        ]
    }, (origin, ...args) => {
        const entities = args[0]

        for (const entityData of entities ?? []) {
            const entity = entityData instanceof Entity ? entityData : world.getEntity(entityData?.id);

            if (!(entity instanceof Entity)) {
                world.sendMessage("Invalid entity.");
                return;
            }

            const projectileComponent = entity.getComponent("minecraft:projectile");
            if (projectileComponent) {
                const fallbackSourceId = entity.getDynamicProperty("af:rangefinder.source-id");
                const owner = projectileComponent.owner ?? (typeof fallbackSourceId === "string" ? world.getEntity(fallbackSourceId) : undefined);
                if (owner) {
                    const coordText = `X: ${Math.round(entity.location.x)} Y: ${Math.round(entity.location.y)} Z: ${Math.round(entity.location.z)}`
                    const players = world.getAllPlayers()
                    players.forEach(player => {
                        if (Math.hypot(
                            player.location.x - owner.location.x,
                            player.location.y - owner.location.y,
                            player.location.z - owner.location.z
                        ) < 5) {
                            system.run(() => {
                                player.onScreenDisplay.setActionBar(coordText)
                            })
                        }
                    })
                } else {
                    world.sendMessage("Projectile does not have an owner.");
                    return;
                }
            } else {
                world.sendMessage("Entity is not a projectile.");
                return;
            }
        }
    })

    commandReg.registerCommand({
        name: "af:nuke",
        description: "nukes a certain position",
        permissionLevel: CommandPermissionLevel.Admin,
        cheatsRequired: true,
        mandatoryParameters: [
            {
                name: "location",
                type: CustomCommandParamType.Location
            },
            {
                name: "air radius",
                type: CustomCommandParamType.Integer
            },
            {
                name: "leaves radius",
                type: CustomCommandParamType.Integer
            },
            {
                name: "grass radius",
                type: CustomCommandParamType.Integer
            }
        ]
    }, (origin, ...args) => {
        system.run(() => {
            spawnNuke(args[0], origin.sourceEntity.dimension, args[1], args[2], args[3])
        })
    })
    } catch (e) {
        // Custom Commands API no disponible en esta versión estable — se ignora silenciosamente
    }
}
