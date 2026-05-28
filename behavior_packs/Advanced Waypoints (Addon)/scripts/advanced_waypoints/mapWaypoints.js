import { world, system } from "@minecraft/server";
import { apiWaypointEntity } from "./lib/apiwaypoint/entity";
import { apiWaypointCreate } from "./lib/apiwaypoint/create";
import { apiWaypointInfo } from "./lib/apiwaypoint/info";
import { colorRBG } from "./lib/variables";

// Waypoints de extracción por mapa + Air Drop
const MAP_WAYPOINTS = {
    green_city: [
        { name: "Extraction A", pos: { x: 87,   y: 65,  z: 240  }, color: 7, icon: 2 },
        { name: "Extraction B", pos: { x: 247,  y: 91,  z: 322  }, color: 7, icon: 3 },
        { name: "Extraction C", pos: { x: -24,  y: 118, z: 85   }, color: 7, icon: 4 },
        { name: "Air Drop",     pos: { x: 16,   y: 82,  z: 253  }, color: 5, icon: 0 },
    ],
    downtown: [
        { name: "Extraction A", pos: { x: 630,  y: 82,  z: 760  }, color: 7, icon: 2 },
        { name: "Extraction B", pos: { x: 462,  y: 166, z: 374  }, color: 7, icon: 3 },
        { name: "Extraction C", pos: { x: 887,  y: 81,  z: 381  }, color: 7, icon: 4 },
        { name: "Air Drop",     pos: { x: 777,  y: 96,  z: 441  }, color: 5, icon: 0 },
    ],
    airport: [
        { name: "Extraction A", pos: { x: 1389, y: 137, z: -222 }, color: 7, icon: 2 },
        { name: "Extraction B", pos: { x: 1122, y: 95,  z: -185 }, color: 7, icon: 3 },
        { name: "Extraction C", pos: { x: 1287, y: 95,  z: -527 }, color: 7, icon: 4 },
        { name: "Air Drop",     pos: { x: 1060, y: 96,  z: 206  }, color: 5, icon: 0 },
    ],
    desert: [
        { name: "Extraction A", pos: { x: 1979, y: 95,  z: 1814 }, color: 7, icon: 2 },
        { name: "Extraction B", pos: { x: 1615, y: 229, z: 2137 }, color: 7, icon: 3 },
        { name: "Air Drop",     pos: { x: 1839, y: 56,  z: 2231 }, color: 5, icon: 0 },
    ],
    la_petro: [
        { name: "Extracción A",  pos: { x: -1801, y: 113, z: 2031 }, color: 7, icon: 2 },
        { name: "Extracción B",  pos: { x: -1740, y: 63,  z: 2053 }, color: 7, icon: 3 },
        { name: "Air Drop",      pos: { x: -1842, y: 112, z: 2054 }, color: 5, icon: 0 },
    ],
};

const ALL_WP_NAMES = ["Extraction A", "Extraction B", "Extraction C", "Air Drop", "Extracción A", "Extracción B"];
const MAP_IDS = Object.keys(MAP_WAYPOINTS);
const EM_TYPE = "dz:extraction_machine";
const EM_TAG  = "gm:extraction_machine";

const colorRBG = [
    [200,200,200],[128,128,128],[90,90,90],[0,0,0],[70,25,0],
    [255,0,0],[255,165,0],[255,255,0],[0,255,0],[0,128,0],
    [25,90,180],[0,255,255],[0,0,240],[160,0,200],[90,0,140],[240,50,150]
];

function setWaypoint(player, wp) {
    try {
        // Primero eliminar el waypoint si ya existe (para evitar duplicados)
        removeWaypoint(player, wp.name);
        
        // Crear el waypoint usando dynamic properties directamente (posición absoluta)
        system.runTimeout(() => {
            try {
                const color = wp.color ?? 7;
                const icon = wp.icon ?? 0;
                const pos = wp.pos;
                
                // Calcular el color RGB con el offset
                const rgb = colorRBG[color] ?? [255, 255, 255];
                const red = rgb[0] + color * 1000;
                const green = rgb[1];
                const blue = rgb[2];
                
                // Crear la key del dynamic property (formato del addon)
                const dim = player.dimension.id.replace("minecraft:", "");
                const key = `${dim}/1/${icon}/${red},${green},${blue}/${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}/${wp.name}`;
                
                // Guardar el dynamic property
                player.setDynamicProperty(key, true);
                
                console.warn(`[MapWaypoints] ✓ Waypoint creado: ${wp.name} en ${pos.x},${pos.y},${pos.z}`);
                
                // NO spawnear entidad aquí - dejar que el sistema del addon lo haga automáticamente
                // El addon tiene un sistema que detecta los dynamic properties y crea las entidades
                
            } catch (e) {
                console.warn(`[MapWaypoints] Error creando waypoint ${wp.name}: ${e}`);
            }
        }, 2);
    } catch (e) {
        console.warn(`[MapWaypoints] Error en setWaypoint ${wp.name}: ${e}`);
    }
}

function removeWaypoint(player, name) {
    try {
        // Eliminar la entidad del waypoint
        apiWaypointEntity.remove(player, name);
    } catch (e) {
        console.warn(`[MapWaypoints] Error removiendo entidad ${name}: ${e}`);
    }
    try {
        // Eliminar el dynamic property del waypoint
        apiWaypointInfo.remove(player, name);
    } catch (e) {
        console.warn(`[MapWaypoints] Error removiendo dynamic property ${name}: ${e}`);
    }
}

function removeAllExtractionWaypoints(player) {
    console.warn(`[MapWaypoints] Eliminando todos los waypoints para ${player.name}`);
    for (const name of ALL_WP_NAMES) {
        removeWaypoint(player, name);
    }
}

function addMapWaypoints(player, mapId) {
    const wps = MAP_WAYPOINTS[mapId];
    if (!wps) return;
    
    const hasAirdrop = hasAirdropThisMatch();
    console.warn(`[MapWaypoints] Agregando waypoints para ${player.name} en ${mapId}, hasAirdrop=${hasAirdrop}`);
    
    for (const wp of wps) {
        // Si es Air Drop y no hay airdrop esta partida, saltarlo
        // Excepción: en la_petro el drop es siempre fijo
        if (wp.name === "Air Drop" && mapId !== "la_petro" && !hasAirdrop) {
            console.warn(`[MapWaypoints] ✗ Saltando waypoint Air Drop (no hay drop esta partida)`);
            continue;
        }
        setWaypoint(player, wp);
    }
    
    // Forzar la regeneración de las entidades de waypoints después de crear los dynamic properties
    system.runTimeout(() => {
        try {
            apiWaypointEntity.recoverWaypoints(player);
            console.warn(`[MapWaypoints] ✓ Entidades de waypoints regeneradas para ${player.name}`);
        } catch (e) {
            console.warn(`[MapWaypoints] Error regenerando entidades: ${e}`);
        }
    }, 20); // 1 segundo después de crear los dynamic properties
}

// ─── Extraction Machines ──────────────────────────────────────────────────────

function spawnExtractionMachines(mapId) {
    const wps = MAP_WAYPOINTS[mapId];
    if (!wps) return;
    const dim = world.getDimension("minecraft:overworld");

    for (const wp of wps) {
        // Solo spawnear extraction machines, no para Air Drop
        if (wp.name === "Air Drop") continue;
        
        // Intentar spawnear con reintentos hasta que el chunk esté cargado
        let attempts = 0;
        const trySpawn = () => {
            attempts++;
            if (attempts > 20) {
                console.warn(`[MapWaypoints] Timeout spawning EM en ${wp.pos.x},${wp.pos.y},${wp.pos.z}`);
                return;
            }
            try {
                const entity = dim.spawnEntity(EM_TYPE, { x: wp.pos.x, y: wp.pos.y, z: wp.pos.z });
                entity.addTag(EM_TAG);
                entity.addTag(`gm:em_${mapId}`);
            } catch (e) {
                if (e.toString().includes("UnloadedChunk") || e.toString().includes("not in a chunk")) {
                    // Chunk no cargado, reintentar en 40 ticks
                    system.runTimeout(trySpawn, 40);
                } else {
                    console.warn("[MapWaypoints] Error spawning EM: " + e);
                }
            }
        };
        trySpawn();
    }
}

function removeExtractionMachines() {
    for (const dimId of ["overworld", "nether", "the_end"]) {
        try {
            const entities = world.getDimension(`minecraft:${dimId}`)
                .getEntities({ type: EM_TYPE, tags: [EM_TAG] });
            for (const e of entities) { try { e.remove(); } catch {} }
        } catch {}
    }
}

// ─── Estado y lógica principal ────────────────────────────────────────────────

const lastMapState = new Map();
let isCleaningOnLoad = false; // Flag para evitar creación duplicada durante limpieza

function getActiveMapId() {
    try {
        for (const dim of ["overworld", "nether", "the_end"]) {
            const guardias = world.getDimension(`minecraft:${dim}`)
                .getEntities({ type: "tz:guardia_1" });
            for (const g of guardias) {
                for (const mapId of MAP_IDS) {
                    if (g.hasTag(`gm:map_${mapId}`)) return mapId;
                }
            }
        }
    } catch {}
    return null;
}

function hasAirdropThisMatch() {
    try {
        for (const dim of ["overworld", "nether", "the_end"]) {
            const guardias = world.getDimension(`minecraft:${dim}`)
                .getEntities({ type: "tz:guardia_1" });
            for (const g of guardias) {
                if (g.hasTag("gm:has_airdrop")) {
                    return true;
                }
            }
        }
    } catch {}
    return false;
}

let lastGlobalMap  = undefined;

system.runInterval(() => {
    // No actualizar durante la limpieza inicial
    if (isCleaningOnLoad) return;
    
    const activeMap = getActiveMapId();

    // Cambio global de mapa → actualizar extraction machines
    if (activeMap !== lastGlobalMap) {
        console.warn(`[MapWaypoints] Cambio de mapa: ${lastGlobalMap} → ${activeMap}`);
        removeExtractionMachines();
        if (activeMap) spawnExtractionMachines(activeMap);
        lastGlobalMap = activeMap;
    }

    // Actualizar waypoints por jugador
    for (const player of world.getAllPlayers()) {
        const prev = lastMapState.get(player.id);
        if (prev === activeMap) continue; // Sin cambios

        console.warn(`[MapWaypoints] Actualizando waypoints para ${player.name} (mapa: ${activeMap})`);
        removeAllExtractionWaypoints(player);
        if (activeMap) addMapWaypoints(player, activeMap);
        lastMapState.set(player.id, activeMap);
    }
}, 100);
world.afterEvents.playerSpawn.subscribe(ev => {
    // Aplicar waypoints tanto en spawn inicial como en reconexión
    system.runTimeout(() => {
        lastMapState.delete(ev.player.id);
        const activeMap = getActiveMapId();
        if (activeMap) addMapWaypoints(ev.player, activeMap);
        lastMapState.set(ev.player.id, activeMap);
    }, 60);
});

// ─── LIMPIEZA AL RECARGAR EL MUNDO ────────────────────────────────────────────

system.runTimeout(() => {
    isCleaningOnLoad = true; // Activar flag para pausar el loop
    
    console.warn("[MapWaypoints] ═══════════════════════════════════════");
    console.warn("[MapWaypoints] Iniciando limpieza TOTAL al cargar el mundo...");
    
    try {
        const allPlayers = world.getAllPlayers();
        console.warn(`[MapWaypoints] Jugadores encontrados: ${allPlayers.length}`);
        
        // Limpiar ABSOLUTAMENTE TODOS los waypoints de TODOS los jugadores
        for (const player of allPlayers) {
            console.warn(`[MapWaypoints] Limpiando TODOS los waypoints de ${player.name}...`);
            
            // Eliminar TODAS las entidades de waypoints del jugador
            try {
                apiWaypointEntity.removeAll(player);
                console.warn(`[MapWaypoints] ✓ TODAS las entidades eliminadas para ${player.name}`);
            } catch (e) {
                console.warn(`[MapWaypoints] Error eliminando entidades: ${e}`);
            }
            
            // Eliminar TODOS los dynamic properties de waypoints
            try {
                const props = player.getDynamicPropertyIds();
                let removed = 0;
                for (const prop of props) {
                    // Eliminar cualquier dynamic property que parezca un waypoint
                    // Los waypoints tienen formato: "dimension/visible/icon/color/pos/name"
                    if (prop.includes("/") && !prop.startsWith("aw:") && !prop.startsWith("dm:") && !prop.startsWith("gm:") && !prop.startsWith("col:") && !prop.startsWith("playerSettings")) {
                        player.setDynamicProperty(prop, undefined);
                        removed++;
                        console.warn(`[MapWaypoints] Eliminado dynamic property: ${prop}`);
                    }
                }
                console.warn(`[MapWaypoints] ✓ ${removed} dynamic properties eliminados para ${player.name}`);
            } catch (e) {
                console.warn(`[MapWaypoints] Error eliminando dynamic properties: ${e}`);
            }
            
            // Resetear el estado del jugador
            lastMapState.delete(player.id);
        }
        
        console.warn("[MapWaypoints] ✓ Limpieza TOTAL completada");
        
        // Esperar un poco y regenerar SOLO los waypoints del sistema
        system.runTimeout(() => {
            const activeMap = getActiveMapId();
            console.warn(`[MapWaypoints] Mapa activo detectado: ${activeMap ?? "ninguno"}`);
            
            if (activeMap) {
                console.warn("[MapWaypoints] Regenerando SOLO waypoints del sistema...");
                for (const player of world.getAllPlayers()) {
                    addMapWaypoints(player, activeMap);
                    lastMapState.set(player.id, activeMap);
                }
                lastGlobalMap = activeMap; // Actualizar el estado global
                console.warn("[MapWaypoints] ✓ Waypoints del sistema regenerados");
            } else {
                console.warn("[MapWaypoints] No hay mapa activo, no se regeneran waypoints");
            }
            
            console.warn("[MapWaypoints] ═══════════════════════════════════════");
            
            // Reactivar el loop después de 2 segundos
            system.runTimeout(() => {
                isCleaningOnLoad = false;
                console.warn("[MapWaypoints] Loop reactivado");
            }, 40);
        }, 100); // 5 segundos después de la limpieza
        
    } catch (e) {
        console.warn(`[MapWaypoints] ERROR CRÍTICO en limpieza: ${e}`);
        isCleaningOnLoad = false; // Reactivar el loop en caso de error
    }
}, 120); // 6 segundos después de cargar el mundo

console.warn("[MapWaypoints] Sistema cargado");
