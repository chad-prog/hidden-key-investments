import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Only include function tests that are properly formatted
    include: [
      '__tests__/serverless.test.js',
      '__tests__/airtable-sync.test.js'
    ],
    // Exclude problematic tests that need refactoring
    exclude: [
      '__tests__/investor.test.js',  // Needs async import refactoring
      '__tests__/opportunity.test.js',  // Uses CommonJS require
      '__tests__/serverless.vitest.js'  // Duplicate of serverless.test.js
    ],
    // Coverage configuration for functions
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        'tests/**',
        '**/*.test.*',
        'test-runner.js',
        'test.js'
      ],
      all: true,
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  }
});
