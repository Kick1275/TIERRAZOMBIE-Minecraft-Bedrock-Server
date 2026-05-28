import {world,system,ItemComponentRegistry, World} from "@minecraft/server";

system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.itemComponentRegistry.registerCustomComponent("causal:grappling_hook", {
        onUse(ItemComponentUseEvent,CustomComponentParameters) {
            const {source,itemStack} = ItemComponentUseEvent;
            const {params} = CustomComponentParameters;
            let hook = params.hook ?? "causal:hook"
            const hookEntity = source.dimension.getEntities({"tags":[`owner:${source.id}`]})[0] ?? undefined
            // If hook exists, remove it
            if (!params.autoPull && source.isSneaking){
                const toggleAutoPull = source.getDynamicProperty("causal:toggleAutoPull") ?? false
                if(toggleAutoPull == true){
                    source.onScreenDisplay.setActionBar("Auto pull : OFF")
                    source.setDynamicProperty("causal:toggleAutoPull",false)
                    //source.sendMessage(`${toggleAutoPull.toString()}`)
                }else{
                    source.onScreenDisplay.setActionBar("Auto pull : ON")
                    source.setDynamicProperty("causal:toggleAutoPull",true)
                    //source.sendMessage(`${toggleAutoPull.toString()}`)
                }
                return
            }
            if(hookEntity){
                hookEntity.triggerEvent("causal:on_unleash")
            }
            // Shoot new hook
            const playerVelocity = source.getVelocity();
            const playerSpeed = Math.sqrt(
                playerVelocity.x * playerVelocity.x + 
                playerVelocity.y * playerVelocity.y + 
                playerVelocity.z * playerVelocity.z
            );
            //source.sendMessage(`${JSON.stringify(params)}`)
            //source.sendMessage(`speed: ${playerSpeed}`)
            
            const hookShootSpeed = params.shootSpeed ?? 1
            const momentumShootSpeed = params.momentumShootSpeed ?? 1
            const maxMomentumShootSpeed = params.maxMomentumShootSpeed ?? 1
            shootHook(source, hook, source.location, hookShootSpeed + Math.min(playerSpeed * momentumShootSpeed,maxMomentumShootSpeed), 1,params);
        }
    })
})
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
// Track projectile trail while it's flying (every 5 ticks)
system.runInterval(()=>{
    for(const hook of world.getDimension('overworld').getEntities({type: "causal:hook"})){
        if(!hook.getDynamicProperty("causal:hitBlock")){
            // Get existing trail or create new one
            let trail = JSON.parse(hook.getDynamicProperty("causal:trail") ?? "[]");
            
            // Add current position to trail
            const pos = hook.location;
            trail.push({x: pos.x, y: pos.y, z: pos.z});
            
            // Keep trail reasonable size (max 100 points)
            if(trail.length > 144){
                trail.shift();
            }
            
            // Save trail back to hook
            hook.setDynamicProperty("causal:trail", JSON.stringify(trail));
        }
    }
}, 6)
function animationAttachable(anim,player){
    if(anim){
        player.playAnimation(`animation.causal.grappling.dummy1`, { controller: `dummy`, stopExpression: `t.player_name = '${player?.name}'; t.hide_bone = true; return true;` }); 
    }
    else{
        player.playAnimation(`animation.causal.grappling.dummy2`, { controller: `dummy`, stopExpression: `t.player_name = '${player?.name}'; t.hide_bone = false; return true;` })
    }
}
world.afterEvents.projectileHitBlock.subscribe((eventData)=>{
    const {source,projectile,block} = eventData
    source.setDynamicProperty("causal:maxDistance",null)
    if (projectile.typeId == "causal:hook" && projectile){
        projectile.setDynamicProperty("causal:hitBlock",true)
        const dir=source.getViewDirection()
        //source.applyKnockback({x:dir.x*10,z:dir.z*10},0.2)
        // Auto-enable pull when hitting a block
        const params = JSON.parse(projectile.getDynamicProperty("causal:parentParams"))
        if(params.autoPull){
            projectile.setDynamicProperty("causal:pull",true)
        }
        source.playSound("land.chain")
        // Add final position to trail
        let trail = JSON.parse(projectile.getDynamicProperty("causal:trail") ?? "[]");
        const pos = projectile.location;
        trail.push({x: pos.x, y: pos.y, z: pos.z});
        projectile.setDynamicProperty("causal:trail", JSON.stringify(trail));
    }
})

system.runInterval(()=>{
    for (const player of world.getAllPlayers()){
        const hookEntity = player.dimension.getEntities({"tags":[`owner:${player.id}`]})[0] ?? undefined
        const grappling_insurance = player.getDynamicProperty("causal:grappling_insurance") ?? 0
        const toggleAutoPull = player.getDynamicProperty("causal:toggleAutoPull") ?? false
        if (grappling_insurance){
            //player.sendMessage(`issurance : ${grappling_insurance}`)
            const blockBelow = player.dimension.getBlockBelow(player.location,{includeLiquidBlock:false,includePassableBlocks:true})
            //player.sendMessage(blockBelow?.typeId)
            //player.sendMessage(`how close til u die: ${player.location.y - blockBelow?.location.y }`)
            if ((player.location.y - (blockBelow?.location.y + 1)) < 4.14 && player.location.y - (blockBelow?.location.y + 1)  > 2.22  ){
                player.addEffect("slow_falling",2,{showParticles:true,amplifier:0})
                //player.sendMessage("iss")
                
            }
        }
        if(!hookEntity){
            animationAttachable(0,player)
            if(grappling_insurance > 0){
                player.setDynamicProperty("causal:grappling_insurance",grappling_insurance - 1)
            }
             return
        }
        //player.playAnimation("animation.player.causal.grappling.shoot")
        animationAttachable(1,player)
        const playerLoc = player.location
        const hookLoc = hookEntity.location
        const params = JSON.parse(hookEntity.getDynamicProperty("causal:parentParams"))
        
        // Remove hook if too far
        if(distanceTo(hookLoc,playerLoc) > (params.ropeLength ?? 32)){
            //player.sendMessage("broke")
            player.playSound("lead.break")
            hookEntity.remove()
            return
        }
        const item = player.getComponent("equippable").getEquipment("Mainhand") 
        
        if(!params.autoPull && hookEntity.getDynamicProperty("causal:hitBlock")){
            if(player.isJumping){
                hookEntity.setDynamicProperty("causal:pull",true)
            }else{
                hookEntity.setDynamicProperty("causal:pull",false)
            }
        }
        // Pull player if pull is enabled
        if ((hookEntity.getDynamicProperty("causal:pull") || player.getDynamicProperty("causal:toggleAutoPull")) && hookEntity.getDynamicProperty("causal:hitBlock")){
            // Get the projectile trail
            
            player.setDynamicProperty("causal:grappling_insurance",100)
            let trail = JSON.parse(hookEntity.getDynamicProperty("causal:trail") ?? "[]");
            
            if(trail.length > 0){
                // Find the closest point on the trail to the player
                let closestPoint = null;
                let closestDistance = Infinity;
                let closestIndex = 0;
                
                for(let i = 0; i < trail.length; i++){
                    const dist = distanceTo(playerLoc, trail[i]);
                    if(dist < closestDistance){
                        closestDistance = dist;
                        closestPoint = trail[i];
                        closestIndex = i;
                    }
                }
                
                // Get the next point along the trail (toward the hook)
                let targetPoint;
                if(closestIndex < trail.length - 1){
                    // Move toward next point on trail
                    targetPoint = trail[closestIndex + 1];
                } else {
                    // We're at the end, move to hook
                    targetPoint = hookLoc;
                }
                
                // Calculate pull force toward the target point
                const direction = directionTo(playerLoc, targetPoint);
                const distance = distanceTo(playerLoc, targetPoint);
                if(player.isSneaking && hookEntity.getDynamicProperty("causal:hitBlock") && params.autoPull){
                    player.setDynamicProperty("causal:maxDistance",distance)
                }
                const maxDist = player.getDynamicProperty("causal:maxDistance") ?? params.defaultMaxDistance ?? 3
                
                if (distance > maxDist){
                    const pullForce = {
                        x: direction.x * Math.min(distance * (params.pullMomentum ?? 0.02),params.maxPullMomentum ?? 0.02),
                        y: direction.y * Math.min(distance * (params.pullMomentum ?? 0.02),params.maxPullMomentum ?? 0.02),
                        z: direction.z * Math.min(distance * (params.pullMomentum ?? 0.02),params.maxPullMomentum ?? 0.02)
                    };
                    //player.playSound("block.weeping_vines.jump")
                    player.applyImpulse(pullForce);
                }
                
                // Extra upward boost when jumping
                if(player.isJumping && distance < 3 && params.autoPull == true){
                    const upwardForce = {
                        x: 0,
                        y: direction.y * (distanceTo(hookLoc,playerLoc) * 0.045),
                        z: 0
                    };
                    
                    player.applyImpulse(upwardForce);
                }
                
                // Check if player is stuck (not moving while pulling)
                const velocity = player.getVelocity();
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
                
                if(speed < 0.1 && distance > 2){
                    const stuckTime = hookEntity.getDynamicProperty("causal:stuckTime") ?? 0;
                    hookEntity.setDynamicProperty("causal:stuckTime", stuckTime + 1);
                    
                    if(stuckTime > 60){
                        hookEntity.remove();
                        player.playSound("lead.break");
                        player.sendMessage("§cGrappling hook broke");
                        return;
                    }
                } else {
                    hookEntity.setDynamicProperty("causal:stuckTime", 0);
                }
            }
        }
    }
})

world.beforeEvents.playerInteractWithBlock.subscribe((eventData)=>{
    const {player,itemStack,block} = eventData
    if(!itemStack)return
    if (itemStack.typeId == "causal:grappling_hook"){
        if (block.typeId.includes("fence")&&!block.typeId.includes("gate")){
            eventData.cancel = true
        }
    }
})

world.afterEvents.playerHotbarSelectedSlotChange.subscribe((eventData)=>{
    const {previousSlotSelected,player} = eventData
    const previousItemStack = player.getComponent("inventory").container.getItem(previousSlotSelected)
    const hookEntity = player.dimension.getEntities({"tags":[`owner:${player.id}`]})[0] ?? undefined
    try{
        if(previousItemStack.typeId == "causal:grappling_hook" && hookEntity){
            hookEntity.triggerEvent("causal:on_unleash")
        }
    } catch {}
})

function shootHook(source, projectileType, sourcelocation, velocityMultiplier, accuracy,parentParams) {
    const view = source.getViewDirection()
    const location = { x: sourcelocation.x, y: sourcelocation.y + 1, z: sourcelocation.z };
    let velocity = { x: view.x * velocityMultiplier, y: view.y * velocityMultiplier, z: view.z * velocityMultiplier };
    const hook = world.getDimension('overworld').spawnEntity(projectileType, location);
    const projectileComp = hook.getComponent('minecraft:projectile');
    projectileComp.owner = source;
    hook.addTag(`owner:${source.id}`)
    projectileComp?.shoot(velocity, {
        uncertainty: accuracy,
    });
    const rope = hook.getComponent("leashable")
    rope.leashTo(source)
    
    // Initialize empty trail
    hook.setDynamicProperty("causal:trail", "[]");
    hook.setDynamicProperty("causal:parentParams",JSON.stringify(parentParams))
}

function directionTo(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (length === 0) {
        return { x: 0, y: 0, z: 0 };
    }

    return {
        x: dx / length,
        y: dy / length,
        z: dz / length
    };
}

function distanceTo(from, to) {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const dz = to.z - from.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}
