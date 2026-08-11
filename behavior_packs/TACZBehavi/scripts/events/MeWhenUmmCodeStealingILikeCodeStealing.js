import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { buildRecipe, describeRecipe, executeCraft, t } from '../global/craftingEconomy';

// ── Recetas armas (vanilla + DeadZone) ───────────────────────────────────────
const RECIPES = {
    g17:     buildRecipe(1, { iron_ingot: 70, coal: 30 }),
    m1911:   buildRecipe(1, { iron_ingot: 65, log: 8 }),
    p320:    buildRecipe(1, { iron_ingot: 70, gold_ingot: 8 }),
    b93:     buildRecipe(1, { iron_ingot: 60, log: 8, lapis_lazuli: 6 }),
    uzi:     buildRecipe(1, { iron_ingot: 80, coal: 20 }),
    g18:     buildRecipe(1, { iron_ingot: 55, coal: 20 }),
    db:      buildRecipe(1, { iron_ingot: 45, log: 20 }),
    deagle:  buildRecipe(2, { iron_ingot: 90, gold_ingot: 15, diamond: 4 }),
    mp5:     buildRecipe(2, { iron_ingot: 85, lapis_lazuli: 8 }),
    vector:  buildRecipe(2, { iron_ingot: 90, gold_ingot: 10, lapis_lazuli: 10 }),
    p90:     buildRecipe(2, { iron_ingot: 95, gold_ingot: 10, diamond: 2 }),
    m16a1:   buildRecipe(2, { iron_ingot: 90, lapis_lazuli: 10, log: 14 }),
    m16:     buildRecipe(2, { iron_ingot: 95, lapis_lazuli: 12, log: 14 }),
    m870:    buildRecipe(2, { iron_ingot: 70, log: 25 }),
    mp7:     buildRecipe(2, { iron_ingot: 90, gold_ingot: 12, diamond: 2 }),
    deagleg: buildRecipe(2, { iron_ingot: 90, gold_ingot: 28, diamond: 4 }),
    ump:     buildRecipe(2, { iron_ingot: 95, gold_ingot: 10 }),
    t50:     buildRecipe(2, { iron_ingot: 85, gold_ingot: 12, diamond: 2 }),
    cp:      buildRecipe(2, { iron_ingot: 80, gold_ingot: 12, lapis_lazuli: 5 }),
    hk416:   buildRecipe(3, { iron_ingot: 90, gold_ingot: 18, diamond: 3 }),
    g3:      buildRecipe(3, { iron_ingot: 100, gold_ingot: 14 }),
    aa12:    buildRecipe(3, { iron_ingot: 90, diamond: 10, gold_ingot: 14 }),
    akm:     buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 12, log: 16 }),
    m4a1:    buildRecipe(3, { iron_ingot: 100, gold_ingot: 16, diamond: 4 }),
    g36:     buildRecipe(3, { iron_ingot: 90, log: 18 }),
    saiga12: buildRecipe(3, { iron_ingot: 70, lapis_lazuli: 4 }),
    qbz95:   buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 12, log: 14 }),
    sks:     buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 14, log: 20 }),
    qbz191:  buildRecipe(3, { iron_ingot: 100, lapis_lazuli: 16, gold_ingot: 10 }),
    type81:  buildRecipe(3, { iron_ingot: 90, log: 16, gold_ingot: 6 }),
    m1014:   buildRecipe(3, { iron_ingot: 95, gold_ingot: 14, diamond: 2, lapis_lazuli: 4 }),
    scarh:   buildRecipe(4, { iron_ingot: 150, gold_ingot: 32, diamond: 6 }),
    scarl:   buildRecipe(4, { iron_ingot: 120, gold_ingot: 25, diamond: 4 }),
    fal:     buildRecipe(4, { iron_ingot: 130, gold_ingot: 28, diamond: 5 }),
    mk14:    buildRecipe(4, { iron_ingot: 120, gold_ingot: 35, diamond: 6 }),
    evolys:  buildRecipe(5, { iron_ingot: 200, gold_ingot: 32, diamond: 8 }),
    m249:    buildRecipe(5, { iron_ingot: 200, gold_ingot: 35, diamond: 8 }),
    awp:     buildRecipe(5, { iron_ingot: 300, gold_ingot: 60, diamond: 15 }),
    minigun: buildRecipe(5, { iron_ingot: 500, gold_ingot: 80, diamond: 40 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 3, 'mcpe:detonator': 2, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    rpg:     buildRecipe(5, { iron_ingot: 100, gold_ingot: 60, diamond: 20, log: 20 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:plastic_explosive': 2, 'mcpe:nail_box': 2, 'mcpe:detonator': 2, 'mcpe:duct_tape': 2 } }),
    // Ganzúas + Bloqueador (en sección Herramientas)
    // Bloqueador: x2 acero + x1 cinta adhesiva (sin barbed_wire, spray, electric_scrap)
    bloqueador: buildRecipe(1, { 'af:steel_ingot': 2 },
        { dz: { 'mcpe:duct_tape': 1 } }),
    // Ganzúa 1: x2 aluminio + x16 carbón + x1 caja de clavos
    ganzua1:    buildRecipe(1, { 'af:aluminium_ingot': 2, coal: 16 },
        { dz: { 'mcpe:nail_box': 1 } }),
    // Ganzúa 2: x4 aluminio + x32 carbón + x1 caja de clavos
    ganzua2:    buildRecipe(1, { 'af:aluminium_ingot': 4, coal: 32 },
        { dz: { 'mcpe:nail_box': 1 } }),
    // Ganzúa 3: x6 aluminio + x5 oro + x1 caja de clavos + x64 carbón
    ganzua3:    buildRecipe(1, { 'af:aluminium_ingot': 6, gold_ingot: 5, coal: 64 },
        { dz: { 'mcpe:nail_box': 1 } }),
};

// ── Recetas equipos de vehículo (vanilla + DeadZone + Bean's AF materials) ───
// Basadas en los crafteos originales del mod, rebalanceadas para este sistema
const VEHICLE_EQUIP_RECIPES = {
    // wrench: 12x iron_ingot + 8x iron_nugget + 2x nail_box
    af_wrench:      buildRecipe(1, { iron_ingot: 12, iron_nugget: 8 },
        { dz: { 'mcpe:nail_box': 2 } }),
    // throttle: acelerador — swap 3x electric_scrap -> 2x nail_box
    af_throttle:    buildRecipe(2, { iron_ingot: 8, iron_nugget: 6, redstone: 4, 'af:aluminium_ingot': 3 },
        { dz: { 'mcpe:nail_box': 2, 'mcpe:duct_tape': 1 } }),
    // rangefinder: x2 electric_scrap -> x1 electric_scrap
    af_rangefinder: buildRecipe(2, { iron_ingot: 4, redstone: 3, 'af:aluminium_ingot': 4 },
        { dz: { 'mcpe:electric_scrap': 1 } }),
    // vehicle_periscope: sin cambio en DZ (solo tenía duct_tape)
    af_periscope:   buildRecipe(2, { glass: 4, 'af:aluminium_ingot': 5 },
        { dz: { 'mcpe:duct_tape': 1 } }),
    // autopilot: 4x electric_scrap -> 4x nail_box, 2x duct_tape -> 1x duct_tape
    af_autopilot:   buildRecipe(2, { iron_ingot: 10, redstone: 6, 'af:steel_ingot': 3 },
        { dz: { 'mcpe:nail_box': 4, 'mcpe:duct_tape': 1 } }),
    // mq9_remote: 6x electric_scrap -> 1x electric_scrap
    af_mq9_remote:  buildRecipe(3, { iron_ingot: 8, redstone: 6, 'af:steel_ingot': 4, 'af:aluminium_ingot': 3 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 2 } }),
    // gj2_remote: 6x electric_scrap -> 1x electric_scrap
    af_gj2_remote:  buildRecipe(3, { iron_ingot: 8, redstone: 6, 'af:steel_ingot': 4, 'af:aluminium_ingot': 3 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 2 } }),
    // uav_remote: 5x electric_scrap -> 1x electric_scrap
    af_uav_remote:  buildRecipe(3, { iron_ingot: 6, redstone: 5, 'af:aluminium_ingot': 4 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 2 } }),
    // handheld oil drill: 4x electric_scrap -> 2x electric_scrap
    af_oil_drill:   buildRecipe(2, { iron_ingot: 16, diamond: 2, 'af:steel_ingot': 4 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:sawoff_pipe': 2 } }),
};

// ── Recetas vehículos Bean's AF ───────────────────────────────────────────────
// Tier asignado por potencia del vehículo. Recetas basadas en los originales del mod
// (steel/aluminium/titanium + vanilla) rebalanceadas con DeadZone.
const VEHICLE_RECIPES = {
    // ── Tierra ligeros (Tier 3) ───────────────────────────────────────────────
    af_m939:        buildRecipe(3, { iron_ingot: 30, 'af:steel_ingot': 8, 'af:aluminium_ingot': 6, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:duct_tape': 2 } }),
    af_kamaz65224:  buildRecipe(3, { iron_ingot: 30, 'af:steel_ingot': 8, 'af:aluminium_ingot': 6, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:duct_tape': 2 } }),
    af_m1151:       buildRecipe(3, { iron_ingot: 25, 'af:steel_ingot': 10, 'af:aluminium_ingot': 8, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:nail_box': 1 } }),
    // ── Tierra blindados medios (Tier 4) ─────────────────────────────────────
    af_btr80:       buildRecipe(4, { iron_ingot: 30, 'af:steel_ingot': 16, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:nail_box': 2, 'mcpe:duct_tape': 1 } }),
    af_m2a2:        buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 18, 'af:aluminium_ingot': 12, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:nail_box': 2 } }),
    af_eq2050:      buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 18, 'af:aluminium_ingot': 12, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:nail_box': 2 } }),
    // ── Artillería / cohetes (Tier 4) ─────────────────────────────────────────
    af_m142:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 20, 'af:aluminium_ingot': 8, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:plastic_explosive': 1 } }),
    af_bm30:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 22, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:plastic_explosive': 1 } }),
    // ── Tanques ligeros (Tier 4) ──────────────────────────────────────────────
    af_m551:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 20, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:nail_box': 2 } }),
    af_type16:      buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 22, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 2 } }),
    af_t72a:        buildRecipe(4, { iron_ingot: 45, 'af:steel_ingot': 24, 'af:aluminium_ingot': 8, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 3 } }),
    // ── Tanques pesados / MBT (Tier 5) ───────────────────────────────────────
    af_leopard2a4:  buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 30, 'af:titanium_ingot': 8, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 3 } }),
    af_m1a1:        buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 30, 'af:titanium_ingot': 8, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 3 } }),
    af_t90m:        buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 32, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 3 } }),
    af_bmpt72:      buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 32, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 7, 'mcpe:nail_box': 3, 'mcpe:plastic_explosive': 1 } }),
    af_2s38:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 22, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 2 } }),
};

// ── Vehículos aéreos Bean's AF ─────────────────────────────────────────────────
const AIR_VEHICLE_RECIPES = {
    // drones (Tier 3)
    af_mq9:    buildRecipe(3, { iron_ingot: 20, 'af:steel_ingot': 10, 'af:aluminium_ingot': 12 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    af_gj2:    buildRecipe(3, { iron_ingot: 20, 'af:steel_ingot': 10, 'af:aluminium_ingot': 12 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    // helicópteros (Tier 4)
    af_ah64:   buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 18, 'af:aluminium_ingot': 20, 'af:titanium_ingot': 4, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:duct_tape': 2 } }),
    af_mi24:   buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 18, 'af:aluminium_ingot': 20, 'af:titanium_ingot': 4, 'af:refined_oil_bucket': 3 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:duct_tape': 2 } }),
    // cazas ligeros (Tier 4)
    af_f4:     buildRecipe(4, { iron_ingot: 30, 'af:steel_ingot': 20, 'af:aluminium_ingot': 25, 'af:titanium_ingot': 5, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:duct_tape': 2 } }),
    af_mig21:  buildRecipe(4, { iron_ingot: 30, 'af:steel_ingot': 20, 'af:aluminium_ingot': 25, 'af:titanium_ingot': 5, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:duct_tape': 2 } }),
    af_su25:   buildRecipe(4, { iron_ingot: 30, 'af:steel_ingot': 22, 'af:aluminium_ingot': 20, 'af:titanium_ingot': 6, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:plastic_explosive': 1 } }),
    af_a10:    buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 22, 'af:aluminium_ingot': 20, 'af:titanium_ingot': 6, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:plastic_explosive': 1 } }),
    // cazas medios (Tier 5)
    af_f16:    buildRecipe(5, { iron_ingot: 40, 'af:steel_ingot': 28, 'af:aluminium_ingot': 30, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 5 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    af_f14:    buildRecipe(5, { iron_ingot: 40, 'af:steel_ingot': 28, 'af:aluminium_ingot': 30, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 5 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    af_mig29:  buildRecipe(5, { iron_ingot: 40, 'af:steel_ingot': 28, 'af:aluminium_ingot': 30, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 5 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    af_yak141: buildRecipe(5, { iron_ingot: 40, 'af:steel_ingot': 28, 'af:aluminium_ingot': 30, 'af:titanium_ingot': 10, 'af:refined_oil_bucket': 5 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    af_f18:    buildRecipe(5, { iron_ingot: 40, 'af:steel_ingot': 28, 'af:aluminium_ingot': 30, 'af:titanium_ingot': 12, 'af:refined_oil_bucket': 5 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:duct_tape': 3 } }),
    // cazas avanzados (Tier 5)
    af_su33:   buildRecipe(5, { iron_ingot: 45, 'af:steel_ingot': 32, 'af:aluminium_ingot': 35, 'af:titanium_ingot': 14, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    af_su57:   buildRecipe(5, { iron_ingot: 45, 'af:steel_ingot': 35, 'af:aluminium_ingot': 35, 'af:titanium_ingot': 16, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    af_f22:    buildRecipe(5, { iron_ingot: 45, 'af:steel_ingot': 35, 'af:aluminium_ingot': 35, 'af:titanium_ingot': 16, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    af_f35a:   buildRecipe(5, { iron_ingot: 45, 'af:steel_ingot': 35, 'af:aluminium_ingot': 35, 'af:titanium_ingot': 16, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    af_j20:    buildRecipe(5, { iron_ingot: 45, 'af:steel_ingot': 35, 'af:aluminium_ingot': 35, 'af:titanium_ingot': 16, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }),
    // bombardero estratégico (Tier 5 extremo)
    af_b2:     buildRecipe(5, { iron_ingot: 60, 'af:steel_ingot': 50, 'af:titanium_ingot': 25, 'af:refined_oil_bucket': 8 },
        { dz: { 'mcpe:electric_scrap': 13, 'mcpe:duct_tape': 4, 'mcpe:plastic_explosive': 3 } }),
    af_tu160:  buildRecipe(5, { iron_ingot: 60, 'af:steel_ingot': 50, 'af:titanium_ingot': 25, 'af:refined_oil_bucket': 8 },
        { dz: { 'mcpe:electric_scrap': 13, 'mcpe:duct_tape': 4, 'mcpe:plastic_explosive': 3 } }),
};

// ── Vehículos navales Bean's AF ────────────────────────────────────────────────
const NAVAL_VEHICLE_RECIPES = {
    // patrulleras ligeras (Tier 3)
    af_strb90h:     buildRecipe(3, { iron_ingot: 30, 'af:steel_ingot': 14, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:duct_tape': 2 } }),
    af_project03160:buildRecipe(3, { iron_ingot: 30, 'af:steel_ingot': 14, 'af:aluminium_ingot': 10, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 4, 'mcpe:duct_tape': 2 } }),
    // corbetas / fragatas (Tier 4)
    af_type142a:    buildRecipe(4, { iron_ingot: 45, 'af:steel_ingot': 24, 'af:aluminium_ingot': 14, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 2 } }),
    af_project1241: buildRecipe(4, { iron_ingot: 45, 'af:steel_ingot': 24, 'af:aluminium_ingot': 14, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 2 } }),
    af_a19:         buildRecipe(4, { iron_ingot: 45, 'af:steel_ingot': 24, 'af:aluminium_ingot': 14, 'af:refined_oil_bucket': 4 },
        { dz: { 'mcpe:electric_scrap': 6, 'mcpe:nail_box': 2 } }),
    // submarino (Tier 5)
    af_project677:  buildRecipe(5, { iron_ingot: 60, 'af:steel_ingot': 40, 'af:titanium_ingot': 15, 'af:refined_oil_bucket': 6 },
        { dz: { 'mcpe:electric_scrap': 9, 'mcpe:nail_box': 4, 'mcpe:plastic_explosive': 2 } }),
    // portaaviones (Tier 5 extremo)
    af_16ddh:       buildRecipe(5, { iron_ingot: 80, 'af:steel_ingot': 60, 'af:titanium_ingot': 20, 'af:refined_oil_bucket': 8 },
        { dz: { 'mcpe:electric_scrap': 13, 'mcpe:nail_box': 5, 'mcpe:plastic_explosive': 2 } }),
    af_type075:     buildRecipe(5, { iron_ingot: 80, 'af:steel_ingot': 60, 'af:titanium_ingot': 20, 'af:refined_oil_bucket': 8 },
        { dz: { 'mcpe:electric_scrap': 13, 'mcpe:nail_box': 5, 'mcpe:plastic_explosive': 2 } }),
};

// ── Vehículos PUBG ─────────────────────────────────────────────────────────────
const PUBG_VEHICLE_RECIPES = {
    pubg_buggy:       buildRecipe(2, { iron_ingot: 20, 'af:steel_ingot': 6, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 2 } }),
    pubg_opentop:     buildRecipe(2, { iron_ingot: 22, 'af:steel_ingot': 7, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:duct_tape': 2 } }),
    pubg_softtop:     buildRecipe(2, { iron_ingot: 22, 'af:steel_ingot': 7, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:duct_tape': 2 } }),
    pubg_hardtop:     buildRecipe(2, { iron_ingot: 24, 'af:steel_ingot': 8, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 3, 'mcpe:duct_tape': 2 } }),
    pubg_pg117:       buildRecipe(3, { iron_ingot: 28, 'af:steel_ingot': 10, 'af:aluminium_ingot': 6, 'af:refined_oil_bucket': 2 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:duct_tape': 3 } }),
    pubg_dacia_white: buildRecipe(2, { iron_ingot: 20, 'af:steel_ingot': 6, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:duct_tape': 2 } }),
    pubg_dacia_blue:  buildRecipe(2, { iron_ingot: 20, 'af:steel_ingot': 6, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:duct_tape': 2 } }),
    pubg_dacia_red:   buildRecipe(2, { iron_ingot: 20, 'af:steel_ingot': 6, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:duct_tape': 2 } }),
    pubg_dacia_green: buildRecipe(2, { iron_ingot: 20, 'af:steel_ingot': 6, 'af:refined_oil_bucket': 1 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:duct_tape': 2 } }),
};

// ── Recetas Artillería (spawn eggs) ──────────────────────────────────────────
// Tier 3-4 según potencia. Combinan vanilla + DZ + Beans
const ARTILLERY_RECIPES = {
    // D-20 Petrov — cañón howitzer remolcado de largo alcance (Tier 4)
    af_d20:          buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 14, 'af:aluminium_ingot': 6 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:nail_box': 1 } }),
    // M114 Howitzer — equivalente libernio del D-20 (Tier 4)
    af_m114:         buildRecipe(4, { iron_ingot: 35, 'af:steel_ingot': 14, 'af:aluminium_ingot': 6 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:nail_box': 1 } }),
    // Mounted Gun — ametralladora montada ligera (Tier 2)
    af_mounted_gun:  buildRecipe(2, { iron_ingot: 16, 'af:steel_ingot': 4 },
        { dz: {'mcpe:duct_tape': 1 } }),
    // C-RAM — defensa antiaérea automática (Tier 4)
    af_c_ram:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 16, 'af:aluminium_ingot': 8 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 3 } }),
    // AK-630 — CIWS naval de telslakia (Tier 4)
    af_ak630:        buildRecipe(4, { iron_ingot: 40, 'af:steel_ingot': 16, 'af:aluminium_ingot': 8 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 3 } }),
    // NASAMS — sistema SAM libernio (Tier 5)
    af_nasams:       buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 22, 'af:aluminium_ingot': 12, 'af:titanium_ingot': 4 },
        { dz: { 'mcpe:electric_scrap': 7, 'mcpe:nail_box': 3, 'mcpe:plastic_explosive': 1 } }),
    // SAM Turret — sistema SAM telslakia (Tier 5)
    af_sam_turret:   buildRecipe(5, { iron_ingot: 50, 'af:steel_ingot': 22, 'af:aluminium_ingot': 12, 'af:titanium_ingot': 4 },
        { dz: { 'mcpe:electric_scrap': 7, 'mcpe:nail_box': 3, 'mcpe:plastic_explosive': 1 } }),
    // BM-3 — centinela sentry ligero telslakia (Tier 2)
    af_bm3:          buildRecipe(2, { iron_ingot: 12, 'af:steel_ingot': 3 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 1 } }),
    // SGRA-1 — centinela sentry libernio (Tier 2)
    af_sgra1:        buildRecipe(2, { iron_ingot: 12, 'af:steel_ingot': 3 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 1 } }),
};

// Descripciones de artillería — se muestran en la pantalla de confirmación
const ARTILLERY_DESCS = {
    af_d20:
        '§l§6D-20 Petrov§r\n' +
        '§7Cañon howitzer remolcado de 152mm. Dispara cascos\n' +
        'HE y AP. Requiere ser posicionado con la llave\n' +
        'inglesa (ajuste) o correa (remolque). Para reparar:\n' +
        'shift + click con llave inglesa. Vida: 1050 HP.\n\n',
    af_m114:
        '§l§6M114 Howitzer§r\n' +
        '§7Cañon howitzer de 155mm. Equivalente libernio del\n' +
        'D-20. Dispara cascos HE y SP (precision). Mismas\n' +
        'mecanicas: ajustar con llave, remolcar con correa.\n' +
        'Reparar: shift + click con llave. Vida: 1050 HP.\n\n',
    af_mounted_gun:
        '§l§6Ametralladora Montada§r\n' +
        '§7Ametralladora fija de uso rapido. Cualquier jugador\n' +
        'puede usarla. Sin municion especial — dispara\n' +
        'directamente. Facil de destruir (1005 HP).\n' +
        'Reparar: shift + click con llave inglesa.\n\n',
    af_c_ram:
        '§l§6C-RAM§r\n' +
        '§7Sistema CIWS libernio de defensa antiaerea automatica.\n' +
        'Destruye misiles y aeronaves telslakias entrantes.\n' +
        'Requiere radar activo a menos de 16 bloques.\n' +
        'Vida: 1050 HP. No requiere municion manual.\n\n',
    af_ak630:
        '§l§6AK-630§r\n' +
        '§7Sistema CIWS naval telslakio. Funcion identica al\n' +
        'C-RAM pero para la flota de telslakia. Derriba\n' +
        'aeronaves y misiles libernios. Requiere radar.\n' +
        'Vida: 1050 HP. No requiere municion manual.\n\n',
    af_nasams:
        '§l§6NASAMS§r\n' +
        '§7Sistema SAM libernio de largo alcance. Lanza\n' +
        'misiles aire-aire automaticamente contra aeronaves\n' +
        'telslakias. Cubre gran radio. Requiere radar.\n' +
        'Vida: 1050 HP. Tier 5 — muy costoso pero muy util.\n\n',
    af_sam_turret:
        '§l§6SAM Turret§r\n' +
        '§7Sistema SAM telslakio equivalente al NASAMS.\n' +
        'Ataca aeronaves libernias automaticamente.\n' +
        'Requiere radar activo a menos de 16 bloques.\n' +
        'Vida: 1050 HP.\n\n',
    af_bm3:
        '§l§6BM-3 Sentry§r\n' +
        '§7Centinela automatico telslakio. Ataca a jugadores\n' +
        'y entidades no telslakias dentro de su rango.\n' +
        'Vida muy baja (1005 HP). Deja caer loot al morir.\n' +
        'Util como alarma o defensa de base economica.\n\n',
    af_sgra1:
        '§l§6SGRA-1 Sentry§r\n' +
        '§7Centinela automatico libernio. Funcion identica\n' +
        'al BM-3 pero ataca a no-libernios. Vida: 1005 HP.\n' +
        'Deja caer loot al morir. Perfecto para proteger\n' +
        'bases sin vigilancia activa.\n\n',
};

// ═══════════════════════════════════════════════════════════════════
//  MENÚ PRINCIPAL — MESA DE ARMAS
// ═══════════════════════════════════════════════════════════════════
function mainMenu(player) {
    new ActionFormData()
        .title('§l§6Mesa de Armas')
        .body('§r§7Selecciona una categoria:')
        .button('§l§fArmas de Fuego',   'textures/items/deagle')
        .button('§l§aEquipos Veh.',     'textures/items/wrench')
        .button('§l§bVehiculos',        'textures/items/place_m1a1')
        .button('§l§eHerramientas',     'textures/items/BloqueadorDeVehiculos')
        .button('§l§6Artilleria',       'textures/items/place_d20')
        .show(player)
        .then(res => {
            if (res.canceled) return;
            if (res.selection === 0) weaponsMenu(player);
            else if (res.selection === 1) vehicleEquipMenu(player);
            else if (res.selection === 2) vehiclesMainMenu(player);
            else if (res.selection === 3) toolsMenu(player);
            else artilleryMenu(player);
        });
}

// ═══════════════════════════════════════════════════════════════════
//  ARMAS DE FUEGO
// ═══════════════════════════════════════════════════════════════════
function weaponsMenu(player) {
    new ActionFormData()
        .title('§l§fArmas de Fuego')
        .body('§r§7Selecciona un arma:')
        .button('§l§7Desert Eagle',   'textures/items/deagle')
        .button('§l§7MP5',            'textures/items/mp5')
        .button('§l§7Vector',         'textures/items/vector')
        .button('§l§7P90',            'textures/items/p90')
        .button('§l§7M16A1',          'textures/items/m16a1')
        .button('§l§7M16',            'textures/items/m16')
        .button('§l§7HK416',          'textures/items/hk416')
        .button('§l§7SCAR-H',         'textures/items/scarh')
        .button('§l§7G3',             'textures/items/g3')
        .button('§l§7AA-12',          'textures/items/aa12')
        .button('§l§7RPG',            'textures/items/rpg')
        .button('§l§7M870',           'textures/items/m870')
        .button('§l§7AWP',            'textures/items/awp')
        .button('§l§7G17',            'textures/items/g17')
        .button('§l§7M1911',          'textures/items/m1911')
        .button('§l§7AKM',            'textures/items/akm')
        .button('§l§7M4A1',           'textures/items/m4a1')
        .button('§l§7SCAR-L',         'textures/items/scarl')
        .button('§l§7G36K',           'textures/items/g36')
        .button('§l§7MP7',            'textures/items/mp7')
        .button('§l§7M134 Minigun',   'textures/items/minigun')
        .button('§l§7UZI',            'textures/items/uzi')
        .button('§l§7G18',            'textures/items/g18')
        .button('§l§7Double Barrel',  'textures/items/db')
        .button('§l§7Deagle Gold',    'textures/items/deagleg')
        .button('§l§7Saiga-12',       'textures/items/saiga12')
        .button('§l§7FAL',            'textures/items/fal')
        .button('§l§7QBZ-95',         'textures/items/qbz95')
        .button('§l§7UMP',            'textures/items/ump')
        .button('§l§7B93R',           'textures/items/b93r')
        .button('§l§7SKS',            'textures/items/sks')
        .button('§l§7MK14',           'textures/items/mk14')
        .button('§l§7QBZ-191',        'textures/items/qbz191')
        .button('§l§7Type 81',        'textures/items/type81')
        .button('§l§7Evolys',         'textures/items/evolys')
        .button('§l§7M249',           'textures/items/m249')
        .button('§l§7Timeless 50',    'textures/items/t50')
        .button('§l§7CP',             'textures/items/cp')
        .button('§l§7M1014',          'textures/items/m1014')
        .button('§l§7P320',           'textures/items/p320')
        .show(player)
        .then(res => {
            if (res.canceled) { mainMenu(player); return; }
            const map = [
                ['deagle','Desert Eagle','krep:deagle'],['mp5','MP5','krep:mp5'],
                ['vector','Vector','krep:vector'],['p90','P90','krep:p90'],
                ['m16a1','M16A1','krep:m16a1'],['m16','M16','krep:m16'],
                ['hk416','HK416','krep:hk416'],['scarh','SCAR-H','krep:scarh'],
                ['g3','G3','krep:g3'],['aa12','AA-12','krep:aa12'],
                ['rpg','RPG','krep:rpg'],['m870','M870','krep:m870'],
                ['awp','AWP','krep:awp'],['g17','G17','krep:g17'],
                ['m1911','M1911','krep:m1911'],['akm','AKM','krep:akm'],
                ['m4a1','M4A1','krep:m4a1'],['scarl','SCAR-L','krep:scarl'],
                ['g36','G36K','krep:g36'],['mp7','MP7','krep:mp7'],
                ['minigun','M134 Minigun','krep:minigun'],['uzi','UZI','krep:uzi'],
                ['g18','G18','krep:g18'],['db','Double Barrel','krep:db'],
                ['deagleg','Deagle Gold','krep:deagleg'],['saiga12','Saiga-12','krep:saiga12'],
                ['fal','FAL','krep:fal'],['qbz95','QBZ-95','krep:qbz95'],
                ['ump','UMP','krep:ump'],['b93','Beretta 93R','krep:b93r'],
                ['sks','SKS','krep:sks'],['mk14','MK14','krep:mk14'],
                ['qbz191','QBZ-191','krep:qbz191'],['type81','Type 81','krep:type81'],
                ['evolys','Evolys','krep:evolys'],['m249','M249','krep:m249'],
                ['t50','Timeless 50','krep:t50'],['cp','CP','krep:cp'],
                ['m1014','M1014','krep:m1014'],['p320','P320','krep:p320'],
            ];
            const [key, title, id] = map[res.selection];
            weaponConfirm(player, key, title, id);
        });
}

function weaponConfirm(player, key, title, id) {
    const recipe = RECIPES[key];
    new ActionFormData()
        .title(`§l§6${title} §r§7[T${recipe.tier}]`)
        .body(describeRecipe(recipe, player))
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { weaponsMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, recipe, id, null, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} crafteado.`);
                    weaponsMenu(player);
                });
            } else { weaponsMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  EQUIPOS DE VEHÍCULO
// ═══════════════════════════════════════════════════════════════════
function vehicleEquipMenu(player) {
    new ActionFormData()
        .title('§l§aEquipos Veh.')
        .body('§r§7Herramientas y controles de vehiculo:')
        .button('§l§7Llave Inglesa',    'textures/items/wrench')
        .button('§l§7Periscopio',       'textures/items/vehicle_periscope')
        .button('§l§7Telemetro',        'textures/items/rangefinder')
        // .button('§l§7Taladro Petroleo', 'textures/items/handheld_oil_drill')
        .show(player)
        .then(res => {
            if (res.canceled) { mainMenu(player); return; }
            const map = [
                ['af_wrench',      'Llave Inglesa',   'af:wrench'],
                ['af_periscope',   'Periscopio',      'af:vehicle_periscope'],
                ['af_rangefinder', 'Telemetro',       'af:rangefinder'],
                // ['af_oil_drill',   'Taladro Petroleo','af:handheld_oil_drill'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleEquipConfirm(player, key, title, id, VEHICLE_EQUIP_RECIPES);
        });
}

function vehicleEquipConfirm(player, key, title, id, recipeMap) {
    const recipe = recipeMap[key];

    // Descripciones de equipos — aparecen arriba de los materiales
    const EQUIP_DESCS = {
        af_wrench:
            '§l§6Llave Inglesa§r\n' +
            '§7Uso: Herramienta multiproposito de vehiculos.\n' +
            '§7- Click derecho en vehiculo: abre menu de reparacion.\n' +
            '§7- D-20 / M114: shift + click para reparar\n' +
            '§7  (click normal = ajustar posicion del cañon).\n' +
            '§7Entidades: todos los vehiculos del Beans y PUBG,\n' +
            '§7  D-20 Petrov, M114, Mounted Gun, C-RAM, etc.\n\n',
        af_throttle:
            '§l§6Acelerador§r\n' +
            '§7Uso: Instalar en vehiuclos terrestres para\n' +
            '§7aumentar su velocidad maxima. Se usa haciendo\n' +
            '§7click derecho en el vehiculo con el item en mano.\n' +
            '§7Entidades: vehiculos terrestres Beans (camiones,\n' +
            '§7  tanques, APCs).\n\n',
        af_periscope:
            '§l§6Periscopio§r\n' +
            '§7Uso: Permite ver desde el exterior del vehiculo\n' +
            '§7mientras estas dentro. Click derecho con el item\n' +
            '§7en mano estando montado.\n' +
            '§7Entidades: tanques cerrados (M1A1, T-90M, Leopard,\n' +
            '§7  T-72A, BMPT-72, M551).\n\n',
        af_rangefinder:
            '§l§6Telemetro§r\n' +
            '§7Uso: Mide la distancia al objetivo y mejora la\n' +
            '§7precision del disparo. Click derecho en la entidad\n' +
            '§7de artilleria (D-20, M114) para disparar con\n' +
            '§7prediccion de impacto.\n' +
            '§7Entidades: D-20 Petrov, M114 Howitzer.\n\n',
        af_autopilot:
            '§l§6Autopiloto§r\n' +
            '§7Uso: Permite a drones y aviones seguir una ruta\n' +
            '§7automaticamente sin piloto activo. Se equipa\n' +
            '§7haciendo click derecho en el vehiculo aereo.\n' +
            '§7Entidades: MQ-9 Reaper, GJ-2, todos los cazas.\n\n',
        af_mq9_remote:
            '§l§6Control Remoto MQ-9§r\n' +
            '§7Uso: Permite pilotar el drone MQ-9 Reaper de\n' +
            '§7forma remota desde el suelo. Tener el item\n' +
            '§7en mano y hacer click derecho.\n' +
            '§7Entidades: MQ-9 Reaper (drone Libernia).\n\n',
        af_gj2_remote:
            '§l§6Control Remoto GJ-2§r\n' +
            '§7Uso: Equivalente al remoto MQ-9 pero para el\n' +
            '§7drone GJ-2 de Telslakia. Mismo mecanismo.\n' +
            '§7Entidades: GJ-2 (drone Telslakia).\n\n',
        af_uav_remote:
            '§l§6Control Remoto UAV§r\n' +
            '§7Uso: Control generico de UAV. Compatible con\n' +
            '§7ambos drones (MQ-9 y GJ-2). Ligeramente menor\n' +
            '§7alcance que los controles especificos.\n' +
            '§7Entidades: MQ-9, GJ-2.\n\n',
        af_oil_drill:
            '§l§6Taladro de Petroleo§r\n' +
            '§7Uso: Extrae petroleo crudo del terreno. Se usa\n' +
            '§7haciendo click derecho en el suelo. Produce\n' +
            '§7af:oil_bucket que luego se refina en combustible.\n' +
            '§7Entidades: no requiere entidad, uso directo.\n\n',
    };

    const desc = EQUIP_DESCS[key] ?? '';
    new ActionFormData()
        .title(`§l§a${title} §r§7[T${recipe.tier}]`)
        .body(desc + describeRecipe(recipe, player))
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { vehicleEquipMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, recipe, id, null, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} crafteado.`);
                    vehicleEquipMenu(player);
                });
            } else { vehicleEquipMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  HERRAMIENTAS (Bloqueador + Ganzúas)
// ═══════════════════════════════════════════════════════════════════
function toolsMenu(player) {
    new ActionFormData()
        .title('§l§eHerramientas')
        .body('§r§7Herramientas especiales:')
        .button('§l§7Llave Bloqueadora §r§7(vehiculos)', 'textures/items/BloqueadorDeVehiculos')
        .button('§l§6Ganzua Nv.1 §r§7(25%)',             'textures/items/ganzua1')
        .button('§l§bGanzua Nv.2 §r§7(50%)',             'textures/items/ganzua2')
        .button('§l§4Ganzua Nv.3 §r§7(75%)',             'textures/items/ganzua3')
        .show(player)
        .then(res => {
            if (res.canceled) { mainMenu(player); return; }
            const map = [
                ['bloqueador', 'Llave Bloqueadora', 'tz:bloqueador'],
                ['ganzua1',    'Ganzua Nv.1',       'tz:ganzua1'],
                ['ganzua2',    'Ganzua Nv.2',       'tz:ganzua2'],
                ['ganzua3',    'Ganzua Nv.3',       'tz:ganzua3'],
            ];
            const [key, title, id] = map[res.selection];
            toolConfirm(player, key, title, id);
        });
}

function toolConfirm(player, key, title, id) {
    const recipe = RECIPES[key];

    // Descripciones de herramientas especiales
    const TOOL_DESCS = {
        bloqueador:
            '§l§6Llave Bloqueadora§r\n' +
            '§7Uso: Bloquea el motor de cualquier vehiculo.\n' +
            '§7Al usarla en un vehiculo, ese vehiculo queda\n' +
            '§7bloqueado — solo tu puedes montarte.\n' +
            '§7Al hacer click derecho en el vehiculo bloqueado\n' +
            '§7se abre un menu donde puedes dar o quitar\n' +
            '§7permiso a otros jugadores para montarlo.\n' +
            '§7Click de nuevo con la llave para desbloquear.\n' +
            '§7Entidades: todos los vehiculos con motor.\n\n',
        ganzua1:
            '§l§6Ganzua Nivel 1§r\n' +
            '§7Uso: Fuerza la cerradura de vehiculos bloqueados\n' +
            '§7para poder robarlos y desbloquearlos.\n' +
            '§7Probabilidad de exito: §a25%\n' +
            '§7Falla el 75% — la ganzua se rompe al fallar.\n' +
            '§7Como usar: click derecho en el vehiculo bloqueado.\n' +
            '§7Util como ultimo recurso o cuando no tienes nada mejor.\n\n',
        ganzua2:
            '§l§6Ganzua Nivel 2§r\n' +
            '§7Uso: Fuerza la cerradura de vehiculos bloqueados\n' +
            '§7para poder robarlos y desbloquearlos.\n' +
            '§7Probabilidad de exito: §e50%\n' +
            '§7Falla el 50% — la ganzua se rompe al fallar.\n' +
            '§7Como usar: click derecho en el vehiculo bloqueado.\n' +
            '§7Buen balance entre costo y efectividad.\n\n',
        ganzua3:
            '§l§6Ganzua Nivel 3§r\n' +
            '§7Uso: Fuerza la cerradura de vehiculos bloqueados\n' +
            '§7para poder robarlos y desbloquearlos.\n' +
            '§7Probabilidad de exito: §675%\n' +
            '§7Falla el 25% — la ganzua se rompe al fallar.\n' +
            '§7Como usar: click derecho en el vehiculo bloqueado.\n' +
            '§7La mejor opcion para robo sigiloso de alto valor.\n\n',
    };

    const desc = TOOL_DESCS[key] ?? '';
    new ActionFormData()
        .title(`§l§e${title} §r§7[T${recipe.tier}]`)
        .body(desc + describeRecipe(recipe, player))
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { toolsMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, recipe, id, null, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} crafteado.`);
                    toolsMenu(player);
                });
            } else { toolsMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  VEHÍCULOS — menú de selección de categoría
// ═══════════════════════════════════════════════════════════════════
function vehiclesMainMenu(player) {
    new ActionFormData()
        .title('§l§bVehiculos')
        .body('§r§7Selecciona una categoria:')
        .button('§l§7Tierra',  'textures/items/place_m1a1')
        .button('§l§7Aéreos',  'textures/items/place_f22')
        .button('§l§7Navales', 'textures/items/place_16ddh')
        .button('§l§7PUBG',    'textures/items/spawn_buggy')
        .show(player)
        .then(res => {
            if (res.canceled) { mainMenu(player); return; }
            if (res.selection === 0) groundVehiclesMenu(player);
            else if (res.selection === 1) airVehiclesMenu(player);
            else if (res.selection === 2) navalVehiclesMenu(player);
            else pubgVehiclesMenu(player);
        });
}

// helper genérico de confirmación de vehículo
function vehicleConfirm(player, key, title, id, recipeMap, backFn) {
    const recipe = recipeMap[key];
    new ActionFormData()
        .title(`§l§b${title} §r§7[T${recipe.tier}]`)
        .body(describeRecipe(recipe, player))
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { backFn(player); return; }
            if (res.selection === 0) {
                executeCraft(player, recipe, id, null, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} spawneado.`);
                    backFn(player);
                });
            } else { backFn(player); }
        });
}

// ─── Tierra ───────────────────────────────────────────────────────────────────
function groundVehiclesMenu(player) {
    new ActionFormData()
        .title('§l§bTierra')
        .body('§r§7Vehiculos terrestres:')
        .button('§l§7M939 (Camion)',        'textures/items/place_m939')
        .button('§l§7KAMAZ-65224 (Camion)', 'textures/items/place_kamaz65224')
        .button('§l§7M1151 (Tactico)',      'textures/items/place_m1151')
        .button('§l§7BTR-80 (APC)',         'textures/items/place_btr80')
        .button('§l§7M2A2 Bradley (IFV)',   'textures/items/place_m2a2')
        .button('§l§7EQ2050 (Blindado)',    'textures/items/place_eq2050')
        .button('§l§7M142 HIMARS (Artil.)', 'textures/items/place_m142')
        .button('§l§7BM-30 Smerch (Artil.)','textures/items/place_bm30')
        .button('§l§7M551 Sheridan (T.Lig)','textures/items/place_m551')
        .button('§l§7Type 16 (Canon)',      'textures/items/place_type16')
        .button('§l§7T-72A (Tanque)',       'textures/items/place_t72a')
        .button('§l§7Leopard 2A4 (MBT)',    'textures/items/place_leopard2a4')
        .button('§l§7M1A1 Abrams (MBT)',    'textures/items/place_m1a1')
        .button('§l§7T-90M (MBT)',          'textures/items/place_t90m')
        .button('§l§7BMPT-72 Terminator',   'textures/items/place_bmpt72')
        .button('§l§72S38 (SPAAG)',         'textures/items/place_2s38')
        .show(player)
        .then(res => {
            if (res.canceled) { vehiclesMainMenu(player); return; }
            const map = [
                ['af_m939','M939','af:m939_spawn_egg'],
                ['af_kamaz65224','KAMAZ-65224','af:kamaz65224_spawn_egg'],
                ['af_m1151','M1151','af:m1151_spawn_egg'],
                ['af_btr80','BTR-80','af:btr80_spawn_egg'],
                ['af_m2a2','M2A2 Bradley','af:m2a2_spawn_egg'],
                ['af_eq2050','EQ2050','af:eq2050_spawn_egg'],
                ['af_m142','M142 HIMARS','af:m142_spawn_egg'],
                ['af_bm30','BM-30 Smerch','af:bm30_spawn_egg'],
                ['af_m551','M551 Sheridan','af:m551_spawn_egg'],
                ['af_type16','Type 16','af:type16_spawn_egg'],
                ['af_t72a','T-72A','af:t72a_spawn_egg'],
                ['af_leopard2a4','Leopard 2A4','af:leopard2a4_spawn_egg'],
                ['af_m1a1','M1A1 Abrams','af:m1a1_spawn_egg'],
                ['af_t90m','T-90M','af:t90m_spawn_egg'],
                ['af_bmpt72','BMPT-72 Terminator','af:bmpt72_spawn_egg'],
                ['af_2s38','2S38','af:2s38_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleConfirm(player, key, title, id, VEHICLE_RECIPES, groundVehiclesMenu);
        });
}

// ─── Aéreos ───────────────────────────────────────────────────────────────────
function airVehiclesMenu(player) {
    new ActionFormData()
        .title('§l§bAereos')
        .body('§r§7Vehiculos aereos:')
        .button('§l§7MQ-9 Reaper (Drone)',  'textures/items/place_mq9')
        .button('§l§7GJ-2 (Drone)',         'textures/items/place_gj2')
        .button('§l§7AH-64 Apache (Heli)',  'textures/items/place_ah64')
        .button('§l§7Mi-24 Hind (Heli)',    'textures/items/place_mi24')
        .button('§l§7F-4 Phantom',          'textures/items/place_f4')
        .button('§l§7MiG-21',               'textures/items/place_mig21')
        .button('§l§7Su-25 Frogfoot',       'textures/items/place_su25')
        .button('§l§7A-10 Thunderbolt',     'textures/items/place_a10')
        .button('§l§7F-16 Fighting Falcon', 'textures/items/place_f16')
        .button('§l§7F-14 Tomcat',          'textures/items/place_f14')
        .button('§l§7MiG-29 Fulcrum',       'textures/items/place_mig29')
        .button('§l§7Yak-141 Freestyle',    'textures/items/place_yak141')
        .button('§l§7F/A-18 Hornet',        'textures/items/place_f18')
        .button('§l§7Su-33 Flanker-D',      'textures/items/place_su33')
        .button('§l§7Su-57 Felon',          'textures/items/place_su57')
        .button('§l§7F-22 Raptor',          'textures/items/place_f22')
        .button('§l§7F-35A Lightning II',   'textures/items/place_f35a')
        .button('§l§7J-20 Mighty Dragon',   'textures/items/place_j20')
        .button('§l§4B-2 Spirit (Bom.)',    'textures/items/place_b2')
        .button('§l§4Tu-160 Blackjack',     'textures/items/place_tu160')
        .show(player)
        .then(res => {
            if (res.canceled) { vehiclesMainMenu(player); return; }
            const map = [
                ['af_mq9',   'MQ-9 Reaper',      'af:mq9_spawn_egg'],
                ['af_gj2',   'GJ-2',              'af:gj2_spawn_egg'],
                ['af_ah64',  'AH-64 Apache',      'af:ah64_spawn_egg'],
                ['af_mi24',  'Mi-24 Hind',        'af:mi24_spawn_egg'],
                ['af_f4',    'F-4 Phantom',       'af:f4_spawn_egg'],
                ['af_mig21', 'MiG-21',            'af:mig21_spawn_egg'],
                ['af_su25',  'Su-25 Frogfoot',    'af:su25_spawn_egg'],
                ['af_a10',   'A-10 Thunderbolt',  'af:a10_spawn_egg'],
                ['af_f16',   'F-16 Falcon',       'af:f16_spawn_egg'],
                ['af_f14',   'F-14 Tomcat',       'af:f14_spawn_egg'],
                ['af_mig29', 'MiG-29',            'af:mig29_spawn_egg'],
                ['af_yak141','Yak-141',           'af:yak141_spawn_egg'],
                ['af_f18',   'F/A-18 Hornet',     'af:f18_spawn_egg'],
                ['af_su33',  'Su-33',             'af:su33_spawn_egg'],
                ['af_su57',  'Su-57 Felon',       'af:su57_spawn_egg'],
                ['af_f22',   'F-22 Raptor',       'af:f22_spawn_egg'],
                ['af_f35a',  'F-35A',             'af:f35a_spawn_egg'],
                ['af_j20',   'J-20',              'af:j20_spawn_egg'],
                ['af_b2',    'B-2 Spirit',        'af:b2_spawn_egg'],
                ['af_tu160', 'Tu-160 Blackjack',  'af:tu160_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleConfirm(player, key, title, id, AIR_VEHICLE_RECIPES, airVehiclesMenu);
        });
}

// ─── Navales ──────────────────────────────────────────────────────────────────
function navalVehiclesMenu(player) {
    new ActionFormData()
        .title('§l§bNavales')
        .body('§r§7Vehiculos navales:')
        .button('§l§7Strb 90H (Patrullera)',   'textures/items/place_strb90h')
        .button('§l§7Proyecto 03160 (Patrull.)', 'textures/items/place_project03160')
        .button('§l§7Type 142A (Corbeta)',      'textures/items/place_type142a')
        .button('§l§7Proyecto 1241 (Corbeta)',  'textures/items/place_project1241')
        .button('§l§7A-19 (Fragata)',           'textures/items/place_a19')
        .button('§l§4Proyecto 677 (Submarino)', 'textures/items/place_project677')
        .button('§l§4DDH-16 (Portaaviones)',    'textures/items/place_16ddh')
        .button('§l§4Type 075 (Portaaviones)',  'textures/items/place_type075')
        .show(player)
        .then(res => {
            if (res.canceled) { vehiclesMainMenu(player); return; }
            const map = [
                ['af_strb90h',     'Strb 90H',        'af:strb90h_spawn_egg'],
                ['af_project03160','Proyecto 03160',   'af:project03160_spawn_egg'],
                ['af_type142a',    'Type 142A',        'af:type142a_spawn_egg'],
                ['af_project1241', 'Proyecto 1241',    'af:project1241_spawn_egg'],
                ['af_a19',         'A-19',             'af:a19_spawn_egg'],
                ['af_project677',  'Proyecto 677',     'af:project677_spawn_egg'],
                ['af_16ddh',       'DDH-16',           'af:16ddh_spawn_egg'],
                ['af_type075',     'Type 075',         'af:type075_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleConfirm(player, key, title, id, NAVAL_VEHICLE_RECIPES, navalVehiclesMenu);
        });
}

// ─── PUBG ─────────────────────────────────────────────────────────────────────
function pubgVehiclesMenu(player) {
    new ActionFormData()
        .title('§l§bVehiculos PUBG')
        .body('§r§7Vehiculos del modo Battle Royale:')
        .button('§l§7Buggy',       'textures/items/spawn_buggy')
        .button('§l§7UAZ Abierto', 'textures/items/spawn_uaz_opentop')
        .button('§l§7UAZ Lona',    'textures/items/spawn_uaz_softtop')
        .button('§l§7UAZ Duro',    'textures/items/spawn_uaz_hardtop')
        .button('§l§7PG-117 (Lancha)', 'textures/items/spawn_pg117')
        .button('§l§7Dacia Blanca','textures/items/spawn_dacia_white')
        .button('§l§7Dacia Azul',  'textures/items/spawn_dacia_blue')
        .button('§l§7Dacia Roja',  'textures/items/spawn_dacia_red')
        .button('§l§7Dacia Verde', 'textures/items/spawn_dacia_green')
        .show(player)
        .then(res => {
            if (res.canceled) { vehiclesMainMenu(player); return; }
            const map = [
                ['pubg_buggy',       'Buggy',        'pubg:buggy_spawn_egg'],
                ['pubg_opentop',     'UAZ Abierto',  'pubg:opentop_spawn_egg'],
                ['pubg_softtop',     'UAZ Lona',     'pubg:softtop_spawn_egg'],
                ['pubg_hardtop',     'UAZ Duro',     'pubg:hardtop_spawn_egg'],
                ['pubg_pg117',       'PG-117',       'pubg:pg117_spawn_egg'],
                ['pubg_dacia_white', 'Dacia Blanca', 'pubg:dacia_white_spawn_egg'],
                ['pubg_dacia_blue',  'Dacia Azul',   'pubg:dacia_blue_spawn_egg'],
                ['pubg_dacia_red',   'Dacia Roja',   'pubg:dacia_red_spawn_egg'],
                ['pubg_dacia_green', 'Dacia Verde',  'pubg:dacia_green_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleConfirm(player, key, title, id, PUBG_VEHICLE_RECIPES, pubgVehiclesMenu);
        });
}

// ═══════════════════════════════════════════════════════════════════
//  ARTILLERÍA
// ═══════════════════════════════════════════════════════════════════
function artilleryMenu(player) {
    new ActionFormData()
        .title('§l§6Artilleria')
        .body('§r§7Artilleria remolcada y ametralladoras:')
        .button('§l§7D-20 Petrov',        'textures/items/place_d20')
        .button('§l§7M114 Howitzer',       'textures/items/place_m114')
        .button('§l§7Ametralladora Mont.', 'textures/items/place_mounted_gun')
        .show(player)
        .then(res => {
            if (res.canceled) { mainMenu(player); return; }
            const map = [
                ['af_d20',         'D-20 Petrov',          'af:d20_spawn_egg'],
                ['af_m114',        'M114 Howitzer',         'af:m114_spawn_egg'],
                ['af_mounted_gun', 'Ametralladora Montada', 'af:mounted_gun_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            artilleryConfirm(player, key, title, id);
        });
}

function artilleryConfirm(player, key, title, id) {
    const recipe = ARTILLERY_RECIPES[key];
    const desc   = ARTILLERY_DESCS[key] ?? '';
    new ActionFormData()
        .title(`§l§6${title} §r§7[T${recipe.tier}]`)
        .body(desc + describeRecipe(recipe, player))
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { artilleryMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, recipe, id, null, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} spawneado.`);
                    artilleryMenu(player);
                });
            } else { artilleryMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  TRIGGER — tag openui activa el menú principal
// ═══════════════════════════════════════════════════════════════════
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.hasTag('openui')) {
            system.run(() => {
                mainMenu(player);
                player.runCommandAsync('tag @s remove openui');
            });
        }
    }
}, 20);
