import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const reactCompilerRules = [
  'react-hooks/config',
  'react-hooks/error-boundaries',
  'react-hooks/gating',
  'react-hooks/globals',
  'react-hooks/immutability',
  'react-hooks/incompatible-library',
  'react-hooks/preserve-manual-memoization',
  'react-hooks/purity',
  'react-hooks/refs',
  'react-hooks/set-state-in-effect',
  'react-hooks/set-state-in-render',
  'react-hooks/static-components',
  'react-hooks/unsupported-syntax',
  'react-hooks/use-memo',
]

export default defineConfig([
  globalIgnores(['dist', 'test-conn-2.js', 'scratch/**', '.agents/**/dist/**', 'coverage/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // O projeto não usa React Compiler: desativa as regras específicas do compilador
      // para evitar falsos positivos em código React clássico.
      ...Object.fromEntries(reactCompilerRules.map(rule => [rule, 'off'])),
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    // Scripts utilitários Node.js na raiz (diagnóstico/testes de integração)
    files: ['create-evolution-instance.js', 'diagnostico-whatsapp.js', 'generate-code.js', 'test-*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
