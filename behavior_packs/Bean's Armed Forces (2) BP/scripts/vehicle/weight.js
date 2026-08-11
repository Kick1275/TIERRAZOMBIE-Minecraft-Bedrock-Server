import { Entity } from "@minecraft/server";

/**
 * @param {Entity} weightEntity - The entity to use for the tick
 */
export function weightEntityTick(weightEntity) {
    const trailWidth = weightEntity.getProperty("af:trail.width") ?? 4;
    const trailType = weightEntity.getProperty("af:trail.type");

    const rot = weightEntity.getRotation().y;

    if (trailType) {
        [-1, 1].forEach(i => {
            const block = weightEntity.dimension.getBlock({ x: weightEntity.location.x + Math.sin(rot) * (trailWidth / 2) * i, y: weightEntity.location.y - 1, z: weightEntity.location.z + Math.cos(rot) * (trailWidth / 2) * i });
            if (block?.matches("grass_block")) block.setType("dirt");
        });

        if (trailType === "heavy") {
            for (let x = -trailWidth; x <= trailWidth; x++) {
                for (let z = -trailWidth; z <= trailWidth; z++) {
                    if (x * x + z * z > trailWidth * trailWidth) continue;

                    const block = weightEntity.dimension.getBlock({
                        x: weightEntity.location.x + x,
                        y: weightEntity.location.y - 1,
                        z: weightEntity.location.z + z
                    });

                    if (block?.matches("minecraft:ice")) {
                        block.setType("frosted_ice");
                    }
                }
            }
        }

    }
}
