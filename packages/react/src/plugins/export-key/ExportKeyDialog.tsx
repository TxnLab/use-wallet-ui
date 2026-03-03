import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useWallet } from '@txnlab/use-wallet-react'
import { secretKeyToMnemonic } from 'algosdk'
import { useCallback, useEffect, useRef, useState } from 'react'

type DialogStep = 'warning' | 'loading' | 'display' | 'error'

const DEFAULT_DISPLAY_TIMEOUT = 120

export interface ExportKeyDialogProps {
  onClose: () => void
  displayTimeout?: number
}

export function ExportKeyDialog({
  onClose,
  displayTimeout = DEFAULT_DISPLAY_TIMEOUT,
}: ExportKeyDialogProps) {
  const { withPrivateKey } = useWallet()

  const [step, setStep] = useState<DialogStep>('warning')
  const [mnemonicWords, setMnemonicWords] = useState<string[] | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(displayTimeout)
  const [hasCopied, setHasCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [animationState, setAnimationState] = useState<
    'starting' | 'entered' | 'exiting' | null
  >('starting')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        handleClose()
      }
    },
  })

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' })
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  // Entry animation
  useEffect(() => {
    requestAnimationFrame(() => {
      setAnimationState('entered')
    })
  }, [])

  const clearSensitiveData = useCallback(() => {
    setMnemonicWords(null)
    if (hasCopied) {
      navigator.clipboard.writeText('').catch(() => {})
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [hasCopied])

  const handleClose = useCallback(() => {
    clearSensitiveData()
    setAnimationState('exiting')
    setTimeout(() => {
      onClose()
    }, 150)
  }, [clearSensitiveData, onClose])

  // Countdown timer
  useEffect(() => {
    if (step !== 'display' || !mnemonicWords) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [step, mnemonicWords, handleClose])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setMnemonicWords(null)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleReveal = async () => {
    setStep('loading')
    try {
      await withPrivateKey(async (secretKey) => {
        const mnemonic = secretKeyToMnemonic(secretKey)
        setMnemonicWords(mnemonic.split(' '))
        setStep('display')
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to export key',
      )
      setStep('error')
    }
  }

  const handleCopy = () => {
    if (!mnemonicWords) return
    navigator.clipboard.writeText(mnemonicWords.join(' '))
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleRetry = () => {
    setErrorMessage(null)
    setStep('warning')
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          data-state={animationState}
          className="w-full max-w-sm rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out data-[state=starting]:opacity-0 data-[state=starting]:scale-90 data-[state=exiting]:opacity-0 data-[state=exiting]:scale-90 data-[state=entered]:opacity-100 data-[state=entered]:scale-100"
          style={{ marginTop: '-0.5rem' }}
        >
          {step === 'warning' && (
            <WarningStep onReveal={handleReveal} onClose={handleClose} />
          )}

          {step === 'loading' && <LoadingStep />}

          {step === 'display' && mnemonicWords && (
            <DisplayStep
              words={mnemonicWords}
              timeRemaining={timeRemaining}
              formatTime={formatTime}
              hasCopied={hasCopied}
              onCopy={handleCopy}
              onClose={handleClose}
            />
          )}

          {step === 'error' && (
            <ErrorStep
              message={errorMessage}
              onRetry={handleRetry}
              onClose={handleClose}
            />
          )}
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}

function WarningStep({
  onReveal,
  onClose,
}: {
  onReveal: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Header */}
      <div className="relative flex items-center px-6 pt-5 pb-4">
        <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
          Export Recovery Phrase
        </h2>
        <button
          onClick={onClose}
          className="absolute right-4 rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Warning content */}
      <div className="px-6 pb-4">
        <div className="bg-[var(--wui-color-danger-bg)] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--wui-color-danger-text)] shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-[var(--wui-color-danger-text)] mb-2">
                Your recovery phrase gives full access to your account and
                funds.
              </p>
              <ul className="text-sm text-[var(--wui-color-danger-text)] space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <circle cx="6" cy="6" r="2" />
                    </svg>
                  </span>
                  Never share it with anyone
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <circle cx="6" cy="6" r="2" />
                    </svg>
                  </span>
                  Never enter it on unverified websites
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <circle cx="6" cy="6" r="2" />
                    </svg>
                  </span>
                  Write it down and store it securely
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="px-6 pb-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onReveal}
          className="flex-1 py-2.5 px-4 bg-[var(--wui-color-danger-bg)] text-[var(--wui-color-danger-text)] font-medium rounded-xl hover:bg-[var(--wui-color-danger-bg-hover)] transition-colors text-sm"
        >
          Reveal Recovery Phrase
        </button>
      </div>
    </>
  )
}

function LoadingStep() {
  return (
    <div className="px-6 py-12 flex flex-col items-center gap-3">
      <svg
        className="h-8 w-8 text-[var(--wui-color-text-tertiary)] animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
      <p className="text-sm text-[var(--wui-color-text-secondary)]">
        Retrieving key...
      </p>
    </div>
  )
}

function DisplayStep({
  words,
  timeRemaining,
  formatTime,
  hasCopied,
  onCopy,
  onClose,
}: {
  words: string[]
  timeRemaining: number
  formatTime: (seconds: number) => string
  hasCopied: boolean
  onCopy: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Header with timer */}
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
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mnemonic grid */}
      <div className="px-6 pb-4">
        <div
          className="bg-[var(--wui-color-bg-secondary)] rounded-xl p-3"
          style={{ userSelect: 'none' }}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {words.map((word, i) => (
              <div
                key={i}
                className="text-center py-1.5 px-1 rounded-lg bg-[var(--wui-color-bg)] border border-[var(--wui-color-border)]"
              >
                <span className="text-[10px] leading-none text-[var(--wui-color-text-tertiary)] block mb-0.5">
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-[var(--wui-color-text)]">
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-2 flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 py-2 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm flex items-center justify-center"
          title="Copy recovery phrase"
        >
          {hasCopied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-500 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
        >
          Done
        </button>
      </div>

      {/* Clipboard warning */}
      <div className="px-6 pb-5">
        <p className="text-xs text-[var(--wui-color-text-tertiary)] text-center">
          Remember to clear your clipboard after use
        </p>
      </div>
    </>
  )
}

function ErrorStep({
  message,
  onRetry,
  onClose,
}: {
  message: string | null
  onRetry: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Header */}
      <div className="relative flex items-center px-6 pt-5 pb-4">
        <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
          Export Recovery Phrase
        </h2>
        <button
          onClick={onClose}
          className="absolute right-4 rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Error content */}
      <div className="px-6 pb-4">
        <div className="bg-[var(--wui-color-danger-bg)] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--wui-color-danger-text)] shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-[var(--wui-color-danger-text)]">
              {message || 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="px-6 pb-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    </>
  )
}
