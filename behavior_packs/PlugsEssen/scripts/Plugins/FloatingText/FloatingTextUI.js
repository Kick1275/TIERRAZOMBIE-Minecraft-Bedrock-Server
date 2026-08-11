import {
	ActionFormData,
	ModalFormData
} from "@minecraft/server-ui";
import {
	world,
	system
} from "@minecraft/server";
import {
	validateAdminPermission
} from "./ValidationUtils.js";
import {
	getGlobalConfig,
	getCommandsConfig
} from "../../Config/GlobalConfig.js";
import {
	getPlayerLanguage,
	getText
} from "../../Utils/Translations.js";

function getPrefix() {
	return getGlobalConfig().prefix
}
class FloatingTextUI {
	constructor(e, t) {
		if (!e || !t) throw new Error("[FloatingTextUI] FloatingTextManager and LeaderBoardManager are required");
		this.floatingTextManager = e, this.leaderBoardManager = t
	}
	_hasAdminPermission(e) {
		return validateAdminPermission(e).valid
	}
	_showPermissionError(e) {
		if (!e) return;
		const t = getPlayerLanguage(e),
			a = validateAdminPermission(e).error || getText(t, "floatingText.noPermission");
		e.sendMessage(`${getPrefix()}${a}`)
	}
	showMainMenu(e) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const t = getPlayerLanguage(e),
				a = new ActionFormData;
			a.title(getText(t, "floatingText.mainMenuTitle")), a.body(getText(t, "floatingText.mainMenuBody")), a.button(getText(t, "floatingText.floatingTextsButton"), "textures/ui/text_color_paintbrush"), a.button(getText(t, "floatingText.leaderBoardsButton"), "textures/ui/icon_best3"), a.button(getText(t, "floatingText.configButton"), "textures/ui/gear"), a.button("§l§e↺ Reiniciar Textos\n§r§7Mata y respawnea todos los textos flotantes", "textures/ui/refresh_light"), a.show(e).then(t => {
				if (!t.canceled) switch (t.selection) {
					case 0:
						this.showFloatingTextMenu(e);
						break;
					case 1:
						this.showLeaderBoardMenu(e);
						break;
					case 2:
						this.showConfigMenu(e);
						break;
					case 3:
						this._restartAllFloatingTexts(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingMenu").replace("{error}",t)}`)
		}
	}
	showFloatingTextMenu(e) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const t = getPlayerLanguage(e),
				a = this.floatingTextManager.getAllFloatingTexts(),
				o = new ActionFormData;
			o.title(getText(t, "floatingText.floatingTextMenuTitle")), 0 === a.length ? o.body(getText(t, "floatingText.noFloatingTexts")) : o.body(getText(t, "floatingText.floatingTextCount").replace("{count}", a.length)), o.button(getText(t, "floatingText.createNewButton"), "textures/ui/color_plus");
			for (const e of a) {
				const t = `§´§7(${Math.floor(e.location.x)}, ${Math.floor(e.location.y)}, ${Math.floor(e.location.z)})`;
				o.button(`§´§l§e${e.name}\n§´§r${t}`, "textures/ui/book_writable")
			}
			o.button(getText(t, "floatingText.backButton"), "textures/ui/arrow_left"), o.show(e).then(t => {
				if (!t.canceled)
					if (0 === t.selection) this.showCreateFloatingTextForm(e);
					else if (t.selection === a.length + 1) this.showMainMenu(e);
				else {
					const o = t.selection - 1,
						n = a[o];
					n && this._showFloatingTextOptions(e, n.id)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingMenu").replace("{error}",t)}`)
		}
	}
	_showFloatingTextOptions(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.floatingTextManager.getFloatingText(t);
			if (!o) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.textNotFound")}`), void this.showFloatingTextMenu(e);
			const n = new ActionFormData;
			n.title(getText(a, "floatingText.textOptionsTitle").replace("{name}", o.name));
			const r = getText(a, "floatingText.textOptionsBody").replace("{x}", Math.floor(o.location.x)).replace("{y}", Math.floor(o.location.y)).replace("{z}", Math.floor(o.location.z)).replace("{lines}", o.lines.length).replace("{creator}", o.createdBy);
			n.body(r), n.button(getText(a, "floatingText.editButton"), "textures/ui/book_edit_default"), n.button(getText(a, "floatingText.teleportButton"), "textures/ui/send_icon"), n.button(getText(a, "floatingText.deleteButton"), "textures/ui/trash_default"), n.button(getText(a, "floatingText.backToListButton"), "textures/ui/arrow_left"), n.show(e).then(a => {
				if (a.canceled) this.showFloatingTextMenu(e);
				else switch (a.selection) {
					case 0:
						this.showEditFloatingTextForm(e, t);
						break;
					case 1:
						this._teleportToFloatingText(e, t);
						break;
					case 2:
						this._confirmDeleteFloatingText(e, t);
						break;
					case 3:
						this.showFloatingTextMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingOptions").replace("{error}",t)}`)
		}
	}
	_teleportToFloatingText(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.floatingTextManager.getFloatingText(t);
			if (!o) return void e.sendMessage(`${getPrefix()}${getText(a,"floatingText.textNotFound")}`);
			e.teleport({
				x: o.location.x,
				y: o.location.y,
				z: o.location.z
			}, {
				dimension: e.dimension
			}), e.sendMessage(`${getPrefix()}${getText(a,"floatingText.teleportSuccess").replace("{name}",o.name)}`)
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorTeleporting").replace("{error}",t)}`)
		}
	}
	_confirmDeleteFloatingText(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.floatingTextManager.getFloatingText(t);
			if (!o) return void e.sendMessage(`${getPrefix()}${getText(a,"floatingText.textNotFound")}`);
			const n = new ActionFormData;
			n.title(getText(a, "floatingText.confirmDeleteTitle")), n.body(getText(a, "floatingText.confirmDeleteBody").replace("{name}", o.name)), n.button(getText(a, "floatingText.confirmYes"), "textures/ui/trash_default"), n.button(getText(a, "floatingText.confirmNo"), "textures/ui/cancel"), n.show(e).then(o => {
				if (o.canceled || 1 === o.selection) this._showFloatingTextOptions(e, t);
				else if (0 === o.selection) {
					const o = this.floatingTextManager.deleteFloatingText(t);
					o.success ? (e.sendMessage(`${getPrefix()}${getText(a,"floatingText.deleteSuccess")}`), this.showFloatingTextMenu(e)) : (e.sendMessage(`${getPrefix()}§c${o.message}`), this._showFloatingTextOptions(e, t))
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorDeleting").replace("{error}",t)}`)
		}
	}
	showLeaderBoardMenu(e) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const t = getPlayerLanguage(e),
				a = this.leaderBoardManager.getAllLeaderBoards(),
				o = new ActionFormData;
			o.title(getText(t, "floatingText.leaderBoardMenuTitle")), 0 === a.length ? o.body(getText(t, "floatingText.noLeaderBoards")) : o.body(getText(t, "floatingText.leaderBoardCount").replace("{count}", a.length)), o.button(getText(t, "floatingText.createNewButton"), "textures/ui/color_plus");
			for (const e of a) {
				const t = `§´§7(${Math.floor(e.location.x)}, ${Math.floor(e.location.y)}, ${Math.floor(e.location.z)})`;
				o.button(`§´§l§e${e.name}\n§´§r${t}`, "textures/ui/icon_best3")
			}
			o.button(getText(t, "floatingText.backButton"), "textures/ui/arrow_left"), o.show(e).then(t => {
				if (!t.canceled)
					if (0 === t.selection) this.showCreateLeaderBoardForm(e);
					else if (t.selection === a.length + 1) this.showMainMenu(e);
				else {
					const o = t.selection - 1,
						n = a[o];
					n && this._showLeaderBoardOptions(e, n.id)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingMenu").replace("{error}",t)}`)
		}
	}
	_showLeaderBoardOptions(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.getLeaderBoard(t);
			if (!o) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.leaderBoardNotFound")}`), void this.showLeaderBoardMenu(e);
			const n = new ActionFormData;
			n.title(getText(a, "floatingText.lbOptionsTitle").replace("{name}", o.name));
			const r = getText(a, "floatingText.lbOptionsBody").replace("{x}", Math.floor(o.location.x)).replace("{y}", Math.floor(o.location.y)).replace("{z}", Math.floor(o.location.z)).replace("{scoreboard}", o.scoreboard).replace("{top}", o.topCount).replace("{creator}", o.createdBy);
			n.body(r), n.button(getText(a, "floatingText.editButton"), "textures/ui/book_edit_default"), n.button(getText(a, "floatingText.teleportButton"), "textures/ui/send_icon"), n.button(getText(a, "floatingText.deleteButton"), "textures/ui/trash_default"), n.button(getText(a, "floatingText.backToListButton"), "textures/ui/arrow_left"), n.show(e).then(a => {
				if (a.canceled) this.showLeaderBoardMenu(e);
				else switch (a.selection) {
					case 0:
						this.showEditLeaderBoardForm(e, t);
						break;
					case 1:
						this._teleportToLeaderBoard(e, t);
						break;
					case 2:
						this._confirmDeleteLeaderBoard(e, t);
						break;
					case 3:
						this.showLeaderBoardMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingOptions").replace("{error}",t)}`)
		}
	}
	_teleportToLeaderBoard(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.getLeaderBoard(t);
			if (!o) return void e.sendMessage(`${getPrefix()}${getText(a,"floatingText.leaderBoardNotFound")}`);
			e.teleport({
				x: o.location.x,
				y: o.location.y,
				z: o.location.z
			}, {
				dimension: e.dimension
			}), e.sendMessage(`${getPrefix()}${getText(a,"floatingText.teleportSuccess").replace("{name}",o.name)}`)
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorTeleporting").replace("{error}",t)}`)
		}
	}
	_confirmDeleteLeaderBoard(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.getLeaderBoard(t);
			if (!o) return void e.sendMessage(`${getPrefix()}${getText(a,"floatingText.leaderBoardNotFound")}`);
			const n = new ActionFormData;
			n.title(getText(a, "floatingText.confirmDeleteTitle")), n.body(getText(a, "floatingText.confirmDeleteBody").replace("{name}", o.name)), n.button(getText(a, "floatingText.confirmYes"), "textures/ui/trash_default"), n.button(getText(a, "floatingText.confirmNo"), "textures/ui/cancel"), n.show(e).then(o => {
				if (o.canceled || 1 === o.selection) this._showLeaderBoardOptions(e, t);
				else if (0 === o.selection) {
					const o = this.leaderBoardManager.deleteLeaderBoard(t);
					o.success ? (e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbDeleteSuccess")}`), this.showLeaderBoardMenu(e)) : (e.sendMessage(`${getPrefix()}§c${o.message}`), this._showLeaderBoardOptions(e, t))
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorDeleting").replace("{error}",t)}`)
		}
	}
	showCreateFloatingTextForm(e, t = []) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const a = getPlayerLanguage(e),
				o = this.floatingTextManager.animationEngine,
				n = o.getAnimationTypes(),
				r = o.getAnimationSpeeds(),
				i = Object.entries(n).map(([e, t]) => t),
				s = Object.keys(r),
				l = t.length + 1,
				g = 0 === t.length ? getText(a, "floatingText.createFormTitle") : getText(a, "floatingText.createFormTitleWithLines").replace("{count}", t.length);
			let d = (new ModalFormData).title(g);
			0 === t.length && (d = d.textField(getText(a, "floatingText.nameFieldLabel"), getText(a, "floatingText.nameFieldPlaceholder"))), d = d.textField(getText(a, "floatingText.lineFieldLabel").replace("{number}", l), getText(a, "floatingText.lineFieldPlaceholder")).toggle(getText(a, "floatingText.animationToggle").replace("{number}", l), {
				defaultValue: !1
			}).dropdown(getText(a, "floatingText.animationTypeLabel"), i, {
				defaultValueIndex: 0
			}).textField(getText(a, "floatingText.animationColorsLabel"), getText(a, "floatingText.animationColorsPlaceholder")).dropdown(getText(a, "floatingText.animationSpeedLabel"), s, {
				defaultValueIndex: 2
			}), d.show(e).then(o => {
				if (o.canceled) t.length > 0 ? this._confirmDiscardLines(e, t) : this.showFloatingTextMenu(e);
				else try {
					let r = 0,
						i = "";
					if (0 === t.length && (i = o.formValues[r++], !i || 0 === i.trim().length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.nameEmpty")}`), void this.showCreateFloatingTextForm(e, t);
					const l = o.formValues[r++];
					if (!l || 0 === l.trim().length) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lineEmpty")}`), void this.showCreateFloatingTextForm(e, t);
					const g = o.formValues[r++],
						d = o.formValues[r++],
						c = o.formValues[r++],
						x = o.formValues[r++],
						f = Object.keys(n)[d],
						u = s[x];
					let T = [];
					if (g && "rainbow" !== f && "none" !== f && (T = this._parseColors(c), 0 === T.length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.colorsInvalid")}`), void this.showCreateFloatingTextForm(e, t);
					const h = {
							text: l,
							animation: {
								enabled: g,
								type: f,
								colors: T,
								speed: u
							}
						},
						m = [...t, h];
					0 === t.length && (this._tempTextName = i), this._showAddLineOrSaveMenu(e, m)
				} catch (t) {
					e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorProcessingForm").replace("{error}",t)}`), this.showFloatingTextMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingForm").replace("{error}",t)}`)
		}
	}
	_showAddLineOrSaveMenu(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = new ActionFormData;
			o.title(getText(a, "floatingText.addLineOrSaveTitle")), o.body(getText(a, "floatingText.addLineOrSaveBody").replace("{count}", t.length)), o.button(getText(a, "floatingText.addAnotherLineButton"), "textures/ui/color_plus"), o.button(getText(a, "floatingText.saveAndCreateButton"), "textures/ui/check"), o.button(getText(a, "floatingText.cancelButton"), "textures/ui/cancel"), o.show(e).then(a => {
				a.canceled || 2 === a.selection ? this._confirmDiscardLines(e, t) : 0 === a.selection ? this.showCreateFloatingTextForm(e, t) : 1 === a.selection && this._createFloatingTextFromLines(e, this._tempTextName, t)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingMenu").replace("{error}",t)}`)
		}
	}
	_createFloatingTextFromLines(e, t, a) {
		try {
			const o = getPlayerLanguage(e),
				n = e.location,
				r = e.dimension.id,
				i = {
					name: t,
					location: {
						x: n.x,
						y: n.y + 1,
						z: n.z,
						dimension: r
					},
					lines: a,
					createdBy: e.name
				},
				s = this.floatingTextManager.createFloatingText(i);
			s.success ? (e.sendMessage(`${getPrefix()}${getText(o,"floatingText.createSuccess").replace("{name}",t)}`), e.sendMessage(`${getPrefix()}${getText(o,"floatingText.createSuccessId").replace("{id}",s.id)}`), delete this._tempTextName, this.showFloatingTextMenu(e)) : (e.sendMessage(`${getPrefix()}${getText(o,"floatingText.createError").replace("{error}",s.message)}`), this.showFloatingTextMenu(e))
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.createError").replace("{error}",t)}`), this.showFloatingTextMenu(e)
		}
	}
	_confirmDiscardLines(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = new ActionFormData;
			o.title(getText(a, "floatingText.confirmDiscardTitle")), o.body(getText(a, "floatingText.confirmDiscardBody").replace("{count}", t.length)), o.button(getText(a, "floatingText.discardYes"), "textures/ui/trash_default"), o.button(getText(a, "floatingText.continueEditingButton"), "textures/ui/arrow_left"), o.show(e).then(o => {
				o.canceled || 1 === o.selection ? this._showAddLineOrSaveMenu(e, t) : 0 === o.selection && (delete this._tempTextName, e.sendMessage(`${getPrefix()}${getText(a,"floatingText.changesDiscarded")}`), this.showFloatingTextMenu(e))
			})
		} catch (t) {
			getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}§c${t}`)
		}
	}
	_parseColors(e) {
		if (!e || "string" != typeof e) return [];
		return e.trim().split(/\s+/).filter(e => e.startsWith("§") && 2 === e.length)
	}
	showEditFloatingTextForm(e, t) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const a = getPlayerLanguage(e),
				o = this.floatingTextManager.getFloatingText(t);
			if (!o) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.textNotFound")}`), void this.showFloatingTextMenu(e);
			this._showEditLinesMenu(e, t, o)
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingForm").replace("{error}",t)}`)
		}
	}
	_showEditLinesMenu(e, t, a) {
		try {
			const o = getPlayerLanguage(e),
				n = new ActionFormData;
			n.title(getText(o, "floatingText.editLinesMenuTitle").replace("{name}", a.name)), n.body(getText(o, "floatingText.editLinesMenuBody").replace("{count}", a.lines.length)), n.button(getText(o, "floatingText.editNameButton"), "textures/ui/book_edit_default");
			for (let e = 0; e < a.lines.length; e++) {
				const t = a.lines[e],
					r = t.text.substring(0, 30) + (t.text.length > 30 ? "..." : ""),
					i = t.animation.enabled ? getText(o, "floatingText.lineAnimated") : getText(o, "floatingText.lineNoAnimation"),
					s = getText(o, "floatingText.lineButtonLabel").replace("{number}", e + 1).replace("{status}", i).replace("{preview}", r);
				n.button(s, "textures/ui/book_writable")
			}
			n.button(getText(o, "floatingText.addLineButton"), "textures/ui/color_plus"), n.button(getText(o, "floatingText.backToOptionsButton"), "textures/ui/arrow_left"), n.show(e).then(o => {
				if (o.canceled) this._showFloatingTextOptions(e, t);
				else if (0 === o.selection) this._showEditNameForm(e, t, a);
				else if (o.selection === a.lines.length + 1) this._showAddLineToExistingForm(e, t, a);
				else if (o.selection === a.lines.length + 2) this._showFloatingTextOptions(e, t);
				else {
					const n = o.selection - 1;
					this._showEditLineForm(e, t, a, n)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showEditNameForm(e, t, a) {
		try {
			const o = getPlayerLanguage(e);
			(new ModalFormData).title(getText(o, "floatingText.editNameFormTitle")).textField(getText(o, "floatingText.newNameLabel"), getText(o, "floatingText.newNamePlaceholder"), {
				defaultValue: a.name
			}).show(e).then(n => {
				if (n.canceled) return void this._showEditLinesMenu(e, t, a);
				const r = n.formValues[0];
				if (!r || 0 === r.trim().length) return e.sendMessage(`${getPrefix()}${getText(o,"floatingText.nameEmpty")}`), void this._showEditNameForm(e, t, a);
				const i = this.floatingTextManager.updateFloatingText(t, {
					name: r
				});
				if (i.success) {
					e.sendMessage(`${getPrefix()}${getText(o,"floatingText.nameUpdatedSuccess")}`);
					const a = this.floatingTextManager.getFloatingText(t);
					this._showEditLinesMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}§c${i.message}`), this._showEditLinesMenu(e, t, a)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showEditLineForm(e, t, a, o) {
		try {
			const n = getPlayerLanguage(e),
				r = a.lines[o];
			if (!r) return e.sendMessage(`${getPrefix()}${getText(n,"floatingText.lineNotFound")}`), void this._showEditLinesMenu(e, t, a);
			const i = this.floatingTextManager.animationEngine,
				s = i.getAnimationTypes(),
				l = i.getAnimationSpeeds(),
				g = Object.entries(s).map(([e, t]) => t),
				d = Object.keys(l),
				c = Object.keys(s).indexOf(r.animation.type),
				x = d.indexOf(r.animation.speed),
				f = r.animation.colors.join(" ");
			let u = (new ModalFormData).title(getText(n, "floatingText.editLineFormTitle").replace("{number}", o + 1)).textField(getText(n, "floatingText.lineTextLabel"), getText(n, "floatingText.lineTextPlaceholder"), {
				defaultValue: r.text
			}).toggle(getText(n, "floatingText.animationToggle").replace("{number}", ""), {
				defaultValue: !!r.animation.enabled
			}).dropdown(getText(n, "floatingText.animationTypeLabel"), g, {
				defaultValueIndex: c >= 0 ? c : 0
			}).textField(getText(n, "floatingText.animationColorsLabel"), getText(n, "floatingText.animationColorsPlaceholder"), {
				defaultValue: f
			}).dropdown(getText(n, "floatingText.animationSpeedLabel"), d, {
				defaultValueIndex: x >= 0 ? x : 2
			});
			a.lines.length > 1 && (u = u.toggle(getText(n, "floatingText.deleteLineToggle"), {
				defaultValue: !1
			})), u.show(e).then(r => {
				if (r.canceled) return void this._showEditLinesMenu(e, t, a);
				let i = 0;
				const l = r.formValues[i++],
					g = r.formValues[i++],
					c = r.formValues[i++],
					x = r.formValues[i++],
					f = r.formValues[i++];
				if (a.lines.length > 1 && r.formValues[i++]) {
					const r = a.lines.filter((e, t) => t !== o),
						i = this.floatingTextManager.updateFloatingText(t, {
							lines: r
						});
					if (i.success) {
						e.sendMessage(`${getPrefix()}${getText(n,"floatingText.lineDeletedSuccess")}`);
						const a = this.floatingTextManager.getFloatingText(t);
						this._showEditLinesMenu(e, t, a)
					} else e.sendMessage(`${getPrefix()}${getText(n,"floatingText.error").replace("{error}",i.message)}`), this._showEditLinesMenu(e, t, a);
					return
				}
				if (!l || 0 === l.trim().length) return e.sendMessage(`${getPrefix()}${getText(n,"floatingText.lineEmpty")}`), void this._showEditLineForm(e, t, a, o);
				const u = Object.keys(s)[c],
					T = d[f];
				let h = [];
				if (g && "rainbow" !== u && "none" !== u && (h = this._parseColors(x), 0 === h.length)) return e.sendMessage(`${getPrefix()}${getText(n,"floatingText.colorsInvalid")}`), void this._showEditLineForm(e, t, a, o);
				const m = [...a.lines];
				m[o] = {
					text: l,
					animation: {
						enabled: g,
						type: u,
						colors: h,
						speed: T
					}
				};
				const p = this.floatingTextManager.updateFloatingText(t, {
					lines: m
				});
				if (p.success) {
					e.sendMessage(`${getPrefix()}${getText(n,"floatingText.lineUpdatedSuccess")}`);
					const a = this.floatingTextManager.getFloatingText(t);
					this._showEditLinesMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}${getText(n,"floatingText.error").replace("{error}",p.message)}`), this._showEditLinesMenu(e, t, a)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showAddLineToExistingForm(e, t, a) {
		try {
			const o = getPlayerLanguage(e),
				n = this.floatingTextManager.animationEngine,
				r = n.getAnimationTypes(),
				i = n.getAnimationSpeeds(),
				s = Object.entries(r).map(([e, t]) => t),
				l = Object.keys(i),
				g = a.lines.length + 1;
			(new ModalFormData).title(getText(o, "floatingText.addLineToExistingTitle").replace("{name}", a.name)).textField(getText(o, "floatingText.addLineFieldLabel").replace("{number}", g), getText(o, "floatingText.addLineFieldPlaceholder")).toggle(getText(o, "floatingText.animationToggle").replace("{number}", ""), {
				defaultValue: !1
			}).dropdown(getText(o, "floatingText.animationTypeLabel"), s, {
				defaultValueIndex: 0
			}).textField(getText(o, "floatingText.animationColorsLabel"), getText(o, "floatingText.animationColorsPlaceholder")).dropdown(getText(o, "floatingText.animationSpeedLabel"), l, {
				defaultValueIndex: 2
			}).show(e).then(n => {
				if (n.canceled) return void this._showEditLinesMenu(e, t, a);
				const i = n.formValues[0],
					s = n.formValues[1],
					g = n.formValues[2],
					d = n.formValues[3],
					c = n.formValues[4];
				if (!i || 0 === i.trim().length) return e.sendMessage(`${getPrefix()}${getText(o,"floatingText.lineEmpty")}`), void this._showAddLineToExistingForm(e, t, a);
				const x = Object.keys(r)[g],
					f = l[c];
				let u = [];
				if (s && "rainbow" !== x && "none" !== x && (u = this._parseColors(d), 0 === u.length)) return e.sendMessage(`${getPrefix()}${getText(o,"floatingText.colorsInvalid")}`), void this._showAddLineToExistingForm(e, t, a);
				const T = {
						text: i,
						animation: {
							enabled: s,
							type: x,
							colors: u,
							speed: f
						}
					},
					h = [...a.lines, T],
					m = this.floatingTextManager.updateFloatingText(t, {
						lines: h
					});
				if (m.success) {
					e.sendMessage(`${getPrefix()}${getText(o,"floatingText.lineAddedSuccess")}`);
					const a = this.floatingTextManager.getFloatingText(t);
					this._showEditLinesMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}${getText(o,"floatingText.error").replace("{error}",m.message)}`), this._showEditLinesMenu(e, t, a)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	showCreateLeaderBoardForm(e, t = null) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const a = getPlayerLanguage(e);
			(new ModalFormData).title(getText(a, "floatingText.createLBTitle")).textField(getText(a, "floatingText.lbNameLabel"), getText(a, "floatingText.lbNamePlaceholder")).textField(getText(a, "floatingText.scoreboardNameLabel"), getText(a, "floatingText.scoreboardNamePlaceholder")).textField(getText(a, "floatingText.topCountLabel"), getText(a, "floatingText.topCountPlaceholder")).show(e).then(o => {
				if (o.canceled) this.showLeaderBoardMenu(e);
				else try {
					const n = o.formValues[0],
						r = o.formValues[1],
						i = o.formValues[2];
					if (!n || 0 === n.trim().length) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbNameEmpty")}`), void this.showCreateLeaderBoardForm(e, t);
					if (!r || 0 === r.trim().length) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.scoreboardEmpty")}`), void this.showCreateLeaderBoardForm(e, t);
					const s = parseInt(i);
					if (isNaN(s) || s < 1 || s > 50) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.topCountInvalid")}`), void this.showCreateLeaderBoardForm(e, t);
					const l = {
						name: n,
						scoreboard: r.trim(),
						topCount: s,
						titleLines: []
					};
					this._showCreateLeaderBoardTitleForm(e, l)
				} catch (t) {
					e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorProcessingForm").replace("{error}",t)}`), this.showLeaderBoardMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingForm").replace("{error}",t)}`)
		}
	}
	_showCreateLeaderBoardTitleForm(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.animationEngine,
				n = o.getAnimationTypes(),
				r = o.getAnimationSpeeds(),
				i = Object.entries(n).map(([e, t]) => t),
				s = Object.keys(r),
				l = t.titleLines.length + 1,
				g = 0 === t.titleLines.length ? getText(a, "floatingText.lbTitleConfigFormTitle") : getText(a, "floatingText.lbTitleConfigFormTitleWithLines").replace("{count}", t.titleLines.length);
			(new ModalFormData).title(g).textField(getText(a, "floatingText.lbTitleLineLabel").replace("{number}", l), getText(a, "floatingText.lbTitleLinePlaceholder")).toggle(getText(a, "floatingText.animationToggle").replace("{number}", l), {
				defaultValue: !1
			}).dropdown(getText(a, "floatingText.animationTypeLabel"), i, {
				defaultValueIndex: 0
			}).textField(getText(a, "floatingText.animationColorsLabel"), getText(a, "floatingText.animationColorsPlaceholder")).dropdown(getText(a, "floatingText.animationSpeedLabel"), s, {
				defaultValueIndex: 2
			}).show(e).then(o => {
				if (o.canceled) t.titleLines.length > 0 ? this._confirmDiscardLeaderBoard(e, t) : this.showLeaderBoardMenu(e);
				else try {
					let r = 0;
					const i = o.formValues[r++];
					if (!i || 0 === i.trim().length) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbTitleLineEmpty")}`), void this._showCreateLeaderBoardTitleForm(e, t);
					const l = o.formValues[r++],
						g = o.formValues[r++],
						d = o.formValues[r++],
						c = o.formValues[r++],
						x = Object.keys(n)[g],
						f = s[c];
					let u = [];
					if (l && "rainbow" !== x && "none" !== x && (u = this._parseColors(d), 0 === u.length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.colorsInvalid")}`), void this._showCreateLeaderBoardTitleForm(e, t);
					const T = {
						text: i,
						animation: {
							enabled: l,
							type: x,
							colors: u,
							speed: f
						}
					};
					t.titleLines.push(T), this._showAddTitleLineOrContinueMenu(e, t)
				} catch (t) {
					e.sendMessage(`${getPrefix()}§cError al procesar el formulario: ${t}`), this.showLeaderBoardMenu(e)
				}
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError al mostrar el formulario: ${t}`)
		}
	}
	_showAddTitleLineOrContinueMenu(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = new ActionFormData;
			o.title(getText(a, "floatingText.lbTitleMenuTitle")), o.body(getText(a, "floatingText.lbTitleMenuBody").replace("{count}", t.titleLines.length)), o.button(getText(a, "floatingText.lbTitleAddAnotherButton"), "textures/ui/color_plus"), o.button(getText(a, "floatingText.lbTitleContinueButton"), "textures/ui/arrow_right"), o.button(getText(a, "floatingText.lbTitleCancelButton"), "textures/ui/cancel"), o.show(e).then(a => {
				a.canceled || 2 === a.selection ? this._confirmDiscardLeaderBoard(e, t) : 0 === a.selection ? this._showCreateLeaderBoardTitleForm(e, t) : 1 === a.selection && this._showCreateLeaderBoardEntryFormatForm(e, t)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_confirmDiscardLeaderBoard(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = new ActionFormData;
			o.title(getText(a, "floatingText.lbConfirmDiscardTitle"));
			let n = `§´§7Nombre: §e${t.name}\n§´§7Scoreboard: §e${t.scoreboard}\n§´§7Top: §e${t.topCount}`;
			t.titleLines.length > 0 && (n += `\n§´§7Líneas de título: §e${t.titleLines.length}`), o.body(`${n}\n\n${getText(a,"floatingText.lbConfirmDiscardBodyWithLines").replace("{name}",t.name).replace("{scoreboard}",t.scoreboard).replace("{top}",t.topCount).replace("{titleLines}",t.titleLines.length)}`), o.button(getText(a, "floatingText.discardYes"), "textures/ui/trash_default"), o.button(getText(a, "floatingText.continueEditingButton"), "textures/ui/arrow_left"), o.show(e).then(o => {
				o.canceled || 1 === o.selection ? t.titleLines.length > 0 ? this._showAddTitleLineOrContinueMenu(e, t) : this._showCreateLeaderBoardTitleForm(e, t) : 0 === o.selection && (e.sendMessage(`${getPrefix()}${getText(a,"floatingText.changesDiscarded")}`), this.showLeaderBoardMenu(e))
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showCreateLeaderBoardEntryFormatForm(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.animationEngine,
				n = o.getAnimationTypes(),
				r = o.getAnimationSpeeds(),
				i = Object.entries(n).map(([e, t]) => t),
				s = Object.keys(r);
			(new ModalFormData).title(getText(a, "floatingText.lbEntryFormatTitle")).toggle(getText(a, "floatingText.lbPositionAnimToggle"), {
				defaultValue: !1
			}).dropdown(getText(a, "floatingText.lbPositionAnimType"), i, {
				defaultValueIndex: 0
			}).textField(getText(a, "floatingText.lbPositionColors"), getText(a, "floatingText.lbPositionColorsPlaceholder")).dropdown(getText(a, "floatingText.lbPositionAnimSpeed"), s, {
				defaultValueIndex: 3
			}).toggle(getText(a, "floatingText.lbNameAnimToggle"), {
				defaultValue: !1
			}).dropdown(getText(a, "floatingText.lbNameAnimType"), i, {
				defaultValueIndex: 0
			}).textField(getText(a, "floatingText.lbNameColors"), getText(a, "floatingText.lbNameColorsPlaceholder")).dropdown(getText(a, "floatingText.lbNameAnimSpeed"), s, {
				defaultValueIndex: 2
			}).toggle(getText(a, "floatingText.lbScoreAnimToggle"), {
				defaultValue: !1
			}).dropdown(getText(a, "floatingText.lbScoreAnimType"), i, {
				defaultValueIndex: 0
			}).textField(getText(a, "floatingText.lbScoreColors"), getText(a, "floatingText.lbScoreColorsPlaceholder")).dropdown(getText(a, "floatingText.lbScoreAnimSpeed"), s, {
				defaultValueIndex: 2
			}).show(e).then(o => {
				if (o.canceled) this._showAddTitleLineOrContinueMenu(e, t);
				else try {
					let r = 0;
					const i = o.formValues[r++],
						l = o.formValues[r++],
						g = o.formValues[r++],
						d = o.formValues[r++],
						c = o.formValues[r++],
						x = o.formValues[r++],
						f = o.formValues[r++],
						u = o.formValues[r++],
						T = o.formValues[r++],
						h = o.formValues[r++],
						m = o.formValues[r++],
						p = o.formValues[r++],
						M = Object.keys(n)[l],
						L = s[d],
						b = Object.keys(n)[x],
						w = s[u],
						$ = Object.keys(n)[h],
						y = s[p];
					let F = [];
					if (i && "rainbow" !== M && "none" !== M && (F = this._parseColors(g), 0 === F.length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbPositionColorsInvalid")}`), void this._showCreateLeaderBoardEntryFormatForm(e, t);
					let B = [];
					if (c && "rainbow" !== b && "none" !== b && (B = this._parseColors(f), 0 === B.length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbNameColorsInvalid")}`), void this._showCreateLeaderBoardEntryFormatForm(e, t);
					let P = [];
					if (T && "rainbow" !== $ && "none" !== $ && (P = this._parseColors(m), 0 === P.length)) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbScoreColorsInvalid")}`), void this._showCreateLeaderBoardEntryFormatForm(e, t);
					t.entryFormat = {
						positionAnimation: {
							enabled: i,
							type: M,
							colors: F,
							speed: L
						},
						nameAnimation: {
							enabled: c,
							type: b,
							colors: B,
							speed: w
						},
						scoreAnimation: {
							enabled: T,
							type: $,
							colors: P,
							speed: y
						}
					}, this._createLeaderBoardFromTempData(e, t)
				} catch (t) {
					e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorProcessingForm").replace("{error}",t)}`), this.showLeaderBoardMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.errorShowingForm").replace("{error}",t)}`)
		}
	}
	_createLeaderBoardFromTempData(e, t) {
		try {
			const a = getPlayerLanguage(e),
				o = e.location,
				n = e.dimension.id,
				r = {
					name: t.name,
					location: {
						x: o.x,
						y: o.y + 1,
						z: o.z,
						dimension: n
					},
					scoreboard: t.scoreboard,
					topCount: t.topCount,
					title: t.titleLines,
					entryFormat: t.entryFormat,
					refreshInterval: 5e3,
					createdBy: e.name
				},
				i = this.leaderBoardManager.createLeaderBoard(r);
			i.success ? (e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbCreatedSuccess").replace("{name}",t.name)}`), e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbCreatedSuccessId").replace("{id}",i.id)}`), this.showLeaderBoardMenu(e)) : (e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbCreateError").replace("{error}",i.message)}`), this.showLeaderBoardMenu(e))
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbCreateError").replace("{error}",t)}`), this.showLeaderBoardMenu(e)
		}
	}
	showConfigMenu(e) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const t = getPlayerLanguage(e),
				a = this._loadConfig();
			(new ModalFormData).title(getText(t, "floatingText.configSystemTitle")).toggle(getText(t, "floatingText.configEnableToggle"), {
				defaultValue: !!a.enabled
			}).textField(getText(t, "floatingText.configMaxTextsLabel"), getText(t, "floatingText.configMaxTextsPlaceholder"), {
				defaultValue: a.maxFloatingTexts.toString()
			}).textField(getText(t, "floatingText.configMaxLBsLabel"), getText(t, "floatingText.configMaxLBsPlaceholder"), {
				defaultValue: a.maxLeaderBoards.toString()
			}).textField(getText(t, "floatingText.configRefreshLabel"), getText(t, "floatingText.configRefreshPlaceholder"), {
				defaultValue: (a.defaultRefreshInterval / 1e3).toString()
			}).toggle(getText(t, "floatingText.configAnimToggle"), {
				defaultValue: !!a.enableAnimations
			}).toggle(getText(t, "floatingText.configLogToggle"), {
				defaultValue: !!a.logActions
			}).show(e).then(o => {
				if (o.canceled) this.showMainMenu(e);
				else try {
					let n = 0;
					const r = o.formValues[n++],
						i = o.formValues[n++],
						s = o.formValues[n++],
						l = o.formValues[n++],
						g = o.formValues[n++],
						d = o.formValues[n++],
						c = parseInt(i);
					if (isNaN(c) || c < 1 || c > 100) return e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configMaxTextsInvalid")}`), void this.showConfigMenu(e);
					const x = parseInt(s);
					if (isNaN(x) || x < 1 || x > 100) return e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configMaxLBsInvalid")}`), void this.showConfigMenu(e);
					const f = parseInt(l);
					if (isNaN(f) || f < 1 || f > 60) return e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configRefreshInvalid")}`), void this.showConfigMenu(e);
					const u = {
						enabled: r,
						maxFloatingTexts: c,
						maxLeaderBoards: x,
						defaultRefreshInterval: 1e3 * f,
						enableAnimations: g,
						logActions: d,
						autoCleanup: a.autoCleanup,
						cleanupInterval: a.cleanupInterval
					};
					this._saveConfig(u), this._applyConfigChanges(u, a), u.logActions, e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configSavedSuccess")}`), e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configAppliedMsg")}`), this.showMainMenu(e)
				} catch (a) {
					e.sendMessage(`${getPrefix()}${getText(t,"floatingText.configErrorProcessing").replace("{error}",a)}`), this.showMainMenu(e)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.configErrorShowing").replace("{error}",t)}`)
		}
	}
	_loadConfig() {
		try {
			const e = world.getDynamicProperty("floatingtext:config");
			return e ? JSON.parse(e) : {
				enabled: !0,
				maxFloatingTexts: 50,
				maxLeaderBoards: 20,
				defaultRefreshInterval: 5e3,
				enableAnimations: !0,
				logActions: !0,
				autoCleanup: !0,
				cleanupInterval: 3e5
			}
		} catch (e) {
			return {
				enabled: !0,
				maxFloatingTexts: 50,
				maxLeaderBoards: 20,
				defaultRefreshInterval: 5e3,
				enableAnimations: !0,
				logActions: !0,
				autoCleanup: !0,
				cleanupInterval: 3e5
			}
		}
	}
	_saveConfig(e) {
		try {
			const t = JSON.stringify(e);
			world.setDynamicProperty("floatingtext:config", t)
		} catch (e) {
			throw new Error("No se pudo guardar la configuración")
		}
	}
	_applyConfigChanges(e, t) {
		try {
			if (!e.enabled && t.enabled) {
				const e = this.floatingTextManager.getAllFloatingTexts();
				for (const t of e)
					for (let e = 0; e < t.lines.length; e++) {
						const a = `${t.id}_line_${e}`;
						this.floatingTextManager.animationEngine.stopAnimation(a)
					}
				const t = this.leaderBoardManager.getAllLeaderBoards();
				for (const e of t) {
					for (let t = 0; t < e.title.length; t++) {
						const a = `${e.id}_title_${t}`;
						this.leaderBoardManager.animationEngine.stopAnimation(a)
					}
					this.leaderBoardManager._stopLeaderBoardRefresh(e.id)
				}
			}
			if (e.enabled && !t.enabled) {
				const e = this.floatingTextManager.getAllFloatingTexts();
				for (const t of e) this.floatingTextManager._startAnimationsForText(t);
				const t = this.leaderBoardManager.getAllLeaderBoards();
				for (const e of t) this.leaderBoardManager._startAnimationsForLeaderBoard(e), this.leaderBoardManager._startLeaderBoardRefresh(e.id)
			}
			if (!e.enableAnimations && t.enableAnimations) {
				const e = this.floatingTextManager.getAllFloatingTexts();
				for (const t of e)
					for (let e = 0; e < t.lines.length; e++) {
						const a = `${t.id}_line_${e}`;
						this.floatingTextManager.animationEngine.stopAnimation(a)
					}
				const t = this.leaderBoardManager.getAllLeaderBoards();
				for (const e of t)
					for (let t = 0; t < e.title.length; t++) {
						const a = `${e.id}_title_${t}`;
						this.leaderBoardManager.animationEngine.stopAnimation(a)
					}
			}
			if (e.enableAnimations && !t.enableAnimations) {
				const e = this.floatingTextManager.getAllFloatingTexts();
				for (const t of e) this.floatingTextManager._startAnimationsForText(t);
				const t = this.leaderBoardManager.getAllLeaderBoards();
				for (const e of t) this.leaderBoardManager._startAnimationsForLeaderBoard(e)
			}
			if (e.defaultRefreshInterval !== t.defaultRefreshInterval) {
				const t = this.leaderBoardManager.getAllLeaderBoards();
				for (const a of t) this.leaderBoardManager._stopLeaderBoardRefresh(a.id), a.refreshInterval = e.defaultRefreshInterval, e.enabled && this.leaderBoardManager._startLeaderBoardRefresh(a.id)
			}
		} catch (e) {}
	}
	showEditLeaderBoardForm(e, t) {
		try {
			if (!this._hasAdminPermission(e)) return void this._showPermissionError(e);
			const a = getPlayerLanguage(e),
				o = this.leaderBoardManager.getLeaderBoard(t);
			if (!o) return e.sendMessage(`${getPrefix()}${getText(a,"floatingText.lbNotFound")}`), void this.showLeaderBoardMenu(e);
			this._showEditLeaderBoardMenu(e, t, o)
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showEditLeaderBoardMenu(e, t, a) {
		try {
			const o = getPlayerLanguage(e),
				n = new ActionFormData;
			n.title(getText(o, "floatingText.editLBMenuTitle").replace("{name}", a.name)), n.body(getText(o, "floatingText.editLBMenuBody").replace("{scoreboard}", a.scoreboard).replace("{top}", a.topCount).replace("{titleLines}", a.title.length)), n.button(getText(o, "floatingText.editLBNameButton"), "textures/ui/book_edit_default"), n.button(getText(o, "floatingText.editLBScoreboardAndTopButton"), "textures/ui/icon_best3"), n.button(getText(o, "floatingText.editLBTitleButton"), "textures/ui/book_writable"), n.button(getText(o, "floatingText.editLBEntryFormatButton"), "textures/ui/color_picker"), n.button(getText(o, "floatingText.backToOptionsButton"), "textures/ui/arrow_left"), n.show(e).then(o => {
				if (o.canceled) this._showLeaderBoardOptions(e, t);
				else switch (o.selection) {
					case 0:
						this._showEditLeaderBoardNameForm(e, t, a);
						break;
					case 1:
						this._showEditLeaderBoardScoreboardForm(e, t, a);
						break;
					case 2:
						this._showEditLeaderBoardTitleMenu(e, t, a);
						break;
					case 3:
						this._showEditLeaderBoardEntryFormatForm(e, t, a);
						break;
					case 4:
						this._showLeaderBoardOptions(e, t)
				}
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showEditLeaderBoardNameForm(e, t, a) {
		try {
			const o = getPlayerLanguage(e);
			(new ModalFormData).title(getText(o, "floatingText.lbEditNameFormTitle")).textField(getText(o, "floatingText.lbEditNameLabel"), getText(o, "floatingText.lbEditNamePlaceholder"), {
				defaultValue: a.name
			}).show(e).then(n => {
				if (n.canceled) return void this._showEditLeaderBoardMenu(e, t, a);
				const r = n.formValues[0];
				if (!r || 0 === r.trim().length) return e.sendMessage(`${getPrefix()}${getText(o,"floatingText.lbNameEmpty")}`), void this._showEditLeaderBoardNameForm(e, t, a);
				const i = this.leaderBoardManager.updateLeaderBoard(t, {
					name: r
				});
				if (i.success) {
					e.sendMessage(`${getPrefix()}${getText(o,"floatingText.lbNameUpdatedSuccess")}`);
					const a = this.leaderBoardManager.getLeaderBoard(t);
					this._showEditLeaderBoardMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}${getText(o,"floatingText.error").replace("{error}",i.message)}`), this._showEditLeaderBoardMenu(e, t, a)
			})
		} catch (t) {
			const a = getPlayerLanguage(e);
			e.sendMessage(`${getPrefix()}${getText(a,"floatingText.error").replace("{error}",t)}`)
		}
	}
	_showEditLeaderBoardScoreboardForm(e, t, a) {
		try {
			const o = world.scoreboard.getObjectives().map(e => e.id);
			if (0 === o.length) return e.sendMessage(`${getPrefix()}§cNo hay scoreboards disponibles`), void this._showEditLeaderBoardMenu(e, t, a);
			const n = o.indexOf(a.scoreboard);
			(new ModalFormData).title("§l§eEditar Scoreboard y Top").dropdown("§eScoreboard", o, {
				defaultValueIndex: n >= 0 ? n : 0
			}).textField("§eNúmero de posiciones (1-50)", "10", {
				defaultValue: a.topCount.toString()
			}).show(e).then(n => {
				if (n.canceled) return void this._showEditLeaderBoardMenu(e, t, a);
				const r = n.formValues[0],
					i = n.formValues[1],
					s = parseInt(i);
				if (isNaN(s) || s < 1 || s > 50) return e.sendMessage(`${getPrefix()}§cEl número de posiciones debe ser entre 1 y 50`), void this._showEditLeaderBoardScoreboardForm(e, t, a);
				const l = o[r],
					g = this.leaderBoardManager.updateLeaderBoard(t, {
						scoreboard: l,
						topCount: s
					});
				if (g.success) {
					e.sendMessage(`${getPrefix()}§aScoreboard y top actualizados exitosamente`);
					const a = this.leaderBoardManager.getLeaderBoard(t);
					this._showEditLeaderBoardMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}§cError: ${g.message}`), this._showEditLeaderBoardMenu(e, t, a)
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError: ${t}`)
		}
	}
	_showEditLeaderBoardTitleMenu(e, t, a) {
		try {
			const o = new ActionFormData;
			o.title(`§l§eEditar Título: ${a.name}`), o.body(`§7Líneas de título: §e${a.title.length}\n§7Selecciona una línea para editar`);
			for (let e = 0; e < a.title.length; e++) {
				const t = a.title[e],
					n = t.text.substring(0, 30) + (t.text.length > 30 ? "..." : ""),
					r = t.animation.enabled ? "§aAnimada" : "§7Sin animación";
				o.button(`§l§eLínea ${e+1}\n§r${r} - ${n}`, "textures/ui/book_writable")
			}
			o.button("§l§a+ Añadir Línea\n§r§7Agregar nueva línea al título", "textures/ui/color_plus"), o.button("§l§7« Volver\n§r§7Menú de edición", "textures/ui/arrow_left"), o.show(e).then(o => {
				if (o.canceled) this._showEditLeaderBoardMenu(e, t, a);
				else if (o.selection === a.title.length) this._showAddTitleLineToLeaderBoardForm(e, t, a);
				else if (o.selection === a.title.length + 1) this._showEditLeaderBoardMenu(e, t, a);
				else {
					const n = o.selection;
					this._showEditLeaderBoardTitleLineForm(e, t, a, n)
				}
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError: ${t}`)
		}
	}
	_showEditLeaderBoardTitleLineForm(e, t, a, o) {
		try {
			const n = a.title[o];
			if (!n) return e.sendMessage(`${getPrefix()}§cLínea no encontrada`), void this._showEditLeaderBoardTitleMenu(e, t, a);
			const r = this.leaderBoardManager.animationEngine,
				i = r.getAnimationTypes(),
				s = r.getAnimationSpeeds(),
				l = Object.entries(i).map(([e, t]) => t),
				g = Object.keys(s),
				d = Object.keys(i).indexOf(n.animation.type),
				c = g.indexOf(n.animation.speed),
				x = n.animation.colors.join(" ");
			let f = (new ModalFormData).title(`§l§eEditar Línea ${o+1} del Título`).textField("§eTexto de la línea", "Texto", {
				defaultValue: n.text
			}).toggle("§e¿Aplicar animación?", {
				defaultValue: !!n.animation.enabled
			}).dropdown("§eTipo de animación", l, {
				defaultValueIndex: d >= 0 ? d : 0
			}).textField("§eColores de animación", "§c §6 §e", {
				defaultValue: x
			}).dropdown("§eVelocidad de animación", g, {
				defaultValueIndex: c >= 0 ? c : 2
			});
			a.title.length > 1 && (f = f.toggle("§c¿Eliminar esta línea?", {
				defaultValue: !1
			})), f.show(e).then(n => {
				if (n.canceled) return void this._showEditLeaderBoardTitleMenu(e, t, a);
				let r = 0;
				const s = n.formValues[r++],
					l = n.formValues[r++],
					d = n.formValues[r++],
					c = n.formValues[r++],
					x = n.formValues[r++];
				if (a.title.length > 1 && n.formValues[r++]) {
					const n = a.title.filter((e, t) => t !== o),
						r = this.leaderBoardManager.updateLeaderBoard(t, {
							title: n
						});
					if (r.success) {
						e.sendMessage(`${getPrefix()}§aLínea eliminada exitosamente`);
						const a = this.leaderBoardManager.getLeaderBoard(t);
						this._showEditLeaderBoardTitleMenu(e, t, a)
					} else e.sendMessage(`${getPrefix()}§cError: ${r.message}`), this._showEditLeaderBoardTitleMenu(e, t, a);
					return
				}
				if (!s || 0 === s.trim().length) return e.sendMessage(`${getPrefix()}§cEl texto no puede estar vacío`), void this._showEditLeaderBoardTitleLineForm(e, t, a, o);
				const f = Object.keys(i)[d],
					u = g[x];
				let T = [];
				if (l && "rainbow" !== f && "none" !== f && (T = this._parseColors(c), 0 === T.length)) return e.sendMessage(`${getPrefix()}§cDebes proporcionar al menos un color válido`), void this._showEditLeaderBoardTitleLineForm(e, t, a, o);
				const h = [...a.title];
				h[o] = {
					text: s,
					animation: {
						enabled: l,
						type: f,
						colors: T,
						speed: u
					}
				};
				const m = this.leaderBoardManager.updateLeaderBoard(t, {
					title: h
				});
				if (m.success) {
					e.sendMessage(`${getPrefix()}§aLínea actualizada exitosamente`);
					const a = this.leaderBoardManager.getLeaderBoard(t);
					this._showEditLeaderBoardTitleMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}§cError: ${m.message}`), this._showEditLeaderBoardTitleMenu(e, t, a)
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError: ${t}`)
		}
	}
	_showAddTitleLineToLeaderBoardForm(e, t, a) {
		try {
			const o = this.leaderBoardManager.animationEngine,
				n = o.getAnimationTypes(),
				r = o.getAnimationSpeeds(),
				i = Object.entries(n).map(([e, t]) => t),
				s = Object.keys(r),
				l = a.title.length + 1;
			(new ModalFormData).title("§l§aAñadir Línea al Título").textField(`§eLínea ${l} del título`, "Texto").toggle("§e¿Aplicar animación?", {
				defaultValue: !1
			}).dropdown("§eTipo de animación", i, {
				defaultValueIndex: 0
			}).textField("§eColores de animación", "§c §6 §e").dropdown("§eVelocidad de animación", s, {
				defaultValueIndex: 2
			}).show(e).then(o => {
				if (o.canceled) return void this._showEditLeaderBoardTitleMenu(e, t, a);
				const r = o.formValues[0],
					i = o.formValues[1],
					l = o.formValues[2],
					g = o.formValues[3],
					d = o.formValues[4];
				if (!r || 0 === r.trim().length) return e.sendMessage(`${getPrefix()}§cEl texto no puede estar vacío`), void this._showAddTitleLineToLeaderBoardForm(e, t, a);
				const c = Object.keys(n)[l],
					x = s[d];
				let f = [];
				if (i && "rainbow" !== c && "none" !== c && (f = this._parseColors(g), 0 === f.length)) return e.sendMessage(`${getPrefix()}§cDebes proporcionar al menos un color válido`), void this._showAddTitleLineToLeaderBoardForm(e, t, a);
				const u = {
						text: r,
						animation: {
							enabled: i,
							type: c,
							colors: f,
							speed: x
						}
					},
					T = [...a.title, u],
					h = this.leaderBoardManager.updateLeaderBoard(t, {
						title: T
					});
				if (h.success) {
					e.sendMessage(`${getPrefix()}§aLínea añadida exitosamente`);
					const a = this.leaderBoardManager.getLeaderBoard(t);
					this._showEditLeaderBoardTitleMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}§cError: ${h.message}`), this._showEditLeaderBoardTitleMenu(e, t, a)
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError: ${t}`)
		}
	}
	_showEditLeaderBoardEntryFormatForm(e, t, a) {
		try {
			const o = this.leaderBoardManager.animationEngine,
				n = o.getAnimationTypes(),
				r = o.getAnimationSpeeds(),
				i = Object.entries(n).map(([e, t]) => t),
				s = Object.keys(r),
				l = a.entryFormat.positionAnimation,
				g = a.entryFormat.nameAnimation,
				d = a.entryFormat.scoreAnimation || {
					enabled: !1,
					type: "none",
					colors: [],
					speed: "normal"
				},
				c = Object.keys(n).indexOf(l.type),
				x = s.indexOf(l.speed),
				f = Object.keys(n).indexOf(g.type),
				u = s.indexOf(g.speed),
				T = Object.keys(n).indexOf(d.type),
				h = s.indexOf(d.speed);
			(new ModalFormData).title("§l§eEditar Formato de Entradas").toggle("§e¿Animar números de posición?", {
				defaultValue: !!l.enabled
			}).dropdown("§eTipo de animación para posiciones", i, {
				defaultValueIndex: c >= 0 ? c : 0
			}).textField("§eColores para posiciones", "§e §6", {
				defaultValue: l.colors.join(" ")
			}).dropdown("§eVelocidad para posiciones", s, {
				defaultValueIndex: x >= 0 ? x : 3
			}).toggle("§e¿Animar nombres de jugadores?", {
				defaultValue: !!g.enabled
			}).dropdown("§eTipo de animación para nombres", i, {
				defaultValueIndex: f >= 0 ? f : 0
			}).textField("§eColores para nombres", "§a §b", {
				defaultValue: g.colors.join(" ")
			}).dropdown("§eVelocidad para nombres", s, {
				defaultValueIndex: u >= 0 ? u : 2
			}).toggle("§e¿Animar puntuaciones (scores)?", {
				defaultValue: !!d.enabled
			}).dropdown("§eTipo de animación para scores", i, {
				defaultValueIndex: T >= 0 ? T : 0
			}).textField("§eColores para scores", "§f §7", {
				defaultValue: d.colors.join(" ") || "§f §7"
			}).dropdown("§eVelocidad para scores", s, {
				defaultValueIndex: h >= 0 ? h : 2
			}).show(e).then(o => {
				if (o.canceled) return void this._showEditLeaderBoardMenu(e, t, a);
				let r = 0;
				const i = o.formValues[r++],
					l = o.formValues[r++],
					g = o.formValues[r++],
					d = o.formValues[r++],
					c = o.formValues[r++],
					x = o.formValues[r++],
					f = o.formValues[r++],
					u = o.formValues[r++],
					T = o.formValues[r++],
					h = o.formValues[r++],
					m = o.formValues[r++],
					p = o.formValues[r++],
					M = Object.keys(n)[l],
					L = s[d],
					b = Object.keys(n)[x],
					w = s[u],
					$ = Object.keys(n)[h],
					y = s[p];
				let F = [];
				if (i && "rainbow" !== M && "none" !== M && (F = this._parseColors(g), 0 === F.length)) return e.sendMessage(`${getPrefix()}§cDebes proporcionar al menos un color válido para las posiciones`), void this._showEditLeaderBoardEntryFormatForm(e, t, a);
				let B = [];
				if (c && "rainbow" !== b && "none" !== b && (B = this._parseColors(f), 0 === B.length)) return e.sendMessage(`${getPrefix()}§cDebes proporcionar al menos un color válido para los nombres`), void this._showEditLeaderBoardEntryFormatForm(e, t, a);
				let P = [];
				if (T && "rainbow" !== $ && "none" !== $ && (P = this._parseColors(m), 0 === P.length)) return e.sendMessage(`${getPrefix()}§cDebes proporcionar al menos un color válido para los scores`), void this._showEditLeaderBoardEntryFormatForm(e, t, a);
				const _ = {
						positionAnimation: {
							enabled: i,
							type: M,
							colors: F,
							speed: L
						},
						nameAnimation: {
							enabled: c,
							type: b,
							colors: B,
							speed: w
						},
						scoreAnimation: {
							enabled: T,
							type: $,
							colors: P,
							speed: y
						}
					},
					E = this.leaderBoardManager.updateLeaderBoard(t, {
						entryFormat: _
					});
				if (E.success) {
					e.sendMessage(`${getPrefix()}§aFormato de entradas actualizado exitosamente`);
					const a = this.leaderBoardManager.getLeaderBoard(t);
					this._showEditLeaderBoardMenu(e, t, a)
				} else e.sendMessage(`${getPrefix()}§cError: ${E.message}`), this._showEditLeaderBoardMenu(e, t, a)
			})
		} catch (t) {
			e.sendMessage(`${getPrefix()}§cError: ${t}`)
		}
	}
	_restartAllFloatingTexts(p) {
		try {
			const pos = [];
			for (const ft of this.floatingTextManager.floatingTexts.values()) ft.location && pos.push(ft.location);
			for (const lb of this.leaderBoardManager.leaderboards.values()) lb.location && pos.push(lb.location);
			let k = 0;
			const dc = {};
			for (const loc of pos) {
				const di = loc.dimension || "overworld";
				dc[di] || (dc[di] = world.getDimension(di));
				const dm = dc[di];
				if (!dm) continue;
				try {
					const en = dm.getEntities({
						type: "plugs:floating_text",
						location: {
							x: loc.x,
							y: loc.y,
							z: loc.z
						},
						maxDistance: 1
					});
					for (const ent of en) try {
						ent.isValid && (ent.remove(), k++)
					} catch (e2) {}
				} catch (e3) {}
			}
			for (const ft of this.floatingTextManager.floatingTexts.values()) {
				ft.entityId = null;
				ft.needsRecreation = true
			}
			for (const lb of this.leaderBoardManager.leaderboards.values()) {
				lb.entityId = null;
				lb.needsRecreation = true
			}
			try {
				this.leaderBoardManager.entityManager && this.leaderBoardManager.entityManager.clearEntityMap()
			} catch (e4) {}
			system.runTimeout(() => {
				try {
					this.floatingTextManager.restartAllAnimations();
					this.leaderBoardManager.restartAllRefresh()
				} catch (e5) {}
			}, 20);
			p.sendMessage(`§a[FloatingText] §f${k} entidades eliminadas. Los textos reaparecerán en 1 segundo.`)
		} catch (er) {
			p.sendMessage(`§c[FloatingText] Error al reiniciar: ${er}`)
		}
	}
}
export {
	FloatingTextUI
};