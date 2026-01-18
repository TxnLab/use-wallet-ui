# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@txnlab/use-wallet-ui`, a monorepo providing ready-to-use React UI components for Algorand wallet integration. It's a companion library to `@txnlab/use-wallet` that handles the UI layer for wallet connection, account switching, and display.

## Commands

### Development

```bash
pnpm install          # Install all dependencies
pnpm build            # Build the React package
pnpm dev              # Watch mode (in packages/react)
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
```

## Architecture

### Monorepo Structure (PNPM workspaces)

- `packages/react/` - Main publishable package (`@txnlab/use-wallet-ui-react`)
- `examples/react/` - Example app with Tailwind CSS
- `examples/react-css-only/` - Example app without Tailwind
- `e2e/` - Playwright E2E tests

### React Package Organization (`packages/react/src/`)

- `components/` - UI components (WalletButton, ConnectWalletMenu, ConnectedWalletMenu, NfdAvatar)
- `hooks/` - React hooks (useNfd, useAccountInfo, useResolvedTheme)
- `providers/` - WalletUIProvider (context for NFD lookups, theming, prefetching)
- `utils/` - Utilities (cn for classnames, IPFS URL conversion, font loading)

### Key Dependencies

- Built on `@txnlab/use-wallet-react` v4 and `algosdk` v3
- Uses `@tanstack/react-query` for data fetching (NFD, account info)
- Uses `@floating-ui/react` and `@headlessui/react` for dropdowns/dialogs
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
