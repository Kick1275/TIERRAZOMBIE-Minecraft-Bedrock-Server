# 🛡️ Sistema de Protección Balística DeadZone + TACZ

## 📋 Descripción General

Este sistema integra completamente la armadura de DeadZone con el sistema de armas de TACZ, proporcionando protección balística realista basada en estándares reales de protección.

## 🔬 Investigación y Balanceo

### Niveles de Protección Balística (Estándares NIJ)

**Nivel I**: Protección básica contra fragmentos y calibres pequeños
- Reducción de daño: 10-30%
- Efectivo contra: Fragmentos, calibres .22

**Nivel IIA**: Protección contra pistolas de baja velocidad
- Reducción de daño: 30-50%
- Efectivo contra: 9mm, .40 S&W

**Nivel II**: Protección contra pistolas de alta velocidad
- Reducción de daño: 40-60%
- Efectivo contra: 9mm, .357 Magnum

**Nivel IIIA**: Protección contra pistolas de alto poder
- Reducción de daño: 60-75%
- Efectivo contra: .44 Magnum, 9mm SMG

**Nivel III**: Protección contra rifles
- Reducción de daño: 60-85%
- Efectivo contra: 7.62mm NATO, AK-47

**Nivel IV**: Protección contra munición perforante
- Reducción de daño: 80-90%
- Efectivo contra: .30-06 AP, .308 AP

## 🎯 Sistema de Balanceo

### Objetivos de Balanceo:
1. **Eliminar one-shots al cuerpo** con armadura adecuada
2. **Mantener headshots letales** pero reducir daño con cascos
3. **Crear progresión de armadura** significativa
4. **Balancear realismo vs jugabilidad**

### Multiplicadores de Daño por Tipo de Arma:

#### Pistolas (Daño Base: 6-16)
- Sin armadura: 100% daño
- Armadura suave: 70% daño
- Armadura balística: 30% daño
- Placas: 15% daño

#### SMGs (Daño Base: 3-6)
- Sin armadura: 100% daño
- Armadura suave: 75% daño
- Armadura balística: 40% daño
- Placas: 20% daño

#### Rifles (Daño Base: 5-9)
- Sin armadura: 100% daño
- Armadura suave: 90% daño
- Armadura balística: 70% daño
- Placas: 40% daño

#### Snipers (Daño Base: 42)
- Sin armadura: 100% daño
- Armadura suave: 95% daño
- Armadura balística: 80% daño
- Placas: 60% daño

#### Escopetas (Daño Base: 2-3 por perdigón)
- Sin armadura: 100% daño
- Armadura suave: 60% daño
- Armadura balística: 30% daño
- Placas: 15% daño

## 🎖️ Clasificación de Armadura por Protección

### 👕 Ropa Civil (0.2-1.5 protección)
**Ejemplos**: Camisetas, hoodies, chaquetas de cuero
**Protección**: Mínima, principalmente contra fragmentos
**Uso**: Inicio del juego, supervivencia básica

### 🎽 Chalecos Básicos (1-3 protección)
**Ejemplos**: Chalecos de caza, chalecos reflectivos
**Protección**: Nivel I-IIA
**Uso**: Protección temprana contra pistolas

### 🦺 Chalecos Tácticos (3-7 protección)
**Ejemplos**: Chalecos policiales, chalecos de combate
**Protección**: Nivel II-IIIA
**Uso**: Protección media contra SMGs y pistolas

### 🛡️ Chalecos con Placas (8-12 protección)
**Ejemplos**: Chalecos de placas militares
**Protección**: Nivel III-IV
**Uso**: Máxima protección contra rifles

### ⛑️ Cascos por Categoría

#### Cascos Básicos (0.3-2 protección)
- Gorras, beanies, cascos de trabajo
- Protección mínima contra fragmentos

#### Cascos Militares (4-6 protección)
- Cascos del ejército, cascos tácticos
- Protección contra pistolas y fragmentos

#### Cascos Balísticos (7-9 protección)
- Cascos FAST, cascos MICH
- Protección contra pistolas de alto poder

## 📊 Ejemplos de Supervivencia

### Escenario 1: Sin Armadura
- **AK-47 al cuerpo**: 9 daño = Muerte en 3 tiros
- **AWP al cuerpo**: 42 daño = Muerte en 1 tiro
- **Deagle headshot**: 32 daño = Muerte en 1 tiro

### Escenario 2: Chaleco Táctico + Casco Balístico
- **AK-47 al cuerpo**: 5.4 daño = Muerte en 4-5 tiros
- **AWP al cuerpo**: 33.6 daño = Muerte en 1 tiro
- **Deagle headshot**: 9.6 daño = Muerte en 3 tiros

### Escenario 3: Chaleco con Placas + Casco Balístico
- **AK-47 al cuerpo**: 3.6 daño = Muerte en 6-7 tiros
- **AWP al cuerpo**: 25.2 daño = Muerte en 1-2 tiros
- **Deagle headshot**: 4.8 daño = Muerte en 5 tiros

### Escenario 4: Equipo Completo (Placas + Casco + Pantalones)
- **AK-47 al cuerpo**: 2.7 daño = Muerte en 8-9 tiros
- **AWP al cuerpo**: 21 daño = Muerte en 2 tiros
- **Deagle headshot**: 3.6 daño = Muerte en 6 tiros

## 🔧 Implementación Técnica

### Sistema de Detección
```javascript
// Detección automática de armadura cada segundo
system.runInterval(() => {
    // Detectar items equipados
    // Aplicar tags de protección
    // Calcular protección total
}, 20);
```

### Cálculo de Daño
```javascript
function calculateBallisticDamage(baseDamage, weaponType, armorData, isHeadshot, penetration) {
    // 1. Determinar tipo de arma
    // 2. Aplicar multiplicador de armadura
    // 3. Calcular penetración
    // 4. Aplicar modificador de headshot
    // 5. Retornar daño final
}
```

### Tipos de Protección
- **soft**: Kevlar, tela balística
- **hard**: Placas cerámicas, acero
- **chainmail**: Malla metálica
- **ballistic**: Kevlar avanzado
- **tactical**: Sistemas modulares
- **plate**: Placas balísticas nivel IV

## 🎮 Impacto en el Gameplay

### Ventajas del Sistema:
1. **Progresión significativa**: Mejor armadura = mayor supervivencia
2. **Decisiones tácticas**: Elegir entre movilidad y protección
3. **Combate más largo**: Menos one-shots, más skill-based
4. **Realismo**: Basado en protección balística real
5. **Variedad**: 100+ piezas de armadura diferentes

### Balanceo de Armas:
- **Pistolas**: Efectivas contra armadura ligera
- **SMGs**: Buenas contra armadura media
- **Rifles**: Necesarios contra armadura pesada
- **Snipers**: Únicos capaces de penetrar placas
- **Escopetas**: Devastadoras a corta distancia

## 📈 Estadísticas de Protección

### Distribución de Armadura:
- **Nivel I-IIA**: 60% de items (fácil de encontrar)
- **Nivel II-IIIA**: 30% de items (moderadamente raro)
- **Nivel III-IV**: 10% de items (muy raro)

### TTK (Time to Kill) Objetivos:
- **Sin armadura**: 1-3 tiros
- **Armadura ligera**: 2-4 tiros
- **Armadura media**: 3-6 tiros
- **Armadura pesada**: 5-9 tiros

## 🛠️ Configuración y Ajustes

### Variables Ajustables:
```javascript
// Multiplicadores de protección por tipo
protectionMultipliers = {
    "soft": { "pistol": 0.7, "rifle": 0.9 },
    "plate": { "pistol": 0.15, "rifle": 0.4 }
};

// Penetración por arma
penetrationValues = {
    "pistol": 0.3,
    "rifle": 0.6,
    "sniper": 0.8
};
```

### Comandos de Debug:
```
/tag @s add armor_debug  # Mostrar valores de protección
/scoreboard players set @s armor_test 1  # Modo de prueba
```

## 🔄 Actualizaciones Futuras

### Planeadas:
1. **Durabilidad de armadura**: Degradación con uso
2. **Reparación**: Sistema de mantenimiento
3. **Modificaciones**: Attachments para armadura
4. **Efectos especiales**: Armadura con habilidades únicas
5. **Balanceo dinámico**: Ajustes basados en estadísticas

---

**Desarrollado por**: Kiro AI  
**Versión**: 1.0  
**Compatibilidad**: DeadZone 1.6.6+ & TACZ 0.41+  
**Fecha**: Noviembre 2024