import { system, world } from "@minecraft/server"
import { GeneralUtils } from "./utils.js"

// ----- Misc -----
import { clearPlayerCameraTick, addCustomCameras } from "camera.js"
import { missileEventTrigger, missileEntityTick } from "missile.js"
import { persistantEntityRotationTick } from "persistant_rotation.js"
import { commandStartupEvent } from "commands.js"
import { nukeEventTrigger } from "nuke.js"
import { radarEntityTick, clearEntityRadars } from "radar.js"

// ----- Vehicles -----
import { helicopterEntityTick } from "vehicle/helicopter.js"
import { groundEntityTick, groundHandleEntityLoad } from "vehicle/ground.js"
import { planeEntityTick } from "vehicle/plane.js"
import { turretEntityTick, turretHandleEntitySpawn } from "vehicle/turret.js"
import { colliderEntityTick, colliderSpawner, colliderDeath } from "vehicle/naval.js"
import { weightEntityTick } from "vehicle/weight.js"
import { droneEntityTick, droneEventTrigger } from "vehicle/drone.js"
import { vehicleFireProjectileEvent } from "vehicle/fire_projectile.js"

/**
* @param {Function} func
* @param {String[]} args
* @param {String} prefix
*/
function runWithCatch(func, args, prefix = "Error:\n") {
    try {
        func.apply(null, args)
    } catch (err) {
        system.run(() => {
            //world.sendMessage(prefix + err.message + "\n" + err.stack)
        })
    }
}

system.runInterval(() => {
    for (const dimensionName of GeneralUtils.world.dimensions) {
        const dimension = world.getDimension(dimensionName);
        const entities = dimension.getEntities();
        runWithCatch(clearEntityRadars, [entities], "Radar error:\n")

        for (const entity of entities) {
            const rideable = entity.getComponent("rideable");
            runWithCatch(radarEntityTick, [entity], "Radar error:\n");

            if (rideable) {
                runWithCatch(addCustomCameras, [entity, rideable], "Custom camera error:\n")
                runWithCatch(planeEntityTick, [entity, rideable], "Plane error:\n")
                runWithCatch(groundEntityTick, [entity, rideable], "Ground vehicle error:\n")
                runWithCatch(turretEntityTick, [entity, rideable], "Turret error:\n")
                runWithCatch(helicopterEntityTick, [entity, rideable], "Helicopter error:\n")
            }

            runWithCatch(persistantEntityRotationTick, [entity], "Persistant rotation error:\n")
            runWithCatch(colliderEntityTick, [entity], "Collider error:\n")
            runWithCatch(weightEntityTick, [entity], "Vehicle trails error:\n")
            runWithCatch(missileEntityTick, [entity], "Missile error:\n")
            runWithCatch(droneEntityTick, [entity], "Drone error:\n")
        }
    }

    for (const player of world.getAllPlayers()) {
        runWithCatch(clearPlayerCameraTick, [player], "Camera clear error:\n")
    }
}, 1)

// Turret
world.afterEvents.entitySpawn.subscribe(turretHandleEntitySpawn);

// Colliders
world.afterEvents.entitySpawn.subscribe(colliderSpawner);
world.afterEvents.entityDie.subscribe(colliderDeath)

// Missiles
world.afterEvents.dataDrivenEntityTrigger.subscribe(missileEventTrigger);
world.afterEvents.dataDrivenEntityTrigger.subscribe(vehicleFireProjectileEvent);

// Commands
system.beforeEvents.startup.subscribe(commandStartupEvent);

// Ground Vehicles
world.afterEvents.entityLoad.subscribe(groundHandleEntityLoad);

// Drones
world.afterEvents.dataDrivenEntityTrigger.subscribe(droneEventTrigger);

// Nukes
world.afterEvents.dataDrivenEntityTrigger.subscribe(nukeEventTrigger);

import "./constants.js";
