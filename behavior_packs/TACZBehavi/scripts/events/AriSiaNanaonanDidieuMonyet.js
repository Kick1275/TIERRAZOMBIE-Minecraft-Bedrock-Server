import { world } from '@minecraft/server';

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
    const block = event.block;
    const player = event.player;

    if (block.typeId === 'krep:attachmentblock') {
        player.runCommandAsync('tag @s add batak');
    }
    if (block.typeId === 'krep:ammoworkbench') {
        player.runCommandAsync('tag @s add krep:craftammo');
    }
});
