<script setup lang="ts">
import { computed } from 'vue'
import type { Wallet } from '@txnlab/use-wallet-vue'

import type {
  PasskeyConnectArgs,
  PasskeyConnectLayout,
  PasskeyConnectStatus,
} from '../utils/passkey'

import { cn } from '../utils/cn'

import Spinner from './Spinner.vue'
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
const pendingAction = computed(() =>
  pending.value ? (current.value?.action ?? 'sign-in') : null,
)
const signingIn = computed(() => pendingAction.value === 'sign-in')
const creating = computed(() => pendingAction.value === 'create')

const WAITING = 'Waiting for your passkey…'

const ROW_CLASS =
  'flex w-full items-center gap-3 py-1.5 px-1.5 text-left text-[var(--wui-color-text)] transition-colors hover:bg-[var(--wui-color-bg-hover)] disabled:hover:bg-transparent rounded-xl'

// The control that started the request stays at full strength (and shows
// the waiting state); the other one dims while the passkey prompt is open
function pendingClass(isPressed: boolean): string {
  return isPressed
    ? 'disabled:cursor-wait'
    : 'disabled:opacity-50 disabled:cursor-not-allowed'
}
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
          :aria-busy="signingIn"
          :class="cn(ROW_CLASS, pendingClass(signingIn))"
        >
          <div
            v-if="signingIn"
            class="shrink-0 h-8 w-8 rounded-md bg-[var(--wui-color-bg-secondary)] text-[var(--wui-color-text-secondary)] flex items-center justify-center"
          >
            <Spinner class="h-[18px] w-[18px]" />
          </div>
          <WalletIcon v-else :wallet="wallet" />
          <span class="text-lg font-bold wallet-custom-font">
            {{ signingIn ? WAITING : 'Sign in with passkey' }}
          </span>
        </button>
      </li>
      <li>
        <button
          type="button"
          @click="() => handleWalletClick(wallet, { create: true })"
          :disabled="pending"
          :aria-busy="creating"
          :class="cn(ROW_CLASS, pendingClass(creating))"
        >
          <div
            v-if="creating"
            class="shrink-0 h-8 w-8 rounded-md bg-[var(--wui-color-bg-secondary)] text-[var(--wui-color-text-secondary)] flex items-center justify-center"
          >
            <Spinner class="h-[18px] w-[18px]" />
          </div>
          <div
            v-else
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
            {{ creating ? WAITING : 'Create a passkey' }}
          </span>
        </button>
      </li>
    </ul>
    <!-- Announced to screen readers; the pressed control shows it visually -->
    <p role="status" class="sr-only">{{ pending ? WAITING : '' }}</p>
    <p
      v-if="!pending && current?.error"
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
      :aria-busy="signingIn"
      :class="
        cn(
          'flex w-full items-center justify-center gap-2.5 rounded-[14px] px-4 py-3 text-base font-semibold bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)] transition-colors',
          pendingClass(signingIn),
        )
      "
    >
      <Spinner v-if="signingIn" class="h-5 w-5" />
      <!-- Key glyph: Lucide "key-round", ISC License, https://lucide.dev/license -->
      <svg
        v-else
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
      {{ signingIn ? WAITING : 'Continue with passkey' }}
    </button>
    <p class="text-center text-sm text-[var(--wui-color-text-secondary)]">
      <template v-if="!creating">New here? </template>
      <button
        type="button"
        @click="() => handleWalletClick(wallet, { create: true })"
        :disabled="pending"
        :aria-busy="creating"
        :class="
          cn(
            'inline-flex items-center gap-1.5 font-medium text-[var(--wui-color-link)] hover:text-[var(--wui-color-link-hover)]',
            pendingClass(creating),
          )
        "
      >
        <Spinner v-if="creating" class="h-3.5 w-3.5" />
        {{ creating ? WAITING : 'Create a passkey' }}
      </button>
    </p>
    <!-- Announced to screen readers; the pressed control shows it visually -->
    <p role="status" class="sr-only">{{ pending ? WAITING : '' }}</p>
    <p
      v-if="!pending && current?.error"
      role="alert"
      class="rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-sm text-[var(--wui-color-danger-text)]"
    >
      {{ current.error }}
    </p>
  </div>
</template>
