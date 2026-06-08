<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWallet } from '@txnlab/use-wallet-vue'

import { useWalletUI } from '../providers/walletUIContext'

import ConnectWalletButton from './ConnectWalletButton.vue'
import WalletList from './WalletList.vue'

const { wallets, activeAddress } = useWallet()
const { theme } = useWalletUI()

const isOpen = ref(false)
const animationState = ref<'starting' | 'entered' | 'exiting' | null>(null)

const dataTheme = computed(() =>
  theme.value === 'system' ? undefined : theme.value,
)

function openMenu(): void {
  if (activeAddress.value) return
  isOpen.value = true
  animationState.value = 'starting'
  requestAnimationFrame(() => {
    animationState.value = 'entered'
  })
}

function closeMenu(): void {
  animationState.value = 'exiting'
  setTimeout(() => {
    isOpen.value = false
    animationState.value = null
  }, 150)
}

async function handleWalletClick(
  wallet: (typeof wallets.value)[number],
): Promise<void> {
  try {
    await wallet.connect()
    closeMenu()
  } catch (error) {
    console.error(`Error connecting to ${wallet.metadata.name}:`, error)
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

            <div class="px-4 pb-3">
              <WalletList
                :wallets="wallets"
                :handle-wallet-click="handleWalletClick"
              />
            </div>

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
