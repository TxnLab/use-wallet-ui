import { FloatingPortal } from '@floating-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { useWalletUI } from '../providers/WalletUIProvider'

import { usePlugins } from './PluginContext'

import type { PluginRenderContext } from './types'

/**
 * Renders all open plugin dialogs via FloatingPortal.
 * Centralizes the QueryClientProvider wrapping needed to fix
 * FloatingPortal context inheritance issues.
 */
export function PluginDialogRenderer({ ctx }: { ctx: PluginRenderContext }) {
  const { dialogs, openDialogs, closeDialog } = usePlugins()
  const { queryClient, theme } = useWalletUI()

  const dataTheme = theme === 'system' ? undefined : theme

  return (
    <>
      {dialogs.map((dialog) => {
        const isOpen = openDialogs.has(dialog.key)
        if (!isOpen) return null

        return (
          <FloatingPortal key={dialog.key} id={`wallet-plugin-${dialog.key}`}>
            <QueryClientProvider client={queryClient}>
              <div data-wallet-theme data-wallet-ui data-theme={dataTheme}>
                {dialog.render({
                  isOpen,
                  onClose: () => closeDialog(dialog.key),
                  ctx,
                })}
              </div>
            </QueryClientProvider>
          </FloatingPortal>
        )
      })}
    </>
  )
}
