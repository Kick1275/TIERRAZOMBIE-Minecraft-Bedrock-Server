/**
 * BlockVehicle.js — Sistema de bloqueo de vehículos
 * API: @minecraft/server 2.9.0-beta + @minecraft/server-ui 2.2.0-beta
 */

import { world, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

// ─── Vehículos bloqueables ────────────────────────────────────────────────────
const VEHICLE_TYPES = new Set([
    'pubg:buggy','pubg:dacia_blue','pubg:dacia_green','pubg:dacia_red','pubg:dacia_white',
    'pubg:hardtop','pubg:opentop','pubg:softtop','pubg:pg117',
    'af:a10','af:ah64','af:b2','af:f14','af:f16','af:f18','af:f22','af:f35a','af:f4','af:mq9',
    'af:leopard2a4','af:m1151','af:m142','af:m1a1','af:m2a2','af:m551','af:m939','af:type16',
    'af:a19','af:af_16ddh','af:strb90h','af:type142a',
    'af:gj2','af:j20','af:mi24','af:mig21','af:mig29','af:su25','af:su33','af:su57','af:tu160','af:yak141',
    'af:af_2s38','af:bm30','af:bmpt72','af:btr80','af:eq2050','af:kamaz65224','af:t72a','af:t90m',
    'af:project03160','af:project1241','af:project677','af:type075',
]);

// ─── Probabilidades de ganzúas ────────────────────────────────────────────────
const LOCKPICK_CHANCE = { 'tz:ganzua1': 0.25, 'tz:ganzua2': 0.50, 'tz:ganzua3': 0.75 };

// ─── Dynamic property keys ────────────────────────────────────────────────────
const PROP_LOCKED = 'bv:locked';
const PROP_OWNER  = 'bv:owner';
const PROP_LIST   = 'bv:list';
const PROP_NOTICE = 'bv:notice';

// ─── Cooldown anti-spam ───────────────────────────────────────────────────────
const interactCooldown   = new Map();
const INTERACT_COOLDOWN  = 10; // ticks
// entityId → true si hay ganzúa en progreso
const lockpickInProgress = new Set();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lee la lista de acceso de un vehículo. */
function getAccessList(entity) {
    try {
        const raw = entity.getDynamicProperty(PROP_LIST);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/** Guarda la lista de acceso. */
const setAccessList = (entity, list) =>
    entity.setDynamicProperty(PROP_LIST, JSON.stringify(list));

/** Verifica si el jugador tiene acceso (dueño o en lista). */
function hasAccess(entity, name) {
    return entity.getDynamicProperty(PROP_OWNER) === name || getAccessList(entity).includes(name);
}

/** Consume 1 unidad del ítem en mano. */
function consumeHeldItem(player) {
    try {
        const inv  = player.getComponent('minecraft:inventory').container;
        const slot = player.selectedSlotIndex;
        const item = inv.getItem(slot);
        if (!item) return;
        item.amount > 1 ? (item.amount--, inv.setItem(slot, item)) : inv.setItem(slot, undefined);
    } catch {}
}

/**
 * Busca una entidad por ID en una dimensión específica,
 * filtrando solo por los tipos de vehículo para reducir el loop.
 */
function findVehicleById(dimId, entityId) {
    try {
        for (const e of world.getDimension(dimId).getEntities()) {
            if (e.id === entityId) return e;
        }
    } catch {}
    return null;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function showVehicleMenu(player, entity) {
    const list    = getAccessList(entity);
    const owner   = entity.getDynamicProperty(PROP_OWNER) ?? '?';
    new ActionFormData()
        .title('§b§lVehículo Bloqueado')
        .body(`§7Dueño: §f${owner}\n§7Acceso: §f${list.length ? list.join(', ') : '§7Ninguno'}`)
        .button('§a+ Agregar jugador')
        .button('§c- Eliminar jugador')
        .show(player)
        .then(res => {
            if (res.canceled) return;
            res.selection === 0 ? showAddPlayer(player, entity) : showRemovePlayer(player, entity);
        });
}

function showAddPlayer(player, entity) {
    new ActionFormData()
        .title('§a§lAgregar jugador')
        .body('¿Cómo quieres agregar al jugador?')
        .button('§eJugador conectado')
        .button('§7Nombre manual')
        .show(player)
        .then(res => {
            if (res.canceled) return;
            res.selection === 0 ? showAddOnline(player, entity) : showAddManual(player, entity);
        });
}

function showAddOnline(player, entity) {
    const online = world.getAllPlayers().map(p => p.name).filter(n => n !== player.name);
    if (!online.length) { player.sendMessage('§cNo hay otros jugadores conectados.'); return; }
    new ModalFormData()
        .title('§a§lAgregar conectado')
        .dropdown('Jugador', online, 0)
        .show(player)
        .then(res => {
            if (res.canceled || !res.formValues) return;
            addPlayerToList(player, entity, online[res.formValues[0]]);
        });
}

function showAddManual(player, entity) {
    new ModalFormData()
        .title('§7§lAgregar manual')
        .textField('Nombre del jugador', 'Ej: Steve', '')
        .show(player)
        .then(res => {
            if (res.canceled || !res.formValues) return;
            const name = String(res.formValues[0]).trim();
            if (!name) { player.sendMessage('§cNombre inválido.'); return; }
            addPlayerToList(player, entity, name);
        });
}

function addPlayerToList(player, entity, targetName) {
    const list = getAccessList(entity);
    if (list.includes(targetName)) { player.sendMessage(`§e${targetName} ya tiene acceso.`); return; }
    list.push(targetName);
    setAccessList(entity, list);
    player.sendMessage(`§a✔ ${targetName} añadido a la lista de acceso.`);
    world.getAllPlayers().find(p => p.name === targetName)
        ?.sendMessage(`§b[Vehículo] §f${player.name} te ha dado acceso a su vehículo.`);
}

function showRemovePlayer(player, entity) {
    const list = getAccessList(entity);
    if (!list.length) { player.sendMessage('§cLa lista de acceso está vacía.'); return; }
    new ModalFormData()
        .title('§c§lEliminar jugador')
        .dropdown('Jugador a eliminar', list, 0)
        .show(player)
        .then(res => {
            if (res.canceled || !res.formValues) return;
            const target = list[res.formValues[0]];
            setAccessList(entity, list.filter(n => n !== target));
            player.sendMessage(`§c✖ ${target} eliminado de la lista de acceso.`);
        });
}

// ─── Ganzúas ──────────────────────────────────────────────────────────────────

function attemptLockpick(player, entity, itemId) {
    const entityId = entity.id;
    if (lockpickInProgress.has(entityId)) {
        player.sendMessage('§c[Ganzúa] Alguien ya está intentando desbloquear este vehículo.');
        return;
    }

    const ownerName = entity.getDynamicProperty(PROP_OWNER) ?? '';
    const chance    = LOCKPICK_CHANCE[itemId];
    // Captura la dimensión del jugador — el vehículo siempre está en la misma
    const dimId     = player.dimension.id;

    lockpickInProgress.add(entityId);
    consumeHeldItem(player);
    player.playSound('Unloking', { volume: 1, pitch: 1 });
    player.sendMessage('§e[Ganzúa] Forzando cerradura... espera 5 segundos.');

    system.runTimeout(() => {
        lockpickInProgress.delete(entityId);
        // Busca solo en la dimensión del jugador (no en las 3 dimensiones)
        const target = findVehicleById(dimId, entityId);
        if (!target) { player.sendMessage('§c[Ganzúa] El vehículo ya no existe.'); return; }

        if (Math.random() < chance) {
            target.setDynamicProperty(PROP_LOCKED, false);
            target.setDynamicProperty(PROP_OWNER,  '');
            target.setDynamicProperty(PROP_LIST,   '[]');
            player.playSound('loked', { volume: 1.5, pitch: 1 });
            player.sendMessage('§a§l[Ganzúa] ¡Éxito! §rEl vehículo ha sido desbloqueado.');
            const ownerPlayer = world.getAllPlayers().find(p => p.name === ownerName);
            if (ownerPlayer)   ownerPlayer.sendMessage(`§c[Vehículo] §f${player.name} desbloqueó tu vehículo con una ganzúa.`);
            else if (ownerName) target.setDynamicProperty(PROP_NOTICE, `${player.name} desbloqueó tu vehículo con una ganzúa.`);
        } else {
            player.playSound('notLoked', { volume: 1, pitch: 1 });
            player.sendMessage('§c§l[Ganzúa] Fallaste. §rEl vehículo sigue bloqueado.');
        }
    }, 100);
}

// ─── Notificaciones offline ───────────────────────────────────────────────────
// Solo busca en overworld — los vehículos no deberían estar en nether/end.
// Si en tu mundo pueden estar en otras dimensiones, añade las otras aquí.
world.afterEvents.playerSpawn.subscribe(ev => {
    if (!ev.initialSpawn) return;
    const { player } = ev;
    try {
        for (const e of world.getDimension('overworld').getEntities()) {
            if (e.getDynamicProperty(PROP_OWNER) !== player.name) continue;
            const notice = e.getDynamicProperty(PROP_NOTICE);
            if (!notice) continue;
            player.sendMessage(`§c[Vehículo] §f${notice}`);
            e.setDynamicProperty(PROP_NOTICE, '');
        }
    } catch {}
});

// ─── Evento principal ─────────────────────────────────────────────────────────

world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    const { player, target: entity } = ev;
    if (!entity || !VEHICLE_TYPES.has(entity.typeId)) return;

    // Anti-spam
    const now  = system.currentTick;
    const last = interactCooldown.get(player.name) ?? 0;
    if (now - last < INTERACT_COOLDOWN) { ev.cancel = true; return; }
    interactCooldown.set(player.name, now);

    // Lectura de estado — todo antes de cualquier system.run
    const inv      = player.getComponent('minecraft:inventory')?.container;
    const heldId   = inv?.getItem(player.selectedSlotIndex)?.typeId ?? '';
    const isLocked = !!entity.getDynamicProperty(PROP_LOCKED);

    // ── 1. NO bloqueado + bloqueador → bloquear ───────────────────────────────
    if (!isLocked && heldId === 'tz:bloqueador') {
        ev.cancel = true;
        entity.setDynamicProperty(PROP_LOCKED, true);
        entity.setDynamicProperty(PROP_OWNER,  player.name);
        entity.setDynamicProperty(PROP_LIST,   '[]');
        consumeHeldItem(player);
        system.run(() => {
            player.playSound('loked', { volume: 1.5, pitch: 1 });
            player.sendMessage(
                '§b§l[Vehículo] ¡Bloqueado! §rAhora solo tú puedes usarlo.\n' +
                '§7→ Usa otra Llave Bloqueadora para gestionar el acceso.\n' +
                '§7→ Sin configurar, nadie más podrá subirse.'
            );
            showVehicleMenu(player, entity);
        });
        return;
    }

    // ── 2. NO bloqueado + ganzúa → error ─────────────────────────────────────
    if (!isLocked && LOCKPICK_CHANCE[heldId] != null) {
        ev.cancel = true;
        system.run(() => player.sendMessage('§c[Ganzúa] Este vehículo no está bloqueado.'));
        return;
    }

    // ── 3. BLOQUEADO ──────────────────────────────────────────────────────────
    if (isLocked) {
        // Captura IDs antes de salir del contexto del beforeEvent
        const entityId    = entity.id;
        const dimId       = player.dimension.id;
        const hasAccess_  = hasAccess(entity, player.name);

        // Helper local — solo busca en la dimensión del jugador
        const getEntity = () => findVehicleById(dimId, entityId);

        // 3a: bloqueador → gestionar lista (no consume)
        if (heldId === 'tz:bloqueador') {
            ev.cancel = true;
            system.run(() => { const e = getEntity(); if (e) showVehicleMenu(player, e); });
            return;
        }

        // 3b: ganzúa → intentar desbloqueo
        if (LOCKPICK_CHANCE[heldId] != null) {
            ev.cancel = true;
            const capturedItemId = heldId;
            system.run(() => {
                const e = getEntity();
                if (!e) { player.sendMessage('§c[Ganzúa] No se pudo acceder al vehículo.'); return; }
                attemptLockpick(player, e, capturedItemId);
            });
            return;
        }

        // 3c: sin acceso → avisar
        if (!hasAccess_) {
            ev.cancel = true;
            system.run(() => player.sendMessage('§c[Vehículo] No tienes permiso para usar este vehículo.'));
            return;
        }
        // 3d: tiene acceso → deja pasar
    }
});
