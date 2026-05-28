import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { world } from '@minecraft/server';
import { dimensions } from './index';


const colorNames = ["§4Dark Red§r", "§mMaterial Redstone§r", "§cRed§r", "§nMaterial Copper§r", "§6Gold§r", "§pMaterial Gold§r", "§gMinecoin Gold§r", "§eYellow§r", "§2Dark Green§r", "§qMaterial Emerald§r", "§aGreen§r", "§3Dark Aqua§r", "§sMaterial Diamond§r", "§bAqua§r", "§1Dark Blue§r", "§tMaterial Lapis§r", "§9Blue§r", "§5Dark Purple§r", "§uMaterial Amethyst§r", "§dLight Purple§r", "§0Black§r", "§jMaterial Netherite§r", "§8Dark Gray§r", "§7Gray§r", "§iMaterial Iron§r", "§hMaterial Quartz§r", "§fWhite§r"];
const colorCodes = ["§4", "§m", "§c", "§n", "§6", "§p", "§g", "§e", "§2", "§q", "§a", "§3", "§s", "§b", "§1", "§t", "§9", "§5", "§u", "§d", "§0", "§j", "§8", "§7", "§i", "§h", "§f"];

function menuReject(viewer, reason, nextMenu) {
    viewer.playSound('note.bass');
    nextMenu(viewer, reason);
};


export function showMenu(viewer, error) {
    const ui = new ActionFormData()
        .title('Floating Text Menu')
        .body(error ?? '')
        .button('New Floating Text', 'textures/ui/book_addtextpage_default')
        .button('New Floating Scoreboard', 'textures/ui/book_addpicture_default')
        .button('Edit Loaded Texts', 'textures/ui/icon_book_writable');

    ui.show(viewer).then(({ selection, canceled }) => {
        if (!canceled) switch (selection) {
            case 0: newText(viewer); break;
            case 1: newScoreboard(viewer); break;
            case 2: showTexts(viewer); break;
        }
    })
};


function newText(viewer) {
    const pos = viewer.location;
    const ui = new ModalFormData()
        .title('New Floating Text')
        .textField('Text to Display', 'Text')
        .textField('Text Posistion', 'Coordiates X Y Z', [pos.x, pos.y, pos.z].map(n => n.toFixed(2)).join(' '));

    ui.show(viewer).then(({ formValues, canceled }) => {
        if (canceled) return;
        const xzy = formValues[1].trim().split(' ', 3).map(v => Number(v));
        viewer.dimension.spawnEntity('minecraft:egg<sft:text>', { x: xzy[0], y: xzy[1] - 0.58, z: xzy[2] })
            .nameTag = formValues[0] == '' ? 'Floating Text' : formValues[0].replace(/\\n/g, '\n');
    })
};


function newScoreboard(viewer) {
    const pos = viewer.location;
    const objectiveIDs = world.scoreboard.getObjectives().map(o => o.id);
    if (objectiveIDs.length == 0) { menuReject(viewer, '§cNo existing Scoreboard Objectives found in the world.', showMenu); return };

    const ui = new ModalFormData()
        .title('New Floating Scoreboard')
        .dropdown('Scoreboard Objective to Display', objectiveIDs, 0)
        .textField('Scoreboard Position', 'Coordiates X Y Z', [pos.x, pos.y, pos.z].map(n => n.toFixed(2)).join(' '))
        .dropdown('Scores Organization', ['ascending', 'descending'], 1)
        .toggle('Enumerate Players', true)
        .dropdown('Enumeration Color', colorNames, 4)
        .dropdown('Player Name Color', colorNames, 26)
        .dropdown('Score Color', colorNames, 2)
        .slider('Ammount of listed Players', 1, 15, 1, 8);

    ui.show(viewer).then(({ formValues, canceled }) => {
        if (canceled) return;
        const xzy = formValues[1].trim().split(' ', 3).map(v => Number(v));
        const entity = viewer.dimension.spawnEntity('minecraft:egg<sft:scoreboard>', { x: xzy[0], y: xzy[1] - 0.58, z: xzy[2] });
        entity.setDynamicProperty('sft:scoreboardData', JSON.stringify([
            objectiveIDs[formValues[0]],    /** 0 @type { String } Objective ID */
            formValues[2],                  /** 1 @type { Number } Ascending | Descending */
            formValues[3],                  /** 2 @type { Boolean } Enumerate Players */
            colorCodes[formValues[4]],      /** 3 @type { String } Enumeration Color */
            colorCodes[formValues[5]],      /** 4 @type { String } Player Name Color */
            colorCodes[formValues[6]],      /** 5 @type { String } Score Color */
            formValues[7]                   /** 6 @type { Number } Ammount of listed Players */
        ]));
        entity.nameTag = 'LOADING...';
    })
};


function showTexts(viewer) {
    const foundEntities = [];
    for (const dimension of dimensions) dimension.getEntities({ type: 'minecraft:egg', families: ['inanimate'] }).forEach(e => foundEntities.push(e));
    if (foundEntities.length == 0) { menuReject(viewer, '§cNo Floating Texts found in loaded chunks.', showMenu); return };
    const ui = new ActionFormData()
        .title('Edit Nearby Texts')
        .body('Note: Only texts that are in loaded chunks will show up.');
    foundEntities.forEach(entity => {
        entity.isScoreboard = entity.matches({ families: ['sft:scoreboard'] });
        ui.button(entity.nameTag.replace(/\n.*/g, '') + (entity.isScoreboard ? '§r\n§8[Scoreboard]' : '§r\n§8[Text]'))
    });

    ui.show(viewer).then(({ selection, canceled }) => {
        if (canceled) return;
        const entity = foundEntities[selection];
        if (entity.isScoreboard) editScoreboard(viewer, entity);
        else editText(viewer, entity);

    })
};


function editText(viewer, entity) {
    const pos = entity.location;
    const ui = new ModalFormData()
        .title(entity.nameTag.replace(/\n.*/g, ''))
        .textField('Text to Display', 'Text', entity.nameTag.replace(/\n/g, '\\n'))
        .textField('Text Posistion', 'Coordiates X Y Z', [pos.x.toFixed(2), Number(pos.y + 0.58).toFixed(2), pos.z.toFixed(2)].join(' '))
        .toggle('§cDelete Floating Text?§r', false);

    ui.show(viewer).then(({ formValues, canceled }) => {
        if (canceled) return;
        if (formValues[2]) { entity.remove(); return }
        const xzy = formValues[1].trim().split(' ', 3).map(v => Number(v));
        entity.nameTag = formValues[0] == '' ? 'Floating Text' : formValues[0].replace(/\\n/g, '\n');
        entity.teleport({ x: xzy[0], y: xzy[1] - 0.58, z: xzy[2] });
    })
};


function editScoreboard(viewer, entity) {
    const pos = entity.location;
    const objectiveIDs = world.scoreboard.getObjectives().map(o => o.id);
    const data = JSON.parse(entity.getDynamicProperty('sft:scoreboardData'));
    const ui = new ModalFormData()
        .title(entity.nameTag.replace(/\n.*/g, ''))
        .dropdown('Scoreboard Objective to Display', objectiveIDs, objectiveIDs.indexOf(data[0]))
        .textField('Scoreboard Position', 'Coordiates X Y Z', [pos.x.toFixed(2), Number(pos.y + 0.58).toFixed(2), pos.z.toFixed(2)].join(' '))
        .dropdown('Scores Organization', ['ascending', 'descending'], data[1])
        .toggle('Enumerate Players', data[2])
        .dropdown('Enumeration Color', colorNames, colorCodes.indexOf(data[3]))
        .dropdown('Player Name Color', colorNames, colorCodes.indexOf(data[4]))
        .dropdown('Score Color', colorNames, colorCodes.indexOf(data[5]))
        .slider('Ammount of listed Players', 1, 15, 1, data[6])
        .toggle('§cDelete Floating Text?§r', false);

    ui.show(viewer).then(({ formValues, canceled }) => {
        if (canceled) return;
        if (formValues[8]) { entity.remove(); return }
        const xzy = formValues[1].trim().split(' ', 3).map(v => Number(v));
        entity.nameTag = 'LOADING...';
        entity.setDynamicProperty('sft:scoreboardData', JSON.stringify([
            objectiveIDs[formValues[0]],    /** 0 @type { String } Objective ID */
            formValues[2],                  /** 1 @type { Number } Ascending | Descending */
            formValues[3],                  /** 2 @type { Boolean } Enumerate Players */
            colorCodes[formValues[4]],      /** 3 @type { String } Enumeration Color */
            colorCodes[formValues[5]],      /** 4 @type { String } Player Name Color */
            colorCodes[formValues[6]],      /** 5 @type { String } Score Color */
            formValues[7]                   /** 6 @type { Number } Ammount of listed Players */
        ]));
        entity.teleport({ x: xzy[0], y: xzy[1] - 0.58, z: xzy[2] });
    })
};