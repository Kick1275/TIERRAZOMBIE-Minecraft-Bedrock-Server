import { system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { isAdmin } from "../Config/GlobalConfig.js";

// ─── Sistema de Recompensas Diarias ────────────────────────────────────────────
// Racha de 7 días con llaves de crate. Estado en dynamic property por jugador.
//
// Nota: tz:key_oak / tz:key_gold / tz:key_emerald no existían como items reales
// en ningún pack (Creates.js de DeadZone los espera por typeId, pero nunca se
// definieron) — por eso nunca se entregaba nada. Se agregaron sus definiciones
// en PlugsEssen/items/tz_key_*.json, así que ahora un /give normal funciona y
// además las llaves abren las crates reales de DeadZone en el mapa.

const STATE_KEY = "dr:state";
const DAY_MS = 86400000;

// Iconos de estado — distintos del icono de la recompensa para que se note de un
// vistazo cuál día está disponible, cuál ya se reclamó y cuáles siguen bloqueados.
const ICON_AVAILABLE = "textures/ui/accessibility_glyph_color";
const ICON_CLAIMED = "textures/ui/confirm";
const ICON_LOCKED = "textures/ui/lock_color";

const DAILY_REWARDS = [
    null,
    { itemId: "tz:key_oak",     name: "Llave de Crate de Roble",     icon: "textures/items/wooden_key" },
    { itemId: "tz:key_oak",     name: "Llave de Crate de Roble",     icon: "textures/items/wooden_key" },
    { itemId: "tz:key_gold",    name: "Llave de Crate de Oro",       icon: "textures/items/golden_key" },
    { itemId: "tz:key_gold",    name: "Llave de Crate de Oro",       icon: "textures/items/golden_key" },
    { itemId: "tz:key_gold",    name: "Llave de Crate de Oro",       icon: "textures/items/golden_key" },
    { itemId: "tz:key_gold",    name: "Llave de Crate de Oro",       icon: "textures/items/golden_key" },
    { itemId: "tz:key_emerald", name: "Llave de Crate de Esmeralda", icon: "textures/items/emerald_key" },
];

function getMidnightUTC() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function getState(player) {
    try {
        const raw = player.getDynamicProperty(STATE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return { lastDay: -1, streak: 0 };
}

function saveState(player, state) {
    try { player.setDynamicProperty(STATE_KEY, JSON.stringify(state)); } catch {}
}

// Calcula qué día (1-7) correspondería reclamar hoy, sin confirmarlo todavía.
function previewNextDay(state) {
    const today = getMidnightUTC();
    if (state.lastDay === today) return null; // ya reclamado hoy
    const yesterday = today - DAY_MS;
    if (state.lastDay === yesterday) return state.streak >= 7 ? 1 : state.streak + 1;
    return 1; // racha rota o primera vez
}

function grantDailyReward(player, day) {
    const r = DAILY_REWARDS[day];
    if (!r) return;
    try {
        player.runCommand(`give @s ${r.itemId} 1`);
        player.sendMessage(`§a§l✓ Recompensa Diaria (Día ${day}/7):§r §f${r.name}`);
        player.playSound("random.levelup");
    } catch (e) {
        console.warn("[DailyRewards] Error al otorgar recompensa: " + e);
    }
}

function claimDailyReward(player) {
    const state = getState(player);
    const today = getMidnightUTC();
    if (state.lastDay === today) return null;

    const day = previewNextDay(state);
    state.streak = day;
    state.lastDay = today;
    saveState(player, state);
    grantDailyReward(player, day);
    return day;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export function showDailyRewardsUI(player) {
    const state = getState(player);
    const today = getMidnightUTC();
    const claimedToday = state.lastDay === today;
    const nextDay = claimedToday ? null : previewNextDay(state);
    const referenceDay = claimedToday ? state.streak : nextDay;

    const form = new ActionFormData()
        .title("§l§6Recompensas Diarias")
        .body(claimedToday
            ? `§7Ya reclamaste tu recompensa de hoy (Día §e${state.streak}§7/7).\n§7Vuelve mañana para continuar la racha.`
            : `§7¡Tienes una recompensa disponible! Reclama el Día §e${nextDay}§7/7.`);

    for (let day = 1; day <= 7; day++) {
        const r = DAILY_REWARDS[day];
        let status, icon;
        if (!claimedToday && day === nextDay) { status = "§a§l[DISPONIBLE]"; icon = ICON_AVAILABLE; }
        else if (claimedToday && day === state.streak) { status = "§b[RECLAMADO HOY]"; icon = ICON_CLAIMED; }
        else if (day < referenceDay) { status = "§7[Completado]"; icon = ICON_CLAIMED; }
        else { status = "§8[Bloqueado]"; icon = ICON_LOCKED; }
        form.button(`§fDía ${day}\n§7${r.name}\n${status}`, icon);
    }

    const adminCanSee = isAdmin(player);
    if (adminCanSee) form.button("§c§lPanel Admin\n§r§7Herramientas de prueba", "textures/ui/op.png");

    form.show(player).then(res => {
        if (res.canceled) return;

        if (adminCanSee && res.selection === 7) {
            showAdminPanel(player);
            return;
        }

        const day = res.selection + 1;
        if (!claimedToday && day === nextDay) {
            claimDailyReward(player);
            system.run(() => showDailyRewardsUI(player));
        } else if (claimedToday) {
            player.sendMessage("§eYa reclamaste tu recompensa de hoy. Vuelve mañana.");
        } else {
            player.sendMessage("§cEsta recompensa todavía está bloqueada.");
        }
    });
}

// ─── Panel Admin (solo visible con el tag/admin configurado) ──────────────────

function showAdminPanel(player) {
    if (!isAdmin(player)) return;
    const state = getState(player);

    new ActionFormData()
        .title("§c§lAdmin - Recompensas Diarias")
        .body(
            `§7Estado actual: §eDía ${state.streak || 0}§7, último reclamo: §e${state.lastDay === -1 ? "nunca" : new Date(state.lastDay).toUTCString()}\n\n` +
            "§7Estas herramientas solo afectan tu propia cuenta."
        )
        .button("§a▶ Permitir reclamar otra vez hoy", "textures/ui/refresh_light.png")
        .button("§b✎ Forzar racha a un día específico", "textures/ui/icon_setting.png")
        .button("§e↺ Reiniciar racha completa (volver a Día 1)", "textures/ui/icon_trash.png")
        .button("§8Volver", "textures/ui/arrow_left.png")
        .show(player).then(res => {
            if (res.canceled || res.selection === 3) { showDailyRewardsUI(player); return; }

            if (res.selection === 0) {
                state.lastDay = -1; // próximo claim se recalcula como si nunca hubiera reclamado hoy
                saveState(player, state);
                player.sendMessage("§a✓ Ahora puedes volver a reclamar la recompensa de hoy.");
                showAdminPanel(player);
            } else if (res.selection === 1) {
                showForceDayForm(player);
            } else if (res.selection === 2) {
                saveState(player, { lastDay: -1, streak: 0 });
                player.sendMessage("§a✓ Racha reiniciada. El próximo reclamo será el Día 1.");
                showAdminPanel(player);
            }
        });
}

function showForceDayForm(player) {
    new ModalFormData()
        .title("§b§lForzar Día de Racha")
        .slider("§7Día que quieres que sea reclamable a continuación (1-7)", 1, 7, { defaultValue: 1, valueStep: 1 })
        .show(player).then(res => {
            if (res.canceled) { showAdminPanel(player); return; }
            const targetDay = res.formValues[0];
            // Dejamos el estado "un día atrás" del objetivo para que previewNextDay()
            // calcule exactamente targetDay como el próximo reclamo natural.
            const yesterday = getMidnightUTC() - DAY_MS;
            saveState(player, { lastDay: yesterday, streak: targetDay === 1 ? 7 : targetDay - 1 });
            player.sendMessage(`§a✓ El próximo reclamo será el Día ${targetDay}/7.`);
            showAdminPanel(player);
        });
}

console.warn("[DailyRewards] cargado");
