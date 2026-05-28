import { world, system, ItemStack } from "@minecraft/server"
import { minecraftFoods } from "./identifiers.js"
system.beforeEvents.startup.subscribe((e) => {
    // food component
    e.itemComponentRegistry.registerCustomComponent('efm:realistic_food', {})

    // salt deposit component
    e.blockComponentRegistry.registerCustomComponent("efm:salt_deposit", {
        onPlayerInteract: ({ player, block }) => {
            const eq = player.getComponent("equippable")
            let itemStack = eq.getEquipment("Mainhand")
            if (!itemStack) return;
            if (itemStack?.typeId == "_efm:salt") {
                try {
                    let salt_quantity = block.permutation.getState("efm:salt_quantity")
                    const next_state = block.permutation.withState("efm:salt_quantity", salt_quantity + 1)
                    block.setPermutation(next_state)
                    itemStack.amount > 1 ? itemStack.amount-- : itemStack = null
                    eq.setEquipment("Mainhand", itemStack)

                    block.dimension.playSound("item.bone_meal.use", block.center(), { volume: 10, pitch: 0.7 })
                    block.dimension.playSound("step.grass", block.center(), { volume: 10, pitch: 0.35 })

                } catch {
                    player.playSound("ui.hardcore_enable", { volume: 0.2, pitch: 1.5 })
                    player.sendMessage("§i[Better Food] §cSalt Deposit is full.")
                }
            }
            const foodComponent = itemStack?.getComponent("food")
            const expiringComponent = itemStack?.getComponent("efm:realistic_food")

            if ((foodComponent && expiringComponent) || minecraftFoods.find(k => k.id == itemStack.typeId)) {

                let lore0 = itemStack?.getLore()[0]?.split(':')
                if (!lore0 || parseInt(lore0[2]) == 2) return;

                let salt_quantity = block.permutation.getState("efm:salt_quantity")
                if (salt_quantity > 1) {
                    salt_quantity -= 1

                    const newItem = new ItemStack(itemStack.typeId)
                    const lore = itemStack.getLore()

                    lore[0] = [`§0${parseInt((parseInt(lore0[0].slice(2)) - world.getDay()) * 2 + world.getDay())}`, '-1', '2'].join(':')
                    lore[4] = "§r§f(Salted)"
                    newItem.setLore(lore)

                    itemStack.amount > 1
                        ? itemStack.amount--
                        : itemStack = null
                    eq.setEquipment("Mainhand", itemStack)

                    player.dimension.spawnItem(newItem, block.center())
                    block.dimension.playSound("item.bone_meal.use", block.center(), { volume: 10, pitch: 0.7 })
                    block.dimension.playSound("step.grass", block.center(), { volume: 10, pitch: 0.35 })
                    const next_state = block.permutation.withState("efm:salt_quantity", salt_quantity)
                    block.setPermutation(next_state)

                } else {
                    player.playSound("ui.hardcore_enable", { volume: 0.2, pitch: 1.5 })
                    player.sendMessage("§i[Better Food] §cSalt Deposit is empty.")

                }
            }
        }
    })
})