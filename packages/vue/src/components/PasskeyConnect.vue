<script setup lang="ts">
import { computed } from 'vue'
import type { Wallet } from '@txnlab/use-wallet-vue'

import type {
  PasskeyConnectArgs,
  PasskeyConnectLayout,
  PasskeyConnectStatus,
} from '../utils/passkey'

import WalletGroupLabel from './WalletGroupLabel.vue'
import WalletIcon from './WalletIcon.vue'

/**
 * The passkey section of the connect dialog: one action signs in, and
 * "Create a passkey" makes a new one. A missing passkey and a cancelled
 * prompt raise the same browser error, so creating stays a separate,
 * explicit choice.
 */
const props = withDefaults(
  defineProps<{
    /** The passkey wallet (`id: 'passkey'`) */
    wallet: Wallet
    /**
     * Connects the wallet. "Create a passkey" passes `{ create: true }`; forward
     * `args` to `wallet.connect(args)` before any `await`.
     */
    handleWalletClick: (
      wallet: Wallet,
      args?: PasskeyConnectArgs,
    ) => Promise<void>
    /** Pending state or error for the passkey wallet's connect request */
    status?: PasskeyConnectStatus | null
    /**
     * `'list'` (default): "Sign in with passkey" and "Create a passkey"
     * rows under a "Passkey" group label. `'featured'`: a "Continue with
     * passkey" button and a "Create a passkey" link.
     */
    layout?: PasskeyConnectLayout
    /** Show the "Passkey" group label in the `'list'` layout. Default: true */
    showLabel?: boolean
  }>(),
  { layout: 'list', showLabel: true },
)

const current = computed(() =>
  props.status?.walletId === props.wallet.id ? props.status : null,
)
const pending = computed(() => !!current.value?.pending)

const ROW_CLASS =
  'flex w-full items-center gap-3 py-1.5 px-1.5 text-left text-[var(--wui-color-text)] transition-colors hover:bg-[var(--wui-color-bg-hover)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <div
    v-if="layout === 'list'"
    data-passkey-connect="list"
    class="flex flex-col gap-1"
  >
    <WalletGroupLabel v-if="showLabel">Passkey</WalletGroupLabel>
    <ul class="space-y-1.5">
      <li>
        <button
          type="button"
          @click="() => handleWalletClick(wallet)"
          :disabled="pending"
          :class="ROW_CLASS"
        >
          <WalletIcon :wallet="wallet" />
          <span class="text-lg font-bold wallet-custom-font">
            Sign in with passkey
          </span>
        </button>
      </li>
      <li>
        <button
          type="button"
          @click="() => handleWalletClick(wallet, { create: true })"
          :disabled="pending"
          :class="ROW_CLASS"
        >
          <div
            class="shrink-0 h-8 w-8 rounded-md border-[1.5px] border-dashed border-[var(--wui-color-text-tertiary)] text-[var(--wui-color-text-secondary)] flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span class="text-lg font-bold wallet-custom-font">
            Create a passkey
          </span>
        </button>
      </li>
    </ul>
    <p
      v-if="pending"
      role="status"
      class="px-1.5 pb-1 text-sm text-[var(--wui-color-text-secondary)]"
    >
      Waiting for your passkey…
    </p>
    <p
      v-else-if="current?.error"
      role="alert"
      class="mx-1.5 mb-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
    >
      {{ current.error }}
    </p>
  </div>

  <div
    v-else
    data-passkey-connect="featured"
    class="flex flex-col gap-2.5 px-[22px] pt-1 pb-4"
  >
    <button
      type="button"
      @click="() => handleWalletClick(wallet)"
      :disabled="pending"
      class="flex w-full items-center justify-center gap-2.5 rounded-[14px] px-4 py-3 text-base font-semibold bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <!-- Key glyph: Lucide "key-round", ISC License, https://lucide.dev/license -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
        />
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
      </svg>
      {{ pending ? 'Waiting for your passkey…' : 'Continue with passkey' }}
    </button>
    <p class="text-center text-sm text-[var(--wui-color-text-secondary)]">
      New here?
      <button
        type="button"
        @click="() => handleWalletClick(wallet, { create: true })"
        :disabled="pending"
        class="font-medium text-[var(--wui-color-link)] hover:text-[var(--wui-color-link-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create a passkey
      </button>
    </p>
    <p role="status" class="sr-only">
      {{ pending ? 'Waiting for your passkey…' : '' }}
    </p>
    <p
      v-if="!pending && current?.error"
      role="alert"
      class="rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
    >
      {{ current.error }}
    </p>
  </div>
</template>
