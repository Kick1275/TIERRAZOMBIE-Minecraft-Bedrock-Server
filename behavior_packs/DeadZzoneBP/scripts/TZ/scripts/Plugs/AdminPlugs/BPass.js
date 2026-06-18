console.warn("Cargando el script del Pase de Batalla...");

import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Datos en memoria para jugadores, recompensas, estadísticas y respaldo
let battlePassData = {};
let battlepass_stats = {};
let battlepass_backup = null;

// Configuración de crates
const cratesConfig = {
    "tz:crate_oak": {
        title: "Crate de Roble",
        key: "tz:key_oak",
        itemCount: 3,
        items: [
            { id: "tz:wooden_sword", name: "Espada de Madera" },
            { id: "tz:ammo_9mm", name: "Munición 9mm" },
            { id: "tz:bandage", name: "Vendaje" }
        ]
    },
    "tz:crate_oro": {
        title: "Crate de Oro",
        key: "tz:key_oro",
        itemCount: 3,
        items: [
            { id: "tz:golden_sword", name: "Espada de Oro" },
            { id: "tz:ammo_45acp", name: "Munición .45 ACP" },
            { id: "tz:first_aid", name: "Kit de Primeros Auxilios" }
        ]
    },
    "tz:crate_emerald": {
        title: "Crate de Esmeralda",
        key: "tz:key_emerald",
        itemCount: 3,
        items: [
            { id: "tz:emerald_sword", name: "Espada de Esmeralda" },
            { id: "tz:ammo_sniper", name: "Munición de Francotirador" },
            { id: "tz:medkit", name: "Botiquín" }
        ]
    },
    "tz:crate_diamond": {
        title: "Crate de Diamante",
        key: "tz:key_diamond",
        itemCount: 3,
        items: [
            { id: "tz:diamond_sword", name: "Espada de Diamante" },
            { id: "tz:ammo_heavy", name: "Munición Pesada" },
            { id: "tz:advanced_medkit", name: "Botiquín Avanzado" }
        ]
    },
    "tz:crate_netherita": {
        title: "Crate de Netherita",
        key: "tz:key_netherite",
        itemCount: 3,
        items: [
            { id: "tz:netherite_sword", name: "Espada de Netherita" },
            { id: "tz:ammo_explosive", name: "Munición Explosiva" },
            { id: "tz:elite_medkit", name: "Botiquín Élite" }
        ]
    }
};

// Recompensas por defecto
let rewards = [
    { "name": "Crate de Inicio Gratis!", "xp": 0, "passCoins": 0, "commands": "give @s bread 5" },
    { "name": "Crate de Madera Gratis!", "xp": 25, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 50, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 100, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 150, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 200, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 250, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 300, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 350, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 400, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 500, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 600, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 700, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 800, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 900, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Oro Gratis!", "xp": 1000, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1100, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1200, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1300, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1400, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1600, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1800, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2000, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2200, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2400, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2600, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2800, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3000, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3200, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3400, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 3700, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4000, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4300, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4600, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4900, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5200, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5500, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5800, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6100, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6400, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6800, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 7200, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 7600, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 8000, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 8400, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Diamante Gratis!", "xp": 8800, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 9200, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 9600, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 10000, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 10400, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Netherita Gratis!", "xp": 10900, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 11400, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 11900, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 12400, "passCoins": 100, "commands": "give @s tz:key_netherita" }
];

// Inicializar recompensas (no se carga desde base de datos externa)
function initializeRewards() {
    console.warn("Recompensas inicializadas en memoria.");
}

// Inicializar recompensas al cargar el script
initializeRewards();

const LEVELS_PER_PAGE = 7;

// Obtener o inicializar datos del jugador
function getPlayerData(player) {
    const xp = getPlayerXP(player);
    const passCoins = getPlayerPassCoins(player);
    if (!battlePassData[player.nameTag]) {
        battlePassData[player.nameTag] = { xp, passCoins };
    } else {
        // Sincronizar con los scoreboards
        battlePassData[player.nameTag].xp = xp;
        battlePassData[player.nameTag].passCoins = passCoins;
    }
    console.warn(`Datos del jugador ${player.nameTag}: ${JSON.stringify(battlePassData[player.nameTag])}`);
    return battlePassData[player.nameTag];
}

// Verificar si una recompensa ha sido reclamada usando tags
function hasClaimedReward(player, level) {
    return player.hasTag(`bp_claimed_level_${level + 1}`);
}

// Marcar una recompensa como reclamada usando tags
function markRewardAsClaimed(player, level) {
    player.addTag(`bp_claimed_level_${level + 1}`);
    console.warn(`Recompensa del nivel ${level + 1} marcada como reclamada para ${player.nameTag}`);
}

// Obtener recompensas (directamente desde la variable en memoria)
function getUpdatedRewards() {
    console.warn(`Recompensas cargadas desde memoria: ${JSON.stringify(rewards).slice(0, 100)}...`);
    return rewards;
}

// Scoreboard functions
function getScore(player, objective) {
    try {
        const scoreboard = world.scoreboard.getObjective(objective);
        if (!scoreboard) {
            console.warn(`Objetivo ${objective} no encontrado para ${player.nameTag}`);
            return 0;
        }
        const score = scoreboard.getScore(player) || 0;
        console.warn(`Score obtenido para ${player.nameTag} en ${objective}: ${score}`);
        return score;
    } catch (e) {
        console.warn(`Error al obtener score para ${player.nameTag} en ${objective}: ${e}`);
        return 0;
    }
}

function addScore(player, objective, amount) {
    try {
        const scoreboard = world.scoreboard.getObjective(objective);
        if (!scoreboard) {
            world.scoreboard.addObjective(objective, objective);
        }
        player.runCommand(`scoreboard players add "${player.nameTag}" ${objective} ${amount}`);
        console.warn(`Añadido ${amount} a ${objective} para ${player.nameTag}`);
        // Actualizar datos en memoria
        if (battlePassData[player.nameTag]) {
            battlePassData[player.nameTag][objective] = getScore(player, objective);
        }
    } catch (e) {
        console.warn(`Error al añadir score a ${objective} para ${player.nameTag}: ${e}`);
    }
}

function removeScore(player, objective, amount) {
    try {
        const scoreboard = world.scoreboard.getObjective(objective);
        if (!scoreboard) {
            world.scoreboard.addObjective(objective, objective);
        }
        player.runCommand(`scoreboard players remove "${player.nameTag}" ${objective} ${amount}`);
        console.warn(`Removido ${amount} de ${objective} para ${player.nameTag}`);
        // Actualizar datos en memoria
        if (battlePassData[player.nameTag]) {
            battlePassData[player.nameTag][objective] = getScore(player, objective);
        }
    } catch (e) {
        console.warn(`Error al remover score de ${objective} para ${player.nameTag}: ${e}`);
    }
}

function setScore(player, objective, value) {
    try {
        const scoreboard = world.scoreboard.getObjective(objective);
        if (!scoreboard) {
            world.scoreboard.addObjective(objective, objective);
        }
        player.runCommand(`scoreboard players set "${player.nameTag}" ${objective} ${value}`);
        console.warn(`Establecido ${value} en ${objective} para ${player.nameTag}`);
        // Actualizar datos en memoria
        if (battlePassData[player.nameTag]) {
            battlePassData[player.nameTag][objective] = value;
        }
    } catch (e) {
        console.warn(`Error al establecer score en ${objective} para ${player.nameTag}: ${e}`);
    }
}

// Calcular el nivel máximo desbloqueado por XP
function getMaxUnlockedLevel(xp) {
    let level = 0;
    const currentRewards = getUpdatedRewards();
    for (let i = 0; i < currentRewards.length; i++) {
        if (xp >= currentRewards[i].xp) level = i + 1;
        else break;
    }
    console.warn(`Nivel máximo desbloqueado para ${xp} XP: ${level}`);
    return level;
}

// Mostrar la página del pase de batalla
export function showBattlePassPage(player, page = 0) {
    const data = getPlayerData(player);
    const xp = getPlayerXP(player);
    const passCoins = getPlayerPassCoins(player);
    const currentRewards = getUpdatedRewards();
    const unlockedLevel = getMaxUnlockedLevel(xp);
    const isAdmin = player.hasTag("admin");

    console.warn(`Mostrando página ${page + 1} para ${player.nameTag}. XP: ${xp}, PassCoins: ${passCoins}, Nivel desbloqueado: ${unlockedLevel}`);

    const start = page * LEVELS_PER_PAGE;
    const end = Math.min(start + LEVELS_PER_PAGE, currentRewards.length);

    const form = new ActionFormData()
        .title(`§l§6Pase de Batalla §r§7(Página ${page + 1}/${Math.ceil(currentRewards.length / LEVELS_PER_PAGE)})`)
        .body(
            `§eTu XP: §l${xp}\n§dTus PassCoins: §l${passCoins}\n\n` +
            `§bNivel desbloqueado por XP: §l${unlockedLevel}\n\n` +
            "§7¡Reclama tus recompensas desbloqueando niveles con XP y PassCoins!"
        );

    if (isAdmin) {
        form.button("§4§l⚡ Panel Admin", "textures/ui/permissions_operator_new.png");
    }

    for (let i = start; i < end; i++) {
        const req = currentRewards[i];
        let estado = "";
        if (hasClaimedReward(player, i)) {
            estado = "§a✔ RECLAMADO";
        } else if (i + 1 > unlockedLevel) {
            estado = `§8🔒 Necesitas ${req.xp} XP`;
        } else if (passCoins < req.passCoins) {
            let faltaPC = req.passCoins - passCoins;
            estado = `§c❌ Te faltan ${faltaPC} PassCoins (Requiere ${req.passCoins})`;
        } else {
            estado = "§e¡Disponible para reclamar!";
        }
        form.button(
            `§l§3Nivel ${i + 1}\n${req.name}\n§7XP: §b${req.xp} §7| PassCoins: §d${req.passCoins}\n${estado}`,
            hasClaimedReward(player, i) ? "textures/ui/check.png" : (estado.includes("🔒") ? "textures/ui/lock.png" : "textures/ui/icon_select.png")
        );
    }

    let claimableIndex = -1;
    for (let i = 0; i < currentRewards.length; i++) {
        if (i + 1 <= unlockedLevel && !hasClaimedReward(player, i) && passCoins >= currentRewards[i].passCoins) {
            claimableIndex = i;
            break;
        }
    }
    if (claimableIndex !== -1 && claimableIndex >= start && claimableIndex < end) {
        form.button("§a🎁 Reclamar recompensa disponible", "textures/ui/gift.png");
    }

    if (page > 0) form.button("§7⬅ Página anterior", "textures/ui/arrow_left.png");
    if (end < currentRewards.length) form.button("§7➡ Página siguiente", "textures/ui/arrow_right.png");

    form.show(player).then(res => {
        if (res.canceled) {
            console.warn(`Menú cancelado por ${player.nameTag}`);
            return;
        }

        let btn = res.selection;
        const adjustedSelection = isAdmin ? btn - 1 : btn;

        if (isAdmin && btn === 0) {
            showAdminMenu(player);
            return;
        }

        if (claimableIndex !== -1 && adjustedSelection === (end - start)) {
            console.warn(`Intentando reclamar rápidamente nivel ${claimableIndex + 1} para ${player.nameTag}`);
            showClaimInfoPage(player, claimableIndex, currentRewards[claimableIndex], page);
            return;
        }

        let navOffset = 0;
        if (claimableIndex !== -1 && claimableIndex >= start && claimableIndex < end) navOffset = 1;
        if (btn === (end - start) + navOffset && page > 0) {
            console.warn(`Navegando a página anterior: ${page - 1}`);
            showBattlePassPage(player, page - 1);
            return;
        }
        if (btn === (end - start) + navOffset + (page > 0 ? 1 : 0) && end < currentRewards.length) {
            console.warn(`Navegando a página siguiente: ${page + 1}`);
            showBattlePassPage(player, page + 1);
            return;
        }

        const nivel = start + adjustedSelection;
        if (nivel >= currentRewards.length) {
            console.warn(`Selección inválida: ${nivel}`);
            return;
        }

        const req = currentRewards[nivel];
        if (hasClaimedReward(player, nivel)) {
            console.warn(`Recompensa del nivel ${nivel + 1} ya reclamada por ${player.nameTag}`);
            showInfoPage(player, "§a¡Ya reclamaste esta recompensa!",
                `§7La recompensa del nivel §b${nivel + 1}§7 ya fue reclamada.\n\n§e¡Sigue avanzando para obtener más recompensas!`, page);
        } else if (nivel + 1 > unlockedLevel) {
            console.warn(`Nivel ${nivel + 1} bloqueado para ${player.nameTag}. XP necesario: ${req.xp}`);
            showInfoPage(player, "§cNivel bloqueado",
                `§7Necesitas §b${req.xp} XP§7 para desbloquear este nivel.\n\n§eSigue jugando, matando mobs, completando misiones o participando en eventos para ganar XP.`, page);
        } else if (passCoins < req.passCoins) {
            let faltaPC = Math.max(0, req.passCoins - passCoins);
            console.warn(`Faltan ${faltaPC} PassCoins para reclamar nivel ${nivel + 1} por ${player.nameTag}`);
            showInfoPage(player, "§cNo tienes suficientes PassCoins",
                `§7Te falta:\n§d${faltaPC} PassCoins (Requiere ${req.passCoins})\n\n§e¿Cómo conseguir PassCoins?\n§7- Compra en la tienda\n- Participa en sorteos\n- Logros especiales`, page);
        } else {
            console.warn(`Mostrando página de reclamación para nivel ${nivel + 1} para ${player.nameTag}`);
            showClaimInfoPage(player, nivel, req, page);
        }
    });
}

// Página de información general antes de reclamar
function showClaimInfoPage(player, nivel, req, page) {
    const crateId = req.commands.match(/give @s (tz:crate_\w+)/)?.[1];
    const crateDesc = crateId ? getCrateDescription(crateId) : "Crate desconocida";

    const form = new ActionFormData()
        .title("§dInformación de Recompensa")
        .body(
            `§6Vas a reclamar:\n\n` +
            `§l§3Nivel ${nivel + 1}\n${req.name}\n` +
            `§7XP requerido: §b${req.xp}\n` +
            `§7PassCoins requeridos: §d${req.passCoins}\n\n` +
            `§eContenido Posible:\n${crateDesc}`
        )
        .button("§a✅ Reclamar recompensa", "textures/ui/check.png")
        .button("§c❌ Cancelar", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled) {
            console.warn(`Reclamación cancelada por ${player.nameTag} para nivel ${nivel + 1}`);
            showBattlePassPage(player, page);
            return;
        }
        if (res.selection === 0) {
            if (hasClaimedReward(player, nivel)) {
                console.warn(`Doble verificación: Nivel ${nivel + 1} ya reclamado por ${player.nameTag}`);
                player.sendMessage("§cEsta recompensa ya fue reclamada.");
                showBattlePassPage(player, page);
                return;
            }
            const currentPassCoins = getPlayerPassCoins(player);
            if (currentPassCoins < req.passCoins) {
                console.warn(`Faltan PassCoins para ${player.nameTag}. Tiene ${currentPassCoins}, requiere ${req.passCoins}`);
                player.sendMessage("§cNo tienes suficientes PassCoins.");
                showBattlePassPage(player, page);
                return;
            }
            try {
                removeScore(player, "passcoins", req.passCoins);
                markRewardAsClaimed(player, nivel);
                statsSystem.updateStats("rewardsClaimed", 1);
                statsSystem.updateStats("passCoinsSpent", req.passCoins);
                console.warn(`Recompensa del nivel ${nivel + 1} reclamada por ${player.nameTag}. Comandos: ${req.commands}`);
                player.sendMessage(`§6¡Recompensa de nivel ${nivel + 1} reclamada! §r${req.name}`);
                ejecutarComandosRecompensa(player, req.commands);
            } catch (e) {
                console.warn(`Error al reclamar recompensa para ${player.nameTag}: ${e}`);
                player.sendMessage("§cError al reclamar la recompensa. Contacta al administrador.");
            }
        }
        system.run(() => showBattlePassPage(player, Math.floor(nivel / LEVELS_PER_PAGE)));
    });
}

// Página informativa para bloqueos o recursos insuficientes
function showInfoPage(player, titulo, mensaje, page) {
    const xp = getPlayerXP(player);
    const passCoins = getPlayerPassCoins(player);
    const form = new ActionFormData()
        .title(titulo)
        .body(
            `${mensaje}\n\n§eTu XP actual: §b${xp}\n§dTus PassCoins: §b${passCoins}`
        )
        .button("§aVolver al Pase de Batalla", "textures/ui/arrow_left.png");

    form.show(player).then(() => {
        console.warn(`Volviendo al pase de batalla, página ${page} para ${player.nameTag}`);
        system.run(() => showBattlePassPage(player, page));
    });
}

// Evento para abrir el pase de batalla con un palo
world.afterEvents.itemUse.subscribe(event => {
    const player = event.source;
    const item = event.itemStack;
    if (!player || !player.nameTag) return;
    if (item && item.typeId === "minecraft:stick") {
        console.warn(`Abriendo pase de batalla para ${player.nameTag}`);
        player.runCommand('playsound random.orb @s');
        system.run(() => showBattlePassPage(player, 0));
    }
});

// Funciones modernas para obtener XP y PassCoins
function getPlayerXP(player) {
    const score = getScore(player, "xp");
    console.warn(`XP de ${player.nameTag}: ${score}`);
    return score;
}

function getPlayerPassCoins(player) {
    const score = getScore(player, "passcoins");
    console.warn(`PassCoins de ${player.nameTag}: ${score}`);
    return score;
}

function ejecutarComandosRecompensa(player, comandos) {
    if (!comandos) {
        console.warn(`No hay comandos para ejecutar en la recompensa para ${player.nameTag}`);
        return;
    }
    comandos.split(",").forEach(cmd => {
        const comando = cmd.trim();
        if (comando.length > 0) {
            try {
                player.runCommand(comando);
                console.warn(`Ejecutado comando: ${comando} para ${player.nameTag}`);
            } catch (e) {
                console.warn(`Error al ejecutar comando: ${comando} para ${player.nameTag}: ${e}`);
                player.sendMessage(`§cError al ejecutar: ${comando}`);
            }
        }
    });
}

// Actualizar la función de edición de recompensas
export function updateRewards(newRewards) {
    rewards = newRewards;
    console.warn("Recompensas actualizadas en memoria.");
}

// Función para obtener descripción de crates
function getCrateDescription(crateId) {
    const crate = cratesConfig[crateId];
    if (!crate) return "Contenido desconocido";

    const categories = {
        armas: [],
        armadura: [],
        municion: [],
        consumibles: [],
        especial: []
    };

    crate.items.forEach(item => {
        if (item.id.includes("ammo")) {
            categories.municion.push(item.name);
        } else if (item.id.includes("helmet") || item.id.includes("vest") || item.id.includes("chestplate")) {
            categories.armadura.push(item.name);
        } else if (item.id.includes("golden_apple") || item.id.includes("first_aid") || item.id.includes("medkit")) {
            categories.consumibles.push(item.name);
        } else if (item.id.includes("sword") || item.id.includes("gun")) {
            categories.armas.push(item.name);
        } else {
            categories.especial.push(item.name);
        }
    });

    let desc = `§e${crate.title}\n§7Obtendrás §b${crate.itemCount} §7items aleatorios de:\n\n`;
    if (categories.armas.length) desc += `§cArmas: §7${[...new Set(categories.armas)].slice(0,3).join(", ")}...\n`;
    if (categories.armadura.length) desc += `§bArmadura: §7${[...new Set(categories.armadura)].slice(0,3).join(", ")}...\n`;
    if (categories.municion.length) desc += `§eMunición: §7${[...new Set(categories.municion)].slice(0,3).join(", ")}...\n`;
    if (categories.consumibles.length) desc += `§aConsumibles: §7${[...new Set(categories.consumibles)].slice(0,3).join(", ")}...\n`;
    if (categories.especial.length) desc += `§dEspeciales: §7${[...new Set(categories.especial)].slice(0,3).join(", ")}...\n`;
    
    desc += `\n§7Necesitas una §6${crate.key}§7 para abrir esta crate.`;
    return desc;
}

// Constantes para administración
const ADMIN_TAG = "admin";
const ADMIN_OPERATIONS = {
    VIEW_PLAYER_DATA: "ver_datos",
    DELETE_PLAYER_DATA: "eliminar_datos",
    RESET_ALL_DATA: "reset_total",
    UPDATE_REWARDS: "actualizar_recompensas",
    BACKUP_DATA: "backup_datos",
    RESTORE_BACKUP: "restaurar_backup",
    VIEW_STATISTICS: "ver_estadisticas",
    MANAGE_MULTIPLIERS: "gestionar_multiplicadores"
};

// Sistema de respaldo
class BackupSystem {
    createBackup() {
        try {
            battlepass_backup = {
                players: { ...battlePassData },
                rewards: [...rewards],
                timestamp: Date.now()
            };
            console.warn("Backup creado exitosamente.");
            return true;
        } catch (e) {
            console.warn("Error al crear backup:", e);
            return false;
        }
    }

    restoreBackup() {
        try {
            if (!battlepass_backup) return false;
            battlePassData = { ...battlepass_backup.players };
            rewards = [...battlepass_backup.rewards];
            console.warn("Backup restaurado exitosamente.");
            // Actualizar scoreboards con los datos del backup
            for (const playerName in battlePassData) {
                const player = world.getAllPlayers().find(p => p.nameTag === playerName);
                if (player) {
                    setScore(player, "xp", battlePassData[playerName].xp);
                    setScore(player, "passcoins", battlePassData[playerName].passCoins);
                }
            }
            return true;
        } catch (e) {
            console.warn("Error al restaurar backup:", e);
            return false;
        }
    }

    getLastBackupDate() {
        try {
            return battlepass_backup ? new Date(battlepass_backup.timestamp) : null;
        } catch {
            return null;
        }
    }
}

// Sistema de estadísticas
class BattlePassStats {
    updateStats(type, value) {
        if (!battlepass_stats[type]) battlepass_stats[type] = 0;
        battlepass_stats[type] += value;
        console.warn(`Estadísticas actualizadas: ${type} = ${battlepass_stats[type]}`);
    }

    getStats() {
        return { ...battlepass_stats };
    }
}

const backupSystem = new BackupSystem();
const statsSystem = new BattlePassStats();

// Función para limpiar los tags de recompensas de un jugador
function clearPlayerRewardTags(player) {
    const tags = player.getTags();
    tags.forEach(tag => {
        if (tag.startsWith("bp_claimed_level_")) {
            player.removeTag(tag);
            console.warn(`Tag ${tag} eliminado de ${player.nameTag}`);
        }
    });
}

// Función para limpiar los tags de todos los jugadores
function clearAllRewardTags() {
    const players = world.getAllPlayers();
    players.forEach(player => {
        clearPlayerRewardTags(player);
    });
    console.warn("Todos los tags de recompensas reclamadas han sido eliminados.");
}

// Función para mostrar el menú de administración
function showAdminMenu(player) {
    if (!player.hasTag("admin")) {
        player.sendMessage("§c¡No tienes permisos de administrador!");
        return;
    }

    const form = new ActionFormData()
        .title("§4§lPanel de Administración BattlePass")
        .body("§7Selecciona una operación administrativa:")
        .button("§bVer Datos de Jugador", "textures/ui/icon_book_writable")
        .button("§cEliminar Datos de Jugador", "textures/ui/icon_trash")
        .button("§4Reset Total Sistema", "textures/ui/icon_warning")
        .button("§aActualizar Recompensas", "textures/ui/icon_setting")
        .button("§6Crear Backup", "textures/ui/icon_copy")
        .button("§5Restaurar Backup", "textures/ui/icon_import")
        .button("§eEstadísticas Globales", "textures/ui/icon_chart_up")
        .button("§dGestionar Multiplicadores", "textures/ui/icon_multiplayer");

    form.show(player).then(res => {
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showPlayerDataViewer(player); break;
            case 1: showPlayerDataDeleter(player); break;
            case 2: showSystemReset(player); break;
            case 3: showRewardsEditor(player); break;
            case 4: handleBackupCreation(player); break;
            case 5: handleBackupRestore(player); break;
            case 6: showGlobalStats(player); break;
            case 7: showMultiplierManager(player); break;
        }
    });
}

// Implementaciones administrativas
function showPlayerDataViewer(player) {
    const players = Object.keys(battlePassData);

    const form = new ActionFormData()
        .title("§b§lVisor de Datos de Jugadores")
        .body(`§7Total de jugadores: §e${players.length}`);

    players.forEach(playerName => {
        form.button(`§a${playerName}\n§7XP: ${battlePassData[playerName].xp} | PC: ${battlePassData[playerName].passCoins}`);
    });

    form.show(player).then(res => {
        if (res.canceled) {
            showAdminMenu(player);
            return;
        }

        const selectedPlayer = players[res.selection];
        showDetailedPlayerData(player, selectedPlayer, battlePassData[selectedPlayer]);
    });
}

function showDetailedPlayerData(admin, playerName, data) {
    const form = new ActionFormData()
        .title(`§b§lDatos de ${playerName}`)
        .body(
            `§eDetalles del jugador:§r\n` +
            `§7XP: §b${data.xp}\n` +
            `§7PassCoins: §d${data.passCoins}\n` +
            `§7Nivel actual: §6${getMaxUnlockedLevel(data.xp)}\n\n` +
            `§7Recompensas reclamadas:`
        )
        .button("§aModificar Datos", "textures/ui/icon_edit")
        .button("§cEliminar Datos", "textures/ui/icon_trash")
        .button("§7Volver", "textures/ui/arrow_left");

    form.show(admin).then(res => {
        if (res.canceled || res.selection === 2) {
            showPlayerDataViewer(admin);
            return;
        }

        if (res.selection === 0) {
            showPlayerDataEditor(admin, playerName, data);
        } else if (res.selection === 1) {
            showPlayerDataDeleter(admin);
        }
    });
}

function showPlayerDataEditor(admin, playerName, data) {
    const form = new ModalFormData()
        .title(`§a§lEditar Datos: ${playerName}`)
        .textField("§7XP:", "Cantidad de XP", data.xp.toString())
        .textField("§7PassCoins:", "Cantidad de PassCoins", data.passCoins.toString());

    form.show(admin).then(res => {
        if (res.canceled) {
            showDetailedPlayerData(admin, playerName, data);
            return;
        }

        const newXP = parseInt(res.formValues[0]);
        const newPC = parseInt(res.formValues[1]);

        if (isNaN(newXP) || isNaN(newPC)) {
            admin.sendMessage("§c¡Valores inválidos!");
            return;
        }

        battlePassData[playerName] = { xp: newXP, passCoins: newPC };

        // Actualizar scoreboards
        const player = world.getAllPlayers().find(p => p.nameTag === playerName);
        if (player) {
            setScore(player, "xp", newXP);
            setScore(player, "passcoins", newPC);
        }

        admin.sendMessage(`§a¡Datos de ${playerName} actualizados!`);
        showDetailedPlayerData(admin, playerName, battlePassData[playerName]);
    });
}

function showPlayerDataDeleter(player) {
    const players = Object.keys(battlePassData);

    const form = new ActionFormData()
        .title("§c§lEliminar Datos de Jugador")
        .body("§7Selecciona un jugador para eliminar sus datos:\n");

    players.forEach(playerName => {
        form.button(`§c${playerName}\n§7XP: ${battlePassData[playerName].xp} | PC: ${battlePassData[playerName].passCoins}`);
    });

    form.button("§7Volver al menú", "textures/ui/arrow_left");

    form.show(player).then(res => {
        if (res.canceled || res.selection === players.length) {
            showAdminMenu(player);
            return;
        }

        const selectedPlayer = players[res.selection];
        showDeleteConfirmation(player, selectedPlayer);
    });
}

function showDeleteConfirmation(admin, targetPlayer) {
    const form = new ActionFormData()
        .title("§4§lConfirmar Eliminación")
        .body(`§7¿Estás seguro de eliminar los datos de §e${targetPlayer}§7?\n§cEsta acción no se puede deshacer.`)
        .button("§cConfirmar Eliminación", "textures/ui/icon_trash")
        .button("§aCancelar", "textures/ui/cancel");

    form.show(admin).then(res => {
        if (res.canceled || res.selection === 1) {
            showPlayerDataDeleter(admin);
            return;
        }

        delete battlePassData[targetPlayer];

        // Resetear scoreboards y tags del jugador
        const player = world.getAllPlayers().find(p => p.nameTag === targetPlayer);
        if (player) {
            setScore(player, "xp", 0);
            setScore(player, "passcoins", 0);
            clearPlayerRewardTags(player);
        }

        admin.sendMessage(`§aLos datos de ${targetPlayer} han sido eliminados.`);
        showPlayerDataDeleter(admin);
    });
}

function showSystemReset(player) {
    const form = new ActionFormData()
        .title("§4§lReset Total del Sistema")
        .body("§c¿Estás seguro de querer resetear TODO el sistema?\n§7Esto eliminará:\n- Datos de todos los jugadores\n- Estadísticas\n- Recompensas reclamadas\n\n§4¡Esta acción no se puede deshacer!")
        .button("§4Confirmar Reset Total", "textures/ui/icon_warning")
        .button("§aCancelar", "textures/ui/cancel");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 1) {
            showAdminMenu(player);
            return;
        }

        // Limpiar datos de jugadores
        battlePassData = {};

        // Restaurar recompensas por defecto
        rewards = [
    { "name": "Crate de Inicio Gratis!", "xp": 0, "passCoins": 0, "commands": "give @s bread 5" },
    { "name": "Crate de Madera Gratis!", "xp": 25, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 50, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 100, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 150, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 200, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 250, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 300, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 350, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 400, "passCoins": 10, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 500, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 600, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 700, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 800, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Madera Gratis!", "xp": 900, "passCoins": 20, "commands": "give @s tz:key_oak" },
    { "name": "Crate de Oro Gratis!", "xp": 1000, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1100, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1200, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1300, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1400, "passCoins": 20, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1600, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 1800, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2000, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2200, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2400, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2600, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 2800, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3000, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3200, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Oro Gratis!", "xp": 3400, "passCoins": 30, "commands": "give @s tz:key_gold" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 3700, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4000, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4300, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4600, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 4900, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5200, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5500, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 5800, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6100, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6400, "passCoins": 50, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 6800, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 7200, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 7600, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 8000, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Esmeralda Gratis!", "xp": 8400, "passCoins": 75, "commands": "give @s tz:key_emerald" },
    { "name": "Crate de Diamante Gratis!", "xp": 8800, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 9200, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 9600, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 10000, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Diamante Gratis!", "xp": 10400, "passCoins": 75, "commands": "give @s tz:key_diamond" },
    { "name": "Crate de Netherita Gratis!", "xp": 10900, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 11400, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 11900, "passCoins": 100, "commands": "give @s tz:key_netherita" },
    { "name": "Crate de Netherita Gratis!", "xp": 12400, "passCoins": 100, "commands": "give @s tz:key_netherita" }
        ];

        // Limpiar estadísticas
        battlepass_stats = {};

        // Resetear scoreboards de todos los jugadores
        const players = world.getAllPlayers();
        players.forEach(p => {
            setScore(p, "xp", 0);
            setScore(p, "passcoins", 0);
            clearPlayerRewardTags(p);
        });

        // Limpiar todos los tags de recompensas
        clearAllRewardTags();

        player.sendMessage("§a¡Sistema reseteado completamente!");
        showAdminMenu(player);
    });
}

function showRewardsEditor(player) {
    const form = new ModalFormData()
        .title("§a§lEditor de Recompensas")
        .textField("§7Recompensas (formato JSON):", "Ingresa el JSON de recompensas", JSON.stringify(rewards, null, 2));

    form.show(player).then(res => {
        if (res.canceled) {
            showAdminMenu(player);
            return;
        }

        try {
            const newRewards = JSON.parse(res.formValues[0]);
            updateRewards(newRewards);
            player.sendMessage("§a¡Recompensas actualizadas exitosamente!");
        } catch (e) {
            player.sendMessage(`§c¡Error en el formato JSON!: ${e.message}`);
            console.warn(`Error al actualizar recompensas: ${e}`);
        }
        showAdminMenu(player);
    });
}

function handleBackupCreation(player) {
    const success = backupSystem.createBackup();
    if (success) {
        player.sendMessage("§a¡Backup creado exitosamente!");
    } else {
        player.sendMessage("§c¡Error al crear el backup!");
    }
    showAdminMenu(player);
}

function handleBackupRestore(player) {
    const lastBackupDate = backupSystem.getLastBackupDate();
    const form = new ActionFormData()
        .title("§5§lRestaurar Backup")
        .body(
            lastBackupDate
                ? `§7Último backup: ${lastBackupDate.toLocaleString()}\n\n§7¿Quieres restaurar los datos del backup? Esto sobrescribirá los datos actuales.`
                : "§cNo se encontró ningún backup."
        );

    if (lastBackupDate) {
        form.button("§5Confirmar Restauración", "textures/ui/icon_import")
            .button("§aCancelar", "textures/ui/cancel");
    } else {
        form.button("§aVolver", "textures/ui/arrow_left");
    }

    form.show(player).then(res => {
        if (res.canceled || res.selection !== 0) {
            showAdminMenu(player);
            return;
        }

        const success = backupSystem.restoreBackup();
        if (success) {
            player.sendMessage("§a¡Backup restaurado exitosamente!");
        } else {
            player.sendMessage("§c¡Error al restaurar el backup!");
        }
        showAdminMenu(player);
    });
}

function showGlobalStats(player) {
    const stats = statsSystem.getStats();
    const form = new ActionFormData()
        .title("§e§lEstadísticas Globales")
        .body(
            `§6Estadísticas del BattlePass:\n\n` +
            `§eRecompensas Reclamadas: §b${stats.rewardsClaimed || 0}\n` +
            `§ePassCoins Gastados: §b${stats.passCoinsSpent || 0}\n` +
            `§eXP Total Generado: §b${stats.totalXP || 0}`
        )
        .button("§7Volver al menú", "textures/ui/arrow_left");

    form.show(player).then(() => showAdminMenu(player));
}

function showMultiplierManager(player) {
    const form = new ModalFormData()
        .title("§d§lGestión de Multiplicadores")
        .textField("§eMultiplicador de XP:", "Ejemplo: 2.0", "1.0")
        .textField("§dMultiplicador de PassCoins:", "Ejemplo: 1.5", "1.0");

    form.show(player).then(res => {
        if (res.canceled) {
            showAdminMenu(player);
            return;
        }

        const xpMult = parseFloat(res.formValues[0]);
        const pcMult = parseFloat(res.formValues[1]);

        if (isNaN(xpMult) || isNaN(pcMult)) {
            player.sendMessage("§c¡Valores inválidos!");
            return;
        }

        battlepass_stats.multipliers = {
            xp: xpMult,
            passCoins: pcMult
        };

        player.sendMessage(`§a¡Multiplicadores actualizados!\n§eXP: ${xpMult}x\n§dPassCoins: ${pcMult}x`);
        showAdminMenu(player);
    });
}