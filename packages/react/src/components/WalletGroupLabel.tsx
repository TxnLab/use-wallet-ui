import type { ReactNode } from 'react'

/** A group heading in the connect dialog's list layout ("Passkey", "Wallets") */
export function WalletGroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--wui-color-text-secondary)]">
      {children}
    </p>
  )
}
