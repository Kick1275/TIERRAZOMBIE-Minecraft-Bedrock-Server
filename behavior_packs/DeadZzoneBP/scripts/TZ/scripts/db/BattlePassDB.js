import { world } from "@minecraft/server";

export class NpcShopDB {
    constructor(tableName) {
        this.tableName = tableName;
        this.MEMORY = this.fetch();
        console.warn(`Inicializando NpcShopDB para ${tableName}`);
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
                return {};
            }
            let collectedData = "";
            for (let i = 0; i < chunkCount; i++) {
                const chunk = world.getDynamicProperty(`${this.getKey()}_${i}`);
                if (typeof chunk !== "string") {
                    console.warn(`Fragmento ${i} para ${this.tableName} no es una cadena válida`);
                    return {};
                }
                collectedData += chunk;
            }
            const parsedData = JSON.parse(collectedData);
            console.warn(`Datos cargados para ${this.tableName}: ${JSON.stringify(parsedData).slice(0, 100)}...`);
            return parsedData;
        } catch (e) {
            console.warn(`Error al cargar o parsear datos para ${this.tableName}: ${e}`);
            return {};
        }
    }

    getData(playerName, key) {
        this.MEMORY = this.fetch();
        const data = this.MEMORY[playerName]?.[key] ?? null;
        console.warn(`Obteniendo ${key} para ${playerName} en ${this.tableName}: ${JSON.stringify(data)}`);
        return data;
    }

    setData(playerName, key, value) {
        this.MEMORY = this.fetch();
        if (!this.MEMORY[playerName]) this.MEMORY[playerName] = {};
        this.MEMORY[playerName][key] = value;
        console.warn(`Estableciendo ${key} para ${playerName} en ${this.tableName}: ${JSON.stringify(value)}`);
        this.saveData();
    }
}

export const battlePassDB = new NpcShopDB("battlePass");
export const rewardsDB = new NpcShopDB("battlePassRewards");