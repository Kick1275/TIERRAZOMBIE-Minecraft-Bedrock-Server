scoreboard players add install discord 0
execute if score install discord matches 0 run tellraw @a {"rawtext":[{"translate":"proteccion.langcode.9"},{"translate":"proteccion.langcode.10"}]}
execute if score install discord matches 0 run execute as @a at @s run playsound random.levelup @s ~~~ 1 2
scoreboard players set install discord 1