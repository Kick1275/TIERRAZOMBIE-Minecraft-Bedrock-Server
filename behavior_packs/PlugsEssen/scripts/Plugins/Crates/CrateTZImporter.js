import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { saveCrate, generateLotId } from "./CrateManager.js";

// Items exactos de cada crate según DeadZzoneBP/scripts/TZ/scripts/Entidades/Creates.js
const TZ_CRATES = [
    {
        id: "tz_oak",
        name: "Crate de Roble",
        keyTypeId: "tz:key_oak",
        itemCount: 3,
        items: [
            { id: "mcpe:flannel_blue", amount: 1 },
            { id: "mcpe:hawaiian_black", amount: 1 },
            { id: "mcpe:hoodie_yellow", amount: 1 },
            { id: "mcpe:hoodie_black", amount: 1 },
            { id: "mcpe:police_top", amount: 1 },
            { id: "mcpe:varsity_green", amount: 1 },
            { id: "mcpe:hoodie_green", amount: 1 },
            { id: "mcpe:puffer_black", amount: 1 },
            { id: "mcpe:puffer_blue", amount: 1 },
            { id: "mcpe:jean_blue", amount: 1 },
            { id: "mcpe:trackpants_blue", amount: 1 },
            { id: "mcpe:bdu_desert_bottom", amount: 1 },
            { id: "mcpe:police_bottom", amount: 1 },
            { id: "mcpe:cargo_white", amount: 1 },
            { id: "mcpe:biker_blue", amount: 1 },
            { id: "mcpe:ballistic_black", amount: 1 },
            { id: "mcpe:mask_troll", amount: 1 },
            { id: "mcpe:mask_funni", amount: 1 },
            { id: "mcpe:mask_fawkes", amount: 1 },
            { id: "mcpe:skimask_black", amount: 1 },
            { id: "mcpe:police_hat", amount: 1 },
            { id: "mcpe:ballistic_green", amount: 1 },
            { id: "mcpe:clown_wig", amount: 1 },
            { id: "mcpe:balaclava_black", amount: 1 },
            { id: "mcpe:police_vest", amount: 1 },
            { id: "krep:cp", amount: 1 },
            { id: "krep:mm9", amount: 5 },
            { id: "krep:g17", amount: 1 },
            { id: "krep:mm9", amount: 5 },
            { id: "krep:m1911", amount: 1 },
            { id: "krep:acp45", amount: 5 },
            { id: "krep:db", amount: 1 },
            { id: "krep:gauge12", amount: 4 },
            { id: "krep:uzi", amount: 1 },
            { id: "krep:mm9", amount: 6 },
            { id: "krep:mp5", amount: 1 },
            { id: "krep:mm9", amount: 8 },
            { id: "minecraft:experience_bottle", amount: 20 },
            { id: "minecraft:cooked_chicken", amount: 6 },
            { id: "mcpe:cooked_rabbit", amount: 6 },
            { id: "minecraft:bread", amount: 32 },
            { id: "minecraft:shield", amount: 1 },
            { id: "minecraft:bow", amount: 1 },
            { id: "minecraft:arrow", amount: 32 },
            { id: "mcpe:fireman_axe", amount: 1 },
            { id: "minecraft:golden_apple", amount: 4 },
        ]
    },
    {
        id: "tz_gold",
        name: "Crate de Oro",
        keyTypeId: "tz:key_gold",
        itemCount: 3,
        items: [
            { id: "mcpe:biker_black", amount: 1 },
            { id: "mcpe:plate_vest_gray", amount: 1 },
            { id: "mcpe:hazmat_white_top", amount: 1 },
            { id: "mcpe:tactical_vest_black", amount: 1 },
            { id: "mcpe:ghillie_forest_top", amount: 1 },
            { id: "mcpe:ghillie_forest_bottom", amount: 1 },
            { id: "mcpe:tracksuit_black", amount: 1 },
            { id: "mcpe:gasmask_black", amount: 1 },
            { id: "mcpe:plate_vest_tan", amount: 1 },
            { id: "mcpe:plate_vest_olive", amount: 1 },
            { id: "mcpe:hazmat_yellow_top", amount: 1 },
            { id: "mcpe:hazmat_yellow_bottom", amount: 1 },
            { id: "mcpe:welder_mask", amount: 1 },
            { id: "mcpe:respirator_mask", amount: 1 },
            { id: "krep:b93", amount: 1 },
            { id: "krep:mm9", amount: 10 },
            { id: "krep:deagle", amount: 1 },
            { id: "krep:ae50", amount: 8 },
            { id: "krep:t50", amount: 1 },
            { id: "krep:ae50", amount: 8 },
            { id: "krep:ump", amount: 1 },
            { id: "krep:acp45", amount: 12 },
            { id: "krep:mp7", amount: 1 },
            { id: "krep:mm4630", amount: 12 },
            { id: "krep:vector", amount: 1 },
            { id: "krep:acp45", amount: 12 },
            { id: "krep:m870", amount: 1 },
            { id: "krep:gauge12", amount: 10 },
            { id: "krep:sks", amount: 1 },
            { id: "krep:m43", amount: 15 },
            { id: "minecraft:golden_apple", amount: 4 },
            { id: "mcpe:splint", amount: 3 },
            { id: "mcpe:bandage", amount: 5 },
            { id: "mcpe:chocolate_bar", amount: 8 },
            { id: "mcpe:canned_spaghetti", amount: 6 },
            { id: "minecraft:totem_of_undying", amount: 1 },
            { id: "mcpe:pipe_bomb", amount: 1 },
            { id: "mcpe:frag_grenade", amount: 1 },
        ]
    },
    {
        id: "tz_emerald",
        name: "Crate de Esmeralda",
        keyTypeId: "tz:key_emerald",
        itemCount: 5,
        items: [
            { id: "mcpe:ballistic_black", amount: 1 },
            { id: "mcpe:tactical_vest_tan", amount: 1 },
            { id: "mcpe:assault_helmet_black", amount: 1 },
            { id: "mcpe:night_goggles", amount: 1 },
            { id: "mcpe:suit_top_black", amount: 1 },
            { id: "mcpe:suit_bottom_black", amount: 1 },
            { id: "mcpe:biker_vest_skull", amount: 1 },
            { id: "mcpe:shemagh_olive", amount: 1 },
            { id: "mcpe:tactical_vest_olive", amount: 1 },
            { id: "mcpe:ghillie_drygrass_top", amount: 1 },
            { id: "mcpe:firefighter_top", amount: 1 },
            { id: "mcpe:firefighter_bottom", amount: 1 },
            { id: "krep:akm", amount: 1 },
            { id: "krep:m43", amount: 20 },
            { id: "krep:m16", amount: 1 },
            { id: "krep:m43", amount: 20 },
            { id: "krep:m16a1", amount: 1 },
            { id: "krep:m43", amount: 20 },
            { id: "krep:g36", amount: 1 },
            { id: "krep:m43", amount: 20 },
            { id: "krep:type81", amount: 1 },
            { id: "krep:m43", amount: 20 },
            { id: "krep:g3", amount: 1 },
            { id: "krep:m43", amount: 18 },
            { id: "krep:fal", amount: 1 },
            { id: "krep:m43", amount: 18 },
            { id: "krep:aa12", amount: 1 },
            { id: "krep:gauge12", amount: 12 },
            { id: "krep:saiga12", amount: 1 },
            { id: "krep:gauge12", amount: 12 },
            { id: "krep:win308", amount: 1 },
            { id: "krep:lapua338", amount: 8 },
            { id: "mcpe:first_aid", amount: 8 },
            { id: "mcpe:painkiller", amount: 8 },
            { id: "minecraft:golden_apple", amount: 8 },
            { id: "mcpe:frag_grenade", amount: 2 },
            { id: "mcpe:smoke_grenade", amount: 2 },
            { id: "mcpe:c4_explosive", amount: 1 },
            { id: "mcpe:landmine", amount: 3 },
            { id: "minecraft:totem_of_undying", amount: 1 },
            { id: "mcpe:lockpick", amount: 2 },
            { id: "pubg:opentop_spawn_egg", amount: 1 },
        ]
    },
    {
        id: "tz_diamond",
        name: "Crate de Diamante",
        keyTypeId: "tz:key_diamond",
        itemCount: 7,
        items: [
            { id: "mcpe:tactical_vest_black", amount: 1 },
            { id: "mcpe:spec_helmet", amount: 1 },
            { id: "mcpe:special_top", amount: 1 },
            { id: "mcpe:special_bottom", amount: 1 },
            { id: "mcpe:assault_helmet_olive", amount: 1 },
            { id: "mcpe:combat_olive", amount: 1 },
            { id: "mcpe:beret_green", amount: 1 },
            { id: "mcpe:ghillie_forest_top", amount: 1 },
            { id: "mcpe:ghillie_forest_bottom", amount: 1 },
            { id: "mcpe:bdu_woodland_top", amount: 1 },
            { id: "mcpe:bdu_woodland_bottom", amount: 1 },
            { id: "mcpe:tactical_helmet_white", amount: 1 },
            { id: "mcpe:tactical_vest_white", amount: 1 },
            { id: "mcpe:bdu_artic_top", amount: 1 },
            { id: "mcpe:bdu_artic_bottom", amount: 1 },
            { id: "krep:m4a1", amount: 1 },
            { id: "krep:m43", amount: 30 },
            { id: "krep:hk416", amount: 1 },
            { id: "krep:m43", amount: 30 },
            { id: "krep:scarl", amount: 1 },
            { id: "krep:m43", amount: 30 },
            { id: "krep:qbz95", amount: 1 },
            { id: "krep:m43", amount: 30 },
            { id: "krep:qbz191", amount: 1 },
            { id: "krep:m43", amount: 30 },
            { id: "krep:rpk", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:m249", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:awp", amount: 1 },
            { id: "krep:lapua338", amount: 15 },
            { id: "krep:m885", amount: 1 },
            { id: "krep:lapua338", amount: 15 },
            { id: "krep:p90", amount: 1 },
            { id: "krep:mm5728", amount: 20 },
            { id: "mcpe:first_aid", amount: 16 },
            { id: "mcpe:painkiller", amount: 16 },
            { id: "mcpe:antidote", amount: 5 },
            { id: "minecraft:golden_apple", amount: 16 },
            { id: "minecraft:totem_of_undying", amount: 1 },
            { id: "mcpe:c4_explosive", amount: 2 },
            { id: "mcpe:landmine", amount: 5 },
            { id: "mcpe:lockpick", amount: 3 },
            { id: "minecraft:diamond_helmet", amount: 1 },
            { id: "minecraft:diamond_chestplate", amount: 1 },
            { id: "minecraft:diamond_leggings", amount: 1 },
            { id: "minecraft:diamond_boots", amount: 1 },
            { id: "minecraft:experience_bottle", amount: 64 },
            { id: "pubg:opentop_spawn_egg", amount: 2 },
        ]
    },
    {
        id: "tz_netherita",
        name: "Crate de Netherita",
        keyTypeId: "tz:key_netherita",
        itemCount: 9,
        items: [
            { id: "mcpe:police_riot", amount: 1 },
            { id: "mcpe:stab_vest_gray", amount: 1 },
            { id: "mcpe:gasmask_black", amount: 1 },
            { id: "mcpe:night_goggles", amount: 1 },
            { id: "mcpe:peaked_tan", amount: 1 },
            { id: "mcpe:ushanka", amount: 1 },
            { id: "mcpe:hazmat_white_top", amount: 1 },
            { id: "mcpe:hazmat_white_bottom", amount: 1 },
            { id: "mcpe:katana", amount: 1 },
            { id: "mcpe:sabre_sword", amount: 1 },
            { id: "krep:m4a1", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:hk416", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:scarl", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:scarh", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:mk14", amount: 1 },
            { id: "krep:m43", amount: 40 },
            { id: "krep:evolys", amount: 1 },
            { id: "krep:m43", amount: 50 },
            { id: "krep:m249", amount: 1 },
            { id: "krep:m43", amount: 50 },
            { id: "krep:m107", amount: 1 },
            { id: "krep:bmg50", amount: 10 },
            { id: "krep:m95", amount: 1 },
            { id: "krep:bmg50", amount: 10 },
            { id: "krep:awp", amount: 1 },
            { id: "krep:lapua338", amount: 20 },
            { id: "krep:minigun", amount: 1 },
            { id: "krep:m43", amount: 60 },
            { id: "krep:minigun", amount: 1 },
            { id: "krep:m43", amount: 60 },
            { id: "krep:rpg", amount: 1 },
            { id: "krep:rpgrocket", amount: 5 },
            { id: "krep:rpg", amount: 1 },
            { id: "krep:rpgrocket", amount: 5 },
            { id: "mcpe:first_aid", amount: 16 },
            { id: "mcpe:painkiller", amount: 16 },
            { id: "mcpe:adrenaline", amount: 10 },
            { id: "minecraft:enchanted_golden_apple", amount: 5 },
            { id: "minecraft:totem_of_undying", amount: 2 },
            { id: "mcpe:lockpick", amount: 5 },
            { id: "mcpe:bear_trap", amount: 10 },
            { id: "mcpe:c4_explosive", amount: 4 },
            { id: "mcpe:landmine", amount: 5 },
            { id: "mcpe:netherite_sword", amount: 1 },
            { id: "minecraft:netherite_chestplate", amount: 1 },
            { id: "mcpe:netherite_helmet", amount: 1 },
            { id: "mcpe:netherite_leggings", amount: 1 },
            { id: "mcpe:netherite_boots", amount: 1 },
            { id: "minecraft:netherite_upgrade_smithing_template", amount: 1 },
            { id: "minecraft:experience_bottle", amount: 64 },
            { id: "minecraft:experience_bottle", amount: 64 },
        ]
    }
];

// Llamado desde dentro del wizard — muestra selector y agrega items al crate en edición
export async function openTZPickerForCrate(player, crate) {
    const form = new ActionFormData()
        .title("§6§l⬇ Importar config TZ")
        .body("§7Elige qué crate TZ usar como base.\n§eSe agregarán todos sus items al pool actual.");

    for (const tz of TZ_CRATES) {
        form.button(`§e${tz.name}\n§7${tz.items.length} items · da ${tz.itemCount} al abrir`);
    }
    form.button("§cCancelar");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === TZ_CRATES.length) return;

    const selected = TZ_CRATES[res.selection];

    const confirm = new MessageFormData()
        .title("§6Confirmar")
        .body(`§7Se agregarán §e${selected.items.length} items§7 de\n§e${selected.name}§7 al pool de esta crate.\n\n§8Los items existentes no se borran.`)
        .button1("§aAgregar")
        .button2("§cCancelar");

    const conf = await confirm.show(player).catch(() => null);
    if (!conf || conf.selection !== 0) return;

    crate.lots = crate.lots ?? [];
    for (const item of selected.items) {
        crate.lots.push({
            id: generateLotId(),
            probability: 1,
            description: null,
            items: [{ typeId: item.id, amount: item.amount, nbt: null, storageKey: null }]
        });
    }

    if (crate.crateType === "random" && !crate.randomCount) {
        crate.randomCount = { type: "fixed", fixed: selected.itemCount };
    }

    saveCrate(crate);
    player.sendMessage(`§a✔ ${selected.items.length} items de §e${selected.name}§a agregados al pool.`);
}

// Llamado desde el menú admin principal (botón independiente)
export async function openTZImporterMenu(player) {
    const { getAllCrates } = await import("./CrateManager.js");
    const existing = getAllCrates();
    const existingTzIds = Object.values(existing).map(c => c._tzId).filter(Boolean);

    const form = new ActionFormData()
        .title("§6§lImportar Crates TZ")
        .body("§7Importa una crate TZ como nueva crate independiente.");

    for (const tz of TZ_CRATES) {
        const imported = existingTzIds.includes(tz.id);
        form.button(`§e${tz.name}\n${imported ? "§a✔ Ya importada" : `§7${tz.items.length} items · da ${tz.itemCount}`}`);
    }
    form.button("§cCerrar");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === TZ_CRATES.length) return;

    const selected = TZ_CRATES[res.selection];
    const { generateCrateId, saveCrate: save } = await import("./CrateManager.js");

    const confirm = new MessageFormData()
        .title("§6Confirmar importación")
        .body(`§e${selected.name}\n§7${selected.items.length} items posibles\n§7Da: ${selected.itemCount} items al abrir\n§7Llave: ${selected.keyTypeId}`)
        .button1("§aImportar")
        .button2("§cCancelar");

    const conf = await confirm.show(player).catch(() => null);
    if (!conf || conf.selection !== 0) return;

    const lots = selected.items.map(item => ({
        id: generateLotId(),
        probability: 1,
        description: null,
        items: [{ typeId: item.id, amount: item.amount, nbt: null, storageKey: null }]
    }));

    save({
        id: generateCrateId(),
        name: selected.name,
        description: null,
        crateType: "random",
        randomCount: { type: "fixed", fixed: selected.itemCount },
        idleParticle: "arcane",
        idleParticleType: "arcane",
        customParticle: null,
        openAnimation: "vortex",
        showLabel: true,
        lots,
        key: {
            typeId: selected.keyTypeId,
            nameTag: `§6§lLlave — ${selected.name}`,
            lore: ["§7Abre la crate TZ"],
            enchanted: true
        },
        keyPrice: null,
        maxUses: null,
        totalOpened: 0,
        openLog: [],
        entityId: null,
        location: null,
        _tzId: selected.id
    });

    player.sendMessage(`§a✔ Crate §e${selected.name}§a importada con ${selected.items.length} items.`);
}
