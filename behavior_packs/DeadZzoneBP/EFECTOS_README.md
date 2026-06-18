# 🎨 Tienda de Efectos - Sistema Completo

## 📋 Descripción
Sistema completo de tienda de efectos de partículas para jugadores con soporte multiidioma (Español/Inglés), sistema de compra con gemas y dinero, y efectos visuales únicos.

## ✨ Características Principales

### 🛒 Sistema de Compra
- **Doble moneda**: Compra con gemas (rubies) o dinero (coins)
- **Precios balanceados**: Cada efecto tiene precios diferentes según su rareza
- **Verificación de recursos**: El sistema verifica que tengas suficientes recursos antes de comprar

### 🎭 Efectos Disponibles

#### 🌟 Efectos Básicos (50-100 gemas)
1. **Partículas al Caminar** - Rastro mágico mientras caminas
2. **Corazones Flotantes** - Corazones que flotan alrededor tuyo
3. **Gotas de Agua** - Gotas cristalinas que caen constantemente
4. **Humo Oscuro** - Humo negro emanando de tu cuerpo

#### ⚡ Efectos Intermedios (75-150 gemas)
5. **Aura Circular** - Círculo de partículas constante
6. **Cristales de Hielo** - Cristales flotando a tu alrededor
7. **Pétalos de Cerezo** - Hermosos pétalos rosados cayendo
8. **Nube Tóxica** - Nube venenosa que te sigue
9. **Destellos Dorados** - Partículas doradas brillantes
10. **Polvo de Estrellas** - Polvo estelar flotante

#### 🔥 Efectos Avanzados (100-200 gemas)
11. **Pies de Fuego** - Círculo de fuego en tus pies
12. **Rastro Arcoíris** - Hermoso rastro multicolor
13. **Aura de Rayo** - Chispas eléctricas danzantes
14. **Llamas del Alma** - Llamas espectrales azules
15. **Gotas de Sangre** - Efecto gótico de sangre

#### 🐉 Efectos Épicos (220-300 gemas)
16. **Espiral Mágica** - Portal mágico giratorio
17. **Energía del Vacío** - Energía oscura del End
18. **Aliento de Dragón** - Partículas de dragón épicas

## 🎮 Cómo Usar

### Para Jugadores
1. **Acceder**: Usa el teléfono UI → Personaje → Efectos
2. **Comprar**: Selecciona un efecto y elige pagar con gemas o dinero
3. **Equipar**: Una vez comprado, puedes equipar/desequipar el efecto
4. **Limitación**: Solo puedes tener un efecto equipado a la vez

### Para Administradores
#### Comandos Disponibles:
```
!giveresources <jugador> <gemas> <dinero>
!reseteffects <jugador>
!giveeffect <jugador> <efecto>
!givealleffects <jugador>
!effecthelp / !ayudaefectos
```

#### Ejemplos:
```
!giveresources Steve 500 10000
!giveeffect Alex dragon_breath
!givealleffects Notch
!reseteffects Steve
```

#### Funciones Exportadas (para otros scripts):
```javascript
import { givePlayerResources, resetPlayerEffects, giveAllEffects } from "./EffectShop.js";

// Dar recursos
givePlayerResources(player, 100, 5000);

// Resetear efectos
resetPlayerEffects(player);

// Dar todos los efectos
giveAllEffects(player);
```

## 🌍 Soporte Multiidioma

### Español
- Interfaz completamente traducida
- Descripciones detalladas de cada efecto
- Mensajes de confirmación y error

### English
- Full English interface support
- Detailed effect descriptions
- Confirmation and error messages

## 🔧 Configuración Técnica

### Archivos Principales
- `scripts/TZ/scripts/Plugs/EffectShop.js` - Sistema principal
- `scripts/TZ/scripts/UI/UiGeneral.js` - Integración con UI

### Propiedades del Jugador
- `player_rubies` - Gemas del jugador
- `player_money` - Dinero del jugador
- `effect_owned_<efecto>` - Tags de efectos poseídos
- `effect_equipped_<efecto>` - Tag del efecto equipado

### Sistema de Partículas
- Ejecuta cada 10 ticks (0.5 segundos)
- Efectos optimizados para rendimiento
- Patrones únicos para cada efecto

## 🎨 Efectos Visuales Detallados

### Patrones de Movimiento
- **Círculos**: Aura Circular, Pies de Fuego
- **Espirales**: Espiral Mágica, Energía del Vacío
- **Lluvia**: Pétalos de Cerezo, Gotas de Agua, Gotas de Sangre
- **Aleatorio**: Polvo de Estrellas, Destellos Dorados
- **Seguimiento**: Rastro Arcoíris, Partículas al Caminar

### Colores y Temas
- **Fuego**: Rojo/Naranja (Pies de Fuego, Aliento de Dragón)
- **Hielo**: Azul/Blanco (Cristales de Hielo, Llamas del Alma)
- **Naturaleza**: Verde/Rosa (Pétalos de Cerezo, Nube Tóxica)
- **Mágico**: Púrpura/Dorado (Espiral Mágica, Destellos Dorados)
- **Oscuro**: Negro/Rojo (Humo Oscuro, Energía del Vacío)

## 💰 Sistema Económico

### Precios Balanceados
- **Efectos Básicos**: 50-100 gemas / 1000-2000 monedas
- **Efectos Intermedios**: 75-180 gemas / 1500-3600 monedas
- **Efectos Avanzados**: 100-250 gemas / 2000-5000 monedas
- **Efectos Épicos**: 220-300 gemas / 4400-6000 monedas

### Valores Iniciales (para pruebas)
- **Gemas**: 100 (inicial)
- **Dinero**: 5000 (inicial)

## 🔄 Actualizaciones Futuras

### Posibles Mejoras
1. **Efectos de Sonido**: Agregar sonidos únicos para cada efecto
2. **Efectos Combinados**: Permitir múltiples efectos simultáneos
3. **Efectos Temporales**: Efectos que duran un tiempo limitado
4. **Efectos de Temporada**: Efectos especiales para eventos
5. **Sistema de Rareza**: Clasificación por rareza con colores

### Nuevos Efectos Planeados
- **Tornado de Viento**: Efecto de viento giratorio
- **Lluvia de Meteoros**: Meteoros cayendo del cielo
- **Aura Angelical**: Luz divina y plumas
- **Sombras Danzantes**: Sombras que se mueven
- **Burbujas Flotantes**: Burbujas de jabón

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Efecto no aparece**: Verifica que esté equipado correctamente
2. **No puedo comprar**: Verifica que tengas suficientes recursos
3. **Efecto se ve mal**: Algunos efectos dependen de la versión de Minecraft

### Comandos de Debug
```
!effecthelp - Muestra ayuda y comandos disponibles
!giveresources <jugador> 1000 10000 - Da recursos para pruebas
```

## 📞 Soporte
Para reportar bugs o sugerir mejoras, contacta a los administradores del servidor.

---
*Sistema creado por Kiro AI - Versión 1.0*