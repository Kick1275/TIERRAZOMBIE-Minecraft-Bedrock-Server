import{ActionFormData,ModalFormData,MessageFormData}from"@minecraft/server-ui";import{getText,getPlayerLanguage}from"../../Utils/Translations.js";import{getPrefix}from"../../Config/GlobalConfig.js";import{getAllCrates,saveCrate,deleteCrate,generateCrateId,generateLotId}from"./CrateManager.js";import{captureItemFromSlot,makeStorageKey,deleteShulkerStorage}from"./CrateItemHelper.js";import{giveKeys}from"./CrateKeyHelper.js";import{IDLE_PRESETS,OPEN_ANIMATIONS}from"./CrateAnimation.js";import{openTZImporterMenu}from"./CrateTZImporter.js";function _t(e,t,a={}){const n=getPlayerLanguage(e);let o=getText(n,`crates.${t}`);"string"!=typeof o&&(o=String(o??`[crates.${t}]`));for(const[e,t]of Object.entries(a))o=o.replaceAll(`{${e}}`,String(t));return o}function _tArr(e,t){const a=getPlayerLanguage(e),n=getText(a,`crates.${t}`);return Array.isArray(n)?n:[]}export async function openCrateAdminMenu(e){for(;;){const t=(new ActionFormData).title(_t(e,"adminMenuTitle")).button(_t(e,"btnManage"),"textures/ui/icon_recipe_nature").button(_t(e,"btnGetKeys"),"textures/items/tripwire_hook").button(_t(e,"btnGetSpawner"),"textures/items/crate_spawner").button("§6Importar Crates TZ","textures/ui/icon_blackfriday.png").button(_t(e,"btnClose"),"textures/ui/cancel"),a=await t.show(e).catch(()=>null);if(!a||a.canceled||4===a.selection)return;if(0===a.selection)await openCrateList(e);else if(1===a.selection)await openGetKeysMenu(e);else if(2===a.selection){const{giveCrateSpawnerItem:t}=await import("./CrateSystem.js");t(e),e.sendMessage(getPrefix()+_t(e,"spawnerGiven"))}else if(3===a.selection)await openTZImporterMenu(e)}}async function openCrateList(e){for(;;){const t=getAllCrates(),a=Object.keys(t);if(0===a.length)return void e.sendMessage(_t(e,"noCrates"));const n=(new ActionFormData).title(_t(e,"crateListTitle"));for(const o of a){const a=t[o];n.button(_t(e,"crateListBtn",{name:a.name??o,lots:(a.lots??[]).length,opened:a.totalOpened??0}))}n.button(_t(e,"btnBack"));const o=await n.show(e).catch(()=>null);if(!o||o.canceled||o.selection===a.length)return;await openCrateEditMenu(e,t[a[o.selection]])}}export async function openCrateEditMenu(e,t){for(;;){const a=(new ActionFormData).title(_t(e,"editCrateTitle",{name:t.name??t.id})).button(_t(e,"btnEditConfig"),"textures/ui/settings_glyph_color_2x").button(_t(e,"btnManageLots"),"textures/ui/icon_recipe_nature").button(_t(e,"btnGiveKeys"),"textures/items/tripwire_hook").button(_t(e,"btnOpenLog"),"textures/ui/book_edit_default").button("§e↺ Respawnear Crate\n§7Respawnear la entidad en su posición","textures/ui/refresh_light").button(_t(e,"btnDeleteCrate"),"textures/ui/trash_default").button(_t(e,"btnBack"),"textures/ui/arrow_left"),n=await a.show(e).catch(()=>null);if(!n||n.canceled||6===n.selection)return;if(0===n.selection)await openEditCrateConfig(e,t);else if(1===n.selection)await openLotManager(e,t,!1);else if(2===n.selection)await openGiveKeysToPlayer(e,t);else if(3===n.selection)await openOpeningLog(e,t);else if(4===n.selection)await _respawnCrate(e,t);else if(5===n.selection){if(await confirmDeleteCrate(e,t))return}}}export async function openCreateCrateWizard(e,t=null){const a=IDLE_PRESETS.map(e=>e.label),n=OPEN_ANIMATIONS.map(e=>e.label),o=(new ModalFormData).title(_t(e,"wizardStep1Title")).textField(_t(e,"wizardNameLabel"),_t(e,"wizardNamePlaceholder"),{defaultValue:""}).textField(_t(e,"wizardDescLabel"),_t(e,"wizardDescPlaceholder"),{defaultValue:""}).dropdown(_t(e,"wizardIdlePresetLabel"),a,{defaultValueIndex:0}).dropdown(_t(e,"wizardOpenAnimLabel"),n,{defaultValueIndex:0}).toggle(_t(e,"wizardShowLabelLabel"),{defaultValue:!0}),l=await o.show(e).catch(()=>null);if(!l||l.canceled)return;const[i,r,s,c,d]=l.formValues,u=IDLE_PRESETS[s]?.value??"arcane",m=OPEN_ANIMATIONS[c]?.value??"vortex",f=(new ModalFormData).title(_t(e,"wizardStep2Title")).textField(_t(e,"wizardKeyNameLabel"),_t(e,"wizardKeyNamePlaceholder"),{defaultValue:"§6§lLlave de Crate"}).textField(_t(e,"wizardKeyLoreLabel"),_t(e,"wizardKeyLorePlaceholder"),{defaultValue:"§7Abre la crate"}).toggle(_t(e,"wizardKeyEnchantedLabel"),{defaultValue:!0}).textField(_t(e,"wizardKeyTypeIdLabel"),_t(e,"wizardKeyTypeIdPlaceholder"),{defaultValue:"minecraft:tripwire_hook"}).toggle(_t(e,"wizardEnableBuyLabel"),{defaultValue:!1}).textField(_t(e,"wizardMoneyPriceLabel"),"0",{defaultValue:"0"}).textField(_t(e,"wizardGemsPriceLabel"),"0",{defaultValue:"0"}),_=await f.show(e).catch(()=>null);if(!_||_.canceled)return;const[p,g,b,w,y,h,k]=_.formValues,P=(g??"").split("/n").map(e=>e.trim()).filter(Boolean),I=parseInt(h)||0,x=parseInt(k)||0,L=_tArr(e,"crateTypeOptions"),C=(new ModalFormData).title(_t(e,"wizardStep3Title")).dropdown(_t(e,"crateTypeLabel"),L,{defaultValueIndex:0}),F=await C.show(e).catch(()=>null);if(!F||F.canceled)return;const M=["single","pack","random"][F.formValues[0]]??"single";let D=null;if("random"===M&&(D=await _askRandomCount(e),!D))return;const v={id:generateCrateId(),name:i?.trim()||null,description:r?.trim()||null,crateType:M,randomCount:D,idleParticle:u,idleParticleType:u,customParticle:null,openAnimation:m,showLabel:!1!==d,lots:[],key:{typeId:w?.trim()||"minecraft:tripwire_hook",nameTag:p?.trim()||"§6§lLlave de Crate",lore:P.length>0?P:["§7Abre la crate"],enchanted:b??!0},keyPrice:y&&(I>0||x>0)?{money:I||null,gems:x||null}:null,maxUses:null,totalOpened:0,openLog:[],entityId:null,location:null};await openLotManager(e,v,!0,t)}async function _askRandomCount(e){const t=_tArr(e,"randomCountTypeOptions"),a=(new ModalFormData).title(_t(e,"randomCountTitle")).dropdown(_t(e,"randomCountTypeLabel"),t,{defaultValueIndex:0}).textField(_t(e,"randomFixedLabel"),"5",{defaultValue:"5"}).textField(_t(e,"randomMinLabel"),"3",{defaultValue:"3"}).textField(_t(e,"randomMaxLabel"),"6",{defaultValue:"6"}),n=await a.show(e).catch(()=>null);if(!n||n.canceled)return null;const[o,l,i,r]=n.formValues;return 0===o?{type:"fixed",fixed:parseInt(l)||1}:{type:"range",min:parseInt(i)||1,max:parseInt(r)||3}}export async function openLotManager(e,t,a=!1,n=null){const o=t.crateType??"single";"single"===o?await _lotManagerSingle(e,t,a,n):"pack"===o?await _lotManagerPack(e,t,a,n):await _lotManagerRandom(e,t,a,n)}async function _saveCrateIfNew(e,t,a,n){if(saveCrate(t),a&&n){const{linkEntityToCrate:e}=await import("./CrateSystem.js");e(n,t.id)}a&&(giveKeys(e,t,64),e.sendMessage(getPrefix()+_t(e,"crateCreated",{name:t.name??t.id})))}async function _lotManagerSingle(e,t,a,n){for(;;){const o=t.lots??[],l=(new ActionFormData).title(_t(e,"lotManagerSingle",{name:t.name??t.id}));for(const t of o){const a=t.items?.[0]?.nbt?.nameTag??t.items?.[0]?.typeId?.replace("minecraft:","")??"?";l.button(_t(e,"lotSingle",{prob:t.probability??0,name:a}))}l.button("§6§l⬇ Importar config TZ"),l.button(_t(e,"btnAddItem")),l.button("§a⚡ Agregar todo el inventario\n§7Agrega cada item como lote separado"),a&&l.button(_t(e,"btnSaveCrate")),l.button(_t(e,"btnBack"));const i=await l.show(e).catch(()=>null);if(!i||i.canceled)break;const r=o.length,addAllIdx=o.length+2,s=o.length+3,c=o.length+(a?4:3);if(i.selection===c)break;if(a&&i.selection===s){await _saveCrateIfNew(e,t,a,n);break}if(i.selection===addAllIdx){await _addAllInventoryItems(e,t,"single");continue}if(i.selection===o.length){await _importTZConfig(e,t);continue}i.selection===r+1?await _addSingleItem(e,t):await _editSingleLot(e,t,o[i.selection])}}async function _addSingleItem(e,t){const a=await _pickItemFromInventory(e);if(!a)return;const n=await _askAmount(e,a);if(null===n)return;const o=await _askProbability(e);if(null===o)return;const l=await _askDescription(e),i=generateLotId(),r=makeStorageKey(i,0),s=captureItemFromSlot(e,a.slot,r);s?(s.amount=n,s.storageKey&&e.sendMessage(getPrefix()+"§aShulker capturada con contenido."),t.lots.push({id:i,probability:o,description:l,items:[s]}),saveCrate(t),e.sendMessage(getPrefix()+_t(e,"itemDescConfirm"))):e.sendMessage(getPrefix()+"§cNo se pudo capturar el ítem.")}async function _editSingleLot(e,t,a){for(;;){const n=(new ActionFormData).title(_t(e,"editLotTitle")).button(_t(e,"btnEditProb")).button(_t(e,"btnDeleteLot")).button(_t(e,"btnBack")),o=await n.show(e).catch(()=>null);if(!o||o.canceled||2===o.selection)return;if(0===o.selection){const n=(new ModalFormData).title(_t(e,"editLotFormTitle")).textField(_t(e,"lotProbEditLabel"),"50",{defaultValue:String(a.probability??10)}).textField(_t(e,"lotDetailsEditLabel"),_t(e,"lotDetailsPh"),{defaultValue:a.description??""}),o=await n.show(e).catch(()=>null);o&&!o.canceled&&(a.probability=parseFloat(o.formValues[0])||a.probability,a.description=o.formValues[1]?.trim()||null,saveCrate(t))}else if(1===o.selection){for(const e of a.items??[])e.storageKey&&deleteShulkerStorage(e.storageKey);return t.lots=t.lots.filter(e=>e.id!==a.id),saveCrate(t),void e.sendMessage(getPrefix()+_t(e,"lotDeleted"))}}}async function _lotManagerPack(e,t,a,n){for(;;){const o=t.lots??[],l=(new ActionFormData).title(_t(e,"lotManagerPack",{name:t.name??t.id}));for(const t of o)l.button(_t(e,"lotPack",{prob:t.probability??0,name:t.packName??_t(e,"lotDetailsPh"),count:(t.items??[]).length}));l.button("§6§l⬇ Importar config TZ"),l.button(_t(e,"btnAddPack")),l.button("§a⚡ Agregar todo el inventario\n§7Crea un pack con todos tus items"),a&&l.button(_t(e,"btnSaveCrate")),l.button(_t(e,"btnBack"));const i=await l.show(e).catch(()=>null);if(!i||i.canceled)break;const r=o.length,addAllIdx=o.length+2,s=o.length+3,c=o.length+(a?4:3);if(i.selection===c)break;if(a&&i.selection===s){await _saveCrateIfNew(e,t,a,n);break}if(i.selection===addAllIdx){await _addAllInventoryItems(e,t,"pack");continue}if(i.selection===o.length){await _importTZConfig(e,t);continue}i.selection===r+1?await _createPack(e,t):await _editPack(e,t,o[i.selection])}}async function _createPack(e,t){const a=(new ModalFormData).title(_t(e,"packNameTitle")).textField(_t(e,"packNameLabel"),_t(e,"packNamePlaceholder"),{defaultValue:""}).textField(_t(e,"packProbLabel"),"30",{defaultValue:"30"}).textField(_t(e,"packDescLabel"),_t(e,"packDescPlaceholder"),{defaultValue:""}),n=await a.show(e).catch(()=>null);if(!n||n.canceled)return;const[o,l,i]=n.formValues,r={id:generateLotId(),packName:o?.trim()||"Pack",probability:parseFloat(l)||10,description:i?.trim()||null,items:[]};e.sendMessage(getPrefix()+_t(e,"packCreated")),await _editPackItems(e,t,r,!0)}async function _editPack(e,t,a){for(;;){const n=(new ActionFormData).title(_t(e,"editLotTitle")).button(_t(e,"btnEditProb")).button(_t(e,"btnAddItems")).button(_t(e,"btnDeleteLot")).button(_t(e,"btnBack")),o=await n.show(e).catch(()=>null);if(!o||o.canceled||3===o.selection)return;if(0===o.selection){const n=(new ModalFormData).title(_t(e,"editLotFormTitle")).textField(_t(e,"packNameLabel"),_t(e,"packNamePlaceholder"),{defaultValue:a.packName??""}).textField(_t(e,"lotProbEditLabel"),"30",{defaultValue:String(a.probability??10)}).textField(_t(e,"packDescLabel"),_t(e,"packDescPlaceholder"),{defaultValue:a.description??""}),o=await n.show(e).catch(()=>null);o&&!o.canceled&&(a.packName=o.formValues[0]?.trim()||a.packName,a.probability=parseFloat(o.formValues[1])||a.probability,a.description=o.formValues[2]?.trim()||null,saveCrate(t))}else if(1===o.selection)await _editPackItems(e,t,a,!1);else if(2===o.selection){for(const e of a.items??[])e.storageKey&&deleteShulkerStorage(e.storageKey);return t.lots=t.lots.filter(e=>e.id!==a.id),saveCrate(t),void e.sendMessage(getPrefix()+_t(e,"lotDeleted"))}}}async function _editPackItems(e,t,a,n){for(;;){const n=a.items??[],o=(new ActionFormData).title(_t(e,"packItemsTitle",{name:a.packName??"Pack"}));for(const e of n){const t=e.nbt?.nameTag??e.typeId?.replace("minecraft:","")??"?";o.button(`§f${t} §7x${e.amount??1}`)}o.button(_t(e,"btnAddItem")),o.button(_t(e,"btnSavePack")),o.button(_t(e,"btnBack"));const l=await o.show(e).catch(()=>null);if(!l||l.canceled||l.selection===n.length+2)break;if(l.selection===n.length+1){if(0===n.length){e.sendMessage(getPrefix()+_t(e,"packNeedsItem"));continue}const o=t.lots.find(e=>e.id===a.id);o?Object.assign(o,a):t.lots.push(a),saveCrate(t),e.sendMessage(getPrefix()+_t(e,"packSaved",{count:n.length}));break}l.selection===n.length?await _addItemToPack(e,a):a.items.splice(l.selection,1)}}async function _addItemToPack(e,t){const a=await _pickItemFromInventory(e);if(!a)return;const n=await _askAmount(e,a);if(null===n)return;const o=t.items.length,l=makeStorageKey(t.id,o),i=captureItemFromSlot(e,a.slot,l);i&&(i.amount=n,t.items.push(i))}async function _lotManagerRandom(e,t,a,n){for(;;){const o=t.lots??[],l=(new ActionFormData).title(_t(e,"lotManagerRandom",{name:t.name??t.id}));for(const t of o){const a=t.items?.[0]?.nbt?.nameTag??t.items?.[0]?.typeId?.replace("minecraft:","")??"?";l.button(_t(e,"lotRandom",{name:a}))}l.button("§6§l⬇ Importar config TZ"),l.button(_t(e,"btnAddItem")),l.button("§a⚡ Agregar todo el inventario\n§7Agrega cada item como premio separado"),a&&l.button(_t(e,"btnSaveCrate")),l.button(_t(e,"btnBack"));const i=await l.show(e).catch(()=>null);if(!i||i.canceled)break;const r=o.length,addAllIdx=o.length+2,s=o.length+3,c=o.length+(a?4:3);if(i.selection===c)break;if(a&&i.selection===s){await _saveCrateIfNew(e,t,a,n);break}if(i.selection===addAllIdx){await _addAllInventoryItems(e,t,"random");continue}if(i.selection===o.length){await _importTZConfig(e,t);continue}i.selection===r+1?await _addRandomItem(e,t):await _editRandomItem(e,t,o[i.selection])}}async function _addRandomItem(e,t){const a=await _pickItemFromInventory(e);if(!a)return;const n=await _askAmount(e,a);if(null===n)return;const o=await _askDescription(e),l=generateLotId(),i=makeStorageKey(l,0),r=captureItemFromSlot(e,a.slot,i);r&&(r.amount=n,t.lots.push({id:l,probability:1,description:o,items:[r]}),saveCrate(t),e.sendMessage(getPrefix()+_t(e,"itemDescConfirm")))}async function _editRandomItem(e,t,a){for(;;){const n=(new ActionFormData).title(_t(e,"editLotTitle")).button(_t(e,"btnDeleteLot")).button(_t(e,"btnBack")),o=await n.show(e).catch(()=>null);if(!o||o.canceled||1===o.selection)return;if(0===o.selection){for(const e of a.items??[])e.storageKey&&deleteShulkerStorage(e.storageKey);return t.lots=t.lots.filter(e=>e.id!==a.id),saveCrate(t),void e.sendMessage(getPrefix()+_t(e,"lotDeleted"))}}}async function openEditCrateConfig(e,t){const a=IDLE_PRESETS.map(e=>e.label),n=OPEN_ANIMATIONS.map(e=>e.label),o=Math.max(0,IDLE_PRESETS.findIndex(e=>e.value===t.idleParticle)),l=Math.max(0,OPEN_ANIMATIONS.findIndex(e=>e.value===t.openAnimation)),i=(new ModalFormData).title(_t(e,"editCrateFormTitle")).textField(_t(e,"wizardNameLabel"),_t(e,"wizardNamePlaceholder"),{defaultValue:t.name??""}).textField(_t(e,"wizardDescLabel"),_t(e,"wizardDescPlaceholder"),{defaultValue:t.description??""}).dropdown(_t(e,"wizardIdlePresetLabel"),a,{defaultValueIndex:o}).dropdown(_t(e,"wizardOpenAnimLabel"),n,{defaultValueIndex:l}).textField(_t(e,"maxUsesLabel"),"0",{defaultValue:String(t.maxUses??0)}).textField("§6§lItem de la Llave\n§r§7Item ID que abre esta crate (ej: minecraft:tripwire_hook)","minecraft:tripwire_hook",{defaultValue:t.key?.typeId??"minecraft:tripwire_hook"}).textField("§6§lNombre de la Llave","§6§lLlave de Crate",{defaultValue:t.key?.nameTag??"§6§lLlave de Crate"}).toggle(_t(e,"wizardShowLabelLabel"),{defaultValue:!1!==t.showLabel}),r=await i.show(e).catch(()=>null);if(!r||r.canceled)return;const[s,c,d,u,m,k,kn,f]=r.formValues;t.name=s?.trim()||null,t.description=c?.trim()||null,t.idleParticle=IDLE_PRESETS[d]?.value??"arcane",t.idleParticleType=t.idleParticle,t.customParticle=null,t.openAnimation=OPEN_ANIMATIONS[u]?.value??"vortex",t.maxUses=parseInt(m)||null,t.key=t.key??{},t.key.typeId=k?.trim()||t.key.typeId||"minecraft:tripwire_hook",t.key.nameTag=kn?.trim()||t.key.nameTag||"§6§lLlave de Crate",t.showLabel=!1!==f,saveCrate(t),e.sendMessage(getPrefix()+_t(e,"crateUpdated"))}async function openGiveKeysToPlayer(e,t){const{world:a}=await import("@minecraft/server"),n=a.getAllPlayers(),o=n.map(e=>e.name);if(0===o.length)return void e.sendMessage(getPrefix()+_t(e,"giveKeysPlayerNotFound",{name:"?"}));const l=(new ModalFormData).title(_t(e,"giveKeysTitle")).dropdown(_t(e,"giveKeysPlayerLabel"),o,{defaultValueIndex:0}).textField(_t(e,"giveKeysAmountLabel"),"1",{defaultValue:"1"}),i=await l.show(e).catch(()=>null);if(!i||i.canceled)return;const[r,s]=i.formValues,c=parseInt(s)||1,d=n[r];d?(giveKeys(d,t,c),e.sendMessage(getPrefix()+_t(e,"giveKeysDone",{amount:c,player:d.name}))):e.sendMessage(getPrefix()+_t(e,"giveKeysPlayerNotFound",{name:"?"}))}async function openOpeningLog(e,t){const a=t.openLog??[];if(0===a.length)return void e.sendMessage(_t(e,"noOpenings"));let n="";for(const e of a.slice(0,20)){const t=new Date(e.timestamp).toLocaleString();n+=`§e${e.player} §7— §a${e.lot} §7(${t})\n`}const o=(new MessageFormData).title(_t(e,"openLogTitle")).body(n).button1(_t(e,"btnBack")).button2(_t(e,"btnClose"));await o.show(e).catch(()=>null)}async function confirmDeleteCrate(e,t){const a=(new MessageFormData).title(_t(e,"deleteCrateTitle")).body(_t(e,"deleteCrateBody",{name:t.name??t.id})).button1(_t(e,"btnYesDelete")).button2(_t(e,"btnNoCancel")),n=await a.show(e).catch(()=>null);if(0!==n?.selection)return!1;if(t.entityId)try{const{world:e}=await import("@minecraft/server"),a=e.getDimension(t.location?.dimension??"overworld"),n=a.getEntities({type:"plugs:crate"});for(const e of n)if(e.id===t.entityId){try{const t=a.getEntities({type:"plugs:floating_text",location:e.location,maxDistance:3});for(const e of t)try{e.kill?.()}catch(e){}}catch(e){}try{e.kill?.()}catch(e){}break}}catch(e){}return deleteCrate(t.id),e.sendMessage(getPrefix()+_t(e,"crateDeleted",{name:t.name??t.id})),!0}async function _pickItemFromInventory(e){const t=e.getComponent("minecraft:inventory")?.container;if(!t)return null;const a=[];for(let e=0;e<t.size;e++)try{const n=t.getItem(e);n&&a.push({slot:e,item:n})}catch(e){}if(0===a.length)return e.sendMessage(getPrefix()+_t(e,"invPickerEmpty")),null;const n=(new ActionFormData).title(_t(e,"invPickerTitle"));for(const{item:e}of a){const t=e.nameTag||e.typeId.replace("minecraft:","");n.button(`§f${t}\n§7x${e.amount}`)}n.button(_t(e,"invPickerBack"));const o=await n.show(e).catch(()=>null);return!o||o.canceled||o.selection===a.length?null:a[o.selection]}async function _askAmount(e,t){const a=(new ModalFormData).title(_t(e,"itemAmountTitle")).textField(_t(e,"itemAmountLabel"),"1",{defaultValue:"1"}),n=await a.show(e).catch(()=>null);if(!n||n.canceled)return null;const o=parseInt(n.formValues[0]);return isNaN(o)||o<1?1:Math.min(o,64)}async function _askProbability(e){const t=(new ModalFormData).title(_t(e,"addLotTitle")).textField(_t(e,"lotProbLabel"),"50",{defaultValue:"50"}),a=await t.show(e).catch(()=>null);return!a||a.canceled?null:parseFloat(a.formValues[0])||10}async function _askDescription(e){const t=(new ModalFormData).title(_t(e,"itemDescTitle")).textField(_t(e,"itemDescLabel"),_t(e,"itemDescPlaceholder"),{defaultValue:""}),a=await t.show(e).catch(()=>null);if(!a||a.canceled)return null;const n=a.formValues[0]?.trim();return n?n.split("/n").map(e=>e.trim()).filter(Boolean).join("\n"):null}async function openGetKeysMenu(e){for(;;){const t=getAllCrates(),a=Object.keys(t);if(0===a.length)return void e.sendMessage(_t(e,"noCreatesYet"));const n=(new ActionFormData).title(_t(e,"getKeysTitle"));for(const e of a)n.button(`§e${t[e].name??e}`);n.button(_t(e,"btnBack"));const o=await n.show(e).catch(()=>null);if(!o||o.canceled||o.selection===a.length)return;const l=t[a[o.selection]];await openGiveKeysToPlayer(e,l)}}

async function _respawnCrate(e, t) {
    if (!t.location) {
        e.sendMessage(getPrefix() + "§cEsta crate no tiene ubicación guardada. Coloca un spawner manualmente.");
        return;
    }
    try {
        const { world, system } = await import("@minecraft/server");
        const { linkEntityToCrate, markPendingRespawn } = await import("./CrateSystem.js");
        const dim = world.getDimension(t.location.dimension ?? "overworld");
        const loc = { x: t.location.x, y: t.location.y, z: t.location.z };

        // Matar entidad anterior si sigue existiendo
        if (t.entityId) {
            try {
                const existing = dim.getEntities({ type: "plugs:crate" });
                for (const ent of existing) {
                    if (ent.id === t.entityId) {
                        try { ent.kill?.(); } catch {}
                        break;
                    }
                }
            } catch {}
        }

        // Marcar que el próximo spawn de plugs:crate en esta posición es un respawn de esta crate
        markPendingRespawn(t.id, loc);

        system.runTimeout(() => {
            try {
                const newEntity = dim.spawnEntity("plugs:crate", loc);
                if (!newEntity) {
                    e.sendMessage(getPrefix() + "§cNo se pudo spawnear la crate.");
                    return;
                }
                linkEntityToCrate(newEntity, t.id);
                e.sendMessage(getPrefix() + `§a✓ Crate §e${t.name ?? t.id} §arespawneada en §7${Math.floor(loc.x)}, ${Math.floor(loc.y)}, ${Math.floor(loc.z)}`);
            } catch (err) {
                e.sendMessage(getPrefix() + "§cError al spawnear: " + err);
            }
        }, 2);
    } catch (err) {
        e.sendMessage(getPrefix() + "§cError al respawnear: " + err);
    }
}

async function _importTZConfig(player, crate) {
    const { openTZPickerForCrate } = await import("./CrateTZImporter.js");
    await openTZPickerForCrate(player, crate);
}

async function _addAllInventoryItems(player, crate, mode) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;

    const items = [];
    for (let slot = 0; slot < container.size; slot++) {
        try {
            const item = container.getItem(slot);
            if (item) items.push({ slot, item });
        } catch {}
    }

    if (items.length === 0) {
        player.sendMessage(getPrefix() + "§cNo tienes items en el inventario.");
        return;
    }

    let added = 0;

    if (mode === "pack") {
        // Crear un solo pack con todos los items
        const lotId = generateLotId();
        const packItems = [];
        for (const { slot, item } of items) {
            const storageKey = makeStorageKey(lotId, packItems.length);
            const captured = captureItemFromSlot(player, slot, storageKey);
            if (captured) {
                captured.amount = item.amount;
                packItems.push(captured);
            }
        }
        if (packItems.length > 0) {
            crate.lots.push({
                id: lotId,
                packName: "Pack completo",
                probability: 10,
                description: "Importado desde inventario",
                items: packItems
            });
            added = packItems.length;
        }
    } else {
        // single / random: cada item es un lote/premio separado
        for (const { slot, item } of items) {
            const lotId = generateLotId();
            const storageKey = makeStorageKey(lotId, 0);
            const captured = captureItemFromSlot(player, slot, storageKey);
            if (!captured) continue;
            captured.amount = item.amount;
            if (mode === "single") {
                crate.lots.push({
                    id: lotId,
                    probability: 10,
                    description: "Importado desde inventario",
                    items: [captured]
                });
            } else {
                crate.lots.push({
                    id: lotId,
                    probability: 1,
                    description: "Importado desde inventario",
                    items: [captured]
                });
            }
            added++;
        }
    }

    if (added > 0) {
        saveCrate(crate);
        player.sendMessage(getPrefix() + `§a✓ §e${added} §aitem${added !== 1 ? "s" : ""} agregado${added !== 1 ? "s" : ""} a la crate.`);
    } else {
        player.sendMessage(getPrefix() + "§cNo se pudo capturar ningún item.");
    }
}
