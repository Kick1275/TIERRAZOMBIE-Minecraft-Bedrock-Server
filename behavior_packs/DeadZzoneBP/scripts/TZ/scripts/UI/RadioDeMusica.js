console.warn('RD_index.js Cargado con exito')
import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const playerSettings = new Map();

world.afterEvents.itemUse.subscribe(data => {
    let player = data.source;
    if (data.itemStack.typeId == "tz:radio_musica") {
        player.runCommand('playsound random.orb');
        system.run(() => radioMenu(player));
    }
});

export function radioMenu(player) {
    const form = new ActionFormData()
        .title('§l§6📻 Radio de Música')
        .body('§7Elige una opción para controlar la música de fondo:')
        .button('§c⏹ Parar Música',"textures/ui/mute_on.png")
        .button('§b🎵 Elegir Música de Fondo', "textures/ui/video_glyph_color_2x.png")
        .button('§d🔀 Música Random', "textures/ui/icon_random.png")
        .button('§g📻 Estacion de radio\n§7Musica Infinita', "textures/ui/icon_random.png")
        .button('§e⚙ Configuración', "textures/ui/gear.png");

    form.show(player).then(r => {
        if (r.canceled) return;
        if (r.selection === 0) {
            player.runCommand('stopsound @s');
            player.sendMessage('§cMúsica detenida.');
        }
        if (r.selection === 1) {
            elegirMusica(player);
        }
        if (r.selection === 2) {
            reproducirCancion(player, { nombre: "Música Random (bs)", id: "bs" });
        }
        if (r.selection === 3) {
            EstacionRadio(player);
        }
        if (r.selection === 4) {
            configuracionRadio(player);
        }
    });
}

function elegirMusica(player) {
    const form = new ActionFormData()
        .title('§l§b🎶 Categorías de Música')
        .body('§7Selecciona una categoría para explorar canciones:')
        .button('§a🌿 Ambiente Relajante', "textures/items/record_far.png")
        .button('§c🔥 Música de Acción', "textures/items/record_chirp.png")
        .button('§d🎤 Música Vocal', "textures/items/record_13.png")
        .button('§5👻 Música de Terror', "textures/items/record_11.png")
        .button('§7⬅ Volver', "textures/ui/icon_import.png");

    form.show(player).then(r => {
        if (r.canceled) return;
        if (r.selection === 0) {
            mostrarListaMusica(player, "relax");
        }
        if (r.selection === 1) {
            mostrarListaMusica(player, "accion");
        }
        if (r.selection === 2) {
            mostrarListaMusica(player, "vocal");
        }
        if (r.selection === 3) {
            mostrarListaMusica(player, "terror");
        }
        if (r.selection === 4) {
            radioMenu(player);
        }
    });
}

function mostrarListaMusica(player, categoria) {
    let titulo = "";
    let canciones = [];
    let iconos = [];

    if (categoria === "relax") {
        titulo = "§a🌿 Ambiente Relajante";
        canciones = [
            { nombre: "TLOU", id: "bs4" },
            { nombre: "TLOU", id: "bs8" },
            { nombre: "TLOU", id: "bs9" },
            { nombre: "RDR-FarAway", id: "Music.3" },
            { nombre: "RDR-MuertosRojos", id: "Music.5" }
        ];
        iconos = ["textures/ui/music_disc_13.png", "textures/items/record_far.png"];
    }
    if (categoria === "accion") {
        titulo = "§c🔥 Música de Acción";
        canciones = [
            { nombre: "L4D Trailer", id: "bs1" },
            { nombre: "Susurros", id: "bs7" },
            { nombre: "Amanecer", id: "bs9" },
            { nombre: "RDR-BadVoodoo", id: "Music.1" },
            { nombre: "RDR-Showdownat", id: "Music.8" },
            { nombre: "RDR-StinkinZombies", id: "Music.9" }
        ];
        iconos = ["textures/ui/music_disc_pigstep.png", "textures/items/record_chirp.png"];
    }
    if (categoria === "vocal") {
        titulo = "§d🎤 Música Vocal";
        canciones = [
            { nombre: "TWD-", id: "bs10" },
            { nombre: "TWD-", id: "bs13" },
            { nombre: "TWD-", id: "bs14" },
            { nombre: "TDA-The Bomb!", id: "bs15" },
            { nombre: "TWD-", id: "bs16" },
            { nombre: "RDR-BadVoodoo", id: "Music.1" },
            { nombre: "RDR-DeadManWalking", id: "Music.2" },
            { nombre: "RDR-FarAway", id: "Music.3" },
            { nombre: "RDR-StinkinZombies", id: "Music.9" }
        ];
        iconos = ["textures/ui/music_disc_otherside.png", "textures/items/record_13.png"];
    }
    if (categoria === "terror") {
        titulo = "§5👻 Música de Terror";
        canciones = [
            { nombre: "Niebla Oscura", id: "bs2" },
            { nombre: "Susurros", id: "bs5" },
            { nombre: "Susurros", id: "bs7" },
            { nombre: "RDR-StinkinZombies", id: "Music.9" }
        ];
        iconos = ["textures/ui/music_disc_ward.png", "textures/items/record_11.png"];
    }

    const form = new ActionFormData()
        .title(titulo)
        .body('§7Elige una canción para reproducir:');

    canciones.forEach((cancion, i) => {
        form.button(`§a${cancion.nombre}`, iconos[i % iconos.length]);
    });

    form.button('§7⬅ Volver', "textures/ui/icon_import.png");

    form.show(player).then(r => {
        if (r.canceled) return;
        if (r.selection < canciones.length) {
            reproducirCancion(player, canciones[r.selection]);
        }
        if (r.selection === canciones.length) {
            elegirMusica(player);
        }
    });
}

export function reproducirCancion(player, cancion) {
    let settings = playerSettings.get(player.name) || { loop: true, volumen: 1 };
    player.runCommand('stopsound @s');
    player.runCommand(`playsound ${cancion.id} @s ~~~ ${settings.volumen} 1 0`);
    player.sendMessage(`§aReproduciendo: §f${cancion.nombre} §7(Volumen: ${Math.round(settings.volumen * 100)}%)`);
    if (settings.loop) {
        system.runTimeout(() => {
            reproducirCancion(player, cancion);
        }, 20 * 420);
    }
}

function configuracionRadio(player) {
    let settings = playerSettings.get(player.name) || { loop: true, volumen: 1 };
    let sliderValue = Math.round(settings.volumen * 100);

    const form = new ModalFormData()
        .title('§e⚙ Configuración de Radio')
        .toggle('§bMúsica en Bucle', settings.loop)
        .slider('§aVolumen (%)', 1, 100, 1, sliderValue);

    form.show(player).then(r => {
        if (!r.formValues || r.canceled) {
            player.sendMessage('§cConfiguración cancelada.');
            return;
        }
        const [loop, volumen] = r.formValues;
        settings.loop = loop;
        settings.volumen = volumen / 100;
        playerSettings.set(player.name, settings);
        player.sendMessage(
            `§eConfiguración actualizada:\n§bMúsica en Bucle: §r${settings.loop ? "§aSí" : "§cNo"}\n§aVolumen: §f${Math.round(settings.volumen * 100)}%`
        );
        radioMenu(player);
    });
}

function EstacionRadio(player){
    const form = new ActionFormData()
        .title('§l§6📻 Estación de Radio')
        .body('§7Disfruta de música infinita mientras juegas:')
        .button('§c⏹ Desconectarse', "textures/ui/mute_on.png")
        .button('§b🎵 Conectarse', "textures/ui/video_glyph_color_2x.png")

    form.show(player).then(r => {
        if (r.canceled) return;
        if (r.selection === 0) {
            player.runCommand('stopsound @s');
            player.sendMessage('§cTe has desconectado de la Estracion de Radio.');
            player.runCommand('tag @s remove radio_connected');
        }
        if (r.selection === 1) {
            player.sendMessage('§cTe has Conectado la Estracion de Radio.');
            player.runCommand('tag @s add radio_connected');
        }
    });
}