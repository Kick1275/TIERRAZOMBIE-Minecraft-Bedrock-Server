import * as mc from "@minecraft/server";

const FLASH_ENTITIES_IDS = [
	"grenade:flash"
];
const MAX_FLASH_DISTANCE = 16;

export const tick = () => {
	for (const player of mc.world.getPlayers()) {
		const isLookingAtFlashEntity = isPlayerLookingAtEntity(player, FLASH_ENTITIES_IDS, MAX_FLASH_DISTANCE);
		if (isLookingAtFlashEntity) {
			if (!player.hasTag("can_flash")) {
				player.addTag("can_flash");
			}
		} else {
			if (player.hasTag("can_flash")) {
				player.removeTag("can_flash");
			}
		}
	}
}

const isPlayerLookingAtEntity = (player, entityIds, maxDistance) => {
	const { x: px, y: py, z: pz } = player.location;
	const { x: dx, y: dy, z: dz } = player.getViewDirection();
	
	const targetPosition = {
		x: px + dx * maxDistance,
		y: py + dy * maxDistance,
		z: pz + dz * maxDistance
	};
	
	const nearbyEntities = player.dimension.getEntities({
		location: targetPosition,
		maxDistance
	});
	
	return nearbyEntities.some((entity) => entityIds.includes(entity.typeId));
};