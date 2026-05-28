import { world, system } from "@minecraft/server";
import { WOOD_ZONES, MINE_FT_LOCATION, centerOf, getMineFTLocation } from "./MineConfig.js";
import { floatingTextSystem } from "../FloatingText/FloatingTextSystem.js";

const ftIds = new Map();

function getFTManager() {
    try {
        if (!floatingTextSystem.isInitialized()) floatingTextSystem.initialize();
        return floatingTextSystem.getManagers()?.floatingTextManager ?? null;
    } catch (_) { return null; }
}

// ─── Eliminar TODAS las entidades floating_text de MinePvP en el mundo ────────
function killAllMinePvPEntities() {
    // Método 1: eliminar via manager buscando por nombre interno
    const manager = getFTManager();
    if (manager) {
        try {
            const allFTs = manager.getAllFloatingTexts();
            for (const ft of allFTs) {
                if (ft.name && ft.name.startsWith("minepvp_")) {
                    try { manager.deleteFloatingText(ft.id); } catch (_) {}
                }
            }
        } catch (_) {}
    }

    // Método 2: kill directo por comando a todas las entidades floating_text en la zona de la mina
    try {
        const dim = world.getDimension("overworld");
        // Kill todas las plugs:floating_text en el área de la mina pvp
        dim.runCommand("kill @e[type=plugs:floating_text,x=-1523,y=-60,z=3070,dx=154,dy=163,dz=189]");
    } catch (_) {}
}

// ─── Eliminar un FT por ID del manager ───────────────────────────────────────
function deleteFTById(key) {
    const manager = getFTManager();
    const id = ftIds.get(key);
    if (id && manager) {
        try { manager.deleteFloatingText(id); } catch (_) {}
    }
    ftIds.delete(key);
}

// ─── Eliminar todos los FTs registrados en el manager ────────────────────────
function deleteAllRegisteredFTs() {
    const manager = getFTManager();
    if (manager) {
        for (const [key, id] of ftIds.entries()) {
            try { manager.deleteFloatingText(id); } catch (_) {}
        }
    }
    ftIds.clear();
}

// ─── Crear un FT nuevo ────────────────────────────────────────────────────────
function createFT(key, location, text) {
    const manager = getFTManager();
    if (!manager) return;
    try {
        const result = manager.createFloatingText({
            name: `minepvp_${key}`,
            location,
            lines: [{ text }],
            createdBy: "MinePvP"
        });
        if (result?.success) {
            ftIds.set(key, result.id);
        }
    } catch (e) {
        console.warn("[MinePvP] Error creando FT " + key + ": " + e);
    }
}

// ─── Actualizar texto de un FT existente (o recrear si falló) ─────────────────
function updateFT(key, location, text) {
    const manager = getFTManager();
    if (!manager) return;

    const existingId = ftIds.get(key);
    if (existingId) {
        const result = manager.updateFloatingText(existingId, { lines: [{ text }] });
        if (result?.success) return;
        // Falló — eliminar y recrear
        try { manager.deleteFloatingText(existingId); } catch (_) {}
        ftIds.delete(key);
    }

    createFT(key, location, text);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function updateWoodFT(zone, secondsRemaining) {
    const center = centerOf(zone);
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;
    const text = `§e§l${zone.name.toUpperCase()}\n§7Relleno en: §a${timeStr}`;
    updateFT(
        `wood_${zone.name}`,
        { x: center.x + 0.5, y: center.y + 2, z: center.z + 0.5 },
        text
    );
}

export function updateMineFT(secondsRemaining) {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;
    const text = `§c§l⛏ MINA PvP\n§7Regeneración en: §e${timeStr}`;
    updateFT("mine_countdown", getMineFTLocation(), text);
}

// ─── Inicializar: eliminar todo lo viejo y empezar limpio ─────────────────────
export function deleteAllMineFTs() {
    killAllMinePvPEntities();
    deleteAllRegisteredFTs();
}

export function initializeMineFTs() {
    system.runTimeout(() => {
        // 1. Eliminar entidades físicas en el mundo (huérfanos de reloads anteriores)
        killAllMinePvPEntities();

        // 2. Eliminar registros del manager
        deleteAllRegisteredFTs();

        console.warn("[MinePvP] Floating texts limpiados y listos.");
    }, 60); // Esperar más tiempo para que el FloatingTextSystem esté completamente listo
}
