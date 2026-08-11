execute as @e[c=1,r=1,family=fighter] at @s[rx=-44,rxm=-90] run particle af:compressed_air_y ^ ^1 ^
execute as @e[c=1,r=1,family=fighter] at @s[rx=-44,rxm=-90] run effect @s slowness 1 4 true
execute as @e[c=1,r=1,family=fighter] at @s[rx=-44,rxm=-90] run effect @s levitation 1 1 true
execute as @e[c=1,r=1,family=strike] at @s[rx=-44,rxm=-90] run particle af:compressed_air_x ^ ^4 ^1
execute as @e[c=1,r=1,family=strike] at @s[rx=-44,rxm=-90] run effect @s slowness 1 4 true
execute as @e[c=1,r=1,family=strike] at @s[rx=-44,rxm=-90] run effect @s levitation 1 20 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=-40,rxm=-44]  run effect @s levitation 1 15 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=-35,rxm=-40] run effect @s levitation 1 10 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=-35,rxm=-44] run effect @s slowness 1 2 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=-20,rxm=-35] run effect @s levitation 1 6 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=-5,rxm=-20] run effect @s levitation 1 3 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=10,rxm=-5] run effect @s levitation 1 1 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=20,rxm=10] run effect @s slow_falling 1 1 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=25,rxm=20] run effect @s slow_falling 1 2 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=40,rxm=25] run effect @s slow_falling 1 1 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=55,rxm=40] run effect @s speed 1 1 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=70,rxm=55] run effect @s speed 1 2 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=90,rxm=70] run effect @s speed 2 3 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=90,rxm=70] run effect @s slowness 1 2 true
execute as @e[c=1,r=1,family=aerial] at @s[rx=90,rxm=40] run particle af:compressed_air_x ^ ^-1 ^