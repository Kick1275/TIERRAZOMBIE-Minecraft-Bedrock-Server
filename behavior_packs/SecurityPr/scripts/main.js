import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

console.warn("[SecurityPr] Sistema de protección iniciando...");

// ─── STORAGE DE PROTECCIONES ──────────────────────────────────────────────────

class ProtectionStorage {
    constructor() {
        this.protections = new Map();
    }

    save() {
        try {
            const data = Array.from(this.protections.entries());
            world.setDynamicProperty('rt:prot_storage', JSON.stringify(data));
        } catch (e) {
            console.warn("[SecurityPr] Error guardando: " + e);
        }
    }

    load() {
        try {
            const data = world.getDynamicProperty('rt:prot_storage');
            if (data) {
                this.protections = new Map(JSON.parse(data));
                console.warn(`[SecurityPr] ${this.protections.size} protecciones cargadas`);
            }
        } catch (e) {
            console.warn("[SecurityPr] Error cargando: " + e);
        }
    }
}

const storage = new ProtectionStorage();

// ─── HELPER: VERIFICAR SI ESTÁ EN PROTECCIÓN ──────────────────────────────────

function isBlockInProtectedArea(blockLocation) {
    try {
        const dimension = world.getDimension('overworld');
        const protections = dimension.getEntities({ 
            type: 'rt:runa_proteccion', 
            tags: ['ready']
        });

        for (const protection of protections) {
            const pLoc = protection.location;
            let radius = 11;

            if (protection.hasTag('runa1')) radius = 11;
            else if (protection.hasTag('runa2')) radius = 21;
            else if (protection.hasTag('runa3')) radius = 31;

            const dx = Math.abs(blockLocation.x - pLoc.x);
            const dz = Math.abs(blockLocation.z - pLoc.z);

            console.warn(`[SecurityPr] Checking block at ${blockLocation.x},${blockLocation.z} vs protection at ${pLoc.x},${pLoc.z} (radius: ${radius}) - dx: ${dx}, dz: ${dz}`);

            if (dx <= radius && dz <= radius && blockLocation.y >= 2 && blockLocation.y <= 300) {
                console.warn(`[SecurityPr] Block IS in protected area!`);
                return { protected: true, protection: protection };
            }
        }

        console.warn(`[SecurityPr] Block NOT in protected area`);
        return { protected: false, protection: null };
    } catch (e) {
        console.warn("[SecurityPr] Error in isBlockInProtectedArea: " + e);
        return { protected: false, protection: null };
    }
}

function hasPlayerPermission(player, protection) {
    try {
        // Obtener el scoreboard friendid
        const friendidObj = world.scoreboard.getObjective('friendid');
        if (!friendidObj) {
            console.warn(`[SecurityPr] friendid scoreboard not found`);
            return false;
        }

        // Intentar obtener los scores
        let playerScore;
        let protectionScore;
        
        try {
            playerScore = friendidObj.getScore(player);
        } catch (e) {
            console.warn(`[SecurityPr] Player ${player.name} has no friendid score`);
            return false;
        }
        
        try {
            protectionScore = friendidObj.getScore(protection);
        } catch (e) {
            console.warn(`[SecurityPr] Protection has no friendid score`);
            return false;
        }

        console.warn(`[SecurityPr] Player ${player.name} friendid: ${playerScore}, Protection friendid: ${protectionScore}`);

        // Si los scores coinciden, el jugador tiene permiso
        if (playerScore === protectionScore) {
            return true;
        }
        
        return false;
    } catch (e) {
        console.warn(`[SecurityPr] Error checking permission: ${e}`);
        return false;
    }
}

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────

world.afterEvents.worldLoad.subscribe(() => {
    try {
        let dimension = world.getDimension('overworld');
        dimension.runCommand('function install');
        storage.load();
        console.warn("[SecurityPr] Sistema inicializado");
    } catch (e) {
        console.warn("[SecurityPr] Error en inicialización: " + e);
    }
});

// ─── SISTEMA DE NOMBRES AUTOMÁTICOS ────────────────────────────────────────────

system.runInterval(() => {
    try {
        const dimension = world.getDimension('overworld');
        const protections = dimension.getEntities({ 
            type: 'rt:runa_proteccion', 
            tags: ['set_name']
        });

        for (const protection of protections) {
            try {
                // Obtener el dueño
                const claimObj = world.scoreboard.getObjective('claim');
                const playerIdObj = world.scoreboard.getObjective('id');
                
                if (claimObj && playerIdObj) {
                    const protectionClaim = claimObj.getScore(protection);
                    const allPlayers = world.getAllPlayers();
                    
                    for (const p of allPlayers) {
                        try {
                            const pId = playerIdObj.getScore(p);
                            if (pId === protectionClaim) {
                                // Determinar el radio
                                let radius = '11x11';
                                if (protection.hasTag('runa2')) radius = '21x21';
                                else if (protection.hasTag('runa3')) radius = '31x31';
                                
                                // Asignar nombre
                                protection.nameTag = `§6${p.name} §7[${radius}]`;
                                protection.removeTag('set_name');
                                console.warn(`[SecurityPr] Set name for protection: ${protection.nameTag}`);
                                break;
                            }
                        } catch {}
                    }
                }
            } catch (e) {
                console.warn(`[SecurityPr] Error setting name: ${e}`);
            }
        }
    } catch (e) {
        console.warn(`[SecurityPr] Error in name system: ${e}`);
    }
}, 20); // Cada segundo

// ─── COMANDO PARA ABRIR UI ────────────────────────────────────────────────────

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const message = event.message;

    // Comando: !protection o !prot
    if (message === '!protection' || message === '!prot') {
        event.cancel = true;
        
        system.run(() => {
            try {
                const dimension = player.dimension;
                const nearbyProtections = dimension.getEntities({
                    type: 'rt:runa_proteccion',
                    location: player.location,
                    maxDistance: 10,
                    tags: ['ready']
                });

                if (nearbyProtections.length === 0) {
                    player.sendMessage("§cNo hay protecciones cercanas (radio 10 bloques)");
                    return;
                }

                const protection = nearbyProtections[0];
                console.warn(`[SecurityPr] Opening UI via command for ${player.name}`);
                
                system.runTimeout(() => {
                    showProtectionUI(player, protection);
                }, 1);
            } catch (e) {
                console.warn(`[SecurityPr] Error in command handler: ${e}`);
                player.sendMessage("§cError al abrir la UI: " + e);
            }
        });
    }
});

// ─── COMPONENTES DE BLOQUES ───────────────────────────────────────────────────

const TierOneComponent = {
    'onPlace': ({ dimension, block }) => {
        dimension.runCommand(
            'execute positioned ' + 
            block.location.x + ' ' + 
            block.location.y + ' ' + 
            block.location.z + 
            ' run function blocks_commands/tier1'
        );
    }
};

const TierTwoComponent = {
    'onPlace': ({ dimension, block }) => {
        dimension.runCommand(
            'execute positioned ' + 
            block.location.x + ' ' + 
            block.location.y + ' ' + 
            block.location.z + 
            ' run function blocks_commands/tier2'
        );
    }
};

const TierThreeComponent = {
    'onPlace': ({ dimension, block }) => {
        dimension.runCommand(
            'execute positioned ' + 
            block.location.x + ' ' + 
            block.location.y + ' ' + 
            block.location.z + 
            ' run function blocks_commands/tier3'
        );
    }
};

// ─── PROTECCIÓN CONTRA COLOCACIÓN/ROTURA ───────────────────────────────────────

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const blockLoc = event.block.location;
    const check = isBlockInProtectedArea(blockLoc);
    
    console.warn(`[SecurityPr] PlaceBlock by ${event.player.name} at ${blockLoc.x},${blockLoc.y},${blockLoc.z}`);
    
    if (check.protected) {
        const hasPermission = hasPlayerPermission(event.player, check.protection);
        console.warn(`[SecurityPr] Block in protected area. Player has permission: ${hasPermission}`);
        
        if (!hasPermission) {
            event.cancel = true;
            event.player.sendMessage("§c✗ Esta área está protegida");
            console.warn(`[SecurityPr] BLOCKED place by ${event.player.name}`);
        }
    }
});

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const blockLoc = event.block.location;
    const check = isBlockInProtectedArea(blockLoc);
    
    console.warn(`[SecurityPr] BreakBlock by ${event.player.name} at ${blockLoc.x},${blockLoc.y},${blockLoc.z}`);
    
    if (check.protected) {
        const hasPermission = hasPlayerPermission(event.player, check.protection);
        console.warn(`[SecurityPr] Block in protected area. Player has permission: ${hasPermission}`);
        
        if (!hasPermission) {
            event.cancel = true;
            event.player.sendMessage("§c✗ Esta área está protegida");
            console.warn(`[SecurityPr] BLOCKED break by ${event.player.name}`);
        }
    }
});

// ─── UI DE PROTECCIÓN ──────────────────────────────────────────────────────────

async function showProtectionUI(player, protection) {
    try {
        console.warn(`[SecurityPr] Opening UI for ${player.name}`);
        
        const tierNames = { 'runa1': '11x11', 'runa2': '21x21', 'runa3': '31x31' };
        const tierColors = { 'runa1': '§a', 'runa2': '§e', 'runa3': '§c' };
        
        let tier = 'runa1';
        if (protection.hasTag('runa2')) tier = 'runa2';
        else if (protection.hasTag('runa3')) tier = 'runa3';
        
        const tierName = tierNames[tier];
        const tierColor = tierColors[tier];
        
        // Verificar si el jugador es el dueño
        const friendidObj = world.scoreboard.getObjective('friendid');
        const claimObj = world.scoreboard.getObjective('claim');
        const playerIdObj = world.scoreboard.getObjective('id');
        
        let isOwner = false;
        let ownerName = "Desconocido";
        let clanName = protection.nameTag || "";
        
        try {
            if (friendidObj && claimObj && playerIdObj) {
                const protectionClaim = claimObj.getScore(protection);
                const playerId = playerIdObj.getScore(player);
                isOwner = (protectionClaim === playerId);
                
                // Obtener el nombre del dueño
                const allPlayers = world.getAllPlayers();
                for (const p of allPlayers) {
                    try {
                        const pId = playerIdObj.getScore(p);
                        if (pId === protectionClaim) {
                            ownerName = p.name;
                            break;
                        }
                    } catch {}
                }
            }
        } catch (e) {
            console.warn(`[SecurityPr] Error checking ownership: ${e}`);
        }

        const form = new ActionFormData()
            .title(`${tierColor}§lProtección ${tierName}`)
            .body(
                `§7Estado: §a✓ Activa\n` +
                `§7Tipo: ${tierColor}${tierName}\n` +
                `§7Radio: §f${tier === 'runa1' ? '11' : tier === 'runa2' ? '21' : '31'} bloques\n` +
                `§7Altura: §f2 - 300\n` +
                `§7Propietario: §f${ownerName}\n` +
                (clanName ? `§7Clan: §6${clanName}\n` : '') +
                `\n§7Gestiona los permisos de tu base`
            );

        if (isOwner) {
            form.button("§a+ Agregar Jugador\n§r§7Dar acceso", "textures/ui/icon_multiplayer");
            form.button("§c- Remover Jugador\n§r§7Quitar acceso", "textures/ui/icon_trash");
            form.button("§6Ver Miembros\n§r§7Lista", "textures/ui/icon_book_writable");
            form.button("§e⚙ Configurar Clan\n§r§7Cambiar nombre", "textures/ui/icon_setting");
        }
        
        form.button("§8Cerrar", "textures/ui/icon_cancel");

        const res = await form.show(player);
        
        console.warn(`[SecurityPr] UI result: canceled=${res.canceled}, selection=${res.selection}`);
        
        if (res.canceled || !isOwner) return;

        switch (res.selection) {
            case 0: await showAddPlayerUI(player, protection); break;
            case 1: await showRemovePlayerUI(player, protection, ownerName); break;
            case 2: await showMembersUI(player, protection); break;
            case 3: await showClanConfigUI(player, protection); break;
        }
    } catch (e) {
        console.warn(`[SecurityPr] Error showing UI: ${e}`);
        player.sendMessage("§cError al abrir la interfaz");
    }
}

async function showAddPlayerUI(player, protection) {
    try {
        const allPlayers = world.getAllPlayers().filter(p => p.id !== player.id);

        console.warn(`[SecurityPr] All players count: ${allPlayers.length}`);

        if (allPlayers.length === 0) {
            player.sendMessage("§cNo hay otros jugadores conectados.");
            return;
        }

        const playerNames = [];
        for (const p of allPlayers) {
            playerNames.push(p.name);
            console.warn(`[SecurityPr] Player available: ${p.name}`);
        }
        
        const form = new ModalFormData();
        form.title("§a§lAgregar Jugador");
        form.dropdown("Selecciona un jugador:", playerNames, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (res.canceled) return;

        console.warn(`[SecurityPr] Form result: ${JSON.stringify(res.formValues)}`);
        
        const selectedIndex = res.formValues[0];
        const selectedName = playerNames[selectedIndex];
        console.warn(`[SecurityPr] Selected index: ${selectedIndex}, name: ${selectedName}`);
        
        // Obtener el jugador de nuevo para asegurarnos de que es válido
        const selectedPlayer = world.getAllPlayers().find(p => p.name === selectedName);
        
        console.warn(`[SecurityPr] Selected player found: ${selectedPlayer ? 'yes' : 'no'}`);
        
        if (!selectedPlayer) {
            player.sendMessage("§cError: Jugador no encontrado o desconectado");
            return;
        }
        
        try {
            // Usar dimension.runCommand en lugar de player.runCommandAsync
            // El comando se ejecuta en el contexto del jugador usando su nombre
            selectedPlayer.dimension.runCommand(
                `scoreboard players operation ${selectedPlayer.name} friendid = @e[type=rt:runa_proteccion,x=${protection.location.x},y=${protection.location.y},z=${protection.location.z},r=1] friendid`
            );
            
            player.sendMessage(`§a✓ ${selectedPlayer.name} agregado`);
            selectedPlayer.sendMessage(`§a✓ ${player.name} te dio acceso a su base`);
            selectedPlayer.dimension.runCommand(`playsound random.levelup @a[name="${selectedPlayer.name}"]`);
        } catch (cmdError) {
            console.warn(`[SecurityPr] Command error: ${cmdError}`);
            player.sendMessage(`§cError ejecutando comando: ${String(cmdError)}`);
        }
    } catch (e) {
        console.warn(`[SecurityPr] Error in showAddPlayerUI: ${e}`);
        if (e && e.stack) {
            console.warn(`[SecurityPr] Error stack: ${e.stack}`);
        }
        player.sendMessage("§cError: " + String(e));
    }
}

async function showRemovePlayerUI(player, protection, ownerName) {
    try {
        const allPlayers = world.getAllPlayers().filter(p => p.id !== player.id && p.name !== ownerName);

        if (allPlayers.length === 0) {
            player.sendMessage("§cNo hay otros jugadores para remover.");
            return;
        }

        const playerNames = [];
        for (const p of allPlayers) {
            playerNames.push(p.name);
        }
        
        const form = new ModalFormData();
        form.title("§c§lRemover Jugador");
        form.dropdown("Selecciona:", playerNames, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (res.canceled) return;

        const selectedIndex = res.formValues[0];
        const selectedName = playerNames[selectedIndex];
        
        // Obtener el jugador de nuevo para asegurarnos de que es válido
        const selectedPlayer = world.getAllPlayers().find(p => p.name === selectedName);
        
        if (!selectedPlayer) {
            player.sendMessage("§cError: Jugador no encontrado o desconectado");
            return;
        }
        
        try {
            // Usar dimension.runCommand en lugar de player.runCommandAsync
            selectedPlayer.dimension.runCommand(`scoreboard players reset ${selectedPlayer.name} friendid`);
            player.sendMessage(`§c✗ ${selectedPlayer.name} removido`);
            selectedPlayer.sendMessage(`§c✗ ${player.name} te quitó el acceso`);
        } catch (cmdError) {
            console.warn(`[SecurityPr] Command error: ${cmdError}`);
            player.sendMessage(`§cError ejecutando comando: ${String(cmdError)}`);
        }
    } catch (e) {
        console.warn(`[SecurityPr] Error in showRemovePlayerUI: ${e}`);
        if (e && e.stack) {
            console.warn(`[SecurityPr] Error stack: ${e.stack}`);
        }
        player.sendMessage("§cError: " + String(e));
    }
}

async function showMembersUI(player, protection) {
    const allPlayers = world.getAllPlayers();
    const friendidObj = world.scoreboard.getObjective('friendid');
    const members = [];
    
    if (friendidObj) {
        try {
            const protectionScore = friendidObj.getScore(protection);
            
            for (const p of allPlayers) {
                if (p.id === player.id) continue;
                try {
                    const pScore = friendidObj.getScore(p);
                    if (pScore === protectionScore) {
                        members.push(p.name);
                    }
                } catch {}
            }
        } catch {}
    }

    const memberText = members.length > 0
        ? members.map(name => `§7• §f${name}`).join('\n')
        : '§8No hay miembros';

    const form = new ActionFormData()
        .title("§6§lMiembros")
        .body(memberText)
        .button("§8Volver");

    await form.show(player);
}

async function showClanConfigUI(player, protection) {
    const currentName = protection.nameTag || "";
    
    const form = new ModalFormData();
    form.title("§e§l⚙ Configurar Clan");
    form.textField("Nombre del Clan/Equipo:", "Ej: Los Guerreros", { defaultValue: currentName });

    const res = await form.show(player);
    if (res.canceled) return;

    const newName = res.formValues[0];
    
    if (newName && newName.trim().length > 0) {
        try {
            protection.nameTag = newName.trim();
            player.sendMessage(`§a✓ Nombre del clan actualizado: §6${newName.trim()}`);
        } catch (e) {
            player.sendMessage("§cError al actualizar el nombre: " + e);
        }
    } else {
        player.sendMessage("§cEl nombre no puede estar vacío");
    }
}

// ─── INTERACCIÓN CON PROTECCIÓN ───────────────────────────────────────────────

// Sistema de cooldown para evitar spam de UI
const uiCooldowns = new Map();

// Usar afterEvents.playerInteractWithEntity (disponible desde 1.7.0)
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const entity = event.target;

    console.warn(`[SecurityPr] Player ${player.name} interacted with ${entity.typeId}`);

    // Solo procesar interacciones con protecciones
    if (entity.typeId !== 'rt:runa_proteccion') return;

    console.warn(`[SecurityPr] Interaction with protection detected`);

    // Verificar si tiene un item especial en la mano
    const item = event.itemStack;
    if (item && (item.typeId === 'rt:upgrade_protection' || item.typeId === 'minecraft:name_tag')) {
        console.warn(`[SecurityPr] Player has special item, allowing vanilla behavior`);
        return; // Permitir el comportamiento vanilla
    }

    // Si es intruso, no mostrar UI
    if (player.hasTag('intruso')) {
        console.warn(`[SecurityPr] Player is intruso, blocking UI`);
        return;
    }

    // Verificar cooldown
    const now = Date.now();
    const lastInteract = uiCooldowns.get(player.id) || 0;
    if (now - lastInteract < 1000) {
        console.warn(`[SecurityPr] Cooldown active, skipping`);
        return;
    }
    uiCooldowns.set(player.id, now);

    console.warn(`[SecurityPr] Opening UI for ${player.name}`);
    
    system.runTimeout(() => {
        showProtectionUI(player, entity);
    }, 1);
});

// ─── PARTÍCULAS ────────────────────────────────────────────────────────────────

let particleTick = 0;

system.runInterval(() => {
    particleTick++;
    if (particleTick % 100 !== 0) return;

    try {
        const dimension = world.getDimension('overworld');
        const protections = dimension.getEntities({ type: 'rt:runa_proteccion', tags: ['ready'] });

        console.warn(`[SecurityPr] Spawning particles for ${protections.length} protections`);

        for (const protection of protections) {
            const loc = protection.location;
            let radius = 11;

            if (protection.hasTag('runa1')) radius = 11;
            else if (protection.hasTag('runa2')) radius = 21;
            else if (protection.hasTag('runa3')) radius = 31;

            console.warn(`[SecurityPr] Protection at ${loc.x},${loc.y},${loc.z} with radius ${radius}`);

            // Altura fija Y=2 para todas las partículas
            const particleY = 2;

            // Esquinas del área protegida
            const corners = [
                { x: loc.x + radius, z: loc.z + radius },
                { x: loc.x + radius, z: loc.z - radius },
                { x: loc.x - radius, z: loc.z + radius },
                { x: loc.x - radius, z: loc.z - radius }
            ];

            for (const corner of corners) {
                try {
                    dimension.spawnParticle('minecraft:endrod', 
                        { x: corner.x, y: particleY, z: corner.z });
                } catch (e) {
                    console.warn(`[SecurityPr] Error spawning corner particle: ${e}`);
                }
            }

            // Líneas del perímetro (cada 1 bloque)
            for (let i = -radius; i <= radius; i += 1) {
                try {
                    // Línea norte (Z positivo)
                    dimension.spawnParticle('minecraft:endrod',
                        { x: loc.x + i, y: particleY, z: loc.z + radius });
                    // Línea sur (Z negativo)
                    dimension.spawnParticle('minecraft:endrod',
                        { x: loc.x + i, y: particleY, z: loc.z - radius });
                    // Línea este (X positivo)
                    dimension.spawnParticle('minecraft:endrod',
                        { x: loc.x + radius, y: particleY, z: loc.z + i });
                    // Línea oeste (X negativo)
                    dimension.spawnParticle('minecraft:endrod',
                        { x: loc.x - radius, y: particleY, z: loc.z + i });
                } catch (e) {
                    console.warn(`[SecurityPr] Error spawning line particle: ${e}`);
                }
            }
        }
    } catch (e) {
        console.warn(`[SecurityPr] Error in particle system: ${e}`);
    }
}, 1);

// ─── REGISTRO ──────────────────────────────────────────────────────────────────

system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.blockComponentRegistry.registerCustomComponent('rt:11x11_block', TierOneComponent);
    initEvent.blockComponentRegistry.registerCustomComponent('rt:21x21_block', TierTwoComponent);
    initEvent.blockComponentRegistry.registerCustomComponent('rt:31x31_block', TierThreeComponent);
    console.warn("[SecurityPr] Componentes de bloques registrados");
});

console.warn("[SecurityPr] Sistema cargado ✓");
