import { world } from "@minecraft/server";

class TeamDB {
    constructor() {
        this.teamsKey = "teams_data";
        this.playerTeamsKey = "player_teams_data";
    }

    // Obtener todos los equipos/clanes
    fetch() {
        try {
            const teamsData = world.getDynamicProperty(this.teamsKey);
            return teamsData ? JSON.parse(teamsData) : { teams: {} };
        } catch (e) {
            console.warn(`Error al cargar datos de equipos: ${e}`);
            return { teams: {} };
        }
    }

    // Guardar datos de un equipo/clan
    setTeamData(teamName, data) {
        try {
            const teams = this.fetch().teams;
            if (data === null) {
                delete teams[teamName];
            } else {
                teams[teamName] = data;
            }
            world.setDynamicProperty(this.teamsKey, JSON.stringify({ teams }));
        } catch (e) {
            console.warn(`Error al guardar datos de equipo ${teamName}: ${e}`);
        }
    }

    // Obtener datos de un equipo/clan
    getTeamData(teamName) {
        return this.fetch().teams[teamName] || null;
    }

    // Obtener equipo/clan de un jugador
    getPlayerTeam(playerName) {
        try {
            const playerTeams = world.getDynamicProperty(this.playerTeamsKey);
            const data = playerTeams ? JSON.parse(playerTeams) : {};
            return data[playerName] || { team: null, clan: null };
        } catch (e) {
            console.warn(`Error al cargar datos de jugador ${playerName}: ${e}`);
            return { team: null, clan: null };
        }
    }

    // Asignar equipo/clan a un jugador
    setPlayerTeam(playerName, type, teamName) {
        try {
            const playerTeams = world.getDynamicProperty(this.playerTeamsKey);
            const data = playerTeams ? JSON.parse(playerTeams) : {};
            data[playerName] = data[playerName] || { team: null, clan: null };
            data[playerName][type] = teamName;
            world.setDynamicProperty(this.playerTeamsKey, JSON.stringify(data));
        } catch (e) {
            console.warn(`Error al guardar datos de jugador ${playerName}: ${e}`);
        }
    }
}

export const teamDB = new TeamDB();