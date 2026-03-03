import type { WalletUIPlugin } from '../types'

export interface WelcomePluginOptions {
  /** Custom welcome dialog title */
  title?: string
  /** Custom welcome dialog message */
  message?: string
  /** localStorage key prefix for tracking welcomed addresses */
  storageKeyPrefix?: string
}

/**
 * Stub plugin for new account welcome dialog.
 *
 * When implemented, this plugin will:
 * - Use `lifecycle.onConnect` to detect first-time connections
 * - Track welcomed addresses in localStorage
 * - Show a welcome/onboarding dialog on first connection
 * - Support customizable title, message, and content
 *
 * This stub validates the plugin type contracts for lifecycle-triggered dialogs.
 */
export function welcomePlugin(
  _options: WelcomePluginOptions = {},
): WalletUIPlugin {
  // const {
  //   storageKeyPrefix = 'uwui:welcomed',
  // } = options

  return {
    id: 'welcome',
    name: 'Welcome Dialog',

    // TODO: Implement lifecycle hook to trigger on first connection
    // lifecycle: {
    //   onConnect: (ctx) => {
    //     if (!ctx.activeAddress) return
    //     const key = `${storageKeyPrefix}:${ctx.activeAddress}`
    //     if (!localStorage.getItem(key)) {
    //       ctx.openDialog('welcome-dialog')
    //     }
    //   },
    // },

    // TODO: Implement welcome dialog
    // dialogs: [
    //   {
    //     key: 'welcome-dialog',
    //     render: ({ isOpen, onClose, ctx }) => (
    //       <WelcomeDialog
    //         isOpen={isOpen}
    //         onClose={() => {
    //           const key = `${storageKeyPrefix}:${ctx.activeAddress}`
    //           localStorage.setItem(key, 'true')
    //           onClose()
    //         }}
    //         title={options.title}
    //         message={options.message}
    //       />
    //     ),
    //   },
    // ],
  }
}
