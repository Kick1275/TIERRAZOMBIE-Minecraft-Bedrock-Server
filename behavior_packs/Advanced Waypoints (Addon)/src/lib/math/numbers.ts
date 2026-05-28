import { world, Vector3 } from "@minecraft/server"
import { maxXpCost } from "../../subpack"

export const apiNumbers = new class apiNumbers {
  clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max) }

  randomBetween(min: number, max: number): number {
    return Math.random() * (max - min +1) + min
  }

  calculateCost(playerPos: Vector3, waypointPos: Vector3){
    const max = maxXpCost()
    if(max < 1) return 0
    const distance = Math.floor(Math.sqrt((waypointPos.x - playerPos.x) ** 2  + (waypointPos.z - playerPos.z) ** 2)) / 1500
    return distance < max ? Math.floor(distance) : max
  }
}