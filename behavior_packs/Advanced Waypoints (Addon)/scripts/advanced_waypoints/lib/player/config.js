export const playerConfig = new Map();
export const apiConfig = new class ApiConfig {
    get(player) {
        const storaged = playerConfig.get(player.id);
        if (storaged)
            return storaged;
        const dynamic = player.getDynamicProperty("aw:config");
        if (typeof dynamic != "string")
            return defaulConfig;
        const config = JSON.parse(dynamic);
        if (!this.isValid(config)) {
            playerConfig.set(player.id, defaulConfig);
            return defaulConfig;
        }
        playerConfig.set(player.id, config);
        return config;
    }
    set(player, config) {
        if (config) {
            playerConfig.set(player.id, config);
        }
        else {
            playerConfig.delete(player.id);
        }
        player.setDynamicProperty("aw:config", config == undefined ? config : JSON.stringify(config));
    }
    isValid(obj) {
        return obj &&
            typeof obj == "object" &&
            typeof obj.name == "boolean" &&
            typeof obj.dis == "boolean" &&
            typeof obj.showInfo == "boolean" &&
            typeof obj.showBeam == "boolean" &&
            typeof obj.pos == "boolean" &&
            typeof obj.createDP == "boolean" &&
            typeof obj.DPType == "number" &&
            typeof obj.share == "boolean";
    }
};
const defaulConfig = {
    name: true,
    dis: true,
    showInfo: false,
    showBeam: false,
    pos: true,
    createDP: false,
    DPType: 0,
    share: true
};
