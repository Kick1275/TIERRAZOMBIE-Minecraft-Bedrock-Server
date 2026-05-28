import { world } from "@minecraft/server"

export function maxXpCost(): number {
  const score = world.scoreboard.getObjective("advanced_waypoints_cost_xp")?.getScore("xp")
  return score == undefined ? 3 : (score < 0 ? 0 : score)
}

export function enableTp(): boolean {
  const score = world.scoreboard.getObjective("advanced_waypoints_cost_xp")?.getScore("tp")
  return score == undefined ? true : (score < 1 ? false : true)
}