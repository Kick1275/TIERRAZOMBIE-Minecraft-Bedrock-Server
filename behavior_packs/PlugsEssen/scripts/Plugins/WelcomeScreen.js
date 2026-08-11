import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const WELCOME_KEY = "tz:welcome_done";

function sleep(ticks) {
    return new Promise(resolve => system.runTimeout(resolve, ticks));
}

// Reintenta mostrar el form si el jugador aún está en pantalla de carga.
async function showForm(buildForm, player, maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
        const res = await buildForm().show(player);
        if (res.cancelationReason !== "UserBusy") return res;
        await sleep(40);
    }
    return { canceled: true };
}

// ─── Strings ──────────────────────────────────────────────────────────────────

const S = {
    es: {
        title: "§l§6TZ §8— §fBienvenida",
        body:
            "§l§6¿QUÉ ES TZ?§r\n" +
            "§7Servidor de supervivencia zombie semianárquico. Saquea el mundo,\n" +
            "§7equípate con armas tácticas y construye tu economía.\n" +
            "\n" +
            "§l§bCHAT DE VOZ§r\n" +
            "§7TZ tiene chat de voz de proximidad. Para conectarte copia esta URL en tu navegador:\n" +
            "§b  [PENDIENTE — URL del video]\n" +
            "§7O búscalo en los grupos oficiales:\n" +
            "§f  Discord: §b[PENDIENTE] §7→ canal §fChat de voz / Voice Chat\n" +
            "§f  WhatsApp: §b[PENDIENTE] §7→ descripción del grupo\n" +
            "\n" +
            "§l§cREGLAS§r\n" +
            "§71. No hacks, exploits ni abuso de bugs.\n" +
            "§72. No texturas con ventaja (PvP skins, wallhack, etc.).\n" +
            "§73. No farmear kills al mismo jugador repetidamente.\n" +
            "§74. No arruinar la experiencia de jugadores nuevos.\n" +
            "§75. No insultos graves, doxing ni acoso.\n" +
            "§76. No suplantación de staff o del dueño.\n" +
            "§77. PvP libre fuera de zonas seguras (servidor semi-anárquico).\n" +
            "§78. El staff puede sancionar según su criterio e interpretación.\n" +
            "\n" +
            "§l§aCOMUNIDAD§r\n" +
            "§fDiscord: §b[PENDIENTE] §7— anuncios, soporte, chat de voz\n" +
            "§fWhatsApp: §b[PENDIENTE] §7— grupo principal",
        toggleLabel: "§eHe leído todas las reglas y me comprometo a cumplirlas",
        done: "§a[TZ] ¡Bienvenido/a! Gracias por aceptar las reglas. ¡Disfruta el servidor!",
    },
    en: {
        title: "§l§6TZ §8— §fWelcome",
        body:
            "§l§6WHAT IS TZ?§r\n" +
            "§7A semi-anarchic zombie survival server. Loot the world,\n" +
            "§7gear up with tactical weapons and build your economy.\n" +
            "\n" +
            "§l§bVOICE CHAT§r\n" +
            "§7TZ has proximity voice chat. Paste this URL into your browser:\n" +
            "§b  [PENDING — video link]\n" +
            "§7Or find it in our official groups:\n" +
            "§f  Discord: §b[PENDING] §7→ channel §fChat de voz / Voice Chat\n" +
            "§f  WhatsApp: §b[PENDING] §7→ group description\n" +
            "\n" +
            "§l§cRULES§r\n" +
            "§71. No hacks, exploits, or bug abuse.\n" +
            "§72. No textures that give an advantage (PvP textures, wallhack, etc.).\n" +
            "§73. No kill farming the same player repeatedly.\n" +
            "§74. Do not ruin the experience of new players.\n" +
            "§75. No serious insults, doxing, or harassment.\n" +
            "§76. No impersonating staff or the owner.\n" +
            "§77. PvP is free outside safe zones (semi-anarchic server).\n" +
            "§78. Staff may sanction at their own discretion.\n" +
            "\n" +
            "§l§aCOMMUNITY§r\n" +
            "§fDiscord: §b[PENDING] §7— announcements, support, voice chat\n" +
            "§fWhatsApp: §b[PENDING] §7— main group",
        toggleLabel: "§eI have read all the rules and commit to following them",
        done: "§a[TZ] Welcome! Thanks for accepting the rules. Enjoy the server!",
    },
};

function getLang(player) {
    try {
        const raw = player.getDynamicProperty("playerSettings");
        if (raw) return JSON.parse(raw).language === "en" ? "en" : "es";
    } catch {}
    return "es";
}

export async function showWelcomeScreen(player) {
    try {
        const s = S[getLang(player)];

        const res = await showForm(
            () => new ModalFormData().title(s.title).label(s.body).toggle(s.toggleLabel, { defaultValue: false }),
            player
        );

        // Cerró sin activar el toggle → puede jugar, vuelve la próxima sesión
        if (res.canceled || !res.formValues?.[0]) return;

        // Toggle activado ✓ → nunca más aparece
        try { player.setDynamicProperty(WELCOME_KEY, true); } catch {}
        player.sendMessage(s.done);
        player.playSound("random.levelup");
    } catch (e) {
        console.warn("[WelcomeScreen] error: " + e);
    }
}

world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    system.runTimeout(() => {
        try {
            if (ev.player.getDynamicProperty(WELCOME_KEY) !== true)
                showWelcomeScreen(ev.player);
        } catch (e) {
            console.warn("[WelcomeScreen] spawn error: " + e);
        }
    }, 20);
});

// .resetwelcome          → resetea al propio admin
// .resetwelcome Nombre   → resetea a otro jugador conectado
world.beforeEvents.chatSend.subscribe(ev => {
    if (!ev.message.startsWith(".resetwelcome")) return;
    ev.cancel = true;
    const sender = ev.sender;
    system.run(() => {
        try {
            if (!sender.hasTag("admin")) { sender.sendMessage("§cNo tienes permisos."); return; }
            const targetName = ev.message.split(" ")[1];
            const target = targetName ? world.getAllPlayers().find(p => p.name === targetName) : sender;
            if (!target) { sender.sendMessage(`§cJugador '${targetName}' no encontrado.`); return; }
            target.setDynamicProperty(WELCOME_KEY, undefined);
            sender.sendMessage(`§a✓ Welcome reseteado para §f${target.name}§a.`);
        } catch (e) { sender.sendMessage("§cError: " + e); }
    });
});

console.warn("[WelcomeScreen] v4 cargado");
