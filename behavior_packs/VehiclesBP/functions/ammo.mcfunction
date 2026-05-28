scoreboard objectives add ArtilleryAngle dummy
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 1 run tp @s ~ ~ ~ ~ -10
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 2 run tp @s ~ ~ ~ ~ -20
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 3 run tp @s ~ ~ ~ ~ -30
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 4 run tp @s ~ ~ ~ ~ -40
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 5 run tp @s ~ ~ ~ ~ -50
execute as @e[family=artillery] at @s if score @s ArtilleryAngle matches 6 run tp @s ~ ~ ~ ~ -60
scoreboard objectives add MissileAmmo dummy
execute as @e[tag=no_missiles] at @s run title @p[r=2] actionbar land Aircraft to restock Payload.
execute as @e[tag=no_missiles] at @s unless block ~ ~-1 ~ air run title @p[r=2] actionbar Payload restocked.
execute as @e[family=aerial] at @s unless block ~ ~-1 ~ air run scoreboard players set @s MissileAmmo 0
execute as @e[family=aerial] at @s unless block ~ ~-1 ~ air run tag @s remove no_missiles
scoreboard objectives add BombAmmo dummy
execute as @e[tag=no_bombs] at @s run title @p[r=2] actionbar land Aircraft to restock Payload.
execute as @e[tag=no_bombs] at @s unless block ~ ~-1 ~ air run title @p[r=2] actionbar Payload restocked.
execute as @e[family=aerial] at @s unless block ~ ~-1 ~ air run scoreboard players set @s BombAmmo 0
execute as @e[family=aerial] at @s unless block ~ ~-1 ~ air run tag @s remove no_bombs
scoreboard objectives add ChainAmmo dummy