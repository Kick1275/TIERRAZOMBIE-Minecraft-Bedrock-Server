import { world, system } from "@minecraft/server";

system.runInterval(() => {

    world.getDimension("overworld").runCommand("function constants_delay");
    world.getDimension("nether").runCommand("function constants_delay");
    world.getDimension("the_end").runCommand("function constants_delay");

}, 10);