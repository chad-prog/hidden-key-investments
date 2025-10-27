# Staging Environment Setup Guide

## Overview

This guide walks through setting up a staging environment for the Hidden Key Investments platform using Netlify's branch deploy previews and Supabase database branching.

## Prerequisites

- Netlify account with site connected to GitHub
- Supabase project created
- GitHub repository access

## 1. Netlify Staging Setup

### Enable Branch Deploys

1. Go to **Netlify Dashboard** → Your Site → **Site Settings**
2. Navigate to **Build & Deploy** → **Continuous Deployment**
3. Under **Branch Deploys**, select:
   - **Let me add individual branches**: Add `staging`, `develop`, `cleanup/*`
   - OR **All branches**: Deploy all branches automatically

### Configure Deploy Contexts

Create or update `netlify.toml`:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

# Production context
[context.production]
  environment = { NODE_ENV = "production" }

# Staging context (for staging branch)
[context.staging]
  environment = { NODE_ENV = "staging" }

# Branch deploy context (for all other branches)
[context.branch-deploy]
  environment = { NODE_ENV = "development" }

# Deploy Preview context (for PRs)
[context.deploy-preview]
  environment = { NODE_ENV = "preview" }
```

### Environment Variables for Staging

In Netlify Dashboard → **Site Settings** → **Environment Variables**:

1. **Set Scopes:**
   - Production: Production-only variables
   - Branch deploys: Staging-specific variables
   - Deploy Previews: PR preview variables

2. **Key Variables:**

```bash
# Production
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
SENDGRID_API_KEY=prod_sendgrid_key

# Staging (Branch Deploy scope)
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=staging_service_key
SENDGRID_API_KEY=staging_sendgrid_key

# Deploy Preview (optional - use demo mode)
# No API keys needed - will use demo mode
```

## 2. Supabase Staging Database

### Option A: Separate Staging Project (Recommended)

1. **Create New Supabase Project:**
   - Go to Supabase Dashboard
   - Create new project: `hidden-key-staging`
   - Use same region as production

2. **Run Setup Script:**
   ```bash
   # Get database URL from Supabase Dashboard
   psql "postgresql://postgres:[password]@[host]:5432/postgres" \
     -f supabase-sql/01-setup.sql
   ```

3. **Seed Test Data:**
   ```bash
   # Optional: Add test data for staging
   psql "postgresql://postgres:[password]@[host]:5432/postgres" \
     -f supabase-sql/02-seed-staging.sql
   ```

### Option B: Database Branching (Supabase Pro)

1. **Enable Branching:**
   - Requires Supabase Pro plan
   - Go to Supabase Dashboard → Database → Branching

2. **Create Branch:**
   ```bash
   supabase branches create staging
   ```

3. **Get Branch Connection String:**
   ```bash
   supabase branches get staging
   ```

## 3. GitHub Secrets Setup

Add secrets to GitHub repository:

1. Go to **GitHub Repository** → **Settings** → **Secrets and Variables** → **Actions**

2. **Add Repository Secrets:**

```bash
# Netlify
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id

# Supabase Production
SUPABASE_PROD_URL=https://your-prod.supabase.co
SUPABASE_PROD_SERVICE_KEY=prod_service_key

# Supabase Staging
SUPABASE_STAGING_URL=https://your-staging.supabase.co
SUPABASE_STAGING_SERVICE_KEY=staging_service_key

# Sentry (optional)
SENTRY_AUTH_TOKEN=your_sentry_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

## 4. CI/CD Configuration

Update `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, staging, cleanup/** ]
  pull_request:
    branches: [ main, staging ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: success()
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Netlify Preview
        uses: netlify/actions/cli@master
        with:
          args: deploy --build
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 5. Branch Strategy

```
main (production)
  ↓
staging (pre-production)
  ↓
feature/* (feature branches)
cleanup/* (cleanup branches)
```

**Workflow:**
1. Create feature branch from `staging`
2. PR to `staging` for testing
3. PR from `staging` to `main` for production

## 6. Testing Staging Environment

### Verify Deployment

1. **Check Branch Deploy:**
   - Go to Netlify Dashboard
   - Find deploy for your branch
   - Click on deploy URL

2. **Verify Environment:**
   ```bash
   # Check which environment variables are loaded
   curl https://staging--your-site.netlify.app/.netlify/functions/test
   ```

3. **Test Database Connection:**
   ```bash
   # Test lead ingestion
   curl -X POST \
     https://staging--your-site.netlify.app/.netlify/functions/lead-ingest-enhanced \
     -H "Content-Type: application/json" \
     -d '{
       "source": "staging_test",
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "property": {
         "address": "123 Test St",
         "city": "Austin",
         "state": "TX",
         "zip": "78701"
       }
     }'
   ```

### Smoke Tests

Create `scripts/smoke-test.sh`:

```bash
#!/bin/bash

STAGING_URL="https://staging--your-site.netlify.app"

echo "Running staging smoke tests..."

# Test 1: Health check
echo "1. Testing health check..."
curl -f "$STAGING_URL/.netlify/functions/test" || exit 1

# Test 2: Lead ingestion
echo "2. Testing lead ingestion..."
curl -X POST -f "$STAGING_URL/.netlify/functions/lead-ingest-enhanced" \
  -H "Content-Type: application/json" \
  -d '{"source":"smoke_test","email":"test@example.com"}' || exit 1

echo "✅ All smoke tests passed!"
```

## 7. Environment-Specific Configuration

### Feature Flags

Use feature flags to enable/disable features per environment:

```typescript
// In your code
import { featureFlags } from '@/lib/featureFlags';

// Enable ML scoring only in staging/production
if (featureFlags.isEnabled('mlScoring') && !isDemoMode()) {
  // Run ML scoring
}
```

### Environment Detection

```typescript
export function getEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('staging')) return 'staging';
  if (hostname.includes('netlify.app')) return 'preview';
  if (hostname === 'localhost') return 'development';
  return 'production';
}
```

## 8. Monitoring Staging

### Add Sentry Environment Tags

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: getEnvironment(),
  // ...other config
});
```

### Staging-Specific Alerts

In Sentry:
1. Create separate project for staging
2. Or use environment filters in alerts
3. Set different alert thresholds for staging

## 9. Data Management

### Refreshing Staging Data

```sql
-- Reset staging database (be careful!)
TRUNCATE leads, opportunities, investors, activities CASCADE;

-- Or copy production data (anonymize first!)
-- See docs/data-anonymization.md
```

### Test Data Seeds

Create `supabase-sql/02-seed-staging.sql`:

```sql
-- Insert test leads
INSERT INTO leads (source, first_name, last_name, email, property, status)
VALUES
  ('staging_test', 'Test', 'Lead1', 'lead1@staging.test', 
   '{"address": "123 Test St", "city": "Austin", "state": "TX"}', 'new'),
  ('staging_test', 'Test', 'Lead2', 'lead2@staging.test',
   '{"address": "456 Test Ave", "city": "Dallas", "state": "TX"}', 'contacted');
```

## 10. Troubleshooting

### Branch Deploy Not Triggering

1. Check branch deploy settings in Netlify
2. Verify branch name matches pattern
3. Check build logs for errors

### Environment Variables Not Loading

1. Verify scope (production vs branch deploys)
2. Check variable names match code
3. Redeploy after adding variables

### Database Connection Fails

1. Check Supabase URL and keys
2. Verify IP restrictions (if any)
3. Test connection with psql
4. Check function logs in Netlify

## Resources

- [Netlify Deploy Contexts](https://docs.netlify.com/configure-builds/deploy-contexts/)
- [Supabase Database Branching](https://supabase.com/docs/guides/platform/branching)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)

## Next Steps

- [ ] Create staging Supabase project
- [ ] Configure Netlify environment variables
- [ ] Enable branch deploys
- [ ] Test staging deployment
- [ ] Set up monitoring
- [ ] Document staging URLs
- [ ] Train team on staging workflow
