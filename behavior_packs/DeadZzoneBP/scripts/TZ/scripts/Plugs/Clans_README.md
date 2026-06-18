# Sistema Avanzado de Equipos y Clanes

## 🚀 Nuevas Características Implementadas

### 1. **Sistema de Protección Mejorado**
- ✅ **Protección contra fuego amigo**: Los miembros del mismo equipo/clan no pueden dañarse entre sí
- ✅ **Protección entre aliados**: Los clanes aliados no pueden dañarse mutuamente
- ✅ **Configuración personalizable**: Los líderes pueden activar/desactivar el fuego amigo
- ✅ **Curación automática**: Restaura la salud inmediatamente después del daño no permitido

### 2. **Sistema de Visualización de Clanes**
- ✅ **Etiquetas en nombres**: Muestra el clan/equipo arriba del nombre del jugador
- ✅ **Rangos visuales**: Diferentes símbolos para líderes, oficiales y miembros
  - 🌟 **Líder**: §6★§r (estrella dorada)
  - 💎 **Oficial**: §a◆§r (diamante verde) - Solo clanes
  - 🔘 **Miembro**: §7●§r (círculo gris)
- ✅ **Colores distintivos**: 
  - Clanes: §b[NombreClan]§r (azul)
  - Equipos: §e[NombreEquipo]§r (amarillo)

### 3. **Sistema de Rangos (Solo Clanes)**
- ✅ **Líder**: Control total del clan
- ✅ **Oficiales**: Pueden gestionar solicitudes y algunas funciones administrativas
- ✅ **Miembros**: Participación básica en el clan
- ✅ **Promoción/Degradación**: Los líderes pueden cambiar rangos

### 4. **Sistema de Alianzas y Guerras**
- ✅ **Alianzas**: Los clanes pueden formar alianzas
- ✅ **Guerras**: Declaración de guerra entre clanes
- ✅ **Protección diplomática**: Los aliados no pueden dañarse
- ✅ **Gestión de relaciones**: Romper alianzas y firmar la paz

### 5. **Sistema de Experiencia y Niveles**
- ✅ **XP por kills**: Los clanes ganan experiencia por eliminar enemigos
- ✅ **Sistema de niveles**: Los clanes suben de nivel con la experiencia
- ✅ **Notificaciones**: Todos los miembros son notificados al subir de nivel

### 6. **Estadísticas Avanzadas**
- ✅ **Estadísticas de combate**: Kills, muertes, victorias, derrotas
- ✅ **Ratio K/D**: Cálculo automático del ratio kill/death
- ✅ **Información diplomática**: Número de aliados y enemigos
- ✅ **Información general**: Nivel, experiencia, miembros, fecha de creación

### 7. **Configuraciones Personalizables**
- ✅ **Fuego amigo**: Activar/desactivar daño entre miembros
- ✅ **Invitaciones**: Permitir o no invitaciones automáticas
- ✅ **Visibilidad de etiquetas**: Mostrar u ocultar el clan en el nombre
- ✅ **Privacidad**: Clanes públicos o privados

## 📋 Estructura de Datos Mejorada

```javascript
{
  name: string,              // Nombre del clan/equipo
  type: "team" | "clan",     // Tipo de organización
  members: string[],         // Lista de miembros
  leader: string,            // Líder del clan/equipo
  officers: string[],        // Oficiales (solo clanes)
  description: string,       // Descripción
  isPrivate: boolean,        // Si es privado o público
  applications: [],          // Solicitudes pendientes
  maxMembers: number,        // Máximo de miembros
  createdAt: string,         // Fecha de creación
  tag: string,              // Etiqueta única
  level: number,            // Nivel del clan
  experience: number,       // Experiencia acumulada
  bank: number,             // Banco del clan (solo clanes)
  allies: string[],         // Clanes aliados
  enemies: string[],        // Clanes enemigos
  stats: {                  // Estadísticas
    kills: number,
    deaths: number,
    wins: number,
    losses: number
  },
  settings: {               // Configuraciones
    friendlyFire: boolean,
    allowInvites: boolean,
    showTag: boolean
  }
}
```

## 🎮 Funciones Principales

### Para Jugadores:
- `showTeamsClansMenu(player)` - Menú principal
- `showTeamMenu(player)` - Gestión de equipos
- `showClanMenu(player)` - Gestión de clanes

### Para Administradores:
- `giveClanExperience(clanName, amount)` - Dar XP a un clan
- `getClanInfo(clanName)` - Obtener información de un clan
- `areAllies(player1, player2)` - Verificar si son aliados
- `areEnemies(player1, player2)` - Verificar si son enemigos

## 🔧 Eventos Implementados

1. **Protección contra daño**: `world.afterEvents.entityHurt` (con curación automática)
2. **Sistema de XP**: `world.afterEvents.entityDie`
3. **Actualización de nombres**: `system.runInterval`
4. **Menú automático**: `world.afterEvents.itemUse` (Nether Star)
5. **Spawn automático**: `world.afterEvents.playerSpawn`

## 🎯 Diferencias entre Equipos y Clanes

### Equipos:
- Máximo 6 miembros
- Solo líder y miembros
- Sin sistema de alianzas/guerras
- Sin banco
- Funcionalidad básica

### Clanes:
- Máximo 30 miembros
- Sistema de rangos (líder, oficiales, miembros)
- Sistema de alianzas y guerras
- Banco del clan
- Sistema de experiencia y niveles
- Estadísticas avanzadas

## 🚀 Cómo Usar

1. **Crear un clan/equipo**: Usa el menú principal
2. **Invitar miembros**: Los jugadores pueden solicitar unirse
3. **Gestionar rangos**: Los líderes pueden promover oficiales
4. **Formar alianzas**: Proponer alianzas con otros clanes
5. **Declarar guerras**: Establecer rivalidades
6. **Ver estadísticas**: Revisar el progreso del clan

## 🔒 Permisos

- **Líder**: Control total
- **Oficial** (solo clanes): Gestionar solicitudes, alianzas y guerras
- **Miembro**: Participación básica
- **Acceso a clanes**: Requiere tag `clan_access`

## 🎨 Colores y Símbolos

- **Clanes**: §b (azul claro)
- **Equipos**: §e (amarillo)
- **Líder**: §6★ (estrella dorada)
- **Oficial**: §a◆ (diamante verde)
- **Miembro**: §7● (círculo gris)
- **Aliados**: §a (verde)
- **Enemigos**: §c (rojo)
- **Experiencia**: §e (amarillo)
- **Nivel**: §6 (dorado)

¡El sistema está completamente funcional y listo para usar! 🎉
## 🔧
 Notas Técnicas

### Sistema de Protección contra Daño
Debido a las limitaciones de la API de Minecraft Bedrock, no existe un evento `beforeEvents` que permita cancelar el daño antes de que ocurra. Por esta razón, el sistema utiliza:

1. **`world.afterEvents.entityHurt`**: Detecta cuando un jugador recibe daño
2. **Curación automática**: Si el daño no está permitido (mismo clan/equipo o aliados), restaura inmediatamente la salud perdida
3. **Límites de seguridad**: La curación no puede exceder la salud máxima del jugador
4. **Manejo de errores**: Incluye try-catch para evitar crashes si hay problemas con el componente de salud

### Compatibilidad
- **Versión mínima**: Minecraft Bedrock 1.20.0+
- **API requerida**: `@minecraft/server` 1.9.0+
- **Funciona con**: Versión actual 1.15.0-beta

### Rendimiento
- El sistema está optimizado para minimizar el impacto en el rendimiento
- Los eventos solo se procesan cuando involucran jugadores
- Las consultas a la base de datos se realizan solo cuando es necesario
- La actualización de nametags se ejecuta cada 2 segundos para reducir la carga

¡El sistema está completamente funcional y optimizado para uso en servidores! 🚀