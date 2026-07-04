import { ItemStack } from "@minecraft/server";

// Construye el item visual de una llave (nombre, lore, encantado) según la
// configuración de la crate. Ya no incrusta ningún identificador oculto en el
// lore — la llave se reconoce únicamente por su typeId, así que un /give
// normal del mismo item también sirve para abrir la crate.
export function buildKeyItem(keyConfig, _crateId, amount = 1) {
    try {
        const item = new ItemStack(keyConfig.typeId ?? "minecraft:tripwire_hook", amount);
        item.nameTag = keyConfig.nameTag ?? "§6§lLlave de Crate";
        item.setLore(keyConfig.lore ?? ["§7Usa esta llave para abrir una crate"]);
        if (keyConfig.enchanted) {
            try {
                const ench = item.getComponent("minecraft:enchantable");
                if (ench) ench.addEnchantment({ type: "unbreaking", level: 1 });
            } catch {}
        }
        return item;
    } catch {
        return null;
    }
}

// Busca en todo el inventario un item cuyo typeId coincida con la llave de esta crate.
export function findKeySlot(player, crate) {
    try {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) return -1;
        const keyTypeId = crate.key?.typeId ?? "minecraft:tripwire_hook";
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item && item.typeId === keyTypeId) return i;
        }
    } catch {}
    return -1;
}

export function playerHasKey(player, crate) {
    return findKeySlot(player, crate) !== -1;
}

export function consumeKey(player, crate) {
    try {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) return false;
        const slot = findKeySlot(player, crate);
        if (slot === -1) return false;
        const item = inv.getItem(slot);
        if (!item) return false;
        if (item.amount > 1) {
            item.amount -= 1;
            inv.setItem(slot, item);
        } else {
            inv.setItem(slot, undefined);
        }
        return true;
    } catch {
        return false;
    }
}

export function giveKeys(player, crate, amount = 1) {
    try {
        const inv = player.getComponent("minecraft:inventory")?.container;
        if (!inv) return;
        const item = buildKeyItem(crate.key, crate.id, Math.min(amount, 64));
        if (!item) return;
        inv.addItem(item);
    } catch {}
}
