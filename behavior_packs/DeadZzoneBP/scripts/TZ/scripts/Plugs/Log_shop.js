import { shopDB as ShopDB } from "../db/npcShopDB.js";
import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

export function setupNpcShop({ npcId, npcLanguages, npcItems }) {
    const inventoryKey = `npc_inventory_${npcId}`;

    // Función para inicializar el inventario con 5 ítems aleatorios
    function initializeNpcInventory() {
        const selectedItems = [];
        const itemsCopy = [...npcItems];
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * itemsCopy.length);
            const selectedItem = itemsCopy.splice(randomIndex, 1)[0];
            selectedItems.push(selectedItem);
        }
        const npcInventory = {};
        selectedItems.forEach((item) => {
            npcInventory[item.id] = {
                name: item.name,
                price: item.buyPrice,
                quantity: 5,
                icon: item.icon,
            };
            // Inicializar stock en ShopDB
            ShopDB.addStock(npcId, item.id, 5);
            console.warn(`Inicializando stock para ${item.id}: 5 unidades`);
        });
        return npcInventory;
    }

    // Cargar inventario persistente o inicializarlo
    let npcInventory = {};
    const raw = world.getDynamicProperty(inventoryKey);
    if (raw) {
        try {
            npcInventory = JSON.parse(raw);
            // Verificar si el inventario cargado es válido (contiene al menos 5 ítems)
            const validItems = Object.keys(npcInventory).length >= 5;
            if (!validItems) {
                console.warn(`Inventario persistente inválido o incompleto para ${inventoryKey}, reinicializando`);
                npcInventory = initializeNpcInventory();
            }
        } catch (e) {
            console.warn(`Error al parsear inventario para ${inventoryKey}: ${e}, reinicializando`);
            npcInventory = initializeNpcInventory();
        }
    } else {
        npcInventory = initializeNpcInventory();
        world.setDynamicProperty(inventoryKey, JSON.stringify(npcInventory));
    }

    // Sincronizar npcInventory con ShopDB al inicio, solo si ShopDB tiene datos válidos
    Object.keys(npcInventory).forEach(itemId => {
        const stock = ShopDB.getStock(npcId, itemId);
        console.warn(`Sincronización inicial para ${itemId}: ShopDB=${stock}, npcInventory=${npcInventory[itemId].quantity}`);
        if (stock !== undefined && stock > 0 && stock !== npcInventory[itemId].quantity) {
            console.warn(`Actualizando ${itemId} de ${npcInventory[itemId].quantity} a ${stock} desde ShopDB`);
            npcInventory[itemId].quantity = stock;
        } else if (stock === 0) {
            console.warn(`Stock en ShopDB es 0 para ${itemId}, manteniendo ${npcInventory[itemId].quantity} de npcInventory`);
        }
    });
    saveInventory();

    // Cada vez que cambies el inventario (compra/venta), guarda:
    function saveInventory() {
        world.setDynamicProperty(inventoryKey, JSON.stringify(npcInventory));
    }

    // Utilidades
    function getPlayerMoney(player) {
        const scoreboard = world.scoreboard.getObjective("money");
        return scoreboard ? scoreboard.getScore(player) || 0 : 0;
    }

    function getPlayerLanguage(player) {
        if (player.hasTag("lang_es_ES")) return "es_ES";
        return "en_US";
    }

    function getPlayerItems(player) {
        const inventory = player.getComponent("minecraft:inventory").container;
        const items = {};
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item) {
                items[item.typeId] = (items[item.typeId] || 0) + item.amount;
            }
        }
        return items;
    }

    function removeItem(player, itemId, count) {
        const inventory = player.getComponent("minecraft:inventory").container;
        let totalAvailable = 0;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item && item.typeId === itemId) {
                totalAvailable += item.amount;
            }
        }
        if (count > totalAvailable) return false;
        let remaining = count;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item && item.typeId === itemId) {
                if (item.amount >= remaining) {
                    if (item.amount === remaining) {
                        inventory.setItem(i, null);
                    } else {
                        item.amount -= remaining;
                        inventory.setItem(i, item);
                    }
                    return true;
                } else {
                    remaining -= item.amount;
                    inventory.setItem(i, null);
                }
            }
        }
        return true;
    }

    // Menú principal
    function showNpcMenu(player) {
        const lang = getPlayerLanguage(player);
        const texts = npcLanguages[lang];
        const playerMoney = getPlayerMoney(player);

        const isAdmin = player.hasTag("admin");

        const form = new ActionFormData()
            .title(`§l§6👷 ${texts.title} 👷`)
            .body(`§e${texts.body}\n§7────────────────────\n§b💰 ${playerMoney} TZ Coins\n§7────────────────────`)
            .button(`§a${texts.buy} 🛒`, "textures/ui/village_hero_effect.png")
            .button(`§b${texts.sell} 💸`, "textures/ui/MCoin.png");
        if (isAdmin) form.button("§e[Admin] Resetear inventario 🔄", "textures/ui/op.png");
        form.button(`§c${texts.exit} ❌`, "textures/ui/realms_red_x.png");

        form.show(player).then((result) => {
            if (result.canceled) return;
            if (result.selection === 0) { buy(player, texts); return; }
            if (result.selection === 1) { sell(player, texts); return; }
            if (isAdmin && result.selection === 2) {
                try { world.setDynamicProperty(inventoryKey, undefined); } catch {}
                for (const key of Object.keys(npcInventory)) delete npcInventory[key];
                const fresh = initializeNpcInventory();
                for (const [k, v] of Object.entries(fresh)) npcInventory[k] = v;
                saveInventory();
                player.sendMessage("§a✓ Inventario del NPC reseteado correctamente.");
                return;
            }
        }).catch((error) => {
            console.warn(`Error en showNpcMenu: ${error}`);
            player.sendMessage("§cError al mostrar el menú principal.");
        });
    }

    // Menú de compra
    function buy(player, texts) {
        const lang = getPlayerLanguage(player);
        const playerMoney = getPlayerMoney(player);

        const form = new ActionFormData()
            .title(`§l§6🛒 ${texts.buy_title} 🛒`)
            .body(`§e${texts.body}\n§7────────────────────\n§b💰 ${playerMoney} TZ Coins\n§7────────────────────`);

        // Mostrar solo los ítems disponibles en npcInventory con cantidad > 0
        Object.keys(npcInventory).forEach((itemId) => {
            const item = npcInventory[itemId];
            if (item.quantity > 0) { // Filtrar solo ítems con stock disponible
                const itemName = (item.name && item.name[lang]) ? item.name[lang] : item.name["en_US"];
                form.button(
                    `§l§a${itemName}\n§7💵 §e${item.price} TZ Coins\n§7📦 §f${item.quantity} disponibles`,
                    item.icon
                );
            }
        });

        form.button(`§c${texts.exit} ❌`);

        form.show(player).then((result) => {
            if (result.canceled) {
                player.sendMessage(`§c${texts.canceled}`);
                return;
            }
            const availableItemIds = Object.keys(npcInventory).filter(id => npcInventory[id].quantity > 0);
            const selectedItemId = availableItemIds[result.selection];
            const selectedItem = npcInventory[selectedItemId];
            if (selectedItem) {
                showBuyForm(player, selectedItemId, selectedItem.price, selectedItem.quantity, texts);
            } else {
                player.sendMessage("§cÍtem no válido seleccionado.");
            }
        }).catch((error) => {
            console.warn(`Error en buy: ${error}`);
            player.sendMessage("§cError al mostrar el menú de compra.");
        });
    }

    // Formulario de compra
    function showBuyForm(player, itemId, buyPrice, maxQuantity, texts) {
        const lang = getPlayerLanguage(player);
        const playerMoney = getPlayerMoney(player);
        // Sincronizar con ShopDB antes de mostrar el formulario
        const stockFromDB = ShopDB.getStock(npcId, itemId);
        console.warn(`Stock antes de sincronización para ${itemId}: ShopDB=${stockFromDB}, maxQuantity=${maxQuantity}`);
        if (stockFromDB !== undefined && stockFromDB !== maxQuantity) {
            console.warn(`Sincronizando stock para ${itemId}: ShopDB=${stockFromDB}, maxQuantity=${maxQuantity}`);
            maxQuantity = stockFromDB;
            npcInventory[itemId].quantity = stockFromDB;
            saveInventory();
        }
        const max = Math.min(maxQuantity, 64);
        const options = [];
        for (let i = 1; i <= max; i++) options.push(i.toString());

        const form = new ModalFormData()
            .title(`§l§6🛒 ${texts.buy_title} 🛒`)
            .dropdown(
                `§e${texts.buy_body}\n§7────────────────────\n§b💰 ${playerMoney} TZ Coins\n§7💵 Costo por unidad: §e${buyPrice} TZ Coins\n§7📦 Cantidad disponible: §e${maxQuantity}\n§7────────────────────`,
                options
            );

        form.show(player).then((response) => {
            if (response.canceled) {
                player.sendMessage(`§c${texts.canceled}`);
                return;
            }

            const quantity = parseInt(options[response.formValues[0]]);
            if (isNaN(quantity) || quantity <= 0 || quantity > maxQuantity) {
                player.sendMessage(texts.not_enough_items || "§cNo hay suficientes ítems disponibles.");
                return;
            }

            const totalCost = quantity * buyPrice;

            if (playerMoney >= totalCost) {
                // Verificar métodos de ShopDB
                if (typeof ShopDB.getStock !== 'function' || typeof ShopDB.reduceStock !== 'function') {
                    console.warn("Métodos de ShopDB no están definidos.");
                    player.sendMessage("§cError: La base de datos de la tienda no está inicializada.");
                    return;
                }

                // Verificar stock en ShopDB
                const stock = ShopDB.getStock(npcId, itemId);
                console.warn(`Verificando stock para ${itemId}: ShopDB=${stock}, quantity=${quantity}`);
                if (stock < quantity) {
                    player.sendMessage(`§cEl NPC no tiene suficiente stock de este ítem. Stock real: ${stock}`);
                    return;
                }

                const scoreboard = world.scoreboard.getObjective("money");
                if (scoreboard) {
                    const playerScore = scoreboard.getScore(player) || 0;
                    scoreboard.setScore(player, playerScore - totalCost);
                }

                // Actualizar npcInventory
                npcInventory[itemId].quantity -= quantity;
                if (npcInventory[itemId].quantity <= 0) {
                    delete npcInventory[itemId];
                }

                // Actualizar ShopDB
                ShopDB.reduceStock(npcId, itemId, quantity);

                player.runCommand(`give @s ${itemId} ${quantity}`);
                player.runCommand('playsound NPC.Buy');

                // Mensaje detallado de compra
                const itemData = npcItems.find(item => item.id === itemId);
                const itemName = itemData.name[lang] || itemData.name["en_US"];
                const saldoFinal = getPlayerMoney(player);
                player.sendMessage(
                    `§a${lang === "es_ES"
                        ? `¡Compra exitosa!\n§fCompraste: §e${quantity}x ${itemName}\n§fPrecio unitario: §e${buyPrice} TZ Coins\n§fTotal gastado: §e${totalCost} TZ Coins\n§fSaldo actual: §b${saldoFinal} TZ Coins`
                        : `Purchase successful!\n§fYou bought: §e${quantity}x ${itemName}\n§fUnit price: §e${buyPrice} TZ Coins\n§fTotal spent: ${totalCost} TZ Coins\n§fCurrent balance: §b${saldoFinal} TZ Coins`
                    }`
                );

                saveInventory(); // Guardar inventario después de la compra

                buy(player, texts);
            } else {
                player.sendMessage(`§c${texts.not_enough_money || "No tienes suficientes TZ Coins."}`);
            }
        }).catch((error) => {
            console.warn(`Error en showBuyForm: ${error}`);
            player.sendMessage("§cError al procesar la compra.");
        });
    }

    // Menú de venta
    function sell(player, texts) {
        const lang = getPlayerLanguage(player);
        const playerItems = getPlayerItems(player);

        const form = new ActionFormData()
            .title(`§l§b💸 ${texts.sell_title} 💸`)
            .body(`§e${texts.body}\n§7────────────────────`);

        npcItems.forEach(item => {
            if (playerItems[item.id]) {
                const itemName = item.name[lang] || item.name["en_US"];
                form.button(
                    `§l§b${itemName}\n§7💵 §e${item.sellPrice} TZ Coins\n§7📦 §f${playerItems[item.id]} en inventario`,
                    item.icon
                );
            }
        });

        form.button(`§c${texts.exit} ❌`);

        form.show(player).then((result) => {
            if (result.canceled) {
                player.sendMessage(`§c${texts.canceled}`);
                return;
            }
            const sellableItems = npcItems.filter(item => playerItems[item.id]);
            if (result.selection < sellableItems.length) {
                const selectedItem = sellableItems[result.selection];
                showSellForm(player, selectedItem.id, selectedItem.sellPrice, texts);
            }
        }).catch((error) => {
            console.warn(`Error en sell: ${error}`);
            player.sendMessage("§cError al mostrar el menú de venta.");
        });
    }

    // Formulario de venta
    function showSellForm(player, itemId, sellPrice, texts) {
        const lang = getPlayerLanguage(player);
        const playerMoney = getPlayerMoney(player);
        const inventory = player.getComponent("minecraft:inventory").container;
        let maxQuantity = 0;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item && item.typeId === itemId) {
                maxQuantity += item.amount;
            }
        }
        if (maxQuantity === 0) {
            player.sendMessage(texts.not_enough_items || "§cNo tienes suficientes ítems para vender.");
            return;
        }

        const max = Math.min(maxQuantity, 64);
        const options = [];
        for (let i = 1; i <= max; i++) options.push(i.toString());

        const form = new ModalFormData()
            .title(`§l§b💸 ${texts.sell_title} 💸`)
            .dropdown(
                `§e${texts.sell_body}\n§7────────────────────\n§b💰 ${playerMoney} TZ Coins\n§7💵 Ganancia por unidad: §e${sellPrice} TZ Coins\n§7📦 Cantidad disponible: §e${maxQuantity}\n§7────────────────────`,
                options
            );

        form.show(player).then((response) => {
            if (response.canceled) {
                player.sendMessage(`§c${texts.canceled}`);
                return;
            }

            const quantity = parseInt(options[response.formValues[0]]);
            if (isNaN(quantity) || quantity <= 0) {
                player.sendMessage(texts.not_enough_items || "§cNo tienes suficientes ítems para vender.");
                return;
            }

            if (removeItem(player, itemId, quantity)) {
                const totalEarned = quantity * sellPrice;

                const scoreboard = world.scoreboard.getObjective("money");
                if (scoreboard) {
                    const playerScore = scoreboard.getScore(player) || 0;
                    scoreboard.setScore(player, playerScore + totalEarned);
                }

                if (!npcInventory[itemId]) {
                    const itemData = npcItems.find(item => item.id === itemId);
                    npcInventory[itemId] = {
                        name: itemData.name,
                        price: itemData.sellPrice * 3,
                        quantity: 0,
                        icon: itemData.icon,
                    };
                }

                npcInventory[itemId].quantity += quantity;
                if (typeof ShopDB.addStock === 'function') {
                    ShopDB.addStock(npcId, itemId, quantity);
                } else {
                    console.warn("Método addStock no está definido en ShopDB.");
                    player.sendMessage("§cError: No se pudo actualizar el stock de la tienda.");
                }

                player.runCommand('playsound NPC.Buy');

                // Mensaje detallado de venta
                const itemData = npcItems.find(item => item.id === itemId);
                const itemName = itemData.name[lang] || itemData.name["en_US"];
                const saldoFinal = getPlayerMoney(player);
                player.sendMessage(
                    `§a${lang === "es_ES"
                        ? `¡Venta exitosa!\n§fVendiste: §e${quantity}x ${itemName}\n§fPrecio unitario: §e${sellPrice} TZ Coins\n§fTotal ganado: §e${totalEarned} TZ Coins\n§fSaldo actual: §b${saldoFinal} TZ Coins`
                        : `Sale successful!\n§fYou sold: §e${quantity}x ${itemName}\n§fUnit price: §e${sellPrice} TZ Coins\n§fTotal earned: §e${totalEarned} TZ Coins\n§fCurrent balance: §b${saldoFinal} TZ Coins`
                    }`
                );

                saveInventory(); // Guardar inventario después de la venta

                sell(player, texts);
            } else {
                player.sendMessage(texts.not_enough_items || "§cNo tienes suficientes ítems para vender.");
            }
        }).catch((error) => {
            console.warn(`Error en showSellForm: ${error}`);
            player.sendMessage("§cError al procesar la venta.");
        });
    }

    world.afterEvents.playerInteractWithEntity.subscribe((event) => {
        const player = event.player;
        const target = event.target;
        if (target.typeId === npcId) {
            showNpcMenu(player);
        }
    });

    world.afterEvents.entityHitEntity.subscribe((event) => {
        const player = event.damagingEntity;
        const target = event.hitEntity;
        if (player?.typeId === "minecraft:player" && target?.typeId === npcId) {
            showNpcMenu(player);
        }
    });
}