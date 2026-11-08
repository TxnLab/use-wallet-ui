<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
  WalletUIProvider,
  WalletButton,
  type PasskeyConnectLayout,
  type Theme,
} from '@txnlab/use-wallet-ui-vue'
import { passkeyPlugin } from '@txnlab/use-wallet-ui-vue/plugins/passkey'

import WalletInfo from './components/WalletInfo.vue'

const theme = ref<Theme>('system')

// Start from ?layout=featured to link to the featured layout
const passkeyLayout = ref<PasskeyConnectLayout>(
  new URLSearchParams(window.location.search).get('layout') === 'featured'
    ? 'featured'
    : 'list',
)

// Create the plugin once: `session` matches `passkey({ session: true })`, and
// `disclosure` shows the "whose account is this" note until "Got it"
const plugins = [passkeyPlugin({ session: true, disclosure: true })]

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
  <WalletUIProvider
    :theme="theme"
    :plugins="plugins"
    :passkey-layout="passkeyLayout"
  >
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
              <!-- Passkey layout selector -->
              <select
                v-model="passkeyLayout"
                aria-label="Passkey layout"
                class="text-sm px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white"
              >
                <option value="list">List</option>
                <option value="featured">Featured</option>
              </select>
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
            Passkey Accounts
          </h1>
          <p class="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            This example demonstrates the passkey wallet from
            <code
              class="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
            >
              @txnlab/use-wallet-passkey
            </code>
            with the
            <code
              class="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
            >
              passkeyPlugin
            </code>
            from
            <code
              class="text-sm bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
            >
              @txnlab/use-wallet-ui-vue
            </code>
            .
          </p>
          <p
            class="text-gray-500 dark:text-slate-400 text-sm mt-4 max-w-2xl mx-auto"
          >
            Choose <strong>Continue with passkey</strong> (or
            <strong>Sign in with passkey</strong> in the List layout) to sign
            in, or <strong>Create a passkey</strong> for a new Falcon-1024
            account. The connected menu shows the session's lock status and lets
            you export the account's recovery phrase.
          </p>
          <p
            class="text-gray-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto"
          >
            The note on whose account it is shows until you choose
            <strong>Got it</strong>. To see it again, remove the
            <code
              class="text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
            >
              wui:passkey-disclosure-dismissed:&lt;address&gt;
            </code>
            key from this site's local storage.
          </p>
        </div>

        <WalletInfo />

        <div class="mt-8 text-center">
          <p
            class="text-sm text-gray-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Lute and Pera are included because they can import a passkey
            account's recovery phrase as a Falcon / quantum account.
          </p>
        </div>
      </main>
    </div>
  </WalletUIProvider>
</template>
