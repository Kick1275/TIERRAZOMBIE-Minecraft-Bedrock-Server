execute as @s if entity @p[r=2, hasitem={item=af:autopilot,location=slot.weapon.mainhand}] run execute rotated as @s run execute as @s run execute at @s run tp @s ^ ^ ^1
execute as @s if entity @p[r=2, hasitem={item=af:autopilot,location=slot.weapon.mainhand}] run execute rotated as @s run effect @s levitation 2 0 true
execute as @s[tag=afterburner] run tag @s remove afterburner
execute as @s if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run tag @s add afterburner
execute as @s if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run title @p[r=5] actionbar Weapons unavailable while Throttle active.
execute as @s[type=af:f4] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 7 true
execute as @s[type=af:a10] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 1 true
execute as @s[type=af:f16] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 5 true
execute as @s[type=af:f35a] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 3 true
execute as @s[type=af:f22] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 7 true
execute as @s[type=af:b2] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 1 true
execute as @s[type=af:mig21] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 5 true
execute as @s[type=af:mig29] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 6 true
execute as @s[type=af:j20] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 3 true
execute as @s[type=af:su57] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 7 true
execute as @s[type=af:tu160] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run effect @s speed 1 5 true
execute as @s[type=af:tu160] if entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run event entity @s af:ignite_on
execute as @s[type=af:tu160] unless entity @p[r=2, hasitem={item=af:throttle,location=slot.weapon.mainhand}] run event entity @s af:ignite_off