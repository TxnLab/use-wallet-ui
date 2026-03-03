import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import type {
  MenuSlot,
  PluginDialog,
  PluginMenuItem,
  PluginRenderContext,
  WalletUIPlugin,
} from './types'

interface PluginContextType {
  /** All menu items grouped by slot, sorted by order */
  menuItemsBySlot: Record<MenuSlot, PluginMenuItem[]>
  /** All dialogs from all plugins */
  dialogs: PluginDialog[]
  /** Open a plugin dialog by key */
  openDialog: (key: string) => void
  /** Close a plugin dialog by key */
  closeDialog: (key: string) => void
  /** Currently open dialog keys */
  openDialogs: Set<string>
  /** All registered plugins */
  plugins: WalletUIPlugin[]
}

const ALL_SLOTS: MenuSlot[] = [
  'after-balance',
  'after-accounts',
  'after-wallet-info',
  'before-actions',
  'actions',
]

const EMPTY_MENU_ITEMS: Record<MenuSlot, PluginMenuItem[]> = {
  'after-balance': [],
  'after-accounts': [],
  'after-wallet-info': [],
  'before-actions': [],
  actions: [],
}

const EMPTY_CONTEXT: PluginContextType = {
  menuItemsBySlot: EMPTY_MENU_ITEMS,
  dialogs: [],
  openDialog: () => {},
  closeDialog: () => {},
  openDialogs: new Set(),
  plugins: [],
}

const PluginContext = createContext<PluginContextType | undefined>(undefined)

/** Access the plugin context. Returns safe defaults when no plugins are registered. */
export function usePlugins(): PluginContextType {
  const ctx = useContext(PluginContext)
  if (!ctx) {
    return EMPTY_CONTEXT
  }
  return ctx
}

/**
 * Composes plugin Provider components around children.
 * First plugin's Provider wraps outermost, last wraps innermost.
 */
function PluginProviderComposer({
  plugins,
  ctx,
  children,
}: {
  plugins: WalletUIPlugin[]
  ctx: PluginRenderContext
  children: ReactNode
}) {
  return plugins.reduceRight<ReactNode>((acc, plugin) => {
    if (plugin.Provider) {
      return <plugin.Provider ctx={ctx}>{acc}</plugin.Provider>
    }
    return acc
  }, children)
}

export function PluginContextProvider({
  plugins,
  renderContext,
  children,
}: {
  plugins: WalletUIPlugin[]
  renderContext: PluginRenderContext
  children: ReactNode
}) {
  const [openDialogs, setOpenDialogs] = useState<Set<string>>(new Set())

  const openDialog = useCallback((key: string) => {
    setOpenDialogs((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const closeDialog = useCallback((key: string) => {
    setOpenDialogs((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  // Group menu items by slot and sort by order
  const menuItemsBySlot = useMemo(() => {
    const result: Record<MenuSlot, PluginMenuItem[]> = {
      'after-balance': [],
      'after-accounts': [],
      'after-wallet-info': [],
      'before-actions': [],
      actions: [],
    }

    for (const plugin of plugins) {
      if (plugin.menuItems) {
        for (const item of plugin.menuItems) {
          if (ALL_SLOTS.includes(item.slot)) {
            result[item.slot].push(item)
          }
        }
      }
    }

    // Sort each slot by order
    for (const slot of ALL_SLOTS) {
      result[slot].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    }

    return result
  }, [plugins])

  // Collect all dialogs
  const dialogs = useMemo(
    () => plugins.flatMap((p) => p.dialogs ?? []),
    [plugins],
  )

  const contextValue = useMemo(
    () => ({
      menuItemsBySlot,
      dialogs,
      openDialog,
      closeDialog,
      openDialogs,
      plugins,
    }),
    [menuItemsBySlot, dialogs, openDialog, closeDialog, openDialogs, plugins],
  )

  // Build a render context that includes dialog control
  const enrichedContext = useMemo(
    () => ({
      ...renderContext,
      openDialog,
      closeDialog,
    }),
    [renderContext, openDialog, closeDialog],
  )

  return (
    <PluginContext.Provider value={contextValue}>
      <PluginProviderComposer plugins={plugins} ctx={enrichedContext}>
        {children}
      </PluginProviderComposer>
    </PluginContext.Provider>
  )
}
