# use-wallet UI

Ready-to-use UI components for Algorand wallet integration, built as a companion to [@txnlab/use-wallet](https://github.com/TxnLab/use-wallet).

![Preview of use-wallet UI components](./preview.png)

## Features

- **Drop-in Components** - One component for complete wallet connectivity
- **Flexible Styling** - Works with or without Tailwind CSS
- **Customizable** - CSS variables, size variants, and custom triggers
- **NFD Integration** - Automatic NFD name and avatar display
- **Dark Mode** - Automatic light/dark theme support
- **Account Management** - Switch between accounts and wallets

## Quick Start

```bash
npm install @txnlab/use-wallet-ui-react
```

```jsx
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
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
import { ConnectWalletMenu, ConnectedWalletMenu } from '@txnlab/use-wallet-ui-react'
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

See the [React Package Documentation](./packages/react/README.md) for the full API reference and customization guide.

## Packages

| Package | Description |
|---------|-------------|
| [@txnlab/use-wallet-ui-react](./packages/react) | React components |

## Examples

| Example | Description |
|---------|-------------|
| [react](./examples/react) | Tailwind CSS integration |
| [react-css-only](./examples/react-css-only) | Standalone CSS usage |
| [react-custom](./examples/react-custom) | All customization patterns |

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
