import { apiWaypointEntity } from "../lib/apiwaypoint/entity";
import { world, system } from "@minecraft/server";
world.afterEvents.playerDimensionChange.subscribe(({ player: player }) => {
    apiWaypointEntity.removeAll(player);
    system.runTimeout(() => { apiWaypointEntity.recoverWaypoints(player); }, 30);
});
