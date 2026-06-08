import { computed, ref, watch, onUnmounted } from 'vue'

import type { ComputedRef } from 'vue'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Composable to resolve the actual theme value, handling 'system' preference detection.
 * When theme is 'system', it listens to the user's OS/browser color scheme preference.
 *
 * @param theme - Ref or getter returning the theme: 'light', 'dark', or 'system'
 * @returns A computed ref for the resolved theme: 'light' or 'dark'
 */
export function useResolvedTheme(theme: () => Theme): {
  resolvedTheme: ComputedRef<ResolvedTheme>
} {
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const systemTheme = ref<ResolvedTheme>(getSystemTheme())

  let mediaQuery: MediaQueryList | null = null
  let handler: ((e: MediaQueryListEvent) => void) | null = null

  const setupListener = (): void => {
    if (typeof window === 'undefined') return
    if (mediaQuery && handler) {
      mediaQuery.removeEventListener('change', handler)
    }
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
    handler = (e: MediaQueryListEvent): void => {
      systemTheme.value = e.matches ? 'dark' : 'light'
    }
    mediaQuery.addEventListener('change', handler)
  }

  const teardownListener = (): void => {
    if (mediaQuery && handler) {
      mediaQuery.removeEventListener('change', handler)
      mediaQuery = null
      handler = null
    }
  }

  watch(
    theme,
    (newTheme) => {
      if (newTheme === 'system') {
        setupListener()
      } else {
        teardownListener()
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    teardownListener()
  })

  const resolvedTheme = computed<ResolvedTheme>(() => {
    const t = theme()
    return t === 'system' ? systemTheme.value : t
  })

  return { resolvedTheme }
}
