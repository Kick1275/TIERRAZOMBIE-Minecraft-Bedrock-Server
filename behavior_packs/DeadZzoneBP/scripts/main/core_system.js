import * as mc from "@minecraft/server";
import { EquipmentSlot, GameMode } from "@minecraft/server";
import { GUN_PROPERTIES } from '../main/config/gun_type_config.js';
import { deadzone_advancements } from "./advancements.js";
import { getScore } from "./advancements.js";
import { createCorpseOnDeath, despawnableEntities, despawnTimeSeconds, resetOnDeath, configUI, enableShowUiCreativeMod} from "config.js";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

const activePlayers = new Map();
const bleedingIntervals = new Map();

mc.world.afterEvents.playerSpawn.subscribe(async (data) => {
    if (!data.initialSpawn) return;
    const player = data.player;
    const systemInfo = player.clientSystemInfo;
    const switchCheck = (systemInfo.maxRenderDistance <= 12 && systemInfo.platformType == PlatformType.Console);
    
    player.runCommandAsync(`give @s[tag=!join] mcpe:addon_menu 1 0 {"minecraft:item_lock": {"mode": "lock_in_inventory"}}`);
    player.runCommandAsync("execute as @s[tag=!join] run function DZgunsDataCount");
    player.runCommandAsync("execute as @s[tag=!join] run function DZammoStart");
    player.runCommandAsync("effect @s resistance 10 225");

    try {
        await player.runCommandAsync('tellraw @s {"rawtext":[{"translate":"game.message.welcome_dz"}]}');

        if (!player.hasTag('join')) {
            const randomTshirt = [
                "mcpe:tshirt_black",
                "mcpe:tshirt_blue",
                "mcpe:tshirt_red",
                "mcpe:tshirt_white",
                "mcpe:tshirt_green",
                "mcpe:tshirt_yellow"
            ];
            const selectedTshirt = randomTshirt[Math.floor(Math.random() * randomTshirt.length)];

            const randomJeans = [
                "mcpe:jean_black",
                "mcpe:jean_brown",
                "mcpe:jean_light",
                "mcpe:khaki_light"
            ];
            const selectedJeans = randomJeans[Math.floor(Math.random() * randomJeans.length)];

            const randomHats = [
                "mcpe:cap_blue",
                "mcpe:cap_green",
                "mcpe:cap_red",
                "mcpe:durag_black",
                "mcpe:durag_brown",
                "mcpe:flat_black",
                "mcpe:flat_brown",
                "mcpe:hunting_hat"
            ];
            const shouldGetHat = Math.random() < 0.5;
            const selectedHat = shouldGetHat ? randomHats[Math.floor(Math.random() * randomHats.length)] : null;

            const randomVests = [
                "mcpe:hunting_brown",
                "mcpe:hunting_navy",
                "mcpe:biker_jacket",
                "mcpe:traffic_lime",
                "mcpe:traffic_orange",
                "mcpe:press_vest"
            ];
            const shouldGetVest = Math.random() < 0.10;
            const selectedVest = shouldGetVest ? randomVests[Math.floor(Math.random() * randomVests.length)] : null;

            const randomFood = [
                "minecraft:apple",
                "mcpe:apple_green",
                "mcpe:pear"
            ];
            const shouldGetFood = Math.random() < 0.75;
            const selectedFood = shouldGetFood ? randomFood[Math.floor(Math.random() * randomFood.length)] : null;

            const randomMedical = [
                "mcpe:bandage"
            ];
            const shouldGetMedical = Math.random() < 0.55;
            const selectedMedical = shouldGetMedical ? randomMedical[Math.floor(Math.random() * randomMedical.length)] : null;

            const randomMelee = [
                "mcpe:baseball_bat",
                "mcpe:screwdriver",
                "mcpe:wooden_plank",
                "mcpe:hammer",
                "mcpe:wrench",
                "mcpe:pipe_wrench",
                "mcpe:hunting_knife"
            ];
            const shouldGetMelee = Math.random() < 0.15;
            const selectedMelee = shouldGetMelee ? randomMelee[Math.floor(Math.random() * randomMelee.length)] : null;

            const randomGuns = [
                {
                    gun: "mcpe:m1911",
                    ammo: "mcpe:ammo_45acp"
                },
                {
                    gun: "mcpe:makarov",
                    ammo: "mcpe:ammo_9x18mm"
                }
            ];
            const shouldGetGun = Math.random() < 0.05;
            const selectedGun = shouldGetGun ? randomGuns[Math.floor(Math.random() * randomGuns.length)] : null;
            
            await player.runCommandAsync(`give @s[tag=!join] ${selectedTshirt} 1`);
            await player.runCommandAsync(`give @s[tag=!join] ${selectedJeans} 1`);
            if (selectedHat) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedHat} 1`);
            }
            if (selectedVest) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedVest} 1`);
            }
            if (selectedFood) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedFood} 1`);
            }
            if (selectedMedical) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedMedical} 1`);
            }
            if (selectedMelee) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedMelee} 1`);
            }
            if (selectedGun) {
                await player.runCommandAsync(`give @s[tag=!join] ${selectedGun.gun} 1`);
                await player.runCommandAsync(`give @s[tag=!join] ${selectedGun.ammo} 1`);
            }
            
            await Promise.resolve(); // skin system removed
        }
    } catch (error) {
        console.error('Error: ', error);
    }
});

function scheduleDespawn(entity) {
    mc.system.runTimeout(() => {
        try {
            if (entity && entity.isValid()) {
                entity.triggerEvent("despawn");
            }
        } catch (e) {
        }
    }, despawnTimeSeconds * 20);
}

mc.world.afterEvents.entityDie.subscribe(async data => {
    const deadEntity = data.deadEntity;

    if (despawnableEntities.includes(deadEntity.typeId)) {
        if (createCorpseOnDeath) {
            deadEntity.triggerEvent("death");
        } else {
            deadEntity.triggerEvent("drop_item");
            deadEntity.triggerEvent("death_vanilla");
            mc.system.runTimeout(() => {
                deadEntity.triggerEvent("despawn");
            }, 2 * 20);
        }
        scheduleDespawn(deadEntity);
    }
    
    if (deadEntity.typeId === 'minecraft:player') {
    	await deadEntity.runCommandAsync(`scoreboard players set @s thirst 20`);
    	await deadEntity.runCommandAsync(`scoreboard players set @s stamina 20`);
    	// ELIMINADO: await deadEntity.runCommandAsync(`scoreboard players set @s blood 3500`);
    	// ELIMINADO: await deadEntity.runCommandAsync(`scoreboard players set @s infection 0`);
    
    }

    if (deadEntity.typeId === 'minecraft:player' && resetOnDeath) {
        resetPlayerScores(deadEntity);
    }
});


function resetPlayerScores(player) {
    const scores = ["player.kills", "zombie.kills", "time.playing", "survival.time", "longest.kill.distance", "scavenger.kills", "marauder.kills"];
    scores.forEach(async (score) => {
        await player.runCommandAsync(`scoreboard players set @s ${score} 0`);
    });
}

mc.world.afterEvents.entitySpawn.subscribe(entityNameTag);
function entityNameTag() {
	const entities = Array.from(mc.world.getDimension("overworld").getEntities());
	for (const entity of entities) {
		if (entity.typeId === "mcpe:scavenger") {
			entity.nameTag = "Scavenger";
		} else if (entity.typeId === "mcpe:marauder") {
			entity.nameTag = "Marauder";
		}
	}
}

function showAdvancementUI(player) {
    const form = new ActionFormData()
        .title("Advancement List")
        .body("Select an advancement to view details:");
    for (const key in deadzone_advancements) {
        const advancement = deadzone_advancements[key];
        const hasTag = player.hasTag(advancement.tags);
        const score = advancement.scoreRequired !== undefined ? getScore(advancement.objective, player, false) : undefined;

        if (!hasTag && (score === undefined || score < advancement.scoreRequired)) {
            form.button(`§c${advancement.name}`);
        } else {
            form.button(`§a${advancement.name}`);
        }
    }
    
    form.show(player).then((response) => {
        if (response.canceled) return;
        
        const advancementKey = Object.keys(deadzone_advancements)[response.selection];
        showAdvancementDetailUI(player, advancementKey);
    });
}

function showAdvancementDetailUI(player, key) {
    const advancement = deadzone_advancements[key];
    const form = new ActionFormData()
        .title(advancement.name)
        .body(`Description: §e${advancement.description} || "No description available."`);

    form.button("Back");
    form.show(player).then((response) => {
        if (response.canceled);
        showAdvancementUI(player);
    });
}

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

function randomChance(percentage) {
    return Math.random() < percentage / 100;
}

function getThirstSymbol(thirst) {
    if (thirst >= 20) return ""; // full
    if (thirst >= 19) return ""; // full
    if (thirst >= 18) return ""; // full
    if (thirst >= 17) return ""; // full
    if (thirst >= 16) return ""; // full
    if (thirst >= 15) return ""; // full
    if (thirst >= 14) return ""; // full
    if (thirst >= 13) return ""; // full
    if (thirst >= 12) return ""; // full
    if (thirst >= 11) return ""; // full
    if (thirst >= 10) return ""; // half
    if (thirst >= 9) return ""; // half
    if (thirst >= 8) return ""; // half
    if (thirst >= 7) return ""; // half
    if (thirst >= 6) return ""; // half
    if (thirst >= 5) return ""; // half
    if (thirst >= 4) return ""; // half
    if (thirst >= 3) return ""; // half
    if (thirst >= 2) return ""; // half
    if (thirst >= 1) return ""; // half
    return ""; // 0
}

function getBloodSymbol(blood) {
    if (blood >= 1000) return ""; // full
    if (blood >= 900) return ""; // full
    if (blood >= 800) return ""; // full
    if (blood >= 700) return ""; // full
    if (blood >= 600) return ""; // full
    if (blood >= 500) return ""; // half
    if (blood >= 400) return ""; // half
    if (blood >= 300) return ""; // half
    if (blood >= 200) return ""; // half
    if (blood >= 100) return ""; // half
    return ""; // 0
}

function getInfectionSymbol(infection) {
    if (infection >= 100) return ""; // full
    if (infection >= 90) return ""; // half
    if (infection >= 80) return ""; // half
    if (infection >= 70) return ""; // half
    if (infection >= 60) return ""; // half
    if (infection >= 50) return ""; // half
    if (infection >= 40) return ""; // half
    if (infection >= 30) return ""; // half
    if (infection >= 20) return ""; // half
    return ""; // 0
}

function getStaminaSymbol(stamina) {
    if (stamina >= 20) return ""; // full
    if (stamina >= 19) return ""; // full
    if (stamina >= 18) return ""; // full
    if (stamina >= 17) return ""; // full
    if (stamina >= 16) return ""; // full
    if (stamina >= 15) return ""; // full
    if (stamina >= 14) return ""; // full
    if (stamina >= 13) return ""; // full
    if (stamina >= 12) return ""; // full
    if (stamina >= 11) return ""; // full
    if (stamina >= 10) return ""; // half
    if (stamina >= 9) return ""; // half
    if (stamina >= 8) return ""; // half
    if (stamina >= 7) return ""; // half
    if (stamina >= 6) return ""; // half
    if (stamina >= 5) return ""; // half
    if (stamina >= 4) return ""; // half
    if (stamina >= 3) return ""; // half
    if (stamina >= 2) return ""; // half
    if (stamina >= 1) return ""; // half
    return ""; // 0
}

function getBleedingLevel(player) {
	if (player.hasTag("bleeding10")) return 10;
	if (player.hasTag("bleeding9")) return 9;
	if (player.hasTag("bleeding8")) return 8;
	if (player.hasTag("bleeding7")) return 7;
	if (player.hasTag("bleeding6")) return 6;
	if (player.hasTag("bleeding5")) return 5;
	if (player.hasTag("bleeding4")) return 4;
    if (player.hasTag("bleeding3")) return 3;
    if (player.hasTag("bleeding2")) return 2;
    if (player.hasTag("bleeding1")) return 1;
    return 0;
}


function getAmmoSymbol(currentDurability, maxDurability) {
    if (currentDurability <= 0) return ""; // No ammo
    if (currentDurability <= maxDurability / 2) return ""; // Low ammo (Red)
    return ""; // Normal ammo (Green)
}

// ── Cross-pack HUD: TACZBE ammo + Ranzie's difficulty ──────────────────────
// Packs run in isolated script contexts, but `world` (dynamic properties,
// scoreboard) is shared, so we can read what TACZBE/Ranzie's already store
// without modifying those packs at all.

// TACZBE tracks ammo per weapon via a scoreboard objective named after the
// bare weapon key (krep:m4a1 -> objective "m4a1"), entirely through raw
// commands inside animation_controllers/*.json + entities/plalyer.json —
// not through any script, which is why it wasn't visible from scripts/ alone.
// Max values below come straight from the "scoreboard players set @s <key> <max>"
// reload lines in those animation controllers.
const TACZ_WEAPON_MAX_AMMO = {
    g17: 17, g18: 17, m1911: 7, p320: 12, b93: 20, uzi: 20, db: 2,
    deagle: 7, mp5: 30, m16a1: 20, m16: 30, m870: 5, mp7: 40,
    ump: 25, t50: 8, cp: 6,
    hk416: 30, g3: 20, aa12: 10, akm: 30, m4a1: 30, g36: 30, saiga12: 5,
    qbz95: 30, sks: 10, qbz191: 30, type81: 30, m1014: 7,
    scarh: 20, scarl: 30, fal: 20, mk14: 20,
    evolys: 75, m249: 100, awp: 5,
};

function getTaczAmmoDisplay(item, player) {
    const itemType = item.typeId;
    if (!itemType.startsWith('krep:')) return null;

    // Minigun: fed from the .308 Win ammo box ("win308" objective) and has its
    // own real overheat gauge (0-100, see functions/minigun.mcfunction) — this
    // is the "cooling level" that climbs while firing and forces an empty swap at 100.
    if (itemType === 'krep:minigun' || itemType === 'krep:minigun_emp') {
        const ammoObjective = mc.world.scoreboard.getObjective('win308');
        const heatObjective = mc.world.scoreboard.getObjective('minigunoverheat');
        const ammo = ammoObjective ? (ammoObjective.getScore(player) ?? 0) : 0;
        const heat = heatObjective ? (heatObjective.getScore(player) ?? 0) : 0;
        const cooling = 100 - heat;
        const heatColor = cooling <= 0 ? "\xa74" : cooling <= 40 ? "\xa7e" : "\xa7a";
        return `: \xa77${ammo}\xa7r \xa78| Cooling: ${heatColor}${cooling}%%%\xa7r`;
    }

    const bareKey = itemType.replace('krep:', '').replace(/_emp$/, '');
    const objective = mc.world.scoreboard.getObjective(bareKey);
    if (objective) {
        const score = objective.getScore(player) ?? 0;
        const max = TACZ_WEAPON_MAX_AMMO[bareKey];
        const colorCode = score <= 0 ? "\xa74" : (max && score <= max / 2) ? "\xa7c" : "\xa77";
        return max ? `: ${colorCode}${score}\xa7r/\xa7f${max}\xa7r` : `: ${colorCode}${score}\xa7r`;
    }

    // No tracked objective for this weapon (e.g. Vector, Golden Deagle, RPG) —
    // fall back to loaded/empty state from the item id.
    const isEmpty = itemType.endsWith('_emp');
    return isEmpty ? ": \xa74Empty\xa7r" : ": \xa7aLoaded\xa7r";
}

// Mirrors Ranzie's own diff = currentDay / maxDay formula (fullmoon.js) using
// the 'max_day' dynamic property it writes to the shared world. Defaults to
// the same 100 Ranzie's itself uses (MAX_DAY) until its settings UI is saved
// at least once — matches what Ranzie's own action bar would show either way.
function getRanzieDifficultyDisplay() {
    const rawMaxDay = mc.world.getDynamicProperty('max_day');
    const maxDay = Number(rawMaxDay) || 100;
    const currentDay = mc.world.getDay();
    const diff = Math.min(1, currentDay / maxDay);
    return `: \xa75${(diff * 100).toFixed(2)}%%%\xa7r`;
}

function updateDurabilityDisplay(item) {
    let durabilityComponent = item.getComponent("durability");
    let itemType = item.typeId;

    if (durabilityComponent && GUN_PROPERTIES[itemType]) {
        let maxDurability = GUN_PROPERTIES[itemType].durability;
        let currentDurability = maxDurability - durabilityComponent.damage;
        let ammoSymbol = getAmmoSymbol(currentDurability, maxDurability);
        let colorCode = currentDurability <= 0 ? "\xa74" : currentDurability <= maxDurability / 2 ? "\xa7c" : "\xa77";
        return `${ammoSymbol}: ${colorCode}${currentDurability}\xa7r/\xa7f${maxDurability}\xa7r`;
    }
    return ": 0/0";
}

function updateActionBar(player) {
    const thirst = getScore("thirst", player);
    // ELIMINADO: const blood = getScore("blood", player);
    // ELIMINADO: const infection = getScore("infection", player);
    const stamina = getScore("stamina", player);
    const bleedingLevel = getBleedingLevel(player);
    
    const thirstPercentage = Math.floor((thirst / 20) * 100);
    // ELIMINADO: const bloodPercentage = Math.floor((blood / 3500) * 100);
    const staminaPercentage = Math.floor((stamina / 20) * 100);

    const thirstSymbol = getThirstSymbol(thirst);
    // ELIMINADO: const bloodSymbol = getBloodSymbol(blood);
    // ELIMINADO: const infectionSymbol = getInfectionSymbol(infection);
    const staminaSymbol = getStaminaSymbol(stamina);

    const inventory = player.getComponent("inventory").container;
    const selectedItem = inventory.getItem(player.selectedSlotIndex);
    const taczAmmo = selectedItem ? getTaczAmmoDisplay(selectedItem, player) : null;
    const fallbackGunDurability = selectedItem ? updateDurabilityDisplay(selectedItem) : ": 0/0";
    const gunDurability = taczAmmo ?? fallbackGunDurability;
    const difficultyText = getRanzieDifficultyDisplay() ?? "";

    const equipmentInventory = player.getComponent("equippable");
    const mainHandItem = equipmentInventory.getEquipment(EquipmentSlot.Mainhand);
    const showPosition = mainHandItem && mainHandItem.typeId === "minecraft:compass";
    const positionText = showPosition ? ": " + Math.floor(player.location.x) + ", " + Math.floor(player.location.y) + ", " + Math.floor(player.location.z) : "";
    
    const showBleeding = bleedingLevel;
    const bleedingText = showBleeding ? `: §f${bleedingLevel}` : "";

    const displayText = [
        `${thirstSymbol}: §f${thirstPercentage}%%%`,
        `${staminaSymbol}: §f${staminaPercentage}%%%`,
        // ELIMINADO: `${bloodSymbol}: §f${bloodPercentage}%%%`,
        // ELIMINADO: `${infectionSymbol}: §f${infection}%%%`,
        gunDurability,
        difficultyText,
        positionText,
        bleedingText
    ].filter(text => text.trim() !== "");

    player.onScreenDisplay.setActionBar({
        rawtext: displayText.map(text => ({ text: `${text}\n` }))
    });
}

// Thirst system
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        const gameMode = player.getGameMode();
        
        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) return;

        const thirst = getScore("thirst", player);
        if (thirst > 0) {
            setScore("thirst", player, thirst - 1);
        } else {
            player.applyDamage(1);
        }
    });
}, 90 * 20);

// Stamina system
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        const gameMode = player.getGameMode();
        
        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) return;

        const stamina = getScore("stamina", player);
        const isRunning = player.isSprinting;
        const isJumping = player.isJumping;
        const isSwimming = player.isSwimming;

        if (isRunning && isJumping) {
            if (stamina > 0) {
                setScore("stamina", player, stamina - 2);
            } else {
                player.runCommand(`effect @s slowness 3 2 true`);
                player.runCommand(`effect @s weakness 3 2 true`);
            }
        } else if (isRunning || isSwimming || isJumping) {
            if (stamina > 0) {
                setScore("stamina", player, stamina - 1);
            } else {
                player.runCommand(`effect @s slowness 3 2 true`);
                player.runCommand(`effect @s weakness 3 2 true`);
            }
        } else {
            if (stamina < 20) {
                setScore("stamina", player, stamina + 1);
            }
        }
    });
}, 3 * 20);

// DESHABILITADO: Sistema de infección eliminado
/*
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        const gameMode = player.getGameMode();
        
        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) return;

        const infection = getScore("infection", player);

        if (infection >= 25 && infection < 50) {
            player.runCommand(`effect @s hunger 9000 0 true`);
        } else if (infection >= 50 && infection < 75) {
            player.runCommand(`effect @s hunger 9000 1 true`);
        } else if (infection >= 75 && infection < 100) {
            player.runCommand(`effect @s hunger 9000 2 true`);
        } else if (infection >= 100) {
            player.runCommand(`kill @s`);
        }
    });
}, 125 * 20);

mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        const gameMode = player.getGameMode();
        
        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) return;

        const infection = getScore("infection", player);

        if (infection >= 75 && infection < 100) {
            player.runCommand(`damage @s 1`);
        }
    });
}, 200);
*/

// DESHABILITADO: Sistema de sangre eliminado — blood == 0 no mata
/*
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        const gameMode = player.getGameMode();

        if (gameMode === GameMode.creative || gameMode === GameMode.spectator) return;

        const blood = getScore("blood", player);

        if (blood == 0) {
            player.runCommand(`kill @s`);
        }
    });
}, 20);
*/

// play nature sounds
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        player.runCommand(`event entity @s mcpe:nature_sounds`);
    });
}, 160);

// Fusionado: avatar / config / list — un solo getAllPlayers() y un solo bucle cada 30 ticks
// (antes eran 3 intervals separados, cada uno con su propio getAllPlayers()). Lógica idéntica.
mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        if (player.hasTag("avatar")) {
            player.removeTag("avatar");
        }
        if (player.hasTag("config")) {
            configUI(player);
        }
        if (player.hasTag("list")) {
            showAdvancementUI(player);
            player.runCommandAsync(`tag @s remove list`);
        }
    });
}, 30);

// Clamps de stamina/thirst: un solo comando @a GLOBAL por tick en vez de @s por jugador
// (antes: 3·N comandos/tick). El selector @a[scores={...}] filtra a quién aplica, igual que @s.
const __ow_dim = mc.world.getDimension("overworld");
mc.system.runInterval(() => {
    try {
        __ow_dim.runCommand(`scoreboard players set @a[scores={stamina=21..}] stamina 20`);
        __ow_dim.runCommand(`scoreboard players set @a[scores={stamina=..-1}] stamina 0`);
        __ow_dim.runCommand(`scoreboard players set @a[scores={thirst=21..}] thirst 20`);
    } catch (e) {}
}, 1);

// Gamerules: son globales y constantes. Reafirmarlos con baja frecuencia (cada 200 ticks)
// en vez de por jugador y por tick (antes: 3·N comandos/tick). Efecto idéntico: se mantienen fijos.
mc.system.runInterval(() => {
    try {
        __ow_dim.runCommand(`gamerule showcoordinates false`);
        __ow_dim.runCommand(`gamerule showdaysplayed true`);
        __ow_dim.runCommand(`gamerule sendcommandfeedback false`);
    } catch (e) {}
}, 200);

mc.system.runInterval(() => {
    const players = mc.world.getAllPlayers();
    players.forEach((player) => {
        updateActionBar(player);
    });
}, 1);

/*const bleedLevels = ["bleeding1", "bleeding2", "bleeding3", "bleeding4", "bleeding5", "bleeding6", "bleeding7", "bleeding8", "bleeding9", "bleeding10"];

mc.world.afterEvents.itemCompleteUse.subscribe(async (data) => {
	let { source, itemStack } = data;
	
	if (source.typeId !== "minecraft:player") return;
	
	const player = source;
	const itemId = itemStack.typeId;
	
	function removeBleeding(player, amount) {
		for (let i = 0; i < amount; i++) {
			for (let level of bleedLevels.reverse()) {
				if (player.hasTag(level)) {
					player.removeTag(level);
					break;
				}
			}
		}
		
		if (!bleedLevels.some((level) => player.hasTag(level))) {
			player.runCommandAsync("event entity @s bleeding_remove");
		}
	}
	
	if (itemId === "mcpe:bandage") {
		removeBleeding(player, 2);
	} else if (itemId === "mcpe:bandage_sterilized") {
		removeBleeding(player, 2);
	} else if (itemId === "mcpe:rags") {
		removeBleeding(player, 1);
	} else if (itemId === "mcpe:rags_dirty") {
		removeBleeding(player, 1);
	} else if (itemId === "mcpe:rags_sterilized") {
		removeBleeding(player, 1);
	}
});*/