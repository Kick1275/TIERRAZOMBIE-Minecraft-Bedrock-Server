import {
	world,
	system
} from "@minecraft/server";
import {
	ActionFormData,
	ModalFormData
} from "@minecraft/server-ui";
import {
	startMusic,
	stopMusic
} from "../Plugins/MusicSystem.js";
import { showEmoteUI, showEmoteAdminPanel } from "../Plugins/EmoteSystem.js";
import { showMyCosmeticsUI, showCosmeticsShop } from "../Plugins/CosmeticsSystem.js";
import {
	openUserWarpUI
} from "../Plugins/WarpsV2.js";
import {
	openUserTPAUI
} from "../Plugins/TpaV2.js";
import {
	ItemStack
} from "@minecraft/server";
import {
	openAdminPanel
} from "./AdminUI.js";
import {
	openUserHomesUI
} from "../Plugins/HomesV2.js";
import {
	openUserJobsUI
} from "../Plugins/Jobs.js";
import {
	showUserRanksUI
} from "../Plugins/Ranks.js";
import {
	showClansMainUI
} from "../Plugins/Clans&Teams.js";
import {
	showProfileMainUI
} from "../Plugins/UserProfileSystem/UI/ProfileUI.js";
import {
	openUserBankUI
} from "../Plugins/BankSystem/BankSystem.js";
import {
	openPlayerMarketUI
} from "../Plugins/PlayerMarketSystem/MarketUI.js";
import {
	getGlobalConfig,
	getUserUIConfig,
	isModuleEnabled,
	isAdmin
} from "../Config/GlobalConfig.js";
import {
	getPlayerLanguage,
	getText,
	TRANSLATIONS
} from "../Utils/Translations.js";
import {
	showMissionsUI,
	showMissionsAdminPanel,
	trackMenuOpen
} from "../Plugins/DailyMissions.js";
import {
	showDailyRewardsUI
} from "../Plugins/DailyRewards.js";

function getUserUIText(e, t, n = {}) {
	let s = getText(e, `userUI.${t}`);
	for (const [e, t] of Object.entries(n)) s = s.replace(new RegExp(`\\{${e}\\}`, "g"), t);
	return s
}

function getPrefix() {
	return getGlobalConfig().prefix
}

function getPlayerSettings(e) {
	const t = e.getDynamicProperty("playerSettings");
	return t ? JSON.parse(t) : {
		language: "es",
		notifications: !0,
		darkTheme: !1
	}
}

function savePlayerSettings(e, t) {
	e.setDynamicProperty("playerSettings", JSON.stringify(t))
}
const buttonActions = {
	warps: e => openUserWarpUI(e),
	tpa: e => openUserTPAUI(e),
	homes: e => openUserHomesUI(e),
	ranks: e => showUserRanksUI(e),
	clans: e => openUserClansUI(e),
	userProfile: e => showProfileMainUI(e),
	playerMarket: e => openPlayerMarketUI(e),
	bank: e => openUserBankUI(e),
	jobs: e => openUserJobsUI(e),
	settings: e => showSettings(e),
	credits: e => showCredits(e),
	openWarps: e => openUserWarpUI(e),
	openTpa: e => openUserTPAUI(e),
	openHomes: e => openUserHomesUI(e),
	openRanks: e => showUserRanksUI(e),
	openClans: e => openUserClansUI(e),
	openStats: e => showStats(e),
	openJobs: e => openUserJobsUI(e),
	openSettings: e => showSettings(e),
	missions: e => showMissionsUI(e),
	custom: null
};
async function executeButtonCommands(e, t) {
	const n = getPlayerLanguage(e);
	if (t && 0 !== t.length)
		for (const s of t) {
			if (!s || "string" != typeof s) continue;
			const t = s.split(",");
			for (const s of t) {
				const t = s.trim();
				if (!t) continue;
				const r = t.match(/^delay=(\d+)s?$/i);
				if (r) {
					const e = parseInt(r[1]);
					await new Promise(t => {
						system.runTimeout(() => t(), 20 * e)
					});
					continue
				}
				let o = t.replace(/{player}/g, e.name).replace(/{x}/g, String(Math.floor(e.location.x))).replace(/{y}/g, String(Math.floor(e.location.y))).replace(/{z}/g, String(Math.floor(e.location.z)));
				try {
					system.run(() => {
						try {
							e.runCommand(o)
						} catch (t) {
							try {
								e.dimension.runCommand(o)
							} catch (e) {}
						}
					})
				} catch (t) {
					e.sendMessage(getUserUIText(n, "commandExecutionError", {
						cmd: o
					}))
				}
			}
		}
}
export function openMainUI(e) {
	const t = getPlayerLanguage(e),
		n = getUserUIConfig(),
		s = (new ActionFormData).title(n.title || getUserUIText(t, "mainTitle")).body(n.body || getUserUIText(t, "mainSubtitle")),
		r = (n.buttons || []).filter(t => {
			if (!t.enabled) return !1;
			if (t.adminOnly && !isAdmin(e)) return !1;
			if (t.requiresTag && !e.hasTag(t.requiresTag)) return !1;
			const n = {
				warps: "warps",
				tpa: "tpa",
				homes: "homes",
				ranks: "ranks",
				clans: "clans",
				stats: null,
				jobs: "jobs",
				settings: null,
				credits: null,
				rules: null,
				userProfile: "userProfile",
				playerMarket: "playerMarket",
				bank: "bank"
			}[t.id];
			return !(n && !isModuleEnabled(n))
		});
	// Orden: G1(warps,tpa,homes) → Misiones,Recompensas Diarias,Emotes,Cosméticos → G2(ranks,clans,stats,jobs,rules,userProfile,playerMarket,bank) → Música → G3(settings,credits) → Admin
	const G1 = ["warps","tpa","homes"];
	const G2 = ["ranks","clans","stats","jobs","rules","userProfile","playerMarket","bank"];
	const G3 = ["settings","credits"];
	const ALL_KNOWN = [...G1,...G2,...G3];

	const rg1 = r.filter(b => G1.includes(b.id));
	const rg2 = r.filter(b => G2.includes(b.id));
	const rg3 = r.filter(b => G3.includes(b.id));
	const rgX = r.filter(b => !ALL_KNOWN.includes(b.id)); // cualquier otro botón config desconocido

	// Añadir botones al form en orden correcto
	rg1.forEach(b => s.button(`${b.title}\n${b.description}`, b.icon));
	s.button("§e§l§´ Misiones\n§r§7Diarias y Semanales",                  "textures/ui/icon_book_writable.png");
	s.button("§b§l§´ Recompensas Diarias\n§r§7Reclama tu premio del día",  "textures/items/gold_ingot");
	s.button("§d§l§´ Emotes\n§r§7Ejecuta emotes y compra nuevos",          "textures/ui/icon_multiplayer");
	s.button("§5§l§´ Cosméticos\n§r§7Ver y equipar tus cosméticos",        "textures/ui/MashupIcon");
	rg2.forEach(b => s.button(`${b.title}\n${b.description}`, b.icon));
	s.button("§6§l§´ Música\n§r§7Controla la música del servidor",         "textures/ui/sound_glyph_color_2x");
	rg3.forEach(b => s.button(`${b.title}\n${b.description}`, b.icon));
	rgX.forEach(b => s.button(`${b.title}\n${b.description}`, b.icon));
	let o = -1;
	const totalBeforeAdmin = rg1.length + 4 + rg2.length + 1 + rg3.length + rgX.length;
	isAdmin(e) && (s.button(getUserUIText(t, "adminButton"), "textures/ui/permissions_op_crown"), o = totalBeforeAdmin);

	// Calcular índices de botones fijos
	const missionsIdx     = rg1.length;
	const dailyRewardsIdx = rg1.length + 1;
	const emoteIdx        = rg1.length + 2;
	const cosmeticIdx     = rg1.length + 3;
	const musicIdx        = rg1.length + 4 + rg2.length;

	// Construir mapa selección→botón para botones configurables
	const cfgMap = new Map(); // índice → botón
	let ci = 0;
	rg1.forEach(b => cfgMap.set(ci++, b));
	ci += 4; // Misiones, Recompensas Diarias, Emotes, Cosméticos
	rg2.forEach(b => cfgMap.set(ci++, b));
	ci += 1; // Música
	rg3.forEach(b => cfgMap.set(ci++, b));
	rgX.forEach(b => cfgMap.set(ci++, b));

	s.show(e).then(async n => {
		if (!n.canceled) {
			const sel = n.selection;
			if (sel === missionsIdx)     { showMissionsUI(e); return; }
			if (sel === dailyRewardsIdx) { showDailyRewardsUI(e); return; }
			if (sel === emoteIdx)        { showEmoteUI(e); return; }
			if (sel === cosmeticIdx)     { showMyCosmeticsUI(e); return; }
			if (sel === musicIdx)        { showMusicUI(e); return; }
			if (sel === o && isAdmin(e)) { openAdminPanel(e); return; }
			const b = cfgMap.get(sel);
			if (b) {
				const act = buttonActions[b.action] || buttonActions[b.id];
				if (act && typeof act === "function") try { act(e); } catch { e.sendMessage(getPrefix() + getUserUIText(t, "errorExecutingAction")); }
				else if (b.commands?.length > 0) await executeButtonCommands(e, b.commands);
				else e.sendMessage(getPrefix() + getUserUIText(t, "buttonNoActions", { title: b.title.replace(/§./g, "") }));
			}
		}
	})
}

function showStats(e) {
	const t = getPlayerLanguage(e);
	(new ActionFormData).title(getUserUIText(t, "statsTitle")).body(`${getUserUIText(t,"statsBody")}\n\n§7${getUserUIText(t,"statsPlayer")}: §e${e.name}\n§7${getUserUIText(t,"statsLevel")}: §e${e.level||0}\n§7${getUserUIText(t,"statsPosition")}: §e${Math.floor(e.location.x)}, ${Math.floor(e.location.y)}, ${Math.floor(e.location.z)}`).button(getUserUIText(t, "backButton"), "textures/ui/arrow_left").show(e).then(() => openMainUI(e))
}

function showMusicUI(e) {
	const loopOn = !e.hasTag("music:disabled");
	let vol = 1.0;
	try { const v = e.getDynamicProperty("music:volume"); if (typeof v === "number") vol = v; } catch {}
	(new ActionFormData).title("§6§l🎵 Música")
		.body(`§7Loop: ${loopOn ? "§aActivado" : "§cDesactivado"}  §7Vol: §e${Math.round(vol * 100)}`)
		.button("§a▶ Reproducir Canción Aleatoria")
		.button("§c⏹ Detener Música")
		.button("§e⚙ Configurar Loop y Volumen")
		.button("§8Volver")
		.show(e).then(async res => {
			if (res.canceled) return openMainUI(e);
			if (res.selection === 0) {
				try { startMusic(e); e.sendMessage("§a▶ Reproduciendo canción aleatoria..."); } catch {}
				openMainUI(e);
			} else if (res.selection === 1) {
				try { stopMusic(e); e.sendMessage("§c⏹ Música detenida."); } catch {}
				openMainUI(e);
			} else if (res.selection === 2) {
				const r = await new ModalFormData()
					.title("§6§l⚙ Configurar Música")
					.toggle("§l§e✦ Loop de Música ✦\n§l§7✦ Reproducir automáticamente ✦", { defaultValue: loopOn })
					.slider("§l§e✦ 🔊 Volumen ✦ §r§7(0 - 100)", 0, 100, { defaultValue: Math.round(vol * 100), valueStep: 1 })
					.show(e);
				if (!r.canceled) {
					const newLoop = r.formValues[0];
					const newVol  = r.formValues[1] / 100;
					try { e.setDynamicProperty("music:volume", newVol); } catch {}
					if (newLoop) {
						if (e.hasTag("music:disabled")) e.removeTag("music:disabled");
						startMusic(e);
						e.sendMessage(`§a✓ Loop activado — Vol: §e${Math.round(newVol * 100)}`);
					} else {
						if (!e.hasTag("music:disabled")) e.addTag("music:disabled");
						stopMusic(e);
						e.sendMessage("§c✗ Loop desactivado.");
					}
				}
				showMusicUI(e);
			} else {
				openMainUI(e);
			}
		});
}

function showSettings(e) {
	try {
		const t = getPlayerLanguage(e),
			n = getPlayerSettings(e);
		let s = !1;
		try {
			const t = e.getDynamicProperty("ups:interaction_enabled");
			s = "true" === t
		} catch (e) {
			s = !1
		}
		const r = new ModalFormData;
		r.title(getUserUIText(t, "settingsTitle")), r.dropdown(getUserUIText(t, "languageLabel"), ["Español", "English"], {
			defaultValueIndex: "en" === n.language ? 1 : 0
		}), r.toggle("§l§e✦ Interacción con Click Derecho ✦\n§l§7✦ Habilitar/Deshabilitar UI al hacer click derecho en jugadores ✦", {
			defaultValue: s
		}), r.show(e).then(s => {
			if (s.canceled) return void openMainUI(e);
			try {
				const r = 0 === s.formValues[0] ? "es" : "en",
					o = s.formValues[1];
				savePlayerSettings(e, {
					language: r,
					notifications: n.notifications,
					darkTheme: n.darkTheme
				});
				try {
					e.setDynamicProperty("ups:interaction_enabled", o ? "true" : "false")
				} catch (e) {}
				e.sendMessage(getPrefix() + getUserUIText(t, "settingsSaved")), openMainUI(e)
			} catch (n) {
				e.sendMessage(getPrefix() + "§cError al guardar configuración"), openMainUI(e)
			}
		})
	} catch (t) {
		e.sendMessage(getPrefix() + "§cError al abrir ajustes: " + t.message), openMainUI(e)
	}
}

function showCredits(e) {
	const t = getPlayerLanguage(e);
	(new ActionFormData).title(getUserUIText(t, "creditsTitle")).body(`§l§7✦ ${getUserUIText(t,"creditsPhase")} ✦\n\n${getUserUIText(t,"creditsDeveloper")}\n§r${getUserUIText(t,"creditsName")}\n${getUserUIText(t,"creditsYoutube")}\n\n§r§l§7--------------------------\n${getUserUIText(t,"creditsPremiumTitle")}\n§r§7--------------------------\n§r§7${getUserUIText(t,"creditsWantMore")}\n\n§r${getUserUIText(t,"creditsBuyPremium")}\n§r§f   ${getUserUIText(t,"creditsWebsite")}\n\n§r${getUserUIText(t,"creditsDiscord")}\n§r§f   ${getUserUIText(t,"creditsDiscordLink")}\n\n§r${getUserUIText(t,"creditsWhatsApp")}\n§r§f   ${getUserUIText(t,"creditsWhatsAppLink")}\n\n§r${getUserUIText(t,"creditsContactDiscord")}\n§r§f   ${getUserUIText(t,"creditsDiscordUser")}\n\n${getUserUIText(t,"creditsExclusiveFeatures")}\n${getUserUIText(t,"creditsFeature1")}\n${getUserUIText(t,"creditsFeature2")}\n${getUserUIText(t,"creditsFeature3")}\n${getUserUIText(t,"creditsFeature4")}\n${getUserUIText(t,"creditsFeature5")}\n\n§7------------------\n\n${getUserUIText(t,"creditsAboutMod")}\n${getUserUIText(t,"creditsAboutDesc")}\n${getUserUIText(t,"creditsModFeature1")}\n${getUserUIText(t,"creditsModFeature2")}\n${getUserUIText(t,"creditsModFeature3")}\n${getUserUIText(t,"creditsModFeature4")}\n${getUserUIText(t,"creditsModFeature5")}\n${getUserUIText(t,"creditsModFeature6")}\n${getUserUIText(t,"creditsModFeature7")}\n\n${getUserUIText(t,"creditsVersion")}\n${getUserUIText(t,"creditsPluginVersion")}\n${getUserUIText(t,"creditsMinecraftVersion")}\n\n§7---------------------\n${getUserUIText(t,"creditsThanks")}`).button(getUserUIText(t, "backButton"), "textures/ui/arrow_left").show(e).then(() => openMainUI(e))
}
async function openUserClansUI(e) {
	const t = getPlayerLanguage(e);
	try {
		await showClansMainUI(e)
	} catch (s) {
		e.sendMessage(getPrefix() + getUserUIText(t, "clansMenuError"))
	}
}
world.beforeEvents.itemUse.subscribe(e => {
	try {
		const t = e.source;
		isMenuBook(e.itemStack) && (e.cancel = !0, system.run(() => {
			try {
				trackMenuOpen(t)
			} catch {}
			openMainUI(t)
		}))
	} catch (e) {}
}), world.afterEvents.playerSpawn.subscribe(e => {
	try {
		const t = e.player;
		system.runTimeout(() => {
			giveMenuBook(t)
		}, 40)
	} catch (e) {}
}), world.afterEvents.entityDie.subscribe(e => {
	try {
		const t = e.deadEntity;
		if ("minecraft:player" === t.typeId) {
			if (getUserUIConfig().menuItem.keepOnDeath) {
				const e = () => {
					try {
						const e = world.getAllPlayers().find(e => e.name === t.name);
						e && system.runTimeout(() => {
							giveMenuBook(e)
						}, 20)
					} catch (e) {}
				};
				system.runTimeout(e, 60)
			}
		}
	} catch (e) {}
});
const MENU_ITEM_IDENTIFIER = "§0§rmenu";

function isMenuBook(e) {
	if (!e) return !1;
	try {
		const t = e.getLore();
		return !!(t && t.length > 0) && t[t.length - 1] === MENU_ITEM_IDENTIFIER
	} catch (e) {
		return !1
	}
}

function clearOldMenuItems(e) {
	try {
		const t = e.getComponent("inventory").container;
		let n = 0;
		for (let e = 0; e < t.size; e++) {
			isMenuBook(t.getItem(e)) && (t.setItem(e, void 0), n++)
		}
	} catch (e) {}
}
export function giveMenuBook(e) {
	try {
		const t = getUserUIConfig().menuItem,
			n = getGlobalConfig();
		clearOldMenuItems(e);
		const s = Math.max(0, Math.min(8, t.slot ?? 8)),
			r = t.itemId || "minecraft:book";
		let o;
		o = n.itemSidebar && n.itemSidebar.enabled ? "§7Cargando..." : t.name || "§f§lPlugs§e§lEssentials §r§7UI";
		const a = t.lore && Array.isArray(t.lore) ? [...t.lore] : ["§7Click derecho para abrir", "§7el menú del servidor"];
		a.push(MENU_ITEM_IDENTIFIER);
		if (t.keepOnDeath || t.lockInSlot) try {
			let i = {};
			t.keepOnDeath && (i.keep_on_death = {}), t.lockInSlot && (i.item_lock = {
				mode: "lock_in_slot"
			});
			const l = JSON.stringify(i),
				g = `replaceitem entity "${e.name}" slot.hotbar ${s} ${r} 1 0 ${l}`;
			e.runCommand(g), system.runTimeout(() => {
				try {
					const t = e.getComponent("inventory").container,
						r = t.getItem(s);
					r && (r.nameTag = o, r.setLore(a), t.setItem(s, r), n.itemSidebar && n.itemSidebar.enabled && system.runTimeout(() => {
						try {
							e.getComponent("inventory").container.getItem(s)
						} catch (e) {}
					}, 10))
				} catch (e) {}
			}, 5)
		} catch (t) {
			giveMenuBookFallback(e, s, r, o, a, n)
		} else giveMenuBookFallback(e, s, r, o, a, n);
		const i = getUserUIText(getPlayerLanguage(e), "menuItemReceived");
		e.sendMessage(getPrefix() + i)
	} catch (t) {
		const n = getPlayerLanguage(e);
		e.sendMessage(getPrefix() + getUserUIText(n, "menuItemGiveError"))
	}
}

function giveMenuBookFallback(e, t, n, s, r, o) {
	try {
		const a = new ItemStack(n, 1);
		a.nameTag = s, a.setLore(r);
		const i = e.getComponent("inventory").container,
			l = i.getItem(t);
		if (l && !isMenuBook(l)) {
			let e = !1;
			for (let t = 0; t <= 8; t++) {
				if (!i.getItem(t)) {
					i.setItem(t, a), e = !0;
					break
				}
			}
			e || i.addItem(a)
		} else i.setItem(t, a);
		o && o.itemSidebar && o.itemSidebar.enabled && system.runTimeout(() => {}, 10)
	} catch (e) {}
}
let manualLockInterval = null;

function startManualLockSystem() {
	manualLockInterval || (manualLockInterval = system.runInterval(() => {
		try {
			if (!getUserUIConfig().menuItem.lockInSlot) return void stopManualLockSystem();
			for (const e of world.getAllPlayers()) checkAndFixMenuItemPosition(e)
		} catch (e) {}
	}, 100))
}

function stopManualLockSystem() {
	manualLockInterval && (system.clearRun(manualLockInterval), manualLockInterval = null)
}

function checkAndFixMenuItemPosition(e) {
	try {
		const t = getUserUIConfig().menuItem;
		if (!t.lockInSlot) return;
		const n = e.getComponent("inventory").container,
			s = Math.max(0, Math.min(8, t.slot ?? 8)),
			r = n.getItem(s);
		if (!r || !isMenuBook(r)) {
			let t = -1;
			for (let e = 0; e < n.size; e++) {
				if (isMenuBook(n.getItem(e))) {
					t = e;
					break
				}
			}
			if (-1 !== t && t !== s) {
				const r = n.getItem(t),
					o = n.getItem(s);
				n.setItem(t, o), n.setItem(s, r);
				const a = getUserUIText(getPlayerLanguage(e), "menuItemRelocated");
				e.sendMessage(getPrefix() + a)
			} else -1 === t && giveMenuBook(e)
		}
	} catch (e) {}
}
export function updateMenuItemForAllPlayers() {
	try {
		for (const e of world.getAllPlayers()) system.run(() => {
			giveMenuBook(e)
		})
	} catch (e) {}
}
const playersAwaitingRespawn = new Map;

function checkPlayerHasMenuItem(e) {
	try {
		const t = e.getComponent("inventory").container;
		for (let e = 0; e < t.size; e++) {
			if (isMenuBook(t.getItem(e))) return !0
		}
		return !1
	} catch (e) {
		return !1
	}
}
world.afterEvents.entityDie.subscribe(e => {
	try {
		const t = e.deadEntity;
		if ("minecraft:player" === t.typeId) {
			getUserUIConfig().menuItem.keepOnDeath && playersAwaitingRespawn.set(t.name, {
				timestamp: Date.now(),
				attempts: 0
			})
		}
	} catch (e) {}
}), system.runInterval(() => {
	try {
		if (0 === playersAwaitingRespawn.size) return;
		const e = Date.now(),
			t = [];
		for (const [n, s] of playersAwaitingRespawn.entries()) {
			const r = world.getAllPlayers().find(e => e.name === n);
			if (r) {
				checkPlayerHasMenuItem(r) || system.runTimeout(() => {
					giveMenuBook(r)
				}, 20), t.push(n)
			} else e - s.timestamp > 3e4 && t.push(n)
		}
		t.forEach(e => playersAwaitingRespawn.delete(e))
	} catch (e) {}
}, 60), world.beforeEvents.chatSend.subscribe(e => {
	const t = e.sender,
		n = e.message;
	"!updatemenuitem" !== n && "!actualizarmenu" !== n || (e.cancel = !0, system.run(() => {
		const e = getPlayerLanguage(t);
		isAdmin(t) ? (updateMenuItemForAllPlayers(), t.sendMessage(getPrefix() + getUserUIText(e, "menuItemUpdatedAll"))) : t.sendMessage(getPrefix() + getUserUIText(e, "noPermissionCommand"))
	})), "!checkmenuitem" !== n && "!verificarmenu" !== n || (e.cancel = !0, system.run(() => {
		const e = getPlayerLanguage(t);
		if (!isAdmin(t)) return void t.sendMessage(getPrefix() + getUserUIText(e, "noPermissionCommand"));
		const n = getUserUIConfig().menuItem;
		t.sendMessage(getPrefix() + getUserUIText(e, "menuItemConfigTitle")), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigItemId")}: §e${n.itemId}`), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigSlot")}: §e${n.slot}`), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigKeepOnDeath")}: §e${n.keepOnDeath?getUserUIText(e,"menuItemConfigEnabled"):getUserUIText(e,"menuItemConfigDisabled")}`), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigLockInSlot")}: §e${n.lockInSlot?getUserUIText(e,"menuItemConfigEnabled"):getUserUIText(e,"menuItemConfigDisabled")}`), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigName")}: §e${n.name}`), t.sendMessage(`§7${getUserUIText(e,"menuItemConfigPlayersWaiting")}: §e${playersAwaitingRespawn.size}`)
	})), (n.startsWith("!fixmenuitem ") || n.startsWith("!arreglarmenu ")) && (e.cancel = !0, system.run(() => {
		const e = getPlayerLanguage(t);
		if (!isAdmin(t)) return void t.sendMessage(getPrefix() + getUserUIText(e, "noPermissionCommand"));
		const s = n.split(" ");
		if (s.length < 2) return void t.sendMessage(getPrefix() + getUserUIText(e, "fixMenuItemUsage"));
		const r = s[1],
			o = world.getAllPlayers().find(e => e.name === r);
		if (!o) return void t.sendMessage(getPrefix() + getUserUIText(e, "playerNotFound"));
		clearOldMenuItems(o), giveMenuBook(o), t.sendMessage(getPrefix() + getUserUIText(e, "menuItemFixed", {
			player: r
		}));
		const a = getPlayerLanguage(o);
		o.sendMessage(getPrefix() + getUserUIText(a, "menuItemFixedByAdmin"))
	}))
});