class Vector3 {
    /**
     * Creates a Vector3 with the given x, y, and z components.
     * @param {number} x - X component of the Vector3.
     * @param {number} y - Y component of the Vector3.
     * @param {number} z - Z component of the Vector3.
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Adds two Vector3s.
     * @param {Vector3} v - The Vector3 to add.
     * @returns {Vector3} The result of the addition.
     */
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Subtracts one Vector3 from another.
     * @param {Vector3} v - The Vector3 to subtract.
     * @returns {Vector3} The result of the subtraction.
     */
    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * Multiplies the Vector3 by a scalar.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vector3} The result of the multiplication.
     */
    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    /**
     * Calculates the dot product of two Vector3s.
     * @param {Vector3} v - The Vector3 to calculate the dot product with.
     * @returns {number} The dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Calculates the magnitude (length) of the Vector3.
     * @returns {number} The magnitude of the Vector3.
     */
    magnitude() {
        return Math.sqrt(this.x * v.x + this.y * v.y + this.z * v.z);
    }

    /**
     * Normalizes the Vector3 (makes it have a magnitude of 1).
     * @returns {Vector3} The normalized Vector3.
     */
    normalize() {
        const mag = this.magnitude();
        return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }

    /**
     * Calculates the distance between two Vector3s.
     * @param {Vector3} v - The Vector3 to calculate the distance to.
     * @returns {number} The distance between the Vector3s.
     */
    distance(v) {
        return this.subtract(v).magnitude();
    }
}

// Exports the Vector3 class for use in other files.
export { Vector3 };
