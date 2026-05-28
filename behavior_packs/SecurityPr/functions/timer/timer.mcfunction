scoreboard players add timer tticks 1

execute if score timer tticks matches 20.. run scoreboard players add timer ts 1
execute if score timer tticks matches 20.. run scoreboard players set timer tticks 0

execute if score timer ts matches 60.. run scoreboard players add timer tm 1
execute if score timer ts matches 60.. run function discord
execute if score timer ts matches 60.. run scoreboard players set timer ts 0

execute if score timer tm matches 60.. run scoreboard players set timer tm 0