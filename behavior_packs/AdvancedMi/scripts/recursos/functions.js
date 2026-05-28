
import {
    world, Entity,  ScoreboardIdentity
  } from '@minecraft/server'


/**
 * Le da formato al dinero
 * @param {number} value
 */
export function metricNumbers(value) {
    if (typeof value === 'undefined' || value === null) {
      return '0.0';
    }
    const types = ["", "k", "M", "B", "T", "P", "E", "Z", "Y"];
    let selectType = 0;
    let scaled = value;
    while (scaled >= 1000 && selectType < types.length - 1) {
      scaled /= 1000;
      selectType++;
    }
    return scaled.toFixed(2) + types[selectType];
  }
  export function getScore(plr, obj) {
    try {
        const score = world.scoreboard.getObjective(obj)?.getScore(plr.scoreboardIdentity);
        return score ?? 0;
    }
    catch {
        return 0;
    }
  }
  
  /**
   * Obtiene la puntuación registrada para la entidad en el objetivo
   * @param {Entity} entity
   * @param {string} objectiveId
   * @returns {number} 

  export function getScore(participant, objectiveId) {
    const objective = world.scoreboard.getObjective(objectiveId);
    if (!objective)
        throw new Error(`Objective ${objectiveId} not found`);
    return objective.getScore(participant);
  }
  */
  /**
   * Obtiene varias puntuaciones registradas para la entidad en objetivos
   * @param {Entity} entity
   * @param {string} objectiveId
   * @returns {number} 
   */
  export function getScores(player, scoreKeys) {
    return scoreKeys.reduce((obj, key) => {
      obj[key] = getScore(player, key);
      return obj;
    }, {});
  }
  /**
   * Establece la puntuación registrada para la entidad en el objetivo
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} score
   */
  export function setScore(participant, objectiveId, score) {
    const objective = world.scoreboard.getObjective(objectiveId);
    if (!objective)
        throw new Error(`Objective ${objectiveId} not found`);
    objective.setScore(participant, score);
    if (participant instanceof Entity)
        return participant.scoreboardIdentity;
    else if (participant instanceof ScoreboardIdentity)
        return participant;
    else
        return objective.getParticipants().find(p => p.displayName === participant);
  }
  /**
   * Añade la puntuación registrada para la entidad en el objetivo
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} score
   */
  export function addScore(participant, objectiveId, score) {
    const objective = world.scoreboard.getObjective(objectiveId);
    if (!objective)
        throw new Error(`Objective ${objectiveId} not found`);
    objective.addScore(participant, score);
    if (participant instanceof Entity)
        return participant.scoreboardIdentity;
    else if (participant instanceof ScoreboardIdentity)
        return participant;
    else
        return objective.getParticipants().find(p => p.displayName === participant);
  }
  /**
   * Resta la puntuación registrada para la entidad en el objetivo
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} score
   */
  export function subtractScore(entity, objectiveId, score) {
    const previousScore = getScore(entity, objectiveId);
    return setScore(entity, objectiveId, previousScore - score);
  }
  /**
   * Divide la puntuación registrada para la entidad en el objetivo
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} score
   */
  export function divideScore(entity, objectiveId, score) {
    const previousScore = getScore(entity, objectiveId);
    return setScore(entity, objectiveId, Math.floor(previousScore / score));
  }
  /**
   * Comprueba si la puntuación registrada para la entidad en el objetivo está dentro del rango.
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} min
   * @param {number} max
   */
  export function testScore(entity, objectiveId, min, max) {
    const score = getScore(entity, objectiveId);
    return score >= min && score <= max;
  }
  /**
   * Establece una puntuación aleatoria entre un rango para la entidad en el objetivo.
   * @param {Entity} entity
   * @param {string} objectiveId
   * @param {number} min
   * @param {number} max
   */
  export function randomScore(entity, objectiveId, min, max) {
    return setScore(entity, objectiveId, getRandomArbitrary(min, max));
  }
