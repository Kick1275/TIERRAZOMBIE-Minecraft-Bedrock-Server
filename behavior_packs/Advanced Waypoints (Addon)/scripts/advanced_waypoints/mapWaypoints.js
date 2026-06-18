import { world, system } from "@minecraft/server";
import { apiWaypointEntity } from "./lib/apiwaypoint/entity";
import { apiWaypointInfo } from "./lib/apiwaypoint/info";

// Waypoints exclusivos del evento La Petro
const PETRO_WAYPOINTS = [
    { name: "Extracción A", pos: { x: -1801, y: 113, z: 2031 }, color: 7, icon: 2 },
    { name: "Extracción B", pos: { x: -1740, y: 63,  z: 2053 }, color: 7, icon: 3 },
    { name: "Air Drop",     pos: { x: -1842, y: 112, z: 2054 }, color: 5, icon: 0 },
];
const PETRO_WP_NAMES = PETRO_WAYPOINTS.map(w => w.name);
const GUARDIA_TYPE   = "tz:guardia_1";

const colorARR = [
    [200,200,200],[128,128,128],[90,90,90],[0,0,0],[70,25,0],
    [255,0,0],[255,165,0],[255,255,0],[0,255,0],[0,128,0],
    [25,90,180],[0,255,255],[0,0,240],[160,0,200],[90,0,140],[240,50,150]
];

// ─── Waypoint helpers ─────────────────────────────────────────────────────────

function setWaypoint(player, wp) {
    // Limpiar primero para evitar duplicados
    try { apiWaypointEntity.remove(player, wp.name); } catch {}
    try { apiWaypointInfo.remove(player, wp.name);   } catch {}

    const rgb   = colorARR[wp.color] ?? [255, 255, 255];
    const red   = rgb[0] + wp.color * 1000;
    const dim   = player.dimension.id.replace("minecraft:", "");
    const key   = `${dim}/1/${wp.icon}/${red},${rgb[1]},${rgb[2]}/${Math.floor(wp.pos.x)},${Math.floor(wp.pos.y)},${Math.floor(wp.pos.z)}/${wp.name}`;
    try { player.setDynamicProperty(key, true); } catch {}
}

function clearWaypoints(player) {
    for (const name of PETRO_WP_NAMES) {
        try { apiWaypointEntity.remove(player, name); } catch {}
        try { apiWaypointInfo.remove(player, name);   } catch {}
    }
}

function applyPetroWaypoints(player) {
    for (const wp of PETRO_WAYPOINTS) setWaypoint(player, wp);
    // Esperar a que los dynamic properties se asienten antes de spawnear entidades
    system.runTimeout(() => {
        try { apiWaypointEntity.recoverWaypoints(player); } catch {}
    }, 10);
}

// ─── Estado del evento ────────────────────────────────────────────────────────

let petroActive = false;   // estado conocido internamente
let loopId      = null;    // id del interval activo (solo mientras evento activo)

function isPetroActive() {
    try {
        const g = world.getDimension("minecraft:overworld")
            .getEntities({ type: GUARDIA_TYPE })[0];
        return g?.hasTag("gm:map_la_petro") ?? false;
    } catch {}
    return false;
}

// ─── Activar / desactivar ─────────────────────────────────────────────────────

function onPetroStart() {
    if (petroActive) return;
    petroActive = true;

    // Aplicar waypoints a todos los jugadores conectados
    for (const p of world.getAllPlayers()) applyPetroWaypoints(p);

    // Loop liviano: solo para jugadores que se unan durante el evento
    // Se corre cada 200 ticks (10s) y solo verifica jugadores nuevos
    if (loopId !== null) { system.clearRun(loopId); loopId = null; }
    loopId = system.runInterval(() => {
        for (const p of world.getAllPlayers()) {
            // Si ya tiene el waypoint, skip
            const has = p.getDynamicPropertyIds()
                .some(k => k.endsWith("/Extracción A"));
            if (!has) applyPetroWaypoints(p);
        }
    }, 200);
}

function onPetroEnd() {
    if (!petroActive) return;
    petroActive = false;

    // Detener el loop inmediatamente
    if (loopId !== null) { system.clearRun(loopId); loopId = null; }

    // Limpiar waypoints de todos los jugadores
    for (const p of world.getAllPlayers()) clearWaypoints(p);
}

// ─── Detector de cambio de estado (poll ligero cada 60 ticks = 3s) ────────────
// Solo corre para detectar inicio/fin del evento.
// Cuando el evento está activo, el loop interno ya cubre nuevos jugadores.

let pollActive = true; // siempre corre, pero es muy barato

system.runInterval(() => {
    if (!pollActive) return;
    const active = isPetroActive();
    if (active && !petroActive)  onPetroStart();
    if (!active && petroActive)  onPetroEnd();
}, 60);

// Jugadores que entran/salen mientras el evento está activo
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!petroActive) return;
    system.runTimeout(() => {
        try { applyPetroWaypoints(ev.player); } catch {}
    }, 60);
});

// ─── Limpieza al arrancar ──────────────────────────────────────────────────────
// Borra waypoints huérfanos de sesiones anteriores y luego aplica el estado real

system.runTimeout(() => {
    try {
        for (const p of world.getAllPlayers()) {
            // Limpiar waypoints de Petro anteriores
            clearWaypoints(p);
            // Limpiar cualquier otro waypoint de mapa que no sea del jugador
            const props = p.getDynamicPropertyIds();
            for (const prop of props) {
                if (prop.includes("/") &&
                    !prop.startsWith("aw:") && !prop.startsWith("dm:") &&
                    !prop.startsWith("gm:") && !prop.startsWith("col:") &&
                    !prop.startsWith("playerSettings")) {
                    try { p.setDynamicProperty(prop, undefined); } catch {}
                }
            }
        }
    } catch {}

    // Aplicar estado actual
    if (isPetroActive()) onPetroStart();
}, 100);

console.warn("[MapWaypoints] Sistema Petro cargado");
