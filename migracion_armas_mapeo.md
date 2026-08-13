# Tabla de Equivalencias — Migración TACZBE → EACRebootB
> Generado en Fase 0. No se modificó ningún archivo durante esta auditoría.

---

## Diferencias técnicas clave entre mods

| Aspecto | TACZBehavi (viejo) | EACRebootB (nuevo) |
|---|---|---|
| Namespace armas | `krep:` | `krep:` (mismo namespace) |
| Stats centrales | `global.js` → `globalThis.Indoarsenal.bullets` | `bulletHit.js` → `const WEAPONS` |
| Campos de daño | `damage`, `penetration` | `damage`, `armorPen`, `protPen`, `maxDistance`, `adsSpread`, `hipSpread` |
| Sistema armadura | **No existe en TACZBE** — la lógica está en `bulletHit.js` de EAC | `calcDamage()` en `bulletHit.js` con `ARMOR_VALS` vanilla |
| Munición | `krep:mm556`, `krep:m43`, etc. | Mismo sistema `krep:` — `quantity.js` gestiona el conteo |
| Bug munición | Scoreboard por arma (`scarh`, `akm`…) → no persiste | **Mismo bug**: scoreboard se resetea al salir/entrar |
| Pistola única EAC | — | `krep:qsz92` (pistola QSZ-92, daño 6.0) |

---

## Tabla de equivalencias TACZBE → EACRebootB

### EXCEPCIONES — No se tocan en ninguna fase
| TACZBE ID | Nombre | Motivo |
|---|---|---|
| `krep:rpg` | RPG | Excepción explícita |
| `krep:minigun` | Minigun / Winchester | Excepción explícita |
| `krep:awp` | AWP / Sniper | Excepción explícita |
| `krep:lapua338` / `krep:lapua308` | Balas Lapua | Munición del AWP |
| `krep:m885` | M88.5 | Sniper TACZ sin equivalente EAC — excepción por uso en NPC/loot |
| `krep:win308` | Win 308 | Sniper TACZ sin equivalente EAC — excepción por uso en NPC/loot |

---

### Rifles de Asalto
| TACZBE ID | Nombre TACZ | Daño TACZ | EACRebootB ID | Nombre EAC | Daño EAC orig | Daño tras Fase 1 | Razón mapeo |
|---|---|---|---|---|---|---|---|
| `krep:m4a1` | M4A1 | 8 / pen 0.65 | `krep:type95` | Type 95 | 6.5 | **8.0** | AR estándar occidental → AR estándar más similar |
| `krep:akm` | AKM | 9 / pen 0.65 | `krep:ak12` | AK-12 | 6.2 | **9.0** | AK ruso → AK más moderno |
| `krep:hk416` | HK416 | 5 / pen 0.6 | `krep:hk416` | HK416 | 6.0 | **5.0** | Mismo arma, mapeo directo |
| `krep:scarl` | SCAR-L | 7 / pen 0.65 | `krep:k2` | K2 | 6.1 | **7.0** | AR calibre 5.56 similar |
| `krep:m16` | M16 | 6 / pen 0.6 | `krep:m16a4` | M16A4 | 6.0 | **6.0** | Mismo arma familia, daño igual |
| `krep:m16a1` | M16A1 | 6 / pen 0.6 | `krep:t112` | T112 | 6.0 | **6.0** | AR 5.56 equivalente |
| `krep:g36` | G36K | 7 / pen 0.65 | `krep:type89` | Type 89 | 6.5 | **7.0** | AR europeo → equivalente japonés similar |
| `krep:qbz95` | QBZ-95 | 7 / pen 0.7 | `krep:qjb95` | QJB-95 (LMG) | 6.2 | **7.0** | Familia QBZ-95 directa |
| `krep:qbz191` | QBZ-191 | 7 / pen 0.7 | `krep:qbz191` | QBZ-191 | 6.2 | **7.0** | Mismo arma, mapeo directo |
| `krep:type81` | Type 81 | 9 / pen 0.65 | `krep:arka` | ARKA | 6.0 | **9.0** | AR ruso/chino de alta potencia |

### Battle Rifles / DMR
| TACZBE ID | Nombre TACZ | Daño TACZ | EACRebootB ID | Nombre EAC | Daño EAC orig | Daño tras Fase 1 | Razón mapeo |
|---|---|---|---|---|---|---|---|
| `krep:scarh` | SCAR-H | 9 / pen 0.7 | `krep:m7` | M7 | 8.0 | **9.0** | Battle rifle 7.62 de alta pen. |
| `krep:fal` | FAL | 9 / pen 0.7 | `krep:qbu191` | QBU-191 (DMR) | 8.0 | **9.0** | Rifle potente larga distancia |
| `krep:g3` | G3 | 9 / pen 0.7 | `krep:m8` | M8 | 7.8 | **9.0** | Battle rifle europeo potente |
| `krep:mk14` | MK14 | 13 / pen 0.7 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva en EAC |
| `krep:sks` | SKS | 11 / pen 0.65 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva en EAC |
| `krep:evolys` | Evolys (LMG) | 10 / pen 0.6 | `krep:qjb201` | QJB-201 (LMG) | 6.2 | **10.0** | LMG de alta cadencia |
| `krep:m249` | M249 (LMG) | 7 / pen 0.65 | `krep:type882` | Type 88-2 (LMG) | 5.5 | **7.0** | LMG equivalente |

### SMGs
| TACZBE ID | Nombre TACZ | Daño TACZ | EACRebootB ID | Nombre EAC | Daño EAC orig | Daño tras Fase 1 | Razón mapeo |
|---|---|---|---|---|---|---|---|
| `krep:mp5` | MP5 | 6.5 / pen 0.45 | `krep:qcq171` | QCQ-171 (SMG) | 4.6 | **6.5** | SMG compacto equivalente |
| `krep:uzi` | UZI | 5 / pen 0.3 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva |
| `krep:vector` | Vector | 6 / pen 0.4 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva |
| `krep:ump` | UMP-45 | 6.7 / pen 0.4 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva |
| `krep:mp7` | MP7 | 4 / pen 0.7 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva |
| `krep:p90` | P90 | 4 / pen 0.7 | — | — | — | — | **SIN EQUIVALENTE** — requiere entrada nueva |

> **Nota Fase 3:** Los SMGs sin equivalente mantendrán sus identifiers `krep:` actuales de TACZ por compatibilidad con loot tables y NPC — solo se actualizarán sus stats via un nuevo entry en el WEAPONS de bulletHit.js.

### Pistolas
| TACZBE ID | Nombre TACZ | Daño TACZ | EACRebootB ID | Nombre EAC | Daño EAC orig | Daño tras Fase 1 | Razón mapeo |
|---|---|---|---|---|---|---|---|
| `krep:g17` | Glock 17 | 6 / pen 0.5 | `krep:qsz92` | QSZ-92 (única pistola EAC) | 6.0 | **6.0** | Única pistola EAC — daño ya coincide |
| `krep:g18` | Glock 18 | 3 / pen 0.3 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:g18` de TACZ |
| `krep:m1911` | M1911 | 11 / pen 0.3 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:m1911` de TACZ |
| `krep:p320` | P320 | 10 / pen 0.3 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:p320` de TACZ |
| `krep:deagle` | Desert Eagle | 16 / pen 0.5 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:deagle` de TACZ |
| `krep:deagleg` | Deagle Gold | 12 / pen 0.7 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:deagle` de TACZ |
| `krep:b93` | Beretta 93R | 4 / pen 0.4 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:b93r` de TACZ |
| `krep:cp` | CP | 12 / pen 0.7 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:cp` de TACZ |
| `krep:t50` | Timeless 50 | 16 / pen 0.5 | — | — | — | — | **SIN EQUIVALENTE** — mantiene `krep:t50` de TACZ |

### Escopetas
| TACZBE ID | Nombre TACZ | Daño TACZ | Equivalente EAC | Nota |
|---|---|---|---|---|
| `krep:m870` | M870 | 3×pellets / pen 0.5 | **SIN EQUIVALENTE** — mantiene `krep:m870` | EAC no tiene shotguns |
| `krep:aa12` | AA-12 | 2×pellets / pen 0.1 | **SIN EQUIVALENTE** — mantiene `krep:aa12` | — |
| `krep:saiga12` | Saiga-12 | 2×pellets / pen 0.3 | **SIN EQUIVALENTE** — mantiene `krep:saiga12` | — |
| `krep:m1014` | M1014 | 3×pellets / pen 0.4 | **SIN EQUIVALENTE** — mantiene `krep:m1014` | — |
| `krep:db` | Double Barrel | 3×pellets / pen 0.3 | **SIN EQUIVALENTE** — mantiene `krep:db` | — |

---

## Munición — Tabla de equivalencias

EACRebootB usa los mismos IDs de munición `krep:` que TACZBE en `quantity.js`. La munición es compartida entre mods.

| ID Munición | Usada por TACZ | Usada por EAC | Acción |
|---|---|---|---|
| `krep:mm556` | m16, m16a1, qbz95, scarl | hk416, k2, t112, m16a4, type89, type95, arka | Compartida — no tocar |
| `krep:mm545` | (ninguna en TACZ) | ak12, type88, type882 | Solo EAC — agregar a crafteo si no existe |
| `krep:mm9` | mp5, uzi, g17, g18 | qcq171 | Compartida |
| `krep:m43` | akm, type81, sks | (ninguna EAC directa) | Solo TACZ ARs |
| `krep:mm5842` | qbz191, qbz95 | type95, qjb95, qjb201, qbz191, qbu191 | Compartida |
| `krep:mm5821` | (ninguna TACZ) | qsz92 | Solo EAC |
| `krep:fury277` | (ninguna TACZ) | m7, m8 | Solo EAC — agregar a crafteo/loot |
| `krep:acp45` | ump, m1911 | (ninguna EAC) | Solo TACZ |
| `krep:gauge12` | m870, aa12, saiga12, m1014, db | (ninguna EAC) | Solo TACZ shotguns |
| `krep:ae50` | deagle, t50, cp, deagleg | (ninguna EAC) | Solo TACZ pistolas |
| `krep:mag357` | — | — | Solo en loot tables |
| `krep:win308` / `krep:lapua338` | awp (excepción) | — | Excepción — no tocar |

---

## Armas EACRebootB SIN equivalente en TACZBE (nuevas)
Estas armas no tienen par en TACZBE. Sus stats originales de EAC se conservan, solo se les crea receta nueva escalada por daño.

| ID | Nombre | Daño EAC | Tipo | Precio NPC propuesto |
|---|---|---|---|---|
| `krep:type88` / `krep:type882` | Type 88 / Type 88-2 | 6.0 / 5.5 | LMG | 7500 / 6800 |
| `krep:qsz92` | QSZ-92 | 6.0 | Pistola | 2500 |
| `krep:m7` | M7 | 8.0 | Battle Rifle | 8500 |
| `krep:m8` | M8 | 7.8 | AR/BR | 8000 |
| `krep:qbu191` | QBU-191 | 8.0 | DMR | 9500 |
| `krep:arka` | ARKA | 6.0 | AR | 6500 |

---

## Sistema de munición — Bug de persistencia (Fase 6)

**Cómo funciona actualmente:**
- `quantity.js` gestiona cada arma EAC con un scoreboard individual (ej: `ak12`, `hk416`)
- Al disparar, el scoreboard baja; al recargar, se consume munición del inventario
- **Bug:** el scoreboard no persiste entre sesiones — al reconectarse, el valor del scoreboard se resetea a 0 (vacío) o al máximo según la implementación, haciendo que el arma aparezca cargada aunque el jugador no tenga munición

**Solución Fase 6:** Usar `dynamic properties` del jugador en lugar de scoreboards para almacenar la munición actual de cada arma.

---

## Sistema de armadura — Fase 2

**TACZBehavi SÍ tiene sistema propio de reducción de daño por armadura.** Está en dos scripts:

### `armorDetection.js`
Exporta 5 objetos con valores de reducción por pieza:
- `armorProtection` — armadura vanilla (leather/chainmail/iron/diamond/netherite/golden) por slot
- `deadzonVestProtection` — chalecos DZ, reducción body (15%–45%)
- `deadzonHelmetProtection` — cascos DZ, reducción headshot (2%–65%)
- `deadzonTopProtection` — ropa superior DZ, suma al body (3%–26%)
- `deadzonBottomProtection` — pantalones DZ, suma al body (2%–18%)

### `projectileHitEntity.js`
Importa los objetos de `armorDetection.js` y aplica la reducción en `world.afterEvents.projectileHitEntity`. Lógica:
- Lee equip del jugador por slot (Chest/Head/Legs)
- Prioriza armadura DZ; si no hay, usa vanilla
- Headshot: daño ×2, reducido por `helmetReduction` + penetración
- Bodyshot: `vestReduction + topReduction + bottomReduction` (máx 90%) + penetración
- La fórmula es: `damage * (1 - reduction * penFactor)` donde `penFactor = 1 - pen * 0.45`
- El daño final se aplica con `healthComp.setCurrentValue()`
- Usa `processedProjectiles` Set para deduplicar impactos

**Acción Fase 2:** Portar esta lógica completa al sistema EACRebootB. EAC ya usa `eac:ticking_damage` dynamic property + `applyDamage` en el loop. Hay que integrar la lectura de armadura DZ dentro de `fireHitscan()` en `bulletHit.js`, en el punto donde calcula el daño antes de asignarlo a `eac:ticking_damage`.

---

## Archivos player.json a limpiar (Fase 7)

| Archivo | Contenido — qué limpiar |
|---|---|
| `behavior_packs/TACZBehavi/entities/plalyer.json` (BP) | Propiedades entity: `krep:movement`, `krep:view`, `krep:bulletcache`, `krep:bulletcachemk2`, `krep:stock/grip/magazine/laser/muzzle/selector/ammoreload`, y todas las propiedades de scope/recoil por arma (`krep:akmrecoil`, `krep:m4a1scope`, etc.). Component groups: todos los `krep:*_fires`/`krep:*_firest` de armas no exceptuadas. Animations + scripts: referencias a armas no exceptuadas. |
| `resource_packs/TACZResour/entity/player.entity.json` (RP) | Textures: todas las entradas de armas no exceptuadas (m16a1, vector, deagle, hk416, g3, fal, p90, scarh, mp5, g17, g18, m870, scarl, akm, m4a1, m1911, g36, mp7, uzi, db, saiga12, ump, qbz95, b93, sks, t50, m1014, cp, qbz191, p320, mk14, evolys, m249, type81). Geometries: ídem. Scripts/pre_animation/animate: referencias a esas armas. Conservar: rpg, awp, minigun y sus variantes _emp. |

---

## Estado de la migración

### Completado
- Fase 0: Tabla de equivalencias (`migracion_armas_mapeo.md`) ✓
- Fase 1: Daños y penetración ajustados en `bulletHit.js` ✓
- Fase 2: Sistema de armadura DZ portado a `bulletHit.js` ✓
- Fase 3: Crafteos reemplazados en mesa de armas ✓
- Fase 4: NPC Ingeniero actualizado ✓
- Fase 5: Loot tables DeadZone actualizadas ✓
- Fase 6: Bug de munición — `ammoPersist.js` creado y registrado ✓
- Fase 8: PlugsEssentials actualizado (GameMode, DailyMissions, TutorialMissions, CrateTZImporter) ✓

### Pendiente (diferido hasta verificación en juego)
- **Fase 7 — Limpieza de player.json TACZBE**: Los archivos `TACZBehavi/entities/plalyer.json` (BP) y `TACZResour/entity/player.entity.json` (RP) contienen cientos de component groups y texturas de armas eliminadas. Se conservan temporalmente porque TACZBE sigue activo para RPG/Minigun/AWP. Limpiar solo las secciones de armas eliminadas sin romper las excepciones requiere edición manual quirúrgica del archivo de 2281 líneas. Hacerlo después de confirmar que el juego funciona.

### Notas importantes para pruebas
- Las armas EAC usan `scriptevent eac:hitscan_activate <weapon_name>` para disparar
- La munición en cámara ahora persiste entre sesiones via dynamic properties `eac:ammo_<scoreboardId>`
- El sistema de armadura DZ ahora aplica headshot x2 + reducción por casco DZ, y bodyshot con chaleco+top+pantalón
- Las loot tables drop_supply.json aún puede tener armas antiguas — verificar en juego

### Cajas que contienen armas/munición TACZBE
| Archivo | Items krep: encontrados |
|---|---|
| `loots/civilian.json` | Armas: m1911, g17, deagle, mp5, m870, saiga12 + versiones _emp. Munición: mm9, acp45, m885, gauge12, mag357 |
| `loots/desert.json` | Armas: akm, fal, g3, m16a1, deagle, g17, mp5, ump, m870, sks + _emp. Munición: m885, mm9, m43, gauge12, acp45, mag357, win308 |
| `loots/woodland.json` | Munición: mm9, acp45, gauge12, mm556, m43, win308, lapua338 + armas (verificar) |
| `loots/artic.json` | Por verificar (similar a woodland/desert) |
| `loots/rare.json` | Por verificar |
| `supply_drop/drop_ak74.json` | akm + akm_emp + m43 |
| `supply_drop/drop_ak47.json` | akm + akm_emp + m43 |
| `supply_drop/drop_aks74u.json` | mp7 + mp7_emp + mm4630 |
| `supply_drop/drop_asval.json` | hk416 + hk416_emp + m885 |
| `supply_drop/drop_awm.json` | awp + awp_emp + lapua338 (**EXCEPCIÓN — no tocar**) |
| `supply_drop/drop_supply.json` | (verificar en Fase 5) |

---

## Referencias TACZBE en PlugsEssentials
- `GameModeSystem.js`: verificar kits del coliseo que puedan referenciar `krep:` armas TACZ
- `DailyMissions.js`: verificar si hay misiones de "matar con X arma" que referencien `krep:` de TACZ
- `Jobs.js`: el sistema de trabajos monitorea `entityDie` — puede tener referencias a armas específicas

*Auditoría detallada de PlugsEssentials se realiza en Fase 8.*
