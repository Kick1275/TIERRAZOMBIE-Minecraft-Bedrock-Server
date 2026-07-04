console.warn("Npc_Ingeniero correctamente")
import { setupNpcShop } from "../Plugs/Log_shop.js";


// Objeto de idiomas para el NPC Ingeniero
const npcLanguages = {
    en_US: {
        title: "§6Engineer",
        body: "§7What would you like to do?",
        buy: "§aBuy",
        sell: "§bSell",
        exit: "§cExit",
        sell_title: "§bSell",
        sell_body: "§7Enter the quantity you want to sell:",
        buy_title: "§aBuy",
        buy_body: "§7Enter the quantity you want to buy:",
        not_enough_items: "§cYou don't have enough items to sell.",
        not_enough_money: "§cYou don't have enough money to buy this.",
        transaction_success: "§aTransaction successful!",
        canceled: "§cYou canceled the operation.",
    },
    es_ES: {
        title: "§6Ingeniero",
        body: "§7¿Qué deseas hacer?",
        buy: "§aComprar",
        sell: "§bVender",
        exit: "§cSalir",
        sell_title: "§bVender",
        sell_body: "§7Ingresa la cantidad que deseas vender:",
        buy_title: "§aComprar",
        buy_body: "§7Ingresa la cantidad que deseas comprar:",
        not_enough_items: "§cNo tienes suficientes ítems para vender.",
        not_enough_money: "§cNo tienes suficiente dinero para comprar esto.",
        transaction_success: "§a¡Transacción exitosa!",
        canceled: "§cHas cancelado la operación.",
    },
};

// Plantilla de ítems para el Ingeniero
const npcItems = [
    // ── Rifles de Asalto ──────────────────────────────────────────────────────
    { id: "krep:m4a1",    name: { en_US: "M4A1",          es_ES: "M4A1" },          sellPrice: 22000, buyPrice: 55000,  icon: "textures/items/m4a1.png" },
    { id: "krep:akm",     name: { en_US: "AKM",           es_ES: "AKM" },           sellPrice: 18000, buyPrice: 45000,  icon: "textures/items/akm.png" },
    { id: "krep:hk416",   name: { en_US: "HK416",         es_ES: "HK416" },         sellPrice: 26000, buyPrice: 65000,  icon: "textures/items/hk416.png" },
    { id: "krep:scarl",   name: { en_US: "SCAR-L",        es_ES: "SCAR-L" },        sellPrice: 30000, buyPrice: 75000,  icon: "textures/items/scarl.png" },
    { id: "krep:m16",     name: { en_US: "M16",           es_ES: "M16" },           sellPrice: 15200, buyPrice: 38000,  icon: "textures/items/m16.png" },
    { id: "krep:m16a1",   name: { en_US: "M16A1",         es_ES: "M16A1" },         sellPrice: 14000, buyPrice: 35000,  icon: "textures/items/m16a1.png" },
    { id: "krep:g36",     name: { en_US: "G36",           es_ES: "G36" },           sellPrice: 20000, buyPrice: 50000,  icon: "textures/items/g36.png" },
    { id: "krep:qbz95",   name: { en_US: "QBZ-95",        es_ES: "QBZ-95" },        sellPrice: 20800, buyPrice: 52000,  icon: "textures/items/qbz95.png" },
    { id: "krep:qbz191",  name: { en_US: "QBZ-191",       es_ES: "QBZ-191" },       sellPrice: 24000, buyPrice: 60000,  icon: "textures/items/qbz191.png" },
    { id: "krep:type81",  name: { en_US: "Type 81",       es_ES: "Type 81" },       sellPrice: 18800, buyPrice: 47000,  icon: "textures/items/type81.png" },
    // ── Battle Rifles ─────────────────────────────────────────────────────────
    { id: "krep:scarh",   name: { en_US: "SCAR-H",        es_ES: "SCAR-H" },        sellPrice: 34000, buyPrice: 85000,  icon: "textures/items/scarh.png" },
    { id: "krep:fal",     name: { en_US: "FAL",           es_ES: "FAL" },           sellPrice: 31200, buyPrice: 78000,  icon: "textures/items/fal.png" },
    { id: "krep:g3",      name: { en_US: "G3",            es_ES: "G3" },            sellPrice: 27200, buyPrice: 68000,  icon: "textures/items/g3.png" },
    { id: "krep:mk14",    name: { en_US: "MK14",          es_ES: "MK14" },          sellPrice: 38000, buyPrice: 95000,  icon: "textures/items/mk14.png" },
    { id: "krep:sks",     name: { en_US: "SKS",           es_ES: "SKS" },           sellPrice: 23200, buyPrice: 58000,  icon: "textures/items/sks.png" },
    // ── SMGs ──────────────────────────────────────────────────────────────────
    { id: "krep:mp5",     name: { en_US: "MP5",           es_ES: "MP5" },           sellPrice: 11200, buyPrice: 28000,  icon: "textures/items/mp5.png" },
    { id: "krep:uzi",     name: { en_US: "UZI",           es_ES: "UZI" },           sellPrice: 7200,  buyPrice: 18000,  icon: "textures/items/uzi.png" },
    { id: "krep:vector",  name: { en_US: "Vector",        es_ES: "Vector" },        sellPrice: 16800, buyPrice: 42000,  icon: "textures/items/vector.png" },
    { id: "krep:ump",     name: { en_US: "UMP-45",        es_ES: "UMP-45" },        sellPrice: 10000, buyPrice: 25000,  icon: "textures/items/ump45.png" },
    { id: "krep:mp7",     name: { en_US: "MP7",           es_ES: "MP7" },           sellPrice: 14000, buyPrice: 35000,  icon: "textures/items/mp7.png" },
    { id: "krep:p90",     name: { en_US: "P90",           es_ES: "P90" },           sellPrice: 15200, buyPrice: 38000,  icon: "textures/items/p90.png" },
    // ── Pistolas ──────────────────────────────────────────────────────────────
    { id: "krep:g17",     name: { en_US: "Glock 17",      es_ES: "Glock 17" },      sellPrice: 2800,  buyPrice: 7000,   icon: "textures/items/g17.png" },
    { id: "krep:g18",     name: { en_US: "Glock 18",      es_ES: "Glock 18" },      sellPrice: 1600,  buyPrice: 4000,   icon: "textures/items/g18.png" },
    { id: "krep:m1911",   name: { en_US: "M1911",         es_ES: "M1911" },         sellPrice: 3600,  buyPrice: 9000,   icon: "textures/items/m1911.png" },
    { id: "krep:p320",    name: { en_US: "P320",          es_ES: "P320" },          sellPrice: 3600,  buyPrice: 9000,   icon: "textures/items/p320.png" },
    { id: "krep:deagle",  name: { en_US: "Desert Eagle",  es_ES: "Desert Eagle" },  sellPrice: 11200, buyPrice: 28000,  icon: "textures/items/deagle.png" },
    { id: "krep:b93",     name: { en_US: "B93R",          es_ES: "B93R" },          sellPrice: 4800,  buyPrice: 12000,  icon: "textures/items/b93.png" },
    { id: "krep:cp",      name: { en_US: "CP",            es_ES: "CP" },            sellPrice: 8800,  buyPrice: 22000,  icon: "textures/items/cp.png" },
    { id: "krep:t50",     name: { en_US: "T50",           es_ES: "T50" },           sellPrice: 10000, buyPrice: 25000,  icon: "textures/items/t50.png" },
    // ── Escopetas ─────────────────────────────────────────────────────────────
    { id: "krep:m870",    name: { en_US: "M870",          es_ES: "M870" },          sellPrice: 14000, buyPrice: 35000,  icon: "textures/items/m870.png" },
    { id: "krep:aa12",    name: { en_US: "AA-12",         es_ES: "AA-12" },         sellPrice: 23200, buyPrice: 58000,  icon: "textures/items/aa12.png" },
    { id: "krep:saiga12", name: { en_US: "Saiga-12",      es_ES: "Saiga-12" },      sellPrice: 20000, buyPrice: 50000,  icon: "textures/items/saiga12.png" },
    { id: "krep:m1014",   name: { en_US: "M1014",         es_ES: "M1014" },         sellPrice: 18000, buyPrice: 45000,  icon: "textures/items/m1014.png" },
    { id: "krep:db",      name: { en_US: "Double Barrel", es_ES: "Double Barrel" }, sellPrice: 6000,  buyPrice: 15000,  icon: "textures/items/db.png" },
    // ── Francotiradores ───────────────────────────────────────────────────────
    { id: "krep:awp",     name: { en_US: "AWP",           es_ES: "AWP" },           sellPrice: 72000,  buyPrice: 180000, icon: "textures/items/awp.png" },
    { id: "krep:m885",    name: { en_US: "M88.5",         es_ES: "M88.5" },         sellPrice: 80000,  buyPrice: 200000, icon: "textures/items/m885.png" },
    { id: "krep:win308",  name: { en_US: "Win 308",       es_ES: "Win 308" },       sellPrice: 44000,  buyPrice: 110000, icon: "textures/items/308win.png" },
    { id: "krep:m107",    name: { en_US: "M107 (.50 BMG)", es_ES: "M107 (.50 BMG)" }, sellPrice: 112000, buyPrice: 280000, icon: "textures/items/m107.png" },
    { id: "krep:m95",     name: { en_US: "M95 (.50 BMG)", es_ES: "M95 (.50 BMG)" },  sellPrice: 104000, buyPrice: 260000, icon: "textures/items/m95.png" },
    // ── Ametralladoras ────────────────────────────────────────────────────────
    { id: "krep:rpk",     name: { en_US: "RPK",           es_ES: "RPK" },           sellPrice: 36000,  buyPrice: 90000,  icon: "textures/items/rpk.png" },
    { id: "krep:m249",    name: { en_US: "M249",          es_ES: "M249" },          sellPrice: 60000,  buyPrice: 150000, icon: "textures/items/m249.png" },
    { id: "krep:evolys",  name: { en_US: "Evolys",        es_ES: "Evolys" },        sellPrice: 68000,  buyPrice: 170000, icon: "textures/items/evolys.png" },
    { id: "krep:minigun", name: { en_US: "Minigun",       es_ES: "Minigun" },       sellPrice: 140000, buyPrice: 350000, icon: "textures/items/minigun.png" },
    // ── Lanzacohetes ──────────────────────────────────────────────────────────
    { id: "krep:rpg",        name: { en_US: "RPG",           es_ES: "RPG" },        sellPrice: 200000, buyPrice: 500000, icon: "textures/items/rpg.png" },
    { id: "krep:rpgrocket",  name: { en_US: "RPG Rocket",    es_ES: "Cohete RPG" }, sellPrice: 10000,  buyPrice: 25000,  icon: "textures/items/rpgrocket.png" },
    // ── Munición (precio por bala individual) ─────────────────────────────────
    { id: "krep:m43",      name: { en_US: "7.62x39mm",    es_ES: "7.62x39mm" },    sellPrice: 10,  buyPrice: 25,   icon: "textures/items/m43.png" },
    { id: "krep:mm9",      name: { en_US: "9mm",          es_ES: "9mm" },          sellPrice: 6,   buyPrice: 15,   icon: "textures/items/9mm.png" },
    { id: "krep:acp45",    name: { en_US: ".45 ACP",      es_ES: ".45 ACP" },      sellPrice: 8,   buyPrice: 20,   icon: "textures/items/45acp.png" },
    { id: "krep:mm4630",   name: { en_US: "4.6x30mm",     es_ES: "4.6x30mm" },     sellPrice: 8,   buyPrice: 20,   icon: "textures/items/4630mm.png" },
    { id: "krep:mm5728",   name: { en_US: "5.7x28mm",     es_ES: "5.7x28mm" },     sellPrice: 8,   buyPrice: 20,   icon: "textures/items/5728mm.png" },
    { id: "krep:ae50",     name: { en_US: ".50 AE",       es_ES: ".50 AE" },       sellPrice: 20,  buyPrice: 50,   icon: "textures/items/50ae.png" },
    { id: "krep:gauge12",  name: { en_US: "12 Gauge",     es_ES: "12 Gauge" },     sellPrice: 8,   buyPrice: 20,   icon: "textures/items/12gauge.png" },
    { id: "krep:lapua338", name: { en_US: ".338 Lapua",   es_ES: ".338 Lapua" },   sellPrice: 40,  buyPrice: 100,  icon: "textures/items/338lapua.png" },
    { id: "krep:bmg50",    name: { en_US: ".50 BMG",      es_ES: ".50 BMG" },      sellPrice: 72,  buyPrice: 180,  icon: "textures/items/50bmg.png" },
];

 setupNpcShop({
    npcId: "tz:waponshop", // El id de entidad de tu NPC Ingeniero
    npcLanguages,
    npcItems
});