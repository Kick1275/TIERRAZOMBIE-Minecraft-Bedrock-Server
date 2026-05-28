import * as mc from "@minecraft/server"
import * as ui from "@minecraft/server-ui"
const { world, system } = mc;

const CONFIG_DEFAULTS = {
    autoSetExpireTime: false,
};

export class Config {
    static get(key) { return world.getDynamicProperty(key) ?? CONFIG_DEFAULTS[key] }
    static set(key, value) { world.setDynamicProperty(key, value) }

    /**@type {string}*/
    static get autoSetExpireTime() { return this.get("autoSetExpireTime"); }
    static set autoSetExpireTime(v) { this.set("autoSetExpireTime", v); }
}

/**@param {mc.Player} player */
const main = (player) => {
    player.playSound("random.levelup")

    new ui.ModalFormData()
        .header("Realistic Food Config")
        .divider()

        .toggle("Auto Expire Time", { defaultValue: Config.autoSetExpireTime })
        .label("If enabled the addon will support ALL foods using 10 days as default expire time.")
        .divider()

        .toggle("Expire Time Item Link Mode", { defaultValue: player.getDynamicProperty('etilm') })
        .label("When enabled if you use a food item it will let you set the expire date manually.")
        .divider()

        .show(player).then(({ cancelationReason: reason, formValues }) => {
            if (reason == "UserBusy") return system.waitTicks(10).then(() => { main(player) })
            const [
                , , autoSetExpireTime,
                , , etilm
            ] = formValues;
            player.playSound("random.levelup")

            world.sendMessage(
                `§a-- Updated settings --\n§r` +
                `- §iAuto Expire Time: §r${autoSetExpireTime}\n` +
                `- §iLink mode: §r${etilm}\n`
            )
            Config.autoSetExpireTime = autoSetExpireTime
            player.setDynamicProperty("etilm", etilm)
        })
}

system.beforeEvents.startup.subscribe((e) => {
    e.customCommandRegistry.registerCommand({
        name: "realistic_food:config",
        description: "configuration",
        permissionLevel: mc.CommandPermissionLevel.Admin
    }, ({ sourceEntity }) => {
        system.run(() => main(sourceEntity))
    })
    e.itemComponentRegistry.registerCustomComponent('efm:interactable', {
        onUse: ({ itemStack, source: player }) => {
            system.run(() => main(player))
        }
    })
})