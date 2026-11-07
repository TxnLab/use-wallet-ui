# use-wallet-ui React Passkey Example

A Vite + React example of passkey accounts with `@txnlab/use-wallet-passkey` and the `passkeyPlugin` from `@txnlab/use-wallet-ui-react`.

## Getting Started

From the monorepo root:

```bash
pnpm install
cd examples/react-passkey && pnpm dev
```

Open http://localhost:5176. Passkeys need a secure context, and browsers treat `localhost` as one.

## Features

- **Create passkey / Sign in**: the connect dialog's two passkey actions
- **passkeyPlugin**: recovery phrase export, session lock status with Unlock and Lock, and a note on whose account it is
- **Lute and Pera**: wallets that can import the recovery phrase as a Falcon / quantum account

## Structure

```
src/
  App.tsx          # WalletManager with passkey(), lute(), pera(); WalletUIProvider with passkeyPlugin
  index.css        # Tailwind + use-wallet-ui-react source import
  components/
    WalletInfo.tsx # Account info card using useNfd, useAccountInfo, NfdAvatar
```
