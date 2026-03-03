import { promises as fs } from 'fs'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const entries = {
  index: resolve(__dirname, 'src/index.ts'),
  'plugins/export-key': resolve(__dirname, 'src/plugins/export-key/index.tsx'),
}

const globals = {
  'react-dom': 'ReactDom',
  react: 'React',
  'react/jsx-runtime': 'ReactJsxRuntime',
  'react/jsx-dev-runtime': 'ReactJsxDevRuntime',
}

export default defineConfig({
  build: {
    lib: {
      entry: entries,
      name: 'use-wallet-ui-react',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@txnlab/use-wallet-react',
      ],
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
      onwarn(warning, warn) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          warning.message.includes('use client')
        ) {
          return
        }
        warn(warning)
      },
    },
    sourcemap: true,
    minify: true,
  },
  plugins: [
    dts({
      outDir: 'dist/types',
      rollupTypes: false,
      include: ['src'],
      compilerOptions: {
        declarationMap: true,
      },
      // Copy .d.ts files to .d.cts for CJS consumers
      afterBuild: async () => {
        try {
          const typesDir = resolve(__dirname, 'dist/types')

          // Copy index types
          const indexDts = resolve(typesDir, 'index.d.ts')
          const indexDcts = resolve(typesDir, 'index.d.cts')
          const indexContent = await fs.readFile(indexDts, 'utf-8')
          await fs.writeFile(indexDcts, indexContent)

          // Copy plugin types
          const pluginDirs = ['export-key']
          for (const dir of pluginDirs) {
            const pluginDts = resolve(typesDir, `plugins/${dir}/index.d.ts`)
            const pluginDcts = resolve(typesDir, `plugins/${dir}/index.d.cts`)
            try {
              const content = await fs.readFile(pluginDts, 'utf-8')
              await fs.writeFile(pluginDcts, content)
            } catch {
              // Plugin type file may not exist if no exports
            }
          }

          console.log('Successfully created .d.cts files')
        } catch (error) {
          console.error('Error creating .d.cts files:', error)
        }
      },
    }),
  ],
  // Ensure proper asset handling
  assetsInclude: ['**/*.woff2'],
})
