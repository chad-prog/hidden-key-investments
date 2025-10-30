import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.netlify/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs',
      '.vscode/**',
      '.vs/**',
      '.devcontainer/**',
      // Corrupted files - to be restored
      'src/components/AdvancedPropertyFilters.tsx',
      'src/components/AnalyticsDashboard.tsx',
      'src/components/LiveChatWidget.tsx',
      'src/pages/AutomationDashboard.tsx',
      'src/utils/advancedSecurity.ts',
      'src/utils/calendarScheduling.ts',
      'src/utils/electronicSignatures.ts',
      'src/utils/paymentProcessing.ts',
      'src/utils/smsNotifications.ts'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks
    },
    rules: {
      ...js.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-import-assign': 'off',
      'no-unreachable': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
