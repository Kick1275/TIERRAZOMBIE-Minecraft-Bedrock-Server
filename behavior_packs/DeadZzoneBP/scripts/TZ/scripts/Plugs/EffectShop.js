console.warn("Tienda de Efectos cargada correctamente");
import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// Sistema de traducción
const translations = {
    es: {
        title: "§d✨ Tienda de Efectos",
        welcome: "¡Bienvenido",
        stats_header: "━━━━━━━━━━━━━━━━━━━━━━",
        experience: ":armor: §lExperiencia: §r§a",
        passcoins: " §lPasscoins: §r§b",
        rubies: ":heart: §lRubies: §r§c",
        money: ":token: §lMonedas: §r§e",
        back: "§cVolver",
        buy_with_gems: "§cComprar con Gemas",
        buy_with_money: "§eComprar con Monedas",
        equip: "§aEquipar",
        unequip: "§cDesequipar",
        owned: "§a✓ Poseído",
        equipped: "§b⚡ Equipado",
        purchase_success: "§a¡Efecto comprado exitosamente!",
        purchase_failed: "§cNo tienes suficientes recursos",
        equipped_success: "§a¡Efecto equipado!",
        unequipped_success: "§c¡Efecto desequipado!",
        particle_speed: "Velocidad de Partículas",
        speed_slow: "Lenta",
        speed_normal: "Normal",
        speed_fast: "Rápida",
        speed_ultra: "Ultra Rápida",
        speed_changed: "§aVelocidad de partículas cambiada a:",
        effects: {
            walking_particles: {
                name: "Partículas al Caminar",
                description: "Deja un rastro de partículas mágicas mientras caminas"
            },
            circle_aura: {
                name: "Aura Circular",
                description: "Un círculo de partículas que te rodea constantemente"
            },
            fire_feet: {
                name: "Pies de Fuego",
                description: "Círculo de fuego que rodea tus pies"
            },
            rainbow_trail: {
                name: "Rastro Arcoíris",
                description: "Un hermoso rastro de colores que te sigue"
            },
            lightning_aura: {
                name: "Aura de Rayo",
                description: "Chispas eléctricas que danzan a tu alrededor"
            },
            ice_crystals: {
                name: "Cristales de Hielo",
                description: "Cristales de hielo flotando alrededor tuyo"
            },
            blood_drops: {
                name: "Gotas de Sangre",
                description: "Gotas de sangre que caen a tu alrededor"
            },
            golden_sparkles: {
                name: "Destellos Dorados",
                description: "Partículas doradas que brillan intensamente"
            },
            dark_smoke: {
                name: "Humo Oscuro",
                description: "Humo negro que emana de tu cuerpo"
            },
            heart_particles: {
                name: "Corazones Flotantes",
                description: "Pequeños corazones que flotan a tu alrededor"
            },
            soul_flames: {
                name: "Llamas del Alma",
                description: "Llamas espectrales azules que te envuelven"
            },
            poison_cloud: {
                name: "Nube Tóxica",
                description: "Una nube venenosa que te sigue"
            },
            magic_spiral: {
                name: "Espiral Mágica",
                description: "Un portal mágico que gira a tu alrededor"
            },
            dragon_breath: {
                name: "Aliento de Dragón",
                description: "Partículas de aliento de dragón te rodean"
            },
            cherry_petals: {
                name: "Pétalos de Cerezo",
                description: "Hermosos pétalos rosados caen a tu alrededor"
            },
            void_energy: {
                name: "Energía del Vacío",
                description: "Energía oscura del End te envuelve"
            },
            water_drops: {
                name: "Gotas de Agua",
                description: "Gotas de agua cristalina caen constantemente"
            },
            star_dust: {
                name: "Polvo de Estrellas",
                description: "Polvo estelar brillante flota a tu alrededor"
            }
        }
    },
    en: {
        title: "§d✨ Effects Shop",
        welcome: "Welcome",
        stats_header: "━━━━━━━━━━━━━━━━━━━━━━",
        experience: ":armor: §lExperience: §r§a",
        passcoins: " §lPasscoins: §r§b",
        rubies: ":heart: §lRubies: §r§c",
        money: ":token: §lCoins: §r§e",
        back: "§cBack",
        buy_with_gems: "§cBuy with Gems",
        buy_with_money: "§eBuy with Coins",
        equip: "§aEquip",
        unequip: "§cUnequip",
        owned: "§a✓ Owned",
        equipped: "§b⚡ Equipped",
        purchase_success: "§aEffect purchased successfully!",
        purchase_failed: "§cYou don't have enough resources",
        equipped_success: "§aEffect equipped!",
        unequipped_success: "§cEffect unequipped!",
        particle_speed: "Particle Speed",
        speed_slow: "Slow",
        speed_normal: "Normal",
        speed_fast: "Fast",
        speed_ultra: "Ultra Fast",
        speed_changed: "§aParticle speed changed to:",
        effects: {
            walking_particles: {
                name: "Walking Particles",
                description: "Leave a trail of magical particles while walking"
            },
            circle_aura: {
                name: "Circle Aura",
                description: "A circle of particles that constantly surrounds you"
            },
            fire_feet: {
                name: "Fire Feet",
                description: "Circle of fire surrounding your feet"
            },
            rainbow_trail: {
                name: "Rainbow Trail",
                description: "A beautiful trail of colors that follows you"
            },
            lightning_aura: {
                name: "Lightning Aura",
                description: "Electric sparks dancing around you"
            },
            ice_crystals: {
                name: "Ice Crystals",
                description: "Ice crystals floating around you"
            },
            blood_drops: {
                name: "Blood Drops",
                description: "Blood drops falling around you"
            },
            golden_sparkles: {
                name: "Golden Sparkles",
                description: "Golden particles that shine intensely"
            },
            dark_smoke: {
                name: "Dark Smoke",
                description: "Black smoke emanating from your body"
            },
            heart_particles: {
                name: "Floating Hearts",
                description: "Small hearts floating around you"
            },
            soul_flames: {
                name: "Soul Flames",
                description: "Spectral blue flames surrounding you"
            },
            poison_cloud: {
                name: "Poison Cloud",
                description: "A toxic cloud that follows you"
            },
            magic_spiral: {
                name: "Magic Spiral",
                description: "A magical portal spinning around you"
            },
            dragon_breath: {
                name: "Dragon Breath",
                description: "Dragon breath particles surround you"
            },
            cherry_petals: {
                name: "Cherry Petals",
                description: "Beautiful pink petals falling around you"
            },
            void_energy: {
                name: "Void Energy",
                description: "Dark energy from the End envelops you"
            },
            water_drops: {
                name: "Water Drops",
                description: "Crystal water drops constantly falling"
            },
            star_dust: {
                name: "Star Dust",
                description: "Shining stellar dust floating around you"
            }
        }
    }
};

// Configuración de efectos con precios
const effectsConfig = {
    walking_particles: {
        id: "walking_particles",
        gemPrice: 50,
        moneyPrice: 1000,
        particle: "minecraft:heart_particle",
        icon: "textures/ui/heart.png"
    },
    circle_aura: {
        id: "circle_aura",
        gemPrice: 75,
        moneyPrice: 1500,
        particle: "minecraft:villager_happy",
        icon: "textures/ui/enchant.png"
    },
    fire_feet: {
        id: "fire_feet",
        gemPrice: 100,
        moneyPrice: 2000,
        particle: "minecraft:basic_flame_particle",
        icon: "textures/ui/fire.png"
    },
    rainbow_trail: {
        id: "rainbow_trail",
        gemPrice: 125,
        moneyPrice: 2500,
        particle: "minecraft:sculk_sensor_redstone_particle",
        icon: "textures/ui/rainbow.png"
    },
    lightning_aura: {
        id: "lightning_aura",
        gemPrice: 150,
        moneyPrice: 3000,
        particle: "minecraft:blue_flame_particle",
        icon: "textures/ui/lightning.png"
    },
    ice_crystals: {
        id: "ice_crystals",
        gemPrice: 90,
        moneyPrice: 1800,
        particle: "minecraft:snowflake_particle",
        icon: "textures/ui/snowflake.png"
    },
    blood_drops: {
        id: "blood_drops",
        gemPrice: 200,
        moneyPrice: 4000,
        particle: "minecraft:redstone_repeater_dust_particle",
        icon: "textures/ui/redstone.png"
    },
    golden_sparkles: {
        id: "golden_sparkles",
        gemPrice: 175,
        moneyPrice: 3500,
        particle: "minecraft:eyeblossom_open",
        icon: "textures/ui/gold.png"
    },
    dark_smoke: {
        id: "dark_smoke",
        gemPrice: 80,
        moneyPrice: 1600,
        particle: "minecraft:campfire_smoke_particle",
        icon: "textures/ui/smoke.png"
    },
    heart_particles: {
        id: "heart_particles",
        gemPrice: 60,
        moneyPrice: 1200,
        particle: "minecraft:heart_particle",
        icon: "textures/ui/heart_full.png"
    },
    soul_flames: {
        id: "soul_flames",
        gemPrice: 180,
        moneyPrice: 3600,
        particle: "minecraft:soul_fire_flame_particle",
        icon: "textures/ui/soul.png"
    },
    poison_cloud: {
        id: "poison_cloud",
        gemPrice: 110,
        moneyPrice: 2200,
        particle: "minecraft:villager_angry",
        icon: "textures/ui/poison.png"
    },
    magic_spiral: {
        id: "magic_spiral",
        gemPrice: 220,
        moneyPrice: 4400,
        particle: "minecraft:firefly_particle",
        icon: "textures/ui/portal.png"
    },
    dragon_breath: {
        id: "dragon_breath",
        gemPrice: 300,
        moneyPrice: 6000,
        particle: "minecraft:eyeofender_death_explode_particle",
        icon: "textures/ui/dragon.png"
    },
    cherry_petals: {
        id: "cherry_petals",
        gemPrice: 95,
        moneyPrice: 1900,
        particle: "minecraft:cherry_leaves_particle",
        icon: "textures/ui/cherry.png"
    },
    void_energy: {
        id: "void_energy",
        gemPrice: 250,
        moneyPrice: 5000,
        particle: "minecraft:magic_critical_hit_emitter",
        icon: "textures/ui/void.png"
    },
    water_drops: {
        id: "water_drops",
        gemPrice: 70,
        moneyPrice: 1400,
        particle: "minecraft:water_drip_particle",
        icon: "textures/ui/water.png"
    },
    star_dust: {
        id: "star_dust",
        gemPrice: 160,
        moneyPrice: 3200,
        particle: "minecraft:firefly_particle",
        icon: "textures/ui/star.png"
    }
};

// Función para obtener el idioma del jugador
function getPlayerLanguage(player) {
    return player.hasTag("lang_es_ES") ? "es" : "en";
}

// Función para obtener estadísticas del jugador desde scoreboard
function getPlayerStats(player) {
    try {
        // Obtener desde scoreboard (sistema real del servidor)
        const xpScore = world.scoreboard.getObjective("xp");
        const passcoinsScore = world.scoreboard.getObjective("passcoins");
        const rubiesScore = world.scoreboard.getObjective("rubies");
        const moneyScore = world.scoreboard.getObjective("money");

        return {
            xp: xpScore ? (xpScore.getScore(player) || 0) : 0,
            passcoins: passcoinsScore ? (passcoinsScore.getScore(player) || 0) : 0,
            rubies: rubiesScore ? (rubiesScore.getScore(player) || 0) : 0,
            money: moneyScore ? (moneyScore.getScore(player) || 0) : 0
        };
    } catch (error) {
        // Fallback a propiedades dinámicas si el scoreboard no existe
        console.warn(`Error obteniendo stats de scoreboard para ${player.nameTag}: ${error}`);
        return {
            xp: player.getDynamicProperty("player_xp") || 0,
            passcoins: player.getDynamicProperty("player_passcoins") || 0,
            rubies: player.getDynamicProperty("player_rubies") || 0,
            money: player.getDynamicProperty("player_money") || 0
        };
    }
}

// Función para actualizar estadísticas del jugador en scoreboard
function updatePlayerStats(player, stats) {
    try {
        // Actualizar scoreboard (sistema real del servidor)
        const rubiesScore = world.scoreboard.getObjective("rubies");
        const moneyScore = world.scoreboard.getObjective("money");

        if (rubiesScore) {
            rubiesScore.setScore(player, stats.rubies);
        }
        if (moneyScore) {
            moneyScore.setScore(player, stats.money);
        }

        // También actualizar propiedades dinámicas como backup
        player.setDynamicProperty("player_rubies", stats.rubies);
        player.setDynamicProperty("player_money", stats.money);
    } catch (error) {
        console.warn(`Error actualizando stats para ${player.nameTag}: ${error}`);
        // Fallback a propiedades dinámicas
        player.setDynamicProperty("player_rubies", stats.rubies);
        player.setDynamicProperty("player_money", stats.money);
    }
}

// Función para dar recursos a un jugador (para administradores)
export function givePlayerResources(player, rubies = 0, money = 0) {
    const stats = getPlayerStats(player);
    stats.rubies += rubies;
    stats.money += money;
    updatePlayerStats(player, stats);

    const lang = getPlayerLanguage(player);
    const t = translations[lang];

    if (rubies > 0) {
        player.sendMessage(`§a+${rubies} gemas`);
    }
    if (money > 0) {
        player.sendMessage(`§a+${money} monedas`);
    }
}

// Función principal para mostrar la tienda de efectos
export function showEffectShop(player) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];
    const stats = getPlayerStats(player);

    const form = new ActionFormData()
        .title(t.title)
        .body(
            `§b${t.stats_header}\n` +
            `§e${t.welcome}${lang === "es" ? "o" : ""}, §a${player.nameTag}§e!\n` +
            `§b${t.stats_header}\n\n` +
            `§e${t.experience}${stats.xp}\n` +
            `§a${t.passcoins}${stats.passcoins}\n` +
            `§d${t.rubies}${stats.rubies}\n` +
            `§6${t.money}${stats.money}\n\n` +
            `§b${t.stats_header}\n`
        );

    // Agregar botones para cada efecto
    Object.keys(effectsConfig).forEach(effectId => {
        const effect = effectsConfig[effectId];
        const effectTranslation = t.effects[effectId];
        const isOwned = player.hasTag(`effect_owned_${effectId}`);
        const isEquipped = player.hasTag(`effect_equipped_${effectId}`);

        let status = "";
        if (isEquipped) {
            status = ` ${t.equipped}`;
        } else if (isOwned) {
            status = ` ${t.owned}`;
        }

        form.button(
            `§d${effectTranslation.name}${status}\n§7${effect.gemPrice} gemas | ${effect.moneyPrice} monedas`,
            effect.icon
        );
    });

    form.button(`§d⚡ ${t.particle_speed}`, "textures/ui/speed.png");
    form.button(t.back, "textures/ui/cancel.png");

    form.show(player).then(response => {
        if (response.canceled) return;

        const effectIds = Object.keys(effectsConfig);
        if (response.selection < effectIds.length) {
            const selectedEffectId = effectIds[response.selection];
            showEffectDetails(player, selectedEffectId);
        } else if (response.selection === effectIds.length) {
            // Botón de velocidad de partículas
            showParticleSpeedConfig(player);
        }
        // Si es el último botón (Volver), no hacer nada
    });
}

// Función para mostrar detalles de un efecto específico
function showEffectDetails(player, effectId) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];
    const effect = effectsConfig[effectId];
    const effectTranslation = t.effects[effectId];
    const stats = getPlayerStats(player);

    const isOwned = player.hasTag(`effect_owned_${effectId}`);
    const isEquipped = player.hasTag(`effect_equipped_${effectId}`);

    const form = new ActionFormData()
        .title(`§d${effectTranslation.name}`)
        .body(
            `§7${effectTranslation.description}\n\n` +
            `§e${t.rubies.replace(":heart: §l", "").replace(": §r§c", "")}: §c${effect.gemPrice}\n` +
            `§e${t.money.replace(":token: §l", "").replace(": §r§e", "")}: §e${effect.moneyPrice}\n\n` +
            `§7Estado: ${isEquipped ? t.equipped : isOwned ? t.owned : "§cNo poseído"}`
        );

    if (!isOwned) {
        // Botones de compra
        if (stats.rubies >= effect.gemPrice) {
            form.button(t.buy_with_gems, "textures/ui/heart.png");
        } else {
            form.button(`§c${t.buy_with_gems} (Insuficiente)`, "textures/ui/heart_empty.png");
        }

        if (stats.money >= effect.moneyPrice) {
            form.button(t.buy_with_money, "textures/ui/coin.png");
        } else {
            form.button(`§c${t.buy_with_money} (Insuficiente)`, "textures/ui/coin_empty.png");
        }
    } else {
        // Botón de equipar/desequipar
        if (isEquipped) {
            form.button(t.unequip, "textures/ui/cancel.png");
        } else {
            form.button(t.equip, "textures/ui/confirm.png");
        }
    }

    form.button(t.back, "textures/ui/arrow_left.png");

    form.show(player).then(response => {
        if (response.canceled) return;

        if (!isOwned) {
            if (response.selection === 0 && stats.rubies >= effect.gemPrice) {
                // Comprar con gemas
                purchaseEffect(player, effectId, "gems");
            } else if (response.selection === 1 && stats.money >= effect.moneyPrice) {
                // Comprar con dinero
                purchaseEffect(player, effectId, "money");
            } else if (response.selection === 2) {
                // Volver
                showEffectShop(player);
            }
        } else {
            if (response.selection === 0) {
                // Equipar/Desequipar
                if (isEquipped) {
                    unequipEffect(player, effectId);
                } else {
                    equipEffect(player, effectId);
                }
            } else if (response.selection === 1) {
                // Volver
                showEffectShop(player);
            }
        }
    });
}

// Función para comprar un efecto
function purchaseEffect(player, effectId, currency) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];
    const effect = effectsConfig[effectId];
    const stats = getPlayerStats(player);

    let canPurchase = false;

    if (currency === "gems" && stats.rubies >= effect.gemPrice) {
        player.setDynamicProperty("player_rubies", stats.rubies - effect.gemPrice);
        canPurchase = true;
    } else if (currency === "money" && stats.money >= effect.moneyPrice) {
        player.setDynamicProperty("player_money", stats.money - effect.moneyPrice);
        canPurchase = true;
    }

    if (canPurchase) {
        player.addTag(`effect_owned_${effectId}`);
        player.sendMessage(t.purchase_success);
        player.runCommand("playsound random.levelup @s");

        // Mostrar detalles actualizados
        system.runTimeout(() => {
            showEffectDetails(player, effectId);
        }, 20);
    } else {
        player.sendMessage(t.purchase_failed);
        player.runCommand("playsound note.bass @s");
    }
}

// Función para equipar un efecto
function equipEffect(player, effectId) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];

    // Desequipar cualquier efecto actualmente equipado
    Object.keys(effectsConfig).forEach(id => {
        player.removeTag(`effect_equipped_${id}`);
    });

    // Equipar el nuevo efecto
    player.addTag(`effect_equipped_${effectId}`);
    player.sendMessage(t.equipped_success);
    player.runCommand("playsound random.orb @s");

    // Mostrar detalles actualizados
    system.runTimeout(() => {
        showEffectDetails(player, effectId);
    }, 20);
}

// Función para desequipar un efecto
function unequipEffect(player, effectId) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];

    player.removeTag(`effect_equipped_${effectId}`);
    player.sendMessage(t.unequipped_success);
    player.runCommand("playsound random.click @s");

    // Mostrar detalles actualizados
    system.runTimeout(() => {
        showEffectDetails(player, effectId);
    }, 20);
}

// Configuración de velocidad de partículas (en ticks)
const particleSpeedConfig = {
    slow: 20,    // 1 segundo
    normal: 10,  // 0.5 segundos
    fast: 5,     // 0.25 segundos
    ultra: 2     // 0.1 segundos
};

// Función para obtener la velocidad de partículas del jugador
function getParticleSpeed(player) {
    const speed = player.getDynamicProperty("particle_speed") || "normal";
    return particleSpeedConfig[speed] || particleSpeedConfig.normal;
}

// Función para establecer la velocidad de partículas
function setParticleSpeed(player, speed) {
    if (particleSpeedConfig[speed]) {
        player.setDynamicProperty("particle_speed", speed);
        const lang = getPlayerLanguage(player);
        const t = translations[lang];
        const speedNames = {
            es: { slow: t.speed_slow, normal: t.speed_normal, fast: t.speed_fast, ultra: t.speed_ultra },
            en: { slow: t.speed_slow, normal: t.speed_normal, fast: t.speed_fast, ultra: t.speed_ultra }
        };
        player.sendMessage(`${t.speed_changed} §b${speedNames[lang][speed]}`);
        player.runCommand("playsound random.orb @s");
    }
}

// Función para mostrar configuración de velocidad de partículas
export function showParticleSpeedConfig(player) {
    const lang = getPlayerLanguage(player);
    const t = translations[lang];
    const currentSpeed = player.getDynamicProperty("particle_speed") || "normal";

    const speedNames = {
        es: { slow: t.speed_slow, normal: t.speed_normal, fast: t.speed_fast, ultra: t.speed_ultra },
        en: { slow: t.speed_slow, normal: t.speed_normal, fast: t.speed_fast, ultra: t.speed_ultra }
    };

    const descriptions = {
        es: {
            title: "§d⚡ Velocidad de Partículas",
            description: "Configura qué tan rápido aparecen las partículas de tus efectos.",
            current: "Velocidad actual:",
            slow_desc: "• Lenta: 1 segundo entre partículas",
            normal_desc: "• Normal: 0.5 segundos entre partículas",
            fast_desc: "• Rápida: 0.25 segundos entre partículas",
            ultra_desc: "• Ultra Rápida: 0.1 segundos entre partículas"
        },
        en: {
            title: "§d⚡ Particle Speed",
            description: "Configure how fast particles appear from your effects.",
            current: "Current speed:",
            slow_desc: "• Slow: 1 second between particles",
            normal_desc: "• Normal: 0.5 seconds between particles",
            fast_desc: "• Fast: 0.25 seconds between particles",
            ultra_desc: "• Ultra Fast: 0.1 seconds between particles"
        }
    };

    const desc = descriptions[lang];

    const form = new ActionFormData()
        .title(desc.title)
        .body(
            `§7${desc.description}\n\n` +
            `§e${desc.current} §b${speedNames[lang][currentSpeed]}\n\n` +
            `§7${desc.slow_desc}\n` +
            `§7${desc.normal_desc}\n` +
            `§7${desc.fast_desc}\n` +
            `§7${desc.ultra_desc}`
        );

    Object.keys(particleSpeedConfig).forEach(speed => {
        const isSelected = currentSpeed === speed ? " §a✓" : "";
        form.button(`§b${speedNames[lang][speed]}${isSelected}`, "textures/ui/speed.png");
    });

    form.button(t.back, "textures/ui/arrow_left.png");

    form.show(player).then(response => {
        if (response.canceled) return;

        const speeds = Object.keys(particleSpeedConfig);
        if (response.selection < speeds.length) {
            const selectedSpeed = speeds[response.selection];
            setParticleSpeed(player, selectedSpeed);

            // Mostrar el menú nuevamente después de cambiar
            system.runTimeout(() => {
                showParticleSpeedConfig(player);
            }, 20);
        } else {
            // Volver al menú principal
            showEffectShop(player);
        }
    });
}

// Sistema de efectos de partículas con velocidad configurable
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        const playerSpeed = getParticleSpeed(player);
        const currentTick = system.currentTick;

        // Solo aplicar efectos si ha pasado el tiempo suficiente según la velocidad configurada
        if (currentTick % playerSpeed === 0) {
            Object.keys(effectsConfig).forEach(effectId => {
                if (player.hasTag(`effect_equipped_${effectId}`)) {
                    applyEffect(player, effectId);
                }
            });
        }
    });
}, 1); // Ejecutar cada tick para mayor precisión

// Función auxiliar para formatear coordenadas y evitar notación científica
function formatCoordinate(value) {
    // Redondear a 2 decimales y evitar notación científica
    const rounded = Math.round(value * 100) / 100;
    return Math.abs(rounded) < 0.01 ? 0 : rounded;
}

// Función para aplicar efectos de partículas
function applyEffect(player, effectId) {
    const effect = effectsConfig[effectId];
    const location = player.location;

    try {
        switch (effectId) {
            case "walking_particles":
                if (player.getVelocity().x !== 0 || player.getVelocity().z !== 0) {
                    player.runCommand(`particle ${effect.particle} ~ ~0.1 ~`);
                }
                break;

            case "circle_aura":
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = formatCoordinate(Math.cos(angle) * 1.5);
                    const z = formatCoordinate(Math.sin(angle) * 1.5);
                    player.runCommand(`particle ${effect.particle} ~${x} ~1 ~${z}`);
                }
                break;

            case "fire_feet":
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = formatCoordinate(Math.cos(angle) * 0.8);
                    const z = formatCoordinate(Math.sin(angle) * 0.8);
                    player.runCommand(`particle ${effect.particle} ~${x} ~0.1 ~${z}`);
                }
                break;

            case "rainbow_trail":
                const x_rainbow = formatCoordinate(Math.random() - 0.5);
                const y_rainbow = formatCoordinate(Math.random() + 0.5);
                const z_rainbow = formatCoordinate(Math.random() - 0.5);
                player.runCommand(`particle ${effect.particle} ~${x_rainbow} ~${y_rainbow} ~${z_rainbow}`);
                break;

            case "lightning_aura":
                for (let i = 0; i < 3; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 2);
                    const y = formatCoordinate(Math.random() * 2);
                    const z = formatCoordinate((Math.random() - 0.5) * 2);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "ice_crystals":
                for (let i = 0; i < 4; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 1.5);
                    const y = formatCoordinate(Math.random() * 1.5 + 0.5);
                    const z = formatCoordinate((Math.random() - 0.5) * 1.5);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "blood_drops":
                for (let i = 0; i < 2; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 1);
                    const z = formatCoordinate((Math.random() - 0.5) * 1);
                    player.runCommand(`particle ${effect.particle} ~${x} ~2 ~${z}`);
                }
                break;

            case "golden_sparkles":
                for (let i = 0; i < 5; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 2);
                    const y = formatCoordinate(Math.random() * 2);
                    const z = formatCoordinate((Math.random() - 0.5) * 2);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "dark_smoke":
                const x = formatCoordinate((Math.random() - 0.5) * 1.5);
                const y = formatCoordinate(Math.random() * 1.5 + 1);
                const z = formatCoordinate((Math.random() - 0.5) * 1.5);
                player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                break;

            case "heart_particles":
                for (let i = 0; i < 3; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 1.5);
                    const y = formatCoordinate(Math.random() * 1.5 + 1);
                    const z = formatCoordinate((Math.random() - 0.5) * 1.5);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "soul_flames":
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const x = formatCoordinate(Math.cos(angle) * 1.2);
                    const z = formatCoordinate(Math.sin(angle) * 1.2);
                    player.runCommand(`particle ${effect.particle} ~${x} ~0.5 ~${z}`);
                }
                break;

            case "poison_cloud":
                for (let i = 0; i < 6; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 2);
                    const y = formatCoordinate(Math.random() * 0.5 + 0.5);
                    const z = formatCoordinate((Math.random() - 0.5) * 2);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "magic_spiral":
                const time = Date.now() / 1000;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + time;
                    const radius = 1.5;
                    const x = formatCoordinate(Math.cos(angle) * radius);
                    const z = formatCoordinate(Math.sin(angle) * radius);
                    const y = formatCoordinate(Math.sin(time + i) * 0.5 + 1);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "dragon_breath":
                for (let i = 0; i < 5; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 1.8);
                    const y = formatCoordinate(Math.random() * 1.2 + 0.8);
                    const z = formatCoordinate((Math.random() - 0.5) * 1.8);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "cherry_petals":
                for (let i = 0; i < 4; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 2.5);
                    const y = formatCoordinate(Math.random() * 2 + 1.5);
                    const z = formatCoordinate((Math.random() - 0.5) * 2.5);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "void_energy":
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = formatCoordinate(Math.cos(angle) * 2);
                    const z = formatCoordinate(Math.sin(angle) * 2);
                    const y = formatCoordinate(Math.sin(Date.now() / 500 + i) * 0.8 + 1.2);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;

            case "water_drops":
                for (let i = 0; i < 3; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 1.5);
                    const z = formatCoordinate((Math.random() - 0.5) * 1.5);
                    player.runCommand(`particle ${effect.particle} ~${x} ~2.5 ~${z}`);
                }
                break;

            case "star_dust":
                for (let i = 0; i < 8; i++) {
                    const x = formatCoordinate((Math.random() - 0.5) * 3);
                    const y = formatCoordinate(Math.random() * 2.5 + 0.5);
                    const z = formatCoordinate((Math.random() - 0.5) * 3);
                    player.runCommand(`particle ${effect.particle} ~${x} ~${y} ~${z}`);
                }
                break;
        }
    } catch (error) {
        console.warn(`Error aplicando efecto ${effectId} para ${player.nameTag}: ${error}`);
    }
}

// Función para mostrar ayuda de efectos (exportada para uso externo)
export function showEffectHelp(player) {
    const lang = getPlayerLanguage(player);
    const isAdmin = player.hasTag("Admin");

    let helpText = "§l§d✨ Ayuda de Efectos\n§r";
    helpText += "§7Los efectos son visuales que puedes comprar y equipar.\n";
    helpText += "§7Solo puedes tener un efecto equipado a la vez.\n\n";

    if (isAdmin) {
        helpText += "§eComandos disponibles para administradores:\n";
        helpText += "§7- Usar las funciones exportadas desde otros scripts\n";
        helpText += "§7- givePlayerResources(player, rubies, money)\n\n";
        helpText += "§7Efectos disponibles:\n";
        helpText += Object.keys(effectsConfig).join(", ");
    } else {
        helpText += "§7Compra efectos desde el menú de personaje.";
    }

    player.sendMessage(helpText);
}

// Función para dar todos los efectos a un jugador (para administradores)
export function giveAllEffects(player) {
    Object.keys(effectsConfig).forEach(effectId => {
        player.addTag(`effect_owned_${effectId}`);
    });

    const lang = getPlayerLanguage(player);
    const message = lang === "es" ? "§aTodos los efectos han sido desbloqueados!" : "§aAll effects have been unlocked!";
    player.sendMessage(message);
}

// Función para resetear efectos de un jugador (para administradores)
export function resetPlayerEffects(player) {
    Object.keys(effectsConfig).forEach(effectId => {
        player.removeTag(`effect_owned_${effectId}`);
        player.removeTag(`effect_equipped_${effectId}`);
    });

    const lang = getPlayerLanguage(player);
    const message = lang === "es" ? "§cTodos los efectos han sido reseteados." : "§cAll effects have been reset.";
    player.sendMessage(message);
}