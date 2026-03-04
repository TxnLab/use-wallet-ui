import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import {
  WalletUIProvider,
  WalletButton,
  type Theme,
} from '@txnlab/use-wallet-ui-react'
import { exportKeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/export-key'
import { useState, useEffect } from 'react'

import { WalletInfo } from './components/WalletInfo'

const walletManager = new WalletManager({
  wallets: [
    {
      id: WalletId.WEB3AUTH,
      options: {
        clientId:
          import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_CLIENT_ID',
      },
    },
    WalletId.PERA,
    WalletId.DEFLY,
  ],
  defaultNetwork: NetworkId.MAINNET,
})

function App() {
  const [theme, setTheme] = useState<Theme>('system')

  // Sync app theme with the theme switcher
  // This adds/removes a 'dark' class on the root element for Tailwind
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider theme={theme} plugins={[exportKeyPlugin()]}>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          {/* Header */}
          <header className="w-full bg-white dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    use-wallet-ui
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Theme selector */}
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <WalletButton />
                </div>
              </div>
            </div>
          </header>

          {/* Content area */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Web3Auth + Export Key Plugin
              </h1>
              <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                This example demonstrates using{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  Web3Auth
                </code>{' '}
                with the{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  exportKeyPlugin
                </code>{' '}
                from{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  @txnlab/use-wallet-ui-react
                </code>
                .
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-4">
                Connect via Web3Auth to see the{' '}
                <strong>&quot;Export Recovery Phrase&quot;</strong> option in the
                connected wallet menu. This option only appears for wallets that
                support private key access.
              </p>
            </div>

            <WalletInfo />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Pera and Defly are included for comparison — they do not support{' '}
                <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  canUsePrivateKey
                </code>
                , so the export key button will not appear for those wallets.
              </p>
            </div>
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  )
}

export default App
