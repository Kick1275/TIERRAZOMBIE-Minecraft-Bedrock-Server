tag @s remove train_ahead
execute as @s[type=af:armoured_train_locomotive] at @s run tag @s add train_powered
execute as @s[tag=train_powered] at @s anchored feet positioned ^^^2 run tag @e[family=train,r=1] add train_powered
execute as @s[tag=train_powered] at @s run tag @e[r=2.5,family=train] add train_powered
execute as @s[tag=!train_ahead] at @s anchored feet positioned ^^^2 if entity @e[r=1,family=train] run tag @s add train_ahead
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ~ ~-0.5 ~ rail run tp @s ^ ^-0.5 ^ ~ ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^ ^ ^1 rail run tp @s ^ ^ ^1 ~ ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^ ^-1 ^1 rail run tp @s ^ ^-1 ^1 ~ ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^ ^1 ^1 rail run tp @s ^ ^1 ^1 ~ ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^-1 ^ ^ rail run tp @s ~ ~ ~ ~90 ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^1 ^ ^ rail run tp @s ~ ~ ~ ~-90 ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^-1 ^-1 ^ rail run tp @s ~ ~ ~ ~90 ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^1 ^-1 ^ rail run tp @s ~ ~ ~ ~-90 ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^-1 ^1 ^ rail run tp @s ~ ~ ~ ~90 ~
execute as @s[tag=!train_ahead,tag=train_powered] at @s if block ^1 ^1 ^ rail run tp @s ~ ~ ~ ~-90 ~
execute as @s[tag=train_powered] at @s anchored feet positioned ^^^-2 unless entity @e[r=1,tag=train_powered] run tag @s remove train_powered