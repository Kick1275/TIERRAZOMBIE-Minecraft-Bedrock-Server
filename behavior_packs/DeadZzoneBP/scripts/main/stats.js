import * as mc from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import isMoving from "./test.js";

createScore("player.kills");
createScore("infected.kills");
createScore("infected_miniboss.kills");
createScore("scavenger.kills");
createScore("marauder.kills");
createScore("time.playing");
createScore("survival.time");
createScore("distance.walked");
createScore("headshots");
createScore("kills");
createScore("deaths");
createScore("longest.kill.distance");
createScore("survival.time.leaderboard");

function createScore(name) {
    if (mc.world.scoreboard.getObjective(name)) return;
    mc.world.scoreboard.addObjective(name, name);
}

function getScore(objective, plr, setValue = true) {
    try {
        const obj = mc.world.scoreboard.getObjective(objective);
        if (typeof plr === 'string') {
            const participant = obj.getParticipants().find(v => v.displayName === plr);
            return participant ? obj.getScore(participant) : (setValue ? 0 : undefined);
        } else if (plr && plr.scoreboardIdentity) {
            return obj.getScore(plr.scoreboardIdentity) || (setValue ? 0 : undefined);
        }
        return setValue ? 0 : undefined;
    } catch (error) {
        console.error(`Error getting score for ${objective}:`, error);
        return setValue ? 0 : undefined;
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

function resetPlayerScores(pl) {
    const scores = ["player.kills", "infected.kills", "time.playing", "survival.time", "longest.kill.distance", "scavenger.kills", "distance.walked", "marauder.kills"];
    scores.forEach(async (score) => {
        await pl.runCommandAsync(`scoreboard players set @s ${score} 0`);
    });
}

// Translation object for English and Spanish
const languages = {
    en_US: {
        stats_title: "§l§4☢ Apocalyptic Stats ☢",
        wasteland_survivor: "§4☣ Wasteland Survivor ☣",
        carnage_report: "§8☠ Carnage Report ☠",
        player_kills: "§cPlayer Kills: §r{value} §7enemies felled",
        infected_kills: "§2Infected Slain: §r{value} §7undead purged",
        survival_time: "§6Time Survived: §r{value} §7in the apocalypse",
        distance_walked: "§3Distance Trekked: §r{value} §7blocks through ruin",
        longest_kill_distance: "§4Longest Kill Shot: §r{value} §7meters of precision",
        survive_collapse: "§8[ Survive the Collapse ]",
        additional_stats_title: "§l§4☢ Darker Records ☢",
        raiders_ledger: "§4☣ Raider's Ledger ☣",
        hostile_territories: "§8☠ Hostile Territories ☠",
        scavenger_kills: "§eScavenger Kills: §r{value} §7looters vanquished",
        marauder_kills: "§5Marauder Kills: §r{value} §7bandits crushed",
        endure_chaos: "§8[ Endure the Chaos ]",
        more_stats_button: "§l§2↻ More Stats",
        back_button: "§l§6← Back",
        close_button: "§l§c✖ Close"
    },
    es_ES: {
        stats_title: "§l§4☢ Estadísticas Apocalípticas ☢",
        wasteland_survivor: "§4☣ Superviviente del Yermo ☣",
        carnage_report: "§8☠ Informe de Masacre ☠",
        player_kills: "§cAsesinatos de Jugadores: §r{value} §7enemigos derribados",
        infected_kills: "§2Infectados Eliminados: §r{value} §7no muertos purgados",
        survival_time: "§6Tiempo Sobrevivido: §r{value} §7en el apocalipsis",
        distance_walked: "§3Distancia Recorrida: §r{value} §7bloques a través de ruinas",
        longest_kill_distance: "§4Tiro Más Largo: §r{value} §7metros de precisión",
        survive_collapse: "§8[ Sobrevive al Colapso ]",
        additional_stats_title: "§l§4☢ Registros Oscuros ☢",
        raiders_ledger: "§4☣ Registro de Saqueadores ☣",
        hostile_territories: "§8☠ Territorios Hostiles ☠",
        scavenger_kills: "§eAsesinatos de Carroñeros: §r{value} §7saqueadores vencidos",
        marauder_kills: "§5Asesinatos de Merodeadores: §r{value} §7bandidos aplastados",
        endure_chaos: "§8[ Resiste el Caos ]",
        more_stats_button: "§l§2↻ Más Estadísticas",
        back_button: "§l§6← Volver",
        close_button: "§l§c✖ Cerrar"
    }
};

function getPlayerLanguage(player) {
    if (player.hasTag("lang_es_ES")) return "es_ES";
    return "en_US";
}

function showPlayerStats(pl) {
    mc.system.run(() => {
        const lang = getPlayerLanguage(pl);
        const texts = languages[lang];

        const playerKills = getScore('player.kills', pl, true) || 0;
        const infectedKills = getScore('infected.kills', pl, true) || 0;
        const timePlaying = getScore('time.playing', pl, true) || 0;
        const survivalTime = getScore('survival.time', pl, true) || 0;
        const distanceWalked = getScore('distance.walked', pl, true) || 0;
        const longestKillDistance = getScore('longest.kill.distance', pl, true) || 0;

        const bodyRawText = [
            { text: `\n${texts.wasteland_survivor}\n`, bold: true },
            { text: `${texts.carnage_report}\n`, italic: true },
            { text: `${texts.player_kills.replace("{value}", playerKills)}\n\n` },
            { text: `${texts.infected_kills.replace("{value}", infectedKills)}\n\n` },
            { text: `${texts.survival_time.replace("{value}", formatTime(survivalTime))}\n\n` },
            { text: `${texts.distance_walked.replace("{value}", distanceWalked)}\n\n` },
            { text: `${texts.longest_kill_distance.replace("{value}", longestKillDistance)}\n\n` },
            { text: `${texts.survive_collapse}` }
        ];

        const form = new ActionFormData();
        form.title(texts.stats_title);
        form.body({ rawtext: bodyRawText });
        form.button(texts.more_stats_button, "textures/ui/icon_recipe_item");
        form.button(texts.close_button, "textures/ui/icon_trash");

        form.show(pl).then((res) => {
            if (res.selection === 0) {
                showAdditionalStats(pl);
            } else if (res.selection === 1) {
                pl.runCommandAsync(`tag @s remove stats`);
                return;
            }
        });
    });
}

function showAdditionalStats(pl) {
    mc.system.run(() => {
        const lang = getPlayerLanguage(pl);
        const texts = languages[lang];

        const scavengerKills = getScore('scavenger.kills', pl, true) || 0;
        const marauderKills = getScore('marauder.kills', pl, true) || 0;

        const bodyRawText = [
            { text: `\n${texts.raiders_ledger}\n`, bold: true },
            { text: `${texts.hostile_territories}\n`, italic: true },
            { text: `${texts.scavenger_kills.replace("{value}", scavengerKills)}\n\n` },
            { text: `${texts.marauder_kills.replace("{value}", marauderKills)}\n\n` },
            { text: `${texts.endure_chaos}` }
        ];

        const form2 = new ActionFormData();
        form2.title(texts.additional_stats_title);
        form2.body({ rawtext: bodyRawText });
        form2.button(texts.back_button, "textures/ui/icon_previous");
        form2.button(texts.close_button, "textures/ui/icon_trash");

        form2.show(pl).then((res) => {
            if (res.selection === 0) {
                showPlayerStats(pl);
            } else if (res.selection === 1) {
                pl.runCommandAsync(`tag @s remove stats`);
                return;
            }
        });
    });
}

mc.world.afterEvents.entityDie.subscribe(async data => {
    try {
        const deadEntity = data.deadEntity;
        const damageSource = data.damageSource;
        const killer = damageSource?.damagingEntity;

        if (!deadEntity || !killer) {
           // console.log("No deadEntity or killer found.");
            return;
        }

        console.log(`${killer.typeId} was killed by ${deadEntity.typeId}`);

        const survivalTime = getScore("survival.time", deadEntity, true) || 0;
        const leaderboardTime = getScore("survival.time.leaderboard", deadEntity, true) || 0;

        console.log(`Survival Time: ${survivalTime}, Leaderboard Time: ${leaderboardTime}`);

        if (survivalTime > leaderboardTime) {
            const leaderboardObjective = mc.world.scoreboard.getObjective("survival.time.leaderboard");
            const identity = deadEntity.scoreboardIdentity;
            if (identity) {
                leaderboardObjective.setScore(identity, survivalTime);
                console.log(`Updated leaderboard time for ${deadEntity.name}`);
            } else {
                console.log(`No scoreboard identity found for ${deadEntity.name}`);
            }
        }

        const isInfectedType = ['mcpe:civilian_male', 'mcpe:civilian_female', 'mcpe:commander_artic', 'mcpe:commander_desert', 'mcpe:commander_woodland', 'mcpe:hazmat_female', 'mcpe:hazmat_male', 'mcpe:military_artic_female', 'mcpe:military_artic_male', 'mcpe:military_desert_female', 'mcpe:military_desert_male', 'mcpe:military_woodland_female', 'mcpe:military_woodland_male', 'mcpe:militia_female', 'mcpe:militia_male', 'mcpe:screamer', 'mcpe:brute', 'mcpe:riot', 'mcpe:civilian', 'mcpe:hazmat', 'mcpe:commander', 'mcpe:military', 'mcpe:militia'].includes(deadEntity.typeId);

        if (isInfectedType && killer.typeId === 'minecraft:player') {
            await killer.runCommandAsync(`scoreboard players add @s infected.kills 1`);
        }
        
        if (deadEntity.typeId === 'mcpe:scavenger' && killer.typeId === 'minecraft:player') {
            await killer.runCommandAsync(`scoreboard players add @s scavenger.kills 1`);
        }
        
        if (deadEntity.typeId === 'mcpe:marauder' && killer.typeId === 'minecraft:player') {
            await killer.runCommandAsync(`scoreboard players add @s marauder.kills 1`);
        }
        
        if (deadEntity.typeId === 'mcpe:militia' && killer.typeId === 'minecraft:player') {
            await killer.runCommandAsync(`scoreboard players add @s infected_miniboss.kills 1`);
        }

        if (deadEntity.typeId === 'minecraft:player' && killer.typeId === 'minecraft:player') {
            await killer.runCommandAsync(`scoreboard players add @s player.kills 1`);
        }

        if (damageSource.cause === 'override' && (deadEntity.typeId === 'minecraft:player' || deadEntity.typeId === 'minecraft:player')) {
            const distance = Math.sqrt(
                Math.pow(deadEntity.location.x - killer.location.x, 2) +
                Math.pow(deadEntity.location.y - killer.location.y, 2) +
                Math.pow(deadEntity.location.z - killer.location.z, 2)
            );
            const distanceInt = Math.round(distance);
            await killer.runCommandAsync(`scoreboard players set @s longest.kill.distance ${Math.max(distanceInt, getScore('longest.kill.distance', killer, true))}`);
        }

        resetPlayerScores(deadEntity);
        console.log(`Reset scores for ${deadEntity.name}`);
    } catch (e) {
        console.error("Error in entityDie event:", e);
    }
});

mc.system.runInterval(() => {
    for (const player of mc.world.getPlayers()) {
        if (isMoving(player) && player.isOnGround && !player.isSprinting) {
            player.runCommandAsync(`scoreboard players add @s[m=!c] distance.walked 1`);
        }
    }
}, 10);

mc.system.runInterval(() => {
    for (const player of mc.world.getPlayers()) {
        if (isMoving(player) && player.isOnGround && player.isSprinting) {
            player.runCommandAsync(`scoreboard players add @s[m=!c] distance.walked 1`);
        }
    }
}, 5);

mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach(async (player) => {
        await player.runCommandAsync(`scoreboard players add @s[m=!c] survival.time 1`);
    });
}, 20);

export { showPlayerStats };