import{world,system,ItemStack}from"@minecraft/server";import{isAdmin}from"../../Config/GlobalConfig.js";import{getText,getPlayerLanguage}from"../../Utils/Translations.js";import{getCrate,saveCrate,getAllCrates,logOpening,rollLot}from"./CrateManager.js";import{consumeKey}from"./CrateKeyHelper.js";import{giveItemsToPlayer}from"./CrateItemHelper.js";import{playIdleParticles,playOpenAnimation,playInteractAnimation,stopAllIdleParticles}from"./CrateAnimation.js";import{openCreateCrateWizard,openCrateAdminMenu}from"./CrateUI.js";import{openCratePlayerUI}from"./CratePlayerUI.js";const SPAWNER_ITEM_ID="plugs:crate_spawner",CRATE_ENTITY_ID="plugs:crate",_activeCrates=new Map,_wizardOpened=new Set,_cooldowns=new Map;let _initialRestoreComplete=false;export function initializeCrateSystem(){_registerEntitySpawn(),_registerInteraction(),_restoreIdleParticles()}export function giveCrateSpawnerItem(t){try{const e=new ItemStack(SPAWNER_ITEM_ID,1),n=t.getComponent("minecraft:inventory")?.container;n&&n.addItem(e)}catch(t){}}function _t(t,e){return getText(getPlayerLanguage(t),`crates.${e}`)}function _registerEntitySpawn(){world.afterEvents.entitySpawn.subscribe(t=>{const e=t.entity;e&&"plugs:crate"===e.typeId&&(_wizardOpened.has(e.id)||(_wizardOpened.add(e.id),system.runTimeout(async()=>{const t=_getCrateIdForEntity(e);if(t){const n=getCrate(t);// Si el restore inicial aún no terminó, no crear FT aquí — _restoreIdleParticles lo hará
if(!_initialRestoreComplete)return;if(!1!==n?.showLabel)try{const t=e.dimension.getEntities({type:"plugs:floating_text",location:e.location,maxDistance:2.5});for(const e of t)try{e.kill?.()}catch(t){}}catch(t){}return void playIdleParticles(e,n)}const n=world.getAllPlayers().filter(t=>isAdmin(t));let i=null,o=1/0;for(const t of n)try{if(t.dimension.id!==e.dimension.id)continue;const n=t.location.x-e.location.x,r=t.location.y-e.location.y,a=t.location.z-e.location.z,s=Math.sqrt(n*n+r*r+a*a);s<o&&(o=s,i=t)}catch(t){}!i||o>12||await openCreateCrateWizard(i,e)},5)))})}function _registerInteraction(){world.beforeEvents.playerInteractWithEntity?.subscribe?.(t=>{const e=t.player,n=t.target;n&&"plugs:crate"===n.typeId&&(t.cancel=!0,system.run(async()=>{const t=_getCrateIdForEntity(n);if(!t)return void(isAdmin(e)?await openCreateCrateWizard(e,n):e.sendMessage(_t(e,"noCrateConfig")));const i=getCrate(t);if(i){if(isAdmin(e)&&e.isSneaking)return playInteractAnimation(n),void await openCrateAdminMenu(e);if(_isOnCooldown(e,t))e.sendMessage(_t(e,"cooldownMsg"));else if(i.maxUses&&(i.totalOpened??0)>=i.maxUses)e.sendMessage(_t(e,"maxUsesReached"));else{if(_keyIsInHand(e,t)){if(!consumeKey(e,t))return void e.sendMessage(_t(e,"consumeKeyError"));_setCooldown(e,t,8500);const o=rollLot(i);return o?(logOpening(t,e.name,o.id),void playOpenAnimation(n,e,o,i,()=>{giveItemsToPlayer(e,o.items??[]),playIdleParticles(n,i)})):void e.sendMessage(_t(e,"noLotsMsg"))}playInteractAnimation(n),await openCratePlayerUI(e,t)}}}))})}function _restoreIdleParticles(){system.runTimeout(()=>{
    // Limpiar TODOS los floating texts del mundo
    try {
        const dim = world.getDimension("overworld");
        const allFTs = dim.getEntities({ type: "plugs:floating_text" });
        for (const ft of allFTs) { try { ft.remove?.(); } catch (_) {} }
        console.warn(`[CrateSystem] Limpiados ${allFTs.length} floating texts al restaurar`);
    } catch (_) {}

    // Limpiar también el mapa interno de labels para evitar referencias viejas
    stopAllIdleParticles();

    // Esperar 40 ticks para que las entidades mueran y no haya spawns pendientes
    system.runTimeout(() => {
        // Segunda pasada de limpieza por si quedó alguno
        try {
            const dim = world.getDimension("overworld");
            const remaining = dim.getEntities({ type: "plugs:floating_text" });
            for (const ft of remaining) { try { ft.remove?.(); } catch (_) {} }
        } catch (_) {}

        // Ahora sí crear los nuevos FTs
        const t=getAllCrates();
        for(const e of Object.values(t))if(e.entityId)try{
            const t=world.getDimension("overworld").getEntities({type:"plugs:crate"});
            for(const n of t)if(n.id===e.entityId){
                _activeCrates.set(n.id,e.id);
                _wizardOpened.add(n.id);
                playIdleParticles(n,e);
            }
        }catch(t){}
        _initialRestoreComplete=true;
        console.warn("[CrateSystem] Restore inicial completado");
    }, 40);
},120)}function _getCrateIdForEntity(t){if(_activeCrates.has(t.id))return _activeCrates.get(t.id);const e=getAllCrates();for(const n of Object.values(e))if(n.entityId===t.id)return _activeCrates.set(t.id,n.id),n.id;return null}export function linkEntityToCrate(t,e){const n=getCrate(e);n&&(n.entityId=t.id,n.location={...t.location,dimension:t.dimension.id},saveCrate(n),_activeCrates.set(t.id,e),_wizardOpened.add(t.id),playIdleParticles(t,n))}function _isOnCooldown(t,e){return Date.now()<(_cooldowns.get(`${t.id}:${e}`)??0)}function _setCooldown(t,e,n){_cooldowns.set(`${t.id}:${e}`,Date.now()+n)}function _keyIsInHand(t,e){try{const n=t.getComponent("minecraft:inventory")?.container;if(!n)return!1;const i=n.getItem(t.selectedSlotIndex);if(!i)return!1;const o=i.getLore?.()??[],r=`§r§0§k${e}`;return o.some(t=>t.includes(r))}catch(t){return!1}}