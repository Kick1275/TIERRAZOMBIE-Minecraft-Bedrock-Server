import { system, world } from "@minecraft/server";

// ─── Armadura vanilla ─────────────────────────────────────────────────────────
export const armorProtection = {
    leather:   { helmet: 0.01,   chestplate: 0.025,  leggings: 0.0175, boots: 0.005  },
    chainmail: { helmet: 0.025,  chestplate: 0.05,   leggings: 0.035,  boots: 0.0125 },
    iron:      { helmet: 0.0375, chestplate: 0.07,   leggings: 0.05,   boots: 0.02   },
    diamond:   { helmet: 0.055,  chestplate: 0.095,  leggings: 0.07,   boots: 0.0275 },
    netherite: { helmet: 0.07,   chestplate: 0.1125, leggings: 0.0825, boots: 0.035  },
    golden:    { helmet: 0.015,  chestplate: 0.035,  leggings: 0.025,  boots: 0.01   },
};

// ─── Chalecos DeadZzone — reducción body shot ─────────────────────────────────
export const deadzonVestProtection = {
    // 15% — webbing / biker / reflective / hunting
    "mcpe:webbing_black": 0.15, "mcpe:webbing_brown": 0.15, "mcpe:webbing_green": 0.15,
    "mcpe:webbing_tan": 0.15, "mcpe:webbing_white": 0.15,
    "mcpe:biker_vest": 0.15, "mcpe:biker_vest_skull": 0.15,
    "mcpe:reflective_lime": 0.15, "mcpe:reflective_orange": 0.15, "mcpe:reflective_yellow": 0.15,
    "mcpe:hunting_brown": 0.15, "mcpe:hunting_navy": 0.15,
    // 22% — chest rig
    "mcpe:chest_brown": 0.22, "mcpe:chest_green": 0.22, "mcpe:chest_navy": 0.22,
    "mcpe:chest_tan": 0.22, "mcpe:chest_white": 0.22,
    // 28% — press vest
    "mcpe:press_vest": 0.28,
    // 30% — stab vest
    "mcpe:stab_vest_gray": 0.30, "mcpe:stab_vest_tan": 0.30, "mcpe:stab_vest_white": 0.30,
    // 35% — assault / police
    "mcpe:assault_vest_black": 0.35, "mcpe:assault_vest_olive": 0.35, "mcpe:police_vest": 0.35,
    // 40% — plate vest / combat
    "mcpe:plate_vest_gray": 0.40, "mcpe:plate_vest_olive": 0.40,
    "mcpe:plate_vest_tan": 0.40, "mcpe:plate_vest_white": 0.40,
    "mcpe:combat_olive": 0.40, "mcpe:combat_tan": 0.40, "mcpe:combat_white": 0.40,
    // 45% — tactical vest
    "mcpe:tactical_vest_black": 0.45, "mcpe:tactical_vest_olive": 0.45,
    "mcpe:tactical_vest_tan": 0.45, "mcpe:tactical_vest_white": 0.45,
};

// ─── Cascos DeadZzone — reducción headshot ────────────────────────────────────
export const deadzonHelmetProtection = {
    // 2% — gorras, peaked, police hat, flat, durag, maid bonnet, bandanas
    "mcpe:cap_black": 0.02, "mcpe:cap_blue": 0.02, "mcpe:cap_green": 0.02, "mcpe:cap_red": 0.02,
    "mcpe:peaked_green": 0.02, "mcpe:peaked_tan": 0.02, "mcpe:peaked_white": 0.02,
    "mcpe:police_hat": 0.02, "mcpe:flat_black": 0.02, "mcpe:flat_brown": 0.02,
    "mcpe:durag_black": 0.02, "mcpe:durag_brown": 0.02, "mcpe:maid_bonnet": 0.02,
    "mcpe:bandana_blue": 0.02, "mcpe:bandana_green": 0.02, "mcpe:bandana_red": 0.02,
    // 3% — beanies, berets, boonies, cowboy, headlamp
    "mcpe:beanie_black": 0.03, "mcpe:beanie_brown": 0.03, "mcpe:beanie_olive": 0.03, "mcpe:beanie_white": 0.03,
    "mcpe:beret_blue": 0.03, "mcpe:beret_green": 0.03, "mcpe:beret_red": 0.03,
    "mcpe:boonie_artic": 0.03, "mcpe:boonie_black": 0.03, "mcpe:boonie_desert": 0.03,
    "mcpe:boonie_green": 0.03, "mcpe:boonie_tan": 0.03, "mcpe:boonie_woodland": 0.03,
    "mcpe:cowboy_black": 0.03, "mcpe:cowboy_brown": 0.03, "mcpe:cowboy_white": 0.03,
    "mcpe:headlamp": 0.03,
    // 5% — shemaghs, skimask, balaclava, night goggles, ushanka, hunting hat, clown wig
    "mcpe:shemagh_blue": 0.05, "mcpe:shemagh_brown": 0.05, "mcpe:shemagh_gray": 0.05,
    "mcpe:shemagh_olive": 0.05, "mcpe:shemagh_red": 0.05, "mcpe:shemagh_tan": 0.05,
    "mcpe:skimask_black": 0.05, "mcpe:balaclava_black": 0.05,
    "mcpe:night_goggles": 0.05, "mcpe:ushanka": 0.05,
    "mcpe:hunting_hat": 0.05, "mcpe:clown_wig": 0.05,
    // 7% — masks, respirator, plague hat
    "mcpe:mask_fawkes": 0.07, "mcpe:mask_funni": 0.07, "mcpe:mask_troll": 0.07,
    "mcpe:respirator_mask": 0.07, "mcpe:plague_hat": 0.07,
    // 10% — gasmask, welder
    "mcpe:gasmask_black": 0.10, "mcpe:gasmask_tactical": 0.10, "mcpe:gasmask_white": 0.10,
    "mcpe:welder_mask": 0.10,
    // 18% — hard hat, biker helmet, firefighter hat
    "mcpe:hard_blue": 0.18, "mcpe:hard_orange": 0.18, "mcpe:hard_red": 0.18,
    "mcpe:hard_white": 0.18, "mcpe:hard_yellow": 0.18,
    "mcpe:biker_black": 0.18, "mcpe:biker_blue": 0.18, "mcpe:biker_red": 0.18,
    "mcpe:biker_white": 0.18, "mcpe:biker_yellow": 0.18,
    "mcpe:firefighter_hat": 0.18,
    // 28% — army, great helm
    "mcpe:army_artic": 0.26, "mcpe:army_desert": 0.27, "mcpe:army_woodland": 0.28,
    "mcpe:great_helmet": 0.22,
    // UN / police riot / ballistic — progresión propia
    "mcpe:un_helmet": 0.30, "mcpe:police_riot": 0.33,
    "mcpe:ballistic_black": 0.32, "mcpe:ballistic_green": 0.34,
    "mcpe:ballistic_tan": 0.35, "mcpe:ballistic_white": 0.36,
    // Tactical / spec — cada uno diferente
    "mcpe:tactical_helmet_black": 0.40, "mcpe:tactical_helmet_olive": 0.42,
    "mcpe:tactical_helmet_tan": 0.43, "mcpe:tactical_helmet_white": 0.44,
    // Assault helmet — mejor del juego, cada variante ligeramente diferente
    "mcpe:assault_helmet_black": 0.55, "mcpe:assault_helmet_olive": 0.58,
    
    "mcpe:spec_helmet": 0.65,
};

// ─── Tops — siempre suma al body (encima del chaleco) ─────────────────────────
export const deadzonTopProtection = {
    // Civil básica — 3%
    "mcpe:tshirt_black": 0.03, "mcpe:tshirt_blue": 0.03, "mcpe:tshirt_green": 0.03,
    "mcpe:tshirt_red": 0.03, "mcpe:tshirt_white": 0.03, "mcpe:tshirt_yellow": 0.03,
    "mcpe:hawaiian_black": 0.03, "mcpe:hawaiian_red": 0.03,
    "mcpe:flannel_blue": 0.03, "mcpe:flannel_gray": 0.03, "mcpe:flannel_green": 0.03,
    "mcpe:flannel_red": 0.03, "mcpe:flannel_white": 0.03,
    "mcpe:plaid_blue": 0.03, "mcpe:plaid_gray": 0.03, "mcpe:plaid_olive": 0.03,
    "mcpe:plaid_red": 0.03, "mcpe:plaid_tan": 0.03, "mcpe:plaid_white": 0.03,
    "mcpe:striped_blue": 0.03, "mcpe:striped_white": 0.03, "mcpe:stripeds_black": 0.03,
    "mcpe:maid_top": 0.03, "mcpe:clown_top": 0.03,
    // Civil con más tela — 5%
    "mcpe:hoodie_black": 0.05, "mcpe:hoodie_blue": 0.05, "mcpe:hoodie_green": 0.05,
    "mcpe:hoodie_red": 0.05, "mcpe:hoodie_white": 0.05, "mcpe:hoodie_yellow": 0.05,
    "mcpe:puffer_black": 0.06, "mcpe:puffer_blue": 0.06,
    "mcpe:varsity_blue": 0.05, "mcpe:varsity_brown": 0.05,
    "mcpe:varsity_green": 0.05, "mcpe:varsity_red": 0.05,
    "mcpe:tracksuit_black": 0.05, "mcpe:tracksuit_blue": 0.05, "mcpe:tracksuit_red": 0.05,
    "mcpe:sweater_green": 0.05, "mcpe:sweater_white": 0.05,
    "mcpe:leather_black": 0.07, "mcpe:leather_brown": 0.07,
    "mcpe:suede_brown": 0.05,
    // Uniforme civil / trabajo — 8-9%
    "mcpe:suit_top_black": 0.08,
    "mcpe:hiking_black": 0.08, "mcpe:hiking_blue": 0.08,
    "mcpe:hero_flannel": 0.08,
    "mcpe:prisoner_top": 0.08,
    // Policial / paramédico — 10-11%
    "mcpe:police_top": 0.10,
    "mcpe:paramedic_top": 0.10,
    // Ropa táctica básica — 12-13%
    "mcpe:tactical_green": 0.12, "mcpe:tactical_navy": 0.12,
    "mcpe:tactical_red": 0.13, "mcpe:tactical_tan": 0.13, "mcpe:tactical_white": 0.12,
    // Policial especial — 14%
    "mcpe:police_special_top": 0.14,
    // Militar básico (BDU) — 15-17%
    "mcpe:bdu_desert_top": 0.15,
    "mcpe:bdu_artic_top": 0.16,
    "mcpe:bdu_woodland_top": 0.17,
    // Spec ops — 26% (mejor ropa militar, va directo después de BDU)
    "mcpe:special_top": 0.26,
    // Especializados — quedan por debajo de spec ops
    // Gorka — 12% (ropa de campo, no combate directo)
    "mcpe:gorka_top": 0.12,
    // Hazmat — 10-11% (protección química, no balística)
    "mcpe:hazmat_yellow_top": 0.10,
    "mcpe:hazmat_white_top": 0.11,
    // Ghillie — 11-13% (camuflaje, capas pero no blindaje)
    "mcpe:ghillie_drygrass_top": 0.11,
    "mcpe:ghillie_forest_top": 0.12,
    "mcpe:ghillie_snow_top": 0.13,
    // Plague — 10%
    "mcpe:plague_top": 0.10,
    // Bombero — 13% (resistente pero no militar)
    "mcpe:firefighter_top": 0.13,
    // Medieval — 15%
    "mcpe:chainmail_top": 0.15,
    "mcpe:crusader_top": 0.15,
};

// ─── Bottoms — bonus mínimo al body ──────────────────────────────────────────
export const deadzonBottomProtection = {
    // Civil básica — 2%
    "mcpe:jean_black": 0.02, "mcpe:jean_blue": 0.02, "mcpe:jean_brown": 0.02, "mcpe:jean_light": 0.02,
    "mcpe:cargo_black": 0.02, "mcpe:cargo_brown": 0.02, "mcpe:cargo_green": 0.02,
    "mcpe:cargo_tan": 0.02, "mcpe:cargo_white": 0.02,
    "mcpe:trackpants_black": 0.02, "mcpe:trackpants_blue": 0.02, "mcpe:trackpants_red": 0.02,
    "mcpe:overall_black": 0.02, "mcpe:overall_blue": 0.02, "mcpe:overall_brown": 0.02,
    "mcpe:slack_black": 0.02, "mcpe:khaki_light": 0.02,
    "mcpe:maid_bottom": 0.02, "mcpe:suspender_black": 0.02, "mcpe:clown_bottom": 0.02,
    // Uniforme civil — 3-4%
    "mcpe:prisoner_bottom": 0.03,
    "mcpe:paramedic_bottom": 0.04,
    // Policial — 5%
    "mcpe:police_bottom": 0.05,
    // Policial especial — 6%
    "mcpe:police_special_bottom": 0.06,
    // Militar básico (BDU) — 7-9%
    "mcpe:bdu_desert_bottom": 0.07,
    "mcpe:bdu_artic_bottom": 0.08,
    "mcpe:bdu_woodland_bottom": 0.09,
    // Spec ops — 18% (mejor pantalón militar, va directo después de BDU)
    "mcpe:special_bottom": 0.18,
    // Especializados — quedan por debajo de spec ops
    // Gorka — 6%
    "mcpe:gorka_bottom": 0.06,
    // Hazmat — 5-6%
    "mcpe:hazmat_yellow_bottom": 0.05,
    "mcpe:hazmat_white_bottom": 0.06,
    // Ghillie — 6-8%
    "mcpe:ghillie_drygrass_bottom": 0.06,
    "mcpe:ghillie_forest_bottom": 0.07,
    "mcpe:ghillie_snow_bottom": 0.08,
    // Plague — 6%
    "mcpe:plague_bottom": 0.06,
    // Bombero — 8%
    "mcpe:firefighter_bottom": 0.08,
    // Medieval — 10%
    "mcpe:chainmail_bottom": 0.10,
};

// ─── Tags vanilla para entidades no-jugador ───────────────────────────────────
const vanillaArmorTags = [
    { item: "netherite_helmet",     tag: "netherite_helmet",     slot: "slot.armor.head"  },
    { item: "netherite_chestplate", tag: "netherite_chestplate", slot: "slot.armor.chest" },
    { item: "netherite_leggings",   tag: "netherite_leggings",   slot: "slot.armor.legs"  },
    { item: "netherite_boots",      tag: "netherite_boots",      slot: "slot.armor.feet"  },
    { item: "diamond_helmet",       tag: "diamond_helmet",       slot: "slot.armor.head"  },
    { item: "diamond_chestplate",   tag: "diamond_chestplate",   slot: "slot.armor.chest" },
    { item: "diamond_leggings",     tag: "diamond_leggings",     slot: "slot.armor.legs"  },
    { item: "diamond_boots",        tag: "diamond_boots",        slot: "slot.armor.feet"  },
    { item: "iron_helmet",          tag: "iron_helmet",          slot: "slot.armor.head"  },
    { item: "iron_chestplate",      tag: "iron_chestplate",      slot: "slot.armor.chest" },
    { item: "iron_leggings",        tag: "iron_leggings",        slot: "slot.armor.legs"  },
    { item: "iron_boots",           tag: "iron_boots",           slot: "slot.armor.feet"  },
    { item: "chainmail_helmet",     tag: "chainmail_helmet",     slot: "slot.armor.head"  },
    { item: "chainmail_chestplate", tag: "chainmail_chestplate", slot: "slot.armor.chest" },
    { item: "chainmail_leggings",   tag: "chainmail_leggings",   slot: "slot.armor.legs"  },
    { item: "chainmail_boots",      tag: "chainmail_boots",      slot: "slot.armor.feet"  },
    { item: "leather_helmet",       tag: "leather_helmet",       slot: "slot.armor.head"  },
    { item: "leather_chestplate",   tag: "leather_chestplate",   slot: "slot.armor.chest" },
    { item: "leather_leggings",     tag: "leather_leggings",     slot: "slot.armor.legs"  },
    { item: "leather_boots",        tag: "leather_boots",        slot: "slot.armor.feet"  },
    { item: "golden_helmet",        tag: "golden_helmet",        slot: "slot.armor.head"  },
    { item: "golden_chestplate",    tag: "golden_chestplate",    slot: "slot.armor.chest" },
    { item: "golden_leggings",      tag: "golden_leggings",      slot: "slot.armor.legs"  },
    { item: "golden_boots",         tag: "golden_boots",         slot: "slot.armor.feet"  },
];

system.runInterval(function() {
    const overworld = world.getDimension("overworld");
    for (const entry of vanillaArmorTags) {
        overworld.runCommand("tag @e[type=!player] remove " + entry.tag);
    }
    for (const entry of vanillaArmorTags) {
        try {
            overworld.runCommand(
                "tag @e[type=!player,hasitem={item=minecraft:" + entry.item +
                ",location=" + entry.slot + "}] add " + entry.tag
            );
        } catch (_) {}
    }
}, 20);
