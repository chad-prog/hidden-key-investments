# Contributing to Hidden Key Investments

Thank you for your interest in contributing to the Hidden Key Investments platform! This guide will help you get started.

## 🎯 Vision & Goals

We're building a world-class platform for Elite real-estate investors that combines:
- Lead capture and enrichment
- AI-powered CRM and deal pipeline
- ML-based scoring and analytics
- Multi-agent AI orchestration
- Enterprise-grade security and compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (see `.nvmrc`)
- npm 10+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/chad-prog/hidden-key-investments.git
cd hidden-key-investments

# Install dependencies
npm install

# Run tests to verify setup
npm test

# Start development server
npm run dev
```

The app will run at http://localhost:3000 in **demo mode** (no API keys required).

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Always branch from staging
git checkout staging
git pull origin staging

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow these principles:
- **Small, focused changes** - One feature/fix per PR
- **Test-driven development** - Write tests first
- **Clean code** - Follow existing patterns
- **Document as you go** - Update docs for user-facing changes

### 3. Run Quality Checks

Before committing, ensure all checks pass:

```bash
# Lint your code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Build to check for errors
npm run build
```

All checks must pass before submitting a PR.

### 4. Commit Your Changes

We follow conventional commit format:

```bash
git add .
git commit -m "type(scope): description"
```

**Commit Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation change
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Test additions/improvements
- `chore:` - Maintenance tasks

**Examples**:
```bash
git commit -m "feat(crm): add lead list view with sorting"
git commit -m "fix(api): handle null values in lead ingestion"
git commit -m "docs(readme): update setup instructions"
git commit -m "test(workflows): add tests for email triggers"
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub
# Target branch: staging (not main!)
```

## 📝 Pull Request Guidelines

### PR Title Format
Use the same format as commits:
```
type(scope): description
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style
- [ ] Tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] No console errors/warnings

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

### PR Review Process
1. **Automated Checks** - CI/CD must pass (lint, test, build, security scan)
2. **Code Review** - At least one approval required
3. **Testing** - Review in deploy preview
4. **Merge to Staging** - Test in staging environment
5. **Merge to Main** - Deploy to production

## 🧪 Testing Guidelines

### Test Structure
We use Vitest for testing. Tests should follow this structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  describe('specific functionality', () => {
    beforeEach(() => {
      // Setup
    });

    it('should do something specific', () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Locations
- Unit tests: `src/**/__tests__/*.test.{ts,tsx}`
- Integration tests: `src/**/__tests__/*.integration.test.{ts,tsx}`
- Function tests: `netlify/functions/__tests__/*.test.js`

### Using Test Fixtures
Use the test fixture utilities for consistent test data:

```typescript
import { 
  createMockLead, 
  createMockOpportunity,
  createMockCRMDataset 
} from '@/lib/testFixtures';

const lead = createMockLead({ status: 'new' });
const { leads, opportunities, investors } = createMockCRMDataset();
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Happy path + error cases

## 🎨 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Prefer interfaces over types for objects
- Use `const` over `let`, avoid `var`
- Explicit return types for functions
- No `any` types (use `unknown` if needed)

### React Components
```typescript
// Use functional components with TypeScript
interface MyComponentProps {
  title: string;
  count?: number; // Optional props marked with ?
}

export function MyComponent({ title, count = 0 }: MyComponentProps) {
  // Component logic
  return <div>{title}: {count}</div>;
}
```

### Validation
Use Zod for all data validation:

```typescript
import { z } from 'zod';

const LeadSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.enum(['website', 'referral', 'api'])
});

// Validate
const lead = LeadSchema.parse(untrustedData);
```

### Error Handling
Use structured error responses:

```typescript
import { createErrorResponse } from '@/lib/errorHandler';

try {
  // Operation
} catch (error) {
  return createErrorResponse(error, {
    correlationId: request.id,
    context: { userId, action: 'create_lead' }
  });
}
```

## 📁 Project Structure

```
hidden-key-investments/
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docs/                  # Documentation
├── netlify/
│   └── functions/         # Serverless functions
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core utilities and schemas
│   ├── pages/            # Page components
│   └── utils/            # Helper functions
├── supabase-sql/         # Database schemas
└── scripts/              # Automation scripts
```

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `LeadCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `emailValidation.ts`)
- Tests: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
- Hooks: `use*.ts` (e.g., `useLeads.ts`)

## 🔒 Security Guidelines

### Sensitive Data
- **Never commit secrets** (API keys, passwords, tokens)
- Use environment variables for configuration
- Use `.env.example` for documentation, never `.env`
- Validate all user input with Zod schemas

### API Security
- Always validate request payloads
- Use CORS appropriately
- Implement rate limiting for public endpoints
- Log security-relevant events

### Dependencies
- Run `npm audit` before committing
- Keep dependencies up to date
- Review security advisories
- Use exact versions in package.json when possible

## 📚 Documentation

### Code Documentation
- Use JSDoc comments for public functions
- Document complex logic with inline comments
- Keep comments up to date with code changes

```typescript
/**
 * Validates and enriches a lead with additional data
 * @param lead - The lead data to validate
 * @param options - Enrichment options
 * @returns Enriched lead with validation status
 * @throws {ValidationError} If lead data is invalid
 */
export async function enrichLead(
  lead: Lead, 
  options?: EnrichmentOptions
): Promise<EnrichedLead> {
  // Implementation
}
```

### User Documentation
Update relevant docs when making user-facing changes:
- `README.md` - Overview and quick start
- `docs/CAPABILITIES.md` - Feature documentation
- `docs/API-REFERENCE.md` - API changes
- `docs/QUICK-START.md` - Setup instructions

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Try to reproduce in demo mode
3. Check documentation
4. Test in latest version

### Bug Report Template
```markdown
**Description**
Clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., macOS 13]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 22.0.0]
- Demo mode: [Yes/No]

**Screenshots**
If applicable.

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

### Before Requesting
1. Check the roadmap (`docs/IMPLEMENTATION-ROADMAP.md`)
2. Check existing feature requests
3. Consider if it fits the MVP scope

### Feature Request Template
```markdown
**Problem**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
What other solutions did you consider?

**Priority**
- [ ] Critical (blocks current work)
- [ ] High (needed for MVP)
- [ ] Medium (nice to have)
- [ ] Low (future enhancement)

**Implementation Notes**
Technical considerations or suggestions.
```

## 🎓 Learning Resources

### New to the Project?
1. Start with `docs/QUICK-START.md`
2. Read `docs/ARCHITECTURE.md`
3. Review `docs/CAPABILITIES.md`
4. Explore `src/lib/testFixtures.ts` for examples

### Key Technologies
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev
- **Vitest**: https://vitest.dev
- **Zod**: https://zod.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Radix UI**: https://www.radix-ui.com

### Project-Specific Guides
- Implementation Roadmap: `docs/IMPLEMENTATION-ROADMAP.md`
- API Reference: `docs/API-REFERENCE.md`
- ML Architecture: `docs/ML-ARCHITECTURE.md`
- AI Orchestration: `docs/AI-ORCHESTRATION.md`
- Security Policy: `docs/SECURITY-POLICY.md`

## 🚦 CI/CD Pipeline

Our GitHub Actions pipeline runs on every push and PR:

### Jobs
1. **Security Scan** - Trivy vulnerability scanner
2. **Lint** - ESLint checks
3. **Test** - Vitest unit and integration tests
4. **Build** - Production build verification

### Requirements
All jobs must pass before merging to staging or main.

### Deploy Previews
- PRs automatically get deploy previews via Netlify
- Test your changes in a production-like environment
- Preview URL appears in PR comments

## 🌲 Branch Strategy

```
main (production)
  ↑
staging (pre-production)
  ↑
feature/* (development branches)
```

### Branch Rules
- `main` - Protected, production code only
- `staging` - Protected, tested features ready for production
- Feature branches - Active development

### Workflow
1. Create feature branch from `staging`
2. Develop and test
3. PR to `staging`
4. Test in staging environment
5. PR from `staging` to `main` (weekly releases)

## ❓ Getting Help

### Where to Ask
- **General Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Security Issues**: security@hiddenkey.io
- **Feature Requests**: GitHub Issues

### Response Times
- Critical bugs: 24 hours
- General issues: 2-3 days
- Feature requests: Weekly review

## 📊 Metrics & Goals

### Quality Metrics
- Test coverage: 80%+
- Build time: <5s
- Lint errors: 0
- Security vulnerabilities: 0 critical/high

### Performance Metrics
- First contentful paint: <1.5s
- Time to interactive: <3s
- API response time: <200ms (p95)

## 🎉 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Monthly team updates

Significant contributions may earn:
- Commit access
- Code review privileges
- Design decision input

## 📄 License

This project is proprietary. By contributing, you agree that your contributions will be licensed under the same terms.

## 🙏 Thank You

Thank you for contributing to Hidden Key Investments! Your work helps us build a platform that transforms how Elite investors find and execute deals.

Questions? Open a GitHub Discussion or issue!

---

**Last Updated**: 2025-10-27  
**Version**: 1.0.0
