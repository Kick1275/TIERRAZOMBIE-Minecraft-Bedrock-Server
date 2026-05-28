import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// ─── SCOREBOARDS ──────────────────────────────────────────────────────────────
const SCORE_MONEY = "money";
const SCORE_GEMS  = "gems";

// ─── RESET TIMES ─────────────────────────────────────────────────────────────
// Daily reset: midnight UTC (00:00)
// Weekly reset: Monday midnight UTC

function getMidnightUTC() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function getWeekStartUTC() {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun, 1=Mon...
    const diff = (day === 0 ? -6 : 1 - day); // Monday
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff));
    return monday.getTime();
}

// ─── MISSION DEFINITIONS ─────────────────────────────────────────────────────

// type: category key used for slot selection (one per slot)
// track: internal tracking key
// reward: { money?, gems? }
// goal: target number
// extra: optional extra data (mapId, weapon, etc.)

const DAILY_MISSIONS = [
    // COMBATE
    { id: "d_kill_3",        type: "combate",     desc: { es: "Matar 3 jugadores",                          en: "Kill 3 players" },                              goal: 3,   reward: { money: 400 },   track: "kills" },
    { id: "d_kill_airport",  type: "combate",     desc: { es: "Matar 5 jugadores en The Air Port",          en: "Kill 5 players in The Air Port" },              goal: 5,   reward: { money: 2000 },  track: "kills_map", extra: { map: "airport" } },
    { id: "d_kill_shotgun",  type: "combate",     desc: { es: "Matar 2 jugadores con escopeta",             en: "Kill 2 players with a shotgun" },               goal: 2,   reward: { money: 600 },   track: "kills_shotgun" },
    { id: "d_kill_nodeath",  type: "combate",     desc: { es: "Matar 10 jugadores en una partida sin morir","en": "Kill 10 players in one match without dying" }, goal: 10,  reward: { money: 2500 },  track: "kills_nodeath" },
    { id: "d_survive_10m",   type: "combate",     desc: { es: "Sobrevivir 10 minutos en el mapa",           en: "Survive 10 minutes in the map" },               goal: 600, reward: { money: 1000 },  track: "time_in_map" },
    // EXTRACCIÓN
    { id: "d_extract_1",     type: "extraccion",  desc: { es: "Extraerse satisfactoriamente 1 vez",         en: "Extract successfully 1 time" },                 goal: 1,   reward: { money: 500 },   track: "extractions" },
    { id: "d_extract_15",    type: "extraccion",  desc: { es: "Extraerse con al menos 15 items",            en: "Extract with at least 15 items" },              goal: 1,   reward: { money: 300 },   track: "extractions_15items" },
    { id: "d_extract_blood", type: "extraccion",  desc: { es: "Extraerse con un blood bag",                 en: "Extract with a blood bag" },                    goal: 1,   reward: { money: 800 },   track: "extractions_bloodbag" },
    { id: "d_extract_down",  type: "extraccion",  desc: { es: "Extraerse desde The Downtown",               en: "Extract from The Downtown" },                   goal: 1,   reward: { money: 800 },   track: "extractions_map", extra: { map: "downtown" } },
    { id: "d_extract_5",     type: "extraccion",  desc: { es: "Extraerse 5 veces en el día",                en: "Extract 5 times today" },                       goal: 5,   reward: { money: 3000 },  track: "extractions" },
    // RECOLECCIÓN
    { id: "d_loot_20",       type: "recoleccion", desc: { es: "Recoger 20 items del suelo en el mapa",      en: "Pick up 20 items from the ground" },            goal: 20,  reward: { money: 700 },   track: "items_picked" },
    { id: "d_loot_food10",   type: "recoleccion", desc: { es: "Recoger 10 unidades de comida",              en: "Pick up 10 food items" },                       goal: 10,  reward: { money: 800 },   track: "food_picked" },
    { id: "d_loot_meds5",    type: "recoleccion", desc: { es: "Recoger 5 medicamentos",                     en: "Pick up 5 medical items" },                     goal: 5,   reward: { money: 1200 },  track: "meds_picked" },
    { id: "d_loot_green15",  type: "recoleccion", desc: { es: "Recoger 15 items en The Green City",         en: "Pick up 15 items in The Green City" },          goal: 15,  reward: { money: 1200 },  track: "items_picked_map", extra: { map: "green_city" } },
    { id: "d_loot_ammo8",    type: "recoleccion", desc: { es: "Recoger 8 items de munición",                en: "Pick up 8 ammo items" },                        goal: 8,   reward: { money: 1000 },  track: "ammo_picked" },
    // EXPLORACIÓN
    { id: "d_visit_3maps",   type: "exploracion", desc: { es: "Visitar 3 mapas distintos en el día",        en: "Visit 3 different maps today" },                goal: 3,   reward: { money: 1500 },  track: "maps_visited" },
    { id: "d_enter_4",       type: "exploracion", desc: { es: "Entrar al mapa 4 veces en el día",           en: "Enter the map 4 times today" },                 goal: 4,   reward: { money: 1000 },  track: "map_entries" },
    { id: "d_enter_60s",     type: "exploracion", desc: { es: "Entrar al mapa en los primeros 60 segundos", en: "Enter the map in the first 60 seconds" },       goal: 1,   reward: { money: 800 },   track: "early_entries" },
    { id: "d_supply_2",      type: "exploracion", desc: { es: "Llegar al puesto de suministros 2 veces",    en: "Reach the supply post 2 times" },               goal: 2,   reward: { money: 300 },   track: "supply_visits" },
    { id: "d_refuge",        type: "exploracion", desc: { es: "Llegar al refugio desde el mapa",            en: "Return to the refuge from the map" },           goal: 1,   reward: { money: 300 },   track: "refuge_returns" },
    // ECONOMÍA
    { id: "d_spend_5k",      type: "economia",    desc: { es: "Gastar 5,000 coins en tiendas NPC",          en: "Spend 5,000 coins at NPC shops" },              goal: 5000, reward: { money: 300 },  track: "money_spent" },
    { id: "d_sell_market10", type: "economia",    desc: { es: "Vender 10 items en el mercado",              en: "Sell 10 items in the player market" },          goal: 10,   reward: { money: 1200 }, track: "market_sells" },
    { id: "d_buy_market5",   type: "economia",    desc: { es: "Comprar 5 items en el mercado",              en: "Buy 5 items in the player market" },            goal: 5,    reward: { money: 800 },  track: "market_buys" },
    { id: "d_transfer_3k",   type: "economia",    desc: { es: "Transferir 3,000 coins a otro jugador",      en: "Transfer 3,000 coins to another player" },      goal: 3000, reward: { money: 400 },  track: "money_transferred" },
    { id: "d_earn_npc_2k",   type: "economia",    desc: { es: "Ganar 2,000 coins vendiendo a NPCs",         en: "Earn 2,000 coins selling to NPCs" },            goal: 2000, reward: { money: 400 },  track: "money_earned_npc" },
    // MOVIMIENTO
    { id: "d_walk_2k",       type: "movimiento",  desc: { es: "Caminar 2,000 bloques",                      en: "Walk 2,000 blocks" },                           goal: 2000,  reward: { money: 600 },  track: "blocks_walked" },
    { id: "d_walk_map1k",    type: "movimiento",  desc: { es: "Caminar 1,000 bloques dentro del mapa",      en: "Walk 1,000 blocks inside the map" },            goal: 1000,  reward: { money: 800 },  track: "blocks_walked_map" },
    { id: "d_run_3k",        type: "movimiento",  desc: { es: "Correr 3,000 bloques",                       en: "Run 3,000 blocks" },                            goal: 3000,  reward: { money: 700 },  track: "blocks_run" },
    { id: "d_fall_10",       type: "movimiento",  desc: { es: "Caer desde una altura de 10 bloques",        en: "Fall from a height of 10 blocks" },             goal: 1,     reward: { money: 200 },  track: "big_falls" },
    { id: "d_swim_100",      type: "movimiento",  desc: { es: "Nadar 100 bloques",                          en: "Swim 100 blocks" },                             goal: 100,   reward: { money: 300 },  track: "blocks_swum" },
    // SOCIAL
    { id: "d_team_match",    type: "social",      desc: { es: "Jugar 1 partida completa en equipo",         en: "Play 1 full match in a team" },                 goal: 1,   reward: { money: 1200 },  track: "team_matches" },
    { id: "d_team_extract",  type: "social",      desc: { es: "Extraerse 1 vez en equipo",                  en: "Extract 1 time as a team" },                   goal: 1,   reward: { money: 2000 },  track: "team_extractions" },
    { id: "d_team_invite2",  type: "social",      desc: { es: "Invitar a 2 jugadores a tu equipo",          en: "Invite 2 players to your team" },               goal: 2,   reward: { money: 400 },   track: "team_invites" },
    { id: "d_team_kill3",    type: "social",      desc: { es: "Matar 3 jugadores estando en equipo",        en: "Kill 3 players while in a team" },              goal: 3,   reward: { money: 700 },   track: "team_kills" },
    { id: "d_team_enter2",   type: "social",      desc: { es: "Entrar al mapa con equipo de 2 personas",    en: "Enter the map with a 2-person team" },          goal: 1,   reward: { money: 500 },   track: "team_entries" },
    // COLISEO
    { id: "d_col_enter3",    type: "coliseo",     desc: { es: "Entrar al coliseo 3 veces",                  en: "Enter the coliseum 3 times" },                  goal: 3,   reward: { money: 300 },   track: "coliseum_entries" },
    { id: "d_col_kill15",    type: "coliseo",     desc: { es: "Matar 15 jugadores en el coliseo",           en: "Kill 15 players in the coliseum" },             goal: 15,  reward: { money: 500 },   track: "coliseum_kills" },
    { id: "d_col_kill20",    type: "coliseo",     desc: { es: "Matar 20 jugadores en el coliseo",           en: "Kill 20 players in the coliseum" },             goal: 20,  reward: { money: 1000 },  track: "coliseum_kills" },
    { id: "d_col_survive5m", type: "coliseo",     desc: { es: "Sobrevivir 5 minutos en el coliseo",         en: "Survive 5 minutes in the coliseum" },           goal: 300, reward: { money: 1000 },  track: "coliseum_time" },
    { id: "d_col_pistol3",   type: "coliseo",     desc: { es: "Matar 3 jugadores con pistola en el coliseo","en": "Kill 3 players with a pistol in the coliseum" }, goal: 3, reward: { money: 1500 }, track: "coliseum_pistol_kills" },
    // MISC
    { id: "d_login",         type: "misc",        desc: { es: "Conectarse al servidor",                     en: "Connect to the server" },                       goal: 1,   reward: { money: 200 },   track: "logins" },
    { id: "d_play_30m",      type: "misc",        desc: { es: "Jugar 30 minutos en el servidor",            en: "Play 30 minutes on the server" },               goal: 1800, reward: { money: 800 },  track: "playtime" },
    { id: "d_die_5",         type: "misc",        desc: { es: "Morir 5 veces",                              en: "Die 5 times" },                                 goal: 5,   reward: { money: 300 },   track: "deaths_today" },
    { id: "d_menu_5",        type: "misc",        desc: { es: "Abrir el menú del servidor 5 veces",         en: "Open the server menu 5 times" },                goal: 5,   reward: { money: 200 },   track: "menu_opens" },
    { id: "d_chat_10",       type: "misc",        desc: { es: "Enviar 10 mensajes en el chat",              en: "Send 10 chat messages" },                       goal: 10,  reward: { money: 300 },   track: "chat_messages" },
];

const WEEKLY_MISSIONS = [
    // COMBATE
    { id: "w_kill_50",        type: "combate",     desc: { es: "Matar 50 jugadores en la semana",                    en: "Kill 50 players this week" },                          goal: 50,  reward: { money: 10000 }, track: "kills" },
    { id: "w_kill_airport10", type: "combate",     desc: { es: "Matar 10 jugadores en The Air Port en una partida",  en: "Kill 10 players in The Air Port in one match" },       goal: 10,  reward: { money: 5000 }, track: "kills_map", extra: { map: "airport" } },
    { id: "w_kill_shotgun50", type: "combate",     desc: { es: "Matar 50 jugadores con escopeta en la semana",       en: "Kill 50 players with a shotgun this week" },           goal: 50,  reward: { money: 13000 }, track: "kills_shotgun" },
    { id: "w_kill_nodeath5",  type: "combate",     desc: { es: "Matar 5 jugadores sin morir en 3 partidas distintas","en": "Kill 5 players without dying in 3 different matches" }, goal: 3, reward: { money: 15000 }, track: "nodeath_matches" },
    { id: "w_kill_100",       type: "combate",     desc: { es: "Matar 100 jugadores en la semana",                   en: "Kill 100 players this week" },                         goal: 100, reward: { gems: 50 },     track: "kills" },
    { id: "w_kill_desert10",  type: "combate",     desc: { es: "Matar 10 jugadores en The Desert en una partida",    en: "Kill 10 players in The Desert in one match" },         goal: 10,  reward: { money: 13000 }, track: "kills_map", extra: { map: "desert" } },
    { id: "w_kill_pistol50",  type: "combate",     desc: { es: "Matar 50 jugadores con pistola en la semana",        en: "Kill 50 players with a pistol this week" },            goal: 50,  reward: { money: 15000 }, track: "kills_pistol" },
    // EXTRACCIÓN
    { id: "w_extract_10",     type: "extraccion",  desc: { es: "Extraerse 10 veces en la semana",                    en: "Extract 10 times this week" },                         goal: 10,  reward: { money: 10000 }, track: "extractions" },
    { id: "w_extract_20x3",   type: "extraccion",  desc: { es: "Extraerse con 20 items en el inventario 3 veces",    en: "Extract with 20 items 3 times" },                      goal: 3,   reward: { money: 15000 }, track: "extractions_15items" },
    { id: "w_extract_4maps",  type: "extraccion",  desc: { es: "Extraerse desde los 4 mapas distintos en la semana", en: "Extract from all 4 maps this week" },                  goal: 4,   reward: { money: 20000 }, track: "extraction_maps" },
    { id: "w_extract_blood5", type: "extraccion",  desc: { es: "Extraerse con un blood bag 5 veces en la semana",    en: "Extract with a blood bag 5 times this week" },         goal: 5,   reward: { money: 10000 }, track: "extractions_bloodbag" },
    { id: "w_extract_5min3",  type: "extraccion",  desc: { es: "Extraerse en los primeros 5 minutos 3 veces",        en: "Extract in the first 5 minutes 3 times" },             goal: 3,   reward: { money: 15000 }, track: "early_extractions" },
    { id: "w_extract_3row",   type: "extraccion",  desc: { es: "Extraerse 3 veces seguidas sin morir",               en: "Extract 3 times in a row without dying" },             goal: 3,   reward: { money: 15000 }, track: "extraction_streak" },
    // RECOLECCIÓN
    { id: "w_loot_200",       type: "recoleccion", desc: { es: "Recoger 1000 items del suelo en la semana",           en: "Pick up 1000 items this week" },                        goal: 1000, reward: { money: 20000 }, track: "items_picked" },
    { id: "w_loot_food100",   type: "recoleccion", desc: { es: "Recoger 500 unidades de comida en la semana",        en: "Pick up 500 food items this week" },                   goal: 500, reward: { money: 10000 }, track: "food_picked" },
    { id: "w_loot_meds50",    type: "recoleccion", desc: { es: "Recoger 50 medicamentos en la semana",               en: "Pick up 50 medical items this week" },                 goal: 50,  reward: { money: 5000 }, track: "meds_picked" },
    { id: "w_loot_ammo75",    type: "recoleccion", desc: { es: "Recoger 75 items de munición en la semana",          en: "Pick up 75 ammo items this week" },                    goal: 75,  reward: { money: 15000 }, track: "ammo_picked" },
    { id: "w_loot_down100",   type: "recoleccion", desc: { es: "Recoger 1000 items en The Downtown en la semana",     en: "Pick up 1000 items in The Downtown this week" },        goal: 1000, reward: { money: 20000 }, track: "items_picked_map", extra: { map: "downtown" } },
    { id: "w_loot_armor50",   type: "recoleccion", desc: { es: "Recoger 50 items de armadura en la semana",          en: "Pick up 50 armor items this week" },                   goal: 50,  reward: { money: 5000 }, track: "armor_picked" },
    // EXPLORACIÓN
    { id: "w_visit_all",      type: "exploracion", desc: { es: "Visitar todos los mapas en un mismo día",            en: "Visit all maps in one day" },                          goal: 4,   reward: { money: 10000 }, track: "maps_visited_day" },
    { id: "w_enter_30",       type: "exploracion", desc: { es: "Entrar al mapa 30 veces en la semana",               en: "Enter the map 30 times this week" },                   goal: 30,  reward: { money: 40000 }, track: "map_entries" },
    //{ id: "w_enter_30s5",     type: "exploracion", desc: { es: "Entrar al mapa en los primeros 30 segundos 5 veces", en: "Enter the map in the first 30 seconds 5 times" },      goal: 5,   reward: { money: 25000 }, track: "early_entries_30s" },
    { id: "w_supply_100",     type: "exploracion", desc: { es: "Llegar al puesto de suministros 100 veces",          en: "Reach the supply post 100 times this week" },          goal: 100, reward: { money: 15000 }, track: "supply_visits" },
    { id: "w_all_maps_3d",    type: "exploracion", desc: { es: "Jugar en todos los mapas 3 días distintos",          en: "Play in all maps on 3 different days" },               goal: 3,   reward: { money: 25000 }, track: "all_maps_days" },
    // ECONOMÍA
    { id: "w_spend_30k",      type: "economia",    desc: { es: "Gastar 30,000 TzCoins en tiendas NPC",               en: "Spend 30,000 TzCoins at NPC shops this week" },        goal: 30000,  reward: { money: 5000 }, track: "money_spent" },
    { id: "w_sell_market50",  type: "economia",    desc: { es: "Vender 50 items en el mercado de jugadores",         en: "Sell 50 items in the player market this week" },       goal: 50,     reward: { money: 5000 }, track: "market_sells" },
    { id: "w_buy_market30",   type: "economia",    desc: { es: "Comprar 30 items en el mercado de jugadores",        en: "Buy 30 items in the player market this week" },        goal: 30,     reward: { money: 10000 }, track: "market_buys" },
    { id: "w_bank_150k",      type: "economia",    desc: { es: "Acumular 150,000 TzCoins en el banco",               en: "Accumulate 150,000 TzCoins in the bank" },             goal: 150000, reward: { money: 20000 }, track: "bank_balance" },
    { id: "w_npc_20tx",       type: "economia",    desc: { es: "Realizar 20 transacciones en tiendas NPC",           en: "Make 20 transactions at NPC shops this week" },        goal: 20,     reward: { money: 5000 }, track: "npc_transactions" },
    { id: "w_earn_50k",       type: "economia",    desc: { es: "Ganar 50,000 TzCoins vendiendo a NPCs",              en: "Earn 50,000 TzCoins selling to NPCs this week" },      goal: 50000,  reward: { money: 5000 }, track: "money_earned_npc" },
    // MOVIMIENTO
    { id: "w_walk_25k",       type: "movimiento",  desc: { es: "Caminar 25,000 bloques en la semana",                en: "Walk 25,000 blocks this week" },                       goal: 25000, reward: { money: 15000 }, track: "blocks_walked" },
    { id: "w_walk_map8k",     type: "movimiento",  desc: { es: "Caminar 8,000 bloques dentro del mapa",              en: "Walk 8,000 blocks inside the map this week" },         goal: 8000,  reward: { money: 15000 }, track: "blocks_walked_map" },
    { id: "w_run_20k",        type: "movimiento",  desc: { es: "Correr 20,000 bloques en la semana",                 en: "Run 20,000 blocks this week" },                        goal: 20000, reward: { money: 10000 }, track: "blocks_run" },
    { id: "w_swim_2k",        type: "movimiento",  desc: { es: "Nadar 2,000 bloques en la semana",                   en: "Swim 2,000 blocks this week" },                        goal: 2000,  reward: { money: 5000 }, track: "blocks_swum" },
    { id: "w_walk_day5k",     type: "movimiento",  desc: { es: "Caminar 5,000 bloques en un solo día",               en: "Walk 5,000 blocks in a single day" },                  goal: 5000,  reward: { money: 10000 }, track: "blocks_walked_day" },
    // SOCIAL
    { id: "w_team_extract10", type: "social",      desc: { es: "Extraerse 10 veces en equipo en la semana",          en: "Extract 10 times as a team this week" },               goal: 10,  reward: { money: 10000 }, track: "team_extractions" },
    { id: "w_team_15match",   type: "social",      desc: { es: "Jugar 15 partidas completas en equipo",              en: "Play 15 full matches in a team this week" },           goal: 15,  reward: { money: 15000 }, track: "team_matches" },
    { id: "w_team_kill50",    type: "social",      desc: { es: "Matar 50 jugadores estando en equipo",               en: "Kill 50 players while in a team this week" },          goal: 50,  reward: { money: 30000 }, track: "team_kills" },
    { id: "w_team_invite5",   type: "social",      desc: { es: "Invitar a 5 jugadores distintos a tu equipo",        en: "Invite 5 different players to your team this week" },  goal: 5,   reward: { money: 5000 }, track: "team_invites" },
    { id: "w_team_enter5x5",  type: "social",      desc: { es: "Entrar al mapa con equipo de 5 personas 5 veces",    en: "Enter the map with a 5-person team 5 times" },         goal: 5,   reward: { money: 5000 }, track: "team_entries_5" },
    // COLISEO
    { id: "w_col_kill50",     type: "coliseo",     desc: { es: "Matar 50 jugadores en el coliseo en la semana",      en: "Kill 50 players in the coliseum this week" },          goal: 50,  reward: { money: 5000 }, track: "coliseum_kills" },
    { id: "w_col_kill100",    type: "coliseo",     desc: { es: "Matar 100 jugadores en el coliseo en la semana",     en: "Kill 100 players in the coliseum this week" },         goal: 100, reward: { money: 10000 }, track: "coliseum_kills" },
    { id: "w_col_survive20m", type: "coliseo",     desc: { es: "Sobrevivir 20 minutos en el coliseo en la semana",   en: "Survive 20 minutes in the coliseum this week" },       goal: 1200, reward: { money: 15000 }, track: "coliseum_time" },
    { id: "w_col_pistol50",   type: "coliseo",     desc: { es: "Matar 50 jugadores con pistola en el coliseo",       en: "Kill 50 players with a pistol in the coliseum" },      goal: 50,  reward: { money: 15000 }, track: "coliseum_pistol_kills" },
    { id: "w_col_enter35",    type: "coliseo",     desc: { es: "Entrar al coliseo 35 veces en la semana",            en: "Enter the coliseum 35 times this week" },              goal: 35,  reward: { money: 5000 }, track: "coliseum_entries" },
    // PROGRESIÓN (siempre activas, no ocupan slot)
    { id: "w_prog_daily5",    type: "progresion",  desc: { es: "Completar todas las misiones diarias 5 días seguidos","en": "Complete all daily missions 5 days in a row" },    goal: 5,   reward: { gems: 100 },    track: "daily_streak" },
    { id: "w_prog_daily7",    type: "progresion",  desc: { es: "Completar todas las misiones diarias los 7 días",    en: "Complete all daily missions all 7 days" },             goal: 7,   reward: { gems: 120 },    track: "daily_streak" },
    { id: "w_prog_first",     type: "progresion",  desc: { es: "Ser el primero en completar una misión semanal",     en: "Be the first to complete a weekly mission" },          goal: 1,   reward: { gems: 40 },     track: "weekly_first" },
    { id: "w_prog_8types",    type: "progresion",  desc: { es: "Completar misiones de los 8 tipos distintos",        en: "Complete missions of all 8 different types" },         goal: 8,   reward: { gems: 60 },     track: "mission_types_done" },
    { id: "w_prog_5weekly",   type: "progresion",  desc: { es: "Completar 5 misiones semanales en la misma semana",  en: "Complete 5 weekly missions in the same week" },        goal: 5,   reward: { gems: 70 },     track: "weekly_completed" },
];

// ─── TYPES FOR SLOT SELECTION ─────────────────────────────────────────────────
const DAILY_TYPES   = ["combate","extraccion","recoleccion","exploracion","economia","movimiento","social","coliseo","misc"];
const WEEKLY_TYPES  = ["combate","extraccion","recoleccion","exploracion","economia","movimiento","social","coliseo"];
// progresion is always-on, not slotted

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────
const KEY_DAILY_MISSIONS   = "dm:daily";    // per-player: JSON {date, missions:[{id,progress,done}]}
const KEY_WEEKLY_MISSIONS  = "dm:weekly";   // per-player: JSON {week, missions:[{id,progress,done}]}
const KEY_PROG_DATA        = "dm:prog";     // per-player: JSON {daily_streak, last_full_day, weekly_first_done, ...}
const KEY_WEEKLY_FIRST     = "dm:wfirst";   // world: playerId who was first this week

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getPlayerLang(player) {
    try { const s = player.getDynamicProperty("playerSettings"); if (s) return JSON.parse(s).language ?? "es"; } catch {}
    return "es";
}

function getLang(obj, player) {
    const l = getPlayerLang(player);
    return obj[l] ?? obj["es"];
}

function getScore(player, objective) {
    try {
        const obj = world.scoreboard.getObjective(objective);
        return obj ? (obj.getScore(player) ?? 0) : 0;
    } catch { return 0; }
}

function addScore(player, objective, amount) {
    try {
        let obj = world.scoreboard.getObjective(objective);
        if (!obj) obj = world.scoreboard.addObjective(objective, objective);
        const cur = obj.getScore(player) ?? 0;
        obj.setScore(player, cur + amount);
    } catch (e) { console.warn("[Missions] addScore error: " + e); }
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function todayKey() {
    return getMidnightUTC();
}

function weekKey() {
    return getWeekStartUTC();
}

// ─── MISSION ASSIGNMENT ───────────────────────────────────────────────────────

function assignDailyMissions(player) {
    const today = todayKey();
    try {
        const raw = player.getDynamicProperty(KEY_DAILY_MISSIONS);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.date === today) return data; // already assigned today
        }
    } catch {}

    // Pick 5 types randomly, one mission per type
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
    const week = weekKey();
    try {
        const raw = player.getDynamicProperty(KEY_WEEKLY_MISSIONS);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.week === week) return data;
        }
    } catch {}

    // Pick 7 types randomly, one mission per type (excluding progresion)
    const types = shuffle(WEEKLY_TYPES).slice(0, 7);
    const missions = types.map(type => {
        const pool = WEEKLY_MISSIONS.filter(m => m.type === type);
        const picked = pool[Math.floor(Math.random() * pool.length)];
        return { id: picked.id, progress: 0, done: false };
    });

    // Always-on progresion missions
    const progMissions = WEEKLY_MISSIONS
        .filter(m => m.type === "progresion")
        .map(m => ({ id: m.id, progress: 0, done: false }));

    const data = { week, missions, prog: progMissions };
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(data));
    return data;
}

// Caché en memoria para evitar JSON.parse repetido cada segundo
const missionCache = new Map(); // playerId -> { daily, weekly, dailyDate, weeklyDate }

function getProgData(player) {
    try {
        const raw = player.getDynamicProperty(KEY_PROG_DATA);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveProgData(player, data) {
    try { player.setDynamicProperty(KEY_PROG_DATA, JSON.stringify(data)); } catch {}
}

function invalidateMissionCache(playerId) {
    missionCache.delete(playerId);
}

function getCachedMissions(player) {
    const now = Date.now();
    const today = todayKey();
    const week = weekKey();
    let cache = missionCache.get(player.id);

    // Invalidar caché si el día o semana cambió
    if (cache && (cache.dailyDate !== today || cache.weeklyDate !== week)) {
        cache = null;
    }

    if (!cache) {
        cache = {
            daily: assignDailyMissions(player),
            weekly: assignWeeklyMissions(player),
            dailyDate: today,
            weeklyDate: week
        };
        missionCache.set(player.id, cache);
    }
    return cache;
}

// ─── PROGRESS TRACKING ────────────────────────────────────────────────────────

function progressMission(player, trackKey, amount = 1, extra = {}) {
    const cache = getCachedMissions(player);
    const daily  = cache.daily;
    const weekly = cache.weekly;
    let dailyChanged = false, weeklyChanged = false;

    for (const slot of daily.missions) {
        if (slot.done) continue;
        const def = DAILY_MISSIONS.find(m => m.id === slot.id);
        if (!def || def.track !== trackKey) continue;
        if (def.extra) {
            if (def.extra.map && extra.map !== def.extra.map) continue;
        }
        slot.progress = Math.min(slot.progress + amount, def.goal);
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§a✓ §lMisión Diaria Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
            checkDailyAllDone(player, daily);
        }
        dailyChanged = true;
    }

    for (const slot of weekly.missions) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def || def.track !== trackKey) continue;
        if (def.extra) {
            if (def.extra.map && extra.map !== def.extra.map) continue;
        }
        slot.progress = Math.min(slot.progress + amount, def.goal);
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§b✓ §lMisión Semanal Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
            checkWeeklyFirst(player, weekly);
            checkWeeklyTypesAndCount(player, weekly);
        }
        weeklyChanged = true;
    }

    // Progresion missions
    for (const slot of (weekly.prog ?? [])) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def || def.track !== trackKey) continue;
        slot.progress = Math.min(slot.progress + amount, def.goal);
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lMisión de Progresión Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
        weeklyChanged = true;
    }

    if (dailyChanged)  player.setDynamicProperty(KEY_DAILY_MISSIONS,  JSON.stringify(daily));
    if (weeklyChanged) player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));

    // Mantener caché sincronizado
    const missionData = missionCache.get(player.id);
    if (missionData) {
        if (dailyChanged) missionData.daily = daily;
        if (weeklyChanged) missionData.weekly = weekly;
    }
}

function grantReward(player, reward) {
    if (reward.money) addScore(player, SCORE_MONEY, reward.money);
    if (reward.gems)  addScore(player, SCORE_GEMS,  reward.gems);
}

function rewardText(reward) {
    const parts = [];
    if (reward.money) parts.push(`${reward.money.toLocaleString()} TzCoins`);
    if (reward.gems)  parts.push(`${reward.gems} Gems`);
    return parts.join(" + ");
}

function checkDailyAllDone(player, daily) {
    if (!daily.missions.every(s => s.done)) return;
    const prog = getProgData(player);
    const today = todayKey();
    const yesterday = today - 86400000;
    if (prog.last_full_day === yesterday) {
        prog.daily_streak = (prog.daily_streak ?? 0) + 1;
    } else if (prog.last_full_day !== today) {
        prog.daily_streak = 1;
    }
    prog.last_full_day = today;
    saveProgData(player, prog);
    // Update streak progress in weekly prog missions
    progressMission(player, "daily_streak", 0); // trigger re-check with current streak
    const weekly = assignWeeklyMissions(player);
    for (const slot of (weekly.prog ?? [])) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def || def.track !== "daily_streak") continue;
        slot.progress = prog.daily_streak;
        if (slot.progress >= def.goal) {
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lMisión de Progresión Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
    }
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
}

function checkWeeklyFirst(player, weekly) {
    try {
        const week = weekKey();
        const raw = world.getDynamicProperty(KEY_WEEKLY_FIRST);
        const data = raw ? JSON.parse(raw) : {};
        if (data.week === week) return; // already claimed
        world.setDynamicProperty(KEY_WEEKLY_FIRST, JSON.stringify({ week, player: player.id }));
        // Grant first-completer reward via prog mission
        for (const slot of (weekly.prog ?? [])) {
            if (slot.done) continue;
            const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
            if (!def || def.track !== "weekly_first") continue;
            slot.progress = 1;
            slot.done = true;
            grantReward(player, def.reward);
            player.sendMessage(`§d✓ §lMisión de Progresión Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
        }
    } catch {}
}

function checkWeeklyTypesAndCount(player, weekly) {
    const doneTypes = new Set(
        weekly.missions.filter(s => s.done).map(s => {
            const def = WEEKLY_MISSIONS.find(m => m.id === s.id);
            return def?.type;
        }).filter(Boolean)
    );
    const doneCount = weekly.missions.filter(s => s.done).length;

    for (const slot of (weekly.prog ?? [])) {
        if (slot.done) continue;
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def) continue;
        if (def.track === "mission_types_done") {
            slot.progress = doneTypes.size;
            if (slot.progress >= def.goal) {
                slot.done = true;
                grantReward(player, def.reward);
                player.sendMessage(`§d✓ §lMisión de Progresión Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
            }
        }
        if (def.track === "weekly_completed") {
            slot.progress = doneCount;
            if (slot.progress >= def.goal) {
                slot.done = true;
                grantReward(player, def.reward);
                player.sendMessage(`§d✓ §lMisión de Progresión Completada: §r§f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
            }
        }
    }
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export async function showMissionsUI(player) {
    const lang = getPlayerLang(player);
    const daily  = assignDailyMissions(player);
    const weekly = assignWeeklyMissions(player);

    const form = new ActionFormData()
        .title(lang === "es" ? "§l§eMisiones" : "§l§eMissions");

    form.button(lang === "es" ? "§a📋 Misiones Diarias\n§r§7Ver tus misiones de hoy"    : "§a📋 Daily Missions\n§r§7View today's missions",    "textures/ui/icon_book_writable.png");
    form.button(lang === "es" ? "§b📅 Misiones Semanales\n§r§7Ver tus misiones de la semana" : "§b📅 Weekly Missions\n§r§7View this week's missions", "textures/ui/icon_recipe_nature.png");
    form.button(lang === "es" ? "§d⭐ Progresión\n§r§7Objetivos permanentes de la semana" : "§d⭐ Progression\n§r§7Permanent weekly objectives",    "textures/ui/icon_best_3.png");

    const res = await form.show(player);
    if (res.canceled) return;

    if (res.selection === 0) await showDailyUI(player, daily);
    else if (res.selection === 1) await showWeeklyUI(player, weekly);
    else await showProgUI(player, weekly);
}

async function showDailyUI(player, daily) {
    const lang = getPlayerLang(player);
    const now = Date.now();
    const resetIn = getMidnightUTC() + 86400000 - now;
    const hh = Math.floor(resetIn / 3600000);
    const mm = Math.floor((resetIn % 3600000) / 60000);

    let body = lang === "es"
        ? `§7Reset en: §e${hh}h ${mm}m\n\n`
        : `§7Resets in: §e${hh}h ${mm}m\n\n`;

    for (const slot of daily.missions) {
        const def = DAILY_MISSIONS.find(m => m.id === slot.id);
        if (!def) continue;
        const desc = getLang(def.desc, player);
        const pct  = Math.floor((slot.progress / def.goal) * 100);
        const bar  = progressBar(slot.progress, def.goal);
        const status = slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`;
        body += `${slot.done ? "§a" : "§f"}${desc}\n`;
        body += `${bar} ${status}  §e+${rewardText(def.reward)}\n\n`;
    }

    const doneCount = daily.missions.filter(s => s.done).length;
    body += `§7Completadas: §e${doneCount}§7/§f5`;

    await new ActionFormData()
        .title(lang === "es" ? "§l§aMisiones Diarias" : "§l§aDaily Missions")
        .body(body)
        .button(lang === "es" ? "§8Cerrar" : "§8Close")
        .show(player);
}

async function showWeeklyUI(player, weekly) {
    const lang = getPlayerLang(player);
    const now = Date.now();
    const resetIn = getWeekStartUTC() + 7 * 86400000 - now;
    const dd = Math.floor(resetIn / 86400000);
    const hh = Math.floor((resetIn % 86400000) / 3600000);

    let body = lang === "es"
        ? `§7Reset en: §e${dd}d ${hh}h\n\n`
        : `§7Resets in: §e${dd}d ${hh}h\n\n`;

    for (const slot of weekly.missions) {
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def) continue;
        const desc = getLang(def.desc, player);
        const bar  = progressBar(slot.progress, def.goal);
        const status = slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`;
        body += `${slot.done ? "§a" : "§f"}${desc}\n`;
        body += `${bar} ${status}  §e+${rewardText(def.reward)}\n\n`;
    }

    const doneCount = weekly.missions.filter(s => s.done).length;
    body += `§7Completadas: §e${doneCount}§7/§f7`;

    await new ActionFormData()
        .title(lang === "es" ? "§l§bMisiones Semanales" : "§l§bWeekly Missions")
        .body(body)
        .button(lang === "es" ? "§8Cerrar" : "§8Close")
        .show(player);
}

async function showProgUI(player, weekly) {
    const lang = getPlayerLang(player);
    const prog = getProgData(player);

    let body = lang === "es"
        ? `§7Objetivos permanentes de la semana:\n\n`
        : `§7Permanent weekly objectives:\n\n`;

    for (const slot of (weekly.prog ?? [])) {
        const def = WEEKLY_MISSIONS.find(m => m.id === slot.id);
        if (!def) continue;
        const desc = getLang(def.desc, player);
        const bar  = progressBar(slot.progress, def.goal);
        const status = slot.done ? "§a✓" : `§e${slot.progress}§7/§f${def.goal}`;
        body += `${slot.done ? "§a" : "§f"}${desc}\n`;
        body += `${bar} ${status}  §e+${rewardText(def.reward)}\n\n`;
    }

    await new ActionFormData()
        .title(lang === "es" ? "§l§dProgresión Semanal" : "§l§dWeekly Progression")
        .body(body)
        .button(lang === "es" ? "§8Cerrar" : "§8Close")
        .show(player);
}

function progressBar(current, goal) {
    const filled = Math.floor((current / goal) * 10);
    const empty  = 10 - filled;
    return "§a" + "█".repeat(filled) + "§8" + "█".repeat(empty);
}

// ─── ITEM CATEGORY SETS ───────────────────────────────────────────────────────

const FOOD_IDS = new Set([
    "mcpe:canned_peaches","mcpe:canned_beans","mcpe:canned_beef_stew","mcpe:canned_chicken",
    "mcpe:canned_chili","mcpe:canned_corned","mcpe:canned_fruit","mcpe:canned_ham",
    "mcpe:canned_ration","mcpe:canned_sardine","mcpe:canned_spaghetti","mcpe:canned_tuna",
    "mcpe:canned_tomato","mcpe:canned_bacon","mcpe:chip_potato","mcpe:chip_tortilla",
    "mcpe:creeper_crunch","mcpe:meat_jerky","mcpe:mre","mcpe:rice","mcpe:strawberry_jam",
    "mcpe:tactical_sandwich","mcpe:chocolate_bar","mcpe:apple_green","mcpe:banana",
    "mcpe:tomato","mcpe:cucumber","mcpe:pear","mcpe:zucchini",
    "mcpe:coffee","mcpe:energy_drink","mcpe:grape_soda","mcpe:lemonade","mcpe:popsi_cola",
    "mcpe:red_wine","mcpe:vodka","mcpe:whiskey","mcpe:beer_bottle","mcpe:milk_gallon",
    "mcpe:bottle_water","mcpe:pot_cook_water","mcpe:pot_water",
]);

const MED_IDS = new Set([
    "mcpe:adrenaline","mcpe:alcoholic_tinture","mcpe:antidote","mcpe:bandage",
    "mcpe:bandage_sterilized","mcpe:blood_bag_type_a","mcpe:blood_bag_type_ab",
    "mcpe:blood_bag_type_b","mcpe:blood_bag_type_o","mcpe:blood_bag_emp",
    "mcpe:blood_bag_unknown","mcpe:blood_test_kit","mcpe:first_aid","mcpe:morphine",
    "mcpe:painkiller","mcpe:rags","mcpe:rags_dirty","mcpe:rags_sterilized",
    "mcpe:splint","mcpe:water_purification",
]);

// All TACZ ammo types
const AMMO_IDS = new Set([
    "krep:m43","krep:mm9","krep:gauge12","krep:lapua338","krep:mag357",
    "krep:mm5728","krep:acp45","krep:ae50","krep:mm4630","krep:mm5842",
    "krep:ammobox","krep:ammoboxc",
]);

const ARMOR_IDS = new Set([
    "mcpe:army_artic","mcpe:army_desert","mcpe:army_woodland",
    "mcpe:assault_helmet_black","mcpe:assault_helmet_olive",
    "mcpe:ballistic_black","mcpe:ballistic_green","mcpe:ballistic_tan","mcpe:ballistic_white",
    "mcpe:tactical_vest_black","mcpe:tactical_vest_olive","mcpe:tactical_vest_tan","mcpe:tactical_vest_white",
    "mcpe:combat_olive","mcpe:combat_tan","mcpe:combat_white",
    "mcpe:plate_vest_gray","mcpe:plate_vest_olive","mcpe:plate_vest_tan","mcpe:plate_vest_white",
    "mcpe:stab_vest_gray","mcpe:stab_vest_tan","mcpe:stab_vest_white",
    "mcpe:assault_vest_black","mcpe:assault_vest_olive",
    "mcpe:chest_brown","mcpe:chest_green","mcpe:chest_navy","mcpe:chest_tan","mcpe:chest_white",
    "mcpe:hunting_brown","mcpe:hunting_navy","mcpe:police_vest","mcpe:press_vest",
    "mcpe:spec_helmet","mcpe:tactical_helmet_black","mcpe:tactical_helmet_olive",
    "mcpe:tactical_helmet_tan","mcpe:tactical_helmet_white",
    "mcpe:gasmask_black","mcpe:gasmask_tactical","mcpe:gasmask_white",
    "mcpe:biker_black","mcpe:biker_blue","mcpe:biker_red","mcpe:biker_white","mcpe:biker_yellow",
]);

// TACZ weapon categorization by real IDs
const SHOTGUN_IDS = new Set([
    "krep:m870","krep:aa12","krep:saiga12","krep:m1014","krep:db",
]);

const PISTOL_IDS = new Set([
    "krep:g17","krep:g18","krep:m1911","krep:p320","krep:b93","krep:cp",
    "krep:deagle","krep:deagleg","krep:t50",
]);

// ─── EVENT HOOKS ──────────────────────────────────────────────────────────────

// Login
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    const player = ev.player;
    system.runTimeout(() => {
        try {
            assignDailyMissions(player);
            assignWeeklyMissions(player);
            progressMission(player, "logins", 1);
        } catch (e) { console.warn("[Missions] spawn error: " + e); }
    }, 60);
});

// Logout - invalidate cache
world.afterEvents.playerLeave.subscribe(ev => {
    try {
        invalidateMissionCache(ev.player.id);
    } catch {}
});

// Deaths
world.afterEvents.entityDie.subscribe(ev => {
    if (ev.deadEntity?.typeId !== "minecraft:player") return;
    const player = ev.deadEntity;
    try { progressMission(player, "deaths_today", 1); } catch {}
}, { entityTypes: ["minecraft:player"] });

// Chat messages
world.beforeEvents.chatSend.subscribe(ev => {
    const player = ev.sender;
    system.run(() => {
        try { progressMission(player, "chat_messages", 1); } catch {}
    });
});

// ─── ITEM PICKUP via inventory snapshot diff ──────────────────────────────────
// Since itemPickedUp doesn't exist in stable API, we snapshot inventory every second
// and detect increases in item counts
const invSnapshot = new Map(); // playerId -> Map<typeId, count>

function getInvCounts(player) {
    const counts = new Map();
    try {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) return counts;
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item) continue;
            counts.set(item.typeId, (counts.get(item.typeId) ?? 0) + item.amount);
        }
    } catch {}
    return counts;
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const cur = getInvCounts(player);
            const prev = invSnapshot.get(player.id);
            if (prev) {
                let totalNew = 0;
                for (const [id, count] of cur) {
                    const prevCount = prev.get(id) ?? 0;
                    const gained = count - prevCount;
                    if (gained <= 0) continue;
                    totalNew += gained;
                    if (FOOD_IDS.has(id))  progressMission(player, "food_picked",  gained);
                    if (MED_IDS.has(id))   progressMission(player, "meds_picked",  gained);
                    if (AMMO_IDS.has(id))  progressMission(player, "ammo_picked",  gained);
                    if (ARMOR_IDS.has(id)) progressMission(player, "armor_picked", gained);
                }
                if (totalNew > 0) {
                    progressMission(player, "items_picked", totalNew);
                    if (player.hasTag("gm:in_map")) {
                        const mapId = player.getDynamicProperty("gm:mapId");
                        if (mapId) progressMission(player, "items_picked_map", totalNew, { map: mapId });
                    }
                }
            }
            invSnapshot.set(player.id, cur);
        } catch {}
    }
}, 20); // every second

// ─── MOVEMENT TRACKING ────────────────────────────────────────────────────────
const lastPos = new Map();
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const pos = player.location;
            const prev = lastPos.get(player.id);
            if (prev) {
                const dx = pos.x - prev.x;
                const dz = pos.z - prev.z;
                const dist = Math.sqrt(dx*dx + dz*dz); // horizontal only
                if (dist > 0.05 && dist < 15) {
                    const distInt = Math.floor(dist);
                    if (distInt > 0) {
                        const block = player.dimension.getBlock({ x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) });
                        const isSwimming = block && block.typeId === "minecraft:water";
                        if (isSwimming) {
                            progressMission(player, "blocks_swum", distInt);
                        } else {
                            progressMission(player, "blocks_walked", distInt);
                            if (player.hasTag("gm:in_map")) {
                                progressMission(player, "blocks_walked_map", distInt);
                                progressMission(player, "blocks_walked_day", distInt);
                            }
                            if (dist > 0.25) progressMission(player, "blocks_run", distInt);
                        }
                    }
                }
            }
            lastPos.set(player.id, { x: pos.x, y: pos.y, z: pos.z });
        } catch {}
    }
}, 2);

// ─── PLAYTIME ─────────────────────────────────────────────────────────────────
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try { progressMission(player, "playtime", 30); } catch {}
    }
}, 600);

// ─── FALL TRACKING ────────────────────────────────────────────────────────────
// Track Y position to detect big falls
const lastY = new Map();
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const y = player.location.y;
            const prev = lastY.get(player.id);
            if (prev !== undefined) {
                const fall = prev - y;
                if (fall >= 10) progressMission(player, "big_falls", 1);
            }
            lastY.set(player.id, y);
        } catch {}
    }
}, 5);

// ─── ECONOMY TRACKING ─────────────────────────────────────────────────────────
// Solo trackea money_spent — money_earned_npc y money_transferred
// se disparan explícitamente desde los sistemas correspondientes (NPC shops, bank transfer)
const prevMoney = new Map();
system.runInterval(() => {
    try {
        const obj = world.scoreboard.getObjective(SCORE_MONEY);
        if (!obj) return;
        for (const player of world.getAllPlayers()) {
            try {
                const cur = obj.getScore(player) ?? 0;
                const prev = prevMoney.get(player.id);
                if (prev !== undefined && prev !== cur) {
                    const diff = cur - prev;
                    if (diff < 0) {
                        // Solo gastos (compras en NPC shops)
                        progressMission(player, "money_spent", Math.abs(diff));
                        progressMission(player, "npc_transactions", 1);
                    }
                    // NO disparar money_earned_npc ni money_transferred aquí —
                    // se llaman explícitamente desde onNpcSell() y onMoneyTransfer()
                }
                prevMoney.set(player.id, cur);
            } catch {}
        }
    } catch {}
}, 20);

// ─── EXPORT PUBLIC API ────────────────────────────────────────────────────────
// These can be called by other systems (market, bank, etc.)
export function onMarketSell(player) {
    try { progressMission(player, "market_sells", 1); } catch {}
}
export function onMarketBuy(player) {
    try { progressMission(player, "market_buys", 1); } catch {}
}
export function trackMenuOpen(player) {
    try { progressMission(player, "menu_opens", 1); } catch {}
}
export function onNpcSell(player, amount) {
    try { progressMission(player, "money_earned_npc", amount); } catch {}
}
export function onMoneyTransfer(player, amount) {
    try { progressMission(player, "money_transferred", amount); } catch {}
}

export { progressMission, SHOTGUN_IDS, PISTOL_IDS };

console.warn("[DailyMissions] Sistema de misiones inicializado");

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

// All unique tracks across daily + weekly missions (one mission per track for test mode)
const ALL_TRACKS_DAILY = [...new Map(DAILY_MISSIONS.map(m => [
    m.track + (m.extra ? JSON.stringify(m.extra) : ""), m
])).values()];

const ALL_TRACKS_WEEKLY = [...new Map(WEEKLY_MISSIONS.filter(m => m.type !== "progresion").map(m => [
    m.track + (m.extra ? JSON.stringify(m.extra) : ""), m
])).values()];

const ALL_TRACKS_PROG = WEEKLY_MISSIONS.filter(m => m.type === "progresion");

export async function showMissionsAdminPanel(player) {
    const res = await new ActionFormData()
        .title("§c§lAdmin - Misiones")
        .body("§7Gestiona las misiones del jugador seleccionado")
        .button("§e🧪 Test: Dar todas las misiones\n§r§7Una por cada tipo de comprobación")
        .button("§c🗑 Resetear misiones diarias\n§r§7Borra y reasigna misiones de hoy")
        .button("§c🗑 Resetear misiones semanales\n§r§7Borra y reasigna misiones de la semana")
        .button("§a✓ Completar misión diaria\n§r§7Marcar una misión como completada")
        .button("§a✓ Completar misión semanal\n§r§7Marcar una misión como completada")
        .button("§b👁 Ver misiones de jugador\n§r§7Inspeccionar estado de otro jugador")
        .button("§8Cerrar")
        .show(player);

    if (res.canceled || res.selection === 6) return;

    switch (res.selection) {
        case 0: await adminTestMissions(player); break;
        case 1: await adminResetDaily(player); break;
        case 2: await adminResetWeekly(player); break;
        case 3: await adminCompleteDaily(player); break;
        case 4: await adminCompleteWeekly(player); break;
        case 5: await adminViewPlayer(player); break;
    }
}

async function adminTestMissions(player) {
    // Give one mission per unique track (ignoring slot limits)
    const dailySlots  = ALL_TRACKS_DAILY.map(m => ({ id: m.id, progress: 0, done: false }));
    const weeklySlots = ALL_TRACKS_WEEKLY.map(m => ({ id: m.id, progress: 0, done: false }));
    const progSlots   = ALL_TRACKS_PROG.map(m => ({ id: m.id, progress: 0, done: false }));

    const today = getMidnightUTC();
    const week  = getWeekStartUTC();

    player.setDynamicProperty(KEY_DAILY_MISSIONS,  JSON.stringify({ date: today, missions: dailySlots }));
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify({ week, missions: weeklySlots, prog: progSlots }));

    player.sendMessage(
        `§a✓ §lTest activado\n` +
        `§7Diarias: §e${dailySlots.length} misiones §7(una por cada tipo de comprobación)\n` +
        `§7Semanales: §e${weeklySlots.length} misiones\n` +
        `§7Progresión: §e${progSlots.length} misiones`
    );
}

async function adminResetDaily(player) {
    // Force reassign by clearing the date
    player.setDynamicProperty(KEY_DAILY_MISSIONS, undefined);
    const data = assignDailyMissions(player);
    player.sendMessage(`§a✓ Misiones diarias reseteadas. Nuevas misiones asignadas: §e${data.missions.length}`);
}

async function adminResetWeekly(player) {
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, undefined);
    const data = assignWeeklyMissions(player);
    player.sendMessage(`§a✓ Misiones semanales reseteadas. Nuevas misiones asignadas: §e${data.missions.length}`);
}

async function adminCompleteDaily(player) {
    const daily = assignDailyMissions(player);
    const pending = daily.missions.filter(s => !s.done);
    if (!pending.length) { player.sendMessage("§cNo hay misiones diarias pendientes."); return; }

    const names = pending.map(s => {
        const def = DAILY_MISSIONS.find(m => m.id === s.id);
        return getLang(def?.desc ?? { es: s.id, en: s.id }, player);
    });

    const { ModalFormData } = await import("@minecraft/server-ui");
    const res = await new ModalFormData()
        .title("§a§lCompletar Misión Diaria")
        .dropdown("Selecciona la misión:", names, { defaultValueIndex: 0 })
        .show(player);

    if (res.canceled) return;
    const slot = pending[res.formValues[0]];
    const def  = DAILY_MISSIONS.find(m => m.id === slot.id);
    if (!def) return;

    slot.progress = def.goal;
    slot.done = true;
    grantReward(player, def.reward);
    player.setDynamicProperty(KEY_DAILY_MISSIONS, JSON.stringify(daily));
    player.sendMessage(`§a✓ Misión completada: §f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
}

async function adminCompleteWeekly(player) {
    const weekly = assignWeeklyMissions(player);
    const allSlots = [...weekly.missions, ...(weekly.prog ?? [])];
    const pending = allSlots.filter(s => !s.done);
    if (!pending.length) { player.sendMessage("§cNo hay misiones semanales pendientes."); return; }

    const allDefs = [...WEEKLY_MISSIONS];
    const names = pending.map(s => {
        const def = allDefs.find(m => m.id === s.id);
        return getLang(def?.desc ?? { es: s.id, en: s.id }, player);
    });

    const { ModalFormData } = await import("@minecraft/server-ui");
    const res = await new ModalFormData()
        .title("§a§lCompletar Misión Semanal")
        .dropdown("Selecciona la misión:", names, { defaultValueIndex: 0 })
        .show(player);

    if (res.canceled) return;
    const slot = pending[res.formValues[0]];
    const def  = allDefs.find(m => m.id === slot.id);
    if (!def) return;

    slot.progress = def.goal;
    slot.done = true;
    grantReward(player, def.reward);
    player.setDynamicProperty(KEY_WEEKLY_MISSIONS, JSON.stringify(weekly));
    player.sendMessage(`§a✓ Misión completada: §f${getLang(def.desc, player)}\n§e+${rewardText(def.reward)}`);
}

async function adminViewPlayer(player) {
    const allPlayers = world.getAllPlayers().filter(p => p.id !== player.id);
    if (!allPlayers.length) { player.sendMessage("§cNo hay otros jugadores conectados."); return; }

    const { ModalFormData } = await import("@minecraft/server-ui");
    const res = await new ModalFormData()
        .title("§b§lVer Misiones de Jugador")
        .dropdown("Selecciona un jugador:", allPlayers.map(p => p.name), { defaultValueIndex: 0 })
        .show(player);

    if (res.canceled) return;
    const target = allPlayers[res.formValues[0]];
    if (!target) return;

    const daily  = assignDailyMissions(target);
    const weekly = assignWeeklyMissions(target);
    const dDone  = daily.missions.filter(s => s.done).length;
    const wDone  = weekly.missions.filter(s => s.done).length;

    let body = `§l§f${target.name}\n\n§a§lDiarias §7(${dDone}/5):\n`;
    for (const s of daily.missions) {
        const def = DAILY_MISSIONS.find(m => m.id === s.id);
        if (!def) continue;
        body += `${s.done ? "§a✓" : "§7○"} §f${getLang(def.desc, target)} §7(${s.progress}/${def.goal})\n`;
    }
    body += `\n§b§lSemanales §7(${wDone}/7):\n`;
    for (const s of weekly.missions) {
        const def = WEEKLY_MISSIONS.find(m => m.id === s.id);
        if (!def) continue;
        body += `${s.done ? "§a✓" : "§7○"} §f${getLang(def.desc, target)} §7(${s.progress}/${def.goal})\n`;
    }

    await new ActionFormData()
        .title(`§b§l${target.name} - Misiones`)
        .body(body)
        .button("§8Cerrar")
        .show(player);
}
