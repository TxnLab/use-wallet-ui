import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { passkey } from '@txnlab/use-wallet-passkey'
import {
  NetworkId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import {
  WalletUIProvider,
  WalletButton,
  type PasskeyConnectLayout,
  type Theme,
} from '@txnlab/use-wallet-ui-react'
import { passkeyPlugin } from '@txnlab/use-wallet-ui-react/plugins/passkey'
import { useState, useEffect } from 'react'

import { WalletInfo } from './components/WalletInfo'

// Lute and Pera can import a passkey account's recovery phrase as a Falcon
// account, so users can move it to a wallet they control
const walletManager = new WalletManager({
  wallets: [passkey({ session: true }), lute(), pera()],
  defaultNetwork: NetworkId.TESTNET,
})

// Create the plugin once: `session` matches `passkey({ session: true })`, and
// `disclosure` shows the "whose account is this" note until "Got it"
const plugins = [passkeyPlugin({ session: true, disclosure: true })]

// Start from ?layout=featured to link to the featured layout
function initialPasskeyLayout(): PasskeyConnectLayout {
  return new URLSearchParams(window.location.search).get('layout') ===
    'featured'
    ? 'featured'
    : 'list'
}

function App() {
  const [theme, setTheme] = useState<Theme>('system')
  const [passkeyLayout, setPasskeyLayout] =
    useState<PasskeyConnectLayout>(initialPasskeyLayout)

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
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const applySystem = () => {
        root.classList.toggle('dark', mediaQuery.matches)
      }
      applySystem()
      mediaQuery.addEventListener('change', applySystem)
      return () => mediaQuery.removeEventListener('change', applySystem)
    }
  }, [theme])

  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider
        theme={theme}
        plugins={plugins}
        passkeyLayout={passkeyLayout}
      >
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
                  {/* Passkey layout selector */}
                  <select
                    aria-label="Passkey layout"
                    value={passkeyLayout}
                    onChange={(e) =>
                      setPasskeyLayout(e.target.value as PasskeyConnectLayout)
                    }
                    className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
                  >
                    <option value="list">List</option>
                    <option value="featured">Featured</option>
                  </select>
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
                Passkey Accounts
              </h1>
              <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                This example demonstrates the passkey wallet from{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  @txnlab/use-wallet-passkey
                </code>{' '}
                with the{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  passkeyPlugin
                </code>{' '}
                from{' '}
                <code className="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  @txnlab/use-wallet-ui-react
                </code>
                .
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-4 max-w-2xl mx-auto">
                Choose <strong>Continue with passkey</strong> (or{' '}
                <strong>Sign in with passkey</strong> in the List layout) to
                sign in, or <strong>Create a passkey</strong> for a new
                Falcon-1024 account. The connected menu shows the session&apos;s
                lock status and lets you export the account&apos;s recovery
                phrase.
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
                The note on whose account it is shows until you choose{' '}
                <strong>Got it</strong>. To see it again, remove the{' '}
                <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  wui:passkey-disclosure-dismissed:&lt;address&gt;
                </code>{' '}
                key from this site&apos;s local storage.
              </p>
            </div>

            <WalletInfo />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
                Lute and Pera are included because they can import a passkey
                account&apos;s recovery phrase as a Falcon / quantum account.
              </p>
            </div>
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  )
}

export default App
