import { ActionFormData } from "@minecraft/server-ui";
import { menuGui } from "./main-menu.js";

export function commandGui(player) {
	const form = new ActionFormData();
	form.title("Admin Command");
	form.body(``);
	form.button("Creative Mode");
	form.button("Survival Mode");
	form.button("Spectator Mode");
	form.button("Kill All Entities (Except for players)");
	form.button("Kill Yourself");
	form.button("Kill All Players (Please be careful)");
	form.button("Clear All Corpse");
	form.button("Back");
	form.show(player).then((res) => {
		if (res.selection === 0) {
			player.runCommand("gamemode c");
		}
		if (res.selection === 1) {
			player.runCommand("gamemode s");
		}
		if (res.selection === 2) {
			player.runCommand("gamemode spectator");
		}
		if (res.selection === 3) {
			player.runCommand("kill @e[type=!player]");
		}
		if (res.selection === 4) {
			player.runCommand("kill @s");
		}
		if (res.selection === 5) {
			player.runCommand("kill @a");
		}
		if (res.selection === 6) {
			player.runCommand("event entity @e[family=body] despawn");
		}
		if (res.selection === 7) {
			menuGui(player)
		}
	});
}