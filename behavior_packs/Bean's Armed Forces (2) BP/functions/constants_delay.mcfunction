scoreboard objectives add Factions dummy
scoreboard players set Libernia Factions 0
scoreboard players set Telslakia Factions 0
scoreboard players set Neutral Factions 0
execute as @a[tag=libernia] run scoreboard players add Libernia Factions 1
execute as @a[tag=telslakia] run scoreboard players add Telslakia Factions 1
execute as @a[tag=!telslakia,tag=!libernia] run scoreboard players add Neutral Factions 1
execute as @a[tag=!telslakia,tag=!libernia,hasitem={item=af:neutral_id, location=slot.weapon.mainhand}] run title @s actionbar you are now Factionless
execute as @a[hasitem={item=af:neutral_id, location=slot.weapon.mainhand}] run tag @s remove telslakia
execute as @a[hasitem={item=af:neutral_id, location=slot.weapon.mainhand}] run tag @s remove libernia
execute as @a[tag=!libernia,hasitem={item=af:libernia_id, location=slot.weapon.mainhand}] run title @s actionbar you have joined Libernia
execute as @a[hasitem={item=af:libernia_id, location=slot.weapon.mainhand}] run tag @s add libernia
execute as @a[hasitem={item=af:libernia_id, location=slot.weapon.mainhand}] run tag @s remove telslakia
execute as @a[tag=!telslakia,hasitem={item=af:telslakia_id, location=slot.weapon.mainhand}] run title @s actionbar you have joined Telslakia
execute as @a[hasitem={item=af:telslakia_id, location=slot.weapon.mainhand}] run tag @s add telslakia
execute as @a[hasitem={item=af:telslakia_id, location=slot.weapon.mainhand}] run tag @s remove libernia
execute as @e[family=!vehicle,family=!inanimate] at @s if block ~ ~ ~ af:barbed_wire run effect @s instant_damage 1 0 true
execute as @a[hasitem={item=af:nightvision_goggles, location=slot.weapon.offhand}] run tag @s add nv_goggles
execute as @a[tag=nv_goggles] run effect @s night_vision 20 0 true
execute as @a[tag=nv_goggles] unless entity @s[hasitem={item=af:nightvision_goggles, location=slot.weapon.offhand}] run effect @s night_vision 0 0
execute as @a unless entity @s[hasitem={item=af:nightvision_goggles, location=slot.weapon.offhand}] run tag @s remove nv_goggles
execute as @a[hasitem={item=af:metal_detector, location=slot.weapon.mainhand}] at @s if entity @e[family=vehicle,r=16] run playsound metal.detect @a ~ ~ ~ 0.1 0.5
execute as @a[hasitem={item=af:metal_detector, location=slot.weapon.mainhand}] at @s if entity @e[family=mine,r=16] run playsound metal.detect @a ~ ~ ~ 0.1 0.5
execute as @a[hasitem={item=af:metal_detector, location=slot.weapon.mainhand}] at @s if entity @e[family=vehicle,r=8] run playsound metal.detect @a ~ ~ ~ 0.1 1
execute as @a[hasitem={item=af:metal_detector, location=slot.weapon.mainhand}] at @s if entity @e[family=mine,r=8] run playsound metal.detect @a ~ ~ ~ 0.1 1
execute as @e[tag=has_gasmask] run tag @s remove has_gasmask
execute as @e[hasitem={item=af:gas_mask, location=slot.weapon.offhand}] run tag @s add has_gasmask
execute as @e[hasitem={item=af:gas_mask_east, location=slot.weapon.offhand}] run tag @s add has_gasmask
execute as @e[family=mounted_gun] at @s rotated as @p[r=2] run tp @s ~ ~ ~ ~ ~
execute as @e[family=artillery,tag=adjustable] at @s rotated as @p[r=4] run tp @s ~ ~ ~ ~ ~
execute as @a[hasitem={item=af:uranium_nugget,location=slot.weapon.mainhand}] run effect @s wither 15 0
execute as @a[hasitem={item=af:uranium_ingot,location=slot.weapon.mainhand}] run effect @s wither 15 0
execute as @a[hasitem={item=af:uranium_rod,location=slot.weapon.mainhand}] run effect @s wither 15 0
execute as @a[hasitem={item=af:communist_manifesto,location=slot.weapon.mainhand}] run effect @s hunger 1 5 true
execute as @a[hasitem={item=af:capitalist_manifesto,location=slot.weapon.mainhand}] run effect @s slowness 1 1 true
execute as @e[family=vehicle] at @s if entity @a[r=4] run tag @s add has_rider
execute as @e[family=vehicle] at @s unless entity @a[r=4] run tag @s remove has_rider
execute as @e[family=heli] at @s if block ~ ~-16 ~ air run particle af:plane_locator_once ~ ~3 ~
execute as @e[tag=vtol] at @s if block ~ ~-16 ~ air run particle af:plane_locator_once ~ ~1 ~
execute as @e[type=af:antitank_mine,tag=above_mine] at @s if entity @p[r=0.5] run scoreboard players add @s mineJumped 1
execute as @e[type=af:antitank_mine,tag=above_mine] at @s if entity @p[r=0.5] run playsound break.iron @a ~ ~ ~ 5 0.8
execute as @e[type=af:antitank_mine,tag=above_mine] at @s if entity @p[r=0.5] run tag @s remove above_mine
execute as @e[type=af:antitank_mine] if score @s mineJumped matches 1 run event entity @s af:level1
execute as @e[type=af:antitank_mine] if score @s mineJumped matches 2 run event entity @s af:level2
execute as @e[type=af:antitank_mine] if score @s mineJumped matches 3 run event entity @s af:level3
execute as @e[type=af:antitank_mine] if score @s mineJumped matches 4.. run event entity @s af:level4