import { world, system, Player, Vector3 } from "@minecraft/server"
import { apiWaypointEntity } from "../lib/apiwaypoint/entity"

world.afterEvents.playerSpawn.subscribe(({initialSpawn, player}) => {
  if(!initialSpawn){

    system.runTimeout(() => {
      apiWaypointEntity.recoverWaypoints(player)
    }, 20 * 5)
  } else {
    if(!player.getDynamicProperty("aw:7.0")) return convert_v7_0(player)
  }
})

function convert_v7_0(player: Player): void {
  player.setDynamicProperty("waypointConfig", undefined)
  player.setDynamicProperty("aw:death", player.getDynamicProperty("advancedWaypoint:deathCount"))
  player.setDynamicProperty("advancedWaypoint:deathCount", undefined)

  const allDynamic = player.getDynamicPropertyIds()
  for(const dynamic of allDynamic){
    if(!dynamic.startsWith("waypointList")) continue

    const info = player.getDynamicProperty(dynamic)
    if(typeof info != "string") continue

    const waypoints = JSON.parse(info) as OldWaypointInfo[]
    for(const way of waypoints) player.setDynamicProperty(`${way.world.replace("minecraft:", "")}/${way.visible ? 1 : 0}/${way.icon == 7 ? 1 : 0}/${way.rgb.r},${way.rgb.g},${way.rgb.b}/${Math.floor(way.pos.x)},${way.pos.y},${Math.floor(way.pos.z)}/${way.id}`, true)
    player.setDynamicProperty(dynamic, undefined)
  }

  player.setDynamicProperty("aw:7.0", true)
  apiWaypointEntity.recoverWaypoints(player)
}

// dimension/visible/icon/color/pos/name

interface OldWaypointInfo {
  id: string
  pos: Vector3
  icon: number
  rgb: {r: number, g: number, b: number}
  world: string
  visible: boolean
}