import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Utilidad para obtener score
export function getScore(objective, player) {
    try {
        return player.scoreboard.getObjective(objective)?.getScore(player) ?? 0;
    } catch {
        return 0;
    }
}

// Menú de personalización de personaje DeadZone
export function showCharacterCustomization(player, onBack) {
    const skins = ["Superviviente", "Militar", "Científico", "Civil"];
    const accesorios = ["Sin accesorio", "Gorra", "Gafas", "Máscara"];
    const form = new ModalFormData()
        .title("§aPersonalización de Personaje")
        .dropdown("Skin", skins, { defaultValueIndex: 0 })
        .dropdown("Accesorio", accesorios, { defaultValueIndex: 0 })
        .toggle("Mostrar mochila", { defaultValue: true });

    form.show(player).then(res => {
        if (res.canceled) return;
        player.sendMessage(`§a¡Personalización guardada!`);
        if (onBack) onBack();
    });
}

// Menú de perfil y estadísticas DeadZone
export function showProfile(player, onBack) {
    const gamertag = player.name;
    const nivel = getScore("player.level", player);
    const kills = getScore("player.kills", player);
    const infectedKills = getScore("infected.kills", player);
    const scavengerKills = getScore("scavenger.kills", player);
    const marauderKills = getScore("marauder.kills", player);
    const wins = getScore("player.wins", player);
    const survivalTime = getScore("survival.time", player);
    const longestKill = getScore("longest.kill.distance", player);

    const form = new ActionFormData()
        .title("§bPerfil de " + gamertag)
        .body(
            `§fNivel: §a${nivel}\n` +
            `§cVictorias: §f${wins}\n` +
            `§eEliminaciones (jugadores): §f${kills}\n` +
            `§2Eliminaciones (infectados): §f${infectedKills}\n` +
            `§6Scavengers: §f${scavengerKills}\n` +
            `§dMarauders: §f${marauderKills}\n` +
            `§bTiempo supervivencia: §f${survivalTime}\n` +
            `§7Kill más lejana: §f${longestKill} bloques`
        )
        .button("§aPersonalizar personaje", "textures/ui/skin_steve.png")
        .button("§cRegresar", "textures/ui/redX1.png");

    form.show(player).then(res => {
        if (res.canceled) return;
        if (res.selection === 0) {
            showCharacterCustomization(player, () => showProfile(player, onBack));
        } else if (onBack) {
            onBack();
        }
    });
}