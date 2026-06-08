import {
  WalletManagerPlugin,
  NetworkId,
  WalletId,
} from '@txnlab/use-wallet-vue'
import { createApp } from 'vue'

import './index.css'
import App from './App.vue'

const app = createApp(App)

app.use(WalletManagerPlugin, {
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
    WalletId.EXODUS,
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId: 'fcfde0713d43baa0d23be0773c80a72b' },
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
})

app.mount('#app')
