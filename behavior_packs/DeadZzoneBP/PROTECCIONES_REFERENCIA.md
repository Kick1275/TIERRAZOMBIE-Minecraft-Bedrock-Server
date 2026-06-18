# Referencia de Protección contra Disparos — DeadZzone

## Cómo funciona el sistema

Cada bala tiene un **daño base** y un **multiplicador de zona**:
- Cuerpo: x1.0
- Cabeza: x(headshotMultiplier) — solo si el casco está en la lista
- Pierna: x0.25
- Agachado (sneaking): daño final x1.64

La armadura **resta** del multiplicador de daño:
```
daño_final = daño_base × (multiplicador_zona - protección_armadura)
```

Ejemplo: AK47 (daño 10) al cuerpo con tactical_vest_black (0.8):
→ 10 × (1.0 - 0.8) = **2 de daño**

---

## Daño base por arma

| Arma            | Daño base | Headshot x |
|-----------------|-----------|------------|
| M1911           | 7         | x2.0       |
| Makarov         | 8         | x2.0       |
| Glock 17        | 8         | x2.0       |
| VZ65            | 8         | x2.0       |
| UMP-45          | 9         | x2.1       |
| M16A1 / M16A2   | 9         | x2.8       |
| AK47 / AK74     | 10        | x2.8       |
| AKS74U          | 10        | x2.2       |
| Anaconda        | 10        | x3.0       |
| AS VAL          | 10        | x2.7       |
| FAMAS           | 10        | x2.8       |
| M4A1            | 10        | x2.8       |
| MP5             | 10        | x2.3       |
| RPK             | 10        | x2.8       |
| SS1             | 12        | x2.8       |
| L2A3            | 10        | x2.3       |
| FAL             | 10        | x2.8       |
| Python          | 10        | x2.8       |
| M14             | 13        | x2.7       |
| M870 / M1897    | 13        | x4.0       |
| IZH-43          | 13        | x4.0       |
| M1014           | 12        | x2.0       |
| M1894C          | 12        | x2.0       |
| SKS             | 14        | x2.8       |
| CZ527           | 15        | x3.0       |
| Garand          | 15        | x3.0       |
| Mosin           | 15        | x3.0       |
| SVD             | 15        | x3.2       |
| L96A1           | 17        | x3.0       |

---

## CHALECOS — Reducción de daño al cuerpo

| ID                        | Reducción | Daño recibido (AK47 base 10) |
|---------------------------|-----------|-------------------------------|
| `mcpe:webbing_*` (x4)     | 0.2 (20%) | 8.0                           |
| `mcpe:biker_vest`         | 0.2 (20%) | 8.0                           |
| `mcpe:biker_skull_vest`   | 0.2 (20%) | 8.0                           |
| `mcpe:reflective_vest_*`  | 0.2 (20%) | 8.0                           |
| `mcpe:hunting_vest_brown` | 0.2 (20%) | 8.0                           |
| `mcpe:chest_rig_*` (x4)   | 0.3 (30%) | 7.0                           |
| `mcpe:stab_vest_grey`     | 0.5 (50%) | 5.0                           |
| `mcpe:stab_vest_white`    | 0.5 (50%) | 5.0                           |
| `mcpe:stab_vest_tan`      | 0.5 (50%) | 5.0                           |
| `mcpe:press_vest`         | 0.5 (50%) | 5.0                           |
| `mcpe:assault_vest_black` | 0.6 (60%) | 4.0                           |
| `mcpe:assault_vest_olive` | 0.6 (60%) | 4.0                           |
| `mcpe:police_vest`        | 0.6 (60%) | 4.0                           |
| `mcpe:plate_vest_black`   | 0.7 (70%) | 3.0                           |
| `mcpe:plate_vest_white`   | 0.7 (70%) | 3.0                           |
| `mcpe:plate_vest_olive`   | 0.7 (70%) | 3.0                           |
| `mcpe:plate_vest_tan`     | 0.7 (70%) | 3.0                           |
| `mcpe:tactical_vest_black`| 0.8 (80%) | 2.0                           |
| `mcpe:tactical_vest_white`| 0.8 (80%) | 2.0                           |
| `mcpe:tactical_vest_olive`| 0.8 (80%) | 2.0                           |
| `mcpe:tactical_vest_tan`  | 0.8 (80%) | 2.0                           |
| `mcpe:combat_vest_white`  | 0.8 (80%) | 2.0                           |
| `mcpe:combat_vest_olive`  | 0.8 (80%) | 2.0                           |
| `mcpe:combat_vest_tan`    | 0.8 (80%) | 2.0                           |
| `minecraft:netherite_chestplate` | 0.9 (90%) | 1.0                  |

> Ropa normal (tops/bottoms) **NO aparece** en ARMOR_PROTECTION → reducción 0%, recibe daño completo.

---

## CASCOS — Reducción de daño a la cabeza (headshot)

| ID                            | Reducción | Headshot AK47 (10×2.8=28) recibido |
|-------------------------------|-----------|--------------------------------------|
| `mcpe:mask_troll/smile/anon`  | 0.2 (20%) | 22.4                                 |
| `mcpe:respirator`             | 0.2 (20%) | 22.4                                 |
| `minecraft:golden_helmet`     | 0.2 (20%) | 22.4                                 |
| `mcpe:gasmask_white`          | 0.3 (30%) | 19.6                                 |
| `mcpe:gasmask_black`          | 0.3 (30%) | 19.6                                 |
| `mcpe:welder_mask`            | 0.3 (30%) | 19.6                                 |
| `mcpe:hard_helm_*` (x4)       | 0.3 (30%) | 19.6                                 |
| `mcpe:tac_gasmask`            | 0.4 (40%) | 16.8                                 |
| `mcpe:biker_helmet_*` (x5)    | 0.4 (40%) | 16.8                                 |
| `mcpe:firefighter_helm`       | 0.4 (40%) | 16.8                                 |
| `mcpe:great_helm`             | 0.6 (60%) | 11.2                                 |
| `mcpe:riot_helmet`            | 0.7 (70%) | 8.4                                  |
| `mcpe:tactical_helmet_*` (x4) | 0.7 (70%) | 8.4                                  |
| `mcpe:untar_helmet`           | 0.7 (70%) | 8.4                                  |
| `mcpe:army_helmet_*` (x3)     | 0.7 (70%) | 8.4                                  |
| `mcpe:ballistic_helmet_*` (x4)| 0.8 (80%) | 5.6                                  |
| `mcpe:spec_helmet`            | 0.8 (80%) | 5.6                                  |
| `mcpe:assult_helmet_olive`    | 0.9 (90%) | 2.8                                  |
| `mcpe:assult_helmet_black`    | 0.9 (90%) | 2.8                                  |

> Cascos sin ID en ARMOR_PROTECTION (beanies, gorras, boinas, shemaghs, etc.) → **0% reducción en headshot**, reciben daño completo multiplicado.

---

## ROPA (tops / bottoms)

Toda la ropa normal **no tiene reducción de bala** en el sistema. Solo aporta el valor de `minecraft:wearable.protection` que Minecraft usa para daño genérico (caídas, fuego, etc.), pero **no afecta el daño de proyectiles** del mod.

| Tipo                          | Reducción balas | Protección genérica MC |
|-------------------------------|-----------------|------------------------|
| T-shirts, hoodies, flannels   | 0%              | 1                      |
| Ropa táctica (BDU, gorka)     | 0%              | 2                      |
| Ghillie tops/bottoms          | 0%              | 1-2                    |
| Chainmail / Crusader          | 0%              | 4                      |

---

## Resumen de tiers de protección anti-bala

```
CHALECO
Tier 0 — Sin chaleco / ropa normal:  0%  reducción
Tier 1 — Webbing / Biker / Reflective: 20%
Tier 2 — Chest rig:                  30%
Tier 3 — Stab vest / Press vest:     50%
Tier 4 — Assault / Police vest:      60%
Tier 5 — Plate vest:                 70%
Tier 6 — Tactical / Combat vest:     80%
Tier 7 — Netherite chestplate:       90%

CASCO (solo aplica en headshots)
Tier 0 — Sin casco / gorras / boinas: 0%
Tier 1 — Máscaras / Respirador:      20%
Tier 2 — Gasmask / Hard hat:         30%
Tier 3 — Biker / Gasmask táctico:    40%
Tier 4 — Great helm:                 60%
Tier 5 — Tactical / Riot / Army:     70%
Tier 6 — Ballistic / Spec helmet:    80%
Tier 7 — Assault helmet:             90%
```
