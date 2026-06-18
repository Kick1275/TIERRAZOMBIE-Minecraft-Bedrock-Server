import * as mc from "@minecraft/server";

class LoopManager {
    constructor() {
        this.loops = new Map();
    }

    startLoop(name, callback, interval = 1) {
        if (this.loops.has(name)) this.stopLoop(name);
        const loopId = mc.system.runInterval(callback, interval);
        this.loops.set(name, loopId);
    }

    stopLoop(name) {
        if (this.loops.has(name)) {
            mc.system.clearRun(this.loops.get(name));
            this.loops.delete(name);
        }
    }

    stopAllLoops() {
        this.loops.forEach((id) => mc.system.clearRun(id));
        this.loops.clear();
    }
}

const loopManager = new LoopManager();
export { loopManager };