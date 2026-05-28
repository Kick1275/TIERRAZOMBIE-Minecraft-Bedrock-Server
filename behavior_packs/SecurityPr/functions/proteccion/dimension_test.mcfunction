scoreboard players add @e[type=rt:runa_proteccion,tag=!overworld] dimension 0
execute as @e[type=rt:runa_proteccion,tag=!runa1,tag=!runa2,tag=!runa3] at @s if block ~ -64 ~ bedrock run scoreboard players set @s dimension 1
execute as @e[type=rt:runa_proteccion,tag=!runa1,tag=!runa2,tag=!runa3] at @s if block ~ -63 ~ bedrock run scoreboard players set @s dimension 1
execute as @e[type=rt:runa_proteccion,tag=!runa1,tag=!runa2,tag=!runa3] at @s if block ~ -62 ~ bedrock run scoreboard players set @s dimension 1
execute as @e[type=rt:runa_proteccion,tag=!runa1,tag=!runa2,tag=!runa3] at @s if block ~ -61 ~ bedrock run scoreboard players set @s dimension 1
execute as @e[type=rt:runa_proteccion,tag=!runa1,tag=!runa2,tag=!runa3] at @s if block ~ -60 ~ bedrock run scoreboard players set @s dimension 1
execute as @e[scores={dimension=0},type=rt:runa_proteccion] at @s run tellraw @p[c=1] {"rawtext":[{"text":"§c✗ No puedes colocar Protecciones en esta dimensión."}]}
execute if entity @e[scores={dimension=0}] as @e[scores={dimension=0}] run event entity @s runa_kill2
tag @e[scores={dimension=1},tag=!overworld] add overworld