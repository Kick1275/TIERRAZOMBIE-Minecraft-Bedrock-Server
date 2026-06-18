import { world, EntityDamageCause, BlockComponentRandomTickEvent, BlockComponentPlayerInteractEvent, BlockComponentTickEvent, BlockComponentStepOnEvent, BlockStates, BlockPermutation, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from '@minecraft/server-ui'

// block name "mcpe:{blockname}" loot name "location loot table file"
// all of these code formats, the loot table are in the same file [loot_tables/loots/{loot_name}]
const spawnLoot = {
    "mcpe:civilian_loot": {
        loot: "civilian"
    },
    "mcpe:construction_loot": {
        loot: "construction"
    },
    "mcpe:firefighter_loot": {
        loot: "firefighter"
    },
    "mcpe:food_loot": {
        loot: "food"
    },
    "mcpe:medical_loot": {
        loot: "medical"
    },
    "mcpe:artic_loot": {
        loot: "artic"
    },
    "mcpe:desert_loot": {
        loot: "desert"
    },
    "mcpe:woodland_loot": {
        loot: "woodland"
    },
    "mcpe:police_loot": {
        loot: "police"
    },
    "mcpe:medieval_loot": {
        loot: "medieval"
    }
};
const spawnVmLoot = {
	"mcpe:vending_popsi": {
		loot: "drink_vending"
	}
};

const spawnRareLoot = {
	"mcpe:rare_loot": {
		loot: "rare"
	}
};

world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:random_tick', {
        onRandomTick: (e) => {
        	const location = e.block.location;
       	 const isFlashing = e.block.permutation.getState("block:power");
       	
       	 if (!isFlashing) {
        	    const newPermutation = e.block.permutation.withState("block:power", true);
           	 e.block.setPermutation(newPermutation);
     	   } else {
          	  if (isFlashing) {
              	  const newPermutation = e.block.permutation.withState("block:power", false);
               	 e.block.setPermutation(newPermutation);
          	  }
       	 }
  	  }
	});

    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:tick', {
        onTick: (e) => {
        	const { entity } = e;
            if (e.block.typeId === "mcpe:fire_light") {
                e.block.setType('air');
            }
            if (e.block.typeId === "mcpe:flashlight_block") {
                e.block.setType('air');
            }
            if (e.block.typeId === "mcpe:spawner_military") {
            	e.block.setType('air');
            	e.block.dimension.spawnEntity(`mcpe:military`, e.block.location);
            e.block.dimension.spawnEntity(`mcpe:military`, e.block.location);
            }
			if (e.block.typeId === "mcpe:supply_block_emp") {
                e.block.setType('air');
			}
        }
    });
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:loot_rare', {
    onPlayerInteract: (e) => {
        const location = e.block.location;
        const block = e.block;
        const container = e.player.getComponent('inventory').container;
        const item = container.getItem(e.player.selectedSlotIndex);
        const isLoot = block.permutation.getState("block:loot");
        const lootType = spawnRareLoot[block.typeId];

        const successChance = 0.5;
        const randomValue = Math.random();
    
        if (!isLoot && lootType) {
            if (item?.typeId === "mcpe:lockpick") {
                const durability = item.getComponent("durability");
                
                if (durability) {
                    if (randomValue <= successChance) {
                        e.block.dimension.runCommand(`loot spawn ${location.x} ${location.y + 1} ${location.z} loot "loots/${lootType.loot}"`);
                        e.block.dimension.playSound('loot.grab', location);
                        e.block.dimension.playSound('pin.lockpick', location);

                        const newPermutation = block.permutation.withState("block:loot", true);
                        block.setPermutation(newPermutation);

                        durability.damage += 1;
                        
                        if (durability.damage >= durability.maxDurability) {
                           	 container.setItem(e.player.selectedSlotIndex, null);
                         	   e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.lockpick_broken"}]}`);
                            	e.block.dimension.playSound('random.break', location);
                       	 } else {
                          	  container.setItem(e.player.selectedSlotIndex, item);
                       	 }
                 	   } else {
                       	 e.block.dimension.playSound('pin.lockpick', location);
                       	 durability.damage += 1;
                       
                       	 if (durability.damage >= durability.maxDurability) {
                           	 container.setItem(e.player.selectedSlotIndex, null);
                          	  e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.lockpick_broken"}]}`);
                           	 e.block.dimension.playSound('random.break', location);
                        	} else {
                           	 e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.lockpick_attempt"}]}`);
                       	 }
                  	  }
             	   }
           	 } else {
               	 e.player.runCommand(`tellraw @s {"rawtext":[{"translate":"game.message.warning_lockpick"}]}`);
               	 e.block.dimension.playSound('pin.lockpick', location);
           	 }
      	  }
    	},
    
    onTick: (e) => {
       	 const block = e.block;
      	  const isLoot = block.permutation.getState("block:loot");

       	 if (isLoot) {
           	 const newPermutation = block.permutation.withState("block:loot", false);
           	 block.setPermutation(newPermutation);
       	 }
   	 }
	});
    
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:loot', {
   	 onPlayerInteract: (e) => {
      	  const location = e.block.location;
     	   const block = e.block;
     	   const isLoot = block.permutation.getState("block:loot");
     	   const lootType = spawnLoot[block.typeId];
     
     	   if (!isLoot && lootType) {
          	  e.block.dimension.runCommand(`loot spawn ${location.x} ${location.y} ${location.z} loot "loots/${lootType.loot}"`);
          	  e.block.dimension.playSound('loot.grab', location);
            
          	  const newPermutation = block.permutation.withState("block:loot", true);
          	  block.setPermutation(newPermutation);
      	  }
 	   },
    
   	 onTick: (e) => {
      	  const block = e.block;
      	  const isLoot = block.permutation.getState("block:loot");
      
     	   if (isLoot) {
          	  const newPermutation = block.permutation.withState("block:loot", false);
           	 block.setPermutation(newPermutation);
       	 }
  	  }
	});
	
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:server_button_int', {
   	 onPlayerInteract: (e) => {
       	 const location = e.block.location;
       	 const block = e.block;
      	  const isPowering = block.permutation.getState("block:stage");

      	  if (isPowering) {
            	e.player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§4Wait until it turns red to use it"}]}`);
       	 } else {
            	const randomChance = Math.random() * 100;

         	   if (randomChance <= 50) {
              	  const positions50 = [
                   	 { x: -1188, y: 65, z: 17 },
                   	 { x: -1182, y: 66, z: -63 },
                    	{ x: -1153, y: 64, z: 163 },
                  	  { x: -1147, y: 64, z: 212 },
                  	  { x: -946, y: 66, z: 281 },
                  	  { x: -993, y: 65, z: 331 },
                  	  { x: -833, y: 64, z: 346 },
                  	  { x: -717, y: 67, z: 346 },
                   	 { x: -574, y: 64, z: 330 },
                 	   { x: -506, y: 64, z: 333 },
                  	  { x: -432, y: 66, z: 323 },
                  	  { x: -625, y: 66, z: -1065 },
                  	  { x: -577, y: 69, z: -1046 },
                  	  { x: -474, y: 67, z: -1098 },
                   	 { x: -138, y: 72, z: -767 },
                   	 { x: -7, y: 80, z: -622 },
                   	 { x: 236, y: 66, z: -597 },
                   	 { x: 309, y: 66, z: -514 },
                   	 { x: 35, y: 84, z: -473 },
                   	 { x: 26, y: 82, z: -350 },
                  	  { x: 238, y: 66, z: -24 },
                   	 { x: 230, y: 66, z: 60 },
                   	 { x: -1204, y: 65, z: -174 },
                  	  { x: -1176, y: 65, z: -254 },
                  	  { x: -1155, y: 64, z: -339 },
                  	  { x: -1157, y: 64, z: -425 },
                   	 { x: -1146, y: 65, z: -612 },
                   	 { x: -896, y: 82, z: -497 },
                   	 { x: -917, y: 87, z: -394 },
                   	 { x: -807, y: 77, z: -71 },
                  	  { x: -653, y: 93, z: 653 },
                   	 { x: -548, y: 83, z: 150 },
                   	 { x: -455, y: 70, z: 218 },
                  	  { x: -400, y: 93, z: -2 },
                  	  { x: -329, y: 75, z: -393 },
                   	 { x: -150, y: 86, z: -386 },
                   	 { x: -9, y: 79, z: -645 }
                	];
               	 const randomPos50 = positions50[Math.floor(Math.random() * positions50.length)];
               	 e.player.runCommandAsync(`tp @p ${randomPos50.x} ${randomPos50.y} ${randomPos50.z}`);
                
         	   } else if (randomChance <= 70) {
             	   const positions20 = [
                   	 { x: 78, y: 95, z: 104 },
                   	 { x: 241, y: 66, z: 330 },
                   	 { x: 235, y: 64, z: 271 },
                  	  { x: 132, y: 66, z: 309 },
                   	 { x: -2, y: 68, z: 56 }
              	  ];
                	const randomPos20 = positions20[Math.floor(Math.random() * positions20.length)];

               	 e.player.runCommandAsync(`tp @p ${randomPos20.x} ${randomPos20.y} ${randomPos20.z}`);
           	 }

            	e.block.dimension.playSound('note.bell', location);
            	const newPermutation = block.permutation.withState("block:stage", true);
           	 block.setPermutation(newPermutation);
       	 }
    	},

    	onTick: (e) => {
       	 const block = e.block;
        	const isPowering = block.permutation.getState("block:stage");

       	 if (isPowering) {
            	const newPermutation = block.permutation.withState("block:stage", false);
           	 block.setPermutation(newPermutation);
            	e.block.dimension.playSound('note.bell', block.location);
       	 }
   	 }
	});

	
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:water_pump_int', {
    onPlayerInteract: (e) => {
        const location = e.block.location;
        const container = e.player.getComponent('inventory').container;
        const item = container.getItem(e.player.selectedSlotIndex);
        const isUsed = e.block.permutation.getState("block:used");

        if (!isUsed) {
            if (!item) {
                e.block.dimension.runCommandAsync('execute as @a run scoreboard players add @s thirst 2');
                e.block.dimension.playSound("water.pump", location);
                
                const newPermutation = e.block.permutation.withState("block:used", true);
                e.block.setPermutation(newPermutation);
            }
            
            if (item?.typeId === "mcpe:bottle_water_emp") {
                if (item.amount > 0) {
                    const newItem = new ItemStack("mcpe:bottle_water", 1);
                    container.addItem(newItem);
                    e.block.dimension.runCommandAsync('execute as @a[hasitem={item=mcpe:bottle_water_emp,location=slot.weapon.mainhand}] run clear @s mcpe:bottle_water_emp 0 1');
                    e.block.dimension.playSound("water.pump", location);

                    const newPermutation = e.block.permutation.withState("block:used", true);
                    e.block.setPermutation(newPermutation);
                }
            } else if (item?.typeId === "mcpe:rags_dirty") {
                if (item.amount > 0) {
                    const newItem = new ItemStack("mcpe:rags", 1);
                    container.addItem(newItem);
                    e.block.dimension.runCommandAsync('execute as @a[hasitem={item=mcpe:rags_dirty,location=slot.weapon.mainhand}] run clear @s mcpe:rags_dirty 0 1');
                    e.block.dimension.playSound("water.pump", location);

                    const newPermutation = e.block.permutation.withState("block:used", true);
                    e.block.setPermutation(newPermutation);
                }
            } else if (item?.typeId === "mcpe:cooking_pot") {
                if (item.amount > 0) {
                    const newItem = new ItemStack("mcpe:pot_cook_water", 1);
                    container.addItem(newItem);
                    e.block.dimension.runCommandAsync('execute as @a[hasitem={item=mcpe:cooking_pot,location=slot.weapon.mainhand}] run clear @s mcpe:cooking_pot 0 1');
                    e.block.dimension.playSound("water.pump", location);

                    const newPermutation = e.block.permutation.withState("block:used", true);
                    e.block.setPermutation(newPermutation);
                }
            }
        }
    },
    
	onTick: (e) => {
    	const block = e.block;
        const isUsed = block.permutation.getState("block:used");

       if (isUsed) {
           const newPermutation = block.permutation.withState("block:used", false);
           	 block.setPermutation(newPermutation);
        	}
	    }
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:landmine_step', {
		
		onPlayerInteract: (e) => {
       	 const player = e.player;
       	 const block = e.block;
       	 const dimension = block.dimension;
       	 const location = block.location;
       	 const container = player.getComponent('inventory').container;
       	 const item = container.getItem(player.selectedSlotIndex);
       
        	if (item?.typeId === "mcpe:screwdriver") {
           	 const chance = Math.random();
         	   block.setType('air');

           	 if (chance < 0.5) {
               	 dimension.spawnEntity(`grenade:explosive`, location);
                	dimension.runCommandAsync(`function explode`);
                	e.block.dimension.playSound('pin.lockpick', location);
           	 } else {
               	 e.block.dimension.runCommand(`loot spawn ${location.x} ${location.y} ${location.z} loot "drop/block/drop_landmine"`);
          	  	e.block.dimension.playSound('loot.grab', location);
               	 e.block.dimension.playSound('pin.lockpick', location);
                }
            }
        },
        
    	onStepOn: (e) => {
    		const location = e.block.location;
    
    		e.block.setType('air');
    		e.block.dimension.spawnEntity(`grenade:explosive`, e.block.location);
    		e.block.dimension.runCommandAsync(`function explode`);
    	}
    });
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:barbed_wire', {
    	onTick: (e) => {
    		const location = e.block.location;
    		const entities = e.block.dimension.getEntities({
    			location: {
                    x: location.x + 0.8,
                    y: location.y + 0,
                    z: location.z + 0.8
                },
                maxDistance: 1,
            });
            
            for (const entity of entities) {
            	entity.applyDamage(1);
            	entity.addEffect("slowness", 19, { 
					amplifier: 2,
					showParticles: false 
				});
            }
        }
    });
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:wood_stake', {
    	onTick: (e) => {
    		const location = e.block.location;
    		const entities = e.block.dimension.getEntities({
    			location: {
                    x: location.x + 0.8,
                    y: location.y + 0.8,
                    z: location.z + 0.8
                },
                maxDistance: 1,
            });
            
            for (const entity of entities) {
            	entity.runCommandAsync('event entity @s bleeding');
            	entity.applyDamage(4);
            	entity.addEffect("slowness", 19, { 
					amplifier: 2,
					showParticles: false 
				});
            }
        }
    });
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:nail_trap', {
    	onTick: (e) => {
    		const location = e.block.location;
    		const entities = e.block.dimension.getEntities({
    			location: {
                    x: location.x + 0.8,
                    y: location.y + 0.1,
                    z: location.z + 0.8
                },
                maxDistance: 1,
            });
            
            for (const entity of entities) {
            	entity.runCommandAsync('event entity @s bleeding');
            	entity.applyDamage(5);
            	entity.addEffect("slowness", 10, { 
					amplifier: 1,
					showParticles: false 
				});
            }
        }
    });
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:bear_trap_int', {
    	onStepOn: (e) => {
      	  const location = e.block.location;
      	  const isPowering = e.block.permutation.getState("block:stage");

        	if (isPowering) {
           	 const entities = e.block.dimension.getEntities({
               	 location: {
                   	 x: location.x + 0.5,
                  	  y: location.y + 0.1,
                   	 z: location.z + 0.5
              	  },
             	   maxDistance: 1,
          	  });

          	  for (const entity of entities) {
            		entity.addTag("bleeding3");
            		entity.runCommandAsync('event entity @s bleeding');
            		entity.runCommandAsync('event entity @s broken_bones');
            		entity.applyDamage(3);
            	    entity.addEffect("slowness", 25, { 
						amplifier: 10,
						showParticles: false 
					});
         	   }
            
          	  e.block.dimension.playSound("bear.trap_close", location);
          	  const newPermutation = e.block.permutation.withState("block:stage", false);
           	 e.block.setPermutation(newPermutation);
      	  }
  	  },
    
  	  onPlayerInteract: (e) => {
     	   const location = e.block.location;
     	   const container = e.player.getComponent('inventory').container;
       	 const item = container.getItem(e.player.selectedSlotIndex);
      	  const isPowering = e.block.permutation.getState("block:stage");

       	 if (!isPowering) {
           	 e.block.dimension.playSound("bear.trap_open", location);
           	 const newPermutation = e.block.permutation.withState("block:stage", true);
          	  e.block.setPermutation(newPermutation);
      	  } else {
            	if (item?.typeId === "minecraft:stick") {
              	  e.block.dimension.playSound("bear.trap_close", location);
              	  const newPermutation = e.block.permutation.withState("block:stage", false);
              	  e.block.setPermutation(newPermutation);
           	 }
      	  }
   	 }
	});
		
    /*This is the random part of the texture*/
    
    initEvent.blockComponentRegistry.registerCustomComponent('mcpe:graffiti_placed', {
    	onPlace: (e) => {
       	 const randomTexture = Math.floor(Math.random() * 6) + 1;
        
      	  const permutation = e.block.permutation.withState('block:texture', randomTexture);
    	    e.block.setPermutation(permutation);
	    }
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:paper_placed', {
    	onPlace: (e) => {
       	 const randomTexture = Math.floor(Math.random() * 15) + 1;
        
      	  const permutation = e.block.permutation.withState('block:texture', randomTexture);
    	    e.block.setPermutation(permutation);
	    }
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:metal_rack_placed', {
    	onPlace: (e) => {
       	 const randomTexture = Math.floor(Math.random() * 9) + 1;
        
      	  const permutation = e.block.permutation.withState('block:texture', randomTexture);
    	    e.block.setPermutation(permutation);
	    }
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:light_int', {
  	  onPlayerInteract: (e) => {
      	  const location = e.block.location;
       	 const isPowering = e.block.permutation.getState("block:powering");
       	
       	 if (!isPowering) {
          	  e.block.dimension.playSound("random.click", location);
        	    const newPermutation = e.block.permutation.withState("block:powering", true);
           	 e.block.setPermutation(newPermutation);
     	   } else {
          	  if (isPowering) {
              	  e.block.dimension.playSound("random.click", location);
              	  const newPermutation = e.block.permutation.withState("block:powering", false);
               	 e.block.setPermutation(newPermutation);
          	  }
       	 }
  	  }
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:radio_ham_int', {
    	onPlayerDestroy: (e) => {
        	const location = e.block.location;
        
        	e.block.dimension.runCommandAsync(`stopsound @a[x=${location.x},y=${location.y},z=${location.z},r=15] radio.ham`);
    	},
    
    	onPlayerInteract: (e) => {
        	const location = e.block.location;
        	const isPowering = e.block.permutation.getState("block:powering");

        	if (!isPowering) {
            	e.block.dimension.playSound("radio.static", e.block.location);
            	e.block.dimension.playSound("radio.ham", e.block.location);
            
            	const newPermutation = e.block.permutation.withState("block:powering", true);
            	e.block.setPermutation(newPermutation);
        	} else {
            	e.block.dimension.runCommandAsync(`stopsound @a[x=${location.x},y=${location.y},z=${location.z},r=15] radio.ham`);
            	e.block.dimension.playSound("radio.static", e.block.location);
            
            	const newPermutation = e.block.permutation.withState("block:powering", false);
            	e.block.setPermutation(newPermutation);
        	}
    	}
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:radio_int', {
    	onPlayerDestroy: (e) => {
        	const location = e.block.location;
        	e.block.dimension.runCommandAsync(`stopsound @a[x=${location.x},y=${location.y},z=${location.z},r=15] radio.music`);
    	},
    
    	onPlayerInteract: (e) => {
        	const location = e.block.location;
        	const isPowering = e.block.permutation.getState("block:powering");

        	if (!isPowering) {
            	e.block.dimension.playSound("radio.static", e.block.location);
            	e.block.dimension.playSound("radio.music", e.block.location);
            
            	const newPermutation = e.block.permutation.withState("block:powering", true);
            	e.block.setPermutation(newPermutation);
        	} else {
            	e.block.dimension.runCommandAsync(`stopsound @a[x=${location.x},y=${location.y},z=${location.z},r=15] radio.music`);
            
            	e.block.dimension.playSound("radio.static", e.block.location);
            
            	const newPermutation = e.block.permutation.withState("block:powering", false);
            	e.block.setPermutation(newPermutation);
        	}
    	}
	});
	
	initEvent.blockComponentRegistry.registerCustomComponent('mcpe:player_interact', {
  	  onPlayerInteract: (e) => {
            const location = e.block.location;
            if (e.block.typeId === "mcpe:supply_block") {        	
                e.block.dimension.runCommandAsync(`loot spawn ${location.x} ${location.y} ${location.z} loot "supply_drop/supply"`);
                e.block.setType('mcpe:supply_block_emp');
                e.block.dimension.playSound('loot.grab', location);
            }
        }
    });
});