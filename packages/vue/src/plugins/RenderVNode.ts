import { defineComponent, h, type PropType, type VNode } from 'vue'

export const RenderVNode = defineComponent({
  name: 'RenderVNode',
  props: {
    vnode: {
      type: Object as PropType<VNode>,
      required: true,
    },
  },
  setup(props) {
    return () => h('div', {}, [props.vnode])
  },
})

export default RenderVNode
