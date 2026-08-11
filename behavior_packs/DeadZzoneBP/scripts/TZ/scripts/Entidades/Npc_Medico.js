console.warn("Npc_Medico Cargado correctamente")
import { setupNpcShop } from "../Plugs/Log_shop";

// Objeto de idiomas para el NPC Médico
const npcLanguages = {
    en_US: {
        title: "§6Medic",
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
        title: "§6Médico",
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

// Plantilla de ítems para el Médico
const npcItems = [
    { id: "mcpe:adrenaline",          name: { en_US: "Adrenaline",               es_ES: "Adrenalina"                    }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/medic/adrenaline.png" },
    { id: "mcpe:alcoholic_tinture",   name: { en_US: "Alcoholic Tincture",       es_ES: "Tintura Alcohólica"            }, sellPrice: 140,  buyPrice: 350,   icon: "textures/items/medic/alcoholic_tinture.png" },
    { id: "mcpe:antidote",            name: { en_US: "Self-Revive Syringe",                 es_ES: "Auto-Reanimador (Jeringa)"                      }, sellPrice: 7400, buyPrice: 10500,  icon: "textures/items/medic/antidote.png" },
    { id: "mcpe:bandage_sterilized",  name: { en_US: "Sterilized Bandage",       es_ES: "Vendaje Esterilizado"          }, sellPrice: 200,  buyPrice: 500,   icon: "textures/items/medic/bandage_sterilized.png" },
    { id: "mcpe:bandage",             name: { en_US: "Bandage",                  es_ES: "Vendaje"                       }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/medic/bandage.png" },
    { id: "mcpe:blood_bag_type_a",    name: { en_US: "Blood Bag (Type A)",       es_ES: "Bolsa de Sangre (Tipo A)"      }, sellPrice: 300,  buyPrice: 750,   icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_type_ab",   name: { en_US: "Blood Bag (Type AB)",      es_ES: "Bolsa de Sangre (Tipo AB)"     }, sellPrice: 300,  buyPrice: 750,   icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_type_b",    name: { en_US: "Blood Bag (Type B)",       es_ES: "Bolsa de Sangre (Tipo B)"      }, sellPrice: 300,  buyPrice: 750,   icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_emp",       name: { en_US: "Empty Blood Bag",          es_ES: "Bolsa de Sangre Vacía"         }, sellPrice: 48,   buyPrice: 120,   icon: "textures/items/medic/blood_bag_emp.png" },
    { id: "mcpe:blood_bag_type_o",    name: { en_US: "Blood Bag (Type O)",       es_ES: "Bolsa de Sangre (Tipo O)"      }, sellPrice: 300,  buyPrice: 750,   icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_unknown",   name: { en_US: "Blood Bag (Unknown)",      es_ES: "Bolsa de Sangre (Desconocida)" }, sellPrice: 180,  buyPrice: 450,   icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_test_kit",      name: { en_US: "Blood Test Kit",           es_ES: "Kit de Prueba de Sangre"       }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/medic/blood_test.png" },
    { id: "mcpe:first_aid",           name: { en_US: "First Aid Kit",            es_ES: "Botiquín de Primeros Auxilios" }, sellPrice: 1080, buyPrice: 2700,  icon: "textures/items/medic/first_aid.png" },
    { id: "mcpe:morphine",            name: { en_US: "Morphine",                 es_ES: "Morfina"                       }, sellPrice: 600,  buyPrice: 1500,  icon: "textures/items/medic/morphine.png" },
    { id: "mcpe:painkiller",          name: { en_US: "Painkiller",               es_ES: "Analgésico"                    }, sellPrice: 480,  buyPrice: 1200,  icon: "textures/items/medic/painkiller.png" },
    { id: "mcpe:rags_dirty",          name: { en_US: "Dirty Rags",               es_ES: "Trapos Sucios"                 }, sellPrice: 60,   buyPrice: 150,   icon: "textures/items/medic/rags_dirty.png" },
    { id: "mcpe:rags_sterilized",     name: { en_US: "Sterilized Rags",          es_ES: "Trapos Esterilizados"          }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/medic/rags_sterilized.png" },
    { id: "mcpe:rags",                name: { en_US: "Rags",                     es_ES: "Trapos"                        }, sellPrice: 60,   buyPrice: 150,   icon: "textures/items/medic/rags.png" },
    { id: "mcpe:splint",              name: { en_US: "Splint",                   es_ES: "Férula"                        }, sellPrice: 160,  buyPrice: 400,   icon: "textures/items/medic/splint.png" },
    { id: "mcpe:water_purification",  name: { en_US: "Water Purification Tablet",es_ES: "Tableta de Purificación"       }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/medic/water_purification.png" },
];

setupNpcShop({
    npcId: "tz:npc_doctor",
    npcLanguages,
    npcItems,
})