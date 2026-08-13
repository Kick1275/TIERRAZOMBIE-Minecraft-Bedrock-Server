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
    // ── Pistola — T1 (equiv Glock 17 = buy 7000)
    { id: "krep:qsz92",   name: { en_US: "QSZ-92",     es_ES: "QSZ-92" },     sellPrice: 2800,  buyPrice: 7000,   icon: "textures/items/qsz92" },

    // ── SMG — T2 (equiv MP5 = buy 28000)
    { id: "krep:qcq171",  name: { en_US: "QCQ-171",    es_ES: "QCQ-171" },    sellPrice: 11200, buyPrice: 28000,  icon: "textures/items/qcq171" },

    // ── ARs T2 — ligeros (equiv M16A1=35000, M16=38000)
    { id: "krep:t112",    name: { en_US: "T-112",       es_ES: "T-112" },      sellPrice: 14000, buyPrice: 35000,  icon: "textures/items/t112" },
    { id: "krep:m16a4",   name: { en_US: "M16A4",       es_ES: "M16A4" },      sellPrice: 15200, buyPrice: 38000,  icon: "textures/items/m16a4" },

    // ── ARs T3 — estándar (equiv G36=50000, QBZ95=52000, QBZ191=60000, HK416=65000)
    { id: "krep:type88",  name: { en_US: "Type 88",     es_ES: "Type 88" },    sellPrice: 18000, buyPrice: 45000,  icon: "textures/items/type88" },
    { id: "krep:type89",  name: { en_US: "Type 89",     es_ES: "Type 89" },    sellPrice: 20000, buyPrice: 50000,  icon: "textures/items/type89" },
    { id: "krep:qjb95",   name: { en_US: "QJB-95",      es_ES: "QJB-95" },     sellPrice: 20800, buyPrice: 52000,  icon: "textures/items/qjb95" },
    { id: "krep:hk416",   name: { en_US: "HK416",       es_ES: "HK416" },      sellPrice: 22000, buyPrice: 55000,  icon: "textures/items/hk416" },
    { id: "krep:qbz191",  name: { en_US: "QBZ-191",     es_ES: "QBZ-191" },    sellPrice: 24000, buyPrice: 60000,  icon: "textures/items/qbz191" },
    { id: "krep:k2",      name: { en_US: "K2",          es_ES: "K2" },         sellPrice: 25200, buyPrice: 63000,  icon: "textures/items/k2" },
    { id: "krep:type95",  name: { en_US: "Type 95",     es_ES: "Type 95" },    sellPrice: 26000, buyPrice: 65000,  icon: "textures/items/type95" },

    // ── ARs T4 — potentes (equiv AKM=45000, Type81=47000, SCAR-L=75000)
    { id: "krep:ak12",    name: { en_US: "AK-12",       es_ES: "AK-12" },      sellPrice: 18000, buyPrice: 45000,  icon: "textures/items/ak12" },
    { id: "krep:arka",    name: { en_US: "ARKA",         es_ES: "ARKA" },       sellPrice: 18800, buyPrice: 47000,  icon: "textures/items/arka" },

    // ── LMGs (equiv M249=150000, Evolys=170000)
    { id: "krep:type882", name: { en_US: "Type 88-2",   es_ES: "Type 88-2" },  sellPrice: 52000, buyPrice: 130000, icon: "textures/items/type882" },
    { id: "krep:qjb201",  name: { en_US: "QJB-201",     es_ES: "QJB-201" },    sellPrice: 68000, buyPrice: 170000, icon: "textures/items/qjb201" },

    // ── Battle Rifles / DMR T5 (equiv SCAR-H=85000, FAL=78000, MK14=95000)
    { id: "krep:m8",      name: { en_US: "M8",          es_ES: "M8" },         sellPrice: 31200, buyPrice: 78000,  icon: "textures/items/m8" },
    { id: "krep:m7",      name: { en_US: "M7",          es_ES: "M7" },         sellPrice: 34000, buyPrice: 85000,  icon: "textures/items/m7" },
    { id: "krep:qbu191",  name: { en_US: "QBU-191",     es_ES: "QBU-191" },    sellPrice: 38000, buyPrice: 95000,  icon: "textures/items/qbz191" },

    // ── EXCEPCIONES (equiv AWP=180000, Minigun=350000, RPG=500000)
    { id: "krep:awp",     name: { en_US: "AWP",         es_ES: "AWP" },        sellPrice: 72000,  buyPrice: 180000, icon: "textures/items/awp" },
    { id: "krep:minigun", name: { en_US: "Minigun",     es_ES: "Minigun" },    sellPrice: 140000, buyPrice: 350000, icon: "textures/items/minigun" },
    { id: "krep:rpg",     name: { en_US: "RPG",         es_ES: "RPG" },        sellPrice: 200000, buyPrice: 500000, icon: "textures/items/rpg" },
    { id: "krep:rpgrocket",name: { en_US: "RPG Rocket", es_ES: "Cohete RPG" }, sellPrice: 10000,  buyPrice: 25000,  icon: "textures/items/rpgrocket" },

    // ── Municion (precio por unidad, escala del sistema)
    { id: "krep:mm5821",  name: { en_US: "5.8x21mm (QSZ-92)",    es_ES: "5.8x21mm (QSZ-92)" },    sellPrice: 8,   buyPrice: 20,   icon: "textures/items/ammo/mm5821" },
    { id: "krep:mm9",     name: { en_US: "9mm (QCQ-171)",        es_ES: "9mm (QCQ-171)" },        sellPrice: 6,   buyPrice: 15,   icon: "textures/items/ammo/mm9" },
    { id: "krep:mm556",   name: { en_US: "5.56x45mm",            es_ES: "5.56x45mm" },            sellPrice: 8,   buyPrice: 20,   icon: "textures/items/ammo/mm556" },
    { id: "krep:mm545",   name: { en_US: "5.45x39mm",            es_ES: "5.45x39mm" },            sellPrice: 8,   buyPrice: 20,   icon: "textures/items/ammo/mm545" },
    { id: "krep:mm5842",  name: { en_US: "5.8x42mm",             es_ES: "5.8x42mm" },             sellPrice: 10,  buyPrice: 25,   icon: "textures/items/ammo/mm5842" },
    { id: "krep:fury277", name: { en_US: ".277 Fury (M7/M8)",    es_ES: ".277 Fury (M7/M8)" },    sellPrice: 16,  buyPrice: 40,   icon: "textures/items/ammo/fury277" },
    { id: "krep:lapua338",name: { en_US: ".338 Lapua (AWP)",     es_ES: ".338 Lapua (AWP)" },     sellPrice: 40,  buyPrice: 100,  icon: "textures/items/lapua308" },
];

 setupNpcShop({
    npcId: "tz:waponshop", // El id de entidad de tu NPC Ingeniero
    npcLanguages,
    npcItems
});