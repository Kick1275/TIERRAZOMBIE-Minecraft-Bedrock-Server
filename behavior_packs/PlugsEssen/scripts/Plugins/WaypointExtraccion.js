import { world } from "@minecraft/server";

// Crea un waypoint usando el sistema de Advanced Waypoints
// sin importar nada del pack externo — replica la lógica de dynamic property
function createWaypoint(player, name, pos, colorIdx, icon) {
    // colorRBG del pack (índice 5 = rojo)
    const colors = [
        [200,200,200],[128,128,128],[90,90,90],[0,0,0],[70,25,0],
        [255,0,0],[255,165,0],[255,255,0],[0,255,0],[0,128,0],
        [25,90,180],[0,255,255],[0,0,240],[160,0,200],[90,0,140],[240,50,150]
    ];
    const [r, g, b] = colors[colorIdx] ?? [255,255,255];
    const red = r + colorIdx * 1000; // el pack suma colorIdx*1000 al red
    const dim = player.dimension.id.replace("minecraft:", "");
    const x = Math.floor(pos.x), y = Math.floor(pos.y), z = Math.floor(pos.z);
    const key = `${dim}/1/${icon}/${red},${g},${b}/${x},${y},${z}/${name}`;
    player.setDynamicProperty(key, true);
}

world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== "dz:waypoint_extraccion") return;
    const player = ev.source;
    createWaypoint(player, "Extraccion", player.location, 5, 1); // rojo, estrella
    player.sendMessage("§a✓ Waypoint §6Extraccion §acolocado.");
});

console.warn("[WaypointExtraccion] Cargado");
