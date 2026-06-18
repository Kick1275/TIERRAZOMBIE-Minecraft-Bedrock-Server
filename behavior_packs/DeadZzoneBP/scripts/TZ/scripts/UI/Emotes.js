import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source;


    if (data.itemStack.typeId == "tz:ui_de_emotes") {
        system.run(() => showEmoteUI(player));
    }
});


function showEmoteUI(player) {
    let form = new ActionFormData();
    form.title("§7§lEmote UI");

    // Comprobador para los emots
    if (player.hasTag("emote_uno_comprado")) {
        form.button("Emote 1");
    }
    if (player.hasTag("emote_dos_comprado")) {
        form.button("Emote 2");
    }
    if (player.hasTag("emote_tres_comprado")) {
        form.button("Emote 3");
    }

    form.show(player).then(response => {

        if (response.selection === 0) {

            player.runCommand("say Jugador ha ejecutado el Emote Dab!!!");
            player.runCommand('playanimation @s animation.player.custom_emote')
        } else if (response.selection === 1) {
            // Lógica para ejecutar Emote 2
            player.runCommand("say Jugador ha ejecutado el Emote 2");
        } else if (response.selection === 2) {
            // Lógica para ejecutar Emote 3
            player.runCommand("say Jugador ha ejecutado el Emote 3");
        }
    });
}
