import { world, system } from "@minecraft/server";
import { getMineConfig, getMineGenBounds, MINE_REGEN_TICKS } from "./MineConfig.js";
import { updateMineFT } from "./MineFloatingText.js";
import { evacuateMine } from "./MineSafeZone.js";

let mineTimer = MINE_REGEN_TICKS;

function ri(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Ejecutar lista de comandos en lotes ──────────────────────────────────────
function runQueue(dim, commands, batchSize, tickDelay, onDone) {
    if (commands.length === 0) { if (onDone) onDone(); return; }
    let idx = 0;
    const interval = system.runInterval(() => {
        const end = Math.min(idx + batchSize, commands.length);
        for (let i = idx; i < end; i++) {
            try { dim.runCommand(commands[i]); } catch (e) {
                console.warn("[MinePvP] Cmd error: " + commands[i] + " -> " + e);
            }
        }
        idx = end;
        if (idx >= commands.length) {
            system.clearRun(interval);
            if (onDone) onDone();
        }
    }, tickDelay);
}

// ─── FASE 1: Fill base ────────────────────────────────────────────────────────
function buildFillCommands(b) {
    const cmds = [];
    const CHUNK_XZ = 32, CHUNK_Y = 8;
    for (let cx = b.minX; cx <= b.maxX; cx += CHUNK_XZ) {
        const ex = Math.min(cx + CHUNK_XZ - 1, b.maxX);
        for (let cz = b.minZ; cz <= b.maxZ; cz += CHUNK_XZ) {
            const ez = Math.min(cz + CHUNK_XZ - 1, b.maxZ);
            for (let cy = b.minY; cy <= b.maxY; cy += CHUNK_Y) {
                const ey = Math.min(cy + CHUNK_Y - 1, b.maxY);
                if (ey < 0) {
                    cmds.push(`fill ${cx} ${cy} ${cz} ${ex} ${ey} ${ez} deepslate`);
                } else if (cy >= 0) {
                    cmds.push(`fill ${cx} ${cy} ${cz} ${ex} ${ey} ${ez} stone`);
                } else {
                    cmds.push(`fill ${cx} ${cy} ${cz} ${ex} -1 ${ez} deepslate`);
                    cmds.push(`fill ${cx} 0 ${cz} ${ex} ${ey} ${ez} stone`);
                }
            }
        }
    }
    return cmds;
}

// ─── FASE 2: Minerales ────────────────────────────────────────────────────────
function buildOreCommands(b, oreMult) {
    const cmds = [];
    const m = Math.max(0.1, oreMult);

    function inB(x, y, z) {
        return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY && z >= b.minZ && z <= b.maxZ;
    }
    function addVein(block, sx, sy, sz, length, spread) {
        let x = sx, y = sy, z = sz;
        for (let i = 0; i < length; i++) {
            if (!inB(x, y, z)) break;
            cmds.push(`setblock ${x} ${y} ${z} ${block} replace`);
            x = clamp(x + ri(-spread, spread), b.minX, b.maxX);
            y = clamp(y + ri(-1, 1), b.minY, b.maxY);
            z = clamp(z + ri(-spread, spread), b.minZ, b.maxZ);
        }
    }
    function n(base) { return Math.round(base * m); }

    for (let y = b.minY; y <= b.maxY; y++) {
        const deep = y < 0, vdeep = y < -40;
        if (!deep) {
            for (let i = 0; i < n(4);  i++) addVein("minecraft:andesite",     ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(5,10), 2);
            for (let i = 0; i < n(4);  i++) addVein("minecraft:diorite",      ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(5,10), 2);
            for (let i = 0; i < n(4);  i++) addVein("minecraft:granite",      ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(5,10), 2);
            for (let i = 0; i < n(3);  i++) addVein("minecraft:gravel",       ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,8),  2);
            for (let i = 0; i < n(2);  i++) addVein("minecraft:tuff",         ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,7),  2);
            for (let i = 0; i < n(12); i++) addVein("minecraft:coal_ore",     ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(5,12), 2);
            for (let i = 0; i < n(10); i++) addVein("minecraft:iron_ore",     ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,9),  2);
            for (let i = 0; i < n(2);  i++) addVein("minecraft:raw_iron_block",ri(b.minX,b.maxX),y, ri(b.minZ,b.maxZ), ri(2,4),  1);
            for (let i = 0; i < n(8);  i++) addVein("minecraft:copper_ore",   ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,8),  2);
            for (let i = 0; i < n(5);  i++) addVein("minecraft:gold_ore",     ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6),  1);
            for (let i = 0; i < n(4);  i++) addVein("minecraft:lapis_ore",    ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6),  1);
            for (let i = 0; i < n(5);  i++) addVein("minecraft:redstone_ore", ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,7),  1);
            if (y < 16) for (let i = 0; i < n(2); i++) addVein("minecraft:diamond_ore", ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(2,4), 1);
            if (y > 0 && Math.random() < 0.10 * m) addVein("minecraft:emerald_ore", ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(1,2), 1);
        } else {
            for (let i = 0; i < n(4);  i++) addVein("minecraft:tuff",                   ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,9), 2);
            if (vdeep) for (let i = 0; i < n(2); i++) addVein("minecraft:calcite",       ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6), 2);
            for (let i = 0; i < n(8);  i++) addVein("minecraft:deepslate_coal_ore",      ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,8), 2);
            for (let i = 0; i < n(9);  i++) addVein("minecraft:deepslate_iron_ore",      ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,8), 2);
            for (let i = 0; i < n(2);  i++) addVein("minecraft:raw_iron_block",          ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(2,4), 1);
            for (let i = 0; i < n(6);  i++) addVein("minecraft:deepslate_copper_ore",    ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6), 2);
            for (let i = 0; i < n(5);  i++) addVein("minecraft:deepslate_gold_ore",      ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6), 1);
            if (vdeep) {
                for (let i = 0; i < n(2); i++) addVein("minecraft:deepslate_gold_ore",   ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6), 1);
                addVein("minecraft:raw_gold_block",                                       ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(1,3), 1);
            }
            for (let i = 0; i < n(5);  i++) addVein("minecraft:deepslate_lapis_ore",    ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(3,6), 1);
            for (let i = 0; i < n(7);  i++) addVein("minecraft:deepslate_redstone_ore", ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(4,8), 1);
            const dn = vdeep ? n(4) : n(3);
            for (let i = 0; i < dn; i++) addVein("minecraft:deepslate_diamond_ore",     ri(b.minX,b.maxX), y, ri(b.minZ,b.maxZ), ri(2,5), 1);
        }
    }
    return cmds;
}

// ─── FASE 3: Cuevas ───────────────────────────────────────────────────────────
function buildCaveCommands(b, tunnelCount, chamberCount) {
    const cmds = [];

    function carveTunnel(x, y, z, w) {
        const x1 = clamp(x-w, b.minX, b.maxX), x2 = clamp(x+w, b.minX, b.maxX);
        const z1 = clamp(z-w, b.minZ, b.maxZ), z2 = clamp(z+w, b.minZ, b.maxZ);
        const y1 = clamp(y,   b.minY, b.maxY), y2 = clamp(y+2, b.minY, b.maxY);
        cmds.push(`fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} air replace`);
    }

    const surfaceCount = Math.max(1, Math.round(tunnelCount * 0.2));
    const deepCount    = tunnelCount - surfaceCount;

    for (let i = 0; i < deepCount; i++) {
        let x = ri(b.minX+10, b.maxX-10), y = ri(b.minY+5, b.maxY-8), z = ri(b.minZ+10, b.maxZ-10);
        let dx = (Math.random()-0.5)*2, dy = (Math.random()-0.5)*0.4, dz = (Math.random()-0.5)*2;
        const len = ri(25, 55), w = ri(1, 2);
        for (let s = 0; s < len; s++) {
            dx+=(Math.random()-0.5)*0.4; dy+=(Math.random()-0.5)*0.2; dz+=(Math.random()-0.5)*0.4;
            const l=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
            dx=(dx/l)*2; dy=(dy/l)*1.5; dz=(dz/l)*2;
            x=clamp(Math.round(x+dx),b.minX+2,b.maxX-2);
            y=clamp(Math.round(y+dy),b.minY+2,b.maxY);
            z=clamp(Math.round(z+dz),b.minZ+2,b.maxZ-2);
            carveTunnel(x, y, z, w);
        }
    }
    for (let i = 0; i < surfaceCount; i++) {
        let x = ri(b.minX+10, b.maxX-10), y = b.maxY-1, z = ri(b.minZ+10, b.maxZ-10);
        let dx = (Math.random()-0.5)*2, dy = -0.9, dz = (Math.random()-0.5)*2;
        const len = ri(25, 55), w = ri(1, 2);
        for (let s = 0; s < len; s++) {
            dx+=(Math.random()-0.5)*0.4; dy+=(Math.random()-0.5)*0.2; dz+=(Math.random()-0.5)*0.4;
            const l=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
            dx=(dx/l)*2; dy=(dy/l)*1.5; dz=(dz/l)*2;
            x=clamp(Math.round(x+dx),b.minX+2,b.maxX-2);
            y=clamp(Math.round(y+dy),b.minY+2,b.maxY);
            z=clamp(Math.round(z+dz),b.minZ+2,b.maxZ-2);
            carveTunnel(x, y, z, w);
        }
    }
    for (let i = 0; i < chamberCount; i++) {
        const cx=ri(b.minX+8,b.maxX-8), cy=ri(b.minY+5,b.maxY-5), cz=ri(b.minZ+8,b.maxZ-8);
        const r=ri(3,6);
        const x1=clamp(cx-r,b.minX,b.maxX), x2=clamp(cx+r,b.minX,b.maxX);
        const y1=clamp(cy-1,b.minY,b.maxY), y2=clamp(cy+3,b.minY,b.maxY);
        const z1=clamp(cz-r,b.minZ,b.maxZ), z2=clamp(cz+r,b.minZ,b.maxZ);
        cmds.push(`fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} air replace`);
    }
    return cmds;
}

// ─── Generación principal: fill → minerales → cuevas ─────────────────────────
export function generateMine(onComplete) {
    const dim    = world.getDimension("overworld");
    const cfg    = getMineConfig();
    const bounds = getMineGenBounds();

    evacuateMine();

    console.warn("[MinePvP] Fase 1: Fill piedra/deepslate...");
    const fillCmds = buildFillCommands(bounds);
    console.warn(`[MinePvP] ${fillCmds.length} comandos de fill`);

    runQueue(dim, fillCmds, 4, 4, () => {
        console.warn("[MinePvP] Fase 2: Minerales...");
        const oreCmds = buildOreCommands(bounds, cfg.oreMultiplier ?? 1.0);
        console.warn(`[MinePvP] ${oreCmds.length} comandos de mineral`);

        runQueue(dim, oreCmds, 100, 2, () => {
            console.warn("[MinePvP] Fase 3: Cuevas...");
            const caveCmds = buildCaveCommands(bounds, cfg.tunnelCount ?? 20, cfg.chamberCount ?? 12);
            console.warn(`[MinePvP] ${caveCmds.length} comandos de cueva`);

            runQueue(dim, caveCmds, 20, 2, () => {
                console.warn("[MinePvP] Generación completa.");
                if (onComplete) onComplete();
            });
        });
    });
}

// ─── Timer de regeneración ────────────────────────────────────────────────────
export function initializeMineTimer() {
    mineTimer = MINE_REGEN_TICKS;
    system.runInterval(() => {
        mineTimer -= 20;
        if (mineTimer <= 0) {
            mineTimer = MINE_REGEN_TICKS;
            world.sendMessage("§c[MinePvP] §fRegenerando la mina...");
            generateMine(() => {
                try { world.sendMessage("§a[MinePvP] §fMina regenerada."); } catch (_) {}
            });
        }
        updateMineFT(Math.ceil(mineTimer / 20));
    }, 20);
}
