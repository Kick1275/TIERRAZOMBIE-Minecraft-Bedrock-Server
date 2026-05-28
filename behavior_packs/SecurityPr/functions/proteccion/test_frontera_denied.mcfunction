scoreboard players add @e[type=rt:runa_proteccion,tag=noclaim] ddelay 1

execute as @e[type=rt:runa_proteccion,scores={ddelay=1},tag=noclaim] at @s run tellraw @p[c=1] {"rawtext":[{"translate": "proteccion.langcode.3"}]}
event entity @e[type=rt:runa_proteccion,scores={ddelay=20..},tag=noclaim] runa_kill2

scoreboard players reset @e[scores={ddelay=20..},type=rt:runa_proteccion,tag=noclaim] ddelay 