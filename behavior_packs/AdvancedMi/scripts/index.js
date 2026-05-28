import { world, system,ItemStack } from "@minecraft/server";
import { missionDB, mostrarMisiones } from "./ui/missionUi";
import { menuPrincipal, addItems} from "./ui/missionUi";
import { textStyles, API_CONFIG } from "./config/main";
import { traducciones } from "./ui/missionUi";
import { MinecraftSoundTypes } from "./recursos/class/SundType";

//Alerta
function popop(player, colores, datos, newValue) {
    player.onScreenDisplay.setTitle(`§p§p§p§f${colores.mensaje}${traducciones.global.completeMAlert}\n${colores.mision}${datos.misionName}${textStyles.styles.reset}${colores.mensaje}\n( ${newValue} / ${datos.goal} )\n${traducciones.global.categoria} ${traducciones.global.categoriaEjem[datos.missiontype]}`);
    player.playSound(MinecraftSoundTypes.randomToast, { pitch: 1 });
}
// Evento para ítem usado
world.afterEvents.itemUse.subscribe((event) => {
    const { source, itemStack } = event;
    if (itemStack.typeId == API_CONFIG.AbrirMenu.item && source.hasTag(API_CONFIG.AbrirMenu.tagAdmin)) {
        menuPrincipal(source)
    } else if (itemStack.typeId == API_CONFIG.AbrirMenu.item) {
        mostrarMisiones(source)
    } else if (itemStack.typeId == 'minecraft:apple') {
        addItems('u73ztv289jiassa:$vstone-$vdiamond,6', source)
    }
});
function handleMissionProgress(player, datos, incremento, alert) {
    const currentValue = player.getDynamicProperty(datos.property) ?? 0;
    const nuevoGoal = datos.goal;
    const newValue = Math.min(currentValue + incremento, nuevoGoal);
    const finalValue = Math.max(newValue, 0);
    let valid = false;
    player.setDynamicProperty(datos.property, finalValue);
    const porcentaje = (finalValue / nuevoGoal) * 100;

    const colores = API_CONFIG.colorAlertMision[datos.missiontype];

    let icon;
    switch (datos.missiontype) {
        case 'Kill':
            icon = '';
            break;
        case 'Miner':
            icon = '';
            break;
        case 'Collect':
            icon = '';
            break;
        case 'Place':
            icon = '';
            break;
    }

    if (finalValue >= nuevoGoal) {
        if (!valid || player.getDynamicProperty(`completed_${datos.property}`) === false) {
            system.runTimeout(() => {
                popop(player, colores, datos, finalValue);
            });
            player.setDynamicProperty(`completed_${datos.property}`, true);
            valid = true;
        }
    } else {
        if(alert){
            player.sendMessage(`${icon} ${textStyles.styles.bold}>>${textStyles.styles.reset}${colores.mensaje} ${traducciones.global.progresoM} ${colores.mision}${datos.misionName}${textStyles.styles.reset}${colores.mensaje}: ${colores.progreso}${finalValue}/${nuevoGoal} (${Math.floor(porcentaje)}%)${textStyles.styles.reset}`);
        }
        valid = false;
        player.setDynamicProperty(`completed_${datos.property}`, false);
    }
    
}
// Función general para manejar misiones
function processMissions(player, typeId, actionType, incremento = 1) {
    const misiones = missionDB.collection();
    Object.entries(misiones).forEach(([clave, datos]) => {
        if (datos.missiontype === actionType && typeId === datos.MobItemRecolecta) {
            const currentProgress = player.getDynamicProperty(datos.property) ?? 0;
            if (currentProgress < datos.goal) {
                handleMissionProgress(player, datos, incremento, true);
            }
        }
    });
}

// Evento para misiones de Kills
world.afterEvents.entityDie.subscribe((kill) => {
    try {
        const entityDie = kill.deadEntity.typeId;
        const entitySource = kill.damageSource.damagingEntity;
        if (entitySource) {
            processMissions(entitySource, entityDie, 'Kill');
        }
    } catch (error) {
        console.warn(error);
    }
});
// Evento para misiones de Minar
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    try {
        processMissions(event.player, event.block.typeId, 'Miner');
    } catch (error) {
        console.warn(error);
    }
});
// Evento para misiones de Colocar bloques
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    try {
        processMissions(event.player, event.block.typeId, 'Place');
    } catch (error) {
        console.warn(error);
    }
});

function processCollectMissions() {
    const players = world.getAllPlayers();
    const misiones = missionDB.collection();

    players.forEach(player => {
        const inventario = player.getComponent('inventory').container;

        Object.entries(misiones).forEach(([clave, datos]) => {
            if (datos.missiontype === 'Collect') {
                const missionCompleted = player.getDynamicProperty(`completed_${datos.property}`) ?? false;
                if (missionCompleted) return;
                let totalItemsInInventory = 0;
                for (let i = 0; i < inventario.size; i++) {
                    const item = inventario.getItem(i);
                    if (item && item.typeId === datos.MobItemRecolecta) {
                        totalItemsInInventory += item.amount;
                    }
                }

                const currentValue = player.getDynamicProperty(datos.property) ?? 0;

                if (currentValue >= datos.goal) {
                    player.setDynamicProperty(`completed_${datos.property}`, true);
                    return;
                }

                const itemAlreadyCounted = player.getDynamicProperty(`counted_${datos.property}_${datos.MobItemRecolecta}`) ?? 0;
                if (totalItemsInInventory < itemAlreadyCounted) {
                    const difference = totalItemsInInventory - itemAlreadyCounted;
                    player.setDynamicProperty(`counted_${datos.property}_${datos.MobItemRecolecta}`, totalItemsInInventory);
                    // Descontar el progreso si la cantidad de ítems disminuyó
                    if (difference < 0) {
                        handleMissionProgress(player, datos, difference, true); // Descontar los ítems tirados
                    }
                } else if (totalItemsInInventory > itemAlreadyCounted) {
                    const difference = totalItemsInInventory - itemAlreadyCounted;
                    player.setDynamicProperty(`counted_${datos.property}_${datos.MobItemRecolecta}`, totalItemsInInventory);
                    if (difference > 0) {
                        handleMissionProgress(player, datos, difference, true);
                    }
                }
            }
        });
    });
}
system.runInterval(() => {
    processCollectMissions();
}, 5);

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
    if (!initialSpawn || !player.isValid() || player.hasTag('welcome')) return;
    player.getComponent('inventory').container.addItem(new ItemStack('alberto35:mission'))
    player.addTag('welcome');
    world.setDynamicProperty('idioma', "english")
    player.runCommandAsync('scoreboard objectives add money dummy')
});