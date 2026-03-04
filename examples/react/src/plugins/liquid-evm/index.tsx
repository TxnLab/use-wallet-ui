import { BridgeDialog } from './BridgeDialog'
import {
  BRIDGE_DIALOG,
  MANAGE_PANEL,
  WELCOME_DIALOG,
  WELCOME_SEEN_KEY,
} from './constants'
import { ManagePanel } from './ManagePanel'
import { WelcomeDialog } from './WelcomeDialog'

import type { WalletUIPlugin } from '@txnlab/use-wallet-ui-react'

export interface LiquidEvmPluginOptions {
  /** Whether to show the welcome dialog on first connection. Default: true */
  showWelcome?: boolean
}

/**
 * Liquid EVM plugin — a proof-of-concept reimplementing key features from the
 * tasosbit/liquid-accounts community fork as a plugin.
 *
 * Features:
 * - ManagePanel: Full panel with Send/Receive/Assets tabs
 * - WelcomeDialog: Shows on first wallet connection (lifecycle hooks + dialog)
 * - BridgeDialog: Placeholder bridge dialog triggered from menu item
 *
 * Known gaps (require core wallet hooks not available in plugin API):
 * - BeforeSignDialog / signing interception (needs `registerUIHook` in core)
 * - ExtensionSignIndicator (needs wallet signing hooks)
 * - RainbowKit/Wagmi EVM integration (out of scope)
 */
export function liquidEvmPlugin(
  options: LiquidEvmPluginOptions = {},
): WalletUIPlugin {
  const { showWelcome = true } = options

  return {
    id: 'liquid-evm',
    name: 'Liquid EVM Accounts',

    panels: [
      {
        key: MANAGE_PANEL,
        label: 'Manage',
        order: 10,
        icon: ({ className }) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
        ),
        render: ({ ctx }) => <ManagePanel ctx={ctx} />,
      },
    ],

    menuItems: [
      {
        key: 'liquid-evm-bridge-trigger',
        slot: 'before-actions',
        order: 10,
        render: (ctx) => (
          <button
            onClick={() => {
              ctx.closeMenu()
              ctx.openDialog(BRIDGE_DIALOG)
            }}
            className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-sm text-[var(--wui-color-text)] hover:bg-[var(--wui-color-bg-secondary)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[var(--wui-color-text-secondary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
              Bridge
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--wui-color-text-tertiary)]"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        ),
      },
    ],

    dialogs: [
      {
        key: BRIDGE_DIALOG,
        render: ({ onClose }) => <BridgeDialog onClose={onClose} />,
      },
      {
        key: WELCOME_DIALOG,
        render: ({ onClose }) => <WelcomeDialog onClose={onClose} />,
      },
    ],

    lifecycle: showWelcome
      ? {
          onConnect: (ctx) => {
            const seen = localStorage.getItem(WELCOME_SEEN_KEY)
            if (!seen) {
              ctx.openDialog(WELCOME_DIALOG)
            }
          },
        }
      : undefined,
  }
}
