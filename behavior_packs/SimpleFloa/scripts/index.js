import { system, world } from '@minecraft/server';
import { showMenu } from './ui';


export const dimensions = [world.getDimension('overworld'), world.getDimension('nether'), world.getDimension('the_end')];
const worldScoreboards = world.scoreboard;
const worldParticpantIds = new Set(worldScoreboards.getParticipants().map(participant => participant.id.toString()));
const nameDataBase = new Map(Object.entries(JSON.parse(world.getDynamicProperty('stf:nameDataBase') ?? '{}')));


for (const key of nameDataBase.keys()) if (!worldParticpantIds.has(key)) nameDataBase.delete(key);
world.setDynamicProperty('stf:nameDataBase', JSON.stringify(Object.fromEntries(nameDataBase)));
worldParticpantIds.clear();


world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
    if (itemStack.typeId == 'sft:menu') showMenu(source);
});


world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    const scoreboardId = player.scoreboardIdentity?.id;
    if (!scoreboardId) return;
    if (nameDataBase.get(scoreboardId.toString()) === player.name) return;
    nameDataBase.set(scoreboardId.toString(), player.name)
    world.setDynamicProperty('stf:nameDataBase', JSON.stringify(Object.fromEntries(nameDataBase)));
});


world.beforeEvents.playerLeave.subscribe(({ player }) => {
    const name = player.name;
    const scoreboardId = player.scoreboardIdentity?.id;
    if (!scoreboardId) return;
    if (!nameDataBase.has(scoreboardId.toString())) system.run(
        () => world.setDynamicProperty('stf:nameDataBase', JSON.stringify(Object.fromEntries(nameDataBase.set(scoreboardId.toString(), name))))
    );
});


function formatParticipantName({ displayName, id }) {
    if (displayName !== 'commands.scoreboard.players.offlinePlayerName') return displayName;
    return nameDataBase.get(id.toString()) ?? 'Offline Player';
};


system.runInterval(() => {
    for (const dimension of dimensions) for (const entity of dimension.getEntities({ type: 'minecraft:egg', families: ['sft:scoreboard'] })) {
        const data = JSON.parse(entity.getDynamicProperty('sft:scoreboardData') ?? 'null');
        if (!data) { entity.remove(); continue }
        const scoreboardObjective = worldScoreboards.getObjective(data[0]);
        if (!scoreboardObjective) { entity.remove(); continue };
        const scoreboardScores = scoreboardObjective.getScores().filter(({ participant }) => !participant.displayName.startsWith('#'));
        if (!data[1]) scoreboardScores.sort((a, b) => a.score - b.score);
        else scoreboardScores.sort((a, b) => b.score - a.score);
        entity.nameTag = scoreboardObjective.displayName + '§r\n' + scoreboardScores
            .slice(0, data[6])
            .map(({ participant, score }, i) => `${data[2] ? `${data[3] + (i + 1)}. ` : ''}${data[4] + formatParticipantName(participant)}§r ${data[5] + score}§r`)
            .join('\n');
    }
}, 20);