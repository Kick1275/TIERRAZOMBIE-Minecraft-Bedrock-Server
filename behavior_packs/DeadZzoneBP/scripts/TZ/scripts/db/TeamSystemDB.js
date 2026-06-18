import { world } from "@minecraft/server";

export class TeamDB {
    constructor() {
        this.tableName = "teams";
        this.MEMORY = this.fetch();
        console.warn(`Inicializando TeamDB`);
    }

    getKey() {
        return `db_${this.tableName}`;
    }

    saveData() {
        try {
            const dataString = JSON.stringify(this.MEMORY);
            const CHUNK_SIZE = 4000;
            const chunks = dataString.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [];
            console.warn(`Guardando datos para ${this.tableName}. ${chunks.length} fragmentos, tamaño total: ${dataString.length}`);
            
            world.setDynamicProperty(`${this.getKey()}_count`, chunks.length);
            chunks.forEach((chunk, i) => {
                try {
                    world.setDynamicProperty(`${this.getKey()}_${i}`, chunk);
                    console.warn(`Fragmento ${i} guardado para ${this.tableName}`);
                } catch (e) {
                    console.warn(`Error al guardar fragmento ${i} para ${this.tableName}: ${e}`);
                }
            });
        } catch (e) {
            console.warn(`Error al serializar o guardar datos para ${this.tableName}: ${e}`);
        }
    }

    fetch() {
        try {
            const chunkCount = world.getDynamicProperty(`${this.getKey()}_count`) ?? 0;
            if (typeof chunkCount !== "number" || chunkCount <= 0) {
                console.warn(`No hay datos para ${this.tableName} o conteo inválido: ${chunkCount}`);
                return { teams: {}, players: {} };
            }
            let collectedData = "";
            for (let i = 0; i < chunkCount; i++) {
                const chunk = world.getDynamicProperty(`${this.getKey()}_${i}`);
                if (typeof chunk !== "string") {
                    console.warn(`Fragmento ${i} para ${this.tableName} no es una cadena válida`);
                    return { teams: {}, players: {} };
                }
                collectedData += chunk;
            }
            const parsedData = JSON.parse(collectedData);
            console.warn(`Datos cargados para ${this.tableName}: ${JSON.stringify(parsedData).slice(0, 100)}...`);
            return parsedData;
        } catch (e) {
            console.warn(`Error al cargar o parsear datos para ${this.tableName}: ${e}`);
            return { teams: {}, players: {} };
        }
    }

    getTeamData(teamName) {
        this.MEMORY = this.fetch();
        const data = this.MEMORY.teams[teamName] || null;
        console.warn(`Obteniendo datos del equipo/clan ${teamName}: ${JSON.stringify(data)}`);
        return data;
    }

    setTeamData(teamName, data) {
        this.MEMORY = this.fetch();
        this.MEMORY.teams[teamName] = data;
        console.warn(`Estableciendo datos para equipo/clan ${teamName}: ${JSON.stringify(data)}`);
        this.saveData();
    }

    getPlayerTeam(playerName) {
        this.MEMORY = this.fetch();
        const data = this.MEMORY.players[playerName] || { team: null, clan: null };
        console.warn(`Obteniendo equipo/clan para ${playerName}: ${JSON.stringify(data)}`);
        return data;
    }

    setPlayerTeam(playerName, type, teamName) {
        this.MEMORY = this.fetch();
        if (!this.MEMORY.players[playerName]) this.MEMORY.players[playerName] = { team: null, clan: null };
        this.MEMORY.players[playerName][type] = teamName;
        console.warn(`Estableciendo ${type} para ${playerName}: ${teamName}`);
        this.saveData();
    }
}

export const teamDB = new TeamDB();