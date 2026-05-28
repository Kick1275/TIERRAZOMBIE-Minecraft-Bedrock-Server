import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { progressMission } from "./DailyMissions.js";

// Extracciones en progreso (playerId -> { ticks, maxTicks, startX, startY, startZ, startHealth, entityId })
const extracting = new Map();

// Cooldown por máquina (entityId -> tickTimestamp cuando termina el cooldown)
const machineCooldown = new Map();
const COOLDOWN_TICKS = 100; // 5 segundos
let globalTick = 0;

const EXTRACT_TICKS = 100; // 5 segundos
const BAR_LENGTH = 20;
const PROP_PREFIX  = "em_dest:";   // destino: em_dest:<entityId>
const PROP_RADIUS  = "em_radius:"; // radio:   em_radius:<entityId>
const DEFAULT_RADIUS = 7;

function getRadius(entityId) {
    try {
        const r = world.getDynamicProperty(PROP_RADIUS + entityId);
        return typeof r === "number" ? r : DEFAULT_RADIUS;
    } catch { return DEFAULT_RADIUS; }
}

function setRadius(entityId, radius) {
    world.setDynamicProperty(PROP_RADIUS + entityId, radius);
}

function buildBar(progress) {
    const filled = Math.floor(progress * BAR_LENGTH);
    const empty = BAR_LENGTH - filled;
    return "§a" + "█".repeat(filled) + "§8" + "█".repeat(empty);
}

// Lee destino desde dynamic properties
function getDest(entityId) {
    try {
        const raw = world.getDynamicProperty(PROP_PREFIX + entityId);
        return raw ? JSON.parse(raw) : { x: -1241.69, y: 80.00, z: -87.01, dim: "overworld" };
    } catch { return { x: -1241.69, y: 80.00, z: -87.01, dim: "overworld" }; }
}

// Guarda destino en dynamic properties
function setDest(entityId, dest) {
    world.setDynamicProperty(PROP_PREFIX + entityId, JSON.stringify(dest));
}

// Menú principal
async function showExtractionMenu(player, entity) {
    const isAdmin = player.hasTag("admin");
    const dest = getDest(entity.id);
    const destText = dest
        ? `§7Destino: §e${dest.x}, ${dest.y}, ${dest.z} §7(${dest.dim})`
        : `§7Destino: §e-1241.69, 80.00, -87.01 §7(overworld) §8[default]`;

    const form = new ActionFormData()
        .title("§l§6Extraction Machine")
        .body(`${destText}\n\n§7Inicia la extracción para ser evacuado.`)
        .button("§l§aExtraer\n§r§7Iniciar cuenta regresiva");

    if (isAdmin) form.button("§l§bConfigurar destino\n§r§7[Admin]");
    if (isAdmin) form.button("§l§eConfigurar radio\n§r§7[Admin]");
    form.button("§8Cerrar");

    const res = await form.show(player);
    if (res.canceled) return;

    if (res.selection === 0) {
        startExtraction(player, entity);
    } else if (isAdmin && res.selection === 1) {
        showAdminConfig(player, entity);
    } else if (isAdmin && res.selection === 2) {
        showAdminRadius(player, entity);
    }
}

// Menú admin — radio de extracción
async function showAdminRadius(player, entity) {
    const current = getRadius(entity.id);
    const res = await new ModalFormData()
        .title("§l§eConfigurar Radio")
        .textField("Radio de extracción (bloques)", "ej: 7", { defaultValue: String(current) })
        .show(player);

    if (res.canceled) return;
    const r = parseInt(res.formValues[0]);
    if (isNaN(r) || r < 1 || r > 50) {
        player.sendMessage("§cRadio inválido. Usa un número entre 1 y 50.");
        return;
    }
    setRadius(entity.id, r);
    player.sendMessage(`§a✓ Radio configurado: §e${r} §7bloques`);
}

// Menú admin — un solo campo para coords + dropdown de dimensión
async function showAdminConfig(player, entity) {
    const current = getDest(entity.id) ?? { x: -1241.69, y: 80.00, z: -87.01, dim: "overworld" };
    const currentCoords = `${current.x} ${current.y} ${current.z}`;
    const dims = ["overworld", "nether", "the_end"];

    const res = await new ModalFormData()
        .title("§l§bConfigurar Destino")
        .textField("Coordenadas  (x y z)", "ej: 100 64 -200", { defaultValue: currentCoords })
        .dropdown("Dimensión", dims, { defaultValueIndex: dims.indexOf(current.dim) })
        .show(player);

    if (res.canceled) return;

    const [coordStr, dimIdx] = res.formValues;
    const parts = coordStr.trim().split(/\s+/);

    if (parts.length !== 3) {
        player.sendMessage("§cFormato inválido. Usa: x y z  (ej: 100 64 -200)");
        return;
    }

    const [x, y, z] = parts.map(Number);
    if ([x, y, z].some(isNaN)) {
        player.sendMessage("§cCoordenadas inválidas.");
        return;
    }

    const dim = dims[dimIdx] ?? "overworld";
    setDest(entity.id, { x, y, z, dim });
    player.sendMessage(`§a✓ Destino configurado: §e${x}, ${y}, ${z} §7(${dim})`);
}

// Inicia extracción
function startExtraction(player, entity) {
    const dest = getDest(entity.id);
    if (!dest) {
        player.sendMessage("§cEsta máquina no tiene destino configurado. Pide a un admin que la configure.");
        return;
    }

    // Verificar cooldown de la máquina
    const cooldownEnd = machineCooldown.get(entity.id) ?? 0;
    if (globalTick < cooldownEnd) {
        const secsLeft = Math.ceil((cooldownEnd - globalTick) / 20);
        player.sendMessage(`§c[Extracción] La máquina está en enfriamiento. §e${secsLeft}s §crestantes.`);
        return;
    }

    if (extracting.has(player.id)) {
        player.sendMessage("§eYa tienes una extracción en progreso.");
        return;
    }

    const pos = player.location;
    extracting.set(player.id, {
        ticks: 0,
        maxTicks: EXTRACT_TICKS,
        startX: Math.floor(pos.x),
        startY: Math.floor(pos.y),
        startZ: Math.floor(pos.z),
        startHealth: player.getComponent("minecraft:health").currentValue,
        entityId: entity.id
    });

    player.sendMessage("§6[Extracción] §eNo te muevas ni recibas daño...");
    player.onScreenDisplay.setTitle("§eExtrayendo...", { subtitle: buildBar(0) + " §e0%", fadeInDuration: 0, stayDuration: 40, fadeOutDuration: 0 });
    player.runCommand("playsound extractor @s");
    player.runCommand("playsound extracting @a[r=25]");
}

// Cancela extracción
function cancelExtraction(player, reason) {
    extracting.delete(player.id);
    player.onScreenDisplay.setTitle(" ", { subtitle: "§c✗ Extracción cancelada: " + reason, fadeInDuration: 0, stayDuration: 60, fadeOutDuration: 20 });
    player.sendMessage("§c[Extracción] Cancelada: " + reason);
}

// Función de extracción individual
function doExtract(player, dest, entityId = null) {
    const wasInMap = player.hasTag("gm:in_map");
    const mapId    = player.getDynamicProperty("gm:mapId");

    // ── Misiones de extracción (antes de quitar el tag) ──────────────────────
    if (wasInMap) {
        try {
            progressMission(player, "extractions", 1);
            progressMission(player, "refuge_returns", 1);
            if (mapId) progressMission(player, "extractions_map", 1, { map: mapId });

            const inv = player.getComponent("minecraft:inventory")?.container;
            if (inv) {
                let hasBloodBag = false, itemCount = 0;
                for (let i = 0; i < inv.size; i++) {
                    const item = inv.getItem(i);
                    if (!item) continue;
                    itemCount += item.amount ?? 1;
                    if (item.typeId.startsWith("mcpe:blood_bag")) hasBloodBag = true;
                }
                if (hasBloodBag) progressMission(player, "extractions_bloodbag", 1);
                if (itemCount >= 15) progressMission(player, "extractions_15items", 1);
            }

            // Streak
            const prog = player.getDynamicProperty("dm:extstreak");
            const streakData = prog ? JSON.parse(prog) : { count: 0 };
            streakData.count = (streakData.count ?? 0) + 1;
            player.setDynamicProperty("dm:extstreak", JSON.stringify(streakData));
            if (streakData.count >= 3) progressMission(player, "extraction_streak", 1);

            // Team extraction
            try {
                const teams = JSON.parse(world.getDynamicProperty("gm:teams") ?? "{}");
                for (const [oid, t] of Object.entries(teams)) {
                    if (oid === player.id || t.members?.includes(player.id)) {
                        progressMission(player, "team_extractions", 1);
                        break;
                    }
                }
            } catch {}
        } catch (e) { console.warn("[ExtractionMachine] mission error: " + e); }
    }

    // ── Teleport ──────────────────────────────────────────────────────────────
    player.removeTag("gm:in_map");
    player.removeTag("petro:in_map");
    player.setDynamicProperty("petro:mapId", undefined);
    player.runCommand("camera @s fade time 0.1 10 1");
    player.runCommand("stopsound @s");
    player.runCommand("playsound extraction @s");
    player.teleport(
        { x: dest.x, y: dest.y, z: dest.z },
        { dimension: world.getDimension(`minecraft:${dest.dim}`) }
    );
    player.onScreenDisplay.setTitle("§a§l§´Regresando a la Zona Segura", { subtitle: "§7Evacuación completada", fadeInDuration: 10, stayDuration: 60, fadeOutDuration: 20 });
    player.sendMessage("§a[Extracción] §f¡Evacuado exitosamente!");
    system.runTimeout(() => {
        try { player.runCommand("playsound safe.zone @s"); } catch {}
    }, 100);
}

// Tick loop
function tickExtraction() {
    globalTick++;
    for (const [playerId, data] of extracting) {
        let player;
        try { player = world.getAllPlayers().find(p => p.id === playerId); }
        catch { extracting.delete(playerId); continue; }

        if (!player) { extracting.delete(playerId); continue; }

        const pos = player.location;
        if (Math.abs(Math.floor(pos.x) - data.startX) > 1 ||
            Math.abs(Math.floor(pos.y) - data.startY) > 1 ||
            Math.abs(Math.floor(pos.z) - data.startZ) > 1) {
            cancelExtraction(player, "te moviste");
            continue;
        }

        const currentHealth = player.getComponent("minecraft:health").currentValue;
        if (currentHealth < data.startHealth - 0.5) {
            cancelExtraction(player, "recibiste daño");
            continue;
        }

        data.ticks++;
        const progress = data.ticks / data.maxTicks;
        const percent = Math.floor(progress * 100);
        player.onScreenDisplay.setTitle("§eExtrayendo...", { subtitle: buildBar(progress) + ` §e${percent}%`, fadeInDuration: 0, stayDuration: 40, fadeOutDuration: 0 });

        if (data.ticks >= data.maxTicks) {
            extracting.delete(playerId);
            const dest = getDest(data.entityId);
            if (!dest) { player.sendMessage("§cError: destino no encontrado."); continue; }
            try {
                // Teleportar al jugador principal
                doExtract(player, dest);

                // Extraer jugadores cercanos en radio de 7 bloques (solo al nivel o arriba de la máquina, máx 3 bloques arriba)
                const machinePos = (() => {
                    try {
                        const entities = player.dimension
                            .getEntities({ type: "dz:extraction_machine" });
                        return entities.find(e => e.id === data.entityId)?.location ?? player.location;
                    } catch { return player.location; }
                })();

                const radius = getRadius(data.entityId);
                const nearby = world.getAllPlayers().filter(p => {
                    if (p.id === player.id || extracting.has(p.id)) return false;
                    const dx = p.location.x - machinePos.x;
                    const dz = p.location.z - machinePos.z;
                    const dy = p.location.y - machinePos.y;
                    const horizDist = Math.sqrt(dx * dx + dz * dz);
                    return horizDist <= radius && dy >= 0 && dy <= 3;
                });
                for (const nearby_player of nearby) {
                    doExtract(nearby_player, dest);
                    nearby_player.sendMessage("§a[Extracción] §f¡Evacuado junto a tu equipo!");
                }

                // Activar cooldown en la máquina
                machineCooldown.set(data.entityId, globalTick + COOLDOWN_TICKS);

                // Notificar cooldown a jugadores cercanos
                if (nearby.length > 0) {
                    player.sendMessage(`§a[Extracción] §f¡Evacuados §e${nearby.length + 1} §fjugadores!`);
                }
            } catch (e) {
                player.sendMessage("§cError al teleportar: " + e);
            }
        }
    }
}

world.beforeEvents.playerInteractWithEntity.subscribe((ev) => {
    if (ev.target.typeId !== "dz:extraction_machine") return;
    ev.cancel = true;
    const player = ev.player;
    const target = ev.target;
    system.run(() => showExtractionMenu(player, target));
});

system.runInterval(() => tickExtraction(), 10);

console.warn("[ExtractionMachine] Sistema cargado");
