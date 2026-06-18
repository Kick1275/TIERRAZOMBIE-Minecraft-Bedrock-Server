console.warn("Npc_Vault correctamente")
import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { showShopForm } from "./Npc_TzShop";
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;
    if(target.typeId === "tz:npc_vault"){
        showVault(player,target)
    }

});

    world.afterEvents.entityHitEntity.subscribe((event) => {
        const player = event.damagingEntity;
        const target = event.hitEntity;
        if (player?.typeId === "minecraft:player" && target?.typeId === "tz:npc_vault") {
            showVault(player);
        }
    });

    function getPlayerLanguage(player) {
        if (player.hasTag("lang_es_ES")) return "es";
        return "en";
    }

    function showVault(player, target) {
        const lang = getPlayerLanguage(player);
        const textos = {
            es: {
                titulo: "§l§6🔒 VÓBEDA DE SUPERVIVIENTES",
                cuerpo: "§7¡Bienvenido, §aSuperviviente§7! ¿Quieres entrar a la §eVóbeda§7?",
                btnEntrar: "§aEntrar\n§7[Acceso seguro]",
                btnSalir: "§cSalir\n§7[Cancelar]",
                btnCancelar: "§7Cancelar",
                mensajeEntrar: "§aHas entrado a la Vóbeda.",
                mensajeSalir: "§cHas salido de la Vóbeda."
            },
            en: {
                titulo: "§l§6🔒 SURVIVOR VAULT",
                cuerpo: "§7Welcome, §aSurvivor§7! Do you want to enter the §eVault§7?",
                btnEntrar: "§aEnter\n§7[Safe Access]",
                btnSalir: "§cExit\n§7[Cancel]",
                btnCancelar: "§7Cancel",
                mensajeEntrar: "§aYou have entered the Vault.",
                mensajeSalir: "§cYou have exited the Vault."
            }
        };
        const t = textos[lang];

        const form = new ActionFormData()
            .title(t.titulo)
            .body(t.cuerpo)
            .button(t.btnEntrar, "textures/ui/inventory_icon.png")
            .button(t.btnSalir, "textures/ui/icon_import.png")
            .button(t.btnCancelar, "textures/ui/redX1.png");

        form.show(player).then((response) => {
            if (response.canceled) return;
            if (response.selection === 0) {
                player.runCommand("camera @s fade time 0.1 2 5");
                system.runTimeout(() => {
                    player.runCommand("tp @s -1743.49 27.00 2038.43");
                    player.runCommand('playsound random.enderchestopen');
                    player.sendMessage(t.mensajeEntrar);
                }, 5);
            } else if (response.selection === 1) {
                player.runCommand("camera @s fade time 0.1 2 5");
                system.runTimeout(() => {
                    player.runCommand("tp @s -1797.47 252.00 2101.49");
                    player.runCommand('playsound random.enderchestclosed');
                    player.sendMessage(t.mensajeSalir);
                }, 5);
            }
        });
    }