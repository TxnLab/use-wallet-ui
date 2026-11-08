import { useState } from 'react'

import { getPasskeyAccountDomain } from '../../utils/passkey'

import { dismissDisclosure, isDisclosureDismissed } from './storage'

import type { MenuRenderContext } from '../types'

/**
 * Tells users the passkey account belongs to the site that created it. Shows
 * until the user chooses "Got it", once per account; the domain tag in the
 * menu stays after that.
 */
export function PasskeyDisclosure({
  ctx,
  text,
}: {
  ctx: MenuRenderContext
  text: string
}) {
  const address = ctx.activeAddress
  // Re-render after dismissing; the dismissal itself lives in storage
  const [, setDismissedCount] = useState(0)

  if (!address || isDisclosureDismissed(address)) return null

  const domain = getPasskeyAccountDomain(ctx.activeWallet?.activeAccount?.name)

  const handleDismiss = () => {
    dismissDisclosure(address)
    setDismissedCount((count) => count + 1)
  }

  return (
    <div
      role="note"
      data-passkey-disclosure
      className="mb-2 flex flex-col gap-2 rounded-[10px] border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] px-3 py-2.5"
    >
      <p className="text-xs leading-[1.55] text-[var(--wui-color-text-secondary)]">
        {text.replaceAll('{domain}', domain)}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="self-end rounded-md bg-[var(--wui-color-primary)] px-2.5 py-1 text-xs font-medium text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)]"
      >
        Got it
      </button>
    </div>
  )
}
