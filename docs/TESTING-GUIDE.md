# Testing Guide

This guide covers testing practices, tools, and utilities for the Hidden Key Investments platform.

## Quick Start

```bash
# Run all tests
npm test

# Run function tests
npm run test:functions

# Run all tests and quality checks
bash scripts/dev-utils.sh check-all

# Run tests in watch mode (for development)
npm run test:watch
```

## Test Structure

### Main Test Suite (`src/`)

Located in `src/` with the pattern `**/__tests__/**/*.test.{ts,tsx,js}`

**Coverage:**
- ✅ Test fixtures and utilities (12 tests)
- ✅ Environment validation (5 tests)
- ✅ Airtable sync client (1 test)
- ✅ Page components (1 test)

**Total: 19 tests**

**Run with:**
```bash
npm test
```

### Function Tests (`netlify/functions/`)

Located in `netlify/functions/__tests__/`

**Coverage:**
- ✅ Serverless functions infrastructure (4 tests)
- ✅ Airtable sync function (5 tests)
- ✅ Webhook inbound handler (10 tests)
- ✅ Lead ingest enhanced (34 tests)

**Total: 53 tests**

**Run with:**
```bash
npm run test:functions
```

## Test Coverage

### Current Metrics

| Suite | Tests | Status | Coverage Goal |
|-------|-------|--------|---------------|
| Main | 19 | ✅ Passing | 80% |
| Functions | 53 | ✅ Passing | 80% |
| **Total** | **72** | **✅ All Passing** | **80%** |

### Coverage Reports

Generate coverage reports:

```bash
# Main tests with coverage
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

Coverage reports are automatically uploaded to CI/CD artifacts and Codecov.

## Testing Patterns

### 1. Lead Ingest Enhanced Tests

**File:** `netlify/functions/__tests__/lead-ingest-enhanced.test.js`

Comprehensive integration tests covering:
- ✅ Request validation (all fields, edge cases)
- ✅ Demo mode functionality
- ✅ UTM tracking and metadata
- ✅ Property type validation
- ✅ Source type validation
- ✅ Response structure and headers
- ✅ Error handling
- ✅ Raw payload preservation

**Example:**
```javascript
it('accepts valid lead with all required fields', async () => {
  const event = {
    body: JSON.stringify({
      source: 'website',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      property: {
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    })
  };

  const response = await handler(event);
  const body = JSON.parse(response.body);

  expect(response.statusCode).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.data.leadId).toBeDefined();
});
```

### 2. Webhook Integration Tests

**File:** `netlify/functions/__tests__/webhook-inbound.test.js`

Tests webhook payload normalization and validation:
- ✅ Accepts valid webhook payloads
- ✅ Normalizes property data
- ✅ Handles flexible field names
- ✅ Verifies webhook signatures
- ✅ Stores custom fields
- ✅ Handles errors gracefully
- ✅ Includes UTM tracking

### 3. Mock Data and Fixtures

**File:** `src/lib/testFixtures.ts`

Provides consistent mock data for testing:

```typescript
import { createMockLead, createMockCRMDataset } from '@/lib/testFixtures';

// Single lead
const lead = createMockLead({ source: 'referral' });

// Complete dataset
const { leads, opportunities, investors } = createMockCRMDataset();
```

## Developer Utilities

### Dev Utils Script

**File:** `scripts/dev-utils.sh`

Automates common development tasks:

```bash
# Run all quality checks (lint, test, build)
bash scripts/dev-utils.sh check-all

# Run all test suites
bash scripts/dev-utils.sh test-all

# Clean build artifacts
bash scripts/dev-utils.sh clean

# Set up environment files
bash scripts/dev-utils.sh setup-env

# Check for outdated dependencies
bash scripts/dev-utils.sh check-deps

# Run pre-commit checks
bash scripts/dev-utils.sh pre-commit

# Show help
bash scripts/dev-utils.sh help
```

### Pre-Commit Checks

Before committing, run:

```bash
bash scripts/dev-utils.sh pre-commit
```

This will:
1. Check for potential secrets in staged files
2. Lint only staged files
3. Run all tests
4. Confirm everything passes

## Writing Tests

### Best Practices

1. **Use descriptive test names**
   ```javascript
   it('rejects invalid email format', async () => { ... })
   ```

2. **Test both success and failure cases**
   ```javascript
   describe('validation', () => {
     it('accepts valid data', ...)
     it('rejects invalid data', ...)
   })
   ```

3. **Use mock data from fixtures**
   ```javascript
   import { createMockLead } from '@/lib/testFixtures'
   const lead = createMockLead()
   ```

4. **Test edge cases**
   ```javascript
   it('handles empty object', ...)
   it('handles very long strings', ...)
   it('handles special characters', ...)
   ```

5. **Keep tests independent**
   - Each test should be able to run in isolation
   - Use `beforeEach` to reset state
   - Don't rely on test execution order

### Test Template

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature name', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('Subfeature', () => {
    it('does something correctly', async () => {
      // Arrange
      const input = { ... };
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });

    it('handles error case', async () => {
      const invalidInput = { ... };
      
      await expect(
        functionUnderTest(invalidInput)
      ).rejects.toThrow();
    });
  });
});
```

## Running Tests in CI/CD

Tests run automatically on:
- ✅ Pull requests
- ✅ Push to main/staging branches
- ✅ Manual workflow dispatch

### CI Test Workflow

1. **Security Scan** - Trivy, Gitleaks, TruffleHog
2. **Lint** - ESLint on all files
3. **Test** - Main + Function tests with coverage
4. **Build** - Vite production build

### Viewing Results

- **GitHub Actions**: Check "Actions" tab
- **Test Summary**: Visible in PR checks
- **Coverage Report**: Artifacts → coverage-report

## Debugging Tests

### Run Single Test File

```bash
# Main tests
npx vitest run src/lib/__tests__/envValidation.test.ts

# Function tests
cd netlify/functions
npx vitest run __tests__/lead-ingest-enhanced.test.js
```

### Run Tests in Watch Mode

```bash
# Main tests - auto-rerun on file changes
npm run test:watch

# Function tests
cd netlify/functions
npx vitest
```

### Enable Debug Output

```bash
# Run with debug logging
DEBUG=* npm test

# Run specific test with console output
npx vitest run path/to/test.js --reporter=verbose
```

## Test Configuration

### Main Tests (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  }
})
```

### Function Tests (`netlify/functions/vitest.config.js`)

```javascript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      '__tests__/serverless.test.js',
      '__tests__/airtable-sync.test.js',
      '__tests__/webhook-inbound.test.js',
      '__tests__/lead-ingest-enhanced.test.js'
    ]
  }
})
```

## Continuous Improvement

### Adding New Tests

When adding a new serverless function:

1. Create test file: `netlify/functions/__tests__/[function-name].test.js`
2. Add to vitest config: `netlify/functions/vitest.config.js`
3. Run tests: `npm run test:functions`
4. Verify coverage: Check that key paths are tested

### Coverage Goals

Target coverage by file type:
- **Serverless Functions**: 80%
- **Utilities**: 80%
- **Components**: 70% (UI tests can be challenging)
- **Pages**: 60% (integration focused)

### Testing Checklist

Before pushing code:

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Coverage meets minimum thresholds
- [ ] No secrets in code
- [ ] Lint passes

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Cause:** Environment differences

**Solution:**
1. Check node version matches CI (see `.nvmrc`)
2. Run `npm ci` instead of `npm install`
3. Clear cache: `npm cache clean --force`

### Coverage Report Not Generated

**Cause:** Test command doesn't include coverage flag

**Solution:**
```bash
npm run test:coverage
```

### Tests Timeout

**Cause:** Async operations not completing

**Solution:**
- Increase timeout in test
- Check for unresolved promises
- Use `await` for async operations

## Resources

- **Vitest Documentation**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Project Tests**: `src/**/__tests__` and `netlify/functions/__tests__`
- **Coverage Reports**: `coverage/index.html` (after running tests)

## Need Help?

- Check existing tests for examples
- Review test fixtures in `src/lib/testFixtures.ts`
- See `docs/CONTRIBUTING.md` for contribution guidelines
- Create an issue for test infrastructure improvements

---

**Last Updated:** 2025-10-27  
**Test Count:** 72 tests  
**Status:** ✅ All Passing
