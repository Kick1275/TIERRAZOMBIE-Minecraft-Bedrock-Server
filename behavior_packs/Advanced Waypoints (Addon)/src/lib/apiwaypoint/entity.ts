import { world, system, Entity, Player, RGB, Vector3 } from "@minecraft/server"
import { lastPositions, offset, waypointsLocations } from "../../functions/locator"
import { apiConfig } from "../player/config"
import { apiNumbers } from "../math/numbers"
import { apiWaypointInfo } from "./info"
import { Variables } from "../variables"
import { apiVec3 } from "../math/vector"

export const apiWaypointEntity = new class ApiWaypointEntity {
  spawn(player: Player, info: WaypointSpawnInfo): void {
    try {
      const config = apiConfig.get(player)
      const entity = player.dimension.spawnEntity("advanced_waypoints:waypoint", offset(player.location, info.pos))
      entity.addTag(`waypointOwner: ${player.id}`)
      entity.addTag(`waypointName: ${info.id}`)
      entity.addTag(`waypointWorld: ${info.dim.replace("minecraft:", "")}`)
      entity.setProperty("advanced_waypoints:always_visible", `config${config.showInfo ? 1 : 0}${config.showBeam ? 1 : 0}`)
      entity.setProperty("advanced_waypoints:icon", this.getIcon(info.icon, info.id))
      entity.setProperty("advanced_waypoints:r", info.rgb.red % 1000)
      entity.setProperty("advanced_waypoints:g", info.rgb.green)
      entity.setProperty("advanced_waypoints:b", info.rgb.blue)
      entity.setDynamicProperty("WP", apiVec3.center(info.pos))
      if(config.name) this.setDisplayName(entity, info.id)
    } catch (e) { system.runTimeout(() => { this.spawn(player, info) }, 20 * 2.5) }
  }

  getIcon(index: number, name: string): number {
    if(index < 2) return index

    const first = name.trim().slice(0, 1).toLocaleUpperCase().codePointAt(0)
    if(first == undefined || first < 65 || first > 90) return 0

    return apiNumbers.clamp(first - 63, 0, 27)
  }

  remove(player: Player, waypoint: string | Entity): void {
    if(typeof waypoint == "string"){
      const entity = player.dimension.getEntities({type: "advanced_waypoints:waypoint", tags: [`waypointName: ${waypoint}`, `waypointOwner: ${player.id}`]})[0]
      waypointsLocations.delete(entity?.id ?? "")
      return entity?.remove()
    }
    waypoint.remove()
  }

  removeAll(player: Player): void {
    player.dimension.getEntities({tags: [`waypointOwner: ${player.id}`]}).forEach(way => way.remove())
  }

  private setDisplayName(waypoint: Entity, name: string): void {
    const letters = name.toLocaleUpperCase().slice(0, Variables.maxName).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const length = letters.length
    for(let i = 0; i < length; i++){
      waypoint.setProperty(`advanced_waypoints:name${length - i}`, letters[i]?.codePointAt(0) ?? 0)
    }
  }

  setDisplayDistance(waypoint: Entity, distance: number): void {
    const letters = `${Math.floor(distance > Variables.maxDistance ? Variables.maxDistance : distance)}`.split("")

    for(let i = 0; i < `${Variables.maxDistance}`.length; i++){
      const num = letters[letters.length - i -1]
      waypoint.setProperty(`advanced_waypoints:distance${i +1}`, !num ? -1 : parseInt(num))
    }
  }

  recoverWaypoints(player: Player): void {
    waypointsLocations.clear()
    lastPositions.clear()
    this.removeAll(player);

    (async function spawnAll(): Promise<void> {
      await system.waitTicks(5)
      apiWaypointInfo.getAll(player)
      .filter(value => value.visible)
      .forEach(waypoint => { apiWaypointEntity.spawn(player, waypoint) })
    })()
  }
}

interface WaypointSpawnInfo {
  id: string
  dim: string
  pos: Vector3
  icon: number
  rgb: RGB
}