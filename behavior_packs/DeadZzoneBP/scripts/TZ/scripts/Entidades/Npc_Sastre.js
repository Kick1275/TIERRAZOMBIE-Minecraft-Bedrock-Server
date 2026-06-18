console.warn("Npc_Sastre Cargado correctamente")
import { setupNpcShop } from "../Plugs/Log_shop.js";

const npcLanguages = {
    en_US: {
        title: "§6Tailor", body: "§7What would you like to do?",
        buy: "§aBuy", sell: "§bSell", exit: "§cExit",
        sell_title: "§bSell", sell_body: "§7Enter the quantity you want to sell:",
        buy_title: "§aBuy", buy_body: "§7Enter the quantity you want to buy:",
        not_enough_items: "§cYou don't have enough items to sell.",
        not_enough_money: "§cYou don't have enough money to buy this.",
        transaction_success: "§aTransaction successful!", canceled: "§cYou canceled the operation.",
    },
    es_ES: {
        title: "§6Sastre", body: "§7¿Qué deseas hacer?",
        buy: "§aComprar", sell: "§bVender", exit: "§cSalir",
        sell_title: "§bVender", sell_body: "§7Ingresa la cantidad que deseas vender:",
        buy_title: "§aComprar", buy_body: "§7Ingresa la cantidad que deseas comprar:",
        not_enough_items: "§cNo tienes suficientes ítems para vender.",
        not_enough_money: "§cNo tienes suficiente dinero para comprar esto.",
        transaction_success: "§a¡Transacción exitosa!", canceled: "§cHas cancelado la operación.",
    },
};

// Precios basados en % de protección real (armorDetection.js)
// Referencia: pistola básica ~7000, rifle asalto ~38000-75000, francotirador ~110000-280000
// Cascos/chalecos: accesibles pero que requieran misiones y farmeo
const npcItems = [
    // ── CASCOS ────────────────────────────────────────────────────────────────
    // 2% — gorras, police hat, flat, durag, bandanas
    { id: "mcpe:cap_black",            name: { en_US: "Black Cap",              es_ES: "Gorra Negra"                  }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/cap_black.png" },
    { id: "mcpe:cap_blue",             name: { en_US: "Blue Cap",               es_ES: "Gorra Azul"                   }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/cap_blue.png" },
    { id: "mcpe:cap_green",            name: { en_US: "Green Cap",              es_ES: "Gorra Verde"                  }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/cap_green.png" },
    { id: "mcpe:cap_red",              name: { en_US: "Red Cap",                es_ES: "Gorra Roja"                   }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/cap_red.png" },
    { id: "mcpe:police_hat",           name: { en_US: "Police Hat",             es_ES: "Sombrero de Policía"          }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/police_hat.png" },
    { id: "mcpe:flat_black",           name: { en_US: "Black Flat Cap",         es_ES: "Boina Negra"                  }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/flat_black.png" },
    { id: "mcpe:flat_brown",           name: { en_US: "Brown Flat Cap",         es_ES: "Boina Marrón"                 }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/flat_brown.png" },
    { id: "mcpe:durag_black",          name: { en_US: "Black Durag",            es_ES: "Durag Negro"                  }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/durag_black.png" },
    { id: "mcpe:durag_brown",          name: { en_US: "Brown Durag",            es_ES: "Durag Marrón"                 }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/durag_brown.png" },
    { id: "mcpe:bandana_blue",         name: { en_US: "Blue Bandana",           es_ES: "Bandana Azul"                 }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/bandana_blue.png" },
    { id: "mcpe:bandana_green",        name: { en_US: "Green Bandana",          es_ES: "Bandana Verde"                }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/bandana_green.png" },
    { id: "mcpe:bandana_red",          name: { en_US: "Red Bandana",            es_ES: "Bandana Roja"                 }, sellPrice: 80,   buyPrice: 200,   icon: "textures/items/armor/bandana_red.png" },
    // 3% — beanies, berets, boonies, cowboy
    { id: "mcpe:beanie_black",         name: { en_US: "Black Beanie",           es_ES: "Gorro Negro"                  }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beanie_black.png" },
    { id: "mcpe:beanie_brown",         name: { en_US: "Brown Beanie",           es_ES: "Gorro Marrón"                 }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beanie_brown.png" },
    { id: "mcpe:beanie_olive",         name: { en_US: "Olive Beanie",           es_ES: "Gorro Oliva"                  }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beanie_olive.png" },
    { id: "mcpe:beanie_white",         name: { en_US: "White Beanie",           es_ES: "Gorro Blanco"                 }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beanie_white.png" },
    { id: "mcpe:beret_blue",           name: { en_US: "Blue Beret",             es_ES: "Boina Azul"                   }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beret_blue.png" },
    { id: "mcpe:beret_green",          name: { en_US: "Green Beret",            es_ES: "Boina Verde"                  }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beret_green.png" },
    { id: "mcpe:beret_red",            name: { en_US: "Red Beret",              es_ES: "Boina Roja"                   }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/beret_red.png" },
    { id: "mcpe:boonie_artic",         name: { en_US: "Arctic Boonie Hat",      es_ES: "Sombrero Boonie Ártico"       }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_artic.png" },
    { id: "mcpe:boonie_black",         name: { en_US: "Black Boonie Hat",       es_ES: "Sombrero Boonie Negro"        }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_black.png" },
    { id: "mcpe:boonie_desert",        name: { en_US: "Desert Boonie Hat",      es_ES: "Sombrero Boonie Desértico"    }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_desert.png" },
    { id: "mcpe:boonie_green",         name: { en_US: "Green Boonie Hat",       es_ES: "Sombrero Boonie Verde"        }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_green.png" },
    { id: "mcpe:boonie_tan",           name: { en_US: "Tan Boonie Hat",         es_ES: "Sombrero Boonie Arena"        }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_tan.png" },
    { id: "mcpe:boonie_woodland",      name: { en_US: "Woodland Boonie Hat",    es_ES: "Sombrero Boonie Boscoso"      }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/boonie_woodland.png" },
    { id: "mcpe:cowboy_black",         name: { en_US: "Black Cowboy Hat",       es_ES: "Sombrero Vaquero Negro"       }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/cowboy_black.png" },
    { id: "mcpe:cowboy_brown",         name: { en_US: "Brown Cowboy Hat",       es_ES: "Sombrero Vaquero Marrón"      }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/cowboy_brown.png" },
    { id: "mcpe:cowboy_white",         name: { en_US: "White Cowboy Hat",       es_ES: "Sombrero Vaquero Blanco"      }, sellPrice: 120,  buyPrice: 300,   icon: "textures/items/armor/cowboy_white.png" },
    // 5% — shemaghs, balaclava, night goggles, clown wig
    { id: "mcpe:shemagh_blue",         name: { en_US: "Blue Shemagh",           es_ES: "Shemagh Azul"                 }, sellPrice: 200,  buyPrice: 500,   icon: "textures/items/armor/shemagh_blue.png" },
    { id: "mcpe:balaclava_black",      name: { en_US: "Black Balaclava",        es_ES: "Pasamontañas Negro"           }, sellPrice: 200,  buyPrice: 500,   icon: "textures/items/armor/balaclava_black.png" },
    { id: "mcpe:night_goggles",        name: { en_US: "Night Vision Goggles",   es_ES: "Gafas de Visión Nocturna"     }, sellPrice: 200,  buyPrice: 500,   icon: "textures/items/armor/night_goggles.png" },
    { id: "mcpe:clown_wig",            name: { en_US: "Clown Wig",              es_ES: "Peluca de Payaso"             }, sellPrice: 200,  buyPrice: 500,   icon: "textures/items/armor/clown_wig.png" },
    // 7% — respirator, plague hat
    { id: "mcpe:respirator_mask",      name: { en_US: "Respirator Mask",        es_ES: "Máscara Respiratoria"         }, sellPrice: 280,  buyPrice: 10000,   icon: "textures/items/armor/respirator_mask.png" },
    { id: "mcpe:plague_hat",           name: { en_US: "Plague Doctor Hat",      es_ES: "Sombrero Doctor de la Peste"  }, sellPrice: 280,  buyPrice: 10000,   icon: "textures/items/armor/plague_hat.png" },
    // 10% — gasmasks
    { id: "mcpe:gasmask_black",        name: { en_US: "Black Gas Mask",         es_ES: "Máscara de Gas Negra"         }, sellPrice: 400,  buyPrice: 10000,  icon: "textures/items/armor/gasmask_black.png" },
    { id: "mcpe:gasmask_tactical",     name: { en_US: "Tactical Gas Mask",      es_ES: "Máscara de Gas Táctica"       }, sellPrice: 400,  buyPrice: 10000,  icon: "textures/items/armor/gasmask_tactical.png" },
    { id: "mcpe:gasmask_white",        name: { en_US: "White Gas Mask",         es_ES: "Máscara de Gas Blanca"        }, sellPrice: 400,  buyPrice: 10000,  icon: "textures/items/armor/gasmask_white.png" },
    // 18% — biker helmets, firefighter
    { id: "mcpe:biker_black",          name: { en_US: "Black Biker Helmet",     es_ES: "Casco Motociclista Negro"     }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/biker_black.png" },
    { id: "mcpe:biker_blue",           name: { en_US: "Blue Biker Helmet",      es_ES: "Casco Motociclista Azul"      }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/biker_blue.png" },
    { id: "mcpe:biker_red",            name: { en_US: "Red Biker Helmet",       es_ES: "Casco Motociclista Rojo"      }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/biker_red.png" },
    { id: "mcpe:biker_white",          name: { en_US: "White Biker Helmet",     es_ES: "Casco Motociclista Blanco"    }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/biker_white.png" },
    { id: "mcpe:biker_yellow",         name: { en_US: "Yellow Biker Helmet",    es_ES: "Casco Motociclista Amarillo"  }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/biker_yellow.png" },
    { id: "mcpe:firefighter_hat",      name: { en_US: "Firefighter Hat",        es_ES: "Casco de Bombero"             }, sellPrice: 2720,  buyPrice: 4800,  icon: "textures/items/armor/firefighter_hat.png" },
    // 22% — great helmet
    { id: "mcpe:great_helmet",         name: { en_US: "Great Helmet",           es_ES: "Gran Casco"                   }, sellPrice: 2980,  buyPrice: 5200,  icon: "textures/items/armor/great_helmet.png" },
    // 26-28% — army helmets
    { id: "mcpe:army_artic",           name: { en_US: "Arctic Army Helmet",     es_ES: "Casco Ejército Ártico"        }, sellPrice: 6040, buyPrice: 12600,  icon: "textures/items/armor/army_artic.png" },
    { id: "mcpe:army_desert",          name: { en_US: "Desert Army Helmet",     es_ES: "Casco Ejército Desértico"     }, sellPrice: 6040, buyPrice: 12600,  icon: "textures/items/armor/army_desert.png" },
    { id: "mcpe:army_woodland",        name: { en_US: "Woodland Army Helmet",   es_ES: "Casco Ejército Boscoso"       }, sellPrice: 6040, buyPrice: 12600,  icon: "textures/items/armor/army_woodland.png" },
    // 30-36% — police riot, ballistic
    { id: "mcpe:police_riot",          name: { en_US: "Riot Helmet",            es_ES: "Casco Antidisturbios"         }, sellPrice: 7320, buyPrice: 15300,  icon: "textures/items/armor/police_riot.png" },
    { id: "mcpe:ballistic_black",      name: { en_US: "Black Ballistic Helmet", es_ES: "Casco Balístico Negro"        }, sellPrice: 7280, buyPrice: 15300,  icon: "textures/items/armor/ballistic_black.png" },
    { id: "mcpe:ballistic_green",      name: { en_US: "Green Ballistic Helmet", es_ES: "Casco Balístico Verde"        }, sellPrice: 7360, buyPrice: 15300,  icon: "textures/items/armor/ballistic_green.png" },
    { id: "mcpe:ballistic_tan",        name: { en_US: "Tan Ballistic Helmet",   es_ES: "Casco Balístico Arena"        }, sellPrice: 7400, buyPrice: 15300,  icon: "textures/items/armor/ballistic_tan.png" },
    { id: "mcpe:ballistic_white",      name: { en_US: "White Ballistic Helmet", es_ES: "Casco Balístico Blanco"       }, sellPrice: 7440, buyPrice: 15300,  icon: "textures/items/armor/ballistic_white.png" },
    // 55% — assault helmet (mejor del juego)
    { id: "mcpe:assault_helmet_black", name: { en_US: "Black Assault Helmet",   es_ES: "Casco de Asalto Negro"        }, sellPrice: 10200, buyPrice: 20500,  icon: "textures/items/armor/assault_helmet_black.png" },

    // ── CHALECOS ──────────────────────────────────────────────────────────────
    // 15% — biker vest, reflective, hunting
    { id: "mcpe:biker_vest_skull",     name: { en_US: "Biker Vest with Skull",  es_ES: "Chaleco Motociclista Calavera"}, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/biker_vest_skull.png" },
    { id: "mcpe:biker_vest",           name: { en_US: "Biker Vest",             es_ES: "Chaleco de Motociclista"      }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/biker_vest.png" },
    { id: "mcpe:reflective_lime",      name: { en_US: "Lime Reflective Vest",   es_ES: "Chaleco Reflectante Lima"     }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/reflective_lime.png" },
    { id: "mcpe:reflective_orange",    name: { en_US: "Orange Reflective Vest", es_ES: "Chaleco Reflectante Naranja"  }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/reflective_orange.png" },
    { id: "mcpe:reflective_yellow",    name: { en_US: "Yellow Reflective Vest", es_ES: "Chaleco Reflectante Amarillo" }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/reflective_yellow.png" },
    { id: "mcpe:hunting_brown",        name: { en_US: "Brown Hunting Vest",     es_ES: "Chaleco de Caza Marrón"       }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/hunting_brown.png" },
    { id: "mcpe:hunting_navy",         name: { en_US: "Navy Hunting Vest",      es_ES: "Chaleco de Caza Azul Marino"  }, sellPrice: 720,  buyPrice: 1800,  icon: "textures/items/armor/hunting_navy.png" },
    // 22% — chest rig
    { id: "mcpe:chest_brown",          name: { en_US: "Brown Chest Rig",        es_ES: "Chaleco Marrón"               }, sellPrice: 1060, buyPrice: 2650,  icon: "textures/items/armor/chest_brown.png" },
    { id: "mcpe:chest_green",          name: { en_US: "Green Chest Rig",        es_ES: "Chaleco Verde"                }, sellPrice: 1060, buyPrice: 2650,  icon: "textures/items/armor/chest_green.png" },
    { id: "mcpe:chest_navy",           name: { en_US: "Navy Chest Rig",         es_ES: "Chaleco Azul Marino"          }, sellPrice: 1060, buyPrice: 2650,  icon: "textures/items/armor/chest_navy.png" },
    { id: "mcpe:chest_tan",            name: { en_US: "Tan Chest Rig",          es_ES: "Chaleco Arena"                }, sellPrice: 1060, buyPrice: 2650,  icon: "textures/items/armor/chest_tan.png" },
    { id: "mcpe:chest_white",          name: { en_US: "White Chest Rig",        es_ES: "Chaleco Blanco"               }, sellPrice: 1060, buyPrice: 2650,  icon: "textures/items/armor/chest_white.png" },
    // 28% — press vest
    { id: "mcpe:press_vest",           name: { en_US: "Press Vest",             es_ES: "Chaleco de Prensa"            }, sellPrice: 1540, buyPrice: 3350,  icon: "textures/items/armor/press_vest.png" },
    // 30% — stab vest
    { id: "mcpe:stab_vest_gray",       name: { en_US: "Gray Stab Vest",         es_ES: "Chaleco Antipunzante Gris"    }, sellPrice: 3440, buyPrice: 7600,  icon: "textures/items/armor/stab_vest_gray.png" },
    { id: "mcpe:stab_vest_tan",        name: { en_US: "Tan Stab Vest",          es_ES: "Chaleco Antipunzante Arena"   }, sellPrice: 3440, buyPrice: 7600,  icon: "textures/items/armor/stab_vest_tan.png" },
    { id: "mcpe:stab_vest_white",      name: { en_US: "White Stab Vest",        es_ES: "Chaleco Antipunzante Blanco"  }, sellPrice: 3440, buyPrice: 7600,  icon: "textures/items/armor/stab_vest_white.png" },
    // 35% — assault vest, police vest
    { id: "mcpe:assault_vest_black",   name: { en_US: "Black Assault Vest",     es_ES: "Chaleco de Asalto Negro"      }, sellPrice: 5680, buyPrice: 10200,  icon: "textures/items/armor/assault_vest_black.png" },
    { id: "mcpe:assault_vest_olive",   name: { en_US: "Olive Assault Vest",     es_ES: "Chaleco de Asalto Oliva"      }, sellPrice: 5680, buyPrice: 10200,  icon: "textures/items/armor/assault_vest_olive.png" },
    { id: "mcpe:police_vest",          name: { en_US: "Police Vest",            es_ES: "Chaleco de Policía"           }, sellPrice: 6680, buyPrice: 12200,  icon: "textures/items/armor/police_vest.png" },
    // 40% — plate vest, combat vest
    { id: "mcpe:plate_vest_gray",      name: { en_US: "Gray Plate Vest",        es_ES: "Chaleco con Placas Gris"      }, sellPrice: 7920, buyPrice: 15800,  icon: "textures/items/armor/plate_vest_gray.png" },
    { id: "mcpe:plate_vest_olive",     name: { en_US: "Olive Plate Vest",       es_ES: "Chaleco con Placas Oliva"     }, sellPrice: 7920, buyPrice: 15800,  icon: "textures/items/armor/plate_vest_olive.png" },
    { id: "mcpe:plate_vest_tan",       name: { en_US: "Tan Plate Vest",         es_ES: "Chaleco con Placas Arena"     }, sellPrice: 7920, buyPrice: 15800,  icon: "textures/items/armor/plate_vest_tan.png" },
    { id: "mcpe:plate_vest_white",     name: { en_US: "White Plate Vest",       es_ES: "Chaleco con Placas Blanco"    }, sellPrice: 7920, buyPrice: 15800,  icon: "textures/items/armor/plate_vest_white.png" },
    { id: "mcpe:combat_olive",         name: { en_US: "Olive Combat Vest",      es_ES: "Chaleco de Combate Oliva"     }, sellPrice: 7920, buyPrice: 20800,  icon: "textures/items/armor/combat_olive.png" },
    { id: "mcpe:combat_tan",           name: { en_US: "Tan Combat Vest",        es_ES: "Chaleco de Combate Arena"     }, sellPrice: 7920, buyPrice: 20800,  icon: "textures/items/armor/combat_tan.png" },
    { id: "mcpe:combat_white",         name: { en_US: "White Combat Vest",      es_ES: "Chaleco de Combate Blanco"    }, sellPrice: 7920, buyPrice: 20800,  icon: "textures/items/armor/combat_white.png" },
    // 45% — tactical vest (mejor chaleco del juego)
    { id: "mcpe:tactical_vest_black",  name: { en_US: "Black Tactical Vest",    es_ES: "Chaleco Táctico Negro"        }, sellPrice: 12160, buyPrice: 25400,  icon: "textures/items/armor/tactical_vest_black.png" },
    { id: "mcpe:tactical_vest_olive",  name: { en_US: "Olive Tactical Vest",    es_ES: "Chaleco Táctico Oliva"        }, sellPrice: 12160, buyPrice: 25400,  icon: "textures/items/armor/tactical_vest_olive.png" },
    { id: "mcpe:tactical_vest_tan",    name: { en_US: "Tan Tactical Vest",      es_ES: "Chaleco Táctico Arena"        }, sellPrice: 12160, buyPrice: 25400,  icon: "textures/items/armor/tactical_vest_tan.png" },
    { id: "mcpe:tactical_vest_white",  name: { en_US: "White Tactical Vest",    es_ES: "Chaleco Táctico Blanco"       }, sellPrice: 12160, buyPrice: 25400,  icon: "textures/items/armor/tactical_vest_white.png" },
];

setupNpcShop({
    npcId: "tz:clothesshop",
    npcLanguages,

    npcItems
});
