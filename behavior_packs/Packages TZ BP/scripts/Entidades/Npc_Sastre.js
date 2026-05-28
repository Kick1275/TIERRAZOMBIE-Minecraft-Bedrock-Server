import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Sastre Cargado correctamente");

const SCORE = "money";

const npcItems = [
    // Cascos militares
    { id: "mcpe:army_artic",           name: { es: "Casco Ejército Ártico",        en: "Arctic Army Helmet" },         buyPrice: 3400, sellPrice: 700,  icon: "textures/items/armor/army_artic.png" },
    { id: "mcpe:army_desert",          name: { es: "Casco Ejército Desértico",     en: "Desert Army Helmet" },         buyPrice: 3400, sellPrice: 700,  icon: "textures/items/armor/army_desert.png" },
    { id: "mcpe:army_woodland",        name: { es: "Casco Ejército Boscoso",       en: "Woodland Army Helmet" },       buyPrice: 3400, sellPrice: 700,  icon: "textures/items/armor/army_woodland.png" },
    { id: "mcpe:assault_helmet_black", name: { es: "Casco de Asalto Negro",        en: "Black Assault Helmet" },       buyPrice: 5800, sellPrice: 900,  icon: "textures/items/armor/assault_helmet_black.png" },
    // Cascos balísticos
    { id: "mcpe:ballistic_black",      name: { es: "Casco Balístico Negro",        en: "Black Ballistic Helmet" },     buyPrice: 2100, sellPrice: 700,  icon: "textures/items/armor/ballistic_black.png" },
    { id: "mcpe:ballistic_green",      name: { es: "Casco Balístico Verde",        en: "Green Ballistic Helmet" },     buyPrice: 2100, sellPrice: 700,  icon: "textures/items/armor/ballistic_green.png" },
    { id: "mcpe:ballistic_tan",        name: { es: "Casco Balístico Arena",        en: "Tan Ballistic Helmet" },       buyPrice: 2100, sellPrice: 700,  icon: "textures/items/armor/ballistic_tan.png" },
    { id: "mcpe:ballistic_white",      name: { es: "Casco Balístico Blanco",       en: "White Ballistic Helmet" },     buyPrice: 2100, sellPrice: 700,  icon: "textures/items/armor/ballistic_white.png" },
    // Máscaras de gas
    { id: "mcpe:gasmask_black",        name: { es: "Máscara de Gas Negra",         en: "Black Gas Mask" },             buyPrice: 2400, sellPrice: 800,  icon: "textures/items/armor/gasmask_black.png" },
    { id: "mcpe:gasmask_tactical",     name: { es: "Máscara de Gas Táctica",       en: "Tactical Gas Mask" },          buyPrice: 2700, sellPrice: 900,  icon: "textures/items/armor/gasmask_tactical.png" },
    { id: "mcpe:gasmask_white",        name: { es: "Máscara de Gas Blanca",        en: "White Gas Mask" },             buyPrice: 2400, sellPrice: 800,  icon: "textures/items/armor/gasmask_white.png" },
    // Cascos de moto
    { id: "mcpe:biker_black",          name: { es: "Casco Motociclista Negro",     en: "Black Biker Helmet" },         buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/biker_black.png" },
    { id: "mcpe:biker_blue",           name: { es: "Casco Motociclista Azul",      en: "Blue Biker Helmet" },          buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/biker_blue.png" },
    { id: "mcpe:biker_red",            name: { es: "Casco Motociclista Rojo",      en: "Red Biker Helmet" },           buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/biker_red.png" },
    { id: "mcpe:biker_white",          name: { es: "Casco Motociclista Blanco",    en: "White Biker Helmet" },         buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/biker_white.png" },
    { id: "mcpe:biker_yellow",         name: { es: "Casco Motociclista Amarillo",  en: "Yellow Biker Helmet" },        buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/biker_yellow.png" },
    // Gorros y boinas
    { id: "mcpe:beanie_black",         name: { es: "Gorro Negro",                  en: "Black Beanie" },               buyPrice: 90,   sellPrice: 30,   icon: "textures/items/armor/beanie_black.png" },
    { id: "mcpe:beanie_brown",         name: { es: "Gorro Marrón",                 en: "Brown Beanie" },               buyPrice: 90,   sellPrice: 30,   icon: "textures/items/armor/beanie_brown.png" },
    { id: "mcpe:beanie_olive",         name: { es: "Gorro Oliva",                  en: "Olive Beanie" },               buyPrice: 90,   sellPrice: 30,   icon: "textures/items/armor/beanie_olive.png" },
    { id: "mcpe:beanie_white",         name: { es: "Gorro Blanco",                 en: "White Beanie" },               buyPrice: 90,   sellPrice: 30,   icon: "textures/items/armor/beanie_white.png" },
    { id: "mcpe:beret_blue",           name: { es: "Boina Azul",                   en: "Blue Beret" },                 buyPrice: 150,  sellPrice: 50,   icon: "textures/items/armor/beret_blue.png" },
    { id: "mcpe:beret_green",          name: { es: "Boina Verde",                  en: "Green Beret" },                buyPrice: 150,  sellPrice: 50,   icon: "textures/items/armor/beret_green.png" },
    { id: "mcpe:beret_red",            name: { es: "Boina Roja",                   en: "Red Beret" },                  buyPrice: 150,  sellPrice: 50,   icon: "textures/items/armor/beret_red.png" },
    // Chalecos tácticos
    { id: "mcpe:tactical_vest_black",  name: { es: "Chaleco Táctico Negro",        en: "Black Tactical Vest" },        buyPrice: 2700, sellPrice: 700,  icon: "textures/items/armor/tactical_vest_black.png" },
    { id: "mcpe:tactical_vest_olive",  name: { es: "Chaleco Táctico Oliva",        en: "Olive Tactical Vest" },        buyPrice: 2700, sellPrice: 700,  icon: "textures/items/armor/tactical_vest_olive.png" },
    { id: "mcpe:tactical_vest_tan",    name: { es: "Chaleco Táctico Arena",        en: "Tan Tactical Vest" },          buyPrice: 2700, sellPrice: 700,  icon: "textures/items/armor/tactical_vest_tan.png" },
    { id: "mcpe:tactical_vest_white",  name: { es: "Chaleco Táctico Blanco",       en: "White Tactical Vest" },        buyPrice: 2700, sellPrice: 700,  icon: "textures/items/armor/tactical_vest_white.png" },
    // Chalecos de combate
    { id: "mcpe:combat_olive",         name: { es: "Chaleco de Combate Oliva",     en: "Olive Combat Vest" },          buyPrice: 3500, sellPrice: 900,  icon: "textures/items/armor/assault_vest_olive.png" },
    { id: "mcpe:combat_tan",           name: { es: "Chaleco de Combate Arena",     en: "Tan Combat Vest" },            buyPrice: 3500, sellPrice: 900,  icon: "textures/items/armor/combat_tan.png" },
    { id: "mcpe:combat_white",         name: { es: "Chaleco de Combate Blanco",    en: "White Combat Vest" },          buyPrice: 3500, sellPrice: 900,  icon: "textures/items/armor/combat_white.png" },
    // Chalecos con placas
    { id: "mcpe:plate_vest_gray",      name: { es: "Chaleco con Placas Gris",      en: "Gray Plate Vest" },            buyPrice: 1800, sellPrice: 500,  icon: "textures/items/armor/plate_vest_gray.png" },
    { id: "mcpe:plate_vest_olive",     name: { es: "Chaleco con Placas Oliva",     en: "Olive Plate Vest" },           buyPrice: 1800, sellPrice: 500,  icon: "textures/items/armor/plate_vest_olive.png" },
    { id: "mcpe:plate_vest_tan",       name: { es: "Chaleco con Placas Arena",     en: "Tan Plate Vest" },             buyPrice: 1800, sellPrice: 500,  icon: "textures/items/armor/plate_vest_tan.png" },
    { id: "mcpe:plate_vest_white",     name: { es: "Chaleco con Placas Blanco",    en: "White Plate Vest" },           buyPrice: 1800, sellPrice: 500,  icon: "textures/items/armor/plate_vest_white.png" },
    // Chalecos reflectantes
    { id: "mcpe:reflective_lime",      name: { es: "Chaleco Reflectante Lima",     en: "Lime Reflective Vest" },       buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/reflective_lime.png" },
    { id: "mcpe:reflective_orange",    name: { es: "Chaleco Reflectante Naranja",  en: "Orange Reflective Vest" },     buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/reflective_orange.png" },
    { id: "mcpe:reflective_yellow",    name: { es: "Chaleco Reflectante Amarillo", en: "Yellow Reflective Vest" },     buyPrice: 450,  sellPrice: 150,  icon: "textures/items/armor/reflective_yellow.png" },
];

function getLang(p) { return p.hasTag("lang_es_ES") ? "es" : "en"; }
function getMoney(p) { try { const o = world.scoreboard.getObjective(SCORE); return o ? (o.getScore(p) ?? 0) : 0; } catch { return 0; } }
function setMoney(p, v) { try { let o = world.scoreboard.getObjective(SCORE); if (!o) o = world.scoreboard.addObjective(SCORE, SCORE); o.setScore(p, v); } catch {} }
function countItem(p, id) { const inv = p.getComponent("minecraft:inventory")?.container; if (!inv) return 0; let t = 0; for (let i = 0; i < inv.size; i++) { const it = inv.getItem(i); if (it && it.typeId === id) t += it.amount; } return t; }
function removeItem(p, id, qty) { const inv = p.getComponent("minecraft:inventory")?.container; if (!inv) return false; let r = qty; for (let i = 0; i < inv.size; i++) { const it = inv.getItem(i); if (!it || it.typeId !== id) continue; if (it.amount >= r) { if (it.amount === r) inv.setItem(i, undefined); else { it.amount -= r; inv.setItem(i, it); } return true; } r -= it.amount; inv.setItem(i, undefined); } return false; }

function buildInventory() {
    const pool = [...npcItems]; const chosen = [];
    for (let i = 0; i < Math.min(10, pool.length); i++) { const idx = Math.floor(Math.random() * pool.length); chosen.push(pool.splice(idx, 1)[0]); }
    const inv = {};
    for (const item of chosen) inv[item.id] = { name: item.name, price: item.buyPrice, sellPrice: item.sellPrice, quantity: 5, icon: item.icon };
    return inv;
}
const npcInventory = buildInventory();

async function showBuyUI(player) {
    const lang = getLang(player); const ids = Object.keys(npcInventory);
    if (!ids.length) { player.sendMessage("§cNo hay stock."); return; }
    const form = new ActionFormData().title(lang === "es" ? "§6Sastre - Comprar" : "§6Tailor - Buy").body(lang === "es" ? "§7¿Qué deseas comprar?" : "§7What would you like to buy?");
    for (const id of ids) { const it = npcInventory[id]; form.button(`${it.name[lang] ?? it.name.es}\n§a${it.price} money §7(x${it.quantity})`, it.icon); }
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");
    const res = await form.show(player); if (res.canceled || res.selection === ids.length) return;
    const selId = ids[res.selection]; const selIt = npcInventory[selId];
    const maxBuy = Math.min(selIt.quantity, 64); const opts = Array.from({ length: maxBuy }, (_, i) => String(i + 1));
    const r2 = await new ModalFormData().title(lang === "es" ? "§aComprar" : "§aBuy").dropdown((lang === "es" ? "§7Cantidad:\n§7Precio/u: §e" : "§7Amount:\n§7Price/u: §e") + selIt.price + " money", opts, { defaultValueIndex: 0 }).show(player);
    if (r2.canceled) return;
    const qty = parseInt(opts[r2.formValues[0]]); const total = qty * selIt.price; const money = getMoney(player);
    if (money < total) { player.sendMessage(lang === "es" ? "§cNo tienes suficiente dinero." : "§cNot enough money."); return; }
    setMoney(player, money - total); selIt.quantity -= qty; if (selIt.quantity <= 0) delete npcInventory[selId];
    player.runCommand(`give @s ${selId} ${qty}`);
    player.sendMessage(lang === "es" ? "§a¡Transacción exitosa!" : "§aTransaction successful!");
}

async function showSellUI(player) {
    const lang = getLang(player);
    const form = new ActionFormData().title(lang === "es" ? "§6Sastre - Vender" : "§6Tailor - Sell").body(lang === "es" ? "§7¿Qué deseas vender?" : "§7What would you like to sell?");
    for (const item of npcItems) form.button(`${item.name[lang] ?? item.name.es}\n§a${item.sellPrice} money`, item.icon);
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");
    const res = await form.show(player); if (res.canceled || res.selection === npcItems.length) return;
    const sel = npcItems[res.selection]; const owned = countItem(player, sel.id);
    if (owned === 0) { player.sendMessage(lang === "es" ? "§cNo tienes ese item." : "§cYou don't have that item."); return; }
    const maxSell = Math.min(owned, 64); const opts = Array.from({ length: maxSell }, (_, i) => String(i + 1));
    const r2 = await new ModalFormData().title(lang === "es" ? "§bVender" : "§bSell").dropdown((lang === "es" ? "§7Cantidad:\n§7Precio/u: §e" : "§7Amount:\n§7Price/u: §e") + sel.sellPrice + " money", opts, { defaultValueIndex: 0 }).show(player);
    if (r2.canceled) return;
    const qty = parseInt(opts[r2.formValues[0]]);
    if (!removeItem(player, sel.id, qty)) { player.sendMessage(lang === "es" ? "§cNo tienes suficientes items." : "§cNot enough items."); return; }
    setMoney(player, getMoney(player) + qty * sel.sellPrice);
    player.sendMessage(lang === "es" ? "§a¡Transacción exitosa!" : "§aTransaction successful!");
}

world.afterEvents.playerInteractWithEntity.subscribe(async ev => {
    if (ev.target.typeId !== "tz:clothesshop") return;
    const player = ev.player; const lang = getLang(player);
    const res = await new ActionFormData().title(lang === "es" ? "§6Sastre" : "§6Tailor").body(lang === "es" ? "§7¿Qué deseas hacer?" : "§7What would you like to do?")
        .button(lang === "es" ? "§aComprar" : "§aBuy", "textures/ui/village_hero_effect.png")
        .button(lang === "es" ? "§bVender" : "§bSell", "textures/ui/MCoin.png")
        .button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png").show(player);
    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) await showBuyUI(player); else await showSellUI(player);
});
