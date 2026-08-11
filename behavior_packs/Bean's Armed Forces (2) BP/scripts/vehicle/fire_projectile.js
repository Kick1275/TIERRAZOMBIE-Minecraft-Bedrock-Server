import { InvalidEntityError } from "@minecraft/server";
import { GeneralUtils } from "../utils.js";

const FIRE_EVENTS = {
    "af:fire_ap_m1a1": { projectile: "af:ap_shell", event: "af:m1a1", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_he_m1a1": { projectile: "af:he_shell", event: "af:m1a1", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_ap_t72a": { projectile: "af:ap_shell", event: "af:t72a", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_he_t72a": { projectile: "af:he_shell", event: "af:t72a", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_ap_m551": { projectile: "af:ap_shell", event: "af:m551", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 3 },
    "af:fire_he_m551": { projectile: "af:he_shell", event: "af:m551", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 3 },
    "af:fire_ap_m114": { projectile: "af:ap_shell", event: "af:m114", originalEvent: "af:shot_fired", offset: [0, 2, 6], speed: 3 },
    "af:fire_he_m114": { projectile: "af:he_shell", event: "af:m114", originalEvent: "af:shot_fired", offset: [0, 2, 6], speed: 3 },
    "af:fire_ap_m2a2": { projectile: "af:ap_shell", event: "af:m2a2", originalEvent: "af:AC_fired", offset: [0, 3, 7], speed: 6 },
    "af:fire_he_m2a2": { projectile: "af:he_shell", event: "af:m2a2", originalEvent: "af:AC_fired", offset: [0, 3, 7], speed: 6 },
    "af:fire_ap_bmpt72": { projectile: "af:ap_shell", shots: [{ event: "af:bmpt72_1", offset: [-0.35, 3, 7] }, { event: "af:bmpt72_2", offset: [0.35, 3, 7] }], originalEvent: "af:AC_fired", offset: [0, 3, 7], speed: 6 },
    "af:fire_he_bmpt72": { projectile: "af:he_shell", shots: [{ event: "af:bmpt72_1", offset: [-0.35, 3, 7] }, { event: "af:bmpt72_2", offset: [0.35, 3, 7] }], originalEvent: "af:AC_fired", offset: [0, 3, 7], speed: 6 },
    "af:fire_ap_2s38": { projectile: "af:ap_shell", event: "af:2s38", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_he_2s38": { projectile: "af:he_shell", event: "af:2s38", originalEvent: "af:shot_fired", offset: [0.1, 2, 8], speed: 6 },
    "af:fire_bullet_m1a1": { projectile: "af:bullet", event: "af:m1a1", offset: [-0.2, 2.5, 6], speed: 6 },
    "af:fire_bullet_m551": { projectile: "af:bullet", event: "af:m551", offset: [-0.2, 2.5, 6], speed: 3 },
    "af:fire_bullet_m1151": { projectile: "af:bullet", event: "af:m1151", originalEvent: "af:MG_fired", offset: [0, 2.5, 6], speed: 6 },
    "af:fire_bullet_mounted_gun": { projectile: "af:bullet", event: "af:mounted_gun", originalEvent: "af:MG_fired", offset: [0, 0.8, 3], speed: 6, pitchOffset: -10 },
    "af:fire_bullet_plane": { projectile: "af:bullet", event: "af:plane", offset: [0, 1.5, 8], speed: 6, pitchOffset: 5 },
    "af:fire_bullet_a10": { projectile: "af:bullet", event: "af:a10", offset: [0, 1, 8], speed: 5 },
    "af:fire_bullet_strb90h": { projectile: "af:bullet", event: "af:strb90h", offset: [0, 3.5, 6], speed: 6 },
    "af:fire_hydra_m142": { projectile: "af:hydra_rocket", event: "af:m142", originalEvent: "af:shot_fired", offset: [0, 2, 8], speed: 5 },
    "af:fire_hydra_plane": { projectile: "af:hydra_rocket", event: "af:plane", originalEvent: "af:rocket_fired", offset: [0, 0.5, 8], speed: 5 },
    "af:fire_range_m142": { projectile: "af:rangefind_projectile", event: "af:m142", originalEvent: "af:rangefind", offset: [0, 2, 8], speed: 5 },
    "af:fire_range_m114": { projectile: "af:rangefind_projectile", event: "af:m114", originalEvent: "af:rangefind", offset: [0, 2, 6], speed: 3 },
    "af:fire_smoke_vehicle": { projectile: "af:thrown_grenade_smoke", event: "af:vehicle", offset: [0, 2, 5], speed: 1.2, up: 0.6 }
};

const SPAWN_CLEARANCE = 0.3; // margen para no dejar el proyectil pegado/dentro del bloque
const SPAWN_RAY_STEP = 0.25; // tamaño de paso del sondeo manual

function getRightVector(rotation) {
    const yaw = GeneralUtils.math.toRad(rotation.y);
    return {
        x: Math.cos(yaw),
        y: 0,
        z: Math.sin(yaw)
    };
}

function getSpawnLocation(entity, rotation, offset) {
    const right = getRightVector(rotation);
    const forward = GeneralUtils.math.vectors.getForwardVector({ x: 0, y: rotation.y });
    let location = GeneralUtils.math.vectors.vectorAdd(entity.location, right, offset[0]);
    location = GeneralUtils.math.vectors.vectorAdd(location, { x: 0, y: 1, z: 0 }, offset[1]);
    return GeneralUtils.math.vectors.vectorAdd(location, forward, offset[2]);
}

/**
 * Comprueba, paso a paso, si hay un bloque sólido entre el vehículo y el
 * punto de aparición calculado para el proyectil. Si lo hay, recorta la
 * posición de spawn justo antes de ese bloque, para que el proyectil nazca
 * fuera de la pared y colisione con ella de forma natural en vez de
 * aparecer directamente dentro/detrás de ella.
 *
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {{x:number,y:number,z:number}} origin
 * @param {{x:number,y:number,z:number}} target
 * @returns {{x:number,y:number,z:number}}
 */
function getSafeSpawnLocation(dimension, origin, target) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const distance = Math.hypot(dx, dy, dz);

    if (distance < 0.01) return target;

    const dirX = dx / distance, dirY = dy / distance, dirZ = dz / distance;

    for (let d = SPAWN_RAY_STEP; d <= distance; d += SPAWN_RAY_STEP) {
        const point = {
            x: origin.x + dirX * d,
            y: origin.y + dirY * d,
            z: origin.z + dirZ * d
        };

        let block;
        try {
            block = dimension.getBlock(point);
        } catch {
            continue;
        }

        if (block?.isValid && !block.isAir && !block.isLiquid) {
            const safeDistance = Math.max(0, d - SPAWN_CLEARANCE);
            return {
                x: origin.x + dirX * safeDistance,
                y: origin.y + dirY * safeDistance,
                z: origin.z + dirZ * safeDistance
            };
        }
    }

    return target;
}

function fireSingleProjectile(source, config, eventId) {
    const rotation = source.getRotation();
    const offset = config.shotOffset ?? config.offset;
    const shotRotation = {
        x: rotation.x + (config.pitchOffset ?? 0),
        y: rotation.y
    };

    const intendedSpawn = getSpawnLocation(source, rotation, offset);
    const spawnLocation = getSafeSpawnLocation(source.dimension, source.location, intendedSpawn);

    const projectile = source.dimension.spawnEntity(
        config.projectile,
        spawnLocation
    );

    projectile.setRotation(shotRotation);
    if (config.projectile === "af:rangefind_projectile") {
        projectile.setDynamicProperty("af:rangefinder.source-id", source.id);
    }
    projectile.triggerEvent(eventId);

    const forward = GeneralUtils.math.vectors.getForwardVector(shotRotation);
    const velocity = GeneralUtils.math.vectors.vectorAdd({ x: 0, y: config.up ?? 0, z: 0 }, forward, config.speed);
    const projectileComponent = projectile.getComponent("minecraft:projectile");

    if (projectileComponent) projectileComponent.shoot(velocity);
    else projectile.applyImpulse(velocity);
}

function fireProjectile(source, config) {
    const shots = config.shots ?? (config.events ?? [config.event]).map(eventId => ({ event: eventId }));
    for (const shot of shots) {
        fireSingleProjectile(source, { ...config, shotOffset: shot.offset }, shot.event);
    }
    if (config.originalEvent) source.triggerEvent(config.originalEvent);
}

export function vehicleFireProjectileEvent(event) {
    const config = FIRE_EVENTS[event.eventId];
    if (!config) return;

    try {
        fireProjectile(event.entity, config);
    } catch (err) {
        if (!(err instanceof InvalidEntityError)) throw err;
    }
}