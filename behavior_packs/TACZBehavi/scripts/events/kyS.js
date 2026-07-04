import { system, world } from '@minecraft/server';

const bulletNamespace = 'bullet:';

world.afterEvents.entitySpawn.subscribe(event => {
    const entity = event.entity;
    if (!entity || !entity.typeId.startsWith(bulletNamespace)) return;

    const bulletType = entity.typeId.replace(bulletNamespace, '');
    const bulletData = Indoarsenal.bullets[bulletType];
    if (!bulletData) return;

    system.runTimeout(() => {
        try {
            entity.runCommandAsync('kill @s').catch(() => {});
        } catch (e) {}
    }, 10);
});
