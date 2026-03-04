import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useCallback, useEffect, useState } from 'react'

export interface BridgeDialogProps {
  onClose: () => void
}

export function BridgeDialog({ onClose }: BridgeDialogProps) {
  const [animationState, setAnimationState] = useState<
    'starting' | 'entered' | 'exiting' | null
  >('starting')

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) handleClose()
    },
  })

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' })
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  useEffect(() => {
    requestAnimationFrame(() => {
      setAnimationState('entered')
    })
  }, [])

  const handleClose = useCallback(() => {
    setAnimationState('exiting')
    setTimeout(() => {
      onClose()
    }, 150)
  }, [onClose])

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
          aria-label="Bridge Assets"
          data-state={animationState}
          className="w-full max-w-sm rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out data-[state=starting]:opacity-0 data-[state=starting]:scale-90 data-[state=exiting]:opacity-0 data-[state=exiting]:scale-90 data-[state=entered]:opacity-100 data-[state=entered]:scale-100"
          style={{ marginTop: '-0.5rem' }}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 pt-5 pb-4">
            <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
              Bridge Assets
            </h2>
            <button
              onClick={handleClose}
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

          {/* Content — Placeholder for bridge integration */}
          <div className="px-6 pb-4">
            <div className="bg-[var(--wui-color-bg-secondary)] rounded-xl p-4">
              <div className="flex flex-col items-center gap-3 py-4">
                {/* Bridge icon */}
                <div className="h-12 w-12 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[var(--wui-color-text-secondary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--wui-color-text)] mb-1">
                    Cross-Chain Bridge
                  </p>
                  <p className="text-xs text-[var(--wui-color-text-secondary)] leading-relaxed">
                    Bridge assets between Algorand and EVM chains. This is a
                    placeholder for the actual bridge integration.
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder form */}
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--wui-color-border)]">
                <div>
                  <p className="text-xs text-[var(--wui-color-text-secondary)]">
                    From
                  </p>
                  <p className="text-sm font-medium text-[var(--wui-color-text)]">
                    Algorand
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--wui-color-text-secondary)]">
                    A
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-6 w-6 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-[var(--wui-color-text-tertiary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--wui-color-border)]">
                <div>
                  <p className="text-xs text-[var(--wui-color-text-secondary)]">
                    To
                  </p>
                  <p className="text-sm font-medium text-[var(--wui-color-text)]">
                    Ethereum
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center">
                  <span className="text-xs font-bold text-[var(--wui-color-text-secondary)]">
                    E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              disabled
              className="flex-1 py-2.5 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl transition-colors text-sm opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}
