import { createRequire } from 'node:module'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// The polyfill plugin also injects its shim imports into the workspace-linked
// library build, where they can't be resolved. Resolve them from here.
const require = createRequire(import.meta.url)
const polyfillShims = Object.fromEntries(
  ['buffer', 'global', 'process'].map((shim) => [
    `vite-plugin-node-polyfills/shims/${shim}`,
    require
      .resolve(`vite-plugin-node-polyfills/shims/${shim}`)
      .replace(/\.cjs$/, '.js'),
  ]),
)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: polyfillShims,
  },
  plugins: [
    vue(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  server: {
    // Passkeys need a secure context; Chrome treats localhost as one. The
    // e2e tests expect this port.
    host: 'localhost',
    port: 5177,
    strictPort: true,
  },
})
