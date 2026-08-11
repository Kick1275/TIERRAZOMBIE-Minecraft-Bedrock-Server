execute as @e at @s if block ~ ~ ~ af:barbed_wire run effect @s slowness 5 6 true
execute as @e at @s if block ~ ~1 ~ af:barbed_wire run effect @s slowness 5 6 true
execute as @e[family=!vehicle,family=!inanimate] at @s if block ~ ~-1 ~ af:barbed_wire run tp @s ~ ~-1 ~ ~ ~
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 dirt replace grass_block
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace glass
execute at @e[type=af:bullet] run fill ^ ^ ^-1 ^ ^ ^1 air replace glass_pane
execute as @e[type=af:c_ram_bullet] at @s run particle af:c_ram_tracer ~ ~ ~
execute as @e[type=af:he_shell] at @s run particle  af:contrail_instant ~ ~ ~
execute as @e[type=af:ap_shell] at @s run particle  af:contrail_instant ~ ~ ~
execute as @e[type=af:bullet] at @s run particle af:bullet_tracer ~ ~ ~
execute as @e[family=missile,family=!torpedo] at @s run particle af:missile_smoke_once ^ ^ ^-3
execute as @e[type=af:hydra_rocket] at @s run particle af:missile_smoke_once ^ ^ ^-3
execute as @e[type=af:torpedo] at @s if block ~ ~ ~ water run particle af:watersplash_once ~ ~ ~
execute as @e[family=mounted_gun] at @s rotated as @p[r=2] run tp @s ~ ~ ~ ~ ~
execute as @e[family=artillery,tag=adjustable] at @s rotated as @p[r=4] run tp @s ~ ~ ~ ~ ~
execute as @e[family=aircraft_carrier,family=libernia] at @s run particle af:libernian_runway ^ ^4 ^32
execute as @e[family=aircraft_carrier,family=libernia] at @s run particle af:libernian_runway ^ ^4 ^-32
execute as @e[family=aircraft_carrier,family=telslakia] at @s run particle af:telslakian_runway ^ ^4 ^32
execute as @e[family=aircraft_carrier,family=telslakia] at @s run particle af:telslakian_runway ^ ^4 ^-32
execute as @e[type=af:torpedo] at @s unless block ~ ~ ~ water run tp @s ~ ~-1 ~ ~ ~
execute as @e[type=af:torpedo] at @s unless block ~ ~ ~ water run tp @s ^ ^ ^0.5 ~ ~
execute as @e[type=af:flare_entity] at @s run particle af:flare_rise_once ~ ~ ~
execute as @e[type=af:flare_entity] at @s run particle af:mg_flash ~ ~ ~
execute as @e[family=vehicle,family=!heli,tag=!vtol,family=!flare] at @s if block ~ ~-16 ~ air run execute as @s at @s if block ~ ~-1 ~ air run particle af:plane_locator_once ~ ~1 ~
scoreboard objectives add mineJumped dummy
execute as @e[type=af:antitank_mine,tag=!above_mine] at @s positioned ~ ~1.5 ~ if entity @p[r=1] run tag @s add above_mine