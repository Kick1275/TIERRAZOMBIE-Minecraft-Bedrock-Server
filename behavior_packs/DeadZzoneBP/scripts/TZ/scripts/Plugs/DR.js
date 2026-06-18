import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Traducciones y decoraciones
const LANGS = {
    es: {
        title: "§l§6✦ Recompensas Diarias ✦",
        body: "§b━━━━━━━━━━━━━━━━━━━━━━\n§e¡Reclama tu recompensa diaria!\n§b━━━━━━━━━━━━━━━━━━━━━━",
        claim: "§aReclamar",
        claimed: "§cYa reclamado hoy",
        admin: "§cPanel de Admin",
        volver: "§c⏪ Volver",
        addReward: "§aAgregar Recompensa",
        editReward: "§eEditar Recompensa",
        deleteReward: "§cEliminar Recompensa",
        icon: "Icono",
        name: "Nombre",
        command: "Comando",
        day: "Día",
        save: "§aGuardar",
        cancel: "§cCancelar",
        success: "§a¡Recompensa agregada!",
        editSuccess: "§a¡Recompensa editada!",
        deleteSuccess: "§a¡Recompensa eliminada!",
        selectReward: "§eSelecciona una recompensa para editar:",
        streak: "Racha Actual",
        todaysReward: "Recompensa de Hoy",
        notAvailable: "§cNo disponible hoy",
        upcoming: "§cPróxima",
        claimedPast: "§aReclamada anteriormente",
        maxReached: "¡Has alcanzado el máximo de recompensas! Tu racha continúa, pero las recompensas se reinician en ciclo.",
        manageTitle: "Gestionar Recompensa",
        manageBody: "Elige una acción para esta recompensa:"
    },
    en: {
        title: "§l§6✦ Daily Rewards ✦",
        body: "§b━━━━━━━━━━━━━━━━━━━━━━\n§eClaim your daily reward!\n§b━━━━━━━━━━━━━━━━━━━━━━",
        claim: "§aClaim",
        claimed: "§cAlready claimed today",
        admin: "§cAdmin Panel",
        volver: "§c⏪ Back",
        addReward: "§aAdd Reward",
        editReward: "§eEdit Reward",
        deleteReward: "§cDelete Reward",
        icon: "Icon",
        name: "Name",
        command: "Command",
        day: "Day",
        save: "§aSave",
        cancel: "§cCancel",
        success: "§aReward added!",
        editSuccess: "§aReward edited!",
        deleteSuccess: "§aReward deleted!",
        selectReward: "§eSelect a reward to edit:",
        streak: "Current Streak",
        todaysReward: "Today's Reward",
        notAvailable: "§cNot available today",
        upcoming: "§cUpcoming",
        claimedPast: "§aClaimed previously",
        maxReached: "You've reached the max rewards! Your streak continues, but rewards cycle.",
        manageTitle: "Manage Reward",
        manageBody: "Choose an action for this reward:"
    }
};

// Recompensas configurables
let dailyRewards = [
    {
        name: { es: "Pan Fresco", en: "Fresh Bread" },
        command: "give @s bread 3",
        icon: "textures/items/bread.png",
        day: 1
    },
    {
        name: { es: "Diamante", en: "Diamond" },
        command: "give @s diamond 1",
        icon: "textures/items/diamond.png",
        day: 2
    }
];

// Guardado y carga simple en propiedades dinámicas
function saveRewards() {
    dailyRewards.sort((a, b) => a.day - b.day);
    world.setDynamicProperty("dailyRewards", JSON.stringify(dailyRewards));
}
function loadRewards() {
    const data = world.getDynamicProperty("dailyRewards");
    if (data) {
        try {
            dailyRewards = JSON.parse(data);
            dailyRewards.sort((a, b) => a.day - b.day);
        } catch {}
    }
}
loadRewards();

// Detecta idioma por tag
function getLang(player) {
    return player.hasTag("lang_es_ES") ? "es" : "en";
}

// Obtiene la clave de hoy
function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Verifica si una fecha es ayer
function isYesterday(last, today) {
    const dToday = new Date(`${today}T00:00:00`);
    const dYesterday = new Date(dToday);
    dYesterday.setDate(dToday.getDate() - 1);
    const yKey = `${dYesterday.getFullYear()}-${dYesterday.getMonth()}-${dYesterday.getDate()}`;
    return last === yKey;
}

// Ejecutar comandos con posibles delays
function executeCommands(player, commandStr) {
    const parts = commandStr.split(',').map(s => s.trim());
    let tickDelay = 0;
    for (const part of parts) {
        if (part.startsWith('delay=')) {
            const delaySec = parseFloat(part.slice(6).replace('s', ''));
            if (!isNaN(delaySec)) {
                tickDelay += Math.floor(delaySec * 20);
            }
        } else if (part) {
            system.runTimeout(() => {
                try {
                    player.runCommand(part);
                } catch (e) {
                    player.sendMessage(`§cError executing command: ${part}`);
                }
            }, tickDelay);
        }
    }
}

// Menú principal de recompensas diarias
export function showDailyRewardsMenu(player) {
    const lang = getLang(player);
    const t = LANGS[lang];

    const today = getTodayKey();
    let last = player.getDynamicProperty("lastDailyClaim") || "";
    let streak = player.getDynamicProperty("dailyStreak") || 0;
    const claimedToday = last === today;
    const canClaim = !claimedToday;
    let currentDay;

    if (claimedToday) {
        currentDay = streak;
    } else {
        if (isYesterday(last, today)) {
            currentDay = streak + 1;
        } else {
            currentDay = 1;
        }
    }

    const maxDay = dailyRewards.length > 0 ? Math.max(...dailyRewards.map(r => r.day)) : 0;
    let effectiveDay = maxDay > 0 ? ((currentDay - 1) % maxDay) + 1 : 0;

    const displayedStreak = claimedToday ? streak : (isYesterday(last, today) ? streak : 0);

    let body = t.body + `\n§a${t.streak}: §e${displayedStreak} days\n§a${t.todaysReward}: §eDay ${effectiveDay}`;
    if (currentDay > maxDay && maxDay > 0) {
        body += `\n§7${t.maxReached}`;
    }

    let form = new ActionFormData()
        .title(t.title)
        .body(body);

    dailyRewards.sort((a, b) => a.day - b.day);
    dailyRewards.forEach(r => {
        let sub = "";
        if (r.day === effectiveDay) {
            sub = claimedToday ? t.claimed : t.claim;
        } else if (r.day < currentDay % (maxDay || 1)) {
            sub = t.claimedPast;
        } else if (r.day > effectiveDay) {
            sub = t.upcoming;
        } else {
            sub = t.notAvailable;
        }
        form.button(`§eDay ${r.day}: ${r.name[lang]}\n${sub}`, r.icon);
    });

    if (player.hasTag("Admin")) {
        form.button(t.admin, "textures/ui/creator_glyph_color.png");
    }
    form.button(t.volver, "textures/ui/arrow_left.png");

    form.show(player).then(res => {
        if (res.canceled) return;
        if (res.selection < dailyRewards.length) {
            const r = dailyRewards[res.selection];
            if (canClaim && r.day === effectiveDay) {
                executeCommands(player, r.command);
                player.setDynamicProperty("lastDailyClaim", today);
                player.setDynamicProperty("dailyStreak", currentDay);
                player.sendMessage(`§a${t.claim} §e${r.name[lang]}!`);
            } else {
                player.sendMessage(t.notAvailable);
            }
            showDailyRewardsMenu(player);
            return;
        }
        let adminIdx = dailyRewards.length;
        if (player.hasTag("Admin") && res.selection === adminIdx) {
            showAdminDailyRewards(player, lang);
            return;
        }
        if (res.selection === adminIdx + (player.hasTag("Admin") ? 1 : 0)) {
            if (typeof showMainTZMenu === "function") showMainTZMenu(player);
        }
    });
}

// Panel de administración para recompensas diarias
export function showAdminDailyRewards(player, lang) {
    const t = LANGS[lang];
    let form = new ActionFormData()
        .title(t.admin)
        .body(t.selectReward);

    dailyRewards.sort((a, b) => a.day - b.day);
    dailyRewards.forEach(r => {
        form.button(`§eDay ${r.day}: ${r.name[lang]}`, r.icon);
    });
    form.button(t.addReward, "textures/ui/icon_reward.png");
    form.button(t.volver, "textures/ui/arrow_left.png");

    form.show(player).then(res => {
        if (res.canceled) return;
        if (res.selection < dailyRewards.length) {
            showRewardOptions(player, lang, res.selection);
            return;
        }
        let addIdx = dailyRewards.length;
        if (res.selection === addIdx) {
            showAddReward(player, lang);
            return;
        }
        if (res.selection === addIdx + 1) {
            showDailyRewardsMenu(player);
        }
    });
}

// Opciones para una recompensa seleccionada
function showRewardOptions(player, lang, idx) {
    const t = LANGS[lang];
    const r = dailyRewards[idx];
    let form = new ActionFormData()
        .title(t.manageTitle)
        .body(`${t.manageBody}\n§eDay ${r.day}: ${r.name[lang]}`)
        .button(t.editReward)
        .button(t.deleteReward)
        .button(t.volver);

    form.show(player).then(res => {
        if (res.canceled) {
            showAdminDailyRewards(player, lang);
            return;
        }
        if (res.selection === 0) {
            showEditReward(player, lang, idx);
        } else if (res.selection === 1) {
            dailyRewards.splice(idx, 1);
            saveRewards();
            player.sendMessage(t.deleteSuccess);
            showAdminDailyRewards(player, lang);
        } else {
            showAdminDailyRewards(player, lang);
        }
    });
}

// Agregar recompensa
function showAddReward(player, lang) {
    const t = LANGS[lang];
    const maxDay = dailyRewards.length > 0 ? Math.max(...dailyRewards.map(r => r.day)) : 0;
    const suggestedDay = (maxDay + 1).toString();
    let form = new ModalFormData()
        .title(t.addReward)
        .textField(t.name + " (Español)", "")
        .textField(t.name + " (English)", "")
        .textField(t.day, suggestedDay)
        .textField(t.command, "")
        .textField(t.icon + " (ruta)", "textures/items/apple.png")
        .toggle(t.save, true);

    form.show(player).then(res => {
        if (!res.formValues || res.canceled) return;
        const [nameEs, nameEn, dayStr, command, icon, save] = res.formValues;
        let day = parseInt(dayStr);
        if (isNaN(day) || day < 1) day = 1;
        if (save) {
            dailyRewards.push({
                name: { es: nameEs, en: nameEn },
                day,
                command,
                icon
            });
            saveRewards();
            player.sendMessage(t.success);
        }
        showAdminDailyRewards(player, lang);
    });
}

// Editar recompensa existente
function showEditReward(player, lang, idx) {
    const t = LANGS[lang];
    const r = dailyRewards[idx];
    let form = new ModalFormData()
        .title(t.editReward)
        .textField(t.name + " (Español)", r.name.es)
        .textField(t.name + " (English)", r.name.en)
        .textField(t.day, r.day.toString())
        .textField(t.command, r.command)
        .textField(t.icon + " (ruta)", r.icon)
        .toggle(t.save, true);

    form.show(player).then(res => {
        if (!res.formValues || res.canceled) return;
        const [nameEs, nameEn, dayStr, command, icon, save] = res.formValues;
        let day = parseInt(dayStr);
        if (isNaN(day) || day < 1) day = 1;
        if (save) {
            dailyRewards[idx] = {
                name: { es: nameEs, en: nameEn },
                day,
                command,
                icon
            };
            saveRewards();
            player.sendMessage(t.editSuccess);
        }
        showAdminDailyRewards(player, lang);
    });
}

// Puedes llamar a showDailyRewardsMenu(player) desde tu menú principal decorado
// Ejemplo: agrega un botón