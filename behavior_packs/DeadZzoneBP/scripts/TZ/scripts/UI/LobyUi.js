import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

import { showBattlePassPage } from "../Plugs/AdminPlugs/BPass.js";
import { announcementsDB } from "../db/AnunciosDB.js";
import {showShopForm} from "../Entidades/Npc_TzShop.js"
import {showGuardiaForm} from "../Entidades/Npc_Guardia1.js";
import {showTeamsClansMenu} from "../Plugs/Clans.js";

import { showPlayerStats } from "../../../main/stats.js";
// import { showAvatarGui } from "../../../main/skins.js";

// Lista de items en la tienda
const SHOP_ITEMS = [
    { id: "diamond_sword", name: "Espada de Diamante", cost: 50, command: "give @s diamond_sword 1" },
    { id: "flame_particle", name: "Partículas de Llama", cost: 20, command: "particle flame ~ ~1 ~" },
    { id: "golden_apple", name: "Manzana Dorada", cost: 30, command: "give @s golden_apple 1" }
];

// Obtener datos del jugador desde el scoreboard
function getPlayerStat(player, objective) {
    try {
        const scoreboard = world.scoreboard.getObjective(objective);
        const score = scoreboard ? scoreboard.getScore(player) || 0 : 0;
        console.warn(`Stat ${objective} de ${player.nameTag}: ${score}`);
        return score;
    } catch (e) {
        console.warn(`Error al obtener stat ${objective} para ${player.nameTag}: ${e}`);
        return 0;
    }
}

function getPlayerPassCoins(player) {
    return getPlayerStat(player, "passcoins");
}

// Ejecutar comandos
function runCommand(player, command) {
    try {
        player.runCommand(command);
        console.warn(`Ejecutado comando: ${command} para ${player.nameTag}`);
        return true;
    } catch (e) {
        console.warn(`Error al ejecutar comando: ${command} para ${player.nameTag}: ${e}`);
        player.sendMessage("§cError al ejecutar el comando. Contacta al administrador.");
        return false;
    }
}

// Menú principal del lobby
export function showLobbyMenu(player) {
    const passCoins = getPlayerPassCoins(player);
    const form = new ActionFormData()
        .title("§l§6Lobby Principal")
        .body(
            `§eBienvenido, ${player.nameTag}!\n` +
            `§dPassCoins: ${passCoins}\n\n` +
            "§7Selecciona una opción para continuar:"
        )
        .button("§aJugar", "textures/ui/sidebar_icons/realms.png")
        .button("§3Pase de Batalla", "textures/ui/sidebar_icons/csb_sidebar_icon.png")
        .button("§aTienda", "textures/ui/sidebar_icons/marketplace.png")
        .button("§bEquipos/Clanes", "textures/ui/friendsbutton/navbar-friends-icon.png")
        .button("§dPersonalizar Personaje", "textures/ui/sidebar_icons/categories.png")
        .button("§eVer Estadísticas", "textures/ui/sidebar_icons/star.png")
        .button("§7Anuncios", "textures/ui/sidebar_icons/addon.png")
        .button("§7Configuraciones", "textures/ui/sidebar_icons/genre.png");

    form.show(player).then(res => {
        if (res.canceled) {
            console.warn(`Lobby cancelado por ${player.nameTag}`);
            return;
        }
        player.runCommand("playsound random.orb @s");
        switch (res.selection) {
            case 0:
                showGuardiaForm(player);
                break;
            case 1:
                console.warn(`Abriendo Pase de Batalla para ${player.nameTag}`);
                showBattlePassSubMenu(player);
                break;
            case 2:
                console.warn(`Abriendo Tienda para ${player.nameTag}`);
                showShopSubMenu(player);
                break;
            case 3:
                console.warn(`Abriendo Equipos/Clanes para ${player.nameTag}`);
                showTeamsClansMenu(player);
                break;
            case 4:
                showAvatarGui(player);
                break;
            case 5:
                showPlayerStats(player);
                break;
            case 6:
                console.warn(`Abriendo Anuncios para ${player.nameTag}`);
                showAnnouncementsMenu(player);
                break;
            case 7:
                console.warn(`Ejecutando Configuraciones para ${player.nameTag}`);
                runCommand(player, "function show_settings");
                player.sendMessage("§aAbriendo configuraciones...");
                break;
        }
    });
}

// Submenú de Pase de Batalla
export function showBattlePassSubMenu(player) {
    const form = new ActionFormData()
        .title("§l§3Pase de Batalla")
        .body("§7Elige una opción del Pase de Batalla:")
        .button("§eVer Misiones", "textures/ui/icon_map.png")
        .button("§aVer Recompensas", "textures/ui/promo_holiday_gift_small.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 2) {
            console.warn(`Pase de Batalla cancelado por ${player.nameTag}`);
            system.run(() => showLobbyMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            console.warn(`Ejecutando Ver Misiones para ${player.nameTag}`);
            runCommand(player, "function show_missions");
            player.runCommand('give @s alberto35:mission')
        } else {
            console.warn(`Abriendo Recompensas del Pase de Batalla para ${player.nameTag}`);
            showBattlePassPage(player, 0);
        }
    });
}

// Submenú de Tienda
// Submenú de Tienda
function showShopSubMenu(player) {
    const form = new ActionFormData()
        .title("§l§aTienda")
        .body("§7Elige una opción de la tienda:")
        .button("§bTienda Web", "textures/ui/icon_deals.png")
        .button("§aTienda del Servidor", "textures/ui/icon_deals.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 2) {
            console.warn(`Tienda cancelada por ${player.nameTag}`);
            system.run(() => showLobbyMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            console.warn(`Abriendo Tienda Web para ${player.nameTag}`);
            system.run(() => showShopForm(player, null)); // Pasar null explícitamente
        } else {
            console.warn(`Abriendo Tienda del Servidor para ${player.nameTag}`);
            showServerShopMenu(player);
        }
    });
}

// Menú de la tienda del servidor
function showServerShopMenu(player) {
    player.sendMessage("§aEsta Funcion aun esta en desarrollo Los Npc que tradean Items Ahora se encuentran regados por el mapa, Suerte en encontrarlos OwO.");
}


// Menú de Equipos


// Formulario para crear equipo


// Menú de Anuncios
export function showAnnouncementsMenu(player) {
    const isAdmin = player.hasTag("Admin");
    const announcements = announcementsDB.getAnnouncements();
    const form = new ActionFormData()
        .title("§l§7Anuncios del Servidor")
        .body(
            announcements.length > 0
                ? "§7Selecciona un anuncio para ver detalles:"
                : "§7No hay anuncios disponibles."
        );

    announcements.forEach(ann => {
        form.button(`§e${ann.title}\n§7${ann.timestamp.slice(0, 10)}`);
    });
    if (isAdmin) {
        form.button("§aAdministrar Anuncios", "textures/ui/creator_glyph_color.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === announcements.length + (isAdmin ? 1 : 0)) {
            console.warn(`Anuncios cancelados por ${player.nameTag}`);
            system.run(() => showLobbyMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (isAdmin && res.selection === announcements.length) {
            console.warn(`Abriendo Administración de Anuncios para ${player.nameTag}`);
            showAdminAnnouncementsMenu(player);
        } else {
            const announcement = announcements[res.selection];
            showAnnouncementDetails(player, announcement);
        }
    });
}

// Detalles de un anuncio
function showAnnouncementDetails(player, announcement) {
    const form = new ActionFormData()
        .title(`§l§e${announcement.title}`)
        .body(
            `§7${announcement.message}\n\n` +
            `§7Publicado: ${announcement.timestamp.slice(0, 10)}`
        )
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(() => {
        system.run(() => showAnnouncementsMenu(player));
    });
}

// Menú de administración de anuncios
function showAdminAnnouncementsMenu(player) {
    const form = new ActionFormData()
        .title("§l§aAdministrar Anuncios")
        .body("§7Elige una opción para gestionar anuncios:")
        .button("§aAñadir Anuncio", "textures/ui/color_plus.png")
        .button("§cEliminar Anuncio", "textures/ui/realms_red_x.png")
        .button("§cVolver", "textures/ui/icon_import.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 2) {
            console.warn(`Administración de anuncios cancelada por ${player.nameTag}`);
            system.run(() => showAnnouncementsMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            showAddAnnouncementForm(player);
        } else {
            showDeleteAnnouncementForm(player);
        }
    });
}

// Formulario para añadir anuncio
function showAddAnnouncementForm(player) {
    const form = new ModalFormData()
        .title("§l§aAñadir Anuncio")
        .textField("Título", "Ingresa el título del anuncio")
        .textField("Mensaje", "Ingresa el mensaje del anuncio");

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showAdminAnnouncementsMenu(player));
            return;
        }
        const [title, message] = res.formValues;
        if (!title || !message || title.length > 32 || message.length > 256) {
            player.sendMessage("§cEl título debe tener hasta 32 caracteres y el mensaje hasta 256.");
            system.run(() => showAdminAnnouncementsMenu(player));
            return;
        }
        announcementsDB.addAnnouncement(title, message);
        player.sendMessage(`§aAnuncio "${title}" añadido.`);
        system.run(() => showAdminAnnouncementsMenu(player));
    });
}

// Formulario para eliminar anuncio
function showDeleteAnnouncementForm(player) {
    const announcements = announcementsDB.getAnnouncements();
    if (announcements.length === 0) {
        player.sendMessage("§cNo hay anuncios para eliminar.");
        system.run(() => showAdminAnnouncementsMenu(player));
        return;
    }
    const form = new ModalFormData()
        .title("§l§cEliminar Anuncio")
        .dropdown("Selecciona un anuncio", announcements.map(ann => `${ann.title} (${ann.timestamp.slice(0, 10)})`));

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showAdminAnnouncementsMenu(player));
            return;
        }
        const [index] = res.formValues;
        const announcement = announcements[index];
        announcementsDB.removeAnnouncement(announcement.id);
        player.sendMessage(`§aAnuncio "${announcement.title}" eliminado.`);
        system.run(() => showAdminAnnouncementsMenu(player));
    });
}

// Evento para abrir el lobby con una Nether Star
world.afterEvents.itemUse.subscribe(event => {
    const player = event.source;
    const item = event.itemStack;
    if (!(player instanceof Player) || !player.nameTag) return;
    if (item && item.typeId === "minecraft:nether_star") {
        console.warn(`Abriendo Lobby para ${player.nameTag}`);
        player.runCommand("playsound random.orb @s");
        system.run(() => showLobbyMenu(player));
    }
});

