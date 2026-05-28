import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Food Cargado correctamente");

const SCORE = "money";

const npcItems = [
    { id: "mcpe:chip_potato",       name: { es: "Papas Fritas",             en: "Potato Chips" },           buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/chip_potato.png" },
    { id: "mcpe:chip_tortilla",     name: { es: "Tortilla Chips",           en: "Tortilla Chips" },         buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/chip_tortilla.png" },
    { id: "mcpe:creeper_crunch",    name: { es: "Creeper Crunch",           en: "Creeper Crunch" },         buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/creeper_crunch.png" },
    { id: "mcpe:meat_jerky",        name: { es: "Carne Seca",               en: "Meat Jerky" },             buyPrice: 120, sellPrice: 50,  icon: "textures/items/food/meat_jerky.png" },
    { id: "mcpe:mre",               name: { es: "MRE",                      en: "MRE" },                    buyPrice: 150, sellPrice: 60,  icon: "textures/items/food/mre.png" },
    { id: "mcpe:rice",              name: { es: "Arroz",                    en: "Rice" },                   buyPrice: 50,  sellPrice: 20,  icon: "textures/items/food/rice.png" },
    { id: "mcpe:strawberry_jam",    name: { es: "Mermelada de Fresa",       en: "Strawberry Jam" },         buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/strawberry_jam.png" },
    { id: "mcpe:tactical_sandwich", name: { es: "Sándwich Táctico",         en: "Tactical Sandwich" },      buyPrice: 120, sellPrice: 50,  icon: "textures/items/food/tactical_sandwich.png" },
    { id: "mcpe:canned_bacon",      name: { es: "Tocino Enlatado",          en: "Canned Bacon" },           buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_bacon.png" },
    { id: "mcpe:canned_beans",      name: { es: "Frijoles Enlatados",       en: "Canned Beans" },           buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_beans.png" },
    { id: "mcpe:canned_beef_stew",  name: { es: "Estofado de Res Enlatado", en: "Canned Beef Stew" },       buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_beef_stew.png" },
    { id: "mcpe:canned_chicken",    name: { es: "Pollo Enlatado",           en: "Canned Chicken" },         buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_chicken.png" },
    { id: "mcpe:canned_chili",      name: { es: "Chili Enlatado",           en: "Canned Chili" },           buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_chili.png" },
    { id: "mcpe:canned_corned",     name: { es: "Corned Beef Enlatado",     en: "Canned Corned Beef" },     buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_corned.png" },
    { id: "mcpe:canned_fruit",      name: { es: "Fruta Enlatada",           en: "Canned Fruit" },           buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_fruit.png" },
    { id: "mcpe:canned_ham",        name: { es: "Jamón Enlatado",           en: "Canned Ham" },             buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_ham.png" },
    { id: "mcpe:canned_peaches",    name: { es: "Duraznos Enlatados",       en: "Canned Peaches" },         buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_peaches.png" },
    { id: "mcpe:canned_ration",     name: { es: "Ración Enlatada",          en: "Canned Ration" },          buyPrice: 150, sellPrice: 60,  icon: "textures/items/food/canned_ration.png" },
    { id: "mcpe:canned_sardine",    name: { es: "Sardinas Enlatadas",       en: "Canned Sardines" },        buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_sardine.png" },
    { id: "mcpe:canned_spaghetti",  name: { es: "Espagueti Enlatado",       en: "Canned Spaghetti" },       buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_spaghetti.png" },
    { id: "mcpe:canned_tomato",     name: { es: "Tomate Enlatado",          en: "Canned Tomato" },          buyPrice: 80,  sellPrice: 30,  icon: "textures/items/food/canned_tomato.png" },
    { id: "mcpe:canned_tuna",       name: { es: "Atún Enlatado",            en: "Canned Tuna" },            buyPrice: 100, sellPrice: 40,  icon: "textures/items/food/canned_tuna.png" },
];

// ─── SHARED NPC LOGIC ─────────────────────────────────────────────────────────

function getLang(player) {
    return player.hasTag("lang_es_ES") ? "es" : "en";
}

function getMoney(player) {
    try {
        const obj = world.scoreboard.getObjective(SCORE);
        return obj ? (obj.getScore(player) ?? 0) : 0;
    } catch { return 0; }
}

function setMoney(player, amount) {
    try {
        let obj = world.scoreboard.getObjective(SCORE);
        if (!obj) obj = world.scoreboard.addObjective(SCORE, SCORE);
        obj.setScore(player, amount);
    } catch {}
}

function removeItem(player, typeId, amount) {
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return false;
    let remaining = amount;
    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (!item || item.typeId !== typeId) continue;
        if (item.amount >= remaining) {
            if (item.amount === remaining) inv.setItem(i, undefined);
            else { item.amount -= remaining; inv.setItem(i, item); }
            return true;
        }
        remaining -= item.amount;
        inv.setItem(i, undefined);
    }
    return false;
}

function countItem(player, typeId) {
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return 0;
    let total = 0;
    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (item && item.typeId === typeId) total += item.amount;
    }
    return total;
}

// Pick 10 random items for the NPC inventory
function buildInventory(items) {
    const pool = [...items];
    const chosen = [];
    for (let i = 0; i < Math.min(10, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length);
        chosen.push(pool.splice(idx, 1)[0]);
    }
    const inv = {};
    for (const item of chosen) {
        inv[item.id] = { name: item.name, price: item.buyPrice, sellPrice: item.sellPrice, quantity: 5, icon: item.icon };
    }
    return inv;
}

const npcInventory = buildInventory(npcItems);

// ─── BUY UI ───────────────────────────────────────────────────────────────────

async function showBuyUI(player) {
    const lang = getLang(player);
    const ids = Object.keys(npcInventory);
    if (!ids.length) { player.sendMessage(lang === "es" ? "§cNo hay stock disponible." : "§cNo stock available."); return; }

    const form = new ActionFormData()
        .title(lang === "es" ? "§6Cantinero - Comprar" : "§6Bartender - Buy")
        .body(lang === "es" ? "§7¿Qué deseas comprar?" : "§7What would you like to buy?");

    for (const id of ids) {
        const item = npcInventory[id];
        const name = item.name[lang] ?? item.name.es;
        form.button(`${name}\n§a${item.price} money §7(x${item.quantity})`, item.icon);
    }
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");

    const res = await form.show(player);
    if (res.canceled || res.selection === ids.length) return;

    const selectedId = ids[res.selection];
    const selectedItem = npcInventory[selectedId];
    await showBuyAmountUI(player, selectedId, selectedItem, lang);
}

async function showBuyAmountUI(player, id, item, lang) {
    const maxBuy = Math.min(item.quantity, 64);
    const options = Array.from({ length: maxBuy }, (_, i) => String(i + 1));

    const res = await new ModalFormData()
        .title(lang === "es" ? "§aComprar" : "§aBuy")
        .dropdown(
            (lang === "es" ? "§7Cantidad:\n§7Precio por unidad: §e" : "§7Amount:\n§7Price per unit: §e") + item.price + " money",
            options, { defaultValueIndex: 0 }
        )
        .show(player);

    if (res.canceled) return;
    const qty = parseInt(options[res.formValues[0]]);
    const total = qty * item.price;
    const money = getMoney(player);

    if (money < total) {
        player.sendMessage(lang === "es" ? "§cNo tienes suficiente dinero." : "§cNot enough money.");
        return;
    }

    setMoney(player, money - total);
    item.quantity -= qty;
    if (item.quantity <= 0) delete npcInventory[id];
    player.runCommand(`give @s ${id} ${qty}`);
    player.sendMessage(lang === "es" ? "§a¡Transacción exitosa!" : "§aTransaction successful!");
}

// ─── SELL UI ──────────────────────────────────────────────────────────────────

async function showSellUI(player) {
    const lang = getLang(player);
    const form = new ActionFormData()
        .title(lang === "es" ? "§6Cantinero - Vender" : "§6Bartender - Sell")
        .body(lang === "es" ? "§7¿Qué deseas vender?" : "§7What would you like to sell?");

    for (const item of npcItems) {
        const name = item.name[lang] ?? item.name.es;
        form.button(`${name}\n§a${item.sellPrice} money`, item.icon);
    }
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");

    const res = await form.show(player);
    if (res.canceled || res.selection === npcItems.length) return;

    const selected = npcItems[res.selection];
    await showSellAmountUI(player, selected, lang);
}

async function showSellAmountUI(player, item, lang) {
    const owned = countItem(player, item.id);
    if (owned === 0) {
        player.sendMessage(lang === "es" ? "§cNo tienes ese item." : "§cYou don't have that item.");
        return;
    }
    const maxSell = Math.min(owned, 64);
    const options = Array.from({ length: maxSell }, (_, i) => String(i + 1));

    const res = await new ModalFormData()
        .title(lang === "es" ? "§bVender" : "§bSell")
        .dropdown(
            (lang === "es" ? "§7Cantidad:\n§7Precio por unidad: §e" : "§7Amount:\n§7Price per unit: §e") + item.sellPrice + " money",
            options, { defaultValueIndex: 0 }
        )
        .show(player);

    if (res.canceled) return;
    const qty = parseInt(options[res.formValues[0]]);
    if (!removeItem(player, item.id, qty)) {
        player.sendMessage(lang === "es" ? "§cNo tienes suficientes items." : "§cNot enough items.");
        return;
    }
    const earned = qty * item.sellPrice;
    setMoney(player, getMoney(player) + earned);
    player.sendMessage(lang === "es" ? "§a¡Transacción exitosa!" : "§aTransaction successful!");
}

// ─── INTERACTION ──────────────────────────────────────────────────────────────

world.afterEvents.playerInteractWithEntity.subscribe(async ev => {
    const player = ev.player;
    const entity = ev.target;
    if (entity.typeId !== "tz:bartender") return;

    const lang = getLang(player);
    const res = await new ActionFormData()
        .title(lang === "es" ? "§6Cantinero" : "§6Bartender")
        .body(lang === "es" ? "§7¿Qué deseas hacer?" : "§7What would you like to do?")
        .button(lang === "es" ? "§aComprar" : "§aBuy", "textures/ui/village_hero_effect.png")
        .button(lang === "es" ? "§bVender" : "§bSell", "textures/ui/MCoin.png")
        .button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png")
        .show(player);

    if (res.canceled || res.selection === 2) return;
    if (res.selection === 0) await showBuyUI(player);
    else await showSellUI(player);
});
