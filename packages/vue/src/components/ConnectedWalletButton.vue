<script setup lang="ts">
import { useWallet } from '@txnlab/use-wallet-vue'
import { formatShortAddress } from '@txnlab/utils-ts'
import { computed } from 'vue'

import { useNfd } from '../composables/useNfd'
import { cn } from '../utils'

import NfdAvatar from './NfdAvatar.vue'

export type ButtonSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-1.5 pl-2 md:pl-2.5 pr-2 text-sm rounded-lg',
  md: 'py-2.5 pl-3 md:pl-3.5 pr-3 text-base rounded-xl',
  lg: 'py-3 pl-3.5 md:pl-4 pr-3.5 text-lg rounded-xl',
}

const avatarSizes: Record<ButtonSize, number> = {
  sm: 20,
  md: 24,
  lg: 28,
}

const avatarContainerClasses: Record<ButtonSize, string> = {
  sm: 'mr-1 md:mr-1.5 h-5 w-5',
  md: 'mr-1 md:mr-2 h-6 w-6',
  lg: 'mr-1.5 md:mr-2.5 h-7 w-7',
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

const { activeAddress } = useWallet()
const nfdQuery = useNfd()

const nfdName = computed(() => nfdQuery.data.value?.name ?? null)

const classes = computed(() =>
  cn(
    'flex items-center bg-[var(--wui-color-primary)] transition-colors hover:bg-[var(--wui-color-primary-hover)] text-[var(--wui-color-primary-text)] cursor-pointer font-bold',
    sizeClasses[props.size],
    props.class,
  ),
)

const chevronSize = computed(() => {
  if (props.size === 'sm') return { width: 14, height: 14 }
  if (props.size === 'lg') return { width: 20, height: 20 }
  return { width: 18, height: 18 }
})
</script>

<template>
  <button
    data-wallet-ui
    data-wallet-button
    :class="classes"
    :style="props.style"
    type="button"
  >
    <slot>
      <div class="flex items-center">
        <div
          v-if="activeAddress"
          :class="cn('overflow-hidden', avatarContainerClasses[props.size])"
        >
          <NfdAvatar
            :nfd="nfdQuery.data?.value"
            :alt="`${nfdName || activeAddress} avatar`"
            :size="avatarSizes[props.size]"
            light-only
          />
        </div>

        <span class="hidden md:block max-w-[160px] truncate">
          {{
            nfdName ||
            (activeAddress
              ? formatShortAddress(activeAddress, 6, 4)
              : 'Connect')
          }}
        </span>

        <svg
          v-if="activeAddress"
          xmlns="http://www.w3.org/2000/svg"
          :width="chevronSize.width"
          :height="chevronSize.height"
          viewBox="0 0 16 16"
          fill="none"
          class="ml-1.5 mt-0.5"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </slot>
  </button>
</template>
