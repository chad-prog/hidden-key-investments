# Secret and Environment Variable Management Guide

**Last Updated:** November 2, 2025  
**Purpose:** Comprehensive guide for managing secrets and environment variables across development, staging, and production environments.

---

## 🎯 Overview

This guide covers how to securely manage API keys, database credentials, and other sensitive configuration across all environments of the Hidden Key Investments platform.

## 📋 Environment Hierarchy

```
Development (Local) → Staging (Netlify Preview) → Production (Netlify)
        ↓                      ↓                         ↓
   .env.local          Netlify Deploy Preview    Netlify Production
                        Environment Variables     Environment Variables
```

## 🔐 Secret Categories

### 1. Database Secrets (Required)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only)

### 2. Communication Services (Optional - Demo mode available)
- `MAILCHIMP_API_KEY` - Mailchimp API key
- `MAILCHIMP_AUDIENCE_ID` - Mailchimp audience/list ID
- `MAILCHIMP_SERVER_PREFIX` - Mailchimp server prefix (e.g., us1)

### 3. Integration Services (Optional - Demo mode available)
- `AIRTABLE_API_KEY` - Airtable personal access token
- `AIRTABLE_BASE_ID` - Airtable base identifier
- `AIRTABLE_TABLE_NAME` - Default table name

### 4. Monitoring & Observability (Optional but recommended)
- `VITE_SENTRY_DSN` - Sentry Data Source Name
- `SENTRY_AUTH_TOKEN` - Sentry authentication token (CI/CD only)

### 5. Feature Flags (Optional)
- `VITE_ENABLE_ML_SCORING` - Enable ML scoring features (true/false)
- `VITE_ENABLE_AI_ORCHESTRATION` - Enable AI assistant features (true/false)

---

## 🛠️ Setup Instructions

### Local Development

1. **Copy example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your credentials:**
   ```bash
   # Required for production features
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Optional - Leave blank for demo mode
   MAILCHIMP_API_KEY=
   AIRTABLE_API_KEY=
   VITE_SENTRY_DSN=
   ```

3. **Never commit `.env.local` to git** (already in `.gitignore`)

### GitHub Actions (CI/CD)

Secrets are managed via GitHub Secrets and used in workflows.

#### Adding GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

**Required for testing:**
- None (tests run in demo mode)

**Optional for enhanced CI:**
- `SENTRY_AUTH_TOKEN` - For source map uploads
- `CODECOV_TOKEN` - For code coverage reports

#### Using Secrets in Workflows:

```yaml
- name: Build with Sentry
  run: npm run build
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

### Netlify Deployment

#### Production Environment (main branch):

1. **Navigate to Netlify dashboard** → Site settings → Environment variables
2. **Add variables** under "Production" scope:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (for serverless functions)
   MAILCHIMP_API_KEY = abc123...
   MAILCHIMP_AUDIENCE_ID = def456...
   AIRTABLE_API_KEY = key...
   VITE_SENTRY_DSN = https://...
   NODE_VERSION = 22
   ```

#### Staging Environment (staging branch):

1. **Add same variables** under "Deploy Preview" or "Branch deploy" scope
2. **Use separate Supabase project** for staging (recommended):
   ```
   VITE_SUPABASE_URL = https://your-staging-project.supabase.co
   VITE_SUPABASE_ANON_KEY = (staging key)
   ```

#### Branch Deploy Previews (PRs):

1. **Deploy previews inherit** "Deploy Preview" environment variables
2. **Can use production keys** OR separate test credentials
3. **Recommended:** Use staging environment for all previews

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use separate databases for development, staging, and production
- ✅ Rotate secrets regularly (at least every 90 days)
- ✅ Use service role keys only in backend/serverless functions
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use environment-specific Sentry projects
- ✅ Document which secrets are required vs. optional
- ✅ Use demo mode during development when possible

### ❌ DON'T:
- ❌ Commit secrets to git (ever!)
- ❌ Share secrets via email or chat
- ❌ Use production keys in development
- ❌ Hardcode API keys in source code
- ❌ Log sensitive values to console
- ❌ Expose backend-only keys to frontend

---

## 🔄 Secret Rotation Process

### When to Rotate:
- Every 90 days (scheduled)
- When team member leaves
- If secret is accidentally exposed
- After security incident

### Rotation Steps:

1. **Generate new secret** in the service (Supabase, Airtable, etc.)
2. **Update in all environments** simultaneously:
   - Local: Update `.env.local`
   - GitHub: Update GitHub Secrets
   - Netlify: Update Environment Variables
3. **Deploy to staging** and test
4. **Deploy to production**
5. **Revoke old secret** after 24-48 hours
6. **Document rotation** in security log

### Automated Rotation Script:

```bash
# Use provided script for guided rotation
bash scripts/rotate-secrets.sh
```

---

## 🧪 Testing Secret Configuration

### Validate Local Environment:
```bash
npm run dev
# Check console for "Demo mode" or "Production mode" messages
```

### Validate CI Environment:
```bash
# Push to feature branch and check GitHub Actions logs
git push origin feature/test-secrets
```

### Validate Netlify Environment:
```bash
# Deploy to staging branch
git push origin staging
# Check deploy logs for environment variable loading
```

---

## 📊 Environment Validation

The platform includes built-in environment validation:

```typescript
import { validateEnv, isDemoMode, getConfigStatus } from '@/lib/envValidation';

// Check environment status
const status = getConfigStatus();
console.log('Config status:', status);

// Determine if demo mode is active
if (isDemoMode()) {
  console.log('Running in DEMO MODE');
} else {
  console.log('Running in PRODUCTION MODE');
}
```

### Demo Mode Behavior:
- **Triggers when:** Required services (Supabase) are not configured
- **Benefits:**
  - Platform remains functional
  - No API calls to external services
  - Uses mock data for testing
  - Ideal for development and demos
- **Limitations:**
  - Data doesn't persist
  - No real API integrations
  - Mock data only

---

## 🚨 Secret Exposure Response

If a secret is accidentally exposed:

1. **Immediately revoke** the exposed secret in the service
2. **Generate new secret** and update all environments
3. **Search git history** for the secret:
   ```bash
   git log -S "exposed-secret" --all
   ```
4. **If found in history,** consider using git-filter-repo or BFG Repo-Cleaner
5. **Notify team** of the incident
6. **Document** in security incident log
7. **Review** how the exposure happened and update processes

---

## 📝 Environment Variable Reference

### Complete List by Service:

#### Supabase (Database)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Mailchimp (Email Marketing)
```bash
MAILCHIMP_API_KEY=abc123def456-us1
MAILCHIMP_AUDIENCE_ID=1234567890
MAILCHIMP_SERVER_PREFIX=us1
```

#### Airtable (CRM Sync)
```bash
AIRTABLE_API_KEY=keyABC123DEF456
AIRTABLE_BASE_ID=appXYZ789
AIRTABLE_TABLE_NAME=Investors
```

#### Sentry (Error Tracking)
```bash
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx (CI/CD only)
SENTRY_ORG=your-org
SENTRY_PROJECT=hidden-key-investments
```

#### Feature Flags
```bash
VITE_ENABLE_ML_SCORING=false
VITE_ENABLE_AI_ORCHESTRATION=false
VITE_ENABLE_LEGAL_DOCS=false
```

---

## 🔍 Troubleshooting

### Issue: "Running in DEMO MODE" warning
**Solution:** Add required Supabase environment variables

### Issue: Environment variables not loading in Netlify
**Solution:** 
1. Check variable scope (Production vs Deploy Preview)
2. Ensure no typos in variable names
3. Redeploy after adding variables
4. Check build logs for loading confirmation

### Issue: GitHub Actions failing due to missing secrets
**Solution:**
1. Add required secrets to GitHub repository
2. Update workflow to use secrets correctly
3. Ensure secret names match between GitHub and code

### Issue: Different behavior between local and production
**Solution:**
1. Compare environment variables between environments
2. Check for `NODE_ENV` differences
3. Verify all required secrets are set in production

---

## 📚 Related Documentation

- [Environment Variables Reference](docs/ENVIRONMENT-VARIABLES.md)
- [Staging Setup Guide](docs/STAGING-SETUP.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Security Best Practices](CONTRIBUTING.md#security)
- [Infrastructure Status](docs/CHECKLIST-INFRASTRUCTURE-COMPLETION.md)

---

## 🎯 Quick Commands

```bash
# Check current environment status
npm run dev

# Validate environment configuration
node -e "console.log(process.env)" | grep VITE

# Test with demo mode (no secrets required)
npm run dev
# Navigate to app and verify "Demo Mode" indicators

# Rotate secrets (guided process)
bash scripts/rotate-secrets.sh

# Validate Netlify deployment
bash scripts/validate-staging.sh https://your-preview-url.netlify.app
```

---

**Need Help?** 
- Check [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for common commands
- Review [GETTING-STARTED.md](docs/GETTING-STARTED.md) for solutions
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
