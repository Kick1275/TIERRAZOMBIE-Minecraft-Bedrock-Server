import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { showEmoteShop }      from "./EmoteSystem.js";
import { getAllCrates }        from "./Crates/CrateManager.js";
import { openCratePlayerUI }  from "./Crates/CratePlayerUI.js";

// ─── IDIOMA (desde playerSettings de PlugsEssentials) ────────────────────────

function getLang(player) {
    try {
        const raw = player.getDynamicProperty("playerSettings");
        if (raw) {
            const s = JSON.parse(raw);
            if (s.language === "en") return "en";
        }
    } catch {}
    return "es";
}

// ─── TEXTOS ───────────────────────────────────────────────────────────────────

const T = {
    es: {
        title:           "§6TzShop §e- §aTienda Oficial",
        body:            "§b¡Bienvenido a TzShop! Selecciona una categoría:",
        kits:            "§eKits §7- Equipamiento especializado",
        crates:          "§6Llaves de Crates §7- Desbloquea cajas de recompensas",
        emotes:          "§dEmotes §7- Expresiones únicas",
        cosmetics:       "§5Cosméticos §7- Personaliza tu personaje",
        cosmetics_item:  "Cosméticos",
        gems:            "§bGemas §7- Compra gemas para premios exclusivos",
        closed:          "§cHas cerrado la tienda.",
        kits_title:      "§eKits - Equipamiento especializado",
        kits_body:       "§bSelecciona un kit:",
        kit_merc:        "§6Kit Mercenario §7- Equipo básico de combate",
        kit_mil:         "§2Kit Militar §7- Equipo avanzado para misiones",
        kit_spec:        "§4Kit SpecOps §7- Equipo élite",
        crates_title:    "§6Llaves de Crates",
        crates_body:     "§bSelecciona la crate para comprar su llave:",
        crates_empty:    "§cNo hay crates disponibles actualmente.",
        gems_title:      "§b💎 Gemas",
        gems_body:       "§bSelecciona un paquete de gemas:",
        url_msg:         "§bHas seleccionado: §e{item}\n§aVisita nuestra tienda web para completar tu compra:",
        url_hint:        "Haz clic en el cuadro de texto de abajo, copia la URL, luego presiona Ctrl+A para seleccionar todo el texto y Ctrl+C para copiarlo. Esto solo funcionará si estás en una PC o tienes un teclado conectado.",
        url_closed:      "§cHas cerrado la ventana de la tienda web.",
        thanks:          "§a¡Gracias por visitar nuestra tienda!",
        back:            "§8Volver",
    },
    en: {
        title:           "§6TzShop §e- §aOfficial Store",
        body:            "§bWelcome to TzShop! Select a category:",
        kits:            "§eKits §7- Specialized equipment",
        crates:          "§6Crate Keys §7- Unlock reward boxes",
        emotes:          "§dEmotes §7- Unique expressions",
        cosmetics:       "§5Cosmetics §7- Personalize your character",
        cosmetics_item:  "Cosmetics",
        gems:            "§bGems §7- Buy gems for exclusive rewards",
        closed:          "§cYou closed the shop.",
        kits_title:      "§eKits - Specialized equipment",
        kits_body:       "§bSelect a kit:",
        kit_merc:        "§6Mercenary Kit §7- Basic combat gear",
        kit_mil:         "§2Military Kit §7- Advanced mission gear",
        kit_spec:        "§4SpecOps Kit §7- Elite operations gear",
        crates_title:    "§6Crate Keys",
        crates_body:     "§bSelect a crate to buy its key:",
        crates_empty:    "§cNo crates available right now.",
        gems_title:      "§b💎 Gems",
        gems_body:       "§bSelect a gem package:",
        url_msg:         "§bYou selected: §e{item}\n§aVisit our web store to complete your purchase:",
        url_hint:        "Click on the text box below, copy the URL, then press Ctrl+A to select all text and Ctrl+C to copy. This will only work if you are on PC or have a keyboard connected.",
        url_closed:      "§cYou closed the web store window.",
        thanks:          "§aThanks for visiting our store!",
        back:            "§8Back",
    },
};

// ─── PANEL WEB ────────────────────────────────────────────────────────────────

const STORE_URL = "Kreviahub.com";

function pcCopyTextPanel(player, item) {
    const t = T[getLang(player)];
    const lang = getLang(player);
    new ModalFormData()
        .title(lang === "es" ? "§6§lKreviaHub §e- Tienda" : "§6§lKreviaHub §e- Store")
        .textField(
            `${t.url_msg.replace("{item}", item)}\n\n${t.url_hint}\n§e${STORE_URL}`,
            "URL",
            { defaultValue: STORE_URL }
        )
        .show(player)
        .then(r => player.sendMessage(r.canceled ? t.url_closed : t.thanks))
        .catch(() => {});
}

// ─── MENÚ PRINCIPAL ───────────────────────────────────────────────────────────

export async function showShopForm(player) {
    const t = T[getLang(player)];
    const res = await new ActionFormData()
        .title(t.title).body(t.body)
        .button(t.kits,      "textures/ui/Iconos/KIT SpecOps.png")
        .button(t.crates,    "textures/ui/icon_blackfriday.png")
        .button(t.emotes,    "textures/ui/sidebar_icons/dressing_room_animation.png")
        .button(t.cosmetics, "textures/ui/MashupIcon.png")
        .button(t.gems,      "textures/ui/MCoin")
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    switch (res.selection) {
        case 0: _mostrarKits(player);              break;
        case 1: await _mostrarCrates(player);      break;
        case 2: await showEmoteShop(player);       break;
        case 3: pcCopyTextPanel(player, t.cosmetics_item); break;
        case 4: _mostrarGemas(player);             break;
    }
}

// ─── KITS ─────────────────────────────────────────────────────────────────────

function _mostrarKits(player) {
    const t = T[getLang(player)];
    new ActionFormData()
        .title(t.kits_title).body(t.kits_body)
        .button(t.kit_merc).button(t.kit_mil).button(t.kit_spec)
        .show(player)
        .then(r => {
            if (r.canceled) return;
            pcCopyTextPanel(player, [t.kit_merc, t.kit_mil, t.kit_spec][r.selection]);
        }).catch(() => {});
}

// ─── CRATES ───────────────────────────────────────────────────────────────────

async function _mostrarCrates(player) {
    const t      = T[getLang(player)];
    const crates = getAllCrates();
    const ids    = Object.keys(crates);

    if (ids.length === 0) { player.sendMessage(t.crates_empty); return; }

    const form = new ActionFormData().title(t.crates_title).body(t.crates_body);
    for (const id of ids) {
        const c = crates[id];
        form.button(`§6${c.name ?? id}\n§7${(c.lots ?? []).length} premios`);
    }
    form.button(t.back);

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === ids.length) return;
    await openCratePlayerUI(player, ids[res.selection]);
}

// ─── GEMAS ────────────────────────────────────────────────────────────────────

function _mostrarGemas(player) {
    const t = T[getLang(player)];
    new ActionFormData()
        .title(t.gems_title).body(t.gems_body)
        .button("§b50 Gemas")
        .button("§b100 Gemas")
        .button("§b250 Gemas")
        .button("§b500 Gemas")
        .button("§b1000 Gemas")
        .show(player)
        .then(r => {
            if (r.canceled) return;
            const pkgs = [50, 100, 250, 500, 1000];
            if (r.selection < pkgs.length) pcCopyTextPanel(player, `${pkgs[r.selection]} Gemas`);
        }).catch(() => {});
}

// ─── EXPONER VIA globalThis + registrar eventos del NPC aquí directamente ─────
// El listener está en PlugsEssentials para evitar problemas de timing entre packs

globalThis.__tzShopAPI = { showShopForm };

world.afterEvents.playerInteractWithEntity.subscribe(ev => {
    if (ev.target.typeId === "tz:npc_tzshop") {
        system.run(() => showShopForm(ev.player));
    }
});

world.afterEvents.entityHitEntity.subscribe(ev => {
    if (ev.damagingEntity?.typeId === "minecraft:player" &&
        ev.hitEntity?.typeId    === "tz:npc_tzshop") {
        system.run(() => showShopForm(ev.damagingEntity));
    }
});

console.warn("[TzShopSystem] Cargado");
