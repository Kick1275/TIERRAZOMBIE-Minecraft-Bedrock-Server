import { world, system, TicksPerSecond } from '@minecraft/server';

const itemIDs = {
    'krep:hk416':     () => ["§fI've seen this somewhere, but never mind, I think this is my wife now.", "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:hk416_emp': () => ["§fI've seen this somewhere, but never mind, I think this is my wife now.", "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:qbz95':     () => ["§fHard hitter from the East.",                                              "§r§f", "§r§fCaliber : 5.8x42mm",       "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:qbz95_emp': () => ["§fHard hitter from the East.",                                              "§r§f", "§r§fCaliber : 5.8x42mm",       "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:qbz191':    () => ["§fProof that bullpup puberty phase is over!",                               "§r§f", "§r§fCaliber : 5.8x42mm",       "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:qbz191_emp':() => ["§fProof that bullpup puberty phase is over!",                               "§r§f", "§r§fCaliber : 5.8x42mm",       "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:akm':       () => ["§fFrom jungles to bays, it's always present.",                              "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:akm_emp':   () => ["§fFrom jungles to bays, it's always present.",                              "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:type81':    () => ["§fTrustworthy",                                                             "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:type81_emp':() => ["§fTrustworthy",                                                             "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:sks':       () => ["§fGrandpa got a facelift, still kicking.",                                  "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 11",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:sks_emp':   () => ["§fGrandpa got a facelift, still kicking.",                                  "§r§f", "§r§fCaliber : 7.62x39mm",      "§r§fDamage : 11",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:scarl':     () => ["§fLight, stable, and accurate, but... its.. Yellow.",                       "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:scarl_emp': () => ["§fLight, stable, and accurate, but... its.. Yellow.",                       "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g36':       () => ["§fPolymer Tech, Boy!",                                                     "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g36_emp':   () => ["§fPolymer Tech, Boy!",                                                     "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m249':      () => ["§fGulf War Syndrom with 100 Bullets!",                                     "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m249_emp':  () => ["§fGulf War Syndrom with 100 Bullets!",                                     "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:minigun':   () => ["§6Burn me to the ground!",                                                 "§r§f", "§r§fCaliber : .308 Winchester Ammo Box", "§r§fDamage : 6", "§r§f", "§r§1TACZ Default Pack"],
    'krep:minigun_emp':()=> ["§6Burn me to the ground!",                                                 "§r§f", "§r§fCaliber : .308 Winchester Ammo Box", "§r§fDamage : 6", "§r§f", "§r§1TACZ Default Pack"],
    'krep:m4a1':      () => ["§fSoldiers' love, wife, and mistress.",                                    "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m4a1_emp':  () => ["§fSoldiers' love, wife, and mistress.",                                    "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 7",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:mp7':       () => ["§fBody Penetrator Pocket Edition.",                                        "§r§f", "§r§fCaliber : 4.6x30mm",       "§r§fDamage : 4",    "§r§f", "§r§1Timeless and Classic Pack"],
    'krep:mp7_emp':   () => ["§fBody Penetrator Pocket Edition.",                                        "§r§f", "§r§fCaliber : 4.6x30mm",       "§r§fDamage : 4",    "§r§f", "§r§1Timeless and Classic Pack"],
    'krep:awp':       () => ["§fUnquestionably precious.",                                               "§r§f", "§r§fCaliber : .338 Lapua",      "§r§fDamage : 42",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:awp_emp':   () => ["§fUnquestionably precious.",                                               "§r§f", "§r§fCaliber : .338 Lapua",      "§r§fDamage : 42",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:g3':        () => ["§fThe other arm of the free world.",                                       "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g3_emp':    () => ["§fThe other arm of the free world.",                                       "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:evolys':    () => ["§fHey, this is an integrated receiver... what are you doing!?",            "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 10",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:evolys_emp':() => ["§fHey, this is an integrated receiver... what are you doing!?",            "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 10",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:fal':       () => ["§fThe right arm of the free world.",                                      "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:fal_emp':   () => ["§fThe right arm of the free world.",                                      "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:aa12':      () => ["§fCan you repeat what you said? 12 pellets is too loud for me.",          "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:aa12_emp':  () => ["§fCan you repeat what you said? 12 pellets is too loud for me.",          "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:saiga12':   () => ["§fRussian chin breaker",                                                  "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Krep's Custom Pack"],
    'krep:saiga12_emp':()=> ["§fRussian chin breaker",                                                  "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Krep's Custom Pack"],
    'krep:m870':      () => ["§fClassic and cheap for chin crusher.",                                   "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 3x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:m870_emp':  () => ["§fClassic and cheap for chin crusher.",                                   "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 3x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:m1014':     () => ["§fThe deadliest Italian Dessert for Catacombs party.",                    "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:m1014_emp': () => ["§fThe deadliest Italian Dessert for Catacombs party.",                    "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 2x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:db':        () => ["§fYour target cant withstand second shot.",                               "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 3x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:db_emp':    () => ["§fYour target cant withstand second shot.",                               "§r§f", "§r§fCaliber : 12 Gauge",        "§r§fDamage : 3x12", "§r§f", "§r§1TACZ Default Pack"],
    'krep:m16a1':     () => ["§fGood Morning Vietnam!.",                                               "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m16a1_emp': () => ["§fGood Morning Vietnam!.",                                               "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m16':       () => ["§fFreedom on burst, Occupation on safe.",                                "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m16_emp':   () => ["§fFreedom on burst, Occupation on safe.",                                "§r§f", "§r§fCaliber : 5.56x45mm",      "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:p90':       () => ["§fIsn't this supposed to be pink?",                                      "§r§f", "§r§fCaliber : 5.7x28mm AP",    "§r§fDamage : 4",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:p90_emp':   () => ["§fIsn't this supposed to be pink?",                                      "§r§f", "§r§fCaliber : 5.7x28mm AP",    "§r§fDamage : 4",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:vector':    () => ["§fYes, it uses up all your ammo in 1 second.",                           "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 4",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:vector_emp':() => ["§fYes, it uses up all your ammo in 1 second.",                           "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 4",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:m1911':     () => ["§fOne hand is enough to reject retirement in modern times.",             "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 11",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:m1911_emp': () => ["§fOne hand is enough to reject retirement in modern times.",             "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 11",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:p320':      () => ["§fDont drop it, or he'll decide to shoot you.",                         "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 10",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:p320_emp':  () => ["§fDont drop it, or he'll decide to shoot you",                          "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 10",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:deagle':    () => ["§fNot everything that is big will be liked by many people.",            "§r§f", "§r§fCaliber : .50 Action Express","§r§fDamage : 16",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:deagle_emp':() => ["§fNot everything that is big will be liked by many people.",            "§r§f", "§r§fCaliber : .50 Action Express","§r§fDamage : 16",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:t50':       () => ["§fLet it all start from zero again.",                                   "§r§f", "§r§fCaliber : .50 Action Express","§r§fDamage : 16",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:t50_emp':   () => ["§fLet it all start from zero again.",                                   "§r§f", "§r§fCaliber : .50 Action Express","§r§fDamage : 16",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:deagleg':   () => ["§fPrecise flexing.",                                                    "§r§f", "§r§fCaliber : .357 Magnum",      "§r§fDamage : 12",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:deagleg_emp':()=> ["§fPrecise flexing.",                                                    "§r§f", "§r§fCaliber : .357 Magnum",      "§r§fDamage : 12",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:cp':        () => ["§fMidday duel superstar, but dont call him by acronyms!",               "§r§f", "§r§fCaliber : .357 Magnum",      "§r§fDamage : 12",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:cp_emp':    () => ["§fMidday duel superstar, but dont call him by acronyms!",               "§r§f", "§r§fCaliber : .357 Magnum",      "§r§fDamage : 12",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:mp5':       () => ["§fSlapped by the little one, That's too dirty....",                     "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:mp5_emp':   () => ["§fSlapped by the little one, That's too dirty.....",                    "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:ump':       () => ["§fBudget buster, Waifu certified",                                      "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage : 6.7",  "§r§f", "§r§1TACZ Default Pack"],
    'krep:ump_emp':   () => ["§fBudget buster, Waifu certified",                                      "§r§f", "§r§fCaliber : .45 ACP",         "§r§fDamage :6.7",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:uzi':       () => ["§fShooting over the promised land.",                                    "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:uzi_emp':   () => ["§fShooting over the promised land.",                                    "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 5",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g17':       () => ["§fThe little one who act like skip button in endless debate.",          "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g17_emp':   () => ["§fThe little one who act like skip button in endless debate.",          "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 6",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:g18':       () => ["§fToo fast for a pocket-sized backup",                                 "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 3",    "§r§f", "§r§1Timeless and Classic Pack"],
    'krep:g18_emp':   () => ["§fToo fast for a pocket-sized backup",                                 "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 3",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:b93':       () => ["§fThree-round burst of Italian overengineering",                       "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 4",    "§r§f", "§r§1Timeless and Classic Pack"],
    'krep:b93_emp':   () => ["§fThree-round burst of Italian overengineering.",                      "§r§f", "§r§fCaliber : 9x19mm",           "§r§fDamage : 4",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:scarh':     () => ["§fThe only bad thing for expensive things, is the expense.",           "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:scarh_emp': () => ["§fThe only bad thing for expensive things, is the expense.",           "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 9",    "§r§f", "§r§1TACZ Default Pack"],
    'krep:mk14':      () => ["§fNot born on the wrong date, just on the wrong place.",               "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 13",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:mk14_emp':  () => ["§fNot born on the wrong date, just on the wrong place.",               "§r§f", "§r§fCaliber : .308 Winchester", "§r§fDamage : 13",   "§r§f", "§r§1TACZ Default Pack"],
    'krep:rpg':       () => ["§fThere's nothing the RPG can't deal... except one more shot!",        "§r§f", "§r§fCaliber : RPG-7 Rocket",     "§r§fDamage : 100",  "§r§f", "§r§1TACZ Default Pack"],
    'krep:rpg_emp':   () => ["§fThere's nothing the RPG can't deal... except one more shot!",        "§r§f", "§r§fCaliber : RPG-7 Rocket",     "§r§fDamage : 100",  "§r§f", "§r§1TACZ Default Pack"]
};

class ItemLoreManager {
    constructor(player) {
        this.player    = player;
        this.inventory = player.getComponent('inventory').container;
    }

    updateItemLore(item, slot) {
        if (!item) return;
        if (itemIDs[item.typeId]) {
            if (!item.getLore() || item.getLore().length === 0) {
                item.setLore(itemIDs[item.typeId]());
            }
        }
        this.inventory.setItem(slot, item);
    }

    updateInventory() {
        for (let i = 0; i < this.inventory.size; i++) {
            const item = this.inventory.getItem(i);
            this.updateItemLore(item, i);
        }
    }
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        new ItemLoreManager(player).updateInventory();
    }
}, TicksPerSecond);
