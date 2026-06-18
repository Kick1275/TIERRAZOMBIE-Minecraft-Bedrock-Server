import * as mc from '@minecraft/server';

// Define advancements for the Deadzone game mode
export const deadzone_advancements = {
    'found_dev': {
        name: 'Congratulations, you found a developer!',
        tags: 'found_dev',
        need_tags: 'found_dev',
        description: 'Found a developer on the server and asked to get an advancement'
    },
    'flood_red': {
        name: 'Red flood!',
        tags: 'bleedinglvl10',
        need_tags: 'bleeding10',
        description: '???'
    },
    'bad_people': {
        name: 'Huh, why did you kill the scavenger!?',
        tags: 'bad_human',
        scoreRequired: 1,
        objective: 'scavenger.kills',
        description: 'Kill the scavenger'
    },
    'nice_people': {
        name: 'Wow, you killed the marauder. Great job!',
        tags: 'nice_people',
        scoreRequired: 1,
        objective: 'marauder.kills',
        description: 'Kill the marauder'
    },
    'first_time': {
        name: 'Did you kill the first player?',
        tags: 'kill_the_first_player',
        scoreRequired: 1,
        objective: 'player.kills',
        description: 'First player kill'
    },
    'being_bandit': {
        name: 'Do you still have any humanity?',
        tags: 'kill_15_player',
        scoreRequired: 15,
        objective: 'player.kills',
        description: 'Eliminate 15 players'
    },
    'be_bandit': {
        name: 'You are a bandit, kill the players you found!',
        tags: 'kill_50_player',
        scoreRequired: 50,
        objective: 'player.kills',
        description: 'Eliminate 50 players'
    },
    'upd_1_6': {
        name: '1_6',
        tags: '1_6_update',
        need_tags: '1_6',
        description: '???'
    },
    'trade': {
        name: 'It\'s a great exchange!',
        tags: 'trade_scavenger',
        need_tags: 'trade',
        description: 'Trade with scavenger'
    },
    'eliminate_miniboss': {
        name: 'What the hell is this?',
        tags: 'kill_miniboss',
        scoreRequired: 1,
        objective: 'infected_miniboss.kills',
        description: 'Kill the infected militia, riot or brute'
    },
    'eliminate_1_infected': {
        name: 'Kill the first infected',
        tags: 'kill_1_infected',
        scoreRequired: 1,
        objective: 'infected.kills',
        description: 'Eliminated the first infected!'
    },
    'eliminate_50_infected': {
        name: 'Eliminate 50 infected!',
        tags: 'kill_50_infected',
        scoreRequired: 50,
        objective: 'infected.kills',
        description: 'Eliminate 50 infected'
    },
    'eliminate_150_infected': {
        name: 'Eliminate 150 infected!',
        tags: 'kill_150_infected',
        scoreRequired: 150,
        objective: 'infected.kills',
        description: 'Eliminate 150 infected'
    },
    'eliminate_1000_infected': {
        name: 'Eliminate 1000 infected!',
        tags: 'kill_1000_infected',
        scoreRequired: 1000,
        objective: 'infected.kills',
        description: 'Eliminate 1000 infected'
    },
    'eliminate_1500_infected': {
        name: 'Eliminate 1500 infected!',
        tags: 'kill_1500_infected',
        scoreRequired: 1500,
        objective: 'infected.kills',
        description: 'Eliminate 1500 infected'
    },
    'eliminate_2000_infected': {
        name: 'Eliminate 2000 infected!',
        tags: 'kill_2000_infected',
        scoreRequired: 2000,
        objective: 'infected.kills',
        description: 'Eliminate 2000 infected'
    }
};

// Function to get a player's score for a given objective
export function getScore(objectiveName, player, defaultZero = true) {
    try {
        const objective = mc.world.scoreboard.getObjective(objectiveName);
        if (typeof player === 'string') {
            const participant = objective.getParticipants().find(p => p.displayName === player);
            return participant ? objective.getScore(participant) : (defaultZero ? 0 : undefined);
        } else if (player && player.scoreboardIdentity) {
            return objective.getScore(player.scoreboardIdentity) || (defaultZero ? 0 : undefined);
        }
        return defaultZero ? 0 : undefined;
    } catch (error) {
        console.error('Error getting score for ' + objectiveName + ':', error);
        return defaultZero ? 0 : undefined;
    }
}

// Function to check and award advancements to a player
function checkAdvancements(player) {
    for (const advId in deadzone_advancements) {
        const advancement = deadzone_advancements[advId];

        // Skip if the player doesn't have required tags (if any)
        if (advancement.need_tags && !player.hasTag(advancement.need_tags)) {
            continue;
        }

        // Check for advancements with no score requirement (tag-based)
        if (advancement.scoreRequired === undefined) {
            if (!player.hasTag(advancement.tags)) {
                player.addTag(advancement.tags);
                mc.world.getPlayers().forEach(p => {
                    p.sendMessage(`§f${player.displayName} §fMade The Advancement: §a${advancement.name}`);
                    p.runCommandAsync('playsound random.levelup @s');
                });
            }
        } else {
            // Check for advancements with a score requirement
            const score = getScore(advancement.objective, player);
            if (score === undefined) continue;

            if (score >= advancement.scoreRequired && !player.hasTag(advancement.tags)) {
                player.addTag(advancement.tags);
                mc.world.getPlayers().forEach(p => {
                    p.sendMessage(`§f${player.displayName} §fMade The Advancement: §a${advancement.name}`);
                    p.runCommandAsync('playsound random.levelup @s');
                });
            }
        }
    }
}

// Run every 20 ticks (1 second) to check advancements for all players
mc.system.runInterval(() => {
    const players = mc.world.getPlayers();
    players.forEach(player => {
        checkAdvancements(player);
    });
}, 20);