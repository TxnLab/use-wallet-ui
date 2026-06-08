<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../utils'

export type ButtonSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm rounded-lg',
  md: 'py-2.5 px-4 text-base rounded-xl',
  lg: 'py-3 px-5 text-lg rounded-xl',
}

const props = withDefaults(
  defineProps<{
    size?: ButtonSize
    class?: string
    style?: Record<string, string | number>
  }>(),
  {
    size: 'md',
  },
)

const classes = computed(() =>
  cn(
    'bg-[var(--wui-color-primary)] transition-colors hover:bg-[var(--wui-color-primary-hover)] text-[var(--wui-color-primary-text)] font-bold cursor-pointer disabled:opacity-50 wallet-custom-font',
    sizeClasses[props.size],
    props.class,
  ),
)
</script>

<template>
  <button
    data-wallet-ui
    data-wallet-button
    :class="classes"
    :style="props.style"
    type="button"
  >
    <slot>Connect Wallet</slot>
  </button>
</template>
