import { world, system } from "@minecraft/server";

console.warn("[AirDrop] Sistema iniciando...");

// ─── PROP KEYS ────────────────────────────────────────────────────────────────

const PROP_MATCH_COUNT    = "airdrop:matchCount";
const PROP_DROP_STATE     = "airdrop:state";
const PROP_DROP_POS       = "airdrop:pos";
const PROP_DROP_UNLOCK_AT = "airdrop:unlockAt";
const PROP_DROP_CLEAR_AT  = "airdrop:clearAt";
const PROP_CONFIG         = "airdrop:config";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
    matchInterval:  3,
    spawnDelayMins: 1,
    lockMins:       5,
    clearMins:      10,
    wpName:         "Air Drop",
    ftLocked:       "§6§l✈ AIR DROP\n§cBloqueado: §e{time}",
    ftUnlocked:     "§a§l✔ AIR DROP\n§7Disponible",
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

const DROP_BLOCK      = "mcpe:supply_block";
const FT_UPDATE_TICKS = 20;

// Posición fija del drop por mapa (coordenada exacta donde aparece el bloque)
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

function getActiveMapId() {
    try {
        const guardias = world.getDimension("minecraft:overworld").getEntities({ type: "tz:guardia_1" });
        for (const g of guardias) {
            for (const id of Object.keys(MAP_DROP_POINTS)) {
                if (g.hasTag(`gm:map_${id}`)) return id;
            }
        }
    } catch {}
    return null;
}

// Caché del tag del guardia para evitar búsquedas repetidas
let lastGuardiaTagState = null;

function setGuardiaAirdropTag(hasAirdrop) {
    // Evitar cambiar el tag si ya está en el estado deseado
    if (lastGuardiaTagState === hasAirdrop) return;
    lastGuardiaTagState = hasAirdrop;

    try {
        const guardias = world.getDimension("minecraft:overworld").getEntities({ type: "tz:guardia_1" });
        for (const g of guardias) {
            if (hasAirdrop) {
                if (!g.hasTag("gm:has_airdrop")) {
                    g.addTag("gm:has_airdrop");
                    console.warn("[AirDrop] ✓ Tag 'gm:has_airdrop' agregada al guardia");
                }
            } else {
                if (g.hasTag("gm:has_airdrop")) {
                    g.removeTag("gm:has_airdrop");
                    console.warn("[AirDrop] ✗ Tag 'gm:has_airdrop' removida del guardia");
                }
            }
        }
    } catch {
        console.warn("[AirDrop] setGuardiaAirdropTag error: " + e);
    }
}


// ─── WAYPOINTS ────────────────────────────────────────────────────────────────

const WP_COLOR_IDX = 5; // rojo
const WP_ICON      = 1; // estrella
const colorRBG = [
    [200,200,200],[128,128,128],[90,90,90],[0,0,0],[70,25,0],
    [255,0,0],[255,165,0],[255,255,0],[0,255,0],[0,128,0],
    [25,90,180],[0,255,255],[0,0,240],[160,0,200],[90,0,140],[240,50,150]
];

function setAirdropWaypoint(player, pos) {
    try {
        const [r, g, b] = colorRBG[WP_COLOR_IDX];
        const red  = r + WP_COLOR_IDX * 1000;
        const dim  = player.dimension.id.replace("minecraft:", "");
        const name = cfg().wpName;
        const key  = `${dim}/1/${WP_ICON}/${red},${g},${b}/${Math.floor(pos.x)},${Math.floor(pos.y + 1)},${Math.floor(pos.z)}/${name}`;
        player.setDynamicProperty(key, true);
    } catch (e) { console.warn("[AirDrop] setWaypoint error: " + e); }
}

function removeAirdropWaypoint(player) {
    try {
        const name  = cfg().wpName;
        const props = player.getDynamicPropertyIds();
        for (const key of props) {
            if (key.endsWith(`/${name}`)) player.setDynamicProperty(key, undefined);
        }
    } catch {}
}

function setWaypointAllPlayers(pos) {
    for (const p of world.getAllPlayers()) { try { setAirdropWaypoint(p, pos); } catch {} }
}

function removeWaypointAllPlayers() {
    for (const p of world.getAllPlayers()) { try { removeAirdropWaypoint(p); } catch {} }
}

world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    const pos   = getDropPos();
    const state = getDropState();
    if (pos && (state === "landed" || state === "open")) {
        system.runTimeout(() => { try { setAirdropWaypoint(ev.player, pos); } catch {} }, 40);
    }
});

// ─── FLOATING TEXT ────────────────────────────────────────────────────────────

let _ftId = null;

function getFTManager() {
    try { if (globalThis.__plugsFloatingTextManager) return globalThis.__plugsFloatingTextManager; } catch {}
    return null;
}

function buildFTText(secsLeft, unlocked) {
    const c = cfg();
    if (unlocked) return c.ftUnlocked;
    return c.ftLocked.replace("{time}", fmtTime(Math.max(0, secsLeft)));
}

function createAirdropFT(pos, text) {
    const manager = getFTManager();
    if (!manager) { console.warn("[AirDrop] FTManager no disponible"); return; }
    try {
        const result = manager.createFloatingText({
            name: "airdrop_countdown",
            location: { x: pos.x + 0.5, y: pos.y + 1, z: pos.z + 0.5 },
            lines: [{ text }],
            createdBy: "AirDrop"
        });
        if (result?.success) { _ftId = result.id; console.warn("[AirDrop] FT creado id=" + _ftId); }
        else console.warn("[AirDrop] FT falló: " + JSON.stringify(result));
    } catch (e) { console.warn("[AirDrop] Error creando FT: " + e); }
}

function updateAirdropFT(text) {
    const manager = getFTManager();
    if (!manager || !_ftId) return;
    try { manager.updateFloatingText(_ftId, { lines: [{ text }] }); } catch {}
}

function deleteAirdropFT() {
    const manager = getFTManager();
    if (manager && _ftId) { try { manager.deleteFloatingText(_ftId); } catch {} }
    _ftId = null;
}

// ─── ANUNCIOS ─────────────────────────────────────────────────────────────────

function announceAirdrop(pos) {
    const coordStr = `${pos.x}, ${pos.z}`;
    const c = cfg();
    console.warn("[AirDrop] Anunciando drop en " + coordStr);
    for (const p of world.getAllPlayers()) {
        try {
            p.sendMessage(c.chatMsg.replace("{coords}", coordStr));
            p.onScreenDisplay.setTitle(c.titleDrop, {
                subtitle: c.subtitleDrop.replace("{coords}", coordStr),
                fadeInDuration: 5, stayDuration: 80, fadeOutDuration: 20
            });
            p.runCommand("playsound note.pling @s ~ ~ ~ 1 1.5");
        } catch (e) { console.warn("[AirDrop] announce error: " + e); }
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
    deleteAirdropFT();
    removeWaypointAllPlayers();
    setDropState("none");
    world.setDynamicProperty(PROP_DROP_POS,       undefined);
    world.setDynamicProperty(PROP_DROP_UNLOCK_AT, undefined);
    world.setDynamicProperty(PROP_DROP_CLEAR_AT,  undefined);
    console.warn("[AirDrop] Drop limpiado");
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

    setWaypointAllPlayers({ x, y, z });
    announceAirdrop({ x, y, z });
    createAirdropFT({ x, y, z }, buildFTText(c.lockMins * 60, false));
    startFTLoop();
}

// ─── FT LOOP ──────────────────────────────────────────────────────────────────

let _ftInterval = null;

function startFTLoop() {
    if (_ftInterval !== null) { system.clearRun(_ftInterval); _ftInterval = null; }

    _ftInterval = system.runInterval(() => {
        try {
            const state = getDropState();
            if (state === "none") { system.clearRun(_ftInterval); _ftInterval = null; return; }

            const now = nowSec();
            if (state === "landed") {
                const secsLeft = getUnlockAt() - now;
                if (secsLeft <= 0) {
                    setDropState("open");
                    world.setDynamicProperty(PROP_DROP_UNLOCK_AT, undefined);
                    updateAirdropFT(buildFTText(0, true));
                    announceAirdropUnlocked();
                } else {
                    updateAirdropFT(buildFTText(secsLeft, false));
                }
            } else if (state === "open") {
                if (getClearAt() - now <= 0) {
                    system.clearRun(_ftInterval); _ftInterval = null;
                    clearDrop();
                }
            }
        } catch (e) { console.warn("[AirDrop] FT loop error: " + e); }
    }, FT_UPDATE_TICKS);
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
    if (!mapId) mapId = getActiveMapId();
    const pt = MAP_DROP_POINTS[mapId];

    if (!pt) {
        console.warn("[AirDrop] No hay mapa activo o sin punto de drop (mapId=" + mapId + ")");
        for (const p of world.getAllPlayers()) {
            if (p.hasTag("admin")) p.sendMessage("§c[AirDrop] No se pudo spawnear: no hay mapa activo.");
        }
        return;
    }

    console.warn(`[AirDrop] Generando drop en ${mapId}: X=${pt.x} Y=${pt.y} Z=${pt.z}`);

    try {
        world.getDimension("minecraft:overworld").runCommand(
            `setblock ${pt.x} ${pt.y} ${pt.z} ${DROP_BLOCK}`
        );
    } catch (e) {
        console.warn("[AirDrop] Error en setblock: " + e);
        return;
    }

    onDropLanded(pt.x, pt.y, pt.z);
}

// ─── EXPORTS PÚBLICOS ─────────────────────────────────────────────────────────

export function getAirdropMatchCount() { return getMatchCount(); }
export function getAirdropDropState()  { return getDropState(); }
export function getAirdropDropPos()    { return getDropPos(); }
export function getAirdropUnlockAt()   { return getUnlockAt(); }
export function getAirdropClearAt()    { return getClearAt(); }

export function forceAirdrop() {
    if (getDropState() !== "none") clearDrop();
    spawnAirdrop();
}

export function resetMatchCount() {
    world.setDynamicProperty(PROP_MATCH_COUNT, 0);
}

export function onMatchStarted() {
    try {
        if (getDropState() !== "none") clearDrop();

        const count = getMatchCount() + 1;
        world.setDynamicProperty(PROP_MATCH_COUNT, count);
        console.warn(`[AirDrop] Partida #${count} iniciada`);

        const c = cfg();
        if (!c.enabled) {
            // Si el sistema está desactivado, quitar la tag del guardia
            setGuardiaAirdropTag(false);
            return;
        }

        if (count % c.matchInterval === 0) {
            // Esta partida TIENE Air Drop → agregar tag al guardia
            setGuardiaAirdropTag(true);
            console.warn(`[AirDrop] ✓ Esta partida #${count} TIENE Air Drop`);
            
            const delaySecs = c.spawnDelayMins * 60;
            // Capturar mapId ahora (el guardia ya tiene el tag en este momento)
            const mapId = getActiveMapId();
            console.warn(`[AirDrop] Drop programado en ${delaySecs}s (partida #${count}, mapa=${mapId})`);
            system.runTimeout(() => {
                try {
                    if (world.getDynamicProperty("gm:state") !== "active") {
                        console.warn("[AirDrop] Partida ya no activa, drop cancelado");
                        return;
                    }
                    spawnAirdrop(mapId);
                } catch (e) { console.warn("[AirDrop] Error en timeout drop: " + e); }
            }, delaySecs * 20);
        } else {
            // Esta partida NO tiene Air Drop → quitar tag del guardia
            setGuardiaAirdropTag(false);
            console.warn(`[AirDrop] Esta partida #${count} NO tiene Air Drop (próximo en ${c.matchInterval - (count % c.matchInterval)} partidas)`);
        }
    } catch (e) { console.warn("[AirDrop] onMatchStarted error: " + e); }
}

export function onMatchEnded() {
    try {
        if (getDropState() !== "none") {
            console.warn("[AirDrop] Limpiando drop al terminar partida");
            clearDrop();
        }
        if (_ftInterval !== null) { system.clearRun(_ftInterval); _ftInterval = null; }
        // Quitar tag del guardia al terminar la partida
        setGuardiaAirdropTag(false);
    } catch (e) { console.warn("[AirDrop] onMatchEnded error: " + e); }
}

// ─── RECUPERACIÓN TRAS REINICIO ───────────────────────────────────────────────

system.runTimeout(() => {
    try {
        const state = getDropState();
        const pos   = getDropPos();
        console.warn(`[AirDrop] Estado al cargar: ${state}, pos: ${JSON.stringify(pos)}`);

        if (state === "landed" || state === "open") {
            if (pos) {
                console.warn("[AirDrop] Retomando FT loop...");
                const secsLeft = getUnlockAt() - nowSec();
                createAirdropFT(pos, buildFTText(secsLeft, state === "open"));
                startFTLoop();
                setWaypointAllPlayers(pos);
            } else {
                clearDrop();
            }
        } else if (state === "falling") {
            // Estado obsoleto (ya no usamos falling), limpiar
            clearDrop();
        }
    } catch (e) { console.warn("[AirDrop] Error en recuperación: " + e); }
}, 120);

console.warn("[AirDrop] Sistema cargado");
