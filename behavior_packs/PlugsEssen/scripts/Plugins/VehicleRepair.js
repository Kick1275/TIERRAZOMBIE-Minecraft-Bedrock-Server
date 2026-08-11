import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { getPlayerLanguage, getText } from '../Utils/Translations.js';

// Helper shorthand
function tr(player, key, replacements = {}) {
    const lang = getPlayerLanguage(player);
    let text = getText(lang, `vehicleRepair.${key}`);
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`@@${k}`, String(v));
    }
    return text;
}

// Normaliza un item ID: si no tiene namespace, asume 'minecraft:'
function normalizeId(id) {
    return id.includes(':') ? id : `minecraft:${id}`;
}

// ═══════════════════════════════════════════════════════════════════
//  VEHICLE REPAIR SYSTEM v1.0
//  Trigger: click derecho con af:wrench en un vehiculo conocido
//  Lógica: calcula cuánto HP se puede recuperar con los materiales
//          que tiene el jugador en ese momento (Opción A)
// ═══════════════════════════════════════════════════════════════════

// ── Categorías de vehículo ────────────────────────────────────────
// Cada categoría define su HP máximo canónico y sus tablas de costo
// por punto de HP reparado (se escalan según el daño actual).
//
// CATEGORÍAS:
//   pubg       — vehículos PUBG (buggy, UAZ, dacias, PG-117)  HP: 500
//   light      — camiones/tácticos ligeros Bean's AF           HP: 10
//   armored    — IFV/APC/blindados medios                      HP: 20-30
//   tank       — tanques MBT y pesados                         HP: 50
//   artillery  — artillería/HIMARS/BM-30                       HP: 20
//   drone      — MQ-9 / GJ-2                                   HP: 10
//   helicopter — AH-64 / Mi-24                                  HP: 10
//   fighter    — cazas ligeros/medios (F4,MiG21,Su25,A10,F16…) HP: 10
//   stealth    — cazas avanzados (Su57,F22,F35,J20,B2,Tu160)   HP: 10
//   boat_small — patrulleras / corbetas navales                 HP: 20
//   boat_large — portaaviones / submarinos                      HP: 200

const VEHICLE_CATEGORY = {
    // PUBG
    'pubg:buggy':        'pubg',
    'pubg:opentop':      'pubg',
    'pubg:softtop':      'pubg',
    'pubg:hardtop':      'pubg',
    'pubg:pg117':        'pubg',
    'pubg:dacia_white':  'pubg',
    'pubg:dacia_blue':   'pubg',
    'pubg:dacia_red':    'pubg',
    'pubg:dacia_green':  'pubg',
    // Tierra ligeros
    'af:m939':           'light',
    'af:kamaz65224':     'light',
    'af:m1151':          'light',
    // Blindados medios
    'af:btr80':          'armored',
    'af:m2a2':           'armored',
    'af:eq2050':         'armored',
    'af:2s38':           'armored',
    // Artillería
    'af:m142':           'artillery',
    'af:bm30':           'artillery',
    // Tanques
    'af:m551':           'tank',
    'af:type16':         'tank',
    'af:t72a':           'tank',
    'af:leopard2a4':     'tank',
    'af:m1a1':           'tank',
    'af:t90m':           'tank',
    'af:bmpt72':         'tank',
    // Drones
    'af:mq9':            'drone',
    'af:gj2':            'drone',
    // Helicópteros
    'af:ah64':           'helicopter',
    'af:mi24':           'helicopter',
    // Cazas ligeros/medios
    'af:f4':             'fighter',
    'af:mig21':          'fighter',
    'af:su25':           'fighter',
    'af:a10':            'fighter',
    'af:f16':            'fighter',
    'af:f14':            'fighter',
    'af:mig29':          'fighter',
    'af:yak141':         'fighter',
    'af:f18':            'fighter',
    'af:su33':           'fighter',
    // Cazas avanzados / bombarderos
    'af:su57':           'stealth',
    'af:f22':            'stealth',
    'af:f35a':           'stealth',
    'af:j20':            'stealth',
    'af:b2':             'stealth',
    'af:tu160':          'stealth',
    // Navales pequeños
    'af:strb90h':        'boat_small',
    'af:project03160':   'boat_small',
    'af:type142a':       'boat_small',
    'af:project1241':    'boat_small',
    'af:a19':            'boat_small',
    // Navales grandes
    'af:project677':     'boat_large',
    'af:af_16ddh':       'boat_large',
    'af:type075':        'boat_large',
    // ── Artillería remolcada — reparación con shift+click ────────
    // (la interacción normal de la llave ya sirve para rotar/ajustar)
    'af:d20':            'artillery_towed',
    'af:m114':           'artillery_towed',
    // ── Ametralladora montada ─────────────────────────────────────
    'af:mounted_gun':    'mounted_gun_cat',
    // ── Defensa estática ──────────────────────────────────────────
    'af:c_ram':          'static_defense',
    'af:nasams':         'static_defense',
    'af:ak630':          'static_defense',
    'af:sam_turret':     'static_defense',
    // ── Centinelas ───────────────────────────────────────────────
    'af:bm3':            'sentry',
    'af:sgra1':          'sentry',
};

// HP máximo canónico por categoría — debe coincidir con los valores en los entity JSON
const MAX_HP = {
    pubg:       500,
    light:      1800,  // m939/kamaz=1750, m1151=1800
    armored:    2050,
    tank:       2800,  // t90m=2800, leopard=2600, m1a1=2500
    artillery:  1900,  // m142=1900, bm30=1900
    drone:      1800,
    helicopter: 2300,  // mi24=2300, ah64=2250
    fighter:    2700,  // f22/f35/su57/j20=2700
    stealth:    3000,  // b2/tu160=3000
    boat_small: 2500,  // a19=2500
    boat_large: 3000,
    // ── Artillería remolcada + estática (nueva) ─────────────────
    artillery_towed:  1050,  // d20=1050, m114=1050
    mounted_gun_cat:  1005,  // mounted_gun/stand=1005
    static_defense:   1050,  // c_ram, nasams, ak630, sam_turret
    sentry:           1005,  // bm3, sgra1
};

// ── Tablas de costo de reparación por categoría ───────────────────
// Costos FIJOS por nivel de daño (no por HP). El sistema los usa como
// techo: calcula cuántos HP puede reparar el jugador con lo que tiene.
//
// Criterio de balanceo:
//   - Basado en el crafteo del vehículo (ver VEHICLE_RECIPES en MeWhenUmm...)
//   - Leve    (~15% del crafteo): solo vanilla, sin DZ ni beans exigentes
//   - Moderado (~30% del crafteo): vanilla + algún DZ básico (duct_tape)
//   - Grave   (~55% del crafteo): vanilla + DZ moderado + beans básicos
//   - Crítico (~80% del crafteo): vanilla + DZ + beans avanzados, nunca ≥ crafteo
//
// Ejemplo PUBG buggy crafteo: 20 hierro + 6 steel + 1 refined_oil + 1 duct_tape + 2 duct_tape
//   leve=15%: 3 hierro.  moderado=30%: 6 hierro + 1 duct_tape.
//   grave=55%: 11 hierro + 1 steel + 1 duct_tape.  critico=80%: 16 hierro + 4 steel + 1 duct_tape + 1 electric_scrap

const REPAIR_COSTS = {
    // ── PUBG — vehículos civiles ──────────────────────────────────
    // Crafteo base (hardtop, el más caro): 24 iron + 8 steel + 1 oil + 3 duct_tape
    // Valores tomados del peor caso (hardtop) para que todas las variantes puedan repararse
    pubg: {
        leve:     { vanilla:{iron_ingot:4},                                      dz:{},                                                  beans:{},                           tools:[{id:'mcpe:screwdriver',wear:3},{id:'mcpe:hammer',wear:2}] },
        moderado: { vanilla:{iron_ingot:8},                                      dz:{'mcpe:duct_tape':1},                                beans:{},                           tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:4}] },
        grave:    { vanilla:{iron_ingot:14},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:5}] },
        critico:  { vanilla:{iron_ingot:20},                                     dz:{'mcpe:duct_tape':2,'mcpe:electric_scrap':1},        beans:{'af:steel_ingot':4},         tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:10},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
    },

    // ── Tierra ligeros — m939 / kamaz / m1151 ────────────────────
    // Crafteo base (m1151): 25 iron + 10 steel + 8 aluminium + 2 oil + 3 electric_scrap + 1 nail_box
    light: {
        leve:     { vanilla:{iron_ingot:4},                                      dz:{},                                                  beans:{},                           tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:3}] },
        moderado: { vanilla:{iron_ingot:8},                                      dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:5}] },
        grave:    { vanilla:{iron_ingot:14},                                     dz:{'mcpe:duct_tape':1,'mcpe:electric_scrap':1},        beans:{'af:steel_ingot':4,'af:aluminium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:10},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:20},                                     dz:{'mcpe:electric_scrap':2,'mcpe:nail_box':1},         beans:{'af:steel_ingot':7,'af:aluminium_ingot':4}, tools:[{id:'mcpe:screwdriver',wear:18},{id:'mcpe:hammer',wear:14},{id:'mcpe:hacksaw',wear:12},{id:'mcpe:wrench',wear:8},{id:'mcpe:pipe_wrench',wear:5}] },
    },

    // ── Blindados medios — BTR-80 / M2A2 / EQ-2050 / 2S38 ───────
    // Crafteo base (m2a2): 35 iron + 18 steel + 12 aluminium + 3 oil + 4 electric_scrap + 2 nail_box
    armored: {
        leve:     { vanilla:{iron_ingot:5},                                      dz:{},                                                  beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:6},{id:'mcpe:hammer',wear:5}] },
        moderado: { vanilla:{iron_ingot:11},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':4,'af:aluminium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:8},{id:'mcpe:hacksaw',wear:7},{id:'mcpe:wrench',wear:4}] },
        grave:    { vanilla:{iron_ingot:20},                                     dz:{'mcpe:electric_scrap':1,'mcpe:nail_box':1},         beans:{'af:steel_ingot':8,'af:aluminium_ingot':5}, tools:[{id:'mcpe:screwdriver',wear:15},{id:'mcpe:hammer',wear:12},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
        critico:  { vanilla:{iron_ingot:28},                                     dz:{'mcpe:electric_scrap':2,'mcpe:nail_box':1},         beans:{'af:steel_ingot':12,'af:aluminium_ingot':8}, tools:[{id:'mcpe:screwdriver',wear:20},{id:'mcpe:hammer',wear:16},{id:'mcpe:hacksaw',wear:14},{id:'mcpe:wrench',wear:10},{id:'mcpe:pipe_wrench',wear:7},{id:'mcpe:crowbar',wear:4}] },
    },

    // ── Artillería — M142 HIMARS / BM-30 ─────────────────────────
    // Crafteo base (bm30): 40 iron + 22 steel + 4 oil + 5 electric_scrap + 1 plastic_explosive
    artillery: {
        leve:     { vanilla:{iron_ingot:6},                                      dz:{},                                                  beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:6},{id:'mcpe:hammer',wear:5}] },
        moderado: { vanilla:{iron_ingot:12},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':5},         tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:8},{id:'mcpe:hacksaw',wear:7},{id:'mcpe:wrench',wear:4}] },
        grave:    { vanilla:{iron_ingot:22},                                     dz:{'mcpe:electric_scrap':1,'mcpe:duct_tape':1},        beans:{'af:steel_ingot':10},        tools:[{id:'mcpe:screwdriver',wear:15},{id:'mcpe:hammer',wear:12},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
        critico:  { vanilla:{iron_ingot:32},                                     dz:{'mcpe:electric_scrap':2,'mcpe:nail_box':1},         beans:{'af:steel_ingot':16},        tools:[{id:'mcpe:screwdriver',wear:20},{id:'mcpe:hammer',wear:16},{id:'mcpe:hacksaw',wear:14},{id:'mcpe:wrench',wear:10},{id:'mcpe:pipe_wrench',wear:7},{id:'mcpe:crowbar',wear:4}] },
    },

    // ── Tanques MBT ───────────────────────────────────────────────
    // Crafteo base (t90m/bmpt72): 50 iron + 32 steel + 10 titanium + 4 oil + 6-7 electric_scrap + 3 nail_box
    // Titanio solo aparece en grave/crítico para que no sea inalcanzable desde el principio
    tank: {
        leve:     { vanilla:{iron_ingot:8},                                      dz:{},                                                  beans:{'af:steel_ingot':4},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:wrench',wear:4}] },
        moderado: { vanilla:{iron_ingot:16},                                     dz:{'mcpe:electric_scrap':1},                           beans:{'af:steel_ingot':10,'af:aluminium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:14},{id:'mcpe:hammer',wear:11},{id:'mcpe:hacksaw',wear:9},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
        grave:    { vanilla:{iron_ingot:28},                                     dz:{'mcpe:electric_scrap':2,'mcpe:nail_box':1},         beans:{'af:steel_ingot':18,'af:titanium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:20},{id:'mcpe:hammer',wear:16},{id:'mcpe:hacksaw',wear:13},{id:'mcpe:wrench',wear:10},{id:'mcpe:pipe_wrench',wear:7},{id:'mcpe:crowbar',wear:4}] },
        critico:  { vanilla:{iron_ingot:40},                                     dz:{'mcpe:electric_scrap':4,'mcpe:nail_box':2},         beans:{'af:steel_ingot':26,'af:titanium_ingot':6}, tools:[{id:'mcpe:screwdriver',wear:25},{id:'mcpe:hammer',wear:20},{id:'mcpe:hacksaw',wear:18},{id:'mcpe:wrench',wear:14},{id:'mcpe:pipe_wrench',wear:10},{id:'mcpe:crowbar',wear:7},{id:'mcpe:can_opener',wear:4}] },
    },

    // ── Drones — MQ-9 / GJ-2 ─────────────────────────────────────
    // Crafteo: 20 iron + 10 steel + 12 aluminium + 8 electric_scrap + 3 duct_tape
    // DZ alto en crafteo (8 electric_scrap) → se introduce lento en reparación
    drone: {
        leve:     { vanilla:{iron_ingot:3},                                      dz:{},                                                  beans:{'af:aluminium_ingot':2},     tools:[{id:'mcpe:screwdriver',wear:4},{id:'mcpe:hammer',wear:3}] },
        moderado: { vanilla:{iron_ingot:6},                                      dz:{'mcpe:duct_tape':1},                                beans:{'af:aluminium_ingot':4,'af:steel_ingot':1}, tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:5}] },
        grave:    { vanilla:{iron_ingot:11},                                     dz:{'mcpe:duct_tape':1,'mcpe:electric_scrap':1},        beans:{'af:aluminium_ingot':7,'af:steel_ingot':3}, tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:9},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:16},                                     dz:{'mcpe:electric_scrap':2,'mcpe:duct_tape':2},        beans:{'af:aluminium_ingot':9,'af:steel_ingot':6}, tools:[{id:'mcpe:screwdriver',wear:18},{id:'mcpe:hammer',wear:14},{id:'mcpe:hacksaw',wear:11},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
    },

    // ── Helicópteros — AH-64 / Mi-24 ─────────────────────────────
    // Crafteo: 35 iron + 18 steel + 20 aluminium + 4 titanium + 3 oil + 6 electric_scrap + 2 duct_tape
    helicopter: {
        leve:     { vanilla:{iron_ingot:5},                                      dz:{},                                                  beans:{'af:aluminium_ingot':3,'af:steel_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:6},{id:'mcpe:hammer',wear:5},{id:'mcpe:wrench',wear:3}] },
        moderado: { vanilla:{iron_ingot:11},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:aluminium_ingot':8,'af:steel_ingot':5}, tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:8},{id:'mcpe:hacksaw',wear:7},{id:'mcpe:wrench',wear:5}] },
        grave:    { vanilla:{iron_ingot:19},                                     dz:{'mcpe:electric_scrap':1,'mcpe:duct_tape':1},        beans:{'af:aluminium_ingot':14,'af:steel_ingot':9,'af:titanium_ingot':1}, tools:[{id:'mcpe:screwdriver',wear:15},{id:'mcpe:hammer',wear:12},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:8},{id:'mcpe:pipe_wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:28},                                     dz:{'mcpe:electric_scrap':3,'mcpe:duct_tape':1},        beans:{'af:aluminium_ingot':18,'af:steel_ingot':13,'af:titanium_ingot':3}, tools:[{id:'mcpe:screwdriver',wear:22},{id:'mcpe:hammer',wear:18},{id:'mcpe:hacksaw',wear:15},{id:'mcpe:wrench',wear:12},{id:'mcpe:pipe_wrench',wear:8},{id:'mcpe:crowbar',wear:5}] },
    },

    // ── Cazas ligeros/medios — F4/MiG21/Su25/A10/F16/F14/MiG29/Yak141/F18 ──
    // Crafteo base (f18): 40 iron + 28 steel + 30 aluminium + 12 titanium + 5 oil + 8 electric_scrap + 3 duct_tape
    fighter: {
        leve:     { vanilla:{iron_ingot:6},                                      dz:{},                                                  beans:{'af:aluminium_ingot':4,'af:steel_ingot':3}, tools:[{id:'mcpe:screwdriver',wear:7},{id:'mcpe:hammer',wear:5},{id:'mcpe:wrench',wear:3}] },
        moderado: { vanilla:{iron_ingot:12},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:aluminium_ingot':10,'af:steel_ingot':8}, tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:9},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
        grave:    { vanilla:{iron_ingot:22},                                     dz:{'mcpe:electric_scrap':2,'mcpe:duct_tape':1},        beans:{'af:aluminium_ingot':18,'af:steel_ingot':14,'af:titanium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:17},{id:'mcpe:hammer',wear:13},{id:'mcpe:hacksaw',wear:11},{id:'mcpe:wrench',wear:8},{id:'mcpe:pipe_wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:32},                                     dz:{'mcpe:electric_scrap':4,'mcpe:duct_tape':2},        beans:{'af:aluminium_ingot':24,'af:steel_ingot':20,'af:titanium_ingot':7}, tools:[{id:'mcpe:screwdriver',wear:23},{id:'mcpe:hammer',wear:18},{id:'mcpe:hacksaw',wear:15},{id:'mcpe:wrench',wear:11},{id:'mcpe:pipe_wrench',wear:8},{id:'mcpe:crowbar',wear:5}] },
    },

    // ── Cazas avanzados / bombarderos — Su33/Su57/F22/F35/J20/B2/Tu160 ───────
    // Crafteo base (b2/tu160): 60 iron + 50 steel + 25 titanium + 8 oil + 13 electric_scrap + 4 duct_tape + 3 plastic_exp
    // Los más caros del juego. Titanio desde moderado porque ya es tier 5 extremo.
    stealth: {
        leve:     { vanilla:{iron_ingot:7},                                      dz:{},                                                  beans:{'af:aluminium_ingot':5,'af:steel_ingot':6}, tools:[{id:'mcpe:screwdriver',wear:9},{id:'mcpe:hammer',wear:7},{id:'mcpe:wrench',wear:5}] },
        moderado: { vanilla:{iron_ingot:16},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:aluminium_ingot':14,'af:steel_ingot':16,'af:titanium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:15},{id:'mcpe:hammer',wear:12},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:8},{id:'mcpe:pipe_wrench',wear:5}] },
        grave:    { vanilla:{iron_ingot:28},                                     dz:{'mcpe:electric_scrap':2,'mcpe:duct_tape':2},        beans:{'af:aluminium_ingot':22,'af:steel_ingot':26,'af:titanium_ingot':9}, tools:[{id:'mcpe:screwdriver',wear:22},{id:'mcpe:hammer',wear:18},{id:'mcpe:hacksaw',wear:15},{id:'mcpe:wrench',wear:12},{id:'mcpe:pipe_wrench',wear:9},{id:'mcpe:crowbar',wear:5}] },
        critico:  { vanilla:{iron_ingot:48},                                     dz:{'mcpe:electric_scrap':5,'mcpe:duct_tape':3},        beans:{'af:aluminium_ingot':28,'af:steel_ingot':38,'af:titanium_ingot':18}, tools:[{id:'mcpe:screwdriver',wear:28},{id:'mcpe:hammer',wear:23},{id:'mcpe:hacksaw',wear:20},{id:'mcpe:wrench',wear:16},{id:'mcpe:pipe_wrench',wear:12},{id:'mcpe:crowbar',wear:8},{id:'mcpe:can_opener',wear:5}] },
    },

    // ── Navales pequeños — strb90h / project03160 / type142a / project1241 / a19 ──
    // Crafteo base (a19/type142a): 45 iron + 24 steel + 14 aluminium + 4 oil + 6 electric_scrap + 2 nail_box
    boat_small: {
        leve:     { vanilla:{iron_ingot:7},                                      dz:{},                                                  beans:{'af:steel_ingot':3},         tools:[{id:'mcpe:screwdriver',wear:6},{id:'mcpe:hammer',wear:5}] },
        moderado: { vanilla:{iron_ingot:14},                                     dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':8,'af:aluminium_ingot':3}, tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:8},{id:'mcpe:hacksaw',wear:7},{id:'mcpe:wrench',wear:4}] },
        grave:    { vanilla:{iron_ingot:25},                                     dz:{'mcpe:electric_scrap':1,'mcpe:nail_box':1},         beans:{'af:steel_ingot':14,'af:aluminium_ingot':7}, tools:[{id:'mcpe:screwdriver',wear:15},{id:'mcpe:hammer',wear:12},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
        critico:  { vanilla:{iron_ingot:36},                                     dz:{'mcpe:electric_scrap':3,'mcpe:nail_box':1},         beans:{'af:steel_ingot':19,'af:aluminium_ingot':10}, tools:[{id:'mcpe:screwdriver',wear:22},{id:'mcpe:hammer',wear:17},{id:'mcpe:hacksaw',wear:14},{id:'mcpe:wrench',wear:10},{id:'mcpe:pipe_wrench',wear:7},{id:'mcpe:crowbar',wear:4}] },
    },

    // ── Navales grandes — submarino (project677) / portaaviones (16ddh / type075) ──
    // Crafteo base (16ddh/type075): 80 iron + 60 steel + 20 titanium + 8 oil + 13 electric_scrap + 5 nail_box + 2 plastic_exp
    boat_large: {
        leve:     { vanilla:{iron_ingot:12},                                     dz:{},                                                  beans:{'af:steel_ingot':8},         tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:8},{id:'mcpe:wrench',wear:6}] },
        moderado: { vanilla:{iron_ingot:24},                                     dz:{'mcpe:electric_scrap':1},                           beans:{'af:steel_ingot':20,'af:titanium_ingot':1}, tools:[{id:'mcpe:screwdriver',wear:16},{id:'mcpe:hammer',wear:13},{id:'mcpe:hacksaw',wear:11},{id:'mcpe:wrench',wear:9},{id:'mcpe:pipe_wrench',wear:6}] },
        grave:    { vanilla:{iron_ingot:44},                                     dz:{'mcpe:electric_scrap':3,'mcpe:nail_box':1},         beans:{'af:steel_ingot':38,'af:titanium_ingot':6}, tools:[{id:'mcpe:screwdriver',wear:22},{id:'mcpe:hammer',wear:18},{id:'mcpe:hacksaw',wear:15},{id:'mcpe:wrench',wear:12},{id:'mcpe:pipe_wrench',wear:9},{id:'mcpe:crowbar',wear:6}] },
        critico:  { vanilla:{iron_ingot:64},                                     dz:{'mcpe:electric_scrap':6,'mcpe:nail_box':3},         beans:{'af:steel_ingot':50,'af:titanium_ingot':14}, tools:[{id:'mcpe:screwdriver',wear:28},{id:'mcpe:hammer',wear:23},{id:'mcpe:hacksaw',wear:20},{id:'mcpe:wrench',wear:16},{id:'mcpe:pipe_wrench',wear:12},{id:'mcpe:crowbar',wear:9},{id:'mcpe:can_opener',wear:6}] },
    },

    // ── Artillería remolcada — D-20 Petrov / M114 Locum ──────────
    // Crafteo equivalente: ~20 iron + 10 steel + 5 aluminium + 2 oil + 2 electric_scrap
    // Entidades de artillería pesada pero sin motor → más baratas que un tanque
    artillery_towed: {
        leve:     { vanilla:{iron_ingot:3},                                      dz:{},                                                  beans:{'af:steel_ingot':1},         tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:4}] },
        moderado: { vanilla:{iron_ingot:6},                                      dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':3},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:5}] },
        grave:    { vanilla:{iron_ingot:11},                                     dz:{'mcpe:duct_tape':1,'mcpe:electric_scrap':1},        beans:{'af:steel_ingot':5,'af:aluminium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:10},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:16},                                     dz:{'mcpe:electric_scrap':1,'mcpe:nail_box':1},         beans:{'af:steel_ingot':8,'af:aluminium_ingot':4}, tools:[{id:'mcpe:screwdriver',wear:18},{id:'mcpe:hammer',wear:14},{id:'mcpe:hacksaw',wear:10},{id:'mcpe:wrench',wear:7}] },
    },

    // ── Ametralladora montada — Mounted Gun ───────────────────────
    // Estructura simple, sin blindaje → reparación barata
    mounted_gun_cat: {
        leve:     { vanilla:{iron_ingot:2},                                      dz:{},                                                  beans:{},                           tools:[{id:'mcpe:screwdriver',wear:3},{id:'mcpe:hammer',wear:2}] },
        moderado: { vanilla:{iron_ingot:4},                                      dz:{'mcpe:duct_tape':1},                                beans:{},                           tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:4}] },
        grave:    { vanilla:{iron_ingot:7},                                      dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':1},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:5}] },
        critico:  { vanilla:{iron_ingot:10},                                     dz:{'mcpe:electric_scrap':1},                           beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:9},{id:'mcpe:hacksaw',wear:7},{id:'mcpe:wrench',wear:4}] },
    },

    // ── Defensa estática — C-RAM / NASAMS / AK-630 / SAM Turret ──
    // Sistemas de defensa aérea, más complejos que una simple torreta
    static_defense: {
        leve:     { vanilla:{iron_ingot:3},                                      dz:{},                                                  beans:{'af:steel_ingot':1},         tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:4}] },
        moderado: { vanilla:{iron_ingot:6},                                      dz:{'mcpe:electric_scrap':1},                           beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:8},{id:'mcpe:hammer',wear:6},{id:'mcpe:hacksaw',wear:6}] },
        grave:    { vanilla:{iron_ingot:11},                                     dz:{'mcpe:electric_scrap':1,'mcpe:nail_box':1},         beans:{'af:steel_ingot':4,'af:aluminium_ingot':1}, tools:[{id:'mcpe:screwdriver',wear:12},{id:'mcpe:hammer',wear:9},{id:'mcpe:hacksaw',wear:8},{id:'mcpe:wrench',wear:5}] },
        critico:  { vanilla:{iron_ingot:16},                                     dz:{'mcpe:electric_scrap':2,'mcpe:nail_box':1},         beans:{'af:steel_ingot':6,'af:aluminium_ingot':2}, tools:[{id:'mcpe:screwdriver',wear:18},{id:'mcpe:hammer',wear:14},{id:'mcpe:hacksaw',wear:11},{id:'mcpe:wrench',wear:7},{id:'mcpe:pipe_wrench',wear:4}] },
    },

    // ── Centinelas — BM-3 / SGRA-1 ──────────────────────────────
    // Sentry bots ligeros, fáciles de reparar
    sentry: {
        leve:     { vanilla:{iron_ingot:2},                                      dz:{},                                                  beans:{},                           tools:[{id:'mcpe:screwdriver',wear:3},{id:'mcpe:hammer',wear:2}] },
        moderado: { vanilla:{iron_ingot:4},                                      dz:{'mcpe:duct_tape':1},                                beans:{},                           tools:[{id:'mcpe:screwdriver',wear:5},{id:'mcpe:hammer',wear:4}] },
        grave:    { vanilla:{iron_ingot:6},                                      dz:{'mcpe:duct_tape':1},                                beans:{'af:steel_ingot':1},         tools:[{id:'mcpe:screwdriver',wear:7},{id:'mcpe:hammer',wear:5},{id:'mcpe:hacksaw',wear:4}] },
        critico:  { vanilla:{iron_ingot:9},                                      dz:{'mcpe:electric_scrap':1},                           beans:{'af:steel_ingot':2},         tools:[{id:'mcpe:screwdriver',wear:10},{id:'mcpe:hammer',wear:7},{id:'mcpe:hacksaw',wear:6},{id:'mcpe:wrench',wear:3}] },
    },
};

// ── Nombres legibles ──────────────────────────────────────────────
const ITEM_NAMES = {
    es: {
        iron_ingot:'Lingote de Hierro', coal:'Carbon', gold_ingot:'Lingote de Oro',
        diamond:'Diamante', redstone:'Redstone', copper_ingot:'Lingote de Cobre',
        gunpowder:'Polvora', glass:'Vidrio', lapis_lazuli:'Lapislazuli',
        'mcpe:duct_tape':'Cinta Adhesiva', 'mcpe:electric_scrap':'Chatarra Electrica',
        'mcpe:nail_box':'Caja de Clavos', 'mcpe:sawoff_pipe':'Tubo Recortado',
        'mcpe:barbed_wire':'Alambre de Puas', 'mcpe:detonator':'Detonador',
        'mcpe:plastic_explosive':'Explosivo Plastico',
        'mcpe:screwdriver':'Destornillador','mcpe:hammer':'Martillo',
        'mcpe:hacksaw':'Sierra de Mano','mcpe:wrench':'Llave Inglesa',
        'mcpe:pipe_wrench':'Llave de Tubo','mcpe:crowbar':'Palanca',
        'mcpe:can_opener':'Abrelatas',
        'af:steel_ingot':'Acero','af:aluminium_ingot':'Aluminio',
        'af:titanium_ingot':'Titanio','af:refined_oil_bucket':'Combustible',
    },
    en: {
        iron_ingot:'Iron Ingot', coal:'Coal', gold_ingot:'Gold Ingot',
        diamond:'Diamond', redstone:'Redstone', copper_ingot:'Copper Ingot',
        gunpowder:'Gunpowder', glass:'Glass', lapis_lazuli:'Lapis Lazuli',
        'mcpe:duct_tape':'Duct Tape', 'mcpe:electric_scrap':'Electric Scrap',
        'mcpe:nail_box':'Nail Box', 'mcpe:sawoff_pipe':'Sawoff Pipe',
        'mcpe:barbed_wire':'Barbed Wire', 'mcpe:detonator':'Detonator',
        'mcpe:plastic_explosive':'Plastic Explosive',
        'mcpe:screwdriver':'Screwdriver','mcpe:hammer':'Hammer',
        'mcpe:hacksaw':'Hacksaw','mcpe:wrench':'Wrench',
        'mcpe:pipe_wrench':'Pipe Wrench','mcpe:crowbar':'Crowbar',
        'mcpe:can_opener':'Can Opener',
        'af:steel_ingot':'Steel','af:aluminium_ingot':'Aluminium',
        'af:titanium_ingot':'Titanium','af:refined_oil_bucket':'Refined Fuel',
    },
};
function pretty(id, lang = 'es') {
    const names = ITEM_NAMES[lang] ?? ITEM_NAMES.es;
    if (names[id]) return names[id];
    const bare = id.includes(':') ? id.split(':')[1] : id;
    return bare.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// ── Helpers de inventario ─────────────────────────────────────────
function countItem(player, itemId) {
    const nid = normalizeId(itemId);
    let total = 0;
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) return 0;
        for (let i = 0; i < inv.size; i++) {
            const slot = inv.getItem(i);
            if (slot && slot.typeId === nid) total += slot.amount;
        }
    } catch {}
    return total;
}

function removeItem(player, itemId, qty) {
    const nid = normalizeId(itemId);
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) return;
        let remaining = qty;
        for (let i = 0; i < inv.size && remaining > 0; i++) {
            const slot = inv.getItem(i);
            if (!slot || slot.typeId !== nid) continue;
            if (slot.amount <= remaining) {
                remaining -= slot.amount;
                inv.setItem(i, undefined);
            } else {
                slot.amount -= remaining;
                inv.setItem(i, slot);
                remaining = 0;
            }
        }
    } catch {}
}

function findToolSlot(player, toolId, minWear) {
    const nid = normalizeId(toolId);
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) return null;
        for (let i = 0; i < inv.size; i++) {
            const slot = inv.getItem(i);
            if (!slot || slot.typeId !== nid) continue;
            const dur = slot.getComponent('minecraft:durability');
            if (!dur) continue;
            if ((dur.maxDurability - dur.damage) >= minWear) return { slot: i, item: slot, dur };
        }
    } catch {}
    return null;
}

function applyToolWear(player, toolId, wear) {
    const nid = normalizeId(toolId);
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) return;
        for (let i = 0; i < inv.size; i++) {
            const slot = inv.getItem(i);
            if (!slot || slot.typeId !== nid) continue;
            const dur = slot.getComponent('minecraft:durability');
            if (!dur) continue;
            const remaining = dur.maxDurability - dur.damage;
            if (remaining >= wear) {
                dur.damage += wear;
                inv.setItem(i, slot);
                return;
            }
        }
    } catch {}
}

// También desgasta la af:wrench del jugador al reparar
function wearWrench(player, wear) {
    applyToolWear(player, 'af:wrench', wear);
}

// ── Lógica principal de cálculo ───────────────────────────────────
/**
 * Dado el estado actual del vehículo, calcula:
 * - El nivel de daño (leve/moderado/grave/critico)
 * - Cuántos HP se pueden reparar con los materiales disponibles (Opción A)
 *   El costo es FIJO por nivel. Si el jugador tiene todos los materiales,
 *   repara los HP que corresponden a ese nivel. Si le falta algo, no repara nada.
 *   El sistema escala el costo si el daño está entre niveles: si tiene 40% de daño
 *   (nivel moderado) pero solo materiales para leve, repara la porción de leve (25%).
 *
 * @param {Player} player
 * @param {Entity} vehicle
 * @returns {{ hpMax, hpCurrent, hpMissing, damagePct, level, hpToRepair, cost, costTable, canRepairAny }}
 */
function calcRepair(player, vehicle) {
    const typeId = vehicle.typeId;
    const cat = VEHICLE_CATEGORY[typeId];
    if (!cat) return null;

    const hpComp = vehicle.getComponent('minecraft:health');
    if (!hpComp) return null;

    const hpMax     = hpComp.value ?? MAX_HP[cat];
    const hpCurrent = hpComp.currentValue;
    const hpMissing = hpMax - hpCurrent;
    if (hpMissing <= 0) return { hpMax, hpCurrent, hpMissing: 0, damagePct: 0, level: 'leve', hpToRepair: 0, cost: null, costTable: null, canRepairAny: false };

    const damagePct = (hpMissing / hpMax) * 100;
    let level;
    if (damagePct <= 25)      level = 'leve';
    else if (damagePct <= 50) level = 'moderado';
    else if (damagePct <= 75) level = 'grave';
    else                       level = 'critico';

    const costTable = REPAIR_COSTS[cat][level];

    // Verificar si el jugador tiene suficientes materiales para reparar al 100% del nivel
    const allMats = { ...costTable.vanilla, ...costTable.dz, ...costTable.beans };
    let canAffordFull = true;
    for (const [id, qty] of Object.entries(allMats)) {
        if (qty <= 0) continue;
        if (countItem(player, id) < qty) { canAffordFull = false; break; }
    }
    // Verificar herramientas
    if (canAffordFull) {
        for (const tool of costTable.tools) {
            if (!findToolSlot(player, tool.id, tool.wear)) { canAffordFull = false; break; }
        }
    }

    let hpToRepair = 0;
    let realCost = {};

    if (canAffordFull) {
        // Repara todos los HP que faltan en este nivel
        hpToRepair = hpMissing;
        realCost   = { ...allMats };
    } else {
        // Intenta con el nivel inferior (escalera de niveles)
        const levelOrder = ['leve', 'moderado', 'grave', 'critico'];
        const levelIdx   = levelOrder.indexOf(level);
        for (let i = levelIdx - 1; i >= 0; i--) {
            const fallbackTable = REPAIR_COSTS[cat][levelOrder[i]];
            const fallbackMats  = { ...fallbackTable.vanilla, ...fallbackTable.dz, ...fallbackTable.beans };
            let canAffordFallback = true;
            for (const [id, qty] of Object.entries(fallbackMats)) {
                if (qty <= 0) continue;
                if (countItem(player, id) < qty) { canAffordFallback = false; break; }
            }
            if (canAffordFallback) {
                for (const tool of fallbackTable.tools) {
                    if (!findToolSlot(player, tool.id, tool.wear)) { canAffordFallback = false; break; }
                }
            }
            if (canAffordFallback) {
                // Repara el % correspondiente al nivel fallback (ej: leve = 25% del hpMax)
                const repairPcts = { leve: 0.25, moderado: 0.50, grave: 0.75, critico: 1.0 };
                hpToRepair = Math.min(hpMissing, Math.floor(hpMax * repairPcts[levelOrder[i]]));
                realCost   = { ...fallbackMats };
                // costTable para mostrar herramientas correcto
                return { hpMax, hpCurrent, hpMissing, damagePct, level, hpToRepair, cost: realCost, costTable: fallbackTable, canRepairAny: true };
            }
        }
    }

    return { hpMax, hpCurrent, hpMissing, damagePct, level, hpToRepair, cost: realCost, costTable, canRepairAny: hpToRepair > 0 };
}

// ── Construcción del texto de la UI ──────────────────────────────
const LEVEL_COLORS = { leve: '§a', moderado: '§e', grave: '§6', critico: '§c' };
const LEVEL_KEYS   = { leve: 'levelLeve', moderado: 'levelModerado', grave: 'levelGrave', critico: 'levelCritico' };

function buildRepairUI(player, vehicle, info) {
    const lang = getPlayerLanguage(player);
    const { hpMax, hpCurrent, hpMissing, damagePct, level, hpToRepair, cost, costTable, canRepairAny } = info;
    const lc = LEVEL_COLORS[level];
    const ln = tr(player, LEVEL_KEYS[level]);

    const hpBar = buildHpBar(hpCurrent, hpMax);
    let body = `§´`;   // texto pequeño para toda la UI
    body += `${tr(player, 'statusHeader')}\n`;
    body += `${tr(player, 'hp')} §f${hpCurrent.toFixed(1)} ${tr(player, 'separator')} §f${hpMax}  ${hpBar}\n`;
    body += `${tr(player, 'damageLabel')} ${lc}${damagePct.toFixed(1)}% §7(${ln})\n\n`;

    if (hpMissing <= 0) {
        body += tr(player, 'fullHealth');
        return { body, canRepair: false };
    }

    body += `${tr(player, 'materialsHeader')} §f${canRepairAny ? hpToRepair : hpMissing} ${tr(player, 'hpLabel')}§r\n`;

    if (!costTable) {
        body += `\n${tr(player, 'noMaterials')}`;
        return { body, canRepair: false };
    }

    const allMats = { ...costTable.vanilla, ...costTable.dz, ...costTable.beans };
    for (const [id, needed] of Object.entries(allMats)) {
        if (needed <= 0) continue;
        const have = countItem(player, id);
        const ok   = have >= needed;
        const ind  = ok ? tr(player, 'statusOk') : `§c[${have}/${needed}]`;
        body += `§7- ${needed}x ${pretty(id, lang)}  ${ind}§r\n`;
    }

    body += `\n${tr(player, 'toolsHeader')}\n`;
    for (const tool of costTable.tools) {
        const found = findToolSlot(player, tool.id, tool.wear);
        const ind   = found ? tr(player, 'statusOk') : tr(player, 'statusMissing');
        body += `§7- ${pretty(tool.id, lang)} §7(-${tool.wear} dur)  ${ind}§r\n`;
    }
    const hasWrench = findToolSlot(player, 'af:wrench', 1);
    body += `§7- ${pretty('mcpe:wrench', lang)} (af:wrench) ${hasWrench ? tr(player, 'statusOk') : tr(player, 'statusMissing')}§r\n`;

    if (!canRepairAny) {
        body += `\n${tr(player, 'noMaterials')}`;
    } else {
        body += `\n${tr(player, 'willRepair', { hp: hpToRepair })}`;
    }

    return { body, canRepair: canRepairAny };
}

function buildHpBar(current, max) {
    const pct = current / max;
    const filled = Math.round(pct * 10);
    const bar = '|'.repeat(filled) + '§7' + '|'.repeat(10 - filled);
    const color = pct > 0.6 ? '§a' : pct > 0.3 ? '§e' : '§c';
    return `${color}[${bar}§r${color}]`;
}

// ── Ejecutar la reparación ────────────────────────────────────────
function executeRepair(player, vehicle, info) {
    const { hpToRepair, cost, costTable, level } = info;

    // Consumir materiales
    for (const [id, qty] of Object.entries(cost)) {
        removeItem(player, id, qty);
    }

    // Aplicar desgaste en herramientas
    for (const tool of costTable.tools) {
        applyToolWear(player, tool.id, tool.wear);
    }

    // Desgaste de la af:wrench — escala por nivel de daño, no por HP absolutos
    const wrenchWearByLevel = { leve: 3, moderado: 6, critico: 12, grave: 10 };
    const wrenchWear = wrenchWearByLevel[level] ?? 5;
    wearWrench(player, wrenchWear);

    // Curar el vehículo
    try {
        const hpComp = vehicle.getComponent('minecraft:health');
        if (hpComp) {
            hpComp.setCurrentValue(Math.min(info.hpMax, hpComp.currentValue + hpToRepair));
        }
    } catch {
        // Fallback via comando si el componente falla
        vehicle.runCommandAsync(`effect @s regeneration 1 255 true`);
    }

    player.sendMessage(tr(player, 'repairSuccess', { hp: hpToRepair, vehicle: vehicle.typeId.split(':')[1] }));
    player.playSound('random.anvil_use', { pitch: 1.2, volume: 0.8 });
}

// ── Mostrar UI de reparación ──────────────────────────────────────
function showRepairUI(player, vehicle) {
    system.run(() => {
        const info = calcRepair(player, vehicle);
        if (!info) {
            player.sendMessage(tr(player, 'notRepairable'));
            return;
        }
        if (info.hpMissing <= 0) {
            player.sendMessage(tr(player, 'alreadyFull'));
            return;
        }

        const { body, canRepair } = buildRepairUI(player, vehicle, info);

        const form = new ActionFormData()
            .title(tr(player, 'title'))
            .body(body);

        if (canRepair) {
            form.button(tr(player, 'btnRepair'), 'textures/items/wrench');
        } else {
            form.button(tr(player, 'btnNoMaterials'));
        }
        form.button(tr(player, 'btnClose'));

        form.show(player).then(res => {
            if (res.canceled) return;
            // Botón 0 = Reparar (si canRepair) o Sin materiales (si no puede) → ambos cierran
            // Botón 1 = Cerrar
            if (!canRepair || res.selection !== 0) return;

            // Recalcular en el momento de confirmar (inventario puede haber cambiado)
            const freshInfo = calcRepair(player, vehicle);
            if (!freshInfo || !freshInfo.canRepairAny) {
                player.sendMessage(tr(player, 'notEnoughConfirm'));
                return;
            }
            executeRepair(player, vehicle, freshInfo);
        }).catch(() => {});
    });
}

// ═══════════════════════════════════════════════════════════════════
//  REGISTRO DEL EVENTO
// ═══════════════════════════════════════════════════════════════════
const KNOWN_VEHICLES = new Set(Object.keys(VEHICLE_CATEGORY));

// Entidades donde la llave inglesa ya tiene función nativa (rotar/ajustar)
// → el menú de reparación solo se abre si el jugador está agachado (sneak)
const SNEAK_ONLY_REPAIR = new Set(['af:d20', 'af:m114']);

const REPAIR_COOLDOWN = new Map(); // playerId -> lastRepairTick

world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    const { player, target: vehicle } = ev;

    // Solo si tiene af:wrench en la mano
    const heldItem = player.getComponent('minecraft:equippable')
        ?.getEquipment('Mainhand');
    if (!heldItem || heldItem.typeId !== 'af:wrench') return;

    // Solo vehículos conocidos
    if (!KNOWN_VEHICLES.has(vehicle.typeId)) return;

    // Para D-20 y M114: solo abrir reparación si está agachado (sneak)
    // Si no está agachado, deja pasar la interacción vanilla (rotar/ajustar)
    if (SNEAK_ONLY_REPAIR.has(vehicle.typeId) && !player.isSneaking) return;

    // Cancelar interacción vanilla
    ev.cancel = true;

    // Cooldown anti-spam
    const now = system.currentTick;
    const last = REPAIR_COOLDOWN.get(player.id) ?? 0;
    if (now - last < 10) return;
    REPAIR_COOLDOWN.set(player.id, now);

    showRepairUI(player, vehicle);
});

// Limpiar cooldowns de jugadores desconectados
world.afterEvents.playerLeave.subscribe(ev => {
    REPAIR_COOLDOWN.delete(ev.playerId);
});
