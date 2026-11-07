import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import globals from 'globals'
import tseslint from 'typescript-eslint'

import baseConfig from '../../eslint.config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
)
