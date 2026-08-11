import { system, world, Dimension, DataDrivenEntityTriggerAfterEvent } from "@minecraft/server"
/** @typedef {{ x: number, y: number, z: number }} Vector3 */

/**
 * @param {Vector3} location
 * @param {Dimension} dimension
 * @param {Number} maxRadius
 * @param {String} blockId
 * @param {String} replacementId
 * @param {Number} radiusStep
 */
async function replaceBlocksOutward(location, dimension, maxRadius, blockId, replacementId, radiusStep = 1) {
    let currentRadius = 0;

    const task = system.runInterval(() => {
        if (currentRadius > maxRadius) {
            system.clearRun(task);
            return;
        }

        const r2 = currentRadius * currentRadius;
        const prevRadius = Math.max(0, currentRadius - radiusStep);
        const prevR2 = prevRadius * prevRadius;

        for (let x = -currentRadius; x <= currentRadius; x++) {
            for (let y = -currentRadius; y <= currentRadius; y++) {
                for (let z = -currentRadius; z <= currentRadius; z++) {

                    const d2 = x * x + y * y + z * z;
                    if (d2 > r2 || d2 <= prevR2) continue;

                    const block = dimension.getBlock({
                        x: location.x + x,
                        y: location.y + y,
                        z: location.z + z
                    });

                    if (block?.isValid && (blockId === "*" || block.typeId === blockId)) {
                        block.setType(replacementId);
                    }
                }
            }
        }

        currentRadius += radiusStep;
    }, 1);
}

/**
 * @param {Vector3} location
 * @param {Dimension} dimension
 * @param {Number} airRadius
 * @param {Number} fireRadius
 * @param {Number} grassRadius
 */
export function spawnNuke(location, dimension, airRadius, fireRadius, grassRadius, obsidianRadius) {
    replaceBlocksOutward(location, dimension, airRadius, "*", "minecraft:air")
    replaceBlocksOutward(location, dimension, fireRadius, "minecraft:air", "minecraft:fire")
    replaceBlocksOutward(location, dimension, grassRadius, "minecraft:grass_block", "af:wasteland_grass")
    replaceBlocksOutward(location, dimension, obsidianRadius, "minecraft:water", "minecraft:air")
}

/**
 * @param {DataDrivenEntityTriggerAfterEvent} event
 */
export function nukeEventTrigger(event) {
    const entity = event.entity;

    if (event.eventId == "af:nuke.explode") {
        const air = entity.getProperty(`af:nuke.air-radius`) ?? 16;
        const fire = entity.getProperty(`af:nuke.fire-radius`) ?? 32;
        const grass = entity.getProperty(`af:nuke.grass-radius`) ?? 64;
        const obsidian = entity.getProperty(`af:nuke.obsidian-radius`) ?? 64;
        if (!air || !fire || !grass) return;
        spawnNuke(entity.location, entity.dimension, air, fire, grass, obsidian)
    }
}