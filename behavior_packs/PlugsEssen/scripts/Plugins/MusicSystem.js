import { world, system } from "@minecraft/server";

const SONGS        = ["play.music"];
const TAG_DISABLED = "music:disabled";
const INTERVAL     = 4500; // 10 segundos en ticks (cambiar a 4500 en producción)

function pickSong() {
    return SONGS[Math.floor(Math.random() * SONGS.length)];
}

// Lee el volumen guardado del jugador (por defecto 1.0). Un solo helper reutilizable.
function getVolume(player) {
    try {
        const v = player.getDynamicProperty("music:volume");
        return typeof v === "number" ? v : 1;
    } catch { return 1; }
}

// Un solo interval global — recorre todos los jugadores.
// Usa la API directa player.playSound() en vez de runCommand("playsound ...")
// para evitar el parser de comandos por jugador (mismo sonido y volumen).
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (player.hasTag(TAG_DISABLED)) continue;
        try {
            player.playSound(pickSong(), { volume: getVolume(player) });
        } catch {}
    }
}, INTERVAL);

export function startMusic(player) {
    try {
        const vol = getVolume(player);
        player.runCommand(`stopsound @s`);
        system.runTimeout(() => {
            try { player.playSound(pickSong(), { volume: vol }); } catch {}
        }, 20 * 2);
    } catch {}
}

export function stopMusic(player) {
    try { player.runCommand(`stopsound @s`); } catch {}
}

console.warn("[MusicSystem] Cargado");
