import {
  world,
  system,
  ItemStack
} from "@minecraft/server";
const _protectedItems = new Set;
world.beforeEvents.entityItemPickup?.subscribe?.(t => {
  try {
    _protectedItems.has(t.item?.id) && (t.cancel = !0)
  } catch (t) {}
});
export const IDLE_PRESETS = [{
  label: "Torbellino de Fuego",
  value: "firetornado"
}, {
  label: "Tormenta",
  value: "storm"
}, {
  label: "Almas",
  value: "souls"
}, {
  label: "Sakura",
  value: "sakura"
}, {
  label: "Estrella Fugaz",
  value: "star"
}];
export const IDLE_PARTICLES = IDLE_PRESETS;
export const OPEN_ANIMATIONS = [{
  label: "Explosion de Lava",
  value: "lava"
}, {
  label: "Tormenta",
  value: "storm"
}, {
  label: "Almas",
  value: "souls"
}, {
  label: "Sakura",
  value: "sakura"
}, {
  label: "Ender",
  value: "ender"
}];
const CRATE_PX = -.5,
  CRATE_PZ = -.5,
  _cx = t => t.location.x + -.5,
  _cy = t => t.location.y,
  _cz = t => t.location.z + -.5,
  _cloc = t => ({
    x: _cx(t),
    y: _cy(t),
    z: _cz(t)
  });

function _soundAt(t, a, e, n = .7, r = 1) {
  try {
    t.runCommand(
      `playsound ${e} @a ${Math.floor(a.x)} ${Math.floor(a.y)} ${Math.floor(a.z)} ${n} ${r}`
      )
  } catch (t) {}
}

function _killLabelSilent(t, a) {
  if (t) {
    try {
      t.isValid && t.remove?.()
    } catch (t) {}
  }
}
const _idleIntervals = new Map,
  _idleLabels = new Map;

function _idleLabelText(t) {
  return `§´§r§l${t?.name??"Crate"}\n§r§7§´Sostén la llave y haz clic para abrir`
}

function _spawnLabel(t, a) {
  if (!1 === a?.showLabel) return null;
  try {
    const e = t.dimension.spawnEntity("plugs:floating_text", {
      x: t.location.x,
      y: t.location.y + 1.6,
      z: t.location.z
    });
    return e && (e.nameTag = _idleLabelText(a)), e
  } catch (t) {
    return null
  }
}
export function playIdleParticles(t, a) {
  stopIdleParticles(t);
  const e = a?.idleParticle ?? "firetornado",
    n = _spawnLabel(t, a);
  _idleLabels.set(t.id, {
      labelEntity: n,
      config: a
    }), "storm" === e ? _idleStorm(t, n) : "souls" === e ? _idleSouls(t, n) :
    "sakura" === e ? _idleSakura(t, n) : "star" === e ? _idleStar(t, n) :
    _idleFireTornado(t, n)
}

function _idleFireTornado(t, a) {
    let e = 0;
    const n = system.runInterval(() => {
        if (t?.isValid) {
            e++;
            try {
                const { x: n, y: r, z: o } = t.location, l = t.dimension, c = { x: n, y: r, z: o };
                if (a?.isValid) try { a.teleport({ x: n, y: r + 1.6, z: o }); } catch (t) {}
                // Reducido: 6→3 llamas exteriores
                for (let t = 0; t < 3; t++) {
                    const a = .38 * e + t / 3 * Math.PI * 2;
                    l.spawnParticle("minecraft:basic_flame_particle", { x: n + 1.05 * Math.cos(a), y: r + .2 + .5 * Math.abs(Math.sin(.15 * e + .5 * t)), z: o + 1.05 * Math.sin(a) });
                }
                // Reducido: 4→2 llamas interiores
                for (let t = 0; t < 2; t++) {
                    const a = .28 * -e + t / 2 * Math.PI * 2;
                    l.spawnParticle("minecraft:blue_flame_particle", { x: n + .65 * Math.cos(a), y: r + .4 + .25 * Math.sin(.2 * e + t), z: o + .65 * Math.sin(a) });
                }
                // Espiral central: solo cada 2 ticks
                if (e % 2 == 0) {
                    const t = e % 20 / 20, a = .55 * e;
                    l.spawnParticle("minecraft:basic_flame_particle", { x: n + .35 * Math.cos(a), y: r + .05 + 1.8 * t, z: o + .35 * Math.sin(a) });
                }
                e % 6 == 0 && l.spawnParticle("minecraft:basic_smoke_particle", { x: n + .3 * (Math.random() - .5), y: r + .1 + .8 * Math.random(), z: o + .3 * (Math.random() - .5) });
                e % 8 == 0 && l.spawnParticle("minecraft:lava_drip_particle", { x: n + .8 * (Math.random() - .5), y: r + .5 + .8 * Math.random(), z: o + .8 * (Math.random() - .5) });
                e % 15 == 0 && _soundAt(l, c, "fire.fire", .45, .85 + .3 * Math.random());
                e % 25 == 0 && _soundAt(l, c, "liquid.lava", .35, 1);
            } catch (t) {}
        } else stopIdleParticles(t);
    }, 5);
    _idleIntervals.set(t.id, n);
}


function _idleStorm(t, a) {
  let e = 0;
  const n = system.runInterval(() => {
    if (t?.isValid) {
      e++;
      try {
        const {
          x: n,
          y: r,
          z: o
        } = t.location, l = t.dimension, c = {
          x: n,
          y: r,
          z: o
        };
        if (a?.isValid) try {
          a.teleport({
            x: n,
            y: r + 1.6,
            z: o
          })
        } catch (t) {}
        if (e % 3 == 0)
          for (let t = 0; t < 4; t++) l.spawnParticle(
            "minecraft:cauldron_explosion_emitter", {
              x: n + 1.6 * (Math.random() - .5),
              y: r + 2 + .5 * Math.random(),
              z: o + 1.6 * (Math.random() - .5)
            });
        if (e % 2 == 0)
          for (let t = 0; t < 3; t++) l.spawnParticle(
            "minecraft:water_splash_particle", {
              x: n + 1.3 * (Math.random() - .5),
              y: r + 1.5 + .4 * Math.random(),
              z: o + 1.3 * (Math.random() - .5)
            });
        for (let t = 0; t < 8; t++) {
          const a = .25 * e + t / 8 * Math.PI * 2;
          l.spawnParticle("minecraft:blue_flame_particle", {
            x: n + 1 * Math.cos(a),
            y: r + .15 + t % 2 * .45,
            z: o + 1 * Math.sin(a)
          })
        }
        for (let t = 0; t < 6; t++) {
          const a = .32 * -e + t / 6 * Math.PI * 2;
          l.spawnParticle("minecraft:blue_flame_particle", {
            x: n + .65 * Math.cos(a),
            y: r + .3 + .2 * Math.sin(.18 * e + t),
            z: o + .65 * Math.sin(a)
          })
        }
        e % 40 == 0 && _soundAt(l, c, "weather.rain", .5, .9 + .2 * Math
          .random()), e % 60 == 0 && _soundAt(l, c,
          "ambient.weather.rain", .4, 1)
      } catch (t) {}
    } else stopIdleParticles(t)
  }, 5);
  _idleIntervals.set(t.id, n)
}

function _idleSouls(t, a) {
  let e = 0;
  const n = system.runInterval(() => {
    if (t?.isValid) {
      e++;
      try {
        const {
          x: n,
          y: r,
          z: o
        } = t.location, l = t.dimension, c = {
          x: n,
          y: r,
          z: o
        };
        if (a?.isValid) try {
          a.teleport({
            x: n,
            y: r + 1.6,
            z: o
          })
        } catch (t) {}
        for (let t = 0; t < 2; t++) {
          const a = e % 30 / 30,
            c = .22 * e + t * Math.PI,
            i = .7 + .15 * Math.sin(.08 * e + t);
          l.spawnParticle("minecraft:soul_particle", {
            x: n + Math.cos(c) * i,
            y: r + .1 + 2.2 * a,
            z: o + Math.sin(c) * i
          })
        }
        for (let t = 0; t < 5; t++) {
          const a = .12 * e + t / 5 * Math.PI * 2;
          l.spawnParticle("minecraft:soul_particle", {
            x: n + 1.1 * Math.cos(a),
            y: r + .3 + .3 * Math.sin(.1 * e + 1.2 * t),
            z: o + 1.1 * Math.sin(a)
          })
        }
        for (let t = 0; t < 4; t++) {
          const a = .18 * -e + t / 4 * Math.PI * 2;
          l.spawnParticle("minecraft:soul_particle", {
            x: n + .55 * Math.cos(a),
            y: r + .5 + .2 * Math.sin(.15 * e + t),
            z: o + .55 * Math.sin(a)
          })
        }
        if (e % 3 == 0) {
          const t = Math.random() * Math.PI * 2,
            a = .4 + .8 * Math.random();
          l.spawnParticle("minecraft:enchanting_table_particle", {
            x: n + Math.cos(t) * a,
            y: r + .2 + 1.6 * Math.random(),
            z: o + Math.sin(t) * a
          })
        }
        e % 4 == 0 && l.spawnParticle("minecraft:soul_fire_flame", {
            x: n + .25 * (Math.random() - .5),
            y: r + .05 + .6 * Math.random(),
            z: o + .25 * (Math.random() - .5)
          }), e % 45 == 0 && _soundAt(l, c, "mob.wither.idle", .25, 1.8),
          e % 70 == 0 && _soundAt(l, c, "portal.portal", .3, 1.4)
      } catch (t) {}
    } else stopIdleParticles(t)
  }, 5);
  _idleIntervals.set(t.id, n)
}

function _idleSakura(t, a) {
  let e = 0;
  const n = system.runInterval(() => {
    if (t?.isValid) {
      e++;
      try {
        const n = _cx(t),
          r = _cy(t),
          o = _cz(t),
          l = t.dimension,
          c = {
            x: n,
            y: r,
            z: o
          };
        if (a?.isValid) try {
          a.teleport({
            x: n,
            y: t.location.y + 1.6,
            z: o
          })
        } catch (t) {}
        if (e % 6 == 0) try {
          l.runCommand(
            `particle minecraft:cherry_leaves_particle ${n.toFixed(2)} ${(r+2.2).toFixed(2)} ${o.toFixed(2)}`
            )
        } catch (t) {}
        for (let t = 0; t < 6; t++) {
          const a = .1 * e + t / 6 * Math.PI * 2;
          l.spawnParticle("minecraft:enchanting_table_particle", {
            x: n + 1.1 * Math.cos(a),
            y: r + .6 + .3 * Math.sin(.08 * e + 1 * t),
            z: o + 1.1 * Math.sin(a)
          })
        }
        if (e % 2 == 0)
          for (let t = 0; t < 4; t++) {
            const a = .14 * -e + t / 4 * Math.PI * 2;
            l.spawnParticle("minecraft:snowflake_particle", {
              x: n + .6 * Math.cos(a),
              y: r + .8 + .2 * Math.sin(.12 * e + t),
              z: o + .6 * Math.sin(a)
            })
          }
        e % 20 == 0 && l.spawnParticle("minecraft:heart_particle", {
          x: n + .4 * (Math.random() - .5),
          y: r + 1.3 + .4 * Math.random(),
          z: o + .4 * (Math.random() - .5)
        }), e % 50 == 0 && _soundAt(l, c, "note.bell", .35, 1.2 + .4 *
          Math.random()), e % 75 == 0 && _soundAt(l, c, "note.harp", .25,
          1.4 + .3 * Math.random()), e % 90 == 0 && _soundAt(l, c,
          "note.chime", .3, 1.6)
      } catch (t) {}
    } else stopIdleParticles(t)
  }, 5);
  _idleIntervals.set(t.id, n)
}

function _idleStar(t, a) {
  let e = 0;
  const n = [],
    r = system.runInterval(() => {
      if (t?.isValid) {
        e++;
        try {
          const {
            x: r,
            y: o,
            z: l
          } = t.location, c = t.dimension, i = {
            x: r,
            y: o,
            z: l
          };
          if (a?.isValid) try {
            a.teleport({
              x: r,
              y: o + 1.6,
              z: l
            })
          } catch (t) {}
          const s = .18 * e,
            m = .9 + .35 * Math.sin(.07 * e),
            d = r + Math.cos(s) * m,
            h = o + .9 + .55 * Math.sin(.11 * e),
            y = l + Math.sin(s) * m;
          n.push({
            x: d,
            y: h,
            z: y
          }), n.length > 22 && n.shift();
          for (let t = 0; t < n.length; t++) {
            const a = t / n.length;
            a > .55 ? c.spawnParticle("minecraft:endrod", n[t]) : a > .2 &&
              t % 2 == 0 && c.spawnParticle("minecraft:wax_on_particle", n[t])
          }
          c.spawnParticle("minecraft:endrod", {
            x: d,
            y: h,
            z: y
          }), c.spawnParticle("minecraft:wax_on_particle", {
            x: d,
            y: h,
            z: y
          }), e % 55 == 0 && _soundAt(c, i, "note.bell", .3, 1.8 + .4 * Math
            .random()), e % 85 == 0 && _soundAt(c, i, "note.chime", .25, 2)
        } catch (t) {}
      } else stopIdleParticles(t)
    }, 5);
  _idleIntervals.set(t.id, r)
}
export function stopIdleParticles(t) {
  const a = _idleIntervals.get(t?.id);
  void 0 !== a && (system.clearRun(a), _idleIntervals.delete(t.id));
  const e = _idleLabels.get(t?.id);
  e && (_idleLabels.delete(t.id), _killLabelSilent(e.labelEntity, t?.location ??
  {
    x: 0,
    y: 0,
    z: 0
  }))
}
export function stopAllIdleParticles() {
  for (const [id, data] of _idleLabels.entries()) {
    try {
      data.labelEntity?.isValid && data.labelEntity.remove?.()
    } catch (_) {}
  }
  for (const [id, intervalId] of _idleIntervals.entries()) {
    try {
      system.clearRun(intervalId)
    } catch (_) {}
  }
  _idleLabels.clear();
  _idleIntervals.clear()
}
export function playInteractAnimation(t) {
  try {
    t.playAnimation("animation.crate.interact")
  } catch (t) {}
}
export function playOpenAnimation(t, a, e, n, r) {
  const o = n?.openAnimation ?? "lava";
  "storm" === o ? _openStorm(t, a, e, n, r) : "souls" === o ? _openSouls(t, a,
      e, n, r) : "sakura" === o ? _openSakura(t, a, e, n, r) : "ender" === o ?
    _openEnder(t, a, e, n, r) : _openLava(t, a, e, n, r)
}

function _collectAllLotItems(t) {
  const a = [];
  for (const e of t?.lots ?? [])
    for (const t of e.items ?? []) t.typeId && a.push(t.typeId);
  return a.length > 0 ? a : ["minecraft:diamond"]
}

function _openLava(t, a, e, n, r) {
  const o = t.location,
    l = t.dimension;
  _soundAt(l, o, "liquid.lava", .8, .7), _soundAt(l, o, "fire.fire", .7, .8);
  let c = 0;
  const i = _idleLabels.get(t.id),
    s = i?.labelEntity ?? null;
  try {
    t.playAnimation("animation.crate.open")
  } catch (t) {}
  const m = _collectAllLotItems(n);
  if (0 === m.length) return void system.runTimeout(() => r?.(), 30);
  let d = null;
  const h = (t, a = 1) => {
      if (d) {
        _protectedItems.delete(d.id);
        try {
          d.kill?.()
        } catch (t) {}
      }
      d = null;
      try {
        const a = new ItemStack(t, 1);
        if (d = l.spawnItem(a, {
            x: o.x,
            y: o.y + 1,
            z: o.z
          }), d) {
          _protectedItems.add(d.id);
          try {
            d.clearVelocity?.()
          } catch (t) {}
        }
      } catch (t) {}((t, a = 1) => {
        if (s?.isValid) try {
          s.nameTag = ((t, a = 1) =>
            `§r§l§e§´x${a} ${t.replace(/^minecraft:/,"").replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}`
            )(t, a)
        } catch (t) {}
      })(t, a)
    },
    y = e.items ?? [],
    u = y[0]?.typeId ?? m[0];
  let p = 0,
    f = 0,
    _ = 2;
  system.runTimeout(() => {
    h(m[0], 1);
    const t = system.runInterval(() => {
      if (p++, _--, c++, d?.isValid) {
        try {
          d.teleport({
            x: o.x,
            y: o.y + 1,
            z: o.z
          })
        } catch (t) {}
        try {
          d.clearVelocity?.()
        } catch (t) {}
      }
      if (s?.isValid) try {
        s.teleport({
          x: o.x,
          y: o.y + 1.6,
          z: o.z
        })
      } catch (t) {} {
        const t = c % 12 / 12,
          a = 4 * t * (1 - t),
          e = .7 * c,
          n = .15 + .6 * t;
        l.spawnParticle("minecraft:lava_particle", {
          x: o.x + Math.cos(e) * n,
          y: o.y + 1.8 * a,
          z: o.z + Math.sin(e) * n
        })
      }
      if (c % 2 == 0 && l.spawnParticle(
          "minecraft:basic_flame_particle", {
            x: o.x + .4 * (Math.random() - .5),
            y: o.y + .3 + .6 * Math.random(),
            z: o.z + .4 * (Math.random() - .5)
          }), c % 3 == 0 && l.spawnParticle(
          "minecraft:basic_smoke_particle", {
            x: o.x + .3 * (Math.random() - .5),
            y: o.y + .2 + .5 * Math.random(),
            z: o.z + .3 * (Math.random() - .5)
          }), c % 25 == 0 && _soundAt(l, o, "liquid.lava", .6, .9 + .3 *
          Math.random()), c % 18 == 0 && _soundAt(l, o, "fire.fire", .5,
          .8 + .4 * Math.random()), _ <= 0) {
        f = (f + 1) % m.length;
        const t = p / 100;
        _ = Math.max(2, Math.floor(2 + 12 * t)), h(m[f], 1);
        try {
          a.playSound("random.click", {
            pitch: 1.4 - .6 * t,
            volume: .8
          })
        } catch (t) {}
      }
      if (p >= 100) {
        system.clearRun(t);
        const e = y[0]?.amount ?? 1;
        h(u, e), _fireExplosion(l, o, a), a.sendMessage(
          `§r§l§6✦═══ Ganaste ═══✦§r\n§a${y.map(t=>`§e${t.nbt?.nameTag??t.typeId?.replace("minecraft:","")??"?"} §´x${t.amount??1}`).join(", ")}`
          ), system.runTimeout(() => {
          d && _protectedItems.delete(d.id);
          try {
            d?.kill?.()
          } catch (t) {}
          if (d = null, s?.isValid && i?.config) try {
            s.nameTag = _idleLabelText(i.config)
          } catch (t) {}
          r?.()
        }, 20)
      }
    }, 1)
  }, 20)
}

function _openStorm(t, a, e, n, r) {
  const o = _idleLabels.get(t.id),
    l = o?.labelEntity ?? null;
  try {
    t.playAnimation("animation.crate.open")
  } catch (t) {}
  const c = t.location,
    i = t.dimension;
  let s = "clear";
  try {
    const t = i.runCommand("weather query"),
      a = (t?.statusMessage ?? "").toLowerCase();
    a.includes("thunder") ? s = "thunder" : a.includes("rain") && (s = "rain")
  } catch (t) {}
  try {
    i.runCommand("weather thunder 300")
  } catch (t) {}
  _soundAt(i, c, "ambient.weather.thunder", 1, .8), _soundAt(i, c,
    "weather.rain", .8, .9);
  const m = _collectAllLotItems(n);
  if (0 === m.length) return void system.runTimeout(() => r?.(), 30);
  let d = null,
    h = 0;
  const y = (t, a = 1) => {
      if (d) {
        _protectedItems.delete(d.id);
        try {
          d.kill?.()
        } catch (t) {}
      }
      d = null;
      try {
        const a = new ItemStack(t, 1);
        if (d = i.spawnItem(a, {
            x: c.x,
            y: c.y + 1,
            z: c.z
          }), d) {
          _protectedItems.add(d.id);
          try {
            d.clearVelocity?.()
          } catch (t) {}
        }
      } catch (t) {}((t, a = 1) => {
        if (l?.isValid) try {
          l.nameTag = ((t, a = 1) =>
            `§r§l§b§´x${a} ${t.replace(/^minecraft:/,"").replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}`
            )(t, a)
        } catch (t) {}
      })(t, a)
    },
    u = e.items ?? [],
    p = u[0]?.typeId ?? m[0];
  let f = 0,
    _ = 0,
    M = 2;
  system.runTimeout(() => {
    y(m[0], 1);
    const t = system.runInterval(() => {
      if (f++, M--, h++, d?.isValid) {
        try {
          d.teleport({
            x: c.x,
            y: c.y + 1,
            z: c.z
          })
        } catch (t) {}
        try {
          d.clearVelocity?.()
        } catch (t) {}
      }
      if (l?.isValid) try {
        l.teleport({
          x: c.x,
          y: c.y + 1.6,
          z: c.z
        })
      } catch (t) {}
      if (h % 2 == 0)
        for (let t = 0; t < 3; t++) i.spawnParticle(
          "minecraft:water_splash_particle", {
            x: c.x + 1.5 * (Math.random() - .5),
            y: c.y + 1.5 + .5 * Math.random(),
            z: c.z + 1.5 * (Math.random() - .5)
          });
      h % 3 == 0 && i.spawnParticle("minecraft:basic_smoke_particle", {
        x: c.x + 1.2 * (Math.random() - .5),
        y: c.y + 2 + .4 * Math.random(),
        z: c.z + 1.2 * (Math.random() - .5)
      });
      {
        const t = .4 * h;
        i.spawnParticle("minecraft:blue_flame_particle", {
          x: c.x + .4 * Math.cos(t),
          y: c.y + .2 + .04 * h % 1,
          z: c.z + .4 * Math.sin(t)
        })
      }
      if (h % 30 == 0 && _soundAt(i, c, "weather.rain", .6, .9 + .2 *
          Math.random()), h % 50 == 0 && _soundAt(i, c,
          "ambient.weather.thunder", .7, .7 + .3 * Math.random()), M <=
        0) {
        _ = (_ + 1) % m.length;
        const t = f / 100;
        M = Math.max(2, Math.floor(2 + 12 * t)), y(m[_], 1);
        try {
          a.playSound("random.click", {
            pitch: 1.4 - .6 * t,
            volume: .8
          })
        } catch (t) {}
      }
      if (f >= 100) {
        system.clearRun(t);
        const e = u[0]?.amount ?? 1;
        y(p, e);
        try {
          i.runCommand(`weather ${s} 1000`)
        } catch (t) {}
        _stormReveal(i, c, a), a.sendMessage(
          `§r§l§3✦═══ Ganaste ═══✦§r\n§b${u.map(t=>`§e${t.nbt?.nameTag??t.typeId?.replace("minecraft:","")??"?"} §´x${t.amount??1}`).join(", ")}`
          ), system.runTimeout(() => {
          d && _protectedItems.delete(d.id);
          try {
            d?.kill?.()
          } catch (t) {}
          if (d = null, l?.isValid && o?.config) try {
            l.nameTag = _idleLabelText(o.config)
          } catch (t) {}
          r?.()
        }, 20)
      }
    }, 1)
  }, 20)
}

function _stormReveal(t, a, e) {
  _soundAt(t, a, "ambient.weather.thunder", 1, .7), _soundAt(t, a,
    "random.explode", .8, .6);
  try {
    e.playSound("random.levelup", {
      pitch: .7,
      volume: 1
    })
  } catch (t) {}
  try {
    t.runCommand(
      `summon lightning_bolt ${Math.floor(a.x)} ${Math.floor(a.y)} ${Math.floor(a.z)}`
      )
      t.runCommand("effect @e[r=5] fire_resistance 10 10")
  } catch (t) {}
  for (let e = 0; e < 4; e++) system.runTimeout(() => {
    try {
      const n = .3 + .5 * e,
        r = 8 + 4 * e;
      for (let o = 0; o < r; o++) {
        const l = o / r * Math.PI * 2;
        t.spawnParticle("minecraft:water_splash_particle", {
          x: a.x + Math.cos(l) * n,
          y: a.y + .5 + .2 * e,
          z: a.z + Math.sin(l) * n
        })
      }
      for (let r = 0; r < 6; r++) {
        const o = r / 6 * Math.PI * 2 + .3 * e;
        t.spawnParticle("minecraft:blue_flame_particle", {
          x: a.x + Math.cos(o) * n * .8,
          y: a.y + .3 + 1.5 * Math.random(),
          z: a.z + Math.sin(o) * n * .8
        })
      }
    } catch (t) {}
  }, 6 * e);
  for (let e = 0; e < 20; e++) system.runTimeout(() => {
    try {
      t.spawnParticle("minecraft:water_splash_particle", {
        x: a.x + .4 * (Math.random() - .5),
        y: a.y + .5 + .12 * e,
        z: a.z + .4 * (Math.random() - .5)
      })
    } catch (t) {}
  }, 3 * e);
  for (let e = 0; e < 12; e++) system.runTimeout(() => {
    try {
      t.spawnParticle("minecraft:basic_smoke_particle", {
        x: a.x + 1.8 * (Math.random() - .5),
        y: a.y + .3 + 2 * Math.random(),
        z: a.z + 1.8 * (Math.random() - .5)
      })
    } catch (t) {}
  }, 10 + 4 * e);
  system.runTimeout(() => {
    _soundAt(t, a, "ambient.weather.thunder", .7, 1), _soundAt(t, a,
      "weather.rain", .9, .8)
  }, 20)
}

function _fireExplosion(t, a, e) {
  _soundAt(t, a, "random.explode", 1, .9), _soundAt(t, a, "liquid.lava", .9,
  .7);
  try {
    e.playSound("random.levelup", {
      pitch: .9,
      volume: 1
    })
  } catch (t) {}
  for (let e = 0; e < 32; e++) system.runTimeout(() => {
    try {
      const n = e / 32 * Math.PI * 2,
        r = .5 + e / 32 * 1.8;
      t.spawnParticle("minecraft:basic_flame_particle", {
        x: a.x + Math.cos(n) * r,
        y: a.y + .3 + 1.5 * Math.random(),
        z: a.z + Math.sin(n) * r
      })
    } catch (t) {}
  }, Math.floor(.8 * e));
  for (let e = 0; e < 16; e++) system.runTimeout(() => {
    try {
      const n = e / 16 * Math.PI * 2 + .2;
      t.spawnParticle("minecraft:blue_flame_particle", {
        x: a.x + Math.cos(n) * (.8 + .6 * Math.random()),
        y: a.y + .5 + 2 * Math.random(),
        z: a.z + Math.sin(n) * (.8 + .6 * Math.random())
      })
    } catch (t) {}
  }, 5 + Math.floor(1.2 * e));
  for (let e = 0; e < 12; e++) system.runTimeout(() => {
    try {
      const n = e / 12 * Math.PI * 2;
      t.spawnParticle("minecraft:mobflame_single", {
        x: a.x + Math.cos(n) * (.4 + 1 * Math.random()),
        y: a.y + 2.5,
        z: a.z + Math.sin(n) * (.4 + 1 * Math.random())
      })
    } catch (t) {}
  }, 10 + 2 * e);
  for (let e = 0; e < 10; e++) system.runTimeout(() => {
    try {
      t.spawnParticle("minecraft:basic_smoke_particle", {
        x: a.x + 1.5 * (Math.random() - .5),
        y: a.y + .2 + 2.5 * Math.random(),
        z: a.z + 1.5 * (Math.random() - .5)
      })
    } catch (t) {}
  }, 3 * e);
  system.runTimeout(() => {
    _soundAt(t, a, "random.explode", .7, 1.1);
    try {
      e.playSound("random.orb", {
        pitch: 1.4,
        volume: 1
      })
    } catch (t) {}
  }, 15)
}

function _openSouls(t, a, e, n, r) {
  const o = _idleLabels.get(t.id),
    l = o?.labelEntity ?? null;
  try {
    t.playAnimation("animation.crate.open")
  } catch (t) {}
  const c = t.location,
    i = t.dimension;
  _soundAt(i, c, "portal.portal", .9, .7), _soundAt(i, c, "mob.wither.idle", .6,
    1.2);
  const s = _collectAllLotItems(n);
  if (0 === s.length) return void system.runTimeout(() => r?.(), 30);
  let m = null,
    d = 0;
  const h = (t, a = 1) => {
      if (m) {
        _protectedItems.delete(m.id);
        try {
          m.kill?.()
        } catch (t) {}
      }
      m = null;
      try {
        const a = new ItemStack(t, 1);
        if (m = i.spawnItem(a, {
            x: c.x,
            y: c.y + 1,
            z: c.z
          }), m) {
          _protectedItems.add(m.id);
          try {
            m.clearVelocity?.()
          } catch (t) {}
        }
      } catch (t) {}((t, a = 1) => {
        if (l?.isValid) try {
          l.nameTag = ((t, a = 1) =>
            `§r§l§3§´x${a} ${t.replace(/^minecraft:/,"").replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}`
            )(t, a)
        } catch (t) {}
      })(t, a)
    },
    y = e.items ?? [],
    u = y[0]?.typeId ?? s[0];
  let p = 0,
    f = 0,
    _ = 2;
  system.runTimeout(() => {
    h(s[0], 1);
    const t = system.runInterval(() => {
      if (p++, _--, d++, m?.isValid) {
        try {
          m.teleport({
            x: c.x,
            y: c.y + 1,
            z: c.z
          })
        } catch (t) {}
        try {
          m.clearVelocity?.()
        } catch (t) {}
      }
      if (l?.isValid) try {
        l.teleport({
          x: c.x,
          y: c.y + 1.6,
          z: c.z
        })
      } catch (t) {}
      const e = p / 100,
        n = .25 + .9 * e,
        M = 1 - .4 * e,
        x = 6 + Math.floor(6 * e);
      for (let t = 0; t < x; t++) {
        const a = d * n + t / x * Math.PI * 2;
        i.spawnParticle("minecraft:soul_particle", {
          x: c.x + Math.cos(a) * M,
          y: c.y + .2 + (.03 * d + .15 * t) % 1.8,
          z: c.z + Math.sin(a) * M
        })
      }
      if (d % 2 == 0 && i.spawnParticle("minecraft:soul_fire_flame", {
          x: c.x + .3 * (Math.random() - .5),
          y: c.y + .1 + 1 * Math.random(),
          z: c.z + .3 * (Math.random() - .5)
        }), d % 3 == 0) {
        const t = .5 * d;
        i.spawnParticle("minecraft:enchanting_table_particle", {
          x: c.x + Math.cos(t) * (.5 + .3 * e),
          y: c.y + .5 + 1.2 * Math.random(),
          z: c.z + Math.sin(t) * (.5 + .3 * e)
        })
      }
      if (d % 28 == 0 && _soundAt(i, c, "portal.portal", .5, .8 + .5 *
          e), d % 45 == 0 && _soundAt(i, c, "mob.wither.idle", .4, 1.5 +
          .4 * e), _ <= 0) {
        f = (f + 1) % s.length, _ = Math.max(2, Math.floor(2 + 12 * e)),
          h(s[f], 1);
        try {
          a.playSound("random.click", {
            pitch: 1.4 - .6 * e,
            volume: .8
          })
        } catch (t) {}
      }
      if (p >= 100) {
        system.clearRun(t);
        const e = y[0]?.amount ?? 1;
        h(u, e), _soulsReveal(i, c, a), a.sendMessage(
          `§r§l§3✦═══ Ganaste ═══✦§r\n§b${y.map(t=>`§e${t.nbt?.nameTag??t.typeId?.replace("minecraft:","")??"?"} §´x${t.amount??1}`).join(", ")}`
          ), system.runTimeout(() => {
          m && _protectedItems.delete(m.id);
          try {
            m?.kill?.()
          } catch (t) {}
          if (m = null, l?.isValid && o?.config) try {
            l.nameTag = _idleLabelText(o.config)
          } catch (t) {}
          r?.()
        }, 20)
      }
    }, 1)
  }, 20)
}

function _soulsReveal(t, a, e) {
  _soundAt(t, a, "mob.wither.death", 1, 1.1), _soundAt(t, a, "portal.portal", 1,
    .6);
  try {
    e.playSound("random.levelup", {
      pitch: .8,
      volume: 1
    })
  } catch (t) {}
  for (let e = 3; e >= 0; e--) system.runTimeout(() => {
    try {
      const n = .4 + .45 * e,
        r = 10 + 4 * e;
      for (let o = 0; o < r; o++) {
        const l = o / r * Math.PI * 2;
        t.spawnParticle("minecraft:soul_particle", {
          x: a.x + Math.cos(l) * n,
          y: a.y + .5 + .15 * e,
          z: a.z + Math.sin(l) * n
        })
      }
    } catch (t) {}
  }, 5 * e);
  for (let e = 0; e < 5; e++) system.runTimeout(() => {
    try {
      const n = .3 + .55 * e,
        r = 12 + 3 * e;
      for (let o = 0; o < r; o++) {
        const l = o / r * Math.PI * 2 + .25 * e;
        t.spawnParticle("minecraft:soul_particle", {
          x: a.x + Math.cos(l) * n,
          y: a.y + .3 + .3 * e + .4 * Math.random(),
          z: a.z + Math.sin(l) * n
        }), o % 3 == 0 && t.spawnParticle("minecraft:soul_fire_flame", {
          x: a.x + Math.cos(l + .3) * n * .7,
          y: a.y + .5 + 1.8 * Math.random(),
          z: a.z + Math.sin(l + .3) * n * .7
        })
      }
    } catch (t) {}
  }, 20 + 8 * e);
  for (let e = 0; e < 24; e++) system.runTimeout(() => {
    try {
      const n = .55 * e;
      t.spawnParticle("minecraft:soul_particle", {
        x: a.x + Math.cos(n) * (.15 + .02 * e),
        y: a.y + .5 + .18 * e,
        z: a.z + Math.sin(n) * (.15 + .02 * e)
      }), t.spawnParticle("minecraft:enchanting_table_particle", {
        x: a.x + .6 * (Math.random() - .5),
        y: a.y + .3 + .15 * e,
        z: a.z + .6 * (Math.random() - .5)
      })
    } catch (t) {}
  }, 25 + 4 * e);
  system.runTimeout(() => {
    _soundAt(t, a, "mob.wither.idle", .7, 1.6);
    try {
      e.playSound("random.orb", {
        pitch: 1.2,
        volume: 1
      })
    } catch (t) {}
  }, 18), system.runTimeout(() => {
    _soundAt(t, a, "portal.portal", .5, 1)
  }, 40)
}

function _openSakura(t, a, e, n, r) {
  const o = _idleLabels.get(t.id),
    l = o?.labelEntity ?? null;
  try {
    t.playAnimation("animation.crate.open")
  } catch (t) {}
  const c = t.location,
    i = t.dimension;
  _soundAt(i, c, "note.bell", 1, .9), _soundAt(i, c, "note.harp", .8, 1.1),
    _soundAt(i, c, "note.chime", .7, 1.3);
  const s = _collectAllLotItems(n);
  if (0 === s.length) return void system.runTimeout(() => r?.(), 30);
  let m = null,
    d = 0;
  const h = (t, a = 1) => {
      if (m) {
        _protectedItems.delete(m.id);
        try {
          m.kill?.()
        } catch (t) {}
      }
      m = null;
      try {
        const a = new ItemStack(t, 1);
        if (m = i.spawnItem(a, {
            x: c.x,
            y: c.y + 1,
            z: c.z
          }), m) {
          _protectedItems.add(m.id);
          try {
            m.clearVelocity?.()
          } catch (t) {}
        }
      } catch (t) {}((t, a = 1) => {
        if (l?.isValid) try {
          l.nameTag = ((t, a = 1) =>
            `§r§l§d§´x${a} ${t.replace(/^minecraft:/,"").replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}`
            )(t, a)
        } catch (t) {}
      })(t, a)
    },
    y = e.items ?? [],
    u = y[0]?.typeId ?? s[0];
  let p = 0,
    f = 0,
    _ = 2;
  system.runTimeout(() => {
    h(s[0], 1);
    const t = system.runInterval(() => {
      if (p++, _--, d++, m?.isValid) {
        try {
          m.teleport({
            x: c.x,
            y: c.y + 1,
            z: c.z
          })
        } catch (t) {}
        try {
          m.clearVelocity?.()
        } catch (t) {}
      }
      if (l?.isValid) try {
        l.teleport({
          x: c.x,
          y: c.y + 1.6,
          z: c.z
        })
      } catch (t) {}
      const e = p / 100,
        n = .18 + .7 * e,
        M = 1.1 - .45 * e,
        x = 6 + Math.floor(8 * e);
      for (let t = 0; t < x; t++) {
        const a = d * n + t / x * Math.PI * 2;
        i.spawnParticle("minecraft:cherry_leaves_particle", {
          x: c.x + Math.cos(a) * M,
          y: c.y + .2 + (.025 * d + .12 * t) % 1.6,
          z: c.z + Math.sin(a) * M
        })
      }
      if (d % 3 == 0) {
        const t = -d * n * .7;
        i.spawnParticle("minecraft:snowflake_particle", {
          x: c.x + Math.cos(t) * (.7 * M),
          y: c.y + .4 + 1.2 * Math.random(),
          z: c.z + Math.sin(t) * (.7 * M)
        })
      }
      if (d % 4 == 0 && i.spawnParticle(
          "minecraft:enchanting_table_particle", {
            x: c.x + .8 * (Math.random() - .5),
            y: c.y + .3 + 1.4 * Math.random(),
            z: c.z + .8 * (Math.random() - .5)
          }), e > .7 && d % 8 == 0 && i.spawnParticle(
          "minecraft:heart_particle", {
            x: c.x + .5 * (Math.random() - .5),
            y: c.y + .8 + .8 * Math.random(),
            z: c.z + .5 * (Math.random() - .5)
          }), d % Math.max(8, Math.floor(35 - 25 * e)) === 0 &&
        _soundAt(i, c, "note.bell", .5, 1 + .6 * e), _ <= 0) {
        f = (f + 1) % s.length, _ = Math.max(2, Math.floor(2 + 12 * e)),
          h(s[f], 1);
        try {
          a.playSound("random.click", {
            pitch: 1.4 - .6 * e,
            volume: .8
          })
        } catch (t) {}
      }
      if (p >= 100) {
        system.clearRun(t);
        const e = y[0]?.amount ?? 1;
        h(u, e), _sakuraReveal(i, c, a), a.sendMessage(
          `§r§l§d✦═══ Ganaste ═══✦§r\n§5${y.map(t=>`§e${t.nbt?.nameTag??t.typeId?.replace("minecraft:","")??"?"} §´x${t.amount??1}`).join(", ")}`
          ), system.runTimeout(() => {
          m && _protectedItems.delete(m.id);
          try {
            m?.kill?.()
          } catch (t) {}
          if (m = null, l?.isValid && o?.config) try {
            l.nameTag = _idleLabelText(o.config)
          } catch (t) {}
          r?.()
        }, 20)
      }
    }, 1)
  }, 20)
}

function _sakuraReveal(t, a, e) {
  _soundAt(t, a, "note.bell", 1, .7), _soundAt(t, a, "note.chime", 1, 1),
    _soundAt(t, a, "random.levelup", .9, 1.1);
  try {
    e.playSound("random.levelup", {
      pitch: 1.1,
      volume: 1
    })
  } catch (t) {}
  try {
    t.runCommand(
      `particle minecraft:cherry_leaves_particle ${Math.floor(a.x)} ${Math.floor(a.y+1)} ${Math.floor(a.z)}`
      )
  } catch (t) {}
  for (let e = 0; e < 5; e++) system.runTimeout(() => {
    try {
      const n = .3 + .5 * e,
        r = 12 + 4 * e;
      for (let o = 0; o < r; o++) {
        const l = o / r * Math.PI * 2 + .3 * e;
        t.spawnParticle("minecraft:cherry_leaves_particle", {
          x: a.x + Math.cos(l) * n,
          y: a.y + .4 + .25 * e + .3 * Math.random(),
          z: a.z + Math.sin(l) * n
        }), o % 4 == 0 && t.spawnParticle(
        "minecraft:snowflake_particle", {
          x: a.x + Math.cos(l + .4) * n * .8,
          y: a.y + .5 + 1.5 * Math.random(),
          z: a.z + Math.sin(l + .4) * n * .8
        })
      }
    } catch (t) {}
  }, 7 * e);
  for (let e = 0; e < 20; e++) system.runTimeout(() => {
    try {
      const n = e / 20 * Math.PI * 2,
        r = .2 + 1.2 * Math.random();
      t.spawnParticle("minecraft:heart_particle", {
        x: a.x + Math.cos(n) * r,
        y: a.y + .5 + 2 * Math.random(),
        z: a.z + Math.sin(n) * r
      })
    } catch (t) {}
  }, 15 + 5 * e);
  for (let e = 0; e < 28; e++) system.runTimeout(() => {
    try {
      const n = .45 * e,
        r = .2 + .025 * e;
      t.spawnParticle("minecraft:heart_particle", {
        x: a.x + Math.cos(n) * r,
        y: a.y + .3 + .16 * e,
        z: a.z + Math.sin(n) * r
      }), e % 3 == 0 && t.spawnParticle(
        "minecraft:enchanting_table_particle", {
          x: a.x + .5 * (Math.random() - .5),
          y: a.y + .2 + .14 * e,
          z: a.z + .5 * (Math.random() - .5)
        })
    } catch (t) {}
  }, 20 + 4 * e);
  system.runTimeout(() => {
    try {
      t.runCommand(
        `particle minecraft:cherry_leaves_particle ${Math.floor(a.x)} ${Math.floor(a.y+2)} ${Math.floor(a.z)}`
        )
    } catch (t) {}
    _soundAt(t, a, "note.bell", .8, 1.4), _soundAt(t, a, "note.harp", .7,
      1.6)
  }, 12), system.runTimeout(() => {
    _soundAt(t, a, "note.chime", .6, 1.8);
    try {
      e.playSound("random.orb", {
        pitch: 1.5,
        volume: .9
      })
    } catch (t) {}
  }, 35)
}

function _openEnder(t, a, e, n, r) {
  const o = _idleLabels.get(t.id),
    l = o?.labelEntity ?? null;
  try {
    t.playAnimation("animation.crate.open")
  } catch (t) {}
  const c = t.location,
    i = t.dimension,
    s = _collectAllLotItems(n);
  if (0 === s.length) return void system.runTimeout(() => r?.(), 30);
  const m = e.items ?? [],
    d = m[0]?.typeId ?? s[0],
    h = m[0]?.amount ?? 1;
  system.runTimeout(() => {
    _soundAt(i, c, "portal.portal", 1, .6), _soundAt(i, c,
      "mob.endermen.idle", .7, .8);
    const t = c.y + 1;
    let e = 0,
      n = null;
    try {
      const t = new ItemStack("minecraft:ender_chest", 1);
      if (n = i.spawnItem(t, {
          x: c.x,
          y: c.y + .5,
          z: c.z
        }), n) {
        _protectedItems.add(n.id);
        try {
          n.clearVelocity?.()
        } catch (t) {}
      }
    } catch (t) {}
    if (l?.isValid) try {
      l.nameTag = "§r§l§5✦ Ender Crate ✦"
    } catch (t) {}
    const s = system.runInterval(() => {
      e++;
      const y = Math.min(e / 18, 1),
        u = c.y + .5 + (t - c.y - .5) * y,
        p = .45 * e;
      if (n?.isValid) try {
        n.teleport({
          x: c.x + .25 * Math.cos(p),
          y: u,
          z: c.z + .25 * Math.sin(p)
        }), n.clearVelocity?.()
      } catch (t) {}
      if (y < 1) {
        for (let t = 0; t < 4; t++) i.spawnParticle(
        "minecraft:endrod", {
          x: c.x + .12 * (Math.random() - .5),
          y: u - .1 - .12 * t,
          z: c.z + .12 * (Math.random() - .5)
        });
        e % 2 == 0 && i.spawnParticle(
          "minecraft:conduit_absorb_particle", {
            x: c.x + .3 * (Math.random() - .5),
            y: u - .25,
            z: c.z + .3 * (Math.random() - .5)
          })
      }
      for (let t = 0; t < 3; t++) {
        const a = .3 * e + t / 3 * Math.PI * 2,
          n = .3 + .2 * y;
        i.spawnParticle("minecraft:conduit_absorb_particle", {
          x: c.x + Math.cos(a) * n,
          y: u + .1 * Math.sin(.15 * e + t),
          z: c.z + Math.sin(a) * n
        })
      }
      e % 20 == 0 && _soundAt(i, c, "portal.portal", .5, .9 + .3 * y),
        e >= 58 && (system.clearRun(s), _enderPhase2(i, c, {
          x: c.x,
          y: t,
          z: c.z
        }, n, l, o, a, m, d, h, r))
    }, 1)
  }, 20)
}

function _enderPhase2(t, a, e, n, r, o, l, c, i, s, m) {
  const d = system.runInterval(() => {
    if (n?.isValid) try {
      n.teleport({
        x: e.x,
        y: e.y,
        z: e.z
      }), n.clearVelocity?.()
    } catch (t) {}
  }, 1);
  _soundAt(t, e, "mob.endermen.scream", .9, .7);
  for (let a = 0; a < 8; a++) system.runTimeout(() => {
    try {
      const n = 2 * (1 - a / 8);
      for (let a = 0; a < 20; a++) {
        const r = a / 20 * Math.PI * 2;
        t.spawnParticle("minecraft:sculk_soul_particle", {
          x: e.x + Math.cos(r) * n,
          y: e.y + .1,
          z: e.z + Math.sin(r) * n
        }), a % 4 == 0 && t.spawnParticle(
          "minecraft:conduit_absorb_particle", {
            x: e.x + Math.cos(r + .15) * n * .8,
            y: e.y + .2,
            z: e.z + Math.sin(r + .15) * n * .8
          })
      }
    } catch (t) {}
  }, 1 * a);
  system.runTimeout(() => _soundAt(t, e, "portal.portal", 1, 1.5), 5), system
    .runTimeout(() => _soundAt(t, e, "mob.endermen.portal", .9, .7), 12), system
    .runTimeout(() => {
      if (system.clearRun(d), n) {
        _protectedItems.delete(n.id);
        try {
          n.kill?.()
        } catch (t) {}
      }
      _soundAt(t, e, "random.explode", 1, .55), _soundAt(t, e,
        "mob.endermen.portal", 1, .5);
      try {
        l.playSound("random.levelup", {
          pitch: .75,
          volume: 1
        })
      } catch (t) {}
      let a = 0;
      const h = system.runInterval(() => {
        a++;
        const n = a / 25,
          r = .2 + 3 * n,
          o = 10 + Math.floor(14 * n);
        for (let n = 0; n < o; n++) {
          const l = n / o * Math.PI * 2 + .2 * a;
          t.spawnParticle("minecraft:green_flame_particle", {
            x: e.x + Math.cos(l) * r,
            y: e.y + .2 + .4 * Math.sin(.4 * a + n),
            z: e.z + Math.sin(l) * r
          }), n % 2 == 0 && t.spawnParticle("minecraft:endrod", {
            x: e.x + Math.cos(l + .3) * r * .75,
            y: e.y + 2 * Math.random(),
            z: e.z + Math.sin(l + .3) * r * .75
          })
        } {
          const r = .8 * a,
            o = .05 + .3 * n;
          t.spawnParticle("minecraft:endrod", {
            x: e.x + Math.cos(r) * o,
            y: e.y + 4.5 * n,
            z: e.z + Math.sin(r) * o
          }), t.spawnParticle("minecraft:portal_particle", {
            x: e.x + .4 * (Math.random() - .5),
            y: e.y + 4 * n,
            z: e.z + .4 * (Math.random() - .5)
          })
        }
        t.spawnParticle("minecraft:wax_on_particle", {
          x: e.x + (Math.random() - .5) * (1.6 * r),
          y: e.y + 2.8 * Math.random(),
          z: e.z + (Math.random() - .5) * (1.6 * r)
        }), a >= 25 && system.clearRun(h)
      }, 1);
      system.runTimeout(() => {
        _soundAt(t, e, "mob.endermen.idle", .7, 1.6);
        try {
          l.playSound("random.orb", {
            pitch: 1.3,
            volume: 1
          })
        } catch (t) {}
      }, 10);
      let y = null;
      try {
        const a = new ItemStack(i, 1);
        if (y = t.spawnItem(a, {
            x: e.x,
            y: e.y,
            z: e.z
          }), y) {
          _protectedItems.add(y.id);
          try {
            y.clearVelocity?.()
          } catch (t) {}
        }
      } catch (t) {}
      if (r?.isValid) {
        const t = i.replace(/^minecraft:/, "").replace(/_/g, " ").replace(
          /\b\w/g, t => t.toUpperCase());
        try {
          r.nameTag = `§r§l§5§´x${s} ${t}`
        } catch (t) {}
      }
      l.sendMessage(
        `§r§l§5✦═══ Ganaste ═══✦§r\n§d${c.map(t=>`§e${t.nbt?.nameTag??t.typeId?.replace("minecraft:","")??"?"} §´x${t.amount??1}`).join(", ")}`
        );
      const u = system.runInterval(() => {
        if (y?.isValid) {
          try {
            y.teleport({
              x: e.x,
              y: e.y,
              z: e.z
            })
          } catch (t) {}
          try {
            y.clearVelocity?.()
          } catch (t) {}
        }
      }, 1);
      system.runTimeout(() => {
        system.clearRun(u), y && _protectedItems.delete(y.id);
        try {
          y?.kill?.()
        } catch (t) {}
        if (r?.isValid && o?.config) try {
          r.nameTag = _idleLabelText(o.config)
        } catch (t) {}
        m?.()
      }, 100)
    }, 20)
}