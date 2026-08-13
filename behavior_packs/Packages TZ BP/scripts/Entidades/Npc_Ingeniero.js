import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Ingeniero correctamente");

const SCORE = "money";

const npcItems = [
    // ── Pistola
    { id: "krep:qsz92",   name: { es: "QSZ-92",     en: "QSZ-92" },     buyPrice: 2000,  sellPrice: 600,  icon: "textures/items/qsz92" },
    // ── SMG
    { id: "krep:qcq171",  name: { es: "QCQ-171",    en: "QCQ-171" },    buyPrice: 4500,  sellPrice: 1500, icon: "textures/items/qcq171" },
    // ── ARs T2
    { id: "krep:t112",    name: { es: "T-112",       en: "T-112" },      buyPrice: 4800,  sellPrice: 1500, icon: "textures/items/t112" },
    { id: "krep:m16a4",   name: { es: "M16A4",       en: "M16A4" },      buyPrice: 5200,  sellPrice: 1600, icon: "textures/items/m16a4" },
    // ── ARs T3
    { id: "krep:hk416",   name: { es: "HK416",       en: "HK416" },      buyPrice: 6500,  sellPrice: 2100, icon: "textures/items/hk416" },
    { id: "krep:type88",  name: { es: "Type 88",     en: "Type 88" },    buyPrice: 6000,  sellPrice: 2000, icon: "textures/items/type88" },
    { id: "krep:type89",  name: { es: "Type 89",     en: "Type 89" },    buyPrice: 6000,  sellPrice: 2000, icon: "textures/items/type89" },
    { id: "krep:k2",      name: { es: "K2",          en: "K2" },         buyPrice: 7500,  sellPrice: 2500, icon: "textures/items/k2" },
    { id: "krep:type95",  name: { es: "Type 95",     en: "Type 95" },    buyPrice: 7500,  sellPrice: 2500, icon: "textures/items/type95" },
    { id: "krep:qbz191",  name: { es: "QBZ-191",     en: "QBZ-191" },    buyPrice: 7200,  sellPrice: 2300, icon: "textures/items/qbz191" },
    { id: "krep:qjb95",   name: { es: "QJB-95",      en: "QJB-95" },     buyPrice: 6200,  sellPrice: 2000, icon: "textures/items/qjb95" },
    // ── ARs T4
    { id: "krep:ak12",    name: { es: "AK-12",       en: "AK-12" },      buyPrice: 5500,  sellPrice: 1800, icon: "textures/items/ak12" },
    { id: "krep:arka",    name: { es: "ARKA",         en: "ARKA" },       buyPrice: 5800,  sellPrice: 1900, icon: "textures/items/arka" },
    { id: "krep:type882", name: { es: "Type 88-2",   en: "Type 88-2" },  buyPrice: 8000,  sellPrice: 2600, icon: "textures/items/type882" },
    // ── T5 Battle Rifles / DMR
    { id: "krep:m8",      name: { es: "M8",          en: "M8" },         buyPrice: 7800,  sellPrice: 2500, icon: "textures/items/m8" },
    { id: "krep:m7",      name: { es: "M7",          en: "M7" },         buyPrice: 9500,  sellPrice: 3100, icon: "textures/items/m7" },
    { id: "krep:qbu191",  name: { es: "QBU-191",     en: "QBU-191" },    buyPrice: 9500,  sellPrice: 3100, icon: "textures/items/qbz191" },
    { id: "krep:qjb201",  name: { es: "QJB-201",     en: "QJB-201" },    buyPrice: 11000, sellPrice: 3600, icon: "textures/items/qjb201" },
    // ── EXCEPCIONES
    { id: "krep:awp",     name: { es: "AWP",         en: "AWP" },        buyPrice: 12000, sellPrice: 4000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:minigun", name: { es: "Minigun",     en: "Minigun" },    buyPrice: 25000, sellPrice: 8000, icon: "textures/ui/icon_sword.png" },
    // ── Municion
    { id: "krep:mm5821",  name: { es: "Mun. 5.8x21 (QSZ) x48",   en: "5.8x21 Ammo x48" },   buyPrice: 450,  sellPrice: 130, icon: "textures/items/ammo/mm5821" },
    { id: "krep:mm9",     name: { es: "Mun. 9mm (QCQ) x64",       en: "9mm Ammo x64" },      buyPrice: 500,  sellPrice: 150, icon: "textures/items/ammo/mm9" },
    { id: "krep:mm556",   name: { es: "Mun. 5.56 x30",            en: "5.56 Ammo x30" },     buyPrice: 650,  sellPrice: 200, icon: "textures/items/ammo/mm556" },
    { id: "krep:mm545",   name: { es: "Mun. 5.45 x30",            en: "5.45 Ammo x30" },     buyPrice: 650,  sellPrice: 200, icon: "textures/items/ammo/mm545" },
    { id: "krep:mm5842",  name: { es: "Mun. 5.8x42 x30",          en: "5.8x42 Ammo x30" },   buyPrice: 750,  sellPrice: 230, icon: "textures/items/ammo/mm5842" },
    { id: "krep:fury277", name: { es: "Mun. .277 Fury x20",       en: ".277 Fury x20" },     buyPrice: 900,  sellPrice: 280, icon: "textures/items/ammo/fury277" },
    { id: "krep:lapua338",name: { es: "Mun. .338 Lapua x20",      en: ".338 Lapua x20" },    buyPrice: 1200, sellPrice: 400, icon: "textures/items/lapua308" },
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
    const form = new ActionFormData().title(lang === "es" ? "§6Ingeniero - Comprar" : "§6Engineer - Buy").body(lang === "es" ? "§7¿Qué deseas comprar?" : "§7What would you like to buy?");
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
    const form = new ActionFormData().title(lang === "es" ? "§6Ingeniero - Vender" : "§6Engineer - Sell").body(lang === "es" ? "§7¿Qué deseas vender?" : "§7What would you like to sell?");
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
    if (ev.target.typeId !== "tz:waponshop") return;
    const player = ev.player; const lang = getLang(player);
    const isAdmin = player.hasTag("admin");
    const form = new ActionFormData()
        .title(lang === "es" ? "§6Ingeniero" : "§6Engineer")
        .body(lang === "es" ? "§7¿Qué deseas hacer?" : "§7What would you like to do?")
        .button(lang === "es" ? "§aComprar" : "§aBuy", "textures/ui/village_hero_effect.png")
        .button(lang === "es" ? "§bVender" : "§bSell", "textures/ui/MCoin.png");
    if (isAdmin) form.button("§e[Admin] Resetear inventario", "textures/ui/op.png");
    form.button(lang === "es" ? "§cSalir" : "§cExit", "textures/ui/realms_red_x.png");
    const exitIdx = isAdmin ? 3 : 2;
    const res = await form.show(player);
    if (res.canceled || res.selection === exitIdx) return;
    if (res.selection === 0) { await showBuyUI(player); return; }
    if (res.selection === 1) { await showSellUI(player); return; }
    if (isAdmin && res.selection === 2) {
        for (const key of Object.keys(npcInventory)) delete npcInventory[key];
        const fresh = buildInventory();
        for (const [k, v] of Object.entries(fresh)) npcInventory[k] = v;
        player.sendMessage("§a✓ Inventario del Ingeniero reseteado.");
    }
});
