import { ActionFormData } from '@minecraft/server-ui';
import { getDynamicPropertyKey, setAksesoris, isAllowed } from './buahBuahApaYangBisaDigorengJawabanNyaJillKawir.js';
import { world, system } from '@minecraft/server';

function getCurrentAttachment(player, weaponId, type) {
    const key = getDynamicPropertyKey(weaponId);
    if (!key) return 0;
    const [stock = 0, grip = 0, laser = 0, muzzle = 0, magazine = 0] = (player.getDynamicProperty(key)?.split(',') || []).map(Number);
    switch (type) {
        case "stock": return stock;
        case "grip": return grip;
        case 'laser': return laser;
        case 'muzzle': return muzzle;
        case "magazine": return magazine;
        default: return 0;
    }
}

function attachmentnew(player) {
    let form = new ActionFormData();
    form.title("Attachment WIP");
    form.body('Not sure this mechanic still relevant, but ya, i dont have any time to made this mechanic more advance');
    form.button("MP5", "textures/items/mp5");
    form.button("Vector", "textures/items/vector");
    form.button("Glock 17", 'textures/items/g17');
    form.button('AKM', 'textures/items/akm');
    form.button('M4A1', "textures/items/m4a1");
    form.button('HK416', "textures/items/hk416");
    form.button("AWM", "textures/items/awp");
    form.button("Golden Deagle", "textures/items/deagleg");
    form.button("Double Barrel", "textures/items/db");
    form.button("FAL", 'textures/items/fal');
    form.button("MK14", "textures/items/mk14");
    form.button("QBZ-191", "textures/items/qbz191");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: mp5att(player); break;
            case 1: vectoratt(player); break;
            case 2: g17att(player); break;
            case 3: akmatt(player); break;
            case 4: m4a1att(player); break;
            case 5: hk416att(player); break;
            case 6: awpatt(player); break;
            case 7: deaglegatt(player); break;
            case 8: dbatt(player); break;
            case 9: falatt(player); break;
            case 10: mk14att(player); break;
            case 11: qbz191att(player); break;
            default: break;
        }
    });
}

const playersInPreview = new Set();

function g17attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:g17" && itemId !== 'krep:g17_emp')) {
        player.sendMessage("You must be holding an Glock 17 to use this form!");
        return;
    }
    player.addTag('preview_active');
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        player.removeTag("preview_active");
        player.runCommandAsync("event entity @s krep:noview");
        playersInPreview.delete(player.id);
        if (response.selection === 0) g17att(player);
    });
}

function qbz191attscope(player) {
    let form = new ActionFormData();
    form.title("qbz191 Sight");
    form.button('Iron Sight', "textures/ui/nothing");
    form.button("Coyote", 'textures/ui/coyote');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s qbz191:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s qbz191:coyote"); break;
        }
        qbz191att(player);
    });
}

function qbz191att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:qbz191" && itemId !== "krep:qbz191_emp")) {
        player.sendMessage("You must be holding an qbz191 to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("qbz191 Attachments");
    form.body("Select an attachment type to customize your qbz191.");
    form.button("Grip", "textures/ui/new/grip1");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Sight", "textures/ui/coyote");
    form.button('Preview', 'textures/ui/blank');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: qbz191attgrip(player); break;
            case 1: qbz191attlaser(player); break;
            case 2: qbz191attscope(player); break;
            case 3: qbz191attpreview(player); break;
            default: break;
        }
    });
}

function qbz191attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:qbz191" && itemId !== "krep:qbz191_emp")) {
        player.sendMessage("You must be holding an qbz191 to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        player.runCommandAsync("event entity @s krep:noview");
        playersInPreview.delete(player.id);
        if (response.canceled) return;
        if (response.selection === 0) qbz191att(player);
    });
}

function qbz191attgrip(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:qbz191" && itemId !== "krep:qbz191_emp")) {
        player.sendMessage('You must be holding an qbz191 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title("qbz191 Grip");
    form.body("Select a grip for your qbz191.");
    const grips = ["No Grip", "Grip 1", 'Grip 2', "Grip 3", "Grip 4", "Grip 5", "Grip 6", "Grip 7", "Grip 8", "Grip 9", "Grip 10", "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? 'textures/ui/zero/zero_grip' : "textures/ui/new/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            qbz191att(player);
        } else if (response.selection === options.length) {
            qbz191attpreview(player);
        }
    });
}

function qbz191attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:qbz191" && itemId !== "krep:qbz191_emp")) {
        player.sendMessage('You must be holding an qbz191 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title("qbz191 Laser");
    form.body('Select a laser for your qbz191.');
    const lasers = ['No Laser', "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            qbz191att(player);
        } else if (response.selection === options.length) {
            qbz191attpreview(player);
        }
    });
}

function awpatt(player) {
    let form = new ActionFormData();
    form.title("AWM Scope");
    form.body("Im still not done with this gun, just wait for another update");
    form.button("Iron Sight", 'textures/ui/nothing');
    form.button("Coyote", "textures/ui/coyote");
    form.button("Acog", "textures/ui/acog");
    form.button("Elcan", "textures/ui/elcan");
    form.button("Standard 8", "textures/ui/standard_8");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s awp:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s awp:coyote"); break;
            case 2: player.runCommandAsync('event entity @s awp:acog'); break;
            case 3: player.runCommandAsync("event entity @s awp:elcan"); break;
            case 4: player.runCommandAsync('event entity @s awp:standard_8'); break;
        }
    });
}

function g17attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:g17" && itemId !== "krep:g17_emp")) {
        player.sendMessage('You must be holding an Glock 17 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title('Glock 17 Laser');
    form.body("Select a laser for your Glock 17.");
    const lasers = ["No Laser", "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/g17/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            g17att(player);
        } else if (response.selection === options.length) {
            g17attpreview(player);
        }
    });
}

function dbattmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:db' && itemId !== "krep:db_emp")) {
        player.sendMessage("You must be holding an Double Barrel to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'muzzle');
    const form = new ActionFormData();
    form.title("Double Barrel");
    form.body('Select a Barrel for your Double Barrel.');
    const barrels = ["Short Barrel", "Long Barrel"];
    barrels.forEach((name, i) => {
        const texture = i === 0 ? 'textures/ui/new/db/barrel0' : "textures/ui/new/db/barrel" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            dbatt(player);
        } else if (response.selection === options.length) {
            dbattpreview(player);
        }
    });
}

function g17attmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:g17' && itemId !== "krep:g17_emp")) {
        player.sendMessage("You must be holding an Glock 17 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("Glock 17 Muzzle");
    form.body('Select a muzzle for your Glock 17.');
    const muzzles = ["No Muzzle", "Muzzle 1", "Muzzle 2"];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : "textures/ui/new/g17/muzzle" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            g17att(player);
        } else if (response.selection === options.length) {
            g17attpreview(player);
        }
    });
}

function g17att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:g17" && itemId !== "krep:g17_emp")) {
        player.sendMessage("You must be holding an Glock 17 to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("Glock 17 Attachments");
    form.body("Select an attachment type to customize your Glock 17.");
    form.button("Laser", "textures/ui/new/g17/laser1");
    form.button('Muzzle', 'textures/ui/new/muzzle1');
    form.button('Preview', 'textures/ui/blank');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: g17attlaser(player); break;
            case 1: g17attmuzzle(player); break;
            case 2: g17attpreview(player); break;
            default: break;
        }
    });
}

function dbatt(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:db" && itemId !== "krep:db_emp")) {
        player.sendMessage("You must be holding an Double Barrel to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title('Double Barrel Attachments');
    form.body("Select an attachment type to customize your Double Barrel.");
    form.button("Stock", "textures/ui/new/stock3");
    form.button('Barrel', "textures/ui/new/db/barrel1");
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: dbattstock(player); break;
            case 1: dbattmuzzle(player); break;
            case 2: dbattpreview(player); break;
            default: break;
        }
    });
}

function dbattstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:db" && itemId !== "krep:db_emp")) {
        player.sendMessage("You must be holding an Double Barrel to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("Double Barrel Stock");
    form.body('Select a stock for your Double Barrel.');
    const stocks = ["No Stock", "Stock 1"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : "textures/ui/new/stock" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button('Preview', 'textures/ui/blank');
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            dbatt(player);
        } else if (response.selection === options.length) {
            dbattpreview(player);
        }
    });
}

function dbattpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:db" && itemId !== 'krep:db_emp')) {
        player.sendMessage("You must be holding an Double Barrel to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        player.removeTag("preview_active");
        player.runCommandAsync("event entity @s krep:noview");
        playersInPreview.delete(player.id);
        if (response.selection === 0) dbatt(player);
    });
}

function m4a1attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:m4a1' && itemId !== "krep:m4a1_emp")) {
        player.sendMessage('You must be holding an M4A1 to use this form!');
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync('event entity @s krep:noview');
        if (response.canceled) return;
        if (response.selection === 0) m4a1att(player);
    });
}

function m4a1attgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:m4a1' && itemId !== 'krep:m4a1_emp')) {
        player.sendMessage("You must be holding an M4A1 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title('M4A1 Grip');
    form.body('Select a grip for your M4A1.');
    const grips = ["No Grip", "Grip 1", "Grip 2", "Grip 3", "Grip 4", "Grip 5", "Grip 6", "Grip 7", "Grip 8", "Grip 9", "Grip 10", "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : "textures/ui/new/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            m4a1att(player);
        } else if (response.selection === options.length) {
            m4a1attpreview(player);
        }
    });
}

function hk416attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:hk416' && itemId !== "krep:hk416_emp")) {
        player.sendMessage("You must be holding an HK416 to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title('Custom dial');
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) hk416att(player);
    });
}

function hk416attgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:hk416" && itemId !== "krep:hk416_emp")) {
        player.sendMessage("You must be holding an HK416 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title("HK416 Grip");
    form.body("Select a grip for your HK416.");
    const grips = ["No Grip", "Grip 1", "Grip 2", "Grip 3", "Grip 4", "Grip 5", "Grip 6", "Grip 7", "Grip 8", "Grip 9", "Grip 10", "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : "textures/ui/new/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            hk416att(player);
        } else if (response.selection === options.length) {
            hk416attpreview(player);
        }
    });
}

function hk416attstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:hk416" && itemId !== "krep:hk416_emp")) {
        player.sendMessage("You must be holding an HK416 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("HK416 Stock");
    form.body('Select a stock for your HK416.');
    const stocks = ["No Stock", "Stock 1", "Stock 2", "Stock 3", "Stock 4", "Stock 5", "Stock 6", "Stock 7", "Stock 8"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : "textures/ui/new/m4a1/stock" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            hk416att(player);
        } else if (response.selection === options.length) {
            hk416attpreview(player);
        }
    });
}

function hk416attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== 'krep:hk416' && itemId !== 'krep:hk416_emp')) {
        player.sendMessage("You must be holding an HK416 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title("HK416 Laser");
    form.body("Select a laser for your HK416.");
    const lasers = ["No Laser", "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            hk416att(player);
        } else if (response.selection === options.length) {
            hk416attpreview(player);
        }
    });
}

function hk416attmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:hk416" && itemId !== "krep:hk416_emp")) {
        player.sendMessage("You must be holding an HK416 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("HK416 Muzzle");
    form.body("Select a muzzle for your HK416.");
    const muzzles = ["No Muzzle", "Muzzle 1", "Muzzle 2", "Muzzle 3", "Muzzle 4", "Muzzle 5", 'Muzzle 6'];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? 'textures/ui/zero/zero_muzzle' : "textures/ui/new/muzzle" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            hk416att(player);
        } else if (response.selection === options.length) {
            hk416attpreview(player);
        }
    });
}

function hk416attscope(player) {
    const form = new ActionFormData();
    form.title("HK416 Sight");
    form.button("Iron Sight", "textures/ui/nothing");
    form.button('Coyote', "textures/ui/coyote");
    form.button("Holo 552", 'textures/ui/holo');
    form.button('T2', "textures/ui/t2");
    form.button('Acog', "textures/ui/acog");
    form.button('Elcan', 'textures/ui/elcan');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s hk416:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s hk416:coyote"); break;
            case 2: player.runCommandAsync("event entity @s hk416:holo"); break;
            case 3: player.runCommandAsync('event entity @s hk416:t2'); break;
            case 4: player.runCommandAsync("event entity @s hk416:acog"); break;
            case 5: player.runCommandAsync('event entity @s hk416:elcan'); break;
        }
        hk416att(player);
    });
}

function hk416att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:hk416" && itemId !== 'krep:hk416_emp')) {
        player.sendMessage('You must be holding an HK416 to use this form!');
        return;
    }
    const form = new ActionFormData();
    form.title("HK416 Attachments");
    form.body("Select an attachment type to customize your HK416.");
    form.button("Grip", 'textures/ui/new/grip1');
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Muzzle", "textures/ui/new/muzzle1");
    form.button('Sight', "textures/ui/coyote");
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: hk416attgrip(player); break;
            case 1: hk416attstock(player); break;
            case 2: hk416attlaser(player); break;
            case 3: hk416attmuzzle(player); break;
            case 4: hk416attscope(player); break;
            case 5: hk416attpreview(player); break;
            default: break;
        }
    });
}

function m4a1attstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:m4a1" && itemId !== "krep:m4a1_emp")) {
        player.sendMessage('You must be holding an M4A1 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("M4A1 Stock");
    form.body("Select a stock for your M4A1.");
    const stocks = ["No Stock", "Stock 1", "Stock 2", 'Stock 3', "Stock 4", "Stock 5", "Stock 6", "Stock 7", "Stock 8"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : 'textures/ui/new/m4a1/stock' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            m4a1att(player);
        } else if (response.selection === options.length) {
            m4a1attpreview(player);
        }
    });
}

function m4a1attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:m4a1" && itemId !== "krep:m4a1_emp")) {
        player.sendMessage("You must be holding an M4A1 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'laser');
    const form = new ActionFormData();
    form.title("M4A1 Laser");
    form.body("Select a laser for your M4A1.");
    const lasers = ['No Laser', "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? ' (Selected)' : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            m4a1att(player);
        } else if (response.selection === options.length) {
            m4a1attpreview(player);
        }
    });
}

function m4a1attmuzzle(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:m4a1" && itemId !== 'krep:m4a1_emp')) {
        player.sendMessage("You must be holding an M4A1 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("M4A1 Muzzle");
    form.body("Select a muzzle for your M4A1.");
    const muzzles = ["No Muzzle", 'Muzzle 1', "Muzzle 2", "Muzzle 3", "Muzzle 4", "Muzzle 5", "Muzzle 6"];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : "textures/ui/new/muzzle" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            m4a1att(player);
        } else if (response.selection === options.length) {
            m4a1attpreview(player);
        }
    });
}

function m4a1attscope(player) {
    const form = new ActionFormData();
    form.title("M4A1 Sight");
    form.button("Iron Sight", 'textures/ui/nothing');
    form.button("Coyote", "textures/ui/coyote");
    form.button("Holo 552", "textures/ui/holo");
    form.button('T2', "textures/ui/t2");
    form.button("Acog", "textures/ui/acog");
    form.button("Elcan", 'textures/ui/elcan');
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s m4a1:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s m4a1:coyote"); break;
            case 2: player.runCommandAsync("event entity @s m4a1:holo"); break;
            case 3: player.runCommandAsync("event entity @s m4a1:t2"); break;
            case 4: player.runCommandAsync("event entity @s m4a1:acog"); break;
            case 5: player.runCommandAsync('event entity @s m4a1:elcan'); break;
        }
        m4a1att(player);
    });
}

function m4a1att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:m4a1" && itemId !== "krep:m4a1_emp")) {
        player.sendMessage("You must be holding an M4A1 to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("M4A1 Attachments");
    form.body("Select an attachment type to customize your M4A1.");
    form.button('Grip', "textures/ui/new/grip1");
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Muzzle", "textures/ui/new/muzzle1");
    form.button("Sight", "textures/ui/coyote");
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: m4a1attgrip(player); break;
            case 1: m4a1attstock(player); break;
            case 2: m4a1attlaser(player); break;
            case 3: m4a1attmuzzle(player); break;
            case 4: m4a1attscope(player); break;
            case 5: m4a1attpreview(player); break;
            default: break;
        }
    });
}

function mp5attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== "krep:mp5_emp")) {
        player.sendMessage('You must be holding an MP5 to use this form!');
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) mp5att(player);
    });
}

function mp5attgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== 'krep:mp5_emp')) {
        player.sendMessage("You must be holding an MP5 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'grip');
    const form = new ActionFormData();
    form.title("MP5 Grip");
    form.body("Select a grip for your MP5.");
    const grips = ['No Grip', "Grip 1", 'Grip 2', "Grip 3", "Grip 4", 'Grip 5', 'Grip 6', "Grip 7", "Grip 8", "Grip 9", "Grip 10", "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : "textures/ui/new/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            mp5att(player);
        } else if (response.selection === options.length) {
            mp5attpreview(player);
        }
    });
}

function mp5attstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== "krep:mp5_emp")) {
        player.sendMessage('You must be holding an MP5 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("MP5 Stock");
    form.body("Select a stock for your MP5.");
    const stocks = ["No Stock", "Stock 1", "Stock 2", 'Stock 3', "Stock 4", "Stock 5", 'Stock 6', "Stock 7", "Stock 8", "Stock 9", "Stock 10", "Stock 11"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : "textures/ui/new/stock" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            mp5att(player);
        } else if (response.selection === options.length) {
            mp5attpreview(player);
        }
    });
}

function mp5attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== "krep:mp5_emp")) {
        player.sendMessage("You must be holding an MP5 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title("MP5 Laser");
    form.body("Select a laser for your MP5.");
    const lasers = ["No Laser", 'Laser 1'];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            mp5att(player);
        } else if (response.selection === options.length) {
            mp5attpreview(player);
        }
    });
}

function mp5attmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== "krep:mp5_emp")) {
        player.sendMessage("You must be holding an MP5 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("MP5 Muzzle");
    form.body("Select a muzzle for your MP5.");
    const muzzles = ["No Muzzle", "Muzzle 1", 'Muzzle 2', "Muzzle 3", "Muzzle 4", "Muzzle 5", "Muzzle 6"];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : "textures/ui/new/muzzle" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            mp5att(player);
        } else if (response.selection === options.length) {
            mp5attpreview(player);
        }
    });
}

function mp5attscope(player) {
    const form = new ActionFormData();
    form.title("MP5 Sight");
    form.button("Iron Sight", "textures/ui/nothing");
    form.button('Coyote', "textures/ui/coyote");
    form.button("Holo 552", "textures/ui/holo");
    form.button('T2', "textures/ui/t2");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s mp5:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s mp5:coyote"); break;
            case 2: player.runCommandAsync("event entity @s mp5:holo"); break;
            case 3: player.runCommandAsync("event entity @s mp5:t2"); break;
        }
        mp5att(player);
    });
}

function mp5att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mp5" && itemId !== "krep:mp5_emp")) {
        player.sendMessage("You must be holding an MP5 to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title('MP5 Attachments');
    form.body("Select an attachment type to customize your MP5.");
    form.button("Grip", 'textures/ui/new/grip1');
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Muzzle", "textures/ui/new/muzzle1");
    form.button("Sight", 'textures/ui/coyote');
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: mp5attgrip(player); break;
            case 1: mp5attstock(player); break;
            case 2: mp5attlaser(player); break;
            case 3: mp5attmuzzle(player); break;
            case 4: mp5attscope(player); break;
            case 5: mp5attpreview(player); break;
            default: break;
        }
    });
}

function falattscope(player) {
    const form = new ActionFormData();
    form.title("fal Sight");
    form.button('Iron Sight', "textures/ui/nothing");
    form.button("Coyote", "textures/ui/coyote");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s fal:ironsight"); break;
            case 1: player.runCommandAsync('event entity @s fal:coyote'); break;
        }
        falatt(player);
    });
}

function falatt(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:fal" && itemId !== "krep:fal_emp")) {
        player.sendMessage("You must be holding an fal to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("fal Attachments");
    form.body("Select an attachment type to customize your fal.");
    form.button("Grip", "textures/ui/new/grip1");
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Sight", "textures/ui/coyote");
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: falattgrip(player); break;
            case 1: falattstock(player); break;
            case 2: falattlaser(player); break;
            case 3: falattscope(player); break;
            case 4: falattpreview(player); break;
            default: break;
        }
    });
}

function falattpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:fal" && itemId !== "krep:fal_emp")) {
        player.sendMessage("You must be holding an fal to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) falatt(player);
    });
}

function falattgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:fal" && itemId !== "krep:fal_emp")) {
        player.sendMessage('You must be holding an fal to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title("fal Grip");
    form.body("Select a grip for your fal.");
    const grips = ['No Grip', "Grip 1", "Grip 2", "Grip 3", 'Grip 4', "Grip 5", 'Grip 6', "Grip 7", "Grip 8", "Grip 9", "Grip 10", "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : "textures/ui/new/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            falatt(player);
        } else if (response.selection === options.length) {
            falattpreview(player);
        }
    });
}

function falattstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:fal" && itemId !== "krep:fal_emp")) {
        player.sendMessage("You must be holding an fal to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("fal Stock");
    form.body("Select a stock for your fal.");
    const stocks = ["No Stock", "Stock 1", "Stock 2", "Stock 3", 'Stock 4', "Stock 5", 'Stock 6', "Stock 7", "Stock 8", "Stock 9", "Stock 10", "Stock 11"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : "textures/ui/new/stock" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            falatt(player);
        } else if (response.selection === options.length) {
            falattpreview(player);
        }
    });
}

function falattlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:fal" && itemId !== "krep:fal_emp")) {
        player.sendMessage("You must be holding an fal to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'laser');
    const form = new ActionFormData();
    form.title("fal Laser");
    form.body("Select a laser for your fal.");
    const lasers = ['No Laser', 'Laser 1'];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : 'textures/ui/new/laser' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            falatt(player);
        } else if (response.selection === options.length) {
            falattpreview(player);
        }
    });
}

function mk14attscope(player) {
    const form = new ActionFormData();
    form.title("mk14 Sight");
    form.button('Iron Sight', 'textures/ui/nothing');
    form.button('Coyote', "textures/ui/coyote");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync('event entity @s mk14:ironsight'); break;
            case 1: player.runCommandAsync("event entity @s mk14:coyote"); break;
        }
        mk14att(player);
    });
}

function mk14att(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mk14" && itemId !== "krep:mk14_emp")) {
        player.sendMessage('You must be holding an mk14 to use this form!');
        return;
    }
    const form = new ActionFormData();
    form.title("mk14 Attachments");
    form.body("Select an attachment type to customize your mk14.");
    form.button("Grip", "textures/ui/new/grip1");
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", 'textures/ui/new/laser1');
    form.button('Sight', "textures/ui/coyote");
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: mk14attgrip(player); break;
            case 1: mk14attstock(player); break;
            case 2: mk14attlaser(player); break;
            case 3: mk14attscope(player); break;
            case 4: mk14attpreview(player); break;
            default: break;
        }
    });
}

function mk14attpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mk14" && itemId !== "krep:mk14_emp")) {
        player.sendMessage("You must be holding an mk14 to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync('event entity @s krep:view');
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title('Custom dial');
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) mk14att(player);
    });
}

function mk14attgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mk14" && itemId !== "krep:mk14_emp")) {
        player.sendMessage("You must be holding an mk14 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title('mk14 Grip');
    form.body("Select a grip for your mk14.");
    const grips = ["No Grip", "Grip 1", "Grip 2", "Grip 3", 'Grip 4', "Grip 5", 'Grip 6', "Grip 7", "Grip 8", "Grip 9", 'Grip 10', "Grip 11"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : 'textures/ui/new/grip' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            mk14att(player);
        } else if (response.selection === options.length) {
            mk14attpreview(player);
        }
    });
}

function mk14attstock(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mk14" && itemId !== "krep:mk14_emp")) {
        player.sendMessage("You must be holding an mk14 to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'stock');
    const form = new ActionFormData();
    form.title("mk14 Stock");
    form.body('Select a stock for your mk14.');
    const stocks = ["No Stock", 'Stock 1', "Stock 2", 'Stock 3', "Stock 4", 'Stock 5', "Stock 6", "Stock 7", 'Stock 8'];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? 'textures/ui/zero/zero_stock' : 'textures/ui/new/m4a1/stock' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            mk14att(player);
        } else if (response.selection === options.length) {
            mk14attpreview(player);
        }
    });
}

function mk14attlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:mk14" && itemId !== "krep:mk14_emp")) {
        player.sendMessage('You must be holding an mk14 to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title("mk14 Laser");
    form.body("Select a laser for your mk14.");
    const lasers = ['No Laser', "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            mk14att(player);
        } else if (response.selection === options.length) {
            mk14attpreview(player);
        }
    });
}

function vectorattpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage('You must be holding an Vector to use this form!');
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync('event entity @s krep:view');
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button('Finish', "textures/ui/blank");
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) vectoratt(player);
    });
}

function vectorattgrip(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage('You must be holding an Vector to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "grip");
    const form = new ActionFormData();
    form.title("Vector Grip");
    form.body('Select a grip for your Vector.');
    const grips = ["No Grip", "Grip 1", "Grip 2", "Grip 3", "Grip 4", "Grip 5", 'Grip 6', "Grip 7", "Grip 8"];
    grips.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_grip" : "textures/ui/new/vector/grip" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'grip': selected });
            vectoratt(player);
        } else if (response.selection === options.length) {
            vectorattpreview(player);
        }
    });
}

function vectorattstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== 'krep:vector_emp')) {
        player.sendMessage('You must be holding an Vector to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("Vector Stock");
    form.body('Select a stock for your Vector.');
    const stocks = ["No Stock", "Stock 1", "Stock 2", "Stock 3", "Stock 4", "Stock 5", "Stock 6", "Stock 7", "Stock 8", "Stock 9", "Stock 10", "Stock 11"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : 'textures/ui/new/stock' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", 'textures/ui/blank');
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            vectoratt(player);
        } else if (response.selection === options.length) {
            vectorattpreview(player);
        }
    });
}

function vectorattlaser(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage("You must be holding an Vector to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "laser");
    const form = new ActionFormData();
    form.title("Vector Laser");
    form.body('Select a laser for your Golden Deagle.');
    const lasers = ["No Laser", "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            vectoratt(player);
        } else if (response.selection === options.length) {
            vectorattpreview(player);
        }
    });
}

function vectorattmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage('You must be holding an Vector to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("Vector Muzzle");
    form.body("Select a muzzle for your Vector.");
    const muzzles = ["No Muzzle", "Muzzle 1", "Muzzle 2", "Muzzle 3", "Muzzle 4", "Muzzle 5", 'Muzzle 6'];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : 'textures/ui/new/muzzle' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            vectoratt(player);
        } else if (response.selection === options.length) {
            vectorattpreview(player);
        }
    });
}

function vectorattscope(player) {
    const form = new ActionFormData();
    form.title("Vector Sight");
    form.button("Iron Sight", "textures/ui/nothing");
    form.button("Coyote", "textures/ui/coyote");
    form.button("Holo 552", "textures/ui/holo");
    form.button('T2', "textures/ui/t2");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync("event entity @s vector:ironsight"); break;
            case 1: player.runCommandAsync("event entity @s vector:coyote"); break;
            case 2: player.runCommandAsync("event entity @s vector:holo"); break;
            case 3: player.runCommandAsync("event entity @s vector:t2"); break;
        }
        vectoratt(player);
    });
}

function vectorattmagazine(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage("You must be holding a Vector to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "magazine");
    const form = new ActionFormData();
    form.title("Vector Magazine");
    form.body("Select an extended magazine range for your Vector (0-3).");
    const mags = ['No Extension', "Extended 1", "Extended 2", "Extended 3"];
    mags.forEach((name, i) => {
        form.button('' + name + (current === i ? " (Selected)" : ''), 'textures/ui/new/magazine' + (i || 'none'));
    });
    form.button('Back', 'textures/ui/blank');
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'magazine': selected });
            vectoratt(player);
        } else if (response.selection === options.length) {
            vectorattpreview(player);
        }
    });
}

function vectoratt(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:vector" && itemId !== "krep:vector_emp")) {
        player.sendMessage("You must be holding an Vector to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("Vector Attachments");
    form.body("Select an attachment type to customize your Vector.");
    form.button("Grip", 'textures/ui/new/grip1');
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Muzzle", "textures/ui/new/muzzle1");
    form.button('Sight', "textures/ui/coyote");
    form.button("Magazine", "textures/ui/new/magazine1");
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: vectorattgrip(player); break;
            case 1: vectorattstock(player); break;
            case 2: vectorattlaser(player); break;
            case 3: vectorattmuzzle(player); break;
            case 4: vectorattscope(player); break;
            case 5: vectorattmagazine(player); break;
            case 6: vectorattpreview(player); break;
            default: break;
        }
    });
}

function deaglegattpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:deagleg" && itemId !== "krep:deagleg_emp")) {
        player.sendMessage("You must be holding an Golden Deagle to use this form!");
        return;
    }
    player.addTag("preview_active");
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button('Finish', 'textures/ui/blank');
    form.show(player).then(response => {
        player.removeTag("preview_active");
        playersInPreview.delete(player.id);
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        if (response.selection === 0) deaglegatt(player);
    });
}

function deaglegattlaser(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:deagleg" && itemId !== "krep:deagleg_emp")) {
        player.sendMessage('You must be holding an Vector to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'laser');
    const form = new ActionFormData();
    form.title("Vector Laser");
    form.body("Select a laser for your Golden Deagle.");
    const lasers = ['No Laser', "Laser 1"];
    lasers.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_laser" : "textures/ui/new/g17/laser" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'laser': selected });
            deaglegatt(player);
        } else if (response.selection === options.length) {
            deaglegattpreview(player);
        }
    });
}

function deaglegattmuzzle(player) {
    const equippable = player.getComponent('minecraft:equippable');
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:deagleg" && itemId !== "krep:deagleg_emp")) {
        player.sendMessage('You must be holding an Golden Deagle to use this form!');
        return;
    }
    const current = getCurrentAttachment(player, itemId, "muzzle");
    const form = new ActionFormData();
    form.title("Golden Deagle Muzzle");
    form.body("Select a muzzle for your Golden Deagle.");
    const muzzles = ["No Muzzle", "Muzzle 1"];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : 'textures/ui/new/deagleg/muzzle' + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button('Preview', "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            deaglegatt(player);
        } else if (response.selection === options.length) {
            deaglegattpreview(player);
        }
    });
}

function deaglegattmagazine(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:deagleg" && itemId !== 'krep:deagleg_emp')) {
        player.sendMessage("You must be holding a Golden Deagle to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "magazine");
    const form = new ActionFormData();
    form.title('Golden Deagle Magazine');
    form.body('Select an extended magazine range for your Golden Deagle (0-3).');
    const mags = ["No Extension", "Extended 1", "Extended 2", "Extended 3"];
    mags.forEach((name, i) => {
        form.button('' + name + (current === i ? " (Selected)" : ''), "textures/ui/new/magazine" + (i || "none"));
    });
    form.button("Back", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'magazine': selected });
            deaglegatt(player);
        } else if (response.selection === options.length) {
            deaglegattpreview(player);
        }
    });
}

function deaglegatt(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:deagleg" && itemId !== "krep:deagleg_emp")) {
        player.sendMessage("You must be holding an Golden Deagle to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("Golden Deagle Attachments");
    form.body("Select an attachment type to customize your Golden Deagle.");
    form.button("Laser", "textures/ui/new/laser1");
    form.button("Muzzle", "textures/ui/new/deagleg/muzzle1");
    form.button('Magazine', "textures/ui/new/magazine1");
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: deaglegattlaser(player); break;
            case 1: deaglegattmuzzle(player); break;
            case 2: deaglegattmagazine(player); break;
            case 3: deaglegattpreview(player); break;
            default: break;
        }
    });
}

function akmattpreview(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment('Mainhand');
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:akm" && itemId !== "krep:akm_emp")) {
        player.sendMessage("You must be holding an Vector to use this form!");
        return;
    }
    player.addTag('preview_active');
    player.runCommandAsync("event entity @s krep:view");
    playersInPreview.add(player.id);
    const form = new ActionFormData();
    form.title("Custom dial");
    form.body("Preview your current attachments or confirm your selection.");
    form.button("Back", "textures/ui/blank");
    form.button("Finish", "textures/ui/blank");
    form.show(player).then(response => {
        player.runCommandAsync("event entity @s krep:noview");
        if (response.canceled) return;
        player.removeTag('preview_active');
        playersInPreview.delete(player.id);
        if (response.selection === 0) akmatt(player);
    });
}

function akmattstock(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:akm" && itemId !== 'krep:akm_emp')) {
        player.sendMessage("You must be holding an Vector to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, "stock");
    const form = new ActionFormData();
    form.title("Vector Stock");
    form.body("Select a stock for your Vector.");
    const stocks = ["No Stock", "Stock 1", "Stock 2", 'Stock 3', 'Stock 4', "Stock 5", "Stock 6", "Stock 7", 'Stock 8', "Stock 9", "Stock 10", "Stock 11"];
    stocks.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_stock" : "textures/ui/new/stock" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'stock': selected });
            akmatt(player);
        } else if (response.selection === options.length) {
            akmattpreview(player);
        }
    });
}

function akmattmuzzle(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:akm" && itemId !== "krep:akm_emp")) {
        player.sendMessage("You must be holding an AKM to use this form!");
        return;
    }
    const current = getCurrentAttachment(player, itemId, 'muzzle');
    const form = new ActionFormData();
    form.title("AKM Muzzle");
    form.body("Select a muzzle for your Vector.");
    const muzzles = ["No Muzzle", "Muzzle 1", "Muzzle 2", "Muzzle 3", "Muzzle 4", "Muzzle 5", "Muzzle 6"];
    muzzles.forEach((name, i) => {
        const texture = i === 0 ? "textures/ui/zero/zero_muzzle" : "textures/ui/new/muzzle" + i;
        form.button('' + name + (current === i ? " (Selected)" : ''), '' + texture);
    });
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        const options = [0, 1, 2, 3, 4, 5, 6];
        if (response.selection < options.length) {
            const selected = options[response.selection];
            setAksesoris(player, itemId, { 'muzzle': selected });
            akmatt(player);
        } else if (response.selection === options.length) {
            akmattpreview(player);
        }
    });
}

function akmattscope(player) {
    const form = new ActionFormData();
    form.title("AKM Sight");
    form.button("Iron Sight", "textures/ui/nothing");
    form.button("Coyote", "textures/ui/coyote");
    form.button('Holo 552', 'textures/ui/holo');
    form.button("OKP-7", "textures/ui/okp7");
    form.button('Acog', "textures/ui/acog");
    form.button("Elcan", "textures/ui/elcan");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: player.runCommandAsync('event entity @s akm:ironsight'); break;
            case 1: player.runCommandAsync("event entity @s akm:coyote"); break;
            case 2: player.runCommandAsync("event entity @s akm:holo"); break;
            case 3: player.runCommandAsync("event entity @s akm:okp7"); break;
            case 4: player.runCommandAsync('event entity @s akm:acog'); break;
            case 5: player.runCommandAsync("event entity @s akm:elcan"); break;
        }
        akmatt(player);
    });
}

function akmatt(player) {
    const equippable = player.getComponent("minecraft:equippable");
    const equipment = equippable.getEquipment("Mainhand");
    const itemId = equipment?.typeId;
    if (!itemId || !isAllowed(itemId) || (itemId !== "krep:akm" && itemId !== "krep:akm_emp")) {
        player.sendMessage("You must be holding an AKM to use this form!");
        return;
    }
    const form = new ActionFormData();
    form.title("AKM Attachments");
    form.body("Select an attachment type to customize your Golden Deagle.");
    form.button("Stock", "textures/ui/new/stock8");
    form.button("Muzzle", "textures/ui/new/muzzle1");
    form.button("Sight", "textures/ui/coyote");
    form.button("Preview", "textures/ui/blank");
    form.show(player).then(response => {
        if (response.canceled) return;
        switch (response.selection) {
            case 0: akmattstock(player); break;
            case 1: akmattmuzzle(player); break;
            case 2: akmattscope(player); break;
            case 3: akmattpreview(player); break;
            default: break;
        }
    });
}

system.runInterval(() => {
    for (let player of world.getPlayers()) {
        if (player.hasTag("batak")) {
            system.run(() => {
                attachmentnew(player);
                player.runCommandAsync('tag @s remove "batak"');
            });
        }
    }
}, 20);

system.runInterval(() => {
    for (let player of world.getPlayers()) {
        if (player.hasTag("preview_active") && !playersInPreview.has(player.id)) {
            player.removeTag("preview_active");
            player.runCommandAsync("event entity @s krep:noview");
        }
    }
}, 20);