import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { onPetroExtract } from "./DailyMissions.js";

const extracting = new Map();
const machineCooldown = new Map();
const COOLDOWN_MS = 5000;
const EXTRACT_TICKS = 100;
const BAR_LENGTH = 20;
const PROP_PREFIX = "em_dest:";
const PROP_RADIUS = "em_radius:";
const DEFAULT_RADIUS = 7;
let extractInterval = null;

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
    return "§a" + "█".repeat(filled) + "§8" + "█".repeat(BAR_LENGTH - filled);
}

function getDest(entityId) {
    try {
        const raw = world.getDynamicProperty(PROP_PREFIX + entityId);
        return raw ? JSON.parse(raw) : { x: 1600, y: 50, z: 1489, dim: "overworld" };
    } catch { return { x: 1600, y: 50, z: 1489, dim: "overworld" }; }
}

function setDest(entityId, dest) {
    world.setDynamicProperty(PROP_PREFIX + entityId, JSON.stringify(dest));
}

async function showExtractionMenu(player, entity) {
    const isAdmin = player.hasTag("admin");
    const dest = getDest(entity.id);
    const destText = `§7Destino: §e${dest.x}, ${dest.y}, ${dest.z} §7(${dest.dim})`;

    const form = new ActionFormData()
        .title("§l§6Extraction Machine")
        .body(`${destText}\n\n§7Solo disponible durante §6La Petro§7.`)
        .button("§l§aExtraer\n§r§7Iniciar cuenta regresiva");

    if (isAdmin) form.button("§l§bConfigurar destino\n§r§7[Admin]");
    if (isAdmin) form.button("§l§eConfigurar radio\n§r§7[Admin]");
    form.button("§8Cerrar");

    const res = await form.show(player);
    if (res.canceled) return;

    if (res.selection === 0) startExtraction(player, entity);
    else if (isAdmin && res.selection === 1) showAdminConfig(player, entity);
    else if (isAdmin && res.selection === 2) showAdminRadius(player, entity);
}

async function showAdminRadius(player, entity) {
    const res = await new ModalFormData()
        .title("§l§eConfigurar Radio")
        .textField("Radio de extracción (bloques)", "ej: 7", { defaultValue: String(getRadius(entity.id)) })
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

async function showAdminConfig(player, entity) {
    const current = getDest(entity.id);
    const dims = ["overworld", "nether", "the_end"];
    const res = await new ModalFormData()
        .title("§l§bConfigurar Destino")
        .textField("Coordenadas  (x y z)", "ej: 100 64 -200", { defaultValue: `${current.x} ${current.y} ${current.z}` })
        .dropdown("Dimensión", dims, { defaultValueIndex: dims.indexOf(current.dim) })
        .show(player);
    if (res.canceled) return;

    const parts = res.formValues[0].trim().split(/\s+/);
    if (parts.length !== 3) {
        player.sendMessage("§cFormato inválido. Usa: x y z");
        return;
    }
    const [x, y, z] = parts.map(Number);
    if ([x, y, z].some(isNaN)) {
        player.sendMessage("§cCoordenadas inválidas.");
        return;
    }
    setDest(entity.id, { x, y, z, dim: dims[res.formValues[1]] ?? "overworld" });
    player.sendMessage(`§a✓ Destino configurado: §e${x}, ${y}, ${z}`);
}

function ensureExtractLoop() {
    if (extractInterval !== null) return;
    extractInterval = system.runInterval(() => {
        if (extracting.size === 0) {
            system.clearRun(extractInterval);
            extractInterval = null;
            return;
        }
        tickExtraction();
    }, 10);
}

function startExtraction(player, entity) {
    if (!player.hasTag("petro:in_map")) {
        player.sendMessage("§cEsta máquina solo funciona durante el evento La Petro.");
        return;
    }

    const dest = getDest(entity.id);
    if (!dest) {
        player.sendMessage("§cEsta máquina no tiene destino configurado.");
        return;
    }

    const cooldownEnd = machineCooldown.get(entity.id) ?? 0;
    if (Date.now() < cooldownEnd) {
        const secsLeft = Math.ceil((cooldownEnd - Date.now()) / 1000);
        player.sendMessage(`§c[Extracción] Enfriamiento: §e${secsLeft}s`);
        return;
    }

    if (extracting.has(player.id)) {
        player.sendMessage("§eYa tienes una extracción en progreso.");
        return;
    }

    const pos = player.location;
    const machinePos = entity.location;
    extracting.set(player.id, {
        ticks: 0,
        maxTicks: EXTRACT_TICKS,
        startX: Math.floor(pos.x),
        startY: Math.floor(pos.y),
        startZ: Math.floor(pos.z),
        startHealth: player.getComponent("minecraft:health").currentValue,
        entityId: entity.id,
        machineX: machinePos.x,
        machineY: machinePos.y,
        machineZ: machinePos.z,
    });

    player.sendMessage("§6[Extracción] §eNo te muevas ni recibas daño...");
    player.onScreenDisplay.setTitle("§eExtrayendo...", { subtitle: buildBar(0) + " §e0%", fadeInDuration: 0, stayDuration: 40, fadeOutDuration: 0 });
    player.runCommand("playsound extractor @s");
    player.runCommand("playsound extracting @a[r=25]");
    ensureExtractLoop();
}

function cancelExtraction(player, reason) {
    extracting.delete(player.id);
    player.onScreenDisplay.setTitle(" ", { subtitle: "§c✗ Extracción cancelada: " + reason, fadeInDuration: 0, stayDuration: 60, fadeOutDuration: 20 });
    player.sendMessage("§c[Extracción] Cancelada: " + reason);
}

function doExtract(player, dest) {
    player.removeTag("gm:in_open_world");
    player.removeTag("petro:in_map");
    player.setDynamicProperty("gm:mapId", undefined);
    player.setDynamicProperty("petro:mapId", undefined);
    player.runCommand("camera @s fade time 0.1 10 1");
    player.runCommand("stopsound @s");
    player.runCommand("playsound extraction @s");
    player.teleport(
        { x: dest.x, y: dest.y, z: dest.z },
        { dimension: world.getDimension(`minecraft:${dest.dim}`) }
    );
    player.onScreenDisplay.setTitle("§a§lRegresando a la Zona Segura", { subtitle: "§7Evacuación completada", fadeInDuration: 10, stayDuration: 60, fadeOutDuration: 20 });
    player.sendMessage("§a[Extracción] §f¡Evacuado exitosamente!");
    system.runTimeout(() => { try { player.runCommand("playsound safe.zone @s"); } catch {} }, 100);
    try { onPetroExtract(player); } catch {}
}

function tickExtraction() {
    for (const [playerId, data] of extracting) {
        const player = world.getAllPlayers().find(p => p.id === playerId);
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
        player.onScreenDisplay.setTitle("§eExtrayendo...", {
            subtitle: buildBar(progress) + ` §e${Math.floor(progress * 100)}%`,
            fadeInDuration: 0, stayDuration: 40, fadeOutDuration: 0,
        });

        if (data.ticks < data.maxTicks) continue;

        extracting.delete(playerId);
        const dest = getDest(data.entityId);
        if (!dest) { player.sendMessage("§cError: destino no encontrado."); continue; }

        try {
            doExtract(player, dest);

            const radius = getRadius(data.entityId);
            const nearby = world.getAllPlayers().filter(p => {
                if (p.id === player.id || extracting.has(p.id) || !p.hasTag("petro:in_map")) return false;
                const dx = p.location.x - data.machineX;
                const dz = p.location.z - data.machineZ;
                const dy = p.location.y - data.machineY;
                return dx * dx + dz * dz <= radius * radius && dy >= 0 && dy <= 3;
            });

            for (const ally of nearby) {
                doExtract(ally, dest);
                ally.sendMessage("§a[Extracción] §f¡Evacuado junto a tu equipo!");
            }

            machineCooldown.set(data.entityId, Date.now() + COOLDOWN_MS);
            if (nearby.length > 0) {
                player.sendMessage(`§a[Extracción] §f¡Evacuados §e${nearby.length + 1} §fjugadores!`);
            }
        } catch (e) {
            player.sendMessage("§cError al teleportar: " + e);
        }
    }
}

world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    if (ev.target.typeId !== "dz:extraction_machine") return;
    ev.cancel = true;
    system.run(() => showExtractionMenu(ev.player, ev.target));
});

console.warn("[ExtractionMachine] v2 lite cargado");
