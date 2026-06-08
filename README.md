# use-wallet UI

Ready-to-use React and Vue UI components for Algorand wallet integration, built as a companion to [@txnlab/use-wallet](https://github.com/TxnLab/use-wallet).

![Preview of use-wallet UI components](./preview.png)

## Features

- **Drop-in Components** - One component for complete wallet connectivity
- **Flexible Styling** - Works with or without Tailwind CSS
- **Customizable** - CSS variables, size variants, and custom triggers
- **NFD Integration** - Automatic NFD name and avatar display
- **Dark Mode** - Automatic light/dark theme support
- **Account Management** - Switch between accounts and wallets

## Quick Start

### React

```bash
npm install @txnlab/use-wallet-ui-react
```

```jsx
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import { WalletUIProvider, WalletButton } from '@txnlab/use-wallet-ui-react'

// Import styles (skip if using Tailwind CSS)
import '@txnlab/use-wallet-ui-react/dist/style.css'

const walletManager = new WalletManager({
  wallets: [WalletId.PERA, WalletId.DEFLY, WalletId.LUTE],
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

### Vue

```bash
npm install @txnlab/use-wallet-ui-vue @txnlab/use-wallet-vue
```

```ts
// main.ts
import { createApp } from 'vue'
import {
  NetworkId,
  WalletId,
  WalletManagerPlugin,
} from '@txnlab/use-wallet-vue'

// Import styles (skip if using Tailwind CSS)
import '@txnlab/use-wallet-ui-react/dist/style.css'

import App from './App.vue'

const app = createApp(App)

app.use(WalletManagerPlugin, {
  wallets: [WalletId.PERA, WalletId.DEFLY, WalletId.LUTE],
  defaultNetwork: NetworkId.TESTNET,
})

app.mount('#app')
```

```html
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

## Customization

### Size Variants

```jsx
<WalletButton size="sm" />
<WalletButton size="md" />  {/* default */}
<WalletButton size="lg" />
```

### CSS Variables

Override theme colors on any wrapper element:

```css
[data-wallet-ui] {
  --wui-color-primary: #8b5cf6;
  --wui-color-primary-hover: #7c3aed;
  --wui-color-primary-text: #ffffff;
}
```

### Inline Styles

```jsx
<WalletButton
  style={{
    '--wui-color-primary': '#10b981',
    '--wui-color-primary-hover': '#059669',
  }}
/>
```

### Custom Trigger

For complete control, use the Menu components with your own button:

```jsx
import {
  ConnectWalletMenu,
  ConnectedWalletMenu,
} from '@txnlab/use-wallet-ui-react'
import { useWallet } from '@txnlab/use-wallet-react'

function CustomWalletButton() {
  const { activeAddress } = useWallet()

  if (activeAddress) {
    return (
      <ConnectedWalletMenu>
        <button className="my-button">{activeAddress.slice(0, 8)}...</button>
      </ConnectedWalletMenu>
    )
  }

  return (
    <ConnectWalletMenu>
      <button className="my-button">Connect</button>
    </ConnectWalletMenu>
  )
}
```

See the package documentation for full API references and customization guides:

- [React Package Documentation](./packages/react/README.md)
- [Vue Package Documentation](./packages/vue/README.md)

## Packages

| Package                                         | Description      |
| ----------------------------------------------- | ---------------- |
| [@txnlab/use-wallet-ui-react](./packages/react) | React components |
| [@txnlab/use-wallet-ui-vue](./packages/vue)     | Vue components   |

## Examples

| Example                                     | Description                  |
| ------------------------------------------- | ---------------------------- |
| [react](./examples/react)                   | Tailwind CSS integration     |
| [react-css-only](./examples/react-css-only) | Standalone CSS usage         |
| [react-custom](./examples/react-custom)     | All customization patterns   |
| [vue](./examples/vue)                       | Vue 3 + Tailwind integration |

## Development

```bash
pnpm install        # Install dependencies
pnpm build          # Build packages
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests
pnpm lint           # Lint code
pnpm format         # Format code
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
