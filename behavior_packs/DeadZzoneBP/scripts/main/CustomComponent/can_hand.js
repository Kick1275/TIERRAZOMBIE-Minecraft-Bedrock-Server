import { world, ItemStack } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
	itemComponentRegistry.registerCustomComponent('mcpe:hand_opened_can', {
		onConsume(e) => {
			const player = e.source
			const item = e.itemStack
			
			if (item?.typeId == "mcpe:canned_corned") {
				player.runCommandAsync(
					'give @s mcpe:canned_corned_open 0 1'
				);
			}
			if (item?.typeId == "mcpe:canned_ham") {
				player.runCommandAsync(
					'give @s mcpe:canned_ham_open 0 1'
				);
			}
			if (item?.typeId == "mcpe:canned_ration") {
				player.runCommandAsync(
					'give @s mcpe:canned_ration_open 0 1'
				);
			}
			if (item?.typeId == "mcpe:canned_tuna") {
				player.runCommandAsync(
					'give @s mcpe:canned_tuna_open 0 1'
				);
			}
		}
	});
})
    	