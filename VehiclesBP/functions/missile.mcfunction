execute as @e[type=af:homing_missile] at @s rotated as @s run tp @s ^ ^ ^2 ~ ~
execute as @e[type=af:drone_missile] at @s rotated as @s run tp @s ^ ^ ^0.5 ~ ~
execute as @e[type=af:sam_missile] at @s rotated as @s run tp @s ^ ^ ^2 ~ ~
execute as @e[type=af:nasams_missile] at @s rotated as @s run tp @s ^ ^ ^2 ~ ~
execute as @e[type=af:homing_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=dragon]
execute as @e[family=dragon] at @s run event entity @e[type=af:homing_missile,r=1] minecraft:explode
execute as @e[type=af:sam_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=dragon]
execute as @e[family=dragon] at @s run event entity @e[type=af:sam_missile,r=1] minecraft:explode
execute as @e[family=libernia_missile] at @s positioned ^ ^ ^-100 run tag @e[family=vehicle,r=64,family=telslakia] remove hm_target
execute as @e[family=libernia_missile] at @s positioned ^ ^ ^100 run tag @e[family=vehicle,r=64,family=telslakia] add hm_target
execute as @e[family=telslakia_missile] at @s positioned ^ ^ ^-100 run tag @e[family=vehicle,r=64,family=libernia] remove hm_target
execute as @e[family=telslakia_missile] at @s positioned ^ ^ ^100 run tag @e[family=vehicle,r=64,family=libernia] add hm_target
execute as @e[tag=hm_exploded] at @s run tag @e[r=16] remove hm_target
execute as @e[family=telslakia_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=libernia,family=vehicle,tag=hm_target]
execute as @e[family=telslakia_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=libernia,family=vehicle,tag=hm_target]
execute as @e[family=!telslakia,family=vehicle] at @s run event entity @e[family=telslakia_missile,r=1,tag=!hm_exploded] minecraft:explode
execute as @e[family=!telslakia,family=vehicle] at @s run tag @e[family=telslakia_missile,r=1,tag=!hm_exploded] add hm_exploded
execute as @e[type=af:drone_missile,family=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=libernia,family=vehicle]
execute as @e[type=af:drone_missile,family=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=libernia,family=vehicle]
execute as @e[type=af:sam_missile,family=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=libernia,family=vehicle]
execute as @e[type=af:sam_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=libernia,family=vehicle]
execute as @e[type=af:nasams_missile,family=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=libernia,family=vehicle]
execute as @e[type=af:nasams_missile,family=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=libernia,family=vehicle]
execute as @e[family=libernia_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=telslakia,family=vehicle,tag=hm_target]
execute as @e[family=libernia_missile] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=telslakia,family=vehicle,tag=hm_target]
execute as @e[family=!libernia,family=vehicle] at @s run event entity @e[family=libernia_missile,r=1,tag=!hm_exploded] minecraft:explode
execute as @e[family=!libernia,family=vehicle] at @s run tag @e[family=libernia_missile,r=1,tag=!hm_exploded] add hm_exploded
execute as @e[type=af:drone_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=telslakia,family=vehicle]
execute as @e[type=af:drone_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=telslakia,family=vehicle]
execute as @e[type=af:sam_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=telslakia,family=vehicle]
execute as @e[type=af:sam_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=telslakia,family=vehicle]
execute as @e[type=af:nasams_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,family=!stealth,family=telslakia,family=vehicle]
execute as @e[type=af:nasams_missile,family=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=16,family=stealth,family=telslakia,family=vehicle]
execute as @e[type=af:guided_missile] at @s rotated as @s run tp @s ^ ^ ^0.5
execute as @e[type=af:g_missile_target] at @s run event entity @e[tag=!gm_exploded,type=af:guided_missile,r=1] af:explode
execute as @e[family=!libernia,family=mob] at @s run event entity @e[tag=!gm_exploded,tag=libernia,type=af:guided_missile,r=1] af:explode
execute as @e[family=!telslakia,family=mob] at @s run event entity @e[tag=!gm_exploded,tag=telslakia,type=af:guided_missile,r=1] af:explode
execute as @e[family=vehicle,family=!libernia] at @s run event entity @e[tag=!gm_exploded,tag=libernia,type=af:guided_missile,r=4] af:explode
execute as @e[family=vehicle,family=!telslakia] at @s run event entity @e[tag=!gm_exploded,tag=telslakia,type=af:guided_missile,r=4] af:explode
execute as @e[type=af:guided_missile,tag=bmpt72,tag=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=bmpt72,tag=libernia]
execute as @e[type=af:guided_missile,tag=bmpt72,tag=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=bmpt72,tag=telslakia]
execute as @e[type=af:guided_missile,tag=m551,tag=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=m551,tag=libernia]
execute as @e[type=af:guided_missile,tag=m551,tag=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=m551,tag=telslakia]
execute as @e[type=af:guided_missile,tag=m2a2,tag=libernia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=m2a2,tag=libernia]
execute as @e[type=af:guided_missile,tag=m2a2,tag=telslakia] at @s rotated as @s run tp @s ~ ~ ~ facing @e[c=1,r=64,type=af:g_missile_target,tag=m2a2,tag=telslakia]
execute as @e[type=af:homing_missile] at @s unless block ~ ~ ~ air run event entity @s minecraft:explode
execute as @e[tag=!gm_exploded,type=af:guided_missile] at @s unless block ~ ~ ~ air run event entity @s af:explode