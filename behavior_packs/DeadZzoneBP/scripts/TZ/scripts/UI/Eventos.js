// Eventos.js
// Modularización de la lógica de eventos para Minecraft Bedrock
// Todas las notificaciones usan /title y sonido

// Variables globales de eventos
let airdropActivo = false;
let airdropTimer = null;
let airdropTimeLeft = 0;
let keepInventoryTimeout = null;
let airdropMusicLoop = null;
let HISTORIAL_KEY = "historial_eventos";
let rankingEvento = [];
let participantesAirdrop = [];
let ganadorManual = null;
let comandosPremioManual = [];
let bossInterval = null;

// Utilidad para notificar con /title y sonido
function notificarEvento(player, titulo, subtitulo = "", sonido = "random.levelup") {
    player.runCommand(`title @s title ${titulo}`);
    if (subtitulo) player.runCommand(`title @s subtitle ${subtitulo}`);
    if (sonido) player.runCommand(`playsound ${sonido} @s`);
}

// Ejemplo: Participar en evento
function participarEnEvento(player) {
    if (airdropActivo) {
        notificarEvento(player, "¡Ya estás participando!", "Espera el siguiente evento", "note.pling");
        return;
    }
    airdropActivo = true;
    participantesAirdrop.push(player.name);
    notificarEvento(player, "¡Te has unido al evento!", "Suerte...", "random.orb");
}

// Ejemplo: Cooldown
function notificarCooldown(player, segundos) {
    notificarEvento(player, "Cooldown", `Espera ${segundos}s para participar`, "block.note_block.bass");
}

// Ejemplo: Inicio de evento
function iniciarEvento(players) {
    airdropActivo = true;
    airdropTimeLeft = 60;
    players.forEach(p => notificarEvento(p, "¡Evento iniciado!", "Busca el airdrop", "entity.experience_orb.pickup"));
}

// Ejemplo: Fin de evento
function finalizarEvento(players, ganador) {
    airdropActivo = false;
    players.forEach(p => notificarEvento(p, "¡Evento finalizado!", ganador ? `Ganador: ${ganador}` : "Sin ganador", "ui.toast.challenge_complete"));
}

// Ejemplo: Recompensa
function darRecompensa(player, recompensa) {
    notificarEvento(player, "¡Recompensa!", recompensa, "random.levelup");
    // Aquí lógica para dar el ítem
}

// Exportar funciones principales
export {
    participarEnEvento,
    notificarCooldown,
    iniciarEvento,
    finalizarEvento,
    darRecompensa,
    notificarEvento
};
