/**
 *
 * @typedef {Object} GunProperties
 * @property {string} item - The name of the item to be used.
 * @property {string} event - Event triggered when a player starts using the item (must be defined in `player.json`).
 * @property {string} sound - Sound of the gun when in use.
 * @property {string} soundDistant - Distant sound of the gun when in use.
 * @property {boolean} muzzle - Indicates if the gun has a muzzle flash (true = Enabled, false = Disabled).
 * @property {number} fireRate - Delay between uses of the item (normal value is 1; must include `minecraft:cooldown` on the item). Warning: setting below 0.5-0.9 will cause durability to decrease at twice the rate.
 * @property {number} durability - Displays the number of rounds remaining. The item must have durability; otherwise, [undefined/undefined] will be shown in the UI.
 * @property {string} empty - Specifies the item to switch to when durability is zero or maxed out.
 * @property {string} type - Type of firearm (e.g., "heavy_guns" or "light_guns"), which also determines if it attracts infected when used.
 * @property {string} soundEmpty - Sound played when ammo is depleted, such as the "Ping" from the M1 Garand.
 * @property {boolean} isGunMeleeWeapon - Feature not yet defined.
 * @property {string} soundInDoor - Sound of the gun when fired indoors.
 * @property {string} soundInDoorDistant - Distant sound of the gun when fired indoors.
 *
 */

/** @type {{ [key: string]: GunProperties }} */
export const GUN_PROPERTIES = {
    "mcpe:ak47": {
    	'type': "heavy_guns",
        'event': "ak47:fire",
        'sound': "gun.ak47",
        'soundDistant': "distant.ak47",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:ak47_emp"
    },
    "mcpe:ak74": {
    	'type': "heavy_guns",
        'event': "ak74:fire",
        'sound': "gun.ak74",
        'soundDistant': "distant.ak74",
        'soundInDoor': 'gun.indoor',
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:ak74_emp"
    },
    "mcpe:aks74u": {
    	'type': "heavy_guns",
        'event': "aks74u:fire",
        'sound': "gun.aks74u",
        'soundDistant': "distant.aks74u",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:aks74u_emp"
    },
    "mcpe:anaconda": {
    	'type': "heavy_guns",
        'event': "anaconda:fire",
        'sound': "gun.anaconda",
        'soundDistant': "distant.anaconda",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 6,
        'empty': "mcpe:anaconda_emp"
    },
    "mcpe:asval": {
        'event': "asval:fire",
        'sound': "gun.asval",
        'muzzle': false,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 20,
        'empty': "mcpe:asval_emp"
    },
    "mcpe:cz527": {
    	'type': "heavy_guns",
        'event': "cz527:fire",
        'sound': "gun.cz527",
        'soundDistant': "distant.cz527",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': false,
        'fireRate': 1.5,
        'durability': 5,
        'empty': "mcpe:cz527_emp"
    },
    "mcpe:fal": {
    	'type': "heavy_guns",
        'event': "fal:fire",
        'sound': "gun.fal",
        'soundDistant': "distant.fal",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 20,
        'empty': "mcpe:fal_emp"
    },
    "mcpe:famas": {
    	'type': "heavy_guns",
        'event': "famas:fire",
        'sound': "gun.famas",
        'soundDistant': "distant.famas",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 25,
        'empty': "mcpe:famas_emp"
    },
    "mcpe:garand": {
    	'type': "light_guns",
        'event': "garand:fire",
        'sound': "gun.garand",
        'soundDistant': "distant.garand",
        'soundEmpty': "gun.ping",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1.9,
        'durability': 8,
        'empty': "mcpe:garand_emp"
    },
    "mcpe:glock17": {
    	'type': "light_guns",
        'event': "glock17:fire",
        'sound': "gun.glock17",
        'soundDistant': "distant.glock17",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 15,
        'empty': "mcpe:glock17_emp"
    },
    "mcpe:izh43": {
    	'type': "light_guns",
        'event': "izh43:fire",
        'sound': "gun.izh43",
        'soundDistant': "distant.izh43",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 2,
        'durability': 2,
        'empty': "mcpe:izh43_emp"
    },
    "mcpe:l96a1": {
    	'type': "heavy_guns",
        'event': "l96a1:fire",
        'sound': "gun.l96a1",
        'soundDistant': "distant.l96a1",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 2,
        'durability': 10,
        'empty': "mcpe:l96a1_emp"
    },
    "mcpe:m4a1": {
    	'type': "heavy_guns",
        'event': "m4a1:fire",
        'sound': "gun.m4a1",
        'soundDistant': "distant.m4a1",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:m4a1_emp"
    },
    "mcpe:m14": {
    	'type': "light_guns",
        'event': "m14:fire",
        'sound': "gun.m14",
        'soundDistant': "distant.m14",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1.85,
        'durability': 20,
        'empty': "mcpe:m14_emp"
    },
    "mcpe:m16a1": {
    	'type': "heavy_guns",
        'event': "m16a1:fire",
        'sound': "gun.m16a1",
        'soundDistant': "distant.m16a1",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:m16a1_emp"
    },
    "mcpe:m79": {
    	'type': "light_guns",
        'event': "m79:fire",
        'sound': "gun.m79",
        'soundDistant': "distant.m79",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1.5,
        'durability': 1,
        'empty': "mcpe:m79_emp"
    },
    "mcpe:m870": {
    	'type': "heavy_guns",
        'event': "m870:fire",
        'sound': "gun.m870",
        'soundDistant': "distant.m870",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 2.5,
        'durability': 8,
        'empty': "mcpe:m870_emp"
    },
    "mcpe:m1014": {
    	'type': "heavy_guns",
        'event': "m1014:fire",
        'sound': "gun.m1014",
        'soundDistant': "distant.m1014",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 3,
        'durability': 7,
        'empty': "mcpe:m1014_emp"
    },
    "mcpe:m1894c": {
    	'type': "heavy_guns",
        'event': "m1894c:fire",
        'sound': "gun.m1894c",
        'soundDistant': "distant.m1894c",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 10,
        'empty': "mcpe:m1894c_emp"
    },
    "mcpe:m1897": {
    	'type': "heavy_guns",
        'event': "m1897:fire",
        'sound': "gun.m1897",
        'soundDistant': "distant.m1897",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 2.5,
        'durability': 7,
        'empty': "mcpe:m1897_emp"
    },
    "mcpe:m1911": {
    	'type': "light_guns",
        'event': "m1911:fire",
        'sound': "gun.m1911",
        'soundDistant': "distant.m1911",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 7,
        'empty': "mcpe:m1911_emp"
    },
    "mcpe:makarov": {
    	'type': "light_guns",
        'event': "makarov:fire",
        'sound': "gun.makarov",
        'soundDistant': "distant.makarov",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 8,
        'empty': "mcpe:makarov_emp"
    },
    "mcpe:makarov_pb": {
        'event': "makarov_pb:fire",
        'sound': "gun.makarov_pb",
        'muzzle': false,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 8,
        'empty': "mcpe:makarov_pb_emp"
    },
    "mcpe:mosin": {
    	'type': "heavy_guns",
        'event': "mosin:fire",
        'sound': "gun.mosin",
        'soundDistant': "distant.mosin",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 5,
        'empty': "mcpe:mosin_emp"
    },
    "mcpe:mp5": {
    	'type': "heavy_guns",
        'event': "mp5:fire",
        'sound': "gun.mp5",
        'soundDistant': "distant.mp5",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:mp5_emp"
    },
    "mcpe:python": {
    	'type': "heavy_guns",
        'event': "python:fire",
        'sound': "gun.python",
        'soundDistant': "distant.python",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 6,
        'empty': "mcpe:python_emp"
    },
    "mcpe:rpk": {
    	'type': "heavy_guns",
        'event': "rpk:fire",
        'sound': "gun.rpk",
        'soundDistant': "distant.rpk",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 75,
        'empty': "mcpe:rpk_emp"
    },
    "mcpe:sks": {
    	'type': "light_guns",
        'event': "sks:fire",
        'sound': "gun.sks",
        'soundDistant': "distant.sks",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 10,
        'empty': "mcpe:sks_emp"
    },
    "mcpe:ss1": {
    	'type': "heavy_guns",
        'event': "ss1:fire",
        'sound': "gun.ss1",
        'soundDistant': "distant.ss1",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 30,
        'empty': "mcpe:ss1_emp"
    },
    "mcpe:l2a3": {
    	'type': "heavy_guns",
        'event': "l2a3:fire",
        'sound': "gun.l2a3",
        'soundDistant': "distant.l2a3",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 32,
        'empty': "mcpe:l2a3_emp"
    },
    "mcpe:svd": {
    	'type': "heavy_guns",
        'event': "svd:fire",
        'sound': "gun.svd",
        'soundDistant': "distant.svd",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 0.75,
        'durability': 10,
        'empty': "mcpe:svd_emp"
    },
    "mcpe:ump45": {
    	'type': "heavy_guns",
        'event': "ump45:fire",
        'sound': "gun.ump45",
        'soundDistant': "distant.ump45",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 25,
        'empty': "mcpe:ump45_emp"
    },
    "mcpe:vz65": {
    	'type': "light_guns",
        'event': "vz65:fire",
        'sound': "gun.vz65",
        'soundDistant': "distant.vz65",
        'soundInDoor': 'gun.indoor',
        'soundInDoorDistant': 'gun.indoor_distant',
        'muzzle': true,
        'isGunMeleeWeapon': true,
        'fireRate': 1,
        'durability': 20,
        'empty': "mcpe:vz65_emp"
    }
};