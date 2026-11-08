# @txnlab/use-wallet-ui-vue

Vue UI components for integrating with `@txnlab/use-wallet-vue`.

## Installation

```bash
pnpm add @txnlab/use-wallet-ui-vue @txnlab/use-wallet-vue algosdk
```

With use-wallet v5, each wallet is a separate adapter package. Install the ones you support:

```bash
pnpm add @perawallet/use-wallet-pera @txnlab/use-wallet-defly @galaxypay/use-wallet-lute
```

### Requirements

- `@txnlab/use-wallet-vue` v4.6+ or v5 (v5 recommended)
- `algosdk` v3 (v3.7+ with use-wallet v5.1+)
- Vue 3.3+

Upgrading from use-wallet v4? See the [use-wallet migration guide](https://txnlab.gitbook.io/use-wallet/guides/migrating-from-v4.x). Only the `WalletManagerPlugin` configuration changes. This library's components work the same way on both versions.

## Usage

```ts
// main.ts
import { createApp } from 'vue'
import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { defly } from '@txnlab/use-wallet-defly'
import { NetworkId, WalletManagerPlugin } from '@txnlab/use-wallet-vue'

// Import styles if NOT using Tailwind CSS
import '@txnlab/use-wallet-ui-vue/dist/style.css'

import App from './App.vue'

const app = createApp(App)

app.use(WalletManagerPlugin, {
  wallets: [pera(), defly(), lute()],
  defaultNetwork: NetworkId.TESTNET,
})

app.mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { WalletButton, WalletUIProvider } from '@txnlab/use-wallet-ui-vue'
</script>

<template>
  <WalletUIProvider>
    <WalletButton />
  </WalletUIProvider>
</template>
```

## Passkey Wallet

[`@txnlab/use-wallet-passkey`](https://github.com/TxnLab/use-wallet/tree/main/packages/wallets/passkey#readme) (use-wallet 5.2+) derives an app-scoped Falcon-1024 account from a passkey. Register it, and the connect dialog leads with it: a **Continue with passkey** button to sign in, a **Create a passkey** link for new users, and the other wallets below. A missing passkey and a cancelled prompt raise the same browser error, so creating stays a separate choice. Passkey errors keep the dialog open with a message the user can act on, and the connected menu tags the account with its domain.

```bash
pnpm add @txnlab/use-wallet-passkey
```

```ts
// main.ts
import { passkey } from '@txnlab/use-wallet-passkey'

app.use(WalletManagerPlugin, {
  wallets: [passkey({ session: true }), lute(), pera()],
  defaultNetwork: NetworkId.TESTNET,
})
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { WalletButton, WalletUIProvider } from '@txnlab/use-wallet-ui-vue'
import { passkeyPlugin } from '@txnlab/use-wallet-ui-vue/plugins/passkey'

// `session` matches `passkey({ session: true })`
const plugins = [passkeyPlugin({ session: true, disclosure: true })]
</script>

<template>
  <WalletUIProvider :plugins="plugins">
    <WalletButton />
  </WalletUIProvider>
</template>
```

Choose how the connect dialog presents the passkey wallet with `passkey-layout` on `WalletUIProvider`, or per menu on `WalletButton` or `ConnectWalletMenu` (the menu prop wins):

- **`'featured'`** (default): a full-width **Continue with passkey** button and a "New here? **Create a passkey**" link, then the other wallets. For consumer apps where the passkey is the main way in.
- **`'list'`**: **Sign in with passkey** and **Create a passkey** rows in a "Passkey" group, above a "Wallets" group. For crypto-native apps where most users bring a wallet.

```vue
<WalletUIProvider passkey-layout="list">
  <WalletButton passkey-layout="featured" />
</WalletUIProvider>
```

`passkeyPlugin()` adds to the connected wallet menu, only while the passkey wallet is active:

- **Export Recovery Phrase**: reveals the 25-word phrase after a fresh passkey prompt, and tells users to import it as a Falcon / quantum account (in Lute, Add account → Falcon25 account → Import; in Pera, the quantum import). The phrase hides after a timeout.
- **Session status** (with `session: true`): Locked or Unlocked, with Unlock and Lock buttons
- **A note on whose account it is** (with `disclosure: true`), shown until the user chooses **Got it**, once per account

| Option           | Type                                     | Default | Description                                                                                          |
| ---------------- | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `recoveryPhrase` | `boolean \| { displayTimeout?: number }` | `true`  | Add "Export Recovery Phrase". `displayTimeout` is the seconds before the phrase hides (`60`).        |
| `session`        | `boolean`                                | `false` | Show lock status with Unlock and Lock. Turn it on with `passkey({ session })`.                       |
| `disclosure`     | `boolean \| string`                      | `false` | Show the note on whose account it is until "Got it". A string replaces it; `{domain}` is the domain. |

The plugin uses `useWalletManager()`, so it requires `@txnlab/use-wallet-vue` 5.2 or later, which any app with the passkey wallet has. The main entry still supports v4.6+. Read the adapter's [security model](https://github.com/TxnLab/use-wallet/tree/main/packages/wallets/passkey#security-model) before you ship it.

For your own connect UI, render `PasskeyConnect` with the passkey wallet (and `layout="list"` for the list layout): "Create a passkey" passes `{ create: true }` to `handleWalletClick(wallet, args)`; forward it to `wallet.connect(args)`, and call `connect` before any `await`. `WalletList` no longer renders the passkey wallet. `getPasskeyErrorMessage(error)` returns a message for a `PasskeyError`, or `null` otherwise.
