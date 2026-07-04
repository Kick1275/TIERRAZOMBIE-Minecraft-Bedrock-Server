import { world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("Npc_Ingeniero correctamente");

const SCORE = "money";

const npcItems = [
    // ── Rifles de Asalto ──────────────────────────────────────────────────────
    { id: "krep:m4a1",    name: { es: "M4A1",          en: "M4A1" },          buyPrice: 6500,  sellPrice: 2000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:akm",     name: { es: "AKM",           en: "AKM" },           buyPrice: 5500,  sellPrice: 1800, icon: "textures/ui/icon_sword.png" },
    { id: "krep:hk416",   name: { es: "HK416",         en: "HK416" },         buyPrice: 7000,  sellPrice: 2200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:scarl",   name: { es: "SCAR-L",        en: "SCAR-L" },        buyPrice: 7500,  sellPrice: 2500, icon: "textures/ui/icon_sword.png" },
    { id: "krep:m16",     name: { es: "M16",           en: "M16" },           buyPrice: 5000,  sellPrice: 1600, icon: "textures/ui/icon_sword.png" },
    { id: "krep:m16a1",   name: { es: "M16A1",         en: "M16A1" },         buyPrice: 4800,  sellPrice: 1500, icon: "textures/ui/icon_sword.png" },
    { id: "krep:g36",     name: { es: "G36",           en: "G36" },           buyPrice: 6000,  sellPrice: 2000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:qbz95",   name: { es: "QBZ-95",        en: "QBZ-95" },        buyPrice: 6200,  sellPrice: 2000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:qbz191",  name: { es: "QBZ-191",       en: "QBZ-191" },       buyPrice: 7200,  sellPrice: 2300, icon: "textures/ui/icon_sword.png" },
    { id: "krep:type81",  name: { es: "Type 81",       en: "Type 81" },       buyPrice: 5800,  sellPrice: 1900, icon: "textures/ui/icon_sword.png" },
    // ── Battle Rifles ─────────────────────────────────────────────────────────
    { id: "krep:scarh",   name: { es: "SCAR-H",        en: "SCAR-H" },        buyPrice: 8500,  sellPrice: 2800, icon: "textures/ui/icon_sword.png" },
    { id: "krep:fal",     name: { es: "FAL",           en: "FAL" },           buyPrice: 7800,  sellPrice: 2500, icon: "textures/ui/icon_sword.png" },
    { id: "krep:g3",      name: { es: "G3",            en: "G3" },            buyPrice: 7000,  sellPrice: 2200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:mk14",    name: { es: "MK14",          en: "MK14" },          buyPrice: 9000,  sellPrice: 3000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:sks",     name: { es: "SKS",           en: "SKS" },           buyPrice: 6500,  sellPrice: 2100, icon: "textures/ui/icon_sword.png" },
    // ── SMGs ──────────────────────────────────────────────────────────────────
    { id: "krep:mp5",     name: { es: "MP5",           en: "MP5" },           buyPrice: 4500,  sellPrice: 1500, icon: "textures/ui/icon_sword.png" },
    { id: "krep:uzi",     name: { es: "UZI",           en: "UZI" },           buyPrice: 3800,  sellPrice: 1200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:vector",  name: { es: "Vector",        en: "Vector" },        buyPrice: 5500,  sellPrice: 1800, icon: "textures/ui/icon_sword.png" },
    { id: "krep:ump",     name: { es: "UMP-45",        en: "UMP-45" },        buyPrice: 4200,  sellPrice: 1400, icon: "textures/ui/icon_sword.png" },
    { id: "krep:mp7",     name: { es: "MP7",           en: "MP7" },           buyPrice: 5000,  sellPrice: 1600, icon: "textures/ui/icon_sword.png" },
    { id: "krep:p90",     name: { es: "P90",           en: "P90" },           buyPrice: 5200,  sellPrice: 1700, icon: "textures/ui/icon_sword.png" },
    // ── Pistolas ──────────────────────────────────────────────────────────────
    { id: "krep:g17",     name: { es: "Glock 17",      en: "Glock 17" },      buyPrice: 2000,  sellPrice: 600,  icon: "textures/ui/icon_sword.png" },
    { id: "krep:g18",     name: { es: "Glock 18",      en: "Glock 18" },      buyPrice: 800,   sellPrice: 250,  icon: "textures/ui/icon_sword.png" },
    { id: "krep:m1911",   name: { es: "M1911",         en: "M1911" },         buyPrice: 2200,  sellPrice: 700,  icon: "textures/ui/icon_sword.png" },
    { id: "krep:p320",    name: { es: "P320",          en: "P320" },          buyPrice: 2300,  sellPrice: 750,  icon: "textures/ui/icon_sword.png" },
    { id: "krep:deagle",  name: { es: "Desert Eagle",  en: "Desert Eagle" },  buyPrice: 5000,  sellPrice: 1600, icon: "textures/ui/icon_sword.png" },
    { id: "krep:b93",     name: { es: "B93R",          en: "B93R" },          buyPrice: 2800,  sellPrice: 900,  icon: "textures/ui/icon_sword.png" },
    { id: "krep:cp",      name: { es: "CP",            en: "CP" },            buyPrice: 4200,  sellPrice: 1300, icon: "textures/ui/icon_sword.png" },
    { id: "krep:t50",     name: { es: "T50",           en: "T50" },           buyPrice: 4500,  sellPrice: 1500, icon: "textures/ui/icon_sword.png" },
    // ── Escopetas ─────────────────────────────────────────────────────────────
    { id: "krep:m870",    name: { es: "M870",          en: "M870" },          buyPrice: 5500,  sellPrice: 1800, icon: "textures/ui/icon_sword.png" },
    { id: "krep:aa12",    name: { es: "AA-12",         en: "AA-12" },         buyPrice: 7000,  sellPrice: 2300, icon: "textures/ui/icon_sword.png" },
    { id: "krep:saiga12", name: { es: "Saiga-12",      en: "Saiga-12" },      buyPrice: 6500,  sellPrice: 2100, icon: "textures/ui/icon_sword.png" },
    { id: "krep:m1014",   name: { es: "M1014",         en: "M1014" },         buyPrice: 6000,  sellPrice: 2000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:db",      name: { es: "Double Barrel", en: "Double Barrel" }, buyPrice: 3500,  sellPrice: 1100, icon: "textures/ui/icon_sword.png" },
    // ── Francotiradores ───────────────────────────────────────────────────────
    { id: "krep:awp",     name: { es: "AWP",           en: "AWP" },           buyPrice: 12000, sellPrice: 4000, icon: "textures/ui/icon_sword.png" },
    { id: "krep:m885",    name: { es: "M88.5",         en: "M88.5" },         buyPrice: 13000, sellPrice: 4300, icon: "textures/ui/icon_sword.png" },
    { id: "krep:win308",  name: { es: "Win 308",       en: "Win 308" },       buyPrice: 10000, sellPrice: 3300, icon: "textures/ui/icon_sword.png" },
    // ── Munición ──────────────────────────────────────────────────────────────
    { id: "krep:m43",      name: { es: "Mun. 7.62x39 (x60)",   en: "7.62x39 Ammo (x60)" },   buyPrice: 800,  sellPrice: 200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:mm9",      name: { es: "Mun. 9mm (x60)",        en: "9mm Ammo (x60)" },        buyPrice: 500,  sellPrice: 150, icon: "textures/ui/icon_sword.png" },
    { id: "krep:acp45",    name: { es: "Mun. .45 ACP (x60)",    en: ".45 ACP Ammo (x60)" },    buyPrice: 600,  sellPrice: 180, icon: "textures/ui/icon_sword.png" },
    { id: "krep:mm4630",   name: { es: "Mun. 4.6x30 (x60)",    en: "4.6x30 Ammo (x60)" },    buyPrice: 700,  sellPrice: 200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:mm5728",   name: { es: "Mun. 5.7x28 (x60)",    en: "5.7x28 Ammo (x60)" },    buyPrice: 700,  sellPrice: 200, icon: "textures/ui/icon_sword.png" },
    { id: "krep:ae50",     name: { es: "Mun. .50 AE (x20)",     en: ".50 AE Ammo (x20)" },     buyPrice: 900,  sellPrice: 280, icon: "textures/ui/icon_sword.png" },
    { id: "krep:gauge12",  name: { es: "Cart. 12 Gauge (x20)",  en: "12 Gauge Shells (x20)" }, buyPrice: 600,  sellPrice: 180, icon: "textures/ui/icon_sword.png" },
    { id: "krep:lapua338", name: { es: "Mun. .338 Lapua (x20)", en: ".338 Lapua Ammo (x20)" }, buyPrice: 1200, sellPrice: 400, icon: "textures/ui/icon_sword.png" },
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
