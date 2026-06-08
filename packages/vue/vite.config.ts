import { promises as fs } from 'fs'
import { resolve } from 'path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  'plugins/export-key': resolve(__dirname, 'src/plugins/export-key/index.ts'),
}

const globals = {
  vue: 'Vue',
  '@txnlab/use-wallet-vue': 'UseWalletVue',
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist/types',
      rollupTypes: false,
      include: ['src'],
      compilerOptions: {
        declarationMap: true,
      },
      afterBuild: async () => {
        try {
          const typesDir = resolve(__dirname, 'dist/types')

          const indexDts = resolve(typesDir, 'index.d.ts')
          const indexDcts = resolve(typesDir, 'index.d.cts')
          const indexContent = await fs.readFile(indexDts, 'utf-8')
          await fs.writeFile(indexDcts, indexContent)

          const pluginDirs = ['export-key']
          for (const dir of pluginDirs) {
            const pluginDts = resolve(typesDir, `plugins/${dir}/index.d.ts`)
            const pluginDcts = resolve(typesDir, `plugins/${dir}/index.d.cts`)
            try {
              const content = await fs.readFile(pluginDts, 'utf-8')
              await fs.writeFile(pluginDcts, content)
            } catch {
              // Plugin type file may not exist
            }
          }

          console.log('Successfully created .d.cts files')
        } catch (error) {
          console.error('Error creating .d.cts files:', error)
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: entries,
      name: 'use-wallet-ui-vue',
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['vue', '@txnlab/use-wallet-vue'],
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          preserveModules: false,
          exports: 'named',
          assetFileNames: 'assets/[name][extname]',
          globals,
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: 'chunks/[name]-[hash].cjs',
          preserveModules: false,
          exports: 'named',
          assetFileNames: 'assets/[name][extname]',
          globals,
        },
      ],
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    sourcemap: true,
    minify: true,
  },
  assetsInclude: ['**/*.woff2'],
})
