import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Custom rule: no-direct-dispatch (P1.4 Command Layer Enforcement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const noDirectDispatch = await import(resolve(__dirname, 'eslint-rules/no-direct-dispatch.js'));

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'custom': {
        rules: {
          'no-direct-dispatch': noDirectDispatch.default || noDirectDispatch,
        },
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Repo-wide: keep type-safety guidance but don't hard-fail builds on `any`.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // React 19 + strict hook lint rules are currently violated in multiple legacy modules.
      // Keep exhaustive-deps as a warning; disable the rules that hard-fail on common patterns.
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/static-components': 'off',

      // P1.4: Command Layer Enforcement
      // Prevents direct dispatch of domain mutations from UI layer
      'custom/no-direct-dispatch': 'error',
    },
  },
])
