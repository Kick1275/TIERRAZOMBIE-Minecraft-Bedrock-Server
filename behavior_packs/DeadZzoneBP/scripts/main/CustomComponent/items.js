import { system, world, ItemStack, GameMode, EquipmentSlot } from "@minecraft/server";

export function reduceDurability(entity, itemStack, damageAmount) {
	const durability = itemStack.getComponent("minecraft:durability");
	const inventory = entity.getComponent("minecraft:inventory").container;
	
	if (durability.damage + damageAmount >= durability.maxDurability) {
		inventory.setItem(entity.selectedSlotIndex, undefined);
		entity.playSound('random.break');
	} else {
		durability.damage += damageAmount;
		inventory.setItem(entity.selectedSlotIndex, itemStack);
	}
}
   
const walkieTalkieCooldown = new Map();

function spawnAirSupply(player) {
    const playerPos = player.location;
    
    const offsetX = Math.random() * (42 - 32) + 32;
    const offsetZ = Math.random() * (42 - 32) + 32;
    const finalOffsetX = Math.random() < 0.5 ? offsetX : -offsetX;
    const finalOffsetZ = Math.random() < 0.5 ? offsetZ : -offsetZ;

    const spawnPos = {
        x: (playerPos.x + finalOffsetX).toFixed(1),
        z: (playerPos.z + finalOffsetZ).toFixed(1),
    };

    system.runTimeout(() => {
        player.runCommand("summon mcpe:supply_drop " + spawnPos.x + " 156 " + spawnPos.z);
        player.runCommand("clear @s mcpe:walkie_talkie 0 1");
        player.runCommand("playsound walkie.talkie @p[r=15]");
        player.runCommand('tellraw @s {"rawtext":[{"text":"§2Air Supply Arrived at X:' + spawnPos.x + ', Z:' + spawnPos.z + '!"}]}');
        walkieTalkieCooldown.delete(player.name);
    }, 60);
}

world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent('mcpe:walkie_talkie', {
        onUse: e => {
            const player = e.source;
            if (walkieTalkieCooldown.has(player.name)) {
                return;
            }

            const chance = Math.random();
            if (chance < 0.5) {
                player.runCommand('tellraw @s {"rawtext":[{"text":"§2Sending Air Supply, Wait For A Minute"}]}');
                spawnAirSupply(player);
                walkieTalkieCooldown.set(player.name, true);
                player.startItemCooldown('walkie_talkie', 200);
            } else if (chance < 0.75) {
                player.runCommand("playsound radio.static @p[r=15]");
            } else {
                player.runCommand('tellraw @s {"rawtext":[{"text":"§4Sending Air Supply Rejected"}]}');
            }
        }
    });
			
	initEvent.itemComponentRegistry.registerCustomComponent('mcpe:can_opener', {
		onUse: e => {
			const player = e.source;
			const equipmentInventory = player.getComponent("equippable");
			let invi = player.getComponent("inventory").container;
			let items = invi.getItem(player.selectedSlotIndex);
			const offHand = equipmentInventory.getEquipment(EquipmentSlot.Offhand);
			
			if (offHand?.typeId === "mcpe:canned_beans") {
				player.runCommandAsync('give @s mcpe:canned_beans_open 1');
				player.runCommandAsync('clear @s mcpe:canned_beans 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_bacon") {
				player.runCommandAsync('give @s mcpe:canned_bacon_open 1');
				player.runCommandAsync('clear @s mcpe:canned_bacon 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_beef_stew") {
				player.runCommandAsync('give @s mcpe:canned_beef_stew_open 1');
				player.runCommandAsync('clear @s mcpe:canned_beef_stew 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_chicken") {
				player.runCommandAsync('give @s mcpe:canned_chicken_open 1');
				player.runCommandAsync('clear @s mcpe:canned_chicken 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_chili") {
				player.runCommandAsync('give @s mcpe:canned_chili_open 1');
				player.runCommandAsync('clear @s mcpe:canned_chili 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_fruit") {
				player.runCommandAsync('give @s mcpe:canned_fruit_open 1');
				player.runCommandAsync('clear @s mcpe:canned_fruit 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_peaches") {
				player.runCommandAsync('give @s mcpe:canned_peaches_open 1');
				player.runCommandAsync('clear @s mcpe:canned_peaches 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_spaghetti") {
				player.runCommandAsync('give @s mcpe:canned_spaghetti_open 1');
				player.runCommandAsync('clear @s mcpe:canned_spaghetti 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_tomato") {
				player.runCommandAsync('give @s mcpe:canned_tomato_open 1');
				player.runCommandAsync('clear @s mcpe:canned_tomato 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_sardine") {
				player.runCommandAsync('give @s mcpe:canned_sardine_open 1');
				player.runCommandAsync('clear @s mcpe:canned_sardine 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_corned") {
				player.runCommandAsync('give @s mcpe:canned_corned_open 1');
				player.runCommandAsync('clear @s mcpe:canned_corned 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_ham") {
				player.runCommandAsync('give @s mcpe:canned_ham_open 1');
				player.runCommandAsync('clear @s mcpe:canned_ham 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_ration") {
				player.runCommandAsync('give @s mcpe:canned_ration_open 1');
				player.runCommandAsync('clear @s mcpe:canned_ration 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_tuna") {
				player.runCommandAsync('give @s mcpe:canned_tuna_open 1');
				player.runCommandAsync('clear @s mcpe:canned_tuna 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
				const durabilityComponent = items.getComponent("durability");
				if (durabilityComponent) {
					player.startItemCooldown('can_opener', 40);
					durabilityComponent.damage += 1;
					if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
						invi.setItem(player.selectedSlotIndex, items);
						player.playSound('random.break');
					} else {
						invi.setItem(player.selectedSlotIndex, null);
					}
				}
			}
		}
	});
	
	initEvent.itemComponentRegistry.registerCustomComponent('mcpe:can_opener_bad', {
		onUse: e => {
			const player = e.source;
			const equipmentInventory = player.getComponent("equippable");
			let invi = player.getComponent("inventory").container;
			let items = invi.getItem(player.selectedSlotIndex);
			const offHand = equipmentInventory.getEquipment(EquipmentSlot.Offhand);
			
			if (offHand?.typeId === "mcpe:canned_beans") {
				player.runCommandAsync('give @s mcpe:canned_beans_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_beans 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_bacon") {
				player.runCommandAsync('give @s mcpe:canned_bacon_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_bacon 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_beef_stew") {
				player.runCommandAsync('give @s mcpe:canned_beef_stew_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_beef_stew 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_chicken") {
				player.runCommandAsync('give @s mcpe:canned_chicken_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_chicken 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_chili") {
				player.runCommandAsync('give @s mcpe:canned_chili_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_chili 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_fruit") {
				player.runCommandAsync('give @s mcpe:canned_fruit_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_fruit 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_peaches") {
				player.runCommandAsync('give @s mcpe:canned_peaches_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_peaches 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_spaghetti") {
				player.runCommandAsync('give @s mcpe:canned_spaghetti_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_spaghetti 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_tomato") {
				player.runCommandAsync('give @s mcpe:canned_tomato_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_tomato 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_sardine") {
				player.runCommandAsync('give @s mcpe:canned_sardine_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_sardine 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_corned") {
				player.runCommandAsync('give @s mcpe:canned_corned_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_corned 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_ham") {
				player.runCommandAsync('give @s mcpe:canned_ham_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_ham 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_ration") {
				player.runCommandAsync('give @s mcpe:canned_ration_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_ration 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
			} else if (offHand?.typeId === "mcpe:canned_tuna") {
				player.runCommandAsync('give @s mcpe:canned_tuna_open_bad 1');
				player.runCommandAsync('clear @s mcpe:canned_tuna 0 1');
				player.runCommand('playsound open.canfood @a[r=5] ~~~ 3 1');
				const durabilityComponent = items.getComponent("durability");
				if (durabilityComponent) {
					durabilityComponent.damage += 1;
					player.startItemCooldown('can_opener', 40);
					if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
						invi.setItem(player.selectedSlotIndex, null);
						player.playSound('random.break');
					} else {
						invi.setItem(player.selectedSlotIndex, items);
					}
				}
			}
		}
	});
	
	initEvent.itemComponentRegistry.registerCustomComponent('mcpe:saw_off', {
		onUse: e => {
			const player = e.source;
			const equipmentInventory = player.getComponent("equippable");
			let invi = player.getComponent("inventory").container;
			let items = invi.getItem(player.selectedSlotIndex);
			const offHand = equipmentInventory.getEquipment(EquipmentSlot.Offhand);
			
			if (offHand?.typeId === "mcpe:lead_pipe") {
				player.runCommandAsync('give @s mcpe:sawoff_pipe 2');
				player.runCommandAsync('clear @s mcpe:lead_pipe 0 1');
				player.runCommandAsync('playsound sawing.off @a[r=5] ~~~ 3 1');
				
				player.startItemCooldown('sawoff', 20);
				const durabilityComponent = items.getComponent("durability");
				if (durabilityComponent) {
					durabilityComponent.damage += 1;
					if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
						invi.setItem(player.selectedSlotIndex, null);
						player.playSound('random.break');
					} else {
						invi.setItem(player.selectedSlotIndex, items);
					}
				}
			}
		}
	});
	
	initEvent.itemComponentRegistry.registerCustomComponent('mcpe:dig', {
		onMineBlock: e => {
			if (e.attackingEntity.getGameMode() === GameMode.creative) return;
			reduceDurability(e.attackingEntity, e.itemStack, 1);
		}
	});
	
	initEvent.itemComponentRegistry.registerCustomComponent('mcpe:hurt_entity', {
		onHitEntity: e => {
			if (e.attackingEntity.getGameMode() === GameMode.creative) return;
			reduceDurability(e.attackingEntity, e.itemStack, 1);
		}
	});
});