execute if entity @a[tag=!spbkit] as @a[tag=!spbkit,scores={ts=2..}] run give @s rt:11x11_block
execute if entity @a[tag=!spbkit] as @a[tag=!spbkit,scores={ts=2..}] run give @s rt:spb_guide_book_spawn_egg
execute if entity @a[tag=!spbkit] as @a[tag=!spbkit,scores={ts=2..}] run tag @s add spbkit
execute if entity @a[tag=!spbkit] if score timer tticks matches 18.. as @a[tag=!spbkit] run scoreboard players add @s ts 1