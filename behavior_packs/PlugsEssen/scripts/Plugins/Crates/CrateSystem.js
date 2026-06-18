import{world,system,ItemStack}from"@minecraft/server";import{isAdmin}from"../../Config/GlobalConfig.js";import{getText,getPlayerLanguage}from"../../Utils/Translations.js";import{getCrate,saveCrate,getAllCrates,logOpening,rollLot}from"./CrateManager.js";import{consumeKey}from"./CrateKeyHelper.js";import{giveItemsToPlayer}from"./CrateItemHelper.js";import{playIdleParticles,playOpenAnimation,playInteractAnimation,stopAllIdleParticles}from"./CrateAnimation.js";import{openCreateCrateWizard,openCrateAdminMenu}from"./CrateUI.js";import{openCratePlayerUI}from"./CratePlayerUI.js";const SPAWNER_ITEM_ID="plugs:crate_spawner",CRATE_ENTITY_ID="plugs:crate",_activeCrates=new Map,_wizardOpened=new Set,_cooldowns=new Map,_pendingRespawns=new Map;let _initialRestoreComplete=false;export function initializeCrateSystem(){_registerEntitySpawn(),_registerInteraction(),_restoreIdleParticles()}export function giveCrateSpawnerItem(t){try{const e=new ItemStack(SPAWNER_ITEM_ID,1),n=t.getComponent("minecraft:inventory")?.container;n&&n.addItem(e)}catch(t){}}function _t(t,e){return getText(getPlayerLanguage(t),`crates.${e}`)}function _registerEntitySpawn(){world.afterEvents.entitySpawn.subscribe(t=>{const e=t.entity;if(!e||"plugs:crate"!==e.typeId)return;// Si hay un respawn pendiente para esta posición, pre-vincular para evitar el wizard
if(!_activeCrates.has(e.id)){for(const[crateId,pending]of _pendingRespawns.entries()){const dx=Math.abs(e.location.x-pending.loc.x),dz=Math.abs(e.location.z-pending.loc.z);if(dx<1&&dz<1){_activeCrates.set(e.id,crateId);_wizardOpened.add(e.id);_pendingRespawns.delete(crateId);break;}}}if(_wizardOpened.has(e.id))return;_wizardOpened.add(e.id);system.runTimeout(async()=>{const t=_getCrateIdForEntity(e);if(t){const n=getCrate(t);if(!_initialRestoreComplete)return;if(!1!==n?.showLabel)try{const t=e.dimension.getEntities({type:"plugs:floating_text",location:e.location,maxDistance:2.5});for(const e of t)try{e.kill?.()}catch(t){}}catch(t){}return void playIdleParticles(e,n)}const n=world.getAllPlayers().filter(t=>isAdmin(t));let i=null,o=1/0;for(const t of n)try{if(t.dimension.id!==e.dimension.id)continue;const n=t.location.x-e.location.x,r=t.location.y-e.location.y,a=t.location.z-e.location.z,s=Math.sqrt(n*n+r*r+a*a);s<o&&(o=s,i=t)}catch(t){}!i||o>12||await openCreateCrateWizard(i,e)},5)})}function _registerInteraction(){world.beforeEvents.playerInteractWithEntity?.subscribe?.(t=>{const e=t.player,n=t.target;n&&"plugs:crate"===n.typeId&&(t.cancel=!0,system.run(async()=>{const t=_getCrateIdForEntity(n);if(!t)return void(isAdmin(e)?await openCreateCrateWizard(e,n):e.sendMessage(_t(e,"noCrateConfig")));const i=getCrate(t);if(i){if(isAdmin(e)&&e.isSneaking)return playInteractAnimation(n),void await openCrateAdminMenu(e);if(_isOnCooldown(e,t))e.sendMessage(_t(e,"cooldownMsg"));else if(i.maxUses&&(i.totalOpened??0)>=i.maxUses)e.sendMessage(_t(e,"maxUsesReached"));else{if(_keyIsInHand(e,t)){if(!consumeKey(e,t))return void e.sendMessage(_t(e,"consumeKeyError"));_setCooldown(e,t,8500);const o=rollLot(i);return o?(logOpening(t,e.name,o.id),void playOpenAnimation(n,e,o,i,()=>{giveItemsToPlayer(e,o.items??[]),playIdleParticles(n,i)})):void e.sendMessage(_t(e,"noLotsMsg"))}playInteractAnimation(n),await openCratePlayerUI(e,t)}}}))})}function _restoreIdleParticles(){system.runTimeout(()=>{
    try {
        const dim = world.getDimension("overworld");
        // Limpiar floating texts en una sola pasada usando tag
        const allFTs = dim.getEntities({ type: "plugs:floating_text" });
        for (const ft of allFTs) { try { ft.remove?.(); } catch (_) {} }
    } catch (_) {}

    stopAllIdleParticles();

    system.runTimeout(() => {
        try {
            // Una sola búsqueda de todas las crates activas
            const dim = world.getDimension("overworld");
            const allCrateEntities = dim.getEntities({ type: "plugs:crate" });
            
            // Construir mapa entityId→entity para O(1) lookup
            const entityMap = new Map();
            for (const e of allCrateEntities) entityMap.set(e.id, e);

            const t = getAllCrates();
            for (const crate of Object.values(t)) {
                if (!crate.entityId) continue;
                const entity = entityMap.get(crate.entityId);
                if (entity) {
                    _activeCrates.set(entity.id, crate.id);
                    _wizardOpened.add(entity.id);
                    playIdleParticles(entity, crate);
                }
            }
        } catch (t) {}
        _initialRestoreComplete = true;
        console.warn("[CrateSystem] Restore inicial completado");
    }, 40);
},120)}function _getCrateIdForEntity(t){if(_activeCrates.has(t.id))return _activeCrates.get(t.id);const e=getAllCrates();for(const n of Object.values(e))if(n.entityId===t.id)return _activeCrates.set(t.id,n.id),n.id;return null}export function linkEntityToCrate(t,e){const n=getCrate(e);n&&(n.entityId=t.id,n.location={...t.location,dimension:t.dimension.id},saveCrate(n),_activeCrates.set(t.id,e),_wizardOpened.add(t.id),playIdleParticles(t,n))}export function markPendingRespawn(crateId,loc){_pendingRespawns.set(crateId,{loc,ts:Date.now()});system.runTimeout(()=>{_pendingRespawns.delete(crateId)},200);}function _isOnCooldown(t,e){return Date.now()<(_cooldowns.get(`${t.id}:${e}`)??0)}function _setCooldown(t,e,n){_cooldowns.set(`${t.id}:${e}`,Date.now()+n)}function _keyIsInHand(t,e){try{const n=t.getComponent("minecraft:inventory")?.container;if(!n)return!1;const i=n.getItem(t.selectedSlotIndex);if(!i)return!1;const o=i.getLore?.()??[],r=`§r§0§k${e}`;return o.some(t=>t.includes(r))}catch(t){return!1}}