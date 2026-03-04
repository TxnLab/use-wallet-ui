import { useAccountInfo } from '@txnlab/use-wallet-ui-react'
import { formatNumber } from '@txnlab/utils-ts'

interface AssetHolding {
  assetId: bigint
  amount: bigint
  isFrozen: boolean
}

export function AssetsTab() {
  const { data: accountInfo, isLoading } = useAccountInfo({ enabled: true })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <svg
          className="h-5 w-5 text-[var(--wui-color-text-tertiary)] animate-spin"
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
      </div>
    )
  }

  // Extract ALGO balance
  const algoBalance = accountInfo?.amount
    ? Number(accountInfo.amount) / 1_000_000
    : 0

  // Extract ASA holdings
  const assets: AssetHolding[] =
    (accountInfo?.assets as AssetHolding[] | undefined) ?? []

  return (
    <div className="flex flex-col gap-1">
      {/* Native ALGO */}
      <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[var(--wui-color-bg-secondary)] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[var(--wui-color-text-secondary)]"
              fill="currentColor"
            >
              <path d="M19.14 5.07L17.07 8.59L15.07 5.07H12.72L15.79 10.5L12 17.93H14.36L17.07 12.41L18.36 14.64L16.36 17.93H18.72L19.86 15.93L21.72 17.93H24L20.43 13.36L23.5 7.93H21.14L19.86 10.22L19.14 8.93H21.14L22.43 6.64L19.14 5.07ZM8.57 5.07L0 17.93H2.57L4.57 14.36L10.93 14.36L9.64 12.07H5.86L8.57 7.64L12 13.64L13.29 11.36L8.57 5.07Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--wui-color-text)]">
              ALGO
            </p>
            <p className="text-xs text-[var(--wui-color-text-tertiary)]">
              Algorand
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-[var(--wui-color-text)] tabular-nums">
          {formatNumber(algoBalance, { fractionDigits: 4 })}
        </p>
      </div>

      {/* ASA Holdings */}
      {assets.map((asset) => (
        <div
          key={String(asset.assetId)}
          className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[var(--wui-color-bg-secondary)] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-[var(--wui-color-bg-tertiary)] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[var(--wui-color-text-tertiary)]">
                ASA
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--wui-color-text)]">
                ASA #{String(asset.assetId)}
              </p>
              {asset.isFrozen && (
                <p className="text-xs text-[var(--wui-color-text-tertiary)]">
                  Frozen
                </p>
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--wui-color-text)] tabular-nums">
            {String(asset.amount)}
          </p>
        </div>
      ))}

      {assets.length === 0 && (
        <p className="text-xs text-[var(--wui-color-text-tertiary)] text-center py-3">
          No ASA holdings
        </p>
      )}
    </div>
  )
}
