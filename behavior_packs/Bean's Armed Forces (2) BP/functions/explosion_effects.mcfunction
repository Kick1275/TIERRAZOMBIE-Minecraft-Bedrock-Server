particle af:explosionball_sparks ~ ~ ~
particle af:explosionball_main ~ ~ ~
particle af:explosionball_light ~ ~ ~
playsound vehicle.explode @a ~ ~ ~ 20 1
fill ~-8 ~-8 ~-8 ~8 ~8 ~8 dirt replace grass_block
fill ~-10 ~-10 ~-6 ~10 ~10 ~6 dirt replace grass_block
fill ~-6 ~-10 ~-10 ~6 ~10 ~10 dirt replace grass_block
camerashake add @a[r=256] 0.2 0.5 positional