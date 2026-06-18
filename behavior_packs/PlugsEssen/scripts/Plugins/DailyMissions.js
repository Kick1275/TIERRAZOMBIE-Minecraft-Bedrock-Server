import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const SCORE_MONEY = "money";
const SCORE_GEMS = "gems";
const OPEN_WORLD_TAG = "gm:in_open_world";
const MISSIONS_ENABLED = false;

function isMissionsEnabled() {
    return MISSIONS_ENABLED;
}

// ─── RESET ────────────────────────────────────────────────────────────────────

function getMidnightUTC() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function getWeekStartUTC() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)).getTime();
}

// ─── MISIONES (modo mundo abierto) ───────────────────────────────────────────

const DAILY_MISSIONS = [
    { id: "d_kill_3",       type: "combate",     desc: { es: "Matar 3 jugadores",              en: "Kill 3 players" },              goal: 3,    reward: { money: 400 },   track: "kills" },
    { id: "d_kill_shotgun", type: "combate",     desc: { es: "Matar 2 jugadores con escopeta", en: "Kill 2 players with shotgun" }, goal: 2,    reward: { money: 600 },   track: "kills_shotgun" },
    { id: "d_kill_pistol",  type: "combate",     desc: { es: "Matar 3 jugadores con pistola",  en: "Kill 3 players with pistol" },  goal: 3,    reward: { money: 700 },   track: "kills_pistol" },
    { id: "d_kill_10",      type: "combate",     desc: { es: "Matar 10 jugadores",             en: "Kill 10 players" },             goal: 10,   reward: { money: 1500 },  track: "kills" },
    { id: "d_loot_20",      type: "recoleccion", desc: { es: "Recoger 20 items del suelo",     en: "Pick up 20 items" },            goal: 20,   reward: { money: 700 },   track: "items_picked" },
    { id: "d_loot_food10",  type: "recoleccion", desc: { es: "Recoger 10 unidades de comida",  en: "Pick up 10 food items" },       goal: 10,   reward: { money: 800 },   track: "food_picked" },
    { id: "d_loot_meds5",   type: "recoleccion", desc: { es: "Recoger 5 medicamentos",         en: "Pick up 5 medical items" },     goal: 5,    reward: { money: 1200 },  track: "meds_picked" },
    { id: "d_loot_ammo8",   type: "recoleccion", desc: { es: "Recoger 8 items de munición",    en: "Pick up 8 ammo items" },        goal: 8,    reward: { money: 1000 },  track: "ammo_picked" },
    { id: "d_deploy_3",     type: "exploracion", desc: { es: "Desplegarte 3 veces",            en: "Deploy 3 times" },              goal: 3,    reward: { money: 900 },   track: "deploy_entries" },
    { id: "d_deploy_5",     type: "exploracion", desc: { es: "Desplegarte 5 veces",            en: "Deploy 5 times" },              goal: 5,    reward: { money: 1500 },  track: "deploy_entries" },
    { id: "d_petro_enter",  type: "exploracion", desc: { es: "Entrar al evento La Petro",      en: "Enter La Petro event" },        goal: 1,    reward: { money: 1200 },  track: "petro_entries" },
    { id: "d_petro_extract",type: "exploracion", desc: { es: "Extraerte desde La Petro",       en: "Extract from La Petro" },       goal: 1,    reward: { money: 2000 },  track: "petro_extractions" },
    { id: "d_spend_5k",     type: "economia",    desc: { es: "Gastar 5,000 coins en tiendas",  en: "Spend 5,000 coins at shops" },  goal: 5000, reward: { money: 300 },   track: "money_spent" },
    { id: "d_sell_market10",type: "economia",    desc: { es: "Vender 10 items en el mercado",  en: "Sell 10 market items" },        goal: 10,   reward: { money: 1200 },  track: "market_sells" },
    { id: "d_buy_market5",  type: "economia",    desc: { es: "Comprar 5 items en el mercado",  en: "Buy 5 market items" },          goal: 5,    reward: { money: 800 },   track: "market_buys" },
    { id: "d_transfer_3k",  type: "economia",    desc: { es: "Transferir 3,000 coins",         en: "Transfer 3,000 coins" },        goal: 3000, reward: { money: 400 },   track: "money_transferred" },
    { id: "d_earn_npc_2k",  type: "economia",    desc: { es: "Ganar 2,000 coins vendiendo NPC", en: "Earn 2,000 coins from NPCs" }, goal: 2000, reward: { money: 400 },   track: "money_earned_npc" },
    { id: "d_walk_2k",      type: "movimiento",  desc: { es: "Caminar 2,000 bloques",          en: "Walk 2,000 blocks" },           goal: 2000, reward: { money: 600 },   track: "blocks_walked" },
    { id: "d_run_3k",       type: "movimiento",  desc: { es: "Correr 3,000 bloques",           en: "Run 3,000 blocks" },            goal: 3000, reward: { money: 700 },   track: "blocks_run" },
    { id: "d_fall_10",      type: "movimiento",  desc: { es: "Caer desde 10 bloques de altura", en: "Fall from 10 blocks" },        goal: 1,    reward: { money: 200 },   track: "big_falls" },
    { id: "d_swim_100",     type: "movimiento",  desc: { es: "Nadar 100 bloques",              en: "Swim 100 blocks" },             goal: 100,  reward: { money: 300 },   track: "blocks_swum" },
    { id: "d_team_invite2", type: "social",      desc: { es: "Invitar a 2 jugadores a tu equipo", en: "Invite 2 players to team" }, goal: 2, reward: { money: 400 }, track: "team_invites" },
    { id: "d_team_kill3",   type: "social",      desc: { es: "Matar 3 jugadores en equipo",    en: "Kill 3 players while teamed" }, goal: 3,    reward: { money: 700 },   track: "team_kills" },
    { id: "d_login",        type: "misc",        desc: { es: "Conectarse al servidor",         en: "Connect to the server" },       goal: 1,    reward: { money: 200 },   track: "logins" },
    { id: "d_play_30m",     type: "misc",        desc: { es: "Jugar 30 minutos",               en: "Play 30 minutes" },             goal: 1800, reward: { money: 800 },   track: "playtime" },
    { id: "d_die_5",        type: "misc",        desc: { es: "Morir 5 veces",                  en: "Die 5 times" },                 goal: 5,    reward: { money: 300 },   track: "deaths_today" },
    { id: "d_menu_5",       type: "misc",        desc: { es: "Abrir el menú 5 veces",          en: "Open menu 5 times" },           goal: 5,    reward: { money: 200 },   track: "menu_opens" },
    { id: "d_chat_10",      type: "misc",        desc: { es: "Enviar 10 mensajes en el chat",  en: "Send 10 chat messages" },       goal: 10,   reward: { money: 300 },   track: "chat_messages" },
];

const WEEKLY_MISSIONS = [
    { id: "w_kill_50",        type: "combate",     desc: { es: "Matar 50 jugadores en la semana",     en: "Kill 50 players this week" },      goal: 50,   reward: { money: 10000 }, track: "kills" },
    { id: "w_kill_100",       type: "combate",     desc: { es: "Matar 100 jugadores en la semana",    en: "Kill 100 players this week" },     goal: 100,  reward: { gems: 50 },     track: "kills" },
    { id: "w_kill_shotgun50", type: "combate",     desc: { es: "Matar 50 con escopeta",               en: "Kill 50 with shotgun" },           goal: 50,   reward: { money: 13000 }, track: "kills_shotgun" },
    { id: "w_kill_pistol50",  type: "combate",     desc: { es: "Matar 50 con pistola",                en: "Kill 50 with pistol" },            goal: 50,   reward: { money: 15000 }, track: "kills_pistol" },
    { id: "w_loot_200",       type: "recoleccion", desc: { es: "Recoger 200 items en la semana",      en: "Pick up 200 items this week" },    goal: 200,  reward: { money: 5000 },  track: "items_picked" },
    { id: "w_loot_food100",   type: "recoleccion", desc: { es: "Recoger 100 comidas",                 en: "Pick up 100 food items" },         goal: 100,  reward: { money: 10000 }, track: "food_picked" },
    { id: "w_loot_meds50",    type: "recoleccion", desc: { es: "Recoger 50 medicamentos",             en: "Pick up 50 medical items" },       goal: 50,   reward: { money: 5000 },  track: "meds_picked" },
    { id: "w_loot_ammo75",    type: "recoleccion", desc: { es: "Recoger 75 municiones",               en: "Pick up 75 ammo items" },          goal: 75,   reward: { money: 15000 }, track: "ammo_picked" },
    { id: "w_loot_armor50",   type: "recoleccion", desc: { es: "Recoger 50 items de armadura",        en: "Pick up 50 armor items" },         goal: 50,   reward: { money: 5000 },  track: "armor_picked" },
    { id: "w_deploy_20",      type: "exploracion", desc: { es: "Desplegarte 20 veces en la semana",   en: "Deploy 20 times this week" },      goal: 20,   reward: { money: 8000 },  track: "deploy_entries" },
    { id: "w_petro_5",        type: "exploracion", desc: { es: "Entrar a La Petro 5 veces",           en: "Enter La Petro 5 times" },         goal: 5,    reward: { money: 10000 }, track: "petro_entries" },
    { id: "w_petro_extract3", type: "exploracion", desc: { es: "Extraerte 3 veces desde La Petro",    en: "Extract from La Petro 3 times" },  goal: 3,    reward: { money: 15000 }, track: "petro_extractions" },
    { id: "w_spend_30k",      type: "economia",    desc: { es: "Gastar 30,000 coins en tiendas",      en: "Spend 30,000 coins" },             goal: 30000,reward: { money: 5000 },  track: "money_spent" },
    { id: "w_sell_market50",  type: "economia",    desc: { es: "Vender 50 items en el mercado",       en: "Sell 50 market items" },           goal: 50,   reward: { money: 5000 },  track: "market_sells" },
    { id: "w_buy_market30",   type: "economia",    desc: { es: "Comprar 30 items en el mercado",      en: "Buy 30 market items" },            goal: 30,   reward: { money: 10000 }, track: "market_buys" },
    { id: "w_bank_150k",      type: "economia",    desc: { es: "Acumular 150,000 coins en el banco",  en: "Have 150,000 coins in bank" },     goal: 150000,reward: { money: 20000 }, track: "bank_balance" },
    { id: "w_npc_20tx",       type: "economia",    desc: { es: "20 transacciones en tiendas NPC",     en: "20 NPC shop transactions" },     goal: 20,   reward: { money: 5000 },  track: "npc_transactions" },
    { id: "w_earn_50k",       type: "economia",    desc: { es: "Ganar 50,000 coins vendiendo NPC",    en: "Earn 50,000 from NPCs" },          goal: 50000,reward: { money: 5000 },  track: "money_earned_npc" },
    { id: "w_walk_25k",       type: "movimiento",  desc: { es: "Caminar 25,000 bloques",              en: "Walk 25,000 blocks" },             goal: 25000,reward: { money: 15000 }, track: "blocks_walked" },
    { id: "w_run_20k",        type: "movimiento",  desc: { es: "Correr 20,000 bloques",               en: "Run 20,000 blocks" },              goal: 20000,reward: { money: 10000 }, track: "blocks_run" },
    { id: "w_swim_2k",        type: "movimiento",  desc: { es: "Nadar 2,000 bloques",                 en: "Swim 2,000 blocks" },              goal: 2000, reward: { money: 5000 },  track: "blocks_swum" },
    { id: "w_walk_day5k",     type: "movimiento",  desc: { es: "Caminar 5,000 bloques en un día",     en: "Walk 5,000 blocks in one day" },   goal: 5000, reward: { money: 10000 }, track: "blocks_walked_day" },
    { id: "w_team_kill50",    type: "social",      desc: { es: "Matar 50 jugadores en equipo",        en: "Kill 50 players while teamed" },   goal: 50,   reward: { money: 30000 }, track: "team_kills" },
    { id: "w_team_invite5",   type: "social",      desc: { es: "Invitar a 5 jugadores distintos",     en: "Invite 5 different players" },     goal: 5,    reward: { money: 5000 },  track: "team_invites" },
    { id: "w_prog_daily5",    type: "progresion",  desc: { es: "Completar diarias 5 días seguidos",   en: "Complete dailies 5 days in a row" }, goal: 5, reward: { gems: 100 }, track: "daily_streak" },
    { id: "w_prog_daily7",    type: "progresion",  desc: { es: "Completar diarias los 7 días",        en: "Complete dailies all 7 days" },    goal: 7,    reward: { gems: 120 },    track: "daily_streak" },
    { id: "w_prog_first",     type: "progresion",  desc: { es: "Ser el primero en completar semanal", en: "First to complete a weekly" },     goal: 1,    reward: { gems: 40 },     track: "weekly_first" },
    { id: "w_prog_8types",    type: "progresion",  desc: { es: "Completar misiones de 8 tipos",       en: "Complete 8 mission types" },       goal: 8,    reward: { gems: 60 },     track: "mission_types_done" },
    { id: "w_prog_5weekly",   type: "progresion",  desc: { es: "Completar 5 semanales en la semana",  en: "Complete 5 weeklies this week" },  goal: 5,    reward: { gems: 70 },     track: "weekly_completed" },
];

const DAILY_TYPES = [...new Set(DAILY_MISSIONS.map(m => m.type))];
const WEEKLY_TYPES = [...new Set(WEEKLY_MISSIONS.filter(m => m.type !== "progresion").map(m => m.type))];

const KEY_DAILY_MISSIONS = "dm:daily";
const KEY_WEEKLY_MISSIONS = "dm:weekly";
const KEY_PROG_DATA = "dm:prog";
const KEY_WEEKLY_FIRST = "dm:wfirst";

const missionCache = new Map();

function getPlayerLang(player) {
    try { const s = player.getDynamicProperty("playerSettings"); if (s) return JSON.parse(s).language ?? "es"; } catch {}
    return "es";
}

function getLang(obj, player) {
    const l = getPlayerLang(player);
    return obj[l] ?? obj.es;
}

function addScore(player, objective, amount) {
    try {
        let obj = world.scoreboard.getObjective(objective);
        if (!obj) obj = world.scoreboard.addObjective(objective, objective);
        obj.setScore(player, (obj.getScore(player) ?? 0) + amount);
    } catch (e) { console.warn("[Missions] addScore: " + e); }
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function todayKey() { return getMidnightUTC(); }
function weekKey() { return getWeekStartUTC(); }

function assignDailyMissions(player) {
    if (!isMissionsEnabled()) return { date: todayKey(), missions: [] };
    const today = todayKey();
    try {
        const raw = player.getDynamicProperty(KEY_DAILY_MISSIONS);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.date === today) return data;
        }
    } catch {}
    const types = shuffle(DAILY_TYPES).slice(0, 5);
    const missions = types.map(type => {
        const pool = DAILY_MISSIONS.filter(m => m.type === type);
        const picked = pool[Math.floor(Math.random() * pool.length)];
        return { id: picked.id, progress: 0, done: false };
    });
    const data = { date: today, missions };
    player.setDynamicProperty(KEY_DAILY_MISSIONS, JSON.stringify(data));
    return data;
}

function assignWeeklyMissions(player) {
    if (!isMissionsEnabled()) return { week: weekKey(), missions: [], prog: [] };
    const week = weekKey();
    try {
        const raw = player.getDynamicProperty(KEY_WEEKLY_MISSIONS);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.week === week) return data;
        }
    } catch {}
    const types = shuffle(WEEKLY_TYPES).slice(0, 7);
    const missions = types.map(type => {
        const pool = WEEKLY_MISSIONS.filter(m => m.type === type);
        const picked = pool[Math.floor(Math.random() * pool.length)];
        return { id: picked.id, progress: 0, done: false };
    });
    const prog = WEEKLY_MISSIONS.filter(m => m.type === "progresion").map(m => ({ id: m.id, progress: 0, done: false }));
    const data = { week, missions, prog };
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(data));
    return data;
}

function getProgData(player) {
    try { const raw = player.getDynamicProperty(KEY_PROG_DATA); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function saveProgData(player, data) {
    try { player.setDynamicProperty(KEY_PROG_DATA, JSON.stringify(data)); } catch {}
}

function getCachedMissions(player) {
    if (!isMissionsEnabled()) return {
        daily: assignDailyMissions(player),
        weekly: assignWeeklyMissions(player),
        dailyDate: todayKey(),
        weeklyDate: weekKey(),
    };
    const today = todayKey();
    const week = weekKey();
    let cache = missionCache.get(player.id);
    if (cache && (cache.dailyDate !== today || cache.weeklyDate !== week)) cache = null;
    if (!cache) {
        cache = {
            daily: assignDailyMissions(player),
            weekly: assignWeeklyMissions(player),
            dailyDate: today,
            weeklyDate: week,
        };
        missionCache.set(player.id, cache);
    }
    return cache;
}

function grantReward(player, reward) {
    if (reward.money) addScore(player, SCORE_MONEY, reward.money);
    if (reward.gems) addScore(player, SCORE_GEMS, reward.gems);
}

function rewardText(reward) {
    const parts = [];
    if (reward.money) parts.push(`${reward.money.toLocaleString()} TzCoins`);
    if (reward.gems) parts.push(`${reward.gems} Gems`);
    return parts.join(" + ");
}

function findMissionDef(id) {
    return DAILY_MISSIONS.find(m => m.id === id) ?? WEEKLY_MISSIONS.find(m => m.id === id);
}

function progressMission(player, trackKey, amount = 1, extra = {}) {
    if (!isMissionsEnabled()) return;
    const cache = getCachedMissions(player);
    const daily = cache.daily;
    const weekly = cache.weekly;
    let dailyChanged = false, weeklyChanged = false;

    const apply = (slot, pool) => {
        if (slot.done) return;
        const def = pool.find(m => m.id === slot.id);
        if (!def || def.track !== trackKey) return;
        if (def.extra?.map && extra.map !== def.extra.map) return;
        slot.progress = Math.min(slot.progress + amount, def.goal);
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§a✓ §lMisión completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
            if (pool === DAILY_MISSIONS) checkDailyAllDone(player, daily);
            if (pool === WEEKLY_MISSIONS && def.type !== "progresion") {
                checkWeeklyFirst(player, weekly);
                checkWeeklyTypesAndCount(player, weekly);
            }
        }
        return true;
    };

    for (const slot of daily.missions) if (apply(slot, DAILY_MISSIONS)) dailyChanged = true;
    for (const slot of weekly.missions) if (apply(slot, WEEKLY_MISSIONS)) weeklyChanged = true;
    for (const slot of (weekly.prog ?? [])) if (apply(slot, WEEKLY_MISSIONS)) weeklyChanged = true;

    if (dailyChanged) player.setDynamicProperty(KEY_DAILY_MISSIONS, JSON.stringify(daily));
    if (weeklyChanged) player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
    if (dailyChanged) cache.daily = daily;
    if (weeklyChanged) cache.weekly = weekly;
}

function checkDailyAllDone(player, daily) {
    if (!daily.missions.every(s => s.done)) return;
    const prog = getProgData(player);
    const today = todayKey();
    const yesterday = today - 86400000;
    if (prog.last_full_day === yesterday) prog.daily_streak = (prog.daily_streak ?? 0) + 1;
    else if (prog.last_full_day !== today) prog.daily_streak = 1;
    prog.last_full_day = today;
    saveProgData(player, prog);

    const weekly = assignWeeklyMissions(player);
    for (const slot of (weekly.prog ?? [])) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def || def.track !== "daily_streak") continue;
        slot.progress = prog.daily_streak;
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lProgresión: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
    }
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
}

function checkWeeklyFirst(player, weekly) {
    try {
        const week = weekKey();
        const raw = world.getDynamicProperty(KEY_WEEKLY_FIRST);
        const data = raw ? JSON.parse(raw) : {};
        if (data.week === week) return;
        world.setDynamicProperty(KEY_WEEKLY_FIRST, JSON.stringify({ week, player: player.id }));
        for (const slot of (weekly.prog ?? [])) {
            if (slot.done) continue;
            const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
            if (!def || def.track !== "weekly_first") continue;
            slot.progress = 1;
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lProgresión: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
    } catch {}
}

function checkWeeklyTypesAndCount(player, weekly) {
    const doneTypes = new Set(weekly.missions.filter(s => s.done).map(s => findMissionDef(s.id)?.type).filter(Boolean));
    const doneCount = weekly.missions.filter(s => s.done).length;
    for (const slot of (weekly.prog ?? [])) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def) continue;
        if (def.track === "mission_types_done") slot.progress = doneTypes.size;
        if (def.track === "weekly_completed") slot.progress = doneCount;
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lProgresión: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
    }
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
}

function progressBar(current, goal) {
    const filled = Math.floor((current / goal) * 10);
    return "§a" + "█".repeat(filled) + "§8" + "█".repeat(10 - filled);
}

export async function showMissionsUI(player) {
    if (!isMissionsEnabled()) {
        player.sendMessage("§cLas misiones están deshabilitadas.");
        return;
    }
    const lang = getPlayerLang(player);
    const daily = assignDailyMissions(player);
    const weekly = assignWeeklyMissions(player);
    const res = await new ActionFormData()
        .title(lang === "es" ? "§l§eMisiones" : "§l§eMissions")
        .button(lang === "es" ? "§a Diarias" : "§a Daily", "textures/ui/icon_book_writable.png")
        .button(lang === "es" ? "§b Semanales" : "§b Weekly", "textures/ui/icon_recipe_nature.png")
        .button(lang === "es" ? "§d Progresión" : "§d Progression", "textures/ui/icon_best_3.png")
        .show(player);
    if (res.canceled) return;
    if (res.selection === 0) await showDailyUI(player, daily);
    else if (res.selection === 1) await showWeeklyUI(player, weekly);
    else await showProgUI(player, weekly);
}

async function showDailyUI(player, daily) {
    const lang = getPlayerLang(player);
    const resetIn = getMidnightUTC() + 86400000 - Date.now();
    let body = `§7Reset: §e${Math.floor(resetIn / 3600000)}h ${Math.floor((resetIn % 3600000) / 60000)}m\n\n`;
    for (const slot of daily.missions) {
        const def = findMissionDef(slot.id);
        if (!def) continue;
        body += `${slot.done ? "§a" : "§f"}${getLang(def.desc, player)}\n`;
        body += `${progressBar(slot.progress, def.goal)} ${slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`}  §e+${rewardText(def.reward)}\n\n`;
    }
    body += `§7Completadas: §e${daily.missions.filter(s => s.done).length}§7/§f5`;
    await new ActionFormData().title("§l§aMisiones Diarias").body(body).button("§8Cerrar").show(player);
}

async function showWeeklyUI(player, weekly) {
    const resetIn = getWeekStartUTC() + 7 * 86400000 - Date.now();
    let body = `§7Reset: §e${Math.floor(resetIn / 86400000)}d ${Math.floor((resetIn % 86400000) / 3600000)}h\n\n`;
    for (const slot of weekly.missions) {
        const def = findMissionDef(slot.id);
        if (!def) continue;
        body += `${slot.done ? "§a" : "§f"}${getLang(def.desc, player)}\n`;
        body += `${progressBar(slot.progress, def.goal)} ${slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`}  §e+${rewardText(def.reward)}\n\n`;
    }
    body += `§7Completadas: §e${weekly.missions.filter(s => s.done).length}§7/§f7`;
    await new ActionFormData().title("§l§bMisiones Semanales").body(body).button("§8Cerrar").show(player);
}

async function showProgUI(player, weekly) {
    let body = "§7Objetivos permanentes:\n\n";
    for (const slot of (weekly.prog ?? [])) {
        const def = findMissionDef(slot.id);
        if (!def) continue;
        body += `${slot.done ? "§a" : "§f"}${getLang(def.desc, player)}\n`;
        body += `${progressBar(slot.progress, def.goal)} ${slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`}  §e+${rewardText(def.reward)}\n\n`;
    }
    await new ActionFormData().title("§l§dProgresión").body(body).button("§8Cerrar").show(player);
}

const FOOD_IDS = new Set(["mcpe:canned_peaches","mcpe:canned_beans","mcpe:canned_beef_stew","mcpe:canned_chicken","mcpe:canned_chili","mcpe:canned_corned","mcpe:canned_fruit","mcpe:canned_ham","mcpe:canned_ration","mcpe:canned_sardine","mcpe:canned_spaghetti","mcpe:canned_tuna","mcpe:canned_tomato","mcpe:canned_bacon","mcpe:chip_potato","mcpe:chip_tortilla","mcpe:creeper_crunch","mcpe:meat_jerky","mcpe:mre","mcpe:rice","mcpe:strawberry_jam","mcpe:tactical_sandwich","mcpe:chocolate_bar","mcpe:apple_green","mcpe:banana","mcpe:tomato","mcpe:cucumber","mcpe:pear","mcpe:zucchini","mcpe:coffee","mcpe:energy_drink","mcpe:grape_soda","mcpe:lemonade","mcpe:popsi_cola","mcpe:red_wine","mcpe:vodka","mcpe:whiskey","mcpe:beer_bottle","mcpe:milk_gallon","mcpe:bottle_water","mcpe:pot_cook_water","mcpe:pot_water"]);
const MED_IDS = new Set(["mcpe:adrenaline","mcpe:alcoholic_tinture","mcpe:antidote","mcpe:bandage","mcpe:bandage_sterilized","mcpe:blood_bag_type_a","mcpe:blood_bag_type_ab","mcpe:blood_bag_type_b","mcpe:blood_bag_type_o","mcpe:blood_bag_emp","mcpe:blood_bag_unknown","mcpe:blood_test_kit","mcpe:first_aid","mcpe:morphine","mcpe:painkiller","mcpe:rags","mcpe:rags_dirty","mcpe:rags_sterilized","mcpe:splint","mcpe:water_purification"]);
const AMMO_IDS = new Set(["krep:m43","krep:mm9","krep:gauge12","krep:lapua338","krep:mag357","krep:mm5728","krep:acp45","krep:ae50","krep:mm4630","krep:mm5842","krep:ammobox","krep:ammoboxc"]);
const ARMOR_IDS = new Set(["mcpe:army_artic","mcpe:army_desert","mcpe:army_woodland","mcpe:assault_helmet_black","mcpe:assault_helmet_olive","mcpe:ballistic_black","mcpe:ballistic_green","mcpe:ballistic_tan","mcpe:ballistic_white","mcpe:tactical_vest_black","mcpe:tactical_vest_olive","mcpe:tactical_vest_tan","mcpe:tactical_vest_white","mcpe:combat_olive","mcpe:combat_tan","mcpe:combat_white","mcpe:plate_vest_gray","mcpe:plate_vest_olive","mcpe:plate_vest_tan","mcpe:plate_vest_white","mcpe:stab_vest_gray","mcpe:stab_vest_tan","mcpe:stab_vest_white","mcpe:assault_vest_black","mcpe:assault_vest_olive","mcpe:chest_brown","mcpe:chest_green","mcpe:chest_navy","mcpe:chest_tan","mcpe:chest_white","mcpe:hunting_brown","mcpe:hunting_navy","mcpe:police_vest","mcpe:press_vest","mcpe:spec_helmet","mcpe:tactical_helmet_black","mcpe:tactical_helmet_olive","mcpe:tactical_helmet_tan","mcpe:tactical_helmet_white","mcpe:gasmask_black","mcpe:gasmask_tactical","mcpe:gasmask_white","mcpe:biker_black","mcpe:biker_blue","mcpe:biker_red","mcpe:biker_white","mcpe:biker_yellow"]);
export const SHOTGUN_IDS = new Set(["krep:m870","krep:aa12","krep:saiga12","krep:m1014","krep:db"]);
export const PISTOL_IDS = new Set(["krep:g17","krep:g18","krep:m1911","krep:p320","krep:b93","krep:cp","krep:deagle","krep:deagleg","krep:t50"]);

const lastPos = new Map();
const prevMoney = new Map();
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn || !isMissionsEnabled()) return;
    system.runTimeout(() => {
        try {
            assignDailyMissions(ev.player);
            assignWeeklyMissions(ev.player);
            progressMission(ev.player, "logins", 1);
        } catch {}
    }, 60);
});

world.afterEvents.playerLeave.subscribe(ev => { missionCache.delete(ev.playerId); });

world.afterEvents.entityDie.subscribe(ev => {
    if (!isMissionsEnabled() || ev.deadEntity?.typeId !== "minecraft:player") return;
    try { progressMission(ev.deadEntity, "deaths_today", 1); } catch {}
}, { entityTypes: ["minecraft:player"] });

world.beforeEvents.chatSend.subscribe(ev => {
    if (!isMissionsEnabled()) return;
    system.run(() => { try { progressMission(ev.sender, "chat_messages", 1); } catch {} });
});

function trackInventoryGain(player, item) {
    if (!player?.id || !item?.typeId) return;
    const id = item.typeId;
    const amount = item.amount ?? 1;
    progressMission(player, "items_picked", amount);
    if (FOOD_IDS.has(id)) progressMission(player, "food_picked", amount);
    if (MED_IDS.has(id)) progressMission(player, "meds_picked", amount);
    if (AMMO_IDS.has(id)) progressMission(player, "ammo_picked", amount);
    if (ARMOR_IDS.has(id)) progressMission(player, "armor_picked", amount);
}

world.afterEvents.playerInventoryItemChange?.subscribe?.(ev => {
    if (!isMissionsEnabled()) return;
    system.run(() => { try { trackInventoryGain(ev.player, ev.itemStack); } catch {} });
});

system.runInterval(() => {
    if (!isMissionsEnabled()) return;
    const players = world.getAllPlayers();
    if (!players.length) return;

    for (const player of players) {
        try {
            const pos = player.location;
            const prevPos = lastPos.get(player.id);
            if (prevPos) {
                const dx = pos.x - prevPos.x;
                const dz = pos.z - prevPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > 0.05 && dist < 15) {
                    const distInt = Math.floor(dist);
                    const inWater = player.isInWater ?? player.isSwimming;
                    if (inWater) {
                        progressMission(player, "blocks_swum", distInt);
                    } else if (distInt > 0) {
                        progressMission(player, "blocks_walked", distInt);
                        if (player.hasTag(OPEN_WORLD_TAG)) progressMission(player, "blocks_walked_day", distInt);
                        if (dist > 0.25) progressMission(player, "blocks_run", distInt);
                    }
                }
                const fall = prevPos.y - pos.y;
                if (fall >= 10) progressMission(player, "big_falls", 1);
            }
            lastPos.set(player.id, { x: pos.x, y: pos.y, z: pos.z });

            const obj = world.scoreboard.getObjective(SCORE_MONEY);
            if (obj) {
                const curMoney = obj.getScore(player) ?? 0;
                const prevM = prevMoney.get(player.id);
                if (prevM !== undefined && curMoney < prevM) {
                    progressMission(player, "money_spent", prevM - curMoney);
                    progressMission(player, "npc_transactions", 1);
                }
                prevMoney.set(player.id, curMoney);
            }
        } catch {}
    }
}, 80);

system.runInterval(() => {
    if (!isMissionsEnabled()) return;
    for (const player of world.getAllPlayers()) {
        try { progressMission(player, "playtime", 60); } catch {}
    }
}, 1200);

export function onMarketSell(player) { try { progressMission(player, "market_sells", 1); } catch {} }
export function onMarketBuy(player) { try { progressMission(player, "market_buys", 1); } catch {} }
export function trackMenuOpen(player) { try { progressMission(player, "menu_opens", 1); } catch {} }
export function onNpcSell(player, amount) { try { progressMission(player, "money_earned_npc", amount); } catch {} }
export function onMoneyTransfer(player, amount) { try { progressMission(player, "money_transferred", amount); } catch {} }
export function onDeploy(player) { try { progressMission(player, "deploy_entries", 1); } catch {} }
export function onPetroEnter(player) { try { progressMission(player, "petro_entries", 1); } catch {} }
export function onPetroExtract(player) { try { progressMission(player, "petro_extractions", 1); } catch {} }
export { progressMission };

export async function showMissionsAdminPanel(player) {
    const res = await new ActionFormData()
        .title("§c§lAdmin - Misiones")
        .body("§7Gestiona misiones")
        .button("§c🗑 Reset diarias")
        .button("§c🗑 Reset semanales")
        .button("§8Cerrar")
        .show(player);
    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) {
        player.setDynamicProperty(KEY_DAILY_MISSIONS, undefined);
        missionCache.delete(player.id);
        assignDailyMissions(player);
        player.sendMessage("§a✓ Misiones diarias reseteadas.");
    } else if (res.selection === 1) {
        player.setDynamicProperty(KEY_WEEKLY_MISSIONS, undefined);
        missionCache.delete(player.id);
        assignWeeklyMissions(player);
        player.sendMessage("§a✓ Misiones semanales reseteadas.");
    }
}

console.warn("[DailyMissions] v2 lite cargado (misiones DESHABILITADAS)");
