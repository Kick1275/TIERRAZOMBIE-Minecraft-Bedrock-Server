import { system, world, ItemStack } from "@minecraft/server";
import { GUN_PROPERTIES } from './config/gun_type_config.js';

const activePlayers = new Map();

world.afterEvents.itemStartUse.subscribe(data => {
    let { source: player } = data;
    let invi = player.getComponent("inventory").container;
    let items = invi.getItem(player.selectedSlotIndex);
    let gun = GUN_PROPERTIES[items?.typeId];

    if (gun) {
        player.runCommandAsync(`event entity @s ${gun.event}`);
        
        // indoor sound effect 
        player.runCommandAsync(`playsound ${gun.soundInDoor} @a[tag=indoor,r=20] ~~~ 5 0.95 0.95`);
        player.runCommandAsync(`playsound ${gun.soundInDoorDistant} @a[tag=indoor,r=64] ~~~ 5 0.85 0.8`);
        player.runCommandAsync(`playsound ${gun.sound} @a[tag=indoor,r=5,rm=0] ~~~ 1 0.65 0.65`);
        
        // normal sound effect
        player.runCommandAsync(`playsound ${gun.sound} @a[tag=!indoor,r=20,rm=0] ~~~`);
        player.runCommandAsync(`playsound ${gun.soundDistant} @a[tag=!indoor,r=100,rm=80] ~~~ 5 1 1`);

        if (gun.muzzle) {
            player.runCommandAsync(`fill ^^^^^3^ mcpe:fire_light replace air`);
        }

        if (gun.type === "heavy_guns") {
        	player.addTag("heavy_noise");
            system.runTimeout(() => {
            	player.removeTag("heavy_noise");
            }, 40);
        } else if (gun.type === "light_guns") {
        	player.addTag("light_noise");
            system.runTimeout(() => {
            	player.removeTag("light_noise");
            }, 40);
        }

        let durabilityComponent = items.getComponent("durability");
        durabilityComponent.damage += 1;
        invi.setItem(player.selectedSlotIndex, items);
        
        if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
            player.runCommandAsync(`playsound ${gun.soundEmpty} @a[r=10,rm=0] ~~~`);
            let emptyItem = new ItemStack(gun.empty, 1);
            invi.setItem(player.selectedSlotIndex, emptyItem);
        } else {
            invi.setItem(player.selectedSlotIndex, items);
        }

        if (!activePlayers.has(player.id)) {
            let intervalId = system.runInterval(() => {
                let currentItem = invi.getItem(player.selectedSlotIndex);
                if (currentItem?.typeId === items.typeId) {
                    let durabilityComponent = currentItem.getComponent("durability");
                    durabilityComponent.damage += 1;
                    invi.setItem(player.selectedSlotIndex, currentItem);
                    
                    if (durabilityComponent.damage >= durabilityComponent.maxDurability) {
                        let emptyItem = new ItemStack(gun.empty, 1);
                        invi.setItem(player.selectedSlotIndex, emptyItem);
                    } else {
                        invi.setItem(player.selectedSlotIndex, currentItem);
                    }
                }
            }, gun.fireRate * 3);

            activePlayers.set(player.id, intervalId);
        }
    }
});

world.afterEvents.itemStopUse.subscribe(data => {
    let { source: player } = data;
    
    if (activePlayers.has(player.id)) {
        system.clearRun(activePlayers.get(player.id));
        activePlayers.delete(player.id);
    }
});
