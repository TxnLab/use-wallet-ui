import { useState } from 'react'

import { AssetsTab } from './AssetsTab'
import { ReceiveTab } from './ReceiveTab'
import { SendTab } from './SendTab'

import type { ManageTab } from './constants'
import type { MenuRenderContext } from '@txnlab/use-wallet-ui-react'

const TABS: { key: ManageTab; label: string }[] = [
  { key: 'send', label: 'Send' },
  { key: 'receive', label: 'Receive' },
  { key: 'assets', label: 'Assets' },
]

export function ManagePanel({ ctx }: { ctx: MenuRenderContext }) {
  const [activeTab, setActiveTab] = useState<ManageTab>('send')

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex rounded-lg bg-[var(--wui-color-bg-secondary)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--wui-color-bg)] text-[var(--wui-color-text)] shadow-sm'
                : 'text-[var(--wui-color-text-secondary)] hover:text-[var(--wui-color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'send' && <SendTab />}
        {activeTab === 'receive' && ctx.activeAddress && (
          <ReceiveTab activeAddress={ctx.activeAddress} />
        )}
        {activeTab === 'assets' && <AssetsTab />}
      </div>
    </div>
  )
}
