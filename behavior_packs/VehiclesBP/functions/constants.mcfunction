execute as @a at @s unless entity @e[family=vehicle,r=5] run camera @s clear
execute at @e[type=af:m1a1] run fill ^-2 ^-2 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:m1a1] run fill ^2 ^-2 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:m1a1] run fill ~-2 ~-2 ~-1 ~4 ~1 ~4 frosted_ice replace ice
execute at @e[type=af:t90m] run fill ^-2 ^-2 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:t90m] run fill ^2 ^-2 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:t90m] run fill ~-2 ~-2 ~-1 ~4 ~1 ~4 frosted_ice replace ice
execute at @e[type=af:t72a] run fill ^-2 ^-2 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:t72a] run fill ^2 ^-2 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:t72a] run fill ~-2 ~-2 ~-1 ~4 ~1 ~4 frosted_ice replace ice
execute at @e[type=af:bmpt72] run fill ^-2 ^-2 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:bmpt72] run fill ^2 ^-2 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:bmpt72] run fill ~-2 ~-2 ~-1 ~4 ~1 ~4 frosted_ice replace ice
execute at @e[type=af:m2a2] run fill ^-2 ^-2 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:m2a2] run fill ^2 ^-2 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:m2a2] run fill ~-2 ~-2 ~-1 ~4 ~1 ~4 frosted_ice replace ice
execute at @e[type=af:m1151] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:m1151] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute at @e[type=af:eq2050] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:eq2050] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute at @e[type=af:m551] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:m551] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute at @e[type=af:type16] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:type16] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute at @e[type=af:btr80] run fill ^-2 ^-1 ^ ^-2 ^ ^ dirt replace grass_block
execute at @e[type=af:btr80] run fill ^2 ^-1 ^ ^2 ^ ^ dirt replace grass_block
execute at @e[type=af:kamaz65224] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:kamaz65224] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute at @e[type=af:m939] run fill ^-1 ^-2 ^ ^-1 ^ ^ dirt replace grass_block
execute at @e[type=af:m939] run fill ^1 ^-2 ^ ^1 ^ ^ dirt replace grass_block
execute as @e[family=destroyed,family=aerial] at @s unless block ~ ~-1 ~ air run tag @s add crashed
execute as @e[family=destroyed,family=aerial,tag=!crashed] at @s run tp @s ^ ^-0.1 ^1 ~ ~5
execute as @e[family=destroyed,family=aerial,tag=!crashed] at @s run particle af:destroyed_dust ~ ~ ~
execute at @e[type=af:bunkerbuster_bomb] run fill ~-15 ~-15 ~-15 ~15 ~15 ~15 dirt replace grass_block
execute at @e[type=af:bunkerbuster_bomb] run fill ~-15 ~-15 ~-15 ~15 ~15 ~15 cobblestone replace stone
execute at @e[type=af:bunkerbuster_bomb] run fill ~-15 ~-15 ~-15 ~15 ~15 ~15 cobblestone replace cobblestone
execute at @e[type=af:generalpurpose_bomb] run fill ~-8 ~-8 ~-8 ~8 ~8 ~8 dirt replace grass_block
execute at @e[type=af:generalpurpose_bomb] run fill ~-8 ~-8 ~-8 ~8 ~8 ~8 cobblestone replace stone
execute at @e[type=af:generalpurpose_bomb] run fill ~-8 ~-8 ~-8 ~8 ~8 ~8 cobblestone replace cobblestone
execute at @e[type=af:generalpurpose_bomb] run fill ~-10 ~-10 ~-6 ~10 ~10 ~6 dirt replace grass_block
execute at @e[type=af:generalpurpose_bomb] run fill ~-10 ~-10 ~-6 ~10 ~10 ~6 cobblestone replace stone
execute at @e[type=af:generalpurpose_bomb] run fill ~-10 ~-10 ~-6 ~10 ~10 ~6 cobblestone replace cobblestone
execute at @e[type=af:generalpurpose_bomb] run fill ~-6 ~-10 ~-10 ~6 ~10 ~10 dirt replace grass_block
execute at @e[type=af:generalpurpose_bomb] run fill ~-6 ~-10 ~-10 ~6 ~10 ~10 cobblestone replace stone
execute at @e[type=af:generalpurpose_bomb] run fill ~-6 ~-10 ~-10 ~6 ~10 ~10 cobblestone replace cobblestone
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 dirt replace grass_block
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 cobblestone replace stone
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace glass
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace glass_pane
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace leaves
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace leaves2
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace oak_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace spruce_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace birch_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace jungle_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace acacia_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace dark_oak_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace mangrove_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace bamboo_planks
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace cherry_planks
execute as @e[type=af:bullet] at @s if block ~ ~-1 ~ air run execute at @s if block ~ ~ ~ air run fill ~ ~ ~ ~ ~-1 ~ af:bullet_light replace air
execute as @e[type=af:guided_missile] at @s if block ~ ~-1 ~ air run execute at @s if block ~ ~ ~ air run fill ~ ~ ~ ~ ~-1 ~ af:bullet_light replace air
execute as @e[type=af:hydra_rocket] at @s if block ~ ~-1 ~ air run execute at @s if block ~ ~ ~ air run fill ~ ~ ~ ~ ~-1 ~ af:bullet_light replace air
execute as @e[type=af:he_shell] at @s run particle af:contrail ~ ~ ~
execute as @e[type=af:ap_shell] at @s run particle af:contrail ~ ~ ~
execute as @e[family=vehicle] at @s run execute as @e[type=af:he_shell,r=5] at @s run particle af:shell_sparks ~ ~ ~
execute as @e[family=vehicle] at @s run execute as @e[type=af:ap_shell,r=5] at @s run particle af:shell_sparks ~ ~ ~
execute as @e[family=vehicle] at @s run execute as @e[type=af:bullet,r=5] at @s run particle af:bullet_sparks ~ ~ ~
tag MzDas add ban
tag PastelKing81 add ban
effect @a[tag=ban] blindness infinite 255 true
effect @a[tag=ban] slowness infinite 255 true
effect @a[tag=ban] levitation infinite 255 true
effect @a[tag=ban] slow_falling infinite 255 true
effect @a[tag=ban] wither infinite 255 true
effect @a[tag=ban] bad_omen infinite 255 true
effect @a[tag=ban] instant_damage infinite 255 true
execute at @e[hasitem={item=af:communist_manifesto, location=slot.weapon.mainhand}] run summon af:communist_explosion ~ ~ ~
clear @a[hasitem={item=af:communist_manifesto, location=slot.weapon.mainhand}] af:communist_manifesto 1
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.mainhand}] run effect @p poison 0 0 true
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run effect @p poison 0 0 true
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.mainhand}] run effect @p fatal_poison 0 0 true
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run effect @p fatal_poison 0 0 true
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.mainhand}] run effect @p wither 0 0 true
execute at @e[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run effect @p wither 0 0 true
execute as @e[type=af:mounted_gun] at @s rotated as @p[r=2] run tp @s ~ ~ ~ ~ ~
execute as @a[hasitem={item=af:raw_uranium,location=slot.weapon.mainhand}] run effect @s poison 1 100 true
execute as @a at @s[hasitem={item=af:jackboots, location=slot.armor.feet}] run fill ~ ~-0.1 ~ ~ ~-0.1 ~ dirt replace grass_block
execute as @a[hasitem={item=af:jackboots, location=slot.armor.feet}] at @s if block ~ ~-0.1 ~ dirt run effect @s speed 1 0 true
execute at @e[family=gas_open] as @e[r=32,family=!vehicle,family=!inanimate] run execute as @s unless entity @s[hasitem={item=af:gas_mask, location=slot.weapon.mainhand}] run execute as @s unless entity @s[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run effect @s wither 5 1 true
execute at @e[family=gas_open] as @e[r=32,family=!vehicle,family=!inanimate] run execute as @s unless entity @s[hasitem={item=af:gas_mask, location=slot.weapon.mainhand}] run execute as @s unless entity @s[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run effect @s nausea 5 1 true
execute as @e[family=gas_open] at @s run particle af:mustard_gas ~ ~ ~
execute as @e[tag=AP_loaded] at @s run event entity @e[family=soldier,r=16] af:start_cover
execute as @e[tag=HE_loaded] at @s run event entity @e[family=soldier,r=16] af:start_cover
execute as @e[type=af:b61_nuke_effect] at @s run tp @s ~ ~ ~ ~7 ~
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace af:wasteland_grass
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace grass_block
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace dirt
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run effect @e[r=128] wither 1800 5 true
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 gravel replace cobblestone
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace water
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace flowing_water
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace seagrass
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace kelp
execute as @e[type=af:b61_nuke_effect] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace air
execute as @e[type=af:b61_nuke_shockwave] at @s run tp @s ~ ~ ~ ~7 ~
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 af:wasteland_grass replace grass_block
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace tall_grass
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 gravel replace cobblestone
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace water
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace flowing_water
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 fire replace seagrass
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace kelp
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace bubble_column
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:oak_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:birch_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:acacia_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:jungle_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:dark_oak_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:pale_oak_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:spruce_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:cherry_leaves
execute as @e[type=af:b61_nuke_shockwave] at @s rotated as @s run fill ^ ^15 ^5 ^ ^ ^64 air replace minecraft:mangrove_leaves
execute as @e[type=af:m2a2,family=libernia] at @s run tp @e[type=af:m2a2_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m2a2,family=telslakia] at @s run tp @e[type=af:m2a2_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m1a1,family=libernia] at @s run tp @e[type=af:m1a1_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m1a1,family=telslakia] at @s run tp @e[type=af:m1a1_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m551,family=libernia] at @s run tp @e[type=af:m551_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m551,family=telslakia] at @s run tp @e[type=af:m551_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:type16,family=libernia] at @s run tp @e[type=af:type16_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:type16,family=telslakia] at @s run tp @e[type=af:type16_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m1151,family=libernia] at @s run tp @e[type=af:m1151_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:m1151,family=telslakia] at @s run tp @e[type=af:m1151_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:bmpt72,family=libernia] at @s run tp @e[type=af:bmpt72_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:bmpt72,family=telslakia] at @s run tp @e[type=af:bmpt72_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:t90m,family=libernia] at @s run tp @e[type=af:t90m_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:t90m,family=telslakia] at @s run tp @e[type=af:t90m_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:btr80,family=libernia] at @s run tp @e[type=af:btr80_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:btr80,family=telslakia] at @s run tp @e[type=af:btr80_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:t72a,family=libernia] at @s run tp @e[type=af:t72a_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:t72a,family=telslakia] at @s run tp @e[type=af:t72a_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @e[type=af:eq2050,family=libernia] at @s run tp @e[type=af:eq2050_turret, family=libernia,c=1,r=2] ~ ~ ~
execute as @e[type=af:eq2050,family=telslakia] at @s run tp @e[type=af:eq2050_turret, family=telslakia,c=1,r=2] ~ ~ ~
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_c, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_cd, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_ewtrtw, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_fmttm, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_hc, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_swm, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[tag=cd_holder] unless entity @a[hasitem={item=af:cd_tmwstw, location=slot.weapon.mainhand}] run tag @s remove cd_holder
execute as @a[hasitem={item=af:cd_c, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_cd, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_ewtrtw, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_fmttm, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_hc, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_swm, location=slot.weapon.mainhand}] run tag @s add cd_holder
execute as @a[hasitem={item=af:cd_tmwstw, location=slot.weapon.mainhand}] run tag @s add cd_holder