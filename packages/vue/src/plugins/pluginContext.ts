import { inject, provide, ref, readonly } from 'vue'

import type {
  MenuSlot,
  PluginDialog,
  PluginMenuItem,
  PluginPanel,
  PluginRenderContext,
  WalletUIPlugin,
} from './types'
import type { Ref } from 'vue'

export interface PluginContextType {
  menuItemsBySlot: Record<MenuSlot, PluginMenuItem[]>
  dialogs: PluginDialog[]
  openDialog: (key: string) => void
  closeDialog: (key: string) => void
  openDialogs: Ref<Set<string>>
  panels: PluginPanel[]
  plugins: WalletUIPlugin[]
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

export const EMPTY_PLUGIN_CONTEXT: PluginContextType = {
  menuItemsBySlot: EMPTY_MENU_ITEMS,
  dialogs: [],
  openDialog: () => {},
  closeDialog: () => {},
  openDialogs: ref(new Set()),
  panels: [],
  plugins: [],
  renderContext: EMPTY_RENDER_CONTEXT,
}

const PLUGIN_CONTEXT_KEY = Symbol('wallet-ui-plugins')

/** Access the plugin context. Returns safe defaults when no plugins are registered. */
export function usePlugins(): PluginContextType {
  return inject<PluginContextType>(PLUGIN_CONTEXT_KEY, EMPTY_PLUGIN_CONTEXT)
}

/** Provide the plugin context to descendants */
export function providePlugins(
  plugins: WalletUIPlugin[],
  renderContext: PluginRenderContext,
): PluginContextType {
  if (process.env.NODE_ENV !== 'production') {
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
  }

  const openDialogs = ref<Set<string>>(new Set())

  const openDialog = (key: string): void => {
    const next = new Set(openDialogs.value)
    next.add(key)
    openDialogs.value = next
  }

  const closeDialog = (key: string): void => {
    const next = new Set(openDialogs.value)
    next.delete(key)
    openDialogs.value = next
  }

  // Add openDialog and closeDialog to renderContext without losing reactivity
  Object.assign(renderContext, { openDialog, closeDialog })

  // Group menu items by slot and sort by order
  const menuItemsBySlot: Record<MenuSlot, PluginMenuItem[]> = {
    'after-balance': [],
    'after-accounts': [],
    'after-wallet-info': [],
    'before-actions': [],
    actions: [],
  }

  for (const plugin of plugins) {
    for (const item of plugin.menuItems ?? []) {
      if (ALL_SLOTS.includes(item.slot)) {
        menuItemsBySlot[item.slot].push(item)
      }
    }
  }

  for (const slot of ALL_SLOTS) {
    menuItemsBySlot[slot].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  }

  // Collect all dialogs
  const dialogs: PluginDialog[] = plugins.flatMap((p) => p.dialogs ?? [])

  // Collect all panels sorted by order
  const panels: PluginPanel[] = plugins
    .flatMap((p) => p.panels ?? [])
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))

  const context: PluginContextType = {
    menuItemsBySlot,
    dialogs,
    openDialog,
    closeDialog,
    openDialogs: readonly(openDialogs) as Ref<Set<string>>,
    panels,
    plugins,
    renderContext,
  }

  provide(PLUGIN_CONTEXT_KEY, context)

  return context
}
