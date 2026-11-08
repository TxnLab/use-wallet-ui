# use-wallet-ui Vue Passkey Example

A Vite + Vue 3 example of passkey accounts with `@txnlab/use-wallet-passkey` and the `passkeyPlugin` from `@txnlab/use-wallet-ui-vue`.

## Getting Started

From the monorepo root:

```bash
pnpm install
cd examples/vue-passkey && pnpm dev
```

Open http://localhost:5177. Passkeys need a secure context, and browsers treat `localhost` as one.

## Features

- **Continue with passkey / Create a passkey**: the connect dialog's passkey section, in the Featured or List layout (the header's layout selector, or open `?layout=list`)
- **passkeyPlugin**: recovery phrase export, session lock status with Unlock and Lock, and a note on whose account it is (`disclosure: true`, shown until "Got it")
- **Lute and Pera**: wallets that can import the recovery phrase as a Falcon / quantum account

## Structure

```
src/
  main.ts          # Vue app entry, WalletManagerPlugin with passkey(), lute(), pera()
  App.vue          # Root component with header, theme switcher, WalletButton, passkeyPlugin
  index.css        # Tailwind + use-wallet-ui-vue source import
  components/
    WalletInfo.vue # Account info card using useNfd, useAccountInfo, NfdAvatar
```
