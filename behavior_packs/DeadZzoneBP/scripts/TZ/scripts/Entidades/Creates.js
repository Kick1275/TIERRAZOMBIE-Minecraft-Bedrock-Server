console.warn("Crates Cargado correctamente")
import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Configuración de crates
const cratesConfig = {
    "tz:crate_oak": {
        title: "Crate de Roble",
        key: "tz:key_oak",
        items: [
            // Ropa básica
            { id: "mcpe:flannel_blue", name: "Flannel Blue", amount: 1 },
            { id: "mcpe:hawaiian_black", name: "Hawaiian Black", amount: 1 },
            { id: "mcpe:hoodie_yellow", name: "Hoodie Yellow", amount: 1 },
            { id: "mcpe:hoodie_black", name: "Hoodie Black", amount: 1 },
            { id: "mcpe:police_top", name: "Police Top", amount: 1 },
            { id: "mcpe:varsity_green", name: "Varsity Green", amount: 1 },
            { id: "mcpe:hoodie_green", name: "Hoodie Green", amount: 1 },
            { id: "mcpe:puffer_black", name: "Puffer Black", amount: 1 },
            { id: "mcpe:puffer_blue", name: "Puffer Blue", amount: 1 },
            { id: "mcpe:jean_blue", name: "Jean Blue", amount: 1 },
            { id: "mcpe:trackpants_blue", name: "Trackpants Blue", amount: 1 },
            { id: "mcpe:bdu_desert_bottom", name: "BDU Desert Bottom", amount: 1 },
            { id: "mcpe:police_bottom", name: "Police Bottom", amount: 1 },
            { id: "mcpe:cargo_white", name: "Cargo White", amount: 1 },
            { id: "mcpe:biker_blue", name: "Biker Blue", amount: 1 },
            { id: "mcpe:ballistic_black", name: "Ballistic Black", amount: 1 },
            { id: "mcpe:mask_troll", name: "Mask Troll", amount: 1 },
            { id: "mcpe:mask_funni", name: "Mask Funni", amount: 1 },
            { id: "mcpe:mask_fawkes", name: "Mask Fawkes", amount: 1 },
            { id: "mcpe:skimask_black", name: "Ski Mask Black", amount: 1 },
            { id: "mcpe:police_hat", name: "Police Hat", amount: 1 },
            { id: "mcpe:ballistic_green", name: "Ballistic Green", amount: 1 },
            { id: "mcpe:clown_wig", name: "Clown Wig", amount: 1 },
            { id: "mcpe:balaclava_black", name: "Balaclava Black", amount: 1 },
            { id: "mcpe:police_vest", name: "Police Vest", amount: 1 },
            // Armas básicas — pistolas y escopeta doble
            { id: "krep:cp", name: "CP Pistol", amount: 1 },
            { id: "krep:mm9", name: "9mm", amount: 5 },
            { id: "krep:g17", name: "Glock 17", amount: 1 },
            { id: "krep:mm9", name: "9mm", amount: 5 },
            { id: "krep:m1911", name: "M1911", amount: 1 },
            { id: "krep:acp45", name: ".45 ACP", amount: 5 },
            { id: "krep:db", name: "Double Barrel", amount: 1 },
            { id: "krep:gauge12", name: "12 Gauge", amount: 4 },
            { id: "krep:uzi", name: "UZI", amount: 1 },
            { id: "krep:mm9", name: "9mm", amount: 6 },
            { id: "krep:mp5", name: "MP5", amount: 1 },
            { id: "krep:mm9", name: "9mm", amount: 8 },
            // Consumibles
            { id: "minecraft:experience_bottle", name: "Experience Bottle", amount: 20 },
            { id: "minecraft:cooked_chicken", name: "Cooked Chicken", amount: 6 },
            { id: "mcpe:cooked_rabbit", name: "Cooked Rabbit", amount: 6 },
            { id: "minecraft:bread", name: "Bread", amount: 32 },
            { id: "minecraft:shield", name: "Shield", amount: 1 },
            { id: "minecraft:bow", name: "Bow", amount: 1 },
            { id: "minecraft:arrow", name: "Arrow", amount: 32 },
            { id: "mcpe:fireman_axe", name: "Fireman Axe", amount: 1 },
            { id: "minecraft:golden_apple", name: "Golden Apple", amount: 4 },
        ],
        itemCount: 3,
        commands: {
            interact: ["playsound random.orb @s"],
            open: ["playsound random.levelup @s"],
        },
    },
    "tz:crate_oro": {
        title: "Crate de Oro",
        key: "tz:key_gold",
        items: [
            // Ropa media
            { id: "mcpe:biker_black", name: "Biker Black", amount: 1 },
            { id: "mcpe:plate_vest_gray", name: "Plate Vest Gray", amount: 1 },
            { id: "mcpe:hazmat_white_top", name: "Hazmat White Top", amount: 1 },
            { id: "mcpe:tactical_vest_black", name: "Tactical Vest Black", amount: 1 },
            { id: "mcpe:ghillie_forest_top", name: "Ghillie Forest Top", amount: 1 },
            { id: "mcpe:ghillie_forest_bottom", name: "Ghillie Forest Bottom", amount: 1 },
            { id: "mcpe:tracksuit_black", name: "Tracksuit Black", amount: 1 },
            { id: "mcpe:gasmask_black", name: "Gasmask Black", amount: 1 },
            { id: "mcpe:plate_vest_tan", name: "Plate Vest Tan", amount: 1 },
            { id: "mcpe:plate_vest_olive", name: "Plate Vest Olive", amount: 1 },
            { id: "mcpe:hazmat_yellow_top", name: "Hazmat Yellow Top", amount: 1 },
            { id: "mcpe:hazmat_yellow_bottom", name: "Hazmat Yellow Bottom", amount: 1 },
            { id: "mcpe:welder_mask", name: "Welder Mask", amount: 1 },
            { id: "mcpe:respirator_mask", name: "Respirator Mask", amount: 1 },
            // Armas medias — pistolas buenas, SMGs, escopeta, semi-auto
            { id: "krep:b93", name: "B93R", amount: 1 },
            { id: "krep:mm9", name: "9mm", amount: 10 },
            { id: "krep:deagle", name: "Desert Eagle", amount: 1 },
            { id: "krep:ae50", name: ".50 AE", amount: 8 },
            { id: "krep:t50", name: "T50", amount: 1 },
            { id: "krep:ae50", name: ".50 AE", amount: 8 },
            { id: "krep:ump", name: "UMP-45", amount: 1 },
            { id: "krep:acp45", name: ".45 ACP", amount: 12 },
            { id: "krep:mp7", name: "MP7", amount: 1 },
            { id: "krep:mm4630", name: "4.6x30mm", amount: 12 },
            { id: "krep:vector", name: "Vector", amount: 1 },
            { id: "krep:acp45", name: ".45 ACP", amount: 12 },
            { id: "krep:m870", name: "M870", amount: 1 },
            { id: "krep:gauge12", name: "12 Gauge", amount: 10 },
            { id: "krep:sks", name: "SKS", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 15 },
            // Consumibles
            { id: "minecraft:golden_apple", name: "Golden Apple", amount: 4 },
            { id: "mcpe:splint", name: "Splint", amount: 3 },
            { id: "mcpe:bandage", name: "Bandage", amount: 5 },
            { id: "mcpe:chocolate_bar", name: "Chocolate Bar", amount: 8 },
            { id: "mcpe:canned_spaghetti", name: "Canned Spaghetti", amount: 6 },
            { id: "minecraft:totem_of_undying", name: "Totem of Undying", amount: 1 },
            { id: "mcpe:pipe_bomb", name: "Pipe Bomb", amount: 1 },
            { id: "mcpe:frag_grenade", name: "Frag Grenade", amount: 1 },
        ],
        itemCount: 3,
        commands: {
            interact: ["playsound random.orb @s"],
            open: ["playsound random.levelup @s"],
        },
    },
    "tz:crate_emerald": {
        title: "Crate de Esmeralda",
        key: "tz:key_emerald",
        items: [
            // Ropa táctica
            { id: "mcpe:ballistic_black", name: "Ballistic Black", amount: 1 },
            { id: "mcpe:tactical_vest_tan", name: "Tactical Vest Tan", amount: 1 },
            { id: "mcpe:assault_helmet_black", name: "Assault Helmet Black", amount: 1 },
            { id: "mcpe:night_goggles", name: "Night Goggles", amount: 1 },
            { id: "mcpe:suit_top_black", name: "Suit Top Black", amount: 1 },
            { id: "mcpe:suit_bottom_black", name: "Suit Bottom Black", amount: 1 },
            { id: "mcpe:biker_vest_skull", name: "Biker Vest Skull", amount: 1 },
            { id: "mcpe:shemagh_olive", name: "Shemagh Olive", amount: 1 },
            { id: "mcpe:tactical_vest_olive", name: "Tactical Vest Olive", amount: 1 },
            { id: "mcpe:ghillie_drygrass_top", name: "Ghillie Drygrass Top", amount: 1 },
            { id: "mcpe:firefighter_top", name: "Firefighter Top", amount: 1 },
            { id: "mcpe:firefighter_bottom", name: "Firefighter Bottom", amount: 1 },
            // ARs estándar y battle rifles
            { id: "krep:akm", name: "AKM", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 20 },
            { id: "krep:m16", name: "M16", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 20 },
            { id: "krep:m16a1", name: "M16A1", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 20 },
            { id: "krep:g36", name: "G36", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 20 },
            { id: "krep:type81", name: "Type 81", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 20 },
            { id: "krep:g3", name: "G3", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 18 },
            { id: "krep:fal", name: "FAL", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 18 },
            // Escopetas avanzadas
            { id: "krep:aa12", name: "AA-12", amount: 1 },
            { id: "krep:gauge12", name: "12 Gauge", amount: 12 },
            { id: "krep:saiga12", name: "Saiga-12", amount: 1 },
            { id: "krep:gauge12", name: "12 Gauge", amount: 12 },
            // Sniper básico
            { id: "krep:win308", name: "Win 308", amount: 1 },
            { id: "krep:lapua338", name: ".338 Lapua", amount: 8 },
            // Consumibles
            { id: "mcpe:first_aid", name: "First Aid", amount: 8 },
            { id: "mcpe:painkiller", name: "Painkiller", amount: 8 },
            { id: "minecraft:golden_apple", name: "Golden Apple", amount: 8 },
            { id: "mcpe:frag_grenade", name: "Frag Grenade", amount: 2 },
            { id: "mcpe:smoke_grenade", name: "Smoke Grenade", amount: 2 },
            { id: "mcpe:c4_explosive", name: "C4 Explosive", amount: 1 },
            { id: "mcpe:landmine", name: "Landmine", amount: 3 },
            { id: "minecraft:totem_of_undying", name: "Totem of Undying", amount: 1 },
            { id: "mcpe:lockpick", name: "Lockpick", amount: 2 },
            { id: "pubg:opentop_spawn_egg", name: "Open Top Spawn Egg", amount: 1 },
        ],
        itemCount: 5,
        commands: {
            interact: ["playsound random.orb @s"],
            open: ["playsound random.levelup @s"],
        },
    },
    "tz:crate_diamond": {
        title: "Crate de Diamante",
        key: "tz:key_diamond",
        items: [
            // Ropa premium
            { id: "mcpe:tactical_vest_black", name: "Tactical Vest Black", amount: 1 },
            { id: "mcpe:spec_helmet", name: "Spec Helmet", amount: 1 },
            { id: "mcpe:special_top", name: "Special Top", amount: 1 },
            { id: "mcpe:special_bottom", name: "Special Bottom", amount: 1 },
            { id: "mcpe:assault_helmet_olive", name: "Assault Helmet Olive", amount: 1 },
            { id: "mcpe:combat_olive", name: "Combat Olive", amount: 1 },
            { id: "mcpe:beret_green", name: "Beret Green", amount: 1 },
            { id: "mcpe:ghillie_forest_top", name: "Ghillie Forest Top", amount: 1 },
            { id: "mcpe:ghillie_forest_bottom", name: "Ghillie Forest Bottom", amount: 1 },
            { id: "mcpe:bdu_woodland_top", name: "BDU Woodland Top", amount: 1 },
            { id: "mcpe:bdu_woodland_bottom", name: "BDU Woodland Bottom", amount: 1 },
            { id: "mcpe:tactical_helmet_white", name: "Tactical Helmet White", amount: 1 },
            { id: "mcpe:tactical_vest_white", name: "Tactical Vest White", amount: 1 },
            { id: "mcpe:bdu_artic_top", name: "BDU Arctic Top", amount: 1 },
            { id: "mcpe:bdu_artic_bottom", name: "BDU Arctic Bottom", amount: 1 },
            // ARs premium
            { id: "krep:m4a1", name: "M4A1", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 30 },
            { id: "krep:hk416", name: "HK416", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 30 },
            { id: "krep:scarl", name: "SCAR-L", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 30 },
            { id: "krep:qbz95", name: "QBZ-95", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 30 },
            { id: "krep:qbz191", name: "QBZ-191", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 30 },
            // LMGs
            { id: "krep:rpk", name: "RPK", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            { id: "krep:m249", name: "M249", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            // Snipers premium
            { id: "krep:awp", name: "AWP", amount: 1 },
            { id: "krep:lapua338", name: ".338 Lapua", amount: 15 },
            { id: "krep:m885", name: "M88.5", amount: 1 },
            { id: "krep:lapua338", name: ".338 Lapua", amount: 15 },
            // P90 y SMG premium
            { id: "krep:p90", name: "P90", amount: 1 },
            { id: "krep:mm5728", name: "5.7x28mm", amount: 20 },
            // Consumibles premium
            { id: "mcpe:first_aid", name: "First Aid", amount: 16 },
            { id: "mcpe:painkiller", name: "Painkiller", amount: 16 },
            { id: "mcpe:antidote", name: "Antidote", amount: 5 },
            { id: "minecraft:golden_apple", name: "Golden Apple", amount: 16 },
            { id: "minecraft:totem_of_undying", name: "Totem of Undying", amount: 1 },
            { id: "mcpe:c4_explosive", name: "C4 Explosive", amount: 2 },
            { id: "mcpe:landmine", name: "Landmine", amount: 5 },
            { id: "mcpe:lockpick", name: "Lockpick", amount: 3 },
            { id: "minecraft:diamond_helmet", name: "Diamond Helmet", amount: 1 },
            { id: "minecraft:diamond_chestplate", name: "Diamond Chestplate", amount: 1 },
            { id: "minecraft:diamond_leggings", name: "Diamond Leggings", amount: 1 },
            { id: "minecraft:diamond_boots", name: "Diamond Boots", amount: 1 },
            { id: "minecraft:experience_bottle", name: "Experience Bottle", amount: 64 },
            { id: "pubg:opentop_spawn_egg", name: "Open Top Spawn Egg", amount: 2 },
        ],
        itemCount: 7,
        commands: {
            interact: ["playsound random.orb @s"],
            open: ["playsound random.levelup @s"],
        },
    },
    "tz:crate_netherita": {
        title: "Crate de Netherita",
        key: "tz:key_netherita",
        items: [
            // Ropa top tier
            { id: "mcpe:police_riot", name: "Police Riot", amount: 1 },
            { id: "mcpe:stab_vest_gray", name: "Stab Vest Gray", amount: 1 },
            { id: "mcpe:gasmask_black", name: "Gasmask Black", amount: 1 },
            { id: "mcpe:night_goggles", name: "Night Goggles", amount: 1 },
            { id: "mcpe:peaked_tan", name: "Peaked Tan", amount: 1 },
            { id: "mcpe:ushanka", name: "Ushanka", amount: 1 },
            { id: "mcpe:hazmat_white_top", name: "Hazmat White Top", amount: 1 },
            { id: "mcpe:hazmat_white_bottom", name: "Hazmat White Bottom", amount: 1 },
            { id: "mcpe:katana", name: "Katana", amount: 1 },
            { id: "mcpe:sabre_sword", name: "Sabre Sword", amount: 1 },
            // ARs premium (garantizadas)
            { id: "krep:m4a1", name: "M4A1", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            { id: "krep:hk416", name: "HK416", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            { id: "krep:scarl", name: "SCAR-L", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            // Battle rifles premium
            { id: "krep:scarh", name: "SCAR-H", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            { id: "krep:mk14", name: "MK14", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 40 },
            // LMGs premium
            { id: "krep:evolys", name: "Evolys", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 50 },
            { id: "krep:m249", name: "M249", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 50 },
            // Snipers .50 BMG
            { id: "krep:m107", name: "M107 .50 BMG", amount: 1 },
            { id: "krep:bmg50", name: ".50 BMG", amount: 10 },
            { id: "krep:m95", name: "M95 .50 BMG", amount: 1 },
            { id: "krep:bmg50", name: ".50 BMG", amount: 10 },
            { id: "krep:awp", name: "AWP", amount: 1 },
            { id: "krep:lapua338", name: ".338 Lapua", amount: 20 },
            // Minigun (raro)
            { id: "krep:minigun", name: "Minigun", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 60 },
            { id: "krep:minigun", name: "Minigun", amount: 1 },
            { id: "krep:m43", name: "7.62x39mm", amount: 60 },
            // RPG (muy raro)
            { id: "krep:rpg", name: "RPG", amount: 1 },
            { id: "krep:rpgrocket", name: "RPG Rocket", amount: 5 },
            { id: "krep:rpg", name: "RPG", amount: 1 },
            { id: "krep:rpgrocket", name: "RPG Rocket", amount: 5 },
            // Consumibles top
            { id: "mcpe:first_aid", name: "First Aid", amount: 16 },
            { id: "mcpe:painkiller", name: "Painkiller", amount: 16 },
            { id: "mcpe:adrenaline", name: "Adrenaline", amount: 10 },
            { id: "minecraft:enchanted_golden_apple", name: "Enchanted Golden Apple", amount: 5 },
            { id: "minecraft:totem_of_undying", name: "Totem of Undying", amount: 2 },
            { id: "mcpe:lockpick", name: "Lockpick", amount: 5 },
            { id: "mcpe:bear_trap", name: "Bear Trap", amount: 10 },
            { id: "mcpe:c4_explosive", name: "C4 Explosive", amount: 4 },
            { id: "mcpe:landmine", name: "Landmine", amount: 5 },
            { id: "mcpe:netherite_sword", name: "Netherite Sword", amount: 1 },
            { id: "minecraft:netherite_chestplate", name: "Netherite Chestplate", amount: 1 },
            { id: "mcpe:netherite_helmet", name: "Netherite Helmet", amount: 1 },
            { id: "mcpe:netherite_leggings", name: "Netherite Leggings", amount: 1 },
            { id: "mcpe:netherite_boots", name: "Netherite Boots", amount: 1 },
            { id: "minecraft:netherite_upgrade_smithing_template", name: "Netherite Upgrade", amount: 1 },
            { id: "minecraft:experience_bottle", name: "Experience Bottle", amount: 64 },
            { id: "minecraft:experience_bottle", name: "Experience Bottle", amount: 64 },
        ],
        itemCount: 9,
        commands: {
            interact: ["playsound random.orb @s"],
            open: ["playsound random.levelup @s"],
        },
    },
};

// Función para ejecutar comandos
function executeCommands(player, commands) {
    commands.forEach((command) => {
        player.runCommand(command);
    });
}

// Función para seleccionar ítems aleatorios
function getRandomCrateItems(crateId) {
    const crate = cratesConfig[crateId];
    const selectedItems = [];
    const itemsCopy = [...crate.items]; // Copia de la lista para evitar modificar la original

    // Asegurarse de que siempre se seleccionen exactamente itemCount ítems
    const itemCount = Math.min(crate.itemCount, itemsCopy.length);

    for (let i = 0; i < itemCount; i++) {
        const randomIndex = Math.floor(Math.random() * itemsCopy.length);
        const selectedItem = itemsCopy.splice(randomIndex, 1)[0]; // Eliminar y obtener el ítem seleccionado
        selectedItems.push(selectedItem);
    }

    return selectedItems;
}

// Función para otorgar ítems al jugador y enviar un mensaje decorativo
function giveItemsToPlayer(player, items) {
    const messages = [];
    items.forEach((item) => {
        try {
            player.runCommand(`give @s ${item.id} ${item.amount}`);
            messages.push(`§a✔ Has recibido: §e"${item.name}" §fx${item.amount}`);
        } catch (error) {
            console.error(`Error al otorgar el ítem ${item.id}: ${error}`);
        }
    });

    if (messages.length > 0) {
       
        player.sendMessage(`§b=== §l¡Recompensas Obtenidas! §r§b===\n${messages.join("\n")}`);
    } else {
        player.sendMessage(`§c❌ No se pudieron otorgar las recompensas. Por favor, contacta al administrador.`);
    }
}

function showCrates(player,target) {
      // Verifica si la entidad es una crate configurada
    const crateConfig = cratesConfig[target.typeId];
    if (!crateConfig) return;

    // Ejecutar comandos al interactuar con la crate
    if (crateConfig.commands?.interact) {
        executeCommands(player, crateConfig.commands.interact);
    }

    // Mostrar la interfaz inicial
    const form = new ActionFormData()
        .title(`§6§l${crateConfig.title}`)
        .button("§aAbrir Crate", "textures/ui/icon_blackfriday.png")
        .button("§bComprar Llaves", "textures/ui/MCoin.png");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === 0) {
            // Opción: Abrir Crate
            const inventory = player.getComponent("minecraft:inventory").container;
            let hasKey = false;

            // Verificar si el jugador tiene la llave específica para esta crate
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (item && item.typeId === crateConfig.key) {
                    hasKey = true;

                    // Reducir la cantidad del stack en 1
                    if (item.amount > 1) {
                        item.amount -= 1;
                        inventory.setItem(i, item); // Actualizar el slot con la nueva cantidad
                    } else {
                        inventory.setItem(i, null); // Eliminar el ítem si solo queda 1
                    }
                    break;
                }
            }

            if (hasKey) {
                // Ejecutar comandos al abrir la crate
                if (crateConfig.commands?.open) {
                    executeCommands(player, crateConfig.commands.open);
                }

                // Obtener ítems aleatorios según el tipo de crate
                const rewards = getRandomCrateItems(target.typeId);

                // Dar los ítems al jugador y enviar mensaje con los detalles
                giveItemsToPlayer(player, rewards);

                player.sendMessage(`§6§l¡Has abierto la ${crateConfig.title}!§r\n§a🎉 Revisa tus recompensas en el inventario.`);
            } else {
                player.sendMessage(`§c❌ No tienes la llave necesaria (§e${crateConfig.key}§c) para abrir esta crate.`);
            }
        } else if (response.selection === 1) {
            mostrarLlavesTienda(player); // Mostrar la tienda de llaves
        }
    });
}

// Manejar la interacción con las crates
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;
    if (target?.typeId.startsWith("tz:crate_")) {
        showCrates(player, target);
    }

});

// Traducciones para el formulario de llaves
const keyShopLanguages = {
    en_US: {
        title: "§6Key Shop",
        body: "§bBuy crate keys and more:\n§l§cTalk to the Cosmetics NPC for more options.",
        url_message: "§bYou selected: §e{item}\n§aVisit our web store to complete your purchase:",
        url_instructions: "Click the box below, then press Ctrl+A to select all and Ctrl+C to copy. This only works on PC or with a keyboard.",
        closed_url: "§cYou closed the web store window.",
        thanks: "§aThanks for visiting our store!",
        key_item: "Crate Key",
    },
    es_ES: {
        title: "§6Tienda de Llaves",
        body: "§aPara comprar llaves y más cosas:\n§l§cHabla con el Npc de Cosmeticos",
        url_message: "§bHas seleccionado: §e{item}\n§aVisita nuestra tienda web para completar tu compra:",
        url_instructions: "Haz clic en el cuadro de abajo, luego presiona Ctrl+A para seleccionar todo y Ctrl+C para copiar. Esto solo funciona en PC o con teclado.",
        closed_url: "§cHas cerrado la ventana de la tienda web.",
        thanks: "§a¡Gracias por visitar nuestra tienda!",
        key_item: "Llave de Crate",
    }
};

// Función para obtener idioma del jugador
function getPlayerLang(player) {
    if (player.hasTag("lang_es_ES")) return "es_ES";
    return "en_US";
}

// Formulario para copiar enlace de compra de llaves
function mostrarLlavesTienda(player) {
    const lang = getPlayerLang(player);
    const texts = keyShopLanguages[lang];
    const link = "https://sites.google.com/view/shop-tierra-zombie";
    const label = `${texts.url_message.replace("{item}", texts.key_item)}\n\n${texts.url_instructions}\n§c${link}`;
    const form = new ModalFormData()
        .title(texts.title)
        .textField(label, "URL", { defaultValue: link });

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage(texts.closed_url);
            return;
        }
        player.sendMessage(texts.thanks);
    }).catch((error) => {
        console.error("Error al mostrar el formulario de llaves:", error);
    });
}

// Función para mostrar las crates disponibles
function mostrarCrates(player) {
    const form = new ActionFormData()
        .title("§6§lTienda de Llaves")
        .body("§aPara Comprar llaves y demas cosas:\n§l§cHabla con el Npc de Cosmeticos")
    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedCrate = Object.keys(cratesConfig)[response.selection];
        const crate = cratesConfig[selectedCrate];

        if (crate) {
            player.sendMessage(`§a✔ Has seleccionado la crate: §e"${crate.title}"`);
            // Aquí puedes agregar la lógica para comprar llaves
        } else {
            player.sendMessage(`§c❌ Crate no válida.`);
        }
    });    
}

    world.afterEvents.entityHitEntity.subscribe((event) => {
        const player = event.damagingEntity;
        const target = event.hitEntity;
              // Verifica si la entidad es una crate configurada
    const crateConfig = cratesConfig[target.typeId];
    if (!crateConfig) return;

    // Ejecutar comandos al interactuar con la crate
    if (crateConfig.commands?.interact) {
        executeCommands(player, crateConfig.commands.interact);
    }

    // Mostrar la interfaz inicial
    const form = new ActionFormData()
        .title(`§6§l${crateConfig.title}`)
        .button("§aAbrir Crate", "textures/ui/icon_blackfriday.png")
        .button("§bComprar Llaves", "textures/ui/MCoin.png");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === 0) {
            // Opción: Abrir Crate
            const inventory = player.getComponent("minecraft:inventory").container;
            let hasKey = false;

            // Verificar si el jugador tiene la llave específica para esta crate
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (item && item.typeId === crateConfig.key) {
                    hasKey = true;

                    // Reducir la cantidad del stack en 1
                    if (item.amount > 1) {
                        item.amount -= 1;
                        inventory.setItem(i, item); // Actualizar el slot con la nueva cantidad
                    } else {
                        inventory.setItem(i, null); // Eliminar el ítem si solo queda 1
                    }
                    break;
                }
            }

            if (hasKey) {
                // Ejecutar comandos al abrir la crate
                if (crateConfig.commands?.open) {
                    executeCommands(player, crateConfig.commands.open);
                }

                // Obtener ítems aleatorios según el tipo de crate
                const rewards = getRandomCrateItems(target.typeId);

                // Dar los ítems al jugador y enviar mensaje con los detalles
                giveItemsToPlayer(player, rewards);

                player.sendMessage(`§6§l¡Has abierto la ${crateConfig.title}!§r\n§a🎉 Revisa tus recompensas en el inventario.`);
            } else {
                player.sendMessage(`§c❌ No tienes la llave necesaria (§e${crateConfig.key}§c) para abrir esta crate.`);
            }
        } else if (response.selection === 1) {
            mostrarLlavesTienda(player); // Mostrar la tienda de llaves
        }
    })
    });
