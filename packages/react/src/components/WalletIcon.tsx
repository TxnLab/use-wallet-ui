import type { Wallet } from '@txnlab/use-wallet-react'

/** A wallet's 32 px icon tile, as shown in the connect dialog */
export function WalletIcon({ wallet }: { wallet: Wallet }) {
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
