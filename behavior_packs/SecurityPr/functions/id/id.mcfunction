scoreboard players add @a[tag=!id] id 0
execute if entity @a[tag=!id,c=1] run scoreboard players add countid id 1
scoreboard players operation @a[tag=!id,c=1] id = countid id
tag @a[tag=!id] add id