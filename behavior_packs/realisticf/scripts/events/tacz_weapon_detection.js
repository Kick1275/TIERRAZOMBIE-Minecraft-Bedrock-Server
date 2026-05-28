import { system, world } from "@minecraft/server";

// Lista completa de todas las armas TACZ (con munición y vacías) - ACTUALIZADA
const taczWeapons = [
    // Armas con munición (basado en el tick.json de TACZ)
    "krep:testis", "krep:m16a1", "krep:vector", "krep:g3", "krep:p90", "krep:hk416",
    "krep:deagle", "krep:scarh", "krep:scarl", "krep:m16", "krep:mp5", "krep:aa12",
    "krep:g17", "krep:awp", "krep:m870", "krep:akm", "krep:m4a1", "krep:m1911",
    "krep:minigun", "krep:g36", "krep:mp7", "krep:deagleg", "krep:uzi", "krep:db",
    "krep:g18", "krep:saiga12", "krep:fal", "krep:qbz95", "krep:m107", "krep:ump",
    "krep:b93", "krep:sks", "krep:rpg",
    
    // NUEVAS ARMAS AGREGADAS EN LA ACTUALIZACIÓN
    "krep:type81", "krep:m1014", "krep:qbz191", "krep:m249", "krep:p320", 
    "krep:evolys", "krep:mk14", "krep:cp",
    
    // Armas vacías (sin munición - terminan en _emp)
    "krep:testis_emp", "krep:m16a1_emp", "krep:vector_emp", "krep:g3_emp", "krep:p90_emp", "krep:hk416_emp",
    "krep:deagle_emp", "krep:scarh_emp", "krep:scarl_emp", "krep:m16_emp", "krep:mp5_emp", "krep:aa12_emp",
    "krep:g17_emp", "krep:awp_emp", "krep:m870_emp", "krep:akm_emp", "krep:m4a1_emp", "krep:m1911_emp",
    "krep:minigun_emp", "krep:g36_emp", "krep:mp7_emp", "krep:deagleg_emp", "krep:uzi_emp", "krep:db_emp",
    "krep:g18_emp", "krep:saiga12_emp", "krep:fal_emp", "krep:qbz95_emp", "krep:m107_emp", "krep:ump_emp",
    "krep:b93_emp", "krep:sks_emp", "krep:rpg_emp",
    
    // NUEVAS ARMAS VACÍAS AGREGADAS EN LA ACTUALIZACIÓN
    "krep:type81_emp", "krep:m1014_emp", "krep:qbz191_emp", "krep:m249_emp", "krep:p320_emp", 
    "krep:evolys_emp", "krep:mk14_emp", "krep:cp_emp"
];

// Sistema de detección de armas TACZ
system.runInterval(() => {
    // Primero, quitar el tag de todos los jugadores
    try {
        world.getDimension("overworld").runCommand("tag @a remove holding_tacz_weapon");
    } catch (e) {
        console.warn("Error removing tags:", e);
    }
    
    // Luego, agregar el tag a jugadores que tengan armas TACZ
    for (const weapon of taczWeapons) {
        try {
            world.getDimension("overworld").runCommand(
                `tag @a[hasitem={item=${weapon},location=slot.weapon.mainhand}] add holding_tacz_weapon`
            );
        } catch (e) {
            // Ignorar errores silenciosamente para armas que no existen
        }
    }
    
    // Sistema funcionando correctamente - debug removido
}, 10); // Ejecutar cada 10 ticks (0.5 segundos) para mejor rendimiento