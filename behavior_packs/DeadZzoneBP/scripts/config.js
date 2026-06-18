import * as mc from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

export let enableShowUiCreativeMod = false;
export let resetOnDeath = true;
export let createCorpseOnDeath = true;
export let despawnTimeSeconds = 180;

// Only Deadzone Entity
export const despawnableEntities = [
    "mcpe:screamer",
    "mcpe:brute",
    "mcpe:riot",
    "mcpe:scavenger",
    "mcpe:marauder",
    "mcpe:civilian",
    "mcpe:military",
    "mcpe:hazmat",
    "mcpe:commander",
    "mcpe:militia"
];

export function configUI(pl) {
    const minuteOptions = Array.from({ length: 20 }, (_, i) => `${i + 1} Minutes`);

    const ui = new ModalFormData()
        .title("DeadZone Settings")
        .dropdown("Set Corpse Despawn Time", minuteOptions, Math.floor(despawnTimeSeconds / 60) - 1)
        .toggle("config.allow_corpse", createCorpseOnDeath)
        .toggle("config.reset_statu_on_death", resetOnDeath)
        .toggle("config.show_statu", enableShowUiCreativeMod);      

    ui.show(pl).then(response => {
        if (response.canceled) return;
        pl.runCommand(`tag @s remove config`);

        despawnTimeSeconds = (response.formValues[0] + 1) * 60;
        createCorpseOnDeath = response.formValues[1];
        resetOnDeath = response.formValues[2];
        enableShowUiCreativeMod = response.formValues[3];
        
        const minutes = Math.floor(despawnTimeSeconds / 60);
        pl.sendMessage(`§aCorpse Despawn time set to ${minutes} minutes.`);
        pl.sendMessage(`§aReset status on death: ${resetOnDeath ? "Enabled" : "Disabled"}.`);
        pl.sendMessage(`§aShow Status in Creative Mode: ${enableShowUiCreativeMod ? "Enabled" : "Disabled"}.`);
        pl.sendMessage(`§aAllow corpse on death: ${createCorpseOnDeath ? "Enabled" : "Disabled"}.`);
    });
}