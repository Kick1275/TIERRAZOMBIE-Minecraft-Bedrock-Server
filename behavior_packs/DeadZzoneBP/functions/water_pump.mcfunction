execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:bottle_water_emp},r=7] run give @s mcpe:bottle_water 1
execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:bottle_water_emp},r=7] run clear @s mcpe:bottle_water_emp 0 1

execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:rags_dirty},r=7] run give @s mcpe:rags 1
execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:rags_dirty},r=7] run clear @s mcpe:rags_dirty 0 1

execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:cooking_pot},r=7] run give @s mcpe:pot_cook_water 1
execute as @a[hasitem={location=slot.weapon.mainhand, item=mcpe:cooking_pot},r=7] run clear @s mcpe:cooking_pot 0 1

playsound water.pump @a[r=5] ~~~