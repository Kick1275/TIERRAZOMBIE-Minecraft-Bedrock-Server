import { world, system } from "@minecraft/server";

const coordenadasAirdrop = [
    [-1995, 100, 747],
    [-1657, 100, 355],
    [-1382, 100, 431],
    [-1599, 100, 69],
    [-1507, 100, -144],
    [-1651, 100, 780],
    [-1887, 100, 796],
    [-1770, 100, 934],
];

const coordenadasParticula = [
    [-1995, 68, 747],
    [-1657, 72, 355],
    [-1382, 68, 431],
    [-1599, 68, 69],
    [-1507, 68, -144],
    [-1651, 68, 780],
    [-1887, 68, 796],
    [-1770, 68, 934],
];

function EspawnearDrop() {
    const indiceAleatorio = Math.floor(Math.random() * coordenadasAirdrop.length);
    const [x, y, z] = coordenadasAirdrop[indiceAleatorio];
    const coordenadasStr = `${x}, ${y}, ${z}`;

    const dimension = world.getDimension("overworld");
    dimension.runCommand(`summon mcpe:supply_drop ${x} ${y} ${z}`);
    dimension.runCommand(`playsound walkie.talkie @a`);

    // Spawnea 20 marauders a nivel de suelo (coordenadas de partículas)
    const [px, py, pz] = coordenadasParticula[indiceAleatorio];
    for (let i = 0; i < 10; i++) {
        dimension.runCommand(`summon mcpe:marauder ${px} ${py} ${pz}`);
    }

    enviarMensajeAirdrop(coordenadasStr);

    // Partícula: 30 minutos (1800 repeticiones, 1 por segundo)
    let ticksParticula = 1800;
    let particulaActiva = true;
    system.runInterval(() => {
        if (!particulaActiva) return;
        if (ticksParticula > 0) {
            try {
                dimension.runCommand(`particle tz:AirDropSmoke ${px} ${py} ${pz}`);
            } catch (e) {
                console.warn("Error lanzando partícula:", e);
            }
            ticksParticula--;
        } else {
            particulaActiva = false;
        }
    }, 20);

    // Mensajes: cada minuto durante 10 minutos (primer mensaje ya enviado)
    let repeticionesRestantes = 9;
    let mensajesActivos = true;
    system.runInterval(() => {
        if (!mensajesActivos) return;
        if (repeticionesRestantes > 0) {
            enviarMensajeAirdrop(coordenadasStr);
            repeticionesRestantes--;
        } else {
            mensajesActivos = false;
        }
    }, 1200);

    // Eliminar el bloque del drop después de 1.5 horas (108000 ticks)
    system.runTimeout(() => {
        dimension.runCommand(`fill -1995 67 747 -1995 67 747 air`);
        dimension.runCommand(`fill -1657 71 355 -1657 71 355 air`);
        dimension.runCommand(`fill -1382 67 431 -1382 67 431 air`);
        dimension.runCommand(`fill -1599 67 69 -1599 67 69 air`);
        dimension.runCommand(`fill -1507 67 -144 -1507 67 -144 air`);
        dimension.runCommand(`fill -1651 67 780 -1651 67 780 air`);
        dimension.runCommand(`fill -1887 67 796 -1887 67 796 air`);
        dimension.runCommand(`fill -1770 67 934 -1770 67 934 air`);
        particulaActiva = false;
        mensajesActivos = false;
    }, 108000);
}

function enviarMensajeAirdrop(coordenadas) {
    const dimension = world.getDimension("overworld");
    dimension.runCommand(`title @a title §4§lAir Drop Se ha Desplegado`);
    dimension.runCommand(`title @a subtitle §c§l§een las Coordenadas: ${coordenadas}`);
    dimension.runCommand(`say §e§lAir Drop Se ha Desplegado §r en las Coordenadas: ${coordenadas}`);
}

// Intervalo principal → cada 1.5 horas (108000 ticks)
let ticksHastaSiguienteAirdrop = 108000;
system.runInterval(() => {
    ticksHastaSiguienteAirdrop--;
    if (ticksHastaSiguienteAirdrop <= 0) {
        ticksHastaSiguienteAirdrop = 108000;
        EspawnearDrop();
    }
}, 1);

// Evento brújula
world.afterEvents.itemUse.subscribe(event => {
    const player = event.source;
    const { itemStack } = event;
    if (
        itemStack.typeId === "minecraft:compass" &&
        player.hasTag("admin")
    ) {
        EspawnearDrop();
    }
});
