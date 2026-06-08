# use-wallet-ui Vue Example

A Vite + Vue 3 example demonstrating wallet connection, NFD profile integration, and balance display using `@txnlab/use-wallet-ui-vue` with Tailwind CSS.

## Getting Started

From the monorepo root:

```bash
pnpm install
cd examples/vue && pnpm dev
```

Or from the monorepo root:

```bash
pnpm --filter @txnlab/use-wallet-ui-vue-example dev
```

## Features

- **WalletButton** — connects/disconnects wallets via a single smart button
- **WalletInfo** — displays NFD profile, avatar, and ALGO balance for the connected account
- **Theme switching** — system/light/dark modes with Tailwind dark class strategy
- **exportKeyPlugin** — demonstrates the plugin system for exporting wallet private keys

## Structure

```
src/
  main.ts          # Vue app entry, WalletManagerPlugin setup
  App.vue          # Root component with header, theme switcher, WalletButton
  index.css        # Tailwind + use-wallet-ui-vue source import
  components/
    WalletInfo.vue # Account info card using useNfd, useAccountInfo, NfdAvatar
```
