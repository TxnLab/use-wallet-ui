<script setup lang="ts">
import { usePlugins } from './pluginContext'
import RenderVNode from './RenderVNode'
import type { MenuRenderContext, MenuSlot } from './types'

const props = defineProps<{
  slot: MenuSlot
  ctx: MenuRenderContext
}>()

const { menuItemsBySlot } = usePlugins()
</script>

<template>
  <template v-for="item in menuItemsBySlot[props.slot]" :key="item.key">
    <RenderVNode
      v-if="!item.enabled || item.enabled(props.ctx)"
      :vnode="item.render(props.ctx)"
    />
  </template>
</template>
