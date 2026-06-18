import * as mc from "@minecraft/server";

function getScore(objectiveName, player) {
    const objective = mc.world.scoreboard.getObjective(objectiveName);
    if (!objective) return 0;
    
    const participant = objective.getParticipants().find(p => p.displayName === player.nameTag);
    if (!participant) return 0;

    return objective.getScore(participant);
}

function setScore(objectiveName, player, value) {
    const objective = mc.world.scoreboard.getObjective(objectiveName);
    if (objective) {
        objective.setScore(player, value);
    }
}

export { getScore, setScore };