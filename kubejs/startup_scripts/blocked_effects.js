/*
*    This File has been authored by AllTheMods Staff, or a Community contributor for use in `All the Magic: Arcana` by ATMTeam.
*    As all AllTheMods packs are licensed under All Rights Reserved, this file is not allowed to be used in any public packs not released by the AllTheMods Team, without explicit permission.
*/
let ARCANA_BLOCKED_EFFECTS = [
    `ess_requiem:protection_of_ash`,
]

StartupEvents.postInit(() => {
    if (ARCANA_BLOCKED_EFFECTS.length == 0) return

    let $BuiltInRegistries = Java.loadClass("net.minecraft.core.registries.BuiltInRegistries")
    let $ResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation")
    let $NeoForge = Java.loadClass("net.neoforged.neoforge.common.NeoForge")
    let $EventPriority = Java.loadClass("net.neoforged.bus.api.EventPriority")
    let $Applicable = Java.loadClass("net.neoforged.neoforge.event.entity.living.MobEffectEvent$Applicable")
    let $ApplicableResult = Java.loadClass("net.neoforged.neoforge.event.entity.living.MobEffectEvent$Applicable$Result")
    let $PlayerLoggedIn = Java.loadClass("net.neoforged.neoforge.event.entity.player.PlayerEvent$PlayerLoggedInEvent")

    let blockedEffects = []
    let blockedHolders = []
    let i = 0
    let id = null
    let effect = null
    let holder = null

    for (i = 0; i < ARCANA_BLOCKED_EFFECTS.length; i++) {
        id = $ResourceLocation.parse(ARCANA_BLOCKED_EFFECTS[i])
        effect = $BuiltInRegistries.MOB_EFFECT.get(id)
        if (effect == null) {
            console.warn("[arcana] blocked effect " + ARCANA_BLOCKED_EFFECTS[i] + " is not registered, skipping")
            continue
        }
        blockedEffects.push(effect)
        holder = $BuiltInRegistries.MOB_EFFECT.getHolder(id).orElse(null)
        if (holder == null) {
            console.warn("[arcana] no holder for " + ARCANA_BLOCKED_EFFECTS[i] + ", existing carriers will not be cleared")
        } else {
            blockedHolders.push(holder)
        }
    }

    if (blockedEffects.length == 0) return

    $NeoForge.EVENT_BUS.addListener($EventPriority.HIGHEST, false, $Applicable, (event) => {
        let value = event.getEffectInstance().getEffect().value()
        let j = 0
        for (j = 0; j < blockedEffects.length; j++) {
            if (blockedEffects[j].equals(value)) {
                event.setResult($ApplicableResult.DO_NOT_APPLY)
                return
            }
        }
    })

    if (blockedHolders.length == 0) return

    $NeoForge.EVENT_BUS.addListener($PlayerLoggedIn, (event) => {
        let player = event.getEntity()
        let j = 0
        for (j = 0; j < blockedHolders.length; j++) {
            if (player.hasEffect(blockedHolders[j])) {
                player.removeEffect(blockedHolders[j])
                console.info("[arcana] cleared " + blockedHolders[j].getRegisteredName()
                    + " from " + player.getName().getString())
            }
        }
    })

    console.info("[arcana] blocking " + blockedEffects.length + " mob effect(s)")
})
