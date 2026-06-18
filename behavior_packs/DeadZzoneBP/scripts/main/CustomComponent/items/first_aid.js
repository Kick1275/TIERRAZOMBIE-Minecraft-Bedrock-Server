import { world, ItemStack } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(({ itemComponentRegistry }) => {
	itemComponentRegistry.registerCustomComponent('mcpe:aid', {
		onConsume(e) => {
			const player = e.source
			const item = e.itemStack
			
			if (item?.typeId == "mcpe:first_aid") {
				player.runCommandAsync(
					'loot give @s loot first_aid'
				);
			}
		}
	});
})
    	