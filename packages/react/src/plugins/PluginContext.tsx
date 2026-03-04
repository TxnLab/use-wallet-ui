import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  MenuSlot,
  PluginDialog,
  PluginMenuItem,
  PluginPanel,
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
  /** All panels from all plugins, sorted by order */
  panels: PluginPanel[]
  /** All registered plugins */
  plugins: WalletUIPlugin[]
  /** Enriched render context with working openDialog/closeDialog */
  renderContext: PluginRenderContext
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

const EMPTY_RENDER_CONTEXT: PluginRenderContext = {
  activeAddress: null,
  activeWallet: null,
  theme: 'system',
  resolvedTheme: 'light',
  openDialog: () => {},
  closeDialog: () => {},
}

const EMPTY_CONTEXT: PluginContextType = {
  menuItemsBySlot: EMPTY_MENU_ITEMS,
  dialogs: [],
  openDialog: () => {},
  closeDialog: () => {},
  openDialogs: new Set(),
  panels: [],
  plugins: [],
  renderContext: EMPTY_RENDER_CONTEXT,
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

/**
 * Stabilizes the plugins array reference to prevent unnecessary re-renders.
 * Returns the same array reference as long as the set of plugin IDs hasn't changed.
 * This protects against the common pattern: `plugins={[myPlugin()]}` inline in JSX.
 */
function useStablePlugins(plugins: WalletUIPlugin[]): WalletUIPlugin[] {
  const stableRef = useRef(plugins)

  const prevIds = stableRef.current.map((p) => p.id).join('\0')
  const nextIds = plugins.map((p) => p.id).join('\0')

  if (prevIds !== nextIds) {
    stableRef.current = plugins
  }

  return stableRef.current
}

export function PluginContextProvider({
  plugins: rawPlugins,
  renderContext,
  children,
}: {
  plugins: WalletUIPlugin[]
  renderContext: PluginRenderContext
  children: ReactNode
}) {
  const plugins = useStablePlugins(rawPlugins)

  // Validate for duplicate plugin IDs, menu item keys, and dialog keys
  useMemo(() => {
    if (process.env.NODE_ENV === 'production') return

    const pluginIds = new Set<string>()
    const menuKeys = new Set<string>()
    const dialogKeys = new Set<string>()
    const panelKeys = new Set<string>()

    for (const plugin of plugins) {
      if (pluginIds.has(plugin.id)) {
        console.warn(`[WalletUI] Duplicate plugin ID: "${plugin.id}"`)
      }
      pluginIds.add(plugin.id)

      for (const item of plugin.menuItems ?? []) {
        if (menuKeys.has(item.key)) {
          console.warn(
            `[WalletUI] Duplicate menu item key: "${item.key}" (plugin: "${plugin.id}")`,
          )
        }
        menuKeys.add(item.key)
      }

      for (const dialog of plugin.dialogs ?? []) {
        if (dialogKeys.has(dialog.key)) {
          console.warn(
            `[WalletUI] Duplicate dialog key: "${dialog.key}" (plugin: "${plugin.id}")`,
          )
        }
        dialogKeys.add(dialog.key)
      }

      for (const panel of plugin.panels ?? []) {
        if (panelKeys.has(panel.key)) {
          console.warn(
            `[WalletUI] Duplicate panel key: "${panel.key}" (plugin: "${plugin.id}")`,
          )
        }
        panelKeys.add(panel.key)
      }
    }
  }, [plugins])

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

  // Collect all panels, sorted by order
  const panels = useMemo(
    () =>
      plugins
        .flatMap((p) => p.panels ?? [])
        .sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
    [plugins],
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

  const contextValue = useMemo(
    () => ({
      menuItemsBySlot,
      dialogs,
      openDialog,
      closeDialog,
      openDialogs,
      panels,
      plugins,
      renderContext: enrichedContext,
    }),
    [
      menuItemsBySlot,
      dialogs,
      openDialog,
      closeDialog,
      openDialogs,
      panels,
      plugins,
      enrichedContext,
    ],
  )

  return (
    <PluginContext.Provider value={contextValue}>
      <PluginProviderComposer plugins={plugins} ctx={enrichedContext}>
        {children}
      </PluginProviderComposer>
    </PluginContext.Provider>
  )
}
