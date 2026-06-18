import { world, ItemStack } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
	itemComponentRegistry.registerCustomComponent('mcpe:splint', {
		onConsume(e) => {
			const player = e.source
			const item = e.itemStack
			
			// MODIFICADO: Ahora cura vida directamente
			if (item?.typeId == "mcpe:splint") {
				player.runCommandAsync('effect @s slowness 0 225 false');
				player.runCommandAsync('effect @s absorption 20 0 false');
				player.runCommandAsync('effect @s regeneration 10 0 false'); // Regeneración
				player.runCommandAsync('effect @s instant_health 1 0 false'); // Cura instantánea
				player.runCommandAsync('event entity @s broken_bone_remove');
				player.runCommandAsync('event entity @s remove_damage_sensor');
			}
			if (item?.typeId == "mcpe:morphine") {
				player.runCommandAsync('effect @s slowness 0 225 false');
				player.runCommandAsync('effect @s absorption 20 0 false');
				player.runCommandAsync('effect @s regeneration 15 1 false'); // Regeneración fuerte
				player.runCommandAsync('effect @s instant_health 1 1 false'); // Cura instantánea nivel 2
				player.runCommandAsync('event entity @s broken_bone_remove');
				player.runCommandAsync('event entity @s remove_damage_sensor');
			}
		}
	});
})
    	