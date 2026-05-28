# Crear scoreboards
scoreboard objectives add c dummy c
scoreboard objectives add b dummy

# SISTEMA OPTIMIZADO CON TAGS Y SCRIPTS JAVASCRIPT
# Por defecto todos tienen cámara realista (c=0)
scoreboard players set @a c 0

# DETECTAR TAG DE ARMA TACZ - MANEJADO POR SCRIPT JAVASCRIPT
# El script tacz_weapon_detection.js maneja automáticamente el tag "holding_tacz_weapon"
# Incluye todas las armas TACZ (con munición y vacías) + RPG
execute as @a[tag=holding_tacz_weapon] at @s run scoreboard players set @s c 1

# APLICAR CÁMARAS SEGÚN EL SCOREBOARD
# Si c=0 → cámara realista (por defecto)
execute as @a at @s if score @s c matches 0 run camera @s set custom:fpp

# Si c=1 → primera persona normal (con armas TACZ)
execute as @a at @s if score @s c matches 1 run camera @s set minecraft:first_person