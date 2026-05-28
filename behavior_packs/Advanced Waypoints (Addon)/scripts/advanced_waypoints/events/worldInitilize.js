import { waypointMenu } from "../ui/mainUi";
import { world } from "@minecraft/server";
world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry: customI }) => {
    customI.registerCustomComponent("advanced_waypoints:use", {
        onUse: ({ source: player }) => {
            return waypointMenu(player, player.isSneaking);
        }
    });
});
