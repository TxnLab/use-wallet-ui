<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { getPasskeyErrorMessage } from '../../utils/passkey'
import type { PluginRenderContext } from '../types'

import { usePasskeyAdapter } from './usePasskeyAdapter'

type DialogStep = 'warning' | 'loading' | 'display' | 'error'

const DEFAULT_PASSKEY_DISPLAY_TIMEOUT = 60

const props = withDefaults(
  defineProps<{
    ctx: PluginRenderContext
    onClose: () => void
    /** Seconds to show the phrase before the dialog closes. Default: 60 */
    displayTimeout?: number
  }>(),
  {
    displayTimeout: DEFAULT_PASSKEY_DISPLAY_TIMEOUT,
  },
)

const adapter = usePasskeyAdapter(() => props.ctx.activeWallet)

const step = ref<DialogStep>('warning')
// The phrase only ever lives in this component's state
const words = ref<string[] | null>(null)
const timeRemaining = ref(props.displayTimeout)
const showCopied = ref(false)
const errorMessage = ref<string | null>(null)
const animationState = ref<'starting' | 'entered' | 'exiting' | null>(
  'starting',
)

let hasCopied = false
let isMounted = false
let isClosing = false
let timer: ReturnType<typeof setInterval> | null = null

function clearClipboard(): void {
  // Best effort: clearing can fail without focus or permission
  if (hasCopied) {
    hasCopied = false
    navigator.clipboard?.writeText('').catch(() => {})
  }
}

function stopTimer(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleClose(): void {
  if (isClosing) return
  isClosing = true
  words.value = null
  clearClipboard()
  stopTimer()
  animationState.value = 'exiting'
  setTimeout(() => {
    props.onClose()
  }, 150)
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') handleClose()
}

onMounted(() => {
  isMounted = true
  document.addEventListener('keydown', handleKeydown)
  requestAnimationFrame(() => {
    animationState.value = 'entered'
  })
})

// Clear everything on unmount, e.g. when the wallet disconnects
onUnmounted(() => {
  isMounted = false
  document.removeEventListener('keydown', handleKeydown)
  words.value = null
  clearClipboard()
  stopTimer()
})

// Hide the phrase (and close) when the countdown ends
watch(step, (s) => {
  stopTimer()
  if (s !== 'display') return
  timer = setInterval(() => {
    timeRemaining.value = Math.max(0, timeRemaining.value - 1)
    if (timeRemaining.value === 0) handleClose()
  }, 1000)
})

function showError(error: unknown): void {
  errorMessage.value =
    getPasskeyErrorMessage(error) ??
    (error instanceof Error ? error.message : 'Failed to export phrase')
  step.value = 'error'
}

function handleReveal(): void {
  const wallet = adapter.value
  if (!wallet) {
    errorMessage.value = 'No passkey account is connected.'
    step.value = 'error'
    return
  }

  let exporting: ReturnType<typeof wallet.exportRecoveryPhrase>
  try {
    // Call exportRecoveryPhrase before any await: iOS drops the user's tap
    // across one, and the passkey prompt needs it
    exporting = wallet.exportRecoveryPhrase()
  } catch (error) {
    showError(error)
    return
  }
  step.value = 'loading'

  exporting.then(
    ({ phrase }) => {
      // Drop the phrase if the dialog closed while the prompt was open
      if (!isMounted || isClosing) return
      words.value = phrase.split(' ')
      timeRemaining.value = props.displayTimeout
      step.value = 'display'
    },
    (error: unknown) => {
      if (isMounted) showError(error)
    },
  )
}

function handleCopy(): void {
  if (!words.value || !navigator.clipboard) return
  navigator.clipboard
    .writeText(words.value.join(' '))
    .then(() => {
      hasCopied = true
      showCopied.value = true
      setTimeout(() => {
        showCopied.value = false
      }, 2000)
    })
    .catch(() => {})
}

function handleRetry(): void {
  errorMessage.value = null
  step.value = 'warning'
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 grid place-items-center px-4 z-50 transition-opacity duration-150 ease-in-out bg-[var(--wui-color-overlay)]"
    :class="{
      'opacity-0':
        animationState === 'starting' || animationState === 'exiting',
      'opacity-100': animationState === 'entered',
    }"
    @mousedown.self="handleClose"
  >
    <!-- Dialog panel -->
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="
        step === 'display' ? 'Recovery Phrase' : 'Export Recovery Phrase'
      "
      data-passkey-recovery-dialog
      class="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out"
      :class="{
        'opacity-0 scale-90':
          animationState === 'starting' || animationState === 'exiting',
        'opacity-100 scale-100': animationState === 'entered',
      }"
      style="margin-top: -0.5rem"
    >
      <!-- Header (warning and error steps) -->
      <div
        v-if="step === 'warning' || step === 'error'"
        class="relative flex items-center px-6 pt-5 pb-4"
      >
        <h2
          class="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font"
        >
          Export Recovery Phrase
        </h2>
        <button
          @click="handleClose"
          class="absolute right-4 rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Warning step -->
      <template v-if="step === 'warning'">
        <div class="px-6 pb-4 space-y-3">
          <div class="bg-[var(--wui-color-danger-bg)] rounded-xl p-4">
            <p
              class="text-sm font-medium text-[var(--wui-color-danger-text)] mb-2"
            >
              Your recovery phrase gives full access to this account and its
              funds.
            </p>
            <ul
              class="text-sm text-[var(--wui-color-danger-text)] list-disc pl-5 space-y-1"
            >
              <li>Never share it with anyone</li>
              <li>Never enter it on unverified websites</li>
              <li>Write it down and store it securely</li>
            </ul>
          </div>
          <!--
            The phrase restores the account only as a Falcon-1024 account. The
            same words in a regular import restore a different, empty account.
          -->
          <div
            data-passkey-falcon-note
            class="rounded-xl border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] p-3 text-sm text-[var(--wui-color-text)]"
          >
            <p class="font-medium">Import it as a Falcon / quantum account</p>
            <ul
              class="mt-1.5 list-disc pl-5 space-y-1 text-[var(--wui-color-text-secondary)]"
            >
              <li>
                Lute: Add account → <strong>Falcon25 account</strong> → Import
              </li>
              <li>Pera: use the quantum account import</li>
            </ul>
            <p class="mt-1.5 text-[var(--wui-color-text-secondary)]">
              A regular 25-word import restores a different, empty account.
            </p>
          </div>
        </div>
        <div class="px-6 pb-5 flex gap-2">
          <button
            @click="handleClose"
            class="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            @click="handleReveal"
            class="flex-1 py-2.5 px-4 bg-[var(--wui-color-danger-bg)] text-[var(--wui-color-danger-text)] font-medium rounded-xl hover:bg-[var(--wui-color-danger-bg-hover)] transition-colors text-sm"
          >
            Reveal Recovery Phrase
          </button>
        </div>
      </template>

      <!-- Loading step -->
      <div
        v-else-if="step === 'loading'"
        class="px-6 py-12 flex flex-col items-center gap-3"
      >
        <svg
          class="h-8 w-8 text-[var(--wui-color-text-tertiary)] animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p role="status" class="text-sm text-[var(--wui-color-text-secondary)]">
          Confirm with your passkey…
        </p>
      </div>

      <!-- Display step -->
      <template v-else-if="step === 'display' && words">
        <div class="relative flex items-center justify-between px-6 pt-5 pb-3">
          <h2
            class="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font"
          >
            Recovery Phrase
          </h2>
          <div class="flex items-center gap-2">
            <span
              class="text-sm font-medium tabular-nums text-[var(--wui-color-text-secondary)]"
              :aria-label="`${timeRemaining} seconds remaining`"
            >
              {{ formatTime(timeRemaining) }}
            </span>
            <button
              @click="handleClose"
              class="rounded-full bg-[var(--wui-color-bg-tertiary)] p-2 text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
              aria-label="Close dialog"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 pb-3">
          <ol
            class="grid grid-cols-3 gap-1 bg-[var(--wui-color-bg-secondary)] rounded-xl p-2"
            style="user-select: none"
            data-passkey-phrase
          >
            <li
              v-for="(word, i) in words"
              :key="i"
              class="flex items-baseline gap-1 py-1 px-1.5 rounded-md bg-[var(--wui-color-bg)] border border-[var(--wui-color-border)]"
            >
              <span
                class="w-4 shrink-0 text-right text-[10px] tabular-nums text-[var(--wui-color-text-tertiary)]"
              >
                {{ i + 1 }}
              </span>
              <span class="text-xs font-medium text-[var(--wui-color-text)]">
                {{ word }}
              </span>
            </li>
          </ol>
        </div>

        <div class="px-6 pb-3">
          <div
            data-passkey-falcon-note
            class="rounded-xl border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] p-3 text-sm text-[var(--wui-color-text)]"
          >
            <p class="font-medium">Import it as a Falcon / quantum account</p>
            <p class="mt-1.5 text-[var(--wui-color-text-secondary)]">
              A regular 25-word import restores a different, empty account.
            </p>
          </div>
        </div>

        <div class="px-6 pb-2 flex gap-2">
          <button
            @click="handleCopy"
            class="flex-1 py-2 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
          >
            {{ showCopied ? 'Copied' : 'Copy' }}
          </button>
          <button
            @click="handleClose"
            class="flex-1 py-2 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
          >
            Done
          </button>
        </div>
        <p
          class="px-6 pb-5 text-xs text-[var(--wui-color-text-tertiary)] text-center"
        >
          Clear your clipboard after you paste it
        </p>
      </template>

      <!-- Error step -->
      <template v-else-if="step === 'error'">
        <div class="px-6 pb-4">
          <p
            role="alert"
            class="bg-[var(--wui-color-danger-bg)] rounded-xl p-4 text-sm text-[var(--wui-color-danger-text)]"
          >
            {{ errorMessage || 'An unexpected error occurred.' }}
          </p>
        </div>
        <div class="px-6 pb-5 flex gap-2">
          <button
            @click="handleClose"
            class="flex-1 py-2.5 px-4 bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] font-medium rounded-xl hover:brightness-90 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            @click="handleRetry"
            class="flex-1 py-2.5 px-4 bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] font-medium rounded-xl hover:bg-[var(--wui-color-primary-hover)] transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
