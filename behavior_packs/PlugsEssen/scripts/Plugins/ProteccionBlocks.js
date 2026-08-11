import { world, system } from "@minecraft/server";
const ALTURA_MINIMA = 45;
world.beforeEvents.playerPlaceBlock.subscribe((ev) => {
    const blockY = ev.block.location.y;
    const blockType = ev.permutationToPlace.type.id;
    const player = ev.player;
    if (blockType === "rt:11x11_block" || blockType === "rt:21x21_block" || blockType === "rt:31x31_block" ) {
        if (blockY < ALTURA_MINIMA) {
            ev.cancel = true;
            ev.player.sendMessage(`§cNo puedes colocar BLOQUES DE PROTECCION ni crear bases por encima de la capa ${ALTURA_MINIMA}.`);
            return;
            system.run(() => {                
                player.playSound("random.anvil_land", { volume: 1, pitch: 1 });
            });
        }
    }
});


// Cancelar uso de items prohibidos

world.beforeEvents.itemUse.subscribe((ev) => {
    const itemType = ev.itemStack.type.id;
    const player = ev.source;
    if (itemType === "minecraft:lava_bucket" || itemType === "minecraft:oak_boat" || itemType === "minecraft:birch_boat" || itemType === "minecraft:spruce_boat" || itemType === "minecraft:jungle_boat" || itemType === "minecraft:acacia_boat" || itemType === "minecraft:dark_oak_boat" || itemType === "minecraft:mangrove_boat" || itemType === "minecraft:cherry_boat" || itemType === "minecraft:pale_oak_boat" || itemType === "minecraft:chest_boat" || itemType === "minecraft:oak_chest_boat" || itemType === "minecraft:birch_chest_boat" || itemType === "minecraft:spruce_chest_boat" || itemType === "minecraft:jungle_chest_boat" || itemType === "minecraft:acacia_chest_boat" || itemType === "minecraft:dark_oak_chest_boat" || itemType === "minecraft:mangrove_chest_boat" || itemType === "minecraft:cherry_chest_boat" || itemType === "minecraft:pale_oak_chest_boat" || itemType === "minecraft:tnt" || itemType === "minecraft:tnt_minecart") {
        ev.cancel = true;
        ev.source.sendMessage(`§cNo puedes usar este item.`);
        deleteItems();
    }

    function deleteItems() {
    system.run(() => {
        player.playSound("random.anvil_land", { volume: 1, pitch: 1 });
        player.runCommand(`clear @s ${itemType}`);
        player.runCommand(`kill @e[type=minecraft:boat]`);
        player.runCommand(`kill @e[type=minecraft:chest_boat]`);
        player.runCommand(`kill @e[type=minecraft:tnt]`);
        player.runCommand(`kill @e[type=minecraft:tnt_minecart]`);
        player.runCommand(`fill ~-10 ~-10 ~-10 ~10 ~10 ~10 air replace minecraft:lava`);
        player.runCommand(`fill ~-10 ~-10 ~-10 ~10 ~10 ~10 air replace minecraft:tnt`);
    });
    
}});