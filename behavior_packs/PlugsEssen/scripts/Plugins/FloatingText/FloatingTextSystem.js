import {
	world,
	system
} from "@minecraft/server";
import {
	EntityManager
} from "./EntityManager.js";
import {
	AnimationEngine
} from "./AnimationEngine.js";
import {
	FloatingTextManager
} from "./FloatingTextManager.js";
import {
	LeaderBoardManager
} from "./LeaderBoardManager.js";
const CONFIG_STORAGE_KEY = "floatingtext:config",
	DEFAULT_CONFIG = {
		enabled: !0,
		maxFloatingTexts: 50,
		maxLeaderBoards: 20,
		defaultRefreshInterval: 5e3,
		enableAnimations: !0,
		logActions: !0,
		autoCleanup: !0,
		cleanupInterval: 3e5
	};
class FloatingTextSystem {
	constructor() {
		if (FloatingTextSystem.instance) return FloatingTextSystem.instance;
		this.initialized = !1, this.config = {...DEFAULT_CONFIG
		}, this.entityManager = null, this.animationEngine = null, this.floatingTextManager = null, this.leaderBoardManager = null, this.cleanupIntervalId = null, this.actionLog = [], this.maxLogEntries = 100, FloatingTextSystem.instance = this
	}
	initialize() {
		try {
			if (this.initialized) return {
				success: !1,
				message: "Sistema ya inicializado"
			};
			this._killAllFloatingTextEntities();
			if (this._loadConfig(), !this.config.enabled) return {
				success: !0,
				message: "Sistema deshabilitado en configuracin"
			};
			this.entityManager = new EntityManager, this.animationEngine = new AnimationEngine, this.floatingTextManager = new FloatingTextManager(this.entityManager, this.animationEngine, () => this.getConfig()), this.leaderBoardManager = new LeaderBoardManager(this.entityManager, this.animationEngine, () => this.getConfig());
			this.floatingTextManager.loadFromStorage();
			this.leaderBoardManager.loadFromStorage();
			system.runTimeout(() => {
				try {
					this.floatingTextManager && this.floatingTextManager.restartAllAnimations();
					this.leaderBoardManager && this.leaderBoardManager.restartAllRefresh()
				} catch (e) {}
			}, 20);
			return this.config.autoCleanup && this._startAutoCleanup(), this._startChunkLoadRetrySystem(), this.initialized = !0, {
				success: !0,
				message: "Sistema inicializado exitosamente"
			}
		} catch (t) {
			return {
				success: !1,
				message: `Error al inicializar sistema: ${t}`
			}
		}
	}
	shutdown() {
		try {
			return this.initialized ? (this._stopAutoCleanup(), this.floatingTextManager && this.floatingTextManager.stopAllAnimations(), this.leaderBoardManager && this.leaderBoardManager.stopAutoRefresh(), this.animationEngine && this.animationEngine.stopAllAnimations(), this.initialized = !1, {
				success: !0,
				message: "Sistema detenido exitosamente"
			}) : {
				success: !1,
				message: "Sistema no inicializado"
			}
		} catch (t) {
			return {
				success: !1,
				message: `Error al detener sistema: ${t}`
			}
		}
	}
	getConfig() {
		return {...this.config
		}
	}
	setConfig(t) {
		try {
			return t && "object" == typeof t ? (this.config = {...this.config,
				...t
			}, this._saveConfig(), this._applyConfigChanges(t), {
				success: !0,
				message: "Configuracin actualizada exitosamente"
			}) : {
				success: !1,
				message: "Configuracin invlida"
			}
		} catch (t) {
			return {
				success: !1,
				message: `Error al actualizar configuracin: ${t}`
			}
		}
	}
	isInitialized() {
		return this.initialized
	}
	getManagers() {
		return {
			entityManager: this.entityManager,
			animationEngine: this.animationEngine,
			floatingTextManager: this.floatingTextManager,
			leaderBoardManager: this.leaderBoardManager
		}
	}
	_loadConfig() {
		try {
			const t = world.getDynamicProperty(CONFIG_STORAGE_KEY);
			if (!t) return void(this.config = {...DEFAULT_CONFIG
			});
			const e = JSON.parse(t);
			this.config = {...DEFAULT_CONFIG,
				...e
			}
		} catch (t) {
			this.config = {...DEFAULT_CONFIG
			}
		}
	}
	_saveConfig() {
		try {
			const t = JSON.stringify(this.config);
			world.setDynamicProperty(CONFIG_STORAGE_KEY, t)
		} catch (t) {}
	}
	_applyConfigChanges(t) {
		try {
			if (!1 === t.enabled && this.initialized) return void this.shutdown();
			if (!0 === t.enabled && !this.initialized) return void this.initialize();
			!1 === t.enableAnimations && (this.floatingTextManager && this.floatingTextManager.stopAllAnimations(), this.leaderBoardManager && this.leaderBoardManager.stopAutoRefresh()), !0 === t.enableAnimations && (this.floatingTextManager && this.floatingTextManager.restartAllAnimations(), this.leaderBoardManager && this.leaderBoardManager.restartAllRefresh()), t.defaultRefreshInterval, void 0 !== t.autoCleanup && (!0 === t.autoCleanup ? this._startAutoCleanup() : this._stopAutoCleanup()), void 0 !== t.cleanupInterval && this.config.autoCleanup && this._startAutoCleanup()
		} catch (t) {}
	}
	runCleanup() {
		try {
			if (!this.initialized) return {
				success: !1,
				message: "Sistema no inicializado"
			};
			const t = {
					orphanedEntitiesRemoved: 0,
					entitiesRecreated: 0,
					invalidDataRemoved: 0,
					errors: []
				},
				e = new Set;
			if (this.floatingTextManager)
				for (const [t, a] of this.floatingTextManager.floatingTexts.entries()) a.entityId && e.add(a.entityId);
			if (this.leaderBoardManager)
				for (const [t, a] of this.leaderBoardManager.leaderboards.entries()) a.entityId && e.add(a.entityId);
			if (this.entityManager) {
				const a = this.entityManager.cleanupOrphanedEntities(e);
				t.orphanedEntitiesRemoved = a.removed, a.removed
			}
			if (this.floatingTextManager)
				for (const [e, a] of this.floatingTextManager.floatingTexts.entries()) try {
					if (a.entityId) {
						if (!this.entityManager.validateEntity(a.entityId)) {
							this._recreateFloatingTextEntity(e, a) ? t.entitiesRecreated++ : t.errors.push(`Failed to recreate entity for text ${e}`)
						}
					} else {
						this._recreateFloatingTextEntity(e, a) ? t.entitiesRecreated++ : t.errors.push(`Failed to create entity for text ${e}`)
					}
				} catch (a) {
					t.errors.push(`Error processing text ${e}: ${a}`)
				}
			if (this.leaderBoardManager)
				for (const [e, a] of this.leaderBoardManager.leaderboards.entries()) try {
					if (a.entityId) {
						if (!this.entityManager.validateEntity(a.entityId)) {
							this._recreateLeaderBoardEntity(e, a) ? t.entitiesRecreated++ : t.errors.push(`Failed to recreate entity for leaderboard ${e}`)
						}
					} else {
						this._recreateLeaderBoardEntity(e, a) ? t.entitiesRecreated++ : t.errors.push(`Failed to create entity for leaderboard ${e}`)
					}
				} catch (a) {
					t.errors.push(`Error processing leaderboard ${e}: ${a}`)
				}
			return t.errors.length, {
				success: !0,
				message: "Limpieza completada",
				results: t
			}
		} catch (t) {
			return {
				success: !1,
				message: `Error durante limpieza: ${t}`
			}
		}
	}
	_startAutoCleanup() {
		try {
			this._stopAutoCleanup();
			const t = this.config.cleanupInterval || 3e5,
				e = Math.floor(t / 50);
			this.cleanupIntervalId = system.runInterval(() => {
				this.runCleanup()
			}, e)
		} catch (t) {}
	}
	_stopAutoCleanup() {
		try {
			null !== this.cleanupIntervalId && (system.clearRun(this.cleanupIntervalId), this.cleanupIntervalId = null)
		} catch (t) {}
	}
	_recreateFloatingTextEntity(t, e) {
		try {
			const t = e.lines.map(t => t.text).join(""),
				a = this.entityManager.createEntity(e.location, t);
			return !(!a || !a.success) && (e.entityId = a.entityId, this.floatingTextManager && this.floatingTextManager.saveToStorage(), this.config.enableAnimations, !0)
		} catch (t) {
			return !1
		}
	}
	_recreateLeaderBoardEntity(t, e) {
		try {
			const a = (e.title ? e.title.map(t => t.text).join("") : "LeaderBoard") + "\n\nCargando...",
				i = this.entityManager.createEntity(e.location, a);
			return !(!i || !i.success) && (e.entityId = i.entityId, this.leaderBoardManager && this.leaderBoardManager.saveToStorage(), this.leaderBoardManager && this.leaderBoardManager.refreshLeaderBoard(t), !0)
		} catch (t) {
			return !1
		}
	}
	logAction(t, e, a, i, n = {}) {
		try {
			if (!this.config.logActions) return;
			const r = {
				timestamp: Date.now(),
				action: t,
				type: e,
				objectId: a,
				adminName: i,
				details: n
			};
			this.actionLog.push(r), this.actionLog.length > this.maxLogEntries && this.actionLog.shift(), n && Object.keys(n).length
		} catch (t) {}
	}
	logError(t, e, a = null) {
		try {
			const i = a ? `${e}: ${a}` : e;
			this.config.logActions && this.logAction("error", "system", t, "system", {
				message: i,
				stack: a ? a.stack : void 0
			})
		} catch (t) {}
	}
	logWarning(t, e) {
		try {
			this.config.logActions && this.logAction("warning", "system", t, "system", {
				message: e
			})
		} catch (t) {}
	}
	getActionLog(t = null) {
		try {
			return t && t > 0 ? this.actionLog.slice(-t) : [...this.actionLog]
		} catch (t) {
			return []
		}
	}
	clearActionLog() {
		try {
			this.actionLog = []
		} catch (t) {}
	}
	notifyAdmins(t, e = "info") {
		try {
			const a = world.getAllPlayers().filter(t => t.hasTag("admin"));
			if (0 === a.length) return;
			let i = "f",
				n = "[FloatingText]";
			switch (e) {
				case "warning":
					i = "e", n = "[FloatingText] e?";
					break;
				case "error":
					i = "c", n = "[FloatingText] c?";
					break;
				case "success":
					i = "a", n = "[FloatingText] a?";
					break;
				default:
					i = "b", n = "[FloatingText] b?"
			}
			for (const e of a) try {
				e.sendMessage(`${n} ${i}${t}`)
			} catch (t) {}
		} catch (t) {}
	}
	getSystemStats() {
		const t = {
			initialized: this.initialized,
			config: this.getConfig(),
			floatingTexts: {
				count: 0,
				limit: this.config.maxFloatingTexts
			},
			leaderboards: {
				count: 0,
				limit: this.config.maxLeaderBoards
			},
			entities: {
				count: 0
			},
			animations: {
				count: 0
			},
			logging: {
				enabled: this.config.logActions,
				entriesCount: this.actionLog.length,
				maxEntries: this.maxLogEntries
			},
			cleanup: {
				enabled: this.config.autoCleanup,
				interval: this.config.cleanupInterval,
				isRunning: null !== this.cleanupIntervalId
			}
		};
		return this.initialized && (this.floatingTextManager && (t.floatingTexts.count = this.floatingTextManager.getFloatingTextCount()), this.leaderBoardManager && (t.leaderboards.count = this.leaderBoardManager.getLeaderBoardCount()), this.entityManager && (t.entities.count = this.entityManager.getEntityCount()), this.animationEngine && (t.animations.count = this.animationEngine.getActiveAnimationCount())), t
	}
	_startChunkLoadRetrySystem() {
		let t = 0;
		let e = !1;
		const a = system.runInterval(() => {
			t++;
			try {
				let i = 0,
					n = !1;
				if (this.floatingTextManager)
					for (const [t, e] of this.floatingTextManager.floatingTexts.entries())
						if (e.needsRecreation || !e.entityId) {
							this._recreateFloatingTextEntity(t, e) && (i++, delete e.needsRecreation, e.lines && e.lines.some(t => t.animation && t.animation.enabled) && (n = !0))
						}
				if (this.leaderBoardManager)
					for (const [t, e] of this.leaderBoardManager.leaderboards.entries())
						if (e.needsRecreation || !e.entityId) {
							this._recreateLeaderBoardEntity(t, e) && (i++, delete e.needsRecreation, n = !0)
						}
				i > 0 && n && !e && (this.floatingTextManager && this.floatingTextManager.restartAllAnimations(), this.leaderBoardManager && this.leaderBoardManager.restartAllRefresh(), e = !0), t >= 24 && system.clearRun(a)
			} catch (t) {}
		}, 100)
	}
	_killAllFloatingTextEntities() {
		const dims = ["overworld", "nether", "the_end"];
		for (const d of dims) {
			try {
				const dim = world.getDimension(d);
				const ents = dim.getEntities({
					type: "plugs:floating_text"
				});
				for (const e of ents) try {
					if (e.isValid) e.remove()
				} catch (e1) {}
				try {
					dim.runCommand("kill @e[type=plugs:floating_text]")
				} catch (e2) {}
			} catch (e3) {}
		}
	}
}
const floatingTextSystem = new FloatingTextSystem();
// Exponer el manager globalmente para que otros plugins puedan accederlo
system.runTimeout(() => {
	try {
		const managers = floatingTextSystem.getManagers();
		if (managers && managers.floatingTextManager) {
			globalThis.__plugsFloatingTextManager = managers.floatingTextManager;
		}
	} catch (_) {}
}, 5);

export {
	FloatingTextSystem,
	floatingTextSystem
};