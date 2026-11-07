import { useEffect, useState } from 'react'

import { getPasskeyErrorMessage } from '../../utils/passkey'

import { usePasskeyAdapter } from './usePasskeyAdapter'

import type { MenuRenderContext } from '../types'

// The adapter's onLock/onUnlock callbacks belong to the app, so re-read
// isUnlocked while the menu is open to catch locks from timeouts
const POLL_INTERVAL_MS = 1000

/** Shows whether the passkey session is unlocked, with Unlock and Lock */
export function PasskeySessionControl({ ctx }: { ctx: MenuRenderContext }) {
  const adapter = usePasskeyAdapter(ctx.activeWallet)
  const [isUnlocked, setIsUnlocked] = useState(() => !!adapter?.isUnlocked)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adapter) return
    setIsUnlocked(adapter.isUnlocked)
    const timer = setInterval(
      () => setIsUnlocked(adapter.isUnlocked),
      POLL_INTERVAL_MS,
    )
    return () => clearInterval(timer)
  }, [adapter])

  if (!adapter) return null

  const handleUnlock = () => {
    setError(null)
    // Call unlock before any await: iOS drops the user's tap across one
    const unlocking = adapter.unlock()
    setPending(true)
    unlocking
      .then(() => setIsUnlocked(adapter.isUnlocked))
      .catch((err: unknown) => {
        setError(
          getPasskeyErrorMessage(err) ??
            (err instanceof Error ? err.message : 'Unlock failed'),
        )
      })
      .finally(() => setPending(false))
  }

  const handleLock = () => {
    adapter.lock()
    setIsUnlocked(adapter.isUnlocked)
    setError(null)
  }

  return (
    <div data-passkey-session className="mb-2">
      <div className="flex items-center justify-between gap-2 px-1 py-0.5">
        <span className="flex items-center gap-2 text-sm text-[var(--wui-color-text-secondary)]">
          {isUnlocked ? <UnlockedIcon /> : <LockedIcon />}
          <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
        </span>
        {isUnlocked ? (
          <button
            onClick={handleLock}
            className="py-1 px-2.5 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-md hover:brightness-90 transition-all text-xs"
          >
            Lock
          </button>
        ) : (
          <button
            onClick={handleUnlock}
            disabled={pending}
            className="py-1 px-2.5 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-md hover:bg-[var(--wui-color-primary-hover)] transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Waiting…' : 'Unlock'}
          </button>
        )}
      </div>
      {!isUnlocked && !error && (
        <p className="px-1 text-xs text-[var(--wui-color-text-tertiary)]">
          The next signature asks for your passkey.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-xs text-[var(--wui-color-danger-text)]"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function LockedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function UnlockedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
    </svg>
  )
}
