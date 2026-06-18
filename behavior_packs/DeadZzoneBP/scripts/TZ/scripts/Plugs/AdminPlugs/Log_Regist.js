import { world, system, Player, ItemStack, Entity } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

// Mensaje de depuración para confirmar carga del script
console.warn("Log_Regist.js cargado correctamente");

// --- Configuración de la base de datos persistente ---
const PLAYER_LOGS_KEY = "playerLogsDB";
const MAX_LOGS_PER_PLAYER = 1000; // Reducido de 30000 a 1000
const MAX_PROPERTY_SIZE = 30000;
const MOVEMENT_THRESHOLD = 5; // Aumentado de 2 a 5 bloques
let playerLogs = {};
try {
    const raw = world.getDynamicProperty(PLAYER_LOGS_KEY);
    if (raw) {
        playerLogs = JSON.parse(raw);
    } else {
        let i = 1;
        while (true) {
            const rawChunk = world.getDynamicProperty(`playerLogsDB_${i}`);
            if (rawChunk === undefined) break;
            const chunk = JSON.parse(rawChunk);
            playerLogs = { ...playerLogs, ...chunk };
            i++;
        }
    }
} catch (e) {
    console.warn("Error al cargar playerLogs: ", e.message);
    playerLogs = {};
}

function guardarLogs() {
    try {
        // Limpiar y comprimir datos
        for (const jugador in playerLogs) {
            if (playerLogs[jugador].length > MAX_LOGS_PER_PLAYER) {
                playerLogs[jugador] = playerLogs[jugador].slice(-MAX_LOGS_PER_PLAYER);
            }
        }

        const serialized = JSON.stringify(playerLogs);
        if (serialized.length <= 32000) {
            world.setDynamicProperty(PLAYER_LOGS_KEY, serialized);
            return;
        }

        // Dividir en chunks
        const chunks = [];
        let currentChunk = {};
        const players = Object.keys(playerLogs).sort();

        for (const player of players) {
            const playerData = playerLogs[player];
            const tempChunk = { ...currentChunk, [player]: playerData };
            const tempSize = JSON.stringify(tempChunk).length;

            if (tempSize > 32000) {
                if (Object.keys(currentChunk).length === 0) {
                    // Truncar datos del jugador si es necesario
                    const truncatedData = playerData.slice(-Math.floor(MAX_LOGS_PER_PLAYER / 2));
                    if (JSON.stringify({ [player]: truncatedData }).length <= 32000) {
                        chunks.push({ [player]: truncatedData });
                    }
                } else {
                    chunks.push(currentChunk);
                    currentChunk = { [player]: playerData };
                }
            } else {
                currentChunk = tempChunk;
            }
        }

        if (Object.keys(currentChunk).length > 0) {
            chunks.push(currentChunk);
        }

        // Guardar chunks
        chunks.forEach((chunk, index) => {
            world.setDynamicProperty(`playerLogsDB_${index + 1}`, JSON.stringify(chunk));
        });

        // Limpiar chunks antiguos
        let i = chunks.length + 1;
        while (world.getDynamicProperty(`playerLogsDB_${i}`) !== undefined) {
            world.setDynamicProperty(`playerLogsDB_${i}`, undefined);
            i++;
        }

    } catch (error) {
        console.error("Error guardando logs:", error);
    }
}

function registrarEvento(jugador, tipo, datos) {
    if (!jugador || typeof jugador !== "string") {
        console.warn(`Nombre de jugador inválido para evento ${tipo}: `, jugador);
        return;
    }
    if (!playerLogs[jugador]) playerLogs[jugador] = [];
    playerLogs[jugador].push({ jugador, tipo, ...datos }); // <-- Añade 'jugador'
    guardarLogs();
    console.warn(`[DEBUG] Evento ${tipo} registrado para ${jugador}`);
}

function getFechaHora() {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 5);
    const fecha = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const hora = now.toTimeString().split(' ')[0];
    return { fecha, hora };
}

// --- Manejadores de eventos ---
world.afterEvents.playerJoin.subscribe(event => {
    try {
        const player = event.player;
        if (!(player instanceof Player) || !player.nameTag || !player.location) {
            console.warn("Datos de jugador inválidos en playerJoin: ", player ? player.nameTag : "undefined");
            return;
        }
        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "conexion", {
            coordenadas: `(${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)})`,
            fecha, hora
        });
        console.warn(`[DEBUG] Jugador ${player.nameTag} conectado a las ${fecha} ${hora}`);
    } catch (e) {
        console.error("Error en manejador playerJoin: ", e.message, e.stack);
    }
});

world.beforeEvents.playerLeave.subscribe(event => {
    try {
        const player = event.player;
        if (!(player instanceof Player) || !player.nameTag) {
            console.warn("Datos de jugador inválidos en playerLeave: ", player ? player.nameTag : "undefined");
            return;
        }
        const coords = player.location
            ? `(${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)})`
            : "(desconocidas)";
        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "desconexion", {
            coordenadas: coords,
            fecha, hora
        });
        console.warn(`[DEBUG] Jugador ${player.nameTag} desconectado a las ${fecha} ${hora}`);
    } catch (e) {
        console.error("Error en manejador playerLeave: ", e.message, e.stack);
    }
});

world.beforeEvents.itemUse.subscribe((event) => {
    try {
        const { source: player, itemStack } = event;
        if (!player?.nameTag || !itemStack?.typeId) return;

        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "uso_item", {
            coordenadas: `(${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)})`,
            fecha,
            hora,
            item: itemStack.typeId
        });
    } catch (error) {
        console.error("Error en itemUse:", error);
    }
});

world.afterEvents.playerPlaceBlock.subscribe(event => {
    try {
        const { player, block } = event;
        if (!(player instanceof Player) || !player.nameTag || !block) {
            console.warn("Datos inválidos en playerPlaceBlock: ", {
                player: player ? player.nameTag : "undefined",
                block: block ? block.typeId : "undefined"
            });
            return;
        }
        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "colocacion_bloque", {
            coordenadas: `(${Math.floor(block.location.x)},${Math.floor(block.location.y)},${Math.floor(block.location.z)})`,
            fecha, hora, bloque: block.typeId
        });
    } catch (e) {
        console.error("Error en manejador playerPlaceBlock: ", e.message, e.stack);
    }
});

world.afterEvents.playerBreakBlock.subscribe(event => {
    try {
        const { player, block, brokenBlockPermutation } = event;
        if (!(player instanceof Player) || !player.nameTag || !block || !brokenBlockPermutation) {
            console.warn("Datos inválidos en playerBreakBlock: ", {
                player: player ? player.nameTag : "undefined",
                block: block ? block.typeId : "undefined"
            });
            return;
        }
        const blockType = brokenBlockPermutation.type.id;
        if (blockType === "minecraft:air") return;
        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "rompio_bloque", {
            coordenadas: `(${Math.floor(block.location.x)},${Math.floor(block.location.y)},${Math.floor(block.location.z)})`,
            fecha, hora, bloque: blockType
        });
    } catch (e) {
        console.error("Error en manejador playerBreakBlock: ", e.message, e.stack);
    }
});

const lastCoords = {};
system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            const key = player.nameTag;
            if (!key) continue;

            const pos = {
                x: Math.floor(player.location.x),
                y: Math.floor(player.location.y),
                z: Math.floor(player.location.z)
            };

            if (!lastCoords[key]) {
                lastCoords[key] = pos;
                continue;
            }

            const distance = Math.sqrt(
                Math.pow(pos.x - lastCoords[key].x, 2) +
                Math.pow(pos.y - lastCoords[key].y, 2) +
                Math.pow(pos.z - lastCoords[key].z, 2)
            );

            if (distance >= MOVEMENT_THRESHOLD) {
                const { fecha, hora } = getFechaHora();
                registrarEvento(key, "camino", {
                    coordenadas: `(${pos.x},${pos.y},${pos.z})`,
                    fecha,
                    hora
                });
                lastCoords[key] = pos;
            }
        }
    } catch (error) {
        console.error("Error en movimiento:", error);
    }
}, 200); // 10 segundos

const quietoData = {};
system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            const key = player.nameTag;
            if (!key) continue;
            const pos = `${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)}`;
            if (!quietoData[key]) quietoData[key] = { pos, tiempo: 0, afk: false };
            if (quietoData[key].pos === pos) {
                quietoData[key].tiempo += 1;
                if (!quietoData[key].afk && quietoData[key].tiempo >= 60) {
                    quietoData[key].afk = true;
                    const { fecha, hora } = getFechaHora();
                    registrarEvento(key, "afk", { coordenadas: `(${pos})`, fecha, hora, tiempoAfk: quietoData[key].tiempo });
                }
            } else {
                if (quietoData[key].tiempo >= 10 && !quietoData[key].afk) {
                    const { fecha, hora } = getFechaHora();
                    registrarEvento(key, "quieto", { coordenadas: `(${quietoData[key].pos})`, fecha, hora, tiempo: quietoData[key].tiempo });
                }
                quietoData[key] = { pos, tiempo: 0, afk: false };
            }
        }
    } catch (e) {
        console.error("Error en manejador runInterval (AFK): ", e.message, e.stack);
    }
}, 20);

world.afterEvents.playerInteractWithEntity.subscribe(event => {
    try {
        const { player, target } = event;
        if (!(player instanceof Player) || !player.nameTag || !(target instanceof Entity)) {
            console.warn("Datos inválidos en playerInteractWithEntity: ", {
                player: player ? player.nameTag : "undefined",
                target: target ? target.typeId : "undefined"
            });
            return;
        }
        const { fecha, hora } = getFechaHora();
        registrarEvento(player.nameTag, "interaccion_entidad", {
            coordenadas: target.location
                ? `(${Math.floor(target.location.x)},${Math.floor(target.location.y)},${Math.floor(target.location.z)})`
                : "(desconocidas)",
            fecha, hora, entidad: target.typeId
        });
    } catch (e) {
        console.error("Error en manejador playerInteractWithEntity: ", e.message, e.stack);
    }
});

const ultimoAtacanteJugador = new Map();
const ultimoAtacanteEntidad = new Map();

world.afterEvents.entityHurt.subscribe(event => {
    try {
        const { hurtEntity, damageSource } = event;
        if (!hurtEntity || !damageSource) return;

        const atacante = damageSource.damagingEntity;
        if (!atacante) return;

        // Verificar que son jugadores usando typeId
        const isHurtPlayer = hurtEntity.typeId === "minecraft:player";
        const isAttackerPlayer = atacante.typeId === "minecraft:player";

        if (isHurtPlayer && isAttackerPlayer) {
            ultimoAtacanteJugador.set(hurtEntity.nameTag, atacante.nameTag);
        } else if (!isHurtPlayer && isAttackerPlayer) {
            ultimoAtacanteEntidad.set(hurtEntity.id, {
                name: atacante.nameTag,
                tick: system.currentTick
            });
        }
    } catch (error) {
        console.error("Error en entityHurt:", error);
    }
});

world.afterEvents.entityDie.subscribe(event => {
    try {
        const { deadEntity, damageSource } = event;
        if (!deadEntity) return;

        const { fecha, hora } = getFechaHora();
        const isPlayer = deadEntity.typeId === "minecraft:player";

        if (isPlayer) {
            let asesino = "desconocido";
            const killerName = ultimoAtacanteJugador.get(deadEntity.nameTag);

            if (killerName) {
                registrarEvento(killerName, "elimino_jugador", {
                    coordenadas: `(${Math.floor(deadEntity.location.x)},${Math.floor(deadEntity.location.y)},${Math.floor(deadEntity.location.z)})`,
                    fecha,
                    hora,
                    victima: deadEntity.nameTag
                });
                asesino = killerName;
                ultimoAtacanteJugador.delete(deadEntity.nameTag);
            }

            registrarEvento(deadEntity.nameTag, "muerte", {
                coordenadas: `(${Math.floor(deadEntity.location.x)},${Math.floor(deadEntity.location.y)},${Math.floor(deadEntity.location.z)})`,
                fecha,
                hora,
                asesino
            });
        } else {
            const data = ultimoAtacanteEntidad.get(deadEntity.id);
            if (data && system.currentTick - data.tick < 200) {
                registrarEvento(data.name, "eliminacion_entidad", {
                    coordenadas: `(${Math.floor(deadEntity.location.x)},${Math.floor(deadEntity.location.y)},${Math.floor(deadEntity.location.z)})`,
                    fecha,
                    hora,
                    entidad: deadEntity.typeId
                });
            }
            ultimoAtacanteEntidad.delete(deadEntity.id);
        }
    } catch (error) {
        console.error("Error en entityDie:", error);
    }
});

const lastInventories = {};
system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            const key = player.nameTag;
            if (!key) continue;
            const inv = player.getComponent("minecraft:inventory")?.container;
            if (!inv) {
                console.warn(`[DEBUG] No se pudo acceder al inventario de ${key}`);
                continue;
            }
            let current = {};
            for (let i = 0; i < inv.size; i++) {
                const item = inv.getItem(i);
                if (item) {
                    const id = item.typeId;
                    current[id] = (current[id] || 0) + item.amount;
                }
            }
            if (lastInventories[key]) {
                for (const id in lastInventories[key]) {
                    const diff = (lastInventories[key][id] || 0) - (current[id] || 0);
                    if (diff > 0) {
                        const { fecha, hora } = getFechaHora();
                        registrarEvento(key, "dropeo_item", {
                            coordenadas: `(${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)})`,
                            fecha, hora, item: id, cantidad: diff
                        });
                    }
                }
                for (const id in current) {
                    const diff = (current[id] || 0) - (lastInventories[key][id] || 0);
                    if (diff > 0) {
                        const { fecha, hora } = getFechaHora();
                        registrarEvento(key, "agarro_item", {
                            coordenadas: `(${Math.floor(player.location.x)},${Math.floor(player.location.y)},${Math.floor(player.location.z)})`,
                            fecha, hora, item: id, cantidad: diff
                        });
                    }
                }
            }
            lastInventories[key] = current;
        }
    } catch (e) {
        console.error("Error en manejador runInterval (inventario): ", e.message, e.stack);
    }
}, 40); // Intervalo aumentado a 2 segundos

// --- Unified Player Log and Search System ---
class PlayerLogSystem {
    constructor() {
        this.itemsPerPage = 8;
        this.maxDescriptionLength = 100;
    }

    // --- Log Retrieval Functions ---
    obtenerLogsJugador(jugador, filtro = {}) {
        if (!playerLogs[jugador]) return [];
        return playerLogs[jugador].filter(log => {
            for (const k in filtro) if (log[k] !== filtro[k]) return false;
            return true;
        });
    }

    obtenerTodosLosLogs() {
        return playerLogs;
    }

    obtenerLogsFiltrados({ jugador, tipo, fecha }) {
        let logs = [];
        if (jugador) logs = this.obtenerLogsJugador(jugador);
        else logs = Object.values(playerLogs).flat();
        if (tipo) logs = logs.filter(l => l.tipo === tipo);
        if (fecha) logs = logs.filter(l => l.fecha === fecha);
        return logs;
    }

    getPlayerStats(playerName) {
        const logs = this.obtenerLogsJugador(playerName);
        const stats = {
            totalEvents: logs.length,
            connections: logs.filter(log => log.tipo === "conexion").length,
            disconnections: logs.filter(log => log.tipo === "desconexion").length,
            itemsUsed: logs.filter(log => log.tipo === "uso_item").length,
            blocksPlaced: logs.filter(log => log.tipo === "colocacion_bloque").length,
            blocksBroken: logs.filter(log => log.tipo === "rompio_bloque").length,
            deaths: logs.filter(log => log.tipo === "muerte").length,
            pvpKills: logs.filter(log => log.tipo === "elimino_jugador").length,
            entityKills: logs.filter(log => log.tipo === "eliminacion_entidad").length,
            totalAfkTime: logs.filter(log => log.tipo === "afk").reduce((sum, log) => sum + (log.tiempoAfk || 0), 0),
            firstActivity: logs[0]?.fecha ? `${logs[0].fecha} ${logs[0].hora}` : null,
            lastActivity: logs[logs.length - 1]?.fecha ? `${logs[logs.length - 1].fecha} ${logs[logs.length - 1].hora}` : null
        };
        return stats;
    }

    // --- Language and UI Utilities ---
    getPlayerLanguage(player) {
        return player.hasTag("lang_es_ES") ? "es_ES" : "en_US";
    }

    translateEventType(eventType, lang) {
        const translations = {
            "conexion": lang === "es_ES" ? "Conexión" : "Connection",
            "desconexion": lang === "es_ES" ? "Desconexión" : "Disconnection",
            "uso_item": lang === "es_ES" ? "Uso de item" : "Item usage",
            "colocacion_bloque": lang === "es_ES" ? "Colocación de bloque" : "Block placement",
            "rompio_bloque": lang === "es_ES" ? "Rotura de bloque" : "Block breaking",
            "camino": lang === "es_ES" ? "Movimiento" : "Movement",
            "quieto": lang === "es_ES" ? "Quieto" : "Still",
            "afk": "AFK",
            "interaccion_entidad": lang === "es_ES" ? "Interacción con entidad" : "Entity interaction",
            "muerte": lang === "es_ES" ? "Muerte" : "Death",
            "elimino_jugador": lang === "es_ES" ? "Eliminación PvP" : "PvP kill",
            "eliminacion_entidad": lang === "es_ES" ? "Eliminación de entidad" : "Entity kill",
            "dropeo_item": lang === "es_ES" ? "Dropeo de item" : "Item drop",
            "agarro_item": lang === "es_ES" ? "Recogida de item" : "Item pickup"
        };
        return translations[eventType] || eventType;
    }

    getEventIcon(eventType) {
        const icons = {
            "conexion": "🟢",
            "desconexion": "🔴",
            "uso_item": "🔧",
            "colocacion_bloque": "🧱",
            "rompio_bloque": "⛏️",
            "camino": "👣",
            "quieto": "⏸️",
            "afk": "😴",
            "interaccion_entidad": "🤝",
            "muerte": "💀",
            "elimino_jugador": "⚔️",
            "eliminacion_entidad": "🗡️",
            "dropeo_item": "📤",
            "agarro_item": "📥"
        };
        return icons[eventType] || "📋";
    }

    // --- Main Admin Menu ---
    showMainAdminMenu(adminPlayer) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showMainAdminMenu: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const form = new ActionFormData()
                .title(lang === "es_ES" ? "§6🔍 Sistema de Logs de Jugadores" : "§6🔍 Player Log System")
                .body(lang === "es_ES" ? 
                    "§7Selecciona una opción para administrar y analizar los logs de jugadores:" : 
                    "§7Select an option to manage and analyze player logs:")
                .button(lang === "es_ES" ? "§a🔍 Búsqueda Rápida\n§7Buscar por nombre" : "§a🔍 Quick Search\n§7Search by name", "textures/ui/magnifyingGlass.png")
                .button(lang === "es_ES" ? "§b📊 Búsqueda Avanzada\n§7Filtros múltiples" : "§b📊 Advanced Search\n§7Multiple filters", "textures/ui/icon_setting.png")
                .button(lang === "es_ES" ? "§e📋 Lista Completa\n§7Todos los jugadores" : "§e📋 Complete List\n§7All players", "textures/ui/icon_book_writable.png")
                .button(lang === "es_ES" ? "§d📈 Estadísticas\n§7Resumen general" : "§d📈 Statistics\n§7General overview", "textures/ui/icon_best3.png")
                .button(lang === "es_ES" ? "§c❌ Cerrar" : "§c❌ Close", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                switch (response.selection) {
                    case 0: this.showQuickSearch(adminPlayer); break;
                    case 1: this.showAdvancedSearch(adminPlayer); break;
                    case 2: this.showCompletePlayerList(adminPlayer); break;
                    case 3: this.showStatistics(adminPlayer); break;
                }
            });
        } catch (e) {
            console.error("Error en showMainAdminMenu: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al abrir el menú de logs." : "§cError opening logs menu.");
        }
    }

    // --- Quick Search ---
    showQuickSearch(adminPlayer) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showQuickSearch: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const form = new ModalFormData()
                .title(lang === "es_ES" ? "§a🔍 Búsqueda Rápida" : "§a🔍 Quick Search")
                .textField(
                    lang === "es_ES" ? "Nombre del jugador:" : "Player name:", 
                    lang === "es_ES" ? "Escribe el nombre..." : "Type the name..."
                )
                .toggle(
                    lang === "es_ES" ? "Búsqueda exacta" : "Exact search", 
                    false
                );

            form.show(adminPlayer).then((response) => {
                if (response.canceled) {
                    this.showMainAdminMenu(adminPlayer);
                    return;
                }
                const [searchTerm, exactSearch] = response.formValues;
                if (!searchTerm || searchTerm.trim() === "") {
                    adminPlayer.sendMessage(lang === "es_ES" ? "§cDebes ingresar un nombre para buscar." : "§cYou must enter a name to search.");
                    this.showQuickSearch(adminPlayer);
                    return;
                }
                const results = this.searchPlayersByName(searchTerm.trim(), exactSearch);
                this.showSearchResults(adminPlayer, results, `Búsqueda: "${searchTerm}"`);
            });
        } catch (e) {
            console.error("Error en showQuickSearch: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al realizar la búsqueda rápida." : "§cError performing quick search.");
        }
    }

    searchPlayersByName(searchTerm, exactSearch) {
        const playerNames = Object.keys(playerLogs);
        if (exactSearch) {
            return playerNames.filter(name => name.toLowerCase() === searchTerm.toLowerCase());
        } else {
            return playerNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
    }

    // --- Advanced Search ---
    showAdvancedSearch(adminPlayer) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showAdvancedSearch: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const eventTypes = [
                lang === "es_ES" ? "Todos los eventos" : "All events",
                lang === "es_ES" ? "Conexiones" : "Connections",
                lang === "es_ES" ? "Desconexiones" : "Disconnections", 
                lang === "es_ES" ? "Uso de items" : "Item usage",
                lang === "es_ES" ? "Colocación de bloques" : "Block placement",
                lang === "es_ES" ? "Rotura de bloques" : "Block breaking",
                lang === "es_ES" ? "Movimiento" : "Movement",
                lang === "es_ES" ? "AFK" : "AFK",
                lang === "es_ES" ? "Muertes" : "Deaths",
                lang === "es_ES" ? "Eliminaciones PvP" : "PvP kills",
                lang === "es_ES" ? "Eliminaciones de entidades" : "Entity kills",
                lang === "es_ES" ? "Dropeo de items" : "Item drops",
                lang === "es_ES" ? "Recogida de items" : "Item pickups"
            ];

            const form = new ModalFormData()
                .title(lang === "es_ES" ? "§b📊 Búsqueda Avanzada" : "§b📊 Advanced Search")
                .textField(
                    lang === "es_ES" ? "Nombre del jugador (opcional):" : "Player name (optional):", 
                    lang === "es_ES" ? "Dejar vacío para todos" : "Leave empty for all"
                )
                .dropdown(
                    lang === "es_ES" ? "Tipo de evento:" : "Event type:", 
                    eventTypes, 
                    0
                )
                .textField(
                    lang === "es_ES" ? "Fecha (DD/MM/YYYY) (opcional):" : "Date (DD/MM/YYYY) (optional):", 
                    lang === "es_ES" ? "Ej: 18/7/2025" : "Ex: 18/7/2025"
                )
                .slider(
                    lang === "es_ES" ? "Máximo de resultados:" : "Maximum results:", 
                    10, 100, 1, 50
                );

            form.show(adminPlayer).then((response) => {
                if (response.canceled) {
                    this.showMainAdminMenu(adminPlayer);
                    return;
                }
                const [playerName, eventTypeIndex, date, maxResults] = response.formValues;
                const eventTypeMap = [
                    null, "conexion", "desconexion", "uso_item", "colocacion_bloque", 
                    "rompio_bloque", "camino", "afk", "muerte", "elimino_jugador", 
                    "eliminacion_entidad", "dropeo_item", "agarro_item"
                ];
                const filters = {
                    jugador: playerName && playerName.trim() !== "" ? playerName.trim() : null,
                    tipo: eventTypeMap[eventTypeIndex],
                    fecha: date && date.trim() !== "" ? date.trim() : null,
                    maxResults: maxResults
                };
                const results = this.obtenerLogsFiltrados(filters).slice(0, filters.maxResults);
                this.showAdvancedSearchResults(adminPlayer, results, filters);
            });
        } catch (e) {
            console.error("Error en showAdvancedSearch: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al realizar la búsqueda avanzada." : "§cError performing advanced search.");
        }
    }

    // --- Player List with Pagination ---
    showCompletePlayerList(adminPlayer, page = 1) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showCompletePlayerList: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const playerNames = Object.keys(playerLogs);
            
            if (playerNames.length === 0) {
                adminPlayer.sendMessage(lang === "es_ES" ? "§cNo hay jugadores registrados." : "§cNo players registered.");
                this.showMainAdminMenu(adminPlayer);
                return;
            }

            const playersWithActivity = playerNames.map(name => {
                const logs = playerLogs[name];
                const lastActivity = logs.length > 0 ? logs[logs.length - 1] : null;
                return {
                    name,
                    lastActivity,
                    totalEvents: logs.length,
                    isOnline: world.getPlayers().some(p => p.nameTag === name)
                };
            }).sort((a, b) => {
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                return b.totalEvents - a.totalEvents;
            });

            const totalPages = Math.ceil(playersWithActivity.length / this.itemsPerPage);
            const currentPage = Math.max(1, Math.min(page, totalPages));
            const startIndex = (currentPage - 1) * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, playersWithActivity.length);
            const pageItems = playersWithActivity.slice(startIndex, endIndex);

            const form = new ActionFormData()
                .title(lang === "es_ES" ? 
                    `§e📋 Lista de Jugadores (${currentPage}/${totalPages})` : 
                    `§e📋 Player List (${currentPage}/${totalPages})`)
                .body(lang === "es_ES" ? 
                    `§7Total de jugadores: §b${playersWithActivity.length}\n§7Página ${currentPage} de ${totalPages}` :
                    `§7Total players: §b${playersWithActivity.length}\n§7Page ${currentPage} of ${totalPages}`);

            pageItems.forEach(player => {
                const statusIcon = player.isOnline ? "🟢" : "🔴";
                const lastActivityText = player.lastActivity ? 
                    `${player.lastActivity.fecha} ${player.lastActivity.hora}` : 
                    (lang === "es_ES" ? "Sin actividad" : "No activity");
                form.button(
                    `${statusIcon} §e${player.name}\n§7Eventos: §b${player.totalEvents} §7| Última: §8${lastActivityText}`,
                    "textures/ui/icon_armor.png"
                );
            });

            if (currentPage > 1) form.button(lang === "es_ES" ? "⬅️ Página Anterior" : "⬅️ Previous Page", "textures/ui/arrow_left.png");
            if (currentPage < totalPages) form.button(lang === "es_ES" ? "➡️ Página Siguiente" : "➡️ Next Page", "textures/ui/arrow_right.png");
            form.button(lang === "es_ES" ? "🔍 Buscar Específico" : "🔍 Search Specific", "textures/ui/magnifyingGlass.png");
            form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                let buttonIndex = response.selection;
                if (buttonIndex < pageItems.length) {
                    const selectedPlayer = pageItems[buttonIndex];
                    this.showPlayerDetails(adminPlayer, selectedPlayer.name);
                    return;
                }
                buttonIndex -= pageItems.length;
                if (currentPage > 1 && buttonIndex === 0) {
                    this.showCompletePlayerList(adminPlayer, currentPage - 1);
                } else if (currentPage < totalPages && buttonIndex === (currentPage > 1 ? 1 : 0)) {
                    this.showCompletePlayerList(adminPlayer, currentPage + 1);
                } else if (buttonIndex === (currentPage > 1 ? 1 : 0) + (currentPage < totalPages ? 1 : 0)) {
                    this.showQuickSearch(adminPlayer);
                } else {
                    this.showMainAdminMenu(adminPlayer);
                }
            });
        } catch (e) {
            console.error("Error en showCompletePlayerList: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar la lista de jugadores." : "§cError showing player list.");
        }
    }

    // --- Player Details with Advanced Filters ---
    showPlayerDetails(adminPlayer, playerName, page = 1, eventFilter = null) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showPlayerDetails: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            let logs = this.obtenerLogsJugador(playerName);
            if (eventFilter) logs = logs.filter(log => log.tipo === eventFilter);

            // Asegura que siempre haya al menos una página
            const totalPages = Math.max(1, Math.ceil(logs.length / this.itemsPerPage));
            const currentPage = Math.max(1, Math.min(page, totalPages));
            const startIndex = logs.length - (currentPage * this.itemsPerPage);
            const endIndex = logs.length - ((currentPage - 1) * this.itemsPerPage);
            const pageItems = logs.slice(Math.max(0, startIndex), endIndex).reverse();

            const stats = this.getPlayerStats(playerName);
            const isOnline = world.getPlayers().some(p => p.nameTag === playerName);
            const statusText = isOnline ? 
                (lang === "es_ES" ? "🟢 En línea" : "🟢 Online") : 
                (lang === "es_ES" ? "🔴 Desconectado" : "🔴 Offline");

            let body = `${statusText}\n§7Total de eventos: §b${logs.length}\n`;
            if (eventFilter) body += `§7Filtrado por: §e${this.translateEventType(eventFilter, lang)}\n`;
            body += `§7Página ${currentPage} de ${totalPages}\n\n`;

            if (pageItems.length === 0) {
                body += lang === "es_ES" ? "§7No hay eventos para mostrar." : "§7No events to display.";
            } else {
                body += pageItems.map((log, index) => {
                    let eventText = `§e${index + 1}. §a${this.translateEventType(log.tipo, lang)}\n`;
                    eventText += `§7${log.fecha} §8${log.hora}`;
                    if (log.coordenadas) eventText += `\n§7Coords: §b${log.coordenadas}`;
                    if (log.item) eventText += `\n§7Item: §b${log.item}`;
                    if (log.cantidad) eventText += ` §7(x${log.cantidad})`;
                    if (log.bloque) eventText += `\n§7Bloque: §b${log.bloque}`;
                    if (log.entidad) eventText += `\n§7Entidad: §b${log.entidad}`;
                    if (log.asesino) eventText += `\n§7Eliminado por: §c${log.asesino}`;
                    if (log.victima) eventText += `\n§7Eliminó a: §c${log.victima}`;
                    if (log.tiempo) eventText += `\n§7Tiempo quieto: §b${log.tiempo}s`;
                    if (log.tiempoAfk) eventText += `\n§7Tiempo AFK: §b${log.tiempoAfk}s`;
                    return eventText;
                }).join("\n\n");
            }

            const form = new ActionFormData()
                .title(lang === "es_ES" ? `§b📊 Detalles de ${playerName}` : `§b📊 Details of ${playerName}`)
                .body(body);

            if (currentPage > 1) form.button(lang === "es_ES" ? "⬅️ Página Anterior" : "⬅️ Previous Page", "textures/ui/arrow_left.png");
            if (currentPage < totalPages) form.button(lang === "es_ES" ? "➡️ Página Siguiente" : "➡️ Next Page", "textures/ui/arrow_right.png");
            form.button(lang === "es_ES" ? "🔍 Filtrar Eventos" : "🔍 Filter Events", "textures/ui/icon_setting.png");
            form.button(lang === "es_ES" ? "📈 Ver Estadísticas" : "📈 View Statistics", "textures/ui/icon_best3.png");
            if (isOnline && adminPlayer.hasTag("admin")) {
                form.button(lang === "es_ES" ? "⚡ Acciones Admin" : "⚡ Admin Actions", "textures/ui/creator_glyph_color.png");
            }
            form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                let buttonIndex = response.selection;
                if (currentPage > 1 && buttonIndex === 0) {
                    this.showPlayerDetails(adminPlayer, playerName, currentPage - 1, eventFilter);
                    return;
                }
                if (currentPage > 1) buttonIndex--;
                if (currentPage < totalPages && buttonIndex === 0) {
                    this.showPlayerDetails(adminPlayer, playerName, currentPage + 1, eventFilter);
                    return;
                }
                if (currentPage < totalPages) buttonIndex--;
                switch (buttonIndex) {
                    case 0: this.showEventFilterMenu(adminPlayer, playerName); break;
                    case 1: this.showPlayerStatistics(adminPlayer, playerName); break;
                    case 2: 
                        if (isOnline && adminPlayer.hasTag("admin")) {
                            this.showAdminActions(adminPlayer, playerName);
                        } else {
                            this.showCompletePlayerList(adminPlayer);
                        }
                        break;
                    case 3: this.showCompletePlayerList(adminPlayer); break;
                    default: this.showCompletePlayerList(adminPlayer); break;
                }
            });
        } catch (e) {
            console.error("Error en showPlayerDetails: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar detalles del jugador." : "§cError showing player details.");
        }
    }

    // --- Event Filter Menu ---
    showEventFilterMenu(adminPlayer, playerName) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showEventFilterMenu: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const logs = this.obtenerLogsJugador(playerName);
            const eventTypes = [...new Set(logs.map(log => log.tipo))];
            
            const form = new ActionFormData()
                .title(lang === "es_ES" ? "🔍 Filtrar Eventos" : "🔍 Filter Events")
                .body(lang === "es_ES" ? 
                    "Selecciona el tipo de evento que deseas ver:" : 
                    "Select the type of event you want to see:");
            
            form.button(lang === "es_ES" ? "📋 Todos los eventos" : "📋 All events", "textures/ui/icon_book_writable.png");
            eventTypes.forEach(eventType => {
                const count = logs.filter(log => log.tipo === eventType).length;
                const translatedType = this.translateEventType(eventType, lang);
                form.button(`${this.getEventIcon(eventType)} ${translatedType}\n§7(${count} eventos)`, "textures/ui/icon_item.png");
            });
            form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                if (response.selection === 0) {
                    this.showPlayerDetails(adminPlayer, playerName, 1, null);
                } else if (response.selection === eventTypes.length + 1) {
                    this.showPlayerDetails(adminPlayer, playerName);
                } else {
                    const selectedEventType = eventTypes[response.selection - 1];
                    this.showPlayerDetails(adminPlayer, playerName, 1, selectedEventType);
                }
            });
        } catch (e) {
            console.error("Error en showEventFilterMenu: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al filtrar eventos." : "§cError filtering events.");
        }
    }

    // --- Player Statistics ---
    showPlayerStatistics(adminPlayer, playerName) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showPlayerStatistics: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const stats = this.getPlayerStats(playerName);
            
            let body = lang === "es_ES" ? 
                `§e📊 Estadísticas de ${playerName}\n\n` +
                `§7Total de eventos: §b${stats.totalEvents}\n` +
                `§7Conexiones: §a${stats.connections}\n` +
                `§7Desconexiones: §c${stats.disconnections}\n` +
                `§7Items usados: §e${stats.itemsUsed}\n` +
                `§7Bloques colocados: §2${stats.blocksPlaced}\n` +
                `§7Bloques rotos: §4${stats.blocksBroken}\n` +
                `§7Muertes: §c${stats.deaths}\n` +
                `§7Eliminaciones PvP: §6${stats.pvpKills}\n` +
                `§7Eliminaciones de entidades: §d${stats.entityKills}\n` +
                `§7Tiempo AFK total: §8${stats.totalAfkTime}s\n` +
                `§7Primer registro: §b${stats.firstActivity || 'N/A'}\n` +
                `§7Último registro: §b${stats.lastActivity || 'N/A'}` :
                `§e📊 Statistics for ${playerName}\n\n` +
                `§7Total events: §b${stats.totalEvents}\n` +
                `§7Connections: §a${stats.connections}\n` +
                `§7Disconnections: §c${stats.disconnections}\n` +
                `§7Items used: §e${stats.itemsUsed}\n` +
                `§7Blocks placed: §2${stats.blocksPlaced}\n` +
                `§7Blocks broken: §4${stats.blocksBroken}\n` +
                `§7Deaths: §c${stats.deaths}\n` +
                `§7PvP kills: §6${stats.pvpKills}\n` +
                `§7Entity kills: §d${stats.entityKills}\n` +
                `§7Total AFK time: §8${stats.totalAfkTime}s\n` +
                `§7First record: §b${stats.firstActivity || 'N/A'}\n` +
                `§7Last record: §b${stats.lastActivity || 'N/A'}`;

            const form = new ActionFormData()
                .title(lang === "es_ES" ? "📈 Estadísticas Detalladas" : "📈 Detailed Statistics")
                .body(body)
                .button(lang === "es_ES" ? "📊 Ver Gráfico de Actividad" : "📊 View Activity Chart", "textures/ui/icon_best3.png")
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                if (response.selection === 0) {
                    this.showActivityChart(adminPlayer, playerName);
                } else {
                    this.showPlayerDetails(adminPlayer, playerName);
                }
            });
        } catch (e) {
            console.error("Error en showPlayerStatistics: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar estadísticas." : "§cError showing statistics.");
        }
    }

    // --- Activity Chart ---
    showActivityChart(adminPlayer, playerName) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showActivityChart: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const logs = this.obtenerLogsJugador(playerName);
            
            const activityByDate = {};
            logs.forEach(log => {
                const date = log.fecha;
                if (!activityByDate[date]) activityByDate[date] = 0;
                activityByDate[date]++;
            });

            const dates = Object.keys(activityByDate).sort().slice(-7);
            const maxActivity = Math.max(...Object.values(activityByDate), 1);

            let chartBody = lang === "es_ES" ? 
                `§e📊 Actividad de los últimos 7 días\n§7${playerName}\n\n` :
                `§e📊 Activity for the last 7 days\n§7${playerName}\n\n`;

            dates.forEach(date => {
                const activity = activityByDate[date];
                const barLength = Math.ceil((activity / maxActivity) * 20);
                const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
                chartBody += `§7${date}: §b${bar} §e${activity}\n`;
            });

            const form = new ActionFormData()
                .title(lang === "es_ES" ? "📊 Gráfico de Actividad" : "📊 Activity Chart")
                .body(chartBody)
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then(() => {
                this.showPlayerStatistics(adminPlayer, playerName);
            });
        } catch (e) {
            console.error("Error en showActivityChart: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar gráfico de actividad." : "§cError showing activity chart.");
        }
    }

    // --- Admin Actions ---
    showAdminActions(adminPlayer, playerName) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showAdminActions: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const targetPlayer = world.getPlayers().find(p => p.nameTag === playerName);
            
            if (!targetPlayer || !(targetPlayer instanceof Player)) {
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    "§cEl jugador no está en línea." : 
                    "§cPlayer is not online.");
                this.showPlayerDetails(adminPlayer, playerName);
                return;
            }

            const form = new ActionFormData()
                .title(lang === "es_ES" ? `⚡ Acciones Admin - ${playerName}` : `⚡ Admin Actions - ${playerName}`)
                .body(lang === "es_ES" ? 
                    "Selecciona una acción administrativa:" : 
                    "Select an administrative action:")
                .button(lang === "es_ES" ? "📦 Ver Inventario" : "📦 View Inventory", "textures/ui/icon_armor.png")
                .button(lang === "es_ES" ? "📍 Teletransportarse" : "📍 Teleport To", "textures/ui/icon_location.png")
                .button(lang === "es_ES" ? "📨 Enviar Mensaje" : "📨 Send Message", "textures/ui/icon_book_writable.png")
                .button(lang === "es_ES" ? "⚠️ Advertir" : "⚠️ Warn", "textures/ui/icon_warning.png")
                .button(lang === "es_ES" ? "🚫 Kickear" : "🚫 Kick", "textures/ui/icon_cancel.png")
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                switch (response.selection) {
                    case 0: this.showPlayerInventory(adminPlayer, targetPlayer); break;
                    case 1: 
                        adminPlayer.runCommand(`tp @s ${targetPlayer.location.x} ${targetPlayer.location.y} ${targetPlayer.location.z}`);
                        adminPlayer.sendMessage(lang === "es_ES" ? 
                            `§aTe has teletransportado a ${playerName}.` : 
                            `§aYou have teleported to ${playerName}.`);
                        break;
                    case 2: this.showSendMessageForm(adminPlayer, targetPlayer); break;
                    case 3: this.showWarnPlayerForm(adminPlayer, targetPlayer); break;
                    case 4: this.showKickPlayerForm(adminPlayer, targetPlayer); break;
                    case 5: this.showPlayerDetails(adminPlayer, playerName); break;
                }
            });
        } catch (e) {
            console.error("Error en showAdminActions: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar acciones admin." : "§cError showing admin actions.");
        }
    }

    // --- Admin Action Forms ---
    showPlayerInventory(adminPlayer, targetPlayer) {
        try {
            if (!(adminPlayer instanceof Player) || !(targetPlayer instanceof Player)) {
                console.warn("Jugadores inválidos en showPlayerInventory: ", {
                    adminPlayer: adminPlayer?.nameTag || "undefined",
                    targetPlayer: targetPlayer?.nameTag || "undefined"
                });
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const inventory = targetPlayer.getComponent("minecraft:inventory")?.container;
            if (!inventory) {
                adminPlayer.sendMessage(lang === "es_ES" ? "§cNo se pudo acceder al inventario." : "§cCould not access inventory.");
                this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                return;
            }

            let body = lang === "es_ES" ? `§eInventario de ${targetPlayer.nameTag}\n\n` : `§eInventory of ${targetPlayer.nameTag}\n\n`;
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (item) {
                    body += `§7${i + 1}. §b${item.typeId} §7(x${item.amount})\n`;
                }
            }

            const form = new ActionFormData()
                .title(lang === "es_ES" ? "📦 Inventario" : "📦 Inventory")
                .body(body || (lang === "es_ES" ? "§7Inventario vacío" : "§7Empty inventory"))
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then(() => {
                this.showAdminActions(adminPlayer, targetPlayer.nameTag);
            });
        } catch (e) {
            console.error("Error en showPlayerInventory: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar inventario." : "§cError showing inventory.");
        }
    }

    showSendMessageForm(adminPlayer, targetPlayer) {
        try {
            if (!(adminPlayer instanceof Player) || !(targetPlayer instanceof Player)) {
                console.warn("Jugadores inválidos en showSendMessageForm: ", {
                    adminPlayer: adminPlayer?.nameTag || "undefined",
                    targetPlayer: targetPlayer?.nameTag || "undefined"
                });
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const form = new ModalFormData()
                .title(lang === "es_ES" ? "📨 Enviar Mensaje" : "📨 Send Message")
                .textField(
                    lang === "es_ES" ? "Mensaje:" : "Message:", 
                    lang === "es_ES" ? "Escribe tu mensaje..." : "Type your message..."
                );

            form.show(adminPlayer).then((response) => {
                if (response.canceled) {
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                const message = response.formValues[0];
                if (typeof message !== "string" || message.trim() === "") {
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        "§cDebes ingresar un mensaje válido." : 
                        "§cYou must enter a valid message.");
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                targetPlayer.sendMessage(`§e[Admin] ${adminPlayer.nameTag}: §f${message}`);
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    `§aMensaje enviado a ${targetPlayer.nameTag}.` : 
                    `§aMessage sent to ${targetPlayer.nameTag}.`);
                this.showAdminActions(adminPlayer, targetPlayer.nameTag);
            });
        } catch (e) {
            console.error("Error en showSendMessageForm: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al enviar mensaje." : "§cError sending message.");
        }
    }

    showWarnPlayerForm(adminPlayer, targetPlayer) {
        try {
            if (!(adminPlayer instanceof Player) || !(targetPlayer instanceof Player)) {
                console.warn("Jugadores inválidos en showWarnPlayerForm: ", {
                    adminPlayer: adminPlayer?.nameTag || "undefined",
                    targetPlayer: targetPlayer?.nameTag || "undefined"
                });
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const form = new ModalFormData()
                .title(lang === "es_ES" ? "⚠️ Advertir Jugador" : "⚠️ Warn Player")
                .textField(
                    lang === "es_ES" ? "Razón de la advertencia:" : "Warning reason:", 
                    lang === "es_ES" ? "Escribe la razón..." : "Type the reason..."
                );

            form.show(adminPlayer).then((response) => {
                if (response.canceled) {
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                const reason = response.formValues[0];
                if (typeof reason !== "string" || reason.trim() === "") {
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        "§cDebes ingresar una razón válida." : 
                        "§cYou must enter a valid reason.");
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                targetPlayer.sendMessage(`§c⚠️ ADVERTENCIA: ${reason}`);
                world.sendMessage(`§e${adminPlayer.nameTag} §7advirtió a §e${targetPlayer.nameTag}§7: §c${reason}`);
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    `§aAdvertencia enviada a ${targetPlayer.nameTag}.` : 
                    `§aWarning sent to ${targetPlayer.nameTag}.`);
                this.showAdminActions(adminPlayer, targetPlayer.nameTag);
            });
        } catch (e) {
            console.error("Error en showWarnPlayerForm: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al advertir al jugador." : "§cError warning player.");
        }
    }

    showKickPlayerForm(adminPlayer, targetPlayer) {
        try {
            if (!(adminPlayer instanceof Player) || !(targetPlayer instanceof Player)) {
                console.warn("Jugadores inválidos en showKickPlayerForm: ", {
                    adminPlayer: adminPlayer?.nameTag || "undefined",
                    targetPlayer: targetPlayer?.nameTag || "undefined"
                });
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const form = new ModalFormData()
                .title(lang === "es_ES" ? "🚫 Kickear Jugador" : "🚫 Kick Player")
                .textField(
                    lang === "es_ES" ? "Razón del kick:" : "Kick reason:", 
                    lang === "es_ES" ? "Escribe la razón..." : "Type the reason..."
                )
                .toggle(
                    lang === "es_ES" ? "Confirmar kick" : "Confirm kick", 
                    false
                );

            form.show(adminPlayer).then((response) => {
                if (response.canceled) {
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                const [reason, confirm] = response.formValues;
                if (typeof reason !== "string" || reason.trim() === "") {
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        "§cDebes ingresar una razón válida." : 
                        "§cYou must enter a valid reason.");
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                if (!confirm) {
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        "§cDebes confirmar el kick." : 
                        "§cYou must confirm the kick.");
                    this.showAdminActions(adminPlayer, targetPlayer.nameTag);
                    return;
                }
                world.sendMessage(`§c${targetPlayer.nameTag} §7fue kickeado por §e${adminPlayer.nameTag}§7: §c${reason}`);
                try {
                    targetPlayer.runCommand(`kick "${targetPlayer.nameTag}" ${reason}`);
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        `§a${targetPlayer.nameTag} ha sido kickeado.` : 
                        `§a${targetPlayer.nameTag} has been kicked.`);
                } catch (kickError) {
                    console.error("Error al kickear al jugador: ", kickError.message, kickError.stack);
                    adminPlayer.sendMessage(lang === "es_ES" ? 
                        `§cError al kickear a ${targetPlayer.nameTag}.` : 
                        `§cError kicking ${targetPlayer.nameTag}.`);
                }
                this.showAdminActions(adminPlayer, targetPlayer.nameTag);
            });
        } catch (e) {
            console.error("Error en showKickPlayerForm: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al kickear al jugador." : "§cError kicking player.");
        }
    }

    // --- Search Results ---
    showSearchResults(adminPlayer, results, searchTitle) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showSearchResults: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            if (results.length === 0) {
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    "§cNo se encontraron resultados." : 
                    "§cNo results found.");
                this.showMainAdminMenu(adminPlayer);
                return;
            }

            const form = new ActionFormData()
                .title(lang === "es_ES" ? `🔍 Resultados: ${searchTitle}` : `🔍 Results: ${searchTitle}`)
                .body(lang === "es_ES" ? 
                    `§7Se encontraron §b${results.length}§7 jugadores:` : 
                    `§7Found §b${results.length}§7 players:`);

            results.forEach(playerName => {
                const logs = this.obtenerLogsJugador(playerName);
                const isOnline = world.getPlayers().some(p => p.nameTag === playerName);
                const statusIcon = isOnline ? "🟢" : "🔴";
                const lastActivity = logs.length > 0 ? logs[logs.length - 1] : null;
                const lastActivityText = lastActivity ? 
                    `${lastActivity.fecha} ${lastActivity.hora}` : 
                    (lang === "es_ES" ? "Sin actividad" : "No activity");
                form.button(
                    `${statusIcon} §e${playerName}\n§7Eventos: §b${logs.length} §7| Última: §8${lastActivityText}`,
                    "textures/ui/icon_armor.png"
                );
            });

            form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                if (response.selection < results.length) {
                    const selectedPlayer = results[response.selection];
                    this.showPlayerDetails(adminPlayer, selectedPlayer);
                } else {
                    this.showMainAdminMenu(adminPlayer);
                }
            });
        } catch (e) {
            console.error("Error en showSearchResults: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar resultados de búsqueda." : "§cError showing search results.");
        }
    }

    showAdvancedSearchResults(adminPlayer, results, filters) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showAdvancedSearchResults: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            if (results.length === 0) {
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    "§cNo se encontraron resultados con los filtros aplicados." : 
                    "§cNo results found with the applied filters.");
                this.showAdvancedSearch(adminPlayer);
                return;
            }

            const playerResults = {};
            results.forEach(log => {
                if (!playerResults[log.jugador]) playerResults[log.jugador] = [];
                playerResults[log.jugador].push(log);
            });

            const playerNames = Object.keys(playerResults);
            const form = new ActionFormData()
                .title(lang === "es_ES" ? "🔍 Resultados Avanzados" : "🔍 Advanced Results")
                .body(lang === "es_ES" ? 
                    `§7Se encontraron §b${results.length}§7 eventos de §b${playerNames.length}§7 jugadores:` : 
                    `§7Found §b${results.length}§7 events from §b${playerNames.length}§7 players:`);

            playerNames.forEach(playerName => {
                const playerLogs = playerResults[playerName];
                const isOnline = world.getPlayers().some(p => p.nameTag === playerName);
                const statusIcon = isOnline ? "🟢" : "🔴";
                form.button(
                    `${statusIcon} §e${playerName}\n§7Eventos encontrados: §b${playerLogs.length}`,
                    "textures/ui/icon_armor.png"
                );
            });

            form.button(lang === "es_ES" ? "🔍 Nueva Búsqueda" : "🔍 New Search", "textures/ui/magnifyingGlass.png");
            form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                if (response.selection < playerNames.length) {
                    const selectedPlayer = playerNames[response.selection];
                    this.showPlayerDetails(adminPlayer, selectedPlayer, 1, filters.tipo);
                } else if (response.selection === playerNames.length) {
                    this.showAdvancedSearch(adminPlayer);
                } else {
                    this.showMainAdminMenu(adminPlayer);
                }
            });
        } catch (e) {
            console.error("Error en showAdvancedSearchResults: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar resultados avanzados." : "§cError showing advanced search results.");
        }
    }

    // --- Server Statistics ---
    showStatistics(adminPlayer) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showStatistics: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const playerNames = Object.keys(playerLogs);
            
            if (playerNames.length === 0) {
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    "§cNo hay datos para mostrar estadísticas." : 
                    "§cNo data available for statistics.");
                this.showMainAdminMenu(adminPlayer);
                return;
            }

            let totalEvents = 0;
            let totalConnections = 0;
            let totalDeaths = 0;
            let totalPvpKills = 0;
            let onlinePlayers = 0;
            const eventTypeCounts = {};

            playerNames.forEach(playerName => {
                const logs = playerLogs[playerName];
                totalEvents += logs.length;
                if (world.getPlayers().some(p => p.nameTag === playerName)) onlinePlayers++;
                logs.forEach(log => {
                    if (!eventTypeCounts[log.tipo]) eventTypeCounts[log.tipo] = 0;
                    eventTypeCounts[log.tipo]++;
                    if (log.tipo === "conexion") totalConnections++;
                    if (log.tipo === "muerte") totalDeaths++;
                    if (log.tipo === "elimino_jugador") totalPvpKills++;
                });
            });

            const mostActivePlayer = playerNames.reduce((max, current) => 
                playerLogs[current].length > playerLogs[max].length ? current : max, playerNames[0] || "");

            let body = lang === "es_ES" ? 
                `§e📈 Estadísticas Generales del Servidor\n\n` +
                `§7Total de jugadores registrados: §b${playerNames.length}\n` +
                `§7Jugadores en línea: §a${onlinePlayers}\n` +
                `§7Total de eventos: §b${totalEvents}\n` +
                `§7Total de conexiones: §a${totalConnections}\n` +
                `§7Total de muertes: §c${totalDeaths}\n` +
                `§7Total de eliminaciones PvP: §6${totalPvpKills}\n` +
                `§7Jugador más activo: §e${mostActivePlayer} §7(${playerLogs[mostActivePlayer]?.length || 0} eventos)\n\n` +
                `§e📊 Eventos más comunes:\n` :
                `§e📈 General Server Statistics\n\n` +
                `§7Total registered players: §b${playerNames.length}\n` +
                `§7Players online: §a${onlinePlayers}\n` +
                `§7Total events: §b${totalEvents}\n` +
                `§7Total connections: §a${totalConnections}\n` +
                `§7Total deaths: §c${totalDeaths}\n` +
                `§7Total PvP kills: §6${totalPvpKills}\n` +
                `§7Most active player: §e${mostActivePlayer} §7(${playerLogs[mostActivePlayer]?.length || 0} events)\n\n` +
                `§e📊 Most common events:\n`;

            const sortedEvents = Object.entries(eventTypeCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);

            sortedEvents.forEach(([eventType, count], index) => {
                const translatedType = this.translateEventType(eventType, lang);
                body += `§7${index + 1}. ${translatedType}: §b${count}\n`;
            });

            const form = new ActionFormData()
                .title(lang === "es_ES" ? "📈 Estadísticas del Servidor" : "📈 Server Statistics")
                .body(body)
                .button(lang === "es_ES" ? "📊 Top Jugadores" : "📊 Top Players", "textures/ui/icon_best3.png")
                .button(lang === "es_ES" ? "📈 Actividad por Fecha" : "📈 Activity by Date", "textures/ui/icon_book_writable.png")
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                switch (response.selection) {
                    case 0: this.showTopPlayers(adminPlayer); break;
                    case 1: this.showActivityByDate(adminPlayer); break;
                    case 2: this.showMainAdminMenu(adminPlayer); break;
                }
            });
        } catch (e) {
            console.error("Error en showStatistics: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? "§cError al mostrar estadísticas del servidor." : "§cError showing server statistics.");
        }
    }

    // --- Top Players ---
    showTopPlayers(adminPlayer, page = 1) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showTopPlayers: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const playerNames = Object.keys(playerLogs);
            
            if (playerNames.length === 0) {
                adminPlayer.sendMessage(lang === "es_ES" ? 
                    "§cNo hay jugadores registrados para mostrar." : 
                    "§cNo players registered to display.");
                this.showStatistics(adminPlayer);
                return;
            }

            const sortedPlayers = playerNames
                .map(name => ({
                    name,
                    totalEvents: playerLogs[name].length,
                    isOnline: world.getPlayers().some(p => p.nameTag === name),
                    lastActivity: playerLogs[name].length > 0 ? playerLogs[name][playerLogs[name].length - 1] : null
                }))
                .sort((a, b) => b.totalEvents - a.totalEvents);

            const totalPages = Math.ceil(sortedPlayers.length / this.itemsPerPage);
            const currentPage = Math.max(1, Math.min(page, totalPages));
            const startIndex = (currentPage - 1) * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, sortedPlayers.length);
            const pageItems = sortedPlayers.slice(startIndex, endIndex);

            const form = new ActionFormData()
                .title(lang === "es_ES" ? 
                    `§e📊 Top Jugadores (${currentPage}/${totalPages})` : 
                    `§e📊 Top Players (${currentPage}/${totalPages})`)
                .body(lang === "es_ES" ? 
                    `§7Mostrando los jugadores más activos\n§7Total de jugadores: §b${sortedPlayers.length}\n§7Página ${currentPage} de ${totalPages}` :
                    `§7Showing the most active players\n§7Total players: §b${sortedPlayers.length}\n§7Page ${currentPage} of ${totalPages}`);

            pageItems.forEach((player, index) => {
                const statusIcon = player.isOnline ? "🟢" : "🔴";
                const lastActivityText = player.lastActivity ? 
                    `${player.lastActivity.fecha} ${player.lastActivity.hora}` : 
                    (lang === "es_ES" ? "Sin actividad" : "No activity");
                form.button(
                    `§e${startIndex + index + 1}. ${statusIcon} ${player.name}\n§7Eventos: §b${player.totalEvents} §7| Última: §8${lastActivityText}`,
                    "textures/ui/icon_armor.png"
                );
            });

            if (currentPage > 1) form.button(lang === "es_ES" ? "⬅️ Página Anterior" : "⬅️ Previous Page", "textures/ui/arrow_left.png");
            if (currentPage < totalPages) form.button(lang === "es_ES" ? "➡️ Página Siguiente" : "➡️ Next Page", "textures/ui/arrow_right.png");
                                  form.button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then((response) => {
                if (response.canceled) return;
                let buttonIndex = response.selection;
                if (buttonIndex < pageItems.length) {
                    const selectedPlayer = pageItems[buttonIndex].name;
                    this.showPlayerDetails(adminPlayer, selectedPlayer);
                    return;
                }
                buttonIndex -= pageItems.length;
                if (currentPage > 1 && buttonIndex === 0) {
                    this.showTopPlayers(adminPlayer, currentPage - 1);
                } else if (currentPage < totalPages && buttonIndex === (currentPage > 1 ? 1 : 0)) {
                    this.showTopPlayers(adminPlayer, currentPage + 1);
                } else {
                    this.showStatistics(adminPlayer);
                }
            });
        } catch (e) {
            console.error("Error en showTopPlayers: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? 
                "§cError al mostrar top de jugadores." : 
                "§cError showing top players.");
        }
    }

    // --- Activity by Date ---
    showActivityByDate(adminPlayer) {
        try {
            if (!(adminPlayer instanceof Player)) {
                console.warn("adminPlayer no es válido en showActivityByDate: ", adminPlayer?.nameTag || "undefined");
                return;
            }
            const lang = this.getPlayerLanguage(adminPlayer);
            const activityByDate = {};
            
            Object.values(playerLogs).flat().forEach(log => {
                if (!activityByDate[log.fecha]) activityByDate[log.fecha] = 0;
                activityByDate[log.fecha]++;
            });

            const dates = Object.keys(activityByDate).sort().slice(-7);
            const maxActivity = Math.max(...Object.values(activityByDate), 1);

            let body = lang === "es_ES" ? 
                `§e📈 Actividad por Fecha (Últimos 7 días)\n\n` :
                `§e📈 Activity by Date (Last 7 days)\n\n`;

            dates.forEach(date => {
                const activity = activityByDate[date];
                const barLength = Math.ceil((activity / maxActivity) * 20);
                const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
                body += `§7${date}: §b${bar} §e${activity}\n`;
            });

            const form = new ActionFormData()
                .title(lang === "es_ES" ? "📈 Actividad por Fecha" : "📈 Activity by Date")
                .body(body || (lang === "es_ES" ? "§7No hay datos de actividad." : "§7No activity data."))
                .button(lang === "es_ES" ? "§c❌ Volver" : "§c❌ Back", "textures/ui/arrow_left.png");

            form.show(adminPlayer).then(() => {
                this.showStatistics(adminPlayer);
            });
        } catch (e) {
            console.error("Error en showActivityByDate: ", e.message, e.stack);
            adminPlayer.sendMessage(this.getPlayerLanguage(adminPlayer) === "es_ES" ? 
                "§cError al mostrar actividad por fecha." : 
                "§cError showing activity by date.");
        }
    }
}

// --- Initialize System ---
const playerLogSystem = new PlayerLogSystem();

// --- Command Handler ---
world.afterEvents.itemUse.subscribe(event => {
    try {
        const { itemStack, source } = event;
        if (!(source instanceof Player) || !source.hasTag("admin") || itemStack.typeId !== "minecraft:clock") return;
        playerLogSystem.showMainAdminMenu(source);
    } catch (e) {
        console.error("Error en manejador itemUse (comando): ", e.message, e.stack);
    }
});

export { playerLogSystem };