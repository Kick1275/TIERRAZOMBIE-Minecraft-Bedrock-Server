import { world, system, ItemStack } from "@minecraft/server";
import {
    SAFE_ZONE, EXIT_LINE_Z, EXIT_LINE_MIN_X, EXIT_LINE_MAX_X,
    SPAWN_AREA, SAFE_SPAWN, inSafeZone, inMineBounds,
    getSafeZone, getSafeSpawn, getSpawnArea, getExitLine
} from "./MineConfig.js";
import { addProtection, removeProtection } from "./MineProtection.js";
import { giveMenuBook } from "../../Server/UserUI.js";

// ─── Constantes del item de salida ────────────────────────────────────────────
const EXIT_ITEM_SLOT = 8;
const EXIT_ITEM_ID = "minecraft:paper";
const EXIT_ITEM_NAME = "§c§lSalir de la Mina PvP";
const EXIT_ITEM_LORE_TAG = "§0§rminepvp_exit"; // tag oculto para identificarlo

// Jugadores en cuenta regresiva de salida
const leavingPlayers = new Map(); // playerId -> { intervalId, startPos, startHp }

function randomSpawn() {
    const area = getSpawnArea();
    const x = Math.floor(Math.random() * (area.maxX - area.minX + 1)) + area.minX;
    const z = Math.floor(Math.random() * (area.maxZ - area.minZ + 1)) + area.minZ;
    return { x, y: area.y, z };
}

// ─── Verificar si un item es el bloque de salida ──────────────────────────────
function isExitItem(item) {
    if (!item || item.typeId !== EXIT_ITEM_ID) return false;
    try {
        const lore = item.getLore?.() ?? [];
        return lore.includes(EXIT_ITEM_LORE_TAG);
    } catch (_) {
        return false;
    }
}

// ─── Dar el item de salida (bloqueado en slot 8) ──────────────────────────────
function giveExitItem(player) {
    try {
        const lore = [EXIT_ITEM_LORE_TAG];
        const nbt = JSON.stringify({
            "keep_on_death": {},
            "item_lock": { "mode": "lock_in_slot" }
        });
        player.runCommand(
            `replaceitem entity "${player.name}" slot.hotbar ${EXIT_ITEM_SLOT} ${EXIT_ITEM_ID} 1 0 ${nbt}`
        );
        // Aplicar nombre y lore después
        system.runTimeout(() => {
            try {
                const inv = player.getComponent("minecraft:inventory")?.container;
                if (!inv) return;
                const item = inv.getItem(EXIT_ITEM_SLOT);
                if (item && item.typeId === EXIT_ITEM_ID) {
                    item.nameTag = EXIT_ITEM_NAME;
                    item.setLore([EXIT_ITEM_LORE_TAG]);
                    inv.setItem(EXIT_ITEM_SLOT, item);
                }
            } catch (_) {}
        }, 5);
    } catch (e) {
        console.warn("[MinePvP] Error dando exit item: " + e);
    }
}

// ─── Reemplazar el item de salida por el item UI de PlugsEssentials ──────────
function replaceWithMenuBook(player) {
    try {
        giveMenuBook(player);
    } catch (e) {
        // Fallback: quitar el item de salida
        try {
            const inv = player.getComponent("minecraft:inventory")?.container;
            if (!inv) return;
            const item = inv.getItem(EXIT_ITEM_SLOT);
            if (item && isExitItem(item)) {
                inv.setItem(EXIT_ITEM_SLOT, undefined);
            }
        } catch (_) {}
    }
}

// ─── Protección temporal al entrar a la mina (solo visual, sin efectos) ───────
function applyEntryProtection(player) {
    addProtection(player.id);
    let ticks = 10 * 20;
    const id = system.runInterval(() => {
        ticks -= 20;
        const secs = Math.ceil(ticks / 20);
        if (ticks <= 0) {
            system.clearRun(id);
            removeProtection(player.id);
            try {
                player.onScreenDisplay.setActionBar("§a[MinePvP] §fProtección terminada. ¡Suerte!");
            } catch (_) {}
            return;
        }
        try {
            player.onScreenDisplay.setActionBar(`§e[MinePvP] §fProtección: §c${secs}s`);
        } catch (_) {}
    }, 20);
}

// ─── TP a la mina ─────────────────────────────────────────────────────────────
function teleportToMine(player) {
    const pos = randomSpawn();
    try {
        player.teleport(pos, { dimension: world.getDimension("overworld") });
        giveExitItem(player);
        applyEntryProtection(player);
        player.onScreenDisplay.setTitle("§c§lMINA PvP", {
            subtitle: "§7Tienes 10s de protección",
            fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 10
        });
    } catch (e) {
        console.warn("[MinePvP] Error en teleportToMine: " + e);
    }
}

// ─── Cancelar cuenta regresiva de salida ──────────────────────────────────────
function cancelLeave(playerId) {
    const state = leavingPlayers.get(playerId);
    if (!state) return;
    system.clearRun(state.intervalId);
    leavingPlayers.delete(playerId);
}

// ─── Iniciar cuenta regresiva de salida ───────────────────────────────────────
function startLeaveCountdown(player) {
    if (leavingPlayers.has(player.id)) {
        player.sendMessage("§e[MinePvP] §fYa estás saliendo...");
        return;
    }

    const startPos = { ...player.location };
    const startHp = player.getComponent("minecraft:health")?.currentValue ?? 20;
    let ticks = 10 * 20;

    const intervalId = system.runInterval(() => {
        try {
            const current = world.getAllPlayers().find(p => p.id === player.id);
            if (!current) {
                cancelLeave(player.id);
                return;
            }

            // Verificar movimiento
            const moved =
                Math.abs(current.location.x - startPos.x) > 0.5 ||
                Math.abs(current.location.z - startPos.z) > 0.5;

            if (moved) {
                cancelLeave(player.id);
                try {
                    current.sendMessage("§c[MinePvP] §fTe moviste. Salida cancelada.");
                    current.onScreenDisplay.setActionBar("§c[MinePvP] §fSalida cancelada");
                } catch (_) {}
                return;
            }

            // Verificar daño recibido
            const currentHp = current.getComponent("minecraft:health")?.currentValue ?? startHp;
            if (currentHp < startHp - 0.5) {
                cancelLeave(player.id);
                try {
                    current.sendMessage("§c[MinePvP] §fRecibiste daño. Salida cancelada.");
                    current.onScreenDisplay.setActionBar("§c[MinePvP] §fSalida cancelada");
                } catch (_) {}
                return;
            }

            ticks -= 20;
            const secs = Math.ceil(ticks / 20);

            if (ticks <= 0) {
                cancelLeave(player.id);
                // TP a zona segura
                try {
                    current.teleport(getSafeSpawn(), { dimension: world.getDimension("overworld") });
                    current.sendMessage("§a[MinePvP] §fHas salido de la mina.");
                    current.onScreenDisplay.setActionBar("§a[MinePvP] §fBienvenido a la zona segura");
                    replaceWithMenuBook(current);
                } catch (_) {}
                return;
            }

            // Sonido de tick
            try {
                current.playSound("note.hat", { volume: 0.5, pitch: secs <= 3 ? 1.5 : 1.0 });
            } catch (_) {}

            try {
                current.sendMessage(`§e[MinePvP] §fSaliendo en §c${secs}§f segundos...`);
            } catch (_) {}

        } catch (_) {
            cancelLeave(player.id);
        }
    }, 20);

    leavingPlayers.set(player.id, { intervalId, startPos, startHp });
    player.sendMessage("§e[MinePvP] §fCuenta regresiva iniciada. §7No te muevas ni recibas daño.");
}

// ─── Evacuar a todos los jugadores dentro de la mina ─────────────────────────
export function evacuateMine() {
    const overworld = world.getDimension("overworld");
    const players = world.getAllPlayers();
    console.warn(`[MinePvP] evacuateMine: revisando ${players.length} jugadores`);

    for (const player of players) {
        try {
            const loc = player.location;
            const inside = inMineBounds(loc);
            console.warn(`[MinePvP] ${player.name} @ ${Math.floor(loc.x)},${Math.floor(loc.y)},${Math.floor(loc.z)} -> inMine=${inside}`);

            if (!inside) continue;

            // Cancelar cuenta regresiva si estaba saliendo
            cancelLeave(player.id);

            // TP a zona segura
            player.teleport(getSafeSpawn(), { dimension: overworld });
            player.sendMessage("§c[MinePvP] §fLa mina está regenerándose. Fuiste enviado a la zona segura.");
            player.onScreenDisplay.setTitle("§c§lMINA REGENERANDO", {
                subtitle: "§7Serás devuelto cuando termine",
                fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 10
            });

            // Reemplazar item de salida por el menu book
            replaceWithMenuBook(player);
        } catch (e) {
            console.warn("[MinePvP] evacuateMine error: " + e);
        }
    }
}

// ─── Inicializar sistema de zona segura ───────────────────────────────────────
export function initializeSafeZone() {

    // 1. Detectar cruce de línea de salida (Z = 3238, de zona segura hacia mina)
    const prevZ = new Map();

    system.runInterval(() => {
        try {
            for (const player of world.getAllPlayers()) {
                const loc = player.location;
                const prev = prevZ.get(player.id);
                prevZ.set(player.id, loc.z);

                if (prev === undefined) continue;

                const exitLine = getExitLine();
                const inXRange = loc.x >= exitLine.minX && loc.x <= exitLine.maxX;
                // Cruzó de Z >= exitLineZ a Z < exitLineZ estando en zona segura
                if (inXRange && prev >= exitLine.z && loc.z < exitLine.z) {
                    if (inSafeZone({ x: loc.x, y: loc.y, z: prev })) {
                        teleportToMine(player);
                    }
                }
            }
        } catch (_) {}
    }, 2);

    // 2. Detectar uso del item de salida
    world.beforeEvents.itemUse.subscribe((event) => {
        const player = event.source;
        const item = event.itemStack;
        if (!item || !isExitItem(item)) return;

        event.cancel = true;
        system.run(() => {
            startLeaveCountdown(player);
        });
    });

    // 2b. Bloquear colocación del bloque de redstone de salida
    world.beforeEvents.playerPlaceBlock.subscribe((event) => {
        const player = event.player;
        const item = event.itemStack;
        if (item && isExitItem(item)) {
            event.cancel = true;
        }
    });

    // 4. Al morir dentro de la mina: cancelar salida y reemplazar item
    world.afterEvents.entityDie.subscribe((event) => {
        const entity = event.deadEntity;
        if (!entity || entity.typeId !== "minecraft:player") return;
        try {
            // Cancelar cuenta regresiva si estaba saliendo
            if (leavingPlayers.has(entity.id)) {
                cancelLeave(entity.id);
            }
            // Quitar protección si la tenía
            removeProtection(entity.id);

            // Reemplazar item de salida por el item UI tras respawn
            system.runTimeout(() => {
                const respawned = world.getAllPlayers().find(p => p.name === entity.name);
                if (!respawned) return;
                system.runTimeout(() => {
                    replaceWithMenuBook(respawned);
                }, 40);
            }, 60);
        } catch (_) {}
    });

    // 5. Cancelar salida si recibe daño (respaldo adicional al check de HP)
    world.afterEvents.entityHurt?.subscribe?.((event) => {
        const entity = event.hurtEntity;
        if (!entity || entity.typeId !== "minecraft:player") return;
        if (leavingPlayers.has(entity.id)) {
            cancelLeave(entity.id);
            try {
                const player = world.getAllPlayers().find(p => p.id === entity.id);
                if (player) {
                    player.sendMessage("§c[MinePvP] §fRecibiste daño. Salida cancelada.");
                }
            } catch (_) {}
        }
    });

    // 6. Verificar periódicamente que el item de salida siga en slot 8
    system.runInterval(() => {
        try {
            for (const player of world.getAllPlayers()) {
                const inv = player.getComponent("minecraft:inventory")?.container;
                if (!inv) continue;

                // Buscar si tiene el item de salida en algún slot
                let hasExitItem = false;
                let exitItemSlot = -1;
                for (let i = 0; i < inv.size; i++) {
                    const item = inv.getItem(i);
                    if (item && isExitItem(item)) {
                        hasExitItem = true;
                        exitItemSlot = i;
                        break;
                    }
                }

                // Si tiene el item pero no está en slot 8, moverlo
                if (hasExitItem && exitItemSlot !== EXIT_ITEM_SLOT) {
                    try {
                        const exitItem = inv.getItem(exitItemSlot);
                        const slotItem = inv.getItem(EXIT_ITEM_SLOT);
                        inv.setItem(exitItemSlot, slotItem);
                        inv.setItem(EXIT_ITEM_SLOT, exitItem);
                    } catch (_) {}
                }
            }
        } catch (_) {}
    }, 40);
}
