import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { isAdmin } from "../Config/GlobalConfig.js";

const DEFAULT_EMOTES = [
    { key: "wave",  label: "Wave",  animId: "animation.ds.emote.wave",  loop: false, sound: "random.orb" },
    { key: "bow",   label: "Bow",   animId: "animation.ds.emote.bow",   loop: false, sound: "random.orb" },
    { key: "shrug", label: "Shrug", animId: "animation.ds.emote.shrug", loop: false, sound: "random.orb" },
];

// webOnly:true → redirige a Kreviahub.com
const PURCHASABLE_EMOTES = [
    { key: "point_down",         label: "Point Down",         animId: "animation.ds.emote.point_down",           loop: false, sound: "random.orb", priceMoney: 1000,  priceGems: 0   },
    { key: "point_forward",      label: "Point Forward",      animId: "animation.ds.emote.point_forward",        loop: false, sound: "random.orb", priceMoney: 1000,  priceGems: 0   },
    { key: "point_up",           label: "Point Up",           animId: "animation.ds.emote.point_up",             loop: false, sound: "random.orb", priceMoney: 1000,  priceGems: 0   },
    { key: "nop",                label: "Nop",                animId: "animation.nop",                           loop: false, sound: "random.orb", priceMoney: 2500,  priceGems: 0   },
    { key: "sad",                label: "Sad",                animId: "animation.sad",                           loop: false, sound: "random.orb", priceMoney: 4000,  priceGems: 0   },
    { key: "bored",              label: "Bored",              animId: "animation.react_bored_1",                 loop: false, sound: "random.orb", priceMoney: 2000,  priceGems: 0   },
    { key: "react_bottom",       label: "React Bottom",       animId: "animation.react_bottom_1",                loop: false, sound: "random.orb", priceMoney: 2000,  priceGems: 0   },
    { key: "beckon",             label: "Beckon",             animId: "animation.ds.emote.beckon",               loop: false, sound: "random.orb", priceMoney: 2500,  priceGems: 0   },
    { key: "hurrah",             label: "Hurrah",             animId: "animation.ds.emote.hurrah",               loop: false, sound: "random.orb", priceMoney: 2500,  priceGems: 0   },
    { key: "joy",                label: "Joy",                animId: "animation.ds.emote.joy",                  loop: false, sound: "random.orb", priceMoney: 2500,  priceGems: 0   },
    { key: "prayer",             label: "Prayer",             animId: "animation.ds.emote.prayer",               loop: false, sound: "random.orb", priceMoney: 3000,  priceGems: 0   },
    { key: "laugh",              label: "Laugh",              animId: "animation.laugh",                         loop: true,  sound: "random.orb", priceMoney: 5000,  priceGems: 0   },
    { key: "proper_bow",         label: "Proper Bow",         animId: "animation.ds.emote.proper_bow",           loop: false, sound: "random.orb", priceMoney: 4000,  priceGems: 0   },
    { key: "military_salute",    label: "Military Salute",    animId: "animation.eu.emote.military_salute",      loop: false, sound: "random.orb", priceMoney: 4000,  priceGems: 0   },
    { key: "snow_angel",         label: "Snow Angel",         animId: "animation.snow_angel",                    loop: false, sound: "random.orb", priceMoney: 5000,  priceGems: 0   },
    { key: "sleep_in_air",       label: "Sleep In Air",       animId: "animation.eu.emote.sleep_in_air",         loop: false, sound: "random.orb", priceMoney: 5000,  priceGems: 0   },
    { key: "dab",                label: "Dab",                animId: "animation.dab_dance",                     loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 50,  webOnly: true },
    { key: "tilt",               label: "Tilt",               animId: "animation.eu.emote.tilt",                 loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 50,  webOnly: true },
    { key: "rat_dance",          label: "Rat Dance",          animId: "animation.rat_dance",                     loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "buggie_dance",       label: "Buggie Dance",       animId: "animation.buggie_dance",                  loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "floss_dance",        label: "Floss Dance",        animId: "animation.floss_dance",                   loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "doodle_dance",       label: "Doodle Dance",       animId: "animation.doodle_dance",                  loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "prostration",        label: "Prostration",        animId: "animation.ds.emote.prostration",          loop: false, sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "well_what_is_it",    label: "Well, What Is It?",  animId: "animation.ds.emote.well_what_is_it",      loop: false, sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "cute_dance",         label: "Cute Dance",         animId: "animation.cute_dance",                    loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "griddy",             label: "Griddy",             animId: "animation.griddy",                        loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "penguin_dance",      label: "Penguin Dance",      animId: "animation.club_penguin",                  loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "piglin_celebration", label: "Piglin Celebration", animId: "animation.piglin.celebrate_hunt_special", loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 150, webOnly: true },
    { key: "kazoch_kick",        label: "Kazoch Kick",        animId: "animation.kazoch_kick",                   loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 15,  webOnly: true },
    { key: "hakari_dance",       label: "Hakari Dance",       animId: "animation.hakari_dance",                  loop: false, sound: "random.orb", priceMoney: 0,     priceGems: 20,  webOnly: true },
    { key: "praise_the_sun",     label: "Praise The Sun",     animId: "animation.ds.emote.praise_the_sun",       loop: false, sound: "random.orb", priceMoney: 0,     priceGems: 25,  webOnly: true },
    { key: "jojo_pose",          label: "JoJo Pose",          animId: "animation.jojo_pose",                     loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 30,  webOnly: true },
    { key: "golden_freddy_pose", label: "Golden Freddy Pose", animId: "animation.eu.emote.golden_freddy_pose",   loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 35,  webOnly: true },
    { key: "head_spin",          label: "Head Spin",          animId: "animation.eu.emote.head_spin",            loop: true,  sound: "random.orb", priceMoney: 0,     priceGems: 50,  webOnly: true },
    // { key: "mi_emote", label: "Mi Emote", animId: "animation.mi_emote", loop: false, sound: "random.orb", priceMoney: 5000, priceGems: 0 },
];

const TAG_PREFIX = "emote:";

function hasEmote(player, key) { return player.hasTag(TAG_PREFIX + key); }
function getLang(player) {
    try { const s = player.getDynamicProperty("playerSettings"); return s ? (JSON.parse(s).language ?? "es") : "es"; } catch { return "es"; }
}
function getScore(player, obj) {
    try { const o = world.scoreboard.getObjective(obj); return o ? (o.getScore(player) ?? 0) : 0; } catch { return 0; }
}
function setScore(player, obj, val) {
    try { const o = world.scoreboard.getObjective(obj); if (o) o.setScore(player, val); } catch {}
}
function playEmote(player, emote) {
    const stop = emote.loop ? "(q.is_moving)" : "(q.is_moving || query.all_animations_finished)";
    system.run(() => {
        try { player.playAnimation(emote.animId, { stopExpression: stop }); } catch {}
        try { player.runCommand(`playsound ${emote.sound} @s ~ ~ ~ 1 1`); } catch {}
    });
}

export async function showEmoteUI(player) {
    const admin = isAdmin(player);
    const available = [...DEFAULT_EMOTES, ...PURCHASABLE_EMOTES.filter(e => hasEmote(player, e.key))];

    const form = new ActionFormData()
        .title("§6§l🕺 Emotes")
        .body(`§7Tienes §e${available.length} §7emote${available.length !== 1 ? "s" : ""}.`);
    for (const e of available) form.button(`§f${e.label}`, `textures/emotes/${e.key}`);
    form.button("§a🛒 Comprar más Emotes");
    if (admin) form.button("§c🔧 Panel Admin Emotes");
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled) return;

    const buyIdx   = available.length;
    const adminIdx = admin ? buyIdx + 1 : -1;
    const backIdx  = buyIdx + (admin ? 2 : 1);

    if (res.selection === backIdx) return;
    if (res.selection === buyIdx)  { await _openEmoteShop(player); return; }
    if (admin && res.selection === adminIdx) { await showEmoteAdminPanel(player); return; }
    playEmote(player, available[res.selection]);
}

async function _openEmoteShop(player) {
    const unowned = PURCHASABLE_EMOTES.filter(e => !hasEmote(player, e.key));
    if (unowned.length === 0) { player.sendMessage("§a✓ ¡Ya tienes todos los emotes!"); return; }

    const form = new ActionFormData().title("§6§l🛒 Tienda de Emotes").body("§7Selecciona un emote.");
    for (const e of unowned) {
        const price = e.webOnly
            ? `§6⭐ §eKreviahub.com`
            : e.priceGems > 0
                ? `§e${e.priceMoney} coins §7o §b${e.priceGems} gemas`
                : `§e${e.priceMoney} coins`;
        form.button(`§f${e.label}\n${price}`, `textures/emotes/${e.key}`);
    }
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === unowned.length) { await showEmoteUI(player); return; }
    await _confirmPurchase(player, unowned[res.selection]);
}

async function _confirmPurchase(player, emote) {
    if (emote.webOnly) {
        const lang = getLang(player);
        const body = lang === "en"
            ? `§bYou selected: §f${emote.label}\n\n§7Requires §b${emote.priceGems} gems§7.\n§7Buy at our web store. Copy the URL with Ctrl+A → Ctrl+C`
            : `§bHas seleccionado: §f${emote.label}\n\n§7Requiere §b${emote.priceGems} gemas§7.\n§7Cómpralo en nuestra tienda web. Copia la URL con Ctrl+A → Ctrl+C`;
        await new ModalFormData()
            .title(lang === "en" ? "§6KreviaHub Store" : "§6KreviaHub Tienda")
            .textField(body, "URL", { defaultValue: "Kreviahub.com" })
            .show(player).catch(() => null);
        player.sendMessage(lang === "en" ? "§aThanks for visiting!" : "§a¡Gracias por visitarnos!");
        return;
    }

    const money   = getScore(player, "money");
    const gems    = getScore(player, "gems");
    const canMoney = emote.priceMoney > 0 && money >= emote.priceMoney;
    const canGems  = emote.priceGems  > 0 && gems  >= emote.priceGems;

    let body = `§f${emote.label}\n\n§7Tu saldo: §e${money} coins  §b${gems} gemas\n\n`;
    if (emote.priceMoney > 0) body += `§e${emote.priceMoney} coins ${canMoney ? "§a✓" : "§c✗"}\n`;
    if (emote.priceGems  > 0) body += `§b${emote.priceGems} gemas ${canGems  ? "§a✓" : "§c✗"}`;

    const form = new ActionFormData().title("§6Comprar Emote").body(body);
    if (canMoney) form.button(`§a Comprar por §e${emote.priceMoney} coins`);
    if (canGems)  form.button(`§a Comprar por §b${emote.priceGems} gemas`);
    if (!canMoney && !canGems) form.button("§cSaldo insuficiente");
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled) return;

    const btns = [];
    if (canMoney) btns.push("money");
    if (canGems)  btns.push("gems");
    btns.push("back");
    
    

    const action = btns[res.selection];
    if (action === "money") {
        setScore(player, "money", money - emote.priceMoney);
        player.addTag(TAG_PREFIX + emote.key);
        _recordPurchase(player.name, emote.key);
        player.sendMessage(`§a✓ Compraste §f${emote.label}§a. §7(-${emote.priceMoney} coins)`);
        await showEmoteUI(player);
    } else if (action === "gems") {
        setScore(player, "gems", gems - emote.priceGems);
        player.addTag(TAG_PREFIX + emote.key);
        _recordPurchase(player.name, emote.key);
        player.sendMessage(`§a✓ Compraste §f${emote.label}§a. §7(-${emote.priceGems} gemas)`);
        await showEmoteUI(player);
    } else {
        await _openEmoteShop(player);
    }
}

const PROP = "emote:purchases";
let _purchaseCache = null; // caché en memoria

function _loadPurchases() {
    if (_purchaseCache) return _purchaseCache;
    try { const r = world.getDynamicProperty(PROP); _purchaseCache = r ? JSON.parse(r) : {}; } catch { _purchaseCache = {}; }
    return _purchaseCache;
}
function _savePurchases(d) {
    _purchaseCache = d;
    try { world.setDynamicProperty(PROP, JSON.stringify(d)); } catch {}
}
function _recordPurchase(name, key) {
    const d = _loadPurchases();
    if (!d[name]) d[name] = [];
    if (!d[name].includes(key)) d[name].push(key);
    _savePurchases(d);
}

export async function showEmoteAdminPanel(player) {
    const purchases = _loadPurchases();
    const buyers = Object.keys(purchases);
    const form = new ActionFormData()
        .title("§c§l🔧 Admin — Emotes")
        .body(buyers.length === 0 ? "§7Nadie ha comprado emotes." : `§e${buyers.length} §7jugador${buyers.length !== 1 ? "es" : ""}.`);
    for (const name of buyers) form.button(`§f${name}\n§7${purchases[name].length} emote${purchases[name].length !== 1 ? "s" : ""}`, "textures/ui/icon_multiplayer");
    form.button("§8Cerrar");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === buyers.length) return;
    const keys   = purchases[buyers[res.selection]];
    const labels = keys.map(k => PURCHASABLE_EMOTES.find(e => e.key === k)?.label ?? k);
    await new ActionFormData()
        .title(`§c§l${buyers[res.selection]} — Emotes`)
        .body("§7Emotes:\n" + labels.map(l => `§e• §f${l}`).join("\n"))
        .button("§8Volver").show(player).catch(() => null);
    await showEmoteAdminPanel(player);
}

export const showEmoteShop = showEmoteUI;

world.beforeEvents.chatSend.subscribe(ev => {
    const msg = ev.message.trim();
    if (!msg.startsWith("!emotes")) return;
    ev.cancel = true;
    system.run(() => {
        const player = ev.sender;
        if (!isAdmin(player)) { player.sendMessage("§cNo tienes permisos."); return; }
        if (msg === "!emotes export") {
            const json = JSON.stringify(_loadPurchases());
            const size = 900, parts = Math.ceil(json.length / size);
            player.sendMessage(`§a[EmoteExport] §7${json.length} chars, ${parts} parte${parts !== 1 ? "s" : ""}:`);
            for (let i = 0; i < parts; i++) player.sendMessage(`§e[${i+1}/${parts}] §f${json.slice(i*size,(i+1)*size)}`);
            player.sendMessage("§a✓ Usa §e!emotes import <json>§a en el nuevo mundo.");
            return;
        }
        if (msg.startsWith("!emotes import ")) {
            try {
                const data = JSON.parse(msg.slice("!emotes import ".length).trim());
                _savePurchases(data);
                let n = 0;
                for (const p of world.getAllPlayers()) for (const k of (data[p.name] ?? [])) if (!p.hasTag(TAG_PREFIX+k)) { p.addTag(TAG_PREFIX+k); n++; }
                player.sendMessage(`§a✓ Importados. §e${Object.keys(data).length}§a jugadores, §e${n}§a tags.`);
            } catch (e) { player.sendMessage("§cJSON inválido: " + e); }
            return;
        }
        player.sendMessage("§7Uso: §e!emotes export §7| §e!emotes import <json>");
    });
});

world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    system.runTimeout(() => {
        try {
            const p = ev.player;
            for (const k of (_loadPurchases()[p.name] ?? [])) if (!p.hasTag(TAG_PREFIX+k)) p.addTag(TAG_PREFIX+k);
        } catch {}
    }, 20);
});

console.warn("[EmoteSystem] Cargado");
