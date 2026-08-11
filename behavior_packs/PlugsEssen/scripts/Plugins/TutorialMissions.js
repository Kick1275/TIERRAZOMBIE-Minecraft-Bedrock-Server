import { world, system } from "@minecraft/server";

// ─── Sistema de Misiones de Tutorial ───────────────────────────────────────────
// Cadena fija de 6 misiones que se muestran por chat al entrar al servidor.
// Todo el estado se guarda en una dynamic property por jugador (tm:state).

const STATE_KEY = "tm:state";
const SCORE_MONEY = "money";
const INTRO_DELAY_TICKS = 100;   // 5 segundos
const REMINDER_INTERVAL_TICKS = 300; // 15 segundos
const PROGRESS_POLL_TICKS = 40;  // 2 segundos (suficiente para el poll de inventario del tutorial)

const MISSIONS = [
    null, // índice 0 sin usar — las misiones van de 1 a 6
    {
        desc: "Interactúa con el NPC Guardia y dale click a ¡JUGAR!",
        reward: "+2,500 money",
    },
    {
        desc: "Consigue Recursos: 32 Tablones de Madera y 20 de Piedra",
        reward: "Piedra de Protección 11x11",
    },
    {
        desc: "Coloca tu protección y crea tu primera base",
        reward: "Arco y 32 flechas, Mesa de Armas, Mesa de Munición, x3 Camas Rojas",
    },
    {
        desc: "Coloca la Mesa de Armas y la Mesa de Munición",
        reward: "Glock 18 y 32 balas 9mm",
    },
    {
        desc: "Saquea: abre las cajas dispersas por el mapa para conseguir recursos",
        reward: "Comida en lata y un Abrelatas",
    },
    {
        desc: "Elimina a un jugador",
        reward: "32 balas 9mm",
    },
];

const LOOT_BLOCK_IDS = new Set([
    "mcpe:civilian_loot", "mcpe:construction_loot", "mcpe:firefighter_loot",
    "mcpe:food_loot", "mcpe:medical_loot", "mcpe:artic_loot",
    "mcpe:desert_loot", "mcpe:woodland_loot", "mcpe:police_loot", "mcpe:medieval_loot",
]);

// ─── Estado ─────────────────────────────────────────────────────────────────────

// Caché en memoria del estado por jugador. Evita hacer getDynamicProperty + JSON.parse
// por cada jugador en cada pasada de los intervalos (poll de 2 s y recordatorio de 15 s).
// La dynamic property sigue siendo la fuente persistida; el caché es un espejo en RAM
// que se mantiene sincronizado en saveState. saveState es el ÚNICO punto de escritura
// interno del estado, así que el espejo nunca diverge dentro de este módulo.
const stateCache = new Map(); // playerId -> state

function getState(player) {
    const cached = stateCache.get(player.id);
    if (cached) return cached;
    let state = null;
    try {
        const raw = player.getDynamicProperty(STATE_KEY);
        if (raw) state = JSON.parse(raw);
    } catch {}
    if (!state) state = { step: 0, introduced: false, m2Last: "", m4: { table: false, ammo: false } };
    stateCache.set(player.id, state);
    return state;
}

function saveState(player, state) {
    stateCache.set(player.id, state);
    try { player.setDynamicProperty(STATE_KEY, JSON.stringify(state)); } catch {}
}

// Invalida el espejo en RAM. Debe llamarse cuando algo EXTERNO a este módulo modifica
// la dynamic property tm:state de un jugador conectado (p. ej. el reset con .simnuevo).
export function clearTutorialCache(player) {
    try { stateCache.delete(player.id); } catch {}
}

// Liberar el caché cuando el jugador se desconecta (evita fuga de memoria).
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    stateCache.delete(playerId);
});

function addScore(player, objective, amount) {
    try {
        let obj = world.scoreboard.getObjective(objective);
        if (!obj) obj = world.scoreboard.addObjective(objective, objective);
        obj.setScore(player, (obj.getScore(player) ?? 0) + amount);
    } catch {}
}

// ─── UI: chat / sonido / título / actionbar ────────────────────────────────────

function buildBar(current, goal) {
    const filled = Math.max(0, Math.min(10, Math.floor((current / goal) * 10)));
    return "§´§a" + "█".repeat(filled) + "§8" + "█".repeat(10 - filled);
}

function buildMissionListText() {
    let txt = "§l§6===== MISIONES DE TUTORIAL =====§r\n";
    for (let i = 1; i < MISSIONS.length; i++) {
        const m = MISSIONS[i];
        txt += `§e${i}.§f ${m.desc}\n   §7Recompensa: §a${m.reward}\n`;
    }
    return txt;
}

function showMissionIntro(player) {
    try {
        player.sendMessage(buildMissionListText());
        player.onScreenDisplay.setTitle("§l§6Misiones de Tutorial", {
            subtitle: "§7Revisa el chat para ver la lista completa",
            fadeInDuration: 10, staySeconds: 60, fadeOutDuration: 10,
        });
        player.playSound("random.orb");
    } catch {}
}

function showCurrentMissionReminder(player, step) {
    const m = MISSIONS[step];
    if (!m) return;
    try {
        player.sendMessage(`§e§lMisión ${step}/6:§r §f${m.desc}\n§7Recompensa: §a${m.reward}`);
        // La misión 6 (matar a un jugador) puede tardar mucho en completarse —
        // el recordatorio repetido sin sonido evita que sea molesto.
        if (step !== 6) player.playSound("random.orb");
    } catch {}
}

function showMissionProgress(player, label, current, goal) {
    try {
        player.sendMessage(`§e${label} ${buildBar(current, goal)} §f${current}/${goal}`);
        player.playSound("note.pling");
    } catch {}
}

// ─── Recompensas ────────────────────────────────────────────────────────────────

function grantMissionReward(player, step) {
    switch (step) {
        case 1:
            addScore(player, SCORE_MONEY, 2500);
            break;
        case 2:
            player.runCommand("give @s rt:11x11_block 1");
            break;
        case 3:
            player.runCommand("give @s minecraft:bow 1");
            player.runCommand("give @s minecraft:arrow 32");
            player.runCommand("give @s krep:gunsmith 1");
            player.runCommand("give @s krep:ammoworkbench 1");
            player.runCommand("give @s minecraft:red_bed 3");
            break;
        case 4:
            player.runCommand("give @s krep:g17 1");
            player.runCommand("give @s krep:mm9 32");
            break;
        case 5:
            player.runCommand("give @s mcpe:can_opener 1");
            player.runCommand("give @s mcpe:canned_beans 3");
            break;
        case 6:
            player.runCommand("give @s krep:mm9 32");
            break;
    }
}

// ─── Avance de misiones ─────────────────────────────────────────────────────────

function completeMission(player, step) {
    const state = getState(player);
    if (state.step !== step) return; // ya avanzó (evita doble completado)

    try { player.playSound("random.levelup"); } catch {}
    try { grantMissionReward(player, step); } catch {}

    const m = MISSIONS[step];
    player.sendMessage(`§a§l✓ Misión completada:§r §f${m.desc}\n§e+ ${m.reward}`);

    state.step = step + 1;
    saveState(player, state);

    if (state.step > 6) {
        system.runTimeout(() => {
            try {
                player.sendMessage("§a§l¡Has completado todas las misiones de tutorial!");
                player.playSound("random.levelup");
            } catch {}
        }, 20);
    } else {
        showCurrentMissionReminder(player, state.step);
    }
}

// Llamado desde GameModeSystem.js cuando el jugador hace click en "JUGAR" con el NPC Guardia.
export function tmOnPlayGuardia(player) {
    try {
        const state = getState(player);
        if (state.step === 1) completeMission(player, 1);
    } catch {}
}

// ─── Spawn: intro + arranque de la cadena ──────────────────────────────────────

world.afterEvents.playerSpawn.subscribe(ev => {
    const player = ev.player;
    const state = getState(player);
    if (state.step >= 7 || state.introduced) return;

    system.runTimeout(() => {
        try {
            const fresh = getState(player);
            if (fresh.introduced) return;
            showMissionIntro(player);
            fresh.introduced = true;
            fresh.step = 1;
            saveState(player, fresh);
        } catch {}
    }, INTRO_DELAY_TICKS);
});

// Recordatorio periódico de la misión activa (cada 15s) para todos los jugadores conectados.
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const state = getState(player);
            if (!state.introduced || state.step < 1 || state.step > 6) continue;
            showCurrentMissionReminder(player, state.step);
        } catch {}
    }
}, REMINDER_INTERVAL_TICKS);

// ─── Misión 2: recolectar tablones + piedra (poll de inventario) ──────────────

function countPlanksAndStone(player) {
    let planks = 0, stone = 0;
    try {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) return { planks, stone };
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (!item) continue;
            if (item.typeId.endsWith("_planks")) planks += item.amount;
            else if (item.typeId === "minecraft:stone" || item.typeId === "minecraft:cobblestone") stone += item.amount;
        }
    } catch {}
    return { planks, stone };
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const state = getState(player);
            if (state.step !== 2) continue;

            const { planks, stone } = countPlanksAndStone(player);
            const cPlanks = Math.min(planks, 32);
            const cStone = Math.min(stone, 20);
            const key = `${cPlanks}_${cStone}`;

            if (state.m2Last !== key) {
                state.m2Last = key;
                saveState(player, state);
                showMissionProgress(player, `§fTablones ${cPlanks}/32  §6Piedra`, cStone, 20);
            }

            if (cPlanks >= 32 && cStone >= 20) completeMission(player, 2);
        } catch {}
    }
}, PROGRESS_POLL_TICKS);

// ─── Misión 3: colocar la protección 11x11 ─────────────────────────────────────
// ─── Misión 4: colocar mesa de armas + mesa de munición ───────────────────────

world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const player = ev.player;
    const id = ev.block.typeId;
    try {
        const state = getState(player);

        if (state.step === 3 && (id === "rt:11x11_block" || id === "rt:11x11_on_block")) {
            completeMission(player, 3);
            return;
        }

        if (state.step === 4 && (id === "krep:gunsmith" || id === "krep:ammoworkbench")) {
            state.m4 = state.m4 || { table: false, ammo: false };
            if (id === "krep:gunsmith") state.m4.table = true;
            if (id === "krep:ammoworkbench") state.m4.ammo = true;
            const done = (state.m4.table ? 1 : 0) + (state.m4.ammo ? 1 : 0);
            saveState(player, state);
            showMissionProgress(player, "§fMesas colocadas", done, 2);
            if (state.m4.table && state.m4.ammo) completeMission(player, 4);
        }
    } catch {}
});

// ─── Misión 5: saquear una caja de loot de DeadZone ────────────────────────────

world.afterEvents.playerInteractWithBlock.subscribe(ev => {
    const player = ev.player;
    try {
        const state = getState(player);
        if (state.step === 5 && LOOT_BLOCK_IDS.has(ev.block.typeId)) {
            completeMission(player, 5);
        }
    } catch {}
});

// ─── Misión 6: eliminar a un jugador ───────────────────────────────────────────

world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
    if (deadEntity?.typeId !== "minecraft:player") return;
    const killer = damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player" || killer.id === deadEntity.id) return;

    try {
        const state = getState(killer);
        if (state.step === 6) completeMission(killer, 6);
    } catch {}
});

console.warn("[TutorialMissions] cargado");
