import { world } from "@minecraft/server";

export class Database {
  /**
   * Crea una nueva instancia de la Base de Datos
   * @param {string} tableName - El nombre de la tabla
   */
  constructor(tableName) {
    this.tableName = tableName;
    this.MEMORY = null; // Datos guardados en memoria
    this.QUEUE = []; // Lista de tareas en cola

    const LOADED_DATA = this.fetch();
    this.MEMORY = LOADED_DATA;

    if (this.onLoadCallback) {
      this.onLoadCallback(LOADED_DATA);
    }
    this.QUEUE.forEach((v) => v());
  }

  /**
   * Resetea la longitud de las claves de la base de datos
   * y resetea los IDs correspondientes.
   */
  resetStorage() {
    const ids = world
      .getDynamicPropertyIds()
      .filter((i) => i.startsWith(`db_${this.tableName}`));

    for (const id of ids) {
      world.setDynamicProperty(id, undefined);
    }
    world.setDynamicProperty(`db_${this.tableName}`, 0); // Reinicia la longitud de la clave
  }

  /**
   * Obtiene los datos desde las propiedades dinámicas
   * @returns {Object}
   */
  fetch() {
    let idLength = world.getDynamicProperty(`db_${this.tableName}`) ?? 0;
    if (typeof idLength !== "number") {
      console.warn(
        `[DATABASE]: DB: ${this.tableName}, tiene una configuración incorrecta. Reiniciando datos.`
      );
      idLength = 0;
      this.resetStorage();
    }
    if (idLength <= 0) return {};

    let collectedData = "";
    for (let i = 0; i < idLength; i++) {
      const data = world.getDynamicProperty(`db_${this.tableName}_${i}`);
      if (typeof data !== "string") {
        console.warn(
          `[DATABASE]: Al obtener: db_${this.tableName}_${i}, se encontraron datos incorrectos.`
        );
        this.resetStorage();
        return {};
      }
      collectedData += data;
    }
    return JSON.parse(collectedData);
  }

  /**
   * Agrega una tarea a la cola
   * @returns {Promise<void>}
   */
  addQueueTask() {
    return new Promise((resolve) => {
      this.QUEUE.push(resolve);
    });
  }

  /**
   * Guarda datos en esta base de datos
   * @returns {Promise<void>}
   */
  async saveData() {
    if (!this.MEMORY) await this.addQueueTask();
    const chunks = JSON.stringify(this.MEMORY).match(/.{1,8000}/g);
    if (!chunks) return;

    world.setDynamicProperty(`db_${this.tableName}`, chunks.length);

    chunks.forEach((chunk, i) => {
      world.setDynamicProperty(`db_${this.tableName}_${i}`, chunk);
    });
  }

  /**
   * Envía un callback cuando la base de datos ha sido cargada
   * @param {function} callback
   */
  async onLoad(callback) {
    if (this.MEMORY) return callback(this.MEMORY);
    this.onLoadCallback = callback;
  }

  /**
   * Establece un valor en la base de datos
   * @param {string} key - La clave para almacenar el valor
   * @param {any} value - El valor a almacenar
   * @returns {Promise<void>}
   */
  async set(key, value) {
    if (!this.MEMORY) throw new Error("¡Los datos intentaron ser establecidos antes de cargar!");
    this.MEMORY[key] = value;
    return this.saveData();
  }

  /**
   * Obtiene un valor de la base de datos
   * @param {string} key - La clave para obtener el valor
   * @returns {any | null}
   */
  get(key) {
    if (!this.MEMORY) throw new Error("¡Datos no cargados! Considera usar `getSync`.");
    return this.MEMORY[key];
  }

  /**
   * Obtiene un valor de la base de datos de forma asíncrona
   * @param {string} key - La clave para obtener el valor
   * @returns {Promise<any>}
   */
  async getSync(key) {
    if (this.MEMORY) return this.get(key);
    await this.addQueueTask();
    return this.MEMORY ? this.MEMORY[key] : null;
  }

  /**
   * Obtiene todas las claves de la tabla
   * @returns {string[]}
   */
  keys() {
    if (!this.MEMORY) throw new Error("¡Datos no cargados! Considera usar `keysSync`.");
    return Object.keys(this.MEMORY);
  }

  /**
   * Obtiene todas las claves de la tabla de forma asíncrona
   * @returns {Promise<string[]>}
   */
  async keysSync() {
    if (this.MEMORY) return this.keys();
    await this.addQueueTask();
    return this.MEMORY ? Object.keys(this.MEMORY) : [];
  }

  /**
   * Obtiene todos los valores de la tabla
   * @returns {any[]}
   */
  values() {
    if (!this.MEMORY) throw new Error("¡Datos no cargados! Considera usar `valuesSync`.");
    return Object.values(this.MEMORY);
  }

  /**
   * Obtiene todos los valores de la tabla de forma asíncrona
   * @returns {Promise<any[]>}
   */
  async valuesSync() {
    if (this.MEMORY) return this.values();
    await this.addQueueTask();
    return this.MEMORY ? Object.values(this.MEMORY) : [];
  }

  /**
   * Verifica si una clave existe en la tabla
   * @param {string} key - La clave a verificar
   * @returns {boolean}
   */
  has(key) {
    if (!this.MEMORY) throw new Error("¡Datos no cargados! Considera usar `hasSync`.");
    return Boolean(this.MEMORY[key]);
  }

  /**
   * Verifica si una clave existe en la tabla de forma asíncrona
   * @param {string} key - La clave a verificar
   * @returns {Promise<boolean>}
   */
  async hasSync(key) {
    if (this.MEMORY) return this.has(key);
    await this.addQueueTask();
    return this.MEMORY ? Boolean(this.MEMORY[key]) : false;
  }

  /**
   * Obtiene todos los pares clave-valor
   * @returns {Object}
   */
  collection() {
    if (!this.MEMORY) throw new Error("¡Datos no cargados! Considera usar `collectionSync`.");
    return this.MEMORY;
  }

  /**
   * Obtiene todos los pares clave-valor de forma asíncrona
   * @returns {Promise<Object>}
   */
  async collectionSync() {
    if (this.MEMORY) return this.collection();
    await this.addQueueTask();
    return this.MEMORY ? this.MEMORY : {};
  }

  /**
   * Elimina una clave de la tabla
   * @param {string} key - La clave a eliminar
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    if (!this.MEMORY) return false;
    const status = delete this.MEMORY[key];
    await this.saveData();
    return status;
  }

  /**
   * Limpia toda la tabla
   * @returns {Promise<void>}
   */
  async clear() {
    this.MEMORY = {};
    return await this.saveData();
  }

  /**
   * Obtiene una clave a partir de un valor
   * @param {any} value - El valor a buscar
   * @returns {string | null}
   */
  getKeyByValue(value) {
    for (const key in this.MEMORY) {
      if (this.MEMORY[key] === value) {
        return key;
      }
    }
    return null;
  }
}
