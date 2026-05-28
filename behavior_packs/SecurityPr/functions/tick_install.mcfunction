scoreboard objectives add install dummy
scoreboard players add install install 0
execute if score install install matches 0 run function install
execute if score install install matches 0 run scoreboard players add install install 1