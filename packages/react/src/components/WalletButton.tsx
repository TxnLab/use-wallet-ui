import { useWallet } from '@txnlab/use-wallet-react'
import React from 'react'

import { ConnectedWalletButton } from './ConnectedWalletButton'
import { ConnectedWalletMenu } from './ConnectedWalletMenu'
import { type ButtonSize, ConnectWalletButton } from './ConnectWalletButton'
import { ConnectWalletMenu } from './ConnectWalletMenu'

import type { PasskeyConnectLayout } from '../utils/passkey'

export interface WalletButtonProps {
  /** Size variant for the button */
  size?: ButtonSize
  /** Additional CSS classes to apply to the button */
  className?: string
  /** Inline styles to apply to the button (can include CSS variable overrides) */
  style?: React.CSSProperties
  /**
   * How the connect dialog presents a passkey wallet: 'featured' or 'list'.
   * Overrides the `WalletUIProvider` setting; the default is 'featured'.
   */
  passkeyLayout?: PasskeyConnectLayout
}

export function WalletButton({
  size,
  className,
  style,
  passkeyLayout,
}: WalletButtonProps) {
  const { activeAddress } = useWallet()

  // If connected, show the connected wallet menu
  if (activeAddress) {
    return (
      <ConnectedWalletMenu>
        <ConnectedWalletButton
          size={size}
          className={className}
          style={style}
        />
      </ConnectedWalletMenu>
    )
  }

  // If not connected, show the ConnectWalletMenu with customized button
  return (
    <ConnectWalletMenu passkeyLayout={passkeyLayout}>
      <ConnectWalletButton size={size} className={className} style={style} />
    </ConnectWalletMenu>
  )
}
