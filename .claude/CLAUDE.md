# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@txnlab/use-wallet-ui`, a monorepo providing ready-to-use React and Vue UI components for Algorand wallet integration. It's a companion library to `@txnlab/use-wallet` that handles the UI layer for wallet connection, account switching, and display.

## Commands

### Development

```bash
pnpm install          # Install all dependencies
pnpm build            # Build the React and Vue packages
pnpm build:examples   # Build all example apps
pnpm dev              # Watch mode (in packages/react or packages/vue)
```

### Testing

```bash
pnpm test             # Run unit tests across all packages
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Run E2E tests with Playwright UI
pnpm test:e2e:headed  # Run E2E tests in headed browser
pnpm test:e2e:update  # Update E2E snapshots
```

### Code Quality

```bash
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm typecheck        # TypeScript type checking
```

### Running Examples

```bash
cd examples/react && pnpm dev        # Tailwind CSS example
cd examples/react-css-only && pnpm dev  # CSS-only example
cd examples/react-custom && pnpm dev    # Custom trigger/menu example
cd examples/react-web3auth && pnpm dev  # Web3Auth + export-key plugin (needs VITE_WEB3AUTH_CLIENT_ID, see .env.example; open http://127.0.0.1:5173)
cd examples/vue && pnpm dev             # Vue example
cd examples/react-passkey && pnpm dev   # Passkey wallet + passkey plugin (http://localhost:5176)
cd examples/vue-passkey && pnpm dev     # Vue passkey example (http://localhost:5177)
```

## Architecture

### Monorepo Structure (PNPM workspaces)

- `packages/react/` - React package (`@txnlab/use-wallet-ui-react`), released by semantic-release
- `packages/vue/` - Vue package (`@txnlab/use-wallet-ui-vue`), released manually via the "Release Vue (manual)" workflow
- `examples/react/` - React example with Tailwind CSS
- `examples/react-css-only/` - React example without Tailwind
- `examples/react-custom/` - React example with custom triggers and menus
- `examples/react-web3auth/` - React example with Web3Auth and the export-key plugin
- `examples/vue/` - Vue example with Tailwind CSS
- `examples/react-passkey/`, `examples/vue-passkey/` - Passkey, Lute and Pera with the passkey plugin; e2e runs the `passkey-react` and `passkey-vue` projects against them with Chromium's virtual authenticator
- `e2e/` - Playwright E2E tests

### React Package Organization (`packages/react/src/`)

- `components/` - UI components (WalletButton, ConnectWalletMenu, ConnectedWalletMenu, NfdAvatar)
- `hooks/` - React hooks (useNfd, useAccountInfo, useResolvedTheme)
- `providers/` - WalletUIProvider (context for NFD lookups, theming, prefetching)
- `plugins/` - Plugin system, the `export-key` plugin and the `passkey` plugin (separate `./plugins/export-key` and `./plugins/passkey` entries)
- `utils/` - Utilities (cn for classnames, IPFS URL conversion, font loading, passkey error messages)

`packages/vue/src/` mirrors this layout, with `composables/` in place of `hooks/`.

### Key Dependencies

- Built on `@txnlab/use-wallet-react` / `@txnlab/use-wallet-vue` and `algosdk` v3 (use-wallet core 5.1+ requires `^3.7.0`). The peer range is `^4.6.0 || ^5.0.0`; devDependencies and examples use v5.
- Keep the library source compatible with both use-wallet v4 and v5. For example, `ConnectWalletMenu` uses `availableWallets ?? wallets` because v4 has no `availableWallets`.
- Passkey wallet (`id: 'passkey'`, use-wallet 5.2+): the connect dialog renders `PasskeyConnect` in one of two layouts, chosen by `passkeyLayout` (menu or `WalletButton` prop > `WalletUIProvider` prop > `'list'`, via `resolvePasskeyLayout`): `'list'` shows "Sign in with passkey" / "Create a passkey" rows in a Passkey group above a Wallets group; `'featured'` leads with "Continue with passkey" and a "Create a passkey" link, then the other wallets. `WalletList` never renders the passkey wallet. `ConnectedWalletMenu` tags passkey accounts with their domain. All of that is in the core entry, which works on any supported peer. The plugin's disclosure is off by default and shows once per address (`localStorage`, with an in-memory fallback). Only the `./plugins/passkey` entry imports `useWalletManager` (React/Vue 5.2+); never import it from the main entry. The adapter is typed structurally (`PasskeyWalletAdapter`); `@txnlab/use-wallet-passkey` is a devDependency only, for tests and examples. Call `connect`/`unlock`/`exportRecoveryPhrase` before any `await` in click handlers (iOS drops the tap).
- use-wallet v5 configures wallets with adapter factories (`pera()`, `defly()`, …) from separate packages, not the `WalletId` enum.
- Uses `@tanstack/react-query` / `@tanstack/vue-query` for data fetching (NFD, account info)
- Uses `@floating-ui/*` and `@headlessui/*` for dropdowns/dialogs
- Supports both Tailwind CSS and standalone CSS styling

### Styling System

The library has dual styling support:

1. **Tailwind CSS** - Components use Tailwind utility classes
2. **Standalone CSS** - Pre-built CSS via `dist/style.css` scoped with `[data-wallet-ui]` attribute

CSS is generated via `pnpm generate:css` which runs Tailwind CLI and post-processing.

## Commit Convention

Uses Angular commit format: `<type>(<scope>): <subject>`

Types: feat, fix, docs, style, refactor, perf, test, chore

## Maintaining This File

Keep this file updated when making significant changes to the codebase. It doesn't need to be updated on every change, but ensure the information remains accurate—fix or update anything that becomes outdated. Use best judgement when determining if updates are necessary.
