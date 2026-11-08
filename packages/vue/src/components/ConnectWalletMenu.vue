<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWallet } from '@txnlab/use-wallet-vue'

import { useWalletUI } from '../providers/walletUIContext'
import {
  getPasskeyErrorCode,
  getPasskeyErrorMessage,
  isPasskeyWallet,
  resolvePasskeyLayout,
  type PasskeyConnectArgs,
  type PasskeyConnectLayout,
  type PasskeyConnectStatus,
} from '../utils/passkey'

import ConnectWalletButton from './ConnectWalletButton.vue'
import PasskeyConnect from './PasskeyConnect.vue'
import WalletGroupLabel from './WalletGroupLabel.vue'
import WalletList from './WalletList.vue'

const props = defineProps<{
  /**
   * How to present a passkey wallet: 'list' or 'featured'. Overrides the
   * `WalletUIProvider` setting; the default is 'list'.
   */
  passkeyLayout?: PasskeyConnectLayout
}>()

const { wallets, availableWallets, activeAddress } = useWallet()
const { theme, passkeyLayout: providerPasskeyLayout } = useWalletUI()

const passkeyLayout = computed(() =>
  resolvePasskeyLayout(props.passkeyLayout, providerPasskeyLayout.value),
)

// v5 filters wallets by the active network's capabilities (e.g. hides
// Mnemonic on MainNet). v4 peers have no `availableWallets`, so fall back.
const walletList = computed(() => availableWallets?.value ?? wallets.value)

// A passkey wallet leads the dialog; the other wallets list below it
const passkeyWallet = computed(() => walletList.value.find(isPasskeyWallet))
const otherWallets = computed(() =>
  walletList.value.filter((wallet) => !isPasskeyWallet(wallet)),
)

const isOpen = ref(false)
const animationState = ref<'starting' | 'entered' | 'exiting' | null>(null)
const passkeyStatus = ref<PasskeyConnectStatus | null>(null)

const dataTheme = computed(() =>
  theme.value === 'system' ? undefined : theme.value,
)

function openMenu(): void {
  if (activeAddress.value) return
  isOpen.value = true
  animationState.value = 'starting'
  passkeyStatus.value = null
  requestAnimationFrame(() => {
    animationState.value = 'entered'
  })
}

function closeMenu(): void {
  animationState.value = 'exiting'
  passkeyStatus.value = null
  setTimeout(() => {
    isOpen.value = false
    animationState.value = null
  }, 150)
}

async function handleWalletClick(
  wallet: (typeof walletList.value)[number],
  args?: PasskeyConnectArgs,
): Promise<void> {
  const isPasskey = isPasskeyWallet(wallet)
  try {
    // Call connect before any await: Safari and iOS browsers drop the user's
    // tap across an await, and the passkey prompt needs it
    const connecting = wallet.connect(args)
    if (isPasskey) {
      passkeyStatus.value = { walletId: wallet.id, pending: true, error: null }
    }
    await connecting
    closeMenu()
  } catch (error) {
    console.error(`Error connecting to ${wallet.metadata.name}:`, error)

    // Keep the dialog open for passkey errors, so the user can retry or
    // switch between creating a passkey and signing in
    const message = isPasskey ? getPasskeyErrorMessage(error) : null
    if (message) {
      const hint =
        !args?.create && getPasskeyErrorCode(error) === 'cancelled'
          ? " New here? Choose 'Create a passkey'."
          : ''
      passkeyStatus.value = {
        walletId: wallet.id,
        pending: false,
        error: message + hint,
      }
      return
    }
    closeMenu()
  }
}
</script>

<template>
  <div class="inline-block">
    <div @click="openMenu">
      <slot>
        <ConnectWalletButton />
      </slot>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        data-wallet-theme
        data-wallet-ui
        :data-theme="dataTheme"
      >
        <div
          class="fixed inset-0 grid place-items-center px-4 z-50 transition-opacity duration-150 ease-in-out bg-[var(--wui-color-overlay)]"
          :class="{
            'opacity-0':
              animationState === 'starting' || animationState === 'exiting',
            'opacity-100': animationState === 'entered',
          }"
          @mousedown.self="closeMenu"
        >
          <div
            role="dialog"
            class="w-full max-w-sm rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out"
            :class="{
              'opacity-0 scale-90':
                animationState === 'starting' || animationState === 'exiting',
              'opacity-100 scale-100': animationState === 'entered',
            }"
            style="margin-top: -0.5rem"
          >
            <div class="relative flex items-center px-6 pt-5 pb-4">
              <h2
                class="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font"
              >
                Connect a Wallet
              </h2>
              <button
                @click="closeMenu"
                class="absolute right-4 rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
                aria-label="Close dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <!-- List layout: a Passkey group above a Wallets group -->
            <div
              v-if="passkeyWallet && passkeyLayout === 'list'"
              class="px-4 pb-3"
            >
              <div class="flex flex-col gap-2.5">
                <PasskeyConnect
                  layout="list"
                  :show-label="otherWallets.length > 0"
                  :wallet="passkeyWallet"
                  :handle-wallet-click="handleWalletClick"
                  :status="passkeyStatus"
                />
                <div v-if="otherWallets.length > 0" class="flex flex-col gap-1">
                  <WalletGroupLabel>Wallets</WalletGroupLabel>
                  <WalletList
                    :wallets="otherWallets"
                    :handle-wallet-click="handleWalletClick"
                  />
                </div>
              </div>
            </div>

            <template v-else>
              <PasskeyConnect
                v-if="passkeyWallet"
                layout="featured"
                :wallet="passkeyWallet"
                :handle-wallet-click="handleWalletClick"
                :status="passkeyStatus"
              />

              <div
                v-if="passkeyWallet && otherWallets.length > 0"
                class="flex items-center gap-3 px-6 pt-1 pb-2.5 text-xs text-[var(--wui-color-text-secondary)]"
              >
                <span
                  class="flex-1 h-px bg-[var(--wui-color-border)]"
                  aria-hidden="true"
                />
                or connect a wallet
                <span
                  class="flex-1 h-px bg-[var(--wui-color-border)]"
                  aria-hidden="true"
                />
              </div>

              <div
                v-if="!passkeyWallet || otherWallets.length > 0"
                class="px-4 pb-3"
              >
                <WalletList
                  :wallets="otherWallets"
                  :handle-wallet-click="handleWalletClick"
                />
              </div>
            </template>

            <div
              class="px-6 py-5 border-t border-[var(--wui-color-border)] flex items-center justify-between"
            >
              <span class="text-[var(--wui-color-text-secondary)] text-sm">
                Need an Algorand wallet?
              </span>
              <a
                href="https://algorand.co/wallets"
                class="text-[var(--wui-color-link)] font-medium text-sm hover:text-[var(--wui-color-link-hover)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start here ->
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
