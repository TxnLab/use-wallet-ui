<script setup lang="ts">
import { useWallet } from '@txnlab/use-wallet-vue'

import ConnectedWalletButton from './ConnectedWalletButton.vue'
import ConnectedWalletMenu from './ConnectedWalletMenu.vue'
import ConnectWalletButton from './ConnectWalletButton.vue'
import ConnectWalletMenu from './ConnectWalletMenu.vue'

import type { PasskeyConnectLayout } from '../utils/passkey'

type ButtonSize = 'sm' | 'md' | 'lg'

const props = defineProps<{
  size?: ButtonSize
  class?: string
  style?: Record<string, string | number>
  /**
   * How the connect dialog presents a passkey wallet: 'list' or 'featured'.
   * Overrides the `WalletUIProvider` setting; the default is 'list'.
   */
  passkeyLayout?: PasskeyConnectLayout
}>()

const { activeAddress } = useWallet()
</script>

<template>
  <ConnectedWalletMenu v-if="activeAddress">
    <ConnectedWalletButton
      :size="props.size"
      :class="props.class"
      :style="props.style"
    />
  </ConnectedWalletMenu>

  <ConnectWalletMenu v-else :passkey-layout="props.passkeyLayout">
    <ConnectWalletButton
      :size="props.size"
      :class="props.class"
      :style="props.style"
    />
  </ConnectWalletMenu>
</template>
