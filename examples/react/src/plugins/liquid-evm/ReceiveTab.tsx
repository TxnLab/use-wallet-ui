import { useState } from 'react'

export function ReceiveTab({ activeAddress }: { activeAddress: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Generate a simple QR code using a data URL (no external deps)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(activeAddress)}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-xl">
        <img
          src={qrUrl}
          alt="QR code for wallet address"
          width={160}
          height={160}
          className="block"
        />
      </div>

      <div className="w-full bg-[var(--wui-color-bg-secondary)] rounded-lg p-3">
        <p className="text-xs text-[var(--wui-color-text-secondary)] mb-1">
          Your Address
        </p>
        <p className="text-xs font-mono text-[var(--wui-color-text)] break-all leading-relaxed">
          {activeAddress}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-2 px-4 text-sm font-medium rounded-xl bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all flex items-center justify-center gap-1.5"
      >
        {isCopied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy Address
          </>
        )}
      </button>
    </div>
  )
}
