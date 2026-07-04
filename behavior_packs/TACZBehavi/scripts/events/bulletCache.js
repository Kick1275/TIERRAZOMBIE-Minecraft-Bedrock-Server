import { world, system } from '@minecraft/server';

const registBulletCache = [
    { normal: 'krep:evolys', empty: 'krep:evolys_emp', key: 'evolys' },
    { normal: 'krep:m249',   empty: 'krep:m249_emp',   key: 'm249'   },
    { normal: 'krep:m1014',  empty: 'krep:m1014_emp',  key: 'm1014'  }
];

export function getScoreboardKey(typeId) {
    const entry = registBulletCache.find(e => e.normal === typeId || e.empty === typeId);
    return entry ? entry.key : null;
}

export function isBulletCacheItem(typeId) {
    return registBulletCache.some(e => e.normal === typeId || e.empty === typeId);
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const equippable = player.getComponent('minecraft:equippable');
        const mainhand = equippable.getEquipment('Mainhand');
        if (!mainhand?.typeId) continue;

        const typeId = mainhand.typeId;
        if (!isBulletCacheItem(typeId)) continue;

        const key = getScoreboardKey(typeId);
        if (!key) continue;

        const objective = world.scoreboard.getObjective(key);
        if (!objective) continue;

        const score = objective.getScore(player) ?? 0;
        player.setProperty('krep:bulletcache', score);
    }
}, 1);
