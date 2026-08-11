import { world, Entity, Player } from "@minecraft/server"

// Vector2 y Vector3 fueron eliminados de @minecraft/server en 2.x+ estable.
// Se definen como typedefs locales solo para JSDoc.
/** @typedef {{ x: number, y: number }} Vector2 */
/** @typedef {{ x: number, y: number, z: number }} Vector3 */

export const GeneralUtils = {
    "math": {
        "vectors": {
            /**
             * @param {Vector3} orbitAround - The point to orbit around
             * @param {number} pitch - The pitch that the orbit is at in radians
             * @param {number} yaw - The yaw that the orbit is at in radian
             * @param {number} distance - The distance that the point is from the orbitAround location
             * @param {number} hieghtOffset - The hieght that the point is offset from the final camera location
             * @returns {Vector3} the output position
             */
            calculateOrbitPosition: (orbitAround = { x: 0, y: 0, z: 0 }, pitch = 0, yaw = 0, distance = 0, hieghtOffset = 0) => {
                return {
                    x: orbitAround.x - Math.sin(-yaw) * Math.cos(pitch) * distance,
                    y: (orbitAround.y + Math.sin(pitch) * distance) + hieghtOffset,
                    z: orbitAround.z - Math.cos(-yaw) * Math.cos(pitch) * distance
                };
            },
            clampVector: (vec, maxSpeed) => {
                const mag = Math.hypot(vec.x, vec.y, vec.z);
                if (mag > maxSpeed) {
                    const scale = maxSpeed / mag;
                    vec.x *= scale;
                    vec.y *= scale;
                    vec.z *= scale;
                }
                return vec;
            },
            /**
             * @param {Vector2} rotation - Pitch (x) and yaw (y) in degrees
             * @returns {Vector3} Forward unit vector
             */
            getForwardVector: (rotation) => {
                const pitch = GeneralUtils.math.toRad(rotation.x);
                const yaw = GeneralUtils.math.toRad(rotation.y);

                return {
                    x: -Math.sin(yaw) * Math.cos(pitch),
                    y: -Math.sin(pitch),
                    z: Math.cos(yaw) * Math.cos(pitch)
                };
            },
            /**
             * Adds two vectors together, optionally scaling the second vector
             * @param {Vector3} baseVector - The original vector
             * @param {Vector3} addVector - The vector to add
             * @param {number} multiply - A multiplier to scale addVector (default 1)
             * @returns {Vector3} - The resulting vector
             */
            vectorAdd: (baseVector, addVector, multiply = 1) => {
                return {
                    x: baseVector.x + (addVector.x * multiply),
                    y: baseVector.y + (addVector.y * multiply),
                    z: baseVector.z + (addVector.z * multiply)
                };
            }
        },
        /**
         * @param {number} value - The value to be clamped
         * @param {number} min - The lower clamp
         * @param {number} max - The upper clamp
         * @returns {number} the clamped angle
         */
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        /**
         * @param {number} value - The value (in degrees) to be turned into radians
         * @returns {number} angle in radians
         */
        toRad: (value) => value * Math.PI / 180,
        /**
         * @param {number} value - The value (in radians) to be turned into degrees
         * @returns {number} angle in degrees
         */
        toDeg: (value) => value * 180 / Math.PI,
        /**
         * @param {number} angle - The angle (in degrees) to be normalized
         * @returns {number} normalized angle
         */
        normalize: (angle) => ((angle + 180) % 360 + 360) % 360 - 180,
        /**
         * @param {number} value - The number to be lerped
         * @param {number} target - the target value
         * @param {number} amount - The amount it changes by
         * @returns {number} lerped value
         */
        lerp: (value, target, amount) => {
            if (value > target) value -= amount;
            else if (value < target) value += amount;
            if (Math.abs(value) <= amount) value = target
            return value;
        }
    },
    "world": {
        dimensions: ["overworld", "nether", "the_end"],
        /**
         * @param {Entity} entity - The entity to get player from
         * @returns {Player} the output player
         */
        getPlayerFromEntity: (entity) => entity ? world.getPlayers().find(p => p.id === entity.id) : undefined,
        /**
         * @param {Entity} entity
         * @param {Vector2} targetRot - Target pitch/yaw
         * @param {Vector2} turnSpeed - Degrees per second
         * @param {Vector2} forcedRotation - Extra rotation applied after clamping
         * @returns {Vector2} New rotation
         */
        rotateByEasedRotation: (entity, targetRot, turnSpeed = { x: 0, y: 0 }, forcedRotation = { x: 0, y: 0 }) => {
            const entityRotation = entity.getRotation();
            const currentRot = {
                x: entity.getDynamicProperty("af:eased-rotation.pitch") ?? entityRotation.x,
                y: entity.getDynamicProperty("af:eased-rotation.yaw") ?? entityRotation.y
            }

            if (!targetRot) return currentRot;

            let deltaX = GeneralUtils.math.normalize(targetRot.x - currentRot.x);
            let deltaY = GeneralUtils.math.normalize(targetRot.y - currentRot.y);

            deltaX = Math.abs(deltaX) > (turnSpeed.x / 20)
                ? (turnSpeed.x / 20) * Math.sign(deltaX)
                : deltaX;

            deltaY = Math.abs(deltaY) > (turnSpeed.y / 20)
                ? (turnSpeed.y / 20) * Math.sign(deltaY)
                : deltaY;

            const newPitch = currentRot.x + deltaX + forcedRotation.x;
            const newYaw = currentRot.y + deltaY + forcedRotation.y;

            entity.setDynamicProperties({
                "af:eased-rotation.pitch": Number.isFinite(newPitch) ? newPitch : currentRot.x,
                "af:eased-rotation.yaw": Number.isFinite(newYaw) ? newYaw : currentRot.y
            })

            return {
                x: Number.isFinite(newPitch) ? newPitch : currentRot.x,
                y: Number.isFinite(newYaw) ? newYaw : currentRot.y
            };
        }
    }
}