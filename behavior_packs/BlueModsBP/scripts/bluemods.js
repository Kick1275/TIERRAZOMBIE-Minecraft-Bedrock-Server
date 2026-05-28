import { system } from "@minecraft/server";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

(async function loadMainPlugin() {
    await system.waitTicks(0);
    const start = Date.now();
    import(`./main.js`)
        .then(() => {
            console.warn(`§7[§bBlueMods§7] §fLoaded Plugin: §emain.js§f Successfully, in §e${Date.now() - start} ms§r`);
        })
        .catch((error) => {
            console.warn(`§7[§bBlueMods§7] §fError on Loading Plugin main.js: §c` + error + error.stack + `§r`);
        });
})();

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});