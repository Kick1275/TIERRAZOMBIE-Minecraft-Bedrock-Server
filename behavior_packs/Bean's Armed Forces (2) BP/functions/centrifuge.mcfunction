execute as @s[tag=!is_heated] at @s if block ~~-1~ campfire run tag @s add is_heated
execute as @s[tag=is_heated] at @s unless block ~~-1~ campfire run tag @s remove is_heated
execute as @s[tag=!is_powered] at @s if block ~~3~ redstone_block run tag @s add is_powered
execute as @s[tag=is_powered] at @s unless block ~~3~ redstone_block run tag @s remove is_powered
execute as @s[tag=is_refining] at @s run playsound electric.drive @a ~~~ 0.05 1
execute as @s[tag=is_refining] at @s run scoreboard players add @s RefineTime 1
execute as @s[tag=is_refining] at @s  if score @s RefineTime matches  1200.. run event entity @s af:finish_process
execute as @s[tag=has_result] at @s run particle af:radiation_centrifuge ~ ~ ~