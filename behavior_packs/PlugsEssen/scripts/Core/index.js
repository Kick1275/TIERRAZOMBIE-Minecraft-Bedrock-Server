/**
 * Core - Sistema centralizado de datos del jugador.
 *
 * Importar en cualquier plugin:
 *   import { PlayerDataManager, onDataChange, DataEvents } from "../Core/index.js";
 *
 * Ajustar la ruta relativa según la profundidad del archivo que importa:
 *   Desde scripts/Plugins/         →  "../Core/index.js"
 *   Desde scripts/Plugins/SubDir/  →  "../../Core/index.js"
 *   Desde scripts/               →  "./Core/index.js"
 */

export { PlayerDataManager }           from "./PlayerDataManager.js";
export { onDataChange, emitDataChange, DataEvents } from "./PlayerDataEvents.js";
export { resolvePlaceholders, registerRankResolver, registerJobResolver, registerServerNameResolver } from "./PlaceholderResolver.js";
