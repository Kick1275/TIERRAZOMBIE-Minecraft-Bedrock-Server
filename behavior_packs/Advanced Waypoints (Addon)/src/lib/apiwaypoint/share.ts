import { apiWaypointCreate, WaypointInfoCreate } from "./create"
import { apiScoreboard } from "../math/scoreboard"
import { world, Player } from "@minecraft/server"
import { apiWarn } from "../player/warn"

export const apiWaypointShare = new class ApiWaypointShare {
  share(player: Player, target: Player, info: WaypointInfoCreate): void {
    if(!target.isValid()) return apiWarn.notify(player, "advanced_waypoints.warn.playerOffline", {sound: "advanced_waypoints.warn.break"})

    if(this.hasOnList(player, target.nameTag, info.name)) return apiWarn.notify(player, {translate: "advanced_waypoints.warn.alreadySent", with: [info.name]}, {sound: "advanced_waypoints.warn.bass"})

    apiWaypointCreate.create(target, info, false, player.nameTag)
  }

  private hasOnList(player: Player, targetName: string, name: string): boolean {
    const listId = `${targetName}_${name}`
    const has = apiScoreboard.hasParticipant(`advanced_waypoints:${player.nameTag}`, listId)
    if(has) return has

    this.addOnList(player, listId)
    return has
  }

  private addOnList(player: Player, listId: string): void {
    apiScoreboard.setScore(`advanced_waypoints:${player.nameTag}`, listId, 0)
  }

  removeFromList(player: Player, name: string): void {
    const score = apiScoreboard.getObj(`advanced_waypoints:${player.nameTag}`)
    for(const participant of score.getParticipants().filter(value => value.displayName.endsWith(name))){
      score.removeParticipant(participant)
    }
  }
}