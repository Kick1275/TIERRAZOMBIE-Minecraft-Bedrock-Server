# Fix: TypeError "not a function" en SecurityPr

## Problema Identificado

El error `TypeError: not a function` ocurría porque el código intentaba usar `player.runCommandAsync()`, un método que **NO existe** en la clase `Player` de la API de Minecraft Bedrock.

### Errores en el log:
```
[SecurityPr] Has runCommandAsync: undefined
[SecurityPr] Command error: TypeError: not a function
```

## Causa Raíz

En la API `@minecraft/server` de Minecraft Bedrock:

- La clase `Player` **NO tiene** métodos `runCommand()` o `runCommandAsync()`
- La clase `Dimension` **SÍ tiene** el método `runCommand()` (síncrono)
- Los comandos deben ejecutarse a través de `player.dimension.runCommand()`

## Solución Implementada

### Cambio 1: Función `showAddPlayerUI` (línea ~375-420)

**ANTES (incorrecto):**
```javascript
await selectedPlayer.runCommandAsync(
    `scoreboard players operation @s friendid = @e[type=rt:runa_proteccion,x=${protection.location.x},y=${protection.location.y},z=${protection.location.z},r=1] friendid`
);
await selectedPlayer.runCommandAsync("playsound random.levelup @s");
```

**DESPUÉS (correcto):**
```javascript
selectedPlayer.dimension.runCommand(
    `scoreboard players operation ${selectedPlayer.name} friendid = @e[type=rt:runa_proteccion,x=${protection.location.x},y=${protection.location.y},z=${protection.location.z},r=1] friendid`
);
selectedPlayer.dimension.runCommand(`playsound random.levelup @a[name="${selectedPlayer.name}"]`);
```

### Cambio 2: Función `showRemovePlayerUI` (línea ~440-470)

**ANTES (incorrecto):**
```javascript
await selectedPlayer.runCommandAsync("scoreboard players reset @s friendid");
```

**DESPUÉS (correcto):**
```javascript
selectedPlayer.dimension.runCommand(`scoreboard players reset ${selectedPlayer.name} friendid`);
```

## Cambios Importantes

1. **Método correcto**: `player.dimension.runCommand()` en lugar de `player.runCommandAsync()`
2. **Selector de jugador**: Usar el nombre del jugador (`${selectedPlayer.name}`) en lugar de `@s`, ya que el comando se ejecuta desde la dimensión, no desde el jugador
3. **Sincronía**: El método es síncrono, no requiere `await`
4. **Playsound**: Cambiar de `@s` a `@a[name="..."]` para seleccionar correctamente al jugador

## Documentación de Referencia

- [Dimension.runCommand()](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/dimension#runcommand) - Método correcto para ejecutar comandos
- [Player Class](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/player) - No tiene runCommand/runCommandAsync

## Resultado

Ahora el sistema de protección funciona correctamente:
- ✅ Agregar jugadores a la protección funciona
- ✅ Remover jugadores de la protección funciona
- ✅ No más errores "TypeError: not a function"
- ✅ Los comandos se ejecutan correctamente
