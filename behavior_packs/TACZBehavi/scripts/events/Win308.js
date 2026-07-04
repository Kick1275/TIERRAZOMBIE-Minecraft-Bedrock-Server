import { world, ItemStack } from '@minecraft/server';

const objectiveName    = 'win308';
const ammoItem         = 'krep:win308';
const ammoBoxItem      = 'krep:ammobox';
const maxAmmoCapacity  = 320;

world.afterEvents.itemUse.subscribe(event => {
    const player = event.source;
    const item   = event.itemStack;

    if (!item || item.typeId !== ammoItem) return;

    try {
        const container = player.getComponent('minecraft:inventory').container;

        // Require an ammo box to be in inventory
        let hasAmmoBox = false;
        for (let i = 0; i < container.size; i++) {
            const slot = container.getItem(i);
            if (slot && slot.typeId === ammoBoxItem) {
                hasAmmoBox = true;
                break;
            }
        }
        if (!hasAmmoBox) {
            player.runCommand('title @s actionbar §cYou must have an\nAmmo Box to store bullets!');
            return;
        }

        // Get or create scoreboard objective
        let objective = world.scoreboard.getObjective(objectiveName);
        if (!objective) {
            player.runCommand('scoreboard objectives add ' + objectiveName + ' dummy');
            objective = world.scoreboard.getObjective(objectiveName);
        }

        const currentAmmo = objective.getScore(player) || 0;
        const spaceLeft   = maxAmmoCapacity - currentAmmo;

        if (spaceLeft <= 0) {
            player.runCommand('title @s actionbar §cAmmo box is full!');
            return;
        }

        // Count all loose ammo in inventory
        let totalBullets = 0;
        for (let i = 0; i < container.size; i++) {
            const slot = container.getItem(i);
            if (slot && slot.typeId === ammoItem) totalBullets += slot.amount;
        }

        const toStore = Math.min(64, spaceLeft, totalBullets);
        if (toStore < 1) {
            player.runCommand('title @s actionbar §cNo bullets to store!');
            return;
        }

        player.runCommand('scoreboard players add @s ' + objectiveName + ' ' + toStore);

        // Remove stored bullets from inventory
        let remaining = toStore;
        for (let i = 0; i < container.size && remaining > 0; i++) {
            const slot = container.getItem(i);
            if (slot && slot.typeId === ammoItem) {
                const amount = slot.amount;
                if (amount <= remaining) {
                    container.setItem(i, null);
                    remaining -= amount;
                } else {
                    container.setItem(i, new ItemStack(ammoItem, amount - remaining));
                    remaining = 0;
                }
            }
        }

        player.runCommand('title @s actionbar §a+' + toStore + ' 308 Winchester');
        player.playSound('random.orb');

    } catch (e) {
        player.playSound('random.orb');
    }
});
