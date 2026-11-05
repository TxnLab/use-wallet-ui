import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { defly } from '@txnlab/use-wallet-defly'
import { exodus } from '@txnlab/use-wallet-exodus'
import { WalletManagerPlugin, NetworkId } from '@txnlab/use-wallet-vue'
import { walletConnect } from '@txnlab/use-wallet-walletconnect'
import { createApp } from 'vue'

import './index.css'
import App from './App.vue'

const app = createApp(App)

app.use(WalletManagerPlugin, {
  wallets: [
    pera(),
    defly(),
    lute(),
    exodus(), // MainNet only, so hidden on TestNet (see availableWallets)
    walletConnect({ projectId: 'fcfde0713d43baa0d23be0773c80a72b' }),
  ],
  defaultNetwork: NetworkId.TESTNET,
})

app.mount('#app')
