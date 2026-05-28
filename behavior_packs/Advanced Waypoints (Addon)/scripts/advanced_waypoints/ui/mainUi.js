import { ModalFormData, MessageFormData, ActionFormData } from "@minecraft/server-ui";
import { apiWaypointInfo } from "../lib/apiwaypoint/info";
import { apiWaypointCreate } from "../lib/apiwaypoint/create";
import { apiWaypointEntity } from "../lib/apiwaypoint/entity";
import { apiWaypointShare } from "../lib/apiwaypoint/share";
import { apiWaypointEdit } from "../lib/apiwaypoint/edit";
import { world } from "@minecraft/server";
import { apiConfig } from "../lib/player/config";
import { apiNumbers } from "../lib/math/numbers";
import { apiWarn } from "../lib/player/warn";
import { waypointOptions } from "./configUi";
import { apiVec3 } from "../lib/math/vector";
import { colorRBG } from "../lib/variables";
import { enableTp } from "../subpack";
export function waypointMenu(player, quickCreate) {
    if (quickCreate)
        return waypointsUIController[1]?.(player);
    const form = new ActionFormData()
        .title("advanced_waypoints.ui.config.title");
    if (enableTp())
        form.button("advanced_waypoints.ui.config.button.teleport", "textures/ui/realmsIcon");
    form.button("advanced_waypoints.ui.config.button.create", "textures/ui/plus")
        .button("advanced_waypoints.ui.config.button.edit", "textures/ui/editIcon")
        .button("advanced_waypoints.ui.config.button.remove", "textures/ui/icon_trash")
        .button("advanced_waypoints.ui.config.button.share", "textures/ui/share_microsoft")
        .button("advanced_waypoints.ui.config.button.options", "textures/ui/settings_glyph_color_2x")
        .show(player).then(r => {
        if (r.canceled || r.selection == undefined)
            return;
        const execute = waypointsUIController[enableTp() ? r.selection : r.selection + 1];
        if (execute)
            execute(player);
    });
}
const waypointsUIController = new class WaypointsUIController {
    0(player) { waypointUi.teleport(player); }
    1(player) { waypointUi.create(player); }
    2(player) { waypointUi.edit(player); }
    3(player) { waypointUi.remove(player); }
    4(player) { waypointUi.share(player); }
    5(player) { waypointUi.options(player); }
};
const icons = ["advanced_waypoints.ui.create.icon.default", "advanced_waypoints.ui.create.icon.death", "advanced_waypoints.ui.create.icon.first_letter"];
const xpSprite = ["", " - \ue701", " - \ue702", " - \ue703", "\ue700"];
const waypointUi = new class WaypointUi {
    create(player, edit) {
        const form = new ModalFormData()
            .title(`advanced_waypoints.ui.${!edit ? "create" : "edit"}.title`)
            .textField("advanced_waypoints.ui.create.name", "advanced_waypoints.ui.create.nameHold", !edit ? undefined : edit.id)
            .textField("advanced_waypoints.ui.create.pos", "advanced_waypoints.ui.create.posHold", !edit ? apiVec3.convertToString(player.location, "floor") : apiVec3.convertToString(apiVec3.offset(edit.pos, apiVec3.offsetDirection["Down"]), "floor"))
            .dropdown("advanced_waypoints.ui.create.icon", icons, !edit ? 2 : apiNumbers.clamp(edit.icon, 0, 2))
            .dropdown("advanced_waypoints.ui.create.color", Object.keys(colorRBG).map(value => `advanced_waypoints.color.${value}`), !edit ? Math.floor(Math.random() * 16) : Math.trunc(edit.rgb.red / 1000));
        if (edit) {
            form.slider({ translate: "advanced_waypoints.ui.create.sliderR" }, 0, 255, 1, edit.rgb.red % 1000)
                .slider({ translate: "advanced_waypoints.ui.create.sliderG" }, 0, 255, 1, edit.rgb.green)
                .slider({ translate: "advanced_waypoints.ui.create.sliderB" }, 0, 255, 1, edit.rgb.blue);
        }
        form.submitButton("advanced_waypoints.ui.create.buttonSave")
            .show(player).then(r => {
            if (r.canceled || r.formValues == undefined)
                return edit ? this.edit(player) : apiWarn.notify(player, "advanced_waypoints.warn.cancelCreatePoint", { type: "action_bar", "sound": "advanced_waypoints.warn.break" });
            const [name, position, icon, color, colorR, colorG, colorB] = r.formValues;
            if (typeof name != "string" || !name)
                return apiWarn.notify(player, "advanced_waypoints.warn.invalidName", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            if (typeof position != "string" || !name)
                return apiWarn.notify(player, "advanced_waypoints.warn.invalidName", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            const xyz = position.split(/[^0-9.,-]+/).filter(p => p !== "").map(p => parseFloat(p.replace(',', '.'))).filter(n => !isNaN(n)).map(n => Math.trunc(n));
            if (xyz.length < 3)
                return apiWarn.notify(player, "advanced_waypoints.warn.invalidPos", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            const pos = { x: xyz[0], y: xyz[1] ? xyz[1] + 1 : xyz, z: xyz[2] };
            if (!apiVec3.isValid(pos))
                return apiWarn.notify(player, "advanced_waypoints.warn.invalidPos", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            if (typeof icon != "number")
                return apiWarn.notify(player, "advanced_waypoints.warn.failCreatePoint", { type: "action_bar", sound: "advanced_waypoints.warn.break" });
            if (typeof color != "number")
                return apiWarn.notify(player, "advanced_waypoints.warn.failCreatePoint", { type: "action_bar", sound: "advanced_waypoints.warn.break" });
            if (edit) {
                const info = {
                    name: name,
                    pos: pos,
                    icon: icon,
                    color: color,
                    colorR: typeof colorR != "number" ? 0 : colorR,
                    colorG: typeof colorG != "number" ? 0 : colorG,
                    colorB: typeof colorB != "number" ? 0 : colorB,
                    visible: edit.visible
                };
                return apiWaypointEdit.edit(player, edit, info);
            }
            const info = {
                name: name,
                pos: pos,
                icon: icon,
                color: color,
                visible: true
            };
            apiWaypointCreate.create(player, info);
        });
    }
    edit(player) {
        const waypoints = apiWaypointInfo.getAll(player);
        if (waypoints.length < 1)
            return apiWarn.notify(player, "advanced_waypoints.warn.dontHavePoints", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
        const config = apiConfig.get(player);
        const buttons = waypoints.map(way => ({ id: config.pos ? `${way.id.slice(0, 21)}${way.id.length > 21 ? "..." : ""}` : way.id, icon: way.icon, visible: way.visible, pos: apiVec3.floor(apiVec3.offset(way.pos, apiVec3.offsetDirection["Down"])) }));
        const form = new ActionFormData()
            .title("advanced_waypoints.ui.edit.title")
            .button("advanced_waypoints.ui.edit.visible", "textures/advanced_waypoints/ui/hide_true");
        buttons.forEach(button => { form.button(`${button.id}${config.pos ? `\n${apiVec3.convertToString(button.pos, "xyzColor")}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`); });
        form.show(player).then(r => {
            if (r.canceled || r.selection == undefined)
                return;
            if (r.selection == 0)
                return this.visible(player);
            const point = waypoints[r.selection - 1];
            if (point == undefined)
                return;
            return this.create(player, { ...point, index: r.selection - 1 });
        });
    }
    visible(player) {
        const waypoints = apiWaypointInfo.getAll(player);
        const config = apiConfig.get(player);
        const form = new ModalFormData()
            .title("advanced_waypoints.ui.edit.visible");
        waypoints.forEach(button => form.toggle(`${button.id}${config.pos ? ` - ${apiVec3.convertToString(button.pos, "xyzColor")}` : ""}`, button.visible));
        form.submitButton("advanced_waypoints.ui.create.buttonSave")
            .show(player).then(({ canceled, formValues }) => {
            if (canceled || formValues == undefined)
                return;
            let amountVisible = 0;
            for (const value of formValues) {
                if (amountVisible >= 10) {
                    apiWarn.notify(player, "advanced_waypoints.warn.manyWaypoints", { sound: "advanced_waypoints.warn.pop" });
                    break;
                }
                if (typeof value == "boolean" && value)
                    amountVisible++;
            }
            for (let i = 0; i < formValues.length; i++) {
                const visibility = formValues[i];
                if (typeof visibility != "boolean")
                    continue;
                const info = waypoints[i];
                if (!info)
                    continue;
                if (info.visible == visibility)
                    continue;
                apiWaypointEntity.remove(player, info.id);
                apiWaypointInfo.remove(player, info.id);
                player.setDynamicProperty(`${info.dim}/${visibility ? "1" : "0"}/${info.icon}/${info.rgb.red},${info.rgb.green},${info.rgb.blue}/${Math.floor(info.pos.x)},${Math.floor(info.pos.y)},${Math.floor(info.pos.z)}/${info.id}`, true);
                if (visibility)
                    apiWaypointEntity.spawn(player, { ...info, icon: info.icon, rgb: info.rgb });
            }
        });
    }
    remove(player) {
        const waypoints = apiWaypointInfo.getAll(player);
        if (waypoints.length < 1)
            return apiWarn.notify(player, { translate: "advanced_waypoints.warn.dontHavePoints" }, { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
        const config = apiConfig.get(player);
        const form = new ActionFormData()
            .title("advanced_waypoints.ui.delete.title")
            .body("advanced_waypoints.ui.delete.body");
        waypoints.forEach(button => { form.button(`${button.id}${config.pos ? `\n${apiVec3.convertToString(button.pos, "xyzColor")}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`); });
        form.show(player).then(({ canceled, selection }) => {
            if (canceled || selection == undefined)
                return;
            const point = waypoints[selection];
            if (!point)
                return apiWarn.notify(player, "advanced_waypoints.warn.waypointNotFound", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            new MessageFormData()
                .title("advanced_waypoints.ui.delete.title")
                .body({ "rawtext": [{ "translate": "advanced_waypoints.ui.delete.confirm1", "with": [point.id] }, { "translate": `${config.pos ? "advanced_waypoints.ui.delete.confirm2" : ""}`, "with": [apiVec3.convertToString(point.pos, "xyz")] }, { "text": "?" }] })
                .button1("advanced_waypoints.ui.yes")
                .button2("advanced_waypoints.ui.no")
                .show(player).then(r2 => {
                if (r2.canceled || r2.selection == 1)
                    return apiWarn.notify(player, "advanced_waypoints.warn.dontDelete", { type: "action_bar", sound: "advanced_waypoints.warn.orb" });
                apiWaypointEntity.remove(player, point.id);
                apiWaypointInfo.remove(player, point.id);
                apiWarn.notify(player, { translate: "advanced_waypoints.warn.deleted", with: [point.id] }, { type: "action_bar", sound: "advanced_waypoints.warn.deactive" });
                return this.remove(player);
            });
        });
    }
    teleport(player) {
        const waypoints = apiWaypointInfo.getAll(player);
        if (waypoints.length < 1)
            return apiWarn.notify(player, "advanced_waypoints.warn.dontHavePoints", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
        const config = apiConfig.get(player);
        const buttons = waypoints.map(way => {
            const cost = apiNumbers.calculateCost(player.location, way.pos);
            return { id: `${config.pos ? `${way.id.slice(0, 21)}${way.id.length > 21 ? "..." : ""}` : way.id}${cost > 3 ? " - §l§2" + xpSprite[4] + cost + "§r" : xpSprite[cost]}`, icon: way.icon, visible: way.visible, pos: apiVec3.offset(apiVec3.floor(way.pos), apiVec3.offsetDirection["Down"]), cost: cost };
        });
        const form = new ActionFormData()
            .title("advanced_waypoints.ui.tp.title");
        buttons.forEach(button => { form.button(`${button.id}${config.pos ? `\n${apiVec3.convertToString(button.pos, "xyzColor")}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`); });
        form.show(player).then(r => {
            if (r.canceled || r.selection == undefined)
                return;
            const button = buttons[r.selection];
            if (!button)
                return;
            if (player.level < button.cost && player.getGameMode() != "creative")
                return apiWarn.notify(player, "advanced_waypoints.warn.insufficientXp", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
            const pos = waypoints[r.selection]?.pos;
            if (!pos)
                return;
            player.addLevels(-button.cost);
            player.tryTeleport(apiVec3.offset(pos, { x: 0, y: -1.5, z: 0 }));
        });
    }
    share(player) {
        const allPlayers = world.getPlayers({ excludeNames: [player.nameTag] });
        if (allPlayers.length < 1)
            return apiWarn.notify(player, "advanced_waypoints.warn.noPlayersOnline", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
        const allPoints = apiWaypointInfo.getAll(player);
        if (allPoints.length < 1)
            return apiWarn.notify(player, "advanced_waypoints.warn.dontHavePoints", { type: "action_bar", sound: "advanced_waypoints.warn.bass" });
        const config = apiConfig.get(player);
        // Select the waypoint
        const form1 = new ActionFormData()
            .title("advanced_waypoints.ui.config.button.share")
            .body("advanced_waypoints.ui.share.waypoints");
        allPoints.forEach(button => { form1.button(`${button.id}${config.pos ? `\n${apiVec3.convertToString(button.pos, "xyzColor")}` : ""}`, `textures/advanced_waypoints/ui/${iconPathId[button.icon]}_${button.visible}`); });
        form1.show(player).then(({ canceled, selection }) => {
            if (canceled || selection == undefined)
                return apiWarn.notify(player, "advanced_waypoints.warn.dontShared", { type: "action_bar" });
            const point = allPoints[selection];
            if (!point)
                return;
            // Select the player to recive
            const form2 = new ActionFormData()
                .title("advanced_waypoints.ui.config.button.share")
                .body("advanced_waypoints.ui.share.players");
            allPlayers.forEach(player => { form2.button(player.nameTag); });
            form2.show(player).then(({ canceled: canceled2, selection: targetIndex }) => {
                if (canceled2 || targetIndex == undefined) {
                    apiWarn.notify(player, "advanced_waypoints.warn.dontShared", { type: "action_bar" });
                    return this.share(player);
                }
                const target = allPlayers[targetIndex];
                if (!target)
                    return;
                const targetConfig = apiConfig.get(target);
                if (!targetConfig.share)
                    return apiWarn.notify(player, "advanced_waypoints.warn.targetDontAcceptShare", { sound: "advanced_waypoints.warn.break" });
                // Confirm the sharing
                new MessageFormData()
                    .title("advanced_waypoints.ui.config.button.share")
                    .body({ translate: "advanced_waypoints.ui.share.confirm.body", with: [point.id, target.nameTag] })
                    .button1("advanced_waypoints.ui.yes")
                    .button2("advanced_waypoints.ui.no")
                    .show(player).then(({ canceled: canceled3, selection: confirm }) => {
                    if (canceled3 || confirm == 1) {
                        apiWarn.notify(player, "advanced_waypoints.warn.dontShared", { type: "action_bar" });
                        return this.share(player);
                    }
                    apiWaypointShare.share(player, target, { name: point.id, pos: point.pos, icon: point.icon, color: Math.trunc(point.rgb.red / 1000), visible: true });
                    return this.share(player);
                });
            });
        });
    }
    options(player) {
        new ActionFormData()
            .title("advanced_waypoints.ui.options.title")
            .button("advanced_waypoints.ui.options.general.title")
            .button("advanced_waypoints.ui.options.recover.title")
            .show(player).then(r => {
            if (r.canceled || r.selection == undefined)
                return;
            const execute = waypointOptions[r.selection];
            if (execute)
                execute(player);
        });
    }
};
const iconPathId = [
    "waypoint_icon",
    "death_icon",
    "a_icon",
    "b_icon",
    "c_icon",
    "d_icon",
    "e_icon",
    "f_icon",
    "g_icon",
    "h_icon",
    "i_icon",
    "j_icon",
    "k_icon",
    "l_icon",
    "m_icon",
    "n_icon",
    "o_icon",
    "p_icon",
    "q_icon",
    "r_icon",
    "s_icon",
    "t_icon",
    "u_icon",
    "v_icon",
    "w_icon",
    "x_icon",
    "y_icon",
    "z_icon",
];
