import {
  world,
  system,
  ItemStack
} from "@minecraft/server";
import {
  ActionFormData,
  MessageFormData
} from "@minecraft/server-ui";
const AMMO = [{
  id: "mm556",
  name: "5.56x45mm",
  result: {
    typeId: "krep:mm556",
    amount: 60,
    nameTag: "5.56x45mm"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 1
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, ],
}, {
  id: "mm5842",
  name: "5.8x42mm",
  result: {
    typeId: "krep:mm5842",
    amount: 60,
    nameTag: "5.8x42mm"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 1
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, ],
}, {
  id: "fury277",
  name: ".277 Fury",
  result: {
    typeId: "krep:fury277",
    amount: 40,
    nameTag: ".277 Fury"
  },
  requiredExp: 2,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 2
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 1
  }, ],
}, {
  id: "mm5821",
  name: "5.8x21mm",
  result: {
    typeId: "krep:mm5821",
    amount: 80,
    nameTag: "5.8x21mm"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 1
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, ],
}, {
  id: "mm545",
  name: "5.45x39mm",
  result: {
    typeId: "krep:mm545",
    amount: 60,
    nameTag: "5.45x39mm"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 1
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, ],
}, {
  id: "mm9",
  name: "9x19mm",
  result: {
    typeId: "krep:mm9",
    amount: 75,
    nameTag: "9x19mm"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:gunpowder",
    amount: 1
  }, {
    typeId: "minecraft:copper_ingot",
    amount: 1
  }, ],
}, ];
const ATTACHMENT = [{
  id: "eotech",
  name: "Eotech",
  result: {
    typeId: "krep:eotech",
    amount: 1,
    nameTag: "Eotech"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 1
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "compm4",
  name: "CompM4",
  result: {
    typeId: "krep:compm4",
    amount: 1,
    nameTag: "CompM4"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 1
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "sight1p87",
  name: "1P87",
  result: {
    typeId: "krep:sight1p87",
    amount: 1,
    nameTag: "1P87"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 1
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "acog",
  name: "ACOG",
  result: {
    typeId: "krep:acog",
    amount: 1,
    nameTag: "ACOG"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 1
  }, {
    typeId: "minecraft:glass",
    amount: 2
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "m157",
  name: "M157",
  result: {
    typeId: "krep:m157",
    amount: 1,
    nameTag: "M157"
  },
  requiredExp: 10,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 5
  }, {
    typeId: "minecraft:glass",
    amount: 5
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 8
  }, ],
}, {
  id: "anpeq",
  name: "AN/PEQ-15",
  result: {
    typeId: "krep:anpeq",
    amount: 1,
    nameTag: "AN/PEQ-15"
  },
  requiredExp: 10,
  ingredients: [{
    typeId: "minecraft:redstone",
    amount: 5
  }, {
    typeId: "minecraft:glass",
    amount: 5
  }, {
    typeId: "minecraft:iron_ingot",
    amount: 8
  }, ],
}, {
  id: "afg",
  name: "AFG",
  result: {
    typeId: "krep:afg",
    amount: 1,
    nameTag: "AFG"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "kacgrip",
  name: "KAC Grip",
  result: {
    typeId: "krep:kacgrip",
    amount: 1,
    nameTag: "KAC Grip"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "gripod",
  name: "Gripod",
  result: {
    typeId: "krep:gripod",
    amount: 1,
    nameTag: "Gripod"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "stdsup",
  name: "Standard Suppressor",
  result: {
    typeId: "krep:stdsup",
    amount: 1,
    nameTag: "Standard Suppressor"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "ngswsup",
  name: "NGSW Suppressor",
  result: {
    typeId: "krep:ngswsup",
    amount: 1,
    nameTag: "NGSW Suppressor"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, {
  id: "heavysup",
  name: "Heavy Suppressor",
  result: {
    typeId: "krep:heavysup",
    amount: 1,
    nameTag: "Heavy Suppressor"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 3
  }, ],
}, ];
const RECIPES = [{
  id: "ak12",
  name: "AK-12",
  result: {
    typeId: "krep:ak12",
    amount: 1,
    nameTag: "AK-12"
  },
  requiredExp: 7,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 36
  }, {
    typeId: "minecraft:diamond",
    amount: 1
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 3
  }, ],
}, {
  id: "arka",
  name: "FN ARKA",
  result: {
    typeId: "krep:arka",
    amount: 1,
    nameTag: "FN ARKA"
  },
  requiredExp: 15,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 32
  }, {
    typeId: "minecraft:diamond",
    amount: 4
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 5
  }, ],
}, {
  id: "hk416",
  name: "HK416",
  result: {
    typeId: "krep:hk416",
    amount: 1,
    nameTag: "HK416"
  },
  requiredExp: 15,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 32
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 5
  }, ],
}, {
  id: "k2",
  name: "K2",
  result: {
    typeId: "krep:k2",
    amount: 1,
    nameTag: "K2"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 28
  }, {
    typeId: "minecraft:diamond",
    amount: 1
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, ],
}, {
  id: "m8",
  name: "M8 Carbine",
  result: {
    typeId: "krep:m8",
    amount: 1,
    nameTag: "M8 Carbine"
  },
  requiredExp: 30,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 50
  }, {
    typeId: "minecraft:diamond",
    amount: 6
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 10
  }, {
    typeId: "minecraft:gold_ingot",
    amount: 10
  }, ],
}, {
  id: "m7",
  name: "M7",
  result: {
    typeId: "krep:m7",
    amount: 1,
    nameTag: "M7"
  },
  requiredExp: 25,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 64
  }, {
    typeId: "minecraft:diamond",
    amount: 6
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 10
  }, {
    typeId: "minecraft:gold_ingot",
    amount: 10
  }, ],
}, {
  id: "m16a4",
  name: "M16A4",
  result: {
    typeId: "krep:m16a4",
    amount: 1,
    nameTag: "M16A4"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 35
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, {
    typeId: "minecraft:quartz",
    amount: 4
  }, ],
}, {
  id: "type95",
  name: "QBZ-95-1",
  result: {
    typeId: "krep:type95",
    amount: 1,
    nameTag: "QBZ-95-1"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 35
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, ],
}, {
  id: "qbz191",
  name: "QBZ-191",
  result: {
    typeId: "krep:qbz191",
    amount: 1,
    nameTag: "QBZ-191"
  },
  requiredExp: 15,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 40
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 5
  }, {
    typeId: "minecraft:quartz",
    amount: 6
  }, ],
}, {
  id: "qbu191",
  name: "QBU-191",
  result: {
    typeId: "krep:qbu191",
    amount: 1,
    nameTag: "QBU-191"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 40
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 15
  }, {
    typeId: "minecraft:quartz",
    amount: 4
  }, ],
}, {
  id: "qcq171",
  name: "QCQ-171",
  result: {
    typeId: "krep:qcq171",
    amount: 1,
    nameTag: "QCQ-171"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 20
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, {
    typeId: "minecraft:quartz",
    amount: 4
  }, ],
}, {
  id: "qsz92",
  name: "QSZ-92",
  result: {
    typeId: "krep:qsz92",
    amount: 1,
    nameTag: "QSZ-92"
  },
  requiredExp: 1,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 10
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, ],
}, {
  id: "qjb201",
  name: "QJB-201",
  result: {
    typeId: "krep:qjb201",
    amount: 1,
    nameTag: "QJB-201"
  },
  requiredExp: 20,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 72
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 6
  }, {
    typeId: "minecraft:quartz",
    amount: 8
  }, ],
}, {
  id: "qjb95",
  name: "QJB-95",
  result: {
    typeId: "krep:qjb95",
    amount: 1,
    nameTag: "QJB-95"
  },
  requiredExp: 15,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 48
  }, {
    typeId: "minecraft:diamond",
    amount: 2
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 6
  }, {
    typeId: "minecraft:quartz",
    amount: 5
  }, ],
}, {
  id: "type88",
  name: "Type 88",
  result: {
    typeId: "krep:type88",
    amount: 1,
    nameTag: "Type 88"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 16
  }, {
    typeId: "minecraft:gold_ingot",
    amount: 4
  }, ],
}, {
  id: "type882",
  name: "Type 88 Helical Magazine",
  result: {
    typeId: "krep:type882",
    amount: 1,
    nameTag: "Type 88 Helical Magazine"
  },
  requiredExp: 7,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 24
  }, {
    typeId: "minecraft:gold_ingot",
    amount: 4
  }, ],
}, {
  id: "type89",
  name: "Type 89",
  result: {
    typeId: "krep:type89",
    amount: 1,
    nameTag: "Type 89"
  },
  requiredExp: 5,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 30
  }, {
    typeId: "minecraft:diamond",
    amount: 1
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 2
  }, ],
}, {
  id: "t112",
  name: "T112",
  result: {
    typeId: "krep:t112",
    amount: 1,
    nameTag: "T112"
  },
  requiredExp: 20,
  ingredients: [{
    typeId: "minecraft:iron_ingot",
    amount: 40
  }, {
    typeId: "minecraft:diamond",
    amount: 8
  }, {
    typeId: "minecraft:lapis_lazuli",
    amount: 5
  }, {
    typeId: "minecraft:quartz",
    amount: 4
  }, ],
}, ];

function countItem(player, typeId) {
  let total = 0;
  const inv = player.getComponent("inventory")?.container;
  if (!inv) return 0;
  for (let i = 0; i < inv.size; i++) {
    const item = inv.getItem(i);
    if (item && item.typeId === typeId) {
      total += item.amount;
    }
  }
  return total;
}

function removeItems(player, typeId, amount) {
  const inv = player.getComponent("inventory")?.container;
  if (!inv) return false;
  let remaining = amount;
  for (let i = 0; i < inv.size && remaining > 0; i++) {
    const item = inv.getItem(i);
    if (!item || item.typeId !== typeId) continue;
    if (item.amount <= remaining) {
      remaining -= item.amount;
      inv.setItem(i, undefined);
    } else {
      item.amount -= remaining;
      inv.setItem(i, item);
      remaining = 0;
    }
  }
  return remaining === 0;
}

function giveItem(player, recipe) {
  const item = new ItemStack(recipe.result.typeId, recipe.result.amount);
  const inv = player.getComponent("inventory")?.container;
  if (inv) {
    inv.addItem(item);
  } else {
    player.dimension.spawnItem(item, player.location);
  }
}

function canCraft(player, recipe) {
  if (player.level < recipe.requiredExp) {
    return false;
  }
  for (const ing of recipe.ingredients) {
    if (countItem(player, ing.typeId) < ing.amount) {
      return false;
    }
  }
  return true;
}

function buildRequirementsText(player, recipe) {
  const lines = [];
  const lvlOk = player.level >= recipe.requiredExp;
  lines.push(`§7XP Level: §${lvlOk ? "a" : "c"}${player.level}§7/§f${recipe.requiredExp}`);
  lines.push("§8");
  for (const ing of recipe.ingredients) {
    const have = countItem(player, ing.typeId);
    const ok = have >= ing.amount;
    const name = ing.typeId.replace("minecraft:", "").replace(/_/g, " ");
    lines.push(`§7${name}: §${ok ? "a" : "c"}${have}§7/§f${ing.amount}`);
  }
  return lines.join("\n");
}
async function showCraftDetail(player, recipe, backMenu) {
  const possible = canCraft(player, recipe);
  const form = new MessageFormData().title(`Craft: ${recipe.name}`).body(buildRequirementsText(player, recipe) + `\n\n${possible ? "§aReady to craft." : "§cRequirements not met."}`).button1(possible ? {
    translate: "menu.krep.craft"
  } : {
    translate: "menu.krep.back"
  }).button2({
    translate: "menu.krep.close"
  });
  const res = await form.show(player);
  if (res.canceled || res.selection === 1) {
    backMenu(player);
    return;
  }
  if (!possible) {
    backMenu(player);
    return;
  }
  for (const ing of recipe.ingredients) {
    removeItems(player, ing.typeId, ing.amount);
  }
  player.addLevels(-recipe.requiredExp);
  giveItem(player, recipe);
  player.sendMessage(`§aCrafted §f${recipe.result.nameTag}`);
  player.playSound("random.levelup");
  backMenu(player);
}
async function showWeaponCraftMenu(player) {
  const form = new ActionFormData().title({
    translate: "menu.krep.weapon_crafting"
  }).body({
    translate: "menu.krep.select_weapon"
  });
  for (const recipe of RECIPES) {
    const ok = canCraft(player, recipe);
    form.button(`${ok ? "[✔]" : "[✘]"} ${recipe.name}`, `textures/items/${recipe.id}`);
  }
  form.button({
    translate: "menu.krep.back"
  }, "textures/ui/cancel");
  const res = await form.show(player);
  if (res.canceled) return;
  if (res.selection === RECIPES.length) {
    showMainCraftMenu(player);
    return;
  }
  showCraftDetail(player, RECIPES[res.selection], showWeaponCraftMenu);
}
async function showAmmoCraftMenu(player) {
  const form = new ActionFormData().title({
    translate: "menu.krep.ammo_crafting"
  }).body({
    translate: "menu.krep.select_ammo"
  });
  for (const ammo of AMMO) {
    const ok = canCraft(player, ammo);
    form.button(`${ok ? "[✔]" : "[✘]"} ${ammo.name}`, `textures/items/ammo/${ammo.id}`);
  }
  form.button({
    translate: "menu.krep.back"
  }, "textures/ui/cancel");
  const res = await form.show(player);
  if (res.canceled) return;
  if (res.selection === AMMO.length) {
    showMainCraftMenu(player);
    return;
  }
  showCraftDetail(player, AMMO[res.selection], showAmmoCraftMenu);
}
async function showAttachmentCraftMenu(player) {
  const form = new ActionFormData().title({
    translate: "menu.krep.attachment_crafting"
  }).body({
    translate: "menu.krep.select_attachment"
  });
  for (const attachment of ATTACHMENT) {
    const ok = canCraft(player, attachment);
    form.button(`${ok ? "[✔]" : "[✘]"} ${attachment.name}`, `textures/ui/${attachment.id}`);
  }
  form.button({
    translate: "menu.krep.back"
  }, "textures/ui/cancel");
  const res = await form.show(player);
  if (res.canceled) return;
  if (res.selection === ATTACHMENT.length) {
    showMainCraftMenu(player);
    return;
  }
  showCraftDetail(player, ATTACHMENT[res.selection], showAttachmentCraftMenu);
}
async function showMainCraftMenu(player) {
  const form = new ActionFormData().title({
    translate: "menu.krep.crafting_station"
  }).body({
    translate: "menu.krep.choose_category"
  });
  form.button({
    translate: "menu.krep.weapon_crafting"
  }, "textures/items/ak12");
  form.button({
    translate: "menu.krep.ammo_crafting"
  }, "textures/items/ammo/mm556");
  form.button({
    translate: "menu.krep.attachment_crafting"
  }, "textures/ui/m157");
  form.button({
    translate: "menu.krep.getconfig"
  }, "textures/ui/gear");
  form.button({
    translate: "menu.krep.close"
  }, "textures/ui/cancel");
  const res = await form.show(player);
  if (res.canceled || res.selection === 4) {
    return;
  }
  switch (res.selection) {
    case 0:
      showWeaponCraftMenu(player);
      break;
    case 1:
      showAmmoCraftMenu(player);
      break;
    case 2:
      showAttachmentCraftMenu(player);
      break;
    case 3:
      player.runCommand("give @s[hasitem={item=krep:config,quantity=0}] krep:config");
      break;
  }
}
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const {
    player,
    block
  } = event;
  if (block.typeId !== "krep:craftingdesk") return;
  system.run(() => {
    player.addTag("h");
  });
});
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (!player.hasTag("h")) continue;
    player.removeTag("h");
    system.run(() => {
      showMainCraftMenu(player);
    });
  }
}, 20);