import { world, system, EasingType, Entity, EntityRideableComponent, Player, ItemUseAfterEvent } from "@minecraft/server"
import { GeneralUtils } from "utils.js"
console.error("§l§bCAMERA IS RUNING")
const CAMERA_WALL_BUFFER = 0.6; // margen para no dejar la cámara pegada al bloque
const CAMERA_RAY_STEP = 0.25; // tamaño de paso del sondeo manual (bloques)
const EFFECT_REFRESH_THRESHOLD = 4; // ticks restantes antes de refrescar efectos

/**
 * @param {Player} player - The player to clear the camera of
 */
export function clearPlayerCameraTick(player) {
    if (player.hasComponent("minecraft:riding")) {
        player.addTag("clear_camera_on_exit")
    }
    if (!player.hasComponent("minecraft:riding") && player.hasTag("clear_camera_on_exit")) {
        player.camera.clear()
        system.runTimeout(() => {
            player.removeTag("clear_camera_on_exit")
        }, 10)
    }
}

/**
 * Comprueba, paso a paso, si hay algún bloque sólido entre el origen y el
 * destino deseado de la cámara. Se usa un sondeo manual (en vez de un único
 * getBlockFromRay) porque el raycast nativo de la Scripting API es poco
 * fiable en rayos casi verticales u orientados a lo largo de los ejes
 * (justo el caso de mirar hacia arriba/abajo), y puede "atravesar" bloques
 * sin detectarlos, causando que la cámara se meta dentro de paredes/suelo.
 *
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {{x:number,y:number,z:number}} origin
 * @param {{x:number,y:number,z:number}} target
 * @returns {{x:number,y:number,z:number}}
 */
function getUnobstructedCameraLocation(dimension, origin, target) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const dz = target.z - origin.z;
    const distance = Math.hypot(dx, dy, dz);

    if (distance < 0.01) return target;

    const dirX = dx / distance, dirY = dy / distance, dirZ = dz / distance;

    let safeDistance = distance;

    // Sondeo manual: recorremos la línea origen->destino en pasos pequeños
    // y comprobamos si cada punto cae dentro de un bloque sólido.
    for (let d = CAMERA_RAY_STEP; d <= distance; d += CAMERA_RAY_STEP) {
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
            safeDistance = Math.max(0, d - CAMERA_WALL_BUFFER);
            break;
        }
    }

    let result = {
        x: origin.x + dirX * safeDistance,
        y: origin.y + dirY * safeDistance,
        z: origin.z + dirZ * safeDistance
    };

    // Salvaguarda final: si el origen mismo ya estaba pegado/dentro de un
    // bloque (esquinas, agachado, desniveles, etc.) y el resultado sigue
    // siendo sólido, vamos acercando el punto al origen hasta encontrar aire.
    try {
        let finalBlock = dimension.getBlock(result);
        let fallback = safeDistance;
        while (finalBlock?.isValid && !finalBlock.isAir && !finalBlock.isLiquid && fallback > 0) {
            fallback -= CAMERA_RAY_STEP;
            result = {
                x: origin.x + dirX * Math.max(0, fallback),
                y: origin.y + dirY * Math.max(0, fallback),
                z: origin.z + dirZ * Math.max(0, fallback)
            };
            finalBlock = dimension.getBlock(result);
        }
    } catch { }

    return result;
}

/**
 * Refresca un efecto solo si está por expirar, en vez de reaplicarlo cada tick.
 * @param {Player} player
 * @param {string} effectType
 * @param {number} amplifier
 */
function refreshEffectIfNeeded(player, effectType, amplifier) {
    const current = player.getEffect(effectType);
    if (current && current.duration > EFFECT_REFRESH_THRESHOLD) return;

    player.addEffect(effectType, 10, { amplifier, showParticles: false });
}

/**
 * @param {Entity} entity - The entity to add custom cameras to children
 * @param {EntityRideableComponent} rideable_component - The rideable component to use
 * @param {{easeTime: number, easeType: EasingType}} easeOptions - The ease options to use for custom cameras
 */
export function addCustomCameras(entity, rideable_component, easeOptions = { easeTime: 0.2, easeType: EasingType.InOutCirc }) {
    const distance = entity.getProperty("af:camera.distance");
    if (!distance) return;

    const turretDistance = entity.getProperty("af:turret.camera.distance") ?? 3;
    const turretHeightOffset = entity.getProperty("af:turret.camera.height-offset") ?? 2;
    const heightOffset = (entity.getProperty("af:camera.height-offset") ?? 0) + 3;
    const lookEndDeadzonePitch = entity.getProperty("af:camera.look-end-deadzone-pitch") ?? 40;
    const lookEndDeadzoneYaw = entity.getProperty("af:camera.look-end-deadzone-yaw") ?? -1;
    const easeTime = entity.getProperty("af:camera.ease-time");
    const firstPerson = entity.getDynamicProperty("af:first-person")

    if (easeTime) {
        easeOptions.easeTime = easeTime / 10;
    }

    const dimension = entity.dimension;

    for (const rider of rideable_component.getRiders()) {
        const player = GeneralUtils.world.getPlayerFromEntity(rider);
        if (!player) continue;

        let facingLocation = entity.location;

        const playerRotation = player.getRotation();

        let yaw = GeneralUtils.math.toRad(playerRotation.y);
        if (lookEndDeadzoneYaw >= 0) {
            yaw = GeneralUtils.math.toRad(GeneralUtils.math.clamp(playerRotation.y, -lookEndDeadzoneYaw, lookEndDeadzoneYaw));
        }

        let pitch = GeneralUtils.math.toRad(playerRotation.x + heightOffset);
        if (lookEndDeadzonePitch >= 0) {
            pitch = GeneralUtils.math.toRad(GeneralUtils.math.clamp(playerRotation.x, -lookEndDeadzonePitch, lookEndDeadzonePitch) + heightOffset);
        }

        let cameraLocation = GeneralUtils.math.vectors.calculateOrbitPosition(player.location, pitch + 0.1, yaw, distance, heightOffset);
        let cameraOrigin = player.getHeadLocation();

        const turretId = entity.getDynamicProperty("af:vehicle.turret_id");
        if (turretId) {
            const turret = world.getEntity(turretId)
            if (turret) {
                if (firstPerson) {
                    cameraLocation = GeneralUtils.math.vectors.calculateOrbitPosition(turret.location, -pitch, -yaw, turretDistance, turretHeightOffset)
                    cameraOrigin = turret.location;
                    facingLocation = GeneralUtils.math.vectors.vectorAdd(GeneralUtils.math.vectors.getForwardVector(turret.getRotation()), { x: 0, y: 0, z: 0 }, 100)
                } else {
                    facingLocation = {
                        x: turret.location.x + (-Math.sin(yaw) * Math.cos(pitch)) * 10000,
                        y: (turret.location.y + (-Math.sin(pitch)) * 10000) + heightOffset,
                        z: turret.location.z + (Math.cos(yaw) * Math.cos(pitch)) * 10000
                    }
                }
            }
        }

        if (player.hasTag("scopeview") && entity.getProperty("af:has_scopeview")) {

            const offsetX = (entity.getProperty("af:scope.camera.offset-x") ?? -10) / 10
            const offsetY = (entity.getProperty("af:scope.camera.offset-y") ?? 30) / 10
            const offsetZ = (entity.getProperty("af:scope.camera.offset-z") ?? 20) / 10

            let base = entity

            if (turretId) {
                const turret = world.getEntity(turretId)
                if (turret) {
                    base = turret
                }
            }

            const rotationSource = player.getRotation()

            const baseYawRad = GeneralUtils.math.toRad(base.getRotation().y)

            const rotatedOffset = {
                x: (offsetX * Math.cos(baseYawRad)) - (offsetZ * Math.sin(baseYawRad)),
                y: offsetY,
                z: (offsetX * Math.sin(baseYawRad)) + (offsetZ * Math.cos(baseYawRad))
            }

            cameraLocation = GeneralUtils.math.vectors.vectorAdd(
                base.location,
                rotatedOffset
            )
            cameraOrigin = base.location;

            const forward = GeneralUtils.math.vectors.getForwardVector(rotationSource)

            facingLocation = GeneralUtils.math.vectors.vectorAdd(
                cameraLocation,
                forward,
                10000
            )

            easeOptions = {
                easeTime: 0.4,
                easeType: EasingType.OutSine
            }
        }

        if (entity.getProperty("af:plane.speed")) {
            easeOptions = {
                easeTime: 0.6,
                easeType: EasingType.OutSine
            }
        }

        // Evita que la cámara atraviese paredes: recorta la posición si hay
        // un bloque sólido entre el origen (jugador/torreta/scope) y el punto calculado.
        cameraLocation = getUnobstructedCameraLocation(dimension, cameraOrigin, cameraLocation);

        const velocity = entity.getVelocity();

        facingLocation = {
            x: facingLocation.x + velocity.x,
            y: facingLocation.y + velocity.y,
            z: facingLocation.z + velocity.z
        }

        player.playAnimation("animation.player.invis")

        refreshEffectIfNeeded(player, "invisibility", 1);
        refreshEffectIfNeeded(player, "resistance", 10);
        refreshEffectIfNeeded(player, "fire_resistance", 10);
        refreshEffectIfNeeded(player, "water_breathing", 10);

        player.camera.setCamera("minecraft:free", {
            easeOptions: easeOptions,
            location: cameraLocation,
            facingLocation: facingLocation
        });
    }
}