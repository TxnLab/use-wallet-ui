import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Only Buffer: the global and process shims are injected into the
      // workspace-linked library build, where they can't be resolved
      globals: {
        Buffer: true,
        global: false,
        process: false,
      },
    }),
  ],
  server: {
    // Passkeys need a secure context; Chrome treats localhost as one. The
    // e2e tests expect this port.
    host: 'localhost',
    port: 5176,
    strictPort: true,
  },
})
