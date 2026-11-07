import { getPasskeyAccountDomain } from '../../utils/passkey'

import type { MenuRenderContext } from '../types'

/** Tells users the passkey account belongs to the site that created it */
export function PasskeyDisclosure({
  ctx,
  text,
}: {
  ctx: MenuRenderContext
  text: string
}) {
  const domain = getPasskeyAccountDomain(ctx.activeWallet?.activeAccount?.name)

  return (
    <p
      data-passkey-disclosure
      className="mb-2 rounded-lg bg-[var(--wui-color-bg-secondary)] px-3 py-2 text-xs leading-relaxed text-[var(--wui-color-text-secondary)]"
    >
      {text.replaceAll('{domain}', domain)}
    </p>
  )
}
