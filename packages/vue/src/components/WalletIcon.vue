<script setup lang="ts">
import type { Wallet } from '@txnlab/use-wallet-vue'

/** A wallet's 32 px icon tile, as shown in the connect dialog */
defineProps<{
  wallet: Wallet
}>()
</script>

<template>
  <div
    class="shrink-0 h-8 w-8 rounded-md overflow-hidden bg-[var(--wui-color-bg-secondary)] flex items-center justify-center"
  >
    <img
      :src="wallet.metadata.icon"
      :alt="`${wallet.metadata.name} icon`"
      class="h-8 w-8 object-contain rounded-md"
    />
  </div>
</template>
