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
    <!-- A plain shield: backing up is a protective step. No checkmark, so it
         doesn't read as already done, and no key, which means passkey
         sign-in. Heroicons solid shield-check without the check, MIT
         License -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z"
      />
    </svg>
    <span class="flex-1 text-left">Back up account</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0 opacity-50"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>
