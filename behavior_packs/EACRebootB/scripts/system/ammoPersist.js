import { world, system } from "@minecraft/server";

// ═══════════════════════════════════════════════════════════════════
//  ammoPersist.js — Fase 6: Persistencia de munición en cámara
//
//  El bug: los scoreboards de munición (arka, ak12, hk416…) se
//  resetean a 0 cuando el jugador sale y vuelve a entrar. Esto hace
//  que el arma muestre el cargador lleno aunque el jugador no tenga
//  munición en el inventario.
//
//  Solución: guardar el valor del scoreboard en una dynamic property
//  del jugador al desconectarse, y restaurarlo al reconectarse.
//
//  Formato de la dynamic property:
//    "eac:ammo_<scoreboardId>" → número entero (munición en cámara)
// ═══════════════════════════════════════════════════════════════════

const SCOREBOARDS = [
    "arka", "ak12", "hk416", "k2", "type89", "m7", "m8",
    "m16a4", "qbu191", "qbz191", "qcq171", "qjb95", "qjb201",
    "qsz92", "type95", "t112", "type88", "type882",
];

const PREFIX = "eac:ammo_";

// ── Guardar al desconectarse ─────────────────────────────────────
world.afterEvents.playerLeave.subscribe(ev => {
    // playerLeave solo tiene playerId/playerName, no la entidad.
    // Usamos beforeEvents.playerLeave para tener acceso a la entidad.
});

world.beforeEvents.playerLeave.subscribe(ev => {
    const player = ev.player;
    try {
        for (const sbId of SCOREBOARDS) {
            const obj = world.scoreboard.getObjective(sbId);
            if (!obj) continue;
            let score = 0;
            try { score = obj.getScore(player.scoreboardIdentity) ?? 0; } catch {}
            player.setDynamicProperty(PREFIX + sbId, score);
        }
    } catch {}
});

// ── Restaurar al conectarse ──────────────────────────────────────
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return; // solo al entrar por primera vez, no al respawnear

    const player = ev.player;

    // Pequeño delay para que los scoreboards estén inicializados
    system.runTimeout(() => {
        try {
            for (const sbId of SCOREBOARDS) {
                const saved = player.getDynamicProperty(PREFIX + sbId);
                if (saved === undefined || saved === null) continue;

                const savedVal = Math.floor(Number(saved));
                if (isNaN(savedVal) || savedVal <= 0) continue;

                let obj = world.scoreboard.getObjective(sbId);
                if (!obj) {
                    try { obj = world.scoreboard.addObjective(sbId, sbId); } catch { continue; }
                }
                obj.setScore(player, savedVal);
            }
        } catch {}
    }, 20); // 1 segundo de delay
});
