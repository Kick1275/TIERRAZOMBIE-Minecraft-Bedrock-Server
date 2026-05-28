/**
 * PlaceholderResolver — Sistema centralizado de placeholders con prefijo "$".
 *
 * Uso:
 *   import { resolvePlaceholders } from "../Core/PlaceholderResolver.js";
 *   const msg = resolvePlaceholders("Hola $player, tienes $money monedas", player);
 *
 * Placeholders disponibles:
 *   $player   — nombre del jugador
 *   $money    — dinero
 *   $gems     — gemas
 *   $kills    — kills
 *   $deaths   — muertes
 *   $kdr      — ratio kill/death
 *   $rank     — rango (tag de display)
 *   $clan     — clan
 *   $level    — nivel del trabajo activo
 *   $xp       — XP actual del trabajo activo
 *   $xpmax    — XP requerida para el siguiente nivel
 *   $job      — nombre del trabajo activo
 *   $playtime — tiempo de juego formateado
 *   $online   — jugadores conectados
 *   $servername — nombre del servidor
 *   $date     — fecha actual (DD/MM/YYYY)
 *   $x $y $z  — posición del jugador
 */

import { world } from "@minecraft/server";
import { PlayerDataManager } from "./index.js";

// Resolvers lazy para evitar imports circulares
let _getRankFn = null;
let _getJobDataFn = null;
let _getJobConfigFn = null;
let _calcXPFn = null;
let _getServerNameFn = null;

/** Registra función para obtener el nombre del servidor (desde GlobalConfig) */
export function registerServerNameResolver(fn) { _getServerNameFn = fn; }

/** Registra la función de rango (llamada desde Ranks.js al iniciar) */
export function registerRankResolver(fn) { _getRankFn = fn; }

/** Registra las funciones de jobs (llamada desde Jobs.js al iniciar) */
export function registerJobResolver(getDataFn, getConfigFn, calcXPFn) {
    _getJobDataFn = getDataFn;
    _getJobConfigFn = getConfigFn;
    _calcXPFn = calcXPFn;
}

// Mapa de resolvers personalizados: key -> fn(player) => string
const _customResolvers = new Map();

/**
 * Registra un placeholder personalizado con prefijo $.
 * @param {string} key - nombre del placeholder (sin $)
 * @param {function} fn - función que recibe (player) y retorna string
 */
export function registerCustomResolver(key, fn) {
    _customResolvers.set(key.toLowerCase(), fn);
}

/**
 * Resuelve todos los placeholders $xxx en un string.
 * @param {string} text
 * @param {import("@minecraft/server").Player} player
 * @returns {string}
 */
export function resolvePlaceholders(text, player) {
    if (!text || !player) return text ?? "";

    const name = player.name;

    // Cache de valores para no recalcular si hay múltiples placeholders del mismo tipo
    const cache = {};

    const get = (key) => {
        if (key in cache) return cache[key];
        let val;
        switch (key) {
            case "player":   val = name; break;
            case "money":    val = PlayerDataManager.getField(name, "money", 0); break;
            case "gems":     val = PlayerDataManager.getField(name, "gems", 0); break;
            case "kills":    val = PlayerDataManager.getField(name, "kills", 0); break;
            case "deaths":   val = PlayerDataManager.getField(name, "deaths", 0); break;
            case "kdr":      val = PlayerDataManager.getKDR(name); break;
            case "playtime": val = PlayerDataManager.getPlaytimeFormatted(name); break;
            case "online":   val = world.getAllPlayers().length; break;
            case "rank":     val = _getRankFn ? _getRankFn(name) : ""; break;
            // Aliases cortos
            case "m":        val = PlayerDataManager.getField(name, "money", 0); break;
            case "g":        val = PlayerDataManager.getField(name, "gems", 0); break;
            case "k":        val = PlayerDataManager.getField(name, "kills", 0); break;
            case "d":        val = PlayerDataManager.getField(name, "deaths", 0); break;
            case "kd":       val = PlayerDataManager.getKDR(name); break;
            case "r":        val = _getRankFn ? _getRankFn(name) : ""; break;
            case "pt":       val = PlayerDataManager.getPlaytimeFormatted(name); break;
            case "lv": {
                const jobInfo = _resolveJobData(player);
                val = jobInfo.level;
                break;
            }
            case "servername": val = _getServerNameFn ? _getServerNameFn() : "Servidor"; break;
            case "date": {
                const d = new Date();
                val = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
                break;
            }
            case "clan": {
                const p = PlayerDataManager.get(name);
                val = p?.clan ?? "Sin Clan";
                break;
            }
            case "x": val = Math.floor(player.location?.x ?? 0); break;
            case "y": val = Math.floor(player.location?.y ?? 0); break;
            case "z": val = Math.floor(player.location?.z ?? 0); break;
            case "job":
            case "level":
            case "xp":
            case "xpmax": {
                const jobInfo = _resolveJobData(player);
                cache["job"]   = jobInfo.job;
                cache["level"] = jobInfo.level;
                cache["xp"]    = jobInfo.xp;
                cache["xpmax"] = jobInfo.xpmax;
                val = cache[key];
                break;
            }
            default:
                if (_customResolvers.has(key)) {
                    try { val = _customResolvers.get(key)(player); } catch { val = `$${key}`; }
                } else {
                    val = `$${key}`; // desconocido — dejar sin cambios
                }
        }
        cache[key] = val;
        return val;
    };

    // Reemplaza $placeholder (solo letras/números, case-insensitive)
    return text.replace(/\$([a-zA-Z]+)/g, (match, key) => {
        const resolved = get(key.toLowerCase());
        return resolved !== undefined && resolved !== null ? String(resolved) : match;
    });
}

function _resolveJobData(player) {
    try {
        if (_getJobDataFn && _getJobConfigFn && _calcXPFn) {
            const data = _getJobDataFn(player);
            const jobName = data?.activeJob;
            if (jobName && data.jobs?.[jobName]) {
                const j = data.jobs[jobName];
                const cfg = _getJobConfigFn(jobName);
                return {
                    job:   jobName,
                    level: j.level ?? 1,
                    xp:    j.experience ?? 0,
                    xpmax: cfg ? _calcXPFn(j.level, cfg) : 100,
                };
            }
        }
    } catch (_) {}
    return { job: "Ninguno", level: 1, xp: 0, xpmax: 100 };
}
