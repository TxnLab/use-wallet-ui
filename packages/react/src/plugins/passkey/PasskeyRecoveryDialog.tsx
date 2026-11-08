import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getPasskeyErrorMessage } from '../../utils/passkey'

import { markRecoveryPhraseShown } from './storage'
import { usePasskeyAdapter } from './usePasskeyAdapter'

import type { PluginRenderContext } from '../types'

type DialogStep = 'warning' | 'loading' | 'display' | 'error'

export const DEFAULT_PASSKEY_DISPLAY_TIMEOUT = 60

export interface PasskeyRecoveryDialogProps {
  ctx: PluginRenderContext
  onClose: () => void
  /** Seconds to show the phrase before the dialog closes. Default: 60 */
  displayTimeout?: number
}

export function PasskeyRecoveryDialog({
  ctx,
  onClose,
  displayTimeout = DEFAULT_PASSKEY_DISPLAY_TIMEOUT,
}: PasskeyRecoveryDialogProps) {
  const adapter = usePasskeyAdapter(ctx.activeWallet)

  const [step, setStep] = useState<DialogStep>('warning')
  // The phrase only ever lives in this component's state
  const [words, setWords] = useState<string[] | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(displayTimeout)
  const [showCopied, setShowCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [animationState, setAnimationState] = useState<
    'starting' | 'entered' | 'exiting' | null
  >('starting')

  const hasCopiedRef = useRef(false)
  const isMountedRef = useRef(true)
  const isClosingRef = useRef(false)

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) handleClose()
    },
  })

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' })
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  // Entry animation
  useEffect(() => {
    requestAnimationFrame(() => setAnimationState('entered'))
  }, [])

  const clearSensitiveData = useCallback(() => {
    setWords(null)
    // Best effort: clearing can fail without focus or permission
    if (hasCopiedRef.current) {
      hasCopiedRef.current = false
      navigator.clipboard?.writeText('').catch(() => {})
    }
  }, [])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    clearSensitiveData()
    setAnimationState('exiting')
    setTimeout(onClose, 150)
  }, [clearSensitiveData, onClose])

  // Hide the phrase (and close) when the countdown ends
  useEffect(() => {
    if (step !== 'display') return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  useEffect(() => {
    if (step === 'display' && timeRemaining === 0) handleClose()
  }, [step, timeRemaining, handleClose])

  // Clear everything on unmount, e.g. when the wallet disconnects
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (hasCopiedRef.current) {
        hasCopiedRef.current = false
        navigator.clipboard?.writeText('').catch(() => {})
      }
    }
  }, [])

  const handleReveal = () => {
    if (!adapter) {
      setErrorMessage('No passkey account is connected.')
      setStep('error')
      return
    }

    let exporting: ReturnType<typeof adapter.exportRecoveryPhrase>
    try {
      // Call exportRecoveryPhrase before any await: iOS drops the user's tap
      // across one, and the passkey prompt needs it
      exporting = adapter.exportRecoveryPhrase()
    } catch (error) {
      showError(error)
      return
    }
    setStep('loading')

    exporting.then(
      ({ phrase }) => {
        // Drop the phrase if the dialog closed while the prompt was open
        if (!isMountedRef.current || isClosingRef.current) return
        if (ctx.activeAddress) markRecoveryPhraseShown(ctx.activeAddress)
        setWords(phrase.split(' '))
        setTimeRemaining(displayTimeout)
        setStep('display')
      },
      (error: unknown) => {
        if (isMountedRef.current) showError(error)
      },
    )
  }

  const showError = (error: unknown) => {
    setErrorMessage(
      getPasskeyErrorMessage(error) ??
        (error instanceof Error ? error.message : 'Failed to export phrase'),
    )
    setStep('error')
  }

  const handleCopy = () => {
    if (!words || !navigator.clipboard) return
    navigator.clipboard
      .writeText(words.join(' '))
      .then(() => {
        hasCopiedRef.current = true
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      })
      .catch(() => {})
  }

  const handleRetry = () => {
    setErrorMessage(null)
    setStep('warning')
  }

  // Rendered inside PluginDialogRenderer's FloatingPortal,
  // so no FloatingPortal wrapper here
  return (
    <FloatingOverlay
      className="grid place-items-center px-4 z-50 transition-opacity duration-150 ease-in-out bg-[var(--wui-color-overlay)] data-[state=starting]:opacity-0 data-[state=exiting]:opacity-0 data-[state=entered]:opacity-100"
      data-state={animationState}
      lockScroll
    >
      <FloatingFocusManager context={context} modal={true}>
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          role="dialog"
          aria-label={
            step === 'display' ? 'Recovery Phrase' : 'Export Recovery Phrase'
          }
          data-passkey-recovery-dialog
          data-state={animationState}
          className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out data-[state=starting]:opacity-0 data-[state=starting]:scale-90 data-[state=exiting]:opacity-0 data-[state=exiting]:scale-90 data-[state=entered]:opacity-100 data-[state=entered]:scale-100"
          style={{ marginTop: '-0.5rem' }}
        >
          {step === 'warning' && (
            <>
              <DialogHeader
                title="Export Recovery Phrase"
                onClose={handleClose}
              />
              <div className="px-6 pb-4 space-y-3">
                <div className="bg-[var(--wui-color-danger-bg)] rounded-xl p-4">
                  <p className="text-sm font-medium text-[var(--wui-color-danger-text)] mb-2">
                    Your recovery phrase gives full access to this account and
                    its funds.
                  </p>
                  <ul className="text-sm text-[var(--wui-color-danger-text)] list-disc pl-5 space-y-1">
                    <li>Never share it with anyone</li>
                    <li>Never enter it on unverified websites</li>
                    <li>Write it down and store it securely</li>
                  </ul>
                </div>
                <FalconImportNote />
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReveal}
                  className="flex-1 py-2.5 px-4 bg-[var(--wui-color-danger-bg)] text-[var(--wui-color-danger-text)] font-medium rounded-xl hover:bg-[var(--wui-color-danger-bg-hover)] transition-colors text-sm"
                >
                  Reveal Recovery Phrase
                </button>
              </div>
            </>
          )}

          {step === 'loading' && (
            <div className="px-6 py-12 flex flex-col items-center gap-3">
              <Spinner />
              <p
                role="status"
                className="text-sm text-[var(--wui-color-text-secondary)]"
              >
                Confirm with your passkey…
              </p>
            </div>
          )}

          {step === 'display' && words && (
            <>
              <div className="relative flex items-center justify-between px-6 pt-5 pb-3">
                <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
                  Recovery Phrase
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium tabular-nums text-[var(--wui-color-text-secondary)]"
                    aria-label={`${timeRemaining} seconds remaining`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                  <CloseButton onClick={handleClose} />
                </div>
              </div>

              <div className="px-6 pb-3">
                <ol
                  className="grid grid-cols-3 gap-1 bg-[var(--wui-color-bg-secondary)] rounded-xl p-2"
                  style={{ userSelect: 'none' }}
                  data-passkey-phrase
                >
                  {words.map((word, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-1 py-1 px-1.5 rounded-md bg-[var(--wui-color-bg)] border border-[var(--wui-color-border)]"
                    >
                      <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-[var(--wui-color-text-tertiary)]">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-[var(--wui-color-text)]">
                        {word}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="px-6 pb-3">
                <FalconImportNote compact />
              </div>

              <div className="px-6 pb-2 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
                >
                  {showCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
                >
                  Done
                </button>
              </div>
              <p className="px-6 pb-5 text-xs text-[var(--wui-color-text-tertiary)] text-center">
                Clear your clipboard after you paste it
              </p>
            </>
          )}

          {step === 'error' && (
            <>
              <DialogHeader
                title="Export Recovery Phrase"
                onClose={handleClose}
              />
              <div className="px-6 pb-4">
                <p
                  role="alert"
                  className="bg-[var(--wui-color-danger-bg)] rounded-xl p-4 text-sm text-[var(--wui-color-danger-text)]"
                >
                  {errorMessage || 'An unexpected error occurred.'}
                </p>
              </div>
              <div className="px-6 pb-5 flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}

/**
 * The phrase restores the account only as a Falcon-1024 account. The same
 * words in a regular import restore a different, empty account.
 */
function FalconImportNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      data-passkey-falcon-note
      className="rounded-xl border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] p-3 text-sm text-[var(--wui-color-text)]"
    >
      <p className="font-medium">Import it as a Falcon / quantum account</p>
      {!compact && (
        <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[var(--wui-color-text-secondary)]">
          <li>
            Lute: Add account → <strong>Falcon25 account</strong> → Import
          </li>
          <li>Pera: use the quantum account import</li>
        </ul>
      )}
      <p className="mt-1.5 text-[var(--wui-color-text-secondary)]">
        A regular 25-word import restores a different, empty account.
      </p>
    </div>
  )
}

function DialogHeader({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div className="relative flex items-center px-6 pt-5 pb-4">
      <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
        {title}
      </h2>
      <CloseButton onClick={onClose} className="absolute right-4" />
    </div>
  )
}

function CloseButton({
  onClick,
  className = '',
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${className} rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all`}
      aria-label="Close dialog"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 text-[var(--wui-color-text-tertiary)] animate-spin"
      xmlns="http://www.w3.org/2000/svg"
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
