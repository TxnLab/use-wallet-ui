import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import tseslint from 'typescript-eslint'

import baseConfig from '../../eslint.config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    // Config files and scripts
    files: ['*.config.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
)
