import { apiWaypointCreate } from "../lib/apiwaypoint/create";
import { world } from "@minecraft/server";
import { apiConfig } from "../lib/player/config";
import { dateType } from "../ui/configUi";
import { apiVec3 } from "../lib/math/vector";
world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    const player = deadEntity;
    const dynamic = player.getDynamicProperty("aw:death");
    const deathCount = typeof dynamic != "number" ? 1 : dynamic + 1;
    player.setDynamicProperty("aw:death", deathCount);
    const config = apiConfig.get(player);
    if (!config.createDP)
        return;
    apiWaypointCreate.create(player, { name: setDate(deathCount, config.DPType), icon: 1, color: 5, pos: apiVec3.offset(apiVec3.floor(player.location), apiVec3.offsetDirection["Up"]), visible: true }, false);
}, { entityTypes: ["minecraft:player"] });
function setDate(deathCount, type) {
    const order = dateType[type]?.replace(" - ", ":").split(":");
    if (!order)
        return `Death ${deathCount}`;
    const date = new Date();
    const dates = [];
    order.forEach(d => {
        if (d == "YY")
            dates.push(`${JSON.stringify(date.getFullYear()).slice(2)}`);
        if (d == "MM")
            dates.push(`${date.getMonth() + 1}`);
        if (d != "YY" && d != "MM") {
            const time = dateInfo[d]?.(date);
            if (time)
                dates.push(`${time}`);
        }
    });
    return `Death ${deathCount} - ${dates[0]?.padStart(2, "0")}:${dates[1]?.padStart(2, "0")}:${dates[2]?.padStart(2, "0")} - ${dates[3]?.padStart(2, "0")}/${dates[4]?.padStart(2, "0")}/${dates[5]}`;
}
const dateInfo = {
    "ss": (date) => { return date.getSeconds(); },
    "mm": (date) => { return date.getMinutes(); },
    "hh": (date) => { return date.getHours(); },
    "DD": (date) => { return date.getDate(); },
    "MM": (date) => { return date.getMonth(); },
    "YY": (date) => { return date.getFullYear(); },
    "YYYY": (date) => { return date.getFullYear(); }
};
