import { world } from "@minecraft/server"

export function maxXpCost() {
    const score = world.scoreboard.getObjective("advanced_waypoints_cost_xp")?.getScore("xp")
    return score == undefined ? 0 : (score < 0 ? 0 : score)
}

export function enableTp() {
    const score = world.scoreboard.getObjective("advanced_waypoints_cost_xp")?.getScore("tp")
    return score == undefined ? false : (score < 1 ? false : true)
}