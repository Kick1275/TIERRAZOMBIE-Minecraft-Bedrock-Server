import{system as r}from"@minecraft/server";function n(e,t){r.afterEvents.scriptEventReceive.subscribe(i=>{i.id==="dev:"+e&&t()},{namespaces:["dev"]})}export{n as doOn};
