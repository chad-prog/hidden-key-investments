# Environment Setup Guide

This guide covers setting up environment variables for local development, staging, and production environments.

## Table of Contents

1. [Overview](#overview)
2. [Local Development](#local-development)
3. [Netlify Environment Setup](#netlify-environment-setup)
4. [GitHub Secrets for CI/CD](#github-secrets-for-cicd)
5. [Environment-Specific Configuration](#environment-specific-configuration)
6. [Validation](#validation)

---

## Overview

The platform uses environment variables for configuration across different environments:

- **Local Development**: `.env.local` file (git-ignored)
- **Staging/Production**: Netlify environment variables
- **CI/CD**: GitHub Secrets

### Security Principles

✅ **DO**:
- Use `.env.local` for local development (git-ignored)
- Store production secrets in Netlify environment variables
- Use GitHub Secrets for CI/CD sensitive data
- Prefix client-side variables with `VITE_`

❌ **DON'T**:
- Commit `.env` files with real keys
- Use `VITE_` prefix for server-side secrets
- Share API keys in code or documentation

---

## Local Development

### Step 1: Create Local Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your local API keys
nano .env.local  # or use your preferred editor
```

### Step 2: Configure Required Variables

**Minimum for demo mode** (no API keys needed):
```bash
VITE_DEMO_MODE=true
VITE_APP_VERSION=1.0.0
```

**Full local development setup**:
```bash
# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_APP_VERSION=1.0.0

# Email Marketing
# Note: Client-side uses VITE_ prefix, server-side functions use without prefix
VITE_MAILCHIMP_API_KEY=your_mailchimp_api_key
VITE_MAILCHIMP_SERVER_PREFIX=us1
VITE_MAILCHIMP_AUDIENCE_ACCREDITED=your_audience_id
VITE_MAILCHIMP_AUDIENCE_FIRST_TIME=your_audience_id
VITE_MAILCHIMP_AUDIENCE_PASSIVE=your_audience_id
VITE_MAILCHIMP_AUDIENCE_TEXAS=your_audience_id
VITE_MAILCHIMP_AUDIENCE_GENERAL=your_audience_id

# Data Management
VITE_AIRTABLE_API_KEY=your_airtable_api_key
VITE_AIRTABLE_BASE_INVESTOR_LEADS=your_base_id
VITE_AIRTABLE_BASE_INVESTOR_INTERACTIONS=your_base_id
VITE_AIRTABLE_BASE_PROPERTY_TRACKER=your_base_id

# Database (Server-side only)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Run Local Development Server

```bash
npm run dev
```

The application will run in demo mode if API keys are not configured.

---

## Netlify Environment Setup

### Step 1: Access Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Navigate to **Site settings** → **Environment variables**

### Step 2: Configure Production Variables

Add these variables for production:

#### Critical Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `CONTEXT` | Netlify context | Set automatically |

#### Error Tracking (Recommended)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SENTRY_DSN` | Sentry error tracking | [sentry.io](https://sentry.io) → Project Settings → Client Keys |

#### Database (Required for full functionality)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SUPABASE_URL` | Database URL | [supabase.com](https://supabase.com) → Project Settings → API |
| `SUPABASE_ANON_KEY` | Public anon key | [supabase.com](https://supabase.com) → Project Settings → API |

#### Email Marketing (Optional)

**Note**: Server-side functions use variables without `VITE_` prefix.

| Variable (Server-side) | Description | Where to get it |
|----------|-------------|-----------------|
| `MAILCHIMP_API_KEY` | Mailchimp API key | Mailchimp → Account → Extras → API Keys |
| `MAILCHIMP_SERVER_PREFIX` | Server prefix (e.g., us1) | From your API key |
| `MAILCHIMP_AUDIENCE_ID` | List/Audience ID | Mailchimp → Audience → Settings |

For client-side usage, also set:
- `VITE_MAILCHIMP_API_KEY`
- `VITE_MAILCHIMP_SERVER_PREFIX`
- `VITE_MAILCHIMP_AUDIENCE_*` (various audience IDs)

#### Data Sync (Optional)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `AIRTABLE_API_KEY` | Airtable API key | Airtable → Account → API |
| `AIRTABLE_BASE_ID` | Base ID | Airtable → Base → Help → API documentation |

### Step 3: Configure Staging Variables

For staging environment (separate branch):

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** → **Add scoped variable**
3. Select **Branch: staging** (or your staging branch name)
4. Add variables specific to staging (e.g., test API keys)

---

## GitHub Secrets for CI/CD

### Required Secrets

Add these in GitHub repository settings → **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `CODECOV_TOKEN` | Upload test coverage | No |
| `SENTRY_AUTH_TOKEN` | Deploy source maps to Sentry | No |
| `NETLIFY_AUTH_TOKEN` | Trigger Netlify deployments | No |

### Optional Secrets for Enhanced CI/CD

| Secret Name | Purpose |
|-------------|---------|
| `GITLEAKS_LICENSE` | Enhanced secret scanning |
| `NPM_TOKEN` | Private npm packages |

### How to Add GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add name and value
5. Click **Add secret**

---

## Environment-Specific Configuration

The platform automatically adapts configuration based on the environment:

### Production Context (`main` branch)

```toml
[context.production]
  environment = { NODE_ENV = "production" }
```

- Full functionality
- Production API keys
- Error tracking enabled
- Performance monitoring enabled

### Staging Context (`staging` branch)

```toml
[context.staging]
  environment = { NODE_ENV = "staging" }
```

- Test with staging API keys
- Separate database/services
- Full error tracking
- Safe for testing

### Branch Deploy Context (feature branches)

```toml
[context.branch-deploy]
  environment = { NODE_ENV = "development" }
```

- Auto-deploy for every branch
- Development configuration
- Quick preview for features

### Deploy Preview Context (pull requests)

```toml
[context.deploy-preview]
  environment = { NODE_ENV = "preview" }
```

- Auto-deploy for every PR
- Preview functionality
- Safe for testing before merge

---

## Validation

### Local Environment Validation

Run the validation script:

```bash
bash scripts/validate-env.sh
```

Expected output:
```
✅ Local environment configured correctly
✅ All required variables present
✅ Demo mode ready
```

### Production Environment Validation

After deploying, check the health endpoint:

```bash
curl https://your-site.netlify.app/.netlify/functions/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T...",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "healthy", ... },
    "mailchimp": { "status": "healthy", ... },
    ...
  }
}
```

### CI/CD Validation

Check GitHub Actions:

1. Go to repository → **Actions** tab
2. Latest workflow run should show:
   - ✅ Security Scan
   - ✅ Lint
   - ✅ Test
   - ✅ Build

---

## Troubleshooting

### Issue: Tests fail locally but pass in CI

**Solution**: Ensure `.env.local` matches the expected test configuration or run tests with:
```bash
VITE_DEMO_MODE=true npm test
```

### Issue: Build fails due to missing environment variables

**Solution**: Check that all `VITE_` prefixed variables referenced in code are either:
1. Defined in `.env.local` (local)
2. Defined in Netlify (production)
3. Have default fallbacks in code

### Issue: Serverless functions can't access environment variables

**Solution**: Server-side variables (without `VITE_` prefix) must be set in:
1. Netlify environment variables (production)
2. `.env` file for local Netlify Dev (`netlify dev`)

### Issue: Demo mode not activating

**Solution**: Ensure `VITE_DEMO_MODE=true` is set, or that API keys are intentionally left as placeholder values.

---

## Quick Reference

### Variable Prefixes

| Prefix | Scope | Example |
|--------|-------|---------|
| `VITE_` | Client-side (public) | `VITE_APP_VERSION` |
| None | Server-side (private) | `SUPABASE_ANON_KEY` |

### Priority Order

1. Environment-specific variables (Netlify contexts)
2. Repository-wide variables
3. `.env.local` (local development)
4. `.env.example` (template only)

### Best Practices

✅ Use specific variable names (not generic)
✅ Document every variable in `.env.example`
✅ Use Netlify contexts for environment-specific config
✅ Validate environment on startup
✅ Provide fallbacks for optional variables
✅ Never log sensitive values

---

## Next Steps

1. ✅ Configure local `.env.local`
2. ✅ Set up Netlify environment variables
3. ✅ Add GitHub Secrets for CI/CD
4. ✅ Run validation scripts
5. ✅ Deploy and test health endpoint

See also:
- [STAGING-SETUP.md](STAGING-SETUP.md) - Staging environment setup
- [DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md) - Full deployment guide
- [README.md](../README.md) - Project overview
