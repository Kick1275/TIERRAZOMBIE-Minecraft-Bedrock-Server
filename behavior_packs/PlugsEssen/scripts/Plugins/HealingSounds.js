import { world, system } from "@minecraft/server";

const SOUND_MAP = new Map([
    ["mcpe:adrenaline",         "tz.jeringa"],
    ["mcpe:morphine",           "tz.jeringa"],
    ["mcpe:antidote",           "tz.jeringa"],
    ["mcpe:painkiller",         "tz.pilldoras"],
    ["mcpe:rags_dirty",         "tz.bandage"],
    ["mcpe:rags",               "tz.bandage"],
    ["mcpe:rags_sterilized",    "tz.bandage"],
    ["mcpe:bandage",            "tz.bandage"],
    ["mcpe:bandage_sterilized", "tz.bandage"],
    ["mcpe:first_aid",          "tz.bolsadevendaje"],
]);

const activeUse = new Set(); // playerIds currently playing a healing sound

world.beforeEvents.itemUse.subscribe((ev) => {
    const { source, itemStack } = ev;
    const sound = SOUND_MAP.get(itemStack.typeId);
    if (!sound) return;
    if (source.hasTag("downed") && itemStack.typeId !== "mcpe:antidote") return;
    if (activeUse.has(source.id)) return;
    activeUse.add(source.id);
    system.run(() => { try { source.playSound(sound); } catch {} });
});

world.afterEvents.itemCompleteUse.subscribe((ev) => {
    activeUse.delete(ev.source.id);
});

world.afterEvents.itemReleaseUse.subscribe((ev) => {
    activeUse.delete(ev.source.id);
});
