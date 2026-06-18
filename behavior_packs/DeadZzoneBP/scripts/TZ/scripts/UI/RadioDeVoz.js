console.warn('VC_index.js Cargado con éxito!');
import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// Diccionario de idiomas
const translations = {
    en_US: {
        title: "Voice Chat",
        description: "Select an option:",
        option1: "Enable Voice Chat",
        option2: "Disable Voice Chat",
    },
    es_ES: {
        title: "Chat de Voz",
        description: "Selecciona una opción:",
        option1: "Activar Chat de Voz",
        option2: "Desactivar Chat de Voz",
    },
};

// Frases por personaje con identificadores de sonido
const characterPhrases = {
    Character_Couch: {
        en_US: [
            { text: "Take this!", sound: "Couch.AlertGiveItem_en" },
            { text: "Follow me!", sound: "Couch.FollowMe_en" },
            { text: "Don't shoot me!", sound: "Couch.FriendlyFire_en" },
            { text: "I'm hurt!", sound: "Couch.GettingRevived_en" },
            { text: "Is everyone ready?", sound: "Couch.AskReady_en" },
            { text: "Back up!", sound: "Couch.BackUp_en" },
            { text: "Battle cry!", sound: "Couch.BattleCry_en" },
            { text: "Help!", sound: "Couch.CallForRescue_en" },
            { text: "Close the door!", sound: "Couch.CloseTheDoor_en" },
            { text: "Cover me!", sound: "Couch.CoverMe_en" },
            { text: "Yes!", sound: "Couch.Yes_en" },
            { text: "I'm going to die...", sound: "Couch.GoingToDie_en" },
            { text: "Grenade!", sound: "Couch.Grenade_en" },
            { text: "I'll heal you!", sound: "Couch.HealOther_en" },
            { text: "Help!", sound: "Couch.Help_en" },
            { text: "Hurrah!", sound: "Couch.Hurrah_en" },
            { text: "Hurry up!", sound: "Couch.HurryUp_en" },
            { text: "Haha!", sound: "Couch.Laughter01_en" },
            { text: "Look out!", sound: "Couch.LookOut_en" },
            { text: "Look!", sound: "Couch.Look_en" },
            { text: "Let's move on!", sound: "Couch.MoveOn_en" },
            { text: "No!", sound: "Couch.No_en" },
            { text: "Nice job!", sound: "Couch.NiceJob_en" },
            { text: "Stay together!", sound: "Couch.StayTogether_en" },
            { text: "Thanks!", sound: "Couch.Thanks_en" },
            { text: "Run!", sound: "Couch.YellRun_en" },
        ],
        es_ES: [
            { text: "¡Toma!", sound: "Couch.AlertGiveItem_es" },
            { text: "¡Sígueme!", sound: "Couch.FollowMe_es" },
            { text: "¡No me dispares!", sound: "Couch.FriendlyFire_es" },
            { text: "¡Estoy herido!", sound: "Couch.GettingRevived_es" },
            { text: "¿Todos listos?", sound: "Couch.AskReady_es" },
            { text: "¡Atrás!", sound: "Couch.BackUp_es" },
            { text: "¡Grito de batalla!", sound: "Couch.BattleCry_es" },
            { text: "¡Eh... ayuda!?", sound: "Couch.CallForRescue_es" },
            { text: "¡Cierra la puerta!", sound: "Couch.CloseTheDoor_es" },
            { text: "¡Cúbreme!", sound: "Couch.CoverMe_es" },
            { text: "¡Sí!", sound: "Couch.Yes_es" },
            { text: "Voy a morir...", sound: "Couch.GoingToDie_es" },
            { text: "¡Granada!", sound: "Couch.Grenade_es" },
            { text: "¡Te curaré!", sound: "Couch.HealOther_es" },
            { text: "¡Ayuda!", sound: "Couch.Help_es" },
            { text: "¡Hurrah!", sound: "Couch.Hurrah_es" },
            { text: "¡A levantarse!", sound: "Couch.HurryUp_es" },
            { text: "¡Jajaja!", sound: "Couch.Laughter01_es" },
            { text: "¡Atención!", sound: "Couch.LookOut_es" },
            { text: "¡Mira!", sound: "Couch.Look_es" },
            { text: "¡Ya vámonos!", sound: "Couch.MoveOn_es" },
            { text: "¡No!", sound: "Couch.No_es" },
            { text: "¡Buen trabajo!", sound: "Couch.NiceJob_es" },
            { text: "¡Estemos juntos!", sound: "Couch.StayTogether_es" },
            { text: "¡Gracias!", sound: "Couch.Thanks_es" },
            { text: "¡A correr!", sound: "Couch.YellRun_es" },
        ],
    },
    Character_Ellis: {
        en_US: [
            { text: "I'll give you something!", sound: "Ellis.AlertGiveItem_en" },
            { text: "Stop, I'll give you something!", sound: "Ellis.AlertGiveItemStop_en" },
            { text: "Why are you shooting me?", sound: "Ellis.FriendlyFire_en" },
            { text: "Thanks for reviving me!", sound: "Ellis.GettingRevived_en" },
            { text: "I'm about to die!", sound: "Ellis.GoingToDie_en" },
            { text: "Throwing grenade!", sound: "Ellis.Grenade_en" },
            { text: "I'll heal you!", sound: "Ellis.HealOther_en" },
            { text: "Help!", sound: "Ellis.Help_en" },
            { text: "Hurrah!", sound: "Ellis.Hurrah_en" },
            { text: "Is everyone ready?", sound: "Ellis.AskReady_en" },
            { text: "Back up!", sound: "Ellis.BackUp_en" },
            { text: "Let's go back...", sound: "Ellis.BackUpQuiet_en" },
            { text: "Battle cry!", sound: "Ellis.BattleCry_en" },
            { text: "Maybe I need help...", sound: "Ellis.CallForRescue_en" },
            { text: "Close the door!", sound: "Ellis.CloseTheDoor01_en" },
            { text: "Cover me!", sound: "Ellis.CoverMe_en" },
            { text: "GO!", sound: "Ellis.EmphaticGo_en" },
            { text: "Let's go...", sound: "Ellis.EmphaticGoQuiet_en" },
            { text: "Follow me!", sound: "Ellis.FollowMe_en" },
            { text: "I've been incapacitated!", sound: "Ellis.IncapacitatedInitial_en" },
            { text: "They're coming!", sound: "Ellis.Incoming_en" },
            { text: "Haha!", sound: "Ellis.Laughter_en" },
            { text: "Look!", sound: "Ellis.Look_en" },
            { text: "Look here!", sound: "Ellis.LookHere_en" },
            { text: "Let's move on!", sound: "Ellis.MoveOn_en" },
            { text: "Nice job!", sound: "Ellis.NiceJob_en" },
            { text: "No!", sound: "Ellis.No_en" },
            { text: "I'll revive you!", sound: "Ellis.ReviveFriend_en" },
            { text: "Run!", sound: "Ellis.YellRun_en" },
            { text: "Yes!", sound: "Ellis.Yes_en" },
            { text: "You're welcome!", sound: "Ellis.YouAreWelcome_en" },
        ],
        es_ES: [
            { text: "¡Te daré algo!", sound: "Ellis.AlertGiveItem_es" },
            { text: "¡Alto, te daré algo!", sound: "Ellis.AlertGiveItemStop_es" },
            { text: "¿Por qué me disparas?", sound: "Ellis.FriendlyFire_es" },
            { text: "¡Gracias por revivirme!", sound: "Ellis.GettingRevived_es" },
            { text: "¡Estoy a punto de morir!", sound: "Ellis.GoingToDie_es" },
            { text: "¡Lanzo granada!", sound: "Ellis.Grenade_es" },
            { text: "¡Te voy a curar!", sound: "Ellis.HealOther_es" },
            { text: "¡Ayuda!", sound: "Ellis.Help_es" },
            { text: "¡Hurrah!", sound: "Ellis.Hurrah_es" },
            { text: "¿Todos listos?", sound: "Ellis.AskReady_es" },
            { text: "¡Retrocedan!", sound: "Ellis.BackUp_es" },
            { text: "Hay que volver...", sound: "Ellis.BackUpQuiet_es" },
            { text: "¡Grito de batalla!", sound: "Ellis.BattleCry_es" },
            { text: "Tal vez necesito ayuda...", sound: "Ellis.CallForRescue_es" },
            { text: "¡Cierra la puerta!", sound: "Ellis.CloseTheDoor01_es" },
            { text: "¡Cúbreme!", sound: "Ellis.CoverMe_es" },
            { text: "¡VAMOS!", sound: "Ellis.EmphaticGo_es" },
            { text: "vamos...", sound: "Ellis.EmphaticGoQuiet_es" },
            { text: "¡Síganme!", sound: "Ellis.FollowMe_es" },
            { text: "¡Me han incapacitado!", sound: "Ellis.IncapacitatedInitial_es" },
            { text: "¡Ya vienen!", sound: "Ellis.Incoming_es" },
            { text: "¡Jajaja!", sound: "Ellis.Laughter_es" },
            { text: "¡Mira!", sound: "Ellis.Look_es" },
            { text: "¡Mira aquí!", sound: "Ellis.LookHere_es" },
            { text: "¡Sigamos!", sound: "Ellis.MoveOn_es" },
            { text: "¡Bien hecho!", sound: "Ellis.NiceJob_es" },
            { text: "¡No!", sound: "Ellis.No_es" },
            { text: "¡Ya voy a revivirte!", sound: "Ellis.ReviveFriend_es" },
            { text: "¡A correr!", sound: "Ellis.YellRun_es" },
            { text: "¡Sí!", sound: "Ellis.Yes_es" },
            { text: "¡Bienvenido!", sound: "Ellis.YouAreWelcome_es" },
        ],
    },    
    Character_Roushell: {
        en_US: [
            { text: "Take this!", sound: "Rocell.AlertGiveItem_en" },
            { text: "Is everyone ready?", sound: "Rocell.AskReady_en" },
            { text: "Back up!", sound: "Rocell.BackUp_en" },
            { text: "Fall back...", sound: "Rocell.BackUpQuiet_en" },
            { text: "Battle cry!", sound: "Rocell.BattleCry_en" },
            { text: "Close the door!", sound: "Rocell.CloseTheDoor_en" },
            { text: "Could you help me?...", sound: "Rocell.CallForRescue_en" },
            { text: "Cover me!", sound: "Rocell.CoverMe_en" },
            { text: "Follow me!", sound: "Rocell.FollowMe_en" },
            { text: "Why are you shooting me?!", sound: "Rocell.FriendlyFire_en" },
            { text: "Is it serious?", sound: "Rocell.GettingRevived_en" },
            { text: "I'm about to die", sound: "Rocell.GoingToDie_en" },
            { text: "You're welcome!", sound: "Rocell.YouAreWelcome_en" },
            { text: "Grenade!", sound: "Rocell.Grenade_en" },
            { text: "I'll heal you!", sound: "Rocell.HealOther_en" },
            { text: "Help!", sound: "Rocell.Help_en" },
            { text: "Hurrah!", sound: "Rocell.Hurrah_en" },
            { text: "I've been incapacitated!", sound: "Rocell.IncapacitatedInitial_en" },
            { text: "Haha!", sound: "Rocell.Laughter_en" },
            { text: "They're coming!", sound: "Rocell.Incoming_en" },
            { text: "Look!", sound: "Rocell.Look_en" },
            { text: "You lead the way", sound: "Rocell.LeadOn_en" },
            { text: "Nice job!", sound: "Rocell.NiceJob_en" },
            { text: "Look here!", sound: "Rocell.LookHere_en" },
            { text: "No!", sound: "Rocell.No_en" },
            { text: "I'll revive you!", sound: "Rocell.ReviveFriend_en" },
            { text: "Stay together!", sound: "Rocell.StayTogether_en" },
            { text: "Sorry", sound: "Rocell.Sorry_en" },
            { text: "You should heal", sound: "Rocell.SuggestHealth_en" },
            { text: "Thanks!", sound: "Rocell.Thanks_en" },
            { text: "Run!", sound: "Rocell.YellRun_en" },
            { text: "Wait here", sound: "Rocell.WaitHere_en" },
            { text: "Yes!", sound: "Rocell.Yes_en" },
        ],
        es_ES: [
            { text: "¡Toma esto!", sound: "Rocell.AlertGiveItem_es" },
            { text: "¿Todos listos?", sound: "Rocell.AskReady_es" },
            { text: "¡Atrás!", sound: "Rocell.BackUp_es" },
            { text: "Retrocedan...", sound: "Rocell.BackUpQuiet_es" },
            { text: "¡Grito de batalla!", sound: "Rocell.BattleCry_es" },
            { text: "¡Cierren la puerta!", sound: "Rocell.CloseTheDoor_es" },
            { text: "¿Podrían ayudarme?...", sound: "Rocell.CallForRescue_es" },
            { text: "¡Cúbreme!", sound: "Rocell.CoverMe_es" },
            { text: "¡Síganme!", sound: "Rocell.FollowMe_es" },
            { text: "¿Por qué me disparas?!", sound: "Rocell.FriendlyFire_es" },
            { text: "¿Es grave?", sound: "Rocell.GettingRevived_es" },
            { text: "Estoy a punto de morir", sound: "Rocell.GoingToDie_es" },
            { text: "¡Bienvenido!", sound: "Rocell.YouAreWelcome_es" },
            { text: "¡Granada!", sound: "Rocell.Grenade_es" },
            { text: "¡Te curo!", sound: "Rocell.HealOther_es" },
            { text: "¡Ayuda!", sound: "Rocell.Help_es" },
            { text: "¡Hurrah!", sound: "Rocell.Hurrah_es" },
            { text: "¡Me incapacitaron!", sound: "Rocell.IncapacitatedInitial_es" },
            { text: "¡Jajajaja!", sound: "Rocell.Laughter_es" },
            { text: "¡Allí vienen!", sound: "Rocell.Incoming_es" },
            { text: "¡Miren!", sound: "Rocell.Look_es" },
            { text: "Tú anda adelante", sound: "Rocell.LeadOn_es" },
            { text: "¡Bien hecho!", sound: "Rocell.NiceJob_es" },
            { text: "¡Miren aquí!", sound: "Rocell.LookHere_es" },
            { text: "¡No!", sound: "Rocell.No_es" },
            { text: "¡Te reviviré!", sound: "Rocell.ReviveFriend_es" },
            { text: "¡Estemos juntos!", sound: "Rocell.StayTogether_es" },
            { text: "Perdón", sound: "Rocell.Sorry_es" },
            { text: "Deberías curarte", sound: "Rocell.SuggestHealth_es" },
            { text: "¡Gracias!", sound: "Rocell.Thanks_es" },
            { text: "¡A correr!", sound: "Rocell.YellRun_es" },
            { text: "¡Esperen!", sound: "Rocell.WaitHere_es" },
            { text: "¡Sí!", sound: "Rocell.Yes_es" },
        ],
    },
    Character_Nick: {
        en_US: [
            { text: "Take this!", sound: "Nick.AlertGiveItem_en" },
            { text: "Is everyone ready?", sound: "Nick.AskReady_en" },
            { text: "Could you help me?", sound: "Nick.CallForRescue_en" },
            { text: "Battle cry!", sound: "Nick.BattleCry_en" },
            { text: "Close the door!", sound: "Nick.CloseTheDoor_en" },
            { text: "Cover me!", sound: "Nick.CoverMe_en" },
            { text: "GO!", sound: "Nick.EmphaticGo_en" },
            { text: "Don't shoot me!", sound: "Nick.FriendlyFire_en" },
            { text: "Follow me!", sound: "Nick.FollowMe_en" },
            { text: "Thanks for reviving me!", sound: "Nick.GettingRevived_en" },
            { text: "I'll heal you!", sound: "Nick.HealOther_en" },
            { text: "I'm about to die!", sound: "Nick.GoingToDie_en" },
            { text: "Hurrah!", sound: "Nick.Hurrah_en" },
            { text: "Help!", sound: "Nick.Help_en" },
            { text: "Hurry up!", sound: "Nick.HurryUp_en" },
            { text: "I've been incapacitated!", sound: "Nick.IncapacitatedInitial_en" },
            { text: "They're coming!", sound: "Nick.Incoming_en" },
            { text: "Look!", sound: "Nick.Look_en" },
            { text: "Haha!", sound: "Nick.Laughter_en" },
            { text: "Look here!", sound: "Nick.LookHere_en" },
            { text: "Nice job!", sound: "Nick.NiceJob_en" },
            { text: "No!", sound: "Nick.No_en" },
            { text: "Yes!", sound: "Nick.Yes_en" },
            { text: "I'll revive you!", sound: "Nick.ReviveFriend_en" },
            { text: "Sorry!", sound: "Nick.Sorry_en" },
            { text: "Stay together!", sound: "Nick.StayTogether_en" },
            { text: "Everyone inside!", sound: "Nick.StayTogetherInside_en" },
            { text: "Thanks!", sound: "Nick.Thanks_en" },
            { text: "You should heal.", sound: "Nick.SuggestHealth_en" },
            { text: "Almost there...", sound: "Nick.TransitionClose_en" },
            { text: "You're welcome!", sound: "Nick.YouAreWelcome_en" },
            { text: "Run!", sound: "Nick.YellRun_en" },
        ],
        es_ES: [
            { text: "¡Toma esto!", sound: "Nick.AlertGiveItem_es" },
            { text: "¿Listos todos?", sound: "Nick.AskReady_es" },
            { text: "¿Podrían ayudarme?", sound: "Nick.CallForRescue_es" },
            { text: "¡Grito de batalla!", sound: "Nick.BattleCry_es" },
            { text: "¡Cierren la puerta!", sound: "Nick.CloseTheDoor_es" },
            { text: "¡Cúbranme!", sound: "Nick.CoverMe_es" },
            { text: "¡YA!", sound: "Nick_EmphaticGo_es" },
            { text: "¡NO ME DISPARES!", sound: "Nick.FriendlyFire_es" },
            { text: "¡Síganme!", sound: "Nick.FollowMe_es" },
            { text: "¡Gracias por revivirme!", sound: "Nick.GettingRevived_es" },
            { text: "¡Te voy a curar!", sound: "Nick.HealOther_es" },
            { text: "¡Estoy a punto de morir!", sound: "Nick.GoingToDie_es" },
            { text: "¡Hurrah!", sound: "Nick.Hurrah_es" },
            { text: "¡Ayuda!", sound: "Nick.Help_es" },
            { text: "¡Arriba!", sound: "Nick.HurryUp_es" },
            { text: "¡Me han tumbado!", sound: "Nick.IncapacitatedInitial_es" },
            { text: "¡Ahí vienen!", sound: "Nick.Incoming_es" },
            { text: "¡Miren!", sound: "Nick.Look_es" },
            { text: "¡Jajaja!", sound: "Nick.Laughter_es" },
            { text: "¡Miren aquí!", sound: "Nick.LookHere_es" },
            { text: "¡Buen trabajo!", sound: "Nick.NiceJob_es" },
            { text: "¡No!", sound: "Nick.No_es" },
            { text: "¡Sí!", sound: "Nick.Yes_es" },
            { text: "¡Te voy a revivir!", sound: "Nick.ReviveFriend_es" },
            { text: "¡Perdón!", sound: "Nick.Sorry_es" },
            { text: "¡Estemos juntos!", sound: "Nick.StayTogether_es" },
            { text: "¡Entren todos!", sound: "Nick.StayTogetherInside_es" },
            { text: "¡Gracias!", sound: "Nick.Thanks_es" },
            { text: "¡Deberías curarte!", sound: "Nick.SuggestHealth_es" },
            { text: "¡Casi llegamos!", sound: "Nick.TransitionClose_es" },
            { text: "¡Bienvenido!", sound: "Nick.YouAreWelcome_es" },
            { text: "¡Corran!", sound: "Nick.YellRun_es" },
        ],
    },
};

// Función para obtener el idioma del jugador
function getPlayerLanguage(player) {
    if (player.hasTag("lang_es_ES")) return "es_ES";
    return "en_US"; // Idioma predeterminado
}

// Función para mostrar frases del personaje
function mostrarFrasesPersonaje(player) {
    const lang = getPlayerLanguage(player);
    let characterTag = null;

    // Determinar el personaje seleccionado
    if (player.hasTag("Character_Couch")) characterTag = "Character_Couch";
    else if (player.hasTag("Character_Ellis")) characterTag = "Character_Ellis";
    else if (player.hasTag("Character_Roushell")) characterTag = "Character_Roushell";
    else if (player.hasTag("Character_Nick")) characterTag = "Character_Nick";

    if (!characterTag) {
        player.sendMessage(lang === "es_ES" ? "§cNo tienes un personaje seleccionado." : "§cYou don't have a character selected.");
        return;
    }

    const phrases = characterPhrases[characterTag][lang] || [];

    const form = new ActionFormData()
        .title(lang === "es_ES" ? "Frases del Personaje" : "Character Phrases")
        .body(lang === "es_ES" ? "Selecciona una frase para decir:" : "Select a phrase to say:");

    phrases.forEach((phrase) => {
        form.button(phrase.text, "textures/ui/sound_glyph_color_2x.png");
    });

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage(lang === "es_ES" ? "§cHas cerrado el menú de frases." : "§cYou closed the phrases menu.");
            return;
        }

        const selectedPhrase = phrases[response.selection];
        if (selectedPhrase) {
            // Reproducir el sonido asociado a la frase seleccionada
            player.runCommand(`playsound ${selectedPhrase.sound}`);
        }
    });
}

// Evento para abrir el menú de frases al usar un ítem específico
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;

    if (event.itemStack.typeId === "tz:radio_vc") {
        system.run(() => mostrarFrasesPersonaje(player));
    }
});