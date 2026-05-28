execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=!0,stimer=1..},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] stimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=!0,stimer=1..},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] stimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=!0,stimer=1..},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] stimer 0

scoreboard players add @a[tag=!stimer] stimer 0
tag @a[tag=!stimer] add stimer
scoreboard players set @a[scores={stimer=..-1}] stimer 0

execute as @a[scores={stimer=0}] at @s unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,x=~-31.380,y=-64,z=~-31.380,dx=61.7,dy=387,dz=61.7] unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,x=~-11.380,y=-64,z=~-11.380,dx=21.7,dy=387,dz=21.7] unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,x=~-21.380,y=-64,z=~-21.380,dx=41.7,dy=387,dz=41.7] unless entity @s[x=250,y=-64,z=250,dx=-150,dy=326,dz=-150] run scoreboard players set @s stimer 1

execute as @a at @s if entity @e[type=rt:runa_proteccion,tag=inactividad,tag=runa1,x=~-12.380,y=-64,z=~-12.380,dx=22.7,dy=387,dz=22.7] run function proteccion/runa1/inactividad_remove
execute as @a at @s if entity @e[type=rt:runa_proteccion,tag=inactividad,tag=runa2,x=~-22.380,y=-64,z=~-22.380,dx=42.7,dy=387,dz=42.7] run function proteccion/runa2/inactividad_remove
execute as @a at @s if entity @e[type=rt:runa_proteccion,tag=inactividad,tag=runa3,x=~-32.380,y=-64,z=~-32.380,dx=62.7,dy=387,dz=62.7] run function proteccion/runa3/inactividad_remove

scoreboard players set @a[scores={stimer=0},tag=dueño] stimer 1
scoreboard players set @a[scores={stimer=0,friendtest=0}] stimer 1

titleraw @a[scores={stimer=1},m=a] actionbar {"rawtext":[{"translate": "proteccion.langcode.8"}]}
gamemode s @a[scores={stimer=1},m=a]