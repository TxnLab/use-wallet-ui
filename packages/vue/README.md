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
- `algosdk` v3+
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
