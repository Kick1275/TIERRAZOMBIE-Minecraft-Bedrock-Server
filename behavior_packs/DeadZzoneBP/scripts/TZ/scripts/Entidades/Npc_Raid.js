console.warn("Npc_Raid correctamente")
import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Objeto de idiomas para el NPC Bartender
const npcLanguages = {
    en_US: {
        title: "Bartender",
        body: "What would you like to do?",
        buy: "Buy",
        sell: "Sell",
        exit: "Exit",
        sell_title: "Sell",
        sell_body: "Enter the quantity you want to sell:",
        buy_title: "Buy",
        buy_body: "Enter the quantity you want to buy:",
        not_enough_items: "You don't have enough items to sell.",
        not_enough_money: "You don't have enough money to buy this.",
        transaction_success: "Transaction successful!",
        canceled: "You canceled the operation.",
    },
    es_ES: {
        title: "Cantinero",
        body: "¿Qué deseas hacer?",
        buy: "Comprar",
        sell: "Vender",
        exit: "Salir",
        sell_title: "Vender",
        sell_body: "Ingresa la cantidad que deseas vender:",
        buy_title: "Comprar",
        buy_body: "Ingresa la cantidad que deseas comprar:",
        not_enough_items: "No tienes suficientes ítems para vender.",
        not_enough_money: "No tienes suficiente dinero para comprar esto.",
        transaction_success: "¡Transacción exitosa!",
        canceled: "Has cancelado la operación.",
    },
};

// Plantilla de ítems para el NPC (con nombres multilenguaje)
const npcItems = [
    { id: " rt:11x11_block", name: { es_ES: "Proteccion 11x11", en_US: "Protection 11x11" }, buyPrice: 10000, sellPrice: 5000, icon: "textures/items/protections/11x11.png" },
    { id: "rt:upgrade_protection", name: { es_ES: "Mejora de proteccion", en_US: "Protection Upgrade" }, buyPrice: 30000, sellPrice: 15000, icon: "textures/items/protections/upgrade_protection.png" },
    { id: "rt:turret_spawn_egg", name: { es_ES: "Torreta", en_US: "Turret" }, buyPrice: 5000, sellPrice: 2500, icon: "textures/items/protections/turret.png" },
    {id: "mcpe:c4_explosive", name: { es_ES: "C4", en_US: "C4" }, buyPrice: 50000, sellPrice: 25000, icon: "textures/items/grenade/c4_explosive.png" },
    {id : "mcpe:frag_grenade", name: { es_ES: "Granada de Mano", en_US: "Hand Grenade" }, buyPrice: 25000, sellPrice: 12000, icon: "textures/items/grenade/frag_grenade.png" },
    {id: "mcpe:pipe_bomb", name: {es_ES: "Bomba Casera", en_US: "Pipe Bomb" }, buyPrice: 12000, sellPrice: 6500, icon: "textures/items/grenade/pipe_bomb.png" },
];

// Inventario del NPC
const npcInventory = {};
const npcId = "tz:npc_raid";

// Inicializar el inventario del NPC con 5 ítems aleatorios
function initializeNpcInventory() {
    const selectedItems = [];
    const itemsCopy = [...npcItems];
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * itemsCopy.length);
        const selectedItem = itemsCopy.splice(randomIndex, 1)[0];
        selectedItems.push(selectedItem);
    }
    selectedItems.forEach((item) => {
        npcInventory[item.id] = {
            name: item.name,
            price: item.buyPrice,
            quantity: 60000,
            icon: item.icon,
        };
    });
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
    if (count > totalAvailable) {
        player.sendMessage("§cNo tienes suficientes ítems para vender.");
        return false;
    }
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

    const form = new ActionFormData()
        .title(`§l§6 ${texts.title} `)
        .body(`§e${texts.body}\n§7────────────────────\n§b ${playerMoney} TZ Coins\n§7────────────────────`)
        .button(`§a${texts.buy} `, "textures/ui/village_hero_effect.png")
        .button(`§b${texts.sell} `, "textures/ui/MCoin.png")
        .button(`§c${texts.exit} `, "textures/ui/realms_red_x.png");

    form.show(player).then((result) => {
        if (result.canceled) {
            player.sendMessage(`§c${texts.canceled}`);
            return;
        }
        switch (result.selection) {
            case 0:
                buy(player, texts);
                break;
            case 1:
                sell(player, texts);
                break;
            default:
                player.sendMessage(`§c${texts.canceled}`);
                break;
        }
    });
}

// Menú de compra
function buy(player, texts) {
    const lang = getPlayerLanguage(player);
    const playerMoney = getPlayerMoney(player);

    const form = new ActionFormData()
        .title(`§l§6🛒 ${texts.buy_title} 🛒`)
        .body(`§e${texts.body}\n§7────────────────────\n§b💰 ${playerMoney} TZ Coins\n§7────────────────────`);

    Object.keys(npcInventory).forEach((itemId) => {
        const item = npcInventory[itemId];
        const itemName = item.name[lang] || item.name["en_US"];
        form.button(
            `§l§a${itemName}\n§7💵 §e${item.price} TZ Coins\n§7📦 §f${item.quantity} disponibles`,
            item.icon
        );
    });

    form.button(`§c${texts.exit} ❌`);

    form.show(player).then((result) => {
        if (result.canceled) {
            player.sendMessage(`§c${texts.canceled}`);
            return;
        }
        if (result.selection >= Object.keys(npcInventory).length) {
            player.sendMessage(`§c${texts.canceled}`);
            return;
        }
        const selectedItemId = Object.keys(npcInventory)[result.selection];
        const selectedItem = npcInventory[selectedItemId];
        showBuyForm(player, selectedItemId, selectedItem.price, selectedItem.quantity, texts);
    });
}

// Formulario de compra
function showBuyForm(player, itemId, buyPrice, maxQuantity, texts) {
    const lang = getPlayerLanguage(player);
    const playerMoney = getPlayerMoney(player);
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
            player.sendMessage(texts.not_enough_items);
            return;
        }

        const totalCost = quantity * buyPrice;

        if (playerMoney >= totalCost) {
            const scoreboard = world.scoreboard.getObjective("money");
            if (scoreboard) {
                const playerScore = scoreboard.getScore(player) || 0;
                scoreboard.setScore(player, playerScore - totalCost);
            }

            npcInventory[itemId].quantity -= quantity;
            if (npcInventory[itemId].quantity === 0) {
                delete npcInventory[itemId];
            }

            player.runCommand(`give @s ${itemId} ${quantity}`);
            player.runCommand('playsound NPC.Buy');

            const itemData = npcItems.find(item => item.id === itemId);
            const itemName = itemData.name[lang] || itemData.name["en_US"];
            const saldoFinal = getPlayerMoney(player);
            player.sendMessage(
                `§a${lang === "es_ES"
                    ? `¡Compra exitosa!\n§fCompraste: §e${quantity}x ${itemName}\n§fPrecio unitario: §e${buyPrice} TZ Coins\n§fTotal gastado: §e${totalCost} TZ Coins\n§fSaldo actual: §b${saldoFinal} TZ Coins`
                    : `Purchase successful!\n§fYou bought: §e${quantity}x ${itemName}\n§fUnit price: §e${buyPrice} TZ Coins\n§fTotal spent: §e${totalCost} TZ Coins\n§fCurrent balance: §b${saldoFinal} TZ Coins`
                }`
            );

            buy(player, texts); // Recargar menú de compra sin persistencia
        } else {
            player.sendMessage(`§c${texts.not_enough_money}`);
        }
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
        } else {
            player.sendMessage(`§c${texts.canceled}`);
        }
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
        player.sendMessage(texts.not_enough_items);
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
            player.sendMessage(texts.not_enough_items);
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
                    price: itemData.buyPrice,
                    quantity: 0,
                    icon: itemData.icon,
                };
            }

            npcInventory[itemId].quantity += quantity;
            player.runCommand('playsound NPC.Buy');

            const itemData = npcItems.find(item => item.id === itemId);
            const itemName = itemData.name[lang] || itemData.name["en_US"];
            const saldoFinal = getPlayerMoney(player);
            player.sendMessage(
                `§a${lang === "es_ES"
                    ? `¡Venta exitosa!\n§fVendiste: §e${quantity}x ${itemName}\n§fPrecio unitario: §e${sellPrice} TZ Coins\n§fTotal ganado: §e${totalEarned} TZ Coins\n§fSaldo actual: §b${saldofinal} TZ Coins`
                    : `Sale successful!\n§fYou sold: §e${quantity}x ${itemName}\n§fUnit price: §e${sellPrice} TZ Coins\n§fTotal earned: §e${totalEarned} TZ Coins\n§fCurrent balance: §b${saldoFinal} TZ Coins`
                }`
            );

            sell(player, texts); // Recargar menú de venta sin persistencia
        } else {
            player.sendMessage(texts.not_enough_items);
        }
    });
}

// Inicializar inventario al iniciar
initializeNpcInventory();

// Eventos de interacción
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