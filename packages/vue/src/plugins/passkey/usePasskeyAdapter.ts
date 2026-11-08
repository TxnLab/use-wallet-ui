import { useWalletManager, type Wallet } from '@txnlab/use-wallet-vue'
import { computed, type ComputedRef } from 'vue'

import { isPasskeyWallet, type PasskeyWalletAdapter } from '../../utils/passkey'

/**
 * Returns the passkey adapter behind a `useWallet()` wallet object, or null
 * for any other wallet. Adapter-specific methods (`unlock`, `lock`,
 * `exportRecoveryPhrase`) aren't on the composable's wallet objects, so reach
 * the adapter through the manager. Requires @txnlab/use-wallet-vue 5.2+.
 */
export function usePasskeyAdapter(
  wallet: () => Wallet | null,
): ComputedRef<PasskeyWalletAdapter | null> {
  const manager = useWalletManager()
  return computed(() => {
    const activeWallet = wallet()
    if (!activeWallet || !isPasskeyWallet(activeWallet)) return null
    const adapter = manager.getWallet(activeWallet.walletKey)
    return (adapter as unknown as PasskeyWalletAdapter | undefined) ?? null
  })
}
