<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { cn } from '../utils/cn'
import { checkIpfsAvailability } from '../utils/ipfs'

import type { NfdRecord } from '../composables/useNfd'

const props = withDefaults(
  defineProps<{
    nfd: NfdRecord | null | undefined
    alt?: string
    class?: string
    size?: number
    lightOnly?: boolean
  }>(),
  {
    size: 40,
    lightOnly: false,
  },
)

const rawAvatarUrl = computed(
  () =>
    props.nfd?.properties?.userDefined?.avatar ||
    props.nfd?.properties?.verified?.avatar ||
    null,
)

const imgAlt = computed(() => props.alt || props.nfd?.name || 'NFD Avatar')

const { data: avatarUrl, isLoading } = useQuery({
  queryKey: computed(() => ['nfd-avatar', rawAvatarUrl.value]),
  queryFn: async () => {
    if (!rawAvatarUrl.value) return null

    if (
      rawAvatarUrl.value.startsWith('https://') &&
      !rawAvatarUrl.value.includes('/ipfs/')
    ) {
      return rawAvatarUrl.value
    }

    if (
      rawAvatarUrl.value.startsWith('ipfs://') ||
      rawAvatarUrl.value.includes('/ipfs/')
    ) {
      return await checkIpfsAvailability(rawAvatarUrl.value)
    }

    return rawAvatarUrl.value
  },
  enabled: computed(() => !!rawAvatarUrl.value),
  staleTime: 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
})

const fallbackStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  backgroundColor: props.lightOnly ? '#e5e7eb' : 'var(--wui-color-avatar-bg)',
}))

const fallbackIconStyle = computed(() => ({
  width: `${Math.max(props.size / 2, 12)}px`,
  height: `${Math.max(props.size / 2, 12)}px`,
  color: props.lightOnly ? '#9ca3af' : 'var(--wui-color-avatar-icon)',
}))

const imageStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  objectFit: 'cover' as const,
}))
</script>

<template>
  <div
    v-if="isLoading || !avatarUrl"
    data-wallet-ui
    :class="cn('flex items-center justify-center rounded-full', props.class)"
    :style="fallbackStyle"
    :aria-label="imgAlt"
    role="img"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      :style="fallbackIconStyle"
    >
      <path
        fill-rule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        clip-rule="evenodd"
      />
    </svg>
  </div>

  <img
    v-else
    :src="avatarUrl"
    :alt="imgAlt"
    :class="cn('rounded-full', props.class)"
    :style="imageStyle"
    loading="lazy"
  />
</template>
