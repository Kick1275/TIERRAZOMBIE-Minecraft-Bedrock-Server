/**
 * PlayerDataEvents - Event bus para cambios de datos del jugador.
 * Los plugins se suscriben aquí en lugar de leer datos directamente.
 *
 * Uso:
 *   import { onDataChange, DataEvents } from "../Core/index.js";
 *   onDataChange(DataEvents.KILLS, (name, newVal, oldVal) => { ... });
 */

const _listeners = new Map();

/**
 * Suscribirse a un evento de dato.
 * @param {string} event
 * @param {Function} callback - fn(playerName, newValue, oldValue)
 * @returns {Function} unsuscribe fn
 */
export function onDataChange(event, callback) {
    if (!_listeners.has(event)) _listeners.set(event, []);
    _listeners.get(event).push(callback);
    return () => {
        const arr = _listeners.get(event);
        if (arr) {
            const i = arr.indexOf(callback);
            if (i !== -1) arr.splice(i, 1);
        }
    };
}

/** @internal */
export function emitDataChange(event, playerName, newValue, oldValue) {
    const arr = _listeners.get(event);
    if (!arr) return;
    for (const cb of arr) {
        try { cb(playerName, newValue, oldValue); } catch (_) {}
    }
}

export const DataEvents = {
    KILLS:      "kills",
    DEATHS:     "deaths",
    KDR:        "kdr",
    MONEY:      "money",
    GEMS:       "gems",
    PLAYTIME:   "playtime",
    RANK:       "rank",
    CLAN:       "clan",
    JOB:        "job",
    CUSTOM:     "custom",
    ONLINE:     "online",
    OFFLINE:    "offline",
    FIRST_JOIN: "first_join",
};
