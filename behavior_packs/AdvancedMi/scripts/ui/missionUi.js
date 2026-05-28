import { world, ItemStack } from "@minecraft/server";
import { ForceAction, ForceModal } from "../recursos/class/form";
import { addScore, metricNumbers } from "../recursos/functions";
import { API_CONFIG } from "../config/main";
import { Database } from "../bd/Database";
import { obtenerTraducciones, alerta_idioma } from "../recursos/languaje";
export let Control_idioma = world.getDynamicProperty('idioma') || 'espaniol';
export let traducciones = obtenerTraducciones(Control_idioma);
import { MinecraftSoundTypes } from "../recursos/class/SundType";
export const missionDB = new Database('misiones');

function idiomaC(player) {
    player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
    const idioma = new ForceAction();
    idioma.setTitle(traducciones.idiomaC.title);
    idioma.setBody(traducciones.idiomaC.body);
    idioma.addButton(traducciones.idiomaC.btnEspaniol, API_CONFIG.texturas_icons.idiomas.es);
    idioma.addButton(traducciones.idiomaC.btnEnglish, API_CONFIG.texturas_icons.idiomas.us);
    idioma.addButton(traducciones.idiomaC.btnPortuguese, API_CONFIG.texturas_icons.idiomas.br);
    idioma.addButton(traducciones.global.volver, API_CONFIG.texturas_icons.menu);
    idioma.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
    idioma.send(player, (r, player) => {
        if (!r) return;
        player.playSound(MinecraftSoundTypes.randomClick, { pitch: 1.5 });
        switch (r.selection) {
            case 0:
                world.setDynamicProperty('idioma', 'espaniol');
                break;
            case 1:
                world.setDynamicProperty('idioma', 'english');
                break;
            case 2:
                world.setDynamicProperty('idioma', 'portugues');
                break;
            case 3:
                menuPrincipal(player);
                return;
            default:
                player.sendMessage(traducciones.global.saliste);
                player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
                return;
        }
        Control_idioma = world.getDynamicProperty('idioma');
        traducciones = obtenerTraducciones(Control_idioma);
        player.sendMessage(alerta_idioma());
    });
}
export function menuPrincipal(player) {
    player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
    const menu = new ForceAction();
    menu.setTitle(traducciones.principalUi.titulo);
    menu.setBody(traducciones.principalUi.body);
    menu.addButton(traducciones.principalUi.btnCrear, API_CONFIG.texturas_icons.menuPrincipal.crear);
    menu.addButton(traducciones.principalUi.btnVer, API_CONFIG.texturas_icons.menuPrincipal.ver);
    menu.addButton(traducciones.principalUi.btnEditar, API_CONFIG.texturas_icons.menuPrincipal.editar);
    menu.addButton(traducciones.principalUi.btnEliminar, API_CONFIG.texturas_icons.menuPrincipal.eliminar);
    menu.addButton(traducciones.principalUi.btnIdioma, API_CONFIG.texturas_icons.menuPrincipal.idioma);
    menu.addButton(traducciones.principalUi.btncreditos, API_CONFIG.texturas_icons.menuPrincipal.creditos );
    menu.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
    menu.send(player, (r, player) => {
        if (!r) return;

        switch (r.selection) {
            case 0:
                typeMission(player);
                break;
            case 1:
                mostrarMisiones(player);
                break;
            case 2:
                mostrarMisionesParaEditar(player);
                break;
            case 3:
                mostrarMisionesParaEliminar(player);
                break;
            case 4:
                idiomaC(player);
                break;
            case 5:
                creditos(player)
            default:
                player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
                break;
        }
    });
}
export async function mostrarMisiones(player) {
    try {
        const misiones = await missionDB.collectionSync();
        if (Object.keys(misiones).length === 0) {
            player.sendMessage(traducciones.mostrarM.cero);
            player.playSound(MinecraftSoundTypes.randomToast, { pitch: 1 });
            return;
        }
        const menu = new ForceAction();
        menu.setTitle(traducciones.mostrarM.titulo);
        menu.setBody(traducciones.mostrarM.body);
        player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
        Object.entries(misiones).forEach(([clave, datos]) => {
            let texture = API_CONFIG.texturas_icons.mostrarMisiones.default;
            const completed = player.hasTag(`${datos.property}_reclamada`);
            const progress = player.getDynamicProperty(datos.property);
            if (completed) {
                texture = API_CONFIG.texturas_icons.mostrarMisiones.mision_reclamada;
            } else if (progress >= datos.goal) {
                texture = API_CONFIG.texturas_icons.mostrarMisiones.mision_completa;
            }
            menu.addButton(`${traducciones.colorsTextUi.btnM}${datos.misionName}\n${traducciones.colorsTextUi.reset}${traducciones.global.clic1}`, texture);
        });
        menu.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
        menu.send(player, (response) => {
            if (response.selection < Object.keys(misiones).length) {
                const misionSeleccionada = misiones[Object.keys(misiones)[response.selection]];
                handleMision(player, misionSeleccionada);
                player.playSound(MinecraftSoundTypes.randomOrb, { pitch: 1 });
            } else {
                player.sendMessage(traducciones.global.saliste);
                player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
            }
        });
    } catch (error) {
        player.sendMessage(traducciones.global.error + error);
        player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
    }
}
function handleMision(player, mision) {
    const progress = player.getDynamicProperty(mision.property);
    const completed = player.hasTag(`${mision.property}_reclamada`);
    const message = progress >= mision.goal
        ? !completed ? traducciones.handleM.m1 : traducciones.handleM.m2
        : traducciones.handleM.m3;

    const ui = new ForceAction();
    ui.setTitle(`§l§6✦ ${mision.misionName} ✦`);
    
    // Crear el texto de recompensas
    let recompensasText = `${traducciones.handleM.recompensa}\n`;

    if (mision.scoreToggle) {
        recompensasText += `+${metricNumbers(mision.reward)}\n`;
    }

    // Solo agregar ítems si el toggle está activo, pero no bloquear la creación de la UI
    if (mision.itemsToggle) {
        const itemsText = mision.items.trim().split('-').map(item => {
            const [idItem, count] = item.split(',').map(i => i.trim());
            const itemType = idItem.replace(/\$v(\w+)/g, '- $1').trim();
            return `${itemType} x${count || 1}`;
        }).join('\n');

        recompensasText += `${itemsText}\n`;
    }

    // Configurar el cuerpo de la UI, independientemente de los toggles
    ui.setBody(
        `${traducciones.handleM.objectivo} ${mision.missiontype} §7( ${mision.misionObj} )\n` +
        `${traducciones.handleM.progreso} ${progress || 0} §7/ §b${mision.goal}\n\n` +
        recompensasText + 
        `${traducciones.handleM.estado} ${message}`
    );

    // Botón para reclamar recompensa o salir
    const buttonText = (progress >= mision.goal && !completed) ? traducciones.handleM.btnReclamar : traducciones.global.salir;
    const buttonTexture = (progress >= mision.goal && !completed) ? API_CONFIG.texturas_icons.mostrarMisiones.reclamar_recompensa : API_CONFIG.texturas_icons.salir;
    ui.addButton(buttonText, buttonTexture);

    // Enviar la UI y manejar la respuesta
    ui.send(player, (response) => {
        if (response.selection === 0 && progress >= mision.goal && !completed) {
            player.addTag(`${mision.property}_reclamada`);
            let alertMessage = '';

            // Si está activado el toggle de items, dar los items al jugador
            if (mision.itemsToggle) {
                addItems(mision.items, player);
                alertMessage = `${traducciones.handleM.itemsEntregados}`;
            }

            // Si está activado el toggle de score, añadir el score al jugador
            if (mision.scoreToggle) {
                addScore(player, mision.scoreboard, mision.reward);
                if (alertMessage) {
                    alertMessage += ` ${traducciones.handleM.puntosEntregados} +${metricNumbers(mision.reward)}.`;
                } else {
                    alertMessage = `${traducciones.handleM.puntosEntregados} +${metricNumbers(mision.reward)}.`;
                }
            }

            // Enviar un mensaje general dependiendo de las recompensas activadas
            player.sendMessage(`${traducciones.handleM.felicitacion} ${alertMessage} ${traducciones.handleM.mreclamada} ${mision.misionName}`);
            player.playSound(MinecraftSoundTypes.randomLevelUp, { pitch: 2 });
        } else {
            player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
        }
    });
}

export function addItems(values, player) {
    // Separar la parte del ID de la misión y los items
    const itemsString = values // Ignorar el ID de la misión, obtener solo los items

    // Crear la lista de items a partir de la parte de itemsString
    const getItems = itemsString.trim().split('-').map(item => {
        const [idItem, count] = item.split(',').map(i => i.trim()); // Dividir cada item por la coma y eliminar espacios

        // Asegurarse de que el ID del item esté presente
        if (idItem) {
            // Reemplazar el prefijo $v por minecraft: si existe
            const itemType = idItem.replace(/\$v(\w+)/g, 'minecraft:$1').trim();
            
            // Si no se especifica cantidad, usar 1 como predeterminado
            const itemCount = count ? parseInt(count) : 1;

            return {
                item: itemType, // ID del item con prefijo corregido
                count: itemCount // Usar la cantidad proporcionada o 1 si no se especifica
            };
        }
        return null;
    }).filter(Boolean);
    getItems.forEach(get => {
        const itemType = get.item;
        const count = get.count;
        const itemStack = new ItemStack(itemType, count);
        const inventory = player.getComponent('inventory').container;
        inventory.addItem(itemStack);
    });
}
function typeMission(player) {
    const type = new ForceAction();
    player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
    type.setTitle(traducciones.mTypes.title);
    type.setBody(traducciones.mTypes.body);
    type.addButton(traducciones.mTypes.btn1, API_CONFIG.texturas_icons.typeMission.btn1);
    type.addButton(traducciones.mTypes.btn2, API_CONFIG.texturas_icons.typeMission.btn2);
    type.addButton(traducciones.mTypes.btn3, API_CONFIG.texturas_icons.typeMission.btn3);
    type.addButton(traducciones.mTypes.btn4, API_CONFIG.texturas_icons.typeMission.btn4);
    type.addButton(traducciones.global.volver, API_CONFIG.texturas_icons.menu);
    type.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
    type.send(player, (response) => {
        if (response.selection == 0) {
            player.playSound(MinecraftSoundTypes.randomOrb, { pitch: 2 });
            createMission(player, 'Kill');
        } else if (response.selection == 1) {
            player.playSound(MinecraftSoundTypes.randomOrb, { pitch: 2 });
            createMission(player, 'Miner');
        } else if (response.selection == 2) {
            player.playSound(MinecraftSoundTypes.randomOrb, { pitch: 2 });
            createMission(player, 'Collect');
        } else if (response.selection == 3) {
            player.playSound(MinecraftSoundTypes.randomOrb, { pitch: 2 });
            createMission(player, 'Place');
        } else if (response.selection == 4) {
            menuPrincipal(player);
        } else {
            player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
            player.sendMessage(traducciones.global.saliste);
        }
    });
}
function createMission(player, typeM) {
    const modal = new ForceModal();
    modal.setTitle(traducciones.createM.title);

    const objetivoEjemplo = traducciones.createM.ejemplo + ' ' + (typeM === 'Kill' ? traducciones.createM.objSi.Kill :
        typeM === 'Miner' ? traducciones.createM.objSi.Miner :
            typeM === 'Collect' ? traducciones.createM.objSi.Collect :
                typeM === 'Place' ? traducciones.createM.objSi.Place :
                    'Acción no definida');

    const mobItemKill = (typeM === 'Kill' ? traducciones.createM.item_mob_bloque.Kill :
        typeM === 'Miner' ? traducciones.createM.item_mob_bloque.Miner :
            typeM === 'Collect' ? traducciones.createM.item_mob_bloque.Collect :
                typeM === 'Place' ? traducciones.createM.item_mob_bloque.Place :
                    'Bloque a colocar');

    const mobItemKill_example = traducciones.createM.ejemplo + ' ' + (typeM === 'Kill' ? traducciones.createM.item_mob_bloque.ejemplos.Kill :
        typeM === 'Miner' ? traducciones.createM.item_mob_bloque.ejemplos.Miner :
            typeM === 'Collect' ? traducciones.createM.item_mob_bloque.ejemplos.Collect :
                typeM === 'Place' ? traducciones.createM.item_mob_bloque.ejemplos.Place :
                    'Bloque a colocar');

    const vanilla = traducciones.createM.item_mob_bloque.values.un + ' ' + (typeM === 'Kill' ? traducciones.createM.item_mob_bloque.values.Kill :
        typeM === 'Miner' ? traducciones.createM.item_mob_bloque.values.Miner :
            typeM === 'Collect' ? traducciones.createM.item_mob_bloque.values.Collect :
                typeM === 'Place' ? traducciones.createM.item_mob_bloque.values.Place : '');

    modal.addInput(traducciones.createM.nombreM, traducciones.createM.eliminar);//0
    modal.addInput(traducciones.handleM.objectivo, objetivoEjemplo);//1
    modal.addInput(traducciones.global.completar.text, traducciones.global.completar.count);//2
    modal.addToggle(`${vanilla} ${traducciones.createM.item_mob_bloque.Vanilla}`, true)//3
    modal.addInput(mobItemKill, mobItemKill_example);//4
    
    modal.addToggle(traducciones.createM.toggles.score, true)//3 5
    modal.addInput(traducciones.global.recompensa.text, traducciones.global.recompensa.ejemplo);//5 6
    modal.addInput(traducciones.createM.scoreboardRecompensa.text, traducciones.createM.scoreboardRecompensa.value);//6 7

    modal.addToggle(traducciones.createM.toggles.items, false)//8
    modal.addInput(traducciones.createM.itemsRecompensa.text, traducciones.createM.itemsRecompensa.value);//9


    modal.send(player, async (response) => {
        if (!response) {
            player.sendMessage(traducciones.createM.formCancel);
            player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
        } else {
            const goal = Number(response.formValues[2]) || 10;
            const reward = Number(response.formValues[6]) || 100;
            if (isNaN(goal) || isNaN(reward)) {
                world.sendMessage(traducciones.createM.valors_default.error);
                return;
            }
            const mob_item_bloque_set = response.formValues[3] ? `minecraft:${response.formValues[4]}` : response.formValues[4];
            const ID = generateUniqueId() + response.formValues[0];
            const valoresDefault = {
                name: traducciones.createM.valors_default.misiones.sinNombre,
                obj: traducciones.createM.valors_default.misiones.objectivoNoE,
                property: traducciones.createM.valors_default.misiones.property,
                desconcido: traducciones.createM.valors_default.misiones.desconcido,
                score: traducciones.createM.valors_default.misiones.score_default,
                items: null
            }

            let ScoreControl = {
                score: null,
                rw: null
            }
            let itemsCrontrol = valoresDefault.items

            if(response.formValues && response.formValues[5] == true){
                ScoreControl =  {
                    score: response.formValues[7] || valoresDefault.score,
                    rw: reward
                }
            }

            if(response.formValues && response.formValues[8] == true){
                itemsCrontrol = `${response.formValues[9]}`;
            }
            
            console.warn(itemsCrontrol)
            const mission = {
                id: ID,
                misionName: response.formValues[0] || valoresDefault.name,
                misionObj: response.formValues[1] || valoresDefault.obj,
                missiontype: typeM,
                property: ID + (response.formValues[0] || valoresDefault.property),
                goal: goal,
                MobItemRecolecta: mob_item_bloque_set || valoresDefault.desconcido,
                scoreToggle: response.formValues[5],
                reward: ScoreControl.rw,
                scoreboard: ScoreControl.score,
                state: 'default',
                vanilla: response.formValues[3],
                itemsToggle: response.formValues[8],
                scoreToggle: response.formValues[5],
                items: itemsCrontrol
            };
            try {
                await saveMissionToDatabase(mission);
            } catch (error) {
                world.sendMessage(traducciones.createM.error + error);
            }
        }
    });
}
async function mostrarMisionesParaEditar(player) {
    try {
        const misiones = await missionDB.collectionSync();
        if (Object.keys(misiones).length === 0) {
            player.sendMessage(traducciones.mostrarM.cero);
            return;
        }
        const menu = new ForceAction();
        menu.setTitle(traducciones.mEliminar.title);
        menu.setBody(traducciones.mEliminar.body);
        Object.entries(misiones).forEach(([clave, datos]) => {
            menu.addButton(`${traducciones.colorsTextUi.editarColor}${datos.misionName}\n${traducciones.global.mEditar}`, API_CONFIG.texturas_icons.mostrarMisionesParaEditar.edit_mision);
        });
        menu.addButton(traducciones.global.volver, API_CONFIG.texturas_icons.menu);
        menu.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
        player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
        menu.send(player, (response) => {
            if (response.selection !== undefined && response.selection < Object.keys(misiones).length) {
                const misionSeleccionada = misiones[Object.keys(misiones)[response.selection]];
                editParam(player, misionSeleccionada);
            }
            else if (response.selection === Object.keys(misiones).length) {
                menuPrincipal(player);
            } else {
                player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
                player.sendMessage(traducciones.global.saliste);
            }
        });
    } catch (error) {
        player.sendMessage(traducciones.global.error + ' ' + error);
    }
}
function creditos(player) {
    player.playSound(MinecraftSoundTypes.BeaconPower, { pitch: 1 });
    const c = new ForceAction()
    c.setTitle(traducciones.creditos.title);
    c.setBody(traducciones.creditos.body);
    c.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
    c.send(player, (response) => {
        player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
        player.sendMessage(traducciones.global.saliste);
    });
}
function editParam(player, mision) {
    const modal = new ForceModal();
    modal.setTitle(traducciones.editparam.title);
    player.playSound(MinecraftSoundTypes.BookPageTurn, { pitch: 1 });
    const objetivoEjemplo = traducciones.createM.ejemplo + ' ' + (mision.missiontype === 'Kill' ? traducciones.createM.objSi.Kill :
        mision.missiontype === 'Miner' ? traducciones.createM.objSi.Miner :
            mision.missiontype === 'Collect' ? traducciones.createM.objSi.Collect :
                mision.missiontype === 'Place' ? traducciones.createM.objSi.Place :
                    'Acción no definida');

    const mobItemKill = (mision.missiontype === 'Kill' ? traducciones.createM.item_mob_bloque.Kill :
        mision.missiontype === 'Miner' ? traducciones.createM.item_mob_bloque.Miner :
            mision.missiontype === 'Collect' ? traducciones.createM.item_mob_bloque.Collect :
                mision.missiontype === 'Place' ? traducciones.createM.item_mob_bloque.Place :
                    'Bloque a colocar');

    const mobItemKill_example = traducciones.createM.ejemplo + ' ' + (mision.missiontype === 'Kill' ? traducciones.createM.item_mob_bloque.ejemplos.Kill :
        mision.missiontype === 'Miner' ? traducciones.createM.item_mob_bloque.ejemplos.Miner :
            mision.missiontype === 'Collect' ? traducciones.createM.item_mob_bloque.ejemplos.Collect :
                mision.missiontype === 'Place' ? traducciones.createM.item_mob_bloque.ejemplos.Place :
                    'Bloque a colocar');

    const vanillaType = mision.missiontype === 'Kill' ? 'Mob' :
        mision.missiontype === 'Miner' ? 'Bloque' :
            mision.missiontype === 'Collect' ? 'Item' :
                mision.missiontype === 'Place' ? 'Bloque' :
                    'Bloque a colocar';

    const itemsString = mision.items;

    const isVanilla = mision.vanilla;
    const displayMobItem = isVanilla
        ? mision.MobItemRecolecta.replace('minecraft:', '')
        : mision.MobItemRecolecta;

    modal.addInput(traducciones.createM.nombreM, traducciones.createM.eliminar, mision.misionName || '');
    modal.addInput(traducciones.handleM.objectivo, objetivoEjemplo, mision.misionObj || '');
    modal.addInput(traducciones.global.completar.text, traducciones.global.completar.count, mision.goal?.toString() || '0');
    modal.addToggle(`${vanillaType} Vanilla?`, isVanilla);
    modal.addInput(mobItemKill, mobItemKill_example, displayMobItem || '');
    

    modal.addToggle(traducciones.createM.toggles.score, mision.scoreToggle)//3 5
    modal.addInput(traducciones.global.recompensa.text, traducciones.global.recompensa.ejemplo, mision.reward?.toString() || '0');
    modal.addInput(traducciones.createM.scoreboardRecompensa.text, traducciones.createM.scoreboardRecompensa.value, mision.scoreboard || '');

    modal.addToggle(traducciones.createM.toggles.items, mision.itemsToggle)//8
    modal.addInput(traducciones.createM.itemsRecompensa.text, traducciones.createM.itemsRecompensa.value, itemsString);//9
    modal.send(player, async (response) => {
        if (response) {
            const esVanillaEditado = response.formValues[3];
            let nuevoMobItemRecolecta = response.formValues[4];
            if (esVanillaEditado) {
                if (!nuevoMobItemRecolecta.startsWith('minecraft:')) {
                    nuevoMobItemRecolecta = `minecraft:${nuevoMobItemRecolecta}`;
                }
            }

            
            const reward = Number(response.formValues[6]) || 100;

            const valoresDefault = {
                name: traducciones.createM.valors_default.misiones.sinNombre,
                obj: traducciones.createM.valors_default.misiones.objectivoNoE,
                property: traducciones.createM.valors_default.misiones.property,
                desconcido: traducciones.createM.valors_default.misiones.desconcido,
                score: traducciones.createM.valors_default.misiones.score_default,
                items: null
            }
        
            let ScoreControl = {
                score: null,
                rw: null
            }

            if(response.formValues && response.formValues[5] == true){
                ScoreControl =  {
                    score: response.formValues[7] || valoresDefault.score,
                    rw: reward
                }
            }

            const newItems = `${response.formValues[9]}`;

            const updatedMission = {
                ...mision,
                misionName: response.formValues[0],
                misionObj: response.formValues[1],
                goal: Number(response.formValues[2]),
                vanilla: esVanillaEditado,
                MobItemRecolecta: nuevoMobItemRecolecta,
                reward: ScoreControl.rw,
                scoreboard: ScoreControl.score,
                itemsToggle: response.formValues[8],
                scoreToggle: response.formValues[5],
                items: newItems
            };
            try {
                await updateMissionInDatabase(mision.id, updatedMission);
                world.sendMessage(`${traducciones.updateM.nice.p1} ${traducciones.colorsTextUi.update}${mision.misionName} ${traducciones.updateM.nice.p2}`);
                player.setDynamicProperty(`completed_${mision.property}`, false);
                player.setDynamicProperty(mision.property, 0);
                player.setDynamicProperty(`counted_${mision.property}_${mision.MobItemRecolecta}`, 0);
            } catch (error) {
                player.sendMessage(traducciones.updateM.error + ' ' + error.message);
            }
        } else {
            player.sendMessage(traducciones.createM.formCancel);
        }
    });
}
async function mostrarMisionesParaEliminar(player) {
    try {
        const misiones = await missionDB.collectionSync();
        if (!misiones || Object.keys(misiones).length === 0) {
            player.sendMessage(traducciones.mostrarM.cero);
            return;
        }
        const menu = new ForceAction();
        menu.setTitle(traducciones.mEliminar.title);
        menu.setBody(traducciones.mEliminar.body);
        player.playSound(MinecraftSoundTypes.randomEnderChestOpen, { pitch: 1 });
        Object.entries(misiones).forEach(([clave, datos]) => {
            menu.addButton(`${traducciones.colorsTextUi.eliminarColor}${datos.misionName}\n${traducciones.global.mEliminar}`, API_CONFIG.texturas_icons.mostrarMisionesParaEliminar.delete_mission);
        });
        menu.addButton(traducciones.global.volver, API_CONFIG.texturas_icons.menu);
        menu.addButton(traducciones.global.salir, API_CONFIG.texturas_icons.salir);
        menu.send(player, async (response) => {
            if (response && response.selection !== undefined && response.selection < Object.keys(misiones).length) {
                const misionSeleccionada = misiones[Object.keys(misiones)[response.selection]];
                const plrs = world.getAllPlayers()
                plrs.forEach((player) => {
                    player.removeTag(`${misionSeleccionada.property}_reclamada`)
                })
                await deleteMissionInDatabase(misionSeleccionada.id);
                world.sendMessage(`${traducciones.deleteM.nice.p1} ${traducciones.colorsTextUi.delete}${misionSeleccionada.misionName} ${traducciones.deleteM.nice.p2}`);
                if (!misiones || Object.keys(misiones).length > 0) {
                    mostrarMisionesParaEliminar(player)
                    return;
                } else {
                    player.sendMessage(traducciones.mostrarM.cero);
                }
            }
            else if (response.selection === Object.keys(misiones).length) {
                menuPrincipal(player);
            } else {
                player.playSound(MinecraftSoundTypes.randomEnderChestClosed, { pitch: 1 });
                player.sendMessage(traducciones.global.saliste);
            }
        });
    } catch (error) {
        player.sendMessage(traducciones.global.error + ' ' + error);
    }
}

async function saveMissionToDatabase(mission) {
    try {
        await missionDB.set(mission.id, mission);
        world.sendMessage(traducciones.saveM.nice);
    } catch (error) {
        world.sendMessage(traducciones.saveM.error, error);
    }
}
async function updateMissionInDatabase(misionId, updatedMission) {
    try {
        await missionDB.set(misionId, updatedMission);
    } catch (error) {
        console.error(`${traducciones.updateM.error} ${error.message}`);
    }
}
async function deleteMissionInDatabase(misionId) {
    try {
        await missionDB.delete(misionId);
    } catch (error) {
        console.error(`${traducciones.deleteM.error} ${error.message}`);
    }
}


function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
}