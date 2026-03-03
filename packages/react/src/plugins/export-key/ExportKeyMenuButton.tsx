import { EXPORT_KEY_DIALOG } from './constants'

import type { MenuRenderContext } from '../types'

export function ExportKeyMenuButton({ ctx }: { ctx: MenuRenderContext }) {
  const handleClick = () => {
    ctx.closeMenu()
    ctx.openDialog(EXPORT_KEY_DIALOG)
  }

  return (
    <>
      <div className="border-t border-[var(--wui-color-border)] mt-2 mb-2" />
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[var(--wui-color-text-secondary)] hover:bg-[var(--wui-color-bg-hover)] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="flex-1 text-left">Export Recovery Phrase</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 opacity-50"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </>
  )
}
