import { h } from 'vue'

import { isPasskeyWallet } from '../../utils/passkey'

import {
  DEFAULT_PASSKEY_DISCLOSURE,
  PASSKEY_RECOVERY_DIALOG,
} from './constants'
import PasskeyDisclosure from './PasskeyDisclosure.vue'
import PasskeyRecoveryDialog from './PasskeyRecoveryDialog.vue'
import PasskeyRecoveryMenuButton from './PasskeyRecoveryMenuButton.vue'
import PasskeySessionControl from './PasskeySessionControl.vue'

import type { PluginDialog, PluginMenuItem, WalletUIPlugin } from '../types'

export {
  DEFAULT_PASSKEY_DISCLOSURE,
  PASSKEY_RECOVERY_DIALOG,
} from './constants'
export { usePasskeyAdapter } from './usePasskeyAdapter'
export type { PasskeyWalletAdapter } from '../../utils/passkey'

export interface PasskeyPluginOptions {
  /**
   * Add "Export Recovery Phrase" to the menu. Pass an object to set how long
   * the phrase stays visible (seconds, default 60). Default: true
   */
  recoveryPhrase?: boolean | { displayTimeout?: number }
  /**
   * Show the session's lock status with Unlock and Lock buttons. Turn it on
   * when the passkey wallet is configured with `passkey({ session })`.
   * Default: false
   */
  session?: boolean
  /**
   * Tell users the account belongs to this site, until they choose "Got it"
   * (remembered per account). Pass a string to replace the text; `{domain}`
   * is replaced with the account's domain. The menu always shows the domain
   * as a tag. Default: false
   */
  disclosure?: boolean | string
}

/**
 * Plugin that adds passkey account features to the ConnectedWalletMenu:
 * recovery phrase export, session lock status, and an optional note on whose
 * account it is. Only visible when the passkey wallet is active.
 *
 * Requires @txnlab/use-wallet-vue 5.2 or later.
 */
export function passkeyPlugin(
  options: PasskeyPluginOptions = {},
): WalletUIPlugin {
  const { recoveryPhrase = true, session = false, disclosure = false } = options

  const enabled = (ctx: { activeWallet: { id: string } | null }) =>
    isPasskeyWallet(ctx.activeWallet)

  const menuItems: PluginMenuItem[] = []
  const dialogs: PluginDialog[] = []

  if (disclosure) {
    const text =
      typeof disclosure === 'string' ? disclosure : DEFAULT_PASSKEY_DISCLOSURE
    menuItems.push({
      key: 'passkey-disclosure',
      slot: 'after-wallet-info',
      order: 5,
      enabled,
      render: (ctx) => h(PasskeyDisclosure, { ctx, text }),
    })
  }

  if (session) {
    menuItems.push({
      key: 'passkey-session',
      slot: 'after-wallet-info',
      order: 10,
      enabled,
      render: (ctx) => h(PasskeySessionControl, { ctx }),
    })
  }

  if (recoveryPhrase) {
    const displayTimeout =
      typeof recoveryPhrase === 'object'
        ? recoveryPhrase.displayTimeout
        : undefined
    menuItems.push({
      key: 'passkey-recovery-trigger',
      slot: 'after-wallet-info',
      order: 20,
      enabled,
      render: (ctx) => h(PasskeyRecoveryMenuButton, { ctx }),
    })
    dialogs.push({
      key: PASSKEY_RECOVERY_DIALOG,
      render: ({ onClose, ctx }) =>
        h(PasskeyRecoveryDialog, { ctx, onClose, displayTimeout }),
    })
  }

  return {
    id: 'passkey',
    name: 'Passkey',
    menuItems,
    dialogs,
  }
}
