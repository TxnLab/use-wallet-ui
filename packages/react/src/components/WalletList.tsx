import { isPasskeyWallet, type PasskeyConnectArgs } from '../utils/passkey'

import type { Wallet } from '@txnlab/use-wallet-react'

/** The status of a passkey connect request, shown under the passkey row */
export interface PasskeyConnectStatus {
  walletId: string
  pending: boolean
  error: string | null
}

export interface WalletListProps {
  wallets: Wallet[]
  /**
   * Connects a wallet. The passkey wallet passes `{ create: true }` from its
   * "Create passkey" button; forward `args` to `wallet.connect(args)`.
   */
  handleWalletClick: (
    wallet: Wallet,
    args?: PasskeyConnectArgs,
  ) => Promise<void>
  /** Pending state or error for the passkey wallet's connect request */
  passkeyStatus?: PasskeyConnectStatus | null
}

export function WalletList({
  wallets,
  handleWalletClick,
  passkeyStatus,
}: WalletListProps) {
  return (
    <ul className="space-y-1.5">
      {wallets.map((wallet) =>
        isPasskeyWallet(wallet) ? (
          <PasskeyWalletRow
            key={wallet.id}
            wallet={wallet}
            handleWalletClick={handleWalletClick}
            status={
              passkeyStatus?.walletId === wallet.id ? passkeyStatus : null
            }
          />
        ) : (
          <li key={wallet.id}>
            <button
              onClick={() => handleWalletClick(wallet)}
              className="flex w-full items-center gap-3 py-1.5 px-1.5 text-left text-[var(--wui-color-text)] transition-colors hover:bg-[var(--wui-color-bg-hover)] rounded-xl"
            >
              <WalletIcon wallet={wallet} />
              <span className="text-lg font-bold wallet-custom-font">
                {wallet.metadata.name}
              </span>
            </button>
          </li>
        ),
      )}
      {wallets.length === 0 && (
        <p className="text-center text-[var(--wui-color-text-secondary)]">
          No wallets found.
        </p>
      )}
    </ul>
  )
}

function WalletIcon({ wallet }: { wallet: Wallet }) {
  return (
    <div className="shrink-0 h-8 w-8 rounded-md overflow-hidden bg-[var(--wui-color-bg-secondary)] flex items-center justify-center">
      <img
        src={wallet.metadata.icon}
        alt={`${wallet.metadata.name} icon`}
        className="h-8 w-8 object-contain rounded-md"
      />
    </div>
  )
}

/**
 * Passkeys need two actions: a missing passkey and a cancelled prompt raise
 * the same browser error, so the user chooses between creating and signing in.
 */
function PasskeyWalletRow({
  wallet,
  handleWalletClick,
  status,
}: {
  wallet: Wallet
  handleWalletClick: WalletListProps['handleWalletClick']
  status: PasskeyConnectStatus | null
}) {
  const pending = !!status?.pending

  return (
    <li data-wallet-id={wallet.id}>
      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 py-1.5 px-1.5 text-[var(--wui-color-text)]">
        <WalletIcon wallet={wallet} />
        <span className="text-lg font-bold wallet-custom-font">
          {wallet.metadata.name}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => handleWalletClick(wallet, { create: true })}
            disabled={pending}
            className="py-1.5 px-3 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-lg hover:brightness-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create passkey
          </button>
          <button
            onClick={() => handleWalletClick(wallet)}
            disabled={pending}
            aria-label="Sign in with passkey"
            className="py-1.5 px-3 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-lg hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </div>
      </div>
      {pending && (
        <p
          role="status"
          className="px-1.5 pb-1 text-sm text-[var(--wui-color-text-secondary)]"
        >
          Waiting for your passkey…
        </p>
      )}
      {!pending && status?.error && (
        <p
          role="alert"
          className="mx-1.5 mb-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
        >
          {status.error}
        </p>
      )}
    </li>
  )
}
