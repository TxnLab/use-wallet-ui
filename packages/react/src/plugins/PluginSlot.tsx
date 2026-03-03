import React from 'react'

import { usePlugins } from './PluginContext'

import type { MenuRenderContext, MenuSlot } from './types'

/**
 * Renders plugin menu items for a given slot.
 * Place this component at each named slot position in ConnectedWalletMenu.
 */
export function PluginSlot({
  slot,
  ctx,
}: {
  slot: MenuSlot
  ctx: MenuRenderContext
}) {
  const { menuItemsBySlot } = usePlugins()
  const items = menuItemsBySlot[slot]

  if (!items || items.length === 0) return null

  return (
    <>
      {items
        .filter((item) => !item.enabled || item.enabled(ctx))
        .map((item) => (
          <React.Fragment key={item.key}>{item.render(ctx)}</React.Fragment>
        ))}
    </>
  )
}
