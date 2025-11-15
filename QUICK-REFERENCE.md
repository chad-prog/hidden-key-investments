# ⚡ Quick Reference - Common Commands & Tasks

**Last Updated**: 2025-10-27  
**Purpose**: Fast reference for daily development tasks

---

## 🚀 Getting Started

```bash
# First time setup
npm install
npm run dev                # Start dev server (http://localhost:3000)

# Check platform health
bash scripts/check-platform-status.sh

# Read these guides first
cat START-HERE.md          # Primary guide - start here!
cat NEXT-STEPS-GUIDE.md   # What to do next
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev                # Vite dev server on port 5173

# Run tests
npm test                   # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test:functions     # Run function tests only

# Linting
npm run lint               # Check for linting errors
npm run lint:fix           # Auto-fix linting errors

# Building
npm run build              # Production build (output to dist/)
npm run preview            # Preview production build locally

# Quality checks (all at once)
bash scripts/dev-utils.sh check-all    # Lint, test, build
bash scripts/dev-utils.sh pre-commit   # Pre-commit checks
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/__tests__/testFixtures.test.ts

# Run tests matching pattern
npm test -- --grep "Lead"

# Run with coverage
npm run test:coverage

# View coverage report
open coverage/index.html   # macOS
xdg-open coverage/index.html   # Linux
```

---

## 🏗️ Building & Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Check build size
du -sh dist/

# Deploy (if using Netlify CLI)
netlify deploy --prod

# Or just push to trigger auto-deploy
git push origin main       # Production
git push origin staging    # Staging
```

---

## 📦 Dependencies

```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install as dev dependency
npm install -D <package-name>

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Security audit
npm audit
npm audit fix              # Auto-fix vulnerabilities
```

---

## 🔍 Debugging

```bash
# Check environment
node -v                    # Node version (should be >= 18)
npm -v                     # npm version

# Check what's running
lsof -i :5173              # Check what's on dev port
ps aux | grep node         # Find Node processes

# Clean builds
rm -rf node_modules dist .vite
npm install
npm run build

# Check logs
tail -f /tmp/build-test.log
tail -f /tmp/test.log
```

---

## 🌐 API Testing

```bash
# Health check
curl https://your-site.netlify.app/.netlify/functions/health | jq

# Create a lead
curl -X POST https://your-site.netlify.app/.netlify/functions/lead-ingest-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "source": "website",
    "contact": {
      "email": "test@example.com",
      "phone": "+1234567890"
    },
    "property": {
      "address": "123 Main St",
      "city": "Austin",
      "state": "TX"
    }
  }' | jq

# Test webhook
curl -X POST https://your-site.netlify.app/.netlify/functions/webhook-inbound \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX"
  }' | jq
```

---

## 🗄️ Database

```bash
# Connect to Supabase (if configured)
psql "your-connection-string"

# Run schema setup
psql "your-connection-string" -f supabase-sql/01-setup.sql

# Check tables
psql "your-connection-string" -c "\dt"

# Query leads
psql "your-connection-string" -c "SELECT * FROM leads LIMIT 10;"
```

---

## 🔐 Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit environment variables
nano .env                  # or vim, code, etc.

# For Netlify deployment, add via:
# 1. Netlify UI: Site Settings → Environment Variables
# 2. Or CLI: netlify env:set VAR_NAME value

# Common variables:
VITE_DEMO_MODE=true                    # Enable demo mode
VITE_SENTRY_DSN=your-sentry-dsn       # Sentry error tracking
SUPABASE_URL=your-supabase-url        # Database connection
SUPABASE_KEY=your-supabase-key        # Database key
```

---

## 🔀 Git Workflows

```bash
# Start new feature
git checkout -b feature/my-feature
git push -u origin feature/my-feature

# Commit changes
git add .
git commit -m "Description of changes"
git push

# Update from main
git checkout main
git pull
git checkout feature/my-feature
git merge main

# Create PR (if using GitHub CLI)
gh pr create --title "My Feature" --body "Description"

# Sync with remote (if behind)
git stash                  # Save local changes
git pull                   # Get latest
git stash pop              # Restore changes
```

---

## 📊 Performance & Monitoring

```bash
# Build size analysis
npm run build
ls -lh dist/assets/

# Test performance
npm run build
npm run preview
# Then use Lighthouse in Chrome DevTools

# Monitor production (if Sentry configured)
# Visit: https://sentry.io/organizations/your-org/
```

---

## 🐛 Common Issues & Fixes

### Build fails
```bash
rm -rf node_modules dist .vite
npm install
npm run build
```

### Tests fail
```bash
# Clear cache
rm -rf node_modules/.vite
npm test
```

### Port already in use
```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Dependencies out of sync
```bash
rm -rf node_modules package-lock.json
npm install
```

### Git merge conflicts
```bash
# Option 1: Keep your changes
git stash
git pull
git stash pop
# Resolve conflicts, then:
git add .
git commit -m "Resolved merge conflicts"

# Option 2: Accept remote version
git pull --strategy-option theirs
```

---

## 📁 Important File Locations

```bash
# Source code
src/                       # Main application code
src/components/            # React components
src/pages/                 # Page components
src/lib/                   # Libraries and utilities

# Serverless functions
netlify/functions/         # Backend API functions
netlify/functions/__tests__/  # Function tests

# Configuration
package.json               # Dependencies and scripts
vite.config.ts            # Vite build configuration
vitest.config.ts          # Test configuration
eslint.config.js          # Linting rules
netlify.toml              # Netlify deployment config

# Documentation
START-HERE.md             # Start here!
NEXT-STEPS-GUIDE.md       # What to do next
README.md                 # Project overview
docs/                     # Additional documentation

# Database
supabase-sql/             # Database schemas

# Scripts
scripts/                  # Utility scripts
```

---

## 🎯 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Dev server won't start | `lsof -ti:5173 \| xargs kill -9` then `npm run dev` |
| Tests failing | `rm -rf node_modules/.vite && npm test` |
| Build errors | `rm -rf dist && npm run build` |
| Dependency issues | `rm -rf node_modules && npm install` |
| Git conflicts | `git stash && git pull && git stash pop` |
| Can't deploy | Check netlify.toml and environment variables |
| Functions not working | Check netlify/functions/ and function tests |
| Database errors | Verify SUPABASE_URL and SUPABASE_KEY |

---

## 🚀 Fastest Path to Results

```bash
# 1. Verify everything works (5 min)
bash scripts/check-platform-status.sh

# 2. Start development (1 min)
npm run dev

# 3. Make a change (varies)
# Edit files in src/

# 4. Test your change (2 min)
npm test
npm run lint

# 5. Build and verify (2 min)
npm run build

# 6. Commit and deploy (2 min)
git add .
git commit -m "Your change description"
git push origin main      # Auto-deploys if Netlify connected
```

---

## 📚 Documentation Quick Links

| Guide | Purpose | Time |
|-------|---------|------|
| **START-HERE.md** | First-time setup & overview | 5 min read |
| **NEXT-STEPS-GUIDE.md** | What to build next | 10 min read |
| **QUICK-ACTIONS.md** | Code examples & tasks | Reference |
| **IMPLEMENTATION-ROADMAP.md** | Complete roadmap | 15 min read |
| **docs/QUICK-START.md** | Development setup | 5 min |
| **docs/TESTING-GUIDE.md** | Testing practices | 10 min |
| **docs/WEBHOOK-INTEGRATION.md** | API integration | 10 min |

---

## 💡 Pro Tips

```bash
# Watch tests while developing
npm run test:watch

# Lint before committing
npm run lint:fix && git add .

# Quick quality check
bash scripts/dev-utils.sh check-all

# Preview production build locally
npm run build && npm run preview

# Check platform health anytime
bash scripts/check-platform-status.sh

# Use demo mode for development
# Add to .env: VITE_DEMO_MODE=true
```

---

## 🎉 You're Ready!

**Most Common Commands**:
1. `npm run dev` - Start developing
2. `npm test` - Run tests
3. `npm run build` - Build for production
4. `bash scripts/check-platform-status.sh` - Check health

**Need More Help?**
- See START-HERE.md for detailed guidance
- See NEXT-STEPS-GUIDE.md for what to build next
- See docs/ folder for specific topics

---

**Last Updated**: 2025-10-27  
**Keep this handy**: Bookmark or print this reference!
