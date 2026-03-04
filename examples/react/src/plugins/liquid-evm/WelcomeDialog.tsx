import {
  FloatingFocusManager,
  FloatingOverlay,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useCallback, useEffect, useState } from 'react'

import { WELCOME_SEEN_KEY } from './constants'

export interface WelcomeDialogProps {
  onClose: () => void
}

export function WelcomeDialog({ onClose }: WelcomeDialogProps) {
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
    localStorage.setItem(WELCOME_SEEN_KEY, 'true')
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
          aria-label="Welcome"
          data-state={animationState}
          className="w-full max-w-sm rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out data-[state=starting]:opacity-0 data-[state=starting]:scale-90 data-[state=exiting]:opacity-0 data-[state=exiting]:scale-90 data-[state=entered]:opacity-100 data-[state=entered]:scale-100"
          style={{ marginTop: '-0.5rem' }}
        >
          {/* Header */}
          <div className="relative flex items-center px-6 pt-5 pb-4">
            <h2 className="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font">
              Welcome!
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

          {/* Content */}
          <div className="px-6 pb-4">
            <div className="bg-[var(--wui-color-bg-secondary)] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[var(--wui-color-primary)] shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[var(--wui-color-text)] mb-2">
                    Your wallet is connected!
                  </p>
                  <ul className="text-sm text-[var(--wui-color-text-secondary)] space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-[var(--wui-color-text-tertiary)]" />
                      Use the <strong>Manage</strong> panel to send, receive, or
                      view your assets
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-[var(--wui-color-text-tertiary)]" />
                      Bridge assets across chains from the connected wallet menu
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-[var(--wui-color-text-tertiary)]" />
                      Your address and balance are always visible in the top bar
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5">
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  )
}
