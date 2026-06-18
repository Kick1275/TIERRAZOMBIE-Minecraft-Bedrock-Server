console.warn("Npc_Food Cargado correctamente")
import { setupNpcShop } from "../Plugs/Log_shop";

// Objeto de idiomas para el NPC Bartender
const npcLanguages = {
    en_US: {
        title: "§6Bartender",
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
        title: "§6Cantinero",
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

// Plantilla de ítems para el NPC (con nombres multilenguaje)
const npcItems = [
    { id: "mcpe:chip_potato",       name: { es_ES: "Papas Fritas",                  en_US: "Potato Chips"          }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/chip_potato.png" },
    { id: "mcpe:chip_tortilla",     name: { es_ES: "Tortilla Chips",                en_US: "Tortilla Chips"        }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/chip_tortilla.png" },
    { id: "mcpe:creeper_crunch",    name: { es_ES: "Creeper Crunch",                en_US: "Creeper Crunch"        }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/creeper_crunch.png" },
    { id: "mcpe:meat_jerky",        name: { es_ES: "Carne Seca",                    en_US: "Meat Jerky"            }, buyPrice: 160,  sellPrice: 64,  icon: "textures/items/food/meat_jerky.png" },
    { id: "mcpe:mre",               name: { es_ES: "MRE",                           en_US: "MRE"                   }, buyPrice: 200,  sellPrice: 80,  icon: "textures/items/food/mre.png" },
    { id: "mcpe:rice",              name: { es_ES: "Arroz",                         en_US: "Rice"                  }, buyPrice: 65,   sellPrice: 26,  icon: "textures/items/food/rice.png" },
    { id: "mcpe:strawberry_jam",    name: { es_ES: "Mermelada de Fresa",            en_US: "Strawberry Jam"        }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/strawberry_jam.png" },
    { id: "mcpe:tactical_sandwich", name: { es_ES: "Sándwich Táctico",              en_US: "Tactical Sandwich"     }, buyPrice: 160,  sellPrice: 64,  icon: "textures/items/food/tactical_sandwich.png" },
    { id: "mcpe:canned_bacon",      name: { es_ES: "Tocino Enlatado",               en_US: "Canned Bacon"          }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_bacon.png" },
    { id: "mcpe:canned_beans",      name: { es_ES: "Frijoles Enlatados",            en_US: "Canned Beans"          }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_beans.png" },
    { id: "mcpe:canned_beef_stew",  name: { es_ES: "Estofado de Res Enlatado",      en_US: "Canned Beef Stew"      }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_beef_stew.png" },
    { id: "mcpe:canned_chicken",    name: { es_ES: "Pollo Enlatado",                en_US: "Canned Chicken"        }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_chicken.png" },
    { id: "mcpe:canned_chili",      name: { es_ES: "Chili Enlatado",                en_US: "Canned Chili"          }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_chili.png" },
    { id: "mcpe:canned_corned",     name: { es_ES: "Corned Beef Enlatado",          en_US: "Canned Corned Beef"    }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_corned.png" },
    { id: "mcpe:canned_fruit",      name: { es_ES: "Fruta Enlatada",                en_US: "Canned Fruit"          }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_fruit.png" },
    { id: "mcpe:canned_ham",        name: { es_ES: "Jamón Enlatado",                en_US: "Canned Ham"            }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_ham.png" },
    { id: "mcpe:canned_peaches",    name: { es_ES: "Duraznos Enlatados",            en_US: "Canned Peaches"        }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_peaches.png" },
    { id: "mcpe:canned_ration",     name: { es_ES: "Ración Enlatada",               en_US: "Canned Ration"         }, buyPrice: 200,  sellPrice: 80,  icon: "textures/items/food/canned_ration.png" },
    { id: "mcpe:canned_sardine",    name: { es_ES: "Sardinas Enlatadas",            en_US: "Canned Sardines"       }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_sardine.png" },
    { id: "mcpe:canned_spaghetti",  name: { es_ES: "Espagueti Enlatado",            en_US: "Canned Spaghetti"      }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_spaghetti.png" },
    { id: "mcpe:canned_tomato",     name: { es_ES: "Tomate Enlatado",               en_US: "Canned Tomato"         }, buyPrice: 100,  sellPrice: 40,  icon: "textures/items/food/canned_tomato.png" },
    { id: "mcpe:canned_tuna",       name: { es_ES: "Atún Enlatado",                 en_US: "Canned Tuna"           }, buyPrice: 130,  sellPrice: 52,  icon: "textures/items/food/canned_tuna.png" },
];

setupNpcShop({
    npcId: "tz:bartender",
    npcLanguages,
    npcItems
});