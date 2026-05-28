export const apiWaypointInfo = new class ApiWaypointInfo {
    getAll(player) {
        const waypointsInfo = player.getDynamicPropertyIds();
        const waypoints = [];
        for (const allInfo of waypointsInfo) {
            if (allInfo.startsWith("aw:") || !allInfo.startsWith(player.dimension.id.replace("minecraft:", "")))
                continue;
            const info = allInfo.split("/");
            const name = info.slice(5).join("/"); //Se eu tivesse deixado o nome salvo dentro do dynamic ele teria uma media de 10-30 bytes, mas assim ta bom já
            const dim = info[0];
            const rawPos = info[4]?.split(",");
            const pos = { x: parseInt(rawPos?.[0] ?? ""), y: parseInt(rawPos?.[1] ?? ""), z: parseInt(rawPos?.[2] ?? "") };
            const ico = parseInt(info[2] ?? "");
            const rawRgb = info[3]?.split(",");
            const rgb = { red: parseInt(rawRgb?.[0] ?? ""), green: parseInt(rawRgb?.[1] ?? ""), blue: parseInt(rawRgb?.[2] ?? "") };
            const vis = info[1] == "1";
            if (typeof name != "string" || typeof dim != "string" || typeof pos != "object" || typeof ico != "number" || isNaN(ico) || typeof rgb != "object" || typeof vis != "boolean") {
                player.setDynamicProperty(allInfo, undefined);
                continue;
            }
            waypoints.push({
                id: name,
                dim: dim,
                icon: ico,
                pos: pos,
                rgb: rgb,
                visible: vis
            });
        }
        return waypoints
            .sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));
    }
    getAllName(player, exclude = "\u0000") {
        return player.getDynamicPropertyIds()
            .filter(value => !value.startsWith("aw:") && !value.endsWith(exclude) && value.startsWith(player.dimension.id.replace("minecraft:", "")))
            .map(value => value.split("/").slice(5).join("/"))
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }
    remove(player, name) {
        const waypoints = player.getDynamicPropertyIds().find(value => value.endsWith(name));
        if (waypoints)
            player.setDynamicProperty(waypoints, undefined);
    }
};
