import {
  system,
  world
} from "@minecraft/server";
import {
  PlayerDataManager
} from "./Core/index.js";
system.run(() => PlayerDataManager.initialize());
import {
  initializeGlobalConfig,
  isAdmin
} from "./Config/GlobalConfig.js";
let firstPlayerJoined = !1;
import {
  updateExistingUIConfig
} from "./Config/ConfigUI.js";
import {
  initializeComplianceSystem
} from "./Compliance/index.js";
import "./Utils/EventUtils.js";
import "./Utils/CommandHandler.js";
import "./Utils/NametagSystem.js";
import "./Plugins/Ranks.js";
import "./Plugins/ChatIntegration.js";
import "./Plugins/WarpsV2.js";
import "./Plugins/TpaV2.js";
import "./Plugins/HomesV2.js";
import "./Plugins/Jobs.js";
import "./Plugins/AntyCombatLog.js";
import "./Plugins/AntyCombatLogDebug.js";
import "./Plugins/SafeZones/SafeZonesSystem.js";
import "./Plugins/SafeZones/SafeZonesCommands.js";
import "./Plugins/AreaDelimitation/AreaDelimitationSystem.js";
import {
  AreaDelimitationSystem
} from "./Plugins/AreaDelimitation/AreaDelimitationSystem.js";
import "./Plugins/Clans&Teams.js";
import "./Plugins/UserProfileSystem/index.js";
import {
  initializeNpcShopsSystem
} from "./Plugins/NpcShops/NpcShopsSystem.js";
import "./Plugins/PlayerMarketSystem/PlayerMarketSystem.js";
import {
  initializeBankSystem
} from "./Plugins/BankSystem/BankSystem.js";
import {
  initializeCrateSystem
} from "./Plugins/Crates/CrateSystem.js";
import { floatingTextSystem } from "./Plugins/FloatingText/FloatingTextSystem.js";
import "./Plugins/InventoryViewer/InventoryViewerInit.js";
import "./Plugins/ItemSidebar.js";
import "./Plugins/RankCommands.js";
import "./Plugins/CustomNames.js";
import "./Plugins/CustomCommands.js";
import "./Plugins/HelpCommand.js";
import "./Plugins/ResetPlayerCommand.js";
import "./Plugins/ResetSidebarCommand.js";
import "./Plugins/AllCommands.js";
import "./Plugins/GameModeSystem.js";
import "./Plugins/DailyMissions.js";
import "./Plugins/TutorialMissions.js";
import "./Plugins/WelcomeScreen.js";
import "./Plugins/NewPlayerTest.js";
import "./Plugins/DailyRewards.js";
import "./Plugins/PetroEventSystem.js";
import "./Plugins/MusicSystem.js";
import "./Plugins/EmoteSystem.js";
import "./Plugins/CosmeticsSystem.js";
import "./Plugins/TzShopSystem.js";
/*import "./Plugins/TradeZoneProtection.js";*/
import "./Plugins/TradeZoneProtection.js";
import "./Plugins/WaypointExtraccion.js";
import "./Plugins/DeadZonePlaceholders.js";
import "./Plugins/Downed.js";
import "./Plugins/HealingSounds.js";
import "./Plugins/ExtractionMachine.js";
import "./Server/UserUI.js"; // kills/deaths y scoreboards son manejados por Core/PlayerDataManager
// import "./Plugins/GameModeSystem.js";
import "./Plugins/ClearLag.js";
import "./Plugins/ProteccionBlocks.js";
import "./Plugins/BlockVehicle.js";
import "./Plugins/VehicleRepair.js";
import "./Plugins/ZombieLootFix.js";
export {
  registerKillListener
}
from "./Plugins/KillsDetectionSystem.js";
initializeGlobalConfig(), system.runTimeout(() => {
  updateExistingUIConfig().catch(t => {})
}, 20), initializeComplianceSystem(), system.runTimeout(() => {
  AreaDelimitationSystem.getInstance().initialize()
}, 40), system.runTimeout(() => {
  try {
    initializeNpcShopsSystem()
  } catch (t) {}
}, 60), system.runTimeout(() => {
  try {
    initializeBankSystem()
  } catch (t) {}
}, 60), system.runTimeout(() => {
  try {
    initializeCrateSystem()
  } catch (t) {}
}, 80), system.runTimeout(() => {
  try { floatingTextSystem.initialize(); } catch (t) {}
}, 100),
world.afterEvents.playerSpawn.subscribe(t => {
  const e = t.player;
  if (!firstPlayerJoined) {
    firstPlayerJoined = !0
  }
});