import { EXPORT_KEY_DIALOG } from './constants'
import { ExportKeyDialog } from './ExportKeyDialog'
import { ExportKeyMenuButton } from './ExportKeyMenuButton'

import type { WalletUIPlugin } from '../types'

export { EXPORT_KEY_DIALOG } from './constants'

export interface ExportKeyPluginOptions {
  /** How long to display the mnemonic before auto-closing (seconds). Default: 120 */
  displayTimeout?: number
}

/**
 * Plugin that adds wallet recovery phrase export to the ConnectedWalletMenu.
 * Only visible for wallets that support private key access (e.g., Web3Auth).
 */
export function exportKeyPlugin(
  options: ExportKeyPluginOptions = {},
): WalletUIPlugin {
  const { displayTimeout } = options

  return {
    id: 'export-key',
    name: 'Export Recovery Phrase',

    menuItems: [
      {
        key: 'export-key-trigger',
        slot: 'after-wallet-info',
        order: 10,
        enabled: (ctx) => !!ctx.activeWallet?.canUsePrivateKey,
        render: (ctx) => <ExportKeyMenuButton ctx={ctx} />,
      },
    ],

    dialogs: [
      {
        key: EXPORT_KEY_DIALOG,
        render: ({ onClose }) => (
          <ExportKeyDialog onClose={onClose} displayTimeout={displayTimeout} />
        ),
      },
    ],
  }
}
