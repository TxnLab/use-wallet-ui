import { lute } from '@galaxypay/use-wallet-lute'
import { pera } from '@perawallet/use-wallet-pera'
import { passkey } from '@txnlab/use-wallet-passkey'
import { WalletManagerPlugin, NetworkId } from '@txnlab/use-wallet-vue'
import { createApp } from 'vue'

import './index.css'
import App from './App.vue'

const app = createApp(App)

// Lute and Pera can import a passkey account's recovery phrase as a Falcon
// account, so users can move it to a wallet they control
app.use(WalletManagerPlugin, {
  wallets: [passkey({ session: true }), lute(), pera()],
  defaultNetwork: NetworkId.TESTNET,
})

app.mount('#app')
