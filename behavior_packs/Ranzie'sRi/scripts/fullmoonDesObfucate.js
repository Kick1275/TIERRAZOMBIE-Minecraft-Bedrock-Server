// fullmoon_clean.js — Deobfuscated version of fullmoon.js
// Original: Ranzie's Rising Dead — Blood Moon / Zombie Horde system
// Deobfuscated by analysis of the custom bytecode VM (i/c/p/l/j arrays)

import { world, system, ItemStack } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { EntityHealthComponent, EntityComponentTypes } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { Block } from '@minecraft/server';

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_HORDE_DAY = 0;          // Day hordes can start spawning
const HORDE_DURATION_TICKS = 1200; // 0x4b0 — how long a horde lasts (ticks)
const MAX_HORDE_TICKS = 3200;      // 0xc80 — absolute max horde duration
let MAX_DAY = 100;                 // 0x64 — survival goal (days)
let MAX_HORDE_SPAWN = 20;          // 0x14 — max zombies per horde wave
let INFECTION = 1;                 // infection chance multiplier
let MIN_ENCHANT_DAY = Math.floor(MAX_DAY * 0.7); // day enchanted gear starts appearing
let zombieCap = 50;                // 0x32
let corpseCap = 50;                // 0x32
let GROW = 8;                      // speed growth interval (every N difficulty)
let ZA = 5;                        // chance of zombie with abilities
let ZM = 40;                       // 0x28 — chance of miner zombie
let ZP = 30;                       // 0x1e — chance of block-placing zombie
let ZC = 20;                       // 0x14 — chance of climbing zombie
let HS = 6;                        // horizontal kick intensity
let VS = 2;                        // vertical kick intensity
let sPOTION = 5;                   // chance of potion zombie
let sWARNER = 5;                   // chance of warner zombie
let sENDER = 5;                    // chance of ender zombie
let sWITCH = 5;                    // chance of witch zombie
let sJUMPER = 5;                   // chance of jumper zombie
let sBOMBER = 5;                   // chance of bomber zombie
let sSPITTER = 5;                  // chance of spitter zombie
let sCRAWLER = 5;                  // chance of crawler zombie
let SPRINT = 7;                    // max zombie speed level
let nextHordeGap = 1;              // days between hordes

// ─── State Variables ─────────────────────────────────────────────────────────

let isFullMoonActive = false;
let hordeActive = false;
let leadersSpawnedThisHorde = false; // gates Giant/Necromancer/Tank to once per horde
let hordeSpawnedToday = false;
let hordeTicksRemaining = 0;
let lastHordeDay = -1;
let hordeResetTime = Math.floor(Math.random() * 24000); // random time offset
let objectivesCreated = false;
let hordeTimerId = null;
let corpseCount = 0; // mirrors live corpse entity count without re-scanning the world each time

// ─── Sets / Maps ─────────────────────────────────────────────────────────────

const journalStoryActive = new Set();
const playersGivenJournal = new Set();
const difficultyDisplayToggledOff = new Set();
const sweepCooldowns = new Map();
const zoomLevel = new Map();
const zoomDefault = new Map();
const kickCooldown = new Map();
const prevPos = new Map();
const animDelay = new Map();
const infectionTimers = new Map();
let healCount = new Map();
let cooldown = new Map();

// ─── Settings Definitions ────────────────────────────────────────────────────

let rasSettings = [
    { id: 'block_place', name: ':crafting_table:  Zombies can place blocks', value: true },
    { id: 'block_break', name: ':wood_pickaxe:   Zombies can mine', value: true },
    { id: 'gear_chance', name: ':armor:    Zombies can wear armor', value: true },
    { id: 'ability',     name: ':wood_sword: Zombies with custom abilities', value: true },
    { id: 'zonly',       name: ':code_builder_button:   Other monsters will not spawn(once they spawned, you cannot remove them)', value: true },
    { id: 'fog',         name: ':camera:   fog effect during infection & bloodmoon(turn on or off before it occurs)', value: true },
    { id: 'fade',        name: ':code_builder_button:   Removes all zombies after blood moon', value: true },
    { id: 'diff',        name: ':ps4_face_button_down:   Show difficulty bar', value: true },
    { id: 'pvp',         name: ':wood_sword: Enable sweep and crit attacks', value: true },
    { id: 'sat',         name: ':shank:    Enable java regeneration', value: true },
    { id: 'torch',       name: ':solid_star:   Enable dynamic torch', value: true },
    { id: 'oz',          name: ':code_builder_button:   Blocks only damage zombies(§creduces lag§f)', value: true },
];

let rasSettings2 = [
    { id: 'potion',   name: ':code_builder_button:   Zombies with potion effects', value: true },
    { id: 'warner',   name: ':code_builder_button:   Zombies warner', value: true },
    { id: 'ender',    name: ':code_builder_button:   Zombies ender', value: true },
    { id: 'witch',    name: ':code_builder_button:   Zombies witch', value: true },
    { id: 'jumper',   name: ':code_builder_button:   Zombie jumper', value: true },
    { id: 'bomber',   name: ':code_builder_button:   Zombie bomber', value: true },
    { id: 'spitter',  name: ':code_builder_button:   Zombie spitter', value: true },
    { id: 'crawler',  name: ':code_builder_button:   Zombie crawler', value: true },
    { id: 'hp',       name: ':code_builder_button:   Scaling zombie hp', value: true },
];

let rasSettings3 = [
    { id: 'corpse', name: ':code_builder_button: Allow corpse', value: true },
    { id: 'kick',   name: ':code_builder_button:   Corpse physics(§cmight cause lag§f)', value: true },
    { id: 'zkick',  name: ':code_builder_button:   Zombies can kick corpse(§cmight cause lag§f)', value: true },
];

const sliderSettings = [
    { id: 'max_day',       label: ':hollow_star: How many days do you want to survive? (max day)', default: 100 },
    { id: 'max_horde_spawn', label: ':solid_star: Max Zombie Horde Spawn (increases each day until it reaches the max horde spawn)(§creduces lag if you set it to a lower value§f)', default: 50 },
    { id: 'infection',     label: ':hollow_star: Chance of getting infected (e.g. 0.1, 1, or 100. set to 0 to turn off)', default: 1 },
    { id: 'zcap',          label: ':solid_star: Zombie spawn limit (how many zombies are allowed to spawn in your world)(§creduces lag if you set it to a lower value§f)', default: 50 },
    { id: 'growth',        label: ':hollow_star: Zombie\'s movement speed increases every ___ difficulty', default: 8 },
];

const sliderSettings2 = [
    { id: 'za',       label: ':hollow_star: Chance of zombie spawning with abilities(§cmight cause lag if the value is too high§f)', default: 5 },
    { id: 'zm',       label: ':solid_star: Chance of zombie spawning with mining ability', default: 40 },
    { id: 'zp',       label: ':hollow_star: Chance of zombie spawning with block placing ability', default: 30 },
    { id: 'zc',       label: ':solid_star: Chance of zombie spawning with climbing ability', default: 20 },
    { id: 'spotion',  label: ':hollow_star: Chance of zombies having potion effects', default: 5 },
    { id: 'swarner',  label: ':solid_star: Chance of zombies having warner ability', default: 5 },
    { id: 'sender',   label: ':hollow_star: Chance of zombies having ender ability', default: 5 },
    { id: 'switch',   label: ':solid_star: Chance of zombies having witch effect', default: 5 },
    { id: 'sjumper',  label: ':hollow_star: Chance of zombies having jumper ability', default: 5 },
    { id: 'sbomber',  label: ':solid_star: Chance of zombies having bomber ability', default: 5 },
    { id: 'sspitter', label: ':hollow_star: Chance of zombies having spitter ability', default: 5 },
    { id: 'scrawler', label: ':solid_star: Chance of zombies having crawler ability', default: 5 },
];

const sliderSettings3 = [
    { id: 'ccap', label: ':solid_star: Corpse spawn limit (how many corpse are allowed to spawn in your world)', default: 50 },
];

const sliderSettings3a = [
    { id: 'hs', label: ':hollow_star: Horizontal kick intensity', default: 6 },
    { id: 'vs', label: ':solid_star: Vertical kick intensity', default: 2 },
];

const sliderSettingss = [
    { id: 'sprint', label: ':hollow_star: Maximum zombie speed', default: 7 },
];

// ─── Armor / Tool Data ───────────────────────────────────────────────────────

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

const tools = ['sword', 'shovel', 'pickaxe', 'axe', 'hoe'];
const rztools = ['bolo', 'katana', 'longsword', 'hammer', 'saber', 'dagger'];

const materials = [
    { prefix: 'wooden_',    weight: 30 },
    { prefix: 'stone_',     weight: 30 },
    { prefix: 'iron_',      weight: 30 },
    { prefix: 'golden_',    weight: 30 },
    { prefix: 'diamond_',   weight: 15 },
    { prefix: 'netherite_', weight: 5  },
    { prefix: 'copper_',    weight: 30 },
];

const rzmaterials = [
    { prefix: 'ranzie:wooden_',    weight: 30 },
    { prefix: 'ranzie:stone_',     weight: 30 },
    { prefix: 'ranzie:iron_',      weight: 30 },
    { prefix: 'ranzie:golden_',    weight: 30 },
    { prefix: 'ranzie:diamond_',   weight: 15 },
    { prefix: 'ranzie:netherite_', weight: 5  },
];

const toolEnchants = [
    'unbreaking', 'mending', 'efficiency', 'silk_touch', 'sharpness',
    'smite', 'bane_of_arthropods', 'fire_aspect', 'looting', 'knockback',
    'fortune', 'vanishing', 'flame', 'power', 'binding',
];

// ─── Block / Entity Constants ─────────────────────────────────────────────────

const WIRE_BLOCK_ID = ['ranzie:wired_fence_block', 'ranzie:wired_wall_block'];

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

const DAMAGE_INTERVAL = 40; // widened from 20 — halves hazard-block scan frequency, negligible gameplay impact
let dmg = 5;

const NEW_TAG = 'new_spawn';
const CORPSE_TAG = 'corpse_spawn';
const CORPSE = 'ranzie:corpse';
const KICK_DISTANCE = 1;
const COOLDOWN = 20;
const INTERVAL = 0;
const INFECTION_TIME = 5 * 60; // 300 ticks

const corpseEventMap = {
    'Giant Horde Leader':      'giant',
    'Necromancer Horde Leader': 'summoner',
    'Tank Horde Leader':        'tank',
};

// Maps ability tag -> entity event triggered on spawn (see ABILITY_EVENT_MAP usage).
const ABILITY_EVENT_MAP = {
    bomber:  'kaboom',
    spitter: 'spit',
    crawler: 'crawler',
    climber: 'climber',
    witch:   'witch',
    ender:   'ender',
    mlg:     'mlg',
    warner:  'revealer',
};

const nonFull = [
    'minecraft:air', 'minecraft:short_grass', 'minecraft:slabs',
    'minecraft:trapdoors', 'minecraft:wildflowers', 'minecraft:pink_petals',
    'minecraft:tallgrass', 'minecraft:snow_layer', 'minecraft:flower',
    'minecraft:torch', 'minecraft:redstone_wire', 'minecraft:tripwire',
    'minecraft:cave_vines', 'minecraft:vine', 'minecraft:button',
    'minecraft:lever', 'minecraft:leaf_litter', 'minecraft:carpet',
    'minecraft:rail', 'minecraft:ladder', 'minecraft:light_block_15',
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

const fenceTag = 'fence:is_fence';
const hunger = 20;

// ─── Helper: getSetting ───────────────────────────────────────────────────────
// Reads a dynamic property from the world, falling back to a default value.
// p[0] = id (string), p[1] = type ('number' | other)
function getSetting(id, type) {
    const raw = world.getDynamicProperty(id);
    if (raw === undefined) return undefined;
    if (type === 'number') return Number(raw);
    return raw;
}

// ─── Helper: getHordeDurationTicks ───────────────────────────────────────────
// Returns the horde duration, capped at MAX_HORDE_TICKS.
// p[0] = base ticks (HORDE_DURATION_TICKS)
function getHordeDurationTicks(baseTicks) {
    return Math.min(MAX_HORDE_TICKS, baseTicks * 2);
}

// ─── Helper: getRandom ────────────────────────────────────────────────────────
// Returns a random element from an array.
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Helper: pickWeighted ─────────────────────────────────────────────────────
// Picks a random item from a weighted array [{value, weight}, ...].
function pickWeighted(arr) {
    const total = arr.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * total;
    for (const item of arr) {
        rand -= item.weight;
        if (rand <= 0) return item;
    }
    return arr[arr.length - 1];
}

// ─── Helper: pickTool ─────────────────────────────────────────────────────────
// Picks a random tool item string (material + tool type).
// Uses weighted material selection; 60% chance of vanilla tools, 40% ranzie tools.
function pickTool() {
    const material = pickWeighted(materials);
    const rzMaterial = pickWeighted(rzmaterials);
    const tool = getRandom(tools);
    const rztool = getRandom(rztools);
    const prefix = material.prefix !== undefined ? material.prefix : material;
    const rzprefix = rzMaterial.prefix !== undefined ? rzMaterial.prefix : rzMaterial;
    const useRz = Math.random() < 0.6;
    if (useRz) {
        return rzprefix + rztool;
    } else {
        return prefix + tool;
    }
}

// ─── Helper: pickArmorPart ────────────────────────────────────────────────────
// Picks a random armor item for a given slot (head/chest/legs/feet).
function pickArmorPart(slot) {
    return pickWeighted(armorSets[slot]).item;
}

// ─── Helper: shouldEquip ──────────────────────────────────────────────────────
// Returns true if a zombie should equip an armor piece (based on pieceChance).
function shouldEquip(pieceChance) {
    return Math.random() < pieceChance;
}

// ─── Helper: shouldEquipHand ──────────────────────────────────────────────────
// Returns true if a zombie should equip a hand item (based on pieceChanceHand).
function shouldEquipHand(pieceChanceHand) {
    return Math.random() < pieceChanceHand;
}

// ─── Moon Phase Tracking ──────────────────────────────────────────────────────

// moon_track() — runs every 50 ticks via system.runInterval
// Tracks the moon phase and manages bloodmoon/moon tags and isFullMoonActive flag.
function moon_track() {
    const moonPhase = world.getMoonPhase();
    const timeOfDay = world.getTimeOfDay();

    // Full moon = phase 0; check time window (12000–23040 = night)
    if (moonPhase === 0) {
        if (timeOfDay >= 12000 && timeOfDay < 23040) {
            // It's a full moon night — activate blood moon
            if (!isFullMoonActive) {
                world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');
                isFullMoonActive = true;
                triggerHorde();
            }
        } else {
            // Full moon but daytime — remove bloodmoon tag
            world.getDimension('overworld').runCommandAsync('tag @a remove bloodmoon');
        }
    } else {
        // Not a full moon — remove bloodmoon tag, add regular moon tag
        world.getDimension('overworld').runCommandAsync('tag @a remove bloodmoon');
        world.getDimension('overworld').runCommandAsync('tag @a add moon');
    }
}

// Runs every 50 ticks
system.runInterval(() => {
    moon_track();
}, 50);

// ─── Entity Spawn: Zombie Awareness ──────────────────────────────────────────
// When a zombie spawns, check time of day and moon phase to trigger awareness.
world.afterEvents.entitySpawn.subscribe(p => {
    const entity = p.entity;
    const timeOfDay = world.getTimeOfDay();
    const moonPhase = world.getMoonPhase();

    if (entity.typeId !== 'minecraft:zombie') return;

    // Night time (12000–23040)
    if (timeOfDay >= 12000 && timeOfDay < 23040) {
        if (moonPhase === 0) {
            // Full moon — make zombie aware immediately
            entity.triggerEvent('aware');
        }
    }
});

// ─── Before Event: Prevent Sleep During Blood Moon / Horde ───────────────────
// Cancels bed interaction if it's a full moon night or horde is active.
world.beforeEvents.playerInteractWithBlock.subscribe(p => {
    const player = p.player;
    const block = p.block;
    const timeOfDay = world.getTimeOfDay();
    const moonPhase = world.getMoonPhase();

    if (block.typeId !== 'minecraft:bed') return;

    // Full moon night — prevent sleep
    if (timeOfDay >= 12000 && timeOfDay < 23040 && moonPhase === 0) {
        player.sendMessage('§cYou\'re too afraid to sleep right now');
        p.cancel = true;
        return;
    }

    // Horde active — prevent sleep
    if (hordeActive) {
        player.sendMessage('A feeling of impending dread prevents you from sleeping');
        p.cancel = true;
    }
});

// ─── Full Moon Start / End ────────────────────────────────────────────────────

// fm_start() — called when the blood moon begins
function fm_start() {
    world.getDimension('overworld').runCommandAsync('tellraw @a {"rawtext":[{"text":"§cThe Blood Moon is rising..."}]}');
    world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');

    const currentDay = world.getDay();

    // Only trigger horde if past minimum day threshold
    if (currentDay >= MIN_HORDE_DAY) {
        // Delay horde start by 100 ticks
        system.runTimeout(() => {
            fm_start(); // re-entry point for horde trigger
        }, 100);
    }
}

// fm_end() — called when the blood moon ends
function fm_end() {
    world.getDimension('overworld').runCommandAsync('tellraw @a {"rawtext":[{"text":"§fThe §cBlood Moon §fis fading..."}]}');
    world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');
    world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');

    // Check fade setting — if enabled, despawn all zombies
    const fadeEnabled = getSetting('fade');
    if (fadeEnabled) {
        world.getDimension('overworld').runCommandAsync('event entity @e[type=zombie] minecraft:start_despawn');
    }

    world.getDimension('overworld').runCommandAsync('effect @a[tag=moon] clear night_vision');
    world.getDimension('overworld').runCommandAsync('title @a title DAY TIME GET RESOURCES');
    world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');
    world.getDimension('overworld').runCommandAsync('tag @a add bloodmoon');
}

// ─── Scoreboard Objectives Setup ─────────────────────────────────────────────

// setupObjectives() — creates scoreboard objectives if not already created
function setupObjectives() {
    if (objectivesCreated) return;

    const overworld = world.getDimension('overworld');
    overworld.runCommandAsync('scoreboard objectives add day dummy');
    overworld.runCommandAsync('scoreboard objectives add alive dummy');
    overworld.runCommandAsync('scoreboard objectives add level dummy');
    overworld.runCommandAsync('scoreboard objectives add speed dummy');
    overworld.runCommandAsync('scoreboard objectives add place dummy');

    objectivesCreated = true;
    updateZombieScores();
}

// Called on worldInitialize
world.afterEvents.worldInitialize.subscribe(() => {
    setupObjectives();
});

// ─── Zombie Score Updates ─────────────────────────────────────────────────────

// updateZombieScores() — updates scoreboard values for miner/placer zombies
// based on current day/difficulty scaling
function updateZombieScores() {
    const overworld = world.getDimension('overworld');
    const currentDay = world.getDay();
    const maxDay = getSetting('max_day', 'number') ?? MAX_DAY;

    // Difficulty ratio (0.0 – 1.0)
    let diff = currentDay / maxDay;

    // Miner level: scales with difficulty
    let minerLevel;
    if (diff >= 0.75)      minerLevel = 4;
    else if (diff >= 0.5)  minerLevel = 3;
    else if (diff >= 0.25) minerLevel = 2;
    else if (diff >= 0.1)  minerLevel = 1;
    else                   minerLevel = 0;

    // Block-place level: same scaling
    let placeLevel = minerLevel;

    // Check block_break setting
    const blockBreakEnabled = getSetting('block_break');
    if (blockBreakEnabled) {
        overworld.runCommandAsync(`scoreboard players set @e[type=zombie,tag=miner] level ${minerLevel}`);
    } else {
        overworld.runCommandAsync('scoreboard players set @e[type=zombie,tag=miner] level 0');
    }

    // Check block_place setting
    const blockPlaceEnabled = getSetting('block_place');
    if (blockPlaceEnabled) {
        const placeRand = Math.floor(Math.random() * placeLevel);
        overworld.runCommandAsync(`scoreboard players set @e[type=zombie,tag=place] place ${placeRand}`);
    } else {
        overworld.runCommandAsync('scoreboard players set @e[type=zombie,tag=place] place 0');
    }
}

// Run updateZombieScores every 200 ticks
system.runInterval(() => {
    updateZombieScores();
}, 200);

// ─── Zombie Equipment ─────────────────────────────────────────────────────────

// equipZombie(entity) — equips a zombie with armor, weapons, and special abilities
// based on current day difficulty scaling.
function equipZombie(entity) {
    if (entity.typeId !== 'minecraft:zombie') return;

    const currentDay = world.getDay();
    const maxDay = getSetting('max_day', 'number') ?? MAX_DAY;
    let diff = currentDay / maxDay;

    // Difficulty-based scaling thresholds
    let diffLevel;
    if (diff >= 0.75)      diffLevel = 4;
    else if (diff >= 0.5)  diffLevel = 3;
    else if (diff >= 0.25) diffLevel = 2;
    else if (diff >= 0.1)  diffLevel = 1;
    else                   diffLevel = 0;

    // Zombie type tags (ZM, ZP, ZC, ZA from settings)
    const zmChance  = getSetting('zm',  'number') ?? ZM;
    const zpChance  = getSetting('zp',  'number') ?? ZP;
    const zcChance  = getSetting('zc',  'number') ?? ZC;
    const zaChance  = getSetting('za',  'number') ?? ZA;

    // Assign miner tag
    if (Math.random() * 100 < zmChance) {
        entity.addTag('miner');
    }
    // Assign placer tag
    if (Math.random() * 100 < zpChance) {
        entity.addTag('place');
    }
    // Assign climber tag
    if (Math.random() * 100 < zcChance) {
        entity.addTag('climber');
    }

    // Assign ability tags (only if ability setting is on)
    const abilityEnabled = getSetting('ability');
    if (abilityEnabled && Math.random() * 100 < zaChance) {
        // Pick a special ability
        const sPotionChance  = getSetting('spotion',  'number') ?? sPOTION;
        const sWarnerChance  = getSetting('swarner',  'number') ?? sWARNER;
        const sEnderChance   = getSetting('sender',   'number') ?? sENDER;
        const sWitchChance   = getSetting('switch',   'number') ?? sWITCH;
        const sJumperChance  = getSetting('sjumper',  'number') ?? sJUMPER;
        const sBomberChance  = getSetting('sbomber',  'number') ?? sBOMBER;
        const sSpitterChance = getSetting('sspitter', 'number') ?? sSPITTER;
        const sCrawlerChance = getSetting('scrawler', 'number') ?? sCRAWLER;

        const rand = Math.random() * 100;
        if      (rand < sPotionChance  && getSetting('potion')  !== false) entity.addTag('potion');
        else if (rand < sWarnerChance  && getSetting('warner')  !== false) entity.addTag('warner');
        else if (rand < sEnderChance   && getSetting('ender')   !== false) entity.addTag('ender');
        else if (rand < sWitchChance   && getSetting('witch')   !== false) entity.addTag('witch');
        else if (rand < sJumperChance  && getSetting('jumper')  !== false) entity.addTag('jumper');
        else if (rand < sBomberChance  && getSetting('bomber')  !== false) entity.addTag('bomber');
        else if (rand < sSpitterChance && getSetting('spitter') !== false) entity.addTag('spitter');
        else if (rand < sCrawlerChance && getSetting('crawler') !== false) entity.addTag('crawler');
    }

    // All equip/effect commands below are queued here and issued staggered across
    // a few ticks (see scheduleStaggered) instead of all at once, so a horde wave
    // spawning many zombies in the same tick doesn't flood the command queue.
    const equipSteps = [];

    // HP scaling (health boost effect)
    const hpEnabled = getSetting('hp');
    if (hpEnabled) {
        if (diff >= 0.75)      equipSteps.push(() => entity.runCommandAsync('effect @s health_boost infinite 4 true'));
        else if (diff >= 0.5)  equipSteps.push(() => entity.runCommandAsync('effect @s health_boost infinite 3 true'));
        else if (diff >= 0.25) equipSteps.push(() => entity.runCommandAsync('effect @s health_boost infinite 2 true'));
        else if (diff >= 0.1)  equipSteps.push(() => entity.runCommandAsync('effect @s health_boost infinite 1 true'));
    }

    // Gear chance (armor)
    const gearEnabled = getSetting('gear_chance');
    if (gearEnabled) {
        // Piece chance scales with difficulty
        let pieceChance;
        if (diff >= 0.75)      pieceChance = 0.5;
        else if (diff >= 0.5)  pieceChance = 0.25;
        else if (diff >= 0.25) pieceChance = 0.1;
        else                   pieceChance = 0.01;

        let pieceChanceHand = pieceChance * 0.005;

        if (shouldEquip(pieceChance))     equipSteps.push(() => entity.runCommandAsync(`replaceitem entity @s slot.armor.head 0 ${pickArmorPart('head')}`));
        if (shouldEquip(pieceChance))     equipSteps.push(() => entity.runCommandAsync(`replaceitem entity @s slot.armor.chest 0 ${pickArmorPart('chest')}`));
        if (shouldEquip(pieceChance))     equipSteps.push(() => entity.runCommandAsync(`replaceitem entity @s slot.armor.legs 0 ${pickArmorPart('legs')}`));
        if (shouldEquip(pieceChance))     equipSteps.push(() => entity.runCommandAsync(`replaceitem entity @s slot.armor.feet 0 ${pickArmorPart('feet')}`));
        if (shouldEquipHand(pieceChanceHand)) equipSteps.push(() => entity.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 ${pickTool()}`));
    }

    // Potion effects for potion-tagged zombies
    if (entity.hasTag('potion')) {
        equipSteps.push(() => entity.runCommandAsync('effect @s speed infinite 7'));
        equipSteps.push(() => entity.runCommandAsync('effect @s invisibility infinite 5'));
        equipSteps.push(() => entity.runCommandAsync('effect @s slow_falling infinite 2'));
        equipSteps.push(() => entity.runCommandAsync('effect @s fire_resistance infinite 5'));
    }

    scheduleStaggered(entity, equipSteps);
}

// Runs a list of zero-arg callbacks one per tick instead of all in the same tick,
// so a burst of equipZombie() calls (horde wave) doesn't spike the command queue.
// Skips remaining steps if the entity died/despawned before its turn comes up.
function scheduleStaggered(entity, steps) {
    steps.forEach((step, i) => {
        if (i === 0) { step(); return; }
        system.runTimeout(() => {
            try {
                if (!entity.isValid()) return;
                step();
            } catch (e) { /* entity removed before its staggered step ran */ }
        }, i);
    });
}

// Subscribe to entity spawn to equip zombies
world.afterEvents.entitySpawn.subscribe(p => {
    equipZombie(p.entity);
});

// ─── Zombie Ability Events ────────────────────────────────────────────────────

// Runs on entity spawn — triggers special ability events for tagged zombies.
// (Registered as a separate entitySpawn subscriber in the original)
world.afterEvents.entitySpawn.subscribe(p => {
    const entity = p.entity;
    if (entity.typeId !== 'minecraft:zombie') return;

    // Trigger ability events based on tags — checked in JS instead of 8 queued
    // 'event entity @s[tag=X]' commands per zombie spawn (only fires for tags present).
    for (const [tag, event] of Object.entries(ABILITY_EVENT_MAP)) {
        if (entity.hasTag(tag)) entity.triggerEvent(event);
    }

    // Speed effect for speed-tagged zombies
    const speedLevel = getSetting('speed', 'number') ?? SPRINT;
    entity.runCommandAsync(`effect @s speed infinite ${speedLevel} true`);
});

// ─── Zombie Speed Scaling ─────────────────────────────────────────────────────

// Runs every 40 ticks — scales zombie movement speed based on current day.
system.runInterval(() => {
    const currentDay = world.getDay();
    const maxDay = getSetting('max_day', 'number') ?? MAX_DAY;
    let diff = currentDay / maxDay;

    if (diff <= 0.01) return; // too early

    const growInterval = getSetting('growth', 'number') ?? GROW;
    const sprintMax    = getSetting('sprint',  'number') ?? SPRINT;

    // Speed level = floor(diff * sprintMax), capped at sprintMax
    let speedLevel = Math.min(sprintMax, Math.floor(diff * sprintMax));

    // Apply speed to all zombies every growInterval ticks
    system.runTimeout(() => {
        world.getDimension('overworld').runCommandAsync(`effect @e[type=zombie] speed infinite ${speedLevel} true`);
    }, 12);
}, 40);

// ─── Difficulty Display ───────────────────────────────────────────────────────

// Difficulty display moved to DeadZone's core_system.js (it reads the same
// 'max_day' dynamic property and shows it alongside the other HUD stats),
// so this no longer writes to the action bar itself — avoids both mods
// fighting over the same line every tick.
system.runInterval(() => {
    const diffEnabled = getSetting('diff');
    if (!diffEnabled) return;
    // Intentionally no-op: see comment above.
}, 20);

// ─── Horde System ─────────────────────────────────────────────────────────────

// triggerHorde() — starts a zombie horde event
async function triggerHorde() {
    const overworld = world.getDimension('overworld');
    overworld.runCommandAsync('tellraw @a {"rawtext":[{"text":"§cThe Blood Moon is rising..."}]}');
    overworld.runCommandAsync('tag @a add bloodmoon');
    overworld.runCommandAsync('tag @a add bloodmoon');

    const currentDay = world.getDay();

    // Only trigger if past minimum day
    if (currentDay < MIN_HORDE_DAY) return;

    hordeActive = true;
    leadersSpawnedThisHorde = false;
    hordeTicksRemaining = getHordeDurationTicks(HORDE_DURATION_TICKS);

    // Start the horde interval (spawns zombies periodically)
    hordeTimerId = system.runInterval(() => {
        findZombieAndSpawnHorde();
    }, 19); // 0x13 ticks
}

// stopHorde() — stops the active horde
function stopHorde() {
    if (!hordeActive) return;

    if (hordeTimerId !== null) {
        system.clearRun(hordeTimerId);
        hordeTimerId = null;
    }

    hordeTicksRemaining -= 20;
    if (hordeTicksRemaining <= 0) {
        hordeActive = false;
        leadersSpawnedThisHorde = false;
        world.getDimension('overworld').runCommandAsync('tellraw @a {"rawtext":[{"text":"§4The air is quiet, the horde has stopped"}]}');
    }
}

// Horde tick counter — runs every 20 ticks while horde is active
system.runInterval(() => {
    if (!hordeActive) return;
    hordeTimerId = system.runInterval(() => {
        findZombieAndSpawnHorde();
    }, 20);
}, 30);

// ─── Horde Scheduling ────────────────────────────────────────────────────────

// Runs every 24000 ticks (once per day) to check if a horde should trigger.
system.runInterval(() => {
    const currentDay = world.getDay();
    const timeOfDay = world.getTimeOfDay();

    // Reset hordeSpawnedToday at dawn
    if (timeOfDay < 24000 && !hordeResetTime) {
        hordeSpawnedToday = false;
    }

    // Don't spawn if already spawned today, horde active, or too early
    if (hordeSpawnedToday) return;
    if (hordeActive) return;
    if (currentDay < MIN_HORDE_DAY) return;

    // Random chance to trigger horde at night
    if (timeOfDay >= 24000) return;

    if (Math.random() < 0.5) {
        lastHordeDay = currentDay;
        hordeSpawnedToday = true;
        nextHordeGap = 2 + Math.floor(Math.random() * 3);
        triggerHorde();
    }
}, 200);

// ─── Horde Spawn Logic ────────────────────────────────────────────────────────

// Closure variables for horde spawning
let playerY = 0;
let zx = 0, zy = 0, zz = 0;
let allyCount = 0;
let spawned = 0;
let spawnInterval = null;
let hordeDimension = null;

// getPlayerY(player) — gets the Y coordinate of a player
function getPlayerY(player) {
    playerY = Math.floor(player.location.y);
}

// getDistance(player) — gets the 3D distance from a player to the spawn point
function getDistance(player) {
    const dx = player.location.x - zx;
    const dy = player.location.y - zy;
    const dz = player.location.z - zz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// makeZombiesAware(dim) — makes all unaware zombies aware
function makeZombiesAware(dim) {
    dim.runCommandAsync('tag @e[type=zombie,tag=!already] add aware');
}

// spawnZombie() — spawns a single zombie at the horde location
function spawnZombie() {
    if (spawned >= allyCount) {
        system.clearRun(spawnInterval);
        return;
    }
    const cmd = `summon zombie ${zx} ${zy} ${zz}`;
    hordeDimension.runCommandAsync(cmd);
    spawned++;
}

// findZombieAndSpawnHorde() — finds a player and spawns a horde near them
function findZombieAndSpawnHorde() {
    const players = world.getAllPlayers();
    if (players.length === 0) return;

    const currentDay = world.getDay();
    const maxDay = getSetting('max_day', 'number') ?? MAX_DAY;
    const maxHordeSpawn = getSetting('max_horde_spawn', 'number') ?? MAX_HORDE_SPAWN;

    // Scale horde size with day
    const scaledCount = Math.min(maxHordeSpawn, Math.floor((currentDay / maxDay) * maxHordeSpawn));

    // Pick a random player as the horde target
    const targetPlayer = players[Math.floor(Math.random() * players.length)];
    const dim = world.getDimension(targetPlayer.dimension.id);
    hordeDimension = dim;

    // Find a spawn location near the player (within 40 blocks, at least 15 away)
    const maxDistance = 40;
    let attempts = 0;

    // Filter nearby entities to count existing zombies
    const nearbyZombies = dim.getEntities({ type: 'minecraft:zombie' })
        .filter(e => getDistance(targetPlayer) < maxDistance);

    if (nearbyZombies.length >= maxHordeSpawn) return;

    // Pick spawn coordinates near the player
    zx = targetPlayer.location.x + (Math.random() * 2 - 1) * 15;
    zy = Math.floor(targetPlayer.location.y);
    zz = targetPlayer.location.z + (Math.random() * 2 - 1) * 15;

    // Play horde sound
    dim.runCommandAsync(`playsound ranzie.horde @a ${zx} ${zy} ${zz} 0.9`);

    // Announce horde
    dim.runCommandAsync('tellraw @a {"rawtext":[{"text":"§4You hear the howls of a nearby horde"}]}');

    // Spawn horde leader variants — once per horde, not on every spawn-wave tick.
    // summon <entityType> [spawnEvent] [pos] [nameTag] — event must come before position.
    if (!leadersSpawnedThisHorde) {
        leadersSpawnedThisHorde = true;
        dim.runCommandAsync(`summon zombie as_giant ${zx} ${zy} ${zz} "Giant Horde Leader"`);
        dim.runCommandAsync(`summon zombie summoner ${zx} ${zy} ${zz} "Necromancer Horde Leader"`);
        dim.runCommandAsync(`summon zombie tank ${zx} ${zy} ${zz} "Tank Horde Leader"`);
    }

    // Spawn regular zombies
    allyCount = scaledCount;
    spawned = 0;
    spawnInterval = system.runInterval(() => {
        spawnZombie();
    }, 20);

    // Make all zombies aware
    makeZombiesAware(dim);
}

// ─── Infection System ─────────────────────────────────────────────────────────

// getPlayerById(id) — returns a player by their ID string
function getPlayerById(id) {
    return world.getAllPlayers().find(p => p.id === id) || null;
}

// infectPlayer(player) — applies infection effects to a player
function infectPlayer(player) {
    player.addEffect('minecraft:nausea', 600, { amplifier: 0 });
    player.addEffect('minecraft:weakness', 600, { amplifier: 1 });
    player.addEffect('minecraft:hunger', 600, { amplifier: 1 });
    player.addEffect('minecraft:poison', 200, { amplifier: 0 });
    player.addTag('infected');
    player.sendMessage('§cYou have been infected!');
}

// startInfectionTimer(player) — starts a countdown to cure/kill the player
function startInfectionTimer(player) {
    if (infectionTimers.has(player.id)) return;

    const timerId = system.runTimeout(() => {
        // Infection progresses — deal damage or cure
        const p = getPlayerById(player.id);
        if (!p) return;
        p.runCommandAsync('effect @s instant_damage 1 255 true');
        infectionTimers.delete(player.id);
    }, INFECTION_TIME);

    infectionTimers.set(player.id, timerId);
}

// startInfectionTimerResumed(player, remainingTicks) — resumes a saved infection timer
function startInfectionTimerResumed(player, remainingTicks) {
    if (infectionTimers.has(player.id)) return;

    const timerId = system.runTimeout(() => {
        const p = getPlayerById(player.id);
        if (!p) return;
        p.runCommandAsync('effect @s instant_damage 1 255 true');
        infectionTimers.delete(player.id);
    }, remainingTicks);

    infectionTimers.set(player.id, timerId);
}

// stopInfectionTimer(player, cured) — stops the infection timer
function stopInfectionTimer(player, cured = false) {
    const timerId = infectionTimers.get(player.id);
    if (timerId !== undefined) {
        system.clearRun(timerId);
        infectionTimers.delete(player.id);
    }
    if (cured) {
        player.removeTag('infected');
        player.sendMessage('§aYou have been cured!');
    }
}

// curePlayer(player) — cures a player of infection
function curePlayer(player) {
    stopInfectionTimer(player, true);
    player.runCommandAsync('effect @s clear');
}

// On entity hit — check for zombie infection
world.afterEvents.entityHitEntity.subscribe(p => {
    const attacker = p.damagingEntity;
    const victim = p.hitEntity;

    if (!attacker || !victim) return;
    if (attacker.typeId !== 'minecraft:zombie') return;
    if (victim.typeId !== 'minecraft:player') return;

    const infectionChance = getSetting('infection', 'number') ?? INFECTION;
    if (infectionChance <= 0) return;

    if (Math.random() * 100 < infectionChance) {
        if (!victim.hasTag('infected')) {
            infectPlayer(victim);
            startInfectionTimer(victim);
        }
    }
});

// On player spawn — resume infection timer if player was infected
world.afterEvents.playerSpawn.subscribe(p => {
    const player = p.player;
    if (player.hasTag('infected') && !infectionTimers.has(player.id)) {
        startInfectionTimerResumed(player, INFECTION_TIME);
    }
});

// On entity die — clear infection timer
world.afterEvents.entityDie.subscribe(p => {
    const entity = p.deadEntity;
    if (entity.typeId !== 'minecraft:player') return;
    stopInfectionTimer(entity);
});

// Periodic infection tick — every 20 ticks
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (player.hasTag('infected')) {
            player.addEffect('minecraft:nausea', 100, { amplifier: 0 });
            player.addEffect('minecraft:weakness', 100, { amplifier: 1 });
        }
    }
}, 20);

// ─── Fence Manager ────────────────────────────────────────────────────────────

class fence_Manager {
    // update_Fence_States(block) — updates fence connection states for a block
    static update_Fence_States(block) {
        const pos = block.location;
        const dim = block.dimension;

        // Update the block and its 4 neighbors
        const neighbors = [
            dim.getBlock({ x: pos.x + 1, y: pos.y, z: pos.z }),
            dim.getBlock({ x: pos.x - 1, y: pos.y, z: pos.z }),
            dim.getBlock({ x: pos.x,     y: pos.y, z: pos.z + 1 }),
            dim.getBlock({ x: pos.x,     y: pos.y, z: pos.z - 1 }),
        ];

        for (const neighbor of neighbors) {
            if (!neighbor) continue;
            if (neighbor.hasTag(fenceTag)) {
                fence_Manager.updateFencesAround(neighbor);
            }
        }
    }

    // updateFencesAround(block) — updates fence visual connections around a block
    static updateFencesAround(block) {
        if (!block) return;
        const pos = block.location;
        const dim = block.dimension;

        // Trigger a state update for the fence block
        try {
            block.setPermutation(block.permutation);
        } catch (e) {
            // Block may not support permutation updates
        }
    }
}

// Subscribe to block break/place for fence updates
world.afterEvents.playerBreakBlock.subscribe(p => {
    fence_Manager.update_Fence_States(p.block);
});

world.afterEvents.playerPlaceBlock.subscribe(p => {
    fence_Manager.update_Fence_States(p.block);
});

// ─── Corpse System ────────────────────────────────────────────────────────────

// On entity die — handle corpse spawning
world.afterEvents.entityDie.subscribe(p => {
    const entity = p.deadEntity;
    if (entity.typeId !== 'minecraft:zombie') return;

    const corpseEnabled = getSetting('corpse');
    if (!corpseEnabled) return;

    // Check corpse cap — uses the in-memory counter instead of a full getEntities()
    // scan on every single zombie death, and now actually reads the 'ccap' setting.
    const cap = getSetting('ccap', 'number') ?? corpseCap;
    if (corpseCount >= cap) return;

    // Spawn a corpse at the zombie's location
    const dim = entity.dimension;
    const loc = entity.location;
    dim.runCommandAsync(`summon ${CORPSE} ${loc.x} ${loc.y} ${loc.z}`);
    corpseCount++;

    // Handle special horde leader corpse events
    const name = entity.nameTag;
    if (name && corpseEventMap[name]) {
        const event = corpseEventMap[name];
        dim.runCommandAsync(`event entity @e[type=${CORPSE}] ${event}`);
    }
});

// Keep corpseCount accurate when a corpse is removed by any means (cap cleanup,
// explosion, fire, /kill, etc.) without needing to re-scan the world to find out.
world.afterEvents.entityRemove.subscribe(p => {
    if (p.typeId === CORPSE) {
        corpseCount = Math.max(0, corpseCount - 1);
    }
});

// ─── Corpse Kick System ───────────────────────────────────────────────────────

// Runs every 400 ticks (widened from 200) — handles corpse physics (kick by players/zombies)
system.runInterval(() => {
    const kickEnabled = getSetting('kick');
    if (!kickEnabled) return;

    for (const player of world.getAllPlayers()) {
        const dim = player.dimension;
        const corpses = dim.getEntities({ type: CORPSE, maxDistance: KICK_DISTANCE + 1, location: player.location });

        for (const corpse of corpses) {
            const dist = Math.sqrt(
                Math.pow(corpse.location.x - player.location.x, 2) +
                Math.pow(corpse.location.y - player.location.y, 2) +
                Math.pow(corpse.location.z - player.location.z, 2)
            );

            if (dist <= KICK_DISTANCE) {
                const now = system.currentTick;
                const lastKick = kickCooldown.get(player.id) || 0;
                if (now - lastKick < COOLDOWN) continue;
                kickCooldown.set(player.id, now);

                // Apply kick impulse
                const dx = corpse.location.x - player.location.x;
                const dz = corpse.location.z - player.location.z;
                const len = Math.sqrt(dx * dx + dz * dz) || 1;
                const hsVal = getSetting('hs', 'number') ?? HS;
                const vsVal = getSetting('vs', 'number') ?? VS;
                corpse.applyImpulse({ x: (dx / len) * hsVal, y: vsVal, z: (dz / len) * hsVal });
            }
        }
    }
}, 400);

// Zombie kick corpse — runs every 400 ticks (widened from 200)
system.runInterval(() => {
    const zkickEnabled = getSetting('zkick');
    if (!zkickEnabled) return;

    const overworld = world.getDimension('overworld');
    overworld.runCommandAsync(`execute as @e[type=zombie] at @s run execute as @e[type=${CORPSE},distance=..${KICK_DISTANCE}] at @s run event entity @s kick`);
}, 400);

// ─── PvP: Sweep & Crit Attacks ────────────────────────────────────────────────

// handleHit(attacker, victim) — handles sweep and crit attack logic
function handleHit(attacker, victim) {
    const pvpEnabled = getSetting('pvp');
    if (!pvpEnabled) return;

    if (attacker.typeId !== 'minecraft:player') return;

    const now = system.currentTick;
    const lastSwing = sweepCooldowns.get(attacker.id) || 0;
    if (now - lastSwing < 10) return;
    sweepCooldowns.set(attacker.id, now);

    // Sweep attack — damage nearby entities
    const dim = attacker.dimension;
    const nearby = dim.getEntities({ maxDistance: 3, location: attacker.location })
        .filter(e => e.id !== attacker.id && e.id !== victim.id);

    for (const e of nearby) {
        e.applyDamage(2, { cause: 'entityAttack', damagingEntity: attacker });
    }
}

// Subscribe to entity hit for sweep/crit
world.afterEvents.entityHitEntity.subscribe(p => {
    handleHit(p.damagingEntity, p.hitEntity);
});

// ─── Java-style Regeneration ──────────────────────────────────────────────────

// Runs every 7 ticks — applies saturation-based healing (Java regen)
system.runInterval(() => {
    const satEnabled = getSetting('sat');
    if (!satEnabled) return;

    for (const player of world.getAllPlayers()) {
        const food = player.getComponent('minecraft:food');
        if (!food) continue;

        const foodLevel = food.foodLevel;
        if (foodLevel >= hunger) {
            const count = (healCount.get(player.id) || 0) + 1;
            healCount.set(player.id, count);

            if (count >= 4) {
                healCount.set(player.id, 0);
                const health = player.getComponent('minecraft:health');
                if (health && health.currentValue < health.effectiveMax) {
                    health.setCurrentValue(health.currentValue + 1);
                }
            }
        }
    }
}, 7);

// ─── Dynamic Torch ────────────────────────────────────────────────────────────

// On item complete use — handle torch placement with dynamic lighting
world.afterEvents.itemCompleteUse.subscribe(p => {
    const torchEnabled = getSetting('torch');
    if (!torchEnabled) return;
    // Dynamic torch logic handled by entity events
});

// ─── Spiked Plate / Wire Block Damage ────────────────────────────────────────

// Combined lookup sets — avoids issuing one execute command per block id (was 29/tick).
const HAZARD_BLOCK_IDS = new Set([...WIRE_BLOCK_ID, ...CHEVAL_BLOCK_ID, ...PLATE_BLOCK_ID]);
const PLATE_BLOCK_IDS = new Set(PLATE_BLOCK_ID);

// Returns true if the block directly beneath the entity is a hazard block in `idSet`.
function isStandingOnHazard(dim, entity, idSet) {
    const loc = entity.location;
    const below = dim.getBlock({ x: Math.floor(loc.x), y: Math.floor(loc.y) - 1, z: Math.floor(loc.z) });
    return !!below && idSet.has(below.typeId);
}

// Runs every DAMAGE_INTERVAL ticks — damages entities on spiked plates / wire blocks.
// Single pass over zombies (wire + cheval + plate) plus, when 'oz' is off, a single
// pass over all other entities for plate-only damage — instead of 29 selector scans/tick.
system.runInterval(() => {
    const overworld = world.getDimension('overworld');
    const ozEnabled = getSetting('oz');

    const zombies = overworld.getEntities({ type: 'minecraft:zombie' });
    for (const zombie of zombies) {
        if (isStandingOnHazard(overworld, zombie, HAZARD_BLOCK_IDS)) {
            zombie.applyDamage(dmg, { cause: 'contact' });
        }
    }

    if (!ozEnabled) {
        const allEntities = overworld.getEntities();
        for (const entity of allEntities) {
            if (entity.typeId === 'minecraft:zombie') continue; // already handled above
            if (isStandingOnHazard(overworld, entity, PLATE_BLOCK_IDS)) {
                entity.applyDamage(dmg, { cause: 'contact' });
            }
        }
    }
}, DAMAGE_INTERVAL);

// ─── Fog Effect ───────────────────────────────────────────────────────────────

// Runs every 5 ticks — applies fog during blood moon / infection
system.runInterval(() => {
    const fogEnabled = getSetting('fog');
    if (!fogEnabled) return;

    for (const player of world.getAllPlayers()) {
        if (player.hasTag('bloodmoon') || player.hasTag('infected')) {
            player.runCommandAsync('fog @s push ranzie:bloodmoon_fog bloodmoon_fog');
        } else {
            player.runCommandAsync('fog @s remove bloodmoon_fog');
        }
    }
}, 5);

// ─── UI: Settings Menus ───────────────────────────────────────────────────────

// showRiseConfig(player) — shows the main rise/zombie settings form
async function showRiseConfig(player) {
    const form = new ModalFormData();
    form.title('§cRising Dead Settings');

    for (const s of rasSettings) {
        const saved = getSetting(s.id);
        s.value = (saved === undefined) ? s.value : saved;
        form.toggle(s.name, s.value);
    }
    for (const s of sliderSettings) {
        const current = getSetting(s.id, 'number') ?? s.default;
        form.slider(s.label, 0, s.id === 'max_day' ? 1000 : 200, 1, current);
    }

    const result = await form.show(player);
    if (result.canceled) return;

    let idx = 0;
    for (const s of rasSettings) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
        s.value = val;
    }
    for (const s of sliderSettings) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
    }

    player.sendMessage('§aSettings saved!');
}

// showAbilityConfig(player) — shows the zombie ability settings form
async function showAbilityConfig(player) {
    const form = new ModalFormData();
    form.title('§cAbility Settings');

    for (const s of rasSettings2) {
        const saved = getSetting(s.id);
        s.value = (saved === undefined) ? s.value : saved;
        form.toggle(s.name, s.value);
    }
    for (const s of sliderSettings2) {
        const current = getSetting(s.id, 'number') ?? s.default;
        form.slider(s.label, 0, 100, 1, current);
    }
    for (const s of sliderSettingss) {
        const current = getSetting(s.id, 'number') ?? s.default;
        form.slider(s.label, 0, 20, 1, current);
    }

    const result = await form.show(player);
    if (result.canceled) return;

    let idx = 0;
    for (const s of rasSettings2) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
        s.value = val;
    }
    for (const s of [...sliderSettings2, ...sliderSettingss]) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
    }

    player.sendMessage('§aAbility settings saved!');
}

// showCorpseConfig(player) — shows the corpse settings form
async function showCorpseConfig(player) {
    const form = new ModalFormData();
    form.title('§cCorpse Settings');

    for (const s of rasSettings3) {
        const saved = getSetting(s.id);
        s.value = (saved === undefined) ? s.value : saved;
        form.toggle(s.name, s.value);
    }
    for (const s of sliderSettings3) {
        const current = getSetting(s.id, 'number') ?? s.default;
        form.slider(s.label, 0, 200, 1, current);
    }
    for (const s of sliderSettings3a) {
        const current = getSetting(s.id, 'number') ?? s.default;
        form.slider(s.label, 0, 20, 1, current);
    }

    const result = await form.show(player);
    if (result.canceled) return;

    let idx = 0;
    for (const s of rasSettings3) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
        s.value = val;
    }
    for (const s of [...sliderSettings3, ...sliderSettings3a]) {
        const val = result.formValues[idx++];
        world.setDynamicProperty(s.id, val);
    }

    player.sendMessage('§aCorpse settings saved!');
}

// showHowToPlay(player) — shows the how-to-play guide
async function showHowToPlay(player) {
    const form = new ActionFormData();
    form.title('§cHow to Play');
    form.body(
        '§fWelcome to §cRising Dead§f!\n\n' +
        '§eBlood Moon§f: Every full moon, zombies become more aggressive.\n' +
        '§eHordes§f: Zombie hordes will attack at night.\n' +
        '§eInfection§f: Zombie bites can infect you — find a cure!\n' +
        '§eDifficulty§f: Zombies get stronger each day.\n\n' +
        '§aUse the settings menu to customize your experience.'
    );
    form.button('Close');
    await form.show(player);
}

// showButton(player) — shows the main settings button menu
async function showButton(player) {
    const form = new ActionFormData();
    form.title('§cRising Dead');
    form.button('§cZombie Settings');
    form.button('§cAbility Settings');
    form.button('§cCorpse Settings');
    form.button('§eHow to Play');

    const result = await form.show(player);
    if (result.canceled) return;

    switch (result.selection) {
        case 0: showRiseConfig(player); break;
        case 1: showAbilityConfig(player); break;
        case 2: showCorpseConfig(player); break;
        case 3: showHowToPlay(player); break;
    }
}

// showAdv(player) — shows advanced settings
async function showAdv(player) {
    const form = new ActionFormData();
    form.title('§cAdvanced Settings');
    form.button('§cZombie Settings');
    form.button('§cAbility Settings');
    form.button('§cCorpse Settings');

    const result = await form.show(player);
    if (result.canceled) return;

    switch (result.selection) {
        case 0: showRiseConfig(player); break;
        case 1: showAbilityConfig(player); break;
        case 2: showCorpseConfig(player); break;
    }
}

// showExtra(player) — shows extra/misc settings
async function showExtra(player) {
    const form = new ActionFormData();
    form.title('§cExtra Settings');
    form.button('§cToggle Difficulty Display');
    form.button('§cHow to Play');

    const result = await form.show(player);
    if (result.canceled) return;

    switch (result.selection) {
        case 0:
            if (difficultyDisplayToggledOff.has(player.id)) {
                difficultyDisplayToggledOff.delete(player.id);
                player.sendMessage('§aDifficulty display enabled.');
            } else {
                difficultyDisplayToggledOff.add(player.id);
                player.sendMessage('§cDifficulty display disabled.');
            }
            break;
        case 1:
            showHowToPlay(player);
            break;
    }
}

// ─── Script Event Handlers ────────────────────────────────────────────────────

// Handles script events for UI and settings
system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:settings') {
        const player = p.sourceEntity;
        if (player) showButton(player);
    }
});

system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:ability') {
        const player = p.sourceEntity;
        if (player) showAbilityConfig(player);
    }
});

system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:corpse') {
        const player = p.sourceEntity;
        if (player) showCorpseConfig(player);
    }
});

system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:howtoplay') {
        const player = p.sourceEntity;
        if (player) showHowToPlay(player);
    }
});

system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:extra') {
        const player = p.sourceEntity;
        if (player) showExtra(player);
    }
});

system.afterEvents.scriptEventReceive.subscribe(p => {
    if (p.id === 'ranzie:adv') {
        const player = p.sourceEntity;
        if (player) showAdv(player);
    }
});

// ─── Player Spawn / Journal ───────────────────────────────────────────────────

// On player spawn — give journal to new players
world.afterEvents.playerSpawn.subscribe(p => {
    const player = p.player;
    if (!p.initialSpawn) return;
    if (playersGivenJournal.has(player.id)) return;

    playersGivenJournal.add(player.id);

    // Give journal item
    try {
        const journal = new ItemStack('ranzie:journal', 1);
        player.getComponent('minecraft:inventory').container.addItem(journal);
        player.sendMessage('§aYou have received a §eJournal§a. Use it to track your progress!');
    } catch (e) {
        // Journal item may not exist in all configurations
    }
});

// ─── Item Use: Open Settings Menu ────────────────────────────────────────────

// Open settings when player uses the settings item
world.beforeEvents.itemUse.subscribe(p => {
    const item = p.itemStack;
    if (!item) return;
    if (item.typeId === 'ranzie:settings') {
        p.cancel = true;
        const player = p.source;
        system.run(() => showButton(player));
    }
});

// ─── Effect Add: Block Negative Effects on Certain Conditions ────────────────

// Prevent night vision from being added during blood moon (handled separately)
world.beforeEvents.effectAdd.subscribe(p => {
    // Allow all effects by default — specific blocking handled by game logic
});

world.beforeEvents.effectAdd.subscribe(p => {
    // Secondary effect handler — no-op in clean version
});

// ─── Zombie Cap Enforcement ───────────────────────────────────────────────────

// Runs every 200 ticks — enforces zombie spawn cap
system.runInterval(() => {
    const cap = getSetting('zcap', 'number') ?? zombieCap;
    const overworld = world.getDimension('overworld');
    const zombies = overworld.getEntities({ type: 'minecraft:zombie' });

    if (zombies.length > cap) {
        // Despawn excess zombies (oldest first — just kill random ones)
        const excess = zombies.length - cap;
        for (let i = 0; i < excess; i++) {
            zombies[i].runCommandAsync('event entity @s minecraft:start_despawn');
        }
    }
}, 200);

// ─── Zombie-Only Mode ─────────────────────────────────────────────────────────

// Runs every 40 ticks — if zonly is enabled, despawn non-zombie hostile mobs
system.runInterval(() => {
    const zonlyEnabled = getSetting('zonly');
    if (!zonlyEnabled) return;

    const overworld = world.getDimension('overworld');
    overworld.runCommandAsync('event entity @e[type=minecraft:skeleton]  minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:creeper]   minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:spider]    minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:enderman]  minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:witch]     minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:phantom]   minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:drowned]   minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:husk]      minecraft:start_despawn');
    overworld.runCommandAsync('event entity @e[type=minecraft:stray]     minecraft:start_despawn');
}, 40);

// ─── Corpse Cap Enforcement ───────────────────────────────────────────────────

// Runs every 200 ticks — enforces corpse cap
system.runInterval(() => {
    const cap = getSetting('ccap', 'number') ?? corpseCap;
    const overworld = world.getDimension('overworld');
    const corpses = overworld.getEntities({ type: CORPSE });

    if (corpses.length > cap) {
        const excess = corpses.length - cap;
        for (let i = 0; i < excess; i++) {
            corpses[i].remove();
        }
    }

    // Resync the fast-path counter against the authoritative scan, in case any
    // removal happened outside the tracked paths (self-healing against drift).
    corpseCount = Math.min(corpses.length, cap);
}, 200);

// ─── Corpse Spawn Tag Cleanup ─────────────────────────────────────────────────

// On entity spawn — handle new_spawn and corpse_spawn tags
world.afterEvents.entitySpawn.subscribe(p => {
    const entity = p.entity;
    try {
        if (entity.hasTag(NEW_TAG)) {
            entity.removeTag(NEW_TAG);
        }
    } catch (e) { /* entity removed before this fired */ }
});

world.afterEvents.entitySpawn.subscribe(p => {
    const entity = p.entity;
    try {
        if (entity.hasTag(CORPSE_TAG)) {
            entity.removeTag(CORPSE_TAG);
        }
    } catch (e) { /* entity removed before this fired */ }
});

// ─── Periodic Fence Update ────────────────────────────────────────────────────

// Runs every 1 tick — updates fence states around recently changed blocks
system.runInterval(() => {
    // Fence state updates are triggered by block events (see fence_Manager above)
    // This interval is a no-op in the clean version; fence updates are event-driven
});
