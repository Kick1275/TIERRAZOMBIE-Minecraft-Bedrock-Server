import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { buildAmmoRecipe, describeRecipe, executeCraft, t } from '../global/craftingEconomy';

// ── Recetas de balas ──────────────────────────────────────────────────────────
// Rebalanceado: vanilla (hierro, carbón, pólvora) + Beans (aluminio, acero)
// DZ solo en calibres altos (.338 Lapua, RPG).
// Se pasa dz:{} explícitamente para anular el default de AMMO_DZ_BY_TIER.
const RECIPES = {
    // Calibres pistola/SMG — solo vanilla
    mm9:       { recipe: buildAmmoRecipe(1, { iron_nugget: 20, gunpowder: 16,  coal: 30 }, { dz: {} }), yield: 64 },
    acp45:     { recipe: buildAmmoRecipe(1, { iron_nugget: 18, gunpowder: 26,  coal: 30 }, { dz: {} }), yield: 30 },
    gauge12:   { recipe: buildAmmoRecipe(1, { iron_nugget: 40, gunpowder: 18, coal: 60 }, { dz: {} }), yield: 12 },
    // Calibres rifles intermedios — vanilla + aluminio Beans
    mm556:     { recipe: buildAmmoRecipe(2, { iron_nugget: 15, gunpowder: 9,  coal: 50, 'af:aluminium_ingot': 1 }, { dz: {} }), yield: 30 },
    m43:       { recipe: buildAmmoRecipe(2, { iron_nugget: 12, gunpowder: 9,  coal: 50, 'af:aluminium_ingot': 1 }, { dz: {} }), yield: 30 },
    mm5728:    { recipe: buildAmmoRecipe(2, { iron_nugget: 14, gunpowder: 6,  coal: 45, 'af:aluminium_ingot': 1 }, { dz: {} }), yield: 48 },
    mm4630:    { recipe: buildAmmoRecipe(2, { iron_nugget: 10, gunpowder: 10, coal: 60, 'af:aluminium_ingot': 1 }, { dz: {} }), yield: 48 },
    mm5842:    { recipe: buildAmmoRecipe(3, { iron_nugget: 12, gunpowder: 9,  coal: 60, 'af:aluminium_ingot': 2 }, { dz: {} }), yield: 30 },
    // .357 Mag — calibre revólver pesado, solo vanilla
    mag357:    { recipe: buildAmmoRecipe(2, { iron_nugget: 25, gunpowder: 18, coal: 80 }, { dz: {} }), yield: 30 },
    // Calibres francotirador — vanilla + aluminio, sin DZ
    win308:    { recipe: buildAmmoRecipe(3, { iron_ingot: 2, gunpowder: 20, coal: 80, 'af:aluminium_ingot': 2 }, { dz: {} }), yield: 20 },
    win308box: { recipe: buildAmmoRecipe(3, { iron_ingot: 2, gunpowder: 20, coal: 80, 'af:aluminium_ingot': 2 }, { dz: {} }), yield: 1  },
    // .50 AE — primer uso de acero Beans, sin DZ
    ae50:      { recipe: buildAmmoRecipe(3, { iron_ingot: 3, gunpowder: 18, coal: 90, 'af:steel_ingot': 1 }, { dz: {} }), yield: 36 },
    // .338 Lapua — calibre élite, acero + duct_tape (DZ mínimo, fácil de conseguir)
    lapua308:  { recipe: buildAmmoRecipe(4, { iron_ingot: 4, gunpowder: 25, coal: 100, 'af:steel_ingot': 2 }, { dz: { 'mcpe:duct_tape': 1 } }), yield: 30 },
    // RPG Rocket — explosivo, DZ moderado sin detonador
    rpgrockete:{ recipe: buildAmmoRecipe(5, { iron_ingot: 9, gunpowder: 36, 'af:steel_ingot': 2 }, { dz: { 'mcpe:plastic_explosive': 2, 'mcpe:nail_box': 1 } }), yield: 1 },
};

// ── Munición de vehículos ─────────────────────────────────────────────────────
const VEHICLE_AMMO_RECIPES = {
    // he_shell: x5 aluminium + x15 gunpowder + x2 plastic_explosive + x2 electric_scrap
    he_shell:       { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 2, gunpowder: 15, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:electric_scrap': 1 } }), yield: 1 },
    // ap_shell: eliminar titanio
    ap_shell:       { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 5, gunpowder: 10 }), yield: 1 },
    // sp_shell: eliminar electric_scrap
    sp_shell:       { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 4, 'af:steel_ingot': 2, gunpowder: 12 }), yield: 1 },
    // he_belt: x16 aluminium + x25 gunpowder + x2 plastic_explosive + x2 electric_scrap + x1 nail_box — herramientas x2
    he_belt:        { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 8, gunpowder: 25, 'mcpe:plastic_explosive': 2 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:nail_box': 1 },
          tools: [
            { id: 'mcpe:screwdriver', wear: 10 }, { id: 'mcpe:hammer', wear: 8 },
            { id: 'mcpe:hacksaw', wear: 16 }, { id: 'mcpe:wrench', wear: 8 },
            { id: 'mcpe:pipe_wrench', wear: 6 },
          ] }), yield: 2 },
    // ap_belt: eliminar titanio
    ap_belt:        { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 16, gunpowder: 14 }), yield: 4 },
    // missile_air: +4 acero, pólvora 20→25, sin electric_scrap
    missile_air:    { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 6, 'af:steel_ingot': 4, gunpowder: 25, iron_nugget: 4 }), yield: 1 },
    // missile_ground: electric_scrap 4→2, plastic_explosive 1→2
    missile_ground: { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 6, gunpowder: 30, iron_nugget: 4 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:plastic_explosive': 2 } }), yield: 1 },
    // hydra_rocket: x8 aluminium + x4 acero + x20 gunpowder + x2 electric_scrap + x4 plastic_explosive — herramientas x2
    hydra_rocket:   { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 8, 'af:steel_ingot': 4, gunpowder: 20, 'mcpe:plastic_explosive': 4 },
        { dz: { 'mcpe:electric_scrap': 2 },
          tools: [
            { id: 'mcpe:screwdriver', wear: 10 }, { id: 'mcpe:hammer', wear: 8 },
            { id: 'mcpe:hacksaw', wear: 16 }, { id: 'mcpe:wrench', wear: 8 },
            { id: 'mcpe:pipe_wrench', wear: 6 },
          ] }), yield: 2 },
    // torpedo: quitar detonador
    torpedo:        { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 5, iron_ingot: 4, gunpowder: 18 },
        { dz: { 'mcpe:duct_tape': 2 } }), yield: 1 },
    // guided_missile: x1 titanium + x2 aluminium + x24 gunpowder + x2 nail_box + x1 plastic_explosive — herramientas x2
    guided_missile: { recipe: buildAmmoRecipe(4, { 'af:titanium_ingot': 1, 'af:aluminium_ingot': 2, gunpowder: 24, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:nail_box': 2 },
          tools: [
            { id: 'mcpe:screwdriver', wear: 14 }, { id: 'mcpe:hammer', wear: 12 },
            { id: 'mcpe:hacksaw', wear: 24 }, { id: 'mcpe:wrench', wear: 12 },
            { id: 'mcpe:pipe_wrench', wear: 10 }, { id: 'mcpe:crowbar', wear: 6 },
          ] }), yield: 1 },
    // gp_bomb: x4 aluminium + x10 gunpowder + x10 iron + x1 sawoff_pipe + x1 plastic_explosive
    gp_bomb:        { recipe: buildAmmoRecipe(3, { 'af:aluminium_ingot': 4, gunpowder: 10, iron_ingot: 10, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:sawoff_pipe': 1 } }), yield: 1 },
    // bunkerbuster_bomb: quitar detonador
    bb_bomb:        { recipe: buildAmmoRecipe(4, { 'af:steel_ingot': 6, gunpowder: 30, diamond: 3 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:plastic_explosive': 3 } }), yield: 1 },
    // thermobaric_bomb: quitar detonador
    thermo_bomb:    { recipe: buildAmmoRecipe(5, { 'af:steel_ingot': 10, 'af:titanium_ingot': 5, gunpowder: 40 },
        { dz: { 'mcpe:electric_scrap': 8, 'mcpe:plastic_explosive': 6, 'mcpe:nail_box': 4 } }), yield: 1 },
    // nuke: quitar detonador
    nuke:           { recipe: buildAmmoRecipe(5, { 'af:uranium_core': 2, 'af:uranium_implosive': 3, diamond: 30 },
        { dz: { 'mcpe:plastic_explosive': 8, 'mcpe:electric_scrap': 8 } }), yield: 1 },
};

// ── Materiales ────────────────────────────────────────────────────────────────
const MAT_RECIPES = {
    // Acero: x32 hierro + x16 carbón + x16 redstone (yield x4)
    steel:          { recipe: buildAmmoRecipe(1, { iron_ingot: 32, coal: 16, redstone: 16 }, { dz: {} }), yield: 4 },
    // Aluminio: x16 hierro + x32 redstone + x32 carbón (yield x4)
    aluminium:      { recipe: buildAmmoRecipe(1, { iron_ingot: 16, redstone: 32, coal: 32 }, { dz: {} }), yield: 4 },
    // Titanio: x10 acero + x10 aluminio + x1 diamante + x10 oro (yield x2)
    titanium:       { recipe: buildAmmoRecipe(2, { 'af:steel_ingot': 10, 'af:aluminium_ingot': 10, diamond: 1, gold_ingot: 10 }, { dz: {} }), yield: 2 },
    // Petróleo crudo: x64 redstone + x16 hierro + x64 carbón + x2 acero
    // Herramientas custom: destornillador -10, martillo -10 (sin DZ)
    oil_bucket:     { recipe: buildAmmoRecipe(1, { redstone: 64, iron_ingot: 16, coal: 64, 'af:steel_ingot': 2 },
        { dz: {},
          tools: [
            { id: 'mcpe:screwdriver', wear: 10 },
            { id: 'mcpe:hammer', wear: 10 },
          ] }), yield: 1 },
    // Combustible refinado: x2 petróleo crudo + x16 carbón vegetal — herramientas duplicadas, sin DZ
    refined_oil:    { recipe: buildAmmoRecipe(2, { 'af:oil_bucket': 2, coal: 16 },
        { dz: {},
          tools: [
            { id: 'mcpe:screwdriver', wear: 6 }, { id: 'mcpe:hammer', wear: 6 },
            { id: 'mcpe:hacksaw', wear: 8 }, { id: 'mcpe:wrench', wear: 4 },
          ] }), yield: 1 },
    raw_uranium:    { recipe: buildAmmoRecipe(2, { diamond: 5, 'af:steel_ingot': 8 }), yield: 2 },
    uranium_nugget: { recipe: buildAmmoRecipe(2, { 'af:raw_uranium': 2, coal: 64,'af:aluminium_ingot': 4 }), yield: 4 },
    uranium_ingot:  { recipe: buildAmmoRecipe(3, { 'af:uranium_nugget': 9,diamond: 2, redstone: 64 }), yield: 1 },
    uranium_rod:    { recipe: buildAmmoRecipe(3, { 'af:uranium_ingot': 3, 'af:steel_ingot': 8,redstone: 64 }), yield: 1 },
    uranium_core:   { recipe: buildAmmoRecipe(4, { 'af:uranium_rod': 3, 'af:titanium_ingot': 2, gold_ingot: 16 }), yield: 1 },
    uranium_impl:   { recipe: buildAmmoRecipe(4, { 'af:uranium_core': 1, 'mcpe:plastic_explosive': 3, 'mcpe:electric_scrap': 5 }), yield: 1 },
};

// ═══════════════════════════════════════════════════════════════════
//  GRANADAS / EXPLOSIVOS
// ═══════════════════════════════════════════════════════════════════
// ── DeadZone — rompen bloques ─────────────────────────────────────
// Pipe bomb: la más simple, rompe 1-4 bloques con suerte
// Granada frag DZ: radio medio, 4-6 bloques, 2 de profundidad
// C4: la más potente, radio 5-6, profundidad 2 bloques
// ── DeadZone — NO rompen bloques ─────────────────────────────────
// Flash, smoke, nerve: granadas de apoyo / tácticas, crafteo muy barato
// ── Beans Armed Forces — NO rompen bloques ───────────────────────
// Granada frag, smoke, stun de Beans: orientadas a infantería PvP

const GRENADE_RECIPES = {
    // ── DZ — ROMPEN BLOQUES ───────────────────────────────────────
    // Pipe Bomb: sawoff_pipe + nail_box + gunpowder (crafteo original DZ)
    pipe_bomb:     { recipe: buildAmmoRecipe(1, { gunpowder: 12, iron_ingot: 8 },
        { dz: { 'mcpe:sawoff_pipe': 1, 'mcpe:nail_box': 1 } }), yield: 1 },
    // Granada Frag DZ: más potente que la pipe — necesita plástico
    frag_dz:       { recipe: buildAmmoRecipe(2, { gunpowder: 16, iron_ingot: 13, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:nail_box': 1 } }), yield: 1 },
    // C4: la más destructiva — plástico + electric_scrap + duct_tape (crafteo original DZ)
    c4:            { recipe: buildAmmoRecipe(3, {'af:steel_ingot': 2, 'mcpe:plastic_explosive': 2 },
        { dz: { 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 1 } }), yield: 1 },

    // ── DZ — NO ROMPEN BLOQUES — crafteo barato ──────────────────
    // Flash: hierro + redstone (simula el destellante)
    flash_dz:      { recipe: buildAmmoRecipe(1, { iron_ingot: 5, redstone: 24 }, { dz: {} }), yield: 1 },
    // Smoke DZ: hierro + carbón (humo)
    smoke_dz:      { recipe: buildAmmoRecipe(1, { iron_ingot: 5, coal: 16 }, { dz: {} }), yield: 1 },
    // Nerve: hierro + spider_eye (gas neurotóxico — levemente más difícil)
    nerve:         { recipe: buildAmmoRecipe(2, { iron_ingot: 10, spider_eye: 2 }, { dz: {} }), yield: 1 },

    // ── Beans — NO ROMPEN BLOQUES — aluminio + material especial ──
    // Frag Beans: aluminium + flint (crafteo original Beans)
    frag_beans:    { recipe: buildAmmoRecipe(2, { 'af:aluminium_ingot': 1, gunpowder: 5, iron_nugget: 1 }, { dz: {} }), yield: 1 },
    // Smoke Beans: aluminium + white_dye (crafteo original Beans)
    smoke_beans:   { recipe: buildAmmoRecipe(1, { iron_ingot: 5, coal: 16 }, { dz: {} }), yield: 1 },
    // Stun Beans: aluminium + glowstone (crafteo original Beans)
    stun_beans:    { recipe: buildAmmoRecipe(1, { iron_ingot: 5, redstone: 24 }, { dz: {} }), yield: 1 },
};

// Descripciones de granadas — arriba de los materiales
const GRENADE_DESCS = {
    pipe_bomb:
        '§l§cPipe Bomb §7§r\n' +
        '§aRompe bloques: SI §7(radio 1-4, suerte)\n' +
        '§7Explosivo artesanal de baja potencia.\n' +
        '§7Util para destruir barricadas ligeras.\n\n',
    frag_dz:
        '§l§cGranada Frag §7§r\n' +
        '§aRompe bloques: SI §7(radio 4-6, profundidad 2 con suerte)\n' +
        '§7Granada fragmentation de potencia media.\n' +
        '§7Eficaz contra infanteria y estructuras debiles.\n\n',
    c4:
        '§l§4C4 §7§r\n' +
        '§aRompe bloques: SI §7(radio 5-6, profundidad 2)\n' +
        '§7El explosivo mas potente del DZ. Destruye\n' +
        '§7estructuras y mata a todo lo cercano.\n' +
        '§7Usar con extrema precaucion.\n\n',
    flash_dz:
        '§l§eFlash §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Cega y aturde a enemigos cercanos por\n' +
        '§7unos segundos. Ideal para asaltos rapidos.\n\n',
    smoke_dz:
        '§l§7Humo §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Genera una cortina de humo para cubrir\n' +
        '§7movimientos o retiros bajo fuego.\n\n',
    nerve:
        '§l§2Gas Nervioso §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Libera gas toxico. Envenena y debilita a\n' +
        '§7enemigos en el area. Cubrirse con mascara.\n\n',
    frag_beans:
        '§l§cGranada Frag §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Granada de fragmentacion de uso tactico.\n' +
        '§7Alta eficacia contra infanteria. Sin dano\n' +
        '§7a estructuras — ideal para PvP.\n\n',
    smoke_beans:
        '§l§7Humo §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Cortina de humo tactica. Util para cubrir\n' +
        '§7reposicionamiento en combate PvP.\n\n',
    stun_beans:
        '§l§eAturdidora §7§r\n' +
        '§cRompe bloques: NO\n' +
        '§7Aturde y ciega temporalmente. Perfecta\n' +
        '§7para inutilizar enemigos antes de asaltar.\n\n',
};

function grenadesMenu(player) {
    new ActionFormData()
        .title('§l§cExplosivos')
        .body('§r§7Granadas y explosivos:\n§r§8§oRompen bloques = daño estructural')
        // DZ — rompen bloques
        .button('§l§cPipe Bomb ',         'textures/items/grenade/pipe_bomb')
        .button('§l§cGranada Frag ',       'textures/items/grenade/frag_grenade')
        .button('§l§4C4 ',                 'textures/items/grenade/c4_explosive')
        // DZ — no rompen
        .button('§l§eFlash ',              'textures/items/grenade/stun_grenade')
        .button('§l§7Humo ',               'textures/items/grenade/smoke_grenade')
        .button('§l§2Gas Nervioso ',       'textures/items/grenade/nerve_grenade')
        // Beans — no rompen
        .button('§l§cGranada Frag ',    'textures/items/grenade_frag')
        .button('§l§7Humo ',            'textures/items/grenade_smoke')
        .button('§l§eAturdidora ',      'textures/items/grenade_stun')
        .show(player)
        .then(res => {
            if (res.canceled) { ammoMainMenu(player); return; }
            const map = [
                ['pipe_bomb',   'Pipe Bomb',          'mcpe:pipe_bomb'],
                ['frag_dz',     'Granada Frag DZ',    'mcpe:frag_grenade'],
                ['c4',          'C4 Explosivo',       'mcpe:c4_explosive'],
                ['flash_dz',    'Flash',              'mcpe:flash_grenade'],
                ['smoke_dz',    'Humo DZ',            'mcpe:smoke_grenade'],
                ['nerve',       'Gas Nervioso',       'mcpe:nerve_grenade'],
                ['frag_beans',  'Granada Frag Beans', 'af:grenade_frag'],
                ['smoke_beans', 'Humo Beans',         'af:grenade_smoke'],
                ['stun_beans',  'Aturdidora Beans',   'af:grenade_stun'],
            ];
            const [key, title, id] = map[res.selection];
            grenadeConfirm(player, key, title, id);
        });
}

function grenadeConfirm(player, key, title, id) {
    const entry = GRENADE_RECIPES[key];
    const desc  = GRENADE_DESCS[key] ?? '';
    new ActionFormData()
        .title(`§l§c${title} §r§7[T${entry.recipe.tier}]`)
        .body(desc + describeRecipe(entry.recipe, player) + `\n§7Produce: ${entry.yield}x ${title}§r`)
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { grenadesMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, entry.recipe, id, entry.yield, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} obtenida.`);
                    grenadesMenu(player);
                });
            } else { grenadesMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  MENÚ PRINCIPAL — MESA DE BALAS
// ═══════════════════════════════════════════════════════════════════
function ammoMainMenu(player) {
    new ActionFormData()
        .title('§l§6Mesa de Balas')
        .body('§r§7Selecciona una categoría:')
        .button('§l§fBalas',          'textures/items/m885')
        .button('§l§cMun. Vehículos', 'textures/items/missile_air')
        .button('§l§eMateriales',     'textures/items/steel_ingot')
        .button('§l§bMinas',          'textures/items/place_antitank_mine')
        .button('§l§cExplosivos',     'textures/items/grenade/frag_grenade')
        .show(player)
        .then(res => {
            if (res.canceled) return;
            if (res.selection === 0) craftammo(player);
            else if (res.selection === 1) vehicleAmmoMenu(player);
            else if (res.selection === 2) materialsMenu(player);
            else if (res.selection === 3) minesMenu(player);
            else grenadesMenu(player);
        });
}

// ─── Balas ───────────────────────────────────────────────────────────────────
function craftammo(player) {
    new ActionFormData()
        .title('§l§fBalas')
        .button('5.56x45mm',    'textures/items/m885')
        .button('9x19mm',       'textures/items/9mm')
        .button('.45 ACP',      'textures/items/45acp')
        .button('.50 AE',       'textures/items/50ae')
        .button('12 Gauge',     'textures/items/12gauge')
        .button('5.7x28mm',     'textures/items/5728mm')
        .button('.308 Win',     'textures/items/308win')
        .button('RPG Rocket',   'textures/items/rpgrocket')
        .button('.308 Lapua',   'textures/items/lapua308')
        .button('7.62x39mm',    'textures/items/m43')
        .button('4.6x30mm',     'textures/items/4630mm')
        .button('.357 Mag',     'textures/items/357mag')
        .button('5.8x42mm',     'textures/items/5842mm')
        .button('.308 Win Box', 'textures/items/308winbox')
        .show(player)
        .then(res => {
            if (res.canceled) { ammoMainMenu(player); return; }
            const fns = [mm556c,mm9c,acp45c,ae50c,gauge12c,mm5728c,win308c,
                         rpgrocketec,lapua308c,m43c,mm4630c,mag357c,mm5842c,win308boxc];
            if (fns[res.selection]) fns[res.selection](player);
        });
}

function craftConfirm(player, key, title, id) {
    const entry = RECIPES[key];
    new ActionFormData()
        .title(`§l§f${t(player,'crafting')}: ${title} §r§7[T${entry.recipe.tier}]`)
        .body(describeRecipe(entry.recipe, player) + `\n§7${t(player,'produces')}: ${entry.yield}x ${title}§r`)
        .button(`§l§a${t(player,'confirm')}`)
        .button(`§l§c${t(player,'cancel')}`)
        .show(player)
        .then(res => {
            if (res.canceled) { craftammo(player); return; }
            if (res.selection === 0) {
                executeCraft(player, entry.recipe, id, entry.yield, ok => {
                    if (ok) player.sendMessage(`§a§l✓ §r§a${entry.yield}x ${title} ${t(player,'craftedAmmo')}`);
                    craftammo(player);
                });
            } else { craftammo(player); }
        });
}

function mm556c(p)      { craftConfirm(p,'mm556',    '5.56x45mm',    'krep:mm556'); }
function mm9c(p)        { craftConfirm(p,'mm9',      '9x19mm',       'krep:mm9'); }
function acp45c(p)      { craftConfirm(p,'acp45',    '.45 ACP',      'krep:acp45'); }
function ae50c(p)       { craftConfirm(p,'ae50',     '.50 AE',       'krep:ae50'); }
function gauge12c(p)    { craftConfirm(p,'gauge12',  '12 Gauge',     'krep:12gauge'); }
function mm5728c(p)     { craftConfirm(p,'mm5728',   '5.7x28mm',     'krep:mm5728'); }
function win308c(p)     { craftConfirm(p,'win308',   '.308 Win',     'krep:win308'); }
function win308boxc(p)  { craftConfirm(p,'win308box','.308 Win Box', 'krep:win308box'); }
function rpgrocketec(p) { craftConfirm(p,'rpgrockete','RPG Rocket',  'krep:rpgrocket'); }
function lapua308c(p)   { craftConfirm(p,'lapua308', '.308 Lapua',   'krep:lapua338'); }
function m43c(p)        { craftConfirm(p,'m43',      '7.62x39mm',    'krep:m43'); }
function mm4630c(p)     { craftConfirm(p,'mm4630',   '4.6x30mm',     'krep:mm4630'); }
function mag357c(p)     { craftConfirm(p,'mag357',   '.357 Mag',     'krep:mag357'); }
function mm5842c(p)     { craftConfirm(p,'mm5842',   '5.8x42mm',     'krep:mm5842'); }

// ═══════════════════════════════════════════════════════════════════
//  MUNICIÓN DE VEHÍCULOS
// ═══════════════════════════════════════════════════════════════════
function vehicleAmmoMenu(player) {
    new ActionFormData()
        .title('§l§cMun. Vehículos')
        .button('§l§7Casco HE',              'textures/items/he_shell')
        .button('§l§7Casco AP',              'textures/items/ap_shell')
        .button('§l§7Casco SP',              'textures/items/sp_shell')
        .button('§l§7Cinturón HE §r§7(×4)',  'textures/items/he_belt')
        .button('§l§7Cinturón AP §r§7(×4)',  'textures/items/ap_belt')
        .button('§l§7Misil Aire',            'textures/items/missile_air')
        .button('§l§7Misil Tierra',          'textures/items/missile_ground')
        .button('§l§7Cohete Hydra §r§7(×2)', 'textures/items/ground_rocket')
        .button('§l§7Torpedo',               'textures/items/torpedo')
        .button('§l§7Misil Guiado',          'textures/items/guided_missile')
        .button('§l§7Bomba GP',              'textures/items/generalpurpose_bomb')
        .button('§l§7Bomba Bunker',          'textures/items/bunkerbuster_bomb_item')
        .button('§l§cTermobárica',           'textures/items/thermobaric_bomb_item')
        .button('§l§4Bomba Nuclear §r§7[T5]','textures/items/b61_nuke_item')
        .show(player)
        .then(res => {
            if (res.canceled) { ammoMainMenu(player); return; }
            const map = [
                ['he_shell',      'Casco HE',         'af:he_shell'],
                ['ap_shell',      'Casco AP',         'af:ap_shell'],
                ['sp_shell',      'Casco SP',         'af:sp_shell'],
                ['he_belt',       'Cinturón HE',      'af:he_belt'],
                ['ap_belt',       'Cinturón AP',      'af:ap_belt'],
                ['missile_air',   'Misil Aire',       'af:missile_air'],
                ['missile_ground','Misil Tierra',     'af:missile_ground'],
                ['hydra_rocket',  'Cohete Hydra',     'af:hydra_rocket'],
                ['torpedo',       'Torpedo',          'af:torpedo'],
                ['guided_missile','Misil Guiado',     'af:guided_missile'],
                ['gp_bomb',       'Bomba GP',         'af:generalpurpose_bomb'],
                ['bb_bomb',       'Bomba Bunker',     'af:bunkerbuster_bomb_item'],
                ['thermo_bomb',   'Termobárica',      'af:thermobaric_bomb_item'],
                ['nuke',          'Bomba Nuclear',    'af:b61_nuke_item'],
            ];
            const [key, title, id] = map[res.selection];
            vehicleAmmoConfirm(player, key, title, id);
        });
}

function vehicleAmmoConfirm(player, key, title, id) {
    const entry = VEHICLE_AMMO_RECIPES[key];

    // Descripciones por item — aparecen arriba de los materiales
    const AMMO_DESCS = {
        he_shell:
            '§l§6Casco HE Buen radio de explosionr\n' +
            '§7Rompe bloques: §aSI §7( )\n' +
            '§7Vehiculos: §fD-20 Petrov, M114 Locum, M1A1, T-90M,\n' +
            '§f         T-72A, M551, Leopard 2A4, BMPT-72\n' +
            '§7Uso: Proyectil de alta explosion. Letal contra\n' +
            'infanteria y estructuras. Menor penetracion que AP.\n\n',
        ap_shell:
            '§l§6Casco AP (Perforante)§r\n' +
            '§7Rompe bloques: §cNO\n' +
            '§7Vehiculos: §fD-20 Petrov, M114 Locum, M1A1, T-90M,\n' +
            '§f         T-72A, M551, Leopard 2A4\n' +
            '§7Uso: Alta penetracion de blindaje. Ideal contra\n' +
            'tanques y vehiculos acorazados. Sin explosion.\n\n',
        sp_shell:
            '§l§6Casco SP (Precision)§r\n' +
            '§7Rompe bloques: §cNO\n' +
            '§7Vehiculos: §fD-20 Petrov, M114 Locum\n' +
            '§7Uso: Proyectil de precision guiado. Para strikes\n' +
            'quirurgicos a larga distancia. Baja explosion.\n\n',
        he_belt:
            '§l§6Cinturon HE (x4)§r\n' +
            '§7Rompe bloques: §aSI §7(No rompe mucho pero tiene muchas balas juntas hacen mucho)\n' +
            '§7Vehiculos: §fM2A2 Bradley, BMPT-72 Terminator,\n' +
            '§f         Type 142A, Proyecto 1241\n' +
            '§7Uso: Municion de autocannon. Cadencia alta.\n' +
            'Eficaz contra infanteria y veh. ligeros.\n\n',
        ap_belt:
            '§l§6Cinturon AP (x4)§r\n' +
            '§7Rompe bloques: §cNO\n' +
            '§7Vehiculos: §fM2A2 Bradley, BMPT-72, navales con canon\n' +
            '§7Uso: Rafaga perforante. Pensado para veh. medianos\n' +
            'y blindados ligeros. Sin explosion.\n\n',
        missile_air:
            '§l§6Misil Aire§r\n' +
            '§7Rompe bloques: §aSI §7(power 3 — destruccion moderada)\n' +
            '§7Vehiculos: §fF-16, F-22, F-35, Su-57, J-20, MiG-29,\n' +
            '§f         F-18, Su-33, F-14, NASAMS, SAM Turret\n' +
            '§7Uso: Misil aire-aire y SAM. Guiado. Para derribar\n' +
            'aeronaves. También efectivo contra tierra.\n\n',
        missile_ground:
            '§l§6Misil Tierra§r\n' +
            '§7Rompe bloques: §aSI §7(Talvez no rompa mucho pero talvez si perfora?)\n' +
            '§7Vehiculos: §fM142 HIMARS, BM-30, su57 y cazas con\n' +
            '§f         sistema de ataque a tierra\n' +
            '§7Uso: Misil largo alcance tierra-tierra. Guiado.\n' +
            'Destruye vehiculos, estructuras y posiciones.\n\n',
        hydra_rocket:
            '§l§6Cohete Hydra (x2)§r\n' +
            '§7Rompe bloques: §aSI §7(el que mas radio tiene! con el vehiculo correcto puedes desaparecer una base...)\n' +
            '§7Para balancear: §7archivo hydra_rocket.json,\n' +
            '§7               campo power en minecraft:explode\n' +
            '§7Vehiculos: §fAH-64 Apache, Mi-24 Hind, M142 HIMARS,\n' +
            '§f         A-10 Thunderbolt, Su-25, cazas con pod Hydra\n' +
            '§7Uso: Cohete no guiado. Alta cadencia. Excelente\n' +
            'contra grupos de infanteria e infanteria mecanizada.\n\n',
        torpedo:
            '§l§6Torpedo§r\n' +
            '§7Rompe bloques: §aSI §7(explosion bajo el agua)\n' +
            '§7Vehiculos: §fProyecto 677 (submarino), A-19,\n' +
            '§f         Type 142A, Proyecto 1241\n' +
            '§7Uso: Proyectil submarino. Devastador contra\n' +
            'embarcaciones. Solo efectivo en agua.\n\n',
        guided_missile:
            '§l§6Misil Guiado§r\n' +
            '§7Rompe bloques: §aSI §7(power 3)\n' +
            '§7Para balancear: §7archivo guided_missile.json,\n' +
            '§7               campo power en minecraft:explode\n' +
            '§7Vehiculos: §fM2A2 Bradley, BMPT-72, cazas avanzados,\n' +
            '§f         casi todos los vehiculos con sistema GM\n' +
            '§7Uso: Misil guiado ATGM. Rastreo de objetivos.\n' +
            'El mas preciso del juego. Muy alto dano.\n\n',
        gp_bomb:
            '§l§6Bomba GP (Proposito General)§r\n' +
            '§7Rompe bloques: §aSI §7(explosion grande)\n' +
            '§7Vehiculos: §fB-2 Spirit, Tu-160, Su-57, F-35A,\n' +
            '§f         cualquier bombardero/caza con bahia de bombas\n' +
            '§7Uso: Bomba de caida libre. Ancho radio de explosion.\n' +
            'Ideal para bombardeo en area.\n\n',
        bb_bomb:
            '§l§6Bomba Bunker§r\n' +
            '§7Rompe bloques: §aSI §7(penetra bunkers y estructuras)\n' +
            '§7Vehiculos: §fB-2 Spirit, Tu-160, cazas pesados\n' +
            '§7Uso: Penetra estructuras antes de explotar.\n' +
            'Muy eficaz contra bases y fortines.\n\n',
        thermo_bomb:
            '§l§4Bomba Termobárica§r\n' +
            '§7Rompe bloques: §aSI §7(explosion masiva de fuego)\n' +
            '§7Vehiculos: §fB-2 Spirit, Tu-160\n' +
            '§7Uso: Explosion de presion y fuego. Area enorme.\n' +
            'Devastadora. Solo usar en zonas hostiles.\n\n',
        nuke:
            '§l§4Bomba Nuclear B61§r §8[EXTREMO]\n' +
            '§7Rompe bloques: §4SI §7(destruccion masiva)\n' +
            '§7Vehiculos: §fB-2 Spirit (bahia nuclear)\n' +
            '§7Uso: Arma nuclear tactica. Radio de destruccion\n' +
            'enorme. Radiacion persistente. Usar con extrema\n' +
            'precaucion. Solo para raids de alto nivel.\n\n',
    };

    const desc = AMMO_DESCS[key] ?? '';
    new ActionFormData()
        .title(`§l§c${title} §r§7[T${entry.recipe.tier}]`)
        .body(desc + describeRecipe(entry.recipe, player) + `\n§7Produce: ${entry.yield}x ${title}§r`)
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player)
        .then(res => {
            if (res.canceled) { vehicleAmmoMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, entry.recipe, id, entry.yield, ok => {
                    if (ok) player.sendMessage(`§a§l✓ §r§a${title} crafteado.`);
                    vehicleAmmoMenu(player);
                });
            } else { vehicleAmmoMenu(player); }
        });
}

// ═══════════════════════════════════════════════════════════════════
//  MATERIALES
// ═══════════════════════════════════════════════════════════════════
function materialsMenu(player) {
    new ActionFormData()
        .title('§l§eMateriales')
        .button('§l§7Acero §r§7(×4)',            'textures/items/steel_ingot')
        .button('§l§7Aluminio §r§7(×4)',          'textures/items/aluminium_ingot')
        .button('§l§7Titanio §r§7(×2)',           'textures/items/titanium_ingot')
        .button('§l§7Petróleo Crudo',             'textures/items/oil_bucket')
        .button('§l§7Combustible Refinado',       'textures/items/refined_oil_bucket')
        .button('§l§aUranio Bruto §r§7(×2)',      'textures/items/raw_uranium')
        .button('§l§aPepita Uranio §r§7(×4)',     'textures/items/uranium_nugget')
        .button('§l§aLingote Uranio',             'textures/items/uranium_ingot')
        .button('§l§aBarra Uranio',               'textures/items/uranium_rod')
        .button('§l§cNúcleo Uranio',              'textures/items/uranium_core')
        .button('§l§4Implosivo Uranio §r§7[T4]',  'textures/items/uranium_implosive')
        .show(player)
        .then(res => {
            if (res.canceled) { ammoMainMenu(player); return; }
            const map = [
                ['steel',         'Acero',               'af:steel_ingot',       4],
                ['aluminium',     'Aluminio',            'af:aluminium_ingot',    4],
                ['titanium',      'Titanio',             'af:titanium_ingot',     2],
                ['oil_bucket',    'Petróleo Crudo',      'af:oil_bucket',         1],
                ['refined_oil',   'Combustible Ref.',    'af:refined_oil_bucket', 1],
                ['raw_uranium',   'Uranio Bruto',        'af:raw_uranium',        2],
                ['uranium_nugget','Pepita Uranio',       'af:uranium_nugget',     4],
                ['uranium_ingot', 'Lingote Uranio',      'af:uranium_ingot',      1],
                ['uranium_rod',   'Barra Uranio',        'af:uranium_rod',        1],
                ['uranium_core',  'Núcleo Uranio',       'af:uranium_core',       1],
                ['uranium_impl',  'Implosivo Uranio',    'af:uranium_implosive',  1],
            ];
            const [key, title, id, qty] = map[res.selection];
            materialConfirm(player, key, title, id, qty);
        });
}

function materialConfirm(player, key, title, id, qty) {
    const entry = MAT_RECIPES[key];
    new ActionFormData()
        .title(`§l§e${title} §r§7[T${entry.recipe.tier}]`)
        .body(describeRecipe(entry.recipe, player) + `\n§7Produce: ${qty}x ${title}§r`)
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player)
        .then(res => {
            if (res.canceled) { materialsMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, entry.recipe, id, qty, ok => {
                    if (ok) player.sendMessage(`§a§l✓ §r§a${qty}x ${title} obtenido.`);
                    materialsMenu(player);
                });
            } else { materialsMenu(player); }
        });
}

// ─── Trigger ─────────────────────────────────────────────────────────────────
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.hasTag('krep:craftammo')) {
            system.run(() => {
                ammoMainMenu(player);
                player.runCommandAsync('tag @s remove krep:craftammo');
            });
        }
    }
}, 20);

// ═══════════════════════════════════════════════════════════════════
//  MINAS
// ═══════════════════════════════════════════════════════════════════
const MINE_RECIPES = {
    // Mina antitanque: T3 — hierro + pólvora + plástico explosivo + acero + caja de clavos
    antitank_mine: { recipe: buildAmmoRecipe(3,
        { iron_ingot: 8, gunpowder: 5, 'af:steel_ingot': 2, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:nail_box': 1 } }), yield: 1 },
    // Mina naval: T3 — más hierro y pólvora, cinta adhesiva para impermeabilizar
    naval_mine:    { recipe: buildAmmoRecipe(3,
        { iron_ingot: 8, gunpowder: 5, 'af:steel_ingot': 2, 'mcpe:plastic_explosive': 1 },
        { dz: { 'mcpe:nail_box': 1} }), yield: 1 },
};

function minesMenu(player) {
    new ActionFormData()
        .title('§l§bMinas')
        .body('§r§7Explosivos de area:')
        .button('§l§7Mina Antitanque', 'textures/items/place_antitank_mine')
        .button('§l§7Mina Naval',      'textures/items/place_naval_mine')
        .show(player)
        .then(res => {
            if (res.canceled) { ammoMainMenu(player); return; }
            const map = [
                ['antitank_mine', 'Mina Antitanque', 'af:antitank_mine_spawn_egg'],
                ['naval_mine',    'Mina Naval',      'af:naval_mine_spawn_egg'],
            ];
            const [key, title, id] = map[res.selection];
            mineConfirm(player, key, title, id);
        });
}

function mineConfirm(player, key, title, id) {
    const entry = MINE_RECIPES[key];
    const descs = {
        antitank_mine:
            '§l§6Mina Antitanque§r\n' +
            '§7Se entierra en el suelo. Se activa al ser pisada\n' +
            'por vehiculos o jugadores. Explosion grande que destruye\n' +
            'ruedas y orugas. Usa con cuidado: danara a aliados.\n\n',
        naval_mine:
            '§l§6Mina Naval§r\n' +
            '§7Se coloca en agua. Explota al contacto con cualquier\n' +
            'embarcacion. Alta potencia: hunde botes ligeros de\n' +
            'un golpe y dana fragatas. No la pongas cerca de tu barco.\n\n',
    };
    new ActionFormData()
        .title(`§l§b${title} §r§7[T${entry.recipe.tier}]`)
        .body((descs[key] ?? '') + describeRecipe(entry.recipe, player) + `\n§7Produce: ${entry.yield}x ${title}§r`)
        .button('§l§aConfirmar')
        .button('§l§cCancelar')
        .show(player).then(res => {
            if (res.canceled) { minesMenu(player); return; }
            if (res.selection === 0) {
                executeCraft(player, entry.recipe, id, entry.yield, ok => {
                    if (ok) player.sendMessage(`§a§l+ §r§a${title} crafteada.`);
                    minesMenu(player);
                });
            } else { minesMenu(player); }
        });
}
