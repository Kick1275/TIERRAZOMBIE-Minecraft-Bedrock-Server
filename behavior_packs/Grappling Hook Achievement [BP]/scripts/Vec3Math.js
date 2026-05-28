/**
 * @class Vec3Math by Carchi77
 * @ Use math operations for x, y, z coordinates without accessing each object property individually
 */
export class Vec3Math {
    /**
     * Adds two Vector3 objects's values into one.
     * @param {Vector3} [loc1] First location
     * @param {Vector3} [loc2] Second location
     * @return {Vector3} A new vec3 => The sum of loc1 and loc2
     */
    static add(loc1, loc2) {
        return {
            x: loc1.x + loc2.x,
            y: loc1.y + loc2.y,
            z: loc1.z + loc2.z
        };
    };
    /**
     * Subtracts the second Vector3 object values from the first.
     * @param {Vector3} [loc1] First location
     * @param {Vector3} [loc2] Second location
     * @return {Vector3} A new vec3 => The result of subtracting loc2 from loc1
     */
    static subtract(loc1, loc2) {
        return {
            x: loc1.x - loc2.x,
            y: loc1.y - loc2.y,
            z: loc1.z - loc2.z
        };
    };
    /**
     * Floors each component of the given Vector3.
     * @param {Vector3} [location] Location to floor
     * @return {Vector3} The floored coordinates
     */
    static floor(location) {
        return {
            x: Math.floor(location.x),
            y: Math.floor(location.y),
            z: Math.floor(location.z)
        };
    };
    /**
     * Returns the absolute value of each component of the given Vector3.
     * @param {Vector3} [location] Location to get the absolute values for
     * @return {Vector3} The absolute values of each coordinate
     */
    static abs(location) {
        return {
            x: Math.abs(location.x),
            y: Math.abs(location.y),
            z: Math.abs(location.z)
        };
    };
    /**
     * Rounds each component of the given Vector3.
     * @param {Vector3} [location] Location to round
     * @return {Vector3} The rounded coordinates
     */
    static round(location) {
        return {
            x: Math.round(location.x),
            y: Math.round(location.y),
            z: Math.round(location.z)
        };
    };
    /**
     * Finds the maximum value for each component from an array of Vector3 objects.
     * @param {Vector3[]} [locations] Array of locations
     * @return {Vector3} The maximum values of x, y, and z components
     */
    static max(locations) {
        const maxX = Math.max(...locations.map(loc => loc.x));
        const maxY = Math.max(...locations.map(loc => loc.y));
        const maxZ = Math.max(...locations.map(loc => loc.z));
        return { x: maxX, y: maxY, z: maxZ };
    };
    /**
     * Finds the minimum value for each component from an array of Vector3 objects.
     * @param {Vector3[]} [locations] Array of locations
     * @return {Vector3} The minimum values of x, y, and z components
     */
    static min(locations) {
        const minX = Math.min(...locations.map(loc => loc.x));
        const minY = Math.min(...locations.map(loc => loc.y));
        const minZ = Math.min(...locations.map(loc => loc.z));
        return { x: minX, y: minY, z: minZ };
    };
}