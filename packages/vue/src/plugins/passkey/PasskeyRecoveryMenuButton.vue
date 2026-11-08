<script setup lang="ts">
import { PASSKEY_RECOVERY_DIALOG } from './constants'
import type { MenuRenderContext } from '../types'

const props = defineProps<{
  ctx: MenuRenderContext
}>()

// Only opens the dialog: the passkey prompt starts from its Reveal button
function handleClick(): void {
  props.ctx.closeMenu()
  props.ctx.openDialog(PASSKEY_RECOVERY_DIALOG)
}
</script>

<template>
  <div class="border-t border-[var(--wui-color-border)] mt-2 mb-2" />
  <button
    @click="handleClick"
    class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[var(--wui-color-text-secondary)] hover:bg-[var(--wui-color-bg-hover)] transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <!-- A recovery phrase is words; a key means passkey sign-in -->
      <path
        fill-rule="evenodd"
        d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
        clip-rule="evenodd"
      />
    </svg>
    <span class="flex-1 text-left">Export Recovery Phrase</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0 opacity-50"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>
