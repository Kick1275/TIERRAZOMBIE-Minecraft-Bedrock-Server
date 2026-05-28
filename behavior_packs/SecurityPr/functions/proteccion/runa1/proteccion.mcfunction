execute if entity @s[tag=!notime] as @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] run scoreboard players operation @s idresult = @e[type=rt:runa_proteccion,x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] claim
execute if entity @s[tag=!notime] as @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] run scoreboard players operation @s friendtest = @e[type=rt:runa_proteccion,x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] friendid
execute if entity @s[tag=!notime] as @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] run scoreboard players operation @s idresult -= @s[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] id
execute if entity @s[tag=!notime] as @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] run scoreboard players operation @s friendtest -= @s[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] friendid
execute if entity @s[tag=notime] as @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,tag=!dueño] run scoreboard players set @s idresult 0

titleraw @a[scores={idresult=!0,friendtest=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,m=!a] actionbar {"rawtext":[{"text": " "},{"selector": "@s"},{"text": " "}]}
execute if entity @s[tag=notime] run titleraw @a[scores={idresult=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,m=!a] actionbar {"rawtext":[{"translate": "proteccion.langcode.6"},{"text": "§r\n"},{"selector": "@s"}]}
execute if entity @s[tag=!notime] run event entity @a[scores={idresult=!0,friendtest=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,m=!a,tag=!admin] dueño_family_event
execute if entity @s[tag=!notime] run gamemode a @a[scores={idresult=!0,friendtest=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,m=!a,tag=!admin]
execute if entity @s[tag=!notime] run tag @a[scores={idresult=!0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,tag=!intruso,tag=!admin] add intruso