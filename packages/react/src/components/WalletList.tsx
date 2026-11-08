import { WalletIcon } from './WalletIcon'

import type { Wallet } from '@txnlab/use-wallet-react'

export interface WalletListProps {
  wallets: Wallet[]
  handleWalletClick: (wallet: Wallet) => Promise<void>
}

export function WalletList({ wallets, handleWalletClick }: WalletListProps) {
  return (
    <ul className="space-y-1.5">
      {wallets.map((wallet) => (
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
      ))}
      {wallets.length === 0 && (
        <p className="text-center text-[var(--wui-color-text-secondary)]">
          No wallets found.
        </p>
      )}
    </ul>
  )
}
