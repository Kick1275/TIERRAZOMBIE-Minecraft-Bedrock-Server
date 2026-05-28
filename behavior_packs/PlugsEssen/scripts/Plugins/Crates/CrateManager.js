import{world}from"@minecraft/server";const STORAGE_KEY="crates:data";const STORAGE_PREFIX="crate:";const INDEX_KEY="crates:index";

function _loadIndex(){try{return JSON.parse(world.getDynamicProperty(INDEX_KEY)??"[]")}catch(t){return[]}}
function _saveIndex(ids){try{world.setDynamicProperty(INDEX_KEY,JSON.stringify(ids))}catch(t){console.warn("[CrateManager] Error saving index: "+t)}}
function _loadCrate(id){try{const raw=world.getDynamicProperty(STORAGE_PREFIX+id);return raw?JSON.parse(raw):null}catch(t){return null}}
function _saveCrate(crate){try{world.setDynamicProperty(STORAGE_PREFIX+crate.id,JSON.stringify(crate))}catch(t){console.warn("[CrateManager] Error saving crate "+crate.id+": "+t)}}
function _deleteCrate(id){try{world.setDynamicProperty(STORAGE_PREFIX+id,undefined)}catch(t){}}

// Migración desde formato antiguo (todo en una key)
function _migrate(){try{const old=world.getDynamicProperty(STORAGE_KEY);if(!old)return;const data=JSON.parse(old);const ids=Object.keys(data);if(ids.length===0)return;for(const id of ids){_saveCrate(data[id])}_saveIndex(ids);try{world.setDynamicProperty(STORAGE_KEY,undefined)}catch(t){}console.warn("[CrateManager] Migrated "+ids.length+" crates to per-crate storage")}catch(t){}}
_migrate();

export function getAllCrates(){const ids=_loadIndex();const result={};for(const id of ids){const c=_loadCrate(id);if(c)result[id]=c}return result}
export function getCrate(id){return _loadCrate(id)}
export function saveCrate(t){_saveCrate(t);const ids=_loadIndex();if(!ids.includes(t.id)){ids.push(t.id);_saveIndex(ids)}}
export function deleteCrate(id){_deleteCrate(id);const ids=_loadIndex().filter(i=>i!==id);_saveIndex(ids)}
export function generateCrateId(){return`crate_${Date.now()}_${Math.floor(1e6*Math.random())}`}
export function generateLotId(){return`lot_${Date.now()}_${Math.floor(1e6*Math.random())}`}
export function logOpening(t,e,o){const r=_loadCrate(t);r&&(r.openLog||(r.openLog=[]),r.openLog.unshift({player:e,lot:o,timestamp:Date.now()}),r.openLog.length>50&&(r.openLog.length=50),r.totalOpened=(r.totalOpened||0)+1,_saveCrate(r))}
export function rollLot(t){const e=t.lots??[];if(0===e.length)return null;if("random"===t.crateType){const o=[];for(const t of e)for(const e of t.items??[])o.push({item:e,lot:t});if(0===o.length)return null;let n=1;const r=t.randomCount;r&&(n="fixed"===r.type?r.fixed??1:r.min+Math.floor(Math.random()*(r.max-r.min+1))),n=Math.min(n,o.length);return{id:"random",probability:100,description:null,items:[...o].sort(()=>Math.random()-.5).slice(0,n).map(t=>t.item)}}const o=e.reduce((t,e)=>t+(e.probability??0),0);if(o<=0)return e[0];let n=Math.random()*o;for(const t of e)if(n-=t.probability??0,n<=0)return t;return e[e.length-1]}