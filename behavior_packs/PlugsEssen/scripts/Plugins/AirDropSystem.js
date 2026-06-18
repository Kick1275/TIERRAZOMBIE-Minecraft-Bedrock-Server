import { world, system } from "@minecraft/server";

console.warn("[AirDrop] Sistema iniciando...");

// ─── PROP KEYS ────────────────────────────────────────────────────────────────

const PROP_MATCH_COUNT    = "airdrop:matchCount";
const PROP_DROP_STATE     = "airdrop:state";
const PROP_DROP_POS       = "airdrop:pos";
const PROP_DROP_UNLOCK_AT = "airdrop:unlockAt";
const PROP_DROP_CLEAR_AT  = "airdrop:clearAt";
const PROP_CONFIG         = "airdrop:config";
const PROP_LAST_CYCLE_SEC = "airdrop:lastCycleSec";
const CYCLE_MINUTES       = 20;

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
    matchInterval:  3,
    spawnDelayMins: 1,
    lockMins:       5,
    clearMins:      10,
    chatMsg:        "§6§l[AIR DROP] §r§eUn suministro ha caído en §f{coords}§e. ¡Ve a buscarlo!",
    chatUnlock:     "§a§l[AIR DROP] §r§aEl suministro ya está disponible. ¡Tienes {mins} minutos!",
    titleDrop:      "§6§l✈ AIR DROP",
    subtitleDrop:   "§eCoordenadas: §f{coords}",
    titleUnlock:    "§a§l✔ AIR DROP ABIERTO",
    subtitleUnlock: "§7El suministro está disponible",
    enabled:        true,
};

export function getAirdropConfig() {
    try {
        const raw = world.getDynamicProperty(PROP_CONFIG);
        if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return { ...DEFAULT_CONFIG };
}

export function setAirdropConfig(c) {
    world.setDynamicProperty(PROP_CONFIG, JSON.stringify(c));
}

function cfg() { return getAirdropConfig(); }

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const DROP_BLOCK = "mcpe:supply_block";

const MAP_DROP_POINTS = {
    green_city: { x: 16,   y: 81, z: 253  },
    downtown:   { x: 777,  y: 95, z: 441  },
    airport:    { x: 1060, y: 95, z: 206  },
    desert:     { x: 1839, y: 55, z: 2231 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const nowSec  = () => Math.floor(Date.now() / 1000);
const fmtTime = s  => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

function getMatchCount() { try { return world.getDynamicProperty(PROP_MATCH_COUNT) ?? 0; } catch { return 0; } }
function getDropState()  { try { return world.getDynamicProperty(PROP_DROP_STATE)  ?? "none"; } catch { return "none"; } }
function getDropPos()    { try { const r = world.getDynamicProperty(PROP_DROP_POS); return r ? JSON.parse(r) : null; } catch { return null; } }
function getUnlockAt()   { try { return world.getDynamicProperty(PROP_DROP_UNLOCK_AT) ?? 0; } catch { return 0; } }
function getClearAt()    { try { return world.getDynamicProperty(PROP_DROP_CLEAR_AT)  ?? 0; } catch { return 0; } }

function setDropState(s) { world.setDynamicProperty(PROP_DROP_STATE, s); }
function setDropPos(pos) { world.setDynamicProperty(PROP_DROP_POS, JSON.stringify(pos)); }

// ─── TIMER DEL DROP ───────────────────────────────────────────────────────────

let _dropTimer = null;

function startDropTimer() {
    if (_dropTimer !== null) { system.clearRun(_dropTimer); _dropTimer = null; }
    _dropTimer = system.runInterval(() => {
        try {
            const state = getDropState();
            if (state === "none") { system.clearRun(_dropTimer); _dropTimer = null; return; }
            const now = nowSec();
            if (state === "landed") {
                if (getUnlockAt() - now <= 0) {
                    setDropState("open");
                    world.setDynamicProperty(PROP_DROP_UNLOCK_AT, undefined);
                    announceAirdropUnlocked();
                }
            } else if (state === "open") {
                if (getClearAt() - now <= 0) {
                    system.clearRun(_dropTimer); _dropTimer = null;
                    clearDrop();
                }
            }
        } catch (e) { console.warn("[AirDrop] timer error: " + e); }
    }, 20);
}

// ─── ANUNCIOS ─────────────────────────────────────────────────────────────────

function announceAirdrop(pos) {
    const coordStr = `${pos.x}, ${pos.z}`;
    const c = cfg();
    for (const p of world.getAllPlayers()) {
        try {
            p.sendMessage(c.chatMsg.replace("{coords}", coordStr));
            p.onScreenDisplay.setTitle(c.titleDrop, {
                subtitle: c.subtitleDrop.replace("{coords}", coordStr),
                fadeInDuration: 5, stayDuration: 80, fadeOutDuration: 20
            });
            p.runCommand("playsound note.pling @s ~ ~ ~ 1 1.5");
        } catch {}
    }
}

function announceAirdropUnlocked() {
    const c = cfg();
    for (const p of world.getAllPlayers()) {
        try {
            p.sendMessage(c.chatUnlock.replace("{mins}", String(c.clearMins)));
            p.onScreenDisplay.setTitle(c.titleUnlock, {
                subtitle: c.subtitleUnlock,
                fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 20
            });
            p.runCommand("playsound note.pling @s ~ ~ ~ 1 2");
        } catch {}
    }
}

// ─── LIMPIAR DROP ─────────────────────────────────────────────────────────────

function clearDrop() {
    const pos = getDropPos();
    if (pos) {
        try {
            world.getDimension("minecraft:overworld").runCommand(
                `fill ${pos.x} ${pos.y} ${pos.z} ${pos.x} ${pos.y} ${pos.z} air`
            );
        } catch {}
    }
    if (_dropTimer !== null) { system.clearRun(_dropTimer); _dropTimer = null; }
    setDropState("none");
    world.setDynamicProperty(PROP_DROP_POS,       undefined);
    world.setDynamicProperty(PROP_DROP_UNLOCK_AT, undefined);
    world.setDynamicProperty(PROP_DROP_CLEAR_AT,  undefined);
}

// ─── CUANDO ATERRIZA ──────────────────────────────────────────────────────────

function onDropLanded(x, y, z) {
    console.warn(`[AirDrop] onDropLanded(${x}, ${y}, ${z})`);
    setDropState("landed");
    setDropPos({ x, y, z });
    const c        = cfg();
    const unlockAt = nowSec() + c.lockMins * 60;
    const clearAt  = unlockAt + c.clearMins * 60;
    world.setDynamicProperty(PROP_DROP_UNLOCK_AT, unlockAt);
    world.setDynamicProperty(PROP_DROP_CLEAR_AT,  clearAt);
    announceAirdrop({ x, y, z });
    startDropTimer();
}

// ─── BLOQUEAR INTERACCIÓN ─────────────────────────────────────────────────────

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    try {
        if (ev.block.typeId !== DROP_BLOCK) return;
        if (getDropState() !== "landed") return;
        ev.cancel = true;
        system.run(() => {
            try {
                const secsLeft = getUnlockAt() - nowSec();
                ev.player.sendMessage("§c⚠ El Air Drop está bloqueado. Espera la cuenta regresiva.");
                if (secsLeft > 0) ev.player.sendMessage(`§7Disponible en: §e${fmtTime(secsLeft)}`);
            } catch {}
        });
    } catch {}
});

// ─── SPAWN ────────────────────────────────────────────────────────────────────

function spawnAirdrop(mapId) {
    const mapIds = Object.keys(MAP_DROP_POINTS);
    if (!mapId || !MAP_DROP_POINTS[mapId]) {
        mapId = mapIds[Math.floor(Math.random() * mapIds.length)];
    }
    const pt = MAP_DROP_POINTS[mapId];
    if (!pt) {
        console.warn("[AirDrop] Sin punto de drop para mapId=" + mapId);
        for (const p of world.getAllPlayers()) {
            if (p.hasTag("admin")) p.sendMessage("§c[AirDrop] No se pudo spawnear: sin mapa.");
        }
        return;
    }
    console.warn(`[AirDrop] Generando drop en ${mapId}: X=${pt.x} Y=${pt.y} Z=${pt.z}`);
    try {
        world.getDimension("minecraft:overworld").runCommand(
            `setblock ${pt.x} ${pt.y} ${pt.z} ${DROP_BLOCK}`
        );
    } catch (e) { console.warn("[AirDrop] Error en setblock: " + e); return; }
    onDropLanded(pt.x, pt.y, pt.z);
}

// ─── SCHEDULER AUTÓNOMO ───────────────────────────────────────────────────────

function tickDropSchedule() {
    const c = cfg();
    if (!c.enabled) return;
    const now = nowSec();
    let last = world.getDynamicProperty(PROP_LAST_CYCLE_SEC);
    if (typeof last !== "number") { world.setDynamicProperty(PROP_LAST_CYCLE_SEC, now); return; }
    const cycleSecs = c.matchInterval * CYCLE_MINUTES * 60;
    if (now - last < cycleSecs) return;
    world.setDynamicProperty(PROP_LAST_CYCLE_SEC, now);
    if (getDropState() !== "none") clearDrop();
    world.setDynamicProperty(PROP_MATCH_COUNT, getMatchCount() + 1);
    system.runTimeout(() => {
        try { spawnAirdrop(); } catch (e) { console.warn("[AirDrop] spawn error: " + e); }
    }, c.spawnDelayMins * 60 * 20);
}

// ─── EXPORTS PÚBLICOS ─────────────────────────────────────────────────────────

export function getAirdropMatchCount() { return getMatchCount(); }
export function getAirdropDropState()  { return getDropState(); }
export function getAirdropDropPos()    { return getDropPos(); }
export function getAirdropUnlockAt()   { return getUnlockAt(); }
export function getAirdropClearAt()    { return getClearAt(); }
export function forceAirdrop()         { if (getDropState() !== "none") clearDrop(); spawnAirdrop(); }
export function resetMatchCount()      { world.setDynamicProperty(PROP_MATCH_COUNT, 0); world.setDynamicProperty(PROP_LAST_CYCLE_SEC, undefined); }
export function clearActiveDrop()      { clearDrop(); }
export function onMatchStarted()       { tickDropSchedule(); }
export function onMatchEnded()         {}

// ─── RECUPERACIÓN TRAS REINICIO ───────────────────────────────────────────────

system.runTimeout(() => {
    try {
        const state = getDropState();
        const pos   = getDropPos();
        console.warn(`[AirDrop] Estado al cargar: ${state}`);
        if (state === "landed" || state === "open") {
            if (pos) { startDropTimer(); }
            else { clearDrop(); }
        } else if (state === "falling") {
            clearDrop();
        }
    } catch (e) { console.warn("[AirDrop] Error en recuperación: " + e); }
}, 120);

system.runInterval(() => {
    try { tickDropSchedule(); } catch (e) { console.warn("[AirDrop] schedule error: " + e); }
}, 1200);

console.warn("[AirDrop] Sistema cargado");
