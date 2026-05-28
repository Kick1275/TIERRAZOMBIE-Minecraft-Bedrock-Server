/**
 * PlayerDataManager - Fuente centralizada de datos del jugador.
 *
 * TODOS los plugins deben leer/escribir datos del jugador a través de este manager.
 * Elimina la necesidad de que cada plugin lea scoreboards o dynamic properties por su cuenta.
 *
 * Datos que maneja:
 *   kills, deaths, kdr, money, gems, playtime (min), firstJoin, lastSeen,
 *   rank, clan, clanRole, jobs { level, xp }, custom (campos libres por plugin)
 *
 * Uso básico:
 *   import { PlayerDataManager } from "../Core/index.js";
 *
 *   PlayerDataManager.get("Steve")              // perfil completo
 *   PlayerDataManager.getField("Steve","money") // campo específico
 *   PlayerDataManager.set("Steve","money",500)  // escribir
 *   PlayerDataManager.increment("Steve","kills")// +1
 */

import { world, system } from "@minecraft/server";
import { emitDataChange, DataEvents } from "./PlayerDataEvents.js";

// ── Almacenamiento ────────────────────────────────────────────────────────────
// Una propiedad dinámica por jugador para evitar el límite de 32 767 chars.
const PROFILE_PREFIX = "pdm:p:";   // pdm:p:<playerName>
const INDEX_KEY      = "pdm:idx";  // lista de nombres conocidos (JSON array)
const SESSION_PREFIX = "pdm:session:";

// ── Scoreboards sincronizados automáticamente ─────────────────────────────────
// Estos campos viven en scoreboards de Bedrock (persisten solos).
// El perfil en memoria los refleja, pero NO se persisten en dynamic properties.
const SCOREBOARD_SYNC = {
    kills:  "kills",
    deaths: "deaths",
    money:  "money",
    gems:   "gems",
};
const SCOREBOARD_FIELDS = new Set(Object.keys(SCOREBOARD_SYNC));

function _defaultProfile(name) {
    return {
        playerName: name,
        kills:      0,
        deaths:     0,
        kdr:        0,
        money:      0,
        gems:       0,
        playtime:   0,   // minutos
        firstJoin:  Date.now(),
        lastSeen:   Date.now(),
        rank:       "default",
        clan:       null,
        clanRole:   null,
        jobs:       {},  // { jobName: { level, xp } }
        custom:     {},  // campos libres para plugins
    };
}

class _PlayerDataManager {
    constructor() {
        /** @type {Map<string, object>} */
        this._profiles  = new Map();
        this._dirty     = new Set();
        this._saveTimer = null;
        this._playtimeTimer = null;
        this._initialized = false;
    }

    // ── Init ──────────────────────────────────────────────────────────────────

    initialize() {
        if (this._initialized) return;
        this._initialized = true;
        this._load();
        this._ensureScoreboards();
        this._hookEvents();
        this._startAutoSave();
        this._startPlaytime();
    }

    /** Crea los scoreboards si no existen. */
    _ensureScoreboards() {
        for (const [field, objName] of Object.entries(SCOREBOARD_SYNC)) {
            try {
                if (!world.scoreboard.getObjective(objName)) {
                    world.scoreboard.addObjective(objName, objName);
                    console.warn(`[PDM] Scoreboard creado: ${objName}`);
                }
            } catch (e) {
                console.warn(`[PDM] Error creando scoreboard ${objName}: ${e}`);
            }
        }
    }

    // ── Persistencia ──────────────────────────────────────────────────────────

    _load() {
        try {
            const idxRaw = world.getDynamicProperty(INDEX_KEY);
            if (!idxRaw) return;
            const names = JSON.parse(idxRaw);
            for (const name of names) {
                try {
                    const raw = world.getDynamicProperty(PROFILE_PREFIX + name);
                    // Los campos de scoreboard (kills/deaths/money/gems) no están
                    // en la dynamic property — se cargan desde el scoreboard al entrar.
                    const base = raw ? JSON.parse(raw) : {};
                    this._profiles.set(name, { ..._defaultProfile(name), ...base });
                } catch (_) {}
            }
        } catch (_) {}
    }

    _save() {
        if (this._dirty.size === 0) return;
        try {
            const allNames = Array.from(this._profiles.keys());
            world.setDynamicProperty(INDEX_KEY, JSON.stringify(allNames));
        } catch (_) {}
        for (const name of this._dirty) {
            try {
                const p = this._profiles.get(name);
                if (p) world.setDynamicProperty(PROFILE_PREFIX + name, JSON.stringify(this._serializeProfile(p)));
            } catch (_) {}
        }
        this._dirty.clear();
    }

    _saveOne(name) {
        try {
            const p = this._profiles.get(name);
            if (p) world.setDynamicProperty(PROFILE_PREFIX + name, JSON.stringify(this._serializeProfile(p)));
        } catch (_) {}
    }

    /** Excluye campos que viven en scoreboards — no hace falta duplicarlos. */
    _serializeProfile(p) {
        const out = {};
        for (const [k, v] of Object.entries(p)) {
            if (!SCOREBOARD_FIELDS.has(k)) out[k] = v;
        }
        return out;
    }

    _startAutoSave() {
        // Guarda cada 30 s si hay cambios pendientes
        this._saveTimer = system.runInterval(() => this._save(), 600);
    }

    _startPlaytime() {
        // +1 minuto de playtime por cada minuto online
        this._playtimeTimer = system.runInterval(() => {
            try {
                for (const p of world.getAllPlayers()) {
                    this.increment(p.name, "playtime", 1);
                }
            } catch (_) {}
        }, 1200);
    }

    // ── Eventos del mundo ─────────────────────────────────────────────────────

    _hookEvents() {
        // Jugador entra
        world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
            try {
                if (!this._profiles.has(player.name)) {
                    const p = _defaultProfile(player.name);
                    this._profiles.set(player.name, p);
                    this._dirty.add(player.name);
                    // Actualizar índice inmediatamente para el nuevo jugador
                    try {
                        const allNames = Array.from(this._profiles.keys());
                        world.setDynamicProperty(INDEX_KEY, JSON.stringify(allNames));
                    } catch (_) {}
                    emitDataChange(DataEvents.FIRST_JOIN, player.name, p.firstJoin, null);
                }
                world.setDynamicProperty(SESSION_PREFIX + player.name, String(Date.now()));
                emitDataChange(DataEvents.ONLINE, player.name, true, false);

                // Sincronizar scoreboards → perfil al entrar (siempre, no solo initialSpawn)
                this._pullFromScoreboards(player);

                // Sincronizar jobs desde la dynamic property del jugador → PDM
                this._pullJobsFromPlayer(player);
            } catch (_) {}
        });

        // Jugador sale
        world.afterEvents.playerLeave.subscribe(({ playerName }) => {
            try {
                const p = this._profiles.get(playerName);
                if (p) { p.lastSeen = Date.now(); this._dirty.add(playerName); }
                world.setDynamicProperty(SESSION_PREFIX + playerName, undefined);
                emitDataChange(DataEvents.OFFLINE, playerName, false, true);
                this._saveOne(playerName); // guardar solo este jugador al salir
            } catch (_) {}
        });

        // Kills y deaths (PvP) — usar comandos de scoreboard directamente
        system.runTimeout(() => {
            try {
                world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
                    try {
                        if (deadEntity?.typeId !== "minecraft:player") return;
                        const killer = damageSource?.damagingEntity;

                        // Sumar muerte al que murió via comando de scoreboard
                        try {
                            deadEntity.dimension.runCommand(
                                `scoreboard players add "${deadEntity.name}" deaths 1`
                            );
                        } catch (_) {}

                        // Sumar kill al killer via comando de scoreboard
                        if (killer?.typeId === "minecraft:player" && killer.name !== deadEntity.name) {
                            try {
                                killer.dimension.runCommand(
                                    `scoreboard players add "${killer.name}" kills 1`
                                );
                            } catch (_) {}
                        }

                        // Emitir eventos para que otros sistemas (nametag, sidebar) se actualicen
                        emitDataChange("deaths", deadEntity.name, null, null);
                        if (killer?.typeId === "minecraft:player" && killer.name !== deadEntity.name) {
                            emitDataChange("kills", killer.name, null, null);
                        }
                    } catch (_) {}
                });
            } catch (_) {}
        }, 40);
    }

    // ── Sync jobs desde dynamic property del jugador ──────────────────────────

    /** Lee jobs:data del jugador y los sincroniza al perfil PDM. */
    _pullJobsFromPlayer(player) {
        system.runTimeout(() => {
            try {
                const raw = player.getDynamicProperty("jobs:data");
                if (!raw) return;
                const jobsData = JSON.parse(raw);
                const p = this._profiles.get(player.name);
                if (!p) return;
                if (!p.jobs) p.jobs = {};
                // Sincronizar cada trabajo
                for (const [jobName, data] of Object.entries(jobsData.jobs ?? {})) {
                    p.jobs[jobName] = { level: data.level ?? 1, xp: data.experience ?? 0 };
                }
                this._dirty.add(player.name);
            } catch (_) {}
        }, 40);
    }

    // ── Sync scoreboards ──────────────────────────────────────────────────────

    _pullFromScoreboards(player) {
        // Pequeño delay para asegurar que el jugador esté registrado en los scoreboards
        system.runTimeout(() => {
            for (const [field, objName] of Object.entries(SCOREBOARD_SYNC)) {
                try {
                    const obj = world.scoreboard.getObjective(objName);
                    if (!obj) continue;
                    // Usar getScore con el nombre del participante es más fiable
                    let score = null;
                    try { score = obj.getScore(player); } catch (_) {}
                    if (score == null) {
                        // Fallback: buscar por nombre en los participantes
                        try {
                            const participants = obj.getParticipants();
                            const entry = participants.find(p => p.displayName === player.name);
                            if (entry != null) score = obj.getScore(entry);
                        } catch (_) {}
                    }
                    if (score != null) {
                        const p = this._profiles.get(player.name);
                        if (p) p[field] = score;
                    }
                } catch (_) {}
            }
        }, 20); // 1 segundo de delay
    }

    _pushToScoreboard(playerName, field, value) {
        const objName = SCOREBOARD_SYNC[field];
        if (!objName) return;
        try {
            const obj = world.scoreboard.getObjective(objName);
            if (!obj) return;
            const player = world.getAllPlayers().find(p => p.name === playerName);
            if (player) obj.setScore(player, value);
        } catch (_) {}
    }

    // ── Lectura directa de scoreboard ─────────────────────────────────────────

    /** Lee un campo de scoreboard en tiempo real para un jugador online. */
    _getScoreboardValue(playerName, field) {
        const objName = SCOREBOARD_SYNC[field];
        if (!objName) return null;
        try {
            const obj = world.scoreboard.getObjective(objName);
            if (!obj) return null;
            const player = world.getAllPlayers().find(p => p.name === playerName);
            if (player) {
                try { return obj.getScore(player) ?? null; } catch (_) {}
            }
            // Jugador offline: buscar por nombre entre participantes
            const entry = obj.getParticipants().find(p => p.displayName === playerName);
            return entry != null ? (obj.getScore(entry) ?? null) : null;
        } catch (_) { return null; }
    }

    // ── API pública ───────────────────────────────────────────────────────────

    /**
     * Obtiene un campo del perfil.
     * Para kills/deaths/money/gems lee directo del scoreboard en tiempo real.
     * @param {string} name
     * @param {string} field
     * @param {*} fallback
     */
    getField(name, field, fallback = 0) {
        if (SCOREBOARD_FIELDS.has(field)) {
            const score = this._getScoreboardValue(name, field);
            return score ?? fallback;
        }
        return this._profiles.get(name)?.[field] ?? fallback;
    }

    /**
     * Perfil completo del jugador.
     * Los campos de scoreboard se leen en tiempo real.
     * @param {string} name
     * @returns {object|null}
     */
    get(name) {
        const p = this._profiles.get(name);
        if (!p) return null;
        // Mezclar con valores live de scoreboard
        const live = { ...p };
        for (const field of SCOREBOARD_FIELDS) {
            const score = this._getScoreboardValue(name, field);
            if (score != null) live[field] = score;
        }
        return live;
    }

    /**
     * Escribe un campo del perfil.
     * Para kills/deaths/money/gems escribe directo al scoreboard.
     * @param {string} name
     * @param {string} field
     * @param {*} value
     */
    set(name, field, value) {
        if (SCOREBOARD_FIELDS.has(field)) {
            // Escribir directo al scoreboard — es la fuente de verdad
            this._pushToScoreboard(name, field, value);
            // KDR automático usando valores live
            if (field === "kills" || field === "deaths") {
                const kills  = field === "kills"  ? value : (this._getScoreboardValue(name, "kills")  ?? 0);
                const deaths = field === "deaths" ? value : (this._getScoreboardValue(name, "deaths") ?? 0);
                const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
                const p = this._profiles.get(name);
                if (p) p.kdr = kdr;
                emitDataChange(DataEvents.KDR, name, kdr, null);
            }
            emitDataChange(field, name, value, null);
            return;
        }

        let p = this._profiles.get(name);
        if (!p) { p = _defaultProfile(name); this._profiles.set(name, p); }
        const old = p[field];
        p[field] = value;
        this._dirty.add(name);
        emitDataChange(field, name, value, old);
    }

    /**
     * Incrementa un campo numérico.
     * Para kills/deaths/money/gems lee el valor actual del scoreboard.
     * @param {string} name
     * @param {string} field
     * @param {number} amount
     */
    increment(name, field, amount = 1) {
        const current = this.getField(name, field, 0);
        this.set(name, field, current + amount);
    }

    /**
     * Lee/escribe un campo personalizado (para plugins externos).
     * @param {string} name
     * @param {string} key
     * @param {*} [value] - omitir para leer
     */
    custom(name, key, value) {
        const p = this._profiles.get(name);
        if (!p) return undefined;
        if (!p.custom) p.custom = {};
        if (value === undefined) return p.custom[key];
        const old = p.custom[key];
        p.custom[key] = value;
        this._dirty.add(name);
        emitDataChange(DataEvents.CUSTOM, name, { key, value }, { key, value: old });
    }

    /**
     * Actualiza datos de un job.
     * @param {string} name
     * @param {string} jobName
     * @param {{ level?: number, xp?: number }} data
     */
    setJob(name, jobName, data) {
        const p = this._profiles.get(name);
        if (!p) return;
        if (!p.jobs) p.jobs = {};
        p.jobs[jobName] = { ...(p.jobs[jobName] ?? { level: 1, xp: 0 }), ...data };
        this._dirty.add(name);
        emitDataChange(DataEvents.JOB, name, { jobName, ...data }, null);
    }

    /**
     * Datos de un job específico.
     * @param {string} name
     * @param {string} jobName
     */
    getJob(name, jobName) {
        return this._profiles.get(name)?.jobs?.[jobName] ?? { level: 1, xp: 0 };
    }

    /** Todos los nombres de jugadores registrados. */
    getAllPlayerNames() { return Array.from(this._profiles.keys()); }

    /** Todos los perfiles. */
    getAllProfiles() { return Array.from(this._profiles.values()); }

    /** Jugadores actualmente conectados. */
    getOnlinePlayers() { return world.getAllPlayers().map(p => p.name); }

    /** Cantidad de jugadores conectados. */
    getOnlineCount() { return world.getAllPlayers().length; }

    /** KDR calculado en tiempo real desde scoreboards. */
    getKDR(name) {
        const kills  = this._getScoreboardValue(name, "kills")  ?? 0;
        const deaths = this._getScoreboardValue(name, "deaths") ?? 0;
        return deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
    }

    /** Playtime formateado "Xh Ym". */
    getPlaytimeFormatted(name) {
        const min = this.getField(name, "playtime", 0);
        const h = Math.floor(min / 60), m = min % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    /** Fecha de primer ingreso formateada. */
    getFirstJoinFormatted(name) {
        const ts = this.getField(name, "firstJoin", Date.now());
        return new Date(ts).toLocaleDateString("es-ES");
    }

    cleanup() {
        this._save();
        if (this._saveTimer)     system.clearRun(this._saveTimer);
        if (this._playtimeTimer) system.clearRun(this._playtimeTimer);
    }
}

export const PlayerDataManager = new _PlayerDataManager();
