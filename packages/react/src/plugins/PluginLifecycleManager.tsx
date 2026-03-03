import { useEffect, useRef } from 'react'

import { usePlugins } from './PluginContext'

import type { WalletUIPlugin } from './types'

/**
 * Safely invoke a plugin lifecycle hook, catching both sync and async errors.
 */
function safeInvoke(plugin: WalletUIPlugin, fn: () => void | Promise<void>) {
  try {
    const result = fn()
    if (result && typeof result.catch === 'function') {
      result.catch((err) => {
        console.error(
          `[WalletUI] Plugin "${plugin.id}" lifecycle hook error:`,
          err,
        )
      })
    }
  } catch (err) {
    console.error(
      `[WalletUI] Plugin "${plugin.id}" lifecycle hook error:`,
      err,
    )
  }
}

/**
 * Monitors wallet state changes and invokes plugin lifecycle hooks.
 * Detects connect, disconnect, and account change transitions.
 *
 * Must be rendered inside PluginContextProvider to access the
 * enriched render context with working openDialog/closeDialog.
 */
export function PluginLifecycleManager() {
  const { plugins, renderContext: ctx } = usePlugins()

  const prevAddressRef = useRef<string | null>(null)
  const prevWalletIdRef = useRef<string | null>(null)

  useEffect(() => {
    const prevAddress = prevAddressRef.current
    const prevWalletId = prevWalletIdRef.current
    const currentWalletId = ctx.activeWallet?.id ?? null

    // Detect connection (no wallet → has wallet)
    if (!prevWalletId && currentWalletId) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onConnect) {
          safeInvoke(plugin, () => plugin.lifecycle!.onConnect!(ctx))
        }
      }
    }

    // Detect disconnection (had wallet → no wallet)
    if (prevWalletId && !currentWalletId) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onDisconnect) {
          safeInvoke(plugin, () => plugin.lifecycle!.onDisconnect!())
        }
      }
    }

    // Detect account change (wallet still connected, address changed)
    if (
      currentWalletId &&
      prevAddress &&
      ctx.activeAddress &&
      prevAddress !== ctx.activeAddress
    ) {
      for (const plugin of plugins) {
        if (plugin.lifecycle?.onAccountChange) {
          plugin.lifecycle.onAccountChange(ctx.activeAddress, prevAddress, ctx)
        }
      }
    }

    prevAddressRef.current = ctx.activeAddress
    prevWalletIdRef.current = currentWalletId
  }, [ctx, plugins])

  return null
}
