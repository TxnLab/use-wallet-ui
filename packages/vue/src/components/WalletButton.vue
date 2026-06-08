<script setup lang="ts">
import { useWallet } from '@txnlab/use-wallet-vue'

import ConnectedWalletButton from './ConnectedWalletButton.vue'
import ConnectedWalletMenu from './ConnectedWalletMenu.vue'
import ConnectWalletButton from './ConnectWalletButton.vue'
import ConnectWalletMenu from './ConnectWalletMenu.vue'

type ButtonSize = 'sm' | 'md' | 'lg'

const props = defineProps<{
  size?: ButtonSize
  class?: string
  style?: Record<string, string | number>
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

  <ConnectWalletMenu v-else>
    <ConnectWalletButton
      :size="props.size"
      :class="props.class"
      :style="props.style"
    />
  </ConnectWalletMenu>
</template>
