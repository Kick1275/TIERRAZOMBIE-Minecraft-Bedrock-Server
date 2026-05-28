execute if score barreras tticks matches 2 if entity @s[tag=runa1] unless entity @a[scores={idresult=0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] unless entity @a[scores={friendtest=0},x=~-11.175,y=-64,z=~-11.175,dx=21.4,dy=387,dz=21.4] run function proteccion/runa1/deny_block
execute if entity @s[tag=runa1] run function proteccion/runa1/barreras

execute if score barreras tticks matches 2 if entity @s[tag=runa2] unless entity @a[scores={idresult=0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] unless entity @a[scores={friendtest=0},x=~-21.175,y=-64,z=~-21.175,dx=41.4,dy=387,dz=41.4] run function proteccion/runa2/deny_block
execute if entity @s[tag=runa2] run function proteccion/runa2/barreras

execute if score barreras tticks matches 2 if entity @s[tag=runa3] unless entity @a[scores={idresult=0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] unless entity @a[scores={friendtest=0},x=~-31.175,y=-64,z=~-31.175,dx=61.4,dy=387,dz=61.4] run function proteccion/runa3/deny_block
execute if entity @s[tag=runa3] run function proteccion/runa3/barreras

execute if score barreras tticks matches 6.. run scoreboard players set barreras tticks 0
scoreboard players add barreras tticks 1