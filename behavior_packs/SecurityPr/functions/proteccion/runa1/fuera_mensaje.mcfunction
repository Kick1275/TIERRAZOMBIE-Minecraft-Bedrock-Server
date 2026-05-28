execute if entity @s[tag=!notime] run titleraw @a[scores={ttimer=0},tag=fuera,x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] actionbar {"rawtext":[{"translate": "proteccion.langcode.2"},{"selector": "@s"},{"text": " "}]}
execute if entity @s[tag=notime] run titleraw @a[scores={ttimer=0,idresult=0},tag=fuera,x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] actionbar {"rawtext":[{"translate": "proteccion.langcode.6"},{"text": "§r\n"},{"translate": "proteccion.langcode.2"},{"selector": "@s"},{"text": " "}]}

execute if entity @s[tag=!notime] run tag @a[scores={idresult=0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] add dentro
execute if entity @s[tag=!notime] run tag @a[scores={friendtest=0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] add dentro
tag @a[x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4,scores={ttimer=0},tag=fuera] remove fuera