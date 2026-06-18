console.warn("UI principal Actualisada Cargado correctamente");
import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { radioMenu } from "./RadioDeMusica.js";
import { playerLogSystem } from "../Plugs/AdminPlugs/Log_Regist.js";
import { showLobbyMenu } from "./LobyUi.js";
import { showEffectShop } from "../Plugs/EffectShop.js";
import * as mc from "@minecraft/server";



const teleportCooldowns = new Map();
const languages = {
    en_US: {
        title_main_menu: "§6Main Menu",
        welcome_message: "§7Welcome, §a{player}§7! What would you like to do today?",
        teleports: "§bTeleports\n§7[ Important locations ]",
        kits: "§aKits\n§7[ Claim your kits ]",
        skills: "§cSkills\n§7[ Improve your abilities ]",
        settings: "§eSettings\n§7[ Adjust your experience ]",
        exit: "§4Exit Menu",
        settings_title: "§eSettings",
        language: "§bLanguage",
        save: "§aSave Changes",
        cancel: "§cCancel",
        language_saved: "§aLanguage saved successfully!",
        teleports_body: "§7Select a place to teleport:",
        teleports_spawn: "§aSpawn\n§7[ Return to the start ]",
        teleports_pvp: "§ePvP Zone\n§7[ Fight other players ]",
        teleports_mine: "§6Mine\n§7[ Gather resources ]",
        teleports_back: "§4Back to Main Menu",
        kits_body: "§7Select a kit to claim:",
        kits_starter: "§l§4SpecOps Kit\n§7[ Expert Equipment ]",
        kits_warrior: "§l§2Military Kit\n§7[ Advanced Equipment ]",
        kits_miner: "§l§6Mercenary Kit\n§7[ Basic Equipment ]",
        kits_claimed: "§c[ Already claimed ]",
        kits_back: "§4Back to Main Menu",
        skills_body: "§7Select a skill to improve:",
        skills_speed: "§4SpecOps\n§7[ click to activate ]",
        skills_strength: "§2Militar\n§7[ click to activate ]",
        skills_resistance: "§6Ranger\n§7[ click to activate ]",
        skills_back: "§4Back to Main Menu",
        guides: "§6Guides\n§r§7[ Learn more about the game ]",
    },
    es_ES: {
        title_main_menu: "§6Menú Principal",
        welcome_message: "§7¡Bienvenido, §a{player}§7! ¿Qué deseas hacer hoy?",
        teleports: "§bTeletransportes\n§7[ Lugares importantes ]",
        kits: "§aKits\n§7[ Reclama tus kits ]",
        skills: "§cHabilidades\n§7[ Mejora tus habilidades ]",
        settings: "§eConfiguraciones\n§7[ Ajusta tu experiencia ]",
        exit: "§4Salir del Menú",
        settings_title: "§eConfiguraciones",
        language: "§bIdioma",
        save: "§aGuardar Cambios",
        cancel: "§cCancelar",
        language_saved: "§aIdioma guardado correctamente.",
        teleports_body: "§7Selecciona un lugar para teletransportarte:",
        teleports_spawn: "§aSpawn\n§7[ Regresa al inicio ]",
        teleports_pvp: "§eZona PvP\n§7[ Lucha contra otros jugadores ]",
        teleports_mine: "§6Mina\n§7[ Recolecta recursos ]",
        teleports_back: "§4Regresar al Menú Principal",
        kits_body: "§7Selecciona un kit para reclamar:",
        kits_starter: "§l§4Kit SpecOps\n§7[ Equipamiento Experto ]",
        kits_warrior: "§l§2Kit Militar\n§7[ Equipamiento Avanzado ]",
        kits_miner: "§l§6Kit Mercenario\n§7[ Equipamiento Basico ]",
        kits_claimed: "§c[ Ya reclamado ]",
        kits_back: "§4Regresar al Menú Principal",
        skills_body: "§7Selecciona una habilidad para mejorar:",
        skills_speed: "§4SpecOps\n§7[ Click para activar ]",
        skills_strength: "§2Militar\n§7[ Click para activar ]",
        skills_resistance: "§6Mercenario\n§7[ Click para activar ]",
        skills_back: "§4Regresar al Menú Principal",
        guides: "§6Guias\n§r§7[ Aprende más sobre el juego ]",
    }
};

function getPlayerLanguage(player) {
    if (player.hasTag("lang_es_ES")) return "es_ES";
    return "en_US";
}

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    if (event.itemStack.typeId === "tz:telefono_iu") {
        system.run(() => showMainTZMenu(player));
    }
    if (event.itemStack.typeId === "tz:habilidad_specops") {
        system.run(() => SpecOps(player));
    }
    if (event.itemStack.typeId === "tz:habilidad_militar") {
        system.run(() => Militar(player));
    }
    if (event.itemStack.typeId === "tz:habilidad_marcenario") {
        system.run(() => Mercenario(player));
    }
});

const eventoTpCooldown = new Map();

function mostrarMenuPrincipal(player) {
    const lang = getPlayerLanguage(player);
    const texts = languages[lang];

    const form = new ActionFormData()
        .title(texts.title_main_menu)
        .body(texts.welcome_message.replace("{player}", player.nameTag))
        .button(lang === "es_ES" ? "§cLobby UI\n§7[ Click para entrar ]" : "§cLobby UI\n§7[ Click to enter ]", "textures/ui/icon_best3.png")
        .button(texts.teleports, "textures/ui/world_glyph_color.png")
        .button(texts.kits, "textures/ui/Add-Ons_Nav_Icon36x36.png")
        .button(texts.skills, "textures/ui/icon_armor.png")
        .button(texts.guides, "textures/ui/creative_icon.png")
        .button(lang === "es_ES" ? "§bEventos\n§7[ Participa en Eventos! ]" : "§b✈ Event\n§7[ Join the Events! ]", "textures/ui/icon_best3.png")
        .button(lang === "es_ES" ? "§dMúsica de Fondo\n§7[ Abre la radio ]" : "§dBackground Music\n§7[ Open radio ]", "textures/items/record_cat.png")
        .button(texts.settings, "textures/ui/icon_setting.png");

    if (player.hasTag("Admin")) {
        form.button(lang === "es_ES" ? "§cAdministración" : "§cAdministration", "textures/ui/creator_glyph_color.png");
    }
    form.button(texts.exit, "textures/ui/icon_book_writable.png");
    form.button(lang === "es_ES" ? "§cVolver al Menú TZ" : "§cBack to TZ Menu", "textures/ui/arrow_left.png"); // Botón para regresar

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§cYou closed the menu.");
            return;
        }
        switch (response.selection) {
            case 0: showLobbyMenu(player); break;
            case 1: mostrarTeletransportes(player); break;
            case 2: mostrarKits(player); break;
            case 3: mostrarHabilidades(player); break;
            case 4: Guias(player); break;
            case 5: mostrarEventoAirdrop(player); break;
            case 6: radioMenu(player); break;
            case 7: mostrarConfiguraciones(player); break;
            case 8:
                if (player.hasTag("Admin")) mostrarAdministracion(player);
                else player.sendMessage("§cYou exited the menu.");
                break;
            case 9: player.sendMessage("§cYou exited the menu."); break;
            case 10: showMainTZMenu(player); break; // Nuevo botón para regresar al menú TZ
        }
    });
}

function mostrarEventoAirdrop(player) {
    const lang = getPlayerLanguage(player);
    const eventoActivo = !!world.getDynamicProperty("airdrop_event");
    const participando = player.hasTag("participando_airdrop");
    let form = new ActionFormData()
        .title("§b✈ Evento AirDrop")
        .body(eventoActivo
            ? (lang === "es_ES"
                ? "¡El AirDrop está en curso! Participa para obtener recompensas. Zona: §e-1491 63 389"
                : "The AirDrop event is active! Participate for rewards. Zone: §e-1491 63 389")
            : (lang === "es_ES"
                ? "No hay evento AirDrop activo."
                : "No AirDrop event is active."));

    if (eventoActivo && !participando) {
        form.button(lang === "es_ES" ? "§aParticipar" : "§aParticipate", "textures/ui/confirm.png");
    }
    if (eventoActivo && participando) {
        form.button(lang === "es_ES" ? "§bIr al evento" : "§bGo to event", "textures/ui/icon_location.png");
    }
    form.button(lang === "es_ES" ? "§cVolver" : "§cBack", "textures/ui/arrow_left.png");

    form.show(player).then((response) => {
        if (response.canceled) return;
        let idx = 0;
        if (eventoActivo && !participando && response.selection === idx++) {
            player.addTag("participando_airdrop");
            player.sendMessage("§a¡Ahora participas en el evento AirDrop!");
            mostrarEventoAirdrop(player);
        } else if (eventoActivo && participando && response.selection === idx++) {
            const now = Date.now();
            const lastTp = eventoTpCooldown.get(player.nameTag) || 0;
            if (now - lastTp < 60 * 1000) {
                player.sendMessage("§cDebes esperar 1 minuto para volver a teletransportarte.");
                return mostrarEventoAirdrop(player);
            }
            eventoTpCooldown.set(player.nameTag, now);

            const coords = [
                [-1517, 150, 401],
                [-1513, 150, 459],
                [-1512, 150, 350]
            ];
            const destino = coords[Math.floor(Math.random() * coords.length)];
            const initialPosition = player.location;
            let countdownTime = 5;
            let intervalId;

            player.sendMessage("§eMantente quieto durante 5 segundos para ir al evento.");
            player.runCommand("playsound random.orb @s");

            intervalId = system.runInterval(() => {
                const currentPosition = player.location;
                if (
                    currentPosition.x !== initialPosition.x ||
                    currentPosition.y !== initialPosition.y ||
                    currentPosition.z !== initialPosition.z
                ) {
                    player.sendMessage("§cTe has movido. El teletransporte ha sido cancelado.");
                    system.clearRun(intervalId);
                    return;
                }
                player.sendMessage(`§eTiempo restante: ${countdownTime} segundos.`);
                countdownTime--;
                if (countdownTime <= 0) {
                    system.clearRun(intervalId);
                    player.runCommand("camera @s fade time 0.1 1 1");
                    player.runCommand("playsound Machines.HeliPas @s");
                    system.runTimeout(() => {
                        player.runCommand(`tp @s ${destino[0]} ${destino[1]} ${destino[2]}`);
                        player.runCommand("effect @s resistance 5 90 true");
                        player.runCommand("effect @s slow_falling 25 100 true");
                        player.runCommand("effect @s weakness 5 250 true");
                        player.sendMessage("§b¡Has sido transportado a la zona del evento!");
                    }, 10);
                }
            }, 20);
        }
        else if (response.selection === idx) {
            showMainTZMenu(player); // Cambiado a la nueva UI
        }
    });
}

function mostrarConfiguraciones(player) {
    const lang = getPlayerLanguage(player);
    const texts = languages[lang];
    const form = new ModalFormData()
        .title(texts.settings_title)
        .textField(getStatsBanner(player, lang), "", ""); // Añadir banner como texto de solo lectura

    form.show(player).then((response) => {
        if (!response.formValues || response.canceled) {
            player.sendMessage("§cYou canceled the settings.");
            return;
        }

        const [selectedLanguage, selectedCharacter, save] = response.formValues;

        if (save) {
            if (selectedLanguage === 0) {
                player.addTag("lang_es_ES");
                player.removeTag("lang_en_US");
            } else {
                player.addTag("lang_en_US");
                player.removeTag("lang_es_ES");
            }

            player.removeTag("Character_Couch");
            player.removeTag("Character_Ellis");
            player.removeTag("Character_Roushell");
            player.removeTag("Character_Nick");

            switch (selectedCharacter) {
                case 0:
                    player.addTag("Character_Couch");
                    break;
                case 1:
                    player.addTag("Character_Ellis");
                    break;
                case 2:
                    player.addTag("Character_Roushell");
                    break;
                case 3:
                    player.addTag("Character_Nick");
                    break;
            }

            player.sendMessage(
                lang === "es_ES"
                    ? "§aConfiguraciones guardadas correctamente."
                    : "§aSettings saved successfully."
            );
        } else {
            player.sendMessage(
                lang === "es_ES"
                    ? "§eConfiguraciones no guardadas."
                    : "§eSettings not saved."
            );
        }
    });
}

function mostrarTeletransportes(player) {
    const lang = getPlayerLanguage(player);
    const texts = languages[lang];

    const form = new ActionFormData()
        .title(texts.teleports)
        .body(texts.teleports_body)
        .button(texts.teleports_spawn)
        .button(texts.teleports_mine)
        .button(texts.teleports_back)
        .button(lang === "es_ES" ? "§cVolver al Menú TZ" : "§cBack to TZ Menu", "textures/ui/arrow_left.png"); // Botón para regresar

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§cHas cerrado el menú de teletransportes.");
            return;
        }

        const playerId = player.nameTag;

        if (teleportCooldowns.has(playerId)) {
            const remainingTime = Math.ceil((teleportCooldowns.get(playerId) - Date.now()) / 1000);
            if (remainingTime > 0) {
                player.sendMessage(`§cAún estás en enfriamiento. Puedes usar otro teletransporte en ${remainingTime} segundos.`);
                return;
            } else {
                teleportCooldowns.delete(playerId);
            }
        }

        switch (response.selection) {
            case 0:
                iniciarTeletransporte(player, "tp @s -1797.47 252.00 2101.49", texts.teleports_spawn);
                break;
            case 1:
                iniciarTeletransporte(player, "tp @s 1471 318 -2076", texts.teleports_mine);
                break;
            case 2:
                showMainTZMenu(player); // Cambiado a la nueva UI
                break;
            case 3:
                showMainTZMenu(player); // Nuevo botón para regresar al menú TZ
                break;
        }
    });
}

function iniciarTeletransporte(player, command, successMessage) {
    const playerId = player.nameTag;
    const countdownTime = 10;
    const initialPosition = player.location;

    player.sendMessage(`§eMantente quieto durante ${countdownTime} segundos para teletransportarte.`);

    let timeoutId;
    let remainingTime = countdownTime;

    const interval = system.runInterval(() => {
        const currentPosition = player.location;

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage("§cTe has movido. El teletransporte ha sido cancelado.");
            system.clearRun(interval);
            if (timeoutId) system.clearRun(timeoutId);
            return;
        }

        player.runCommand("playsound random.orb @s");
        player.sendMessage(`§eTiempo restante: ${remainingTime} segundos.`);
        remainingTime--;

        if (remainingTime <= 0) {
            system.clearRun(interval);
        }
    }, 20);

    timeoutId = system.runTimeout(() => {
        system.clearRun(interval);
        player.runCommand(command);
        player.sendMessage(successMessage);
        iniciarTeleportCooldown(player);
    }, countdownTime * 20);
}

function iniciarTeleportCooldown(player) {
    const playerId = player.nameTag;
    const cooldownTime = 10 * 1000;

    teleportCooldowns.set(playerId, Date.now() + cooldownTime);

    system.runTimeout(() => {
        player.sendMessage("§aTu tiempo de enfriamiento de teletransporte ha terminado. Ahora puedes usar otro teletransporte.");
        teleportCooldowns.delete(playerId);
    }, cooldownTime / 50);
}

function mostrarKits(player) {
    const lang = getPlayerLanguage(player);
    const texts = languages[lang];

    const hasClaimedStarterKit = player.hasTag("claimed_SpecOps_kit");
    const hasClaimedWarriorKit = player.hasTag("claimed_Militar_kit");
    const hasClaimedMinerKit = player.hasTag("claimed_Mercenario_kit");

    const form = new ActionFormData()
        .title(texts.kits)
        .body(texts.kits_body)
        .button(hasClaimedStarterKit ? texts.kits_claimed : texts.kits_starter)
        .button(hasClaimedWarriorKit ? texts.kits_claimed : texts.kits_warrior)
        .button(hasClaimedMinerKit ? texts.kits_claimed : texts.kits_miner)
        .button(texts.kits_back);

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§l§4[!]>>> §cHas cerrado el menú de kits.");
            return;
        }

        switch (response.selection) {
            case 0:
                if (hasClaimedStarterKit) {
                    player.sendMessage("§l§4[!]>>> §c¡Ya has reclamado el Kit Spec Ops!");
                } else if (player.hasTag("SpecOps")) {
                    player.runCommand("give @s minecraft:stone_pickaxe");
                    player.runCommand('tag @s add rank:§l§cSPECOPS§r');
                    player.runCommand('tag @s add claimed_SpecOps_kit');
                    player.sendMessage("§l§2[!]>>> §a¡Has reclamado el Kit Spec Ops con éxito!");
                } else {
                    player.sendMessage("§l§4[!]>>> §cNo tienes el permiso necesario para reclamar este kit.\n§e¡Cómpralo en la tienda web del servidor!");
                }
                break;
            case 1:
                if (hasClaimedWarriorKit) {
                    player.sendMessage("§l§4[!]>>> §c¡Ya has reclamado el Kit Militar!");
                } else if (player.hasTag("Militar")) {
                    player.runCommand("give @s minecraft:iron_sword");
                    player.runCommand('tag @s add rank:§l§2MILITAR§r');
                    player.runCommand('tag @s add claimed_Militar_kit');
                    player.sendMessage("§l§2[!]>>> §a¡Has reclamado el Kit Militar con éxito!)");
                } else {
                    player.sendMessage("§l§4[!]>>> §cNo tienes el permiso necesario para reclamar este kit.\n§e¡Cómpralo en la tienda web del servidor!");
                }
                break;
            case 2:
                if (hasClaimedMinerKit) {
                    player.sendMessage("§l§4[!]>>> §c¡Ya has reclamado el Kit Mercenario!");
                } else if (player.hasTag("Mercenario")) {
                    player.runCommand("give @s minecraft:diamond_pickaxe");
                    player.runCommand('tag @s add rank:§l§6MERCENARIO§r');
                    player.runCommand('tag @s add claimed_Mercenario_kit');
                    player.sendMessage("§l§2[!]>>> §a¡Has reclamado el Kit Mercenario con éxito!");
                } else {
                    player.sendMessage("§l§4[!]>>> §cNo tienes el permiso necesario para reclamar este kit.\n§e¡Cómpralo en la tienda web del servidor!");
                }
                break;
            case 3:
                showMainTZMenu(player); // Cambiado a la nueva UI
                break;
        }
    });
}

const cooldowns = new Map();

function mostrarHabilidades(player) {
    const lang = getPlayerLanguage(player);
    const texts = languages[lang];

    const form = new ActionFormData()
        .title(texts.skills)
        .body(texts.skills_body)
        .button(texts.skills_speed)
        .button(texts.skills_strength)
        .button(texts.skills_resistance)
        .button(texts.skills_back);

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§cHas cerrado el menú de habilidades.");
            return;
        }

        const playerId = player.nameTag;

        if (cooldowns.has(playerId)) {
            const remainingTime = Math.ceil((cooldowns.get(playerId) - Date.now()) / 1000);
            if (remainingTime > 0) {
                player.sendMessage(`§l§4[!]>>>§r §cAún estás en enfriamiento. Puedes usar otra habilidad en ${remainingTime} segundos.`);
                return;
            } else {
                cooldowns.delete(playerId);
            }
        }

        switch (response.selection) {
            case 0:
                if (player.hasTag("SpecOps")) {
                    iniciarCooldown(player);
                    player.runCommand('replaceitem entity @s slot.hotbar 8 tz:habilidad_specops 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
                    player.sendMessage("§aHas recibido la habilidad Spec Ops.");
                } else {
                    player.sendMessage("§cNo tienes la etiqueta necesaria para recibir esta habilidad.");
                }
                break;
            case 1:
                if (player.hasTag("Militar")) {
                    iniciarCooldown(player);
                    player.runCommand('replaceitem entity @s slot.hotbar 8 tz:habilidad_militar 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
                    player.sendMessage("§aHas recibido la habilidad Militar.");
                } else {
                    player.sendMessage("§cNo tienes la etiqueta necesaria para recibir esta habilidad.");
                }
                break;
            case 2:
                if (player.hasTag("Mercenario")) {
                    iniciarCooldown(player);
                    player.runCommand('replaceitem entity @s slot.hotbar 8 tz:habilidad_marcenario 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
                    player.sendMessage("§aHas recibido la habilidad Mercenario.");
                } else {
                    player.sendMessage("§cNo tienes la etiqueta necesaria para recibir esta habilidad.");
                }
                break;
            case 3:
                showMainTZMenu(player); // Cambiado a la nueva UI
                break;
        }
    });
}

function iniciarCooldown(player) {
    const playerId = player.nameTag;
    const cooldownTime = 30 * 60 * 1000; // 30 minutos en milisegundos

    cooldowns.set(playerId, Date.now() + cooldownTime);

    system.runTimeout(() => {
        player.sendMessage("§l§4[!]>>>§r §aTu tiempo de enfriamiento ha terminado. Ahora puedes usar otra habilidad.");
        cooldowns.delete(playerId);
    }, cooldownTime / 50);
}

function Guias(player) {
    const lang = player.hasTag("lang_es_ES") ? "es" : "en";
    mostrarGuias(player, lang);
}

function mostrarGuias(player, lang) {
    const guias = lang === "es" ? obtenerGuiasEspanol() : obtenerGuiasIngles();

    const form = new ActionFormData()
        .title(lang === "es" ? "§l§6📚 Guias de Supervivencia\n§r§7[Selecciona una guía para leer]" : "§l§6📚 Survival Guides\n§r§7[Select a guide to read]");

    guias.forEach(guia => {
        form.button(`§e${guia.titulo}\n§7${guia.subtitulo}`, guia.icono);
    });

    form.show(player)
        .then(r => {
            if (r.selection !== undefined) {
                mostrarContenidoGuia(player, guias[r.selection].archivo, lang);
            }
        })
        .catch(e => console.error("Error al mostrar las guías:", e));
}

function mostrarContenidoGuia(player, archivo, lang) {
    const contenidoGuia = obtenerContenidoArchivo(archivo);
    new ActionFormData()
        .title(lang === "es" ? "§l§6📖 Contenido de la Guía" : "§l§6📖 Guide Content")
        .body(`§r${contenidoGuia}`)
        .button(lang === "es" ? "§a⬅ Volver a Guías" : "§a⬅ Return to Guides")
        .show(player)
        .then(() => mostrarGuias(player, lang))
        .catch(e => console.error("Error al mostrar el contenido de la guía:", e));
}

function obtenerGuiasEspanol() {
    return [
        { titulo: "Comandos Básicos", subtitulo: "Aprende los comandos esenciales", archivo: "es_comandos_basicos.txt", icono: "textures/ui/ImpulseSquare.png" },
        { titulo: "Consejos v1", subtitulo: "Sugerencias para sobrevivir", archivo: "es_consejos.txt", icono: "textures/ui/icon_book_writable.png" },
        { titulo: "Trapos y Trapos Sucios", subtitulo: "Cómo usarlos y limpiarlos", archivo: "es_trapos.txt", icono: "textures/items/medic/rags.png" },
        { titulo: "Comida enlatada", subtitulo: "Cómo abrir y usar latas", archivo: "es_latas.txt", icono: "textures/items/food/open/canned_bacon_open.png" },
        { titulo: "Infecciones", subtitulo: "Cómo tratarlas y prevenirlas", archivo: "es_infecciones.txt", icono: "textures/ui/wither_effect.png" },
        { titulo: "Hueso roto", subtitulo: "Cómo curar fracturas", archivo: "es_huesos_rotos.txt", icono: "textures/ui/slowness_effect.png" },
        { titulo: "Sigilo", subtitulo: "Evita ser detectado", archivo: "es_sigilo.txt", icono: "textures/ui/wind_charged_effect.png" },
        { titulo: "Botella Sospechosa", subtitulo: "Cómo vaciar o usar agua", archivo: "es_Agua_Sospechosa.txt", icono: "textures/items/drink/bottle_water_emp.png" },
        { titulo: "Rellenar Agua", subtitulo: "Cómo rellenar y purificar", archivo: "es_rellenar_augua.txt", icono: "textures/items/drink/bottle_water_unpure.png" },
        { titulo: "Sangrado", subtitulo: "Cómo detener el sangrado", archivo: "es_sangrado.txt", icono: "textures/ui/heart_flash.png" },
        { titulo: "Consejos v2", subtitulo: "Más sugerencias útiles", archivo: "es_consejos2.txt", icono: "textures/ui/icon_book_writable.png" },
        { titulo: "Ojos Rojos", subtitulo: "Identifica a los corredores", archivo: "es_ojos_rojos.txt", icono: "textures/ui/blindness_effect.png" },
        { titulo: "Raideo y Protección", subtitulo: "Protege tu base y aprende a raidear", archivo: "es_raideo_proteccion.txt", icono: "textures/ui/icon_armor.png" }
    ];
}

function obtenerGuiasIngles() {
    return [
        { titulo: "Basic Commands", subtitulo: "Learn essential commands", archivo: "en_basic_commands.txt", icono: "textures/ui/ImpulseSquare.png" },
        { titulo: "Tips v1", subtitulo: "Survival suggestions", archivo: "en_tips.txt", icono: "textures/ui/icon_book_writable.png" },
        { titulo: "Rags Guide", subtitulo: "How to use and clean them", archivo: "en_rags.txt", icono: "textures/items/medic/rags.png" },
        { titulo: "Canned Food", subtitulo: "How to open and use cans", archivo: "en_cans.txt", icono: "textures/items/food/open/canned_bacon_open.png" },
        { titulo: "Infections", subtitulo: "How to treat and prevent them", archivo: "en_infections.txt", icono: "textures/ui/wither_effect.png" },
        { titulo: "Broken Bone", subtitulo: "How to heal fractures", archivo: "en_broken_bones.txt", icono: "textures/ui/slowness_effect.png" },
        { titulo: "Stealth", subtitulo: "Avoid being detected", archivo: "en_stealth.txt", icono: "textures/ui/wind_charged_effect.png" },
        { titulo: "Suspicious Water", subtitulo: "How to empty or use water", archivo: "en_suspicious_water.txt", icono: "textures/items/drink/bottle_water_emp.png" },
        { titulo: "Refilling Water", subtitulo: "How to refill and purify", archivo: "en_refill_water.txt", icono: "textures/items/drink/bottle_water_unpure.png" },
        { titulo: "Bleeding", subtitulo: "How to stop bleeding", archivo: "en_bleeding.txt", icono: "textures/ui/heart_flash.png" },
        { titulo: "Tips v2", subtitulo: "More useful suggestions", archivo: "en_tips2.txt", icono: "textures/ui/icon_book_writable.png" },
        { titulo: "Red Eyes", subtitulo: "Identify runners", archivo: "en_red_eyes.txt", icono: "textures/ui/blindness_effect.png" },
        { titulo: "Raiding & Protection", subtitulo: "Protect your base and learning to Raid", archivo: "en_raideo_proteccion.txt", icono: "textures/ui/icon_armor.png" }

    ];
}

function obtenerContenidoArchivo(nombreArchivo) {
    const archivos = {
        'es_comandos_basicos.txt':
            '§l§4Guía de Comandos Básicos\n§rAquí encontrarás comandos esenciales para empezar\n\n§e!tpa <jugador>\n§7Envía una solicitud de teletransporte a otro jugador.\n\n§e!tpaccept\n§7Acepta una solicitud de teletransporte recibida.\n\n§e!tpdeny\n§7Rechaza una solicitud de teletransporte.\n\n§e!spawn\n§7Te teletransporta al punto de aparición principal.\n\n§e!sethome\n§7Establece tu hogar para teletransportarte luego.\n\n§e!home\n§7Te teletransporta a tu hogar establecido.\n\n§e!kit\n§7Abre el menú de kits para reclamar recompensas.\n\n§e!help\n§7Muestra la lista de comandos disponibles.',
        'es_consejos.txt':
            '§l§6📖 Guía DeadZone: Consejos\n§r§7¡Sigue estos consejos para sobrevivir más tiempo en el apocalipsis!\n\n§e- Puedes §l§bCERRAR§r§7 las trampas para osos con un palo y luego romperlas para reutilizarlas.\n§e- Solo puedes obtener §l§bALAMBRE DE PÚAS§r§7 usando una cortadora de cables especial.\n§e- Puedes §l§bDESACTIVAR§r§7 una mina terrestre con un destornillador (¡pero cuidado! Hay un 50% de probabilidad de que explote).\n§e- Limpia §l§bTRAPOS SUCIOS§r§7 usando una bomba de agua para evitar infecciones.\n§e- Puedes §l§bENTERRAR§r§7 infectados, jugadores y supervivientes con una pala exclusiva de DeadZone.\n§e- Obtén §l§bCARNE§r§7 de jugadores y supervivientes usando cualquier cuchillo (¡solo si eres muy desesperado!).\n§e- Rellena una botella de agua vacía con §l§bLEJÍA§r§7 para hacer bromas pesadas (¡no lo hagas, es peligroso!).\n§e- §l§c¡CUIDADO!§r§7 Al visitar el bosque, hay minas terrestres y trampas para osos escondidas.\n\n§8Recuerda: La supervivencia depende de tu ingenio y precaución.',
        'es_trapos.txt':
            '§l§6🩹 Guía DeadZone: Trapos y Trapos Sucios\n§r§7Si te golpea un infectado, superviviente o jugador y comienzas a sangrar, pero no tienes una venda en tu inventario, no te preocupes: puedes usar la ropa de tu inventario para crear trapos y detener el sangrado.\n\n§e§lCómo crear un trapo:\n§r§71. Sostén cualquier prenda de ropa de tu inventario.\n2. Agáchate/camina sigilosamente.\n3. Golpea el aire o el suelo.\n§7Esto convertirá la ropa en un trapo.\n\n§e§lTres usos de los trapos en DeadZone:\n§r§7- Detener el sangrado.\n- Tratar huesos rotos.\n- Detener infecciones.\n\n§e§lTrapos sucios:\n§r§7Los trapos ahora tienen una versión sucia, entonces, §c¿cómo limpias un trapo sucio?\n\n§71. Sostén el trapo sucio.\n2. Ve al borde del agua (asegúrate de que sea un lago o río).\n3. Golpea cualquier bloque cerca del agua para limpiar el trapo.',
        'es_latas.txt':
            "§l§6🥫 Guía DeadZone: Comida Enlatada\n§r¡Sobrevive por más tiempo aprendiendo cómo abrir tu comida enlatada!\n\n§e- Si tienes mucha comida enlatada pero no sabes cómo abrirla, necesitas un §l§bARMA CUERPO A CUERPO FILOSA§r§7 o un §l§bABRELATAS§r§7.\n\n§e§lCómo abrir latas con un abrelatas:\n§r§71. Coloca la lata de comida en tu mano izquierda (ranura secundaria).\n2. Sostén el abrelatas en tu mano principal y mantén presionado el botón.\n§7Si no tienes un abrelatas, aún puedes abrirlas con armas cuerpo a cuerpo filosas.\n\n§e§lCómo abrir latas con un arma filosa:\n§r§71. Coloca la lata en tu mano derecha (ranura secundaria).\n2. Sostén un arma cuerpo a cuerpo filosa.\n3. Agáchate/camina sigilosamente y golpea el suelo.\n\n§c§lNota:§r§7 Si abres una lata con un arma filosa, obtendrás comida de menor calidad que llena menos la barra de hambre.\n\n§e§lLista de armas cuerpo a cuerpo para abrir latas:\n§r§7- Cuchillo de carnicero\n- Cuchillo de caza\n- Cuchillo de cocina\n- Hacha\n- Pico/Piolet\n- Destornillador\n- Hacha táctica\n\n§e§lComidas enlatadas que no necesitan abrelatas:\n§r§7- Atún enlatado\n- Jamón enlatado\n- Carne enlatada\n- Raciones enlatadas\n\n§8¡Mantente preparado y controla tu hambre!",
        'es_infecciones.txt':
            '§l§6🦠 Guía DeadZone: Infecciones\n§rSi te infectas por un infectado (causando un §cefecto de hambre infinito§7), intenta crear un §l§bTRAPO ESTERILIZADO§r§7 o §l§bVENDA ESTERILIZADA§r§7 combinando §l§b3 trapos§r§7 o §l§b2 vendas§r§7 con una §l§bTINTURA ALCOHÓLICA§r§7.\n\n§e§l¿Dónde encontrar tintura alcohólica?\n§r§7Se puede encontrar en casi cualquier botín, pero lo más rápido es saquear botines médicos.\n\n§c§lImportante:§r§7 Las vendas y trapos esterilizados solo reducen el nivel de infección, no lo eliminan por completo.\n\n§e§lAntídoto:\n§rAlternativamente, puedes usar un §l§bANTÍDOTO§r§7 para eliminar completamente la infección, pero para obtenerlo debes matar infectados con trajes Hazmat o infectados militares. Los antídotos son muy raros.',
        'es_huesos_rotos.txt':
            '§l§6🦴 Guía DeadZone: Hueso Roto (Efecto de Lentitud Infinita)\n§r§7Si caes desde una gran altura y te rompes un hueso, necesitarás una §l§cFÉRULA§r§7 para recuperarte.\n\n§e§lCómo hacer una férula:\n§r§7Para hacer una férula, necesitas:\n§l§c- 2 palos\n- 2 trapos\n\n§r§7- Para obtener palos: Tala árboles o encuéntralos en botines civiles.\n- §l§cPara obtener trapos:§r§7 Consulta la guía de trapos para más detalles.\n\n§7Cuando tengas los materiales, craftea la férula en la interfaz de fabricación del inventario.\n\n§e§lAlternativa:\n§r§7También puedes usar un §l§cAUTO-INYECTOR DE MORFINA§r§7 para curar el hueso roto.\n- Para obtener morfina: Busca en botines médicos o de bomberos.\n\n§8¡Recuerda: No podrás correr ni saltar hasta curarte!',
        'es_sigilo.txt':
            '§l§6👣 Guía DeadZone: Sigilo\n§r§7Si ves muchos infectados o merodeadores por delante, necesitas moverte sigilosamente para escapar. Recuerda, caminar sigilosamente solo funciona si los infectados o merodeadores no te han visto todavía.\n\n§e§lRangos de detección:\n§r§7- §cMerodeadores:§7 32 bloques\n- §cInfectados:§7 16 bloques\n- §aCaminando sigilosamente:§7 Solo te ven a 5 bloques de distancia\n\n§c§lImportante:§r§7 Mientras te mueves sigilosamente, evita disparar a menos que tengas un arma con silenciador, ya que el ruido atraerá la atención y empeorará la situación.\n\n§8¡El sigilo puede salvarte la vida!',
        'es_Agua_Sospechosa.txt':
            '§l§6💧 Guía DeadZone: Botella de Agua Sospechosa\n§r§7Si tienes 2 botellas de agua iguales que no se pueden apilar, es posible que desees vaciar una si sospechas de ella.\n\n§e§lCómo vaciar una botella de agua:\n§r§71. Sostén la botella de agua.\n2. Agáchate/camina sigilosamente, luego golpea el suelo.\n\n§c§lImportante:§r§7 No te agaches cuando desees beber de la botella de agua, ya que esta es una forma de vaciarla.\n\n§8¡Mejor prevenir que lamentar!',
        'es_rellenar_augua.txt':
            '§l§6💧 Guía DeadZone: Rellenar Agua\n§r§7Si tienes una §cbotella de agua vacía§7 o una §colle de cocina§7 y no sabes cómo rellenarla, aquí te explico qué hacer:\n\n§e§lCómo rellenar:\n§r§71. Sostén la botella o la olla vacía.\n2. Ve a la fuente de agua más cercana (como lagos o ríos).\n3. Golpea cualquier bloque cerca del agua.\n\n§7Al rellenar el agua, obtendrás §cagua no purificada§7. Necesitarás purificarla.\n\n§e§lPara purificar el agua:\n§r§7- Usa una botella de agua no purificada en una mesa de purificación de agua.\n- Hierve agua en una olla sobre el horno o la fogata.\n\n§8¡Mantente hidratado y evita enfermedades!',
        'es_sangrado.txt':
            "§l§4╔════════════════════╗\n§4🩸 Guía DeadZone: Sangrado §r\n§l§4╚════════════════════╝\n§7Cuando te atacan §cinfectados§7, §csupervivientes§7 o §cjugadores§7 y comienzas a sangrar,\ntus §cpuntos de sangre§7 seguirán disminuyendo hasta que §cmueras§7.\n\n§e§l🩹 Cómo restaurar tu sangre:\n§7- Usa §ftrapos limpios§7 o §fvendas§7 si estás sangrando.\n§7- Puedes encontrar vendas en cualquier tipo de §6botín§7.\n§7- Para hacer trapos, consulta la §bGuía de Trapos§7.\n§7- Usa una §c§lbolsa de sangre§r§7 para restaurar tu sangre.\n\n§e§l🧪 ¿Dónde encontrar una bolsa de sangre?\n§7Necesitas localizar una §cbolsa de sangre vacía§7 y un §ckit de prueba de sangre§7,\nque puedes encontrar dentro de una §cbolsa de primeros auxilios§7 en §abotines médicos§7.\n\n§c§l⚠ Importante:\n§7Cada jugador tiene su §6tipo de sangre§7 único.\n§7Usa un §ckit de prueba de sangre§7 para determinar tu tipo antes de usar una §cbolsa de sangre§7.\n§4Si usas el tipo de sangre incorrecto...\n§l§k¡¡¡MORIRÁS!!!§r",
        'es_consejos2.txt':
            "§l§4╔════════════════════╗\n§4🧩 Guía DeadZone: Consejos 2 §r\n§l§4╚════════════════════╝\n§7- Caminar o correr mientras estás §csangrando§7 aumentará tu nivel de sangrado.\n- Ahora necesitas una §bbrújula§7 para ver tus coordenadas.\n- Nunca ignores un cadáver §cHazmat§7; podrías obtener el §lantídoto§7.\n- §cEl antídoto es solo un mito.§7",
        'es_ojos_rojos.txt':
            "§l§4╔════════════════════╗\n§4👁️ Guía DeadZone: Ojos Rojos §r\n§l§4╚════════════════════╝\n§7En la versión 1.6.4, todos los ojos de los infectados ahora son blancos. ¿Qué pasa con los §crojos/naranja§7?\n§7Eso es un §c'Sprinter'§7, conocido como corredor. Tienen poca salud, pero son muy rápidos.\n§7Si encuentras un infectado con ojos rojos, significa que estás enfrentando a un §ccorredor§7.",
        'es_raideo_proteccion.txt':
            "§l§4╔════════════════════╗\n§4🛡️ Guía TIERRAZOMBIE: Raideo y Protección §r\n§l§4╚════════════════════╝\n§7¿Quieres proteger tu base o aprender a raidear?\n\n§e§lBloques de Protección:\n§7Compra bloques de protección en la zona segura con el Npc Raid. Hay tres tamaños: §cCobre§7 (11x11), §aEsmeralda§7 (21x21) y §bDiamante§7 (31x31).\n§7Evitan que otros coloquen o rompan bloques en tu área.\n\n§e§lTorretas de Hierro:\n§7Defiende tu base con torretas que atacan a intrusos y enemigos.\n\n§e§lCofres y Puertas Seguras:\n§7Compra el ítem de cofre seguro y la llave en la zona segura. Para puertas seguras, crea la mesa §bMD:Miter Saw§7 y fabrica puertas con llave.\n\n§e§lRaideo:\n§7Para raidear necesitas §cC4, granadas o bombas caseras§7. Se pueden craftear, comprar o encontrar en cajas de loot y air drops.\n\n§c§l⚠ Importante:\n§7No se pueden colocar protecciones en el Nether. No superpongas bloques de protección o se destruirán.\n§8¡Construye, protege y raidea como un verdadero superviviente!",
        'en_basic_commands.txt':
            '§l§4Basic Commands Guide\n§rHere you will find essential commands to get started\n\n§e!tpa <player>\n§7Send a teleport request to another player.\n\n§e!tpaccept\n§7Accept a received teleport request.\n\n§e!tpdeny\n§7Deny a teleport request.\n\n§e!spawn\n§7Teleport to the main spawn point.\n\n§e!sethome\n§7Set your home location to teleport later.\n\n§e!home\n§7Teleport to your set home.\n\n§e!kit\n§7Open the kits menu to claim rewards.\n\n§e!help\n§7Show the list of available commands.',
        'en_tips.txt':
            "§l§6📖 DeadZone Guide: Tips\n§rFollow these tips to survive longer in the apocalypse!\n\n§e- You can §l§bCLOSE§r§7 bear traps with a stick and then break them to reuse them.\n§e- You can only get §l§bBARBED WIRE§r§7 using a special wire cutter.\n§e- You can §l§bDISARM§r§7 a landmine with a screwdriver (but be careful! There’s a 50% chance it will explode).\n§e- Clean §l§bDIRTY RAGS§r§7 using a water pump to avoid infections.\n§e- You can §l§bBURY§r§7 infected, players, and survivors with a special DeadZone shovel.\n§e- Obtain §l§bMEAT§r§7 from players and survivors using any knife (only if you're really desperate!).\n§e- Fill an empty water bottle with §l§bBLEACH§r§7 to play nasty pranks (don’t do it, it's dangerous!).\n§e- §l§cWARNING!§r§7 When visiting the forest, there are hidden landmines and bear traps.\n\n§8Remember: Survival depends on your wits and caution.",
        'en_rags.txt':
            "§l§6🩹 DeadZone Guide: Rags and Dirty Rags\n§rIf you get hit by an infected, survivor, or player and start bleeding but don't have a bandage in your inventory, don’t worry: you can use clothing from your inventory to create rags and stop the bleeding.\n\n§e§lHow to create a rag:\n§r§71. Hold any piece of clothing from your inventory.\n2. Sneak/walk stealthily.\n3. Hit the air or the ground.\n§7This will turn the clothing into a rag.\n\n§e§lThree uses for rags in DeadZone:\n§r§7- Stop bleeding.\n- Treat broken bones.\n- Stop infections.\n\n§e§lDirty Rags:\n§r§7Rags now have a dirty version, so §chow do you clean a dirty rag?\n\n§71. Hold the dirty rag.\n2. Go to the edge of a body of water (make sure it’s a lake or river).\n3. Hit any block near the water to clean the rag.",
        'en_cans.txt':
            '§l§6🥫 DeadZone Guide: Canned Food\n§rSurvive longer by learning how to open your canned food!\n\n§e- If you have a lot of canned food but don\'t know how to open it, you need a §l§bSHARP MELEE WEAPON§r§7 or a §l§bCAN OPENER§r§7.\n\n§e§lHow to open cans with a can opener:\n§r§71. Place the can of food in your left hand (offhand slot).\n2. Hold the can opener in your main hand and hold down the button.\n§7If you don\'t have a can opener, you can still open them with sharp melee weapons.\n\n§e§lHow to open cans with a sharp weapon:\n§r§71. Place the can in your right hand (offhand slot).\n2. Hold a sharp melee weapon.\n3. Sneak/walk stealthily and hit the ground.\n\n§c§lNote:§r§7 If you open a can with a sharp weapon, you will get lower quality food that doesn\'t fill the hunger bar as much.\n\n§e§lList of melee weapons to open cans:\n§r§7- Butcher knife\n- Hunting knife\n- Kitchen knife\n- Axe\n- Pickaxe/Ice axe\n- Screwdriver\n- Tactical axe\n\n§e§lCanned foods that don\'t need a can opener:\n§r§7- Canned tuna\n- Canned ham\n- Canned corned beef\n- Canned rations\n\n§8Stay prepared and keep your hunger at bay!',
        'en_infections.txt':
            "§l§6🦠 DeadZone Guide: Infections\n§rIf you get infected by an infected (causing an §cinfinite hunger effect§7), try crafting a §l§bSTERILIZED RAG§r§7 or §l§bSTERILIZED BANDAGE§r§7 by combining §l§b3 rags§r§7 or §l§b2 bandages§r§7 with an §l§bALCOHOLIC TINCTURE§r§7.\n\n§e§lWhere to find alcoholic tincture?\n§rIt can be found in almost any loot, but the fastest way is to loot medical supplies.\n\n§c§lImportant:§r§7 Sterilized bandages and rags only reduce the infection level, they do not eliminate it completely.\n\n§e§lAntidote:\n§rAlternatively, you can use an §l§bANTIDOTE§r§7 to completely cure the infection, but to obtain it you must kill Hazmat-infected or military-infected enemies. Antidotes are very rare.",
        'en_broken_bones.txt':
            "§l§6🦴 DeadZone Guide: Broken Bone (Infinite Slowness Effect)\n§rIf you fall from a great height and break a bone, you’ll need a §l§cSPLINT§r§7 to recover.\n\n§e§lHow to craft a splint:\n§r§7To craft a splint, you need:\n§l§c- 2 sticks\n- 2 rags\n\n§r§7- To get sticks: Chop down trees or find them in civilian loot.\n- §l§cTo get rags:§r§7 Check the rags guide for more details.\n\n§7Once you have the materials, craft the splint in the inventory crafting interface.\n\n§e§lAlternative:\n§r§7You can also use a §l§cMORPHINE AUTO-INJECTOR§r§7 to heal the broken bone.\n- To get morphine: Search in medical or firefighter loot.\n\n§8Remember: You won’t be able to run or jump until you’re healed!",
        'en_stealth.txt':
            "§l§6👣 DeadZone Guide: Stealth\n§rIf you see a lot of infected or marauders ahead, you need to move stealthily to escape. Remember, sneaking only works if the infected or marauders haven’t seen you yet.\n\n§e§lDetection Ranges:\n§r§7- §cMarauders:§7 32 blocks\n- §cInfected:§7 16 blocks\n- §aSneaking:§7 They only see you from 5 blocks away\n\n§c§lImportant:§r§7 While sneaking, avoid shooting unless you have a silenced weapon, as the noise will attract attention and make things worse.\n\n§8Stealth can save your life!",
        'en_suspicious_water.txt':
            "§l§6💧 DeadZone Guide: Suspicious Water Bottle\n§rIf you have 2 identical water bottles that won’t stack, you might want to empty one if you suspect it.\n\n§e§lHow to empty a water bottle:\n§r§71. Hold the water bottle.\n2. Sneak/walk stealthily, then hit the ground.\n\n§c§lImportant:§r§7 Do not sneak when you want to drink the water bottle, as this is the method to empty it.\n\n§8Better safe than sorry!",
        'en_refill_water.txt':
            "§l§6💧 DeadZone Guide: Refilling Water\n§rIf you have an §cempty water bottle§7 or a §ccooking pot§7 and don’t know how to refill it, here’s what to do:\n\n§e§lHow to refill:\n§r§71. Hold the empty bottle or pot.\n2. Go to the nearest water source (like lakes or rivers).\n3. Hit any block near the water.\n\n§7When refilled, you’ll get §cunpurified water§7. You’ll need to purify it.\n\n§e§lTo purify the water:\n§r§7- Use an unpurified water bottle on a water purification table.\n- Boil water in a pot over a furnace or campfire.\n\n§8Stay hydrated and avoid illness!",
        'en_bleeding.txt':
            "§l§4╔════════════════════╗\n§4🩸 DeadZone Guide: Bleeding §r\n§l§4╚════════════════════╝\n§7When you are attacked by §cinfected§7, §csurvivors§7 or §cplayers§7 and start bleeding,\nyour §cblood points§7 will keep decreasing until you §cdie§7.\n\n§e§l🩹 How to restore your blood:\n§7- Use §fclean rags§7 or §fbandages§7 if you are bleeding.\n§7- You can find bandages in any kind of §6loot§7.\n§7- To make rags, check the §bRags Guide§7.\n§7- Use a §c§lblood bag§r§7 to restore your blood.\n\n§e§l🧪 Where to find a blood bag?\n§7You need to find an §cempty blood bag§7 and a §cblood test kit§7,\nwhich you can find inside a §cfirst aid kit§7 in §amedical loot§7.\n\n§c§l⚠ Important:\n§7Each player has their own unique §6blood type§7.\n§7Use a §cblood test kit§7 to determine your type before using a §cblood bag§7.\n§4If you use the wrong blood type...\n§l§kYOU WILL DIE!!!§r",
        'en_tips2.txt':
            "§l§4╔════════════════════╗\n§4🧩 DeadZone Guide: Tips 2 §r\n§l§4╚════════════════════╝\n§7- Walking or running while §cbleeding§7 will increase your bleeding level.\n- You now need a §bcompass§7 to see your coordinates.\n- Never ignore a §cHazmat corpse§7; you might get the §lantidote§7.\n- §cThe antidote is just a myth.§7",
        'en_red_eyes.txt':
            "§l§4╔════════════════════╗\n§4👁️ DeadZone Guide: Red Eyes §r\n§l§4╚════════════════════╝\n§7In version 1.6.4, all infected eyes are now white. What about the §cred/orange§7 ones?\n§7That’s a §c'Sprinter'§7, known as a runner. They have low health but are very fast.\n§7If you find an infected with red eyes, it means you’re facing a §crunner§7.",
        'en_raideo_proteccion.txt':
            "§l§4╔════════════════════╗\n§4🛡️ TIERRAZOMBIE Guide: Raiding & Protection §r\n§l§4╚════════════════════╝\n§7Want to protect your base or learn how to raid?\n\n§e§lProtection Blocks:\n§7Buy protection blocks in the safe zone from Npc Raid. Three sizes: §cCopper§7 (11x11), §aEmerald§7 (21x21), §bDiamond§7 (31x31).\n§7They prevent others from placing or breaking blocks in your area.\n\n§e§lIron Turrets:\n§7Defend your base with turrets that attack intruders and enemies.\n\n§e§lSecure Chests & Doors:\n§7Buy the secure chest item and key in the safe zone. For secure doors, craft the §bMD:Miter Saw§7 table and make doors with keys.\n\n§e§lRaiding:\n§7To raid, you need §cC4, grenades or homemade bombs§7. Craft, buy or find them in loot boxes and air drops.\n\n§c§l⚠ Important:\n§7Protections cannot be placed in the Nether. Do not overlap protection blocks or they will self-destruct.\n§8Build, protect and raid like a true survivor!",

    };

    return archivos[nombreArchivo] || '§cContenido no disponible.';
};

function mostrarAdministracion(player) {
    const lang = getPlayerLanguage(player);

    const form = new ActionFormData()
        .title(lang === "es_ES" ? "§cAdministración" : "§cAdministration")
        .body(lang === "es_ES" ? "Selecciona una opción de administración:" : "Select an administration option:")
        .button(lang === "es_ES" ? "§eVer Inventarios" : "§eView Inventories", "textures/ui/icon_armor.png")
        .button(lang === "es_ES" ? "§bTerminal de Jugador" : "§bPlayer Terminal", "textures/ui/icon_book_writable.png")
        .button(lang === "es_ES" ? "§6Eventos" : "§6Events", "textures/ui/icon_best3.png")
        .button(lang === "es_ES" ? "§6Registro de Bloques" : "§6Blocks Log", "textures/ui/icon_bookshelf.png")
        .button(lang === "es_ES" ? "§bEditar Recompensas" : "§bEdit Rewards", "textures/ui/icon_reward.png")
        .button(lang === "es_ES" ? "§aVolver al Menú Principal" : "§aReturn to Main Menu", "textures/ui/arrow_left.png");

    form.show(player).then((response) => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0:
                mostrarInventarios(player);
                break;
            case 1:
                playerLogSystem.showMainAdminMenu(player);
                break;
            case 2:
                mostrarMenuEventos(player);
                break;
            case 3:
                mostrarRegistroBloques(player);
                break;
            case 4:
                mostrarEditarRecompensas(player);
                break;
            case 5:
                showMainTZMenu(player); // Cambiado a la nueva UI
                break;
        }
    });
}

function mostrarMenuEventos(player) {
    const lang = getPlayerLanguage(player);
    const form = new ActionFormData()
        .title(lang === "es_ES" ? "§6Eventos Especiales" : "§6Special Events")
        .body(lang === "es_ES" ? "Selecciona un evento para administrar:" : "Select an event to manage:")
        .button("§bAirDrop", "textures/ui/Add-Ons_Side-Nav_Icon_24x24.png")
        .button("§3Barco", "textures/ui/Add-Ons_Side-Nav_Icon_24x24.png")
        .button(lang === "es_ES" ? "§cVolver" : "§cBack", "textures/ui/arrow_left.png");

    form.show(player).then((response) => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0:
                menuAdminAirdrop(player);
                break;
            case 1:
                player.sendMessage("§c¡Próximamente el evento Barco!");
                mostrarMenuEventos(player);
                break;
            case 2:
                mostrarAdministracion(player);
                break;
        }
    });
}

let airdropActivo = false;
let airdropTimer = null;
let airdropTimeLeft = 0;
let keepInventoryTimeout = null;
let airdropMusicLoop = null;

function reproducirMusicaEvento() {
    for (const p of world.getPlayers()) {
        p.runCommand('stopsound @s');
    }
    for (const p of world.getPlayers()) {
        p.runCommand('music play bs');
    }
    airdropMusicLoop = system.runTimeout(() => {
        if (airdropActivo) reproducirMusicaEvento();
    }, 20 * 60);
}

function detenerMusicaEvento() {
    if (airdropMusicLoop) system.clearRun(airdropMusicLoop);
    for (const p of world.getPlayers()) {
        p.runCommand('stopsound @s');
    }
}

function iniciarEventoAirdrop(admin) {
    airdropActivo = true;
    airdropTimeLeft = 30 * 60;
    const player = admin;
    player.runCommand("title @a title §l§4¡Un AirDrop ha sido lanzado!.");
    player.runCommand("title @a subtitle Habre la Ui General y acepta el evento.");
    player.runCommand("summon lightning_bolt -1544 66 359");
    player.runCommand("summon lightning_bolt -1464 66 357");
    player.runCommand("summon lightning_bolt -1464 66 433");
    player.runCommand("summon lightning_bolt -1545 66 433");
    world.sendMessage("§7EL AirDrop fue lanzado en: -1491 63 389\n§7Ve a Ui General/Eventos y acepta el evento si quieres partisipar.");
    world.getDimension("overworld").runCommand("structure load AirDrop1 -1491 63 389");
    world.getDimension("overworld").runCommand("gamerule keepinventory true");
    world.setDynamicProperty("airdrop_event", true);

    for (const p of world.getPlayers()) {
        p.addTag("evento_airdrop_activo");
    }

    reproducirMusicaEvento();

    const AIRDROP_X = -1491;
    const AIRDROP_Y = 63;
    const AIRDROP_Z = 389;
    const RADIUS = 50;
    const MARAUDERS_PER_WAVE = 20;

    airdropTimer = system.runInterval(() => {
        airdropTimeLeft--;

        if (airdropTimeLeft % 300 === 0 && airdropTimeLeft > 0) {
            const min = Math.floor(airdropTimeLeft / 60);
            world.sendMessage(`§l§b[EVENTO]§r §eAirDrop: Quedan §a${min}§e minutos para la explosión.`);

            for (let i = 0; i < MARAUDERS_PER_WAVE; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * RADIUS;
                const x = Math.floor(AIRDROP_X + Math.cos(angle) * distance);
                const z = Math.floor(AIRDROP_Z + Math.sin(angle) * distance);
                const y = AIRDROP_Y;
                world.getDimension("overworld").runCommand(`summon mcpe:marauder ${x} ${y} ${z}`);
            }
            world.sendMessage("§c¡Oleada de merodeadores cerca del AirDrop!");
            player.runCommand("summon lightning_bolt -1544 66 359");
            player.runCommand("summon lightning_bolt -1464 66 357");
            player.runCommand("summon lightning_bolt -1464 66 433");
            player.runCommand("summon lightning_bolt -1545 66 433");
        }

        if (airdropTimeLeft <= 0) {
            system.clearRun(airdropTimer);
            world.sendMessage("§l§c[EVENTO]§r §4¡El AirDrop explotará ahora!");
            world.getDimension("overworld").runCommand("summon tnt -1487.97 67 392.65");
            finalizarEventoAirdrop(admin);
        }
    }, 20);

    menuAdminAirdrop(admin);
}

function finalizarEventoAirdrop(admin) {
    airdropActivo = false;
    detenerMusicaEvento();
    world.sendMessage("§l§b[EVENTO]§r §c¡El evento AirDrop ha finalizado!");
    world.setDynamicProperty("airdrop_event", false);

    for (const p of world.getPlayers()) {
        p.removeTag("evento_airdrop_activo");
        p.removeTag("participando_airdrop");
    }

    world.getDimension("overworld").runCommand("fill -1492 63 389 -1486 67 395 air");

    if (keepInventoryTimeout) system.clearRun(keepInventoryTimeout);
    keepInventoryTimeout = system.runTimeout(() => {
        world.getDimension("overworld").runCommand("gamerule keepinventory false");
        world.sendMessage("§l§b[EVENTO]§r §cKeepInventory desactivado.");
    }, 10 * 60 * 20);

    menuAdminAirdrop(admin);
}

function menuAdminAirdrop(player) {
    const lang = getPlayerLanguage(player);
    const form = new ActionFormData()
        .title("§b✈ AirDrop")
        .body(lang === "es_ES"
            ? (airdropActivo ? "§aEl evento AirDrop está en curso." : "Inicia el evento AirDrop.")
            : (airdropActivo ? "§aAirDrop event is running." : "Start the AirDrop event."))
        .button(airdropActivo ? "§cFinalizar Evento" : "§aIniciar AirDrop", "textures/ui/icon_airdrop.png")
        .button(lang === "es_ES" ? "§cVolver" : "§cBack", "textures/ui/arrow_left.png");



    form.show(player).then((response) => {
        if (response.canceled) return;
        if (response.selection === 0) {
            if (!airdropActivo) {
                iniciarEventoAirdrop(player);
            } else {
                finalizarEventoAirdrop(player);
            }
        } else {
            mostrarMenuEventos(player);
        }
    });
}

function mostrarEditarRecompensas(player, page = 0) {
    const LEVELS_PER_PAGE = 7;
    const start = page * LEVELS_PER_PAGE;
    const end = Math.min(start + LEVELS_PER_PAGE, rewards.length);

    const form = new ActionFormData()


        .title("§bEditar Recompensas (Pase de Batalla)")
        .body("Selecciona una recompensa para editar:");

    for (let i = start; i < end; i++) {
        const r = rewards[i];
        form.button(`§l${i + 1}. §e${r.name}\n§7XP: §b${r.xp} | PassCoins: §d${r.passCoins}`);
    }
    if (page > 0) form.button("§7⬅ Página anterior", "textures/ui/arrow_left.png");
    if (end < rewards.length) form.button("§7➡ Página siguiente", "textures/ui/arrow_right.png");
    form.button("§cVolver", "textures/ui/arrow_left.png");

    form.show(player).then(res => {
        if (res.canceled) return;
        let btn = res.selection;
        if (btn < end - start) {
            editarRecompensa(player, start + btn, page);
        } else if (btn === end - start && page > 0) {
            mostrarEditarRecompensas(player, page - 1);
        } else if (btn === end - start + (page > 0 ? 1 : 0) && end < rewards.length) {
            mostrarEditarRecompensas(player, page + 1);
        } else {
            mostrarAdministracion(player);
        }
    });
}

function editarRecompensa(player, idx, page) {
    const r = rewards[idx];
    const form = new ModalFormData()
        .title(`§eEditar recompensa nivel ${idx + 1}`)
        .textField("Nombre", r.name)
        .textField("XP requerido", String(r.xp))
        .textField("PassCoins requeridos", String(r.passCoins))
        .textField("Comandos (separados por coma)", r.commands);

    form.show(player).then(res => {
        if (res.canceled) {
            mostrarEditarRecompensas(player, page);
            return;
        }
        r.name = res.formValues[0];
        r.xp = parseInt(res.formValues[1]) || 0;
        r.passCoins = parseInt(res.formValues[2]) || 0;
        r.commands = res.formValues[3];
        rewardsDB.saveData();
        player.sendMessage("§a¡Recompensa editada!");
        mostrarEditarRecompensas(player, page);
    });
}

function SpecOps(player) {
    const lang = getPlayerLanguage(player);
    if (player.hasTag("SpecOps")) {
        player.runCommand('replaceitem entity @s slot.hotbar 8 tz:unknowskill 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
        player.runCommand('effect @s speed 15 8');
        player.runCommand('effect @s jump_boost 30 2');
        player.runCommand('effect @s resistance 30 2');
        player.runCommand('effect @s health_boost 120 2');
        player.runCommand('effect @s regeneration 15 2');
        player.runCommand('particle tz:h3specops');
        player.runCommand('playsound random.totem');
        player.runCommand('camerashake add @s 4 2');
    } else {
        player.sendMessage("§cNo tienes el permiso necesario para usar esta habilidad.");
    }
}

function Militar(player) {
    const lang = getPlayerLanguage(player);
    if (player.hasTag("Militar")) {
        player.runCommand('replaceitem entity @s slot.hotbar 8 tz:unknowskill 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
        player.runCommand('effect @s speed 15 7');
        player.runCommand('effect @s regeneration 15 1');
        player.runCommand('effect @s resistance 30 1');
        player.runCommand('effect @s health_boost 60 1');
        player.runCommand('particle tz:h2Militar');
        player.runCommand('playsound random.totem');
        player.runCommand('camerashake add @s 4 2');
    } else {
        player.sendMessage("§cNo tienes el permiso necesario para usar esta habilidad.");
    }
}

function Mercenario(player) {
    const lang = getPlayerLanguage(player);
    if (player.hasTag("Mercenario")) {
        player.runCommand('replaceitem entity @s slot.hotbar 8 tz:unknowskill 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}');
        player.runCommand('effect @s speed 15 6');
        player.runCommand('effect @s health_boost 60');
        player.runCommand('effect @s regeneration 15');
        player.runCommand('particle tz:h1Ranger');
        player.runCommand('playsound random.totem');
        player.runCommand('camerashake add @s 4 2');
    } else {
        player.sendMessage("§cNo tienes el permiso necesario para usar esta habilidad.");
    }
}

function mostrarInventarios(adminPlayer) {
    const lang = getPlayerLanguage(adminPlayer);

    const players = Array.from(world.getPlayers());
    const form = new ActionFormData()
        .title(lang === "es_ES" ? "§eInventarios de Jugadores" : "§ePlayer Inventories")
        .body(lang === "es_ES" ? "Selecciona un jugador para ver su inventario:" : "Select a player to view their inventory:");

    players.forEach((player) => {
        form.button(player.nameTag, "textures/ui/icon_armor.png");
    });

    form.show(adminPlayer).then((response) => {
        if (response.canceled) {
            adminPlayer.sendMessage(lang === "es_ES" ? "§cHas cerrado el menú de inventarios." : "§cYou closed the inventory menu.");
            return;
        }

        const selectedPlayer = players[response.selection];
        if (selectedPlayer) {
            mostrarInventarioJugador(adminPlayer, selectedPlayer);
        }
    });
}

function mostrarInventarioJugador(adminPlayer, targetPlayer) {
    const lang = getPlayerLanguage(adminPlayer);

    const inventory = targetPlayer.getComponent("minecraft:inventory").container;
    const form = new ActionFormData()
        .title(lang === "es_ES" ? `§eInventario de ${targetPlayer.nameTag}` : `§eInventory of ${targetPlayer.nameTag}`)
        .body(lang === "es_ES" ? "Selecciona un objeto para quitarlo o agregar uno nuevo:" : "Select an item to remove or add a new one:");

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item) {
            form.button(`${item.amount}x ${item.typeId}`, "textures/ui/icon_item.png");
        } else {
            form.button(lang === "es_ES" ? "§7[Espacio vacío]" : "§7[Empty Slot]", "textures/ui/slot_empty.png");
        }
    }

    form.button(lang === "es_ES" ? "§aAgregar Objeto" : "§aAdd Item", "textures/ui/icon_plus.png");
    form.button(lang === "es_ES" ? "§cVolver" : "§cBack", "textures/ui/arrow_left.png");

    form.show(adminPlayer).then((response) => {
        if (response.canceled) {
            adminPlayer.sendMessage(lang === "es_ES" ? "§cHas cerrado el inventario." : "§cYou closed the inventory.");
            return;
        }

        if (response.selection < inventory.size) {
            const selectedItem = inventory.getItem(response.selection);
            if (selectedItem) {
                const clearCommand = `clear "${targetPlayer.nameTag}" ${selectedItem.typeId} 0 ${selectedItem.amount}`;
                const giveCommand = `give "${adminPlayer.nameTag}" ${selectedItem.typeId} ${selectedItem.amount}`;

                try {
                    targetPlayer.runCommand(clearCommand);
                    adminPlayer.runCommand(giveCommand);
                    adminPlayer.sendMessage(
                        lang === "es_ES"
                            ? `§aHas quitado ${selectedItem.amount}x ${selectedItem.typeId} del inventario de ${targetPlayer.nameTag}.`
                            : `§aYou removed ${selectedItem.amount}x ${selectedItem.typeId} from ${targetPlayer.nameTag}'s inventory.`
                    );
                } catch (error) {
                    adminPlayer.sendMessage(
                        lang === "es_ES"
                            ? "§cError al intentar quitar el objeto."
                            : "§cError while trying to remove the item."
                    );
                }
            } else {
                adminPlayer.sendMessage(lang === "es_ES" ? "§cEste espacio está vacío." : "§cThis slot is empty.");
            }
        } else if (response.selection === inventory.size) {
            agregarObjeto(adminPlayer, targetPlayer);
        } else {
            mostrarInventarios(adminPlayer);
        }
    });
}

function agregarObjeto(adminPlayer, targetPlayer) {
    const lang = getPlayerLanguage(adminPlayer);

    const form = new ModalFormData()
        .title(lang === "es_ES" ? "§aAgregar Objeto" : "§aAdd Item")
        .textField(lang === "es_ES" ? "ID del Objeto:" : "Item ID:", "minecraft:stone")
        .slider(lang === "es_ES" ? "Cantidad:" : "Amount:", 1, 64, 1);

    form.show(adminPlayer).then((response) => {
        if (response.canceled) {
            adminPlayer.sendMessage(lang === "es_ES" ? "§cHas cancelado la acción." : "§cYou canceled the action.");
            return;
        }

        const itemId = response.formValues[0].trim();
        const amount = response.formValues[1];

        try {
            const giveCommand = `give "${targetPlayer.nameTag}" ${itemId} ${amount}`;
            targetPlayer.runCommand(giveCommand);
            adminPlayer.sendMessage(
                lang === "es_ES"
                    ? `§aHas agregado ${amount}x ${itemId} al inventario de ${targetPlayer.nameTag}.`
                    : `§aYou added ${amount}x ${itemId} to ${targetPlayer.nameTag}'s inventory.`
            );
        } catch (error) {
            adminPlayer.sendMessage(
                lang === "es_ES"
                    ? "§cError: ID del objeto no válido o problema al agregar el objeto."
                    : "§cError: Invalid item ID or issue adding the item."
            );
        }
    });
}

const BLOCK_LOG_KEY = "blockPlaceLog";

let blockPlaceLog = [];
try {
    const raw = world.getDynamicProperty(BLOCK_LOG_KEY);
    if (raw) blockPlaceLog = JSON.parse(raw);
} catch (e) { }
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString();

    blockPlaceLog.push({
        jugador: player.nameTag,
        bloque: block.typeId,
        posicion: `(${block.location.x}, ${block.location.y}, ${block.location.z})`,
        fecha,
        hora
    });

    if (blockPlaceLog.length > 100) blockPlaceLog.shift();

    guardarRegistroBloques();
});

function guardarRegistroBloques() {
    try {
        world.setDynamicProperty(BLOCK_LOG_KEY, JSON.stringify(blockPlaceLog));
    } catch (e) {
        blockPlaceLog = blockPlaceLog.slice(-100);
        world.setDynamicProperty(BLOCK_LOG_KEY, JSON.stringify(blockPlaceLog));
    }
}

function mostrarRegistroBloques(player) {
    const lang = getPlayerLanguage(player);

    const ultimos = blockPlaceLog.slice(-15).reverse();
    let body = ultimos.length === 0
        ? (lang === "es_ES" ? "§7No hay registros aún." : "§7No logs yet.")
        : ultimos.map((log, i) =>
            `§e${i + 1}. §a${log.jugador}\n§7${log.bloque} §8${log.posicion}\n§7${log.fecha} §8${log.hora}`
        ).join("\n\n");

    new ActionFormData()
        .title(lang === "es_ES" ? "§bRegistro de Bloques" : "§bBlock Log")
        .body(body)
        .button(lang === "es_ES" ? "§aVolver" : "§aBack")
        .show(player)
        .then(() => mostrarAdministracion(player))
        .catch(e => console.error("Error al mostrar el registro de bloques:", e));
}

function mostrarHistorialJugador(adminPlayer) {
    const lang = getPlayerLanguage(adminPlayer);

    const players = Array.from(world.getPlayers());
    const form = new ActionFormData()
        .title(lang === "es_ES" ? "§bHistorial de Jugadores" : "§bPlayer History")
        .body(lang === "es_ES" ? "Selecciona un jugador para ver su historial:" : "Select a player to view their history:");

    players.forEach((player) => {
        form.button(player.nameTag, "textures/ui/icon_book_writable.png");
    });

    form.show(adminPlayer).then((response) => {
        if (response.canceled) {
            adminPlayer.sendMessage(lang === "es_ES" ? "§cHas cerrado el menú de historial." : "§cYou closed the history menu.");
            return;
        }

        const selectedPlayer = players[response.selection];
        if (selectedPlayer) {
            mostrarDetallesHistorial(adminPlayer, selectedPlayer);
        }
    });
}

function mostrarDetallesHistorial(adminPlayer, targetPlayer) {
    const lang = getPlayerLanguage(adminPlayer);
    const logs = playerLogSystem.getPlayerLogs(targetPlayer.nameTag);

    let body = logs.length === 0
        ? (lang === "es_ES" ? "§7No hay registros para este jugador." : "§7No logs for this player.")
        : logs.slice(-10).reverse().map((log, i) =>
            `§e${i + 1}. §a${log.action}\n§7${log.details}\n§8${log.timestamp}`
        ).join("\n\n");

    new ActionFormData()
        .title(lang === "es_ES" ? `§bHistorial de ${targetPlayer.nameTag}` : `§bHistory of ${targetPlayer.nameTag}`)
        .body(body)
        .button(lang === "es_ES" ? "§aVolver" : "§aBack")
        .show(adminPlayer)
        .then(() => mostrarHistorialJugador(adminPlayer))
        .catch(e => console.error("Error al mostrar el historial del jugador:", e));
}

// Sonido decorativo para menú
function playMenuSound(player) {
    try {
        player.playSound("random.pop", { volume: 1, pitch: 1.2 });
    } catch { }
}

// Traducciones y decoraciones
const LANGS = {
    es: {
        mainTitle: "§l§6✦ Menú Principal TZ ✦",
        mainBody: "",
        juego: "§l§3🎮 Juego y Navegación",
        juegoSub: "§8Explora las opciones de juego",
        personaje: "§l§a🧍‍♂️ Personaje",
        personajeSub: "§8Personaliza tu experiencia",
        progresion: "§l§6🎁 Progresión y Recompensas",
        progresionSub: "§8Avanza y recibe premios",
        tienda: "§l§d🛒 Tienda y Premium",
        tiendaSub: "§8Consigue objetos y ventajas",
        comunidad: "§l§9📢 Comunidad y Eventos",
        comunidadSub: "§8Participa y entérate de todo",
        config: "§l§7⚙ Configuraciones",
        configSub: "§8Ajusta tu juego",
        admin: "§l§c★ Panel de Admin ★",
        adminSub: "§8Opciones exclusivas de administración",
        volver: "§c⏪ Volver",
        guardia: "NPC Guardia UI\n§7Interactúa con los guardianes.",
        warps: "Warps\n§7Teletranspórtate a diferentes zonas.",
        equipos: "Equipos\n§7Gestiona tus equipos y clanes.",
        skin: "Cambiar Skin\n§7Personaliza tu apariencia.",
        efectos: "Efectos de Personaje\n§7Activa/desactiva efectos.",
        stats: "Estadísticas\n§7Consulta tu progreso.",
        musica: "Música de Fondo\n§7Elige tu música favorita.",
        pase: "Pase de Batalla\n§7Completa misiones y gana recompensas.",
        diarias: "Recompensas Diarias\n§7Obtén premios cada día.",
        recompensas: "Recompensas\n§7Reclama tus premios.",
        vip: "Funciones VIP\n§7Accede a ventajas exclusivas.",
        kits: "Kits\n§7Obtén equipamiento especial.",
        tiendaWeb: "Tienda Web\n§7Compra objetos desde la web.",
        gemas: "Adquirir Gemas\n§7Consigue gemas.",
        eventos: "Eventos\n§7Participa en eventos.",
        anuncios: "Anuncios\n§7Lee las noticias.",
        guias: "Guías\n§7Aprende y domina el servidor.",
        idioma: "Idioma / Language\n§7Cambia el idioma.",
        adminRecompensas: "Administrar Recompensas\n§7Gestiona las recompensas.",
        adminLogs: "Ver Logs\n§7Consulta los registros.",
        habilidadesShop: "Habilidades\n§7Adquiere tus habilidades especiales.",
        habilidades: "Habilidades\n§7Selecciona y activa tu habilidad especial.",
    },
    en: {
        mainTitle: "§l§6✦ Main Menu TZ ✦",
        mainBody: "§b━━━━━━━━━━━━━━━━━━━━━━\n§eWelcome to §l§4TIERRA ZOMBIE§r§e!\n§b━━━━━━━━━━━━━━━━━━━━━━\n§7Select a category:",
        juego: "§l§3🎮 Game & Navigation",
        juegoSub: "§8Explore game options",
        personaje: "§l§a🧍‍♂️ Character",
        personajeSub: "§8Customize your experience",
        progresion: "§l§6🎁 Progression & Rewards",
        progresionSub: "§8Advance and get prizes",
        tienda: "§l§d🛒 Shop & Premium",
        tiendaSub: "§8Get items and perks",
        comunidad: "§l§9📢 Community & Events",
        comunidadSub: "§8Participate and stay informed",
        config: "§l§7⚙ Settings",
        configSub: "§8Adjust your game",
        admin: "§l§c★ Admin Panel ★",
        adminSub: "§8Exclusive admin options",
        volver: "§c⏪ Back",
        guardia: "NPC Guard UI\n§7Interact with server guards.",
        warps: "Warps\n§7Teleport to different zones.",
        equipos: "Teams\n§7Manage your teams and clans.",
        skin: "Change Skin\n§7Customize your look.",
        efectos: "Character Effects\n§7Enable/disable effects.",
        stats: "Statistics\n§7Check your progress.",
        musica: "Background Music\n§7Choose your favorite music.",
        pase: "Battle Pass\n§7Complete missions and earn rewards.",
        diarias: "Daily Rewards\n§7Get prizes every day.",
        recompensas: "Rewards\n§7Claim your prizes.",
        vip: "VIP Functions\n§7Access exclusive perks.",
        kits: "Kits\n§7Get special equipment.",
        tiendaWeb: "Web Shop\n§7Buy items from the web.",
        gemas: "Get Gems\n§7Acquire gems.",
        eventos: "Events\n§7Join special events.",
        anuncios: "Announcements\n§7Read the news.",
        guias: "Guides\n§7Learn and master the server.",
        idioma: "Language\n§7Change the interface language.",
        adminRecompensas: "Manage Rewards\n§7Handle global rewards.",
        adminLogs: "View Logs\n§7Check server logs.",
        habilidadesShop: "Skills\n§7Acquire your special skills.",
        habilidades: "Skills\n§7Select and activate your special skill.",
    }
};

import { showBattlePassPage } from "../Plugs/AdminPlugs/BPass.js";
import { announcementsDB } from "../db/AnunciosDB.js";
import { showShopForm } from "../Entidades/Npc_TzShop.js"
import { showGuardiaForm } from "../Entidades/Npc_Guardia1.js";
import { showTeamsClansMenu } from "../Plugs/Clans.js";
import { showDailyRewardsMenu } from "../Plugs/DR.js";

import { showPlayerStats } from "../../../main/stats.js";
// import { showAvatarGui } from "../../../main/skins.js";

import { showBattlePassSubMenu, showAnnouncementsMenu } from "./LobyUi.js";

// Detecta idioma por tag
function getLang(player) {
    if (player.hasTag("lang_es_ES")) return "es";
    return "en";
}

// Prefijo solo para mensajes por chat (evita duplicados)
function sendTZ(player, msg) {
    if (!msg) return;
    if (typeof msg === "string" && !msg.startsWith("§7T§4Z§c >>§r ")) {
        player.sendMessage(`§7T§4Z§c >>§r ${msg}`);
    } else {
        player.sendMessage(msg);
    }
}

// Menú principal decorado
export function showMainTZMenu(player) {
    const lang = getLang(player);
    const t = LANGS[lang];
    const isAdmin = player.hasTag("Admin");


    const xp = getScore("xp", player) || 0;
    const passcoins = getScore("passcoins", player) || 0;
    const rubies = getScore("rubies", player) || 0;
    const money = getScore("money", player) || 0;

    playMenuSound(player);

    const form = new ActionFormData()
        .title(t.mainTitle)
        .body(
            `§b━━━━━━━━━━━━━━━━━━━━━━\n` +
            `§e¡Bienvenid${lang === "es" ? "o" : ""}, §a${player.nameTag}§e!\n` +
            `§b━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `§e:armor: §lExperiencia: §r§a${xp}\n` +
            `§a §lPasscoins: §r§b${passcoins}\n` +
            `§d:heart: §lRubies: §r§c${rubies}\n` +
            `§6:token: §lMonedas: §r§e${money}\n\n` +
            `§b━━━━━━━━━━━━━━━━━━━━━━\n` +
            `§7${lang === "es" ? "¡Revisa tu progreso y sigue avanzando!" : "Check your progress and keep advancing!"}`)
        .button(`${t.juego}\n§f${t.juegoSub}`, "textures/ui/icon_best3.png")
        .button(`${t.personaje}\n§f${t.personajeSub}`, "textures/ui/icon_armor.png")
        .button(`${t.progresion}\n§f${t.progresionSub}`, "textures/ui/promo_holiday_gift_small.png")
        .button(`${t.tienda}\n§f${t.tiendaSub}`, "textures/ui/marketplace.png")
        .button(`${t.comunidad}\n§f${t.comunidadSub}`, "textures/ui/icon_book_writable.png")
        .button(`${t.config}\n§f${t.configSub}`, "textures/ui/icon_setting.png");
    if (isAdmin) form.button(`${t.admin}\n§f${t.adminSub}`, "textures/ui/creator_glyph_color.png");

    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled) {
            sendTZ(player, t.cerrado);
            return;
        }
        let idx = res.selection;
        if (idx === 0) return showMenuJuegoNavegacion(player, lang);
        if (idx === 1) return showMenuPersonaje(player, lang);
        if (idx === 2) return showMenuProgresion(player, lang);
        if (idx === 3) return showMenuTienda(player, lang);
        if (idx === 4) return showMenuComunidad(player, lang);
        if (idx === 5) return mostrarConfiguraciones(player); // Usa la función correcta
        if (isAdmin && idx === 6) return mostrarAdministracion(player); // Usa la función correcta
    });
    sendTZ(player, t.abierto);
}

// Submenús decorados y con subtítulos
function showMenuJuegoNavegacion(player, lang) {
    const t = LANGS[lang];
    playMenuSound(player);
    const form = new ActionFormData()
        .title(`${t.juego}\n§b━━━━━━━━━━━━━━━━━━━━━━`)
        .body(getStatsBanner(player, lang) + "\n\n§eOpciones de juego y navegación:\n§b━━━━━━━━━━━━━━━━━━━━━━")
        .button(`§a🛡 ${t.guardia}`, "textures/ui/icon_best3.png")
        .button(`§3🗺 ${t.warps}`, "textures/ui/world_glyph_color.png")
        .button(`§d👥 ${t.equipos}`, "textures/ui/icon_armor.png")
        .button(`§c${t.volver}`, "textures/ui/arrow_left.png");
    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled || res.selection === 3) return showMainTZMenu(player);
        switch (res.selection) {
            case 0: showGuardiaForm(player); break; // Usa tu función existente
            case 1: mostrarTeletransportes(player); break;
            case 2: showTeamsClansMenu(player); break; // Usa tu función existente
        }
    });
}

function showMenuPersonaje(player, lang) {
    const t = LANGS[lang];
    playMenuSound(player);
    const form = new ActionFormData()
        .title(`${t.personaje}\n§b━━━━━━━━━━━━━━━━━━━━━━`)
        .body(getStatsBanner(player, lang) + "\n\n§eOpciones de personaje:\n§b━━━━━━━━━━━━━━━━━━━━━━")
        .button(`§b🎨 ${t.skin}`, "textures/ui/icon_armor.png")
        .button(`§a✨ ${t.habilidades}`, "textures/ui/icon_armor.png")
        .button(`§d✨ ${t.efectos}`, "textures/ui/icon_armor.png")
        .button(`§a📊 ${t.stats}`, "textures/ui/icon_book_writable.png")
        .button(`§6🎵 ${t.musica}`, "textures/items/record_cat.png")
        .button(`§c${t.volver}`, "textures/ui/arrow_left.png");

    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled || res.selection === 5) return showMainTZMenu(player);
        switch (res.selection) {
            case 0: showAvatarGui(player); break;
            case 1: mostrarHabilidades(player); break;
            case 2: showEffectShop(player); break;
            case 3: showPlayerStats(player); break;
            case 4: radioMenu(player); break;
        }
    });
}

function showMenuProgresion(player, lang) {
    const t = LANGS[lang];
    playMenuSound(player);
    const form = new ActionFormData()
        .title(`${t.progresion}\n§b━━━━━━━━━━━━━━━━━━━━━━`)
        .body(getStatsBanner(player, lang) + "\n\n§eOpciones de progresión y recompensas:\n§b━━━━━━━━━━━━━━━━━━━━━━")
        .button(`§6🎫 ${t.pase}`, "textures/ui/promo_holiday_gift_small.png")
        .button(`§a🎁 ${t.diarias}`, "textures/ui/promo_holiday_gift_small.png")
        .button(`§c${t.volver}`, "textures/ui/arrow_left.png");
    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled || res.selection === 2) return showMainTZMenu(player);
        switch (res.selection) {
            case 0: showBattlePassSubMenu(player); break; // Usa tu función existente
            case 1: showDailyRewardsMenu(player); break; // Usa tu función existente
        }
    });
}

function showMenuTienda(player, lang) {
    const t = LANGS[lang];
    playMenuSound(player);
    const form = new ActionFormData()
        .title(`${t.tienda}\n§b━━━━━━━━━━━━━━━━━━━━━━`)
        .body(getStatsBanner(player, lang) + "\n\n§eOpciones de tienda y premium:\n§b━━━━━━━━━━━━━━━━━━━━━━")
        .button(`§d👑 ${t.vip}`, "textures/ui/marketplace.png")
        .button(`§a🎒 ${t.kits}`, "textures/ui/marketplace.png")
        .button(`§6🛍 ${t.habilidadesShop}`, "textures/ui/icon_armor.png")
        .button(`§b🌐 ${t.tiendaWeb}`, "textures/ui/marketplace.png")
        .button(`§e💎 ${t.gemas}`, "textures/ui/marketplace.png")
        .button(`§c${t.volver}`, "textures/ui/arrow_left.png");
    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled || res.selection === 5) return showMainTZMenu(player);
        switch (res.selection) {
            case 0: mostrarVIPUI(player); break; // Usa tu función existente
            case 1: mostrarKits(player); break; // Usa tu función existente
            case 2: mostrarHabilidades(player); break; // Usa tu función existente
            case 3: showShopForm(player); break; // Usa tu función existente
            case 4: mostrarGemasUI(player); break; // Usa tu función existente
        }
    });
}

function showMenuComunidad(player, lang) {
    const t = LANGS[lang];
    playMenuSound(player);
    const form = new ActionFormData()
        .title(`${t.comunidad}\n§b━━━━━━━━━━━━━━━━━━━━━━`)
        .body(getStatsBanner(player, lang) + "\n\n§eOpciones de comunidad y eventos:\n§b━━━━━━━━━━━━━━━━━━━━━━")
        .button(`§a🎉 ${t.eventos}`, "textures/ui/icon_book_writable.png")
        .button(`§b📢 ${t.anuncios}`, "textures/ui/icon_book_writable.png")
        .button(`§d📖 ${t.guias}`, "textures/ui/icon_book_writable.png")
        .button(`§c${t.volver}`, "textures/ui/arrow_left.png");
    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled || res.selection === 3) return showMainTZMenu(player);
        switch (res.selection) {
            case 0: mostrarEventoAirdrop(player); break; // Usa tu función existente
            case 1: showAnnouncementsMenu(player); break; // Usa tu función existente
            case 2: Guias(player); break; // Usa tu función existente
        }
    });
}

// Panel de configuración y admin ya están creados, solo llama tus funciones existentes:
// mostrarConfiguraciones(player)
// mostrarPanelAdmin(player)

// Función para obtener valor del scoreboard 
function getScore(objectiveName, player) {
    try {
        const objective = world.scoreboard.getObjective(objectiveName);
        if (!objective) return 0;
        const participant = objective.getParticipants().find(p => p.displayName === player.nameTag);
        return participant ? objective.getScore(participant) : 0;
    } catch {
        return 0;
    }
}

// Función para generar el banner de estadísticas
function getStatsBanner(player, lang) {
    const xp = getScore("xp", player) || 0;
    const passcoins = getScore("passcoins", player) || 0;
    const rubies = getScore("rubies", player) || 0;
    const money = getScore("money", player) || 0;

    return `§b━━━━━━━━━━━━━━━━━━━━━━\n` +
        `§e¡Bienvenid${lang === "es" ? "o" : ""}, §a${player.nameTag}§e!\n` +
        `§b━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `§e:armor: §lExperiencia: §r§a${xp}\n` +
        `§a §lPasscoins: §r§b${passcoins}\n` +
        `§d:heart: §lRubies: §r§c${rubies}\n` +
        `§6:token: §lMonedas: §r§e${money}\n\n` +
        `§b━━━━━━━━━━━━━━━━━━━━━━\n` +
        `§7${lang === "es" ? "¡Revisa tu progreso y sigue avanzando!" : "Check your progress and keep advancing!"}`;
}

// Función showPlayerStats mejorada
function showPlayerStats(player) {
    const lang = getLang(player);

    // Obtener valores

    // Crear formulario decorado
    const form = new ActionFormData()
        .title(`§l§6📊 ${lang === "es" ? "Estadísticas del Jugador" : "Player Statistics"} §r§b✦`)
        .body(
    )
        .button(lang === "es" ? "§a⬅ Volver" : "§a⬅ Back", "textures/ui/arrow_left.png");

    form.show(player).then(res => {
        playMenuSound(player);
        if (res.canceled && res.selection === 0) {
            showMenuPersonaje(player, lang);
        }
    });
}

