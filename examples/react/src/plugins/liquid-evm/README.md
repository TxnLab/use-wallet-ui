# Liquid EVM Plugin — Proof of Concept

This is a proof-of-concept plugin that reimplements key features from the [tasosbit/liquid-accounts](https://github.com/tasosbit/liquid-accounts) community fork of use-wallet-ui using the v1.1.0 plugin architecture.

## Features Implemented

### ManagePanel (`panels`)

Full panel view inside ConnectedWalletMenu with three tabs:

- **Send** — Payment form with recipient address, amount, and transaction signing via `algosdk`
- **Receive** — QR code display and copy-to-clipboard for the active address
- **Assets** — List of ALGO balance and ASA holdings using `useAccountInfo`

Demonstrates: `panels` extension point with auto-generated trigger button and back navigation.

### WelcomeDialog (`lifecycle` + `dialogs`)

Shows a welcome/onboarding dialog on first wallet connection. Uses `localStorage` to track "seen" state so it only appears once.

Demonstrates: `lifecycle.onConnect` hook triggering `openDialog`, and the `dialogs` extension point.

### BridgeDialog (`menuItems` + `dialogs`)

Placeholder bridge dialog triggered from a "Bridge" menu item in the `before-actions` slot. Content is a mockup since actual cross-chain bridging is complex.

Demonstrates: `menuItems` extension point triggering a `dialog`.

## Usage

```tsx
import { liquidEvmPlugin } from './plugins/liquid-evm'

<WalletUIProvider plugins={[liquidEvmPlugin()]}>
  {/* ... */}
</WalletUIProvider>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showWelcome` | `boolean` | `true` | Show welcome dialog on first connection |

## Known Gaps

The following features from the fork **cannot** be implemented as plugins with the current API:

### BeforeSignDialog / Signing Interception

The fork added `registerUIHook` to `@txnlab/use-wallet` core to intercept transaction signing and show a confirmation dialog. This requires core wallet library modifications and cannot be done via the plugin system alone.

**Potential solution**: A future `@txnlab/use-wallet` API could expose a `beforeSign` hook or middleware pattern that plugins could consume.

### ExtensionSignIndicator

Floating indicator shown during extension wallet signing. Similar dependency on wallet signing lifecycle hooks that don't exist in the public API.

### RainbowKit/Wagmi Integration

EVM wallet integration (RainbowKit, Wagmi) is application-level architecture, not a UI plugin concern.

### Full Asset Registry/Cache

The fork maintained an internal asset metadata cache. This PoC uses simpler direct `accountInformation` queries. A production plugin could use the `Provider` extension point to wrap a React Query-based asset cache context.

## Architecture

```
liquid-evm/
├── index.tsx         # Plugin factory function
├── constants.ts      # Dialog/panel keys, localStorage keys
├── ManagePanel.tsx   # Panel container with tab navigation
├── SendTab.tsx       # Send payment form
├── ReceiveTab.tsx    # QR code + address display
├── AssetsTab.tsx     # Asset holdings list
├── WelcomeDialog.tsx # First-connection onboarding dialog
├── BridgeDialog.tsx  # Placeholder bridge dialog
└── README.md         # This file
```
