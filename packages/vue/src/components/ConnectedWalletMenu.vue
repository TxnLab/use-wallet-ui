<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFloating, offset, flip, shift } from '@floating-ui/vue'
import { useWallet } from '@txnlab/use-wallet-vue'
import { formatNumber, formatShortAddress } from '@txnlab/utils-ts'

import { useAccountInfo } from '../composables/useAccountInfo'
import { useNfd } from '../composables/useNfd'
import { usePlugins } from '../plugins/pluginContext'
import PluginSlot from '../plugins/PluginSlot.vue'
import { useWalletUI } from '../providers/walletUIContext'

import AlgoSymbol from './AlgoSymbol.vue'
import ConnectedWalletButton from './ConnectedWalletButton.vue'
import NfdAvatar from './NfdAvatar.vue'

import type { MenuRenderContext } from '../plugins/types'

const { activeAddress, activeWallet } = useWallet()
const { theme, resolvedTheme } = useWalletUI()
const { openDialog, closeDialog, panels } = usePlugins()

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl = ref<HTMLElement | null>(null)
const { floatingStyles } = useFloating(referenceEl, floatingEl, {
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  placement: 'bottom-end',
})

const isOpen = ref(false)
const activePanel = ref<string | null>(null)
const isCopied = ref(false)
const showAvailableBalance = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('uwui:balance-preference') === 'available'
    : false,
)

const dataTheme = computed(() =>
  theme.value === 'system' ? undefined : theme.value,
)

const nfdQuery = useNfd()
const nfdName = computed(() => nfdQuery.data.value?.name ?? null)

const accountInfoQuery = useAccountInfo()

const totalBalance = computed(() => {
  const info = accountInfoQuery.data.value
  if (!info || info.amount === undefined) return null
  return Number(info.amount) / 1_000_000
})

const availableBalance = computed(() => {
  const info = accountInfoQuery.data.value
  if (!info || info.amount === undefined || info.minBalance === undefined)
    return null
  const available = Number(info.amount) - Number(info.minBalance)
  return Math.max(0, available / 1_000_000)
})

const displayBalance = computed(() =>
  showAvailableBalance.value ? availableBalance.value : totalBalance.value,
)

const pluginCtx = computed<MenuRenderContext>(() => ({
  activeAddress: activeAddress.value,
  activeWallet: activeWallet.value,
  theme: theme.value,
  resolvedTheme: resolvedTheme.value,
  closeMenu: () => {
    isOpen.value = false
  },
  openDialog,
  closeDialog,
  setActivePanel: (key) => {
    activePanel.value = key
  },
  activePanel: activePanel.value,
}))

const enabledPanels = computed(() =>
  panels.filter((p) => !p.enabled || p.enabled(pluginCtx.value)),
)

const currentPanel = computed(() =>
  activePanel.value ? panels.find((p) => p.key === activePanel.value) : null,
)

function renderCurrentPanel() {
  if (!currentPanel.value) return null
  return currentPanel.value.render({
    ctx: pluginCtx.value,
    goBack: () => {
      activePanel.value = null
    },
  })
}

function toggleMenu(): void {
  isOpen.value = !isOpen.value
  if (!isOpen.value) activePanel.value = null
}

function closeMenu(): void {
  isOpen.value = false
  activePanel.value = null
}

function handleCopyAddress(): void {
  if (!activeAddress.value) return
  navigator.clipboard.writeText(activeAddress.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

async function handleDisconnect(): Promise<void> {
  if (!activeWallet.value) return
  try {
    await activeWallet.value.disconnect()
    closeMenu()
  } catch (error) {
    console.error('Error disconnecting wallet:', error)
  }
}

function handleAccountChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const accountAddress = target.value
  if (activeWallet.value?.setActiveAccount) {
    activeWallet.value.setActiveAccount(accountAddress)
  }
}

function toggleBalanceView(): void {
  showAvailableBalance.value = !showAvailableBalance.value
  localStorage.setItem(
    'uwui:balance-preference',
    showAvailableBalance.value ? 'available' : 'total',
  )
}
</script>

<template>
  <div class="relative inline-block">
    <div ref="referenceEl" @click="toggleMenu">
      <slot>
        <ConnectedWalletButton />
      </slot>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        data-wallet-theme
        data-wallet-ui
        :data-theme="dataTheme"
      >
        <div class="fixed inset-0 z-40" @mousedown.self="closeMenu" />

        <div
          ref="floatingEl"
          :style="floatingStyles"
          class="z-50 w-80 rounded-xl bg-[var(--wui-color-bg)] shadow-xl border border-[var(--wui-color-border)]"
        >
          <div class="p-4">
            <template v-if="currentPanel">
              <div class="flex items-center gap-2 mb-3">
                <button
                  @click="activePanel = null"
                  class="p-1 rounded-md hover:bg-[var(--wui-color-bg-secondary)] transition-colors text-[var(--wui-color-text-secondary)]"
                  aria-label="Back to menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <h3 class="text-sm font-medium text-[var(--wui-color-text)]">
                  {{ currentPanel.label }}
                </h3>
              </div>
              <component v-if="currentPanel" :is="renderCurrentPanel" />
            </template>

            <template v-else>
              <div class="flex items-center gap-3 mb-4">
                <div class="h-12 w-12 overflow-hidden">
                  <NfdAvatar
                    :nfd="nfdQuery.data?.value"
                    :alt="`${nfdName || activeAddress} avatar`"
                    :size="48"
                  />
                </div>
                <div>
                  <h3
                    class="text-lg font-bold text-[var(--wui-color-text)] max-w-[220px] truncate wallet-custom-font"
                  >
                    {{
                      nfdName ||
                      (activeAddress
                        ? formatShortAddress(activeAddress, 6, 4)
                        : 'My Wallet')
                    }}
                  </h3>
                  <p
                    v-if="nfdName && activeAddress"
                    class="text-sm text-[var(--wui-color-text-secondary)]"
                  >
                    {{ formatShortAddress(activeAddress, 6, 4) }}
                  </p>
                </div>
              </div>

              <div
                class="mb-4 bg-[var(--wui-color-bg-secondary)] rounded-lg p-3"
              >
                <div class="flex justify-between items-center">
                  <span
                    v-if="displayBalance !== null"
                    class="text-base font-medium text-[var(--wui-color-text)] flex items-center gap-1"
                  >
                    {{ formatNumber(displayBalance, { fractionDigits: 4 }) }}
                    <AlgoSymbol />
                  </span>
                  <button
                    @click="toggleBalanceView"
                    class="flex items-center gap-1 text-sm text-[var(--wui-color-text-secondary)] bg-[var(--wui-color-bg-tertiary)] py-1 pl-2.5 pr-2 rounded-md hover:brightness-90 transition-all focus:outline-none"
                    :title="
                      showAvailableBalance
                        ? 'Show total balance'
                        : 'Show available balance'
                    "
                  >
                    {{ showAvailableBalance ? 'Available' : 'Total' }}
                  </button>
                </div>
              </div>

              <PluginSlot slot="after-balance" :ctx="pluginCtx" />

              <div
                v-if="
                  activeWallet?.accounts && activeWallet.accounts.length > 1
                "
                class="mb-4"
              >
                <label
                  class="block text-sm font-medium text-[var(--wui-color-text-secondary)] mb-1"
                >
                  Select Account
                </label>
                <select
                  :value="activeAddress || ''"
                  @change="handleAccountChange"
                  class="w-full rounded-lg border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] py-2 px-3 text-[var(--wui-color-text)] text-sm focus:outline-none"
                >
                  <option
                    v-for="account in activeWallet.accounts"
                    :key="account.address"
                    :value="account.address"
                  >
                    {{ formatShortAddress(account.address, 6, 4) }}
                  </option>
                </select>
              </div>

              <PluginSlot slot="after-accounts" :ctx="pluginCtx" />

              <div
                class="border-t border-[var(--wui-color-border)] mt-2 mb-2"
              />

              <div
                v-if="activeWallet"
                class="mb-2 flex items-center gap-2 px-1 py-0.5"
              >
                <div
                  class="h-5 w-5 overflow-hidden rounded flex items-center justify-center"
                >
                  <img
                    v-if="activeWallet.metadata.icon"
                    :src="activeWallet.metadata.icon"
                    :alt="`${activeWallet.metadata.name} icon`"
                    class="max-w-full max-h-full"
                  />
                </div>
                <p class="text-sm text-[var(--wui-color-text-secondary)]">
                  {{ activeWallet.metadata.name }}
                </p>
              </div>

              <PluginSlot slot="after-wallet-info" :ctx="pluginCtx" />
              <PluginSlot slot="before-actions" :ctx="pluginCtx" />

              <div
                v-if="enabledPanels.length > 0"
                class="flex flex-col gap-1 mb-2"
              >
                <button
                  v-for="panel in enabledPanels"
                  :key="panel.key"
                  @click="activePanel = panel.key"
                  class="w-full flex items-center justify-between py-2 px-2 rounded-lg text-sm text-[var(--wui-color-text)] hover:bg-[var(--wui-color-bg-secondary)] transition-colors"
                >
                  <span>{{ panel.label }}</span>
                  <span class="text-[var(--wui-color-text-tertiary)]">></span>
                </button>
              </div>

              <div
                class="border-t border-[var(--wui-color-border)] mb-3 mt-2"
              />

              <div class="flex gap-2">
                <button
                  @click="handleCopyAddress"
                  class="flex-1 py-2 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
                >
                  {{ isCopied ? 'Copied' : 'Copy Address' }}
                </button>
                <button
                  @click="handleDisconnect"
                  class="flex-1 py-2 px-4 bg-[var(--wui-color-danger-bg)] text-[var(--wui-color-danger-text)] font-medium rounded-xl hover:bg-[var(--wui-color-danger-bg-hover)] transition-all text-sm"
                >
                  Disconnect
                </button>
              </div>

              <PluginSlot slot="actions" :ctx="pluginCtx" />
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
