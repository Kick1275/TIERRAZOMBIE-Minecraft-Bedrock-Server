import "./functionality/index.js";

import "./main/advancements.js";
import "./main/test.js";
import "./main/core_system.js";
// import "./main/backpack.js"; // Desactivado — no se usa
import "./main/item.js";
// import "./main/bullet.js";  // Desactivado — armas manejadas por TACZBE
import "./main/main-menu.js";
import "./main/stats.js";
import "./main/CustomComponent/blocks.js";
import "./main/CustomComponent/vm_test.js";
import "./main/CustomComponent/items.js";
import "./main/CustomComponent/unbreakable.js";
// import "./main/skins.js";      // Migrado a Actions&stuff BP
// import "./main/cosmeticos.js"; // Migrado a Actions&stuff BP
// import "./main/guns.js";       // Desactivado — armas manejadas por TACZBE
import "./main/vector.js";
import "./main/lore.js";
import "./config.js";
import "./main/CustomComponent/items/healing.js";
import "./main/CustomComponent/items/first_aid.js";
import "./main/CustomComponent/items/medical.js";
import "./main/CustomComponent/items/can_hand.js";
import "./main/refill_water.js";
import "./main/CustomComponent/chair.js";
// downed.js y extraction_machine.js movidos a PlugsEssen


import "./TZ/scripts/Entidades/P.js"
import "./TZ/scripts/Entidades/Creates.js"
import "./TZ/scripts/Entidades/Npc_Bartender.js"
//import "./TZ/scripts/Entidades/Npc_Guardia1.js"
import "./TZ/scripts/Entidades/Npc_Guardia1.js"
import "./TZ/scripts/Entidades/Npc_Ingeniero.js"
import "./TZ/scripts/Entidades/Npc_Medico.js"
import "./TZ/scripts/Entidades/Npc_Sastre.js"
import "./TZ/scripts/Entidades/Npc_Scraper.js"
import "./TZ/scripts/Entidades/Npc_TzShop.js"
import "./TZ/scripts/Entidades/Npc_Vault.js"
import "./TZ/scripts/Entidades/Npc_Raid.js"

/*
import "./TZ/scripts/UI/Emotes.js"
import "./TZ/scripts/UI/RadioDeMusica.js"
import "./TZ/scripts/UI/RadioDeVoz.js"
import "./TZ/scripts/UI/UiGeneral.js"
import "./TZ/scripts/UI/Vacaciones.js"
import "./TZ/scripts/UI/LobyUi.js"

import "./TZ/scripts/Plugs/AdminPlugs/BPass.js"
import "./TZ/scripts/Plugs/Event_MiniDrop.js"
import "./TZ/scripts/Plugs/Clans.js"
import "./TZ/scripts/Plugs/DR.js"
import "./TZ/scripts/Plugs/EffectShop.js"
*/

import { system, world } from "@minecraft/server";
import { tick } from "./main/flashbang.js";

// flashbang tick() ya recorre a todos los jugadores internamente; llamarlo una sola vez
// por tick (antes se llamaba una vez POR jugador, causando raycasts redundantes O(N²)).
system.runInterval(() => {
    tick();
}, 1);