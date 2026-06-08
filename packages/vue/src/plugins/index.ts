export { providePlugins, usePlugins } from './pluginContext'
export { default as PluginDialogRenderer } from './PluginDialogRenderer.vue'
export { default as PluginLifecycleManager } from './PluginLifecycleManager.vue'
export { default as PluginSlot } from './PluginSlot.vue'

export type {
  MenuRenderContext,
  MenuSlot,
  PluginDialog,
  PluginLifecycleHooks,
  PluginMenuItem,
  PluginPanel,
  PluginRenderContext,
  WalletUIPlugin,
} from './types'
