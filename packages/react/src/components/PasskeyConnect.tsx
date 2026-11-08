import { cn } from '../utils/cn'

import { WalletGroupLabel } from './WalletGroupLabel'
import { WalletIcon } from './WalletIcon'

import type {
  PasskeyConnectArgs,
  PasskeyConnectLayout,
  PasskeyConnectStatus,
} from '../utils/passkey'
import type { Wallet } from '@txnlab/use-wallet-react'

export interface PasskeyConnectProps {
  /** The passkey wallet (`id: 'passkey'`) */
  wallet: Wallet
  /**
   * Connects the wallet. "Create a passkey" passes `{ create: true }`; forward
   * `args` to `wallet.connect(args)` before any `await`.
   */
  handleWalletClick: (
    wallet: Wallet,
    args?: PasskeyConnectArgs,
  ) => Promise<void>
  /** Pending state or error for the passkey wallet's connect request */
  status?: PasskeyConnectStatus | null
  /**
   * `'list'` (default): "Sign in with passkey" and "Create a passkey" rows
   * under a "Passkey" group label. `'featured'`: a "Continue with passkey"
   * button and a "Create a passkey" link.
   */
  layout?: PasskeyConnectLayout
  /** Show the "Passkey" group label in the `'list'` layout. Default: true */
  showLabel?: boolean
}

const WAITING = 'Waiting for your passkey…'

const ROW_CLASS =
  'flex w-full items-center gap-3 py-1.5 px-1.5 text-left text-[var(--wui-color-text)] transition-colors hover:bg-[var(--wui-color-bg-hover)] disabled:hover:bg-transparent rounded-xl'

// The control that started the request stays at full strength (and shows
// the waiting state); the other one dims while the passkey prompt is open
function pendingClass(isPressed: boolean): string {
  return isPressed
    ? 'disabled:cursor-wait'
    : 'disabled:opacity-50 disabled:cursor-not-allowed'
}

/**
 * The passkey section of the connect dialog: one action signs in, and
 * "Create a passkey" makes a new one. A missing passkey and a cancelled
 * prompt raise the same browser error, so creating stays a separate,
 * explicit choice.
 */
export function PasskeyConnect({
  wallet,
  handleWalletClick,
  status,
  layout = 'list',
  showLabel = true,
}: PasskeyConnectProps) {
  const current = status?.walletId === wallet.id ? status : null
  const pending = !!current?.pending
  const pendingAction = pending ? (current?.action ?? 'sign-in') : null
  const signingIn = pendingAction === 'sign-in'
  const creating = pendingAction === 'create'

  // Announced to screen readers; the pressed control shows it visually
  const statusRegion = (
    <p role="status" className="sr-only">
      {pending ? WAITING : ''}
    </p>
  )

  if (layout === 'list') {
    return (
      <div data-passkey-connect="list" className="flex flex-col gap-1">
        {showLabel && <WalletGroupLabel>Passkey</WalletGroupLabel>}
        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => handleWalletClick(wallet)}
              disabled={pending}
              aria-busy={signingIn}
              className={cn(ROW_CLASS, pendingClass(signingIn))}
            >
              {signingIn ? <SpinnerTile /> : <WalletIcon wallet={wallet} />}
              <span className="text-lg font-bold wallet-custom-font">
                {signingIn ? WAITING : 'Sign in with passkey'}
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => handleWalletClick(wallet, { create: true })}
              disabled={pending}
              aria-busy={creating}
              className={cn(ROW_CLASS, pendingClass(creating))}
            >
              {creating ? (
                <SpinnerTile />
              ) : (
                <div className="shrink-0 h-8 w-8 rounded-md border-[1.5px] border-dashed border-[var(--wui-color-text-tertiary)] text-[var(--wui-color-text-secondary)] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              )}
              <span className="text-lg font-bold wallet-custom-font">
                {creating ? WAITING : 'Create a passkey'}
              </span>
            </button>
          </li>
        </ul>
        {statusRegion}
        {!pending && current?.error && (
          <p
            role="alert"
            className="mx-1.5 mb-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
          >
            {current.error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      data-passkey-connect="featured"
      className="flex flex-col gap-2.5 px-[22px] pt-1 pb-4"
    >
      <button
        type="button"
        onClick={() => handleWalletClick(wallet)}
        disabled={pending}
        aria-busy={signingIn}
        className={cn(
          'flex w-full items-center justify-center gap-2.5 rounded-[14px] px-4 py-3 text-base font-semibold bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)] transition-colors',
          pendingClass(signingIn),
        )}
      >
        {signingIn ? <Spinner className="h-5 w-5" /> : <KeyRoundIcon />}
        {signingIn ? WAITING : 'Continue with passkey'}
      </button>
      <p className="text-center text-sm text-[var(--wui-color-text-secondary)]">
        {!creating && 'New here? '}
        <button
          type="button"
          onClick={() => handleWalletClick(wallet, { create: true })}
          disabled={pending}
          aria-busy={creating}
          className={cn(
            'inline-flex items-center gap-1.5 font-medium text-[var(--wui-color-link)] hover:text-[var(--wui-color-link-hover)]',
            pendingClass(creating),
          )}
        >
          {creating && <Spinner className="h-3.5 w-3.5" />}
          {creating ? WAITING : 'Create a passkey'}
        </button>
      </p>
      {statusRegion}
      {!pending && current?.error && (
        <p
          role="alert"
          className="rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
        >
          {current.error}
        </p>
      )}
    </div>
  )
}

/** A spinner in place of a 32 px wallet icon */
function SpinnerTile() {
  return (
    <div className="shrink-0 h-8 w-8 rounded-md bg-[var(--wui-color-bg-secondary)] text-[var(--wui-color-text-secondary)] flex items-center justify-center">
      <Spinner className="h-[18px] w-[18px]" />
    </div>
  )
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 animate-spin', className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Key glyph: Lucide "key-round", ISC License, https://lucide.dev/license
function KeyRoundIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}
