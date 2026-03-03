import type { WalletUIPlugin } from '../types'

export interface BeforeSignPluginOptions {
  /** Whether to enable browser extension detection via window.postMessage */
  enableExtensionDetection?: boolean
}

/**
 * Stub plugin for transaction review before signing.
 *
 * When implemented, this plugin will:
 * - Provide a `Provider` that manages sign request state (pendingSign, signing)
 * - Intercept transaction signing to show a review dialog
 * - Optionally detect and communicate with a browser extension companion
 * - Show a dialog with transaction details and danger detection
 *
 * This stub validates the plugin type contracts for Provider-based plugins
 * with lifecycle hooks and dialogs.
 */
export function beforeSignPlugin(
  _options: BeforeSignPluginOptions = {},
): WalletUIPlugin {
  return {
    id: 'before-sign',
    name: 'Transaction Review',

    // TODO: Implement Provider that wraps children with sign request state
    // Provider: BeforeSignProvider,

    // TODO: Implement lifecycle hooks for extension detection
    // lifecycle: {
    //   onConnect: (ctx) => {
    //     // Ping browser extension via window.postMessage
    //     // Listen for PONG response to detect extension
    //   },
    // },

    // TODO: Implement review dialog
    // dialogs: [
    //   {
    //     key: 'before-sign-dialog',
    //     render: ({ isOpen, onClose, ctx }) => (
    //       <BeforeSignDialog isOpen={isOpen} onClose={onClose} />
    //     ),
    //   },
    // ],

    // TODO: Implement extension indicator in menu
    // menuItems: [
    //   {
    //     key: 'extension-indicator',
    //     slot: 'after-balance',
    //     order: 10,
    //     enabled: (ctx) => extensionDetected,
    //     render: (ctx) => <ExtensionSignIndicator />,
    //   },
    // ],
  }
}
