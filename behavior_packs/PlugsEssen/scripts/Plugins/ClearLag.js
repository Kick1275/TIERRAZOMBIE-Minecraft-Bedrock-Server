import { system, world } from "@minecraft/server";

// world.beforeEvents.itemUse.subscribe((ev) => {
//     const player = ev.source;
//     if (ev.itemStack.typeId === "minecraft:diamond") {
//      system.run(() => player.runCommand(`playsound random.break @s`));
//      system.run(() => player.runCommand(`say Hello!`));

//     }
// });

const TICKS_PER_SECOND = 20;

const CLEAR_INTERVAL_SECONDS = 60 * 10;
const WARN_30_SECONDS = 30;
const WARN_10_SECONDS = 10;
const CLEAR_ITEM_DELAY_SECONDS = 2;

function broadcastMessage(message) {
    world.sendMessage(message);
}

function runCommand(command) {
    try {
        world.getDimension("overworld").runCommand(command);
    } catch (error) {
        console.warn(`[ClearLag] Error ejecutando "${command}": ${error}`);
    }
}

function executeCleanup() {

    broadcastMessage("§c[ClearLag] §fEjecutando limpieza...");

    runCommand("kill @e[family=monster]");
    runCommand("kill @e[family=bullet]");
    runCommand("kill @e[type=bee]");

    // Esperar 2 segundos para que los mobs suelten items
    system.runTimeout(() => {
        runCommand("kill @e[type=item]");
        broadcastMessage("§a[ClearLag] §fLimpieza completada.");
    }, CLEAR_ITEM_DELAY_SECONDS * TICKS_PER_SECOND);
}

function startCycle() {

    broadcastMessage(
        `§c[ClearLag] §fLa limpieza se ejecutará en ${CLEAR_INTERVAL_SECONDS / 60} minutos.`
    );

    // Aviso de 30 segundos restantes
    system.runTimeout(() => {
        broadcastMessage(
            "§e[ClearLag] §fLa limpieza se ejecutará en 30 segundos."
        );
    }, (CLEAR_INTERVAL_SECONDS - WARN_30_SECONDS) * TICKS_PER_SECOND);

    // Aviso de 10 segundos restantes
    system.runTimeout(() => {
        broadcastMessage(
            "§6[ClearLag] §fLa limpieza se ejecutará en 10 segundos."
        );
    }, (CLEAR_INTERVAL_SECONDS - WARN_10_SECONDS) * TICKS_PER_SECOND);

    // Ejecutar limpieza
    system.runTimeout(() => {
        executeCleanup();
    }, CLEAR_INTERVAL_SECONDS * TICKS_PER_SECOND);
}

// Esperar a que el mundo termine de cargar
system.run(() => {

    startCycle();

    system.runInterval(() => {
        startCycle();
    }, CLEAR_INTERVAL_SECONDS * TICKS_PER_SECOND);

});

world.afterEvents.chatSend.subscribe((ev) => {
    const message = ev.message.toLowerCase();
    const player = ev.sender;
    if (message === "!clearlag" && player.hasTag("admin")  ) {
        ev.cancel = true;
        broadcastMessage(`§c[ClearLag] §fLimpieza manual iniciada por ${player.name}.`);
        executeCleanup();
    }
});