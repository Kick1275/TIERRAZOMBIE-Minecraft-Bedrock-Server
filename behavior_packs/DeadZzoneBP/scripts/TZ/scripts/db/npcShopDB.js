import { world } from "@minecraft/server";

export class ShopDB {
    constructor() {
        this.tableName = "shop";
        this.MEMORY = this.fetch();
        console.warn(`Inicializando ShopDB`);
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

    getPurchasedItems(playerName) {
        this.MEMORY = this.fetch();
        const items = this.MEMORY[playerName]?.purchased || [];
        console.warn(`Obteniendo compras para ${playerName}: ${JSON.stringify(items)}`);
        return items;
    }

    addPurchase(playerName, itemId) {
        this.MEMORY = this.fetch();
        if (!this.MEMORY[playerName]) this.MEMORY[playerName] = { purchased: [] };
        this.MEMORY[playerName].purchased.push(itemId);
        console.warn(`Añadiendo compra ${itemId} para ${playerName}`);
        this.saveData();
    }

    getStock(npcId, itemId) {
        this.MEMORY = this.fetch();
        const stock = this.MEMORY[`npc_${npcId}`]?.items[itemId]?.stock || 0;
        console.warn(`Obteniendo stock para npcId: ${npcId}, itemId: ${itemId} -> ${stock}`);
        return stock;
    }

    reduceStock(npcId, itemId, quantity) {
        this.MEMORY = this.fetch();
        if (!this.MEMORY[`npc_${npcId}`]) this.MEMORY[`npc_${npcId}`] = { items: {} };
        if (!this.MEMORY[`npc_${npcId}`].items[itemId]) this.MEMORY[`npc_${npcId}`].items[itemId] = { stock: 0 };
        this.MEMORY[`npc_${npcId}`].items[itemId].stock = Math.max(0, this.MEMORY[`npc_${npcId}`].items[itemId].stock - quantity);
        console.warn(`Reduciendo stock para npcId: ${npcId}, itemId: ${itemId}, cantidad: ${quantity}`);
        this.saveData();
    }

addStock(npcId, itemId, quantity) {
    this.MEMORY = this.fetch();
    if (!this.MEMORY[`npc_${npcId}`]) this.MEMORY[`npc_${npcId}`] = { items: {} };
    if (!this.MEMORY[`npc_${npcId}`].items[itemId]) this.MEMORY[`npc_${npcId}`].items[itemId] = { stock: 0 };
    this.MEMORY[`npc_${npcId}`].items[itemId].stock = quantity; // Sobrescribir en lugar de sumar
    console.warn(`Forzando stock para npcId: ${npcId}, itemId: ${itemId}, cantidad: ${quantity}`);
    this.saveData();
}
}

export const shopDB = new ShopDB();