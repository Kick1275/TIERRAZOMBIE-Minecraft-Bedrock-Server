import { world, Player, RGB, Vector3 } from "@minecraft/server"
import { apiWaypointEntity } from "./entity"
import { apiVec3 } from "../math/vector"
import { apiWarn } from "../player/warn"
import { apiWaypointInfo } from "./info"
import { colorRBG } from "../variables"
import { sameNames } from "./format"

export const apiWaypointCreate = new class ApiWaypointCreate {
  create(player: Player, info: WaypointInfoCreate, showMessage = true, isShare = "no"): void {
    const color: RGB = colorRBG[info.color] ?? {red: 255, green: 255, blue: 255}
    color["red"] += info.color * 1000

    const name = sameNames(info.name, apiWaypointInfo.getAllName(player))
    const pos = apiVec3.center(info.pos)

    player.setDynamicProperty(`${player.dimension.id.replace("minecraft:", "")}/${info.visible ? "1" : "0"}/${apiWaypointEntity.getIcon(info.icon, info.name)}/${color.red},${color.green},${color.blue}/${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}/${name}`, true)

    if(isShare == "no") showMessage
    ? apiWarn.notify(player, {translate: "advanced_waypoints.warn.createPoint", with: [name]}, {sound: "advanced_waypoints.warn.enchanting_table"})
    : apiWarn.notify(player, {translate: "advanced_waypoints.warn.editPoint", with: [name]}, {sound: "advanced_waypoints.warn.break_amethyst"})

    if(isShare != "no") apiWarn.notify(player, {translate: "advanced_waypoints.warn.reciveWaypoint", with: [name, isShare]}, {sound: "advanced_waypoints.warn.enchanting_table"})

    if(info.visible) apiWaypointEntity.spawn(player, {id: name, dim: player.dimension.id, pos: apiVec3.center(info.pos), icon: info.icon, rgb: color})
  }
}

export interface WaypointInfoCreate {
  name: string;
  pos: Vector3;
  icon: number;
  color: number;
  visible: boolean;
}