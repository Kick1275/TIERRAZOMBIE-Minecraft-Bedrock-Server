import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

// ─── CATÁLOGO DE COSMÉTICOS ───────────────────────────────────────────────────
// Deja aquí la plantilla para agregar más cosméticos en el futuro

export const COSMETICS_CATALOG = [
    {
        key:         "poppycat",
        itemId:      "cosmeticos:poppycat",
        label:       "§dPoppyCat §7- Botas",
        icon:        "textures/items/poppycat",
        description: "§7Unas botas únicas con diseño de gato.\n§7¡Conviértete en el más kawaii del servidor!",
        slot:        "slot.armor.feet",
        slotIndex:   4,             // contenedor index 0-based (4 = feet en armor)
        priceMoney:  0,
        priceGems:   50,
    },
    // Plantilla para nuevos cosméticos:
    // {
    //     key:         "mi_cosmetico",
    //     itemId:      "cosmeticos:mi_cosmetico",
    //     label:       "§eMi Cosmético §7- Slot",
    //     icon:        "textures/items/mi_cosmetico",
    //     description: "§7Descripción del cosmético.",
    //     slot:        "slot.armor.feet",   // feet / legs / chest / head
    //     slotIndex:   4,
    //     priceMoney:  5000,
    //     priceGems:   0,
    // },
];

const TAG_PREFIX  = "cosmetic:";  // "cosmetic:{key}" cuando está comprado
const EQUIP_TAG   = "equipped:";  // "equipped:{key}" cuando está equipado

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function hasCosmetic(player, key)   { return player.hasTag(TAG_PREFIX + key); }
export function isEquipped(player, key)    { return player.hasTag(EQUIP_TAG + key); }

function getScore(player, obj) {
    try { const o = world.scoreboard.getObjective(obj); return o ? (o.getScore(player) ?? 0) : 0; } catch { return 0; }
}
function setScore(player, obj, val) {
    try { const o = world.scoreboard.getObjective(obj); if (o) o.setScore(player, val); } catch {}
}

export function equipCosmetic(player, cosmetic) {
    try {
        // item_lock evita moverlo, keep_on_death evita perderlo al morir
        const nbt = `{"item_lock":{"mode":"lock_in_slot"},"keep_on_death":{}}`;
        player.runCommand(
            `replaceitem entity @s ${cosmetic.slot} ${cosmetic.itemId} 1 0 ${nbt}`
        );
        if (!player.hasTag(EQUIP_TAG + cosmetic.key)) player.addTag(EQUIP_TAG + cosmetic.key);
    } catch (e) {
        console.warn("[Cosmetics] equipCosmetic error: " + e);
    }
}

export function unequipCosmetic(player, cosmetic) {
    try {
        // Quitar el cosmético usando replaceitem con air
        player.runCommand(`replaceitem entity @s ${cosmetic.slot} air`);
        if (player.hasTag(EQUIP_TAG + cosmetic.key)) player.removeTag(EQUIP_TAG + cosmetic.key);
    } catch (e) {
        console.warn("[Cosmetics] unequipCosmetic error: " + e);
    }
}

// Restaurar cosméticos equipados al entrar
world.afterEvents.playerSpawn.subscribe(ev => {
    system.runTimeout(() => {
        try {
            const p = ev.player;
            for (const c of COSMETICS_CATALOG) {
                if (hasCosmetic(p, c.key) && isEquipped(p, c.key)) {
                    equipCosmetic(p, c);
                }
            }
        } catch {}
    }, 40);
});

// ─── UI DE COSMÉTICOS (tienda) ────────────────────────────────────────────────

export async function showCosmeticsShop(player) {
    const form = new ActionFormData()
        .title("§d§l✨ Cosméticos")
        .body("§7Selecciona un cosmético para ver más detalles.");

    for (const c of COSMETICS_CATALOG) {
        const owned = hasCosmetic(player, c.key);
        const price = c.priceGems > 0 && c.priceMoney === 0
            ? `§b${c.priceGems} gemas`
            : c.priceMoney > 0 && c.priceGems === 0
                ? `§e${c.priceMoney} coins`
                : `§e${c.priceMoney} coins §7o §b${c.priceGems} gemas`;
        const status = owned ? "§a✓ Comprado" : `§7${price}`;
        form.button(`${c.label}\n${status}`, c.icon);
    }
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === COSMETICS_CATALOG.length) return;

    await showCosmeticDetail(player, COSMETICS_CATALOG[res.selection]);
}

async function showCosmeticDetail(player, cosmetic) {
    const owned    = hasCosmetic(player, cosmetic.key);
    const equipped = isEquipped(player, cosmetic.key);
    const money    = getScore(player, "money");
    const gems     = getScore(player, "gems");

    let body = `${cosmetic.description}\n\n`;

    if (owned) {
        body += equipped ? "§a✓ Equipado actualmente" : "§7No equipado";
    } else {
        if (cosmetic.priceMoney > 0) body += `§7Precio: §e${cosmetic.priceMoney} coins  §7(tienes §e${money}§7)\n`;
        if (cosmetic.priceGems  > 0) body += `§7Precio: §b${cosmetic.priceGems} gemas  §7(tienes §b${gems}§7)\n`;
    }

    const form = new ActionFormData()
        .title(`§d${cosmetic.label}`).body(body);

    if (!owned) {
        if (cosmetic.priceMoney > 0) form.button(`§a💰 Comprar por §e${cosmetic.priceMoney} coins`);
        if (cosmetic.priceGems  > 0) form.button(`§a💎 Comprar por §b${cosmetic.priceGems} gemas`);
    } else {
        if (!equipped) form.button("§a▶ Equipar");
        else            form.button("§c⏹ Desequipar");
    }
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled) return;

    const buttons = [];
    if (!owned) {
        if (cosmetic.priceMoney > 0) buttons.push("buy_money");
        if (cosmetic.priceGems  > 0) buttons.push("buy_gems");
    } else {
        buttons.push(equipped ? "unequip" : "equip");
    }
    buttons.push("back");

    const action = buttons[res.selection];

    if (action === "buy_money") {
        if (money < cosmetic.priceMoney) { player.sendMessage("§cNo tienes suficiente dinero."); return; }
        setScore(player, "money", money - cosmetic.priceMoney);
        player.addTag(TAG_PREFIX + cosmetic.key);
        _recordPurchase(player.name, cosmetic.key);
        player.sendMessage(`§a✓ Compraste §d${cosmetic.label}§a.`);
        equipCosmetic(player, cosmetic);
    } else if (action === "buy_gems") {
        if (gems < cosmetic.priceGems) { player.sendMessage("§cNo tienes suficientes gemas."); return; }
        setScore(player, "gems", gems - cosmetic.priceGems);
        player.addTag(TAG_PREFIX + cosmetic.key);
        _recordPurchase(player.name, cosmetic.key);
        player.sendMessage(`§a✓ Compraste §d${cosmetic.label}§a.`);
        equipCosmetic(player, cosmetic);
    } else if (action === "equip") {
        equipCosmetic(player, cosmetic);
        player.sendMessage(`§a✓ Equipado: §d${cosmetic.label}`);
    } else if (action === "unequip") {
        unequipCosmetic(player, cosmetic);
        player.sendMessage(`§c✗ Desequipado: §d${cosmetic.label}`);
    }
}

// ─── UI DE MIS COSMÉTICOS (desde el menú de usuario) ──────────────────────────

export async function showMyCosmeticsUI(player) {
    const owned = COSMETICS_CATALOG.filter(c => hasCosmetic(player, c.key));

    if (owned.length === 0) {
        const form = new ActionFormData()
            .title("§d§l✨ Mis Cosméticos")
            .body("§7Aún no tienes cosméticos.\n§7¡Visita la tienda para conseguir uno!")
            .button("§a🛒 Ir a la Tienda")
            .button("§8Cerrar");
        const res = await form.show(player).catch(() => null);
        if (!res || res.canceled || res.selection === 1) return;
        await showCosmeticsShop(player);
        return;
    }

    const form = new ActionFormData()
        .title("§d§l✨ Mis Cosméticos")
        .body(`§7Tienes §e${owned.length} §7cosmético${owned.length !== 1 ? "s" : ""}.`);

    for (const c of owned) {
        const eq = isEquipped(player, c.key);
        form.button(`${c.label}\n${eq ? "§a✓ Equipado" : "§7Sin equipar"}`, c.icon);
    }
    form.button("§a🛒 Comprar más");
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled) return;

    const shopIdx = owned.length;
    const backIdx = owned.length + 1;

    if (res.selection === backIdx) return;
    if (res.selection === shopIdx) { await showCosmeticsShop(player); return; }

    await showCosmeticDetail(player, owned[res.selection]);
}

// ─── REGISTRO DE COMPRAS ──────────────────────────────────────────────────────

const PROP_COSMETICS = "cosmetics:purchases";
let _cosmeticsCache = null;

function _loadPurchases() {
    if (_cosmeticsCache) return _cosmeticsCache;
    try { const r = world.getDynamicProperty(PROP_COSMETICS); _cosmeticsCache = r ? JSON.parse(r) : {}; } catch { _cosmeticsCache = {}; }
    return _cosmeticsCache;
}
function _savePurchases(d) {
    _cosmeticsCache = d;
    try { world.setDynamicProperty(PROP_COSMETICS, JSON.stringify(d)); } catch {}
}
function _recordPurchase(name, key) {
    const d = _loadPurchases();
    if (!d[name]) d[name] = [];
    if (!d[name].includes(key)) d[name].push(key);
    _savePurchases(d);
}

// Restaurar tags de compra al entrar
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    system.runTimeout(() => {
        try {
            const p = ev.player;
            const d = _loadPurchases();
            for (const key of (d[p.name] ?? [])) {
                if (!p.hasTag(TAG_PREFIX + key)) p.addTag(TAG_PREFIX + key);
            }
        } catch {}
    }, 20);
});

console.warn("[CosmeticsSystem] Cargado");
