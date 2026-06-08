<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useWallet } from '@txnlab/use-wallet-vue'
import { secretKeyToMnemonic } from 'algosdk'

type DialogStep = 'warning' | 'loading' | 'display' | 'error'

const DEFAULT_DISPLAY_TIMEOUT = 120

const props = withDefaults(
  defineProps<{
    onClose: () => void
    displayTimeout?: number
  }>(),
  {
    displayTimeout: DEFAULT_DISPLAY_TIMEOUT,
  },
)

const { withPrivateKey } = useWallet()

const step = ref<DialogStep>('warning')
const mnemonicWords = ref<string[] | null>(null)
const timeRemaining = ref(props.displayTimeout)
const hasCopied = ref(false)
const errorMessage = ref<string | null>(null)
const animationState = ref<'starting' | 'entered' | 'exiting' | null>(
  'starting',
)

let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  requestAnimationFrame(() => {
    animationState.value = 'entered'
  })
})

function clearSensitiveData(): void {
  mnemonicWords.value = null
  if (hasCopied.value) {
    navigator.clipboard.writeText('').catch(() => {})
  }
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function handleClose(): void {
  clearSensitiveData()
  animationState.value = 'exiting'
  setTimeout(() => {
    props.onClose()
  }, 150)
}

watch(
  () => ({ step: step.value, words: mnemonicWords.value }),
  ({ step: s, words }) => {
    if (s === 'display' && words) {
      timerInterval = setInterval(() => {
        timeRemaining.value -= 1
        if (timeRemaining.value <= 0) {
          handleClose()
        }
      }, 1000)
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  },
)

onUnmounted(() => {
  clearSensitiveData()
})

async function handleReveal(): Promise<void> {
  step.value = 'loading'
  try {
    await withPrivateKey(async (secretKey: Uint8Array) => {
      const mnemonic = secretKeyToMnemonic(secretKey)
      mnemonicWords.value = mnemonic.split(' ')
      step.value = 'display'
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to export key'
    step.value = 'error'
  }
}

function handleCopy(): void {
  if (!mnemonicWords.value) return
  navigator.clipboard.writeText(mnemonicWords.value.join(' '))
  hasCopied.value = true
  setTimeout(() => {
    hasCopied.value = false
  }, 2000)
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
      :aria-label="
        step === 'display' ? 'Recovery Phrase' : 'Export Recovery Phrase'
      "
      class="w-full max-w-sm rounded-3xl bg-[var(--wui-color-bg)] shadow-xl transform transition-all duration-150 ease-in-out"
      :class="{
        'opacity-0 scale-90':
          animationState === 'starting' || animationState === 'exiting',
        'opacity-100 scale-100': animationState === 'entered',
      }"
      style="margin-top: -0.5rem"
    >
      <!-- Warning step -->
      <template v-if="step === 'warning'">
        <div class="relative flex items-center px-6 pt-5 pb-4">
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
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div class="px-6 pb-4">
          <div class="bg-[var(--wui-color-danger-bg)] rounded-xl p-4">
            <div class="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-[var(--wui-color-danger-text)] shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <p
                  class="text-sm font-medium text-[var(--wui-color-danger-text)] mb-2"
                >
                  Your recovery phrase gives full access to your account and
                  funds.
                </p>
                <ul
                  class="text-sm text-[var(--wui-color-danger-text)] space-y-1.5"
                >
                  <li class="flex items-start gap-2">
                    <span class="shrink-0 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                      >
                        <circle cx="6" cy="6" r="2" />
                      </svg>
                    </span>
                    Never share it with anyone
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="shrink-0 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                      >
                        <circle cx="6" cy="6" r="2" />
                      </svg>
                    </span>
                    Store it somewhere safe and offline
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 pb-6 flex gap-3">
          <button
            @click="handleClose"
            class="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
          >
            Cancel
          </button>
          <button
            @click="handleReveal"
            class="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-[var(--wui-color-danger-bg)] text-[var(--wui-color-danger-text)] hover:bg-[var(--wui-color-danger-bg-hover)] transition-all"
          >
            I understand, reveal
          </button>
        </div>
      </template>

      <!-- Loading step -->
      <template v-else-if="step === 'loading'">
        <div class="px-6 py-12 flex flex-col items-center gap-4">
          <div
            class="h-10 w-10 rounded-full border-4 border-[var(--wui-color-border)] border-t-[var(--wui-color-primary)] animate-spin"
          />
          <p class="text-sm text-[var(--wui-color-text-secondary)]">
            Loading recovery phrase...
          </p>
        </div>
      </template>

      <!-- Display step -->
      <template v-else-if="step === 'display' && mnemonicWords">
        <div class="relative flex items-center px-6 pt-5 pb-4">
          <h2
            class="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font"
          >
            Recovery Phrase
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
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div class="px-6 pb-4">
          <div
            class="mb-3 flex items-center justify-between text-xs text-[var(--wui-color-text-secondary)]"
          >
            <span>Write these words in order</span>
            <span class="font-mono">{{ formatTime(timeRemaining) }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div
              v-for="(word, index) in mnemonicWords"
              :key="index"
              class="flex items-center gap-1.5 bg-[var(--wui-color-bg-secondary)] rounded-lg px-2 py-1.5"
            >
              <span
                class="text-xs text-[var(--wui-color-text-tertiary)] w-4 text-right shrink-0"
                >{{ index + 1 }}</span
              >
              <span
                class="text-sm font-medium text-[var(--wui-color-text)] truncate"
                >{{ word }}</span
              >
            </div>
          </div>
          <button
            @click="handleCopy"
            class="w-full py-2 px-4 rounded-xl text-sm font-medium bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all flex items-center justify-center gap-2"
          >
            <template v-if="hasCopied">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Copied
            </template>
            <template v-else> Copy to clipboard </template>
          </button>
        </div>
      </template>

      <!-- Error step -->
      <template v-else-if="step === 'error'">
        <div class="px-6 pt-5 pb-4">
          <h2
            class="text-xl font-bold text-[var(--wui-color-text)] wallet-custom-font mb-4"
          >
            Export Failed
          </h2>
          <p class="text-sm text-[var(--wui-color-text-secondary)] mb-4">
            {{
              errorMessage ||
              'An error occurred while exporting the recovery phrase.'
            }}
          </p>
          <div class="flex gap-3">
            <button
              @click="handleClose"
              class="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-[var(--wui-color-bg-tertiary)] text-[var(--wui-color-text-secondary)] hover:brightness-90 transition-all"
            >
              Close
            </button>
            <button
              @click="handleRetry"
              class="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-[var(--wui-color-primary)] text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)] transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
