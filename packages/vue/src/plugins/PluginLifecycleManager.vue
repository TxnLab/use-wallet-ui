<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlugins } from './pluginContext'
import type { WalletUIPlugin } from './types'

const { plugins, renderContext: ctx } = usePlugins()

const prevAddressRef = ref<string | null>(null)
const prevWalletIdRef = ref<string | null>(null)

function safeInvoke(
  plugin: WalletUIPlugin,
  fn: () => void | Promise<void>,
): void {
  try {
    const result = fn()
    if (result && typeof (result as Promise<void>).catch === 'function') {
      ;(result as Promise<void>).catch((err: unknown) => {
        console.error(
          `[WalletUI] Plugin "${plugin.id}" lifecycle hook error:`,
          err,
        )
      })
    }
  } catch (err) {
    console.error(`[WalletUI] Plugin "${plugin.id}" lifecycle hook error:`, err)
  }
}

watch(
  () => ctx.activeAddress,
  (currentAddress) => {
    const prevAddress = prevAddressRef.value
    const prevWalletId = prevWalletIdRef.value
    const currentWalletId = ctx.activeWallet?.id ?? null

    if (!prevWalletId && currentWalletId) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onConnect) {
          safeInvoke(plugin, () => plugin.lifecycle!.onConnect!(ctx))
        }
      }
    }

    if (prevWalletId && !currentWalletId) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onDisconnect) {
          safeInvoke(plugin, () => plugin.lifecycle!.onDisconnect!())
        }
      }
    }

    if (
      currentWalletId &&
      prevAddress &&
      currentAddress &&
      prevAddress !== currentAddress
    ) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onAccountChange) {
          plugin.lifecycle.onAccountChange(currentAddress, prevAddress, ctx)
        }
      }
    }

    prevAddressRef.value = currentAddress
    prevWalletIdRef.value = currentWalletId
  },
  { immediate: true },
)
</script>

<template></template>
