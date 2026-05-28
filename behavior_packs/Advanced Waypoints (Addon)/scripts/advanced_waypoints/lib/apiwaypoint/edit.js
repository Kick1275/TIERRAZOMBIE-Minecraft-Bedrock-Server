import { apiWaypointEntity } from "./entity";
import { apiWaypointShare } from "./share";
import { apiVec3 } from "../math/vector";
import { apiWarn } from "../player/warn";
import { apiWaypointInfo } from "./info";
import { colorRBG } from "../variables";
import { sameNames } from "./format";
export const apiWaypointEdit = new class ApiWaypointEdit {
    edit(player, oldInfo, info, sound = true) {
        apiWaypointInfo.remove(player, oldInfo.id);
        apiWaypointEntity.remove(player, oldInfo.id);
        if (oldInfo.id != info.name)
            apiWaypointShare.removeFromList(player, oldInfo.id);
        const name = sameNames(info.name, apiWaypointInfo.getAllName(player, oldInfo.id));
        const pos = apiVec3.center(info.pos);
        const oldColor = Math.trunc(oldInfo.rgb.red / 1000);
        const color = info.color != oldColor ? { ...(colorRBG[info.color] ?? { red: 255, green: 255, blue: 255 }) } : { red: info.colorR, green: info.colorG, blue: info.colorB };
        color["red"] += info.color * 1000;
        player.setDynamicProperty(`${oldInfo.dim}/${info.visible ? "1" : "0"}/${apiWaypointEntity.getIcon(info.icon, info.name)}/${color.red},${color.green},${color.blue}/${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}/${name}`, true);
        if (info.visible)
            apiWaypointEntity.spawn(player, { id: name, dim: oldInfo.dim, pos: pos, icon: info.icon, rgb: { red: color.red, green: color.green, blue: color.blue } });
        apiWarn.notify(player, { translate: `advanced_waypoints.warn.editPoint`, with: [name] }, { sound: sound ? "advanced_waypoints.warn.break_amethyst" : undefined });
    }
};
