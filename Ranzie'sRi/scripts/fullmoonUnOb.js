// ============================================================
// Rise & Survive - Script Principal (Desobfuscado)
// Autor original: Ranzie | Versión: 1.2.0
// ============================================================

import { world, system, ItemStack } from '@minecraft/server';
import { ModalFormData, ActionFormData } from '@minecraft/server-ui';
// import { EntityHealthComponent, EntityComponentTypes } from '@minecraft/server';


world.beforeEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    if (ev.itemStack.typeId === "minecraft:diamond") {
     system.run(() => player.runCommand(`playsound random.break @s`));
     system.run(() => player.runCommand(`say Hello!`));

    }
});


// ============================================================
// CONSTANTES GLOBALES
// ============================================================

// Duración de la horda en ticks (20 ticks = 1 segundo)
// Máximo permitido: 200 ticks
const HORDE_DURATION_TICKS = 20;
const MAX_HORDE_TICKS = 200;

// Día mínimo para que empiece la primera horda
const MIN_HORDE_DAY = 5;

// Tiempo de reinicio entre hordas (en ticks de tiempo de día)
// 0x5dc0 = 24000 (un día completo en ticks de juego)
const DAY_TICKS = 24000;

// ============================================================
// ESTADO GLOBAL DEL MOD
// ============================================================

// Estado de la luna llena / luna de sangre
let isFullMoonActive = false;         // ¿Está activa la luna llena?
let moon_track = false;               // Seguimiento del ciclo lunar

// Estado de la horda
let hordeActive = false;              // ¿Hay una horda activa?
let hordeTimerId = null;              // ID del timer de la horda (para cancelarla)
let hordeTicksRemaining = 0;         // Ticks restantes de la horda actual
let hordeSpawnedToday = false;       // ¿Ya se spawneó horda hoy?
let lastHordeDay = 0;                // Último día en que ocurrió una horda
let nextHordeGap = 0;                // Brecha aleatoria para la próxima horda
let hordeResetTime = false;          // ¿Se reinició el temporizador de horda?

// Variables de posición para el spawner de horda
let playerY = 0;                     // Coordenada Y del jugador objetivo
let zx = 0;                          // Coordenada X del zombie a spawnear
let zy = 0;                          // Coordenada Y del zombie a spawnear
let zz = 0;                          // Coordenada Z del zombie a spawnear
let allyCount = 0;                   // Cantidad actual de zombies aliados
let spawned = false;                 // ¿Se spawneó el zombie?
let spawnInterval = null;            // ID del intervalo de spawn
let attempts = 0;                    // Intentos de buscar posición de spawn
let currentDay = 0;                  // Día actual del juego

// Dimensión activa
let dim = null;                      // Referencia a la dimensión overworld

// Control de objetivos del scoreboard
let objectivesCreated = false;       // ¿Ya se crearon los objetivos del scoreboard?


// ============================================================
// CONFIGURACIÓN POR DEFECTO (se sobreescribe con world dynamic properties)
// ============================================================

// Valores máximos dinámicos (se leen de las configuraciones guardadas)
let MAX_DAY = 5;                     // Máximo de días para sobrevivir
let MAX_HORDE_SPAWN = 50;           // Máximo de zombies por horda
let INFECTION = 0;                   // Probabilidad de infección (0 = desactivado)
let zombieCap = 25;                  // Límite total de zombies en el mundo
let GROW = 6;                        // Cada cuántas dificultades sube la velocidad del zombie
let SPRINT = 3.5;                      // Velocidad máxima de sprint de los zombies

// Multiplicadores de spawn según dificultad (progresión por día)
// ZM = multiplicador de minería, ZP = block place, ZC = escalada, ZA = habilidades
let ZM = 0;   // Probabilidad de que el zombie tenga habilidad de minería
let ZP = 0;   // Probabilidad de que el zombie tenga habilidad de colocar bloques
let ZC = 0;   // Probabilidad de que el zombie tenga habilidad de escalar
let ZA = 0;   // Probabilidad de que el zombie tenga habilidades custom

// Probabilidades de habilidades especiales
let sPOTION = 1;   // Habilidad: efectos de poción
let sWARNER = 1;   // Habilidad: warner (revela posición de jugadores)
let sENDER = 1;    // Habilidad: ender (teletransporte)
let sWITCH = 1;    // Habilidad: witch (lanza pociones)
let sJUMPER = 1;   // Habilidad: jumper (saltos altos)
let sBOMBER = 1;   // Habilidad: bomber (lanza TNT)
let sSPITTER = 1;  // Habilidad: spitter (escupe proyectiles)
let sCRAWLER = 1;  // Habilidad: crawler (se arrastra, tamaño reducido)


// ============================================================
// DEFINICIÓN DE SETTINGS (configuración de la UI)
// ============================================================

// --- Settings BÁSICOS (toggles) ---
// Cada objeto tiene: id (clave en dynamic property), name (texto en UI), default
const rasSettings = [
    { id: "block_place",   name: " Zombies can place blocks",                                      default: false },
    { id: "block_break",   name: " Zombies can mine",                                               default: false },
    { id: "armor",         name: " Zombies can wear armor",                                         default: false },
    { id: "ability",       name: " Zombies with custom abilities",                                  default: false },
    { id: "zonly",         name: " Other monsters will not spawn(Once they spawned, you cannot remove them)", default: true },
    { id: "fog",           name: " fog effect during infection & bloodmoon(turn on or off before it occurs)", default: true },
    { id: "fade",          name: " Removes all zombies after blood moon",                           default: false },
    { id: "diff",          name: " Show difficulty bar",                                            default: false },
    { id: "sweep",         name: " Enable sweep and crit attacks",                                  default: false },
    { id: "jregen",        name: " Enable java regeneration",                                      default: false },
    { id: "torch",         name: " Enable dynamic torch",                                           default: false },
    { id: "bonly",         name: " Blocks only damage",                                             default: false },
];

// --- Settings AVANZADOS (sliders de habilidades) ---
// Cada slider tiene: id, name, default (valor por defecto), min, max
const rasSettings2 = [
    { id: "za",       name: "☆' Chance of zombie spawning with abilities(might cause lag if the value is too high): ", default: 2,   min: 0, max: 100 },
    { id: "zm",       name: "★ Chance of zombie spawning with mining ability: ",                 default: 40,  min: 0, max: 100 },
    { id: "zp",       name: "☆' Chance of zombie spawning with block placing ability: ",         default: 30,  min: 0, max: 100 },
    { id: "zc",       name: "★ Chance of zombie spawning with climbing ability: ",               default: 20,  min: 0, max: 100 },
    { id: "spotion",  name: "☆' Chance of zombies having potion effects: ",                      default: 5,   min: 0, max: 100 },
    { id: "swarner",  name: "★ Chance of zombies having warner ability: ",                       default: 5,   min: 0, max: 100 },
    { id: "sender",   name: "☆' Chance of zombies having ender ability: ",                       default: 5,   min: 0, max: 100 },
    { id: "switch",   name: "★ Chance of zombies having witch effect: ",                         default: 5,   min: 0, max: 100 },
    { id: "sjumper",  name: "☆' Chance of zombies having jumper ability: ",                      default: 5,   min: 0, max: 100 },
    { id: "sbomber",  name: "★ Chance of zombies having bomber ability: ",                       default: 5,   min: 0, max: 100 },
    { id: "sspitter", name: "☆' Chance of zombies having spitter ability: ",                     default: 5,   min: 0, max: 100 },
    { id: "scrawler", name: "★ Chance of zombies having crawler ability: ",                      default: 5,   min: 0, max: 100 },
    { id: "sprint",   name: "☆' Maximum zombie speed: ",                                         default: 3,   min: 1, max: 10  },
];


// --- Settings del menú básico (sliders de texto) ---
const sliderSettings = [
    { id: "max_day",        name: "☆' How many days do you want to survive? (max day)",                                          default: "5"  },
    { id: "max_horde_spawn",name: "★ Max Zombie Horde Spawn (increases each day until it reaches the max horde spawn)(reduces lag if you set it to a lower value)", default: "25" },
    { id: "infection",      name: "☆' Chance of getting infected (e.g. 0.1, 1, or 100, set to 0 to turn off)",                  default: "0"  },
    { id: "zcap",           name: "★ Zombie spawn limit (how many zombies are allowed to spawn in your world)(reduces lag if you set it to a lower value)", default: "25" },
    { id: "growth",         name: "☆' Zombie's movement speed increases every ___ difficulty",                                    default: "6"  },
];

// --- Settings de Corpse (cadáveres) ---
const sliderSettingss = [
    { id: "sprint", name: "★ Corpse spawn limit (how many corpse are allowed to spawn in your world)", default: "50" },
];

// Toggles del menú de Corpse
const corpseSettings = [
    { id: "corpse",         name: " Allow corpse",                                     default: false },
    { id: "corpse_physics", name: " Corpse physics(might cause lag)",                  default: false },
    { id: "corpse_kick",    name: " Zombies can kick corpse(might cause lag)",         default: false },
];

// Sliders de física del corpse
const corpseSliders = [
    { id: "corpse_h_kick",  name: "☆' Horizontal kick intensity: ", default: 6, min: 0, max: 20 },
    { id: "corpse_v_kick",  name: "★ Vertical kick intensity: ",     default: 2, min: 0, max: 20 },
];


// ============================================================
// TABLAS DE EQUIPAMIENTO DE ZOMBIES
// Definidas más adelante con los datos reales del bytecode.
// Ver sección "DATOS REALES DE ARMADURA" hacia el final del archivo.
// ============================================================


// ============================================================
// FUNCIONES UTILITARIAS
// ============================================================

/**
 * Obtiene el valor de un setting guardado en las dynamic properties del mundo.
 * Si no existe, devuelve el valor por defecto del setting.
 * @param {string} id - ID del setting
 * @param {*} defaultValue - Valor por defecto si no está guardado
 * @returns {*} Valor del setting
 */
function getSetting(id, defaultValue) {
    try {
        const stored = world.getDynamicProperty(id);
        if (stored === undefined || stored === "undefined") {
            return defaultValue;
        }
        return stored;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Calcula la duración de la horda en ticks, limitada al máximo.
 * @returns {number} Duración de la horda en ticks
 */
function getHordeDurationTicks() {
    return Math.min(HORDE_DURATION_TICKS, MAX_HORDE_TICKS);
}

/**
 * Elige un elemento aleatorio de un array con pesos de probabilidad.
 * Algoritmo de selección ponderada (weighted random pick).
 * @param {Array} items - Array de objetos con propiedad "weight"
 * @returns {*} El elemento seleccionado
 */
function pickWeighted(items) {
    if (!items || items.length === 0) return null;
    // Calculamos el total de pesos, ignorando items con weight 0
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    if (totalWeight <= 0) return items[0]; // fallback si todos pesan 0
    let rand = Math.random() * totalWeight;
    for (const item of items) {
        rand -= (item.weight || 0);
        if (rand <= 0) {
            return item;
        }
    }
    // Fallback: devuelve el último elemento
    return items[items.length - 1];
}

/**
 * Obtiene un elemento aleatorio de un array (sin pesos).
 * @param {Array} arr - Array de elementos
 * @returns {*} Elemento aleatorio
 */
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


/**
 * Determina si se debe equipar una pieza de armadura al zombie,
 * basado en la probabilidad de la pieza del set elegido.
 * @param {number} pieceChance - Probabilidad de equipar (0-1)
 * @returns {boolean}
 */
function shouldEquip(pieceChance) {
    return Math.random() < pieceChance;
}

/**
 * Determina si se debe equipar un arma en la mano del zombie.
 * @param {number} pieceChanceHand - Probabilidad de equipar arma (0-1)
 * @returns {boolean}
 */
function shouldEquipHand(pieceChanceHand) {
    return Math.random() < pieceChanceHand;
}

/**
 * Elige una herramienta para un zombie según el día actual.
 * En días avanzados (>75% del máximo) usa herramientas de mayor tier.
 * @returns {string} Nombre del ítem herramienta
 */
function pickTool() {
    const day = world.getDay();
    let toolPool, materialPool;
    if (day >= MAX_DAY * 0.6) {
        // Días avanzados: herramientas y materiales de alto nivel
        materialPool = pickWeighted(rzmaterials);
        toolPool = pickWeighted(rztools);
    } else {
        materialPool = pickWeighted(materials);
        toolPool = pickWeighted(tools);
    }
    // Con probabilidad 0.6 usamos el material del pool de armas, si no, el pool de materiales
    if (Math.random() < 0.6) {
        return toolPool.value;
    }
    return materialPool.value;
}

/**
 * Elige una pieza de armadura específica del set seleccionado.
 * @param {number} armorSetIndex - Índice del set de armadura
 * @returns {string} Nombre del ítem de armadura
 */
function pickArmorPart(armorSetIndex) {
    const set = armorSets[armorSetIndex];
    return set.item;
}


// ============================================================
// FUNCIÓN: EQUIPAR ZOMBIE
// Asigna armadura, arma y objetos de mano secundaria al zombie
// según el progreso del día y los settings.
// ============================================================

/**
 * Equipa a un zombie recién spawneado con armadura, arma y offhand
 * dependiendo del día actual y las probabilidades de equipamiento.
 * @param {Entity} entity - Entidad zombie a equipar
 */
function equipZombie(entity) {
    if (entity.typeId !== "minecraft:zombie") return;

    const day = world.getDay();

    // Calcula la probabilidad de equipo según el día (progresión lineal)
    // A mayor día (respecto al MAX_DAY), mayor probabilidad de armadura
    let gearChance;
    const dayRatio = day / MAX_DAY;
    if (dayRatio >= 0.75)      gearChance = 4;   // 4 = muy alta probabilidad
    else if (dayRatio >= 0.5)  gearChance = 3;
    else if (dayRatio >= 0.25) gearChance = 2;
    else if (dayRatio >= 0.1)  gearChance = 1;
    else                        gearChance = 0;

    // Obtiene el setting de probabilidad de equipo (gear_chance)
    const settingGearChance = getSetting("gear_chance", 0.8);

    // Elige un set de armadura con peso
    const armorSetIdx = pickWeighted(armorSets);
    const { pieceChance, pieceChanceHand } = armorSetIdx;

    // Probabilidad base ajustada: mezcla el día con el setting configurado
    const baseChance = Math.min(gearChance / 3, 1) * settingGearChance;

    // --- Equipa CASCO ---
    if (shouldEquip(pieceChance) && Math.random() < baseChance) {
        const helmet = pickArmorPart(armorSets.indexOf(armorSetIdx));
        entity.runCommandAsync(`replaceitem entity @s[type=zombie] slot.armor.head 0 keep ${helmet}_helmet`);
    }

    // --- Equipa PECHERA ---
    if (shouldEquip(pieceChance) && Math.random() < baseChance) {
        const chest = pickArmorPart(armorSets.indexOf(armorSetIdx));
        entity.runCommandAsync(`replaceitem entity @s[type=zombie] slot.armor.chest 0 keep ${chest}_chestplate`);
    }

    // --- Equipa PANTALÓN ---
    if (shouldEquip(pieceChance) && Math.random() < baseChance) {
        const legs = pickArmorPart(armorSets.indexOf(armorSetIdx));
        entity.runCommandAsync(`replaceitem entity @s[type=zombie] slot.armor.legs 0 keep ${legs}_leggings`);
    }

    // --- Equipa BOTAS ---
    if (shouldEquip(pieceChance) && Math.random() < baseChance) {
        const feet = pickArmorPart(armorSets.indexOf(armorSetIdx));
        entity.runCommandAsync(`replaceitem entity @s[type=zombie] slot.armor.feet 0 keep ${feet}_boots`);
    }

    // --- Equipa ARMA en mano principal ---
    if (shouldEquipHand(pieceChanceHand)) {
        const tool = pickTool();
        entity.runCommandAsync(`replaceitem entity @s[type=zombie] slot.weapon.mainhand 0 ${tool}`);

        // Con probabilidad del 10%, enchanta el arma
        if (Math.random() < 0.1) {
            const enchant = getRandom(toolEnchants);
            entity.runCommandAsync(`enchant @s[type=zombie] ${enchant.value}`);
        }
    }

    // --- Equipa OFFHAND según tipo de zombie ---
    // Bombers llevan TNT, Warners llevan cuerno de cabra, Enders llevan perlas
    // Witches llevan poción de daño, resto tienen posibilidad de totem
    if (Math.random() < 0.95) {
        entity.runCommandAsync(`replaceitem entity @s[type=zombie,tag=!bomber,tag=!ender,tag=!witch,tag=!warner] slot.weapon.offhand 0 keep totem_of_undying`);
    }
    entity.runCommandAsync(`replaceitem entity @s[type=zombie,tag=bomber] slot.weapon.offhand 0 tnt`);
    entity.runCommandAsync(`replaceitem entity @s[type=zombie,tag=warner] slot.weapon.offhand 0 goat_horn`);
    entity.runCommandAsync(`replaceitem entity @s[type=zombie,tag=ender] slot.weapon.offhand 0 ender_pearl`);
    entity.runCommandAsync(`replaceitem entity @s[type=zombie,tag=witch] slot.weapon.offhand 0 splash_potion 1 23`);
}


// ============================================================
// FUNCIÓN: ASIGNAR HABILIDADES AL ZOMBIE (onSpawn)
// Se ejecuta cuando un zombie spawnea. Asigna tags de habilidades
// especiales según las probabilidades configuradas y el día actual.
// ============================================================

/**
 * Asigna habilidades especiales a un zombie al momento de spawnear.
 * La probabilidad de cada habilidad aumenta según el progreso del día.
 * @param {Entity} entity - Entidad zombie recién spawneada
 */
function assignZombieAbilities(entity) {
    if (entity.typeId !== "minecraft:zombie") return;

    const day = world.getDay();
    const dayRatio = day / MAX_DAY;

    // Escala de dificultad por día (0.01 a 1.0, máximo al llegar a MAX_DAY)
    const diffScale = Math.min(dayRatio, 1.0) * 0.01;

    // --- HP ESCALADO según día ---
    // Asigna un grupo de HP diferente según el progreso y dispara
    // el evento correspondiente para cambiar el component_group de salud.
    if (getSetting("hp", false)) {
        try {
            if (dayRatio >= 0.75) {
                entity.addTag("hpfive");
                entity.runCommandAsync("effect @s health_boost infinite 4 true");
            } else if (dayRatio >= 0.5) {
                entity.addTag("hpfour");
                entity.runCommandAsync("effect @s health_boost infinite 3 true");
            } else if (dayRatio >= 0.25) {
                entity.addTag("hpthree");
                entity.runCommandAsync("effect @s health_boost infinite 2 true");
            } else {
                entity.addTag("hptwo");
                entity.runCommandAsync("effect @s health_boost infinite 1 true");
            }
        } catch (e) {}
    }

    // Si el zombie fue eliminado de alguna forma rara (instant_damage check)
    if (diffScale <= 0) {
        entity.runCommandAsync("effect @s instant_damage 1 255 true");
        return;
    }

    // --- HABILIDAD: MINERÍA ---
    // Probabilidad escalada: ZM% de base, aumenta con el día
    if (getSetting("block_break", false) && Math.random() < (ZM / 100) * diffScale * 100) {
        entity.addTag("miner");
    }

    // --- HABILIDAD: COLOCAR BLOQUES ---
    if (getSetting("block_place", false) && Math.random() < (ZP / 100) * diffScale * 100) {
        entity.addTag("place");
    }

    // --- HABILIDADES CUSTOM (requiere setting "ability" activado) ---
    if (getSetting("ability", false) && Math.random() < (ZA / 100) * diffScale * 100) {
        // Decide qué habilidad especial asignar según pesos de probabilidad
        const roll = Math.random();
        if (roll < sPOTION / 100)       entity.addTag("potion");
        else if (roll < sWARNER / 100)  entity.addTag("warner");
        else if (roll < sENDER / 100)   entity.addTag("ender");
        else if (roll < sWITCH / 100)   entity.addTag("witch");
        else if (roll < sJUMPER / 100)  entity.addTag("jumper");
        else if (roll < sBOMBER / 100)  entity.addTag("bomber");
        else if (roll < sSPITTER / 100) entity.addTag("spitter");
        else if (roll < sCRAWLER / 100) entity.addTag("crawler");
    }

    // --- HABILIDAD: ESCALAR (climber) ---
    if (getSetting("block_break", false) && Math.random() < (ZC / 100) * diffScale * 100) {
        entity.addTag("climber");
    }

    // --- EFECTO DE VELOCIDAD según SPRINT y día ---
    // La velocidad del zombie aumenta según el día dividido entre GROW
    const speedLevel = Math.floor(day / GROW);
    const cappedSpeed = Math.min(speedLevel, SPRINT);
    if (cappedSpeed > 0) {
        entity.runCommandAsync(`effect @s speed infinite ${cappedSpeed} true`);
    }

    // Con probabilidad 0.005: invisibilidad infinita
    if (Math.random() < 0.005) {
        entity.runCommandAsync("effect @s invisibility infinite 5");
    }
    // Con probabilidad 0.001: slow_falling (zombie flotador)
    if (Math.random() < 0.001) {
        entity.runCommandAsync("effect @s slow_falling infinite 2");
    }
    // Con probabilidad 0.001: resistencia al fuego
    if (Math.random() < 0.001) {
        entity.runCommandAsync("effect @s fire_resistance infinite 5");
    }
}


// ============================================================
// FUNCIÓN: ACTIVAR HABILIDADES DE ZOMBIE (per-tick / event)
// Dispara los eventos de entidad según los tags asignados al zombie.
// ============================================================

/**
 * Activa los eventos de comportamiento de un zombie según sus tags de habilidad.
 * Se llama periódicamente para aplicar efectos activos (bomber, spitter, etc.)
 * @param {Entity} entity - Entidad zombie
 */
function activateZombieAbilities(entity) {
    // Dispara eventos de comportamiento especial según los tags del zombie
    entity.runCommandAsync("event entity @s[tag=bomber] kaboom");
    entity.runCommandAsync("event entity @s[tag=spitter] spit");
    entity.runCommandAsync("event entity @s[tag=crawler] crawler");
    entity.runCommandAsync("event entity @s[tag=climber] climber");
    entity.runCommandAsync("event entity @s[tag=witch] witch");
    entity.runCommandAsync("event entity @s[tag=ender] ender");
    entity.runCommandAsync("event entity @s[tag=mlg] mlg");
    entity.runCommandAsync("event entity @s[tag=warner] revealer");

    // Aplica velocidad basada en el tag "speed" del zombie
    const speedValue = entity.speed; // valor numérico guardado en el zombie
    if (speedValue !== undefined) {
        entity.runCommandAsync(`effect @s speed infinite ${speedValue} true`);
    }
}

// ============================================================
// FUNCIÓN: ACTUALIZAR VELOCIDAD DEL ZOMBIE (per-spawn)
// Calcula y asigna la velocidad correcta al zombie según el día.
// ============================================================

/**
 * Actualiza la velocidad de movimiento de un zombie según el día actual.
 * La velocidad aumenta progresivamente hasta alcanzar SPRINT.
 * @param {Entity} entity - Entidad zombie
 */
function updateZombieSpeed(entity) {
    if (entity.typeId !== "minecraft:zombie") return;

    const day = world.getDay();
    if (day <= 0) return;

    // Velocidad base: escala con el día, limitada por SPRINT y MAX_DAY
    const rawSpeed = (day / MAX_DAY) * GROW * 0.01;
    const speed = Math.min(Math.floor(rawSpeed), SPRINT);

    // Aplica el efecto de velocidad vía comando (no existe entity.speed en la API)
    if (speed > 0) {
        entity.runCommandAsync(`effect @s speed infinite ${speed} true`);
    }

    // Con probabilidad 5% aplica sprint repentino temporal
    if (Math.random() < 0.05) {
        system.runTimeout(() => {
            try {
                entity.runCommandAsync(`effect @s speed infinite ${Math.min(speed + 1, SPRINT + 2)} true`);
            } catch (e) {}
        }, 12);
    }
}


// ============================================================
// FUNCIÓN: CONFIGURAR OBJETIVOS DEL SCOREBOARD
// Crea los scoreboards necesarios para el mod (solo una vez).
// ============================================================

/**
 * Inicializa los objetivos del scoreboard si aún no han sido creados.
 * Los objetivos controlan: día, vivos, nivel de minería, velocidad y colocación.
 */
function setupObjectives() {
    if (objectivesCreated) return;

    // Obtiene la dimensión overworld
    try {
        dim = world.getDimension("overworld");
    } catch (e) {}

    // Crea los 5 objetivos del scoreboard necesarios para el mod
    const commands = [
        "scoreboard objectives add day dummy",
        "scoreboard objectives add alive dummy",
        "scoreboard objectives add level dummy",
        "scoreboard objectives add speed dummy",
        "scoreboard objectives add place dummy",
    ];

    // Intenta crear cada objetivo (falla silenciosamente si ya existe)
    for (const cmd of commands) {
        try {
            dim.runCommandAsync(cmd);
        } catch (e) {}
    }

    objectivesCreated = true;
}

// ============================================================
// FUNCIÓN: ACTUALIZAR SCORES DE ZOMBIES
// Actualiza los valores del scoreboard para minería y colocación
// según el día actual y las configuraciones.
// ============================================================

/**
 * Actualiza los valores del scoreboard de minería y colocación de bloques
 * en los zombies que tienen dichos tags, escalando según el día.
 */
function updateZombieScores() {
    if (!objectivesCreated) {
        setupObjectives();
        return;
    }

    try {
        dim = world.getDimension("overworld");
    } catch (e) { return; }

    const day = dim.getDay !== undefined ? world.getDay() : world.getDay();
    const dayRatio = day / MAX_DAY;

    // Nivel de minería: escala con el día
    let mineLevel;
    if (dayRatio >= 0.75)      mineLevel = 4;
    else if (dayRatio >= 0.5)  mineLevel = 3;
    else if (dayRatio >= 0.25) mineLevel = 2;
    else if (dayRatio >= 0.1)  mineLevel = 1;
    else                        mineLevel = 0;

    // Actualiza el scoreboard de nivel de minería si está activo
    if (getSetting("block_break", false)) {
        if (mineLevel > 0) {
            dim.runCommandAsync(`scoreboard players set @e[type=zombie,tag=miner] level ${mineLevel}`);
        } else {
            dim.runCommandAsync("scoreboard players set @e[type=zombie,tag=miner] level 0");
        }
    }

    // Nivel de colocación de bloques (calculado de forma aleatoria para variedad)
    if (getSetting("block_place", false)) {
        const placeLevel = Math.floor(Math.random() * (mineLevel + 1));
        if (placeLevel > 0) {
            dim.runCommandAsync(`scoreboard players set @e[type=zombie,tag=place] place ${placeLevel}`);
        } else {
            dim.runCommandAsync("scoreboard players set @e[type=zombie,tag=place] place 0");
        }
    }
}


// ============================================================
// FUNCIÓN: LUNA DE SANGRE - INICIO (fm_start)
// Se activa cuando comienza la Blood Moon / Luna Llena.
// ============================================================

/**
 * Inicia la secuencia de la Blood Moon.
 * - Anuncia el evento a todos los jugadores
 * - Activa el estado de luna llena
 * - Inicia la horda si es un día válido
 */
function fm_start() {
    // Anuncia el inicio de la Blood Moon
    dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§cThe Blood Moon is rising..."}]}`);
    dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§cThe Blood Moon is rising..."}]}`);

    isFullMoonActive = true;

    // Solo activa la horda si el día actual supera el mínimo configurado
    if (world.getDay() >= MIN_HORDE_DAY) {
        // Pequeño delay antes de iniciar la horda (100 ticks = 5 segundos)
        system.runTimeout(() => {
            triggerHorde();
        }, 100);
    }
}

// ============================================================
// FUNCIÓN: LUNA DE SANGRE - FIN (fm_end)
// Se activa cuando termina la Blood Moon / Luna Llena.
// ============================================================

/**
 * Finaliza la secuencia de la Blood Moon.
 * - Anuncia el fin del evento
 * - Limpia efectos de night_vision
 * - Elimina tags de moon/bloodmoon
 * - Opcionalmente despawnea todos los zombies
 */
function fm_end() {
    // Anuncia el fin de la Blood Moon
    dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§fThe §cBlood Moon §fis fading..."}]}`);
    dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§fThe §cBlood Moon §fis fading..."}]}`);

    // Limpia el efecto de night_vision de los jugadores con tag "moon"
    dim.runCommandAsync("effect @a[tag=moon] clear night_vision");

    // Si el setting "fade" está activo, despawnea todos los zombies al terminar
    if (getSetting("fade", false)) {
        dim.runCommandAsync("title @a title DAY TIME GET RESOURCES");
        dim.runCommandAsync("title @a title DAY TIME GET RESOURCES");
    }

    // Despawnea todos los zombies activos
    dim.runCommandAsync("event entity @e[type=zombie] minecraft:start_despawn");
    dim.runCommandAsync("event entity @e[type=zombie] minecraft:start_despawn");

    isFullMoonActive = false;
}


// ============================================================
// FUNCIÓN: RASTREO DEL CICLO LUNAR (moon_track)
// Corre cada tick. Detecta la transición de noche a luna llena
// y de luna llena a madrugada para disparar fm_start y fm_end.
// ============================================================

/**
 * Rastrea el ciclo lunar y gestiona las transiciones de la Blood Moon.
 * Debe llamarse en cada tick del sistema.
 * 
 * Lógica de tiempo:
 *   - 0x32c8 = 12,999 ticks ≈ inicio de la noche (luna saliendo)
 *   - 0x59d8 = 23,000 ticks ≈ casi amanecer
 *   - Luna Llena = MoonPhase === 0
 */
function moon_track() {
    const moonPhase = world.getMoonPhase();
    const timeOfDay = world.getTimeOfDay();

    // Detecta si es luna llena (phase 0) durante la noche
    const isNight = timeOfDay >= 12999 && timeOfDay <= 23000;
    const isFullMoon = moonPhase === 0;

    if (isFullMoon && isNight) {
        // Aplica tag "bloodmoon" a todos los jugadores
        dim.runCommandAsync("tag @a add bloodmoon");
        dim.runCommandAsync("tag @a remove moon");

        if (!isFullMoonActive) {
            // Transición: la luna llena acaba de comenzar
            isFullMoonActive = true;
            fm_start();
        }
    } else if (!isNight && isFullMoonActive) {
        // El día llegó: termina la luna de sangre
        dim.runCommandAsync("tag @a remove bloodmoon");
        dim.runCommandAsync("tag @a add moon");
        isFullMoonActive = false;
        fm_end();
    } else if (!isFullMoon && isNight) {
        // Noche normal: gestiona tags de luna regular
        dim.runCommandAsync("tag @a add moon");
        dim.runCommandAsync("tag @a remove bloodmoon");
    } else {
        // De día sin eventos especiales
        dim.runCommandAsync("tag @a remove moon");
        dim.runCommandAsync("tag @a remove bloodmoon");
    }
}


// ============================================================
// SISTEMA DE HORDAS
// Controla el spawn de hordas nocturnas de zombies.
// ============================================================

/**
 * Verifica si debe activarse una horda hoy y la dispara.
 * La horda solo puede ocurrir:
 *   - Una vez por día
 *   - Después del día MIN_HORDE_DAY
 *   - Cuando es de noche (timeOfDay > 24000 en el ciclo interno)
 */
function checkHordeSpawn() {
    const day = world.getDay();
    const timeOfDay = world.getTimeOfDay();

    // Reinicio diario: al amanecer, resetea el flag de horda del día
    if (timeOfDay < DAY_TICKS && hordeResetTime) {
        hordeResetTime = false;
        hordeSpawnedToday = false;
    }
    if (timeOfDay >= DAY_TICKS) {
        hordeResetTime = true;
    }

    // Condiciones para NO lanzar horda
    if (hordeSpawnedToday) return;       // Ya hubo horda hoy
    if (hordeActive) return;             // Ya hay una horda activa
    if (day < MIN_HORDE_DAY) return;     // Demasiado temprano en el juego
    if (day === lastHordeDay) return;    // No repetir en el mismo día

    // Durante la noche, con probabilidad aleatoria, dispara la horda
    if (timeOfDay >= DAY_TICKS) {
        const rand = Math.random();
        // La probabilidad de horda aumenta progresivamente
        if (rand < 0.2 || rand < 0.3) {
            hordeSpawnedToday = true;
            lastHordeDay = day;
            // Genera una brecha aleatoria antes del próximo ciclo
            nextHordeGap = Math.floor(Math.random() * 3) + 2;
            triggerHorde();
        }
    }
}

/**
 * Dispara (activa) una nueva horda de zombies.
 * Calcula cuántos zombies spawnar según el día actual.
 */
function triggerHorde() {
    hordeActive = true;
    startHordeTimer();
}


/**
 * Inicia el timer de la horda y configura el spawn periódico.
 * La horda dura un número determinado de ticks según getHordeDurationTicks().
 */
function startHordeTimer() {
    // Calcula ticks restantes para esta horda
    hordeTicksRemaining = getHordeDurationTicks();

    // Inicia un intervalo que ejecuta el spawn de zombies de horda
    hordeTimerId = system.runInterval(() => {
        tickHorde();
    }, 19); // Cada 19 ticks (~1 segundo)
}

/**
 * Detiene la horda activa y limpia todos los recursos.
 * Anuncia el fin de la horda a los jugadores.
 */
function stopHorde() {
    if (!hordeActive) return;

    // Reduce los ticks restantes
    hordeTicksRemaining -= 20;

    if (hordeTicksRemaining <= 0) {
        // La horda terminó su duración
        hordeActive = false;
        if (hordeTimerId !== null) {
            system.clearRun(hordeTimerId);
            hordeTimerId = null;
        }
        dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§4The air is quiet, the horde has stopped"}]}`);
    }
}

/**
 * Tick de la horda: cada ciclo busca un jugador y spawna zombies cerca.
 * También gestiona el spawn de jefes especiales (Giant, Necromancer, Tank).
 */
function tickHorde() {
    const players = world.getAllPlayers();
    if (players.length === 0) {
        stopHorde();
        return;
    }

    // Elige un jugador aleatorio como objetivo
    const targetPlayer = players[Math.floor(Math.random() * players.length)];
    currentDay = world.getDay();

    // Calcula cuántos zombies spawnear en este tick
    // Aumenta progresivamente hasta MAX_HORDE_SPAWN según el día
    const spawnCount = Math.min(
        Math.floor((currentDay / MAX_DAY) * MAX_HORDE_SPAWN),
        MAX_HORDE_SPAWN
    );

    // Busca una posición válida alrededor del jugador para spawnear
    findZombieAndSpawnHorde(targetPlayer, spawnCount);

    // Reduce los ticks restantes de la horda
    stopHorde();
}


/**
 * Busca una posición válida cerca del jugador y spawnea la horda de zombies.
 * Implementa el sistema de distancia máxima y contador de intentos.
 * 
 * @param {Player} player - Jugador objetivo de la horda
 * @param {number} count - Cantidad de zombies a spawnear
 */
function findZombieAndSpawnHorde(player, count) {
    // Coordenadas base del jugador
    playerY = Math.floor(player.location.y);
    zx = 0; zy = 0; zz = 0;
    allyCount = 0;
    spawned = false;
    spawnInterval = null;
    attempts = 0;

    // Verifica cuántos zombies hay actualmente cerca del jugador
    const nearbyZombies = dim.getEntities({
        type: "minecraft:zombie",
        maxDistance: 40,
        location: player.location,
    });
    allyCount = nearbyZombies.filter(e => e.length !== undefined).length;

    // Si ya hay demasiados zombies cerca, no spawnear más
    if (allyCount >= zombieCap) return;

    // Calcula posición aleatoria alrededor del jugador (radio 15 bloques)
    const angle = Math.random() * Math.PI * 2;
    const radius = 15;
    zx = player.location.x + Math.cos(angle) * radius;
    zy = playerY;
    zz = player.location.z + Math.sin(angle) * radius;

    // Anuncia la horda (sonido + mensaje)
    dim.runCommandAsync(`playsound ranzie.horde @a ${zx} ${zy} ${zz} 0.9`);
    dim.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§4You hear the howls of a nearby horde"}]}`);

    // Inicia el intervalo de spawn de zombies de la horda
    spawnInterval = system.runInterval(() => {
        spawnHordeZombie();
    }, 20); // Un zombie cada segundo

    // Después de un tiempo, spawnea los jefes especiales de horda
    system.runTimeout(() => {
        dim.runCommandAsync(`summon zombie ${zx} ~ ${zz} as_giant "Giant Horde Leader"`);
    }, 17);
    system.runTimeout(() => {
        dim.runCommandAsync(`summon zombie ${zx} ~ ${zz} summoner "Necromancer Horde Leader"`);
    }, 20);
    system.runTimeout(() => {
        dim.runCommandAsync(`summon zombie ${zx} ~ ${zz} tank "Tank Horde Leader"`);
    }, 20);
}

/**
 * Calcula la distancia entre dos puntos en el espacio (para verificar spawn).
 * @param {Location} location - Posición de referencia
 * @param {Player} player - Jugador objetivo
 * @returns {number} Distancia en bloques
 */
function getDistanceToPlayer(location, player) {
    const dx = location.x - player.location.x;
    const dy = location.y - player.location.y;
    const dz = location.z - player.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Obtiene la altura Y del jugador (con Math.floor).
 * @param {Player} player - Jugador
 */
function getPlayerY(player) {
    playerY = Math.floor(player.location.y);
    return playerY > 10 ? playerY - 10 : playerY;
}


/**
 * Spawnea un zombie individual de la horda en la posición calculada.
 * Verifica el límite de zombies antes de spawnear.
 * Cuando se alcanza la cantidad objetivo, detiene el intervalo.
 */
function spawnHordeZombie() {
    // Si ya se spawneó la cantidad objetivo, detiene el intervalo
    if (spawned) {
        system.clearRun(spawnInterval);
        return;
    }

    // Verifica que no se supere el límite de zombies en el mundo
    if (allyCount >= zombieCap) {
        system.clearRun(spawnInterval);
        spawned = false;
        return;
    }

    // Spawnea el zombie en la posición calculada
    dim.runCommandAsync(`summon zombie ${zx} ${zy} ${zz}`);
    allyCount++;

    // Incrementa el contador y verifica si terminamos
    spawned = true;
}

// ============================================================
// FUNCIÓN: HACER AWARE A LOS ZOMBIES
// Fuerza a los zombies a detectar jugadores en un radio amplio.
// ============================================================

/**
 * Añade el tag "aware" a todos los zombies que aún no tienen el tag "already".
 * El tag "aware" activa el componente de persecución de largo alcance.
 * @param {Dimension} dimension - Dimensión donde ejecutar el comando
 */
function makeZombiesAware(dimension) {
    dimension.runCommandAsync("tag @e[type=zombie,tag=!already] add aware");
}

/**
 * Procesa la cola de zombies con tag "aware":
 * - Les añade el tag "already" (para no re-procesarlos)
 * - Dispara el evento "aware" que activa su comportamiento de caza
 * Se ejecuta periódicamente con un pequeño delay para no saturar el servidor.
 * @param {Dimension} dimension - Dimensión activa
 */
function processAwareQueue(dimension) {
    dimension.runCommandAsync("tag @e[tag=aware,tag=!already] add already");
    dimension.runCommandAsync("tag @e[tag=aware,tag=already] remove aware");
}

/**
 * Dispara el evento "aware" en todos los zombies con tag pendiente,
 * luego limpia los tags después de un delay de 35 ticks.
 * @param {Dimension} dimension - Dimensión activa
 */
function triggerAwareEvent(dimension) {
    // Obtiene las tres dimensiones disponibles
    let overworld, nether, theEnd;
    try {
        overworld = world.getDimension("overworld");
        nether    = world.getDimension("nether");
        theEnd    = world.getDimension("the_end");
    } catch (e) {}

    // Dispara el evento en cada dimensión disponible
    for (const d of [overworld, nether, theEnd].filter(Boolean)) {
        d.runCommandAsync("event entity @e[tag=aware,tag=!already] aware");
    }

    // Después de 35 ticks, limpia los tags para evitar re-procesamiento
    system.runTimeout(() => {
        processAwareQueue(dimension);
    }, 35);
}


// ============================================================
// FUNCIÓN: BARRA DE DIFICULTAD
// Muestra el progreso del día actual como barra de acción
// en la pantalla de cada jugador (action bar).
// ============================================================

/**
 * Actualiza la barra de dificultad en el action bar de todos los jugadores.
 * Solo se muestra si el setting "diff" está activo.
 * Formato: §5Difficulty X.XX
 */
function updateDifficultyBar() {
    // Si el setting de barra de dificultad está desactivado, salir
    if (!getSetting("diff", false)) return;

    const players = world.getAllPlayers();
    if (players.length === 0) return;

    const day = world.getDay();
    const timeOfDay = world.getTimeOfDay();

    // Calcula la dificultad actual como porcentaje del día máximo
    // Se incrementa también con la fracción del día actual (timeOfDay / DAY_TICKS)
    const dayFraction = timeOfDay / DAY_TICKS;
    const rawDiff = Math.min((day + dayFraction) / MAX_DAY, 2) * 100;
    const difficulty = rawDiff.toFixed(2);

    // Muestra la barra en el action bar de cada jugador
    for (const player of players) {
        player.onScreenDisplay.setActionBar(`§5Difficulty ${difficulty}`);
    }
}

// ============================================================
// FUNCIÓN: ELIMINAR MONSTRUOS NO-ZOMBIE (zonly mode)
// Si el setting "zonly" está activo, teletransporta al vacío
// a todos los monstruos que no sean zombies.
// ============================================================

/**
 * Elimina monstruos que no son zombies si el modo "only zombies" está activo.
 * Los teletransporta a Y=-99999 (fuera del mundo = eliminación efectiva).
 * @param {Entity} entity - Entidad recién spawneada
 */
function handleZombieOnlyMode(entity) {
    if (entity.typeId === "minecraft:zombie") return;

    // Si "zonly" está activado, teleporta al vacío a todo monstruo que no sea zombie
    if (getSetting("zonly", true)) {
        entity.runCommandAsync("tp @s[family=monster,type=!zombie] 0 -99999 0");
    }
}


// ============================================================
// FUNCIÓN: CONFIGURAR DIFICULTAD DEL MUNDO
// Establece la dificultad de Minecraft en "hard" y ajusta
// XP orbs para que vayan al jugador más cercano.
// ============================================================

/**
 * Configura el mundo en dificultad "hard" y hace que los orbes
 * de XP se teletransporten al jugador más cercano (en radio 20).
 * Se ejecuta periódicamente para mantener la configuración.
 */
function setupWorldDifficulty() {
    let overworld, nether, theEnd;
    try {
        overworld = world.getDimension("overworld");
        nether    = world.getDimension("nether");
        theEnd    = world.getDimension("the_end");
    } catch (e) {}

    // Fuerza dificultad hard en todas las dimensiones
    for (const d of [overworld, nether, theEnd].filter(Boolean)) {
        d.runCommandAsync("difficulty hard");
        // Teletransporta los orbes de XP al jugador más cercano (radio 20)
        d.runCommandAsync("execute at @e[type=xp_orb] as @e[type=xp_orb] run tp @s @p[r=20]");
    }
}

// ============================================================
// FUNCIÓN: DESPAWN DE ZOMBIES DURANTE EL DÍA
// Durante la horda activa, los zombies tienen una pequeña
// probabilidad de despawnearse al amanecer.
// ============================================================

/**
 * Gestiona el despawn de zombies cuando llega el día durante una horda.
 * @param {Entity} entity - Entidad zombie
 */
function handleZombieDaytimeDespawn(entity) {
    if (entity.typeId !== "minecraft:zombie") return;
    if (!hordeActive) return;

    const day = world.getDay();
    // Solo despawnea si estamos cerca del límite de días
    const dayRatio = Math.min(day / MAX_DAY, 1);

    // Probabilidad creciente de despawn con el avance del día
    if (Math.random() < dayRatio * 0.1) {
        entity.triggerEvent("minecraft:start_despawn");
    }
}

// ============================================================
// FUNCIÓN: MANEJAR CORPSE (cadáveres)
// Cuando un zombie muere, su entidad se transforma en ranzie:corpse.
// Los jefes de horda tienen corpses con escala especial.
// ============================================================

/**
 * Aplica el tamaño correcto al corpse según si era un jefe de horda.
 * Se llama al momento de transformación del zombie en corpse.
 * @param {Entity} entity - Entidad corpse recién creada
 */
function handleCorpseScale(entity) {
    if (entity.typeId !== "ranzie:corpse") return;

    // Aplica los eventos de escala según el nombre del jefe original
    entity.runCommandAsync(`event entity @s[name="Giant Horde Leader"] giant`);
    entity.runCommandAsync(`event entity @s[name="Tank Horde Leader"] tank`);
    entity.runCommandAsync(`event entity @s[name="Necromancer Horde Leader"] summoner`);
}


// ============================================================
// FUNCIÓN: DETECTAR AWARENESS POR DAÑO AL JUGADOR
// Cuando un jugador recibe daño, los zombies cercanos se vuelven
// "aware" y van al jugador dañado. También spawna partículas de sangre.
// ============================================================

/**
 * Se activa al detectar daño sobre una entidad.
 * Si el dañado es un jugador: vuelve aware a los zombies cercanos
 * y spawnea partículas de sangre del jugador.
 * Si el dañado es un zombie: spawnea partículas de sangre del zombie.
 * @param {EntityHurtAfterEvent} event - Evento de daño
 */
function onEntityHurt(event) {
    const { hurtEntity } = event;

    if (hurtEntity.typeId === "minecraft:player") {
        // El jugador recibió daño: activa zombies cercanos
        const loc = hurtEntity.location;
        hurtEntity.runCommandAsync("tag @e[type=zombie,r=10,tag=!already] add aware");

        // Spawnea partículas de sangre del jugador en su posición
        hurtEntity.dimension.spawnParticle("ranzie:player_blood", {
            x: loc.x,
            y: loc.y,
            z: loc.z,
        });
    } else if (hurtEntity.typeId === "minecraft:zombie") {
        // Un zombie recibió daño: partículas de sangre del zombie
        const loc = hurtEntity.location;
        hurtEntity.dimension.spawnParticle("ranzie:blood", {
            x: loc.x,
            y: loc.y,
            z: loc.z,
        });
    }
}

// ============================================================
// FUNCIÓN: AWARENESS POR CAMPANA
// Cuando un jugador activa una campana, todos los zombies
// cercanos se vuelven "aware" (los buscan activamente).
// ============================================================

/**
 * Activa la conciencia de todos los zombies cuando se usa una campana.
 * @param {BlockComponentPlayerInteractEvent} event - Evento de interacción con bloque
 */
function onBellRing(event) {
    const { block, player } = event;
    if (block.typeId !== "minecraft:bell") return;

    // Todos los zombies que no estén ya procesados se vuelven aware
    player.runCommandAsync("tag @e[type=zombie,tag=!already] add aware");
}

// ============================================================
// FUNCIÓN: AWARENESS POR CUERNO DE CABRA
// El ítem goat_horn activa la conciencia de todos los zombies.
// ============================================================

/**
 * Activa la conciencia de zombies cuando se usa un cuerno de cabra.
 * @param {ItemUseAfterEvent} event - Evento de uso de ítem
 */
function onGoatHornUse(event) {
    const { itemStack, source } = event;
    if (itemStack.typeId !== "minecraft:goat_horn") return;

    source.runCommandAsync("tag @e[type=zombie,tag=!already] add aware");
}


// ============================================================
// FUNCIÓN: BLOQUEAR SUEÑO DURANTE LUNA DE SANGRE / HORDA
// Impide que los jugadores duerman si hay una horda activa
// o si es luna llena.
// ============================================================

/**
 * Cancela el intento de dormir de un jugador durante eventos activos.
 * @param {PlayerSleepAttemptEvent} event - Evento de intento de sueño
 */
function onSleepAttempt(event) {
    const { player, block } = event;
    if (block.typeId !== "minecraft:bed") return;

    const timeOfDay = world.getTimeOfDay();
    const moonPhase = world.getMoonPhase();

    // Detecta si es luna llena o hay horda activa
    const isNightFullMoon = timeOfDay >= 12000 && timeOfDay <= 24000 && moonPhase === 0;
    const isDuringHorde   = hordeActive;

    if (isNightFullMoon || isDuringHorde) {
        event.cancel = true;
        player.sendMessage("§cYou're too afraid to sleep right now");
    }

    if (isDuringHorde) {
        player.sendMessage("A feeling of impending dread prevents you from sleeping");
    }
}

// ============================================================
// FUNCIÓN: RASTREO DE AWARENESS POR TICK
// Activa el evento "aware" en zombies que tienen el tag pendiente,
// para que el motor de entidades procese la nueva detección de objetivo.
// ============================================================

/**
 * Dispara el evento de entidad "aware" en zombies tagueados,
 * haciéndolos cambiar su componente de seguimiento al rango extendido.
 * @param {Entity} entity - Entidad zombie
 */
function onZombieAware(entity) {
    entity.triggerEvent("aware");
}


// ============================================================
// UI - MENÚ PRINCIPAL DE CONFIGURACIÓN
// Muestra el menú "Rise and Survive Settings" con tres modos:
//   Basic   → Toggles + campos de texto básicos
//   Advanced → Toggles de habilidades + sliders
//   Extra   → Acciones manuales (invocar hordas, tipos especiales)
// ============================================================

/**
 * Muestra el menú principal de selección de modo de configuración.
 * Se abre al usar el ítem "settings" (ranzie:settings).
 * @param {Player} player - Jugador que abrió el menú
 */
function showMainMenu(player) {
    new ActionFormData()
        .title("§l§cRise and Survive Settings")
        .body(
            "Choose your configuration mode:\n\n" +
            "§aBasic§r - Simple settings for quick setup\n" +
            "§6Advanced§r - Full control over all features\n" +
            "§cExtra§r - Access extra features"
        )
        .button("§aBasic")
        .button("§6Advanced")
        .button("§cExtra")
        .show(player)
        .then((result) => {
            if (result.canceled) return;
            if (result.selection === 0) showBasicSettings(player);
            if (result.selection === 1) showAdvancedMenu(player);
            if (result.selection === 2) showExtraSettings(player);
        });
}

// ============================================================
// UI - MENÚ AVANZADO (sub-menú de Advanced)
// Dentro de "Advanced" el jugador elige entre:
//   Abilities → Sliders de probabilidad de habilidades de zombie
//   Corpse    → Configuración del sistema de cadáveres
// ============================================================

/**
 * Muestra el sub-menú de Advanced con las opciones Abilities y Corpse.
 * @param {Player} player - Jugador que navega el menú
 */
function showAdvancedMenu(player) {
    new ActionFormData()
        .title("§l§cRise and Survive Settings")
        .body("Choose your configuration mode:")
        .button("§aAbilities")
        .button("§6Corpse")
        .show(player)
        .then((result) => {
            if (result.canceled) return;
            if (result.selection === 0) showAdvancedSettings(player);
            if (result.selection === 1) showCorpseSettings(player);
        });
}


// ============================================================
// UI - CONFIGURACIÓN BÁSICA (Basic Settings)
// ModalFormData con toggles (on/off) para las opciones principales
// y campos de texto para los valores numéricos (max day, horde spawn, etc.)
// ============================================================

/**
 * Muestra el formulario de configuración básica.
 * Incluye toggles de comportamiento y campos de texto para valores numéricos.
 * @param {Player} player - Jugador que edita la configuración
 */
function showBasicSettings(player) {
    const form = new ModalFormData()
        .title("§l§cRise & Survive Settings");

    // --- Agrega los toggles de rasSettings ---
    for (const s of rasSettings) {
        // Lee el valor guardado o usa el default
        const currentValue = getSetting(s.id, s.default);
        form.toggle(s.name, currentValue);
    }

    // --- Agrega los campos de texto de sliderSettings ---
    for (const s of sliderSettings) {
        const currentValue = String(getSetting(s.id, s.default));
        form.label(s.name);
        form.textField("", s.default, currentValue);
    }

    form.show(player).then((result) => {
        saveBasicSettings(player, result);
    });
}

/**
 * Guarda los valores del formulario básico en las dynamic properties del mundo.
 * @param {Player} player - Jugador
 * @param {ModalFormResponse} result - Resultado del formulario
 */
function saveBasicSettings(player, result) {
    if (result.canceled) {
        player.sendMessage("§7Settings unchanged.");
        return;
    }

    const values = result.formValues;
    let idx = 0;

    // --- Guarda los toggles de rasSettings ---
    for (const s of rasSettings) {
        world.setDynamicProperty(s.id, values[idx]);
        idx++;
    }

    // --- Guarda los campos de texto de sliderSettings ---
    for (const s of sliderSettings) {
        const rawVal = values[idx];
        idx++;
        if (rawVal === undefined || rawVal === null) continue;

        const parsed = parseFloat(rawVal);
        if (isNaN(parsed)) continue;

        // Guarda el valor y actualiza la variable global correspondiente
        world.setDynamicProperty(s.id, parsed);

        if (s.id === "max_day")         MAX_DAY         = parsed;
        if (s.id === "max_horde_spawn") MAX_HORDE_SPAWN = parsed;
        if (s.id === "infection")       INFECTION       = parsed;
        if (s.id === "zcap")            zombieCap       = parsed;
        if (s.id === "growth")          GROW            = parsed;
    }

    player.sendMessage("§aRise & Survive settings saved successfully!");
}


// ============================================================
// UI - CONFIGURACIÓN AVANZADA / ABILITIES (R&S Advance Settings)
// ModalFormData con toggles para activar tipos de zombie especiales
// y sliders para sus probabilidades individuales.
// ============================================================

/**
 * Muestra el formulario de configuración avanzada de habilidades.
 * Incluye toggles de tipos de zombie y sliders de probabilidad.
 * @param {Player} player - Jugador que edita la configuración
 */
function showAdvancedSettings(player) {
    const form = new ModalFormData()
        .title("§l§cR&S Advance Settings");

    // --- Toggles de tipos de zombie (rasSettings2 parte toggle) ---
    // Cada toggle activa/desactiva el tipo de zombie completamente
    const zombieTypeToggles = [
        { id: "s2_potion",  name: "🧟 Zombies with potion effects" },
        { id: "s2_warner",  name: "🧟 Zombies warner" },
        { id: "s2_ender",   name: "🧟 Zombies ender" },
        { id: "s2_witch",   name: "🧟 Zombies witch" },
        { id: "s2_jumper",  name: "🧟 Zombie jumper" },
        { id: "s2_bomber",  name: "🧟 Zombie bomber" },
        { id: "s2_spitter", name: "🧟 Zombie spitter" },
        { id: "s2_crawler", name: "🧟 Zombie crawler" },
        { id: "s2_scaling", name: "🧟 Scaling zombie hp" },
    ];

    for (const t of zombieTypeToggles) {
        form.toggle(t.name, getSetting(t.id, false));
    }

    // --- Sliders de probabilidad de rasSettings2 ---
    for (const s of rasSettings2) {
        const currentVal = getSetting(s.id, s.default);
        form.label(`${s.name}${currentVal}`);
        form.slider("", s.min, s.max, 1, currentVal);
    }

    form.show(player).then((result) => {
        saveAdvancedSettings(player, result);
    });
}

/**
 * Guarda los valores del formulario avanzado (Abilities).
 * @param {Player} player - Jugador
 * @param {ModalFormResponse} result - Resultado del formulario
 */
function saveAdvancedSettings(player, result) {
    if (result.canceled) {
        player.sendMessage("§7Settings unchanged.");
        return;
    }

    const values = result.formValues;
    let idx = 0;

    // Guarda los 9 toggles de tipos de zombie
    const zombieTypeIds = [
        "s2_potion","s2_warner","s2_ender","s2_witch","s2_jumper",
        "s2_bomber","s2_spitter","s2_crawler","s2_scaling"
    ];
    for (const id of zombieTypeIds) {
        world.setDynamicProperty(id, values[idx]);
        idx++;
    }

    // Guarda los sliders de rasSettings2 y actualiza las variables globales
    for (const s of rasSettings2) {
        // Cada slider ocupa 2 posiciones en formValues: label + slider
        idx++; // salta el label
        const val = values[idx];
        idx++;
        if (val === undefined || val === null) continue;
        const parsed = parseFloat(val);
        if (isNaN(parsed)) continue;

        world.setDynamicProperty(s.id, parsed);

        // Actualiza la variable global correspondiente
        if (s.id === "za")       ZA       = parsed;
        if (s.id === "zm")       ZM       = parsed;
        if (s.id === "zp")       ZP       = parsed;
        if (s.id === "zc")       ZC       = parsed;
        if (s.id === "spotion")  sPOTION  = parsed;
        if (s.id === "swarner")  sWARNER  = parsed;
        if (s.id === "sender")   sENDER   = parsed;
        if (s.id === "switch")   sWITCH   = parsed;
        if (s.id === "sjumper")  sJUMPER  = parsed;
        if (s.id === "sbomber")  sBOMBER  = parsed;
        if (s.id === "sspitter") sSPITTER = parsed;
        if (s.id === "scrawler") sCRAWLER = parsed;
        if (s.id === "sprint")   SPRINT   = parsed;
    }

    player.sendMessage("§aRise & Survive settings saved successfully!");
}


// ============================================================
// UI - CONFIGURACIÓN DE CORPSE (Rise & Survive Settings - Corpse)
// Permite configurar el sistema de cadáveres:
//   - Allow corpse (toggle)
//   - Corpse physics (toggle)
//   - Zombies can kick corpse (toggle)
//   - Corpse spawn limit (campo de texto)
//   - Horizontal kick intensity (slider)
//   - Vertical kick intensity (slider)
// ============================================================

/**
 * Muestra el formulario de configuración del sistema de cadáveres.
 * @param {Player} player - Jugador que edita la configuración
 */
function showCorpseSettings(player) {
    const form = new ModalFormData()
        .title("§l§cRise & Survive Settings");

    // --- Toggles del sistema de corpse ---
    for (const s of corpseSettings) {
        form.toggle(s.name, getSetting(s.id, s.default));
    }

    // --- Campo de texto: límite de corpse en el mundo ---
    for (const s of sliderSettingss) {
        form.label(`★ Corpse spawn limit (how many corpse are allowed to spawn in your world)`);
        form.textField("", s.default, String(getSetting(s.id, s.default)));
    }

    // --- Sliders de intensidad de patada ---
    for (const s of corpseSliders) {
        const currentVal = getSetting(s.id, s.default);
        form.label(`${s.name}${currentVal}`);
        form.slider("", s.min, s.max, 1, currentVal);
    }

    form.show(player).then((result) => {
        saveCorpseSettings(player, result);
    });
}

/**
 * Guarda la configuración del sistema de cadáveres.
 * @param {Player} player - Jugador
 * @param {ModalFormResponse} result - Resultado del formulario
 */
function saveCorpseSettings(player, result) {
    if (result.canceled) {
        player.sendMessage("§7Settings unchanged.");
        return;
    }

    const values = result.formValues;
    let idx = 0;

    // Guarda toggles de corpse
    for (const s of corpseSettings) {
        world.setDynamicProperty(s.id, values[idx]);
        idx++;
    }

    // Guarda el límite de corpse (campo de texto)
    for (const s of sliderSettingss) {
        idx++; // salta label
        const rawVal = values[idx];
        idx++;
        if (rawVal !== undefined && rawVal !== null) {
            const parsed = parseFloat(rawVal);
            if (!isNaN(parsed)) {
                world.setDynamicProperty(s.id, parsed);
            }
        }
    }

    // Guarda los sliders de intensidad de patada
    for (const s of corpseSliders) {
        idx++; // salta label
        const val = values[idx];
        idx++;
        if (val !== undefined && val !== null) {
            world.setDynamicProperty(s.id, val);
        }
    }

    player.sendMessage("§aRise & Survive settings saved successfully!");
}


// ============================================================
// UI - CONFIGURACIÓN EXTRA (Extra Settings)
// Permite invocar manualmente tipos específicos de zombie/jefe.
// Útil para pruebas o eventos manuales durante el juego.
// ============================================================

/**
 * Muestra el formulario de configuración extra con botones para
 * invocar hordas y tipos especiales de zombie manualmente.
 * @param {Player} player - Jugador que abre el menú extra
 */
function showExtraSettings(player) {
    new ActionFormData()
        .title("§l§6Extra Settings")
        .body("§lTrigger R&S Features")
        .button("§cSummon Horde")
        .button("§fSummon Warner")
        .button("§5Summon Ender")
        .button("§aSummon Witch")
        .button("§eSummon Jumper")
        .button("§cSummon Bomber")
        .button("§2Summon Spitter")
        .button("§9Summon Crawler")
        .button("§dSummon Giant")
        .button("§cSummon Tank")
        .button("§bSummon Necromancer")
        .show(player)
        .then((result) => {
            if (result.canceled) return;
            handleExtraAction(player, result.selection);
        });
}

/**
 * Ejecuta la acción seleccionada en el menú Extra.
 * @param {Player} player - Jugador que ejecuta la acción
 * @param {number} selection - Índice del botón presionado
 */
function handleExtraAction(player, selection) {
    const loc = player.location;
    const d = player.dimension;

    switch (selection) {
        case 0: // Summon Horde - activa la horda manualmente
            triggerHorde();
            break;
        case 1: // Summon Warner
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!warner,r=5] warner");
            });
            break;
        case 2: // Summon Ender
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!ender,r=5] ender");
            });
            break;
        case 3: // Summon Witch
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!witch,r=5] witch");
            });
            break;
        case 4: // Summon Jumper
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!mlg,r=5] mlg");
            });
            break;
        case 5: // Summon Bomber
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!bomber,r=5] kaboom");
            });
            break;
        case 6: // Summon Spitter
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!spitter,r=5] spit");
            });
            break;
        case 7: // Summon Crawler
            d.runCommandAsync(`summon zombie ${loc.x} ${loc.y} ${loc.z}`).then(() => {
                d.runCommandAsync("event entity @e[type=zombie,tag=!crawler,r=5] crawler");
            });
            break;
        case 8: // Summon Giant (jefe)
            d.runCommandAsync(`summon zombie ${loc.x} ~ ${loc.z} as_giant "Giant Horde Leader"`);
            break;
        case 9: // Summon Tank (jefe)
            d.runCommandAsync(`summon zombie ${loc.x} ~ ${loc.z} tank "Tank Horde Leader"`);
            break;
        case 10: // Summon Necromancer (jefe)
            d.runCommandAsync(`summon zombie ${loc.x} ~ ${loc.z} summoner "Necromancer Horde Leader"`);
            break;
    }
}


// ============================================================
// FUNCIÓN: CARGAR SETTINGS AL INICIAR
// Lee todos los dynamic properties guardados y actualiza
// las variables globales con los valores almacenados.
// ============================================================

/**
 * Lee todas las configuraciones guardadas en el mundo y actualiza
 * las variables globales del mod.
 * Se llama una vez al arrancar el script.
 */
function loadSettings() {
    MAX_DAY         = getSetting("max_day",         5);
    MAX_HORDE_SPAWN = getSetting("max_horde_spawn", 25);
    INFECTION       = getSetting("infection",       0);
    zombieCap       = getSetting("zcap",            25);
    GROW            = getSetting("growth",          6);
    SPRINT          = getSetting("sprint",          3);

    ZA       = getSetting("za",       2);
    ZM       = getSetting("zm",       40);
    ZP       = getSetting("zp",       30);
    ZC       = getSetting("zc",       20);
    sPOTION  = getSetting("spotion",  5);
    sWARNER  = getSetting("swarner",  5);
    sENDER   = getSetting("sender",   5);
    sWITCH   = getSetting("switch",   5);
    sJUMPER  = getSetting("sjumper",  5);
    sBOMBER  = getSetting("sbomber",  5);
    sSPITTER = getSetting("sspitter", 5);
    sCRAWLER = getSetting("scrawler", 5);
}

// ============================================================
// FUNCIÓN: TICK PRINCIPAL (system.runInterval)
// Se ejecuta cada tick. Orquesta todas las funciones periódicas
// del mod: luna, hordas, dificultad, scoreboards.
// ============================================================

/**
 * Tick principal del mod. Se ejecuta cada 20 ticks (1 segundo).
 * Coordina: rastreo lunar, hordas, barra de dificultad y scoreboards.
 */
function mainTick() {
    // Asegura que la dimensión esté disponible
    try {
        dim = world.getDimension("overworld");
    } catch (e) { return; }

    // Inicializa los scoreboards si aún no se crearon
    setupObjectives();

    // Actualiza el rastreo de la luna / blood moon
    moon_track();

    // Verifica si debe iniciarse una horda
    checkHordeSpawn();

    // Actualiza la barra de dificultad en pantalla
    updateDifficultyBar();

    // Actualiza los scores de minería/colocación de zombies
    updateZombieScores();

    // Configura la dificultad del mundo
    setupWorldDifficulty();
}


// ============================================================
// REGISTRO COMPLETO DE EVENTOS (Event Listeners)
// Conecta todos los eventos del juego con las funciones del mod.
// Basado en el mapeo EXACTO de todos los subscribe() y runInterval()
// del bytecode original, con sus índices y frecuencias reales.
// ============================================================

// --- worldInitialize: inicialización del mundo ---
world.afterEvents.worldInitialize.subscribe(() => {
    onWorldInitialize();
});

world.afterEvents.worldInitialize.subscribe(() => {
    onWorldInitialize2();
});

// --- entitySpawn: zombie spawn → habilidades + equipo ---
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!entity) return;
    if (entity.typeId === "minecraft:zombie") {
        assignZombieAbilities(entity);
    }
});

world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!entity) return;
    if (entity.typeId === "minecraft:zombie") {
        equipZombie(entity);
    }
});

// --- entitySpawn: modo solo zombies (zonly) ---
world.afterEvents.entitySpawn.subscribe((event) => {
    handleZombieOnlyMode(event.entity);
});

// --- entitySpawn: corpse spawn → escala + physics ---
world.afterEvents.entitySpawn.subscribe((event) => {
    onCorpseSpawn(event);
});

// --- entitySpawn: zombie speed update ---
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (entity && entity.typeId === "minecraft:zombie") {
        updateZombieSpeed(entity);
    }
});

// --- entitySpawn: setup de horda si está activa ---
// Cuando hay horda activa, los zombies spawneados se vuelven aware inmediatamente
world.afterEvents.entitySpawn.subscribe((event) => {
    if (!hordeActive) return;
    const { entity } = event;
    if (entity && entity.typeId === "minecraft:zombie") {
        try {
            entity.triggerEvent("aware");
        } catch (e) {}
    }
});

// --- entityHurt: blood particles + awareness + infección ---
world.afterEvents.entityHurt.subscribe((event) => {
    onEntityHurt(event);
});

world.afterEvents.entityHurt.subscribe((event) => {
    checkInfection(event);
});

// --- playerInteractWithBlock: campana → awareness ---
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    onBellRing(event);
});

// --- ranzie:settings → abrir UI de configuración ---
// beforeEvents.itemUse cancela el consumo y system.run abre el menú
// fuera del contexto del evento (necesario para mostrar Forms en 1.17).
world.beforeEvents.itemUse.subscribe((event) => {
    const { itemStack, source } = event;
    if (!itemStack || itemStack.typeId !== "minecraft:diamond") return;
    if (source.typeId !== "minecraft:player"){
            showMainMenu(source);
       }
    }

);

// --- itemUse (after): how to play paper ---
world.afterEvents.itemUse.subscribe((event) => {
    onHowToPlayItem(event);
});

// --- playerSleep (before): bloquear sueño en luna llena/horda ---
world.beforeEvents.playerSleep.subscribe((event) => {
    onSleepAttempt(event);
});

// --- effectAdd (before): cancelar hunger/wither largos (Java regen) ---
world.beforeEvents.effectAdd.subscribe((event) => {
    onEffectAddHunger(event);
});

world.beforeEvents.effectAdd.subscribe((event) => {
    onEffectAddWither(event);
});

// --- itemCompleteUse: alimentos → saturación; golden apple → curar infección ---
world.afterEvents.itemCompleteUse.subscribe((event) => {
    onFoodEaten(event);
});

world.afterEvents.itemCompleteUse.subscribe((event) => {
    infectPlayer(event);
});

// --- entityDie: resetear saturación al morir ---
world.afterEvents.entityDie.subscribe((event) => {
    onPlayerDeath(event);
});

// --- playerSpawn: primer join → dar ítems de settings ---
world.afterEvents.playerSpawn.subscribe((event) => {
    onPlayerFirstSpawn(event);
});

world.afterEvents.playerSpawn.subscribe((event) => {
    onPlayerSpawn(event);
});

// --- entityHitEntity: sweep attack y critical hits ---
world.afterEvents.entityHitEntity.subscribe((event) => {
    onEntityHitEntity(event);
});

// --- entityHitEntity: segundo handler (PvP directo) ---
world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
    if (!getSetting("pvp", false)) return;
    if (damagingEntity.typeId === "minecraft:player" &&
        hitEntity.typeId === "minecraft:player") {
        handleHit(damagingEntity, hitEntity);
    }
});

// ============================================================
// INTERVALS PERIÓDICOS
// Todos los system.runInterval del mod original, con sus
// frecuencias exactas extraídas del bytecode.
// ============================================================

// Tick principal: luna, hordas, dificultad (cada 50 ticks ≈ 2.5s)
system.runInterval(() => {
    try {
        dim = world.getDimension("overworld");
        setupObjectives();
        moon_track();
        checkHordeSpawn();
        updateDifficultyBar();
        updateZombieScores();
        setupWorldDifficulty();
    } catch (e) {}
}, 50);

// Awareness tick: procesa la cola de zombies aware (cada 5 ticks)
system.runInterval(() => {
    try {
        dim = world.getDimension("overworld");
        processAwareQueue(dim);
    } catch (e) {}
}, 5);

// Aware event trigger: dispara el evento de comportamiento (cada 200 ticks ≈ 10s)
system.runInterval(() => {
    try {
        dim = world.getDimension("overworld");
        triggerAwareEvent(dim);
    } catch (e) {}
}, 200);

// Activar habilidades de zombies (cada 20 ticks = 1s)
system.runInterval(() => {
    try {
        const overworld = world.getDimension("overworld");
        for (const entity of overworld.getEntities({ type: "minecraft:zombie" })) {
            if (entity.isValid()) activateZombieAbilities(entity);
        }
    } catch (e) {}
}, 20);

// Update de scores de zombies (cada 100 ticks ≈ 5s)
system.runInterval(() => {
    try { updateZombieScores(); } catch (e) {}
}, 100);

// Dynamic torch (cada 5 ticks)
system.runInterval(() => {
    try { processDynamicTorch(); } catch (e) {}
}, 5);

// Saturación / Java regen (cada 7 ticks)
system.runInterval(() => {
    try { processSaturationTick(); } catch (e) {}
    try { cleanupCooldownMap(); }  catch (e) {}
}, 7);

// Fence damage + corpse physics (cada DAMAGE_INTERVAL = 20 ticks)
system.runInterval(() => {
    try { processFenceDamage();   } catch (e) {}
    try { processCorpsePhysics(); } catch (e) {}
}, DAMAGE_INTERVAL);

// Corpse cap enforcement (cada 100 ticks ≈ 5s)
system.runInterval(() => {
    try { enforceCorpseCap(); } catch (e) {}
}, 100);

// ============================================================
// ARRANQUE INMEDIATO
// loadSettings se llama dentro de onWorldInitialize para
// asegurar que las dynamic properties ya estén disponibles.
// ============================================================

// ============================================================
// TODOS LOS EVENT LISTENERS Y INTERVALS DEL MOD
// Orden y frecuencias extraídas exactamente del bytecode.
// ============================================================

// [0x1] runInterval 50 ticks: moon_track + entidad spawn listener
system.runInterval(() => {
    try { moon_track(); } catch (e) {}
}, 50);

// [0x2] entitySpawn → bloqueo de dormir / awareness awareness
world.afterEvents.entitySpawn.subscribe((event) => {
    handleZombieOnlyMode(event.entity);
});

// [0x3] beforeEvents playerInteractWithBlock → campana awareness
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    onBellRing(event);
});

// [0x9] entitySpawn → setupObjectives si primer zombie
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!entity) return;
    if (entity.typeId === 'minecraft:zombie' && !objectivesCreated) {
        setupObjectives();
    }
});

// [0xb] runInterval 200 ticks: updateZombieScores periódico
system.runInterval(() => {
    updateZombieScores();
}, 200);

// [0xd] entitySpawn → activar habilidades de zombie (animaciones)
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (entity && entity.typeId === 'minecraft:zombie') {
        activateZombieAbilities(entity);
    }
});

// [0xe] runInterval 40 ticks: tick de awareness + horda
system.runInterval(() => {
    try {
        dim = world.getDimension('overworld');
        processAwareQueue(dim);
        checkHordeSpawn();
    } catch (e) {}
}, 40);

// [0x17] entitySpawn (solo si hordeActive): zombies de horda se vuelven aware
world.afterEvents.entitySpawn.subscribe((event) => {
    if (!hordeActive) return;
    const { entity } = event;
    if (entity && entity.typeId === 'minecraft:zombie') {
        try { entity.triggerEvent('aware'); } catch (e) {}
    }
});

// [0x18] runInterval 30 ticks: triggerAwareEvent
system.runInterval(() => {
    try {
        dim = world.getDimension('overworld');
        triggerAwareEvent(dim);
    } catch (e) {}
}, 30);

// [0x21] entitySpawn → equipZombieReal (armadura + armas reales)
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (entity && entity.typeId === 'minecraft:zombie' && !entity.hasTag(NEW_TAG)) {
        onNewZombieSpawn(event);
    }
});

// [0x22] runInterval 20 ticks: moon_track + dificultad + XP
system.runInterval(() => {
    try {
        dim = world.getDimension('overworld');
        setupObjectives();
        updateDifficultyBar();
        setupWorldDifficulty();
    } catch (e) {}
}, 20);

// [0x24] runInterval 100 ticks: dynamic torch
system.runInterval(() => {
    try { processDynamicTorch(); } catch (e) {}
}, 100);

// [0x25] entitySpawn → asignar habilidades especiales (ZM, ZP, ZA, etc.)
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (entity && entity.typeId === 'minecraft:zombie' && entity.hasTag(NEW_TAG)) {
        assignZombieAbilities(entity);
    }
});

// [0x26] entitySpawn → corpse (escala de jefes de horda)
world.afterEvents.entitySpawn.subscribe((event) => {
    onNewEntitySpawnForCorpse(event);
});

// [0x27] entitySpawn → corpse (physics inicial)
world.afterEvents.entitySpawn.subscribe((event) => {
    onCorpseSpawn(event);
});

// [0x28] entityHurt → sangre + awareness
world.afterEvents.entityHurt.subscribe((event) => {
    onEntityHurt(event);
});

// [0x29] entityHurt → infección
world.afterEvents.entityHurt.subscribe((event) => {
    checkInfection(event);
});

// [0x2a] beforeEvents playerInteractWithBlock → campana (2do handler goat horn)
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    // Segundo handler: solo para bloquear interacción con cama en blood moon
    onSleepAttempt(event);
});

// [0x3a] playerSpawn → primer join (dar ítems de settings)
world.afterEvents.playerSpawn.subscribe((event) => {
    onPlayerFirstSpawn(event);
});

// [0x53] worldInitialize → inicialización principal
world.afterEvents.worldInitialize.subscribe(() => {
    onWorldInitialize();
});

// [0x54] runInterval DAMAGE_INTERVAL=20: daño de bloques spiked/wire/cheval
system.runInterval(() => {
    try { processDamageBlocks(); } catch (e) {}
}, DAMAGE_INTERVAL);

// [0x55] runInterval 5 ticks: dynamic torch (alta frecuencia)
system.runInterval(() => {
    try { processDynamicTorch(); } catch (e) {}
}, 5);

// [0x56] afterEvents itemUse async → armas custom (bolo, katana, etc.)
world.afterEvents.itemUse.subscribe((event) => {
    try {
        onHowToPlayItem(event);
        const { itemStack, source } = event;
        if (!itemStack || !source) return;
        if (itemStack.typeId.includes('katana') || itemStack.typeId.includes('longsword')) {
            const currentZoom = zoomLevel.get(source.id) || 0;
            if (currentZoom > 0) removeZoom(source);
        }
    } catch (e) {}
});

// [0x57] entitySpawn → CORPSE_TAG handler
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!entity || entity.typeId !== CORPSE) return;
    if (!entity.hasTag(CORPSE_TAG)) {
        onNewEntitySpawnForCorpse(event);
    }
});

// [0x58] entitySpawn → fence tag en zombies
world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!entity || entity.typeId !== 'minecraft:zombie') return;
    // Marca el zombie con fenceTag si spawneó en una valla
    try {
        const loc   = entity.location;
        const block = entity.dimension.getBlock({
            x: Math.floor(loc.x), y: Math.floor(loc.y - 0.1), z: Math.floor(loc.z)
        });
        if (block && (WIRE_BLOCK_ID.includes(block.typeId) ||
                      CHEVAL_BLOCK_ID.includes(block.typeId) ||
                      PLATE_BLOCK_ID.includes(block.typeId))) {
            entity.addTag(fenceTag);
        }
    } catch (e) {}
});

// [0x5a] runInterval 200 ticks: enforceCorpseCap
system.runInterval(() => {
    try { enforceCorpseCap(); } catch (e) {}
}, 200);

// [0x5c] runInterval 200 ticks: processCorpsePhysics (kick + límite)
system.runInterval(() => {
    try { processCorpsePhysics(); } catch (e) {}
}, 200);

// [0x5e] entityHitEntity → sweep attack (handleHitFull)
world.afterEvents.entityHitEntity.subscribe((event) => {
    handleHitFull(event.damagingEntity, event.hitEntity);
});

// [0x5f] runInterval 7 ticks: saturación/regeneración Java
system.runInterval(() => {
    try { processSaturationTick(); } catch (e) {}
    try { cleanupCooldownMap();   } catch (e) {}
}, 7);

// [0x60] itemCompleteUse → alimentos dan saturación
world.afterEvents.itemCompleteUse.subscribe((event) => {
    onFoodEaten(event);
});

// [0x61] entityDie → reset saturación al morir
world.afterEvents.entityDie.subscribe((event) => {
    onPlayerDeath(event);
});

// [0x62] playerSpawn → inicializar saturación al spawner
world.afterEvents.playerSpawn.subscribe((event) => {
    onPlayerSpawn(event);
});

// [0x63] beforeEvents effectAdd → cancelar hunger largo
world.beforeEvents.effectAdd.subscribe((event) => {
    onEffectAddHunger(event);
});

// [0x64] beforeEvents effectAdd → cancelar wither largo
world.beforeEvents.effectAdd.subscribe((event) => {
    onEffectAddWither(event);
});

// [0x70] worldInitialize → segundo handler (corpse settings)
world.afterEvents.worldInitialize.subscribe(() => {
    onWorldInitialize2();
});

// [0x71] entityHitEntity → PvP directo jugador-jugador
world.afterEvents.entityHitEntity.subscribe((event) => {
    onEntityHitEntity(event);
});

// [0x73] itemCompleteUse → curar infección con Golden Apple
world.afterEvents.itemCompleteUse.subscribe((event) => {
    onCureInfectionItem(event);
});

// [0x79] entityDie → guardar tiempo de infección al morir
world.afterEvents.entityDie.subscribe((event) => {
    onInfectionPlayerDeath(event);
});

// [0x7a] playerSpawn → reanudar infección al respawnear
world.afterEvents.playerSpawn.subscribe((event) => {
    onInfectionPlayerRespawn(event);
});

// [0x7b] runInterval 20 ticks: tick de infección (partículas + mensaje)
system.runInterval(() => {
    try { processInfectionTick();    } catch (e) {}
    try { processInfectionVisuals(); } catch (e) {}
}, 20);

// [0x7f] playerBreakBlock → actualizar estado de vallas
world.afterEvents.playerBreakBlock.subscribe((event) => {
    onPlayerBreakBlock(event);
});

// [0x80] playerPlaceBlock → actualizar estado de vallas
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    onPlayerPlaceBlock(event);
});

// [0x81] entityDie → limpieza genérica (prevPos, animDelay, kickCooldown)
world.afterEvents.entityDie.subscribe((event) => {
    onEntityDieGeneric(event);
    onEntityDieFence(event);
});

// [0x83] runInterval 0 (cada tick): corpse anim tick
// (interval sin delay = each tick del engine, muy ligero)
// Corpse anim tick → intervalo mínimo 1 para evitar stack overflow
system.runInterval(() => {
    try { processCorpseAnimTick(); } catch (e) {}
}, 1);


// ============================================================
// SISTEMA DE HAMBRE / SATURACIÓN (Java Regeneration)
// Replica el sistema de hambre de Java Edition:
// - Los alimentos dan puntos de saturación
// - Al tener saturación alta, el jugador se regenera
// - Al tener hambre baja, el jugador recibe wither
// - Las muertes y respawns reinician la saturación
// ============================================================

// Mapa de saturación: cuántos puntos da cada alimento al comerlo
// (valor * 1.7 aprox, tal como Java Edition)
const foodSaturationValues = {
    "minecraft:enchanted_golden_apple": 10,
    "minecraft:golden_apple":           8,
    "minecraft:golden_carrot":          6,
    "minecraft:cooked_mutton":          6,
    "minecraft:cooked_porkchop":        6,
    "minecraft:cooked_salmon":          6,
    "minecraft:cooked_beef":            6,
    "minecraft:spider_eye":             4,
    "minecraft:baked_potato":           5,
    "minecraft:beetroot":               5,
    "minecraft:beetroot_soup":          5,
    "minecraft:bread":                  2,
    "minecraft:carrot":                 2,
    "minecraft:cooked_chicken":         2,
    "minecraft:cooked_cod":             2,
    "minecraft:cooked_rabbit":          2,
    "minecraft:mushroom_stew":          2,
    "minecraft:rabbit_stew":            2,
    "minecraft:apple":                  3,
    "minecraft:chorus_fruit":           3,
    "minecraft:melon_slice":            3,
    "minecraft:poisonous_potato":       3,
    "minecraft:potato":                 3,
    "minecraft:pumpkin_pie":            3,
    "minecraft:beef":                   1,
    "minecraft:mutton":                 1,
    "minecraft:porkchop":               1,
    "minecraft:rabbit":                 1,
    "minecraft:chicken":                1,
    "minecraft:cookie":                 1,
    "minecraft:glow_berries":           1,
    "minecraft:honey_bottle":           1,
    "minecraft:cod":                    1,
    "minecraft:salmon":                 1,
    "minecraft:tropical_fish":          1,
    "minecraft:pufferfish":             1,
    "minecraft:rotten_flesh":           1,
    "minecraft:dried_kelp":             1,
    "minecraft:sweet_berries":          1,
    "ranzie:cooked_flesh":              2,
    "ranzie:raw_flesh":                 1,
    "trenbankai:cooked_flesh":          2,
};

// Mapa de cooldown de curación por jugador (uuid → ticks)
const healCooldowns = new Map();

// Mapa de saturación por jugador (se guarda como dynamic property "rz:sat")
// Valor máximo de saturación que puede tener un jugador
const MAX_SATURATION = 20;

/**
 * Maneja el evento de comer un alimento.
 * Añade saturación al jugador según el alimento consumido.
 * @param {ItemUseAfterEvent} event - Evento de uso de ítem
 */
function onFoodEaten(event) {
    const { itemStack, source } = event;
    if (!itemStack || !source.isValid()) return;

    // Solo aplica si el sistema de Java regen está activado
    if (!getSetting("sat", false)) return;

    const satValue = foodSaturationValues[itemStack.typeId];
    if (satValue === undefined) return;

    // Lee la saturación actual del jugador
    const storedSat = world.getDynamicProperty("rz:sat");
    let currentSat = Number(storedSat) || 0;

    // Añade la saturación del alimento (máximo MAX_SATURATION)
    currentSat = Math.min(currentSat + satValue * 1.7, MAX_SATURATION);
    world.setDynamicProperty("rz:sat", Number(currentSat.toPrecision(4)));
}

/**
 * Procesa la regeneración/hambre de todos los jugadores basado en saturación.
 * - Alta saturación (>10): regenera vida
 * - Saturación = 0: aplica efecto wither (hambre)
 * Se debe llamar periódicamente (cada ~20 ticks).
 */
function processSaturationTick() {
    // Solo aplica si Java regen está activado
    if (!getSetting("sat", false)) return;

    const players = world.getAllPlayers();

    for (const player of players) {
        if (!player.isValid()) continue;

        // Lee saturación actual
        const sat = Number(world.getDynamicProperty("rz:sat")) || 0;
        const health = player.getComponent("health");
        if (!health) continue;

        const currentHp = health.currentValue;
        const maxHp = health.effectiveMax;

        if (sat > 10) {
            // Tiene suficiente saturación: regenera lentamente
            const cooldownId = `rz:sat_${player.id}`;
            const cooldown = Number(world.getDynamicProperty(cooldownId)) || 0;

            if (cooldown <= 0) {
                // Regenera 1 HP si no está al máximo
                if (currentHp < maxHp) {
                    const healAmount = Math.min(currentHp + (Math.random() < 0.5 ? 1 : 0.5), maxHp);
                    const newHeal = Math.floor(healAmount * 2) / 2;
                    health.setCurrentValue(Math.min(newHeal, maxHp));
                }

                // Consume saturación
                const newSat = Math.max(sat - (Math.random() < 0.6 ? 1 : 0.5), 0);
                world.setDynamicProperty("rz:sat", newSat);

                // Reinicia cooldown (3-5 segundos según dificultad)
                world.setDynamicProperty(cooldownId, 3 + Math.floor(Math.random() * 3));
            } else {
                // Reduce cooldown
                world.setDynamicProperty(cooldownId, cooldown - 1);
            }
        } else if (sat <= 0) {
            // Sin saturación: aplica efecto wither (hambre)
            player.addEffect("wither", 5, { amplifier: 0, showParticles: false });
        }
    }
}

/**
 * Reinicia la saturación de un jugador al morir.
 * @param {EntityDieAfterEvent} event - Evento de muerte
 */
function onPlayerDeath(event) {
    const { deadEntity } = event;
    if (!getSetting("sat", false)) return;
    if (deadEntity.typeId !== "minecraft:player") return;

    // Resetea saturación a 7 (valor inicial de Java Edition)
    world.setDynamicProperty("rz:sat", 7);
}

/**
 * Inicializa la saturación de un jugador al unirse.
 * @param {PlayerSpawnAfterEvent} event - Evento de spawn de jugador
 */
function onPlayerSpawn(event) {
    const { player } = event;
    if (!getSetting("sat", false)) return;

    // Si el jugador no tiene saturación guardada, la inicializa
    const existing = world.getDynamicProperty("rz:sat");
    if (!existing) {
        world.setDynamicProperty("rz:sat", 7);
    }
}

/**
 * Cancela el efecto de hunger si la duración es demasiado larga (Bedrock lo aplica diferente).
 * @param {EffectAddBeforeEvent} event - Evento antes de añadir efecto
 */
function onEffectAddHunger(event) {
    if (!getSetting("sat", false)) return;
    if (event.entity.typeId !== "minecraft:player") return;
    if (event.effectType === "hunger" && event.duration > 10) {
        event.cancel = true;
    }
}

/**
 * Cancela el efecto de wither de larga duración (el mod lo aplica manualmente).
 * @param {EffectAddBeforeEvent} event
 */
function onEffectAddWither(event) {
    if (!getSetting("sat", false)) return;
    if (event.entity.typeId !== "minecraft:player") return;
    if (event.effectType === "wither" && event.duration > 5) {
        event.cancel = true;
    }
}


// ============================================================
// SISTEMA DE PVP - SWEEP ATTACK Y CRITICAL HIT
// Replica el mecánico de barrido (sweep) y critico de Java Edition.
// Se activa con el setting "sweep".
// ============================================================

/**
 * Maneja el hit entre entidades (daño cuerpo a cuerpo).
 * Aplica:
 *  - Sweep attack: daño a mobs adyacentes cuando golpeas con espada
 *  - Critical hit: daño extra al caer (con knockback)
 * @param {EntityHitEntityAfterEvent} event - Evento de hit entre entidades
 */
function handleHit(damagingEntity, hitEntity) {
    if (!getSetting("pvp", false)) return;

    // Obtiene la velocidad vertical del atacante (para detectar crits)
    const vel = damagingEntity.getVelocity !== undefined
        ? damagingEntity.getVelocity()
        : { y: 0 };

    // --- CRITICAL HIT: golpe mientras cae ---
    // En Java, un crit ocurre cuando el jugador está cayendo (vel.y < 0)
    if (vel && vel.y < 0) {
        // Aplica multiplicador de daño critico ~1.5x via efecto temporal
        damagingEntity.runCommandAsync(
            `damage @e[r=1,type=!player] 1 entity_attack entity @s`
        );
    }

    // --- SWEEP ATTACK: daña mobs alrededor del objetivo ---
    // Radio de sweep: 2 bloques
    // Solo aplica si el atacante tiene una espada
    const item = damagingEntity.getComponent !== undefined
        ? damagingEntity.getComponent("inventory")
        : null;

    if (item) {
        const held = item.container?.getItem(0);
        if (held && held.typeId && held.typeId.includes("_sword")) {
            // Daña todos los mobs (excepto el atacante) en radio 2
            damagingEntity.runCommandAsync(
                `damage @e[r=2,type=!player] 1 entity_attack entity @s`
            );
        }
    }
}

/**
 * Evento de hit entre entidades. Filtra para PvP y PvE,
 * verifica si el modo sweep está activado y delega en handleHit.
 * @param {EntityHitEntityAfterEvent} event
 */
function onEntityHitEntity(event) {
    if (!getSetting("pvp", false)) return;

    const { damagingEntity, hitEntity } = event;

    // PvE: jugador golpea mob
    if (damagingEntity.typeId === "minecraft:player" &&
        hitEntity.typeId !== "minecraft:player") {
        handleHit(damagingEntity, hitEntity);
        return;
    }

    // PvP: jugador golpea jugador
    if (damagingEntity.typeId === "minecraft:player" &&
        hitEntity.typeId === "minecraft:player") {
        handleHit(damagingEntity, hitEntity);
    }
}

// ============================================================
// SISTEMA DE INFECCIÓN
// Los zombies tienen una probabilidad de infectar al jugador
// al golpearlo. La infección aplica efectos negativos.
// El único cure es una Golden Apple.
// ============================================================

// Mapa de jugadores infectados y sus timers
const infectedPlayers = new Map();

/**
 * Verifica si un jugador se infecta al recibir daño de un zombie.
 * La probabilidad de infección se configura en INFECTION (0-100).
 * @param {EntityHurtAfterEvent} event - Evento de daño
 */
function checkInfection(event) {
    if (INFECTION <= 0) return;

    const { hurtEntity, damageSource } = event;
    if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return;
    if (!damageSource) return;

    // Solo infecta si el daño vino de un zombie
    const attacker = damageSource.damagingEntity;
    if (!attacker || attacker.typeId !== "minecraft:zombie") return;

    // Calcula si se infecta
    if (Math.random() * 100 < INFECTION) {
        applyInfection(hurtEntity);
    }
}

/**
 * Aplica el estado de infección a un jugador.
 * - Muestra mensaje de infección
 * - Aplica efectos negativos progresivos
 * - Programa la muerte si no se cura
 * @param {Player} player - Jugador a infectar
 */
function applyInfection(player) {
    // Evita re-infectar si ya está infectado
    if (infectedPlayers.has(player.id)) return;

    player.sendMessage("§c☠ You have been infected by a zombie! Use a Golden Apple to cure yourself.");
    player.runCommandAsync("tag @s add infected");

    // Marca al jugador como infectado
    infectedPlayers.set(player.id, true);

    // Aplica efectos de infección inmediatos
    player.runCommandAsync("effect @s[tag=infected] slowness 999 1 true");
    player.runCommandAsync("effect @s[tag=infected] weakness 999 1 true");
    player.runCommandAsync("effect @s[tag=infected] hunger 999 2 true");

    // Si el setting de fog está activado, aplica niebla de infección
    if (getSetting("fog", true)) {
        player.runCommandAsync("fog @s[tag=infected] push ranzie:infection_fog ranzie_infection");
    }

    // Después de un tiempo (300 segundos = 5 minutos), mata al jugador si no se curó
    const infectionTimer = system.runTimeout(() => {
        if (infectedPlayers.has(player.id)) {
            // El jugador no se curó: muere por infección
            player.runCommandAsync("damage @s 1000 generic_kill");
            player.sendMessage("§c☠ The infection has consumed you...");
            infectedPlayers.delete(player.id);
            player.runCommandAsync("tag @s remove infected");
            if (getSetting("fog", true)) {
                player.runCommandAsync("fog @s remove ranzie_infection");
            }
        }
    }, 6000); // 6000 ticks = 5 minutos

    // Guarda el timer ID para poder cancelarlo si el jugador se cura
    infectedPlayers.set(player.id, infectionTimer);
}

/**
 * Cura la infección de un jugador cuando come una Golden Apple.
 * @param {ItemUseAfterEvent} event - Evento de uso de ítem
 */
function checkCureInfection(event) {
    const { itemStack, source } = event;
    if (!itemStack) return;
    if (itemStack.typeId !== "minecraft:golden_apple" &&
        itemStack.typeId !== "minecraft:enchanted_golden_apple") return;

    if (!infectedPlayers.has(source.id)) return;

    // Cura la infección
    const timerId = infectedPlayers.get(source.id);
    if (typeof timerId === "number") {
        system.clearRun(timerId);
    }
    infectedPlayers.delete(source.id);

    source.runCommandAsync("tag @s remove infected");
    source.runCommandAsync("effect @s[tag=!infected] clear slowness");
    source.runCommandAsync("effect @s[tag=!infected] clear weakness");
    source.runCommandAsync("effect @s[tag=!infected] clear hunger");
    if (getSetting("fog", true)) {
        source.runCommandAsync("fog @s remove ranzie_infection");
    }
    source.sendMessage("§aYou have been cured of the infection!");
}


// ============================================================
// SISTEMA DE CORPSE PHYSICS
// Los cadáveres (ranzie:corpse) pueden ser pateados por zombies
// aplicando impulso físico. También pueden ser pateados/movidos
// por física al spawnear.
// ============================================================

// Variables de physics de corpse
let HS = 6;   // Intensidad horizontal de patada
let VS = 2;   // Intensidad vertical de patada
let corpseCap = 50;  // Límite de cadáveres en el mundo

/**
 * Aplica física de patada a un corpse cuando un zombie lo golpea.
 * Lanza el corpse con la intensidad configurada en HS y VS.
 * @param {Entity} corpse - Entidad cadáver
 * @param {Entity} zombie - Zombie que patea
 */
function applyCorpseKick(corpse, zombie) {
    if (!getSetting("corpse_kick", false)) return;
    if (!getSetting("corpse_physics", false)) return;
    if (!getSetting("corpse", false)) return;

    // Calcula vector de impulso desde el zombie hacia el corpse
    const cLoc = corpse.location;
    const zLoc = zombie.location;

    const dx = cLoc.x - zLoc.x;
    const dz = cLoc.z - zLoc.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;

    // Normaliza y aplica intensidad
    const impulseX = (dx / dist) * HS;
    const impulseZ = (dz / dist) * HS;
    const impulseY = VS;

    // Aplica el impulso al corpse con applyKnockback
    try {
        corpse.applyKnockback(impulseX, impulseZ, impulseY, impulseY * 0.5);
    } catch (e) {
        // Fallback: usa el comando knockback si applyKnockback no está disponible
        corpse.runCommandAsync(
            `tp @s ~${impulseX.toFixed(1)} ~${impulseY.toFixed(1)} ~${impulseZ.toFixed(1)}`
        );
    }
}

/**
 * Verifica si un zombie puede patear cadáveres cercanos.
 * Se llama periódicamente en el tick de cada zombie.
 * @param {Entity} zombie - Entidad zombie
 */
function checkZombieKickCorpse(zombie) {
    if (!getSetting("corpse_kick", false)) return;
    if (zombie.typeId !== "minecraft:zombie") return;

    // Busca cadáveres en radio 2 del zombie
    const nearbyCorpses = zombie.dimension.getEntities({
        type: "ranzie:corpse",
        maxDistance: 2,
        location: zombie.location,
    });

    for (const corpse of nearbyCorpses) {
        if (Math.random() < 0.3) {  // 30% de probabilidad por tick
            applyCorpseKick(corpse, zombie);
        }
    }
}

/**
 * Controla el límite de cadáveres en el mundo.
 * Si hay más de corpseCap cadáveres, elimina los más viejos.
 * Se llama periódicamente.
 */
function enforceCorpseCap() {
    if (!getSetting("corpse", false)) return;

    try {
        const allCorpses = dim.getEntities({ type: "ranzie:corpse" });

        if (allCorpses.length > corpseCap) {
            // Elimina los excedentes (los primeros en la lista = más viejos)
            const excess = allCorpses.length - corpseCap;
            for (let i = 0; i < excess; i++) {
                try {
                    allCorpses[i].triggerEvent("minecraft:despawn");
                } catch (e) {}
            }
        }
    } catch (e) {}
}

// ============================================================
// SISTEMA DE PRIMER JOIN (First Join Setup)
// Al unirse al mundo por primera vez, el jugador recibe:
//   - El ítem "Settings" para configurar el mod
//   - Un "How to Play" (papel)
//   - Tag de admin
//   - Mensaje de bienvenida
// ============================================================

/**
 * Da el ítem de settings al jugador cuando se une por primera vez.
 * Verifica con la dynamic property "got_settings" si ya lo recibió.
 * @param {Player} player - Jugador que se une
 */
function giveFirstJoinItems(player) {
    // Si ya recibió los ítems, no dar de nuevo
    if (world.getDynamicProperty("got_settings")) return;

    // Crea el ítem de configuración (ranzie:settings)
    // const settingsItem = new ItemStack("ranzie:settings", 1);

    // Crea el "How to Play" (papel con nombre especial)
    const howToPlayItem = new ItemStack("minecraft:paper", 1);
    howToPlayItem.nameTag = "How to Play";

    // Añade los ítems al inventario del jugador
    const inventory = player.getComponent("minecraft:inventory");
    if (inventory && inventory.container) {
        inventory.container.addItem(settingsItem);
        inventory.container.addItem(howToPlayItem);
    }

    // Mensaje de bienvenida
    player.sendMessage("§aThank you for using §lRise & Survive§r§a by Ranzie!");
    player.sendMessage("§eUse the §lSettings§r§e to configure the addon.");

    // Da tag de admin al primer jugador
    player.runCommandAsync("tag @s add admin");

    // Marca que ya recibió los ítems
    world.setDynamicProperty("got_settings", true);
}

/**
 * Maneja el primer spawn de un jugador.
 * Espera 57 ticks (~3 segundos) antes de dar los ítems
 * para asegurarse de que el mundo cargó.
 * @param {PlayerSpawnAfterEvent} event
 */
function onPlayerFirstSpawn(event) {
    const { player } = event;

    // Verifica si ya tiene los ítems
    if (world.getDynamicProperty("got_settings")) return;

    // Espera un poco antes de dar los ítems
    system.run(() => {
        giveFirstJoinItems(player);
    });
}


// ============================================================
// SISTEMA DE PERMISOS - TAG ADMIN
// Solo los jugadores con tag "admin" pueden usar el ítem de settings.
// Otros jugadores reciben un mensaje de error.
// ============================================================

/**
 * Verifica que el jugador tenga el tag "admin" antes de usar el ítem settings.
 * Si tiene admin: cancela el uso del ítem y abre el menú directamente.
 * Si no tiene admin: cancela el uso y muestra mensaje de error.
 * @param {ItemUseBeforeEvent} event - Evento antes de usar ítem
 */
function onSettingsItemUseBefore(event) {
    const { source, itemStack } = event;
    if (!itemStack || itemStack.typeId !== "ranzie:settings") return;
    if (source.typeId !== "minecraft:player") return;

    // Siempre cancela el uso del ítem para que no se consuma ni active efectos
    event.cancel = true;

    if (!source.hasTag("admin")) {
        source.sendMessage("§cYou don't have permission to use this item.");
        source.sendMessage("§cYou must have admin tag to access the settings.");
        return;
    }

    // Abre el menú principal en el siguiente tick
    // (necesario porque estamos dentro de un beforeEvent)
    system.run(() => {
        showMainMenu(source);
    });
}

// ============================================================
// MENÚ HOW TO PLAY
// Muestra toda la información del mod en un ActionFormData.
// Se activa usando el papel "How to Play" o desde el menú Extra.
// ============================================================

/**
 * Muestra el menú "How to Play" con toda la información del mod.
 * @param {Player} player - Jugador que consulta el manual
 */
function showHowToPlay(player) {
    const description = [
        "Rise and Survive\n",
        "It's a §2zombie apocalypse §fadd-on inspired from a java mod called §6improved mobs§f mod\n\n",
        "§5Difficulty bar§f: the difficulty bar increases each day but it can be changed using the settings, " +
        "it determines how often zombies spawn, the higher the value the more likely the zombies will spawn\n\n",
        "§2Zombies§f: Every 8 days their movement speed increases and they have a chance of having new abilities. " +
        "The higher the difficulty the more likely that they'll wear armor\n\n",
        "§sMiner zombies§f: they can break blocks, the higher the difficulty the faster they can break blocks. " +
        "There are blocks that they cannot break like obsidian and bedrock(also iron bars but only in the early days)\n\n",
        "§nBlock placer zombies§f: they can tower up and bridge if you're high enough just to reach you\n\n",
        "§5Witch zombies§f: they can drink and throw potions\n\n",
        "§cBomber zombies§f: they can throw tnts but it only deals damage and not break blocks\n\n",
        "§dEnder zombies§f: they can use ender pearl to teleport\n\n",
        "§2Horde leader zombies§f: giant can jump and summon fangs, tank is the toughest, " +
        "and necromancer can summon zombies\n\n",
        "§aJumper§f: can jump at blocks and at you\n\n",
        "§nCrawler§f: can crawl\n\n",
        "§aSpitter§f: shoots spit from a distance\n\n",
        "§eRevealer§f: can reveal your location by screaming and they will run away after revealing\n\n",
        "Zombies can have different kinds of §6potion effects§f like §sspeed§f and §pfire resistance§f. " +
        "All monsters are disabled but all of their loot can be obtained by killing zombies\n\n",
        "§cHorde system§f: the amount of horde depends on the §5difficulty§f but it can also be changed using " +
        "the settings. The horde spawn 15 blocks away from the player the horde zombies can always see you " +
        "which means that you can't hide from them(inspired from the hordes from java)\n\n",
        "§cBlood moon§f: You can't sleep during the blood moon and it will have a 100% chance of spawning a " +
        "horde event(1 or 2 hordes), they can always see you during this event\n\n",
        "Using §7horn§f and §6bell§f triggers the zombies and they'll run towards the nearest target\n\n",
        "The add-on has a built sword §isweeping mechanics§f\n\n",
        "Craft §7gunpowder§f using coal and iron nugget§f\n\n",
        "Taking damage releases §cblood§f that zombies can smell(up to 10 blocks)\n\n",
        "§cRegeneration§f: since this is inspired by a java mod, this addon also adds faster regeneration " +
        "just like java\n\n",
        "§mBlood Screen§f: using a visual pack enables blood screen effect\n\n",
        "§aNew zombie skins and animation§f(also inspired from fresh animation)\n\n",
        "§iBlocks§f: wired fence, cheval fence, wired wall, and spiked plate are blocks that can damage zombies " +
        "and spiked fence stops zombies from breaking it\n\n",
        "§hVibrant Visuals support§f: the §lglowing eyes effect§r is better when using vibrant visuals\n\n",
        "§nParticles§f: block breaking particles are realistic\n\n",
        "§2Infection§f: Zombies have a chance to infect players when hitting them. Chances of infection can be " +
        "changed in the settings, up to a maximum of 100%. Infected players will be taken down after the effect. " +
        "The only cure is a Golden Apple.\n\n",
        "§iWeapons§f: Bolo can chop wood, katana can slash fast, dagger can spam, saber deals massive sweep damage, " +
        "long sword has large sweep area, and hammers can crit.\n\n",
        "§nCooked flesh§f: you can now cook rotten flesh to raw flesh then cooked flesh then lastly leather",
    ].join("");

    new ActionFormData()
        .title("How to Play")
        .body(description)
        .button("Close")
        .show(player);
}

/**
 * Maneja el uso del papel "How to Play".
 * @param {ItemUseAfterEvent} event
 */
function onHowToPlayItem(event) {
    const { source, itemStack } = event;
    if (!itemStack || !source.isValid()) return;

    // Verifica si es el papel How to Play por su nameTag
    if (itemStack.typeId === "minecraft:paper" &&
        itemStack.nameTag &&
        itemStack.nameTag.toLowerCase() === "how to play") {
        source.runCommandAsync("scriptevent ras:how");
    }
}


// ============================================================
// SISTEMA DE SCRIPT EVENTS (ras:*)
// El mod usa scriptevent para comunicar entre entidades y scripts.
// Cada evento tiene un ID y ejecuta una función correspondiente.
// ============================================================

// Suscripción única para TODOS los script events del mod (ras:*)
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, sourceEntity } = event;
    if (!sourceEntity || sourceEntity.typeId !== "minecraft:player") return;

    switch (id) {
        // case "ras:config":   showMainMenu(sourceEntity);      break;
        case "ras:adv":      showAdvancedMenu(sourceEntity);  break;
        case "ras:ability":  showAbilityConfig(sourceEntity); break;
        case "ras:corpse":   showCorpseConfig(sourceEntity);  break;
        case "ras:button":   showMainMenu(sourceEntity);      break;
        case "ras:extra":    showExtraSettings(sourceEntity); break;
        // case "ras:how":      showHowToPlay(sourceEntity);     break;
    }
});

// ============================================================
// FUNCIONES DE NAVEGACIÓN DE MENÚS (re-enrutadores de UI)
// Estas funciones actúan como puentes entre ActionForms
// y las funciones de ModalForm con la lógica de guardado.
// ============================================================

/**
 * Muestra el menú principal de configuración "Rise and Survive Settings".
 * Punto de entrada desde el ítem ranzie:settings y desde ras:config / ras:button.
 * Muestra 3 botones: Basic, Advanced, Extra.
 * @param {Player} player
 */
function showRiseConfig(player) {
    new ActionFormData()
        .title("§l§cRise and Survive Settings")
        .body(
            "§l§7Choose your configuration mode:\n\n" +
            "§aBasic §7– Simple settings for quick setup\n" +
            "§6Advanced §7– Full control over all features\n" +
            "§cExtra §7– Access extra features"
        )
        .button("§aBasic")
        .button("§6Advanced")
        .button("§cExtra")
        .show(player)
        .then((result) => {
            if (!result || result.canceled) return;
            const playerName = player.name;
            const d = player.dimension;
            if (result.selection === 0) {
                d.runCommandAsync(`execute as "${playerName}" run scriptevent ras:config`);
            } else if (result.selection === 1) {
                d.runCommandAsync(`execute as "${playerName}" run scriptevent ras:adv`);
            } else if (result.selection === 2) {
                d.runCommandAsync(`execute as "${playerName}" run scriptevent ras:extra`);
            }
        });
}

// Alias para compatibilidad interna
const showMainSettingsMenu = showRiseConfig;

/**
 * Callback legacy del menú principal (mantenido por compatibilidad).
 * Ahora la lógica está inline en showRiseConfig.
 * @param {Player} player
 * @param {ActionFormResponse} result
 */
function showButton(player, result) {
    if (!result || result.canceled) return;
    const playerName = player.name;
    const dim = player.dimension;
    if (result.selection === 0) {
        dim.runCommandAsync(`execute as "${playerName}" run scriptevent ras:config`);
    } else if (result.selection === 1) {
        dim.runCommandAsync(`execute as "${playerName}" run scriptevent ras:adv`);
    } else if (result.selection === 2) {
        dim.runCommandAsync(`execute as "${playerName}" run scriptevent ras:extra`);
    }
}

/**
 * Muestra el submenú Advanced con botones Abilities y Corpse.
 * @param {Player} player
 */
function showAdv(player) {
    new ActionFormData()
        .title("§l§cRise and Survive Settings")
        .body("§l§7Choose your configuration mode:")
        .button("§aAbilities")
        .button("§6Corpse")
        .show(player)
        .then((result) => {
            if (!result || result.canceled) return;
            const playerName = player.name;
            const d = player.dimension;
            if (result.selection === 0) {
                d.runCommandAsync(`execute as "${playerName}" run scriptevent ras:ability`);
            } else if (result.selection === 1) {
                d.runCommandAsync(`execute as "${playerName}" run scriptevent ras:corpse`);
            }
        });
}

/**
 * Muestra el menú Extra con todos los botones de invocación.
 * @param {Player} player
 */
function showExtra(player) {
    new ActionFormData()
        .title("§l§cExtra Settings")
        .body("§l§6Trigger R&S Features")
        .button("§cSummon Horde")
        .button("§7Summon Warner")
        .button("§5Summon Ender")
        .button("§2Summon Witch")
        .button("§eSummon Jumper")
        .button("§4Summon Bomber")
        .button("§aSummon Spitter")
        .button("§9Summon Crawler")
        .button("§cSummon Giant")
        .button("§4Summon Tank")
        .button("§3Summon Necromancer")
        .show(player)
        .then((result) => showExtraCallback(player, result));
}

/**
 * Callback del menú Extra. Ejecuta la acción seleccionada.
 * @param {Player} player
 * @param {ActionFormResponse} result
 */
function showExtraCallback(player, result) {
    if (!result || result.canceled) return;

    const playerName = player.name;
    const d = player.dimension;
    const sel = result.selection;

    if (sel === 0) {
        // Summon Horde: activa la horda manualmente
        triggerHorde();
    } else if (sel === 1) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add warner`);
    } else if (sel === 2) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add ender`);
    } else if (sel === 3) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add witch`);
    } else if (sel === 4) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add mlg`);
    } else if (sel === 5) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add bomber`);
    } else if (sel === 6) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add spitter`);
    } else if (sel === 7) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie`);
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run tag @e[type=zombie,r=2] add crawler`);
    } else if (sel === 8) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie ~~~ ~~ as_giant "Giant Horde Leader"`);
    } else if (sel === 9) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie ~~~ ~~ tank "Tank Horde Leader"`);
    } else if (sel === 10) {
        d.runCommandAsync(`execute as "${playerName}" at "${playerName}" run summon zombie ~~~ ~~ summoner "Necromancer Horde Leader"`);
    }
}


// ============================================================
// FUNCIONES ALIAS / PUENTES PARA LOS SCRIPT EVENTS
// El bytecode original referencia funciones con nombres internos.
// Estas funciones son alias que conectan los script events con
// los formularios de configuración correctos.
// ============================================================

/**
 * Muestra el formulario de configuración de habilidades (Abilities).
 * Llamado desde el script event "ras:ability".
 * @param {Player} player
 */
function showAbilityConfig(player) {
    showAdvancedSettings(player);
}

/**
 * Muestra el formulario de configuración de corpse.
 * Llamado desde el script event "ras:corpse".
 * @param {Player} player
 */
function showCorpseConfig(player) {
    showCorpseSettings(player);
}

// ============================================================
// FUNCIÓN UTILITARIA: fallback para dynamic properties
// Si una propiedad no existe, la inicializa con un valor por defecto.
// ============================================================

/**
 * Establece una dynamic property solo si no existe.
 * @param {string} key - Clave de la propiedad
 * @param {*} defaultValue - Valor por defecto
 * @param {*} fallback - Valor de fallback alternativo
 */
function initDynamicProperty(key, defaultValue, fallback) {
    const existing = world.getDynamicProperty(key);
    if (existing === undefined || existing === "undefined") {
        world.setDynamicProperty(key, fallback !== undefined ? fallback : defaultValue);
    }
}

/**
 * Obtiene un jugador por su ID (usado internamente por el sistema de infección).
 * @param {string} id - ID del jugador
 * @returns {Player|undefined}
 */
function getPlayerById(id) {
    return world.getAllPlayers().find(p => p.id === id);
}

// ============================================================
// FUNCIÓN: CARGAR VARIABLES DE CORPSE
// Lee las variables HS, VS, corpseCap de las dynamic properties.
// ============================================================

/**
 * Carga los settings de corpse physics al inicio.
 */
function loadCorpseSettings() {
    HS        = getSetting("hs",   6);
    VS        = getSetting("vs",   2);
    corpseCap = getSetting("ccap", 50);
}

// ============================================================
// INICIALIZACIÓN DE TODAS LAS DYNAMIC PROPERTIES
// Establece valores por defecto para todas las propiedades
// del mundo si no existen previamente.
// ============================================================

/**
 * Inicializa todas las dynamic properties con sus valores por defecto.
 * Se llama una sola vez al arrancar el script.
 */
function initAllProperties() {
    // Settings básicos
    initDynamicProperty("max_day",         MAX_DAY,         MAX_DAY);
    initDynamicProperty("max_horde_spawn", MAX_HORDE_SPAWN, MAX_HORDE_SPAWN);
    initDynamicProperty("infection",       INFECTION,       INFECTION);
    initDynamicProperty("zcap",            zombieCap,       zombieCap);
    initDynamicProperty("growth",          GROW,            GROW);

    // Corpse
    initDynamicProperty("hs",   HS,        HS);
    initDynamicProperty("vs",   VS,        VS);
    initDynamicProperty("ccap", corpseCap, corpseCap);

    // Habilidades de zombie
    initDynamicProperty("za",       ZA,       ZA);
    initDynamicProperty("zm",       ZM,       ZM);
    initDynamicProperty("zp",       ZP,       ZP);
    initDynamicProperty("zc",       ZC,       ZC);
    initDynamicProperty("spotion",  sPOTION,  sPOTION);
    initDynamicProperty("swarner",  sWARNER,  sWARNER);
    initDynamicProperty("sender",   sENDER,   sENDER);
    initDynamicProperty("switch",   sWITCH,   sWITCH);
    initDynamicProperty("sjumper",  sJUMPER,  sJUMPER);
    initDynamicProperty("sbomber",  sBOMBER,  sBOMBER);
    initDynamicProperty("sspitter", sSPITTER, sSPITTER);
    initDynamicProperty("scrawler", sCRAWLER, sCRAWLER);
    initDynamicProperty("sprint",   SPRINT,   SPRINT);
}


// ============================================================
// SISTEMA DE ANTORCHA DINÁMICA (Dynamic Torch)
// Cuando el jugador sostiene una antorcha, emite una luz dinámica
// usando el effect "night_vision" de baja intensidad (amplifier 0).
// Se activa con el setting "torch".
// ============================================================

// Lista de ítems que cuentan como fuente de luz dinámica
const TORCH_ITEMS = new Set([
    "minecraft:torch",
    "minecraft:soul_torch",
    "minecraft:redstone_torch",
    "minecraft:lantern",
    "minecraft:soul_lantern",
    "minecraft:glowstone",
    "minecraft:sea_lantern",
    "minecraft:shroomlight",
    "minecraft:end_rod",
    "minecraft:glow_berries",
    "minecraft:amethyst_shard",
]);

// Cooldown de tick para el dynamic torch (cada 5 ticks)
let torchTickCounter = 0;

/**
 * Verifica si un jugador sostiene un ítem de luz y aplica night_vision temporal.
 * Se llama cada 5 ticks para no saturar el servidor.
 */
function processDynamicTorch() {
    if (!getSetting("torch", false)) return;

    const players = world.getAllPlayers();
    for (const player of players) {
        if (!player.isValid()) continue;

        // Verifica el ítem en mano principal y secundaria
        try {
            const inv = player.getComponent("inventory");
            if (!inv || !inv.container) continue;

            const mainHand = inv.container.getItem(player.selectedSlotIndex || 0);
            const offHand  = inv.container.getItem(40); // slot offhand

            const holdingLight = (mainHand && TORCH_ITEMS.has(mainHand.typeId)) ||
                                 (offHand  && TORCH_ITEMS.has(offHand.typeId));

            if (holdingLight) {
                // Aplica night_vision de corta duración (se renueva cada tick)
                // amplifier 0 = nivel 1 = luz sutil
                player.addEffect("night_vision", 3, { amplifier: 0, showParticles: false });
            } else {
                // Si tenía night_vision del torch y ya no sostiene, la limpia
                // Solo si la duración restante es muy corta (evita limpiar effects reales)
                const effect = player.getEffect("night_vision");
                if (effect && effect.duration <= 4) {
                    player.runCommandAsync("effect @s clear night_vision");
                }
            }
        } catch (e) {}
    }
}

// ============================================================
// SISTEMA "BLOCKS ONLY DAMAGE" (bonly)
// Cuando está activo, los zombies solo pueden dañar al jugador
// si están colocando bloques o minando (no daño de contacto normal).
// Implementado como un filtro de daño en entityHurt.
// ============================================================

/**
 * Filtra el daño de zombies según el modo "blocks only damage".
 * Si bonly está activo, cancela el daño de contacto normal de zombies.
 * @param {EntityHurtBeforeEvent} event
 */
function onBlocksOnlyDamage(event) {
    if (!getSetting("bonly", false)) return;

    const { hurtEntity, damageSource } = event;
    if (!hurtEntity || hurtEntity.typeId !== "minecraft:player") return;
    if (!damageSource) return;

    const attacker = damageSource.damagingEntity;
    if (!attacker || attacker.typeId !== "minecraft:zombie") return;

    // Solo permite daño si el zombie tiene tag "miner" o "place" activos
    if (!attacker.hasTag("miner") && !attacker.hasTag("place")) {
        // Cancela el daño normal de contacto
        try { event.cancel = true; } catch (e) {}
    }
}

// ============================================================
// SISTEMA DE DAÑO A ENTIDADES POR BLOQUES ESPECIALES
// Los bloques spiked fence, wired fence y otros bloques del mod
// dañan a los zombies que los tocan.
// DAMAGE_INTERVAL controla la frecuencia del daño.
// ============================================================

const DAMAGE_INTERVAL = 20; // Cada 20 ticks (1 segundo)

/**
 * Aplica daño a zombies que están tocando bloques de daño del mod
 * (spiked fences, wired fences, etc.)
 * Se ejecuta periódicamente.
 */
function processFenceDamage() {
    if (!dim) return;

    try {
        // Obtiene todos los zombies en el overworld
        const zombies = dim.getEntities({ type: "minecraft:zombie" });

        for (const zombie of zombies) {
            if (!zombie.isValid()) continue;

            // Verifica el bloque bajo el zombie
            const loc = zombie.location;
            const blockBelow = dim.getBlock({
                x: Math.floor(loc.x),
                y: Math.floor(loc.y - 0.1),
                z: Math.floor(loc.z)
            });

            if (!blockBelow) continue;

            const blockId = blockBelow.typeId;

            // Lista de bloques que dañan zombies
            if (blockId.includes("spiked") || blockId.includes("wired") ||
                blockId.includes("chain_fence") || blockId.includes("barbed")) {
                // Aplica 1 de daño al zombie
                zombie.runCommandAsync("damage @s 1 contact entity @p");
            }
        }
    } catch (e) {}
}

// ============================================================
// SISTEMA DE CORPSE TAG (CORPSE_TAG)
// Tag interno que identifica a los corpses y les aplica
// la física correcta al spawnear.
// ============================================================

const CORPSE_TAG = "ranzie_corpse";

/**
 * Cuando spawnea un corpse (ranzie:corpse), le asigna la escala
 * correcta según el tipo de zombie del que proviene.
 * @param {EntitySpawnAfterEvent} event
 */
function onCorpseSpawn(event) {
    const { entity } = event;
    if (!entity || entity.typeId !== "ranzie:corpse") return;

    // Asigna escala según el nombre (proviene de un jefe de horda)
    handleCorpseScale(entity);

    // Marca el corpse con el tag interno
    entity.addTag(CORPSE_TAG);

    // Si la física de corpse está activa, aplica impulso inicial al spawnear
    if (getSetting("corpse_physics", false)) {
        try {
            entity.applyKnockback(
                (Math.random() - 0.5) * HS * 0.3,
                (Math.random() - 0.5) * HS * 0.3,
                VS * 0.2,
                VS * 0.1
            );
        } catch (e) {}
    }
}

/**
 * Procesa los kicks de zombies a cadáveres y el límite de corpses.
 * Se llama cada DAMAGE_INTERVAL ticks.
 */
function processCorpsePhysics() {
    if (!getSetting("corpse", false)) return;

    // Enforza el límite de corpses
    enforceCorpseCap();

    // Si kick está activo, procesa cada zombie
    if (getSetting("corpse_kick", false)) {
        try {
            const zombies = dim.getEntities({ type: "minecraft:zombie" });
            for (const zombie of zombies) {
                checkZombieKickCorpse(zombie);
            }
        } catch (e) {}
    }
}


// ============================================================
// SISTEMA DE INFECCIÓN - infectPlayer (alias interno)
// El bytecode referencia esta función como "infectPlayer" en
// el handler de itemCompleteUse para curar la infección.
// ============================================================

/**
 * Alias para checkCureInfection usado por el evento itemCompleteUse.
 * @param {ItemCompleteUseAfterEvent} event
 */
function infectPlayer(event) {
    checkCureInfection(event);
}

// ============================================================
// EVENTO worldInitialize
// Inicializa todo el mod cuando el mundo termina de cargar.
// Este es el punto de entrada real del mod.
// ============================================================

/**
 * Se ejecuta una vez cuando el mundo termina de inicializar.
 * Carga settings, inicializa dynamic properties, y prepara el mod.
 */
function onWorldInitialize() {
    // Carga todas las dynamic properties guardadas
    // (aquí es seguro — el mundo ya está completamente cargado)
    try { loadSettings(); }     catch (e) {}
    try { loadCorpseSettings(); } catch (e) {}

    // Inicializa las que no existen con valores por defecto
    try { initAllProperties(); } catch (e) {}

    // Obtiene la dimensión overworld
    try {
        dim = world.getDimension("overworld");
    } catch (e) {}

    // Crea los scoreboards si no existen
    try { setupObjectives(); } catch (e) {}

    // Mensaje de diagnóstico: confirma que el script cargó correctamente
    try {
        world.sendMessage("§a[R&S] Script cargado. Usa ranzie:settings para configurar.");
    } catch (e) {}
}

// ============================================================
// EVENTO worldInitialize (segundo handler)
// El original registra dos handlers de worldInitialize —
// el segundo carga el sistema de corpse physics.
// ============================================================

/**
 * Segundo handler de worldInitialize: configura el sistema de corpse.
 */
function onWorldInitialize2() {
    // Lee y actualiza corpseCap desde las dynamic properties
    corpseCap = getSetting("ccap", 50);
    HS = getSetting("hs", 6);
    VS = getSetting("vs", 2);
}

// ============================================================
// SISTEMA DE COOLDOWN DE DAÑO (para sweep / pvp)
// Cooldown compartido entre los distintos sistemas de daño.
// ============================================================

// Mapa de cooldown de daño por entidad (entityId → tick de último daño)
const cooldown = new Map();

/**
 * Verifica si una entidad puede recibir daño según el cooldown.
 * @param {string} entityId - ID de la entidad
 * @param {number} cooldownTicks - Duración del cooldown en ticks
 * @returns {boolean} true si puede recibir daño
 */
function canTakeDamage(entityId, cooldownTicks) {
    const lastHit = cooldown.get(entityId) || 0;
    const now = system.currentTick;
    if (now - lastHit >= cooldownTicks) {
        cooldown.set(entityId, now);
        return true;
    }
    return false;
}

/**
 * Limpia entradas viejas del mapa de cooldown periódicamente.
 * Se ejecuta cada 7 ticks para no acumular memoria.
 */
function cleanupCooldownMap() {
    const now = system.currentTick;
    for (const [id, tick] of cooldown.entries()) {
        if (now - tick > 200) { // 10 segundos
            cooldown.delete(id);
        }
    }
}

// ============================================================
// MAPA DE EVENTOS DE CORPSE (corpseEventMap)
// El mod original usa un Map para rastrear los eventos
// de física de corpse y poder limpiarlos correctamente.
// ============================================================

const corpseEventMap = new Map();


// ============================================================
// DATOS REALES DE ARMADURA (extraídos del bytecode)
// El mod usa tablas de armadura por slot con pesos individuales.
// Incluye copper armor (del mod) y todas las variantes vanilla.
// ============================================================

// Reemplaza la tabla simplificada anterior con la real del bytecode
const armorSets = {
    head: [
        { item: 'leather_helmet',    weight: 30 },
        { item: 'chainmail_helmet',  weight: 30 },
        { item: 'iron_helmet',       weight: 30 },
        { item: 'copper_helmet',     weight: 30 },
        { item: 'golden_helmet',     weight: 30 },
        { item: 'diamond_helmet',    weight: 15 },
        { item: 'netherite_helmet',  weight: 5  },
        { item: 'turtle_helmet',     weight: 20 },
    ],
    chest: [
        { item: 'leather_chestplate',   weight: 30 },
        { item: 'chainmail_chestplate', weight: 30 },
        { item: 'iron_chestplate',      weight: 30 },
        { item: 'copper_chestplate',    weight: 30 },
        { item: 'golden_chestplate',    weight: 30 },
        { item: 'diamond_chestplate',   weight: 15 },
        { item: 'netherite_chestplate', weight: 5  },
    ],
    legs: [
        { item: 'leather_leggings',   weight: 30 },
        { item: 'chainmail_leggings', weight: 30 },
        { item: 'iron_leggings',      weight: 30 },
        { item: 'copper_leggings',    weight: 30 },
        { item: 'golden_leggings',    weight: 30 },
        { item: 'diamond_leggings',   weight: 15 },
        { item: 'netherite_leggings', weight: 5  },
    ],
    feet: [
        { item: 'leather_boots',   weight: 30 },
        { item: 'chainmail_boots', weight: 30 },
        { item: 'iron_boots',      weight: 30 },
        { item: 'copper_boots',    weight: 30 },
        { item: 'golden_boots',    weight: 30 },
        { item: 'diamond_boots',   weight: 15 },
        { item: 'netherite_boots', weight: 5  },
    ],
};

// Tipos de herramienta vanilla (sufijo para construir nombre de ítem)
const tools = ['sword', 'shovel', 'pickaxe', 'axe', 'hoe'];

// Armas custom de Ranzie's Rise & Survive
const rztools = ['bolo', 'katana', 'longsword', 'hammer', 'saber', 'dagger'];

// Materiales vanilla con prefijo para construir nombres de arma
const materials = [
    { prefix: 'wooden_',    weight: 30 },
    { prefix: 'stone_',     weight: 30 },
    { prefix: 'iron_',      weight: 30 },
    { prefix: 'golden_',    weight: 30 },
    { prefix: 'diamond_',   weight: 15 },
    { prefix: 'netherite_', weight: 5  },
    { prefix: 'copper_',    weight: 30 },
];

// Materiales custom del mod para las armas Ranzie
const rzmaterials = [
    { prefix: 'ranzie:wooden_',    weight: 30 },
    { prefix: 'ranzie:stone_',     weight: 30 },
    { prefix: 'ranzie:iron_',      weight: 30 },
    { prefix: 'ranzie:golden_',    weight: 30 },
    { prefix: 'ranzie:diamond_',   weight: 15 },
    { prefix: 'ranzie:netherite_', weight: 5  },
];

// Encantamientos reales que puede recibir un zombie al spawnear
const toolEnchants = [
    'unbreaking', 'mending', 'efficiency', 'silk_touch',
    'sharpness', 'smite', 'bane_of_arthropods', 'fire_aspect',
    'looting', 'knockback', 'fortune', 'vanishing', 'flame',
    'power', 'binding',
];

// ============================================================
// DATOS REALES DE SETTINGS (extraídos del bytecode)
// Los defaults reales difieren de los estimados anteriores.
// ============================================================

// sliderSettings reales (max_day default=100, max_horde_spawn=50, etc.)
// Nota: estos sobreescriben los definidos antes en el archivo
const sliderSettingsReal = [
    { id: 'max_day',         label: '☆ How many days do you want to survive? (max day)',                                                                              default: 100 },
    { id: 'max_horde_spawn', label: '★ Max Zombie Horde Spawn (increases each day until it reaches the max horde spawn)(reduces lag if you set it to a lower value)', default: 50  },
    { id: 'infection',       label: '☆ Chance of getting infected (e.g. 0.1, 1, or 100. set to 0 to turn off)',                                                      default: 1   },
    { id: 'zcap',            label: '★ Zombie spawn limit (how many zombies are allowed to spawn in your world)(reduces lag if you set it to a lower value)',          default: 50  },
    { id: 'growth',          label: '☆ Zombie\'s movement speed increases every ___ difficulty',                                                                      default: 8   },
];

// sliderSettings2 reales (probabilidades de habilidades)
const sliderSettings2Real = [
    { id: 'za',       label: '☆ Chance of zombie spawning with abilities(might cause lag if the value is too high)', default: 5  },
    { id: 'zm',       label: '★ Chance of zombie spawning with mining ability',                                      default: 40 },
    { id: 'zp',       label: '☆ Chance of zombie spawning with block placing ability',                               default: 30 },
    { id: 'zc',       label: '★ Chance of zombie spawning with climbing ability',                                    default: 20 },
    { id: 'spotion',  label: '☆ Chance of zombies having potion effects',                                            default: 5  },
    { id: 'swarner',  label: '★ Chance of zombies having warner ability',                                            default: 5  },
    { id: 'sender',   label: '☆ Chance of zombies having ender ability',                                             default: 5  },
    { id: 'switch',   label: '★ Chance of zombies having witch effect',                                              default: 5  },
    { id: 'sjumper',  label: '☆ Chance of zombies having jumper ability',                                            default: 5  },
    { id: 'sbomber',  label: '★ Chance of zombies having bomber ability',                                            default: 5  },
    { id: 'sspitter', label: '☆ Chance of zombies having spitter ability',                                           default: 5  },
    { id: 'scrawler', label: '★ Chance of zombies having crawler ability',                                           default: 5  },
];

// sliderSettingss real (velocidad máxima del zombie, default=7)
const sliderSettingssReal = [
    { id: 'sprint', label: '☆ Maximum zombie speed', default: 7 },
];

// sliderSettings3 real (corpse cap, default=50)
const sliderSettings3 = [
    { id: 'ccap', label: '★ Corpse spawn limit (how many corpse are allowed to spawn in your world)', default: 50 },
];

// sliderSettings3a real (kick intensity)
const sliderSettings3a = [
    { id: 'hs', label: '☆ Horizontal kick intensity', default: 6 },
    { id: 'vs', label: '★ Vertical kick intensity',   default: 2 },
];

// rasSettings3 real (toggles de corpse)
const rasSettings3 = [
    { id: 'corpse', name: '🧟 Allow corpse',                                       value: true  },
    { id: 'kick',   name: '🔧  Corpse physics(might cause lag)',                   value: true  },
    { id: 'zkick',  name: '🔧  Zombies can kick corpse(might cause lag)',           value: true  },
];


// ============================================================
// SISTEMA DE BLOQUES DE DAÑO
// Bloques del mod que dañan a entidades al contacto.
// Hay tres categorías con daño diferente:
//   - WIRE_BLOCK_ID: vallas de alambre (daño medio)
//   - CHEVAL_BLOCK_ID: vallas chevaline reforzadas (daño alto)
//   - PLATE_BLOCK_ID: placas spiked (daño bajo)
// ============================================================

// Bloques de alambre: dañan zombies al contacto
const WIRE_BLOCK_ID = [
    'ranzie:wired_fence_block',
    'ranzie:wired_wall_block',
];

// Bloques chevaline reforzados: daño alto + ralentizan
const CHEVAL_BLOCK_ID = [
    'ranzie:cheval_fence',
    'ranzie:bamboo_reinforced_spiked_plate_block',
    'ranzie:oak_reinforced_spiked_plate_block',
    'ranzie:spruce_reinforced_spiked_plate_block',
    'ranzie:birch_reinforced_spiked_plate_block',
    'ranzie:acacia_reinforced_spiked_plate_block',
    'ranzie:dark_oak_reinforced_spiked_plate_block',
    'ranzie:mangrove_reinforced_spiked_plate_block',
    'ranzie:cherry_reinforced_spiked_plate_block',
    'ranzie:pale_reinforced_spiked_plate_block',
    'ranzie:crimson_reinforced_spiked_plate_block',
    'ranzie:warped_reinforced_spiked_plate_block',
    'ranzie:jungle_reinforced_spiked_plate_block',
];

// Placas spiked normales: daño bajo
const PLATE_BLOCK_ID = [
    'ranzie:bamboo_spiked_plate_block',
    'ranzie:oak_spiked_plate_block',
    'ranzie:spruce_spiked_plate_block',
    'ranzie:birch_spiked_plate_block',
    'ranzie:acacia_spiked_plate_block',
    'ranzie:dark_oak_spiked_plate_block',
    'ranzie:mangrove_spiked_plate_block',
    'ranzie:cherry_spiked_plate_block',
    'ranzie:pale_spiked_plate_block',
    'ranzie:crimson_spiked_plate_block',
    'ranzie:warped_spiked_plate_block',
    'ranzie:jungle_spiked_plate_block',
    'ranzie:iron_reinforced_spiked_plate_block',
    'ranzie:iron_spiked_plate_block',
];

// Daño base aplicado por los bloques de daño
let dmg = 5;

// Bloques que NO son sólidos/completos (para lógica de pathfinding del zombie)
const nonFull = [
    'minecraft:air', 'minecraft:short_grass', 'minecraft:slabs',
    'minecraft:trapdoors', 'minecraft:wildflowers', 'minecraft:pink_petals',
    'minecraft:tallgrass', 'minecraft:snow_layer', 'minecraft:flower',
    'minecraft:torch', 'minecraft:redstone_wire', 'minecraft:tripwire',
    'minecraft:cave_vines', 'minecraft:vine', 'minecraft:button',
    'minecraft:lever', 'minecraft:leaf_litter', 'minecraft:carpet',
    'minecraft:rail', 'minecraft:ladder', 'minecraft:light_block_15',
    // Placas spiked del mod (no sólidas, pero dañan al tocarlas)
    'ranzie:bamboo_reinforced_spiked_plate_block',
    'ranzie:oak_reinforced_spiked_plate_block',
    'ranzie:spruce_reinforced_spiked_plate_block',
    'ranzie:birch_reinforced_spiked_plate_block',
    'ranzie:acacia_reinforced_spiked_plate_block',
    'ranzie:dark_oak_reinforced_spiked_plate_block',
    'ranzie:mangrove_reinforced_spiked_plate_block',
    'ranzie:cherry_reinforced_spiked_plate_block',
    'ranzie:pale_reinforced_spiked_plate_block',
    'ranzie:crimson_reinforced_spiked_plate_block',
    'ranzie:warped_reinforced_spiked_plate_block',
    'ranzie:jungle_reinforced_spiked_plate_block',
    'ranzie:bamboo_spiked_plate_block',
    'ranzie:oak_spiked_plate_block',
    'ranzie:spruce_spiked_plate_block',
    'ranzie:birch_spiked_plate_block',
    'ranzie:acacia_spiked_plate_block',
    'ranzie:dark_oak_spiked_plate_block',
    'ranzie:mangrove_spiked_plate_block',
    'ranzie:cherry_spiked_plate_block',
    'ranzie:pale_spiked_plate_block',
    'ranzie:crimson_spiked_plate_block',
    'ranzie:warped_spiked_plate_block',
    'ranzie:jungle_spiked_plate_block',
];

// Tag que identifica a las entidades sobre una valla especial
const fenceTag = 'fence:is_fence';

/**
 * Aplica daño a entidades que están sobre bloques de daño del mod.
 * - WIRE blocks: 2 daño, aplica slowness 1
 * - CHEVAL blocks: 4 daño, aplica slowness 2
 * - PLATE blocks: 1 daño
 * Se ejecuta cada DAMAGE_INTERVAL ticks.
 */
function processDamageBlocks() {
    if (!dim) return;

    try {
        // Obtiene todos los zombies activos
        const entities = dim.getEntities({ type: 'minecraft:zombie' });

        for (const entity of entities) {
            if (!entity.isValid()) continue;

            const loc = entity.location;
            const fx = Math.floor(loc.x);
            const fz = Math.floor(loc.z);

            // Verifica el bloque en la posición del zombie y adyacentes
            for (const dy of [0, -1]) {
                try {
                    const block = dim.getBlock({ x: fx, y: Math.floor(loc.y + dy), z: fz });
                    if (!block) continue;
                    const bid = block.typeId;

                    if (WIRE_BLOCK_ID.includes(bid)) {
                        entity.runCommandAsync(`damage @s 2 contact`);
                        entity.runCommandAsync(`effect @s slowness 2 1 true`);
                    } else if (CHEVAL_BLOCK_ID.includes(bid)) {
                        entity.runCommandAsync(`damage @s ${dmg} contact`);
                        entity.runCommandAsync(`effect @s slowness 3 2 true`);
                    } else if (PLATE_BLOCK_ID.includes(bid)) {
                        entity.runCommandAsync(`damage @s 1 contact`);
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
}


// ============================================================
// SISTEMA DE INFECCIÓN - Versión completa del bytecode
// INFECTION_TIME = 5 * 60 = 300 segundos (5 minutos)
// Funciones separadas para iniciar, reanudar y detener el timer.
// ============================================================

// Tiempo de infección en ticks de juego (5 min × 60 seg × 20 ticks)
const INFECTION_TIME = 5 * 60;

// Mapa de timers de infección activos: playerId → { timerId, remaining }
const infectionTimers = new Map();

/**
 * Inicia el timer de infección para un jugador desde cero.
 * Si ya estaba infectado, reinicia el timer.
 * @param {Player} player - Jugador a infectar
 */
function startInfectionTimer(player) {
    // Detiene timer previo si existe
    if (infectionTimers.has(player.id)) {
        stopInfectionTimer(player, false);
    }

    player.sendMessage("§c☠ You have been infected! Use a §6Golden Apple§c to cure yourself.");
    player.runCommandAsync("tag @s add infected");

    // Aplica efectos de infección
    player.runCommandAsync("effect @s[tag=infected] slowness 9999 1 true");
    player.runCommandAsync("effect @s[tag=infected] weakness 9999 1 true");
    player.runCommandAsync("effect @s[tag=infected] hunger 9999 2 true");

    // Aplica niebla de infección si el setting está activo
    if (getSetting("fog", true)) {
        player.runCommandAsync("fog @s push ranzie:infection_fog ranzie_infection");
    }

    // Timer de muerte: 5 minutos → 6000 ticks
    const timerId = system.runTimeout(() => {
        if (!infectionTimers.has(player.id)) return;

        // El jugador no se curó: muere por infección
        try {
            player.runCommandAsync("damage @s 1000 generic_kill");
            player.sendMessage("§c☠ The infection has consumed you...");
        } catch (e) {}

        infectionTimers.delete(player.id);
        try {
            player.runCommandAsync("tag @s remove infected");
            if (getSetting("fog", true)) {
                player.runCommandAsync("fog @s remove ranzie_infection");
            }
            player.runCommandAsync("effect @s clear slowness");
            player.runCommandAsync("effect @s clear weakness");
            player.runCommandAsync("effect @s clear hunger");
        } catch (e) {}

    }, INFECTION_TIME * 20); // INFECTION_TIME segundos × 20 ticks/seg

    infectionTimers.set(player.id, { timerId, remaining: INFECTION_TIME * 20 });
}

/**
 * Reanuda el timer de infección al respawnear (con el tiempo restante guardado).
 * @param {Player} player - Jugador que respawnea
 * @param {number} remaining - Ticks restantes del timer anterior
 */
function startInfectionTimerResumed(player, remaining) {
    player.runCommandAsync("tag @s add infected");
    player.runCommandAsync("effect @s[tag=infected] slowness 9999 1 true");
    player.runCommandAsync("effect @s[tag=infected] weakness 9999 1 true");
    player.runCommandAsync("effect @s[tag=infected] hunger 9999 2 true");

    if (getSetting("fog", true)) {
        player.runCommandAsync("fog @s push ranzie:infection_fog ranzie_infection");
    }

    const timerId = system.runTimeout(() => {
        if (!infectionTimers.has(player.id)) return;
        try {
            player.runCommandAsync("damage @s 1000 generic_kill");
            player.sendMessage("§c☠ The infection has consumed you...");
        } catch (e) {}
        infectionTimers.delete(player.id);
        try {
            player.runCommandAsync("tag @s remove infected");
            if (getSetting("fog", true)) {
                player.runCommandAsync("fog @s remove ranzie_infection");
            }
            player.runCommandAsync("effect @s clear slowness");
            player.runCommandAsync("effect @s clear weakness");
            player.runCommandAsync("effect @s clear hunger");
        } catch (e) {}
    }, remaining);

    infectionTimers.set(player.id, { timerId, remaining });
}

/**
 * Detiene el timer de infección de un jugador.
 * @param {Player} player - Jugador
 * @param {boolean} clearEffects - Si true, limpia también los efectos de infección
 */
function stopInfectionTimer(player, clearEffects = false) {
    const data = infectionTimers.get(player.id);
    if (!data) return;

    system.clearRun(data.timerId);
    infectionTimers.delete(player.id);

    if (clearEffects) {
        player.runCommandAsync("tag @s remove infected");
        player.runCommandAsync("effect @s clear slowness");
        player.runCommandAsync("effect @s clear weakness");
        player.runCommandAsync("effect @s clear hunger");
        if (getSetting("fog", true)) {
            player.runCommandAsync("fog @s remove ranzie_infection");
        }
    }
}

/**
 * Cura al jugador de la infección (al comer Golden Apple).
 * @param {Player} player - Jugador a curar
 */
function curePlayer(player) {
    if (!infectionTimers.has(player.id)) return;

    stopInfectionTimer(player, true);
    player.sendMessage("§aYou have been cured of the zombie infection!");
}

/**
 * Guarda el tiempo restante de infección al morir para reanudarlo al respawn.
 * @param {EntityDieAfterEvent} event
 */
function onInfectionPlayerDeath(event) {
    const { deadEntity } = event;
    if (!deadEntity || deadEntity.typeId !== "minecraft:player") return;

    const data = infectionTimers.get(deadEntity.id);
    if (!data) return;

    // Guarda el tiempo restante como dynamic property
    world.setDynamicProperty(`rz:inf_${deadEntity.id}`, data.remaining);
    // Detiene sin limpiar efectos (se volverán a aplicar al respawn)
    system.clearRun(data.timerId);
    infectionTimers.delete(deadEntity.id);
}

/**
 * Reanuda la infección al respawnear si el jugador estaba infectado.
 * @param {PlayerSpawnAfterEvent} event
 */
function onInfectionPlayerRespawn(event) {
    const { player } = event;
    const remainingKey = `rz:inf_${player.id}`;
    const remaining = world.getDynamicProperty(remainingKey);

    if (!remaining || typeof remaining !== 'number' || remaining <= 0) return;

    // Limpia la propiedad guardada
    world.setDynamicProperty(remainingKey, 0);

    // Reanuda el timer con el tiempo restante
    startInfectionTimerResumed(player, remaining);
}

/**
 * Tick de infección: reduce el tiempo restante guardado en el Map.
 * Se ejecuta cada 20 ticks.
 */
function processInfectionTick() {
    for (const [playerId, data] of infectionTimers.entries()) {
        data.remaining = Math.max(0, data.remaining - 20);
        if (data.remaining <= 0) {
            // El timer ya disparó, la entrada quedó huérfana — limpiar
            infectionTimers.delete(playerId);
        }
    }
}

/**
 * Maneja el evento de curar la infección al usar Golden Apple.
 * @param {ItemCompleteUseAfterEvent} event
 */
function onCureInfectionItem(event) {
    const { itemStack, source } = event;
    if (!itemStack || !source || source.typeId !== "minecraft:player") return;
    if (itemStack.typeId !== "minecraft:golden_apple" &&
        itemStack.typeId !== "minecraft:enchanted_golden_apple") return;

    curePlayer(source);
}


// ============================================================
// SISTEMA DE FENCE_MANAGER (Gestión de vallas)
// Clase estática que actualiza el estado visual de las vallas
// del mod cuando se colocan o rompen bloques adyacentes.
// Usa el tag "fence:is_fence" para identificar vallas propias.
// ============================================================

/**
 * Gestor de vallas del mod.
 * Actualiza el estado de conexión de las vallas custom cuando
 * el jugador coloca o rompe bloques cercanos.
 */
class fence_Manager {

    /**
     * Actualiza el estado de una valla específica basándose en sus vecinos.
     * Activa el tag "fence:is_fence" si hay bloque sólido adyacente.
     * @param {Block} block - Bloque de valla a actualizar
     */
    static update_Fence_States(block) {
        if (!block) return;

        const loc = block.location;
        const d = block.dimension;
        const bid = block.typeId;

        // Solo procesa bloques de valla del mod
        if (!bid.includes('ranzie:') && !bid.includes('wired') &&
            !bid.includes('spiked') && !bid.includes('chain_fence')) return;

        // Comprueba bloques adyacentes (N, S, E, W)
        const neighbors = [
            d.getBlock({ x: loc.x + 1, y: loc.y, z: loc.z }),
            d.getBlock({ x: loc.x - 1, y: loc.y, z: loc.z }),
            d.getBlock({ x: loc.x, y: loc.y, z: loc.z + 1 }),
            d.getBlock({ x: loc.x, y: loc.y, z: loc.z - 1 }),
        ];

        // Actualiza el estado de conexión vía comando
        // (el motor de Bedrock maneja el modelo visual)
        try {
            d.runCommandAsync(
                `setblock ${loc.x} ${loc.y} ${loc.z} ${bid} ["update_bit":true]`
            );
        } catch (e) {}
    }

    /**
     * Actualiza todas las vallas alrededor de una posición dada.
     * Se llama cuando el jugador coloca o rompe un bloque.
     * @param {BlockLocationIterator|{x,y,z}} location - Posición del cambio
     */
    static updateFencesAround(location) {
        if (!dim) return;

        const { x, y, z } = location;

        // Actualiza los 6 vecinos ortogonales
        const offsets = [
            { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
            { x: 0, y: 1, z: 0 }, { x: 0, y: -1, z: 0 },
        ];

        for (const offset of offsets) {
            try {
                const neighborBlock = dim.getBlock({
                    x: Math.floor(x) + offset.x,
                    y: Math.floor(y) + offset.y,
                    z: Math.floor(z) + offset.z,
                });
                if (neighborBlock) {
                    fence_Manager.update_Fence_States(neighborBlock);
                }
            } catch (e) {}
        }
    }
}

// ============================================================
// SISTEMA DE CORPSE CON FÍSICA COMPLETA
// Constantes y mapas de estado del sistema de cadáveres.
// ============================================================

const CORPSE       = 'ranzie:corpse';   // Identificador de entidad cadáver
const KICK_DISTANCE = 1;               // Radio para detectar cadáveres a patear
const COOLDOWN_CORPSE = 20;            // Cooldown de patada en ticks

// Mapa de cooldown de patada: entityId → tick del último kick
const kickCooldown = new Map();

// Mapa de posiciones anteriores de corpses (para física de inercia)
const prevPos = new Map();

// Mapa de delay de animación de death: entityId → ticks restantes
const animDelay = new Map();

/**
 * Tick principal del sistema de corpse physics.
 * Se ejecuta cada tick (runInterval sin delay = 0 ticks).
 * Actualiza animaciones de muerte y aplica física a corpses.
 */
function processCorpseAnimTick() {
    if (!getSetting("corpse", false)) return;
    if (!dim) return;

    try {
        const corpses = dim.getEntities({ type: CORPSE });

        for (const corpse of corpses) {
            if (!corpse.isValid()) continue;
            const id = corpse.id;

            // Gestiona el delay de animación de death
            if (animDelay.has(id)) {
                const remaining = animDelay.get(id) - 1;
                if (remaining <= 0) {
                    animDelay.delete(id);
                } else {
                    animDelay.set(id, remaining);
                }
            }

            // Actualiza la posición anterior para física de inercia
            const loc = corpse.location;
            prevPos.set(id, { x: loc.x, y: loc.y, z: loc.z });
        }
    } catch (e) {}
}

/**
 * Aplica física de kick cuando un zombie está cerca de un corpse.
 * Versión completa con cooldown y dirección calculada.
 * @param {Entity} zombie - Zombie que patea
 */
function applyZombieKickFull(zombie) {
    if (!getSetting("corpse_kick", false)) return;
    if (!zombie.isValid()) return;

    const zombieId = zombie.id;
    const now = system.currentTick || 0;

    // Verifica cooldown del zombie
    if (kickCooldown.has(zombieId)) {
        if (now - kickCooldown.get(zombieId) < COOLDOWN_CORPSE) return;
    }

    const zombieLoc = zombie.location;

    try {
        const nearbyCopses = zombie.dimension.getEntities({
            type: CORPSE,
            maxDistance: KICK_DISTANCE + 0.5,
            location: zombieLoc,
        });

        for (const corpse of nearbyCopses) {
            if (!corpse.isValid()) continue;

            // Calcula vector desde zombie hacia corpse
            const cLoc = corpse.location;
            const dx = cLoc.x - zombieLoc.x;
            const dz = cLoc.z - zombieLoc.z;
            const len = Math.sqrt(dx * dx + dz * dz) || 1;

            // Aplica impulso
            try {
                corpse.applyKnockback(
                    (dx / len) * HS,
                    (dz / len) * HS,
                    VS,
                    VS * 0.5
                );
            } catch (e) {
                // Fallback via tp
                corpse.runCommandAsync(
                    `tp @s ~${((dx / len) * HS * 0.3).toFixed(2)} ~${(VS * 0.2).toFixed(2)} ~${((dz / len) * HS * 0.3).toFixed(2)}`
                );
            }

            // Actualiza cooldown
            kickCooldown.set(zombieId, now);
            break; // Solo patea un corpse por tick
        }
    } catch (e) {}
}


// ============================================================
// CONSTANTES GLOBALES REALES (valores exactos del bytecode)
// Corrigen los valores estimados definidos al principio del archivo.
// ============================================================

// Duración total de una horda: 1200 ticks = 60 segundos
const HORDE_DURATION_TICKS_REAL = 1200;

// Día mínimo para que ocurra la primera horda
const MIN_HORDE_DAY_REAL = 0; // La horda puede ocurrir desde el día 0

// Tiempo de infección: 300 segundos (5 minutos) × 20 ticks = 6000 ticks
// (ya definido arriba como INFECTION_TIME = 5 * 60)

// Tag de nuevo spawn para controlar que el zombie recién spawneado
// recibe habilidades y equipamiento exactamente una vez
const NEW_TAG = 'new_spawn';

// ============================================================
// FUNCIÓN REAL: pickArmorPart (usa armorSets por slot)
// Selecciona una pieza de armadura para un slot específico
// usando las tablas ponderadas reales.
// ============================================================

/**
 * Selecciona aleatoriamente una pieza de armadura para un slot dado,
 * usando las tablas ponderadas del mod.
 * @param {string} slot - "head", "chest", "legs" o "feet"
 * @returns {string} Nombre del ítem de armadura (sin namespace minecraft:)
 */
function pickArmorPartBySlot(slot) {
    const pool = armorSets[slot];
    if (!pool || pool.length === 0) return 'leather_helmet';
    return pickWeighted(pool).item;
}

// ============================================================
// FUNCIÓN REAL: pickTool (usa materials + tools reales)
// Construye el nombre del arma combinando material + tipo.
// Con probabilidad usa las armas custom ranzie: (rztools).
// ============================================================

/**
 * Selecciona una herramienta/arma para equipar al zombie.
 * - 60% probabilidad: arma custom Ranzie (bolo, katana, etc.)
 * - 40% probabilidad: arma vanilla (wooden_sword, iron_axe, etc.)
 * @returns {string} ID completo del ítem (ej: "ranzie:iron_katana")
 */
function pickToolReal() {
    const useCustom = Math.random() < 0.6;

    if (useCustom) {
        // Arma custom del mod: material ranzie + tipo custom
        const mat  = pickWeighted(rzmaterials).prefix;   // ej: "ranzie:iron_"
        const tool = rztools[Math.floor(Math.random() * rztools.length)]; // ej: "katana"
        return mat + tool; // ej: "ranzie:iron_katana"
    } else {
        // Arma vanilla: material vanilla + tipo vanilla
        const mat  = pickWeighted(materials).prefix; // ej: "iron_"
        const tool = tools[Math.floor(Math.random() * tools.length)]; // ej: "sword"
        return mat + tool; // ej: "iron_sword"
    }
}

// ============================================================
// FUNCIÓN REAL: equipZombie (versión completa)
// Usa las tablas de armadura por slot y la función pickToolReal.
// La probabilidad de equipamiento escala con el día actual.
// ============================================================

/**
 * Equipa completamente a un zombie con armadura y arma.
 * Versión corregida que usa los datos reales del bytecode.
 * La probabilidad de cada pieza sube con el avance de días.
 * @param {Entity} entity - Entidad zombie a equipar
 */
function equipZombieReal(entity) {
    if (!entity || entity.typeId !== 'minecraft:zombie') return;

    const day      = world.getDay();
    const maxDay   = getSetting('max_day', 100);
    const ratio    = Math.min(day / maxDay, 1.0);

    // Probabilidad de tener armadura escala: 0% día 0 → ~80% día max
    const armorChance = ratio * getSetting('gear_chance', 0.8);

    // Probabilidad de tener arma en mano: siempre presente tras día 1
    const weaponChance = Math.min(ratio + 0.1, 1.0);

    // --- Casco ---
    if (Math.random() < armorChance) {
        const helm = pickArmorPartBySlot('head');
        entity.runCommandAsync(
            `replaceitem entity @s[type=zombie] slot.armor.head 0 keep ${helm}`
        );
    }

    // --- Pechera ---
    if (Math.random() < armorChance) {
        const chest = pickArmorPartBySlot('chest');
        entity.runCommandAsync(
            `replaceitem entity @s[type=zombie] slot.armor.chest 0 keep ${chest}`
        );
    }

    // --- Pantalones ---
    if (Math.random() < armorChance) {
        const legs = pickArmorPartBySlot('legs');
        entity.runCommandAsync(
            `replaceitem entity @s[type=zombie] slot.armor.legs 0 keep ${legs}`
        );
    }

    // --- Botas ---
    if (Math.random() < armorChance) {
        const boots = pickArmorPartBySlot('feet');
        entity.runCommandAsync(
            `replaceitem entity @s[type=zombie] slot.armor.feet 0 keep ${boots}`
        );
    }

    // --- Arma principal ---
    if (Math.random() < weaponChance) {
        const weapon = pickToolReal();
        entity.runCommandAsync(
            `replaceitem entity @s[type=zombie] slot.weapon.mainhand 0 ${weapon}`
        );

        // Encantamiento aleatorio (10% probabilidad)
        if (Math.random() < 0.1) {
            const enchant = getRandom(toolEnchants);
            entity.runCommandAsync(
                `enchant @s[type=zombie] ${enchant} 1`
            );
        }
    }

    // --- Offhand según tipo especial ---
    // Bombers: TNT | Warners: cuerno | Enders: perla | Witches: poción
    entity.runCommandAsync(
        `replaceitem entity @s[type=zombie,tag=!bomber,tag=!ender,tag=!witch,tag=!warner] slot.weapon.offhand 0 keep totem_of_undying`
    );
    entity.runCommandAsync(
        `replaceitem entity @s[type=zombie,tag=bomber]  slot.weapon.offhand 0 tnt`
    );
    entity.runCommandAsync(
        `replaceitem entity @s[type=zombie,tag=warner]  slot.weapon.offhand 0 goat_horn`
    );
    entity.runCommandAsync(
        `replaceitem entity @s[type=zombie,tag=ender]   slot.weapon.offhand 0 ender_pearl`
    );
    entity.runCommandAsync(
        `replaceitem entity @s[type=zombie,tag=witch]   slot.weapon.offhand 0 splash_potion 1 23`
    );
}


// ============================================================
// SWEEP ATTACK COMPLETO (sweepCooldowns)
// Usa el Map sweepCooldowns para cooldown por jugador.
// El sweep daña en radio 2 bloques al atacar con espada.
// El crit se aplica al caer (velocidad Y negativa).
// ============================================================

// Cooldown de sweep por jugador (playerId → lastHitTick)
const sweepCooldowns = new Map();

// Ticks de cooldown entre sweeps (8 ticks ≈ 0.4s, como Java)
const SWEEP_COOLDOWN = 8;

/**
 * Versión completa de handleHit.
 * Aplica sweep attack y critical hits como Java Edition.
 * @param {Entity} attacker - Entidad que ataca
 * @param {Entity} victim   - Entidad que recibe el golpe
 */
function handleHitFull(attacker, victim) {
    if (!getSetting('pvp', false)) return;
    if (!attacker || !victim) return;
    if (attacker.typeId !== 'minecraft:player') return;

    const now     = system.currentTick || 0;
    const lastHit = sweepCooldowns.get(attacker.id) || 0;

    // Verifica cooldown de sweep
    if (now - lastHit < SWEEP_COOLDOWN) return;

    // ─── CRITICAL HIT ────────────────────────────────────────
    // Un crit ocurre si el jugador está cayendo (vel.y < 0)
    let isCrit = false;
    try {
        const vel = attacker.getVelocity();
        isCrit = vel && vel.y < -0.1;
    } catch (e) {}

    if (isCrit) {
        // Partícula de crit encima del objetivo
        try {
            victim.dimension.spawnParticle(
                'minecraft:critical_hit_emitter',
                victim.location
            );
        } catch (e) {}
        // El daño extra de crit (1.5x) lo aplica el motor de Bedrock
        // si el jugador está cayendo — aquí solo hacemos el sweep
    }

    // ─── SWEEP ATTACK ────────────────────────────────────────
    // Solo con espada o arma custom de Ranzie
    let hasSword = false;
    try {
        const inv  = attacker.getComponent('inventory');
        const held = inv?.container?.getItem(attacker.selectedSlotIndex || 0);
        if (held) {
            hasSword = held.typeId.includes('sword') ||
                       held.typeId.includes('katana') ||
                       held.typeId.includes('longsword') ||
                       held.typeId.includes('saber');
        }
    } catch (e) {}

    if (hasSword) {
        // Daña mobs en radio 2 alrededor del objetivo (sin incluir al atacante)
        try {
            attacker.runCommandAsync(
                `damage @e[r=2,type=!player,tag=!${attacker.id}] 1 entity_attack entity @s`
            );
        } catch (e) {
            attacker.runCommandAsync(
                `execute as @s at @s run damage @e[r=2,type=!player] 1 entity_attack entity @s`
            );
        }
        // Partícula de sweep
        try {
            victim.dimension.spawnParticle(
                'minecraft:sweep_attack_emitter',
                victim.location
            );
        } catch (e) {}
    }

    sweepCooldowns.set(attacker.id, now);
}

// ============================================================
// SISTEMA DE ZOOM (zoomLevel / zoomDefault)
// El mod incluye un sistema de zoom para el scope de armas.
// Usa las Maps zoomLevel y zoomDefault para gestionar el FOV
// de cada jugador.
// ============================================================

// FOV actual de zoom por jugador (playerId → nivel 1-5)
const zoomLevel   = new Map();

// FOV por defecto de cada jugador (playerId → FOV original)
const zoomDefault = new Map();

/**
 * Aplica el zoom a un jugador (reduce el FOV temporalmente).
 * Se usa con el scope de la katana o armas de largo alcance.
 * @param {Player} player   - Jugador
 * @param {number} level    - Nivel de zoom (1-5, mayor = más zoom)
 */
function applyZoom(player, level) {
    if (!player.isValid()) return;
    const clamped = Math.max(1, Math.min(level, 5));
    zoomLevel.set(player.id, clamped);

    // Aplica el efecto de zoom via slowness + FOV implícito
    // En Bedrock el zoom real requiere resource pack, aquí usamos
    // blindness de muy corta duración para indicar zoom activo
    player.runCommandAsync(`effect @s slowness 1 ${clamped} true`);
}

/**
 * Quita el zoom de un jugador, restaurando el FOV original.
 * @param {Player} player - Jugador
 */
function removeZoom(player) {
    if (!zoomLevel.has(player.id)) return;
    zoomLevel.delete(player.id);
    player.runCommandAsync(`effect @s clear slowness`);
}


// ============================================================
// TICK PERIÓDICO DE INFECCIÓN (cada 20 ticks)
// Muestra partículas verdes en jugadores infectados y
// actualiza el countdown visible en el chat.
// ============================================================

/**
 * Tick de visualización de infección.
 * Muestra partículas de niebla verde en jugadores infectados
 * y muestra el tiempo restante cada 5 segundos.
 * Se ejecuta cada 20 ticks (1 segundo).
 */
function processInfectionVisuals() {
    if (INFECTION <= 0) return;

    for (const [playerId, data] of infectionTimers.entries()) {
        const player = getPlayerById(playerId);
        if (!player || !player.isValid()) continue;

        // Partícula de infección
        try {
            player.dimension.spawnParticle(
                'ranzie:infection_particle',
                player.location
            );
        } catch (e) {}

        // Mensaje de tiempo restante cada 100 ticks (5 segundos)
        const remaining = data.remaining;
        if (remaining % 100 === 0 && remaining > 0) {
            const seconds = Math.floor(remaining / 20);
            const mins    = Math.floor(seconds / 60);
            const secs    = seconds % 60;
            player.sendMessage(
                `§c☠ Infected! Time remaining: §e${mins}:${secs.toString().padStart(2, '0')}`
            );
        }
    }
}

// ============================================================
// SISTEMA DE CORPSE SPAWN COMPLETO
// Cuando un zombie muere, el tag de corpse lo transforma en
// ranzie:corpse. El sistema gestiona el límite y la physics.
// ============================================================

/**
 * Handler de entitySpawn para corpses.
 * Se activa cuando spawnea una entidad con tag CORPSE_TAG.
 * Aplica escala y physics inicial.
 * @param {EntitySpawnAfterEvent} event
 */
function onNewEntitySpawnForCorpse(event) {
    const { entity } = event;
    if (!entity) return;
    if (entity.typeId !== CORPSE) return;
    if (entity.hasTag(CORPSE_TAG)) return; // ya procesado

    entity.addTag(CORPSE_TAG);

    // Aplica escala según nombre (jefes de horda)
    handleCorpseScale(entity);

    // Inicializa el delay de animación
    animDelay.set(entity.id, 5);

    // Aplica impulso inicial de physics
    if (getSetting('corpse_physics', false)) {
        try {
            entity.applyKnockback(
                (Math.random() - 0.5) * HS * 0.2,
                (Math.random() - 0.5) * HS * 0.2,
                VS * 0.15,
                VS * 0.1
            );
        } catch (e) {}
    }
}

/**
 * Handler de entitySpawn para el tag NEW_TAG en zombies.
 * Evita que un zombie reciba habilidades/equipo más de una vez.
 * @param {EntitySpawnAfterEvent} event
 */
function onNewZombieSpawn(event) {
    const { entity } = event;
    if (!entity || entity.typeId !== 'minecraft:zombie') return;
    if (entity.hasTag(NEW_TAG)) return; // ya inicializado

    entity.addTag(NEW_TAG);

    // Delega en las funciones de asignación
    assignZombieAbilities(entity);
    equipZombieReal(entity);
    updateZombieSpeed(entity);
}

// ============================================================
// HANDLER DE playerBreakBlock / playerPlaceBlock
// Actualiza el estado de las vallas adyacentes.
// ============================================================

/**
 * Al romper un bloque, actualiza las vallas cercanas.
 * @param {PlayerBreakBlockAfterEvent} event
 */
function onPlayerBreakBlock(event) {
    const { block } = event;
    if (!block) return;
    fence_Manager.updateFencesAround(block.location);
}

/**
 * Al colocar un bloque, actualiza las vallas cercanas.
 * @param {PlayerPlaceBlockAfterEvent} event
 */
function onPlayerPlaceBlock(event) {
    const { block } = event;
    if (!block) return;
    fence_Manager.updateFencesAround(block.location);
}

// ============================================================
// HANDLER DE entityDie (múltiples sistemas)
// 1. Infección: guarda tiempo restante al morir
// 2. Corpse: limpia el Map de prevPos
// 3. Fence: actualiza vallas al morir mob sobre ellas
// ============================================================

/**
 * Handler genérico de entityDie.
 * Enruta al sistema correcto según el tipo de entidad.
 * @param {EntityDieAfterEvent} event
 */
function onEntityDieGeneric(event) {
    const { deadEntity } = event;
    if (!deadEntity) return;

    // Limpieza de posición previa de corpse
    if (prevPos.has(deadEntity.id)) {
        prevPos.delete(deadEntity.id);
    }
    if (animDelay.has(deadEntity.id)) {
        animDelay.delete(deadEntity.id);
    }
    if (kickCooldown.has(deadEntity.id)) {
        kickCooldown.delete(deadEntity.id);
    }
}

/**
 * Handler de muerte de entidad fence (valla con mob encima).
 * Actualiza el estado visual de la valla.
 * @param {EntityDieAfterEvent} event
 */
function onEntityDieFence(event) {
    const { deadEntity } = event;
    if (!deadEntity) return;

    // Si el zombie murió sobre una valla, actualiza el estado
    try {
        const loc   = deadEntity.location;
        const block = deadEntity.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y - 1),
            z: Math.floor(loc.z),
        });
        if (block) fence_Manager.update_Fence_States(block);
    } catch (e) {}
}

