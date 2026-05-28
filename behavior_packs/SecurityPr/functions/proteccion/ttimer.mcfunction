execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=0,ttimer=!0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=0,ttimer=!0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={idresult=0,ttimer=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={friendtest=0,ttimer=!0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={friendtest=0,ttimer=!0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,tag=!notime,tag=!inactividad] at @s run scoreboard players set @a[scores={friendtest=0,ttimer=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] idresult 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] idresult 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] idresult 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] ttimer 0
execute as @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,tag=notime,tag=!inactividad] at @s run scoreboard players set @a[scores={ttimer=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] ttimer 0

scoreboard players add @a[tag=!ttimer] ttimer 0
tag @a[tag=!ttimer] add ttimer
scoreboard players set @a[scores={ttimer=..-1}] ttimer 0

execute as @a[scores={ttimer=0}] at @s unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa3,x=~-31.380,y=-64,z=~-31.380,dx=61.7,dy=387,dz=61.7] unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa1,x=~-11.380,y=-64,z=~-11.380,dx=21.7,dy=387,dz=21.7] unless entity @e[type=rt:runa_proteccion,tag=!noclaim,tag=runa2,x=~-21.380,y=-64,z=~-21.380,dx=41.7,dy=387,dz=41.7] unless entity @s[x=250,y=-64,z=250,dx=-150,dy=326,dz=-150] run scoreboard players set @s ttimer 1

titleraw @a[scores={ttimer=1..},tag=dentro] actionbar {"rawtext":[{"translate": "proteccion.langcode.7"}]}
event entity @a[scores={ttimer=1..},tag=dueño] dueño_family_event
event entity @a[scores={ttimer=1..},tag=intruso] dueño_family_event
tag @a[scores={stimer=1},tag=intruso] remove intruso
event entity @a[scores={idresult=!0},tag=dueño] dueño_family_event
event entity @a[scores={friendtest=!0},tag=instruso] dueño_family_event
tag @a[scores={ttimer=1..},tag=dueño] remove dueño
tag @a[scores={idresult=!0},tag=dueño] remove dueño
execute as @a[scores={ttimer=1..},tag=dentro] at @s run playsound note.bass @s ~~~ 0.3 

tag @a[scores={ttimer=1..}] add fuera
tag @a[scores={ttimer=1..}] remove dentro

execute as @a[scores={ttimer=0},tag=fuera] at @s run playsound note.harp @s ~~~ 0.3