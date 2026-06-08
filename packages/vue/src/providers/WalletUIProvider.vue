<script setup lang="ts">
import { computed, onMounted, provide, reactive, watchEffect } from 'vue'
import { QueryClient, VUE_QUERY_CLIENT } from '@tanstack/vue-query'
import { useWallet } from '@txnlab/use-wallet-vue'

import { useResolvedTheme } from '../composables/useResolvedTheme'
import { providePlugins } from '../plugins/pluginContext'
import PluginDialogRenderer from '../plugins/PluginDialogRenderer.vue'
import PluginLifecycleManager from '../plugins/PluginLifecycleManager.vue'

import WalletAccountsPrefetcher from './WalletAccountsPrefetcher.vue'
import { WALLET_UI_CONTEXT_KEY } from './walletUIContext'

import type { NfdView } from '../composables/useNfd'
import type { Theme } from '../composables/useResolvedTheme'
import type { PluginRenderContext, WalletUIPlugin } from '../plugins/types'

const THEME_STYLES_ID = 'wallet-ui-theme-styles'

const lightThemeVars = `
  --wui-color-primary: #2d2df1; --wui-color-primary-hover: #2929d9;
  --wui-color-primary-text: #ffffff; --wui-color-bg: #ffffff;
  --wui-color-bg-secondary: #f9fafb; --wui-color-bg-tertiary: #f3f4f6;
  --wui-color-bg-hover: #e9e9fd; --wui-color-text: #1f2937;
  --wui-color-text-secondary: #6b7280; --wui-color-text-tertiary: #9ca3af;
  --wui-color-border: #e5e7eb; --wui-color-link: rgba(45, 45, 241, 0.8);
  --wui-color-link-hover: #2d2df1; --wui-color-overlay: rgba(0, 0, 0, 0.3);
  --wui-color-danger-bg: #fee2e2; --wui-color-danger-bg-hover: #fecaca;
  --wui-color-danger-text: #b91c1c; --wui-color-avatar-bg: #e5e7eb;
  --wui-color-avatar-icon: #9ca3af;
`

const darkThemeVars = `
  --wui-color-primary: #bfbff9; --wui-color-primary-hover: #d4d4fa;
  --wui-color-primary-text: #001324; --wui-color-bg: #001324;
  --wui-color-bg-secondary: #101b29; --wui-color-bg-tertiary: #192a39;
  --wui-color-bg-hover: #192a39; --wui-color-text: #e9e9fd;
  --wui-color-text-secondary: #99a1a7; --wui-color-text-tertiary: #6b7280;
  --wui-color-border: #192a39; --wui-color-link: #6c6cf1;
  --wui-color-link-hover: #8080f3; --wui-color-overlay: rgba(0, 0, 0, 0.5);
  --wui-color-danger-bg: rgba(127, 29, 29, 0.4); --wui-color-danger-bg-hover: rgba(127, 29, 29, 0.6);
  --wui-color-danger-text: #fca5a5; --wui-color-avatar-bg: #192a39;
  --wui-color-avatar-icon: #6b7280;
`

function injectThemeStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(THEME_STYLES_ID)) return

  const style = document.createElement('style')
  style.id = THEME_STYLES_ID
  style.textContent = `
    [data-wallet-theme] { ${lightThemeVars} }
    [data-wallet-theme][data-theme='dark'] { ${darkThemeVars} }
    .dark [data-wallet-theme]:not([data-theme='light']) { ${darkThemeVars} }
    @media (prefers-color-scheme: dark) {
      [data-wallet-theme]:not([data-theme='light']):not([data-theme='dark']) { ${darkThemeVars} }
    }
  `

  document.head.insertBefore(style, document.head.firstChild)
}

const createDefaultQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 10 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('404'))
            return false
          return failureCount < 3
        },
      },
    },
  })

const props = withDefaults(
  defineProps<{
    queryClient?: QueryClient
    enablePrefetching?: boolean
    prefetchNfdView?: NfdView
    theme?: Theme
    plugins?: WalletUIPlugin[]
  }>(),
  {
    enablePrefetching: true,
    prefetchNfdView: 'thumbnail',
    theme: 'system',
    plugins: () => [],
  },
)

const queryClient = props.queryClient ?? createDefaultQueryClient()
provide(VUE_QUERY_CLIENT, queryClient)

const theme = computed(() => props.theme)
const { resolvedTheme } = useResolvedTheme(() => theme.value)

const dataTheme = computed(() =>
  props.theme === 'system' ? undefined : props.theme,
)

provide(WALLET_UI_CONTEXT_KEY, {
  queryClient,
  theme,
  resolvedTheme,
})

const { activeAddress, activeWallet } = useWallet()

const pluginRenderContext = reactive<PluginRenderContext>({
  activeAddress: null,
  activeWallet: null,
  theme: theme.value,
  resolvedTheme: resolvedTheme.value,
  openDialog: () => {},
  closeDialog: () => {},
})

watchEffect(() => {
  pluginRenderContext.activeAddress = activeAddress.value
  pluginRenderContext.activeWallet = activeWallet.value
  pluginRenderContext.theme = theme.value
  pluginRenderContext.resolvedTheme = resolvedTheme.value
})

const hasPlugins = computed(() => props.plugins.length > 0)

if (hasPlugins.value) {
  providePlugins(props.plugins, pluginRenderContext)
}

onMounted(() => {
  injectThemeStyles()
})
</script>

<template>
  <div data-wallet-theme :data-theme="dataTheme">
    <WalletAccountsPrefetcher
      :enabled="enablePrefetching"
      :nfd-view="prefetchNfdView"
      :query-client="queryClient"
    />

    <PluginLifecycleManager v-if="hasPlugins" />
    <PluginDialogRenderer v-if="hasPlugins" />

    <slot />
  </div>
</template>
