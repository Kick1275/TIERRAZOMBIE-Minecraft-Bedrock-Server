import { world } from "@minecraft/server";
import { apiWaypointInfo } from "./lib/apiwaypoint/info";
world.afterEvents.itemUse.subscribe(({ source: player, itemStack: item }) => {
    if (!player.hasTag("dev"))
        return;
    if (item.typeId == "minecraft:stick") {
        // for(const entity of player.dimension.getEntities({type: "advanced_waypoints:waypoint", tags: [`waypointOwner: ${player.id}`]})){}
        world.sendMessage(`${(JSON.stringify(apiWaypointInfo.getAll(player)))}`);
        world.sendMessage(`${"=".codePointAt(0)}`);
        // player.setDynamicProperty("aw:death", undefined)
        // world.sendMessage(`${player.getDynamicPropertyTotalByteCount()}`)
        // world.sendMessage(`${JSON.stringify(player.getDynamicPropertyIds(), null, 2)}`)
        world.sendMessage(`Entities: ${player.dimension.getEntities({ type: "advanced_waypoints:waypoint" }).length}`);
    }
});
