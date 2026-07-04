import { world } from '@minecraft/server';

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    const block  = event.block;
    const player = event.player;

    if (block.typeId === 'krep:gunsmith') {
        player.runCommandAsync('tag @s add openui');
    }
});
