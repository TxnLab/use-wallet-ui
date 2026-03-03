import { useEffect, useRef } from 'react'

import type { PluginRenderContext, WalletUIPlugin } from './types'

/**
 * Monitors wallet state changes and invokes plugin lifecycle hooks.
 * Detects connect, disconnect, and account change transitions.
 */
export function PluginLifecycleManager({
  plugins,
  ctx,
}: {
  plugins: WalletUIPlugin[]
  ctx: PluginRenderContext
}) {
  const prevAddressRef = useRef<string | null>(null)
  const prevWalletIdRef = useRef<string | null>(null)

  useEffect(() => {
    const prevAddress = prevAddressRef.current
    const prevWalletId = prevWalletIdRef.current
    const currentWalletId = ctx.activeWallet?.id ?? null

    // Detect connection (no wallet → has wallet)
    if (!prevWalletId && currentWalletId) {
      for (const plugin of plugins) {
        plugin.lifecycle?.onConnect?.(ctx)
      }
    }

    // Detect disconnection (had wallet → no wallet)
    if (prevWalletId && !currentWalletId) {
      for (const plugin of plugins) {
        plugin.lifecycle?.onDisconnect?.()
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
        plugin.lifecycle?.onAccountChange?.(ctx.activeAddress, prevAddress, ctx)
      }
    }

    prevAddressRef.current = ctx.activeAddress
    prevWalletIdRef.current = currentWalletId
  }, [ctx.activeAddress, ctx.activeWallet, plugins, ctx])

  return null
}
