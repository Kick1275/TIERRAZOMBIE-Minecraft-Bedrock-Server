import * as mc from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { configUI } from "../config.js";
import { commandGui } from "./command.js";
import { showPlayerStats } from "./stats.js";
// import { showAvatarGui } from "./skins.js";

function menuGui(player) {
    const form = new ActionFormData();
    form.title("Main Menu");
    form.body("Welcome To Deadzone Menu\n\ntag @s add Host or Admin for config and custom command");
    form.button("Avatar");
    form.button("Status");
    form.button("Admin Command (Admin)");
    form.button("Config (Host)");
    form.button("Close");

    form.show(player).then((res) => {
        if (res.selection === 0) showAvatarGui(player);
        if (res.selection === 1) showPlayerStats(player);
        
        if (res.selection === 2) {
            if (player.hasTag("Admin") || player.hasTag("Mod")) {
                commandGui(player);
            }
        }
        
        if (res.selection === 3) {
            if (player.hasTag("Host")) {
                configUI(player);
            }
        }
        
        if (res.selection === 4) {
            return;
        }
    });
}

mc.world.afterEvents.itemUse.subscribe((eventData) => {
    const player = eventData.source;
    const itemTypeId = eventData.itemStack.typeId;
    if (itemTypeId === "mcpe:addon_menu") {
        menuGui(player);
    }
});

export { menuGui };