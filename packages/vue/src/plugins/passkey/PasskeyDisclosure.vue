<script setup lang="ts">
import { computed } from 'vue'

import { getPasskeyAccountDomain } from '../../utils/passkey'
import type { MenuRenderContext } from '../types'

const props = defineProps<{
  ctx: MenuRenderContext
  text: string
}>()

// Tells users the passkey account belongs to the site that created it
const message = computed(() =>
  props.text.replaceAll(
    '{domain}',
    getPasskeyAccountDomain(props.ctx.activeWallet?.activeAccount?.name),
  ),
)
</script>

<template>
  <p
    data-passkey-disclosure
    class="mb-2 rounded-lg bg-[var(--wui-color-bg-secondary)] px-3 py-2 text-xs leading-relaxed text-[var(--wui-color-text-secondary)]"
  >
    {{ message }}
  </p>
</template>
