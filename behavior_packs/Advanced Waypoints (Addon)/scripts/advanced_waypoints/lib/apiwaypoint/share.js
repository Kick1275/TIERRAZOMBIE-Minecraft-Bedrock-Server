import { apiWaypointCreate } from "./create";
import { apiScoreboard } from "../math/scoreboard";
import { apiWarn } from "../player/warn";
export const apiWaypointShare = new class ApiWaypointShare {
    share(player, target, info) {
        if (!target.isValid())
            return apiWarn.notify(player, "advanced_waypoints.warn.playerOffline", { sound: "advanced_waypoints.warn.break" });
        if (this.hasOnList(player, target.nameTag, info.name))
            return apiWarn.notify(player, { translate: "advanced_waypoints.warn.alreadySent", with: [info.name] }, { sound: "advanced_waypoints.warn.bass" });
        apiWaypointCreate.create(target, info, false, player.nameTag);
    }
    hasOnList(player, targetName, name) {
        const listId = `${targetName}_${name}`;
        const has = apiScoreboard.hasParticipant(`advanced_waypoints:${player.nameTag}`, listId);
        if (has)
            return has;
        this.addOnList(player, listId);
        return has;
    }
    addOnList(player, listId) {
        apiScoreboard.setScore(`advanced_waypoints:${player.nameTag}`, listId, 0);
    }
    removeFromList(player, name) {
        const score = apiScoreboard.getObj(`advanced_waypoints:${player.nameTag}`);
        for (const participant of score.getParticipants().filter(value => value.displayName.endsWith(name))) {
            score.removeParticipant(participant);
        }
    }
};
