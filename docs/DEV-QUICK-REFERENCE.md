# Developer Quick Reference

Quick reference for common development tasks and commands.

## 🚀 Quick Start

```bash
# First time setup
npm install
bash scripts/dev-utils.sh setup-env
npm run dev

# Open http://localhost:5173
```

## 📋 Daily Development Commands

```bash
# Start development server
npm run dev                       # Frontend at http://localhost:5173

# Run tests
npm test                          # Main tests (watch mode: npm run test:watch)
npm run test:functions            # Function tests
bash scripts/dev-utils.sh test-all  # All tests

# Quality checks
npm run lint                      # Check code style
npm run lint:fix                  # Auto-fix issues
npm run build                     # Production build
bash scripts/dev-utils.sh check-all  # Full quality check
```

## 🧪 Testing

```bash
# Run all tests
npm test                          # 19 main tests
npm run test:functions            # 53 function tests

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage
open coverage/index.html

# Run specific test
npx vitest run path/to/test.ts
```

## 🛠️ Utility Scripts

```bash
# Pre-commit checks (recommended before every commit)
bash scripts/dev-utils.sh pre-commit

# Run all quality checks
bash scripts/dev-utils.sh check-all

# Clean build artifacts
bash scripts/dev-utils.sh clean

# Check for outdated dependencies
bash scripts/dev-utils.sh check-deps

# Set up environment files
bash scripts/dev-utils.sh setup-env

# Show help
bash scripts/dev-utils.sh help
```

## 📦 Git Workflow

```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
bash scripts/dev-utils.sh pre-commit  # Run checks
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
# Create PR to staging branch on GitHub
```

## 🌐 Environment Setup

### Local Development (.env.local)

```bash
# Copy from example
cp .env.local.example .env.local

# Required for full functionality
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional (demo mode works without these)
VITE_MAILCHIMP_API_KEY=your_key
VITE_AIRTABLE_API_KEY=your_key
```

### Demo Mode

Works automatically without any API keys! 🎉

## 📚 Key Files & Directories

```
src/
├── pages/                # Page components
├── components/           # Reusable components
│   └── ui/              # shadcn/ui components
├── lib/                 # Core libraries
│   ├── schemas/         # Zod validation schemas
│   ├── testFixtures.ts  # Mock data for testing
│   └── workflowEngine.ts # Automation engine
└── utils/               # Utility functions

netlify/functions/       # Serverless functions
├── lead-ingest-enhanced.js
├── investor.js
├── opportunity.js
└── __tests__/          # Function tests

docs/                    # Documentation
├── QUICK-START.md
├── TESTING-GUIDE.md
├── PHASE-2-CHECKLIST.md
└── ...

scripts/                 # Automation scripts
└── dev-utils.sh        # Developer utilities
```

## 🔍 Common Tasks

### Add a New Component

```bash
# Create component file
touch src/components/MyComponent.tsx

# Create test file
touch src/components/__tests__/MyComponent.test.tsx

# Import in your page
import MyComponent from '@/components/MyComponent'
```

### Add a New Serverless Function

```bash
# Create function file
touch netlify/functions/my-function.js

# Create test file
touch netlify/functions/__tests__/my-function.test.js

# Add to vitest config
# Edit: netlify/functions/vitest.config.js
# Add: '__tests__/my-function.test.js' to include array

# Test it
npm run test:functions
```

### Add a New Page

```bash
# Create page component
touch src/pages/MyPage.tsx

# Add route in App.tsx or router config

# Create test
touch src/pages/__tests__/MyPage.test.tsx
```

## 🐛 Debugging

### Check Logs

```bash
# Development server logs
npm run dev  # Check terminal output

# Test output
npm test -- --reporter=verbose

# Build logs
npm run build
```

### Common Issues

**Tests fail**: Check node version matches `.nvmrc`
```bash
node --version  # Should be v22.x
```

**Build fails**: Clear cache and reinstall
```bash
bash scripts/dev-utils.sh clean
npm install
```

**Linting errors**: Auto-fix most issues
```bash
npm run lint:fix
```

**Type errors**: Check TypeScript
```bash
npx tsc --noEmit
```

## 📊 Quality Standards

### Before Committing

- [ ] Tests pass: `npm test`
- [ ] Functions tests pass: `npm run test:functions`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No secrets in code
- [ ] Pre-commit checks pass: `bash scripts/dev-utils.sh pre-commit`

### Code Style

```typescript
// Use TypeScript for new files
export function myFunction(param: string): boolean {
  // Early returns for error cases
  if (!param) return false;
  
  // Clear, descriptive names
  const isValid = validateParam(param);
  
  return isValid;
}

// Use Zod for validation
import { z } from 'zod';
const MySchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});
```

### Test Coverage Goals

- Functions: 80%
- Utilities: 80%
- Components: 70%
- Pages: 60%

## 🚢 Deployment

### Staging

```bash
# Merge to staging branch
git checkout staging
git merge feature/your-feature
git push origin staging

# Netlify auto-deploys staging branch
# Check: https://staging.yoursite.com
```

### Production

```bash
# After staging approval, merge to main
git checkout main
git merge staging
git push origin main

# Netlify auto-deploys main branch
# Check: https://yoursite.com
```

## 📖 Documentation

- [Quick Start](docs/QUICK-START.md) - Get started in 5 minutes
- [Testing Guide](docs/TESTING-GUIDE.md) - Testing practices
- [Architecture](docs/ARCHITECTURE.md) - System design
- [API Reference](docs/API-REFERENCE.md) - API endpoints
- [Contributing](CONTRIBUTING.md) - Contribution guide
- [Phase 2 Checklist](docs/PHASE-2-CHECKLIST.md) - Next development phase

## 🆘 Getting Help

1. Check documentation in `/docs`
2. Search existing GitHub issues
3. Ask in team chat/Slack
4. Create GitHub issue with details
5. Tag with appropriate labels

## 🔗 Useful Links

- **Repository**: https://github.com/chad-prog/hidden-key-investments
- **Staging**: https://staging.yoursite.com (if configured)
- **Production**: https://yoursite.com (if configured)
- **CI/CD**: GitHub Actions tab
- **Documentation**: `/docs` folder

---

**Keep this reference handy for daily development!** 🚀

For more details, see:
- Full guide: `docs/QUICK-START.md`
- Testing: `docs/TESTING-GUIDE.md`
- Contributing: `CONTRIBUTING.md`
