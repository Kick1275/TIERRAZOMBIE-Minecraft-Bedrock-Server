import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Scraper Cargado correctamente");

const SCORE = "money";

const npcItems = [
    { id: "mcpe:barbed_wire",        name: { es: "Alambre de Púas",       en: "Barbed Wire" },         buyPrice: 350,  sellPrice: 200,  icon: "textures/items/misc/barbed_wire.png" },
    { id: "mcpe:bear_trap",          name: { es: "Trampa para Osos",      en: "Bear Trap" },            buyPrice: 390,  sellPrice: 250,  icon: "textures/items/misc/bear_trap.png" },
    { id: "mcpe:bottle_water_emp",   name: { es: "Botella de Agua Vacía", en: "Empty Water Bottle" },   buyPrice: 60,   sellPrice: 20,   icon: "textures/items/misc/barbed_wire.png" },
    { id: "mcpe:random_paper",       name: { es: "Papel Aleatorio",       en: "Random Paper" },         buyPrice: 30,   sellPrice: 10,   icon: "textures/items/misc/random_paper.png" },
    { id: "mcpe:can_opener",         name: { es: "Abrelatas",             en: "Can Opener" },           buyPrice: 590,  sellPrice: 300,  icon: "textures/items/misc/can_opener.png" },
    { id: "mcpe:detonator",          name: { es: "Detonador",             en: "Detonator" },            buyPrice: 2600, sellPrice: 1200, icon: "textures/items/grenade/c4_detonator.png" },
    { id: "mcpe:duct_tape",          name: { es: "Cinta Adhesiva",        en: "Duct Tape" },            buyPrice: 2245, sellPrice: 1115, icon: "textures/items/misc/duct_tape.png" },
    { id: "mcpe:electric_scrap",     name: { es: "Chatarra Eléctrica",    en: "Electric Scrap" },       buyPrice: 3475, sellPrice: 2425, icon: "textures/items/misc/electric_scrap.png" },
    { id: "mcpe:flashlight",         name: { es: "Linterna",              en: "Flashlight" },           buyPrice: 150,  sellPrice: 50,   icon: "textures/items/misc/flashlight.png" },
    { id: "mcpe:ham_radios",         name: { es: "Radio Aficionado",      en: "Ham Radio" },            buyPrice: 2300, sellPrice: 1100, icon: "textures/items/misc/ham_radio.png" },
    { id: "mcpe:landmines",          name: { es: "Mina Terrestre",        en: "Landmine" },             buyPrice: 3450, sellPrice: 2150, icon: "textures/items/misc/landmine.png" },
    { id: "mcpe:lockpick",           name: { es: "Ganzúa",                en: "Lockpick" },             buyPrice: 4120, sellPrice: 2040, icon: "textures/items/misc/lockpick.png" },
    { id: "mcpe:nail_box",           name: { es: "Caja de Clavos",        en: "Nail Box" },             buyPrice: 2360, sellPrice: 1520, icon: "textures/items/misc/.nail_boxpng" },
    { id: "mcpe:plastic_explosive",  name: { es: "Explosivo Plástico",    en: "Plastic Explosive" },    buyPrice: 13400, sellPrice: 5360, icon: "textures/items/misc/plastic_explosive.png" },
    { id: "mcpe:cooking_pot",        name: { es: "Olla de Cocina",        en: "Cooking Pot" },          buyPrice: 250,  sellPrice: 150,  icon: "textures/items/misc/cooking_pot.png" },
    { id: "mcpe:radios",             name: { es: "Radio",                 en: "Radio" },                buyPrice: 2240, sellPrice: 1180, icon: "textures/items/misc/radio.png" },
    { id: "mcpe:nail_box",           name: { es: "Caja de Clavos",        en: "Nail Box" },             buyPrice: 15,   sellPrice: 5,    icon: "textures/items/misc/random_paper.png" },
    { id: "mcpe:remote",             name: { es: "Control Remoto",        en: "Remote" },               buyPrice: 2300, sellPrice: 1100, icon: "textures/items/misc/remote.png" },
    { id: "mcpe:sawoff_pipe",        name: { es: "Tubo Recortado",        en: "Sawed-off Pipe" },       buyPrice: 3980, sellPrice: 2060, icon: "textures/items/misc/sawoff_pipe.png" },
    { id: "mcpe:spray_can",          name: { es: "Lata de Spray",         en: "Spray Can" },            buyPrice: 390,  sellPrice: 230,  icon: "textures/items/misc/spray_can.png" },
    { id: "mcpe:walkie_talkie",      name: { es: "Walkie Talkie",         en: "Walkie Talkie" },        buyPrice: 4210, sellPrice: 2970, icon: "textures/items/misc/walkie_talkie.png" },
    { id: "mcpe:wooden_barricade",   name: { es: "Barricada de Madera",   en: "Wooden Barricade" },     buyPrice: 150,  sellPrice: 50,   icon: "textures/items/misc/wooden_barricade.png" },
    { id: "mcpe:bleach",             name: { es: "Lejía",                 en: "Bleach" },               buyPrice: 390,  sellPrice: 230,  icon: "textures/items/misc/bleach.png" },
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
    for (const item of chosen) inv[item.id] = { name: item.name, price: item.buyPrice, sellPrice: item.sellPrice, quantity: 25, icon: item.icon };
    return inv;
}
const npcInventory = buildInventory();

async function showBuyUI(player) {
    const lang = getLang(player); const ids = Object.keys(npcInventory);
    if (!ids.length) { player.sendMessage("§cNo hay stock."); return; }
    const form = new ActionFormData().title(lang === "es" ? "§6Scraper - Comprar" : "§6Scraper - Buy").body(lang === "es" ? "§7¿Qué deseas comprar?" : "§7What would you like to buy?");
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
    const form = new ActionFormData().title(lang === "es" ? "§6Scraper - Vender" : "§6Scraper - Sell").body(lang === "es" ? "§7¿Qué deseas vender?" : "§7What would you like to sell?");
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
    if (ev.target.typeId !== "tz:npc_scraper") return;
    const player = ev.player; const lang = getLang(player);
    const res = await new ActionFormData().title(lang === "es" ? "§6Scraper" : "§6Scraper").body(lang === "es" ? "§7¿Qué deseas hacer?" : "§7What would you like to do?")
        .button(lang === "es" ? "§aComprar" : "§aBuy", "textures/ui/village_hero_effect.png")
        .button(lang === "es" ? "§bVender" : "§bSell", "textures/ui/MCoin.png")
        .button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png").show(player);
    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) await showBuyUI(player); else await showSellUI(player);
});
