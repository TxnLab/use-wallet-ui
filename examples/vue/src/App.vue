<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
  WalletUIProvider,
  WalletButton,
  type Theme,
} from '@txnlab/use-wallet-ui-vue'
import { exportKeyPlugin } from '@txnlab/use-wallet-ui-vue/plugins/export-key'

import WalletInfo from './components/WalletInfo.vue'

const theme = ref<Theme>('system')

// Sync app theme with the theme switcher
// This adds/removes a 'dark' class on the root element for Tailwind
watchEffect((onCleanup) => {
  const root = document.documentElement

  if (theme.value === 'dark') {
    root.classList.add('dark')
  } else if (theme.value === 'light') {
    root.classList.remove('dark')
  } else {
    // System preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystem = () => {
      if (mediaQuery.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    applySystem()
    mediaQuery.addEventListener('change', applySystem)
    onCleanup(() => mediaQuery.removeEventListener('change', applySystem))
  }
})
</script>

<template>
  <WalletUIProvider :theme="theme" :plugins="[exportKeyPlugin()]">
    <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
      <!-- Header -->
      <header
        class="w-full bg-white dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50"
      >
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex-shrink-0">
              <span class="text-lg font-semibold text-gray-800 dark:text-white">
                use-wallet-ui
              </span>
            </div>
            <div class="flex items-center gap-4">
              <!-- Theme selector -->
              <select
                v-model="theme"
                class="text-sm px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <!-- Content area -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Vue Components for use-wallet
          </h1>
          <p class="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            A simple example demonstrating wallet connection, NFD profile
            integration, and balance display using the
            <code
              class="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
            >
              @txnlab/use-wallet-ui-vue
            </code>
            package.
          </p>
          <p class="text-gray-500 dark:text-slate-400 text-sm mt-4">
            Current theme:
            <code class="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {{ theme }}
            </code>
          </p>
        </div>

        <WalletInfo />

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500 dark:text-slate-400">
            View the
            <a
              href="https://github.com/TxnLab/use-wallet-ui"
              class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>
            to learn more about implementing wallet integration in your dApp.
          </p>
        </div>
      </main>
    </div>
  </WalletUIProvider>
</template>
