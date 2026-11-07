import { useWalletManager } from '@txnlab/use-wallet-react'

import { isPasskeyWallet, type PasskeyWalletAdapter } from '../../utils/passkey'

import type { Wallet } from '@txnlab/use-wallet-react'

/**
 * Returns the passkey adapter behind a `useWallet()` wallet object, or null
 * for any other wallet. Adapter-specific methods (`unlock`, `lock`,
 * `exportRecoveryPhrase`) aren't on the hook's wallet objects, so reach the
 * adapter through the manager. Requires @txnlab/use-wallet-react 5.2+.
 */
export function usePasskeyAdapter(
  wallet: Wallet | null,
): PasskeyWalletAdapter | null {
  const manager = useWalletManager()
  if (!wallet || !isPasskeyWallet(wallet)) return null
  const adapter = manager.getWallet(wallet.walletKey)
  return (adapter as unknown as PasskeyWalletAdapter | undefined) ?? null
}
