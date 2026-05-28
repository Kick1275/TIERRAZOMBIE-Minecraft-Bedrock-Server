import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Medico Cargado correctamente");

const SCORE = "money";

const npcItems = [
    { id: "mcpe:adrenaline",          name: { es: "Adrenalina",                    en: "Adrenaline" },                  buyPrice: 700,  sellPrice: 510,  icon: "textures/items/medic/adrenaline.png" },
    { id: "mcpe:alcoholic_tinture",   name: { es: "Tintura Alcohólica",            en: "Alcoholic Tincture" },          buyPrice: 250,  sellPrice: 150,  icon: "textures/items/medic/alcoholic_tinture.png" },
    { id: "mcpe:antidote",            name: { es: "Antídoto",                      en: "Antidote" },                    buyPrice: 2450, sellPrice: 1150, icon: "textures/items/medic/antidote.png" },
    { id: "mcpe:bandage_sterilized",  name: { es: "Vendaje Esterilizado",          en: "Sterilized Bandage" },          buyPrice: 300,  sellPrice: 190,  icon: "textures/items/medic/bandage_sterilized.png" },
    { id: "mcpe:bandage",             name: { es: "Vendaje",                       en: "Bandage" },                     buyPrice: 290,  sellPrice: 130,  icon: "textures/items/medic/bandage.png" },
    { id: "mcpe:blood_bag_type_a",    name: { es: "Bolsa de Sangre (Tipo A)",      en: "Blood Bag (Type A)" },          buyPrice: 600,  sellPrice: 200,  icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_type_ab",   name: { es: "Bolsa de Sangre (Tipo AB)",     en: "Blood Bag (Type AB)" },         buyPrice: 600,  sellPrice: 200,  icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_type_b",    name: { es: "Bolsa de Sangre (Tipo B)",      en: "Blood Bag (Type B)" },          buyPrice: 600,  sellPrice: 200,  icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_emp",       name: { es: "Bolsa de Sangre Vacía",         en: "Empty Blood Bag" },             buyPrice: 150,  sellPrice: 50,   icon: "textures/items/medic/blood_bag_emp.png" },
    { id: "mcpe:blood_bag_type_o",    name: { es: "Bolsa de Sangre (Tipo O)",      en: "Blood Bag (Type O)" },          buyPrice: 600,  sellPrice: 200,  icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_bag_unknown",   name: { es: "Bolsa de Sangre (Desconocida)", en: "Blood Bag (Unknown)" },         buyPrice: 450,  sellPrice: 150,  icon: "textures/items/medic/blood_bag.png" },
    { id: "mcpe:blood_test_kit",      name: { es: "Kit de Prueba de Sangre",       en: "Blood Test Kit" },              buyPrice: 300,  sellPrice: 100,  icon: "textures/items/medic/blood_test.png" },
    { id: "mcpe:first_aid",           name: { es: "Botiquín de Primeros Auxilios", en: "First Aid Kit" },               buyPrice: 1100, sellPrice: 900,  icon: "textures/items/medic/first_aid.png" },
    { id: "mcpe:morphine",            name: { es: "Morfina",                       en: "Morphine" },                    buyPrice: 850,  sellPrice: 450,  icon: "textures/items/medic/morphine.png" },
    { id: "mcpe:painkiller",          name: { es: "Analgésico",                    en: "Painkiller" },                  buyPrice: 740,  sellPrice: 380,  icon: "textures/items/medic/painkiller.png" },
    { id: "mcpe:rags_dirty",          name: { es: "Trapos Sucios",                 en: "Dirty Rags" },                  buyPrice: 130,  sellPrice: 110,  icon: "textures/items/medic/rags_dirty.png" },
    { id: "mcpe:rags_sterilized",     name: { es: "Trapos Esterilizados",          en: "Sterilized Rags" },             buyPrice: 170,  sellPrice: 140,  icon: "textures/items/medic/rags_sterilized.png" },
    { id: "mcpe:rags",                name: { es: "Trapos",                        en: "Rags" },                        buyPrice: 180,  sellPrice: 110,  icon: "textures/items/medic/rags.png" },
    { id: "mcpe:splint",              name: { es: "Férula",                        en: "Splint" },                      buyPrice: 190,  sellPrice: 150,  icon: "textures/items/medic/splint.png" },
    { id: "mcpe:water_purification",  name: { es: "Tableta de Purificación",       en: "Water Purification Tablet" },   buyPrice: 150,  sellPrice: 90,   icon: "textures/items/medic/water_purification.png" },
];

function getLang(player) { return player.hasTag("lang_es_ES") ? "es" : "en"; }
function getMoney(player) { try { const o = world.scoreboard.getObjective(SCORE); return o ? (o.getScore(player) ?? 0) : 0; } catch { return 0; } }
function setMoney(player, v) { try { let o = world.scoreboard.getObjective(SCORE); if (!o) o = world.scoreboard.addObjective(SCORE, SCORE); o.setScore(player, v); } catch {} }
function countItem(player, id) { const inv = player.getComponent("minecraft:inventory")?.container; if (!inv) return 0; let t = 0; for (let i = 0; i < inv.size; i++) { const it = inv.getItem(i); if (it && it.typeId === id) t += it.amount; } return t; }
function removeItem(player, id, qty) { const inv = player.getComponent("minecraft:inventory")?.container; if (!inv) return false; let r = qty; for (let i = 0; i < inv.size; i++) { const it = inv.getItem(i); if (!it || it.typeId !== id) continue; if (it.amount >= r) { if (it.amount === r) inv.setItem(i, undefined); else { it.amount -= r; inv.setItem(i, it); } return true; } r -= it.amount; inv.setItem(i, undefined); } return false; }

function buildInventory() {
    const pool = [...npcItems]; const chosen = [];
    for (let i = 0; i < Math.min(10, pool.length); i++) { const idx = Math.floor(Math.random() * pool.length); chosen.push(pool.splice(idx, 1)[0]); }
    const inv = {};
    for (const item of chosen) inv[item.id] = { name: item.name, price: item.buyPrice, sellPrice: item.sellPrice, quantity: 5, icon: item.icon };
    return inv;
}
const npcInventory = buildInventory();

async function showBuyUI(player) {
    const lang = getLang(player);
    const ids = Object.keys(npcInventory);
    if (!ids.length) { player.sendMessage("§cNo hay stock."); return; }
    const form = new ActionFormData().title(lang === "es" ? "§6Médico - Comprar" : "§6Medic - Buy").body(lang === "es" ? "§7¿Qué deseas comprar?" : "§7What would you like to buy?");
    for (const id of ids) { const it = npcInventory[id]; form.button(`${it.name[lang] ?? it.name.es}\n§a${it.price} money §7(x${it.quantity})`, it.icon); }
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");
    const res = await form.show(player);
    if (res.canceled || res.selection === ids.length) return;
    const selId = ids[res.selection]; const selIt = npcInventory[selId];
    const maxBuy = Math.min(selIt.quantity, 64);
    const opts = Array.from({ length: maxBuy }, (_, i) => String(i + 1));
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
    const form = new ActionFormData().title(lang === "es" ? "§6Médico - Vender" : "§6Medic - Sell").body(lang === "es" ? "§7¿Qué deseas vender?" : "§7What would you like to sell?");
    for (const item of npcItems) form.button(`${item.name[lang] ?? item.name.es}\n§a${item.sellPrice} money`, item.icon);
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");
    const res = await form.show(player);
    if (res.canceled || res.selection === npcItems.length) return;
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
    if (ev.target.typeId !== "tz:npc_doctor") return;
    const player = ev.player; const lang = getLang(player);
    const res = await new ActionFormData().title(lang === "es" ? "§6Médico" : "§6Medic").body(lang === "es" ? "§7¿Qué deseas hacer?" : "§7What would you like to do?")
        .button(lang === "es" ? "§aComprar" : "§aBuy", "textures/ui/village_hero_effect.png")
        .button(lang === "es" ? "§bVender" : "§bSell", "textures/ui/MCoin.png")
        .button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png").show(player);
    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) await showBuyUI(player); else await showSellUI(player);
});
