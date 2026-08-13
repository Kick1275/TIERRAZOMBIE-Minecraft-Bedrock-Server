import { system, world } from "@minecraft/server";

// Lista completa de todas las armas TACZ (con munición y vacías) - ACTUALIZADA
const taczWeapons = [
    // Armas con munición (basado en el tick.json de TACZ)
    "krep:testis", "krep:t112", "krep:qcq171", "krep:m8", "krep:qcq171", "krep:hk416",
    "krep:qsz92", "krep:m7", "krep:k2", "krep:m16", "krep:qcq171", "krep:qcq171",
    "krep:qsz92", "krep:awp", "krep:qcq171", "krep:ak12", "krep:type95", "krep:qsz92",
    "krep:minigun", "krep:type89", "krep:qcq171", "krep:qsz92g", "krep:qcq171", "krep:qcq171",
    "krep:g18", "krep:qcq171", "krep:m8", "krep:qjb95", "krep:m107", "krep:qcq171",
    "krep:b93", "krep:qbu191", "krep:rpg",
    
    // NUEVAS ARMAS AGREGADAS EN LA ACTUALIZACIÓN
    "krep:arka", "krep:qcq171", "krep:qbz191", "krep:type882", "krep:qsz92", 
    "krep:qjb201", "krep:qbu191", "krep:cp",
    
    // Armas vacías (sin munición - terminan en _emp)
    "krep:testis_emp", "krep:t112_emp", "krep:qcq171_emp", "krep:m8_emp", "krep:qcq171_emp", "krep:hk416_emp",
    "krep:qsz92_emp", "krep:m7_emp", "krep:k2_emp", "krep:m16_emp", "krep:qcq171_emp", "krep:qcq171_emp",
    "krep:qsz92_emp", "krep:awp_emp", "krep:qcq171_emp", "krep:ak12_emp", "krep:type95_emp", "krep:qsz92_emp",
    "krep:minigun_emp", "krep:type89_emp", "krep:qcq171_emp", "krep:qsz92g_emp", "krep:qcq171_emp", "krep:qcq171_emp",
    "krep:g18_emp", "krep:qcq171_emp", "krep:m8_emp", "krep:qjb95_emp", "krep:m107_emp", "krep:qcq171_emp",
    "krep:b93_emp", "krep:qbu191_emp", "krep:rpg_emp",
    
    // NUEVAS ARMAS VACÍAS AGREGADAS EN LA ACTUALIZACIÓN
    "krep:arka_emp", "krep:qcq171_emp", "krep:qbz191_emp", "krep:type882_emp", "krep:qsz92_emp", 
    "krep:qjb201_emp", "krep:qbu191_emp", "krep:cp_emp"
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