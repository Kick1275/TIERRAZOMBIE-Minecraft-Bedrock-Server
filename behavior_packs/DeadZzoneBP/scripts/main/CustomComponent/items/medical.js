import { world, ItemStack } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
	itemComponentRegistry.registerCustomComponent('mcpe:heal', {
		onConsume(e) => {
			const player = e.source
			const item = e.itemStack
			
			// MODIFICADO: Ahora cura vida directamente
			if (item?.typeId == "mcpe:adrenaline") {
				player.runCommandAsync('effect @s speed 20 0 false');
				player.runCommandAsync('effect @s absorption 20 0 false');
				player.runCommandAsync('effect @s regeneration 15 1 false'); // Más regeneración
				player.runCommandAsync('effect @s strength 45 0 false');
				player.runCommandAsync('effect @s instant_health 1 0 false'); // Cura instantánea
			}
			if (item?.typeId == "mcpe:antidote") {
				player.runCommandAsync('effect @s regeneration 20 1 false'); // Regeneración fuerte
				player.runCommandAsync('effect @s instant_health 1 1 false'); // Cura instantánea nivel 2
			}
			if (item?.typeId == "mcpe:painkiller") {
				player.runCommandAsync('effect @s speed 20 0 false');
				player.runCommandAsync('effect @s absorption 60 0 false');
				player.runCommandAsync('effect @s regeneration 15 0 false');
				player.runCommandAsync('effect @s strength 90 0 false');
				player.runCommandAsync('effect @s instant_health 1 0 false'); // Cura instantánea
			}
			if (item?.typeId == "mcpe:rags") {
				// 1.5 corazones = 3 HP
				const hc = player.getComponent("minecraft:health");
				if (hc) hc.setCurrentValue(Math.min(hc.currentValue + 3, hc.effectiveMax));
			}
			if (item?.typeId == "mcpe:rags_sterilized") {
				// 2.5 corazones = 5 HP
				const hc = player.getComponent("minecraft:health");
				if (hc) hc.setCurrentValue(Math.min(hc.currentValue + 5, hc.effectiveMax));
			}
			if (item?.typeId == "mcpe:rags_dirty") {
				player.runCommandAsync('effect @s regeneration 5 0 false'); // Regeneración débil
				player.runCommandAsync('effect @s instant_health 1 0 false'); // Cura instantánea
			}
			if (item?.typeId == "mcpe:bandage") {
				// 3 corazones = 6 HP
				const hc = player.getComponent("minecraft:health");
				if (hc) hc.setCurrentValue(Math.min(hc.currentValue + 6, hc.effectiveMax));
			}
			if (item?.typeId == "mcpe:bandage_sterilized") {
				// 4 corazones = 8 HP
				const hc = player.getComponent("minecraft:health");
				if (hc) hc.setCurrentValue(Math.min(hc.currentValue + 8, hc.effectiveMax));
			}
			if (item?.typeId == "mcpe:alcoholic_tinture") {
				player.runCommandAsync('effect @s nausea 45 0 false');
				player.runCommandAsync('effect @s strength 30 0 false');
				player.runCommandAsync('scoreboard players add @s thirst 6');
				player.runCommandAsync('scoreboard players add @s stamina 20');
			}
			// MODIFICADO: Bolsas de sangre ahora curan vida directamente
			if (item?.typeId == "mcpe:blood_bag_type_a") {
				player.runCommandAsync('effect @s regeneration 30 1 false');
				player.runCommandAsync('effect @s instant_health 1 1 false');
			}
			if (item?.typeId == "mcpe:blood_bag_type_ab") {
				player.runCommandAsync('effect @s regeneration 30 1 false');
				player.runCommandAsync('effect @s instant_health 1 1 false');
			}
			if (item?.typeId == "mcpe:blood_bag_type_b") {
				player.runCommandAsync('effect @s regeneration 30 1 false');
				player.runCommandAsync('effect @s instant_health 1 1 false');
			}
			if (item?.typeId == "mcpe:blood_bag_type_o") {
				player.runCommandAsync('effect @s regeneration 30 1 false');
				player.runCommandAsync('effect @s instant_health 1 1 false');
			}
		}
	});
})
    	