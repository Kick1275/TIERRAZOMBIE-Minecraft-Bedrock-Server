import { world, system } from "@minecraft/server";

const SONGS        = ["play.music"];
const TAG_DISABLED = "music:disabled";
const INTERVAL     = 4500; // 10 segundos en ticks (cambiar a 4500 en producción)

function pickSong() {
    return SONGS[Math.floor(Math.random() * SONGS.length)];
}

// Un solo interval global — recorre todos los jugadores
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (player.hasTag(TAG_DISABLED)) continue;
        try {
            const vol = (() => { try { const v = player.getDynamicProperty("music:volume"); return typeof v === "number" ? v : 1; } catch { return 1; } })();
            player.runCommand(`playsound ${pickSong()} @s ~ ~ ~ ${vol}`);
        } catch {}
    }
}, INTERVAL);

export function startMusic(player) {
    try {
        const vol = (() => { try { const v = player.getDynamicProperty("music:volume"); return typeof v === "number" ? v : 1; } catch { return 1; } })();
        player.runCommand(`playsound ${pickSong()} @s ~ ~ ~ ${vol}`);
    } catch {}
}

export function stopMusic(player) {
    for (const s of SONGS) {
        try { player.runCommand(`stopsound @s ${s}`); } catch {}
    }
}

console.warn("[MusicSystem] Cargado");
