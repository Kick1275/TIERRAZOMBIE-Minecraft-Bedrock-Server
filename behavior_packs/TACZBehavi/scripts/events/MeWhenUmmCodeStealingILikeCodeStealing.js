import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { buildRecipe, describeRecipe, executeCraft, t } from '../global/craftingEconomy';

// Recetas v3.0 - balanceadas a ~75% del precio de compra del NPC Ingeniero,
// usando los materiales reales de DeadZone y desgaste real de herramientas
// (ver behavior_packs/DeadZzoneBP scripts/TZ/scripts/Entidades/Npc_Ingeniero.js).
const RECIPES = {
    // ── Tier 1 (NPC buy < 20,000) ───────────────────────────────────────────
    g17: buildRecipe(1, { iron_ingot: 70, copper_ingot: 15 }),
    m1911: buildRecipe(1, { iron_ingot: 65, log: 8 }),
    p320: buildRecipe(1, { iron_ingot: 70, gold_ingot: 8 }),
    b93: buildRecipe(1, { iron_ingot: 60, log: 8, lapis_lazuli: 6 }),
    uzi: buildRecipe(1, { iron_ingot: 80, copper_ingot: 10 }),
    g18: buildRecipe(1, { iron_ingot: 55, copper_ingot: 10 }),
    db: buildRecipe(1, { iron_ingot: 45, log: 20 }),

    // ── Tier 2 (20,000 - 45,000) ─────────────────────────────────────────────
    deagle: buildRecipe(2, { iron_ingot: 90, gold_ingot: 15, diamond: 4 }),
    mp5: buildRecipe(2, { iron_ingot: 85, lapis_lazuli: 8 }),
    vector: buildRecipe(2, { iron_ingot: 90, gold_ingot: 10, lapis_lazuli: 10 }),
    p90: buildRecipe(2, { iron_ingot: 95, gold_ingot: 10, diamond: 2 }),
    m16a1: buildRecipe(2, { iron_ingot: 90, lapis_lazuli: 10, log: 14 }),
    m16: buildRecipe(2, { iron_ingot: 95, lapis_lazuli: 12, log: 14 }),
    m870: buildRecipe(2, { iron_ingot: 70, log: 25 }),
    mp7: buildRecipe(2, { iron_ingot: 90, gold_ingot: 12, diamond: 2 }),
    deagleg: buildRecipe(2, { iron_ingot: 90, gold_ingot: 28, diamond: 4 }),
    ump: buildRecipe(2, { iron_ingot: 95, gold_ingot: 10 }),
    t50: buildRecipe(2, { iron_ingot: 85, gold_ingot: 12, diamond: 2 }),
    cp: buildRecipe(2, { iron_ingot: 80, gold_ingot: 12, lapis_lazuli: 5 }),

    // ── Tier 3 (45,000 - 70,000) ─────────────────────────────────────────────
    hk416: buildRecipe(3, { iron_ingot: 90, gold_ingot: 18, diamond: 3 }),
    g3: buildRecipe(3, { iron_ingot: 100, gold_ingot: 14 }),
    aa12: buildRecipe(3, { iron_ingot: 90, diamond: 10, gold_ingot: 14 }),
    akm: buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 12, log: 16 }),
    m4a1: buildRecipe(3, { iron_ingot: 100, gold_ingot: 16, diamond: 4 }),
    g36: buildRecipe(3, { iron_ingot: 90, log: 18 }),
    saiga12: buildRecipe(3, { iron_ingot: 70, lapis_lazuli: 4 }),
    qbz95: buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 12, log: 14 }),
    sks: buildRecipe(3, { iron_ingot: 95, lapis_lazuli: 14, log: 20 }),
    qbz191: buildRecipe(3, { iron_ingot: 100, lapis_lazuli: 16, gold_ingot: 10 }),
    type81: buildRecipe(3, { iron_ingot: 90, log: 16, gold_ingot: 6 }),
    m1014: buildRecipe(3, { iron_ingot: 95, gold_ingot: 14, diamond: 2, lapis_lazuli: 4 }),

    // ── Tier 4 (70,000 - 150,000) ────────────────────────────────────────────
    scarh: buildRecipe(4, { iron_ingot: 150, gold_ingot: 32, diamond: 6 }),
    scarl: buildRecipe(4, { iron_ingot: 120, gold_ingot: 25, diamond: 4 }),
    fal: buildRecipe(4, { iron_ingot: 130, gold_ingot: 28, diamond: 5 }),
    mk14: buildRecipe(4, { iron_ingot: 120, gold_ingot: 35, diamond: 6 }),

    // ── Tier 5 (> 150,000) ───────────────────────────────────────────────────
    evolys: buildRecipe(5, { iron_ingot: 200, gold_ingot: 32, diamond: 8 }),
    m249: buildRecipe(5, { iron_ingot: 200, gold_ingot: 35, diamond: 8 }),
    awp: buildRecipe(5, { iron_ingot: 300, gold_ingot: 60, diamond: 15 }),
    minigun: buildRecipe(5,
        { iron_ingot: 500, gold_ingot: 80, diamond: 40 },
        { dz: { 'mcpe:electric_scrap': 5, 'mcpe:nail_box': 3, 'mcpe:detonator': 2, 'mcpe:duct_tape': 3, 'mcpe:plastic_explosive': 1 } }
    ),
    rpg: buildRecipe(5,
        { iron_ingot: 100, gold_ingot: 60, diamond: 20, log: 20 },
        { dz: { 'mcpe:electric_scrap': 2, 'mcpe:plastic_explosive': 2, 'mcpe:nail_box': 2, 'mcpe:detonator': 2, 'mcpe:duct_tape': 2 } }
    ),
};

function craft(player) {
    let form = new ActionFormData();
    form.title(t(player, 'craftWeaponsTitle'));
    form.body(t(player, 'selectWeapon'));
    form.button('Desert Eagle', 'textures/items/deagle');
    form.button('MP5', 'textures/items/mp5');
    form.button('Vector', 'textures/items/vector');
    form.button('P90', 'textures/items/p90');
    form.button('M16A1', 'textures/items/m16a1');
    form.button('M16', 'textures/items/m16');
    form.button('HK416', 'textures/items/hk416');
    form.button('SCAR-H', 'textures/items/scarh');
    form.button('G3', 'textures/items/g3');
    form.button('AA-12', 'textures/items/aa12');
    form.button('RPG', 'textures/items/rpg');
    form.button('M870', 'textures/items/m870');
    form.button('AWP', 'textures/items/awp');
    form.button('G17', 'textures/items/g17');
    form.button('M1911', 'textures/items/m1911');
    form.button('AKM', 'textures/items/akm');
    form.button('M4A1', 'textures/items/m4a1');
    form.button('SCAR-L', 'textures/items/scarl');
    form.button('G36K', 'textures/items/g36');
    form.button('MP7', 'textures/items/mp7');
    form.button('M134 Minigun', 'textures/items/minigun');
    form.button('UZI', 'textures/items/uzi');
    form.button('G18', 'textures/items/g18');
    form.button('Double Barrel', 'textures/items/db');
    form.button('Deagle Gold', 'textures/items/deagleg');
    form.button('Saiga-12', 'textures/items/saiga12');
    form.button('FAL', 'textures/items/fal');
    form.button('QBZ-95', 'textures/items/qbz95');
    form.button('UMP', 'textures/items/ump');
    form.button('B93R', 'textures/items/b93r');
    form.button('SKS', 'textures/items/sks');
    form.button('MK14', 'textures/items/mk14');
    form.button('QBZ-191', 'textures/items/qbz191');
    form.button('Type 81', 'textures/items/type81');
    form.button('Evolys', 'textures/items/evolys');
    form.button('M249', 'textures/items/m249');
    form.button('Timeless 50', 'textures/items/t50');
    form.button('CP', 'textures/items/cp');
    form.button('M1014', 'textures/items/m1014');
    form.button('P320', 'textures/items/p320');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: deaglec(player); break;
            case 1: mp5c(player); break;
            case 2: vectorc(player); break;
            case 3: p90c(player); break;
            case 4: m16a1c(player); break;
            case 5: m16c(player); break;
            case 6: hk416c(player); break;
            case 7: scarhc(player); break;
            case 8: g3c(player); break;
            case 9: aa12c(player); break;
            case 10: rpgc(player); break;
            case 11: m870c(player); break;
            case 12: awpc(player); break;
            case 13: g17c(player); break;
            case 14: m1911c(player); break;
            case 15: akmc(player); break;
            case 16: m4a1c(player); break;
            case 17: scarlc(player); break;
            case 18: g36c(player); break;
            case 19: mp7c(player); break;
            case 20: minigunc(player); break;
            case 21: uzic(player); break;
            case 22: g18c(player); break;
            case 23: dbc(player); break;
            case 24: deaglegc(player); break;
            case 25: saiga12c(player); break;
            case 26: falc(player); break;
            case 27: qbz95c(player); break;
            case 28: umpc(player); break;
            case 29: b93c(player); break;
            case 30: sksc(player); break;
            case 31: mk14c(player); break;
            case 32: qbz191c(player); break;
            case 33: type81c(player); break;
            case 34: evolysc(player); break;
            case 35: m249c(player); break;
            case 36: t50c(player); break;
            case 37: cpc(player); break;
            case 38: m1014c(player); break;
            case 39: p320c(player); break;
            default: break;
        }
    });
}

// Confirmacion + ejecucion generica para cualquier receta de arma del mapa RECIPES.
function craftConfirm(player, key, title, giveItemId) {
    const recipe = RECIPES[key];
    let form = new ActionFormData();
    form.title(`${title} - ${t(player, 'crafting')} [T${recipe.tier}]`);
    form.body(describeRecipe(recipe, player));
    form.button(t(player, 'confirm'));
    form.button(t(player, 'cancel'));
    form.show(player).then(response => {
        if (response.canceled) return;
        if (response.selection === 0) {
            executeCraft(player, recipe, giveItemId, null, (ok) => {
                if (ok) player.sendMessage(`§a✓ ${title} ${t(player, 'craftedWeapon')}`);
                craft(player);
            });
        } else if (response.selection === 1) {
            craft(player);
        }
    });
}

function deaglec(player) { craftConfirm(player, 'deagle', 'Desert Eagle', 'krep:deagle'); }
function mp5c(player) { craftConfirm(player, 'mp5', 'MP5', 'krep:mp5'); }
function vectorc(player) { craftConfirm(player, 'vector', 'Vector', 'krep:vector'); }
function p90c(player) { craftConfirm(player, 'p90', 'P90', 'krep:p90'); }
function m16a1c(player) { craftConfirm(player, 'm16a1', 'M16A1', 'krep:m16a1'); }
function m16c(player) { craftConfirm(player, 'm16', 'M16', 'krep:m16'); }
function hk416c(player) { craftConfirm(player, 'hk416', 'HK416', 'krep:hk416'); }
function scarhc(player) { craftConfirm(player, 'scarh', 'SCAR-H', 'krep:scarh'); }
function g3c(player) { craftConfirm(player, 'g3', 'G3', 'krep:g3'); }
function aa12c(player) { craftConfirm(player, 'aa12', 'AA-12', 'krep:aa12'); }
function rpgc(player) { craftConfirm(player, 'rpg', 'RPG', 'krep:rpg'); }
function m870c(player) { craftConfirm(player, 'm870', 'M870', 'krep:m870'); }
function awpc(player) { craftConfirm(player, 'awp', 'AWP', 'krep:awp'); }
function g17c(player) { craftConfirm(player, 'g17', 'G17', 'krep:g17'); }
function m1911c(player) { craftConfirm(player, 'm1911', 'M1911', 'krep:m1911'); }
function akmc(player) { craftConfirm(player, 'akm', 'AKM', 'krep:akm'); }
function m4a1c(player) { craftConfirm(player, 'm4a1', 'M4A1', 'krep:m4a1'); }
function scarlc(player) { craftConfirm(player, 'scarl', 'SCAR-L', 'krep:scarl'); }
function g36c(player) { craftConfirm(player, 'g36', 'G36K', 'krep:g36'); }
function mp7c(player) { craftConfirm(player, 'mp7', 'MP7', 'krep:mp7'); }
function minigunc(player) { craftConfirm(player, 'minigun', 'M134 Minigun', 'krep:minigun'); }
function uzic(player) { craftConfirm(player, 'uzi', 'UZI', 'krep:uzi'); }
function g18c(player) { craftConfirm(player, 'g18', 'G18', 'krep:g18'); }
function dbc(player) { craftConfirm(player, 'db', 'Double Barrel', 'krep:db'); }
function deaglegc(player) { craftConfirm(player, 'deagleg', 'Deagle Gold', 'krep:deagleg'); }
function saiga12c(player) { craftConfirm(player, 'saiga12', 'Saiga-12', 'krep:saiga12'); }
function falc(player) { craftConfirm(player, 'fal', 'FAL', 'krep:fal'); }
function qbz95c(player) { craftConfirm(player, 'qbz95', 'QBZ-95', 'krep:qbz95'); }
function umpc(player) { craftConfirm(player, 'ump', 'UMP', 'krep:ump'); }
function b93c(player) { craftConfirm(player, 'b93', 'Beretta 93R', 'krep:b93r'); }
function sksc(player) { craftConfirm(player, 'sks', 'SKS', 'krep:sks'); }
function mk14c(player) { craftConfirm(player, 'mk14', 'MK14', 'krep:mk14'); }
function qbz191c(player) { craftConfirm(player, 'qbz191', 'QBZ-191', 'krep:qbz191'); }
function type81c(player) { craftConfirm(player, 'type81', 'Type 81', 'krep:type81'); }
function evolysc(player) { craftConfirm(player, 'evolys', 'Evolys', 'krep:evolys'); }
function m249c(player) { craftConfirm(player, 'm249', 'M249', 'krep:m249'); }
function t50c(player) { craftConfirm(player, 't50', 'Timeless 50', 'krep:t50'); }
function cpc(player) { craftConfirm(player, 'cp', 'CP', 'krep:cp'); }
function m1014c(player) { craftConfirm(player, 'm1014', 'M1014', 'krep:m1014'); }
function p320c(player) { craftConfirm(player, 'p320', 'P320', 'krep:p320'); }

system.runInterval(() => {
    for (let player of world.getPlayers()) {
        if (player.hasTag('openui')) {
            system.run(() => {
                craft(player);
                player.runCommandAsync('tag @s remove "openui"');
            });
        }
        if (player.hasTag('openui2')) {
            system.run(() => {
                wip(player);
                player.runCommandAsync('tag @s remove "openui2"');
            });
        }
    }
}, 20);
