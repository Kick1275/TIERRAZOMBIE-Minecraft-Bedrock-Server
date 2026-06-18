import * as mc from "@minecraft/server";
import { loopManager } from "../loopManager.js";

loopManager.startLoop("deathEvent", () => {
    const entities = mc.world.getDimension("overworld").getEntities({ tags: ["death"] });
    entities.forEach((entity) => entity.triggerEvent("death"));
}, mc.TicksPerSecond);

loopManager.startLoop("playerStatus", () => {
    const players = mc.world.getAllPlayers();
    
    players.forEach((source) => {
        source.removeTag("bleeding0");

        const scoreboard = mc.world.scoreboard;
        const stamina = scoreboard.getObjective("stamina");
        const thirst = scoreboard.getObjective("thirst");
        // ELIMINADO: const blood = scoreboard.getObjective("blood");
        // ELIMINADO: const infection = scoreboard.getObjective("infection");

        if (stamina) {
            const score = stamina.getScore(source);
            if (score > 20) stamina.setScore(source, 20);
            if (score < 0) stamina.setScore(source, 0);
        }

        if (thirst) {
            const score = thirst.getScore(source);
            if (score > 20) thirst.setScore(source, 20);
        }

        // ELIMINADO: Sistema de sangre
        /*
        if (blood) {
            const score = blood.getScore(source);
            if (score > 3500) blood.setScore(source, 3500);
        }
        */

        // ELIMINADO: Sistema de infección
        /*
        if (infection) {
            const score = infection.getScore(source);
            if (score < 0) infection.setScore(source, 0);
        }

        source.runCommandAsync(`execute as @s[scores={infection=..20}] run effect @s hunger 0 0 true`);
        */
    });
}, mc.TicksPerSecond * 5);