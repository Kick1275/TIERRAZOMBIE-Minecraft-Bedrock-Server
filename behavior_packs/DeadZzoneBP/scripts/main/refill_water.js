import * as mc from "@minecraft/server";

function handleUseOnWater(player, item, block) {
    if (block && (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water")) {
        if (item && item.typeId === "mcpe:bottle_water_emp") {
            player.runCommandAsync(`give @s mcpe:bottle_water_unpure`);
            player.runCommandAsync(`clear @s mcpe:bottle_water_emp 0 1`);
        } else if (item && item.typeId === "mcpe:cooking_pot") {
            player.runCommandAsync(`give @s mcpe:pot_water`);
            player.runCommandAsync(`clear @s mcpe:cooking_pot 0 1`);
        } else if (item && item.typeId === "mcpe:rags_dirty") {
            player.runCommandAsync(`give @s mcpe:rags`);
            player.runCommandAsync(`clear @s mcpe:rags_dirty 0 1`);
        }
        player.runCommandAsync(`playsound cauldron_drip.water.pointed_dripstone @a[r=10] ~~~ 3 1`);
    }
}

mc.world.beforeEvents.itemUseOn.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    const block = event.block;

    if (player && item && block) {
        handleUseOnWater(player, item, block);
    }
});
