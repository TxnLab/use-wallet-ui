# Plugin Architecture

The plugin system lets you extend `@txnlab/use-wallet-ui-react` without modifying core components. Plugins can inject menu items, register full-panel views, open dialogs, respond to wallet lifecycle events, and provide React context to the entire component tree.

## Table of Contents

- [Quick Start](#quick-start)
- [Plugin Interface](#plugin-interface)
- [Extension Points](#extension-points)
  - [Menu Items](#menu-items)
  - [Panels](#panels)
  - [Dialogs](#dialogs)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Provider](#provider)
- [Render Contexts](#render-contexts)
- [Built-in Plugins](#built-in-plugins)
  - [Export Key Plugin](#export-key-plugin)
- [Publishing Plugins](#publishing-plugins)
- [API Reference](#api-reference)

## Quick Start

```tsx
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import type { WalletUIPlugin } from '@txnlab/use-wallet-ui-react'

const greetingPlugin: WalletUIPlugin = {
  id: 'greeting',
  name: 'Greeting Plugin',

  lifecycle: {
    onConnect: (ctx) => {
      console.log(`Welcome! Connected as ${ctx.activeAddress}`)
    },
  },
}

function App() {
  return (
    <WalletUIProvider plugins={[greetingPlugin]}>
      {/* ... */}
    </WalletUIProvider>
  )
}
```

## Plugin Interface

Every plugin is a plain object implementing `WalletUIPlugin`. Only `id` is required — all other fields are optional and declare what the plugin contributes.

```ts
interface WalletUIPlugin {
  id: string
  name?: string
  menuItems?: PluginMenuItem[]
  dialogs?: PluginDialog[]
  panels?: PluginPanel[]
  lifecycle?: PluginLifecycleHooks
  Provider?: ComponentType<{ children: ReactNode; ctx: PluginRenderContext }>
}
```

Plugins are passed to `WalletUIProvider`:

```tsx
<WalletUIProvider plugins={[myPlugin, anotherPlugin]}>
```

The core system collects contributions from all plugins, deduplicates and validates keys (in development), and renders them in the appropriate locations.

### Factory Pattern

For plugins that accept configuration, export a factory function:

```ts
export function myPlugin(options: MyPluginOptions = {}): WalletUIPlugin {
  return {
    id: 'my-plugin',
    // ...use options to configure behavior
  }
}
```

## Extension Points

### Menu Items

Inject UI into named slots within the `ConnectedWalletMenu` dropdown.

```ts
const plugin: WalletUIPlugin = {
  id: 'my-plugin',
  menuItems: [
    {
      key: 'my-menu-item',
      slot: 'after-wallet-info',
      order: 10,
      enabled: (ctx) => !!ctx.activeWallet,
      render: (ctx) => (
        <button onClick={() => ctx.openDialog('my-dialog')}>
          Do Something
        </button>
      ),
    },
  ],
}
```

#### Available Slots

Slots are rendered in this order within the ConnectedWalletMenu:

| Slot | Position |
|------|----------|
| `after-balance` | Below the balance display |
| `after-accounts` | Below the account selector |
| `after-wallet-info` | Below the wallet provider name/icon |
| `before-actions` | Above the Copy/Disconnect action buttons |
| `actions` | Inline with Copy and Disconnect buttons |

#### PluginMenuItem Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique key for React rendering |
| `slot` | `MenuSlot` | Which slot to render in |
| `order` | `number` | Sort weight within the slot (lower = earlier, default: 100) |
| `enabled` | `(ctx) => boolean` | Return `false` to hide this item |
| `render` | `(ctx) => ReactNode` | The React element to render |

### Panels

Register full sub-views that replace the entire ConnectedWalletMenu content when navigated to. The menu automatically generates a trigger button for each registered panel.

```ts
const managePlugin: WalletUIPlugin = {
  id: 'manage',
  panels: [
    {
      key: 'manage',
      label: 'Manage',
      icon: ({ className }) => <WalletIcon className={className} />,
      order: 10,
      render: ({ ctx, goBack }) => (
        <div>
          <p>Active: {ctx.activeAddress}</p>
          <SendForm />
          <ReceiveView />
          <button onClick={goBack}>Back to Menu</button>
        </div>
      ),
    },
  ],
}
```

When a panel is active:
- The main menu content is replaced by the panel's `render()` output
- A back button and the panel's `label` are shown in a header
- Closing the menu resets the panel state to the main view

#### PluginPanel Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique key for this panel |
| `label` | `string` | Text shown on the auto-generated trigger and panel header |
| `icon` | `(props: { className?: string }) => ReactNode` | Optional icon for the trigger button |
| `enabled` | `(ctx) => boolean` | Return `false` to hide this panel's trigger |
| `order` | `number` | Sort weight in the trigger list (lower = earlier, default: 100) |
| `render` | `(props: { ctx, goBack }) => ReactNode` | The panel content. Call `goBack()` to return to the main menu. |

#### Programmatic Navigation

The `MenuRenderContext` includes `setActivePanel` and `activePanel`, allowing menu items or panel content to navigate programmatically:

```ts
// Navigate to a panel from a menu item
render: (ctx) => (
  <button onClick={() => ctx.setActivePanel('manage')}>
    Open Manage Panel
  </button>
)

// Check which panel is active
render: ({ ctx }) => {
  if (ctx.activePanel === 'manage') { /* ... */ }
}
```

### Dialogs

Register dialogs rendered via `FloatingPortal`, managed by key.

```ts
const plugin: WalletUIPlugin = {
  id: 'my-plugin',
  dialogs: [
    {
      key: 'my-dialog',
      render: ({ isOpen, onClose, ctx }) => (
        isOpen ? <MyDialog onClose={onClose} address={ctx.activeAddress} /> : null
      ),
    },
  ],
}
```

Open and close dialogs from any render context:

```ts
ctx.openDialog('my-dialog')
ctx.closeDialog('my-dialog')
```

Dialogs receive `PluginRenderContext` (not `MenuRenderContext`), since they render outside the menu. They do not have access to `closeMenu`, `setActivePanel`, or `activePanel`.

#### PluginDialog Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique key for open/close control |
| `render` | `(props: { isOpen, onClose, ctx }) => ReactNode` | The dialog component |

### Lifecycle Hooks

Respond to wallet connection state changes.

```ts
const plugin: WalletUIPlugin = {
  id: 'analytics',
  lifecycle: {
    onConnect: async (ctx) => {
      await trackEvent('wallet_connected', { address: ctx.activeAddress })
    },
    onDisconnect: () => {
      trackEvent('wallet_disconnected')
    },
    onAccountChange: (newAddress, prevAddress, ctx) => {
      trackEvent('account_changed', { from: prevAddress, to: newAddress })
    },
  },
}
```

| Hook | Signature | When |
|------|-----------|------|
| `onConnect` | `(ctx) => void \| Promise<void>` | A wallet connects (no wallet → has wallet) |
| `onDisconnect` | `() => void \| Promise<void>` | A wallet disconnects (has wallet → no wallet) |
| `onAccountChange` | `(newAddress, prevAddress, ctx) => void` | Active account changes while connected |

Async hooks (`onConnect`, `onDisconnect`) have their errors caught and logged automatically.

### Provider

Wrap the component tree with custom React context. Useful for plugins that need to share state across menu items, dialogs, and panels.

```ts
import { createContext, useContext, useState } from 'react'

const MyPluginContext = createContext<{ count: number }>({ count: 0 })

const plugin: WalletUIPlugin = {
  id: 'stateful-plugin',
  Provider: ({ children, ctx }) => {
    const [count, setCount] = useState(0)
    return (
      <MyPluginContext.Provider value={{ count }}>
        {children}
      </MyPluginContext.Provider>
    )
  },
}
```

When multiple plugins define Providers, they are composed (first plugin wraps outermost). The `ctx` prop provides the enriched `PluginRenderContext` with working `openDialog`/`closeDialog`.

## Render Contexts

Two context types exist, each scoped to where it makes sense:

### PluginRenderContext

Available to dialogs, lifecycle hooks, and Provider components.

```ts
interface PluginRenderContext {
  activeAddress: string | null
  activeWallet: Wallet | null
  theme: Theme
  resolvedTheme: ResolvedTheme
  openDialog: (key: string) => void
  closeDialog: (key: string) => void
}
```

### MenuRenderContext

Extends `PluginRenderContext`. Available to menu items and panels (which render inside ConnectedWalletMenu).

```ts
interface MenuRenderContext extends PluginRenderContext {
  closeMenu: () => void
  setActivePanel: (key: string | null) => void
  activePanel: string | null
}
```

The split prevents dialogs and lifecycle hooks from receiving misleading no-op `closeMenu` or `setActivePanel` functions.

## Built-in Plugins

### Export Key Plugin

Adds a "Export Recovery Phrase" button to the connected wallet menu for wallets that support private key access (e.g., Web3Auth).

```bash
npm install @txnlab/use-wallet-ui-react
```

```tsx
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import { exportKeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/export-key'

function App() {
  return (
    <WalletUIProvider plugins={[exportKeyPlugin({ displayTimeout: 60 })]}>
      {/* ... */}
    </WalletUIProvider>
  )
}
```

The plugin:
- Injects a menu item in the `after-wallet-info` slot
- Only visible when `activeWallet.canUsePrivateKey` is true
- Opens a dialog with a warning step, mnemonic display with countdown timer, and copy-to-clipboard

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `displayTimeout` | `number` | `120` | Seconds before the mnemonic auto-closes |

#### Subpath Import

The export-key plugin is a separate build entry to keep it tree-shakeable:

```ts
// Separate entry — only included if imported
import { exportKeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/export-key'
```

## Publishing Plugins

Plugins are plain objects, so they can be published as npm packages. A plugin package should:

1. **Export a factory function** that returns `WalletUIPlugin`
2. **Declare `@txnlab/use-wallet-ui-react` as a peer dependency** for type compatibility
3. **Keep `@txnlab/use-wallet-react` and `react` as peer dependencies** if using wallet hooks or React APIs internally

```json
{
  "peerDependencies": {
    "@txnlab/use-wallet-ui-react": "^1.1.0",
    "@txnlab/use-wallet-react": "^4.0.0",
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

### Plugin Anatomy

A typical plugin package structure:

```
my-wallet-plugin/
├── src/
│   ├── index.ts          # Factory function + re-exports
│   ├── constants.ts      # Dialog/panel keys
│   ├── MyMenuButton.tsx  # Menu item component
│   ├── MyDialog.tsx      # Dialog component
│   └── MyPanel.tsx       # Panel component
├── package.json
└── tsconfig.json
```

Avoid circular imports by extracting shared constants (dialog keys, panel keys) into a separate `constants.ts` file rather than importing them from `index.ts`.

## API Reference

All types are exported from the main package:

```ts
import type {
  WalletUIPlugin,
  PluginMenuItem,
  PluginDialog,
  PluginPanel,
  PluginLifecycleHooks,
  PluginRenderContext,
  MenuRenderContext,
  MenuSlot,
} from '@txnlab/use-wallet-ui-react'
```

### usePlugins Hook

Access the plugin context from any component inside `WalletUIProvider`:

```ts
import { usePlugins } from '@txnlab/use-wallet-ui-react'

function MyComponent() {
  const { openDialog, closeDialog, panels, renderContext } = usePlugins()
}
```

Returns safe defaults (empty arrays, no-op functions) when no plugins are registered.

### Development Validation

In development (`NODE_ENV !== 'production'`), the plugin system warns on:
- Duplicate plugin IDs
- Duplicate menu item keys across plugins
- Duplicate dialog keys across plugins
- Duplicate panel keys across plugins
