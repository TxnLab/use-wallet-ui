<script setup lang="ts">
import type { Wallet } from '@txnlab/use-wallet-vue'

defineProps<{
  wallets: Wallet[]
  handleWalletClick: (wallet: Wallet) => Promise<void>
}>()
</script>

<template>
  <ul class="space-y-1.5">
    <li v-for="wallet in wallets" :key="wallet.id">
      <button
        @click="() => handleWalletClick(wallet)"
        class="flex w-full items-center gap-3 py-1.5 px-1.5 text-left text-[var(--wui-color-text)] transition-colors hover:bg-[var(--wui-color-bg-hover)] rounded-xl"
      >
        <div
          class="shrink-0 h-8 w-8 rounded-md overflow-hidden bg-[var(--wui-color-bg-secondary)] flex items-center justify-center"
        >
          <img
            :src="wallet.metadata.icon"
            :alt="`${wallet.metadata.name} icon`"
            class="h-8 w-8 object-contain rounded-md"
          />
        </div>
        <span class="text-lg font-bold wallet-custom-font">
          {{ wallet.metadata.name }}
        </span>
      </button>
    </li>

    <p
      v-if="wallets.length === 0"
      class="text-center text-[var(--wui-color-text-secondary)]"
    >
      No wallets found.
    </p>
  </ul>
</template>
