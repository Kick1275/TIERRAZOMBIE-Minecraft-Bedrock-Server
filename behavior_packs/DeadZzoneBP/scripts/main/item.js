/*
* Note: this is a newly write code, please do not steal or claim it as your own.
* If you would like to get access to the code, please contact zack.
*
* Code by Marky.
*
* This is not source code.
* You can still add items you want for personal.
*
* Version: 2.0.
*/
import * as mc from "@minecraft/server";

const bloodTypes = {
    "blood_type_a": "mcpe:blood_bag_type_a",
    "blood_type_ab": "mcpe:blood_bag_type_ab",
    "blood_type_b": "mcpe:blood_bag_type_b",
    "blood_type_o": "mcpe:blood_bag_type_o"
};

const bleedLevel = {
    "bleeding0": 0,
    "bleeding1": 1,
    "bleeding2": 2,
    "bleeding3": 3,
    "bleeding4": 4,
    "bleeding5": 5,
    "bleeding6": 6,
    "bleeding7": 7,
    "bleeding8": 8,
    "bleeding9": 9,
    "bleeding10": 10
};

const itemMedical = {
	"mcpe:blood_bag_type_a": {
		"blood": 100,
		"tag": [
			"blood_type_ab",
			"blood_type_b",
			"blood_type_o"
		],
		"giveitem": [
			{
				"item": "mcpe:blood_bag_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:blood_bag_type_ab": {
		"blood": 100,
		"giveitem": [
			{
				"item": "mcpe:blood_bag_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:blood_bag_type_b": {
		"blood": 100,
		"tag": [
			"blood_type_a",
			"blood_type_ab",
			"blood_type_o"
		],
		"giveitem": [
			{
				"item": "mcpe:blood_bag_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:blood_bag_type_o": {
		"blood": 100,
		"tag": [
			"blood_type_a",
			"blood_type_ab",
			"blood_type_b"
		],
		"giveitem": [
			{
				"item": "mcpe:blood_bag_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:blood_bag_emp": {
		"blood": -100,
		"giveitem": []
	},
	"mcpe:blood_test_kit": {
		"check": true
	}
};

const itemDrink = {
	"mcpe:bottle_water": {
		"thirst": 6,
		"stamina": 14,
		"giveitem": [
			{
				"item": "mcpe:bottle_water_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:bottle_water_bleach": { 
		"drinkdamage": 9999
	},
	"mcpe:bottle_water_unpure": {
		"thirst": 6,
		"stamina": -8,
		"tag": "dirty_water",
		"effect": [
			{
				"nausea": {
					"duration": 30,
					"amplifier": 0
				}
			},
			{
				"weakness": {
					"duration": 25,
					"amplifier": 0
				}
			},
			{
				"mining_fatigue": {
					"duration": 20,
					"amplifier": 0
				}
			}
		],
		"giveitem": [
			{
				"item": "mcpe:bottle_water_emp",
				"quantity": 1
			}
		]
	},
	"mcpe:coffee": {
		"thirst": 7,
		"stamina": 8
	},
	"mcpe:energy_drink": {
		"thirst": 7,
		"stamina": 20,
		"effect": [
			{
				"speed": {
					"duration": 60,
					"amplifier": 0
				}
			}
		]
	},
	"mcpe:exp_coke": {
		"thirst": 6,
		"stamina": 6
	},
	"mcpe:grape_soda": {
		"thirst": 5,
		"stamina": 7
	},
	"mcpe:lemonade": {
		"thirst": 6,
		"stamina": 8
	},
	"mcpe:milk_gallon": {
		"thirst": 20,
		"stamina": 20
	},
	"mcpe:popsi_cola": {
		"thirst": 6,
		"stamina": 14
	},
	"mcpe:pot_cook_water": {
		"thirst": 10,
		"stamina": 8,
		"giveitem": [
			{
				"item": "mcpe:cooking_pot",
				"quantity": 1
			}
		]
	},
	"mcpe:pot_water": {
		"thirst": 6,
		"stamina": -8,
		"tag": "dirty_water",
		"effect": [
			{
				"nausea": {
					"duration": 30,
					"amplifier": 0
				}
			},
			{
				"weakness": {
					"duration": 25,
					"amplifier": 0
				}
			},
			{
				"mining_fatigue": {
					"duration": 20,
					"amplifier": 3
				}
			}
		],
		"giveitem": [
			{
				"item": "mcpe:cooking_pot",
				"quantity": 1
			}
		]
	},
	"mcpe:red_wine": {
		"thirst": 10,
		"stamina": -8,
		"effect": [
			{
				"nausea": {
					"duration": 45,
					"amplifier": 0
				}
			},
			{
				"strength": {
					"duration": 40,
					"amplifier": 0
				}
			},
			{
				"regeneration": {
					"duration": 20,
					"amplifier": 0
				}
			}
		]
	},
	"mcpe:vodka": {
		"thirst": 10,
		"stamina": -10,
		"effect": [
			{
				"nausea": {
					"duration": 45,
					"amplifier": 0
				}
			},
			{
				"strength": {
					"duration": 35,
					"amplifier": 0
				}
			},
			{
				"regeneration": {
					"duration": 20,
					"amplifier": 1
				}
			}
		]
	},
	"mcpe:whiskey": {
		"thirst": 9,
		"stamina": -8,
		"effect": [
			{
				"nausea": {
					"duration": 40,
					"amplifier": 0
				}
			},
			{
				"strength": {
					"duration": 60,
					"amplifier": 0
				}
			},
			{
				"regeneration": {
					"duration": 20,
					"amplifier": 1
				}
			}
		]
	},
	"mcpe:beer_bottle": {
		"thirst": 8,
		"stamina": -8,
		"effect": [
			{
				"nausea": {
					"duration": 34,
					"amplifier": 0
				}
			},
			{
				"strength": {
					"duration": 35,
					"amplifier": 0
				}
			},
			{
				"regeneration": {
					"duration": 20,
					"amplifier": 1
				}
			}
		]
	}
};


const itemFood = {
	"mcpe:canned_bacon_open": {
		"stamina": 8
	},
	"mcpe:canned_beans_open": {
		"stamina": 8
	},
	"mcpe:canned_chicken_open": {
		"stamina": 6
	},
	"mcpe:canned_chili_open": {
		"stamina": 6
	},
	"mcpe:canned_corned_open": {
		"stamina": 6
	},
	"mcpe:canned_fruit_open": {
		"stamina": 8
	},
	"mcpe:canned_ham_open": {
		"stamina": 8
	},
	"mcpe:canned_peaches_open": {
		"thirst": 6,
		"stamina": 8
	},
	"mcpe:canned_ration_open": {
		"stamina": 8
	},
	"mcpe:canned_sardine_open": {
		"stamina": 6
	},
	"mcpe:canned_spaghetti_open": {
		"stamina": 7
	},
	"mcpe:canned_stew_open": {
		"stamina": 7
	},
	"mcpe:canned_tomato_open": {
		"stamina": 7
	},
	"mcpe:canned_tuna_open": {
		"stamina": 6
	},
	"mcpe:canned_bacon_open_bad": {
		"stamina": 5
	},
	"mcpe:canned_beans_open_bad": {
		"stamina": 5
	},
	"mcpe:canned_chicken_open_bad": {
		"stamina": 3
	},
	"mcpe:canned_chili_open_bad": {
		"stamina": 3
	},
	"mcpe:canned_corned_open_bad": {
		"stamina": 3
	},
	"mcpe:canned_fruit_open_bad": {
		"thirst": 4,
		"stamina": 5
	},
	"mcpe:canned_ham_open_bad": {
		"stamina": 4
	},
	"mcpe:canned_peaches_open_bad": {
		"thirst": 4,
		"stamina": 3
	},
	"mcpe:canned_ration_open_bad": {
		"stamina": 4
	},
	"mcpe:canned_sardine_open_bad": {
		"stamina": 3
	},
	"mcpe:canned_spaghetti_open_bad": {
		"stamina": 5
	},
	"mcpe:canned_stew_open_bad": {
		"stamina": 5
	},
	"mcpe:canned_tomato_open_bad": {
		"stamina": 5
	},
	"mcpe:canned_tuna_open_bad": {
		"stamina": 4
	},
	"mcpe:tactical_sandwich": {
		"stamina": 6
	},
	"mcpe:chip_potato": {
		"stamina": 6
	},
	"mcpe:chip_tortila": {
		"stamina": 6
	},
	"mcpe:chocolate_bar": {
		"stamina": 8
	},
	"mcpe:creeper_crunch": {
		"stamina": 8
	},
	"mcpe:meat_jerky": {
		"stamina": 8
	},
	"mcpe:mre": {
		"stamina": 12
	},
	"mcpe:rice": {
		"stamina": 2
	},
	"mcpe:apple_green": {
		"thirst": 6,
		"stamina": 8
	},
	"mcpe:banana": {
		"thirst": 6,
		"stamina": 7
	},
	"mcpe:cucumber": {
		"thirst": 7,
		"stamina": 7
	},
	"mcpe:pear": {
		"thirst": 7,
		"stamina": 8
	},
	"mcpe:tomato": {
		"thirst": 8,
		"stamina": 7
	},
	"mcpe:zucchini": {
		"thirst": 7,
		"stamina": 7
	},
	"mcpe:cooked_player": {
		"stamina": 10,
		"event": [
			"kuru_effect"
		]
	},
	"mcpe:raw_player": {
		"stamina": 6,
		"event": [
			"kuru_effect"
		]
	},
	"minecraft:cooked_mutton": {
		"stamina": 8
	},
	"minecraft:cooked_rabbit": {
		"stamina": 7
	},
	"minecraft:cooked_salmon": {
		"stamina": 6
	},
	"minecraft:cooked_chicken": {
		"stamina": 8
	},
	"minecraft:cooked_porkchop": {
		"stamina": 8
	},
	"minecraft:cooked_beef": {
		"stamina": 10
	},
	"minecraft:cooked_cod": {
		"stamina": 6
	},
	"minecraft:dried_kelp": {
		"stamina": 6
	},
	"minecraft:mushroom_stew": {
		"stamina": 15
	},
	"minecraft:bread": {
		"stamina": 6
	},
	"minecraft:baked_potato": {
		"stamina": 9
	},
	"minecraft:potato": {
		"stamina": 7
	},
	"minecraft:pumpkin_pie": {
		"stamina": 8
	},
	"minecraft:rabbit_stew": {
		"stamina": 14
	},
	"minecraft:beetroot": {
		"stamina": 7
	},
	"minecraft:beetroot_soup": {
		"stamina": 16
	},
	"minecraft:rotten_flesh": {
		"stamina": 10,
		"event": [
			"kuru_effect"
		]
	},
	"minecraft:apple": {
		"thirst": 6,
		"stamina": 8
	},
	"minecraft:golden_apple": {
		"thirst": 6,
		"stamina": 8
	},
	"minecraft:glow_berries": {
		"thirst": 2,
		"stamina": 5
	},
	"minecraft:melon_slice": {
		"thirst": 12,
		"stamina": 8
	},
	"minecraft:honey_bottle": {
		"thirst": 10,
		"stamina": 4
	},
	"minecraft:milk_bucket": {
		"thirst": 10,
		"stamina": 4
	},
	"minecraft:carrot": {
		"thirst": 1,
		"stamina": 8
	},
	"minecraft:potion": {
		"drinkdamage": 9999
	}
};

const itemCanned = {
	"mcpe:canned_ham": {
		"giveitem": [
			{
				"item": "mcpe:canned_ham_open",
				"quantity": 1
			}
		]
	},
	"mcpe:canned_tuna": {
		"giveitem": [
			{
				"item": "mcpe:canned_tuna_open",
				"quantity": 1
			}
		]
	},
	"mcpe:canned_corned": {
		"giveitem": [
			{
				"item": "mcpe:canned_corned_open",
				"quantity": 1
			}
		]
	},
	"mcpe:canned_ration": {
		"giveitem": [
			{
				"item": "mcpe:canned_ration_open",
				"quantity": 1
			}
		]
	}
};

const itemMisc = {
	"mcpe:bleach": {
		"drinkdamage": 9999
	}
};

mc.world.afterEvents.itemCompleteUse.subscribe(async (data) => {
	let { source, itemStack } = data;
	let itemId = itemStack.typeId;
	
	// Canned Food
	if (itemCanned[itemId]) {
		let canneditem = itemCanned[itemId];
		
		if (canneditem.giveitem) {
			canneditem.giveitem.forEach(item => {
				let quantity = item.quantity || 1;
				source.runCommandAsync(`give @s ${item.item} ${quantity}`);
			});
		}
	}
	
	// Misc
	if (itemMisc[itemId]) {
		let miscItem = itemMisc[itemId];
		
		if (miscItem.drinkdamage) {
			source.runCommandAsync(`damage @s ${miscItem.drinkdamage} override`);
		}
	}
	
	// Food
	if (itemFood[itemId]) {
		let foodItem = itemFood[itemId];
		
		if (foodItem.thirst) {
			source.runCommandAsync(`scoreboard players add @s thirst ${foodItem.thirst}`);
		}
		
		if (foodItem.stamina) {
			source.runCommandAsync(`scoreboard players add @s stamina ${foodItem.stamina}`);
		}
		
		if (foodItem.drinkdamage) {
			source.runCommandAsync(`damage @s {foodItem.drinkdamage} override`);
		}
		
		if (foodItem.event) {
			foodItem.event.forEach(event => {
				source.runCommandAsync(`event entity @s ${event}`);
			});
		}
	}
	
	// Drink
	if (itemDrink[itemId]) {
		let drinkItem = itemDrink[itemId];
		
		if (drinkItem.thirst) {
			source.runCommandAsync(`scoreboard players add @s thirst ${drinkItem.thirst}`);
		}
		
		if (drinkItem.stamina) {
			source.runCommandAsync(`scoreboard players add @s stamina ${drinkItem.stamina}`);
		}
		
		if (drinkItem.drinkdamage) {
			source.runCommandAsync(`damage @s ${drinkItem.drinkdamage} override`);
		}
		
		if (drinkItem.effect) {
			drinkItem.effect.forEach(effectData => {
				Object.keys(effectData).forEach(effect => {
					let { duration, amplifier } = effectData[effect];
					source.runCommandAsync(`effect @s ${effect} ${duration} ${amplifier}`);
				});
			});
		}
		
		if (drinkItem.tag) {
        	source.runCommandAsync(`tag @s add ${drinkItem.tag}`);
    	}
	
		if (drinkItem.giveitem) {
			drinkItem.giveitem.forEach(item => {
				let quantity = item.quantity || 1;
				source.runCommandAsync(`give @s ${item.item} ${quantity}`);
			});
		}
	}
	
	// Medical
	if (itemMedical[itemId] && itemMedical[itemId].check) {
    	let medicalItem = itemMedical[itemId];

    	let currentBloodType = Object.keys(bloodTypes).find(bloodType => source.hasTag(bloodType));

    	if (currentBloodType) {
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.warning_blood_type"},{"text":" ${currentBloodType.replace('blood_type_', '').toUpperCase()}."}]}`);
    	} else {
        	let randomBloodType = Object.keys(bloodTypes)[Math.floor(Math.random() * Object.keys(bloodTypes).length)];
        	await source.addTag(randomBloodType);
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.blood_type"},{"text":" ${randomBloodType.replace('blood_type_', '').toUpperCase()}."}]}`);
    	}
	} 
    else if (itemId === "mcpe:blood_bag_emp") {
    	let currentBloodType = Object.keys(bloodTypes).find(bloodType => source.hasTag(bloodType));

    	if (currentBloodType) {
        	let bloodBagItem = bloodTypes[currentBloodType];
        	await source.runCommandAsync(`scoreboard players remove @s blood 100`);
        	await source.runCommandAsync(`give @s ${bloodBagItem}`);
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.blood_transfer"}]}`);
    	} else {
        	await source.runCommandAsync(`give @s mcpe:blood_bag_unknown`);
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.warning_blood_type"}]}`);
    	}
    } 
    else if (itemId.startsWith("mcpe:blood_bag_type_")) {
    	let currentBloodType = Object.keys(bloodTypes).find(bloodType => source.hasTag(bloodType));
    	let bloodBagType = itemId.replace("mcpe:blood_bag_type_", "blood_type_");
    
    	if (!currentBloodType) {
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.warning_blood_type"}]}`);
        	source.runCommandAsync(`give @s ${itemId} 1`);
        	return;
        }

    	if (currentBloodType !== bloodBagType) {
        	source.runCommandAsync(`damage @s 9999`);
        	return;
    	}
		
		source.runCommandAsync(`scoreboard players add @s blood 100`);
	}
	else if (itemId === "mcpe:blood_bag_type_o") {
    	source.runCommandAsync(`scoreboard players add @s blood 100`);
	} 

	else if (itemId === "mcpe:blood_bag_unknown") {
    	let currentBloodType = Object.keys(bloodTypes).find(bloodType => source.hasTag(bloodType));

    	if (currentBloodType) {
        	let bloodBagItem = bloodTypes[currentBloodType];
        	await source.runCommandAsync(`clear @s mcpe:blood_bag_unknown 1`);
        	await source.runCommandAsync(`give @s ${bloodBagItem}`);
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.blood_transfer"}]}`);
    	} else {
        	source.runCommandAsync(`tellraw @s {"rawtext":[{"translate":"game.message.warning_blood_type"}]}`);
    	}
	} 
	else if (itemMedical[itemId]) {
    	let medicalItem = itemMedical[itemId];
         
    	let currentBleedLevel = getCurrentBleedLevel(source);
        
       if (currentBleedLevel === 1 && medicalItem.event_two) {
       	medicalItem.event_two.forEach(event_two => {
           	source.runCommandAsync(`event entity @s ${event_two}`);
          });
       }
      
       if (currentBleedLevel > 0) {
           let newBleedLevel = Math.max(0, currentBleedLevel + medicalItem.bleedlevelreduce);
           setCurrentBleedLevel(source, newBleedLevel);
        }

    	if (medicalItem.tag) {
        	let tags = source.hasTags();
        	if (tags.some(tag => medicalItem.tag.includes(tag))) {
            	source.runCommandAsync(`kill @s`);
            	return;
        	}
    	}

    	if (medicalItem.overdose) {
        	source.runCommandAsync(`scoreboard players add @s overdose ${medicalItem.overdose}`);
    	}

    	// ELIMINADO: Sistema de infección
    	/*
    	if (medicalItem.infection) {
        	source.runCommandAsync(`scoreboard players add @s infection ${medicalItem.infection}`);
    	}
    	*/

    	if (medicalItem.event) {
        	medicalItem.event.forEach(event => {
            	source.runCommandAsync(`event entity @s ${event}`);
        	});
    	}

    	if (medicalItem.dropitem) {
        	medicalItem.dropitem.forEach(dropitem => {
            	source.runCommandAsync(`loot give @s loot ${dropitem}`);
        	});
    	}

    	if (medicalItem.effect) {
        	medicalItem.effect.forEach(effectData => {
            	Object.keys(effectData).forEach(effect => {
                	let { duration, amplifier } = effectData[effect];
                	source.runCommandAsync(`effect @s ${effect} ${duration} ${amplifier}`);
            	});
        	});
    	}

    	if (medicalItem.giveItem) {
        	medicalItem.giveItem.forEach(item => {
            	let quantity = item.quantity || 1;
            	source.runCommandAsync(`give @s ${item.item} ${quantity}`);
        	});
    	}
	}
});

function getCurrentBleedLevel(entity) {
    for (let level in bleedLevel) {
        if (entity.hasTag(level)) {
            return bleedLevel[level];
        }
    }
    return 0;
}

function setCurrentBleedLevel(entity, newLevel) {
	
    for (let level in bleedLevel) {
        entity.removeTag(level);
    }
    
    if (newLevel >= 0 && newLevel <= 10) {
        entity.addTag(`bleeding${newLevel}`);
    }
}


mc.world.afterEvents.itemStartUse.subscribe(async (data) => {
	const player = data.source;
	const item = data.itemStack;
	
	if (item.typeId === "mcpe:detonator") {
		try {
			await player.runCommandAsync('execute at @e[type=grenade:c4] run summon grenade:explosive');
			await player.runCommandAsync('execute at @e[type=grenade:c4] run event entity @s despawn');
		} catch (error) {
			player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"Scripting Error"}]}`);
		}
	}
	
	if (item.typeId === "mcpe:remote") {
		try {
			await player.runCommandAsync('execute at @e[tag=boom] run summon grenade:explosive');
		} catch (error) {
			player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"Scripting Error"}]}`);
		}
	}
});