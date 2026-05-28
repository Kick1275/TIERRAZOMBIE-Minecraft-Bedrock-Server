export const textStyles = {
    colors: {
        dark_red: '§4',
        red: '§c',
        gold: '§6',
        yellow: '§e',
        dark_green: '§2',
        green: '§a',
        aqua: '§b',
        dark_aqua: '§3',
        dark_blue: '§1',
        blue: '§9',
        light_purple: '§d',
        dark_purple: '§5',
        white: '§f',
        gray: '§7',
        dark_gray: '§8',
        black: '§0'
    },
    styles: {
        reset: '§r',   // Reset color to default
        bold: '§l',    // Bold
        italic: '§o',  // Italic
        underline: '§n',  // Underline
        strikethrough: '§m'  // Strikethrough
    }
}

export const API_CONFIG = {
    IDIOMA: {
        espaniol: {
            global: {
                progresoM: 'Progreso de la mision',
                completeMAlert: '¡Has completado la misión!',
                categoria: `${textStyles.colors.gold}${textStyles.styles.bold}Categoría:${textStyles.styles.reset}`,
                categoriaEjem: {
                    Kill: `${textStyles.colors.red}${textStyles.styles.bold}Matar${textStyles.styles.reset}`,
                    Miner: `${textStyles.colors.green}${textStyles.styles.bold}Minar${textStyles.styles.reset}`,
                    Collect: `${textStyles.colors.aqua}${textStyles.styles.bold}Recolectar${textStyles.styles.reset}`,
                    Place: `${textStyles.colors.blue}${textStyles.styles.bold}Colocar${textStyles.styles.reset}`
                },
                clic1: `${textStyles.colors.gray}Clic para más detalle`,
                clic2: `${textStyles.colors.gray}Clic aquí`,
                clic3: `${textStyles.colors.gray}Clic para editar`,
                clic4: `${textStyles.colors.gray}Clic para eliminar`,
                saliste: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Has salido del menú.`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error al mostrar las misiones: `,
                salir: `${textStyles.colors.gray}Salir`,
                volver: `${textStyles.colors.blue}Volver al menú`,
                mEditar: `${textStyles.colors.gold}Has clic para editar`,
                mEliminar: `${textStyles.colors.gold}Has clic para eliminar`,
                no_permisos: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}¡ERROR! parece que no tines permisos para abrir el menu `,
                completar: {
                    text: `${textStyles.colors.yellow}Completar`,
                    count: `${textStyles.colors.gold}10`
                },
                recompensa: {
                    text: `${textStyles.colors.light_purple}Recompensa`,
                    ejemplo: `${textStyles.colors.gold}100`,
                    count: `${textStyles.colors.gold}100`
                },
            },
            mensajesIdioma: {
                espaniol: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}Has cambiado el idioma a ${textStyles.colors.red}Español${textStyles.styles.reset}`
            },
            principalUi: {
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Mission-System ✦`,
                body: `${textStyles.colors.aqua}Crea, Elimina o Edita las misiones\n`,
                btnVer: `${textStyles.colors.green}Ver todas las misiones`,
                btnCrear: `${textStyles.colors.gold}Crear una nueva misión`,
                btnEditar: `${textStyles.colors.yellow}Editar alguna misión`,
                btnIdioma: `${textStyles.colors.dark_aqua}Cambiar idioma ${textStyles.styles.reset}`,
                btnEliminar: `${textStyles.colors.red}Eliminar alguna misión`,
                btncreditos: `${textStyles.colors.light_purple}Creditos`
            },

            mostrarM: {
                cero: `${textStyles.colors.dark_red}No hay misiones disponibles.`,
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Menú de Misiones ✦`,
                body: `${textStyles.colors.aqua}Selecciona una misión para ver los detalles.`
            },
            handleM: {
                m1: `${textStyles.colors.green}Misión completada`,
                m2: `${textStyles.colors.aqua}Misión ya reclamada`,
                m3: `${textStyles.colors.red}Misión incompleta`,
                objectivo: `${textStyles.colors.gold}Objetivo:`,
                progreso: `${textStyles.colors.aqua}Progreso:`,
                recompensa: `${textStyles.colors.green}Recompensa:`,
                estado: `${textStyles.colors.yellow}${textStyles.styles.underline}Estado:`,
                btnReclamar: `${textStyles.colors.light_purple}${textStyles.styles.bold}Reclamar recompensa`,
                felicitacion: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}¡Felicidades!`,
                mreclamada: `${textStyles.colors.gold}Reclamaste la misión`,
                puntosEntregados: `${textStyles.colors.light_purple}Se han entregado`,
                itemsEntregados: `${textStyles.colors.dark_aqua}Items añadidos al inventario.`
            },
            mTypes: {
                title: `${textStyles.colors.gold}¿Qué tipo de misión quieres crear?`,
                body: `${textStyles.colors.aqua}Selecciona el tipo de misión que deseas crear`,
                btn1: `${textStyles.colors.red}Eliminación`,
                btn2: `${textStyles.colors.green}Minar`,
                btn3: `${textStyles.colors.aqua}Recolectar`,
                btn4: `${textStyles.colors.dark_blue}Colocar`,
                indenticadoresM: {  // Identificadores para tipos de misión
                    eliminar: 'Kill',
                    minar: 'Miner',
                    recolectar: 'Collect',
                    colocar: 'Place'
                }
            },
            creditos: {
                title: `§p§p§p§f§aCréditos del Addon`,
                body: `§eEste addon te permitirá crear misiones personalizables a través de una UI.\n§7Solo los administradores podrán gestionar las misiones para todos los jugadores, §7mientras que los jugadores sin permisos de administrador solo podrán ver su §7seguimiento de las misiones creadas y reclamar al haber completado la misión.\n\n§6Para tener permisos de admin considera portar la tag:\n§e/tag @s Admin\n\n§bDesarrollador: §dAlberto35M\n§cYou§7Tube§f: §9https://www.youtube.com/@Alberto35M\n\n§aNotificación al completar una misión creada por: §eEffect99MC\n§cYou§7Tube§f: §9https://www.youtube.com/@Effect99\n\n§7Para más contenido considera visitar los canales de YouTube.\n§e¡Que te diviertas!`
            },
            createM: {
                formCancel: `${textStyles.colors.red}El formulario fue cancelado o no se completó.`,
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Configuración de la misión`,
                ejemplo: `${textStyles.colors.aqua}Ejemplo`,
                nombreM: `${textStyles.colors.yellow}Nombre de la misión`,
                eliminar: `${textStyles.colors.red}Misión de prueba`,
                objSi: {
                    Kill: `${textStyles.colors.green}Elimina 10 Zombies`,
                    Miner: `${textStyles.colors.green}Mina 10 de Piedra`,
                    Collect: `${textStyles.colors.green}Recolecta 10 de Manzanas`,
                    Place: `${textStyles.colors.green}Coloca 10 de Piedra`
                },
                item_mob_bloque: {
                    Kill: `${textStyles.colors.gold}Mob a Matar`,
                    Miner: `${textStyles.colors.green}Bloque a Minar`,
                    Collect: `${textStyles.colors.aqua}Item a Recolectar`,
                    Place: `${textStyles.colors.dark_blue}Bloque a Colocar`,
                    ejemplos: {
                        Kill: `${textStyles.colors.dark_red}zombie`,
                        Miner: `${textStyles.colors.gray}stone`,
                        Collect: `${textStyles.colors.aqua}apple`,
                        Place: `${textStyles.colors.dark_green}dirt`
                    },
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Error al guardar la misión: `,
                    Vanilla: `¿Vanilla?`,
                    values: {
                        un: 'Es un',
                        Kill: 'Mob',
                        Miner: 'Bloque',
                        Collect: 'Item',
                        Place: 'Bloque'
                    }
                },
                toggles: {
                    score: `${textStyles.colors.aqua}Recompensa con score`,
                    items: `${textStyles.colors.aqua}Recompensa con items vanilla prefix ${textStyles.colors.yellow}$v`
                },
                scoreboardRecompensa: {
                    text: `${textStyles.colors.light_purple}Scoreboard`,
                    value: `${textStyles.colors.gold}Scoreboard para la recompensa`
                },
                itemsRecompensa: {
                    text: `${textStyles.colors.light_purple}Items`,
                    value: `$vdiamond,5-$vdiamond_sword`
                },
                valors_default: {
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Error: Los valores de objetivo o recompensa no son válidos.`,
                    misiones: {
                        sinNombre: "Misión sin nombre",
                        objectivoNoE: "Objetivo no especificado",
                        property: "Misión",
                        desconocido: "Desconocido",
                        score_default: "money",
                    }
                }
            },
            mEliminar: {
                title: '§l§6✦ Editar Misiones ✦',
                body: 'Selecciona una misión para editar.',
            },
            editparam: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Modificación de la misión`,
            },
            colorsTextUi: {
                btnM: `${textStyles.colors.green}`,           // Color para los botones de misión
                reset: `${textStyles.styles.reset}`,          // Estilo para resetear el color
                eliminarColor: `${textStyles.colors.red}`,    // Color para eliminar
                editarColor: `${textStyles.colors.yellow}`,   // Color para editar
                update: `${textStyles.colors.dark_purple}`,   // Color para actualizar
                delete: `${textStyles.colors.dark_red}`,      // Color para eliminar
            },

            saveM: {
                nice: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Misión guardada exitosamente.${textStyles.styles.reset}`,  // Mensaje de guardado exitoso con color
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error al guardar la misión en la base de datos:${textStyles.styles.reset}`  // Mensaje de error con color
            },

            updateM: {
                nice: {
                    p1: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}Misión`,                       // Color para 'Misión'
                    p2: `${textStyles.colors.green}actualizada exitosamente.${textStyles.styles.reset}`  // Color para éxito
                },
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error al actualizar la misión:${textStyles.styles.reset}`  // Mensaje de error con color
            },

            deleteM: {
                nice: {
                    p1: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Misión`,                          // Color para 'Misión'
                    p2: `${textStyles.colors.green}eliminada exitosamente.${textStyles.styles.reset}`  // Color para éxito
                },
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error al eliminar la misión:${textStyles.styles.reset}`  // Mensaje de error con color
            },

            idiomaC: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}-= IDIOMAS -=${textStyles.styles.reset}`,
                body: `${textStyles.colors.aqua}Cambia el idioma del addon simplemente seleccionando el idioma deseado${textStyles.styles.reset}`,
                btnEspaniol: `${textStyles.colors.red}Español${textStyles.styles.reset}`,
                btnEnglish: `${textStyles.colors.aqua}English${textStyles.styles.reset}`,
                btnPortuguese: `${textStyles.colors.green}Português${textStyles.styles.reset}`
            }
        },
        english: {
            global: {
                progresoM: 'Mission Progress',
                completeMAlert: 'You have completed the mission!',
                categoria: `${textStyles.colors.gold}${textStyles.styles.bold}Category:${textStyles.styles.reset}`,
                categoriaEjem: {
                    Kill: `${textStyles.colors.red}${textStyles.styles.bold}Kill${textStyles.styles.reset}`,
                    Miner: `${textStyles.colors.green}${textStyles.styles.bold}Mine${textStyles.styles.reset}`,
                    Collect: `${textStyles.colors.aqua}${textStyles.styles.bold}Collect${textStyles.styles.reset}`,
                    Place: `${textStyles.colors.blue}${textStyles.styles.bold}Place${textStyles.styles.reset}`
                },
                clic1: `${textStyles.colors.gray}Click for more details`,
                clic2: `${textStyles.colors.gray}Click here`,
                clic3: `${textStyles.colors.gray}Click to edit`,
                clic4: `${textStyles.colors.gray}Click to delete`,
                saliste: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}You have exited the menu.`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error showing missions: `,
                salir: `${textStyles.colors.gray}Exit`,
                volver: `${textStyles.colors.blue}Back to menu`,
                mEditar: `${textStyles.colors.gold}Click to edit`,
                mEliminar: `${textStyles.colors.gold}Click to delete`,
                no_permisos: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}ERROR! You don’t seem to have permissions to open the menu `,
                completar: {
                    text: `${textStyles.colors.yellow}Complete`,
                    count: `${textStyles.colors.gold}10`
                },
                recompensa: {
                    text: `${textStyles.colors.light_purple}Reward`,
                    ejemplo: `${textStyles.colors.gold}100`,
                    count: `${textStyles.colors.gold}100`
                },
            },
            mensajesIdioma: {
                english: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}You have switched the language to ${textStyles.colors.aqua}English${textStyles.styles.reset}`
            },
            principalUi: {
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Mission-System ✦`,
                body: `${textStyles.colors.aqua}Create, Delete, or Edit missions\n`,
                btnVer: `${textStyles.colors.green}View all missions`,
                btnCrear: `${textStyles.colors.gold}Create a new mission`,
                btnEditar: `${textStyles.colors.yellow}Edit a mission`,
                btnIdioma: `${textStyles.colors.dark_aqua}Change language ${textStyles.styles.reset}`,
                btnEliminar: `${textStyles.colors.red}Delete a mission`,
                btncreditos: `${textStyles.colors.light_purple}Credits`
            },
            mostrarM: {
                cero: `${textStyles.colors.dark_red}No missions available.`,
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Mission Menu ✦`,
                body: `${textStyles.colors.aqua}Select a mission to see the details.`
            },
            handleM: {
                m1: `${textStyles.colors.green}Mission completed`,
                m2: `${textStyles.colors.aqua}Mission already claimed`,
                m3: `${textStyles.colors.red}Mission incomplete`,
                objectivo: `${textStyles.colors.gold}Objective:`,
                progreso: `${textStyles.colors.aqua}Progress:`,
                recompensa: `${textStyles.colors.green}Reward:`,
                estado: `${textStyles.colors.yellow}${textStyles.styles.underline}Status:`,
                btnReclamar: `${textStyles.colors.light_purple}${textStyles.styles.bold}Claim reward`,
                felicitacion: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Congratulations!`,
                mreclamada: `${textStyles.colors.gold}You claimed the mission`,
                puntosEntregados: `${textStyles.colors.light_purple}Points have been delivered`,
                itemsEntregados: `${textStyles.colors.dark_aqua}Items added to the inventory.`
            },
            mTypes: {
                title: `${textStyles.colors.gold}What type of mission do you want to create?`,
                body: `${textStyles.colors.aqua}Select the type of mission you want to create`,
                btn1: `${textStyles.colors.red}Elimination`,
                btn2: `${textStyles.colors.green}Mining`,
                btn3: `${textStyles.colors.aqua}Collecting`,
                btn4: `${textStyles.colors.dark_blue}Placing`,
                indenticadoresM: {
                    eliminar: 'Kill',
                    minar: 'Miner',
                    recolectar: 'Collect',
                    colocar: 'Place'
                }
            },
            creditos: {
                title: `§p§p§p§f§aAddon Credits`,
                body: `§eThis addon allows you to create customizable missions through a UI.\n§7Only administrators can manage the missions for all players, §7while players without admin permissions can only see their §7mission progress and claim rewards upon mission completion.\n\n§6To gain admin permissions, consider using the tag:\n§e/tag @s Admin\n\n§bDeveloper: §dAlberto35M\n§cYou§7Tube§f: §9https://www.youtube.com/@Alberto35M\n\n§aMission completion notification created by: §eEffect99MC\n§cYou§7Tube§f: §9https://www.youtube.com/@Effect99\n\n§7For more content, consider visiting the YouTube channels.\n§eHave fun!`
            },
            createM: {
                formCancel: `${textStyles.colors.red}The form was canceled or not completed.`,
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Mission Configuration`,
                ejemplo: `${textStyles.colors.aqua}Example`,
                nombreM: `${textStyles.colors.yellow}Mission Name`,
                eliminar: `${textStyles.colors.red}Test Mission`,
                objSi: {
                    Kill: `${textStyles.colors.green}Kill 10 Zombies`,
                    Miner: `${textStyles.colors.green}Mine 10 Stone`,
                    Collect: `${textStyles.colors.green}Collect 10 Apples`,
                    Place: `${textStyles.colors.green}Place 10 Stone`
                },
                item_mob_bloque: {
                    Kill: `${textStyles.colors.gold}Mob to Kill`,
                    Miner: `${textStyles.colors.green}Block to Mine`,
                    Collect: `${textStyles.colors.aqua}Item to Collect`,
                    Place: `${textStyles.colors.dark_blue}Block to Place`,
                    ejemplos: {
                        Kill: `${textStyles.colors.dark_red}zombie`,
                        Miner: `${textStyles.colors.gray}stone`,
                        Collect: `${textStyles.colors.aqua}apple`,
                        Place: `${textStyles.colors.dark_green}dirt`
                    },
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Error saving the mission: `,
                    Vanilla: `Vanilla?`,
                    values: {
                        un: 'It is a',
                        Kill: 'Mob',
                        Miner: 'Block',
                        Collect: 'Item',
                        Place: 'Block'
                    }
                },
                toggles: {
                    score: `${textStyles.colors.aqua}Reward with score`,
                    items: `${textStyles.colors.aqua}Reward with vanilla items prefix ${textStyles.colors.yellow}$v`
                },
                scoreboardRecompensa: {
                    text: `${textStyles.colors.light_purple}Scoreboard`,
                    value: `${textStyles.colors.gold}Scoreboard for the reward`
                },
                itemsRecompensa: {
                    text: `${textStyles.colors.light_purple}Items`,
                    value: `$vdiamond,5-$vdiamond_sword`
                },
                valors_default: {
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Error: The objective or reward values are not valid.`,
                    misiones: {
                        sinNombre: "Unnamed Mission",
                        objectivoNoE: "Objective not specified",
                        property: "Mission",
                        desconocido: "Unknown",
                        score_default: "money",
                    }
                }
            },

            mEliminar: {
                title: '§l§6✦ Edit Missions ✦',
                body: 'Select a mission to edit.',
            },
            editparam: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Mission Modification`,
            },
            colorsTextUi: {
                btnM: `${textStyles.colors.green}`,
                reset: `${textStyles.styles.reset}`,
                eliminarColor: `${textStyles.colors.red}`,
                editarColor: `${textStyles.colors.yellow}`,
                update: `${textStyles.colors.dark_purple}`,
                delete: `${textStyles.colors.dark_red}`,
            },
            saveM: {
                nice: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Mission successfully saved.${textStyles.styles.reset}`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error saving mission to database:${textStyles.styles.reset}`
            },
            updateM: {
                nice: {
                    p1: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}Mission`,
                    p2: `${textStyles.colors.green}successfully updated.${textStyles.styles.reset}`
                },
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error updating mission:${textStyles.styles.reset}`
            },
            deleteM: {
                nice: {
                    p1: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Mission`,
                    p2: `${textStyles.colors.green}successfully deleted.${textStyles.styles.reset}`
                },
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Error deleting mission:${textStyles.styles.reset}`
            },
            idiomaC: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}-= IDIOMAS -=${textStyles.styles.reset}`,
                body: `${textStyles.colors.aqua}Cambia el idioma del addon simplemente seleccionando el idioma deseado${textStyles.styles.reset}`,
                btnEspaniol: `${textStyles.colors.red}Español${textStyles.styles.reset}`,
                btnEnglish: `${textStyles.colors.aqua}English${textStyles.styles.reset}`,
                btnPortuguese: `${textStyles.colors.green}Português${textStyles.styles.reset}`
            }
        },
        portugues: {
            global: {
                progressoM: 'Progresso da missão',
                completeMAlert: 'Você completou a missão!',
                categoria: `${textStyles.colors.gold}${textStyles.styles.bold}Categoria:${textStyles.styles.reset}`,
                categoriaEjem: {
                    Kill: `${textStyles.colors.red}${textStyles.styles.bold}Matar${textStyles.styles.reset}`,
                    Miner: `${textStyles.colors.green}${textStyles.styles.bold}Minerar${textStyles.styles.reset}`,
                    Collect: `${textStyles.colors.aqua}${textStyles.styles.bold}Coletar${textStyles.styles.reset}`,
                    Place: `${textStyles.colors.blue}${textStyles.styles.bold}Colocar${textStyles.styles.reset}`
                },
                clic1: `${textStyles.colors.gray}Clique para mais detalhes`,
                clic2: `${textStyles.colors.gray}Clique aqui`,
                clic3: `${textStyles.colors.gray}Clique para editar`,
                clic4: `${textStyles.colors.gray}Clique para excluir`,
                saliste: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Você saiu do menu.`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Erro ao mostrar as missões: `,
                salir: `${textStyles.colors.gray}Sair`,
                volver: `${textStyles.colors.blue}Voltar ao menu`,
                mEditar: `${textStyles.colors.gold}Clique para editar`,
                mEliminar: `${textStyles.colors.gold}Clique para excluir`,
                no_permisos: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}ERRO! Parece que você não tem permissão para abrir o menu `,
                completar: {
                    text: `${textStyles.colors.yellow}Completar`,
                    count: `${textStyles.colors.gold}10`
                },
                recompensa: {
                    text: `${textStyles.colors.light_purple}Recompensa`,
                    ejemplo: `${textStyles.colors.gold}100`,
                    count: `${textStyles.colors.gold}100`
                },
            },
            mensajesIdioma: {
                portugues: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}Você alterou o idioma para ${textStyles.colors.green}Português${textStyles.styles.reset}`
            },
            idiomaC: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}-= IDIOMAS =-${textStyles.styles.reset}`,
                body: `${textStyles.colors.aqua}Mude o idioma do addon simplesmente selecionando o idioma desejado${textStyles.styles.reset}`,
                btnEspaniol: `${textStyles.colors.red}Español${textStyles.styles.reset}`,
                btnEnglish: `${textStyles.colors.aqua}English${textStyles.styles.reset}`,
                btnPortuguese: `${textStyles.colors.green}Português${textStyles.styles.reset}`
            },
            principalUi: {
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Sistema de Missões ✦`,
                body: `${textStyles.colors.aqua}Crie, Exclua ou Edite as missões\n`,
                btnVer: `${textStyles.colors.green}Ver todas as missões`,
                btnCrear: `${textStyles.colors.gold}Criar uma nova missão`,
                btnEditar: `${textStyles.colors.yellow}Editar uma missão`,
                btnIdioma: `${textStyles.colors.dark_aqua}Trocar idioma ${textStyles.styles.reset}`,
                btnEliminar: `${textStyles.colors.red}Excluir uma missão`,
                btncreditos: `${textStyles.colors.light_purple}Créditos`
            },

            mostrarM: {
                cero: `${textStyles.colors.dark_red}Não há missões disponíveis.`,
                titulo: `${textStyles.colors.gold}${textStyles.styles.bold}✦ Menu de Missões ✦`,
                body: `${textStyles.colors.aqua}Selecione uma missão para ver os detalhes.`
            },
            handleM: {
                m1: `${textStyles.colors.green}Missão completada`,
                m2: `${textStyles.colors.aqua}Missão já reclamada`,
                m3: `${textStyles.colors.red}Missão incompleta`,
                objectivo: `${textStyles.colors.gold}Objetivo:`,
                progreso: `${textStyles.colors.aqua}Progresso:`,
                recompensa: `${textStyles.colors.green}Recompensa:`,
                estado: `${textStyles.colors.yellow}${textStyles.styles.underline}Estado:`,
                btnReclamar: `${textStyles.colors.light_purple}${textStyles.styles.bold}Reclamar recompensa`,
                felicitacion: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Parabéns!`,
                mreclamada: `${textStyles.colors.gold}Você reclamou a missão`,
                puntosEntregados: `${textStyles.colors.light_purple}Pontos foram entregues`,
                itemsEntregados: `${textStyles.colors.dark_aqua}Itens adicionados ao inventário.`
            },
            mTypes: {
                title: `${textStyles.colors.gold}Que tipo de missão você quer criar?`,
                body: `${textStyles.colors.aqua}Selecione o tipo de missão que deseja criar`,
                btn1: `${textStyles.colors.red}Eliminação`,
                btn2: `${textStyles.colors.green}Minerar`,
                btn3: `${textStyles.colors.aqua}Coletar`,
                btn4: `${textStyles.colors.dark_blue}Colocar`,
                indenticadoresM: {  // Identificadores para tipos de misión
                    eliminar: 'Kill',
                    minar: 'Miner',
                    recolectar: 'Collect',
                    colocar: 'Place'
                }
            },
            creditos: {
                title: `§p§p§p§f§aCréditos do Addon`,
                body: `§eEste addon permitirá que você crie missões personalizadas por meio de uma UI.\n§7Somente os administradores poderão gerenciar as missões para todos os jogadores, §7enquanto os jogadores sem permissões de administrador só poderão ver seu §7progresso das missões criadas e reivindicar ao completar a missão.\n\n§6Para ter permissões de admin considere portar a tag:\n§e/tag @s Admin\n\n§bDesenvolvedor: §dAlberto35M\n§cYou§7Tube§f: §9https://www.youtube.com/@Alberto35M\n\n§aNotificação ao concluir uma missão criada por: §eEffect99MC\n§cYou§7Tube§f: §9https://www.youtube.com/@Effect99\n\n§7Para mais conteúdo considere visitar os canais do YouTube.\n§eDivirta-se!`
            },
            createM: {
                formCancel: `${textStyles.colors.red}O formulário foi cancelado ou não foi concluído.`,
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Configuração da Missão`,
                ejemplo: `${textStyles.colors.aqua}Exemplo`,
                nombreM: `${textStyles.colors.yellow}Nome da Missão`,
                eliminar: `${textStyles.colors.red}Missão de Teste`,
                objSi: {
                    Kill: `${textStyles.colors.green}Mate 10 Zumbis`,
                    Miner: `${textStyles.colors.green}Mine 10 Pedras`,
                    Collect: `${textStyles.colors.green}Colete 10 Maçãs`,
                    Place: `${textStyles.colors.green}Coloque 10 Pedras`
                },
                item_mob_bloque: {
                    Kill: `${textStyles.colors.gold}Mob para Matar`,
                    Miner: `${textStyles.colors.green}Bloco para Minerar`,
                    Collect: `${textStyles.colors.aqua}Item para Coletar`,
                    Place: `${textStyles.colors.dark_blue}Bloco para Colocar`,
                    ejemplos: {
                        Kill: `${textStyles.colors.dark_red}zumbi`,
                        Miner: `${textStyles.colors.gray}pedra`,
                        Collect: `${textStyles.colors.aqua}maçã`,
                        Place: `${textStyles.colors.dark_green}terra`
                    },
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Erro ao salvar a missão: `,
                    Vanilla: `Vanilla?`,
                    values: {
                        un: 'É um',
                        Kill: 'Mob',
                        Miner: 'Bloco',
                        Collect: 'Item',
                        Place: 'Bloco'
                    }
                },
                toggles: {
                    score: `${textStyles.colors.aqua}Recompensa com pontuação`,
                    items: `${textStyles.colors.aqua}Recompensa com itens vanilla prefixo ${textStyles.colors.yellow}$v`
                },
                scoreboardRecompensa: {
                    text: `${textStyles.colors.light_purple}Placar`,
                    value: `${textStyles.colors.gold}Placar para a recompensa`
                },
                itemsRecompensa: {
                    text: `${textStyles.colors.light_purple}Itens`,
                    value: `$vdiamond,5-$vdiamond_sword`
                },
                valors_default: {
                    error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.dark_red}Erro: Os valores de objetivo ou recompensa não são válidos.`,
                    misiones: {
                        sinNombre: "Missão sem nome",
                        objectivoNoE: "Objetivo não especificado",
                        property: "Missão",
                        desconocido: "Desconhecido",
                        score_default: "money",
                    }
                }
            },

            mEliminar: {
                title: '§l§6✦ Editar Missões ✦',
                body: 'Selecione uma missão para editar.',
            },
            editparam: {
                title: `${textStyles.colors.gold}${textStyles.styles.bold}Modificação da missão`,
            },
            colorsTextUi: {
                btnM: `${textStyles.colors.green}`,
                reset: `${textStyles.styles.reset}`,
                eliminarColor: `${textStyles.colors.red}`,
                editarColor: `${textStyles.colors.yellow}`,
                update: `${textStyles.colors.dark_purple}`,
                delete: `${textStyles.colors.dark_red}`,
            },

            saveM: {
                nice: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Missão salva com sucesso.${textStyles.styles.reset}`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Erro ao salvar a missão no banco de dados:${textStyles.styles.reset}`
            },

            updateM: {
                nice: {
                    p1: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.yellow}Missão`,
                    p2: `${textStyles.styles.bold} atualizada com sucesso.${textStyles.styles.reset}`,
                },
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Erro ao atualizar a missão no banco de dados.${textStyles.styles.reset}`
            },

            deleteM: {
                nice: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.green}Missão excluída com sucesso.${textStyles.styles.reset}`,
                error: ` ${textStyles.styles.bold}>>${textStyles.styles.reset} ${textStyles.colors.red}Erro ao excluir a missão no banco de dados:${textStyles.styles.reset}`
            }
        }

    },
    texturas_icons: {
        salir: 'textures/blocks/barrier',
        menu: 'textures/access/servers',
        menuPrincipal: {
            crear: 'textures/access/creative_icon',
            ver: 'textures/ui/icon_blackfriday',
            editar: 'textures/access/Feedback',
            idioma: 'textures/access/quick_craft',
            eliminar: 'textures/access/ErrorGlyph',
            creditos: 'textures/access/spyglass_flat'
        },
        idiomas: {
            br: 'textures/idiomas/BR',
            us: 'textures/idiomas/US',
            es: 'textures/idiomas/ES',
        },
        mostrarMisiones: {
            default: 'textures/access/win',
            mision_reclamada: 'textures/ui/icon_lock',
            mision_completa: 'textures/access/winPING',
            reclamar_recompensa: "textures/ui/icon_trending"
        },
        typeMission: {
            btn1: 'textures/access/random6',
            btn2: 'textures/access/random26',
            btn3: 'textures/access/random41',
            btn4: 'textures/blocks/stone',

        },
        mostrarMisionesParaEditar: {
            edit_mision: 'textures/access/recipe_book_icon'
        },
        mostrarMisionesParaEliminar: {
            delete_mission: 'textures/access/garbage'
        }
    },
    colorAlertMision: {
        Kill: {
            mensaje: textStyles.colors.red,       // Color para el mensaje
            mision: textStyles.colors.gold,       // Color para el nombre de la misión
            progreso: textStyles.colors.light_purple // Color para el progreso
        },
        Miner: {
            mensaje: textStyles.colors.green,
            mision: textStyles.colors.dark_aqua,
            progreso: textStyles.colors.aqua
        },
        Collect: {
            mensaje: textStyles.colors.aqua,
            mision: textStyles.colors.green,
            progreso: textStyles.colors.yellow
        },
        Place: {
            mensaje: textStyles.colors.blue,
            mision: textStyles.colors.gold,
            progreso: textStyles.colors.gray
        }
    },
    AbrirMenu: {
        item: 'alberto35:mission',
        tagAdmin: 'Admin',
        soloAdmin: true // si solo los admin pueden abrir el menu para crear, eliminar o editar misiones
    }
};