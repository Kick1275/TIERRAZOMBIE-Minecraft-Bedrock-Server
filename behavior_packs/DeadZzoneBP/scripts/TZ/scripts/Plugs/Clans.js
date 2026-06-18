import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { teamDB } from "../db/teamsAndClansDB.js"; // Asegúrate de que la ruta sea correcta
import { showLobbyMenu } from "../UI/LobyUi.js";

// Sistema Avanzado de Equipos y Clanes
// Estructura de datos para equipos/clanes:
// {
//   name: string,
//   type: "team" | "clan",
//   members: string[],
//   leader: string,
//   officers: string[], // Oficiales del clan
//   description: string,
//   isPrivate: boolean,
//   applications: { player: string, timestamp: string }[],
//   maxMembers: number,
//   createdAt: string,
//   tag: string, // Etiqueta única para identificar el equipo/clan
//   level: number, // Nivel del clan
//   experience: number, // Experiencia del clan
//   bank: number, // Banco del clan
//   allies: string[], // Clanes aliados
//   enemies: string[], // Clanes enemigos
//   stats: {
//     kills: number,
//     deaths: number,
//     wins: number,
//     losses: number
//   },
//   settings: {
//     friendlyFire: boolean,
//     allowInvites: boolean,
//     showTag: boolean,
//     showStats: boolean // Nueva: visibilidad de stats
//   },
//   trophies: { // Nueva: trofeos
//     type: string,
//     name: string,
//     description: string,
//     date: string,
//     icon: string,
//     grantedBy?: string
//   }[]
// }

// Función auxiliar para obtener la fecha actual
function getTimestamp() {
    return new Date().toISOString();
}

// Función auxiliar para ejecutar comandos
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

// Sistema de protección contra daño entre miembros del mismo clan/equipo
world.afterEvents.entityHurt.subscribe(event => {
    const { hurtEntity, damageSource, damage } = event;
    if (!(hurtEntity instanceof Player) || damage <= 0) return;

    let attacker = damageSource.damagingEntity;

    // Manejar daños por proyectiles: obtener el dueño (shooter) real
    if (damageSource.cause === 'projectile' && attacker) {
        const projectileTypes = [
            'minecraft:arrow',        // Flechas (arco)
            'minecraft:trident',      // Tridentes
            'minecraft:snowball',     // Bolas de nieve
            'minecraft:egg',          // Huevos
            'minecraft:thrown_trident', // Tridentes lanzados (variante)
            'minecraft:fireball',     // Bolas de fuego (si usas dispensers o mobs, pero adaptable)
            // Agrega más tipos si usas items custom o mods, ej: 'minecraft:ender_pearl'
        ];

        if (projectileTypes.includes(attacker.typeId)) {
            const projComp = attacker.getComponent('minecraft:projectile');
            if (projComp && projComp.ownerId) {
                const owner = world.getEntity(projComp.ownerId);
                if (owner instanceof Player) {
                    attacker = owner;  // Reasignar al jugador que disparó
                }
            }
        }
    }

    // Si después de verificar, el atacante no es un jugador, salir
    if (!(attacker instanceof Player)) return;

    const hurtPlayer = hurtEntity;
    const playerTeam = teamDB.getPlayerTeam(hurtPlayer.nameTag);
    const attackerTeam = teamDB.getPlayerTeam(attacker.nameTag);

    // Verificar si ambos jugadores están en el mismo equipo o clan
    const sameTeam = playerTeam.team && playerTeam.team === attackerTeam.team;
    const sameClan = playerTeam.clan && playerTeam.clan === attackerTeam.clan;

    if (sameTeam || sameClan) {
        const teamData = sameTeam ? teamDB.getTeamData(playerTeam.team) : teamDB.getTeamData(playerTeam.clan);

        // Verificar si el fuego amigo está deshabilitado (por defecto está deshabilitado)
        if (!teamData?.settings?.friendlyFire) {
            // Curar al jugador herido restaurando la cantidad de daño
            try {
                const health = hurtPlayer.getComponent("minecraft:health");
                if (health) {
                    const newHealth = Math.min(health.currentValue + damage, health.effectiveMax);
                    health.setCurrentValue(newHealth);
                }
            } catch (e) {
                console.warn(`Error curando a ${hurtPlayer.nameTag}: ${e}`);
            }
            attacker.sendMessage("§cNo puedes dañar a tus compañeros de " + (sameTeam ? "equipo" : "clan") + ".");
            return;
        }
    }

    // Verificar si son clanes aliados
    if (playerTeam.clan && attackerTeam.clan && playerTeam.clan !== attackerTeam.clan) {
        const playerClanData = teamDB.getTeamData(playerTeam.clan);
        if (playerClanData?.allies?.includes(attackerTeam.clan)) {
            // Curar al jugador herido restaurando la cantidad de daño
            try {
                const health = hurtPlayer.getComponent("minecraft:health");
                if (health) {
                    const newHealth = Math.min(health.currentValue + damage, health.effectiveMax);
                    health.setCurrentValue(newHealth);
                }
            } catch (e) {
                console.warn(`Error curando a ${hurtPlayer.nameTag}: ${e}`);
            }
            attacker.sendMessage("§cNo puedes dañar a miembros de clanes aliados.");
            return;
        }
    }
});

// Menú de Equipos/Clanes
export function showTeamsClansMenu(player) {
    const hasClanAccess = player.hasTag("vip");
    const form = new ActionFormData()
        .title("§l§bEquipos y Clanes")
        .body("§7Elige una opción para gestionar equipos o clanes:")
        .button("§eEquipos", "textures/ui/icon_multiplayer.png")
        .button(hasClanAccess ? "§bClanes" : "§cClanes (Requiere acceso)", hasClanAccess ? "textures/ui/icon_multiplayer.png" : "textures/ui/lock_color.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 2) {
            console.warn(`Equipos/Clanes cancelado por ${player.nameTag}`);
            system.run(() => showLobbyMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            console.warn(`Abriendo Equipos para ${player.nameTag}`);
            showTeamMenu(player);
        } else if (res.selection === 1 && hasClanAccess) {
            console.warn(`Abriendo Clanes para ${player.nameTag}`);
            showClanMenu(player);
        } else {
            player.sendMessage("§cNecesitas acceso especial para gestionar clanes.");
            system.run(() => showTeamsClansMenu(player));
        }
    });
}

// Menú principal de Equipos
function showTeamMenu(player) {
    const playerTeam = teamDB.getPlayerTeam(player.nameTag);
    const form = new ActionFormData()
        .title("§l§eEquipos")
        .body(
            `§7Estado: ${playerTeam.team ? `Miembro de ${playerTeam.team}` : "Sin equipo"}\n\n` +
            "§7Crea, únete o gestiona un equipo (máximo 6 jugadores):"
        )
        .button("§aCrear Equipo", "textures/ui/color_plus.png")
        .button("§eVer Equipos", "textures/ui/icon_bookshelf.png")
        .button(playerTeam.team ? "§bGestionar Equipo" : "§cGestionar Equipo (No disponible)", playerTeam.team ? "textures/ui/icon_setting.png" : "textures/ui/lock_color.png")
        .button(playerTeam.team ? "§cAbandonar Equipo" : "§cAbandonar Equipo (No disponible)", playerTeam.team ? "textures/ui/icon_import.png" : "textures/ui/lock_color.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 4) {
            console.warn(`Equipo cancelado por ${player.nameTag}`);
            system.run(() => showTeamsClansMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            if (playerTeam.team) {
                player.sendMessage("§cYa estás en un equipo. Abandónalo primero.");
                system.run(() => showTeamMenu(player));
                return;
            }
            showCreateTeamForm(player, "team");
        } else if (res.selection === 1) {
            showTeamList(player, "team");
        } else if (res.selection === 2 && playerTeam.team) {
            showManageTeamMenu(player, playerTeam.team, "team");
        } else if (res.selection === 3 && playerTeam.team) {
            leaveTeam(player, playerTeam.team);
        }
    });
}

// Menú principal de Clanes
function showClanMenu(player) {
    const playerTeam = teamDB.getPlayerTeam(player.nameTag);
    const form = new ActionFormData()
        .title("§l§bClanes")
        .body(
            `§7Estado: ${playerTeam.clan ? `Miembro de ${playerTeam.clan}` : "Sin clan"}\n\n` +
            "§7Crea, únete o gestiona un clan (máximo 30 jugadores):"
        )
        .button("§aCrear Clan", "textures/ui/icon_create.png")
        .button("§eVer Clanes", "textures/ui/icon_join.png")
        .button(playerTeam.clan ? "§bGestionar Clan" : "§cGestionar Clan (No disponible)", playerTeam.clan ? "textures/ui/icon_setting.png" : "textures/ui/lock.png")
        .button("§6Rankings de Clanes", "textures/ui/icon_stats.png")
        .button("§cGuerras Activas", "textures/ui/icon_deals.png")
        .button(playerTeam.clan ? "§dSalón de Trofeos" : "§cSalón de Trofeos (No disponible)", playerTeam.clan ? "textures/ui/icon_crown.png" : "textures/ui/lock.png")
        .button(playerTeam.clan ? "§cAbandonar Clan" : "§cAbandonar Clan (No disponible)", playerTeam.clan ? "textures/ui/icon_leave.png" : "textures/ui/lock.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 7) {
            console.warn(`Clan cancelado por ${player.nameTag}`);
            system.run(() => showTeamsClansMenu(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            if (playerTeam.clan) {
                player.sendMessage("§cYa estás en un clan. Abandónalo primero.");
                system.run(() => showClanMenu(player));
                return;
            }
            showCreateTeamForm(player, "clan");
        } else if (res.selection === 1) {
            showTeamList(player, "clan");
        } else if (res.selection === 2 && playerTeam.clan) {
            showManageTeamMenu(player, playerTeam.clan, "clan");
        } else if (res.selection === 3) {
            showClanRankings(player);
        } else if (res.selection === 4) {
            showActiveWars(player);
        } else if (res.selection === 5 && playerTeam.clan) {
            showTrophyRoom(player, teamDB.getTeamData(playerTeam.clan));
        } else if (res.selection === 6 && playerTeam.clan) {
            leaveClan(player, playerTeam.clan);
        }
    });
}

// Formulario para crear equipo o clan
function showCreateTeamForm(player, type = "team") {
    const isClan = type === "clan";
    const maxMembers = isClan ? 30 : 6;
    const form = new ModalFormData()
        .title(`§l§aCrear ${isClan ? "Clan" : "Equipo"}`)
        .textField(`Nombre del ${isClan ? "Clan" : "Equipo"}`, "Ingresa un nombre (máx. 16 caracteres)")
        .textField("Descripción", `Describe tu ${isClan ? "clan" : "equipo"} (máx. 100 caracteres)`)
        .toggle("¿Privado?", false)
        .slider("Máximo de Miembros", 2, maxMembers, 1, maxMembers);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }
        const [name, description, isPrivate, maxMembers] = res.formValues;
        if (!name || name.length > 16 || name.length < 1) {
            player.sendMessage(`§cEl nombre del ${isClan ? "clan" : "equipo"} debe tener entre 1 y 16 caracteres.`);
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }
        if (description.length > 100) {
            player.sendMessage("§cLa descripción no puede exceder los 100 caracteres.");
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }
        const teamData = teamDB.getTeamData(name);
        if (teamData) {
            player.sendMessage(`§cEse nombre de ${isClan ? "clan" : "equipo"} ya está en uso.`);
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }
        const teamTag = `team_${name.replace(/[^a-zA-Z0-9]/g, "_")}`; // Generar etiqueta única, eliminando caracteres no válidos
        const newTeam = {
            name,
            type,
            members: [player.nameTag],
            leader: player.nameTag,
            officers: [], // Solo para clanes
            description: description || `¡Un ${isClan ? "clan" : "equipo"} increíble!`,
            isPrivate,
            applications: [],
            maxMembers,
            createdAt: getTimestamp(),
            tag: teamTag,
            level: 1,
            experience: 0,
            bank: isClan ? 0 : undefined, // Solo clanes tienen banco
            allies: isClan ? [] : undefined,
            enemies: isClan ? [] : undefined,
            stats: {
                kills: 0,
                deaths: 0,
                wins: 0,
                losses: 0
            },
            settings: {
                friendlyFire: false,
                allowInvites: true,
                showTag: true,
                showStats: true // Nueva
            },
            trophies: [] // Nueva
        };
        teamDB.setTeamData(name, newTeam);
        teamDB.setPlayerTeam(player.nameTag, type, name);
        player.runCommand(`tag @s add ${teamTag}`);
        player.runCommand(`tag @s add team_visible`);
        player.sendMessage(`§a¡${isClan ? "Clan" : "Equipo"} ${name} creado y unido!`);
        console.warn(`${isClan ? "Clan" : "Equipo"} ${name} creado por ${player.nameTag}`);
        system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
    });
}

// Mostrar lista de equipos o clanes
function showTeamList(player, type = "team") {
    const isClan = type === "clan";
    const allTeams = teamDB.fetch().teams || {};
    const teamList = Object.values(allTeams).filter(t => t.type === type);
    if (teamList.length === 0) {
        player.sendMessage(`§cNo hay ${isClan ? "clanes" : "equipos"} disponibles.`);
        system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
        return;
    }
    const form = new ActionFormData()
        .title(`§l§eLista de ${isClan ? "Clanes" : "Equipos"}`)
        .body(`§7Selecciona un ${isClan ? "clan" : "equipo"} para ver detalles:`);
    teamList.forEach(team => {
        form.button(
            `§e${team.name}\n§7${team.members.length}/${team.maxMembers} Miembros`,
            team.isPrivate ? "textures/ui/lock_color.png" : "textures/ui/icon_multiplayer.png"
        );
    });
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === teamList.length) {
            console.warn(`${isClan ? "Clanes" : "Equipos"} cancelado por ${player.nameTag}`);
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }
        player.runCommand("playsound random.orb @s");
        showTeamDetails(player, teamList[res.selection], type);
    });
}

// Detalles de equipo o clan
function showTeamDetails(player, team, type) {
    const isClan = type === "clan";
    const playerTeam = teamDB.getPlayerTeam(player.nameTag);
    const isMember = team.members.includes(player.nameTag);
    const hasApplied = team.applications.some(app => app.player === player.nameTag);
    const form = new ActionFormData()
        .title(`§l§e${team.name}`)
        .body(
            `§7Descripción: ${team.description}\n` +
            `§7Líder: ${team.leader}\n` +
            `§7Miembros: ${team.members.length}/${team.maxMembers}\n` +
            `§7Creado: ${team.createdAt.slice(0, 10)}\n` +
            `§7Estado: ${team.isPrivate ? "Privado" : "Público"}\n\n` +
            `§7Miembros:\n${team.members.join(", ") || "Ninguno"}`
        );
    if (!isMember && !hasApplied && team.members.length < team.maxMembers) {
        form.button("§aSolicitar Unirse", "textures/ui/color_plus.png");
    }
    if (hasApplied) {
        form.button("§cCancelar Solicitud", "textures/ui/cancel.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === (hasApplied || isMember ? 1 : team.members.length < team.maxMembers ? 1 : 0)) {
            system.run(() => showTeamList(player, type));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0 && !isMember && !hasApplied && team.members.length < team.maxMembers) {
            if (playerTeam[type]) {
                player.sendMessage(`§cYa estás en un ${isClan ? "clan" : "equipo"}. Abandónalo primero.`);
                system.run(() => showTeamList(player, type));
                return;
            }
            team.applications.push({ player: player.nameTag, timestamp: getTimestamp() });
            teamDB.setTeamData(team.name, team);
            player.sendMessage(`§aSolicitud enviada para unirte a ${team.name}.`);
            const leaderPlayer = world.getAllPlayers().find(p => p.nameTag === team.leader);
            if (leaderPlayer) {
                leaderPlayer.sendMessage(`§e${player.nameTag} ha solicitado unirse a tu ${isClan ? "clan" : "equipo"} ${team.name}.`);
            }
            console.warn(`Solicitud de ${player.nameTag} para unirse a ${team.name} (${type})`);
        } else if (res.selection === 0 && hasApplied) {
            team.applications = team.applications.filter(app => app.player !== player.nameTag);
            teamDB.setTeamData(team.name, team);
            player.sendMessage(`§aSolicitud para ${team.name} cancelada.`);
            console.warn(`Solicitud de ${player.nameTag} para ${team.name} cancelada`);
        }
        system.run(() => showTeamList(player, type));
    });
}

// Menú de gestión de equipo o clan
function showManageTeamMenu(player, teamName, type) {
    const isClan = type === "clan";
    const team = teamDB.getTeamData(teamName);
    if (!team) {
        player.sendMessage(`§cEl ${isClan ? "clan" : "equipo"} no existe.`);
        system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
        return;
    }
    const isLeader = team.leader === player.nameTag;
    const isOfficer = team.officers?.includes(player.nameTag);
    const canManage = isLeader || (isClan && isOfficer);

    const form = new ActionFormData()
        .title(`§l§bGestionar ${isClan ? "Clan" : "Equipo"}: ${teamName}`)
        .body(
            `§7Líder: ${team.leader}\n` +
            `§7Miembros: ${team.members.length}/${team.maxMembers}\n` +
            (isClan ? `§7Nivel: ${team.level} (${team.experience} XP)\n` : "") +
            (isClan && team.bank !== undefined ? `§7Banco: ${team.bank} monedas\n` : "") +
            `§7Descripción: ${team.description}\n` +
            `§7Estado: ${team.isPrivate ? "Privado" : "Público"}`
        )
        .button("§eVer Miembros", "textures/ui/icon_multiplayer.png")
        .button(canManage ? "§aGestionar Solicitudes" : "§cGestionar Solicitudes (Sin permisos)", canManage ? "textures/ui/icon_bookshelf.png" : "textures/ui/lock_color.png")
        .button(isLeader ? "§bEditar Configuración" : "§cEditar Configuración (Solo líder)", isLeader ? "textures/ui/icon_setting.png" : "textures/ui/lock_color.png");

    if (isClan) {
        form.button(isLeader ? "§6Gestionar Rangos" : "§cGestionar Rangos (Solo líder)", isLeader ? "textures/ui/icon_crown.png" : "textures/ui/lock_color.png")
            .button(canManage ? "§9Alianzas y Guerras" : "§cAlianzas y Guerras (Sin permisos)", canManage ? "textures/ui/icon_deals.png" : "textures/ui/lock_color.png")
            .button("§dEstadísticas", "textures/ui/icon_stats.png");
    }

    form.button(isLeader ? "§cEliminar " + (isClan ? "Clan" : "Equipo") : "§cEliminar (Solo líder)", isLeader ? "textures/ui/realms_red_x.png" : "textures/ui/lock_color.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }

        const lastButtonIndex = isClan ? 7 : 4;
        if (res.selection === lastButtonIndex) {
            system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
            return;
        }

        player.runCommand("playsound random.orb @s");

        if (res.selection === 0) {
            showMemberList(player, team, type);
        } else if (res.selection === 1 && canManage) {
            showManageApplications(player, team, type);
        } else if (res.selection === 2 && isLeader) {
            showEditTeamForm(player, team, type);
        } else if (isClan && res.selection === 3 && isLeader) {
            showManageRanks(player, team);
        } else if (isClan && res.selection === 4 && canManage) {
            showAlliancesWarsMenu(player, team);
        } else if (isClan && res.selection === 5) {
            showClanStats(player, team);
        } else if (res.selection === (isClan ? 6 : 3) && isLeader) {
            deleteTeam(player, team, type);
        } else {
            player.sendMessage("§cNo tienes permisos para realizar esta acción.");
            system.run(() => showManageTeamMenu(player, teamName, type));
        }
    });
}

// Mostrar lista de miembros
function showMemberList(player, team, type) {
    const isClan = type === "clan";
    const isLeader = team.leader === player.nameTag;
    const form = new ActionFormData()
        .title(`§l§eMiembros de ${team.name}`)
        .body(`§7Miembros (${team.members.length}/${team.maxMembers}):\n${team.members.join(", ") || "Ninguno"}`);
    if (isLeader) {
        form.button("§cExpulsar Miembro", "textures/ui/realms_red_x.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === (isLeader ? 1 : 0)) {
            system.run(() => showManageTeamMenu(player, team.name, type));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0 && isLeader) {
            showKickMemberForm(player, team, type);
        }
    });
}

// Formulario para expulsar miembro
function showKickMemberForm(player, team, type) {
    const isClan = type === "clan";
    const members = team.members.filter(member => member !== player.nameTag);
    if (members.length === 0) {
        player.sendMessage(`§cNo hay miembros para expulsar en ${team.name}.`);
        system.run(() => showManageTeamMenu(player, team.name, type));
        return;
    }
    const form = new ModalFormData()
        .title(`§l§cExpulsar Miembro de ${team.name}`)
        .dropdown("Selecciona un miembro", members);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showManageTeamMenu(player, team.name, type));
            return;
        }
        const [memberIndex] = res.formValues;
        const memberName = members[memberIndex];
        team.members = team.members.filter(member => member !== memberName);
        teamDB.setTeamData(team.name, team);
        teamDB.setPlayerTeam(memberName, type, null);
        const memberPlayer = world.getAllPlayers().find(p => p.nameTag === memberName);
        if (memberPlayer) {
            runCommand(memberPlayer, `tag @s remove ${team.tag}`);
            runCommand(memberPlayer, `tag @s remove team_visible`);
            memberPlayer.sendMessage(`§cHas sido expulsado del ${isClan ? "clan" : "equipo"} ${team.name}.`);
        }
        player.sendMessage(`§a${memberName} ha sido expulsado del ${isClan ? "clan" : "equipo"} ${team.name}.`);
        console.warn(`${memberName} expulsado del ${isClan ? "clan" : "equipo"} ${team.name} por ${player.nameTag}`);
        system.run(() => showManageTeamMenu(player, team.name, type));
    });
}

// Gestionar solicitudes
function showManageApplications(player, team, type) {
    const isClan = type === "clan";
    if (team.applications.length === 0) {
        player.sendMessage(`§cNo hay solicitudes pendientes para ${team.name}.`);
        system.run(() => showManageTeamMenu(player, team.name, type));
        return;
    }
    const form = new ActionFormData()
        .title(`§l§aSolicitudes para ${team.name}`)
        .body(`§7Selecciona una solicitud para gestionar:`);
    team.applications.forEach(app => {
        form.button(`§e${app.player}\n§7${app.timestamp.slice(0, 10)}`, "textures/ui/icon_bookshelf.png");
    });
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === team.applications.length) {
            system.run(() => showManageTeamMenu(player, team.name, type));
            return;
        }
        player.runCommand("playsound random.orb @s");
        showApplicationDetails(player, team, team.applications[res.selection], type);
    });
}

// Detalles de solicitud
function showApplicationDetails(player, team, application, type) {
    const isClan = type === "clan";
    const form = new ActionFormData()
        .title(`§l§eSolicitud de ${application.player}`)
        .body(
            `§7Jugador: ${application.player}\n` +
            `§7Fecha: ${application.timestamp.slice(0, 10)}\n\n` +
            `§7¿Aceptar o rechazar la solicitud?`
        )
        .button("§aAceptar", "textures/ui/color_plus.png")
        .button("§cRechazar", "textures/ui/realms_red_x.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 2) {
            system.run(() => showManageApplications(player, team, type));
            return;
        }
        player.runCommand("playsound random.orb @s");
        if (res.selection === 0) {
            if (team.members.length >= team.maxMembers) {
                player.sendMessage(`§cEl ${isClan ? "clan" : "equipo"} está lleno.`);
                system.run(() => showManageApplications(player, team, type));
                return;
            }
            team.members.push(application.player);
            team.applications = team.applications.filter(app => app.player !== application.player);
            teamDB.setTeamData(team.name, team);
            teamDB.setPlayerTeam(application.player, type, team.name);
            const applicant = world.getAllPlayers().find(p => p.nameTag === application.player);
            if (applicant) {
                applicant.runCommand(`tag @s add ${team.tag}`);
                applicant.runCommand(`tag @s add team_visible`);
                applicant.sendMessage(`§a¡Te has unido al ${isClan ? "clan" : "equipo"} ${team.name}!`);
            }
            player.sendMessage(`§aSolicitud de ${application.player} aceptada.`);
            console.warn(`Solicitud de ${application.player} aceptada para ${team.name} (${type})`);
        } else if (res.selection === 1) {
            team.applications = team.applications.filter(app => app.player !== application.player);
            teamDB.setTeamData(team.name, team);
            const applicant = world.getAllPlayers().find(p => p.nameTag === application.player);
            if (applicant) {
                applicant.sendMessage(`§cTu solicitud para unirte al ${isClan ? "clan" : "equipo"} ${team.name} fue rechazada.`);
            }
            player.sendMessage(`§aSolicitud de ${application.player} rechazada.`);
            console.warn(`Solicitud de ${application.player} rechazada para ${team.name} (${type})`);
        }
        system.run(() => showManageApplications(player, team, type));
    });
}

// Editar configuración de equipo o clan
function showEditTeamForm(player, team, type) {
    const isClan = type === "clan";
    const form = new ModalFormData()
        .title(`§l§bEditar ${isClan ? "Clan" : "Equipo"}: ${team.name}`)
        .textField("Descripción", "Nueva descripción (máx. 100 caracteres)", team.description)
        .toggle("¿Privado?", team.isPrivate)
        .slider("Máximo de Miembros", team.members.length, isClan ? 30 : 6, 1, team.maxMembers)
        .toggle("Permitir fuego amigo", team.settings?.friendlyFire || false)
        .toggle("Permitir invitaciones", team.settings?.allowInvites !== false)
        .toggle("Mostrar etiqueta en nombre", team.settings?.showTag !== false)
        .toggle("Mostrar estadísticas públicamente", team.settings?.showStats !== false);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showManageTeamMenu(player, team.name, type));
            return;
        }
        const [description, isPrivate, maxMembers, friendlyFire, allowInvites, showTag, showStats] = res.formValues;
        if (description.length > 100) {
            player.sendMessage("§cLa descripción no puede exceder los 100 caracteres.");
            system.run(() => showManageTeamMenu(player, team.name, type));
            return;
        }

        team.description = description || team.description;
        team.isPrivate = isPrivate;
        team.maxMembers = maxMembers;

        // Actualizar configuraciones
        if (!team.settings) team.settings = {};
        team.settings.friendlyFire = friendlyFire;
        team.settings.allowInvites = allowInvites;
        team.settings.showTag = showTag;
        team.settings.showStats = showStats;

        teamDB.setTeamData(team.name, team);
        player.sendMessage(`§aConfiguración de ${isClan ? "clan" : "equipo"} ${team.name} actualizada.`);
        console.warn(`Configuración de ${team.name} (${type}) actualizada por ${player.nameTag}`);
        system.run(() => showManageTeamMenu(player, team.name, type));
    });
}

// Eliminar equipo o clan
function deleteTeam(player, team, type) {
    const isClan = type === "clan";
    for (const member of team.members) {
        teamDB.setPlayerTeam(member, type, null);
        const memberPlayer = world.getAllPlayers().find(p => p.nameTag === member);
        if (memberPlayer) {
            runCommand(memberPlayer, `tag @s remove ${team.tag}`);
            runCommand(memberPlayer, `tag @s remove team_visible`);
            memberPlayer.sendMessage(`§cEl ${isClan ? "clan" : "equipo"} ${team.name} ha sido eliminado.`);
        }
    }
    teamDB.setTeamData(team.name, null);
    player.sendMessage(`§a${isClan ? "Clan" : "Equipo"} ${team.name} eliminado.`);
    console.warn(`${isClan ? "Clan" : "Equipo"} ${team.name} eliminado por ${player.nameTag}`);
    system.run(() => (isClan ? showClanMenu : showTeamMenu)(player));
}

// Abandonar equipo
function leaveTeam(player, teamName) {
    const team = teamDB.getTeamData(teamName);
    if (!team) {
        player.sendMessage("§cEl equipo no existe.");
        system.run(() => showTeamMenu(player));
        return;
    }
    if (team.leader === player.nameTag) {
        player.sendMessage("§cEl líder no puede abandonar. Elimina el equipo o transfiere el liderazgo.");
        system.run(() => showTeamMenu(player));
        return;
    }
    team.members = team.members.filter(member => member !== player.nameTag);
    teamDB.setTeamData(teamName, team);
    teamDB.setPlayerTeam(player.nameTag, "team", null);
    runCommand(player, `tag @s remove ${team.tag}`);
    runCommand(player, `tag @s remove team_visible`);
    player.sendMessage(`§aHas abandonado el equipo ${teamName}.`);
    console.warn(`Jugador ${player.nameTag} abandonó el equipo ${teamName}`);
    system.run(() => showTeamMenu(player));
}

// Abandonar clan
function leaveClan(player, clanName) {
    const clan = teamDB.getTeamData(clanName);
    if (!clan) {
        player.sendMessage("§cEl clan no existe.");
        system.run(() => showClanMenu(player));
        return;
    }
    if (clan.leader === player.nameTag) {
        player.sendMessage("§cEl líder no puede abandonar. Elimina el clan o transfiere el liderazgo.");
        system.run(() => showClanMenu(player));
        return;
    }
    clan.members = clan.members.filter(member => member !== player.nameTag);
    clan.officers = clan.officers.filter(officer => officer !== player.nameTag);
    teamDB.setTeamData(clanName, clan);
    teamDB.setPlayerTeam(player.nameTag, "clan", null);
    runCommand(player, `tag @s remove ${clan.tag}`);
    runCommand(player, `tag @s remove team_visible`);
    player.sendMessage(`§aHas abandonado el clan ${clanName}.`);
    console.warn(`Jugador ${player.nameTag} abandonó el clan ${clanName}`);
    system.run(() => showClanMenu(player));
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

// Sistema de actualización de nametags con información de clan/equipo
system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
        const playerTeam = teamDB.getPlayerTeam(player.nameTag);
        let displayName = player.nameTag;

        // Mostrar clan o equipo en el nombre
        if (playerTeam.clan) {
            const clanData = teamDB.getTeamData(playerTeam.clan);
            if (clanData?.settings?.showTag !== false) {
                const rank = getClanRank(player.nameTag, clanData);
                displayName = `§b[${clanData.name}]§r ${getRankPrefix(rank)}${player.nameTag}`;
            }
        } else if (playerTeam.team) {
            const teamData = teamDB.getTeamData(playerTeam.team);
            if (teamData?.settings?.showTag !== false) {
                const rank = getTeamRank(player.nameTag, teamData);
                displayName = `§e[${teamData.name}]§r ${getRankPrefix(rank)}${player.nameTag}`;
            }
        }

        // Actualizar el nombre mostrado
        try {
            player.runCommand(`title @s actionbar "${displayName}"`);
            player.runCommand("tag @s add alwaysShowNameTag");
        } catch (e) {
            console.warn(`Error actualizando nametag para ${player.nameTag}: ${e}`);
        }
    }
}, 40); // Cada 2 segundos para mejor rendimiento

// Función para obtener el rango de un jugador en el clan
function getClanRank(playerName, clanData) {
    if (clanData.leader === playerName) return "leader";
    if (clanData.officers?.includes(playerName)) return "officer";
    return "member";
}

// Función para obtener el rango de un jugador en el equipo
function getTeamRank(playerName, teamData) {
    if (teamData.leader === playerName) return "leader";
    return "member";
}

// Función para obtener el prefijo del rango
function getRankPrefix(rank) {
    switch (rank) {
        case "leader": return "§6★§r ";
        case "officer": return "§a◆§r ";
        case "member": return "§7●§r ";
        default: return "";
    }
}

// Evento cuando un jugador spawnea (incluye el spawn inicial y respawns)
world.afterEvents.playerSpawn.subscribe(event => {
    const player = event.player;
    const isInitialSpawn = event.initialSpawn;
    console.warn(`Evento playerSpawn disparado para ${player.nameTag}. Inicial: ${isInitialSpawn}`);
    system.run(() => showLobbyMenu(player));
});

// Evento cuando un jugador se une al servidor
world.afterEvents.playerJoin.subscribe(event => {
    const player = event.player;
    console.warn(`Evento playerJoin disparado para ${player.nameTag}`);
    system.run(() => showLobbyMenu(player));
});

// Menú de gestión de rangos (solo para clanes)
function showManageRanks(player, clan) {
    const form = new ActionFormData()
        .title(`§l§6Gestionar Rangos - ${clan.name}`)
        .body(`§7Gestiona los oficiales de tu clan:\n\n§7Oficiales actuales:\n${clan.officers?.join(", ") || "Ninguno"}`)
        .button("§aPromover a Oficial", "textures/ui/icon_crown.png")
        .button("§cDemover Oficial", "textures/ui/realms_red_x.png")
        .button("§eTransferir Liderazgo", "textures/ui/icon_setting.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 3) {
            system.run(() => showManageTeamMenu(player, clan.name, "clan"));
            return;
        }

        player.runCommand("playsound random.orb @s");

        if (res.selection === 0) {
            showPromoteOfficerForm(player, clan);
        } else if (res.selection === 1) {
            showDemoteOfficerForm(player, clan);
        } else if (res.selection === 2) {
            showTransferLeadershipForm(player, clan);
        }
    });
}

// Formulario para promover a oficial
function showPromoteOfficerForm(player, clan) {
    const members = clan.members.filter(member =>
        member !== player.nameTag && !clan.officers?.includes(member)
    );

    if (members.length === 0) {
        player.sendMessage("§cNo hay miembros disponibles para promover.");
        system.run(() => showManageRanks(player, clan));
        return;
    }

    const form = new ModalFormData()
        .title(`§l§aPromover a Oficial - ${clan.name}`)
        .dropdown("Selecciona un miembro", members);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showManageRanks(player, clan));
            return;
        }

        const [memberIndex] = res.formValues;
        const memberName = members[memberIndex];

        if (!clan.officers) clan.officers = [];
        clan.officers.push(memberName);

        teamDB.setTeamData(clan.name, clan);

        const member = world.getAllPlayers().find(p => p.nameTag === memberName);
        if (member) {
            member.sendMessage(`§a¡Has sido promovido a oficial del clan ${clan.name}!`);
        }

        player.sendMessage(`§a${memberName} ha sido promovido a oficial.`);
        console.warn(`${memberName} promovido a oficial en ${clan.name} por ${player.nameTag}`);

        system.run(() => showManageRanks(player, clan));
    });
}

// Formulario para demover oficial
function showDemoteOfficerForm(player, clan) {
    if (!clan.officers || clan.officers.length === 0) {
        player.sendMessage("§cNo hay oficiales para demover.");
        system.run(() => showManageRanks(player, clan));
        return;
    }

    const form = new ModalFormData()
        .title(`§l§cDemover Oficial - ${clan.name}`)
        .dropdown("Selecciona un oficial", clan.officers);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showManageRanks(player, clan));
            return;
        }

        const [officerIndex] = res.formValues;
        const officerName = clan.officers[officerIndex];

        clan.officers = clan.officers.filter(officer => officer !== officerName);

        teamDB.setTeamData(clan.name, clan);

        const officer = world.getAllPlayers().find(p => p.nameTag === officerName);
        if (officer) {
            officer.sendMessage(`§cHas sido demovido de oficial del clan ${clan.name}.`);
        }

        player.sendMessage(`§a${officerName} ha sido demovido de oficial.`);
        console.warn(`${officerName} demovido de oficial en ${clan.name} por ${player.nameTag}`);

        system.run(() => showManageRanks(player, clan));
    });
}

// Formulario para transferir liderazgo
function showTransferLeadershipForm(player, clan) {
    const members = clan.members.filter(member => member !== player.nameTag);

    if (members.length === 0) {
        player.sendMessage("§cNo hay miembros disponibles para transferir el liderazgo.");
        system.run(() => showManageRanks(player, clan));
        return;
    }

    const form = new ModalFormData()
        .title(`§l§eTransferir Liderazgo - ${clan.name}`)
        .dropdown("Selecciona el nuevo líder", members);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showManageRanks(player, clan));
            return;
        }

        const [memberIndex] = res.formValues;
        const newLeader = members[memberIndex];

        // Confirmar transferencia
        const confirmForm = new ActionFormData()
            .title("§l§cConfirmar Transferencia")
            .body(`§7¿Estás seguro de que quieres transferir el liderazgo del clan ${clan.name} a ${newLeader}?\n\n§cEsta acción no se puede deshacer.`)
            .button("§aConfirmar", "textures/ui/color_plus.png")
            .button("§cCancelar", "textures/ui/cancel.png");

        confirmForm.show(player).then(confirmRes => {
            if (confirmRes.canceled || confirmRes.selection === 1) {
                system.run(() => showManageRanks(player, clan));
                return;
            }

            clan.leader = newLeader;

            // Agregar al anterior líder como oficial si no lo es
            if (!clan.officers) clan.officers = [];
            if (!clan.officers.includes(player.nameTag)) {
                clan.officers.push(player.nameTag);
            }

            teamDB.setTeamData(clan.name, clan);

            const newLeaderPlayer = world.getAllPlayers().find(p => p.nameTag === newLeader);
            if (newLeaderPlayer) {
                newLeaderPlayer.sendMessage(`§a¡Ahora eres el líder del clan ${clan.name}!`);
            }

            player.sendMessage(`§aLiderazgo transferido a ${newLeader}.`);
            console.warn(`Liderazgo de ${clan.name} transferido de ${player.nameTag} a ${newLeader}`);

            system.run(() => showClanMenu(player));
        });
    });
}

// Menú de alianzas y guerras
function showAlliancesWarsMenu(player, clan) {
    const form = new ActionFormData()
        .title(`§l§9Alianzas y Guerras - ${clan.name}`)
        .body(`§7Gestiona las relaciones diplomáticas de tu clan:`)
        .button("§aVer Aliados", "textures/ui/icon_deals.png")
        .button("§cVer Enemigos", "textures/ui/realms_red_x.png")
        .button("§6Declarar Guerra", "textures/ui/icon_sword.png")
        .button("§bProponer Alianza", "textures/ui/icon_handshake.png")
        .button("§eGuerras Activas", "textures/ui/icon_stats.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 5) {
            system.run(() => showManageTeamMenu(player, clan.name, "clan"));
            return;
        }

        player.runCommand("playsound random.orb @s");

        if (res.selection === 0) {
            showAlliesList(player, clan);
        } else if (res.selection === 1) {
            showEnemiesList(player, clan);
        } else if (res.selection === 2) {
            showDeclareWarForm(player, clan);
        } else if (res.selection === 3) {
            showProposeAllianceForm(player, clan);
        } else if (res.selection === 4) {
            showActiveWars(player);
        }
    });
}

// Mostrar lista de aliados
function showAlliesList(player, clan) {
    const allies = clan.allies || [];
    const form = new ActionFormData()
        .title(`§l§aAliados de ${clan.name}`)
        .body(allies.length > 0 ?
            `§7Clanes aliados:\n${allies.join(", ")}` :
            "§7No tienes clanes aliados."
        );

    if (allies.length > 0) {
        form.button("§cRomper Alianza", "textures/ui/realms_red_x.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === (allies.length > 0 ? 1 : 0)) {
            system.run(() => showAlliancesWarsMenu(player, clan));
            return;
        }

        if (res.selection === 0 && allies.length > 0) {
            showBreakAllianceForm(player, clan);
        }
    });
}

// Mostrar lista de enemigos
function showEnemiesList(player, clan) {
    const enemies = clan.enemies || [];
    const form = new ActionFormData()
        .title(`§l§cEnemigos de ${clan.name}`)
        .body(enemies.length > 0 ?
            `§7Clanes enemigos:\n${enemies.join(", ")}` :
            "§7No tienes clanes enemigos."
        );

    if (enemies.length > 0) {
        form.button("§aProponer Paz", "textures/ui/icon_handshake.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === (enemies.length > 0 ? 1 : 0)) {
            system.run(() => showAlliancesWarsMenu(player, clan));
            return;
        }

        if (res.selection === 0 && enemies.length > 0) {
            showProposePeaceForm(player, clan);
        }
    });
}

// Formulario para declarar guerra
function showDeclareWarForm(player, clan) {
    const allClans = Object.values(teamDB.fetch().teams || {})
        .filter(t => t.type === "clan" && t.name !== clan.name && !clan.enemies?.includes(t.name));

    if (allClans.length === 0) {
        player.sendMessage("§cNo hay clanes disponibles para declarar guerra.");
        system.run(() => showAlliancesWarsMenu(player, clan));
        return;
    }

    const clanNames = allClans.map(c => c.name);
    const form = new ModalFormData()
        .title(`§l§6Declarar Guerra`)
        .dropdown("Selecciona el clan enemigo", clanNames)
        .slider("Duración (horas)", 1, 24, 1, 2);

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showAlliancesWarsMenu(player, clan));
            return;
        }

        const [clanIndex, duration] = res.formValues;
        const targetClan = clanNames[clanIndex];
        const durationMs = duration * 60 * 60 * 1000; // Convertir horas a milisegundos

        const warId = declareWar(clan.name, targetClan, durationMs);

        if (warId) {
            player.sendMessage(`§a¡Guerra declarada contra ${targetClan}!`);

            // Notificar al clan enemigo
            const targetClanData = teamDB.getTeamData(targetClan);
            if (targetClanData) {
                for (const memberName of targetClanData.members) {
                    const member = world.getAllPlayers().find(p => p.nameTag === memberName);
                    if (member) {
                        member.sendMessage(`§c¡El clan ${clan.name} os ha declarado la guerra!`);
                    }
                }
            }

            console.warn(`Guerra declarada: ${clan.name} vs ${targetClan} (ID: ${warId})`);
        } else {
            player.sendMessage("§cError al declarar la guerra.");
        }

        system.run(() => showAlliancesWarsMenu(player, clan));
    });
}

// Mostrar guerras activas públicamente
function showActiveWars(player) {
    const wars = teamDB.fetch().wars || {};
    const activeWars = Object.values(wars).filter(war => war.status === "active");

    if (activeWars.length === 0) {
        player.sendMessage("§cNo hay guerras activas en este momento.");
        const playerTeam = teamDB.getPlayerTeam(player.nameTag);
        if (playerTeam.clan) {
            system.run(() => showAlliancesWarsMenu(player, teamDB.getTeamData(playerTeam.clan)));
        } else {
            system.run(() => showClanMenu(player));
        }
        return;
    }

    const form = new ActionFormData()
        .title("§l§cGuerras Activas")
        .body("§7Guerras en curso:");

    activeWars.forEach(war => {
        const timeLeft = Math.max(0, war.endTime - Date.now());
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        form.button(
            `§e${war.attacker} §cvs §e${war.defender}\n§7${war.attackerKills} - ${war.defenderKills} §8(${hoursLeft}h ${minutesLeft}m)`,
            "textures/ui/icon_sword.png"
        );
    });

    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === activeWars.length) {
            const playerTeam = teamDB.getPlayerTeam(player.nameTag);
            if (playerTeam.clan) {
                system.run(() => showAlliancesWarsMenu(player, teamDB.getTeamData(playerTeam.clan)));
            } else {
                system.run(() => showClanMenu(player));
            }
            return;
        }

        showWarDetails(player, activeWars[res.selection]);
    });
}

// Mostrar detalles de una guerra específica
function showWarDetails(player, war) {
    const timeLeft = Math.max(0, war.endTime - Date.now());
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const form = new ActionFormData()
        .title(`§l§cGuerra: ${war.attacker} vs ${war.defender}`)
        .body(
            `§7Estado: §a${war.status}\n` +
            `§7Tiempo restante: §e${hoursLeft}h ${minutesLeft}m\n\n` +
            `§7Puntuación:\n` +
            `§e${war.attacker}: §c${war.attackerKills} kills\n` +
            `§e${war.defender}: §c${war.defenderKills} kills\n\n` +
            `§7Líder actual: §a${war.attackerKills > war.defenderKills ? war.attacker :
                war.defenderKills > war.attackerKills ? war.defender : "Empate"}`
        )
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        system.run(() => showActiveWars(player));
    });
}

// Mostrar estadísticas del clan
function showClanStats(player, clan) {
    const stats = getClanStats(clan.name);
    if (!stats) {
        player.sendMessage("§cError al obtener estadísticas del clan.");
        system.run(() => showManageTeamMenu(player, clan.name, "clan"));
        return;
    }

    const form = new ActionFormData()
        .title(`§l§dEstadísticas - ${clan.name}`)
        .body(
            `§7Miembros: §e${stats.members}\n` +
            `§7XP Total: §a${stats.xp}\n` +
            `§7Passcoins: §6${stats.passcoins}\n` +
            `§7Dinero: §2${stats.money}\n` +
            `§7Rubíes: §c${stats.rubies}\n` +
            `§7Kills Totales: §4${stats.kills}\n` +
            `§7Puntuación General: §b${stats.generalScore}\n\n` +
            `§7Estadísticas ${stats.showStats ? "§avisibles" : "§cocultas"} públicamente`
        )
        .button(clan.leader === player.nameTag ?
            (stats.showStats ? "§cOcultar Estadísticas" : "§aHacer Públicas") :
            "§cCambiar Visibilidad (Solo líder)",
            clan.leader === player.nameTag ? "textures/ui/icon_setting.png" : "textures/ui/lock_color.png"
        )
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 1) {
            system.run(() => showManageTeamMenu(player, clan.name, "clan"));
            return;
        }

        if (res.selection === 0 && clan.leader === player.nameTag) {
            clan.settings.showStats = !stats.showStats;
            teamDB.setTeamData(clan.name, clan);
            player.sendMessage(`§aEstadísticas del clan ${stats.showStats ? "ocultadas" : "hechas públicas"}.`);
        } else {
            player.sendMessage("§cSolo el líder puede cambiar la visibilidad.");
        }

        system.run(() => showClanStats(player, clan));
    });
}

// Salón de trofeos
function showTrophyRoom(player, team) {
    const trophies = team.trophies || [];
    const isAdmin = player.hasTag("admin");
    const form = new ActionFormData()
        .title(`§l§dSalón de Trofeos - ${team.name}`)
        .body(trophies.length > 0 ? `§7Trofeos obtenidos:\n\n${trophies.map(t => `§6${t.name}\n§7${t.description}\n`).join("\n")}` : "§cNo hay trofeos.");

    if (isAdmin) {
        form.button("§aAgregar Trofeo Personalizado", "textures/ui/color_plus.png");
    }
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === (isAdmin ? 1 : 0)) {
            system.run(() => showClanMenu(player));
            return;
        }
        if (res.selection === 0 && isAdmin) {
            showAddCustomTrophyForm(player, team);
        }
    });
}

// Formulario para agregar trofeo personalizado (solo admin)
function showAddCustomTrophyForm(player, team) {
    const form = new ModalFormData()
        .title("§l§aAgregar Trofeo Personalizado")
        .textField("Nombre", "Ingresa el nombre del trofeo")
        .textField("Descripción", "Ingresa la descripción");

    form.show(player).then(res => {
        if (res.canceled) {
            system.run(() => showTrophyRoom(player, team));
            return;
        }
        const [name, description] = res.formValues;
        if (!name) {
            player.sendMessage("§cEl nombre es requerido.");
            system.run(() => showTrophyRoom(player, team));
            return;
        }
        const trophy = {
            type: "custom",
            name,
            description: description || "Trofeo personalizado",
            date: getTimestamp(),
            icon: "textures/ui/icon_crown.png",
            grantedBy: player.nameTag
        };
        team.trophies.push(trophy);
        teamDB.setTeamData(team.name, team);
        player.sendMessage("§aTrofeo agregado.");
        system.run(() => showTrophyRoom(player, team));
    });
}

// Sistema de Rankings de Clanes
function showClanRankings(player) {
    const form = new ActionFormData()
        .title("§l§6Rankings de Clanes")
        .body("§7Selecciona una categoría:")
        .button("§bGeneral", "textures/ui/icon_crown.png")
        .button("§aTrabajadores (XP + Passcoins)", "textures/ui/icon_bookshelf.png")
        .button("§2Ricos (Money + Rubies)", "textures/ui/icon_emerald.png")
        .button("§4Peligrosos (Kills)", "textures/ui/icon_sword.png")
        .button("§eVer Stats de Clan", "textures/ui/icon_stats.png")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === 5) {
            system.run(() => showClanMenu(player));
            return;
        }
        if (res.selection === 0) {
            showRanking(player, "general");
        } else if (res.selection === 1) {
            showRanking(player, "trabajador");
        } else if (res.selection === 2) {
            showRanking(player, "rico");
        } else if (res.selection === 3) {
            showRanking(player, "peligroso");
        } else if (res.selection === 4) {
            showClanStatsViewer(player);
        }
    });
}

// Función para mostrar ranking por categoría
function showRanking(player, category) {
    const allClans = Object.values(teamDB.fetch().teams || {}).filter(t => t.type === "clan" && t.settings.showStats);
    const clanStats = allClans.map(clan => getClanStats(clan.name)).filter(stats => stats);

    let title, sortKey, body = "";
    switch (category) {
        case "general":
            title = "§l§bRanking General";
            sortKey = "generalScore";
            clanStats.sort((a, b) => b[sortKey] - a[sortKey]);
            body = "§7Suma de XP, Passcoins, Money, Rubies:\n\n";
            break;
        case "trabajador":
            title = "§l§aClanes Más Trabajadores";
            clanStats.forEach(s => s.trabajadorScore = s.xp + s.passcoins);
            sortKey = "trabajadorScore";
            clanStats.sort((a, b) => b[sortKey] - a[sortKey]);
            body = "§7Basado en XP + Passcoins:\n\n";
            break;
        case "rico":
            title = "§l§2Clanes Más Ricos";
            clanStats.forEach(s => s.ricoScore = s.money + s.rubies);
            sortKey = "ricoScore";
            clanStats.sort((a, b) => b[sortKey] - a[sortKey]);
            body = "§7Basado en Money + Rubies:\n\n";
            break;
        case "peligroso":
            title = "§l§4Clanes Más Peligrosos";
            sortKey = "kills";
            clanStats.sort((a, b) => b[sortKey] - a[sortKey]);
            body = "§7Basado en Kills:\n\n";
            break;
    }

    clanStats.slice(0, 10).forEach((s, i) => {
        const medal = i === 0 ? "§6🥇" : i === 1 ? "§7🥈" : i === 2 ? "§c🥉" : `§8${i+1}.`;
        body += `${medal} §e${s.name} §7- §b${s[sortKey]}\n`;
    });

    const form = new ActionFormData()
        .title(title)
        .body(body || "§cNo hay data.")
        .button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        system.run(() => showClanRankings(player));
    });
}

// Visor de estadísticas de clanes
function showClanStatsViewer(player) {
    const allClans = Object.values(teamDB.fetch().teams || {}).filter(t => t.type === "clan");
    if (allClans.length === 0) {
        player.sendMessage("§cNo hay clanes.");
        system.run(() => showClanRankings(player));
        return;
    }
    const form = new ActionFormData()
        .title("§l§eEstats de Clanes")
        .body("§7Selecciona un clan:");
    allClans.forEach(clan => form.button(`§e${clan.name}`));
    form.button("§cVolver", "textures/ui/cancel.png");

    form.show(player).then(res => {
        if (res.canceled || res.selection === allClans.length) {
            system.run(() => showClanRankings(player));
            return;
        }
        const selectedClan = allClans[res.selection];
        const stats = getClanStats(selectedClan.name);
        if (!stats || !selectedClan.settings.showStats) {
            player.sendMessage("§cStats no disponibles.");
            system.run(() => showClanStatsViewer(player));
            return;
        }
        const formStats = new ActionFormData()
            .title(`§l§d${selectedClan.name}`)
            .body(
                `§7XP: ${stats.xp}\n` +
                `§7Passcoins: ${stats.passcoins}\n` +
                `§7Money: ${stats.money}\n` +
                `§7Rubies: ${stats.rubies}\n` +
                `§7Kills: ${stats.kills}\n` +
                `§7General: ${stats.generalScore}`
            )
            .button("§cVolver", "textures/ui/cancel.png");

        formStats.show(player).then(() => system.run(() => showClanStatsViewer(player)));
    });
}

// Sistema de Guerra de Clanes
function declareWar(attackerClan, defenderClan, durationMs) {
    const warId = `${attackerClan}_vs_${defenderClan}_${Date.now()}`;
    const warData = {
        attacker,
        defender: defenderClan,
        startTime: Date.now(),
        endTime: Date.now() + durationMs,
        attackerKills: 0,
        defenderKills: 0,
        status: "active"
    };
    const wars = teamDB.fetch().wars || {};
    wars[warId] = warData;
    teamDB.set("wars", wars);
    return warId;
}

// End war and award trophy
function endWar(warId) {
    const wars = teamDB.fetch().wars || {};
    const war = wars[warId];
    if (!war || war.status !== "active") return;
    war.status = "ended";
    let winner;
    if (war.attackerKills > war.defenderKills) {
        winner = war.attacker;
    } else if (war.defenderKills > war.attackerKills) {
        winner = war.defender;
    } else {
        winner = null;
    }
    if (winner) {
        const trophy = {
            type: "war_win",
            name: `Victoria vs ${winner === war.attacker ? war.defender : war.attacker}`,
            description: `Ganó con ${winner === war.attacker ? war.attackerKills : war.defenderKills} kills`,
            date: getTimestamp(),
            icon: "textures/ui/icon_sword.png"
        };
        addTrophy(winner, trophy);
    }
    teamDB.set("wars", wars);
}

// Add trophy
function addTrophy(teamName, trophy) {
    const team = teamDB.getTeamData(teamName);
    if (!team.trophies) team.trophies = [];
    team.trophies.push(trophy);
    teamDB.setTeamData(teamName, team);
}

// Get clan stats summed from members
function getClanStats(teamName) {
    const team = teamDB.getTeamData(teamName);
    if (!team) return null;
    let xp = 0, passcoins = 0, money = 0, rubies = 0, kills = 0;
    team.members.forEach(memberName => {
        const player = world.getPlayers().find(p => p.name === memberName);
        if (player) {
            xp += player.getScore("xp") || 0;
            passcoins += player.getScore("passcoins") || 0;
            money += player.getScore("money") || 0;
            rubies += player.getScore("rubies") || 0;
            kills += player.getScore("kills") || 0;
        }
    });
    return { xp, passcoins, money, rubies, kills, generalScore: xp + passcoins + money + rubies };
}

// Sistema de experiencia y niveles para clanes
function addClanExperience(clanName, amount) {
    const clan = teamDB.getTeamData(clanName);
    if (!clan || clan.type !== "clan") return;

    clan.experience += amount;

    const requiredExp = clan.level * 100;
    if (clan.experience >= requiredExp) {
        clan.level++;
        clan.experience -= requiredExp;
        clan.members.forEach(memberName => {
            const member = world.getAllPlayers().find(p => p.nameTag === memberName);
            if (member) {
                member.sendMessage(`§6¡El clan ${clan.name} ha subido al nivel ${clan.level}!`);
                member.runCommand("playsound random.levelup @s");
            }
        });
    }

    teamDB.setTeamData(clanName, clan);
}

// Evento cuando un jugador mata a otro (para estadísticas y guerras)
world.afterEvents.entityDie.subscribe(event => {
    const { deadEntity, damageSource } = event;
    if (!(deadEntity instanceof Player)) return;

    const killer = damageSource.damagingEntity;
    if (!(killer instanceof Player)) return;

    const killerTeam = teamDB.getPlayerTeam(killer.nameTag);
    const deadTeam = teamDB.getPlayerTeam(deadEntity.nameTag);

    // Actualizar estadísticas generales
    if (killerTeam.clan) {
        const killerClan = teamDB.getTeamData(killerTeam.clan);
        killerClan.stats.kills++;
        teamDB.setTeamData(killerTeam.clan, killerClan);
        addClanExperience(killerTeam.clan, 10);
    }
    if (deadTeam.clan) {
        const deadClan = teamDB.getTeamData(deadTeam.clan);
        deadClan.stats.deaths++;
        teamDB.setTeamData(deadTeam.clan, deadClan);
    }

    // Si hay guerra activa
    if (killerTeam.clan && deadTeam.clan && killerTeam.clan !== deadTeam.clan) {
        const wars = teamDB.fetch().wars || {};
        const war = Object.values(wars).find(w => w.status === "active" && 
            ((w.attacker === killerTeam.clan && w.defender === deadTeam.clan) || 
             (w.attacker === deadTeam.clan && w.defender === killerTeam.clan)));
        if (war) {
            if (war.attacker === killerTeam.clan) war.attackerKills++;
            else war.defenderKills++;
            teamDB.set("wars", wars);
        }
    }
});

// Interval para finalizar guerras
system.runInterval(() => {
    const wars = teamDB.fetch().wars || {};
    Object.keys(wars).forEach(warId => {
        const war = wars[warId];
        if (war.status === "active" && Date.now() >= war.endTime) {
            endWar(warId);
        }
    });
}, 600); // Cada 30 segundos

// Funciones para alianzas y paz (ya incluidas, sin duplicados)
