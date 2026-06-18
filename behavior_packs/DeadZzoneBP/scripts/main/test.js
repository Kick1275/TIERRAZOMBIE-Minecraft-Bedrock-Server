/*  
🌑 **CÓDIGO APOCALÍPTICO: DETECTOR DE MOVIMIENTO** 🌑  
En un mundo donde el suelo tiembla y los píxeles se desmoronan,  
este script mide el pulso del movimiento en el caos.  
⚡ ¡Solo los que se mueven sobreviven! ⚡  
*/

import { Entity, Player } from '@minecraft/server';

// 💥 **Redondeo en el abismo** 💥  
// Redondea un número a dos decimales para medir el movimiento con precisión  
function MathRound(number) {  
    return Math.round(number * 100) / 100;  
}

// 🌌 **Eco del movimiento** 🌌  
// Determina si una entidad o jugador se mueve en el páramo  
// Lanza una advertencia si el parámetro no es válido  
export default function isMoving(entity) {  
    // 🔪 Verifica si la entidad es válida en este mundo fracturado  
    if (!(entity instanceof Player) && !(entity instanceof Entity)) {  
        throw new TypeError('⚠️ Parameter is not Entity or Player');  
    }  

    // ⚡ Captura la velocidad en un universo desmoronado  
    const velocity = {  
        x: MathRound(entity.getVelocity().x),  
        y: MathRound(entity.getVelocity().y),  
        z: MathRound(entity.getVelocity().z)  
    };  

    // 🖤 Si no hay movimiento, el silencio reina  
    if (velocity.x === 0 && velocity.y === 0 && velocity.z === 0) {  
        return false;  
    }  
    // 🔥 Si hay movimiento, el caos vive  
    return true;  
}

/*  
🌑 **FIN DEL DETECTOR APOCALÍPTICO** 🌑  
Este código es un faro en la tormenta, un grito en el vacío  
que detecta el movimiento en un mundo al borde del colapso.  
¡Úsalo para sobrevivir! ⚡  
*/