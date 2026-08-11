console.warn("Npc_Scraper Cargado correctamente")
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
    { id: "mcpe:barbed_wire",        name: { en_US: "Barbed Wire",          es_ES: "Alambre de Púas"         }, sellPrice: 240,  buyPrice: 600,   icon: "textures/items/misc/barbed_wire.png" },
    { id: "mcpe:bear_trap",          name: { en_US: "Bear Trap",            es_ES: "Trampa para Osos"        }, sellPrice: 300,  buyPrice: 750,   icon: "textures/items/misc/bear_trap.png" },
    { id: "mcpe:bleach",             name: { en_US: "Bleach",               es_ES: "Lejía"                   }, sellPrice: 30,   buyPrice: 75,    icon: "textures/items/misc/bleach.png" },
    { id: "mcpe:bottle_water_emp",   name: { en_US: "Empty Water Bottle",   es_ES: "Botella de Agua Vacía"   }, sellPrice: 12,   buyPrice: 30,    icon: "textures/items/misc/.png" },
    { id: "mcpe:can_opener",         name: { en_US: "Can Opener",           es_ES: "Abrelatas"               }, sellPrice: 360,  buyPrice: 900,   icon: "textures/items/misc/can_opener.png" },
    { id: "mcpe:detonator",          name: { en_US: "Detonator",            es_ES: "Detonador"               }, sellPrice: 7800, buyPrice: 14500, icon: "textures/items/grenade/c4_detonator.png" },
    { id: "mcpe:duct_tape",          name: { en_US: "Duct Tape",            es_ES: "Cinta Adhesiva"          }, sellPrice: 7240, buyPrice: 14600, icon: "textures/items/misc/duct_tape.png" },
    { id: "mcpe:electric_scrap",     name: { en_US: "Electric Scrap",       es_ES: "Chatarra Eléctrica"      }, sellPrice: 7400, buyPrice: 16000, icon: "textures/items/misc/electric_scrap.png" },
    { id: "mcpe:flashlight",         name: { en_US: "Flashlight",           es_ES: "Linterna"                }, sellPrice: 72,   buyPrice: 180,   icon: "textures/items/misc/flashlight.png" },
    { id: "mcpe:ham_radios",         name: { en_US: "Ham Radio",            es_ES: "Radio Aficionado"        }, sellPrice: 1440, buyPrice: 3600,  icon: "textures/items/misc/ham_radio.png" },
    { id: "mcpe:landmines",          name: { en_US: "Landmine",             es_ES: "Mina Terrestre"          }, sellPrice: 2800, buyPrice: 7000,  icon: "textures/items/misc/landmine.png" },
    { id: "mcpe:lockpick",           name: { en_US: "Lockpick",             es_ES: "Ganzúa"                  }, sellPrice: 8000, buyPrice: 17500, icon: "textures/items/misc/lockpick.png" },
    { id: "mcpe:plastic_explosive",  name: { en_US: "Plastic Explosive",    es_ES: "Explosivo Plástico"      }, sellPrice: 2380, buyPrice: 13400, icon: "textures/items/misc/plastic_explosive.png" },
    { id: "mcpe:cooking_pot",        name: { en_US: "Cooking Pot",          es_ES: "Olla de Cocina"          }, sellPrice: 160,  buyPrice: 400,   icon: "textures/items/misc/cooking_pot.png" },
    { id: "mcpe:radios",             name: { en_US: "Radio",                es_ES: "Radio"                   }, sellPrice: 1440, buyPrice: 3600,  icon: "textures/items/misc/radio.png" },
    { id: "mcpe:random_paper",       name: { en_US: "Random Paper",         es_ES: "Papel Aleatorio"         }, sellPrice: 6,    buyPrice: 15,    icon: "textures/items/misc/random_paper.png" },
    { id: "mcpe:sawoff_pipe",        name: { en_US: "Sawed-off Pipe",       es_ES: "Tubo Recortado"          }, sellPrice: 3600, buyPrice: 6000,  icon: "textures/items/misc/sawoff_pipe.png" },
    { id: "mcpe:spray_can",          name: { en_US: "Spray Can",            es_ES: "Lata de Spray"           }, sellPrice: 240,  buyPrice: 600,   icon: "textures/items/misc/spray_can.png" },
    { id: "mcpe:vending_popsi_icon", name: { en_US: "Vending Popsi Icon",   es_ES: "Ícono de Máquina Popsi"  }, sellPrice: 1280, buyPrice: 3200,  icon: "textures/items/misc/vending_popsi_icon.png" },
    { id: "mcpe:wooden_barricade",   name: { en_US: "Wooden Barricade",     es_ES: "Barricada de Madera"     }, sellPrice: 72,   buyPrice: 180,   icon: "textures/items/misc/wooden_barricade.png" },
    { id: "mcpe:wire_cutter",        name: { en_US: "Wire Cutter",          es_ES: "Cortador de Alambre"     }, sellPrice: 240,  buyPrice: 600,   icon: "textures/items/misc/wire_cutter.png" },
    {id: "mcpe:nail_box",            name: { en_US: "Nail Box",             es_ES: "Caja de Clavos"          }, sellPrice: 3120, buyPrice: 5000,  icon: "textures/items/misc/zip_ties.png" },
];

setupNpcShop({
    npcId: "tz:npc_scraper", // El id de entidad de tu NPC Ingeniero
    npcLanguages,
    npcItems
});