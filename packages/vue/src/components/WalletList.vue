<script setup lang="ts">
import type { Wallet } from '@txnlab/use-wallet-vue'

import {
  isPasskeyWallet,
  type PasskeyConnectArgs,
  type PasskeyConnectStatus,
} from '../utils/passkey'

defineProps<{
  wallets: Wallet[]
  /**
   * Connects a wallet. The passkey wallet passes `{ create: true }` from its
   * "Create passkey" button; forward `args` to `wallet.connect(args)`.
   */
  handleWalletClick: (
    wallet: Wallet,
    args?: PasskeyConnectArgs,
  ) => Promise<void>
  /** Pending state or error for the passkey wallet's connect request */
  passkeyStatus?: PasskeyConnectStatus | null
}>()
</script>

<template>
  <ul class="space-y-1.5">
    <template v-for="wallet in wallets" :key="wallet.id">
      <!--
        Passkeys need two actions: a missing passkey and a cancelled prompt
        raise the same browser error, so the user chooses between creating
        and signing in.
      -->
      <li v-if="isPasskeyWallet(wallet)" :data-wallet-id="wallet.id">
        <div
          class="flex w-full flex-wrap items-center gap-x-3 gap-y-2 py-1.5 px-1.5 text-[var(--wui-color-text)]"
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
          <div class="ml-auto flex shrink-0 items-center gap-1.5">
            <button
              @click="() => handleWalletClick(wallet, { create: true })"
              :disabled="
                passkeyStatus?.walletId === wallet.id && passkeyStatus.pending
              "
              class="py-1.5 px-3 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-lg hover:brightness-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create passkey
            </button>
            <button
              @click="() => handleWalletClick(wallet)"
              :disabled="
                passkeyStatus?.walletId === wallet.id && passkeyStatus.pending
              "
              aria-label="Sign in with passkey"
              class="py-1.5 px-3 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-lg hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign in
            </button>
          </div>
        </div>
        <template v-if="passkeyStatus?.walletId === wallet.id">
          <p
            v-if="passkeyStatus.pending"
            role="status"
            class="px-1.5 pb-1 text-sm text-[var(--wui-color-text-secondary)]"
          >
            Waiting for your passkey…
          </p>
          <p
            v-else-if="passkeyStatus.error"
            role="alert"
            class="mx-1.5 mb-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
          >
            {{ passkeyStatus.error }}
          </p>
        </template>
      </li>

      <li v-else>
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
    </template>

    <p
      v-if="wallets.length === 0"
      class="text-center text-[var(--wui-color-text-secondary)]"
    >
      No wallets found.
    </p>
  </ul>
</template>
