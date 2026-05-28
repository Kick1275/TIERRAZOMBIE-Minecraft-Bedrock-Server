import { world } from "@minecraft/server";
import { registerCustomResolver } from "../Core/PlaceholderResolver.js";

/**
 * Variables DeadZzone + aliases cortos de PlugsEssentials
 *
 * ── DeadZzone ──────────────────────────────────────────
 * $bl      — Sangre actual (0-3500)
 * $blbar   — Barra visual de sangre
 * $blp     — Sangre en % (0-100)
 * $th      — Sed actual (0-20)
 * $thbar   — Barra visual de sed
 * $thp     — Sed en % (0-100)
 * $st      — Energía actual (0-20)
 * $stbar   — Barra visual de energía
 * $stp     — Energía en % (0-100)
 * $inf     — Nivel de infección (0-100)
 * $bled    — Estado de sangrado
 * $bone    — Estado de huesos
 * $sick    — Estado de infección
 *
 * ── Mapa / GameMode ────────────────────────────────────
 * $map     — Nombre del mapa activo
 * $mtime   — Tiempo restante del mapa
 *
 * ── Aliases cortos de PlugsEssentials ──────────────────
 * $n       — Nombre del jugador       (= $player)
 * $m       — Dinero                   (= $money)
 * $g       — Gemas                    (= $gems)
 * $k       — Kills                    (= $kills)
 * $d       — Muertes                  (= $deaths)
 * $kd      — KDR                      (= $kdr)
 * $r       — Rango                    (= $rank)
 * $cl      — Clan                     (= $clan)
 * $lv      — Nivel de trabajo         (= $level)
 * $xp      — XP actual                (= $xp)
 * $pt      — Tiempo de juego          (= $playtime)
 * $on      — Jugadores online         (= $online)
 * $dt      — Fecha                    (= $date)
 */

const BLOOD_MAX  = 3500;
const THIRST_MAX = 20;
const STAM_MAX   = 20;

function getScore(player, obj) {
    try { return world.scoreboard.getObjective(obj)?.getScore(player) ?? 0; }
    catch { return 0; }
}

function bar(val, max, hi, mid) {
    const n = Math.round((val / max) * 10);
    const c = val > hi ? "§a" : val > mid ? "§e" : "§c";
    return c + "█".repeat(n) + "§8" + "█".repeat(10 - n);
}

// ── DeadZzone ──────────────────────────────────────────
registerCustomResolver("bl",    p => getScore(p, "blood"));
registerCustomResolver("blbar", p => bar(getScore(p, "blood"),  BLOOD_MAX,  2000, 1000));
registerCustomResolver("blp",   p => Math.floor((getScore(p, "blood")  / BLOOD_MAX)  * 100));

registerCustomResolver("th",    p => getScore(p, "thirst"));
registerCustomResolver("thbar", p => bar(getScore(p, "thirst"), THIRST_MAX, 12,   6));
registerCustomResolver("thp",   p => Math.floor((getScore(p, "thirst") / THIRST_MAX) * 100));

registerCustomResolver("st",    p => getScore(p, "stamina"));
registerCustomResolver("stbar", p => bar(getScore(p, "stamina"), STAM_MAX,  12,   6));
registerCustomResolver("stp",   p => Math.floor((getScore(p, "stamina") / STAM_MAX)  * 100));

registerCustomResolver("inf",   p => getScore(p, "infection"));
registerCustomResolver("bled",  p => p.hasTag("bleeding1") ? "§cSangrando" : "§aBien");
registerCustomResolver("bone",  p => p.hasTag("broken_bone") ? "§cRoto" : "§aBien");
registerCustomResolver("sick",  p => p.hasTag("infect") ? "§cInfectado" : "§aSano");

// ── Mapa / GameMode ────────────────────────────────────
// Estas se registran desde GameModeSystem.js: $map y $mtime
// Aquí solo los aliases por si acaso
registerCustomResolver("map",   () => {
    try {
        const raw = world.getDynamicProperty("gm:state");
        if (raw !== "active") return "§7Enfriamiento";
        const idx = world.getDynamicProperty("gm:mapIdx") ?? 0;
        const names = ["The Green City","The Down Town","The Air Port","The Desert"];
        return names[idx] ?? "?";
    } catch { return "?"; }
});
registerCustomResolver("mtime", () => {
    try {
        const end = world.getDynamicProperty("gm:endTime") ?? 0;
        const s = Math.max(0, end - Math.floor(Date.now() / 1000));
        return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
    } catch { return "0:00"; }
});

// ── Aliases cortos de PlugsEssentials ──────────────────
// Estos delegan a los resolvers ya registrados en PlaceholderResolver.js
// usando el mismo mecanismo de $key
registerCustomResolver("n",  p => p.name);
registerCustomResolver("on", () => world.getAllPlayers().length);
registerCustomResolver("dt", () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
});

console.warn("[DeadZonePlaceholders] Variables registradas");
