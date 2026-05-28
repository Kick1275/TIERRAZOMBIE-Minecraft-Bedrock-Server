console.warn('RD_index.js Cargado con exito')
import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

world.afterEvents.itemUse.subscribe(data => {
    let player = data.source;
    if (data.itemStack.typeId == "minecraft:book") {
        player.runCommand('playsound random.orb')
        system.run(() => HolidaysPag());
    }

    function HolidaysPag() {
        const form = new ActionFormData()
            .title("MisVacaciones")
            .body("Selecciona una sección para contar tu experiencia:")
            .button("Entretenimiento", "textures/items/diamond_sword")
            .button("Estudios", "textures/items/book_enchanted")
            .button("Viajes", "textures/items/elytra")
            .button("Resumen", "textures/items/paper");

        form.show(player).then(async r => {
            if (r.canceled) return;
            if (r.selection == 0) mostrarEntretenimiento(player);
            if (r.selection == 1) mostrarEstudios(player);
            if (r.selection == 2) mostrarViajes(player);
            if (r.selection == 3) mostrarResumen(player);
        });
    }

    function mostrarEntretenimiento(player) {
        const form = new ActionFormData()
            .title("Entretenimiento")
            .button("Shikanoko","textures/HolyDaysTextures/IndianaJhones.png")
            .body("Por el Tema de Entretenimiento lo primero que hice fue comprar me el game pass\n de Xbox, Quise Jugar Indiana Jhones Pero el juego me pego una patada en la entrepierna por que ocupaba trajeta grafica y con mis poderosos 0,5G de Grafica si lo habria..\n\n")
            .button("Regresar","textures/items/diamond_sword")
            .button("Siguiente","textures/items/diamond_sword")
            .button("Siguiente","textures/HolyDaysTextures/Dialogos/E_1.png")
            .button("Siguiente","textures/HolyDaysTextures/Dialogos/E_2.png")
        form.show(player).then(r => {
            if (r.selection === 0){
                        player.runCommand('playsound random.orb')
                        HolidaysPag();
                    
                
            }
        })
    }
    function mostrarEstudios(player) {
        const form = new ActionFormData()
            .title("Estudios")
            .button("Shikanoko","textures/HolyDaysTextures/IndianaJhones.png")
            .body("Por el Tema de Entretenimiento lo primero que hice fue comprar me el game pass de Xbox, Quise Jugar Indiana Jhones Pero el juego me pego una patada en la entrepierna por que ocupaba trajeta grafica y con mis poderosos 0,5G de Grafica no aguantaron..")
            .button("Regresar","textures/items/diamond_sword");
        form.show(player).then(r => {
            if (r.selection === 0){
                        player.runCommand('playsound random.orb')
                        HolidaysPag(player);
                
            }
        })
    }
    function mostrarViajes(player) {
        const form = new ActionFormData()
            .title("Viajes")
            .button("Shikanoko","textures/HolyDaysTextures/IndianaJhones.png")
            .body("Por el Tema de Viajes me fui a Matilde Ester y Bucai, lamentablemente no me pude ir a la sierra a pasar con mis tios :c pero al chile que igual lo estaba pensando por que tenia que terminar algunos proyectos antes de que inicien las clases, a si que todo chido\n\n")
            .button("Regresar","textures/items/diamond_sword");
        form.show(player).then(r => {
                    if (r.selection === 0){
                        player.runCommand('playsound random.orb')
                        mostrarViajes(player);
            }
        })
    }
    function mostrarResumen(player) {
        const form = new ActionFormData()
            .title("Resumen")
            .button("Shikanoko","textures/HolyDaysTextures/IndianaJhones.png")
            .body("En Resumen me la pase chido, no me aburri, aprendi cosas nuevas y me diverti, Pero sobre todo mi rutina fue...:\nDormir Pc, Dormir, Pc, Dormir Pc, Dormir, Pc, Dormir Pc, Dormir, Pc, Dormir Pc, Dormir, Pc, Dormir Pc, Dormir, Pc\n")
            .button("Regresar","textures/items/diamond_sword");
        form.show(player).then(r => {
                form.show(player).then(r => {
                    if (r.selection === 0){
                        player.runCommand('playsound random.orb')
                        HolidaysPag(player);
                    }
                })
            
        })
    }
})
