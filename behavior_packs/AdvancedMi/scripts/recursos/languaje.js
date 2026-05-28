import { API_CONFIG } from "../config/main";
import { world } from "@minecraft/server";
import { traducciones ,Control_idioma} from "../ui/missionUi";
export const obtenerTraducciones = (idioma) => API_CONFIG.IDIOMA[idioma] || API_CONFIG.IDIOMA.espaniol;
const idioma = world.getDynamicProperty('idioma')

export function alerta_idioma() {
    switch (Control_idioma) {
        case 'espaniol':
            return traducciones.mensajesIdioma.espaniol
            break;
        case 'english':
            return traducciones.mensajesIdioma.english
            break;
        case 'portugues':
            return traducciones.mensajesIdioma.portugues
            break;
    }
}