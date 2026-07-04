// scripts/main.js
import { world } from "@minecraft/server";

console.warn("Player correctamente");
console.warn("Player cargado!");

// Función para obtener el idioma del jugador
function getPlayerLanguage(player) {
    if (!player || !player.isValid()) return "en_US"; // Verificación de jugador válido
    return player.hasTag("lang_es_ES") ? "es_ES" : "en_US";
}

// Otorgar ítems y mostrar mensaje al jugador al entrar al mundo
world.afterEvents.playerSpawn.subscribe(async (data) => {
    const player = data.player;
    if (!player || !player.isValid()) {
        console.warn("Error: Jugador no válido en el evento playerSpawn");
        return;
    }

    const lang = getPlayerLanguage(player);

    const mensajes = {
        es_ES:
            "§l§4==============================\n" +
            "§l§6¡Bienvenido a §eTIERRA ZOMBIE!§r\n" +
            "§l§4==============================\n" +
            "§r§4>> §fEl servidor está en estado de §e'Early Access'§r\n" +
            "§r§4>> §fEsto significa que esta no es la versión final del servidor, sino una beta diseñada para recaudar fondos.\n" +
            "§r§5>> §f§l¡CONSIDERA APORTAR AL SERVIDOR COMPRANDO EN LA TIENDA WEB!§r\n" +
            "§r§6TZ Web Shop: §r§bhttps://sites.google.com/view/shop-tierra-zombie\n" +
            "§l§4==============================",
        en_US:
            "§l§4==============================\n" +
            "§l§6Welcome to §eTIERRA ZOMBIE!§r\n" +
            "§l§4==============================\n" +
            "§r§4>> §fThe server is in §e'Early Access'§r\n" +
            "§r§4>> §fThis is not the final version, it's a beta to raise funds.\n" +
            "§r§5>> §f§lCONSIDER SUPPORTING THE SERVER BY SHOPPING ONLINE!§r\n" +
            "§r§6TZ Web Shop: §r§bhttps://sites.google.com/view/shop-tierra-zombie\n" +
            "§l§4=============================="
    };

    
       //player.runCommand('replaceitem entity @s slot.hotbar 8 tz:unknowskill 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}')
        //player.runCommand('replaceitem entity @s slot.hotbar 0 tz:telefono_iu 1 0 {"item_lock":{"mode":"lock_in_slot"}, "keep_on_death":{}}')
        // player.runCommand('give @s bluemods:itemui 1 0')
       // player.runCommand('scoreboard objectives add TzCoins dummy "TzCoins"')
       // player.runCommand('scoreboard players add @s TzCoins 0')
        player.runCommand('effect @s resistance 30 255 true')
        player.runCommand('effect @s weakness 30 255 true')
        player.runCommand('camera @s fade time 0.1 1 1')
        player.runCommand('playsound safe.zone @s')
        //player.runCommand('title @s title §l§6¡HAHAHA! §2¡Tierra §4Zombie!')
        // player.runCommand('title @s subtitle §l§7¡Explore, protect and survive.!')
        player.runCommand('effect @s regeneration 10 250')
        // player.runCommand('effect @s health_boost infinite 4')
        player.sendMessage(mensajes[lang]);
        if (!player.hasTag("tz_kit_inicio")) {
            player.runCommand('tag @s add tz_kit_inicio')
            player.runCommand('effect @s regeneration 10 250')
            player.runCommand('give @s mcpe:bandage_sterilized 16 0 {"keep_on_death":{}}')
            player.runCommand('give @s bed 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s bed 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s bed 1 0 {"keep_on_death":{}}')
            player.runCommand('camera @s fade time 5 1 1')
            player.runCommand('playsound safe.zone @s')
            player.runCommand('title @s title §l§6¡Bienvenido a §2Tierra §4Zombie!')
            player.runCommand('title @s subtitle §l§7¡Explore, protect and survive.!')
           // player.runCommand('tag @s add radio_connected')
            player.runCommand('give @s mcpe:nailed_bat 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:nailed_bat 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:nailed_bat 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s compass 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s spyglass 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s bread 32 0 {"keep_on_death":{}}')
            player.runCommand('give @s chest 3 0 {"keep_on_death":{}}')
            // player.runCommand('give @s tz:locker 3 0 {"keep_on_death":{}}')
            // player.runCommand('give @s tz:editor 1 0 {"keep_on_death":{}}')
            // player.runCommand('give @s md:miter_saw 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:smoke_grenade 3 0 {"keep_on_death":{}}')
            player.runCommand('give @s shield 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:hard_red 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:biker_vest 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:varsity_red 1 0 {"keep_on_death":{}}')
            player.runCommand('give @s mcpe:khaki_light 1 0 {"keep_on_death":{}}')

            /*player.runCommand('replaceitem entity @s slot.hotbar 0 tz:telefono_iu 1 0 {"keep_on_death":{}}')
            player.runCommand('replaceitem entity @s slot.hotbar 0 tz:telefono_iu 1 0 {"keep_on_death":{}}')
            player.runCommand('replaceitem entity @s slot.hotbar 0 tz:telefono_iu 1 0 {"keep_on_death":{}}')
            player.runCommand('replaceitem entity @s slot.hotbar 0 tz:telefono_iu 1 0 {"keep_on_death":{}}')*/
            player.sendMessage(lang === "es_ES"
                ? "§a¡Has recibido tu kit de inicio por unirte por primera vez!"
                : "§aYou have received your starter kit for joining for the first time!");
        }
});