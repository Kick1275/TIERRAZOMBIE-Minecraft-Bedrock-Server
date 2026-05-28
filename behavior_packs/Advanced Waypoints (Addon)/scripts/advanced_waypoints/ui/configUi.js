import { apiWaypointEntity } from "../lib/apiwaypoint/entity";
import { system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { apiConfig } from "../lib/player/config";
import { apiWarn } from "../lib/player/warn";
export const dateType = [
    "hh:mm:ss - MM:DD:YY", "hh:mm:ss - DD:MM:YY", "hh:mm:ss - YY:MM:DD",
    "hh:mm:ss - MM:DD:YYYY", "hh:mm:ss - DD:MM:YYYY", "hh:mm:ss - YYYY:MM:DD"
];
export const waypointOptions = new class waypointOptions {
    0(player) {
        const config = apiConfig.get(player);
        new ModalFormData()
            .title("advanced_waypoints.ui.options.general.title")
            .toggle("advanced_waypoints.ui.options.general.toggle.showName", config.name)
            .toggle("advanced_waypoints.ui.options.general.toggle.showDistance", config.dis)
            .toggle("advanced_waypoints.ui.options.general.toggle.alwaysShowInfo", config.showInfo)
            .toggle("advanced_waypoints.ui.options.general.toggle.alwaysShowBeam", config.showBeam)
            .toggle("advanced_waypoints.ui.options.general.toggle.showPos", config.pos)
            .toggle("advanced_waypoints.ui.options.general.toggle.reciveSharing", config.share)
            .toggle("advanced_waypoints.ui.options.general.toggle.createDeathPoint", config.createDP)
            .dropdown("advanced_waypoints.ui.options.general.dropdown.deathPointDate", dateType, config.DPType)
            .submitButton("advanced_waypoints.ui.create.buttonSave")
            .show(player).then(r => {
            if (r.canceled || r.formValues == undefined)
                return apiWarn.notify(player, "advanced_waypoints.warn.cancelOptions", { type: "action_bar", sound: "advanced_waypoints.warn.break" });
            const [showName, showDistance, showInfo, showBeam, showPos, reciveSharing, createDeath, deathDate] = r.formValues;
            config.name = typeof showName == "boolean" ? showName : true;
            config.dis = typeof showDistance == "boolean" ? showDistance : true;
            config.showInfo = typeof showInfo == "boolean" ? showInfo : false;
            config.showBeam = typeof showBeam == "boolean" ? showBeam : false;
            config.pos = typeof showPos == "boolean" ? showPos : true;
            config.share = typeof reciveSharing == "boolean" ? reciveSharing : true;
            config.createDP = typeof createDeath == "boolean" ? createDeath : true;
            config.DPType = typeof deathDate == "number" ? deathDate : 0;
            apiConfig.set(player, config);
            apiWarn.notify(player, "advanced_waypoints.warn.saveOptions", { type: "action_bar", sound: "advanced_waypoints.warn.break_amethyst" });
            system.runTimeout(() => { apiWaypointEntity.recoverWaypoints(player); });
        });
    }
    1(player) {
        apiWaypointEntity.recoverWaypoints(player);
    }
};
