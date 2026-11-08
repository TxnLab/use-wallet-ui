<script setup lang="ts">
import { PASSKEY_RECOVERY_DIALOG } from './constants'
import { isRecoveryPhraseShown } from './storage'
import type { MenuRenderContext } from '../types'

const props = defineProps<{
  ctx: MenuRenderContext
  /** Tag the item "Not backed up" until the phrase has been shown once */
  backupReminder: boolean
}>()

// Only opens the dialog: the passkey prompt starts from its Reveal button
function handleClick(): void {
  props.ctx.closeMenu()
  props.ctx.openDialog(PASSKEY_RECOVERY_DIALOG)
}

// Read when the menu opens; revealing the phrase closes the menu first
const notBackedUp =
  props.backupReminder &&
  !!props.ctx.activeAddress &&
  !isRecoveryPhraseShown(props.ctx.activeAddress)
</script>

<template>
  <div class="border-t border-[var(--wui-color-border)] mt-2 mb-2" />
  <button
    @click="handleClick"
    data-passkey-backup
    class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-[var(--wui-color-text-secondary)] hover:bg-[var(--wui-color-bg-hover)] transition-colors"
  >
    <!-- Numbered list: the recovery phrase is 25 numbered words. A key would
         read as passkey sign-in. Heroicons, MIT License -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M3 1.25a.75.75 0 0 0 0 1.5h.25v2.5a.75.75 0 0 0 1.5 0V2A.75.75 0 0 0 4 1.25H3ZM2.97 8.654a3.5 3.5 0 0 1 1.524-.12.034.034 0 0 1-.012.012L2.415 9.579A.75.75 0 0 0 2 10.25v1c0 .414.336.75.75.75h2.5a.75.75 0 0 0 0-1.5H3.927l1.225-.613c.52-.26.848-.79.848-1.371 0-.647-.429-1.327-1.193-1.451a5.03 5.03 0 0 0-2.277.155.75.75 0 0 0 .44 1.434ZM7.75 3a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5ZM7.75 9.25a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5ZM7.75 15.5a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5ZM2.625 13.875a.75.75 0 0 0 0 1.5h1.5a.125.125 0 0 1 0 .25H3.5a.75.75 0 0 0 0 1.5h.625a.125.125 0 0 1 0 .25h-1.5a.75.75 0 0 0 0 1.5h1.5a1.625 1.625 0 0 0 1.37-2.5 1.625 1.625 0 0 0-1.37-2.5h-1.5Z"
      />
    </svg>
    <span class="flex-1 text-left">Back up account</span>
    <span
      v-if="notBackedUp"
      data-passkey-not-backed-up
      class="rounded-md bg-[var(--wui-color-bg-tertiary)] px-[7px] py-px text-xs text-[var(--wui-color-text-secondary)]"
    >
      Not backed up
    </span>
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
