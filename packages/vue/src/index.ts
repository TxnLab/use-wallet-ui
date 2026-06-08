import { initializeFonts } from './utils/fontLoader'

export { default as ConnectWalletButton } from './components/ConnectWalletButton.vue'
export { default as ConnectWalletMenu } from './components/ConnectWalletMenu.vue'
export { default as ConnectedWalletButton } from './components/ConnectedWalletButton.vue'
export { default as ConnectedWalletMenu } from './components/ConnectedWalletMenu.vue'
export { default as WalletButton } from './components/WalletButton.vue'
export { default as WalletList } from './components/WalletList.vue'
export { default as NfdAvatar } from './components/NfdAvatar.vue'
export { default as AlgoSymbol } from './components/AlgoSymbol.vue'

export { useNfd } from './composables/useNfd'
export type { NfdRecord, NfdLookupResponse } from './composables/useNfd'
export { useAccountInfo } from './composables/useAccountInfo'
export { useResolvedTheme } from './composables/useResolvedTheme'
export type { Theme, ResolvedTheme } from './composables/useResolvedTheme'

export { default as WalletUIProvider } from './providers/WalletUIProvider.vue'
export { useWalletUI } from './providers/walletUIContext'

export { usePlugins } from './plugins/pluginContext'
export type {
  MenuRenderContext,
  MenuSlot,
  PluginDialog,
  PluginLifecycleHooks,
  PluginMenuItem,
  PluginPanel,
  PluginRenderContext,
  WalletUIPlugin,
} from './plugins/types'

initializeFonts()
