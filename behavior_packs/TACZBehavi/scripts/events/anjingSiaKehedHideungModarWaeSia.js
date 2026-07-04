import { system } from '@minecraft/server';
import { getDynamicPropertyKey } from './buahBuahApaYangBisaDigorengJawabanNyaJillKawir.js';

const recoilProfiles = {
    krep_mp5: {
        base: {
            hip: { power: 0.042, duration: 0.21 },
            ads: { power: 0.032, duration: 0.20 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.10, duration: 0.07 }, 3: { power: 0.08, duration: 0.08 }, 4: { power: 0.05, duration: 0.03 }, 5: { power: 0.04, duration: 0.06 }, 6: { power: 0.20, duration: -0.02 }, 7: { power: 0.03, duration: 0.04 }, 8: { power: 0.05, duration: 0.05 }, 9: { power: 0.09, duration: 0.03 }, 10: { power: 0.08, duration: 0.07 }, 11: { power: 0.05, duration: 0.06 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.05, duration: 0.08 }, 3: { power: 0.12, duration: -0.03 }, 4: { power: 0.06, duration: 0.04 }, 5: { power: 0.04, duration: 0.09 }, 6: { power: 0.05, duration: 0.05 }, 7: { power: 0.03, duration: 0.08 }, 8: { power: 0.06, duration: 0.09 }, 9: { power: 0.09, duration: 0.10 }, 10: { power: 0.02, duration: 0.10 }, 11: { power: 0.04, duration: 0.09 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0.05, duration: 0.02 }, 2: { power: 0.05, duration: 0.02 }, 3: { power: 0.10, duration: 0.04 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    },
    krep_akm: {
        base: {
            hip: { power: 0.042, duration: 0.30 },
            ads: { power: 0.032, duration: 0.28 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0, duration: 0 }, 2: { power: 0, duration: 0 }, 3: { power: 0, duration: 0 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.05, duration: 0.05 }, 2: { power: 0.09, duration: 0.11 }, 3: { power: 0.17, duration: 0.01 }, 4: { power: 0.06, duration: 0.04 }, 5: { power: 0.04, duration: 0.09 }, 6: { power: 0.05, duration: 0.10 }, 7: { power: 0.07, duration: 0.08 }, 8: { power: 0.06, duration: 0.09 }, 9: { power: 0.09, duration: 0.12 }, 10: { power: 0.02, duration: 0.13 }, 11: { power: 0.04, duration: 0.11 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0.08, duration: 0.05 }, 2: { power: 0.075, duration: 0.04 }, 3: { power: 0.13, duration: 0.05 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    },
    krep_fal: {
        base: {
            hip: { power: 0.042, duration: 0.36 },
            ads: { power: 0.038, duration: 0.32 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.10, duration: 0.07 }, 3: { power: 0.08, duration: 0.08 }, 4: { power: 0.05, duration: 0.03 }, 5: { power: 0.04, duration: 0.06 }, 6: { power: 0.12, duration: -0.02 }, 7: { power: 0.03, duration: 0.04 }, 8: { power: 0.05, duration: 0.05 }, 9: { power: 0.09, duration: 0.03 }, 10: { power: 0.08, duration: 0.07 }, 11: { power: 0.05, duration: 0.06 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.05, duration: 0.05 }, 2: { power: 0.09, duration: 0.11 }, 3: { power: 0.17, duration: 0.01 }, 4: { power: 0.06, duration: 0.04 }, 5: { power: 0.04, duration: 0.09 }, 6: { power: 0.05, duration: 0.10 }, 7: { power: 0.07, duration: 0.08 }, 8: { power: 0.06, duration: 0.09 }, 9: { power: 0.09, duration: 0.12 }, 10: { power: 0.02, duration: 0.13 }, 11: { power: 0.04, duration: 0.11 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0, duration: 0 }, 2: { power: 0, duration: 0 }, 3: { power: 0, duration: 0 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    },
    krep_m4a1: {
        base: {
            hip: { power: 0.035, duration: 0.25 },
            ads: { power: 0.025, duration: 0.23 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.10, duration: 0.07 }, 3: { power: 0.08, duration: 0.08 }, 4: { power: 0.05, duration: 0.03 }, 5: { power: 0.04, duration: 0.06 }, 6: { power: 0.12, duration: -0.02 }, 7: { power: 0.03, duration: 0.04 }, 8: { power: 0.05, duration: 0.05 }, 9: { power: 0.09, duration: 0.03 }, 10: { power: 0.08, duration: 0.07 }, 11: { power: 0.05, duration: 0.06 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.06, duration: 0.04 }, 2: { power: 0.04, duration: 0.09 }, 3: { power: 0.05, duration: 0.05 }, 4: { power: 0.03, duration: 0.08 }, 5: { power: 0.06, duration: 0.09 }, 6: { power: 0.09, duration: 0.10 }, 7: { power: 0.02, duration: 0.10 }, 8: { power: 0.04, duration: 0.09 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0.07, duration: 0.02 }, 2: { power: 0.05, duration: 0.07 }, 3: { power: 0.10, duration: 0.04 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    },
    krep_hk416: {
        base: {
            hip: { power: 0.045, duration: 0.25 },
            ads: { power: 0.035, duration: 0.23 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.10, duration: 0.07 }, 3: { power: 0.08, duration: 0.08 }, 4: { power: 0.05, duration: 0.03 }, 5: { power: 0.04, duration: 0.06 }, 6: { power: 0.12, duration: -0.02 }, 7: { power: 0.03, duration: 0.04 }, 8: { power: 0.05, duration: 0.05 }, 9: { power: 0.09, duration: 0.03 }, 10: { power: 0.08, duration: 0.07 }, 11: { power: 0.05, duration: 0.06 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.06, duration: 0.04 }, 2: { power: 0.04, duration: 0.09 }, 3: { power: 0.05, duration: 0.05 }, 4: { power: 0.03, duration: 0.08 }, 5: { power: 0.06, duration: 0.09 }, 6: { power: 0.09, duration: 0.10 }, 7: { power: 0.02, duration: 0.10 }, 8: { power: 0.04, duration: 0.09 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0.07, duration: 0.02 }, 2: { power: 0.05, duration: 0.07 }, 3: { power: 0.10, duration: 0.04 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    },
    krep_vector: {
        base: {
            hip: { power: 0.026, duration: 0.17 },
            ads: { power: 0.022, duration: 0.15 }
        },
        modifier: {
            grip:   { 0: { power: 0, duration: 0 }, 1: { power: 0.05, duration: 0.03 }, 2: { power: 0.04, duration: 0.06 }, 3: { power: 0.20, duration: -0.02 }, 4: { power: 0.03, duration: 0.04 }, 5: { power: 0.05, duration: 0.05 }, 6: { power: 0.09, duration: 0.03 }, 7: { power: 0.08, duration: 0.04 }, 8: { power: 0.05, duration: 0.06 } },
            stock:  { 0: { power: 0, duration: 0 }, 1: { power: 0.03, duration: 0.05 }, 2: { power: 0.05, duration: 0.08 }, 3: { power: 0.12, duration: -0.03 }, 4: { power: 0.06, duration: 0.04 }, 5: { power: 0.04, duration: 0.07 }, 6: { power: 0.05, duration: 0.05 }, 7: { power: 0.03, duration: 0.07 }, 8: { power: 0.06, duration: 0.05 }, 9: { power: 0.09, duration: 0.05 }, 10: { power: 0.02, duration: 0.06 }, 11: { power: 0.04, duration: 0.06 } },
            muzzle: { 0: { power: 0, duration: 0 }, 1: { power: 0.05, duration: 0 }, 2: { power: 0.05, duration: 0 }, 3: { power: 0.10, duration: 0 }, 4: { power: 0, duration: 0 }, 5: { power: 0, duration: 0 }, 6: { power: 0, duration: 0 }, 7: { power: 0, duration: 0 }, 8: { power: 0, duration: 0 }, 9: { power: 0, duration: 0 }, 10: { power: 0, duration: 0 }, 11: { power: 0, duration: 0 } }
        }
    }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function parseAttachmentData(data) {
    if (!data) return [0, 0, 0, 0, 0];
    return data.split(',').map(v => parseInt(v) || 0);
}

function calculateRecoil(profile, attachments = {}) {
    let powerMod = 0, durationMod = 0;
    for (const type in attachments) {
        const idx = clamp(attachments[type], 0, 11);
        const mod = profile.modifier?.[type]?.[idx] ?? { power: 0, duration: 0 };
        powerMod    += mod.power;
        durationMod += mod.duration;
    }
    return {
        hip: {
            power:    profile.base.hip.power    * (1 - powerMod),
            duration: profile.base.hip.duration * (1 - durationMod)
        },
        ads: {
            power:    profile.base.ads.power    * (1 - powerMod),
            duration: profile.base.ads.duration * (1 - durationMod)
        }
    };
}

function applyRecoil(player, isADS = false) {
    const mainhand  = player.getComponent('minecraft:equippable')?.getEquipment('Mainhand');
    const weaponId  = mainhand?.typeId;
    if (!weaponId) return;

    const profileKey = getDynamicPropertyKey(weaponId);
    if (!profileKey || !recoilProfiles[profileKey]) return;

    const data = player.getDynamicProperty(profileKey);
    const [stock = 0, grip = 0, laser = 0, muzzle = 0, magazine = 0] = parseAttachmentData(data);

    const recoil = calculateRecoil(recoilProfiles[profileKey], { stock, grip, muzzle });
    const mode   = isADS ? recoil.ads : recoil.hip;

    const cmd = `camerashake add @s[r=0.5] ${mode.power.toFixed(3)} ${mode.duration.toFixed(2)} rotational`;
    player.runCommandAsync(cmd).catch(() => {
        player.sendMessage('Gagal apply recoil shake.');
    });
}

system.afterEvents.scriptEventReceive.subscribe(event => {
    const entity = event.sourceEntity ?? event.initiator;
    if (!entity || typeof entity.getComponent !== 'function') return;

    if (event.id === 'recoil:hip') {
        applyRecoil(entity, false);
    } else if (event.id === 'recoil:ads') {
        applyRecoil(entity, true);
    }
});
