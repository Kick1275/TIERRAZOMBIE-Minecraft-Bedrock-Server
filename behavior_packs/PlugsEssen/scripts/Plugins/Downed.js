import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
//import { onDownedKill } from "./GameModeSystem.js";

const downedPlayers = new Set();
const moveTracker   = new Map(); // playerId -> { lastX, lastZ, movingTicks }
const spawnGrace    = new Set(); // playerIds recently spawned, immune to downed check
const executionState = new Map(); // playerId -> { target, startTick, startPos, isReviving }
const executionLocked = new Set(); // playerIds being executed (can't move)

// HP total: 4 hileras = 80 HP (health_boost 13 = +60 HP extra sobre 20 base = 80 HP = 40 corazones)
const TOTAL_HP       = 80;
const DOWNED_THRESH  = 20;  // < 20 HP (19 o menos) → tumbado
const REVIVE_HP      = 23;  // 2 hileras al respawnear / ser curado
const BLEED_DAMAGE   = 1;   // 0.5 corazón por movimiento continuo
const MOVE_TICKS_REQ = 60;  // 3 segundos moviéndose = sangrado
const SLOWNESS_AMP   = 5;   // slowness IV

const DOWNED_TAG = "downed";
const EXECUTION_DURATION = 40; // 2.5 segundos (50 ticks)

function isDown(player)      { return downedPlayers.has(player.id); }
function getHealth(player)   { return player.getComponent("minecraft:health"); }

// ─── Tumbar jugador ───────────────────────────────────────────────────────────

function downPlayer(player) {
    if (downedPlayers.has(player.id)) return;
    downedPlayers.add(player.id);
    player.addTag(DOWNED_TAG); // persistir entre reloads

    player.addEffect("slowness",       999999, { amplifier: SLOWNESS_AMP, showParticles: false });
    player.addEffect("mining_fatigue", 999999, { amplifier: 255,          showParticles: false });
    player.runCommand("playsound down @a[r=50]");
    player.runCommand("summon minecraft:fireworks_rocket ~ ~ ~ ");
    // Ejecutar animación de caída
    player.runCommand("playanimation @s animation.down a 10000");
    
    const pos = player.location;
    moveTracker.set(player.id, { lastX: pos.x, lastZ: pos.z, movingTicks: 0 });

    player.onScreenDisplay.setTitle("§c§lTUMBADO", {
        subtitle: "§7Espera a que alguien te ayude...",
        fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 10
    });
    player.sendMessage("§c[!] §fEstás tumbado. No puedes hacer nada.");
    console.warn(`[Downed] ${player.name} fue tumbado`);
}

// ─── Levantar jugador ─────────────────────────────────────────────────────────

function revivePlayer(player) {
    if (!downedPlayers.has(player.id)) return;
    downedPlayers.delete(player.id);
    moveTracker.delete(player.id);
    player.removeTag(DOWNED_TAG);

    player.removeEffect("slowness");
    player.removeEffect("mining_fatigue");
    player.runCommand("playanimation @s animation.down a 1");
    getHealth(player).setCurrentValue(REVIVE_HP);

    // Grace period after revive: 3 seconds immune to downed check
    spawnGrace.add(player.id);
    system.runTimeout(() => spawnGrace.delete(player.id), 60);

    player.onScreenDisplay.setTitle("§a§lLEVANTADO", {
        subtitle: "§7Tienes 2 hileras de corazones. ¡Cúrate!",
        fadeInDuration: 5, stayDuration: 60, fadeOutDuration: 10
    });
    player.sendMessage("§a[!] §fFuiste levantado.");
}

// ─── Eliminar jugador tumbado ─────────────────────────────────────────────────

function killDowned(player, executor) {
    downedPlayers.delete(player.id);
    moveTracker.delete(player.id);
    player.removeTag(DOWNED_TAG);

    player.removeEffect("slowness");
    player.removeEffect("mining_fatigue");

    // Usar damage con el executor como fuente para que entityDie detecte el killer
    if (executor) {
        try {
            player.applyDamage(1000, { cause: "entityAttack", damagingEntity: executor });
        } catch {
            player.runCommand("kill @s");
        }
    } else {
        player.runCommand("kill @s");
    }
}

// ─── Menú al hacer click derecho en tumbado ───────────────────────────────────

async function showDownedMenu(helper, downedPlayer) {
    const form = new ActionFormData()
        .title("§l§cJugador Tumbado")
        .body(`§7${downedPlayer.name} está tumbado.\n§7¿Qué deseas hacer?`)
        .button("§l§aAyudar\n§r§7Levantar con 2 hileras")
        .button("§l§cRematar\n§r§7Eliminar definitivamente");

    const res = await form.show(helper);
    if (res.canceled) return;

    if (!downedPlayers.has(downedPlayer.id)) {
        helper.sendMessage("§eEste jugador ya no está tumbado.");
        return;
    }

    if (res.selection === 0) {
        // Revivir
        startExecution(helper, downedPlayer, true);
    } else {
        // Rematar
        startExecution(helper, downedPlayer, false);
    }
}

// ─── Sistema de ejecución/revivir ─────────────────────────────────────────────

function startExecution(executor, target, isReviving) {
    // Verificar que no estén ya en una ejecución
    if (executionState.has(executor.id)) {
        executor.sendMessage("§cYa estás ejecutando una acción.");
        return;
    }
    
    if (executionLocked.has(target.id)) {
        executor.sendMessage("§cEste jugador ya está siendo ejecutado.");
        return;
    }

    // Iniciar ejecución
    const pos = executor.location;
    executionState.set(executor.id, {
        target: target.id,
        startTick: _debugTick,
        startPos: { x: pos.x, y: pos.y, z: pos.z },
        isReviving: isReviving
    });
    
    executionLocked.add(target.id);
    
    // Bloquear movimiento del objetivo
    target.addEffect("slowness", EXECUTION_DURATION + 20, { amplifier: 255, showParticles: false });
    target.addEffect("mining_fatigue", EXECUTION_DURATION + 20, { amplifier: 255, showParticles: false });
    
    // Ejecutar animación solo en el ejecutor
    executor.runCommand("playanimation @s animation.execution");
    
    const action = isReviving ? "§areviviendo" : "§crematar";
    executor.sendMessage(`§7Estás ${action} a §f${target.name}§7. ¡No te muevas!`);
    target.sendMessage(`§7${executor.name} te está ${action}...`);
    
    console.warn(`[Execution] ${executor.name} ${isReviving ? "reviviendo" : "rematando"} a ${target.name}`);
}

function cancelExecution(executor, reason) {
    const state = executionState.get(executor.id);
    if (!state) return;
    
    executionState.delete(executor.id);
    executionLocked.delete(state.target);
    
    executor.sendMessage(`§c✗ Ejecución cancelada: ${reason}`);
    
    // Buscar el objetivo y notificarle
    const target = world.getAllPlayers().find(p => p.id === state.target);
    if (target) {
        target.sendMessage("§eEjecución cancelada.");
        // Restaurar efectos de tumbado si sigue tumbado
        if (isDown(target)) {
            target.addEffect("slowness", 999999, { amplifier: SLOWNESS_AMP, showParticles: false });
            target.addEffect("mining_fatigue", 999999, { amplifier: 255, showParticles: false });
        }
    }
    
    console.warn(`[Execution] Cancelada: ${reason}`);
}

function completeExecution(executor) {
    const state = executionState.get(executor.id);
    if (!state) return;
    
    executionState.delete(executor.id);
    executionLocked.delete(state.target);
    
    const target = world.getAllPlayers().find(p => p.id === state.target);
    if (!target) {
        executor.sendMessage("§cEl objetivo desapareció.");
        return;
    }
    
    if (state.isReviving) {
        // Revivir
        revivePlayer(target);
        executor.sendMessage(`§a✓ Levantaste a §f${target.name}§a.`);
    } else {
        // Rematar
        killDowned(target, executor);
        executor.sendMessage(`§c✓ Remataste a §f${target.name}§c.`);
        // onDownedKill ya no es necesario — entityDie detecta el kill via applyDamage
    }
}

// ─── Spawn/Respawn ────────────────────────────────────────────────────────────

world.afterEvents.playerSpawn.subscribe((ev) => {
    const player = ev.player;
    player.runCommand("effect @s health_boost infinite 14 true");
    player.runCommand("playanimation @s animation.down q 1");
    
    
    // Grace period: ignore downed check for 3 seconds after spawn
    spawnGrace.add(player.id);
    system.runTimeout(() => spawnGrace.delete(player.id), 60);

    if (ev.initialSpawn === false) {
        // Murió de verdad → limpiar tag de tumbado si quedó
        player.removeTag(DOWNED_TAG);
        system.run(() => {
            try { getHealth(player).setCurrentValue(REVIVE_HP); } catch {}
        });
    } else {
        // Primera vez que entra — restaurar estado tumbado si tenía la tag
        if (player.hasTag(DOWNED_TAG)) {
            system.run(() => {
                downedPlayers.add(player.id);
                const pos = player.location;
                moveTracker.set(player.id, { lastX: pos.x, lastZ: pos.z, movingTicks: 0 });
                player.addEffect("slowness",       999999, { amplifier: SLOWNESS_AMP, showParticles: false });
                player.addEffect("weakness",       999999, { amplifier: SLOWNESS_AMP, showParticles: false });
                player.addEffect("mining_fatigue", 999999, { amplifier: 255,          showParticles: false });
                console.warn(`[Downed] ${player.name} restaurado como tumbado tras reload`);
            });
        }
    }
});

// ─── Bloquear uso de items mientras tumbado ───────────────────────────────────

world.beforeEvents.itemUse.subscribe((ev) => {
    if (!isDown(ev.source)) return;
    ev.cancel = true;
});

world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
    if (!isDown(ev.player)) return;
    ev.cancel = true;
});

// ─── Bloquear colocar bloques ─────────────────────────────────────────────────
// playerPlaceBlock puede no existir en esta versión — lo manejamos en el tick

// ─── Bloquear curación mientras tumbado ──────────────────────────────────────
// entityHeal puede no existir — lo manejamos en el tick reseteando HP si subió

// ─── Detección de interacción con tumbado via sneak + proximidad ──────────────
// beforeEvents.playerInteractWithEntity no dispara con minecraft:player en Bedrock
// Solución: agacharse (sneak) a ≤ 3 bloques del tumbado abre el menú

const sneakCooldown = new Map(); // playerId -> _debugTick del último menú abierto

function checkDownedInteractions(players) {
    const downedList = players.filter(p => isDown(p));
    if (downedList.length === 0) return;

    for (const helper of players) {
        if (isDown(helper)) continue;
        if (!helper.isSneaking) continue;

        const last = sneakCooldown.get(helper.id) ?? 0;
        if (_debugTick - last < 40) continue; // cooldown 2 segundos

        for (const downed of downedList) {
            const p1 = helper.location, p2 = downed.location;
            const dist = Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2 + (p1.z-p2.z)**2);
            if (dist <= 3) {
                sneakCooldown.set(helper.id, _debugTick);
                system.run(() => showDownedMenu(helper, downed));
                break;
            }
        }
    }
}

// ─── Tick principal ───────────────────────────────────────────────────────────

let _debugTick = 0;
const breakSoundPlayed = new Map(); // playerId -> bool

system.runInterval(() => {
    _debugTick++;
    const players = world.getAllPlayers();

    // Log cada 2 segundos para debug
    if (_debugTick % 40 === 0) {
        for (const p of players) {
            const hc = getHealth(p);
            //console.warn(`[Downed DEBUG] ${p.name} hp=${hc ? hc.currentValue : "NULL"} down=${isDown(p)}`);
        }
    }

    checkDownedInteractions(players);
    
    // ── Procesar ejecuciones activas ──
    for (const [executorId, state] of executionState.entries()) {
        const executor = players.find(p => p.id === executorId);
        if (!executor) {
            executionState.delete(executorId);
            executionLocked.delete(state.target);
            continue;
        }
        
        const elapsed = _debugTick - state.startTick;
        
        // Verificar si el ejecutor se movió
        const currentPos = executor.location;
        const moved = Math.abs(currentPos.x - state.startPos.x) > 0.3 || 
                     Math.abs(currentPos.z - state.startPos.z) > 0.3;
        
        if (moved) {
            cancelExecution(executor, "te moviste");
            continue;
        }
        
        // Verificar si el objetivo sigue tumbado
        const target = players.find(p => p.id === state.target);
        if (!target || !isDown(target)) {
            cancelExecution(executor, "el objetivo ya no está tumbado");
            continue;
        }
        
        // Mostrar progreso con barra visual
        if (elapsed % 5 === 0) { // Actualizar cada 0.25 segundos para más fluidez
            const progress = elapsed / EXECUTION_DURATION;
            const percentage = Math.floor(progress * 100);
            
            // Crear barra de progreso visual
            const barLength = 20;
            const filled = Math.floor(progress * barLength);
            const empty = barLength - filled;
            const bar = "§a" + "█".repeat(filled) + "§7" + "█".repeat(empty);
            
            // Calcular tiempo restante
            const remainingTicks = EXECUTION_DURATION - elapsed;
            const remainingSeconds = (remainingTicks / 20).toFixed(1);
            
            const action = state.isReviving ? "Reviviendo" : "Rematando";
            const color = state.isReviving ? "§a" : "§c";
            
            // Mostrar en actionbar del ejecutor
            executor.onScreenDisplay.setActionBar(`${color}${action}... §f${percentage}%`);
            
            // Mostrar barra en subtitle del ejecutor
            executor.onScreenDisplay.setTitle(" ", {
                subtitle: `${bar} §f${remainingSeconds}s`,
                fadeInDuration: 0,
                stayDuration: 10,
                fadeOutDuration: 0
            });
        }
        
        // Completar ejecución
        if (elapsed >= EXECUTION_DURATION) {
            completeExecution(executor);
        }
    }

    for (const player of players) {
        const hc = getHealth(player);
        if (!hc) continue;
        const hp = hc.currentValue;

        if (!isDown(player)) {
            if (hp < 20 && hp > 0 && !spawnGrace.has(player.id)) {
                //console.warn(`[Downed] ${player.name} HP=${hp} → tumbando`);
                downPlayer(player);
            }
            // Sonido break cuando HP <= 40
            if (hp <= 40 && hp > 0 && !breakSoundPlayed.get(player.id)) {
                player.runCommand("playsound break @a[r=50]");
                player.runCommand("playsound break2 @s");
                player.runCommand("particle minecraft:totem_particle ~ ~2 ~");
                player.runCommand("particle minecraft:totem_particle ~ ~2 ~");
                player.runCommand("particle minecraft:totem_particle ~ ~2 ~");
                breakSoundPlayed.set(player.id, true);
            } else if (hp > 40) {
                breakSoundPlayed.set(player.id, false);
            }
            // Hint en actionbar si hay tumbado cerca
            const downedNearby = players.find(p => {
                if (!isDown(p)) return false;
                const p1 = player.location, p2 = p.location;
                return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2+(p1.z-p2.z)**2) <= 3;
            });
            if (downedNearby && !executionState.has(player.id)) {
                player.onScreenDisplay.setTitle(" ", {
                    subtitle: `§e[AGÁCHATE] §fpara interactuar con §c${downedNearby.name}`,
                    fadeInDuration: 0, stayDuration: 40, fadeOutDuration: 0
                });
            }
            continue;
        }
        // ── Jugador tumbado ──

        // Si murió de verdad estando tumbado, limpiar estado
        if (hp <= 0) {
            downedPlayers.delete(player.id);
            moveTracker.delete(player.id);
            player.removeTag(DOWNED_TAG);
            continue;
        }

        // Evitar que se cure: si el HP subió por encima del umbral, revertirlo
        if (hp >= DOWNED_THRESH) {
            hc.setCurrentValue(DOWNED_THRESH);
        }        

        // Renovar efectos (solo si no está siendo ejecutado)
        if (!executionLocked.has(player.id)) {
            player.addEffect("slowness",       100, { amplifier: SLOWNESS_AMP, showParticles: false });
            player.addEffect("mining_fatigue", 100, { amplifier: 255,          showParticles: false });
        }

        // Tracker de movimiento → sangrado (solo si no está siendo ejecutado)
        if (!executionLocked.has(player.id)) {
            const pos     = player.location;
            const tracker = moveTracker.get(player.id) ?? { lastX: pos.x, lastZ: pos.z, movingTicks: 0 };
            const moved   = Math.abs(pos.x - tracker.lastX) > 0.15 || Math.abs(pos.z - tracker.lastZ) > 0.15;

            if (moved) {
                tracker.movingTicks++;
                tracker.lastX = pos.x;
                tracker.lastZ = pos.z;

                if (tracker.movingTicks >= MOVE_TICKS_REQ) {
                    tracker.movingTicks = 0;
                    const newHp = hc.currentValue - BLEED_DAMAGE;
                    if (newHp <= 0) {
                        killDowned(player);
                        continue;
                    }
                    hc.setCurrentValue(newHp);
                    player.onScreenDisplay.setTitle("§c§lTUMBADO", {
                        subtitle: `§c-½ ❤  §7(${Math.ceil(newHp / 2)} corazones)`,
                        fadeInDuration: 0, stayDuration: 30, fadeOutDuration: 10
                    });
                }
            } else {
                tracker.movingTicks = 0;
            }

            moveTracker.set(player.id, tracker);
        }
    }
}, 1);
console.warn("[Downed] Sistema cargado");
