import { world, system, Player } from '@minecraft/server';

const allowedItems = [
    { normal: 'krep:mp5',     empty: 'krep:mp5_emp',     key: 'krep_mp5'     },
    { normal: 'krep:vector',  empty: 'krep:vector_emp',  key: 'krep_vector'  },
    { normal: 'krep:g17',     empty: 'krep:g17_emp',     key: 'krep_g17'     },
    { normal: 'krep:akm',     empty: 'krep:akm_emp',     key: 'krep_akm'     },
    { normal: 'krep:m4a1',    empty: 'krep:m4a1_emp',    key: 'krep_m4a1'    },
    { normal: 'krep:hk416',   empty: 'krep:hk416_emp',   key: 'krep_hk416'   },
    { normal: 'krep:deagleg', empty: 'krep:deagleg_emp', key: 'krep_deagleg' },
    { normal: 'krep:db',      empty: 'krep:db_emp',      key: 'krep_db'      },
    { normal: 'krep:fal',     empty: 'krep:fal_emp',     key: 'krep_fal'     },
    { normal: 'krep:mk14',    empty: 'krep:mk14_emp',    key: 'krep_mk14'    },
    { normal: 'krep:qbz191',  empty: 'krep:qbz191_emp',  key: 'krep_qbz191'  }
];

export function getDynamicPropertyKey(typeId) {
    const entry = allowedItems.find(e => e.normal === typeId || e.empty === typeId);
    return entry ? entry.key : null;
}

export function isAllowed(typeId) {
    return allowedItems.some(e => e.normal === typeId || e.empty === typeId);
}

// Stores attachment indices as a comma-separated dynamic property: stock,grip,laser,muzzle,magazine
export function setAksesoris(player, weaponId, options = {}) {
    const key = getDynamicPropertyKey(weaponId);
    if (!key) return;

    const raw = player.getDynamicProperty(key)?.split(',') || [];
    const [s, g, l, m, mg] = raw.map(Number);

    const stock    = options.stock    ?? s  ?? 0;
    const grip     = options.grip     ?? g  ?? 0;
    const laser    = options.laser    ?? l  ?? 0;
    const muzzle   = options.muzzle   ?? m  ?? 0;
    const magazine = options.magazine ?? mg ?? 0;

    player.setDynamicProperty(key, `${stock},${grip},${laser},${muzzle},${magazine}`);
}

// Convenience method on Player prototype
Player.prototype.setAksesoris = function(weaponId, options) {
    setAksesoris(this, weaponId, options);
};

// Every 2 ticks: push attachment data from dynamic property → entity properties
// so animation controllers and resource packs can read them
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const equippable = player.getComponent('minecraft:equippable');
        const mainhand   = equippable.getEquipment('Mainhand');
        if (!mainhand?.typeId) continue;

        const typeId = mainhand.typeId;
        if (!isAllowed(typeId)) continue;

        const key = getDynamicPropertyKey(typeId);
        if (!key) continue;

        const raw = player.getDynamicProperty(key)?.split(',') || [];
        const [stock = 0, grip = 0, laser = 0, muzzle = 0, magazine = 0] = raw.map(Number);

        player.setProperty('krep:stock',    stock);
        player.setProperty('krep:grip',     grip);
        player.setProperty('krep:laser',    laser);
        player.setProperty('krep:muzzle',   muzzle);
        player.setProperty('krep:magazine', magazine);
    }
}, 2);
