/** The wallet id registered by `passkey()` from `@txnlab/use-wallet-passkey` */
export const PASSKEY_WALLET_ID = 'passkey'

/**
 * The `PasskeyAdapter` members this library uses. Typed structurally so the
 * library needs no dependency on `@txnlab/use-wallet-passkey`.
 */
export interface PasskeyWalletAdapter {
  /** True when the session key is unlocked */
  readonly isUnlocked: boolean
  /** Unlock the session with one passkey prompt */
  unlock: () => Promise<void>
  /** Drop the session key; the account stays connected */
  lock: () => void
  /** Return the account's recovery phrase after a fresh passkey prompt */
  exportRecoveryPhrase: () => Promise<{ scheme: 'falcon-1024'; phrase: string }>
}

/** The status of a passkey connect request, shown under the passkey row */
export interface PasskeyConnectStatus {
  walletId: string
  pending: boolean
  error: string | null
}

/** Arguments for connecting the passkey wallet */
export interface PasskeyConnectArgs {
  /** Create a new passkey (and account) instead of signing in */
  create?: boolean
}

export function isPasskeyWallet(
  wallet: { id: string } | null | undefined,
): boolean {
  return wallet?.id === PASSKEY_WALLET_ID
}

/** Returns a `PasskeyError`'s code, or null for any other error */
export function getPasskeyErrorCode(error: unknown): string | null {
  if (!(error instanceof Error) || error.name !== 'PasskeyError') return null
  const { code } = error as Error & { code?: unknown }
  return typeof code === 'string' ? code : null
}

/**
 * Returns a message to show users for a `PasskeyError`, or null for any other
 * error.
 */
export function getPasskeyErrorMessage(error: unknown): string | null {
  const code = getPasskeyErrorCode(error)
  if (!code) return null

  switch (code) {
    case 'cancelled':
      return 'The passkey request was cancelled or timed out, or no passkey was found.'
    case 'unsupported':
      return "This browser can't use passkeys here. If you opened this page inside another app, open it in Safari or Chrome instead."
    case 'prf-unsupported':
      return "Your passkey provider doesn't support passkey accounts. Try a different provider, such as iCloud Keychain or Google Password Manager."
    case 'key-mismatch':
      return 'This passkey belongs to a different account. Choose the passkey you used for this account.'
    default:
      return (error as Error).message || 'The passkey request failed.'
  }
}

/**
 * The domain a passkey account belongs to. The adapter names the account
 * `Passkey · <domain>`; fall back to the page's hostname.
 */
export function getPasskeyAccountDomain(accountName?: string | null): string {
  const separator = ' · '
  const index = accountName?.lastIndexOf(separator) ?? -1
  if (accountName && index !== -1) {
    const domain = accountName.slice(index + separator.length).trim()
    if (domain) return domain
  }
  return typeof location !== 'undefined' ? location.hostname : ''
}
