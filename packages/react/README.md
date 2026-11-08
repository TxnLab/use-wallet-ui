# @txnlab/use-wallet-ui-react

Ready-to-use React UI components for Algorand wallet integration, built as a companion to [@txnlab/use-wallet-react](https://github.com/TxnLab/use-wallet).

[![npm version](https://img.shields.io/npm/v/@txnlab/use-wallet-ui-react.svg)](https://www.npmjs.com/package/@txnlab/use-wallet-ui-react)
[![CI](https://github.com/TxnLab/use-wallet-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/TxnLab/use-wallet-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling](#styling)
- [Customization](#customization)
- [Theming](#theming)
- [Components](#components)
- [Hooks](#hooks)
- [Tanstack Query Integration](#tanstack-query-integration)
- [Plugins](#plugins)
- [Passkey Wallet](#passkey-wallet)
- [Migration from v0.x](#migration-from-v0x)
- [License](#license)

## Installation

```bash
npm install @txnlab/use-wallet-ui-react @txnlab/use-wallet-react algosdk
# or
yarn add @txnlab/use-wallet-ui-react @txnlab/use-wallet-react algosdk
# or
pnpm add @txnlab/use-wallet-ui-react @txnlab/use-wallet-react algosdk
# or
bun add @txnlab/use-wallet-ui-react @txnlab/use-wallet-react algosdk
```

With use-wallet v5, each wallet is a separate adapter package. Install the ones you support:

```bash
npm install @perawallet/use-wallet-pera @txnlab/use-wallet-defly @galaxypay/use-wallet-lute @txnlab/use-wallet-exodus @txnlab/use-wallet-walletconnect
```

### Requirements

- `@txnlab/use-wallet-react` v4.6+ or v5 (v5 recommended)
- `algosdk` v3 (v3.7+ with use-wallet v5.1+)
- React 18 or 19

Upgrading from use-wallet v4? See the [use-wallet migration guide](https://txnlab.gitbook.io/use-wallet/guides/migrating-from-v4.x). Only the `WalletManager` configuration changes. This library's components work the same way on both versions.

## Quick Start

```jsx
import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { defly } from '@txnlab/use-wallet-defly'
import { exodus } from '@txnlab/use-wallet-exodus'
import { NetworkId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { walletConnect } from '@txnlab/use-wallet-walletconnect'
import { WalletUIProvider, WalletButton } from '@txnlab/use-wallet-ui-react'

// Import styles if NOT using Tailwind CSS
import '@txnlab/use-wallet-ui-react/dist/style.css'

const walletManager = new WalletManager({
  wallets: [
    pera(),
    defly(),
    lute(),
    exodus(),
    walletConnect({ projectId: 'your-project-id' }),
  ],
  defaultNetwork: NetworkId.TESTNET,
})

function App() {
  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        <WalletButton />
      </WalletUIProvider>
    </WalletProvider>
  )
}
```

The `WalletButton` handles everything:

- Shows "Connect Wallet" when disconnected
- Opens wallet selection dialog (on v5, lists only the wallets the active network supports)
- Displays wallet address/NFD name and avatar when connected
- Provides account switching and disconnect options

## Styling

The library supports two styling approaches:

### With Tailwind CSS

Components use Tailwind utility classes. Configure Tailwind to scan our package:

**Tailwind v4:**

```css
@import 'tailwindcss';
@source "../node_modules/@txnlab/use-wallet-ui-react";
```

**Tailwind v3:**

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@txnlab/use-wallet-ui-react/dist/**/*.{js,ts,jsx,tsx}',
  ],
}
```

### Without Tailwind CSS

Import our pre-built CSS:

```jsx
import '@txnlab/use-wallet-ui-react/dist/style.css'
```

## Customization

v1.0 introduces a flexible customization system with multiple approaches.

### Size Variants

```jsx
<WalletButton size="sm" />  {/* Small */}
<WalletButton size="md" />  {/* Medium (default) */}
<WalletButton size="lg" />  {/* Large */}
```

### CSS Variable Overrides

Theme colors are CSS custom properties that can be overridden globally or per-instance.

**Global override (in your CSS):**

```css
[data-wallet-theme] {
  --wui-color-primary: #8b5cf6;
  --wui-color-primary-hover: #7c3aed;
  --wui-color-primary-text: #ffffff;
}
```

**Scoped override (on a wrapper):**

```css
.my-purple-button {
  --wui-color-primary: #8b5cf6;
  --wui-color-primary-hover: #7c3aed;
}
```

```jsx
<div className="my-purple-button">
  <WalletButton />
</div>
```

**Inline style override:**

```jsx
<WalletButton
  style={{
    '--wui-color-primary': '#10b981',
    '--wui-color-primary-hover': '#059669',
  } as React.CSSProperties}
/>
```

### Available CSS Variables

| Variable | Description |
|----------|-------------|
| `--wui-color-primary` | Primary button background |
| `--wui-color-primary-hover` | Primary button hover state |
| `--wui-color-primary-text` | Primary button text |
| `--wui-color-bg` | Panel/dialog background |
| `--wui-color-bg-secondary` | Secondary background |
| `--wui-color-bg-tertiary` | Tertiary background |
| `--wui-color-bg-hover` | Hover background |
| `--wui-color-text` | Primary text color |
| `--wui-color-text-secondary` | Secondary text color |
| `--wui-color-text-tertiary` | Tertiary text color |
| `--wui-color-border` | Border color |
| `--wui-color-link` | Link color |
| `--wui-color-link-hover` | Link hover color |
| `--wui-color-overlay` | Modal overlay color |
| `--wui-color-danger-bg` | Danger button background |
| `--wui-color-danger-bg-hover` | Danger button hover |
| `--wui-color-danger-text` | Danger button text |
| `--wui-color-avatar-bg` | Avatar placeholder background |
| `--wui-color-avatar-icon` | Avatar placeholder icon |

### className Prop

Add custom classes (useful with Tailwind):

```jsx
<WalletButton className="rounded-full shadow-lg" />
```

### Direct CSS Selectors

Target the button element directly:

```css
.pill-button [data-wallet-button] {
  border-radius: 9999px;
}
```

```jsx
<div className="pill-button">
  <WalletButton />
</div>
```

### Custom Trigger Button

For complete control, use the Menu components with your own button:

```jsx
import { useWallet } from '@txnlab/use-wallet-react'
import { ConnectWalletMenu, ConnectedWalletMenu } from '@txnlab/use-wallet-ui-react'

function CustomWalletButton() {
  const { activeAddress } = useWallet()

  if (activeAddress) {
    return (
      <ConnectedWalletMenu>
        <button className="my-connected-button">
          {activeAddress.slice(0, 8)}...
        </button>
      </ConnectedWalletMenu>
    )
  }

  return (
    <ConnectWalletMenu>
      <button className="my-connect-button">Connect Wallet</button>
    </ConnectWalletMenu>
  )
}
```

The child element becomes the trigger - the library handles all the menu logic.

### Theme-Aware Customization

Create different styles for light and dark modes:

```css
.amber-theme {
  --wui-color-primary: #f59e0b;
  --wui-color-primary-hover: #d97706;
}

.dark .amber-theme {
  --wui-color-primary: rgba(245, 179, 71, 0.15);
  --wui-color-primary-hover: rgba(245, 179, 71, 0.25);
}

.dark .amber-theme [data-wallet-button] {
  border: 1px solid rgba(245, 179, 71, 0.3);
}
```

See the [react-custom example](../../examples/react-custom) for comprehensive demos.

## Theming

The library supports automatic light/dark mode.

### Theme Options

```jsx
<WalletUIProvider theme="system">  {/* Default: follows OS preference */}
<WalletUIProvider theme="light">   {/* Always light */}
<WalletUIProvider theme="dark">    {/* Always dark */}
```

### How Theme Detection Works

The library checks these in order (first match wins):

1. **`data-theme` attribute**: Set by the `theme` prop on `WalletUIProvider`
2. **`.dark` class**: On any ancestor element (Tailwind convention)
3. **`prefers-color-scheme`**: System/browser preference (when `theme="system"`)

### Accessing Theme State

```jsx
import { useWalletUI } from '@txnlab/use-wallet-ui-react'

function MyComponent() {
  const { theme, resolvedTheme } = useWalletUI()
  // theme: 'light' | 'dark' | 'system' (the prop value)
  // resolvedTheme: 'light' | 'dark' (the actual theme in use)
}
```

## Components

### WalletUIProvider

Required wrapper that enables theming, NFD lookups, and data prefetching.

```jsx
<WalletUIProvider
  theme="system"              // 'light' | 'dark' | 'system'
  enablePrefetching={true}    // Prefetch data for all wallet accounts
  prefetchNfdView="thumbnail" // NFD data view: 'tiny' | 'thumbnail' | 'brief' | 'full'
  queryClient={queryClient}   // Optional: your existing Tanstack Query client
  passkeyLayout="featured"    // Passkey wallet layout: 'featured' | 'list'
>
  {children}
</WalletUIProvider>
```

### WalletButton

All-in-one wallet connection component.

```jsx
<WalletButton
  size="md"              // 'sm' | 'md' | 'lg'
  className="..."        // Additional CSS classes
  style={{...}}          // Inline styles (supports CSS variable overrides)
  passkeyLayout="list"   // Optional: overrides WalletUIProvider's passkeyLayout
/>
```

### ConnectWalletMenu

Dropdown menu for wallet selection (disconnected state).

```jsx
// With default button
<ConnectWalletMenu />

// With customized button
<ConnectWalletMenu>
  <ConnectWalletButton size="lg">Connect</ConnectWalletButton>
</ConnectWalletMenu>

// With custom trigger
<ConnectWalletMenu>
  <button>My Custom Button</button>
</ConnectWalletMenu>

// With its own passkey layout (overrides WalletUIProvider's passkeyLayout)
<ConnectWalletMenu passkeyLayout="list" />
```

### ConnectWalletButton

Styled button for the connect state.

```jsx
<ConnectWalletButton
  size="md"       // 'sm' | 'md' | 'lg'
  className="..." // Additional classes
  style={{...}}   // Inline styles
>
  Connect Wallet  {/* Optional: custom text */}
</ConnectWalletButton>
```

### ConnectedWalletMenu

Dropdown menu for account management (connected state).

```jsx
// With default button
<ConnectedWalletMenu />

// With customized button
<ConnectedWalletMenu>
  <ConnectedWalletButton size="sm" />
</ConnectedWalletMenu>

// With custom trigger
<ConnectedWalletMenu>
  <div className="my-wallet-display">Connected</div>
</ConnectedWalletMenu>
```

### ConnectedWalletButton

Styled button showing wallet address/NFD and avatar.

```jsx
<ConnectedWalletButton
  size="md"       // 'sm' | 'md' | 'lg'
  className="..." // Additional classes
  style={{...}}   // Inline styles
/>
```

### NfdAvatar

Renders NFD avatar images with IPFS gateway handling.

```jsx
import { useNfd, NfdAvatar } from '@txnlab/use-wallet-ui-react'

function Profile() {
  const nfdQuery = useNfd()

  return (
    <NfdAvatar
      nfd={nfdQuery.data}
      size={48}
      className="rounded-full"
      alt="Profile"
    />
  )
}
```

### WalletList

Renders a list of wallets (used internally by ConnectWalletMenu). The dialog renders the passkey wallet in its own section above the list, so pass the other wallets here.

```jsx
<WalletList
  wallets={wallets}
  handleWalletClick={(wallet) => wallet.connect()}
/>
```

### PasskeyConnect

The passkey section of the connect dialog, for custom connect menus. Signing in (**Continue with passkey**, or **Sign in with passkey** in the list layout) calls `handleWalletClick(wallet)`, and **Create a passkey** calls `handleWalletClick(wallet, { create: true })`. Forward `args` to `wallet.connect(args)` before any `await`, or Safari and iOS browsers drop the passkey prompt. Pass `status` (`{ walletId, pending, error }`) to disable the controls while the prompt is open and to show an error.

```jsx
<PasskeyConnect
  wallet={passkeyWallet}
  handleWalletClick={(wallet, args) => wallet.connect(args)}
  layout="featured" // 'featured' (default) | 'list'
  showLabel={true}  // 'list' only: show the "Passkey" group label
/>
```

In the list layout, label your own wallet group to match (the dialog uses "Wallets").


## Hooks

### useNfd

Fetch NFD data for the active address.

```jsx
import { useNfd } from '@txnlab/use-wallet-ui-react'

function Profile() {
  const nfdQuery = useNfd({
    enabled: true,    // Enable/disable the query
    view: 'thumbnail' // 'tiny' | 'thumbnail' | 'brief' | 'full'
  })

  if (nfdQuery.isLoading) return <div>Loading...</div>

  return <div>{nfdQuery.data?.name || 'No NFD'}</div>
}
```

### useAccountInfo

Fetch account information (balance, assets) for the active address.

```jsx
import { useAccountInfo } from '@txnlab/use-wallet-ui-react'

function Balance() {
  const accountQuery = useAccountInfo()

  if (accountQuery.isLoading) return <div>Loading...</div>
  if (!accountQuery.data) return null

  const algoBalance = Number(accountQuery.data.amount) / 1_000_000

  return <div>{algoBalance.toFixed(2)} ALGO</div>
}
```

### useWalletUI

Access the WalletUI context.

```jsx
import { useWalletUI } from '@txnlab/use-wallet-ui-react'

function MyComponent() {
  const { theme, resolvedTheme, queryClient } = useWalletUI()
}
```

### useResolvedTheme

Get the resolved theme value (handles 'system' preference detection).

```jsx
import { useResolvedTheme } from '@txnlab/use-wallet-ui-react'

function MyComponent() {
  const resolvedTheme = useResolvedTheme('system') // Returns 'light' or 'dark'
}
```

## Tanstack Query Integration

The library uses [Tanstack Query](https://tanstack.com/query) internally. If your app already uses it, share the QueryClient to avoid duplicate caches:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider manager={walletManager}>
        <WalletUIProvider queryClient={queryClient}>
          {/* Your app */}
        </WalletUIProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}
```

## Migration from v0.x

v1.0 introduces a redesigned CSS architecture. Here's what changed:

### Breaking Changes

1. **CSS Variable Prefix**: Variables now use `--wui-` prefix (previously undocumented)
2. **Theme Variables Location**: Defined on `[data-wallet-theme]` element (for CSS variable inheritance)
3. **Button Data Attribute**: Buttons now have `data-wallet-button` attribute for targeting

### New Features

1. **Size Variants**: `WalletButton`, `ConnectWalletButton`, and `ConnectedWalletButton` now accept a `size` prop (`'sm' | 'md' | 'lg'`)

2. **className/style Props**: All button components accept `className` and `style` props for customization

3. **CSS Variable Overrides**: Override any theme color via CSS:
   ```css
   [data-wallet-theme] {
     --wui-color-primary: #your-color;
   }
   ```

4. **Custom Triggers**: Pass any element as a child to `ConnectWalletMenu` or `ConnectedWalletMenu` for full control:
   ```jsx
   <ConnectWalletMenu>
     <MyCustomButton />
   </ConnectWalletMenu>
   ```

5. **Theme Detection**: Now respects `.dark` class on ancestors (Tailwind convention) in addition to `data-theme` attribute and `prefers-color-scheme` media query

### Migration Steps

1. Update any custom CSS targeting the library:
   - Use `[data-wallet-theme]` for CSS variable overrides
   - Use `[data-wallet-button]` for targeting button elements

2. If you were using workarounds for customization, you can likely simplify using the new APIs

3. Test dark mode behavior - it should work more reliably with Tailwind's `.dark` class

## Plugins

The library includes a plugin system for extending the wallet UI without modifying core components. Plugins can inject menu items, register full-panel views, open dialogs, respond to wallet lifecycle events, and provide React context.

```tsx
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import { exportKeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/export-key'

function App() {
  return (
    <WalletUIProvider plugins={[exportKeyPlugin()]}>
      {/* ... */}
    </WalletUIProvider>
  )
}
```

See the [Plugin Architecture Guide](PLUGINS.md) for full documentation.

## Passkey Wallet

[`@txnlab/use-wallet-passkey`](https://github.com/TxnLab/use-wallet/tree/main/packages/wallets/passkey#readme) (use-wallet 5.2+) derives an app-scoped Falcon-1024 account from a passkey. Register it, and the connect dialog leads with it: a **Continue with passkey** button to sign in, a **Create a passkey** link for new users, and the other wallets below. A missing passkey and a cancelled prompt raise the same browser error, so creating stays a separate choice.

```bash
npm install @txnlab/use-wallet-passkey
```

```tsx
import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { passkey } from '@txnlab/use-wallet-passkey'
import { WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { WalletButton, WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import { passkeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/passkey'

const manager = new WalletManager({
  wallets: [passkey({ session: true }), lute(), pera()],
})

const plugins = [passkeyPlugin({ session: true })]

function App() {
  return (
    <WalletProvider manager={manager}>
      <WalletUIProvider plugins={plugins}>
        <WalletButton />
      </WalletUIProvider>
    </WalletProvider>
  )
}
```

The connect dialog:

- Starts the passkey prompt straight from the tap, as Safari and iOS browsers require
- Shows "Waiting for your passkey…" and disables both controls while the prompt is open
- Stays open on passkey errors and explains them: a cancelled or timed-out prompt (or no passkey found), an in-app browser (open the page in Safari or Chrome), or a passkey provider without the PRF extension (try another provider)

The connected wallet menu tags a passkey account with its domain (for example, `Passkey · localhost`), since the account belongs to the site that created it.

`passkeyPlugin()` adds to the connected wallet menu, only while the passkey wallet is active:

- **Export Recovery Phrase**: a dialog that reveals the account's 25-word phrase after a fresh passkey prompt, and tells users to import it as a Falcon / quantum account (in Lute, Add account → Falcon25 account → Import; in Pera, the quantum import). It hides the phrase after a timeout and clears the clipboard when it closes, if it can.
- **Session status** (with `session: true`): Locked or Unlocked, with Unlock and Lock buttons
- **A note on whose account it is** (with `disclosure: true`): "This account is created by and for example.com. Keep only what you need here, and move larger amounts to a wallet you control." It shows until the user chooses **Got it**, once per account.

The plugin uses `useWalletManager()`, so it requires `@txnlab/use-wallet-react` 5.2 or later, which any app with the passkey wallet has. The main entry still supports v4.6+. See [Passkey Plugin](PLUGINS.md#passkey-plugin) for options, and the adapter's [security model](https://github.com/TxnLab/use-wallet/tree/main/packages/wallets/passkey#security-model) before you ship it.

For your own connect UI, `getPasskeyErrorMessage(error)` returns a message for a `PasskeyError`, or `null` for any other error.

### Passkey layout

Choose how the connect dialog presents the passkey wallet with `passkeyLayout`:

- **`'featured'`** (default): a full-width **Continue with passkey** button and a "New here? **Create a passkey**" link, then the other wallets under "or connect a wallet". For consumer apps where most users have no wallet, so the passkey is the main way in.
- **`'list'`**: **Sign in with passkey** and **Create a passkey** rows in a "Passkey" group, above a "Wallets" group. For crypto-native apps where most users bring a wallet like Pera or Lute, and the passkey is one choice among many.

```tsx
// App-wide
<WalletUIProvider passkeyLayout="list">

// Per menu: a WalletButton or ConnectWalletMenu prop wins over the provider
<WalletButton passkeyLayout="featured" />
```

With only the passkey wallet configured, neither layout shows the other-wallets heading. Without a passkey wallet, the dialog is the same in both.

## License

MIT
