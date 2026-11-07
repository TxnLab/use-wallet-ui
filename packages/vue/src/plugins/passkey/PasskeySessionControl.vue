<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { getPasskeyErrorMessage } from '../../utils/passkey'
import type { MenuRenderContext } from '../types'

import { usePasskeyAdapter } from './usePasskeyAdapter'

// The adapter's onLock/onUnlock callbacks belong to the app, so re-read
// isUnlocked while the menu is open to catch locks from timeouts
const POLL_INTERVAL_MS = 1000

const props = defineProps<{
  ctx: MenuRenderContext
}>()

const adapter = usePasskeyAdapter(() => props.ctx.activeWallet)
const isUnlocked = ref(!!adapter.value?.isUnlocked)
const pending = ref(false)
const error = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

function refresh(): void {
  isUnlocked.value = !!adapter.value?.isUnlocked
}

watch(adapter, refresh)

onMounted(() => {
  refresh()
  timer = setInterval(refresh, POLL_INTERVAL_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function handleUnlock(): void {
  const wallet = adapter.value
  if (!wallet) return
  error.value = null
  // Call unlock before any await: iOS drops the user's tap across one
  const unlocking = wallet.unlock()
  pending.value = true
  unlocking
    .then(refresh)
    .catch((err: unknown) => {
      error.value =
        getPasskeyErrorMessage(err) ??
        (err instanceof Error ? err.message : 'Unlock failed')
    })
    .finally(() => {
      pending.value = false
    })
}

function handleLock(): void {
  adapter.value?.lock()
  refresh()
  error.value = null
}
</script>

<template>
  <div v-if="adapter" data-passkey-session class="mb-2">
    <div class="flex items-center justify-between gap-2 px-1 py-0.5">
      <span
        class="flex items-center gap-2 text-sm text-[var(--wui-color-text-secondary)]"
      >
        <svg
          v-if="isUnlocked"
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ isUnlocked ? 'Unlocked' : 'Locked' }}</span>
      </span>
      <button
        v-if="isUnlocked"
        @click="handleLock"
        class="py-1 px-2.5 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-md hover:brightness-90 transition-all text-xs"
      >
        Lock
      </button>
      <button
        v-else
        @click="handleUnlock"
        :disabled="pending"
        class="py-1 px-2.5 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-md hover:bg-[var(--wui-color-primary-hover)] transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ pending ? 'Waiting…' : 'Unlock' }}
      </button>
    </div>
    <p
      v-if="!isUnlocked && !error"
      class="px-1 text-xs text-[var(--wui-color-text-tertiary)]"
    >
      The next signature asks for your passkey.
    </p>
    <p
      v-if="error"
      role="alert"
      class="mt-1 rounded-lg bg-[var(--wui-color-danger-bg)] px-3 py-2 text-xs text-[var(--wui-color-danger-text)]"
    >
      {{ error }}
    </p>
  </div>
</template>
