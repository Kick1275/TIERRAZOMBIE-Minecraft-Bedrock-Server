import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { buildAmmoRecipe, describeRecipe, executeCraft, t } from '../global/craftingEconomy';

// Recetas de municion v3.0 - balanceadas contra el precio por bala del NPC Ingeniero.
// Fix incluido: 4.6x30mm antes craftaba 1 bala, ahora 30 (igual que el resto de calibres).
const RECIPES = {
    // ── Tier 1 ───────────────────────────────────────────────────────────────
    mm9: { recipe: buildAmmoRecipe(1, { copper_ingot: 30, gunpowder: 6, iron_nugget: 15 }), yield: 64 }, // 9x19mm es el calibre de menor daño promedio del juego (~4.9) — máxima generosidad
    acp45: { recipe: buildAmmoRecipe(1, { copper_ingot: 30, gunpowder: 6, iron_nugget: 10 }), yield: 30 },
    gauge12: { recipe: buildAmmoRecipe(1, { copper_ingot: 50, gunpowder: 18, iron_nugget: 50 }), yield: 12 },

    // ── Tier 2 ───────────────────────────────────────────────────────────────
    mm556: { recipe: buildAmmoRecipe(2, { copper_ingot: 45, gunpowder: 9, iron_nugget: 10 }), yield: 30 },
    m43: { recipe: buildAmmoRecipe(2, { copper_ingot: 45, gunpowder: 9, iron_nugget: 5 }), yield: 30 },
    mag357: { recipe: buildAmmoRecipe(2, { copper_ingot: 75, gunpowder: 18 }), yield: 30 },
    mm5728: { recipe: buildAmmoRecipe(2, { copper_ingot: 45, gunpowder: 6, lapis_lazuli: 15 }), yield: 48 },
    mm4630: { recipe: buildAmmoRecipe(2, { copper_ingot: 90, gunpowder: 12, iron_nugget: 3 }), yield: 48 }, // FIX: antes yield 1; ahora igualado a mm5728 (mismo daño promedio ~4 — MP7 vs P90)

    // ── Tier 3 ───────────────────────────────────────────────────────────────
    ae50: { recipe: buildAmmoRecipe(3, { copper_ingot: 90, gunpowder: 21, lapis_lazuli: 15 }), yield: 36 },
    win308: { recipe: buildAmmoRecipe(3, { copper_ingot: 90, gunpowder: 30, lapis_lazuli: 5 }), yield: 20 },
    mm5842: { recipe: buildAmmoRecipe(3, { copper_ingot: 135, gunpowder: 9 }), yield: 30 },
    win308box: { recipe: buildAmmoRecipe(3, { copper_ingot: 90, gunpowder: 30, lapis_lazuli: 3 }), yield: 1 },

    // ── Tier 4 ───────────────────────────────────────────────────────────────
    lapua308: { recipe: buildAmmoRecipe(4, { copper_ingot: 90, gunpowder: 30, lapis_lazuli: 5 }), yield: 30 },

    // ── Tier 5 ───────────────────────────────────────────────────────────────
    rpgrockete: { recipe: buildAmmoRecipe(5, { copper_ingot: 90, gunpowder: 36, iron_ingot: 9 }, { dz: { 'mcpe:plastic_explosive': 2, 'mcpe:detonator': 1 } }), yield: 1 },
};

function craftammo(player) {
    let form = new ActionFormData();
    form.title(t(player, 'craftAmmoTitle'));
    form.body(t(player, 'selectAmmo'));
    form.button('5.56x45mm', 'textures/items/m885');
    form.button('9x19mm', 'textures/items/9mm');
    form.button('.45 ACP', 'textures/items/45acp');
    form.button('.50 AE', 'textures/items/50ae');
    form.button('12 Gauge', 'textures/items/12gauge');
    form.button('5.7x28mm', 'textures/items/5728mm');
    form.button('.308 Win', 'textures/items/308win');
    form.button('RPG Rocket', 'textures/items/rpgrocket');
    form.button('.308 Lapua', 'textures/items/lapua308');
    form.button('7.62x39mm', 'textures/items/m43');
    form.button('4.6x30mm', 'textures/items/4630mm');
    form.button('.357 Mag', 'textures/items/357mag');
    form.button('5.8x42mm', 'textures/items/5842mm');
    form.button('.308 Win Box', 'textures/items/308winbox');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: mm556c(player); break;
            case 1: mm9c(player); break;
            case 2: acp45c(player); break;
            case 3: ae50c(player); break;
            case 4: gauge12c(player); break;
            case 5: mm5728c(player); break;
            case 6: win308c(player); break;
            case 7: rpgrocketec(player); break;
            case 8: lapua308c(player); break;
            case 9: m43c(player); break;
            case 10: mm4630c(player); break;
            case 11: mag357c(player); break;
            case 12: mm5842c(player); break;
            case 13: win308boxc(player); break;
            default: break;
        }
    });
}

// Confirmacion + ejecucion generica para cualquier receta de municion del mapa RECIPES.
function craftConfirm(player, key, title, giveItemId) {
    const entry = RECIPES[key];
    let form = new ActionFormData();
    form.title(`${t(player, 'crafting')}: ${title} [T${entry.recipe.tier}]`);
    form.body(describeRecipe(entry.recipe, player) + `\n§7${t(player, 'produces')}: ${entry.yield}x ${title}§r`);
    form.button(t(player, 'confirm'));
    form.button(t(player, 'cancel'));
    form.show(player).then(response => {
        if (response.canceled) return;
        if (response.selection === 0) {
            executeCraft(player, entry.recipe, giveItemId, entry.yield, (ok) => {
                if (ok) player.sendMessage(`§a✓ ${entry.yield}x ${title} ${t(player, 'craftedAmmo')}`);
                craftammo(player);
            });
        } else if (response.selection === 1) {
            craftammo(player);
        }
    });
}

function mm556c(player) { craftConfirm(player, 'mm556', '5.56x45mm', 'krep:mm556'); }
function mm9c(player) { craftConfirm(player, 'mm9', '9x19mm', 'krep:mm9'); }
function acp45c(player) { craftConfirm(player, 'acp45', '.45 ACP', 'krep:acp45'); }
function ae50c(player) { craftConfirm(player, 'ae50', '.50 AE', 'krep:ae50'); }
function gauge12c(player) { craftConfirm(player, 'gauge12', '12 Gauge', 'krep:12gauge'); }
function mm5728c(player) { craftConfirm(player, 'mm5728', '5.7x28mm', 'krep:mm5728'); }
function win308c(player) { craftConfirm(player, 'win308', '.308 Win', 'krep:win308'); }
function win308boxc(player) { craftConfirm(player, 'win308box', '.308 Win Box', 'krep:win308box'); }
function rpgrocketec(player) { craftConfirm(player, 'rpgrockete', 'RPG Rocket', 'krep:rpgrocket'); }
function lapua308c(player) { craftConfirm(player, 'lapua308', '.308 Lapua', 'krep:lapua338'); }
function m43c(player) { craftConfirm(player, 'm43', '7.62x39mm', 'krep:m43'); }
function mm4630c(player) { craftConfirm(player, 'mm4630', '4.6x30mm', 'krep:mm4630'); }
function mag357c(player) { craftConfirm(player, 'mag357', '.357 Mag', 'krep:mag357'); }
function mm5842c(player) { craftConfirm(player, 'mm5842', '5.8x42mm', 'krep:mm5842'); }

system.runInterval(() => {
    for (let player of world.getPlayers()) {
        if (player.hasTag('krep:craftammo')) {
            system.run(() => {
                craftammo(player);
                player.runCommandAsync('tag @s remove krep:craftammo');
            });
        }
        if (player.hasTag('krep:wip')) {
            system.run(() => {
                wip(player);
                player.runCommandAsync('tag @s remove krep:wip');
            });
        }
    }
}, 20);
