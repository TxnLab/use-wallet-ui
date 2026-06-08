<script setup lang="ts">
import { computed } from 'vue'
import { usePlugins } from './pluginContext'
import { useWalletUI } from '../providers/walletUIContext'
import RenderVNode from './RenderVNode'

const { dialogs, openDialogs, closeDialog, renderContext } = usePlugins()
const { theme } = useWalletUI()

const dataTheme = computed(() =>
  theme.value === 'system' ? undefined : theme.value,
)
</script>

<template>
  <Teleport to="body">
    <template v-for="dialog in dialogs" :key="dialog.key">
      <div
        v-if="openDialogs.has(dialog.key)"
        data-wallet-theme
        data-wallet-ui
        :data-theme="dataTheme"
      >
        <RenderVNode
          :vnode="
            dialog.render({
              isOpen: openDialogs.has(dialog.key),
              onClose: () => closeDialog(dialog.key),
              ctx: renderContext,
            })
          "
        />
      </div>
    </template>
  </Teleport>
</template>
