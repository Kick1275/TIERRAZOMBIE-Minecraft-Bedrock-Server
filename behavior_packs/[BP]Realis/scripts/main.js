
import { world, system, ItemStack } from "@minecraft/server"
import * as mc from "@minecraft/server"
import * as ui from "@minecraft/server-ui"
import { minecraftFoods } from "./identifiers.js"
import "./salt_deposit.js"
import { Config } from "./config.js"

/**@type mc.Player[] */
let players = []
let index = 0

// player Events
system.run(() => { players = world.getPlayers() })
world.afterEvents.playerLeave.subscribe(() => players = world.getPlayers())
world.afterEvents.playerSpawn.subscribe(() => players = world.getPlayers())

let jobId;
system.runInterval(() => {
    const player = players[index];
    index < players.length - 1 ? index++ : index = 0;
    jobId = system.runJob(checkInventory(player))
}, 11 - players.length)

world.afterEvents.itemCompleteUse.subscribe(({ source: player, itemStack }) => {
    const foodType = minecraftFoods.find(k => k.id == itemStack.typeId)
    if (foodType) {
        const expireDay = parseInt(itemStack.getLore()[0].split(':')[0].slice(2))
        if (!Number.isNaN(expireDay) && expireDay) {
            const daysRemaining = expireDay - world.getDay();
            const restoration = (foodType.restoration / foodType.expire) * daysRemaining
            const sub = Math.round(foodType.restoration - restoration)
            if (sub > 0)
                player.addEffect('hunger', foodType.saturation * sub ^ 1.6, { amplifier: 255, showParticles: false })
        }
    }
    if (itemStack.getLore()[0] == '§r§iExpired' || itemStack.typeId.startsWith('efm:')) {
        [
            { id: "nausea", time: 20, amplifier: 0, },
            { id: "poison", time: 15, amplifier: 1, },
            { id: "hunger", time: 25, amplifier: 20, },
            { id: "slowness", time: 15, amplifier: 1, }
        ].forEach(({ id, time, amplifier }) => {
            player.addEffect(id, time * 20, { amplifier, showParticles: true })
        })
    }
})
/**@param{mc.Player} player */
function* checkInventory(player) {
    const inv = player?.getComponent('inventory').container
    if (!inv) return system.clearJob(jobId);
    for (let slot = 0; slot < inv.size; slot++) {
        const item = inv.getItem(slot);
        if (!item) continue;
        let foodType = minecraftFoods.find(k => k.id == item?.typeId)
        if (item.getLore()[0] == "§r§iExpired") continue;
        if (!foodType) {
            const rfc = item.getComponent("efm:realistic_food")
            const fc = item.getComponent('food')
            if (!fc || item.typeId.startsWith('efm:')) continue
            if (!rfc && Config.autoSetExpireTime == false) continue;
            foodType = {
                expire: rfc?.customComponentParameters?.params?.expire_time ?? world.getDynamicProperty(item.typeId) ?? 10,
                id: item.typeId,
                restoration: fc.nutrition,
                saturation: fc.saturationModifier,
                turnInto: "expired"
            }
        }
        const lore = item.getLore();
        if (!lore[0]) {
            const expireDateRaw = foodType.expire + world.getDay();
            lore[0] = `§0${expireDateRaw}:${world.getDay()}:1`;
            lore[1] = `§r§iExpires on day §f${expireDateRaw}.`;
        } else {
            if (parseInt(lore[0].split(':')[1]) == world.getDay()) continue;
        }
        lore[0] = lore[0].split(':')[0] + `:${world.getDay()}:` + lore[0].split(':')[2];
        const expireDateRaw = parseInt(lore[0].split(':')[0].slice(2))
        lore[1] = `§r§iExpires on day §f${expireDateRaw}.`;
        const remainingDays = expireDateRaw - world.getDay();
        if (remainingDays <= 0) {
            const newItem = new ItemStack(foodType.turnInto == 'expired' ? item.typeId : "efm:" + foodType.turnInto, item.amount)
            newItem.setLore(["§r§iExpired"])
            inv.setItem(slot, newItem)
            continue;
        }
        let remainingNutrition = (foodType.restoration / (foodType.expire * parseInt(lore[0].split(':')[2])) * remainingDays)
        remainingNutrition = remainingNutrition > foodType.restoration ? foodType.restoration : remainingNutrition
        lore[2] = `§r${remainingDays} §iDays remaining.`;
        const color = ['c', 'v', 'g', 'e', 'a', 'q'][(parseInt((6 / foodType.restoration * remainingNutrition) - 1))];
        lore[3] = `§r§iNutrition §${color ?? 'g'}${remainingNutrition.toFixed(1)}/${foodType.restoration.toFixed(1)}`;
        item?.setLore(lore)
        inv.setItem(slot, item)
        yield;
    }
    return system.clearJob(jobId)
}

world.beforeEvents.playerInteractWithBlock.subscribe(e => {
    let { itemStack, player, block, isFirstEvent } = e;
    if (!isFirstEvent) return;
    if (block.typeId == 'minecraft:composter' && itemStack?.typeId.startsWith("efm")) {
        const level = block.permutation.getState("composter_fill_level")
        system.run(() => {
            try {
                const perm = block.permutation.withState("composter_fill_level", level + 1)
                block.setPermutation(perm)
                itemStack.amount > 1 ? itemStack.amount -= 1 : itemStack = null;
                player.getComponent('equippable').setEquipment('Mainhand', itemStack)
            } catch { }
        })
    }
})

world.beforeEvents.itemUse.subscribe(e => {
    let { source: player, itemStack: R_item } = e;
    const eq = player.getComponent('equippable')
    let L_item = eq.getEquipment('Offhand')
    let lore0 = R_item?.getLore()[0]?.split(':')
    if (!lore0 || parseInt(lore0[2]) == 2) return;
    if (L_item?.typeId == '_efm:salt') {
        system.run(() => {
            if (L_item.amount > R_item.amount) {
                L_item.amount -= R_item.amount;
            } else if (L_item.amount === R_item.amount) {
                L_item = null;
            } else {
                return player.sendMessage('Not enough Salt.');
            }
            const lore = R_item.getLore()
            lore[0] = [`§0${parseInt((parseInt(lore0[0].slice(2)) - world.getDay()) * 2 + world.getDay())}`, '-1', '2'].join(':')
            lore[4] = "§r§f(Salted)"

            R_item.setLore(lore)
            eq.setEquipment("Mainhand", R_item)
            eq.setEquipment("Offhand", L_item)
        })
    }
})
world.beforeEvents.itemUse.subscribe((e) => {
    const { source: player, itemStack } = e
    if (itemStack.getComponent("food")?.isValid && player.getDynamicProperty("etilm")) {
        e.cancel = true;
        system.run(() => {
            new ui.ModalFormData().title("Editor Mode").header("Editor Mode").slider("Expire Time (days)", 1, 32, { defaultValue: 10 }).show(player).then(
                ({ formValues: [, days], canceled }) => {
                    if (canceled) return;
                    world.setDynamicProperty(itemStack.typeId, parseInt(days))
                    world.sendMessage(`Set ${itemStack.typeId} to expire in ${days} days.`)
                }
            )
        })
    }
})

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (player.commandPermissionLevel == 3 && initialSpawn) {
        system.runTimeout(() => {
            player.sendMessage(
                // `§a----------------------------\n` +
                // `§e@${player.name}§r Thanks for playing §aRealistic Food!§r\n` +
                // `Bugs? §6Report them on the MCPEDL or CURSEFORGE page.§r\n` +
                // `You like this addon? §gWrite a 5 stars review!§r\n` +
                // `§aHave fun!\n` +
                // `§iPack version: 1.0.6 - MC 1.21.100\nAPI version: 2.1.0\n` +
                // `§a----------------------------`
            )
            player.playSound("random.levelup")
        }, 120)
    }
})