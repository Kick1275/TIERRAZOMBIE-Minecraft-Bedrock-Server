import { BlockPermutation,
BlockVolume, world, system, ItemStack, EnchantmentType } from "@minecraft/server";

const backpackIDs = ["mcpe:school_blue_backpack", "mcpe:school_red_backpack", "mcpe:school_green_backpack", "mcpe:taloon_blue_backpack","mcpe:taloon_red_backpack","mcpe:taloon_green_backpack","mcpe:taloon_yellow_backpack"];

system.runInterval(() => {
const backpackversion = world.getDynamicProperty("backpackversion");
const storageversion = world.getDynamicProperty("storageversion");
if (!storageversion) { const storageversion = 0 }
if (!backpackversion) {
world.setDynamicProperty("backpackversion", 1);
}
world.setDynamicProperty("storageversion", (Math.floor(backpackversion/12)));
const entities = world.getDimension("overworld").getEntities({
    type: "mcpe:storage",
    tags: ["datastore"],
})[storageversion]
if (!entities) {
const storeloc = { x: 0, y: 0, z: 0 };
try {
const entity = world.getDimension("overworld").spawnEntity("mcpe:storage", storeloc);
entity.addTag(`datastore`);
entity.nameTag = `Storage ${storageversion+1}`
} catch (error) {}
}
}, 0);

system.runInterval(() => {
for (const player of world.getPlayers()) {
const backpackversion = world.getDynamicProperty("backpackversion");
const storageversion = world.getDynamicProperty("storageversion");
const inventory = player.getComponent("minecraft:inventory").container;
const item = player.getComponent("equippable").getEquipmentSlot("Mainhand");
try {
if (backpackIDs.includes(item.typeId)) {
  player.setDynamicProperty("lastbackpackversion", item.getDynamicProperty("itembackpackversion"));
  player.setDynamicProperty("laststorageversion", item.getDynamicProperty("itemstorageversion"));
}
if (item.getDynamicProperty("itembackpackversion")) continue;
if (item && backpackIDs.includes(item.typeId)) {
  item.setDynamicProperty("itembackpackversion", backpackversion);
  item.setDynamicProperty("itemstorageversion", storageversion);
  world.setDynamicProperty("backpackversion", backpackversion + 1);
}
} catch (error) {}
}});

system.runInterval(() => {
for (const player of world.getPlayers()) {
const inventory = player.getComponent("minecraft:inventory");
const handItem = inventory.container.getItem(player.selectedSlotIndex);
const storageversion = player.getDynamicProperty("laststorageversion")
const mainstorageversion = player.getDynamicProperty("mainstorageversion")
const lastbackpackversion = player.getDynamicProperty("lastbackpackversion")
const mainbackpackversion = player.getDynamicProperty("mainbackpackversion")
const moving = player.getVelocity().x*100 > 1 || player.getVelocity().y*100 > 1 || player.getVelocity().z*100 > 1 || player.getVelocity().x*100 < -1 || player.getVelocity().y*100 < -1 || player.getVelocity().z*100 < -1;
const playerX = Math.floor(player.location.x);
const playerY = Math.floor(player.location.y);
const playerZ = Math.floor(player.location.z);
for (let x = -1; x <= 1; x++) {
for (let y = -1; y <= 1; y++) {
for (let z = -1; z <= 1; z++) {
const block = player.dimension.getBlock({ x: playerX + x, y: playerY + y, z: playerZ + z })?.typeId;
if (block == "minecraft:portal" || block == "minecraft:end_portal" || block == "minecraft:end_gateway") {
if (player.hasTag("hasEntity")) {
entitydatastore(player, lastbackpackversion, storageversion)
}
continue
}}}}
if (moving || player.isSneaking == true) {
if (player.hasTag("hasEntity")) {
entitydatastore(player, lastbackpackversion, storageversion)
}
continue
}
if (player.hasTag("hasEntity")) {
if (!handItem || !backpackIDs.includes(handItem.typeId)) {
entitydatastore(player, lastbackpackversion, storageversion);
continue;
}
if (lastbackpackversion !==  mainbackpackversion) {
entitydatastore(player, mainbackpackversion, mainstorageversion)
}
continue;
}
if (handItem && backpackIDs.includes(handItem.typeId)) {
entitydataload(player);
}
}});

function entitydatastore(player, version, storageversion) {
try {
const inventory = player.getComponent("minecraft:inventory");
const handItem = inventory.container.getItem(player.selectedSlotIndex);
const datastoreentity = world.getDimension("overworld").getEntities({tags: [`datastore`],})[storageversion].getComponent("inventory").container;
let entities = []
let inventorys = []
try {
entities = player.dimension.getEntities({tags: [`owner:${player.id}`],});
inventorys = entities[0].getComponent("inventory").container;
} catch (error) {
player.removeTag("hasEntity");
}
for (let i = 0; i < inventorys.size; i++) {
const item = inventorys.getItem(i);
if (item) {
datastoreentity.setItem((((version)*20)-(storageversion*240))+i, item);
} else {
datastoreentity.setItem((((version)*20)-(storageversion*240))+i, null);
}}
entities.forEach((entity) => entity.remove());
player.removeTag("hasEntity");
} catch (error) {}
}

function entitydataload(player) {
    try {
        const storageversion = player.getDynamicProperty("laststorageversion");
        const datastoreentity = world.getDimension("overworld").getEntities({ tags: [`datastore`] })[storageversion].getComponent("inventory").container;
        const lastbackpackversion = player.getDynamicProperty("lastbackpackversion");

        player.addTag("hasEntity");
        player.setDynamicProperty("mainbackpackversion", lastbackpackversion);
        player.setDynamicProperty("mainstorageversion", storageversion);

        const loc = {
            x: player.location.x,
            y: player.location.y + 1.6,
            z: player.location.z,
        };

        const handItem = player.getComponent("minecraft:inventory").container.getItem(player.selectedSlotIndex);
        
        let entityType = "mcpe:backpacks";
        let backpackName = "Backpack";

        if (handItem) {
            if (handItem.typeId.includes("school")) {
                entityType = "mcpe:school_backpack_container";
                backpackName = "School Backpack";
            } else if (handItem.typeId.includes("taloon")) {
                entityType = "mcpe:taloon_backpack_container";
                backpackName = "Taloon Backpack";
            }
        }
        const entity = player.dimension.spawnEntity(entityType, loc);
        entity.addTag(`owner:${player.id}`);
        entity.nameTag = backpackName;

        for (let i = (((lastbackpackversion) * 20) - (storageversion * 240)); i <= (((lastbackpackversion) * 20) - (storageversion * 240)) + 19; i++) {
            const item = datastoreentity.getItem(i);
            if (item) {
                const inv = entity.getComponent("inventory").container;
                inv.setItem(i - (((lastbackpackversion) * 20) - (storageversion * 240)), item);
            }
        }
    } catch (error) {}
}

system.runInterval(() => {
for (const player of world.getPlayers()) {
try {
const lastbackpackversion = player.getDynamicProperty("lastbackpackversion")
const storageversion = player.getDynamicProperty("laststorageversion")
const entities = player.dimension.getEntities({tags: [`owner:${player.id}`],});
const entity = entities[0];
if (!entity && player.hasTag("hasEntity")) {
player.removeTag("hasEntity")
}
entity.setDynamicProperty("version", lastbackpackversion)
entity.setDynamicProperty("storageversion", storageversion)
entity.setDynamicProperty("playerid", player.id)
} catch (error) {}
}})

system.runInterval(() => {
    const dimensions = [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end")
    ];

    for (const dimension of dimensions) {
        for (const entity of dimension.getEntities()) {
            if (
                entity.typeId == "mcpe:backpacks" ||
                entity.typeId == "mcpe:school_backpack_container" ||
                entity.typeId == "mcpe: taloon_backpack_container"
            ) {
                const entityid = entity.getDynamicProperty("playerid");
                const storageversion = entity.getDynamicProperty("storageversion");
                const version = entity.getDynamicProperty("version");
                let testentity = true;

                for (const player of world.getPlayers()) {
                    if (entityid == player.id) {
                        testentity = false;
                    }
                }

                if (testentity == true) {
                    const datastoreentity = world.getDimension("overworld").getEntities({ tags: [`datastore`] })[storageversion].getComponent("inventory").container;
                    const inventorys = entity.getComponent("inventory").container;

                    for (let i = 0; i < inventorys.size; i++) {
                        const item = inventorys.getItem(i);
                        if (item) {
                            datastoreentity.setItem((((version) * 20) - (storageversion * 240)) + i, item);
                        } else {
                            datastoreentity.setItem((((version) * 20) - (storageversion * 240)) + i, null);
                        }
                    }

                    entity.remove();
                }
            }
        }
    }
});

system.runInterval(() => {
for (const player of world.getPlayers()) {
const inventory = player.getComponent("minecraft:inventory").container;
try {
const entities = player.dimension.getEntities({ tags: [`owner:${player.id}`] });
const entity = entities[0];
for (let i = 0; i < inventory.size; i++) {
const item = inventory.getItem(i);
if (item && backpackIDs.includes(item.typeId)) {
if (inventory.getItem(player.selectedSlotIndex) && backpackIDs.includes(inventory.getItem(player.selectedSlotIndex).typeId)) {
if (i == player.selectedSlotIndex) {
item.lockMode = "slot";
inventory.setItem(i, item);
} else {
item.lockMode = "inventory";
inventory.setItem(i, item);
}} else {
item.lockMode = "none";
inventory.setItem(i, item);
}
}}} catch (error) {}
}})