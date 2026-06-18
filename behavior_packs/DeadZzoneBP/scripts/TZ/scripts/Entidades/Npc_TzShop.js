// Los eventos del NPC tz:npc_tzshop están registrados en PlugsEssen/TzShopSystem.js
// Este archivo solo exporta showShopForm para compatibilidad con UiGeneral.js, LobyUi.js, Npc_Vault.js

import { system } from "@minecraft/server";

export function showShopForm(player) {
    system.runTimeout(() => {
        try {
            const api = globalThis.__tzShopAPI;
            if (api?.showShopForm) {
                api.showShopForm(player);
            } else {
                player.sendMessage("§cTienda no disponible.");
            }
        } catch (e) {
            console.warn("[Npc_TzShop] Error: " + e);
        }
    }, 1);
}

console.warn("[Npc_TzShop] Cargado");
