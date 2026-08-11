import { world, system } from "@minecraft/server";
import { clearPlayerMissionsCache } from "./DailyMissions.js";
import { clearTutorialCache } from "./TutorialMissions.js";
import { showWelcomeScreen } from "./WelcomeScreen.js";

// Keys que corresponden a cada módulo
const KEY_DAILY    = "dm:daily";
const KEY_WEEKLY   = "dm:weekly";
const KEY_TUTORIAL = "tm:state";
const KEY_WELCOME  = "tz:welcome_done";

async function simulateNewPlayer(admin, target) {
    // Resetear misiones y progresión persistida
    try { target.setDynamicProperty(KEY_DAILY,    undefined); } catch {}
    try { target.setDynamicProperty(KEY_WEEKLY,   undefined); } catch {}
    try { target.setDynamicProperty(KEY_TUTORIAL, undefined); } catch {}
    try { target.setDynamicProperty(KEY_WELCOME,  undefined); } catch {}
    clearPlayerMissionsCache(target);
    try { clearTutorialCache(target); } catch {}

    // Quitar el tag del kit para que P.js lo entregue en el próximo spawn
    try { await target.runCommandAsync("tag @s remove tz_kit_inicio"); } catch {}

    // Mostrar la UI de bienvenida de inmediato
    showWelcomeScreen(target);

    const isSelf = admin.id === target.id;
    admin.sendMessage(
        isSelf
            ? "§a✓ Reset completo. Misiones, tutorial y welcome reseteados. El kit de bienvenida se entregará en el próximo spawn."
            : `§a✓ Reset completo para §f${target.name}§a. Misiones, tutorial y welcome reseteados. Kit en el próximo spawn.`
    );
}

// Comando: .simnuevo [NombreJugador]
world.beforeEvents.chatSend.subscribe(ev => {
    if (!ev.message.startsWith(".simnuevo")) return;
    ev.cancel = true;
    const sender = ev.sender;
    system.run(async () => {
        try {
            if (!sender.hasTag("admin")) {
                sender.sendMessage("§c[TZ] No tienes permisos para usar este comando.");
                return;
            }
            const parts = ev.message.trim().split(/\s+/);
            const targetName = parts[1];
            const target = targetName
                ? world.getAllPlayers().find(p => p.name === targetName)
                : sender;
            if (!target) {
                sender.sendMessage(`§c[TZ] Jugador '${targetName}' no encontrado o no está conectado.`);
                return;
            }
            await simulateNewPlayer(sender, target);
        } catch (e) {
            sender.sendMessage("§c[TZ] Error: " + e);
            console.warn("[NewPlayerTest] error: " + e);
        }
    });
});

console.warn("[NewPlayerTest] cargado — .simnuevo [jugador]");
