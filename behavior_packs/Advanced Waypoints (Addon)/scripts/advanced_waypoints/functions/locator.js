import { world, system } from "@minecraft/server";
import { apiWaypointEntity } from "../lib/apiwaypoint/entity";
import { apiConfig } from "../lib/player/config";
import { apiVec3 } from "../lib/math/vector";
import { Variables } from "../lib/variables";
export const waypointsLocations = new Map();
export const lastPositions = new Map();
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const entities = player.dimension.getEntities({ type: "advanced_waypoints:waypoint", tags: [`waypointOwner: ${player.id}`] });
        if (entities.length < 1)
            continue;
        const config = apiConfig.get(player);
        const playerPos = player.location;
        for (const entity of entities) {
            try {
                if (!entity?.isValid()) {
                    apiWaypointEntity.recoverWaypoints(player);
                    break;
                }
                entity.playAnimation("animation.advanced_waypoints.waypoint.offset", { players: [`${player.nameTag}`] });
                const waypointPos = getWaypointPos(entity);
                if (!entity.getTags().includes(`waypointWorld: ${player.dimension.id.replace("minecraft:", "")}`)) {
                    apiWaypointEntity.remove(player, entity);
                    continue;
                }
                const distance = Math.floor(apiVec3.distance3(playerPos, waypointPos));
                if (lastPositions.get(entity.id) == distance)
                    continue;
                lastPositions.set(entity.id, distance);
                const distanceEntity = apiVec3.distance3(playerPos, entity.location);
                if (distanceEntity > Variables.renderAt + 16) {
                    apiWaypointEntity.recoverWaypoints(player);
                    break;
                }
                if (config.dis)
                    apiWaypointEntity.setDisplayDistance(entity, distance);
                if (distance > Variables.renderAt) {
                    entity.tryTeleport(offset(playerPos, waypointPos), { rotation: { x: 0, y: 0 } });
                }
                else {
                    entity.tryTeleport(waypointPos, { rotation: { x: 0, y: 0 } });
                }
            }
            catch { }
        }
    }
}, 3);
function getWaypointPos(entity) {
    const pos = waypointsLocations.get(entity.id);
    if (!pos) {
        const p = entity.getDynamicProperty("WP");
        if (typeof p == "object") {
            waypointsLocations.set(entity.id, p);
            return p;
        }
        return apiVec3.create(0, 0, 0);
    }
    return pos;
}
export function offset(pointA, pointB) {
    const distance = apiVec3.distanceXYZ(pointA, pointB);
    const length = Math.sqrt(distance.x ** 2 + distance.y ** 2 + distance.z ** 2);
    if (length === 0)
        return { x: pointA.x, y: pointA.y, z: pointA.z };
    return {
        x: pointA.x + (distance.x / length) * Variables.renderAt,
        y: pointA.y + (distance.y / length) * Variables.renderAt,
        z: pointA.z + (distance.z / length) * Variables.renderAt
    };
}
