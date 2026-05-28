import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";

/**
 * @class Un Formulario de Acción es una interfaz de usuario de prueba de juego simple que solo tiene botones.
 * @example const form = new OPActionF(); form.show(player);
 * @returns Muestra un formulario de acción simple.
 */
export class ForceAction {
    constructor() {
        this.form = new ActionFormData();
    }
    /**
     * @function setTitle Establece el título del formulario.
     * @param {string} text El texto del título.
     * @example .setTitle('¡Servidor!');
     * @returns {void}
     */
    setTitle(text) {
        this.form.title(text);
    }
    /**
     * @function setBody Establece el contenido del formulario.
     * @param {string} text El texto del contenido.
     * @example .setBody('Inicia sesión para poder jugar en este servidor.');
     * @returns {void}
     */
    setBody(text) {
        this.form.body(text);
    }
    /**
     * @function addButton Agrega un botón al formulario.
     * @param {string} text El texto del botón.
     * @param {string} text La ruta del icono del botón. No es necesario para agregar un botón.
     * @example .addButton('¡Ok!', 'textures/UI/agree');
     * @returns {void}
     */
    addButton(text, iconPath) {
        this.form.button(text, iconPath ?? undefined);
    }
    /**
     * @function send Envía el formulario a un miembro.
     * @param {string} player El nombre del miembro al que se desea enviar el formulario.
     * @param callback Una función de flecha asíncrona que se ejecutará después de que se complete el formulario (no completamente si es un formulario de modelo).
     * @example .send(player, response => {
     *   if (response.selection === 0) {
     *     // Maneja el clic del botón 0
     *   } else if (response.selection === 1) {
     *     // Maneja el clic del botón 1
     *   }
     * });
     * @returns {void}
     */
    send(player, callback) {
        this.forceShow(player).then((res) => {
            if (!callback) return;
            callback(res, player);
        }).catch((err) => console.warn(err));
    }
    /**
    * @function forceShow Muestra el formulario al jugador y continúa mostrándolo hasta que se reciba una respuesta válida.
    * @param {string} player El nombre del jugador al que se le mostrará el formulario.
    * @param {FormData} form El formulario que se mostrará.
    * @returns {Promise<FormDataResponse>} Una promesa que se resuelve con los datos de respuesta cuando se complete el formulario.
    */
    async forceShow(player) {
        while (true) {
            const response = await this.form.show(player);
            if (response.cancelationReason !== "UserBusy") {
                return response;
            }
        }
    }
}
/**
 * @class Un Formulario Modal es una interfaz de usuario de prueba de juego un poco más avanzada que tiene deslizadores, campos de texto y mucho más, ¡PERO SIN BOTONES!
 * @example const vex = new OPModalF(); vex.show(player); o vex.show('gameza')
 * @returns Muestra un formulario ModalForm simple al jugador.
 */
export class ForceModal {
    constructor() {
        this.form = new ModalFormData();
    }
    /**
     * @function setTitle Establece el título del formulario.
     * @param {string} text El texto del título.
     * @example .setTitle('¡Servidor!');
     * @returns {void}
     */
    setTitle(text) {
        this.form.title(text);
    }
    /**
     * @function addInput Agrega un cuadro de texto para que el miembro escriba.
     * @param {string} label El nombre para el cuadro de texto.
     * @param {string} placeHolderText El texto que se mostrará en el cuadro de texto vacío.
     * @param {string} defaultValue El texto predeterminado que estará en el cuadro (¡no es obligatorio!).
     * @example .addInput('¿Cuál es tu IP?', '0.0.0.0');
     * @returns {void}
     */
    addInput(label, placeHolderText, defaultValue) {
        this.form.textField(label, placeHolderText, defaultValue ?? '');
    }
    /**
     * @function addDropdown Crea un menú desplegable en el formulario.
     * @param {string} label El nombre del menú desplegable.
     * @param {string[]} options Las opciones en el menú desplegable.
     * @param {number} defaultValueIndex La posición predeterminada cuando se abre el formulario por primera vez.
     * @example .addDropdown('¿Dónde vives?', ['México', 'América', 'Asia'], 1);
     * @returns {void}
     */
    addDropdown(label, options, defaultValueIndex) {
        this.form.dropdown(label, options, defaultValueIndex ?? 0);
    }
    /**
     * @function addSlider Agrega un deslizador al formulario.
     * @param {string} label El nombre del deslizador.
     * @param {number} minimumValue El valor mínimo para el deslizador.
     * @param {number} maximumValue El valor máximo para el deslizador.
     * @param {number} valueStep El incremento del valor al moverlo hacia la izquierda o hacia la derecha.
     * @param {number} defaultValue La posición inicial del deslizador cuando se abre el formulario.
     * @example .addSlider('Califica ROT', 9, 10, 1, 10);
     * @returns {void}
     */
    addSlider(label, minimumValue, maximumValue, valueStep, defaultValue) {
        if (minimumValue > maximumValue) throw new Error('[Forms UI Slider] Error: el valor mínimo no puede ser mayor que el valor máximo.');
        this.form.slider(label, minimumValue, maximumValue, valueStep ?? 1, defaultValue ?? ~~(maximumValue / minimumValue));
    }
    /**
     * @function addToggle Agrega un botón de encendido/apagado al formulario.
     * @param {string} label El nombre del interruptor de encendido/apagado.
     * @param {boolean} defaultValue Si está activado o desactivado cuando se abre el formulario por primera vez.
     * @example .addToggle('¿Queso?');
     * @returns {void}
     */
    addToggle(label, defaultValue) {
        this.form.toggle(label, defaultValue ?? false);
    }
    /**
     * @function send Envía el formulario a un miembro.
     * @param {string} player El nombre del miembro al que se desea enviar el formulario.
     * @param callback Una función de flecha asíncrona que se ejecutará después de que se complete el formulario (no completamente si es un formulario de modelo).
     * @example .send(player, response => {
     *   if (response.selection === 0) {
     *     // Maneja el clic del botón 0
     *   } else if (response.selection === 1) {
     *     // Maneja el clic del botón 1
     *   }
     * });
     * @returns {void}
     */
    send(player, callback) {
        this.forceShow(player).then((res) => {
            if (!callback) return;
            callback(res, player);
        }).catch((err) => console.warn(err));
    }
    /**
    * @function forceShow Muestra el formulario al jugador y continúa mostrándolo hasta que se reciba una respuesta válida.
    * @param {string} player El nombre del jugador al que se le mostrará el formulario.
    * @param {FormData} form El formulario que se mostrará.
    * @returns {Promise<FormDataResponse>} Una promesa que se resuelve con los datos de respuesta cuando se complete el formulario.
    */
    async forceShow(player) {
        while (true) {
            const response = await this.form.show(player);
            if (response.cancelationReason !== "userBusy") {
                return response;
            }
        }
    }
}
/**
 * @class Un Formulario de Mensaje es una interfaz de usuario de prueba de juego simple que tiene SOLO DOS botones.
 * @example const vex = new OPMessageF(); vex.show(player) o vex.show('gameza');
 * @returns Muestra un formulario de mensaje simple al jugador.
 */
export class ForceMessage {
    constructor() {
        this.form = new MessageFormData();
    }
    /**
     * @function setTitle Establece el título del formulario.
     * @param {string} text El texto del título.
     * @example .setTitle('¡Servidor!');
     * @returns {void}
     */
    setTitle(text) {
        this.form.title(text);
    }
    /**
     * @function setBody Establece el contenido del formulario.
     * @param {string} text El texto del contenido.
     * @example .setBody('¿VEX?');
     * @returns {void}
     */
    setBody(text) {
        this.form.body(text);
    }
    /**
     * @function setButton1 Agrega el primer botón al formulario.
     * @param {string} text El texto del botón.
     * @example .setButton1('¡SÍÍÍÍÍÍ!');
     * @returns {void}
     */
    setButton1(text) {
        this.form.button2(text);
    }
    /**
     * @function setButton2 Agrega el segundo botón al formulario.
     * @param {string} text El texto del botón.
     * @example .setButton2('¡DESCÁRGALO!');
     * @returns {void}
     */
    setButton2(text) {
        this.form.button1(text);
    }
    /**
     * @function send Envía el formulario a un miembro.
     * @param {string} player El nombre del miembro al que se desea enviar el formulario.
     * @param callback Una función de flecha asíncrona que se ejecutará después de que se complete el formulario (no completamente si es un formulario de modelo).
     * @example .send(player, response => {
     *   if (response.selection === 0) {
     *     // Maneja el clic del botón 0
     *   } else if (response.selection === 1) {
     *     // Maneja el clic del botón 1
     *   }
     * });
     * @returns {void}
     */
    send(player, callback) {
        this.forceShow(player).then((res) => {
            if (!callback) return;
            callback(res, player);
        }).catch((err) => console.warn(err));
    }
    /**
    * @function forceShow Muestra el formulario al jugador y continúa mostrándolo hasta que se reciba una respuesta válida.
    * @param {string} player El nombre del jugador al que se le mostrará el formulario.
    * @param {FormData} form El formulario que se mostrará.
    * @returns {Promise<FormDataResponse>} Una promesa que se resuelve con los datos de respuesta cuando se complete el formulario.
    */
    async forceShow(player) {
        while (true) {
            const response = await this.form.show(player);
            if (response.cancelationReason !== "userBusy") {
                return response;
            }
        }
    }
}