import { world, system, ItemStack, CommandPermissionLevel, CustomCommandStatus, CustomCommandParamType } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// ============================
//   UTILS
// ============================

function formatAnimationName(str) {
    return str
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// ============================
//   EMOTE CATEGORIES
// ============================

const DEFAULT_EMOTES_CATEGORY = {
    "penguin_dance": { id: "animation.club_penguin", loop: true },
    "piglin_celebration": { id: "animation.piglin.celebrate_hunt_special", loop: true },
    "doodle_dance": { id: "animation.doodle_dance", loop: true },
    "snow_angel": { id: "animation.snow_angel", loop: false },
    "dab": { id: "animation.dab_dance", loop: true },
    "floss_dance": { id: "animation.floss_dance", loop: true },
    "laugh": { id: "animation.laugh", loop: true },
    "sad": { id: "animation.sad", loop: false },
    "rat_dance": { id: "animation.rat_dance", loop: true },
    "nop": { id: "animation.nop", loop: false },
    "buggie_dance": { id: "animation.buggie_dance", loop: true },
    "jojo_pose": { id: "animation.jojo_pose", loop: true },
    "hakari_dance": { id: "animation.hakari_dance", loop: false },
    "griddy": { id: "animation.griddy", loop: true },
    "kazoch_kick": { id: "animation.kazoch_kick", loop: true },
    "cute_dance": { id: "animation.cute_dance", loop: true },
    "bored": { id: "animation.react_bored_1", loop: false },
    "react_bottom": { id: "animation.react_bottom_1", loop: false },
    "golden_freddy_pose": { id: "animation.eu.emote.golden_freddy_pose", loop: true },
    "head_spin": { id: "animation.eu.emote.head_spin", loop: true },
    "military_salute": { id: "animation.eu.emote.military_salute", loop: true },
    "sleep_in_air": { id: "animation.eu.emote.sleep_in_air", loop: false },
    "tilt": { id: "animation.eu.emote.tilt", loop: true }
};

const DARKSOULS_EMOTES_CATEGORY = {
    "beckon": { id: "animation.ds.emote.beckon", loop: false },
    "bow": { id: "animation.ds.emote.bow", loop: false },
    "hurrah": { id: "animation.ds.emote.hurrah", loop: false },
    "joy": { id: "animation.ds.emote.joy", loop: false },
    "point_down": { id: "animation.ds.emote.point_down", loop: false },
    "point_forward": { id: "animation.ds.emote.point_forward", loop: false },
    "point_up": { id: "animation.ds.emote.point_up", loop: false },
    "proper_bow": { id: "animation.ds.emote.proper_bow", loop: false },
    "shrug": { id: "animation.ds.emote.shrug", loop: false },
    "wave": { id: "animation.ds.emote.wave", loop: false },
    "prayer": { id: "animation.ds.emote.prayer", loop: false },
    "praise_the_sun": { id: "animation.ds.emote.praise_the_sun", loop: false },
    "prostration": { id: "animation.ds.emote.prostration", loop: false },
    "well_what_is_it": { id: "animation.ds.emote.well_what_is_it", loop: false }

};

// ============================
//   CATEGORY CONFIG
// ============================

const EMOTES_CONFIG = {
    default_emotes: {
        title: "Default Emotes",
        data: DEFAULT_EMOTES_CATEGORY
    },
    darksouls_emotes: {
        title: "Dark Souls Emotes",
        data: DARKSOULS_EMOTES_CATEGORY
    }
};

// ============================
//   UI SYSTEM
// ============================

function showEmoteCategories(player) {
    const form = new ActionFormData()
        .title("Emotes")
        .body("Select a category:");

    const categoryKeys = Object.keys(EMOTES_CONFIG);

    categoryKeys.forEach(catId => {
        form.button(EMOTES_CONFIG[catId].title);
    });

    form.show(player).then(res => {
        if (res.canceled) return;
        const selectedCategory = categoryKeys[res.selection];
        showEmotesInCategory(player, selectedCategory);
    });
}

function showEmotesInCategory(player, categoryId) {
    const category = EMOTES_CONFIG[categoryId];
    const emotes = category.data;

    const form = new ActionFormData()
        .title(category.title)
        .body("Select an emote:");

    const keys = Object.keys(emotes);

    keys.forEach(key => {
        form.button(formatAnimationName(key), `textures/emotes/${key}`);
    });

    form.show(player).then(res => {
        if (res.canceled) return;

        const selectedKey = keys[res.selection];
        const anim = emotes[selectedKey];

        const stopExpression = anim.loop
            ? "(q.is_moving)"
            : "(q.is_moving || query.all_animations_finished)";

        system.run(() => {
            player.playAnimation(anim.id, { stopExpression });
        });
    });
}

// ============================
//   ITEM USE -> OPEN UI
// ============================

world.afterEvents.itemUse.subscribe(ev => {
    const item = ev.itemStack;
    const player = ev.source;

    if (item.typeId === "eu:emote") {
        showEmoteCategories(player);
    }
});

// ============================
//   COMMANDS
// ============================

system.beforeEvents.startup.subscribe(init => {
    const registry = init.customCommandRegistry;

    // Help command
    registry.registerCommand(
        {
            name: "emote:help",
            description: "Shows all emotes grouped by category.",
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false
        },
        origin => {
            const player = origin.sourceEntity;
            if (!player) return { status: 0, message: "Must be player." };

            for (const [catId, cat] of Object.entries(EMOTES_CONFIG)) {
                player.sendMessage(`§6=== ${cat.title} ===`);
                Object.keys(cat.data).forEach(key => {
                    player.sendMessage(`§7 §f${key}`);
                });
            }

            return { status: 1, message: "Emotes listed." };
        }
    );

    // Emote item
    registry.registerCommand(
        {
            name: "emote:item",
            description: "Gives the emote item.",
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false
        },
        origin => {
            const player = origin.sourceEntity;
            if (!player) return;

            system.run(() => {
                player.dimension.spawnItem(new ItemStack("eu:emote"), player.location);
            });

            return { status: 1, message: "Item given." };
        }
    );

    /*     // Register category enum
        registry.registerEnum("emote:categories", Object.keys(EMOTES_CONFIG));
    
        // Emote play command
        registry.registerCommand(
            {
                name: "emote:play",
                description: "Play a custom emote animation.",
                permissionLevel: CommandPermissionLevel.Any,
                cheatsRequired: false,
                mandatoryParameters: [
                    { name: "emote:categories", type: CustomCommandParamType.Enum },
                    { name: "animation", type: CustomCommandParamType.String }
                ]
            },
            (origin, args) => {
                const player = origin.sourceEntity;
                if (!player) return { status: 0, message: "Must be a player." };
    
                const category = EMOTES_CONFIG[args.category];
                if (!category)
                    return { status: 0, message: `Unknown category '${args.category}'.` };
    
                const animation = category.data[args.animation];
                if (!animation)
                    return { status: 0, message: `Unknown emote '${args.animation}'.` };
    
                const stopExpression = animation.loop
                    ? "(q.is_moving)"
                    : "(q.is_moving || query.all_animations_finished)";
    
                system.run(() => {
                    player.playAnimation(animation.id, { stopExpression });
                });
    
                return {
                    status: 1,
                    message: `Playing '${args.animation}' from '${args.category}'.`
                };
            }
        ); */
});
