import { world, system, EntityDamageCause } from "@minecraft/server";

const WEAPONS = {
    // ── Fase 1: daños ajustados al equivalente TACZBE ──────────────────────────
    // TACZ equiv: m4a1 (8) → type95 era 6.5 → ahora 8.0
    "type95":  { damage: 8.0, maxDistance: 100, adsSpread: 0.01,  hipSpread: 0.12, armorPen: 0.32, protPen: 0.3 },
    // TACZ equiv: qbz95 (7 / pen 0.7) → qjb95 era 6.2 → ahora 7.0
    "qjb95":   { damage: 7.0, maxDistance: 120, adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.70, protPen: 0.35 },
    // TACZ equiv: evolys (10 / pen 0.6) → qjb201 era 6.2 → ahora 10.0
    "qjb201":  { damage: 10.0, maxDistance: 120, adsSpread: 0.01, hipSpread: 0.25, armorPen: 0.30, protPen: 0.3 },
    // TACZ equiv: akm (9 / pen 0.65) → ak12 era 6.2 → ahora 9.0
    "ak12":    { damage: 9.0, maxDistance: 80,  adsSpread: 0.01,  hipSpread: 0.18, armorPen: 0.35, protPen: 0.3 },
    // TACZ equiv: m16a1 (6 / pen 0.6) → t112 era 6.0 → sin cambio
    "t112":    { damage: 6.0, maxDistance: 100, adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.30, protPen: 0.3 },
    // TACZ equiv: type81 (9 / pen 0.65) → arka era 6.0 → ahora 9.0
    "arka":    { damage: 9.0, maxDistance: 100, adsSpread: 0.007, hipSpread: 0.2,  armorPen: 0.32, protPen: 0.3 },
    // TACZ equiv: hk416 (5 / pen 0.6) → hk416 era 6.0 → ahora 5.0
    "hk416":   { damage: 5.0, maxDistance: 80,  adsSpread: 0.01,  hipSpread: 0.19, armorPen: 0.30, protPen: 0.3 },
    // TACZ equiv: m16 (6 / pen 0.6) → m16a4 era 6.0 → sin cambio
    "m16a4":   { damage: 6.0, maxDistance: 130, adsSpread: 0.006, hipSpread: 0.2,  armorPen: 0.30, protPen: 0.3 },
    // TACZ equiv: scarl (7 / pen 0.65) → k2 era 6.1 → ahora 7.0
    "k2":      { damage: 7.0, maxDistance: 90,  adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.32, protPen: 0.3 },
    // TACZ equiv: g36 (7 / pen 0.65) → type89 era 6.5 → ahora 7.0
    "type89":  { damage: 7.0, maxDistance: 90,  adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.32, protPen: 0.3 },
    // TACZ equiv: g17 (6 / pen 0.5) → qsz92 era 6.0 → sin cambio
    "qsz92":   { damage: 6.0, maxDistance: 20,  adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.25, protPen: 0.25 },
    // TACZ equiv: mp5 (6.5 / pen 0.45) → qcq171 era 4.6 → ahora 6.5
    "qcq171":  { damage: 6.5, maxDistance: 50,  adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.22, protPen: 0.25 },
    // Sin equivalente TACZ — daño original conservado
    "type88":  { damage: 6.0, maxDistance: 100, adsSpread: 0.01,  hipSpread: 0.2,  armorPen: 0.4,  protPen: 0.3 },
    // TACZ equiv: m249 (7 / pen 0.65) → type882 era 5.5 → ahora 7.0
    "type882": { damage: 7.0, maxDistance: 80,  adsSpread: 0.015, hipSpread: 0.25, armorPen: 0.32, protPen: 0.3 },
    // TACZ equiv: scarh/fal/g3 (9 / pen 0.7) → m7 era 8.0 → ahora 9.0
    "m7":      { damage: 9.0, maxDistance: 150, adsSpread: 0.01,  hipSpread: 0.25, armorPen: 0.70, protPen: 0.35 },
    // TACZ equiv: g3/fal (9 / pen 0.7) → m8 era 7.8 → ahora 9.0
    "m8":      { damage: 9.0, maxDistance: 75,  adsSpread: 0.012, hipSpread: 0.25, armorPen: 0.70, protPen: 0.35 },
    // TACZ equiv: qbz191 (7 / pen 0.7) → qbz191 era 6.2 → ahora 7.0
    "qbz191":  { damage: 7.0, maxDistance: 100, adsSpread: 0.01,  hipSpread: 0.17, armorPen: 0.70, protPen: 0.35 },
    // TACZ equiv: fal/sks (9 / pen 0.7) → qbu191 era 8.0 → ahora 9.0
    "qbu191":  { damage: 12.0, maxDistance: 150, adsSpread: 0.003, hipSpread: 0.3,  armorPen: 0.70, protPen: 0.35 },
};

// ── Fase 2: Sistema de armadura DeadZone (portado desde TACZBE/armorDetection.js) ──

const DZ_VEST = {
    "mcpe:biker_vest":0.15,"mcpe:biker_vest_skull":0.15,"mcpe:reflective_lime":0.15,"mcpe:reflective_orange":0.15,"mcpe:reflective_yellow":0.15,
    "mcpe:hunting_brown":0.15,"mcpe:hunting_navy":0.15,
    "mcpe:webbing_black":0.20,"mcpe:webbing_brown":0.20,"mcpe:webbing_green":0.20,"mcpe:webbing_tan":0.20,"mcpe:webbing_white":0.20,
    "mcpe:chest_brown":0.25,"mcpe:chest_green":0.25,"mcpe:chest_navy":0.25,"mcpe:chest_tan":0.25,"mcpe:chest_white":0.25,
    "mcpe:press_vest":0.35,
    //police vest 0.45
    "mcpe:plate_vest_gray":0.55,"mcpe:plate_vest_olive":0.55,"mcpe:plate_vest_tan":0.55,"mcpe:plate_vest_white":0.55,
    "mcpe:assault_vest_black":0.65,"mcpe:assault_vest_olive":0.65,"mcpe:police_vest":0.65,
    "mcpe:stab_vest_gray":0.75,"mcpe:stab_vest_tan":0.75,"mcpe:stab_vest_white":0.75,
    "mcpe:combat_olive":0.85,"mcpe:combat_tan":0.85,"mcpe:combat_white":0.85,
    "mcpe:tactical_vest_black":0.95,"mcpe:tactical_vest_olive":0.95,"mcpe:tactical_vest_tan":0.95,"mcpe:tactical_vest_white":0.95,
};
const DZ_HELMET = {
    "mcpe:cap_black":0.02,"mcpe:cap_blue":0.02,"mcpe:cap_green":0.02,"mcpe:cap_red":0.02,
    "mcpe:peaked_green":0.02,"mcpe:peaked_tan":0.02,"mcpe:peaked_white":0.02,"mcpe:police_hat":0.02,
    "mcpe:flat_black":0.02,"mcpe:flat_brown":0.02,"mcpe:durag_black":0.02,"mcpe:durag_brown":0.02,
    "mcpe:maid_bonnet":0.02,"mcpe:bandana_blue":0.02,"mcpe:bandana_green":0.02,"mcpe:bandana_red":0.02,
    "mcpe:beanie_black":0.03,"mcpe:beanie_brown":0.03,"mcpe:beanie_olive":0.03,"mcpe:beanie_white":0.03,
    "mcpe:beret_blue":0.03,"mcpe:beret_green":0.03,"mcpe:beret_red":0.03,
    "mcpe:boonie_artic":0.03,"mcpe:boonie_black":0.03,"mcpe:boonie_desert":0.03,"mcpe:boonie_green":0.03,
    "mcpe:boonie_tan":0.03,"mcpe:boonie_woodland":0.03,"mcpe:cowboy_black":0.03,"mcpe:cowboy_brown":0.03,
    "mcpe:cowboy_white":0.03,"mcpe:headlamp":0.03,
    "mcpe:shemagh_blue":0.05,"mcpe:shemagh_brown":0.05,"mcpe:shemagh_gray":0.05,"mcpe:shemagh_olive":0.05,
    "mcpe:shemagh_red":0.05,"mcpe:shemagh_tan":0.05,"mcpe:skimask_black":0.05,"mcpe:balaclava_black":0.05,
    "mcpe:night_goggles":0.05,"mcpe:ushanka":0.05,"mcpe:hunting_hat":0.05,"mcpe:clown_wig":0.05,
    "mcpe:mask_fawkes":0.07,"mcpe:mask_funni":0.07,"mcpe:mask_troll":0.07,"mcpe:respirator_mask":0.07,"mcpe:plague_hat":0.07,
    "mcpe:gasmask_black":0.10,"mcpe:gasmask_tactical":0.10,"mcpe:gasmask_white":0.10,"mcpe:welder_mask":0.10,
    "mcpe:hard_blue":0.48,"mcpe:hard_orange":0.48,"mcpe:hard_red":0.48,"mcpe:hard_white":0.48,"mcpe:hard_yellow":0.48,
    "mcpe:biker_black":0.58,"mcpe:biker_blue":0.58,"mcpe:biker_red":0.58,"mcpe:biker_white":0.58,"mcpe:biker_yellow":0.58,
    "mcpe:firefighter_hat":0.50,"mcpe:army_artic":0.68,"mcpe:army_desert":0.68,"mcpe:army_woodland":0.68,"mcpe:great_helmet":0.68,
    "mcpe:un_helmet":0.84,"mcpe:police_riot":0.55,
    "mcpe:ballistic_black":0.76,"mcpe:ballistic_green":0.76,"mcpe:ballistic_tan":0.76,"mcpe:ballistic_white":0.76,
    "mcpe:tactical_helmet_black":0.84,"mcpe:tactical_helmet_olive":0.84,"mcpe:tactical_helmet_tan":0.84,"mcpe:tactical_helmet_white":0.84,
    "mcpe:assault_helmet_black":0.90,"mcpe:assault_helmet_olive":0.90,"mcpe:spec_helmet":0.95,
};
const DZ_TOP = {
    "mcpe:tshirt_black":0.03,"mcpe:tshirt_blue":0.03,"mcpe:tshirt_green":0.03,"mcpe:tshirt_red":0.03,"mcpe:tshirt_white":0.03,"mcpe:tshirt_yellow":0.03,
    "mcpe:hawaiian_black":0.03,"mcpe:hawaiian_red":0.03,"mcpe:flannel_blue":0.03,"mcpe:flannel_gray":0.03,"mcpe:flannel_green":0.03,
    "mcpe:flannel_red":0.03,"mcpe:flannel_white":0.03,"mcpe:plaid_blue":0.03,"mcpe:plaid_gray":0.03,"mcpe:plaid_olive":0.03,
    "mcpe:plaid_red":0.03,"mcpe:plaid_tan":0.03,"mcpe:plaid_white":0.03,"mcpe:striped_blue":0.03,"mcpe:striped_white":0.03,
    "mcpe:stripeds_black":0.03,"mcpe:maid_top":0.03,"mcpe:clown_top":0.03,
    "mcpe:hoodie_black":0.05,"mcpe:hoodie_blue":0.05,"mcpe:hoodie_green":0.05,"mcpe:hoodie_red":0.05,"mcpe:hoodie_white":0.05,"mcpe:hoodie_yellow":0.05,
    "mcpe:puffer_black":0.06,"mcpe:puffer_blue":0.06,"mcpe:varsity_blue":0.05,"mcpe:varsity_brown":0.05,
    "mcpe:varsity_green":0.05,"mcpe:varsity_red":0.05,"mcpe:tracksuit_black":0.05,"mcpe:tracksuit_blue":0.05,"mcpe:tracksuit_red":0.05,
    "mcpe:sweater_green":0.05,"mcpe:sweater_white":0.05,"mcpe:leather_black":0.07,"mcpe:leather_brown":0.07,"mcpe:suede_brown":0.05,
    "mcpe:suit_top_black":0.08,"mcpe:hiking_black":0.08,"mcpe:hiking_blue":0.08,"mcpe:hero_flannel":0.08,"mcpe:prisoner_top":0.08,
    "mcpe:police_top":0.15,"mcpe:paramedic_top":0.10,
    "mcpe:tactical_green":0.12,"mcpe:tactical_navy":0.12,"mcpe:tactical_red":0.13,"mcpe:tactical_tan":0.13,"mcpe:tactical_white":0.12,
    "mcpe:police_special_top":0.20,
    "mcpe:bdu_desert_top":0.20,"mcpe:bdu_artic_top":0.20,"mcpe:bdu_woodland_top":0.20,"mcpe:special_top":0.30,
    "mcpe:gorka_top":0.15,"mcpe:hazmat_yellow_top":0.15,"mcpe:hazmat_white_top":0.15,
    "mcpe:ghillie_drygrass_top":0.20,"mcpe:ghillie_forest_top":0.20,"mcpe:ghillie_snow_top":0.20,
    "mcpe:plague_top":0.15,"mcpe:firefighter_top":0.15,"mcpe:chainmail_top":0.15,"mcpe:crusader_top":0.15,
};
const DZ_BOTTOM = {
    // Civil básica — sin cambios (el top tampoco cambió)
    "mcpe:jean_black":0.02,"mcpe:jean_blue":0.02,"mcpe:jean_brown":0.02,"mcpe:jean_light":0.02,
    "mcpe:cargo_black":0.02,"mcpe:cargo_brown":0.02,"mcpe:cargo_green":0.02,"mcpe:cargo_tan":0.02,"mcpe:cargo_white":0.02,
    "mcpe:trackpants_black":0.02,"mcpe:trackpants_blue":0.02,"mcpe:trackpants_red":0.02,
    "mcpe:overall_black":0.02,"mcpe:overall_blue":0.02,"mcpe:overall_brown":0.02,
    "mcpe:slack_black":0.02,"mcpe:khaki_light":0.02,"mcpe:maid_bottom":0.02,"mcpe:suspender_black":0.02,"mcpe:clown_bottom":0.02,

    // Uniforme civil / paramédico — sin cambios
    "mcpe:prisoner_bottom":0.03,"mcpe:paramedic_bottom":0.04,

    // Policial — top subió 0.10→0.15, bottom recalculado (0.15 * 0.9)
    "mcpe:police_bottom":0.13,

    // Policial especial — top subió 0.14→0.20, bottom recalculado (0.20 * 0.9)
    "mcpe:police_special_bottom":0.18,

    // BDU — tops unificados a 0.20, bottoms unificados también (0.20 * 0.9)
    "mcpe:bdu_desert_bottom":0.18,"mcpe:bdu_artic_bottom":0.18,"mcpe:bdu_woodland_bottom":0.18,

    // Spec ops — top subió 0.26→0.30, bottom = 0.27 (tu propio ejemplo)
    "mcpe:special_bottom":0.27,

    // Gorka — top subió 0.12→0.15, bottom recalculado (0.15 * 0.9)
    "mcpe:gorka_bottom":0.14,

    // Hazmat — tops unificados a 0.15, bottoms unificados también (0.15 * 0.9)
    "mcpe:hazmat_yellow_bottom":0.14,"mcpe:hazmat_white_bottom":0.14,

    // Ghillie — tops unificados a 0.20, bottoms unificados también (0.20 * 0.9)
    "mcpe:ghillie_drygrass_bottom":0.18,"mcpe:ghillie_forest_bottom":0.18,"mcpe:ghillie_snow_bottom":0.18,

    // Plague — top subió 0.10→0.15, bottom recalculado (0.15 * 0.9)
    "mcpe:plague_bottom":0.14,

    // Bombero — top subió 0.13→0.15, bottom recalculado (0.15 * 0.9)
    "mcpe:firefighter_bottom":0.14,

    // Medieval — sin cambios
    "mcpe:chainmail_bottom":0.10,
};
const VANILLA_ARM = { leather:[1,3,2,1,0], chainmail:[2,5,4,2,0], iron:[2,6,5,2,0], diamond:[3,8,6,3,2], netherite:[3,8,6,3,3], golden:[2,5,3,1,0] };

/**
 * Lee la armadura de una entidad y devuelve reducciones separadas.
 * Para jugadores: prioriza DZ, luego vanilla.
 * Para no-jugadores: solo vanilla.
 * @returns {{ vestR, helmetR, topR, bottomR }} — valores 0.0–1.0
 */
function getDZReductions(entity) {
    let vestR = 0, helmetR = 0, topR = 0, bottomR = 0;
    const equip = entity.getComponent("minecraft:equippable");
    if (!equip) return { vestR, helmetR, topR, bottomR };

    const chest = equip.getEquipmentSlot("Chest").getItem();
    if (chest) {
        const id = chest.typeId;
        if (DZ_VEST[id] !== undefined)    vestR = DZ_VEST[id];
        else if (DZ_TOP[id] !== undefined) topR  = DZ_TOP[id];
        else {
            const mat = _vanillaMat(id);
            if (mat) vestR = (VANILLA_ARM[mat]?.[1] ?? 0) / 25;
        }
    }
    const head = equip.getEquipmentSlot("Head").getItem();
    if (head) {
        const id = head.typeId;
        if (DZ_HELMET[id] !== undefined) helmetR = DZ_HELMET[id];
        else {
            const mat = _vanillaMat(id);
            if (mat) helmetR = (VANILLA_ARM[mat]?.[0] ?? 0) / 25;
        }
    }
    const legs = equip.getEquipmentSlot("Legs").getItem();
    if (legs) {
        const id = legs.typeId;
        if (DZ_BOTTOM[id] !== undefined) bottomR = DZ_BOTTOM[id];
        else {
            const mat = _vanillaMat(id);
            if (mat) bottomR = (VANILLA_ARM[mat]?.[2] ?? 0) / 25;
        }
    }
    return { vestR, helmetR, topR, bottomR };
}

function _vanillaMat(typeId) {
    const id = typeId.replace("minecraft:","").toLowerCase();
    if (id.includes("netherite")) return "netherite";
    if (id.includes("diamond"))   return "diamond";
    if (id.includes("iron"))      return "iron";
    if (id.includes("chainmail")) return "chainmail";
    if (id.includes("golden"))    return "golden";
    if (id.includes("leather"))   return "leather";
    return null;
}

// penFactor: mayor penetración → la armadura aplica menos. pen 0.9 → 55%, pen 0.3 → 85%
function applyDZReduction(damage, reduction, penetration) {
    const penFactor = 1 - (penetration * 0.45);
    return Math.max(1, damage * (1 - reduction * penFactor));
}




const DESTRUCTIBLE_BLOCKS = new Set([
    "minecraft:short_grass",
    "minecraft:grass",
    "minecraft:tall_grass",
    "minecraft:large_fern",
    "minecraft:peony",
    "minecraft:rose_bush",
    "minecraft:fern",
    "minecraft:glass",
    "minecraft:glass_pane",
    "minecraft:white_stained_glass",
    "minecraft:orange_stained_glass",
    "minecraft:magenta_stained_glass",
    "minecraft:light_blue_stained_glass",
    "minecraft:yellow_stained_glass",
    "minecraft:lime_stained_glass",
    "minecraft:pink_stained_glass",
    "minecraft:gray_stained_glass",
    "minecraft:light_gray_stained_glass",
    "minecraft:cyan_stained_glass",
    "minecraft:purple_stained_glass",
    "minecraft:blue_stained_glass",
    "minecraft:brown_stained_glass",
    "minecraft:green_stained_glass",
    "minecraft:red_stained_glass",
    "minecraft:black_stained_glass",
    "minecraft:white_stained_glass_pane",
    "minecraft:orange_stained_glass_pane",
    "minecraft:magenta_stained_glass_pane",
    "minecraft:light_blue_stained_glass_pane",
    "minecraft:yellow_stained_glass_pane",
    "minecraft:lime_stained_glass_pane",
    "minecraft:pink_stained_glass_pane",
    "minecraft:gray_stained_glass_pane",
    "minecraft:light_gray_stained_glass_pane",
    "minecraft:cyan_stained_glass_pane",
    "minecraft:purple_stained_glass_pane",
    "minecraft:blue_stained_glass_pane",
    "minecraft:brown_stained_glass_pane",
    "minecraft:green_stained_glass_pane",
    "minecraft:red_stained_glass_pane",
    "minecraft:black_stained_glass_pane",
]);

const PENETRABLE_BLOCKS = new Map([
    
    ["minecraft:oak_planks",       0.6],
    ["minecraft:spruce_planks",    0.6],
    ["minecraft:birch_planks",     0.6],
    ["minecraft:jungle_planks",    0.6],
    ["minecraft:acacia_planks",    0.6],
    ["minecraft:dark_oak_planks",  0.6],
    ["minecraft:crimson_planks",  0.5],
    ["minecraft:mangrove_planks",  0.6],
    ["minecraft:pale_oak_planks",  0.6],
    ["minecraft:warped_planks",  0.5],
    ["minecraft:oak_log",       0.6],
    ["minecraft:spruce_log",    0.6],
    ["minecraft:birch_log",     0.6],
    ["minecraft:jungle_log",    0.6],
    ["minecraft:acacia_log",    0.6],
    ["minecraft:dark_oak_log",  0.6],
    ["minecraft:mangrove_log",  0.6],
    ["minecraft:pale_oak_log",  0.6],
    ["minecraft:oak_fence",        0.5],
    ["minecraft:oak_door",         0.55],
    ["minecraft:oak_trapdoor",     0.55],
    ["minecraft:hay_block",        0.4],
    ["minecraft:short_grass",       0.8],
    ["minecraft:grass",       0.8],
    ["minecraft:tall_grass",       0.8],
    ["minecraft:large_fern",       0.8],
    ["minecraft:peony",       0.8],
    ["minecraft:rose_bush",       0.8],
    ["minecraft:fern",       0.8],
    ["minecraft:glass",       0.8],
    ["minecraft:glass_pane",       0.8],
    ["minecraft:white_stained_glass",       0.8],
    ["minecraft:orange_stained_glass",       0.8],
    ["minecraft:magenta_stained_glass",       0.8],
    ["minecraft:light_blue_stained_glass",       0.8],
    ["minecraft:yellow_stained_glass",       0.8],
    ["minecraft:lime_stained_glass",       0.8],
    ["minecraft:pink_stained_glass",       0.8],
    ["minecraft:gray_stained_glass",       0.8],
    ["minecraft:light_gray_stained_glass",       0.8],
    ["minecraft:cyan_stained_glass",       0.8],
    ["minecraft:purple_stained_glass",       0.8],
    ["minecraft:blue_stained_glass",       0.8],
    ["minecraft:brown_stained_glass",       0.8],
    ["minecraft:green_stained_glass",       0.8],
    ["minecraft:red_stained_glass",       0.8],
    ["minecraft:black_stained_glass",       0.8],
    ["minecraft:white_stained_glass_pane",       0.8],
    ["minecraft:orange_stained_glass_pane",       0.8],
    ["minecraft:magenta_stained_glass_pane",       0.8],
    ["minecraft:light_blue_stained_glass_pane",       0.8],
    ["minecraft:yellow_stained_glass_pane",       0.8],
    ["minecraft:lime_stained_glass_pane",       0.8],
    ["minecraft:pink_stained_glass_pane",       0.8],
    ["minecraft:gray_stained_glass_pane",       0.8],
    ["minecraft:light_gray_stained_glass_pane",       0.8],
    ["minecraft:cyan_stained_glass_pane",       0.8],
    ["minecraft:purple_stained_glass_pane",       0.8],
    ["minecraft:blue_stained_glass_pane",       0.8],
    ["minecraft:brown_stained_glass_pane",       0.8],
    ["minecraft:green_stained_glass_pane",       0.8],
    ["minecraft:red_stained_glass_pane",       0.8],
    ["minecraft:black_stained_glass_pane",       0.8],
    
    
]);

const MAX_PENETRATION_DEPTH = 2;


const DIMENSIONS = ["overworld", "nether", "the_end"];

function isADS(player) {
    return player.isSneaking;
}

function getShootVector(player, spread) {
    const rot = player.getRotation();
    const p = (rot.x * Math.PI) / 180;
    const y = ((rot.y + 90) * Math.PI) / 180;

    const base  = { x: Math.cos(y) * Math.cos(p), y: Math.sin(-p), z: Math.sin(y) * Math.cos(p) };
    const right = { x: Math.sin(y), y: 0, z: -Math.cos(y) };
    const up    = { x: -Math.sin(p) * Math.cos(y), y: Math.cos(p), z: -Math.sin(p) * Math.sin(y) };

    const angle     = Math.random() * 2 * Math.PI;
    const magnitude = Math.random() * spread;

    return {
        x: base.x + (right.x * Math.cos(angle) + up.x * Math.sin(angle)) * magnitude,
        y: base.y + (right.y * Math.cos(angle) + up.y * Math.sin(angle)) * magnitude,
        z: base.z + (right.z * Math.cos(angle) + up.z * Math.sin(angle)) * magnitude,
    };
}

function calcDamage(base, _unused, armorPen, protPen) {
    // Mantenida por compatibilidad — la reducción real la hace applyDZReduction
    return base;
}

function getImpactLocation(blockHit, shootVector) {
    const b = blockHit.block;
    const len = Math.sqrt(shootVector.x ** 2 + shootVector.y ** 2 + shootVector.z ** 2);
    const nx = shootVector.x / len;
    const ny = shootVector.y / len;
    const nz = shootVector.z / len;
    return {
        x: b.x + 0.5 - nx * 0.5,
        y: b.y + 0.5 - ny * 0.5,
        z: b.z + 0.5 - nz * 0.5,
    };
}

function spawnBulletImpactEffects(player, location) {
    const dimension = player.dimension;
    dimension.spawnParticle("deltan:inwa_bullet_spark", location);
    dimension.spawnParticle("deltan:inwa_bullet_smoke", {
        x: location.x,
        y: location.y + 0.05,
        z: location.z,
    });
    dimension.playSound("impact", location, { volume: 0.7, pitch: 1.0 });
}



function tryDestroyBlock(blockHit, dimension) {
    const block = blockHit.block;
    const typeId = block.typeId;

    if (!DESTRUCTIBLE_BLOCKS.has(typeId)) return;

    
    const isDoubleBlock = typeId === "minecraft:tall_grass" || typeId === "minecraft:large_fern";

    if (isDoubleBlock) {
        
        const states = block.permutation.getAllStates();
        const isUpperHalf = states["minecraft:double_plant_type"] === "top" 
                         || states["half"] === "upper";

        if (isUpperHalf) {
            
            block.setType("minecraft:air");
            const below = dimension.getBlock({ x: block.x, y: block.y - 1, z: block.z });
            if (below && below.typeId === typeId) below.setType("minecraft:air");
        } else {
            
            block.setType("minecraft:air");
            const above = dimension.getBlock({ x: block.x, y: block.y + 1, z: block.z });
            if (above && above.typeId === typeId) above.setType("minecraft:air");
        }
    } else {
        block.setType("minecraft:air");
    }
}

function getExitPoint(blockHit, shootVector) {
    const b = blockHit.block;
    const len = Math.sqrt(shootVector.x ** 2 + shootVector.y ** 2 + shootVector.z ** 2);
    const nx = shootVector.x / len;
    const ny = shootVector.y / len;
    const nz = shootVector.z / len;
    
    return {
        x: b.x + 0.5 + nx * 0.55,
        y: b.y + 0.5 + ny * 0.55,
        z: b.z + 0.5 + nz * 0.55,
    };
}

function fireHitscan(player, weaponName, depth = 0, damageMult = 1.0, overrideOrigin = null, overrideVector = null) {
    const weapon = WEAPONS[weaponName];
    if (!weapon) {
        if (depth === 0) player.sendMessage(`§cUnknown weapon: "${weaponName}"`);
        return;
    }

    const { damage, maxDistance, adsSpread, hipSpread, armorPen, protPen } = weapon;
    const dimension = player.dimension;
    
    
    const headLoc   = overrideOrigin ?? player.getHeadLocation();
    const spread    = (overrideVector != null) ? 0 : (isADS(player) ? adsSpread : hipSpread);
    const shootVector = overrideVector ?? getShootVector(player, spread);

    
    const effectiveMaxDistance = maxDistance * (depth === 0 ? 1.0 : 0.8);

    const blockHit = dimension.getBlockFromRay(headLoc, shootVector, {
        maxDistance: effectiveMaxDistance,
        includeLiquidBlocks: false,
    });

    let blockDistance = effectiveMaxDistance;
    if (blockHit) {
        const b = blockHit.block;
        const dx = b.x - headLoc.x;
        const dy = b.y - headLoc.y;
        const dz = b.z - headLoc.z;
        blockDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    const entityHits = dimension.getEntitiesFromRay(headLoc, shootVector, {
        maxDistance: effectiveMaxDistance,
        ignoreBlockCollision: true,
    });

    let hitEntity = false;

    for (const hit of entityHits) {
        if (hit.entity.id === player.id) continue;

        const eLoc = hit.entity.location;
        const dx = eLoc.x - headLoc.x;
        const dy = eLoc.y - headLoc.y;
        const dz = eLoc.z - headLoc.z;
        const entityDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (entityDistance > blockDistance) break;

        // ── Fase 2: armadura DZ con headshot/bodyshot ───────────────────────
        const baseDmg = damage * damageMult;
        const { vestR, helmetR, topR, bottomR } = getDZReductions(hit.entity);
        const hitLoc = hit.entity.location;
        const isHeadshot = (headLoc.y - 0.1) > (hitLoc.y + 1.5);

        let finalDmg;
        if (isHeadshot) {
            // Headshot: daño x2, reducido por casco
            finalDmg = applyDZReduction(baseDmg * 2, helmetR, armorPen);
        } else {
            // Bodyshot: chaleco + top + pantalón suman (máx 90%)
            const totalBodyR = Math.min(0.90, vestR + topR + bottomR);
            finalDmg = applyDZReduction(baseDmg, totalBodyR, armorPen);
        }

        hit.entity.setDynamicProperty("eac:ticking_damage",
            (hit.entity.getDynamicProperty("eac:ticking_damage") ?? 0) + finalDmg
        );

        
        player.playSound("hitmark", { pitch: depth > 0 ? 0.75 : 1.0, volume: 0.8 });
        hitEntity = true;
        break;
    }

    if (!hitEntity && blockHit) {
    const typeId = blockHit.block.typeId;
    const penMult = PENETRABLE_BLOCKS.get(typeId);
    const isDestructible = DESTRUCTIBLE_BLOCKS.has(typeId);

    if (penMult !== undefined && depth < MAX_PENETRATION_DEPTH) {
        const impactLoc = getImpactLocation(blockHit, shootVector);
        spawnBulletImpactEffects(player, impactLoc);

        
        if (isDestructible) {
            tryDestroyBlock(blockHit, dimension);
        }

        const exitPoint = getExitPoint(blockHit, shootVector);
        const newDamageMult = damageMult * penMult;

        system.run(() => {
            fireHitscan(player, weaponName, depth + 1, newDamageMult, exitPoint, shootVector);
        });
    } else {
        
        tryDestroyBlock(blockHit, dimension);
        const impactLoc = getImpactLocation(blockHit, shootVector);
        spawnBulletImpactEffects(player, impactLoc);
    }
}
}


system.runInterval(() => {
    for (const dimId of DIMENSIONS) {
        for (const entity of world.getDimension(dimId).getEntities()) {
            const dmg = entity.getDynamicProperty("eac:ticking_damage");
            if (dmg > 0) {
                entity.applyDamage(dmg, { cause: EntityDamageCause.override });
                entity.setDynamicProperty("eac:ticking_damage", 0);
            }
        }
    }
}, 1);

system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id !== "eac:hitscan_activate") return;

    const weaponName = e.message?.trim();
    if (!weaponName) {
        e.sourceEntity?.sendMessage("§cUsage: /scriptevent eac:hitscan_activate <weapon>");
        return;
    }

    const player = e.sourceEntity;
    if (!player) return;

    fireHitscan(player, weaponName);
});