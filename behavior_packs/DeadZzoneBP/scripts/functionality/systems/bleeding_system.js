import * as mc from "@minecraft/server";
import { getScore, setScore } from "../utils/scoreboard_utils.js";

class BleedingSystem {
    constructor(player) {
        this.player = player;
        this.bleedingTags = Array.from({ length: 9 }, (_, i) => "bleeding" + (i + 1));
    }

    hasBleeding() {
        return this.bleedingTags.some(tag => this.player.hasTag(tag));
    }

    getBleedingLevel() {
        for (let i = this.bleedingTags.length; i > 0; i--) {
            if (this.player.hasTag("bleeding" + i)) {
                return i;
            }
        }
        return 0;
    }

    applyBleeding(chance) {
        if (this.hasBleeding()) return;
        if (Math.random() > chance) return;

        this.player.addTag("bleeding1");
        this.player.setProperty("mcpe:bleeding", true);
        this.player.sendMessage({ translate: "game.message.bleeding_warning" });
    }

    updateBleeding() {
    	if (!this.hasBleeding()) return;
        const blood = getScore("blood", this.player);
        let bleedingLevel = this.getBleedingLevel();
        if (this.player.hasTag("bleeding10")) {
        	bleedingLevel = 10;
        }

        let bloodReduction = bleedingLevel * 4 + 2;
        let newBlood = Math.max(blood - bloodReduction, 0);
        setScore("blood", this.player, newBlood);
        
        if (bleedingLevel > 0 && bleedingLevel < 10) {
            const chance = bleedingLevel * 1;
            if (Math.random() * 100 < chance) {
                this.player.removeTag("bleeding" + bleedingLevel);
                this.player.addTag("bleeding" + (bleedingLevel + 1));
            }
        }

        if (newBlood === 0) {
            this.player.runCommand("damage @s 6");
        }
    }

    applyBleedingDamage() {
        const bleedingLevel = this.getBleedingLevel();
        if (bleedingLevel > 2) {
            let damageAmount = Math.ceil(bleedingLevel / 2);
            this.player.runCommand("damage @s " + damageAmount);
        }
    }

    increaseBleedingChance() {
        this.bleedingTags.forEach((tag, index) => {
            if (this.player.hasTag(tag)) {
                let chance = 5 + index * 1.2;
                if (Math.random() * 100 < chance) {
                    this.player.removeTag(tag);
                    const nextLevel = index + 2;
                    if (nextLevel <= 10) {
                        this.player.addTag("bleeding" + nextLevel);
                    }
                }
            }
        });
    }

    reduceBleeding(count) {
        let level = this.getBleedingLevel();
        if (this.player.hasTag("bleeding10")) {
        	level = 10;
        }
        for (let i = 0; i < count && level > 0; i++) {
            this.player.removeTag("bleeding" + level);
            level--;
            if (level > 0) {
            	this.player.addTag("bleeding" + level);
            }
        }
    }

    static handleProjectileHit(event) {
        if (!(event.hitEntity instanceof mc.Player)) return;
        new BleedingSystem(event.hitEntity).applyBleeding(0.9);
    }

    static handleEntityHit(event) {
        if (!(event.hitEntity instanceof mc.Player)) return;
        new BleedingSystem(event.hitEntity).applyBleeding(0.18);
    }
}

mc.world.afterEvents.projectileHitEntity.subscribe(BleedingSystem.handleProjectileHit);
mc.world.afterEvents.entityHitEntity.subscribe(BleedingSystem.handleEntityHit);

mc.system.runInterval(() => {
    mc.world.getAllPlayers().forEach(player => {
        new BleedingSystem(player).updateBleeding();
    });
}, 20);

mc.system.runInterval(() => {
    mc.world.getAllPlayers().forEach(player => {
        new BleedingSystem(player).applyBleedingDamage();
    });
}, 10 * 20);

mc.system.runInterval(() => {
    mc.world.getAllPlayers().forEach(player => {
        new BleedingSystem(player).increaseBleedingChance();
    });
}, 20);

mc.system.runInterval(() => {
	mc.world.getAllPlayers().forEach(player => {
		const bleedingSystem = new BleedingSystem(player);
		const hasBleed = bleedingSystem.hasBleeding();
		const blood = getScore("blood", player);
		if (!hasBleed && blood < 3500) {
			const newBlood = Math.min(blood + 5, 3500);
			setScore("blood", player, newBlood);
		}
	});
}, 30 * 20);

mc.world.afterEvents.itemCompleteUse.subscribe(async (data) => {
    const { source, itemStack } = data;
    if (!(source instanceof mc.Player)) return;

    const player = source;
    const itemId = itemStack.typeId;
    const bleedingSystem = new BleedingSystem(player);

    if (itemId === "mcpe:bandage") {
        bleedingSystem.reduceBleeding(2);
    } else if (itemId === "mcpe:bandage_sterilized") {
        bleedingSystem.reduceBleeding(2);
        source.setProperty("mcpe:bleeding", false);
    } else if (itemId === "mcpe:rags") {
        bleedingSystem.reduceBleeding(1);
        source.setProperty("mcpe:bleeding", false);
    } else if (itemId === "mcpe:rags_dirty") {
        bleedingSystem.reduceBleeding(1);
        source.setProperty("mcpe:bleeding", false);
    } else if (itemId === "mcpe:rags_sterilized") {
        bleedingSystem.reduceBleeding(1);
        source.setProperty("mcpe:bleeding", false);
    }
});