import { world } from "@minecraft/server";
export const apiScoreboard = new class ApiScoreboard {
    getObj(scoreId) {
        const score = world.scoreboard.getObjective(scoreId);
        if (!score)
            return world.scoreboard.addObjective(scoreId);
        return score;
    }
    getScore(scoreId, participant) {
        const score = this.getObj(scoreId);
        const amount = score.hasParticipant(participant) ? score.getScore(participant) : undefined;
        if (amount == undefined)
            return 0;
        return amount;
    }
    setScore(scoreId, participant, amount) {
        const score = this.getObj(scoreId);
        if (amount == undefined) {
            score.removeParticipant(participant);
            return;
        }
        score.setScore(participant, amount);
    }
    addScore(scoreId, participant, amount) {
        const score = this.getObj(scoreId);
        return score.addScore(participant, amount);
    }
    hasParticipant(scoreId, participant) {
        const score = this.getObj(scoreId);
        return score.hasParticipant(participant);
    }
};
