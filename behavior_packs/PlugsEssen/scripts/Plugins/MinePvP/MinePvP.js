import { system } from "@minecraft/server";
import { initializeProtection } from "./MineProtection.js";
import { initializeSafeZone } from "./MineSafeZone.js";
import { initializeWoodZones } from "./MineWoodZones.js";
import { initializeMineTimer } from "./MineGeneration.js";
import { initializeMineFTs, deleteAllMineFTs } from "./MineFloatingText.js";

let initialized = false;

export function initializeMinePvP() {
    if (initialized) return;
    initialized = true;

    // Esperar a que FloatingTextSystem esté completamente listo
    system.runTimeout(() => {
        // 1. Eliminar FTs viejos y preparar nuevos
        initializeMineFTs();

        // 2. Inicializar sistemas
        initializeProtection();
        initializeSafeZone();
        initializeWoodZones();
        initializeMineTimer();

        console.warn("[MinePvP] Sistema inicializado correctamente.");
    }, 120);
}

export { showMineAdminUI } from "./MineAdminUI.js";
