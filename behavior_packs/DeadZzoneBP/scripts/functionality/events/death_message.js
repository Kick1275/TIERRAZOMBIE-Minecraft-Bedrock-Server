/*! © Neko ¡ Project | All rights reserved */
/**
* This is a custom death message, it will not be showed up in the menu if you died for any reason.
* Death messages will be translated according to your game language.
* This is not an open source code. if you want to use it for your addon, you must get permission from the owner.
* Damage source: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entitydamagecause?view=minecraft-bedrock-stable
* Some @object { type } is custom.
*/
import * as mc from "@minecraft/server";
/**
* Disable the show of the vanilla death message.
*/
mc.world.gameRules.showDeathMessages = false;

const translateEntity= {
	"minecraft:zombie": "entity.zombie.name",
	"minecraft:drowned": "entity.drowned.name",
	"minecraft:elder_guardian": "entity.elder_guardian.name",
	"minecraft:guardian": "entity.guardian.name",
	"minecraft:skeleton": "entity.skeleton.name",
	"minecraft:creeper": "entity.creeper.name",
	"minecraft:spider": "entity.spider.name",
	"minecraft:enderman": "entity.enderman.name",
	"minecraft:wither": "entity.wither.name",
	"minecraft:bogged": "entity.bogged.name",
	"minecraft:evocation_illager": "entity.evocation_illager.name",
	"minecraft:evocation_fang": "entity.evocation_fang.name",
	"mcpe:civilian": "entity.mcpe:civilian.name",
	"mcpe:commander": "entity.mcpe:commander.name",
	"mcpe:hazmat": "entity.mcpe:hazmat.name",
	"mcpe:military": "entity.mcpe:military.name",
	"mcpe:militia": "entity.mcpe:militia.name",
	"mcpe:marauder": "entity.mcpe:marauder.name",
	"mcpe:scavenger": "entity.mcpe:scavenger.name"
};

const customDeathMessages = {
	// Vanilla Stuff
    "entityAttack": {
		"message": "death.attack.mob",
		"type": "entityAttack"
	},
	"blockExplosion": {
		"message": "death.attack.explosion.by.bed",
		"type": "blockExplosion"
	},
    "projectile": {
		"message": "death.attack.arrow",
		"type": "projectile"
	},
    "fall": {
		"message": "death.attack.fall",
		"type": "fall"
	},
	"fallingBlock": {
		"message": "death.attack.fallingBlock",
		"type": "fallingBlock"
	},
    "fire": {
		"message": "death.attack.inFire",
		"type": "fire"
	},
	"fireTick": {
		"message": "death.attack.onFire",
		"type": "fireTick"
	},
	"fireworks": {
		"message": "death.attack.fireworks",
		"type": "fireworks"
	},
    "freezing": {
		"message": "death.attack.freeze",
		"type": "freezing"
	},
	"flyIntoWall": {
		"message": "death.attack.inWall",
		"type": "flyIntoWall"
	},
    "lava": {
		"message": "death.attack.lava",
		"type": "lava"
	},
    "drowning": {
		"message": "death.attack.drown",
		"type": "drowning"
	},
    "magic": {
		"message": "death.attack.magic",
		"type": "magic"
	},
	"magma": {
		"message": "death.attack.magma",
		"type": "magma"
	},
    "lightning": {
		"message": "death.attack.lightningBolt",
		"type": "lightning"
	},
    "entityExplosion": {
		"message": "death.attack.explosion.player",
		"type": "entityExplosion"
	},
	"maceSmash": {
		"message": "death.attack.maceSmash.player",
		"type": "maceSmash"
	},
	"selfDestruct": {
		"message": "death.attack.generic",
		"type": "selfDestruct"
	},
	"stalactite": {
		"message": "death.attack.stalactite",
		"type": "stalactite"
	},
	"stalagmite": {
		"message": "death.attack.stalagmite",
		"type": "stalagmite"
	},
    "starve": {
		"message": "death.attack.starve",
		"type": "starve"
	},
    "suffocation": {
		"message": "death.attack.suffocation",
		"type": "suffocation"
	},
	"sonicBoom": {
		"message": "death.attack.sonicBoom",
		"type": "sonicBoom"
	},
	"thorns": {
		"message": "death.attack.thorns",
		"type": "thorns"
	},
    "void": {
		"message": "death.attack.outOfWorld",
		"type": "void"
	},
    "none": {
		"message": "death.attack.generic",
		"type": "none"
	},
	"wither": {
		"message": "death.attack.wither",
		"type": "wither"
	},
	// Deadzone Stuff
    "temperature_freeze": {
		"message": "death.attack.freeze.temperature",
		"messageKiller": "death.attack.freeze.temperature.player",
		"type": "temperature"
	},
    "temperature_heat": {
		"message": "death.attack.heat.temperature",
		"messageKiller": "death.attack.heat.temperature.player",
		"type": "temperature"
	},
	/*"sickness": {
		"message": "death.attack.sickness",
		"type": "sickness"
	},
	"overdose": {
		"message": "death.attack.overdose",
		"type": "overdose"
	},*/
	"thirst": {
		"message": "death.attack.thirst",
		"type": "thirst"
	},
	"bleeding": {
		"message": "death.attack.bleeding",
		"type": "bleeding"
	},
	"infection": {
		"message": "death.attack.infection",
		"type": "infection"
	},
	"blood_loss": {
		"message": "death.attack.blood_loss",
		"type": "blood"
	}
};

/**
 * @param { import("@minecraft/server").mc.Player } player 
 */
mc.world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
    if (deadEntity instanceof mc.Player) {
        let cause = damageSource.cause || "none";
        let deathMessage = customDeathMessages[cause]?.message || "death.attack.generic";
        
        let killer = damageSource.damagingEntity;
        let killerName = "Unknown";
        
        if (killer instanceof mc.Player) {
            killerName = killer.name;
        } else if (killer) {
            killerName = translateEntity[killer.typeId] || killer.typeId;
        }
        
        deathMessage = deathMessage.replace("{{killer}}", killerName);
        
        const scoreboard = mc.world.scoreboard;
        
        const thirstScore = scoreboard.getObjective("thirst")?.getScore(deadEntity) ?? 100;
        const infectionScore = scoreboard.getObjective("infection")?.getScore(deadEntity) ?? 0;
        const bloodScore = scoreboard.getObjective("blood")?.getScore(deadEntity) ?? 100;
        
        if (thirstScore <= 0) {
            deathMessage = customDeathMessages["thirst"].message;
        }
        
        if (bloodScore <= 0) {
            deathMessage = customDeathMessages["blood_loss"].message;
        } else if (deadEntity.hasTag("bleeding3") || deadEntity.hasTag("bleeding4") || deadEntity.hasTag("bleeding5") || deadEntity.hasTag("bleeding6") || deadEntity.hasTag("bleeding7") || deadEntity.hasTag("bleeding8") || deadEntity.hasTag("bleeding9") || deadEntity.hasTag("bleeding10")) {
    		deathMessage = customDeathMessages["bleeding"].message;
		}
        
        if (infectionScore >= 100) {
            deathMessage = customDeathMessages["infection"].message;
        }
        
        if (deadEntity.hasTag("is_freezer")) {
            let deathData = customDeathMessages["temperature_freeze"];
            deathMessage = killer ? deathData.messageKiller : deathData.message;
        }
        
        if (deadEntity.hasTag("is_burning")) {
        	let deathData = customDeathMessages["temperature_heat"];
            deathMessage = killer ? deathData.messageKiller : deathData.message;
        }
        
        for (const player of mc.world.getPlayers()) {
            player.sendMessage([
            	{ translate: deathMessage, with: killer ? [deadEntity.name] : [deadEntity.name] },
            	{ translate: translateEntity[killer?.typeId] || killer?.typeId, with: killer ? [deadEntity.name] : [deadEntity.name] }
            ]);
        }
    }
});