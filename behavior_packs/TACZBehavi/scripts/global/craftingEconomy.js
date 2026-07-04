// Motor compartido de crafteo balanceado v3.0 (TACZ + DeadZone)
// Usado por MeWhenUmmCodeStealingILikeCodeStealing.js (armas) y horegJatimKocak.js (municion)

export const TOOLSET_BY_TIER = {
    1: [{ id: 'mcpe:screwdriver', wear: 5 }, { id: 'mcpe:hammer', wear: 3 }],
    2: [{ id: 'mcpe:screwdriver', wear: 8 }, { id: 'mcpe:hammer', wear: 6 }, { id: 'mcpe:hacksaw', wear: 10 }, { id: 'mcpe:wrench', wear: 5 }],
    3: [{ id: 'mcpe:screwdriver', wear: 12 }, { id: 'mcpe:hammer', wear: 10 }, { id: 'mcpe:hacksaw', wear: 20 }, { id: 'mcpe:wrench', wear: 10 }, { id: 'mcpe:pipe_wrench', wear: 8 }],
    4: [{ id: 'mcpe:screwdriver', wear: 18 }, { id: 'mcpe:hammer', wear: 15 }, { id: 'mcpe:hacksaw', wear: 30 }, { id: 'mcpe:wrench', wear: 15 }, { id: 'mcpe:pipe_wrench', wear: 12 }, { id: 'mcpe:crowbar', wear: 8 }, { id: 'mcpe:can_opener', wear: 5 }],
    5: [{ id: 'mcpe:screwdriver', wear: 25 }, { id: 'mcpe:hammer', wear: 20 }, { id: 'mcpe:hacksaw', wear: 40 }, { id: 'mcpe:wrench', wear: 20 }, { id: 'mcpe:pipe_wrench', wear: 18 }, { id: 'mcpe:crowbar', wear: 15 }, { id: 'mcpe:can_opener', wear: 8 }, { id: 'mcpe:lockpick', wear: 5 }],
};

export const DZ_BASE_BY_TIER = {
    1: { 'mcpe:nail_box': 1, 'mcpe:barbed_wire': 3, 'mcpe:spray_can': 1 },
    2: { 'mcpe:nail_box': 1, 'mcpe:sawoff_pipe': 1, 'mcpe:duct_tape': 1, 'mcpe:spray_can': 2 },
    3: { 'mcpe:nail_box': 2, 'mcpe:sawoff_pipe': 1, 'mcpe:electric_scrap': 1, 'mcpe:duct_tape': 1 },
    4: { 'mcpe:electric_scrap': 2, 'mcpe:nail_box': 1, 'mcpe:sawoff_pipe': 1, 'mcpe:detonator': 1 },
    5: { 'mcpe:electric_scrap': 3, 'mcpe:nail_box': 2, 'mcpe:detonator': 1, 'mcpe:duct_tape': 2 },
};

// Set de herramientas/materiales reducido para municion (no se craftea un arma completa)
export const AMMO_TOOLSET_BY_TIER = {
    1: [{ id: 'mcpe:screwdriver', wear: 2 }, { id: 'mcpe:hammer', wear: 2 }],
    2: [{ id: 'mcpe:screwdriver', wear: 3 }, { id: 'mcpe:hammer', wear: 3 }, { id: 'mcpe:hacksaw', wear: 4 }, { id: 'mcpe:wrench', wear: 2 }],
    3: [{ id: 'mcpe:screwdriver', wear: 5 }, { id: 'mcpe:hammer', wear: 4 }, { id: 'mcpe:hacksaw', wear: 8 }, { id: 'mcpe:wrench', wear: 4 }, { id: 'mcpe:pipe_wrench', wear: 3 }],
    4: [{ id: 'mcpe:screwdriver', wear: 7 }, { id: 'mcpe:hammer', wear: 6 }, { id: 'mcpe:hacksaw', wear: 12 }, { id: 'mcpe:wrench', wear: 6 }, { id: 'mcpe:pipe_wrench', wear: 5 }, { id: 'mcpe:crowbar', wear: 3 }, { id: 'mcpe:can_opener', wear: 2 }],
    5: [{ id: 'mcpe:screwdriver', wear: 10 }, { id: 'mcpe:hammer', wear: 8 }, { id: 'mcpe:hacksaw', wear: 16 }, { id: 'mcpe:wrench', wear: 8 }, { id: 'mcpe:pipe_wrench', wear: 7 }, { id: 'mcpe:crowbar', wear: 6 }, { id: 'mcpe:can_opener', wear: 3 }, { id: 'mcpe:lockpick', wear: 2 }],
};

export const AMMO_DZ_BY_TIER = {
    1: { 'mcpe:barbed_wire': 1 },
    2: { 'mcpe:spray_can': 1, 'mcpe:barbed_wire': 2 },
    3: { 'mcpe:nail_box': 1 },
    4: { 'mcpe:nail_box': 1, 'mcpe:duct_tape': 1 },
    5: { 'mcpe:plastic_explosive': 1, 'mcpe:detonator': 1 },
};

// ─── Localizacion (es/en) ───────────────────────────────────────────────────
// El idioma se lee de la misma dynamic property que usa PlugsEssentials
// ("playerSettings" -> { language: "es" | "en" }), por defecto "es".

export function getPlayerLang(player) {
    try {
        const raw = player.getDynamicProperty('playerSettings');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.language === 'en') return 'en';
        }
    } catch {}
    return 'es';
}

const UI_STRINGS = {
    confirm: { es: 'Confirmar', en: 'Confirm' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    needTitle: { es: '¿Estás seguro? Necesitas:', en: 'Are you sure? You need:' },
    dzTag: { es: '(DeadZone)', en: '(DeadZone)' },
    toolsRequired: { es: 'Herramientas requeridas (desgaste):', en: 'Tools required (wear):' },
    craftWeaponsTitle: { es: 'Crafteo de Armas', en: 'Craft Weapons' },
    selectWeapon: { es: 'Selecciona un arma para craftear', en: 'Select a weapon to craft' },
    craftAmmoTitle: { es: 'Crafteo de Munición', en: 'Craft Ammo' },
    selectAmmo: { es: 'Selecciona un tipo de munición', en: 'Select ammo type' },
    crafting: { es: 'Crafteo', en: 'Crafting' },
    produces: { es: 'Produce', en: 'Produces' },
    notEnoughMaterials: { es: 'No tienes suficientes materiales para craftear esto.', en: "You don't have enough materials to craft this." },
    missingTool: { es: 'Te falta la herramienta', en: 'You are missing the tool' },
    withMinDurability: { es: 'con al menos', en: 'with at least' },
    durabilityRemaining: { es: 'de durabilidad restante', en: 'durability remaining' },
    craftedWeapon: { es: 'crafteado exitosamente', en: 'crafted successfully' },
    craftedAmmo: { es: 'crafteadas exitosamente', en: 'crafted successfully' },
};

export function t(player, key) {
    const lang = getPlayerLang(player);
    const entry = UI_STRINGS[key];
    if (!entry) return key;
    return entry[lang] ?? entry.es;
}

const MATERIAL_NAMES = {
    iron_ingot: { es: 'Lingote de Hierro', en: 'Iron Ingot' },
    gold_ingot: { es: 'Lingote de Oro', en: 'Gold Ingot' },
    copper_ingot: { es: 'Lingote de Cobre', en: 'Copper Ingot' },
    diamond: { es: 'Diamante', en: 'Diamond' },
    lapis_lazuli: { es: 'Lapislázuli', en: 'Lapis Lazuli' },
    quartz: { es: 'Cuarzo', en: 'Quartz' },
    blaze_rod: { es: 'Vara de Blaze', en: 'Blaze Rod' },
    netherite_ingot: { es: 'Lingote de Netherita', en: 'Netherite Ingot' },
    log: { es: 'Tronco de Roble', en: 'Oak Log' },
    gunpowder: { es: 'Pólvora', en: 'Gunpowder' },
    iron_nugget: { es: 'Pepita de Hierro', en: 'Iron Nugget' },
    'mcpe:barbed_wire': { es: 'Alambre de Púas', en: 'Barbed Wire' },
    'mcpe:spray_can': { es: 'Lata de Spray', en: 'Spray Can' },
    'mcpe:nail_box': { es: 'Caja de Clavos', en: 'Nail Box' },
    'mcpe:sawoff_pipe': { es: 'Tubo Recortado', en: 'Sawoff Pipe' },
    'mcpe:duct_tape': { es: 'Cinta Adhesiva', en: 'Duct Tape' },
    'mcpe:electric_scrap': { es: 'Chatarra Eléctrica', en: 'Electric Scrap' },
    'mcpe:detonator': { es: 'Detonador', en: 'Detonator' },
    'mcpe:plastic_explosive': { es: 'Explosivo Plástico', en: 'Plastic Explosive' },
    'mcpe:screwdriver': { es: 'Destornillador', en: 'Screwdriver' },
    'mcpe:hammer': { es: 'Martillo', en: 'Hammer' },
    'mcpe:hacksaw': { es: 'Sierra de Mano', en: 'Hacksaw' },
    'mcpe:wrench': { es: 'Llave Inglesa', en: 'Wrench' },
    'mcpe:pipe_wrench': { es: 'Llave de Tubo', en: 'Pipe Wrench' },
    'mcpe:crowbar': { es: 'Palanca', en: 'Crowbar' },
    'mcpe:can_opener': { es: 'Abrelatas', en: 'Can Opener' },
    'mcpe:lockpick': { es: 'Ganzúa', en: 'Lockpick' },
};

export function prettify(id, lang = 'es') {
    const entry = MATERIAL_NAMES[id];
    if (entry) return entry[lang] ?? entry.es;
    const bare = id.includes(':') ? id.split(':')[1] : id;
    return bare.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export function buildRecipe(tier, vanilla, opts = {}) {
    return {
        tier,
        vanilla,
        dz: opts.dz || DZ_BASE_BY_TIER[tier],
        tools: opts.tools || TOOLSET_BY_TIER[tier],
    };
}

export function buildAmmoRecipe(tier, vanilla, opts = {}) {
    return {
        tier,
        vanilla,
        dz: opts.dz || AMMO_DZ_BY_TIER[tier],
        tools: opts.tools || AMMO_TOOLSET_BY_TIER[tier],
    };
}

// Cuenta cuantas unidades de un item tiene el jugador en todo su inventario
// (no solo la mano), para poder mostrar el indicador de "tienes/te falta".
export function countItemInInventory(player, itemId) {
    let total = 0;
    try {
        const inv = player.getComponent('minecraft:inventory')?.container;
        if (!inv) return 0;
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item && item.typeId === itemId) total += item.amount;
        }
    } catch {}
    return total;
}

function materialIndicator(player, id, qty) {
    const have = countItemInInventory(player, id);
    if (have >= qty) return `§a✓ (${have}/${qty})`;
    if (have > 0) return `§e⚠ (${have}/${qty})`;
    return `§c✗ (${have}/${qty})`;
}

// Revisa, sin consumir nada, el estado de cada herramienta requerida:
// 'ok' (hay una con durabilidad suficiente), 'low_durability' (existe pero sin
// durabilidad suficiente) o 'missing' (no hay ninguna en el inventario).
function checkToolStatus(player, tools) {
    let container;
    try { container = player.getComponent('minecraft:inventory').container; } catch { return tools.map(t => ({ ...t, status: 'missing' })); }
    return tools.map(tool => {
        let foundAny = false;
        let bestRemaining = -1;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item || item.typeId !== tool.id) continue;
            foundAny = true;
            const dur = item.getComponent('minecraft:durability');
            if (!dur) continue;
            const remaining = dur.maxDurability - dur.damage;
            if (remaining > bestRemaining) bestRemaining = remaining;
        }
        let status;
        if (!foundAny) status = 'missing';
        else if (bestRemaining >= tool.wear) status = 'ok';
        else status = 'low_durability';
        return { ...tool, status };
    });
}

function toolIndicator(status) {
    if (status === 'ok') return '§a✓';
    if (status === 'low_durability') return '§e⚠';
    return '§c✗';
}

export function describeRecipe(recipe, player) {
    const lang = getPlayerLang(player);
    let body = `${t(player, 'needTitle')}\n\n`;
    for (const [id, qty] of Object.entries(recipe.vanilla)) {
        body += `§7- ${qty}x ${prettify(id, lang)} ${materialIndicator(player, id, qty)}\n`;
    }
    for (const [id, qty] of Object.entries(recipe.dz)) {
        body += `§7- ${qty}x ${prettify(id, lang)} §7${t(player, 'dzTag')}§r ${materialIndicator(player, id, qty)}\n`;
    }
    body += `\n§l${t(player, 'toolsRequired')}§r\n`;
    for (const status of checkToolStatus(player, recipe.tools)) {
        body += `§7- ${prettify(status.id, lang)} §7(-${status.wear} dur)§r ${toolIndicator(status.status)}\n`;
    }
    return body;
}

// Busca en el inventario del jugador una herramienta de cada tipo requerido
// con durabilidad restante suficiente para soportar el desgaste de esta receta.
function findToolSlots(player, tools) {
    const container = player.getComponent('minecraft:inventory').container;
    const found = tools.map(tool => {
        let match = null;
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item || item.typeId !== tool.id) continue;
            const dur = item.getComponent('minecraft:durability');
            if (!dur) continue;
            const remaining = dur.maxDurability - dur.damage;
            if (remaining >= tool.wear) { match = { slot: i, item, dur }; break; }
        }
        return { ...tool, match };
    });
    return { container, found };
}

function applyToolWear(container, found) {
    for (const tool of found) {
        if (!tool.match) continue;
        tool.match.dur.damage += tool.wear;
        container.setItem(tool.match.slot, tool.match.item);
    }
}

// Ejecuta el crafteo: valida herramientas, intenta consumir materiales via comandos
// (mismo patron give+clear que el resto del addon), y aplica desgaste solo si tuvo exito.
export function executeCraft(player, recipe, giveItemId, giveAmount, onResult) {
    const { container, found } = findToolSlots(player, recipe.tools);
    const missing = found.find(t => !t.match);
    if (missing) {
        const lang = getPlayerLang(player);
        player.sendMessage(`§c${t(player, 'missingTool')}: ${prettify(missing.id, lang)} (${t(player, 'withMinDurability')} ${missing.wear} ${t(player, 'durabilityRemaining')}).`);
        onResult(false);
        return;
    }

    const allMats = { ...recipe.vanilla, ...recipe.dz };
    const hasitem = Object.entries(allMats).map(([id, qty]) => `{item=${id},quantity=${qty}..}`).join(',');
    const selector = `@s[hasitem=[${hasitem}]]`;
    const giveCmd = `give ${selector} ${giveItemId}${giveAmount ? ' ' + giveAmount : ''}`;

    player.runCommandAsync(giveCmd).then((res) => {
        if (!res || res.successCount === 0) {
            player.sendMessage(`§c${t(player, 'notEnoughMaterials')}`);
            onResult(false);
            return;
        }
        for (const [id, qty] of Object.entries(allMats)) {
            player.runCommandAsync(`clear ${selector} ${id} 0 ${qty}`);
        }
        applyToolWear(container, found);
        onResult(true);
    }).catch(() => onResult(false));
}
