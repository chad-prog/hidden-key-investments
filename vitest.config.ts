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
    }
  }
})
