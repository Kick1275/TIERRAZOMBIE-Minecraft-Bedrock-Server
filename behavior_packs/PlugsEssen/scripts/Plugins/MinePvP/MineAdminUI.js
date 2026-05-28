import { world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { getPlayerLanguage, getText } from "../../Utils/Translations.js";
import { getPrefix, isAdmin } from "../../Config/GlobalConfig.js";
import { getMineConfig, setMineConfig, WOOD_ZONES } from "./MineConfig.js";
import { generateMine } from "./MineGeneration.js";

function pfx() { return getPrefix(); }

export async function showMineAdminUI(player) {
    if (!isAdmin(player)) return;

    for (;;) {
        const res = await new ActionFormData()
            .title("§l§6✦ Admin Mina PvP ✦")
            .body("§7Gestiona todos los aspectos de la Mina PvP")
            .button("§eRegenerar Mina\n§7Forzar regeneración ahora")
            .button("§aRellenar Madera\n§7Rellenar zonas de madera")
            .button("§bZona de Generación\n§7Bounds del fill/minerales/cuevas")
            .button("§dZonas y TPs\n§7Zona segura, spawn, línea de salida")
            .button("§6⚙ Minerales\n§7Multiplicador de cantidad")
            .button("§c🕳 Cuevas\n§7Cantidad de túneles y cámaras")
            .button("§e⏱ Timers\n§7Intervalos de regeneración")
            .button("§8✖ Cerrar")
            .show(player).catch(() => null);

        if (!res || res.canceled || res.selection === 7) return;

        switch (res.selection) {
            case 0: await confirmRegenMine(player); break;
            case 1: await showRefillWoodUI(player); break;
            case 2: await showGenBoundsUI(player);  break;
            case 3: await showZonesUI(player);      break;
            case 4: await showOreConfigUI(player);  break;
            case 5: await showCaveConfigUI(player); break;
            case 6: await showTimersUI(player);     break;
        }
    }
}

async function confirmRegenMine(player) {
    const res = await new MessageFormData()
        .title("§c¿Regenerar Mina?")
        .body("§7Esto evacuará a todos los jugadores y regenerará la mina completa.\n\n§c¿Confirmas?")
        .button1("§aSí, regenerar")
        .button2("§cCancelar")
        .show(player).catch(() => null);

    if (!res || res.selection !== 0) return;
    player.sendMessage(pfx() + "§e[MinePvP] Regeneración iniciada...");
    world.sendMessage("§c[MinePvP] §fRegenerando la mina...");
    generateMine(() => {
        try { world.sendMessage("§a[MinePvP] §fMina regenerada."); } catch (_) {}
    });
}

async function showRefillWoodUI(player) {
    const form = new ActionFormData()
        .title("§a🪵 Rellenar Madera")
        .body("§7Selecciona la zona a rellenar:");
    for (const zone of WOOD_ZONES) form.button(`§e${zone.name}`);
    form.button("§aRellenar TODAS");
    form.button("§8Volver");

    const res = await form.show(player).catch(() => null);
    if (!res || res.canceled || res.selection === WOOD_ZONES.length + 1) return;

    const dim = world.getDimension("overworld");
    const zones = res.selection === WOOD_ZONES.length ? WOOD_ZONES : [WOOD_ZONES[res.selection]];
    for (const zone of zones) {
        try {
            const x1=Math.min(zone.minX,zone.maxX), x2=Math.max(zone.minX,zone.maxX);
            const y1=Math.min(zone.minY,zone.maxY), y2=Math.max(zone.minY,zone.maxY);
            const z1=Math.min(zone.minZ,zone.maxZ), z2=Math.max(zone.minZ,zone.maxZ);
            dim.runCommand(`fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${zone.block}`);
        } catch (e) { player.sendMessage(pfx() + "§cError en " + zone.name + ": " + e); }
    }
    player.sendMessage(pfx() + (zones.length === WOOD_ZONES.length
        ? "§aTodas las zonas rellenadas."
        : `§aZona §e${zones[0].name}§a rellenada.`));
}

async function showGenBoundsUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§b📐 Zona de Generación")
        .textField("Min X", "-1514", { defaultValue: String(cfg.genMinX) })
        .textField("Min Y", "-60",   { defaultValue: String(cfg.genMinY) })
        .textField("Min Z", "3079",  { defaultValue: String(cfg.genMinZ) })
        .textField("Max X", "-1378", { defaultValue: String(cfg.genMaxX) })
        .textField("Max Y", "62",    { defaultValue: String(cfg.genMaxY) })
        .textField("Max Z", "3154",  { defaultValue: String(cfg.genMaxZ) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [minX,minY,minZ,maxX,maxY,maxZ] = res.formValues.map(Number);
    if ([minX,minY,minZ,maxX,maxY,maxZ].some(isNaN)) { player.sendMessage(pfx()+"§cValores inválidos."); return; }
    setMineConfig({ ...getMineConfig(), genMinX:minX, genMinY:minY, genMinZ:minZ, genMaxX:maxX, genMaxY:maxY, genMaxZ:maxZ });
    const vol = Math.abs(maxX-minX+1)*Math.abs(maxY-minY+1)*Math.abs(maxZ-minZ+1);
    player.sendMessage(pfx() + `§aZona de generación guardada. Volumen: §e${vol.toLocaleString()} §abloques.`);
}

async function showZonesUI(player) {
    const res = await new ActionFormData()
        .title("§d🏠 Zonas y TPs")
        .body("§7¿Qué quieres configurar?")
        .button("§aMine Bounds\n§7Área total de detección de jugadores")
        .button("§bZona Segura\n§7Bounds de la zona segura")
        .button("§eLínea de Salida\n§7Z y rango X de la línea de cruce")
        .button("§6Spawn en Mina\n§7Área random al entrar a la mina")
        .button("§cSafe Spawn\n§7TP al salir / ser evacuado")
        .button("§7Floating Text\n§7Posición del texto flotante")
        .button("§8Volver")
        .show(player).catch(() => null);

    if (!res || res.canceled || res.selection === 6) return;
    switch (res.selection) {
        case 0: await showMineBoundsUI(player);  break;
        case 1: await showSafeZoneUI(player);    break;
        case 2: await showExitLineUI(player);    break;
        case 3: await showSpawnAreaUI(player);   break;
        case 4: await showSafeSpawnUI(player);   break;
        case 5: await showMineFTUI(player);      break;
    }
}

async function showMineBoundsUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§a Mine Bounds")
        .textField("Min X", "-1523", { defaultValue: String(cfg.mineBoundsMinX) })
        .textField("Min Y", "-60",   { defaultValue: String(cfg.mineBoundsMinY) })
        .textField("Min Z", "3070",  { defaultValue: String(cfg.mineBoundsMinZ) })
        .textField("Max X", "-1369", { defaultValue: String(cfg.mineBoundsMaxX) })
        .textField("Max Y", "63",    { defaultValue: String(cfg.mineBoundsMaxY) })
        .textField("Max Z", "3259",  { defaultValue: String(cfg.mineBoundsMaxZ) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [minX,minY,minZ,maxX,maxY,maxZ] = res.formValues.map(Number);
    if ([minX,minY,minZ,maxX,maxY,maxZ].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), mineBoundsMinX:minX, mineBoundsMinY:minY, mineBoundsMinZ:minZ, mineBoundsMaxX:maxX, mineBoundsMaxY:maxY, mineBoundsMaxZ:maxZ });
    player.sendMessage(pfx() + "§aMine Bounds guardado.");
}

async function showSafeZoneUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§b Zona Segura")
        .textField("Min X", "-1522", { defaultValue: String(cfg.safeMinX) })
        .textField("Min Y", "63",    { defaultValue: String(cfg.safeMinY) })
        .textField("Min Z", "3238",  { defaultValue: String(cfg.safeMinZ) })
        .textField("Max X", "-1370", { defaultValue: String(cfg.safeMaxX) })
        .textField("Max Y", "103",   { defaultValue: String(cfg.safeMaxY) })
        .textField("Max Z", "3258",  { defaultValue: String(cfg.safeMaxZ) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [minX,minY,minZ,maxX,maxY,maxZ] = res.formValues.map(Number);
    if ([minX,minY,minZ,maxX,maxY,maxZ].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), safeMinX:minX, safeMinY:minY, safeMinZ:minZ, safeMaxX:maxX, safeMaxY:maxY, safeMaxZ:maxZ });
    player.sendMessage(pfx() + "§aZona segura guardada.");
}

async function showExitLineUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§e Línea de Salida")
        .textField("Z de la línea", "3238",  { defaultValue: String(cfg.exitLineZ) })
        .textField("Min X",         "-1522", { defaultValue: String(cfg.exitLineMinX) })
        .textField("Max X",         "-1370", { defaultValue: String(cfg.exitLineMaxX) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [z,minX,maxX] = res.formValues.map(Number);
    if ([z,minX,maxX].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), exitLineZ:z, exitLineMinX:minX, exitLineMaxX:maxX });
    player.sendMessage(pfx() + "§aLínea de salida guardada.");
}

async function showSpawnAreaUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§6 Spawn en Mina")
        .textField("Min X", "-1523", { defaultValue: String(cfg.spawnAreaMinX) })
        .textField("Min Z", "3071",  { defaultValue: String(cfg.spawnAreaMinZ) })
        .textField("Max X", "-1370", { defaultValue: String(cfg.spawnAreaMaxX) })
        .textField("Max Z", "3237",  { defaultValue: String(cfg.spawnAreaMaxZ) })
        .textField("Y (altura spawn)", "102", { defaultValue: String(cfg.spawnAreaY) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [minX,minZ,maxX,maxZ,y] = res.formValues.map(Number);
    if ([minX,minZ,maxX,maxZ,y].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), spawnAreaMinX:minX, spawnAreaMinZ:minZ, spawnAreaMaxX:maxX, spawnAreaMaxZ:maxZ, spawnAreaY:y });
    player.sendMessage(pfx() + "§aÁrea de spawn guardada.");
}

async function showSafeSpawnUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§c Safe Spawn")
        .textField("X", "-1443", { defaultValue: String(cfg.safeSpawnX) })
        .textField("Y", "63",    { defaultValue: String(cfg.safeSpawnY) })
        .textField("Z", "3250",  { defaultValue: String(cfg.safeSpawnZ) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [x,y,z] = res.formValues.map(Number);
    if ([x,y,z].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), safeSpawnX:x, safeSpawnY:y, safeSpawnZ:z });
    player.sendMessage(pfx() + "§aSafe Spawn guardado.");
}

async function showMineFTUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§7 Floating Text Mina")
        .textField("X", "-1449.22", { defaultValue: String(cfg.mineFTX) })
        .textField("Y", "66.30",    { defaultValue: String(cfg.mineFTY) })
        .textField("Z", "3155.69",  { defaultValue: String(cfg.mineFTZ) })
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const [x,y,z] = res.formValues.map(Number);
    if ([x,y,z].some(isNaN)) { player.sendMessage(pfx()+"§cInválido."); return; }
    setMineConfig({ ...getMineConfig(), mineFTX:x, mineFTY:y, mineFTZ:z });
    player.sendMessage(pfx() + "§aPosición del floating text guardada.");
}

async function showOreConfigUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§6⚙ Configurar Minerales")
        .textField(
            "§7Multiplicador de cantidad\n§8(1.0 = normal, 2.0 = doble, 0.5 = mitad)",
            "1.0",
            { defaultValue: String(cfg.oreMultiplier ?? 1.0) }
        )
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const mult = parseFloat(res.formValues[0]);
    if (isNaN(mult) || mult <= 0) { player.sendMessage(pfx() + "§cValor inválido (debe ser > 0)."); return; }
    setMineConfig({ ...getMineConfig(), oreMultiplier: mult });
    player.sendMessage(pfx() + `§aMultiplicador guardado: §e${mult}x`);
}

async function showCaveConfigUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§c🕳 Configurar Cuevas")
        .textField(
            "§7Cantidad de túneles §8(recomendado: 10-40)",
            "20",
            { defaultValue: String(cfg.tunnelCount ?? 20) }
        )
        .textField(
            "§7Cantidad de cámaras §8(recomendado: 5-20)",
            "12",
            { defaultValue: String(cfg.chamberCount ?? 12) }
        )
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const tunnels  = parseInt(res.formValues[0]);
    const chambers = parseInt(res.formValues[1]);
    if (isNaN(tunnels) || tunnels < 0 || isNaN(chambers) || chambers < 0) {
        player.sendMessage(pfx() + "§cValores inválidos."); return;
    }
    setMineConfig({ ...getMineConfig(), tunnelCount: tunnels, chamberCount: chambers });
    player.sendMessage(pfx() + `§aCuevas guardadas: §e${tunnels} §atúneles, §e${chambers} §acámaras.`);
}

async function showTimersUI(player) {
    const cfg = getMineConfig();
    const res = await new ModalFormData()
        .title("§e⏱ Timers")
        .textField(
            `§7Relleno de madera (segundos)\n§8Actual: ${cfg.woodRefillSeconds}s`,
            "600",
            { defaultValue: String(cfg.woodRefillSeconds) }
        )
        .textField(
            `§7Regeneración de mina (segundos)\n§8Actual: ${cfg.mineRegenSeconds}s`,
            "3600",
            { defaultValue: String(cfg.mineRegenSeconds) }
        )
        .show(player).catch(() => null);

    if (!res || res.canceled) return;
    const woodSecs = parseInt(res.formValues[0]);
    const mineSecs = parseInt(res.formValues[1]);
    if (isNaN(woodSecs) || woodSecs < 10 || isNaN(mineSecs) || mineSecs < 60) {
        player.sendMessage(pfx() + "§cInválido (madera mín 10s, mina mín 60s)."); return;
    }
    setMineConfig({ ...getMineConfig(), woodRefillSeconds: woodSecs, mineRegenSeconds: mineSecs });
    player.sendMessage(pfx() + `§aTimers guardados: madera §e${woodSecs}s§a, mina §e${mineSecs}s§a.`);
}
