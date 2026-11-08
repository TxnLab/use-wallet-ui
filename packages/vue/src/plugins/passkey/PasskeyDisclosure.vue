<script setup lang="ts">
import { computed, ref } from 'vue'

import { getPasskeyAccountDomain } from '../../utils/passkey'
import type { MenuRenderContext } from '../types'

import { dismissDisclosure, isDisclosureDismissed } from './storage'

/**
 * Tells users the passkey account belongs to the site that created it. Shows
 * until the user chooses "Got it", once per account; the domain tag in the
 * menu stays after that.
 */
const props = defineProps<{
  ctx: MenuRenderContext
  text: string
}>()

// The account dismissed in this component. Read inside `visible` (not as a
// bare `void ref.value`, which the library build's tree-shaking removes) so
// dismissing re-evaluates it
const dismissedAddress = ref<string | null>(null)

const visible = computed(() => {
  const address = props.ctx.activeAddress
  return (
    !!address &&
    dismissedAddress.value !== address &&
    !isDisclosureDismissed(address)
  )
})

const message = computed(() =>
  props.text.replaceAll(
    '{domain}',
    getPasskeyAccountDomain(props.ctx.activeWallet?.activeAccount?.name),
  ),
)

function handleDismiss(): void {
  const address = props.ctx.activeAddress
  if (!address) return
  dismissDisclosure(address)
  dismissedAddress.value = address
}
</script>

<template>
  <div
    v-if="visible"
    role="note"
    data-passkey-disclosure
    class="mb-2 flex flex-col gap-2 rounded-[10px] border border-[var(--wui-color-border)] bg-[var(--wui-color-bg-secondary)] px-3 py-2.5"
  >
    <p class="text-xs leading-[1.55] text-[var(--wui-color-text-secondary)]">
      {{ message }}
    </p>
    <button
      type="button"
      @click="handleDismiss"
      class="self-end rounded-md bg-[var(--wui-color-primary)] px-2.5 py-1 text-xs font-medium text-[var(--wui-color-primary-text)] hover:bg-[var(--wui-color-primary-hover)]"
    >
      Got it
    </button>
  </div>
</template>
