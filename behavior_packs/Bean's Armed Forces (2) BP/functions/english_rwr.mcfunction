execute as @s at @s[rx=90,rxm=40] unless block ~ ~-32 ~ air run playsound rwr.pull_up @p ~~~ 10 1
execute as @s[tag=on_radar] at @s if entity @e[type=af:missile_air,r=64] run playsound rwr.high_beep