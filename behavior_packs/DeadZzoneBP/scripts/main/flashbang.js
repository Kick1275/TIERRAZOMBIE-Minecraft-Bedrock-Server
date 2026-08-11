import * as mc from "@minecraft/server";

const FLASH_ENTITIES_IDS = [
	"grenade:flash"
];
const MAX_FLASH_DISTANCE = 16;

export const tick = () => {
	const players = mc.world.getPlayers();
	if (players.length === 0) return;

	// Gate: si no existe ninguna granada flash cargada en el mundo, ningún jugador puede
	// estar mirándola. Hacemos UNA query por tipo/dimensión en vez del raycast getEntities
	// POR JUGADOR (que era el costo por-tick). En un servidor que no usa flashes esto salta
	// el trabajo caro casi siempre. Comportamiento idéntico: sin flash → nadie tiene can_flash.
	const dims = new Set();
	for (const p of players) dims.add(p.dimension);
	let anyFlash = false;
	for (const dim of dims) {
		for (const id of FLASH_ENTITIES_IDS) {
			try {
				if (dim.getEntities({ type: id }).length > 0) { anyFlash = true; break; }
			} catch (e) {}
		}
		if (anyFlash) break;
	}

	if (!anyFlash) {
		// Limpiar tags residuales (barato: solo hasTag/removeTag, sin queries espaciales).
		for (const player of players) {
			if (player.hasTag("can_flash")) {
				player.removeTag("can_flash");
			}
		}
		return;
	}

	for (const player of players) {
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