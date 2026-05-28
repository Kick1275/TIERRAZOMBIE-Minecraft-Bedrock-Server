import { world, system } from "@minecraft/server";
import { WOOD_ZONES, WOOD_REFILL_TICKS, centerOf } from "./MineConfig.js";
import { updateWoodFT } from "./MineFloatingText.js";

// Ticks restantes para cada zona de madera
const woodTimers = new Map(); // zoneName -> ticksRemaining

// ─── Rellenar una zona con su tipo de madera ──────────────────────────────────
function refillZone(zone) {
    try {
        const dim = world.getDimension("overworld");
        const minX = Math.min(zone.minX, zone.maxX);
        const maxX = Math.max(zone.minX, zone.maxX);
        const minY = Math.min(zone.minY, zone.maxY);
        const maxY = Math.max(zone.minY, zone.maxY);
        const minZ = Math.min(zone.minZ, zone.maxZ);
        const maxZ = Math.max(zone.minZ, zone.maxZ);
        dim.runCommand(
            `fill ${minX} ${minY} ${minZ} ${maxX} ${maxY} ${maxZ} ${zone.block}`
        );
    } catch (e) {
        console.warn("[MinePvP] Error rellenando zona " + zone.name + ": " + e);
    }
}

// ─── Inicializar timers de madera ─────────────────────────────────────────────
export function initializeWoodZones() {
    for (const zone of WOOD_ZONES) {
        woodTimers.set(zone.name, WOOD_REFILL_TICKS);
    }

    system.runInterval(() => {
        for (const zone of WOOD_ZONES) {
            let remaining = woodTimers.get(zone.name) ?? WOOD_REFILL_TICKS;
            remaining -= 20;

            if (remaining <= 0) {
                refillZone(zone);
                remaining = WOOD_REFILL_TICKS;
                try {
                    const c = centerOf(zone);
                    world.getDimension("overworld").runCommand(
                        `playsound note.pling @a[x=${c.x},y=${c.y},z=${c.z},r=30]`
                    );
                } catch (_) {}
            }

            woodTimers.set(zone.name, remaining);
            updateWoodFT(zone, Math.ceil(remaining / 20));
        }
    }, 20);
}
