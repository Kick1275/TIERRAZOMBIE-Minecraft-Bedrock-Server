import { world, Entity, ScoreboardIdentity, ScoreboardObjective } from "@minecraft/server"

export const apiScoreboard = new class ApiScoreboard {
  getObj(scoreId: string): ScoreboardObjective {
    const score = world.scoreboard.getObjective(scoreId)
    if(!score) return world.scoreboard.addObjective(scoreId)
    return score
  }

  getScore(scoreId: string, participant: Participant): number {
    const score = this.getObj(scoreId)
    const amount = score.hasParticipant(participant) ? score.getScore(participant) : undefined
    if(amount == undefined) return 0
    return amount
  }

  setScore(scoreId: string, participant: Participant, amount?: number): void {
    const score = this.getObj(scoreId)
    if(amount == undefined){ score.removeParticipant(participant); return }

    score.setScore(participant, amount)
  }

  addScore(scoreId: string, participant: Participant, amount: number): number {
    const score = this.getObj(scoreId)
    return score.addScore(participant, amount)
  }

  hasParticipant(scoreId: string, participant: Participant): boolean {
    const score = this.getObj(scoreId)
    return score.hasParticipant(participant)
  }
}

type Participant = string | Entity | ScoreboardIdentity