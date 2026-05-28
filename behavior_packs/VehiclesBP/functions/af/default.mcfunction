tag @e remove is_player
tag @e[type=player] add is_player
tag @e[tag=player_sneaking] remove player_sneaking
tag @e[tag=player_crawling] remove player_crawling
execute as @e[tag=is_player,tag=player_sneaking] at @s unless entity @s[y=~1.0,dx=0] run tag @s remove player_sneaking
execute as @e[tag=is_player,tag=!player_sneaking] at @s unless entity @s[y=~1.5,dx=0] if entity @s[y=~1,dx=0] run tag @s add player_sneaking
execute as @e[tag=is_player,tag=!player_sneaking] at @s unless entity @s[y=~1,dx=0] if entity @s[y=~0.01,dx=0] run tag @s add player_crawling
tag @e[tag=holding_af_anygun] remove holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:glock17,location=slot.weapon.mainhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:glock17,location=slot.weapon.offhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:m4carbine,location=slot.weapon.mainhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:m4carbine,location=slot.weapon.offhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:m24sniper,location=slot.weapon.mainhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:m24sniper,location=slot.weapon.offhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:spas12,location=slot.weapon.mainhand}] add holding_af_anygun
tag @e[tag=!holding_af_anygun,hasitem={item=af:spas12,location=slot.weapon.offhand}] add holding_af_anygun
playanimation @e[tag=is_player,tag=player_sneaking,tag=holding_af_anygun] animation.gunman.aim
playanimation @e[tag=is_player,tag=!player_sneaking,tag=holding_af_anygun] animation.gunman.hold
execute as @e at @s if block ~~-0.1~ af:oil run effect @s slowness 1 0 true
effect @e[tag=is_player,tag=player_sneaking,hasitem={item=af:m24sniper,location=slot.weapon.mainhand}] slowness 1 8 true
effect @e[tag=is_player,tag=!player_sneaking,hasitem={item=af:m24sniper,location=slot.weapon.mainhand}] slowness 0 0 true