import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    // Exclude function tests that require environment setup
    exclude: [
      'node_modules/**',
      'dist/**',
      'netlify/functions/**/*.test.cjs',
      'netlify/functions/__tests__/**'
    ],
    // Ensure TSX is transformed in web mode and inline react/testing deps for esbuild
    testTransformMode: {
      web: ['.ts', '.tsx', '.js', '.jsx']
    },
    deps: {
      inline: ['react', 'react-dom', '@testing-library/react']
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/__tests__/**',
        '**/tests/**',
        'src/components/ui/**', // Exclude shadcn/ui components
        'netlify/functions/tests/**',
        'netlify/functions/__tests__/**'
      ],
      all: true,
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  }
})
