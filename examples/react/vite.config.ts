import { createRequire } from 'node:module'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
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
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
})
