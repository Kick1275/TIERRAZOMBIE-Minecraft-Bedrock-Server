execute at @s unless block ~~-0.1~ air if block ~0.1~~ air if block ~-0.1~~ air if block ~~0.1~ air if block ~~~0.1 air if block ~~~-0.1 air run particle mcpe:bullet_hole1 ~~~

execute at @s unless block ~~0.01~ air if block ~~-0.01~ air run particle mcpe:bullet_hole2 ~~~

execute at @s unless block ~0.01~~ air if block ~~~-0.01 air unless block ~~~0.1 air run particle mcpe:bullet_hole3 ~~~

execute at @s unless block ~~~-0.01 air if block ~0.01~~ air run particle mcpe:bullet_hole4 ~~~

execute at @s unless block ~-0.01~~ air if block ~~~0.01 air run particle mcpe:bullet_hole5 ~~~

execute at @s unless block ~~~0.01 air if block ~-0.01~~ air run particle mcpe:bullet_hole6 ~~~

playsound impact.bounce @a[r=15] ~~~ 10 1 0.01

particle mcpe:smoke ^^0.5^