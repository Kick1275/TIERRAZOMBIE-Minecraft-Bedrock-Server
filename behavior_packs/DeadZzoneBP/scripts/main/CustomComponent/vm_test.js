import { BlockPermutation, world } from "@minecraft/server";

const spawnVmLoot = {
    "mcpe:vending_popsi": {
        loot: "drink_vending"
    }
};

const cardinalSides = Object.freeze({
    north: { left: 'east', right: 'west', },
    south: { left: 'west', right: 'east', },
    west: { left: 'north', right: 'south', },
    east: { left: 'south', right: 'north' }
});

world.beforeEvents.worldInitialize.subscribe((data) => {
    data.blockComponentRegistry.registerCustomComponent('mcpe:vm_int', {
        onPlayerInteract(e) {
            const {block} = e;
            const location = block.location;
            const container = e.player.getComponent('inventory').container;
            const item = container.getItem(e.player.selectedSlotIndex);
            const isSneaking = e.isSneaking;
            const isLoot = block.permutation.getState("block:loot");
            const lootType = spawnVmLoot[block.typeId];
            const randomValue = Math.random();
            const successChance = 0.95;

            const getHalfblock = () => {
                switch(block.permutation.getState('block:part')) {
                    case 'lower': return block.above();
                    case 'upper': return block.below();
                }
            }
            const halfblock = getHalfblock();
            
            if (halfblock?.permutation.matches(block.typeId)) {
            }
            
            if (block.permutation.getState('block:part') !== 'lower') {
                return;
            }

            if (!isLoot && lootType) {
                if (item?.typeId === "mcpe:lockpick") {
                    const durability = item.getComponent("durability");
                    
                    if (durability) {
                        if (randomValue <= successChance) {
                            e.block.dimension.runCommand(`loot spawn ${location.x} ${location.y + 1} ${location.z} loot "loots/block/${lootType.loot}"`);
                            e.block.dimension.playSound('loot.grab', location);
                            //e.block.dimension.playSound('pin.lockpick', location);

                            const newPermutation = block.permutation.withState("block:loot", true);
                            block.setPermutation(newPermutation);

                            durability.damage += 1;
                            
                            if (durability.damage >= durability.maxDurability) {
                                container.setItem(e.player.selectedSlotIndex, null);
                                e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.lockpick_broken"}]}`);
                                e.block.dimension.playSound('random.break', location);
                            } else {
                                container.setItem(e.player.selectedSlotIndex, item);
                            }
                        } else {
                            //e.block.dimension.playSound('pin.lockpick', location);
                            durability.damage += 1;
                           
                            if (durability.damage >= durability.maxDurability) {
                                container.setItem(e.player.selectedSlotIndex, null);
                                e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.lockpick_broken"}]}`);
                                e.block.dimension.playSound('random.break', location);
                            } 
                        }
                    }
                }
            }
        },
        
        onTick: (e) => {
            const block = e.block;
            const isLoot = block.permutation.getState("block:loot");

            if (isLoot) {
                const newPermutation = block.permutation.withState("block:loot", false);
                block.setPermutation(newPermutation);
            }
        }
    });

    data.blockComponentRegistry.registerCustomComponent('mcpe:on_place', {
        beforeOnPlayerPlace(e) {
            const {block, permutationToPlace} = e;
            const aboveBlock = block.above();
            const canBePlace = aboveBlock.isAir || aboveBlock.isLiquid;

            if (canBePlace) {
                const cardinalDirection = permutationToPlace.getState('minecraft:cardinal_direction');

                const blockStates = {
                    'minecraft:cardinal_direction': cardinalDirection,
                }

                if (permutationToPlace.getState('block:top_texture') !== undefined) {
                    blockStates['block:top_texture'] = e.player.isSneaking;
                }

                const blockPermutation = BlockPermutation.resolve(permutationToPlace.type.id, blockStates);

                e.permutationToPlace = blockPermutation.withState('block:part', 'lower');
                aboveBlock.setPermutation(blockPermutation.withState('block:part', 'upper'));
            } else {
                e.cancel = true;
            }
        }
    });
});
