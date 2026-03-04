import type { Theme, ResolvedTheme } from '../hooks/useResolvedTheme'
import type { Wallet } from '@txnlab/use-wallet-react'
import type { ComponentType, ReactNode } from 'react'

/** Context available to all plugin render functions */
export interface PluginRenderContext {
  activeAddress: string | null
  activeWallet: Wallet | null
  theme: Theme
  resolvedTheme: ResolvedTheme
  /** Open a plugin dialog by key */
  openDialog: (key: string) => void
  /** Close a plugin dialog by key */
  closeDialog: (key: string) => void
}

/** Extended context available to menu items rendered inside ConnectedWalletMenu */
export interface MenuRenderContext extends PluginRenderContext {
  /** Close the ConnectedWalletMenu dropdown */
  closeMenu: () => void
  /** Navigate to a plugin panel by key, or null to return to main view */
  setActivePanel: (key: string | null) => void
  /** Currently active panel key, or null if showing main view */
  activePanel: string | null
}

/**
 * Named slots in ConnectedWalletMenu where plugins can inject UI.
 * Ordered from top to bottom of the menu layout.
 */
export type MenuSlot =
  | 'after-balance'
  | 'after-accounts'
  | 'after-wallet-info'
  | 'before-actions'
  | 'actions'

/** A menu item contributed by a plugin to a named slot */
export interface PluginMenuItem {
  /** Unique key for React rendering */
  key: string
  /** Which slot to render in */
  slot: MenuSlot
  /** Ordering weight within the slot. Lower = earlier. Default: 100. */
  order?: number
  /** Return false to hide this item */
  enabled?: (ctx: MenuRenderContext) => boolean
  /** The React element to render */
  render: (ctx: MenuRenderContext) => ReactNode
}

/** A dialog contributed by a plugin, rendered via FloatingPortal */
export interface PluginDialog {
  /** Unique key for React rendering and dialog open/close control */
  key: string
  /** The dialog component */
  render: (props: {
    isOpen: boolean
    onClose: () => void
    ctx: PluginRenderContext
  }) => ReactNode
}

/** A full panel view contributed by a plugin to ConnectedWalletMenu */
export interface PluginPanel {
  /** Unique key for this panel */
  key: string
  /** Label shown on the navigation trigger (e.g., "Manage", "Bridge") */
  label: string
  /** Optional icon component rendered alongside the label */
  icon?: (props: { className?: string }) => ReactNode
  /** Return false to hide this panel's trigger */
  enabled?: (ctx: MenuRenderContext) => boolean
  /** Ordering weight in the panel trigger list. Lower = earlier. Default: 100. */
  order?: number
  /** The panel content renderer. Receives a `goBack` function to return to main view. */
  render: (props: { ctx: MenuRenderContext; goBack: () => void }) => ReactNode
}

/** Wallet lifecycle event hooks */
export interface PluginLifecycleHooks {
  /** Called after a wallet connects */
  onConnect?: (ctx: PluginRenderContext) => void | Promise<void>
  /** Called after a wallet disconnects */
  onDisconnect?: () => void | Promise<void>
  /** Called when the active account changes */
  onAccountChange?: (
    newAddress: string,
    prevAddress: string | null,
    ctx: PluginRenderContext,
  ) => void
}

/**
 * The main plugin interface. Every field except `id` is optional.
 * A plugin declares what it contributes; the core system
 * collects and renders those contributions.
 */
export interface WalletUIPlugin {
  /** Unique identifier for the plugin */
  id: string
  /** Human-readable name (for debugging) */
  name?: string
  /** Menu items to inject into ConnectedWalletMenu slots */
  menuItems?: PluginMenuItem[]
  /** Dialogs that the plugin manages */
  dialogs?: PluginDialog[]
  /** Panels that replace ConnectedWalletMenu content when navigated to */
  panels?: PluginPanel[]
  /** Wallet lifecycle event hooks */
  lifecycle?: PluginLifecycleHooks
  /**
   * Optional React component that wraps the provider's children.
   * Used by plugins that need to provide their own React context.
   */
  Provider?: ComponentType<{
    children: ReactNode
    ctx: PluginRenderContext
  }>
}
