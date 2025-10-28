# GitHub Secrets Setup Guide

## Overview

This guide provides comprehensive instructions for setting up GitHub Secrets for your Hidden Key Investments platform. GitHub Secrets are encrypted environment variables used in GitHub Actions workflows for CI/CD.

## Required Secrets

### 1. Core Platform Secrets

#### CODECOV_TOKEN (Optional)
- **Purpose**: Upload test coverage reports to Codecov
- **How to Get**: 
  1. Sign up at https://codecov.io
  2. Link your GitHub repository
  3. Copy the upload token from repository settings
- **Required**: No (CI will continue without it)
- **Usage**: Code coverage tracking and reporting

#### GITLEAKS_LICENSE (Optional)
- **Purpose**: Enhanced secret scanning with Gitleaks Pro
- **How to Get**: 
  1. Visit https://gitleaks.io
  2. Purchase a license (optional, free tier available)
  3. Copy license key
- **Required**: No (free tier works without license)
- **Usage**: Secret scanning in CI/CD

### 2. Deployment Secrets

#### NETLIFY_AUTH_TOKEN
- **Purpose**: Deploy to Netlify from CI/CD
- **How to Get**:
  1. Log in to Netlify dashboard
  2. Go to User Settings → Applications → Personal Access Tokens
  3. Create new access token with deploy permissions
- **Required**: Yes (for automated deployments)
- **Usage**: Automated deployment to Netlify

#### NETLIFY_SITE_ID
- **Purpose**: Identify which Netlify site to deploy to
- **How to Get**:
  1. Open Netlify dashboard
  2. Select your site
  3. Go to Site Settings → General → Site Details
  4. Copy API ID
- **Required**: Yes (for automated deployments)
- **Usage**: Target site for deployments

### 3. Application Secrets (for Netlify Environment)

These should be set in **both** GitHub Secrets (for CI/CD testing) and Netlify Environment Variables (for runtime):

#### SUPABASE_URL
- **Purpose**: Database connection for serverless functions
- **How to Get**:
  1. Log in to Supabase dashboard
  2. Select your project
  3. Go to Settings → API
  4. Copy "Project URL"
- **Required**: Yes (for production)
- **Usage**: Database queries in serverless functions

#### SUPABASE_ANON_KEY
- **Purpose**: Public anonymous access key for Supabase
- **How to Get**:
  1. Supabase dashboard → Settings → API
  2. Copy "anon public" key
- **Required**: Yes (for production)
- **Usage**: Client-side database access (read-only operations)

#### SUPABASE_SERVICE_ROLE_KEY
- **Purpose**: Server-side database access with elevated permissions
- **How to Get**:
  1. Supabase dashboard → Settings → API
  2. Copy "service_role secret" key
  3. ⚠️ **NEVER expose this in client code**
- **Required**: Yes (for serverless functions)
- **Usage**: Server-side database operations

#### VITE_SENTRY_DSN
- **Purpose**: Error tracking and performance monitoring
- **How to Get**:
  1. Create account at https://sentry.io
  2. Create new project
  3. Copy DSN from project settings
- **Required**: No (but highly recommended)
- **Usage**: Error tracking in production

### 4. Optional Integration Secrets

#### MAILCHIMP_API_KEY
- **Purpose**: Email marketing automation
- **How to Get**:
  1. Log in to Mailchimp
  2. Account → Extras → API Keys
  3. Create new API key
- **Required**: No (platform works in demo mode)
- **Usage**: Email campaign management

#### AIRTABLE_API_KEY
- **Purpose**: External data synchronization
- **How to Get**:
  1. Log in to Airtable
  2. Account → Generate API key
- **Required**: No (platform works in demo mode)
- **Usage**: Data sync with Airtable bases

#### WEBHOOK_SECRET
- **Purpose**: Verify webhook authenticity
- **How to Generate**:
  ```bash
  openssl rand -hex 32
  ```
- **Required**: Recommended for production webhooks
- **Usage**: HMAC signature verification

---

## How to Add Secrets to GitHub

### Method 1: GitHub Web UI (Recommended)

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions" in left sidebar

2. **Add New Secret**
   - Click "New repository secret"
   - Enter secret name (e.g., `SUPABASE_URL`)
   - Enter secret value
   - Click "Add secret"

3. **Verify Secret**
   - Secret should appear in the list
   - Value is hidden after creation
   - Can be updated but not viewed

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Add a secret
gh secret set SUPABASE_URL --body "your-supabase-url"

# Add secret from file
gh secret set SUPABASE_SERVICE_ROLE_KEY < secret-file.txt

# Add secret interactively (will prompt for value)
gh secret set WEBHOOK_SECRET

# List all secrets (values not shown)
gh secret list
```

### Method 3: Automated Script

Create a script to set multiple secrets at once:

```bash
#!/bin/bash
# scripts/setup-github-secrets.sh

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not installed. Install from: https://cli.github.com/"
    exit 1
fi

# Authenticate if needed
gh auth status || gh auth login

echo "Setting up GitHub Secrets..."

# Core secrets
gh secret set CODECOV_TOKEN --body "${CODECOV_TOKEN}"
gh secret set NETLIFY_AUTH_TOKEN --body "${NETLIFY_AUTH_TOKEN}"
gh secret set NETLIFY_SITE_ID --body "${NETLIFY_SITE_ID}"

# Database secrets
gh secret set SUPABASE_URL --body "${SUPABASE_URL}"
gh secret set SUPABASE_ANON_KEY --body "${SUPABASE_ANON_KEY}"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "${SUPABASE_SERVICE_ROLE_KEY}"

# Monitoring
gh secret set VITE_SENTRY_DSN --body "${VITE_SENTRY_DSN}"

# Optional integrations
if [ -n "${MAILCHIMP_API_KEY}" ]; then
    gh secret set MAILCHIMP_API_KEY --body "${MAILCHIMP_API_KEY}"
fi

if [ -n "${AIRTABLE_API_KEY}" ]; then
    gh secret set AIRTABLE_API_KEY --body "${AIRTABLE_API_KEY}"
fi

# Generate and set webhook secret if not provided
if [ -z "${WEBHOOK_SECRET}" ]; then
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo "Generated webhook secret: ${WEBHOOK_SECRET}"
fi
gh secret set WEBHOOK_SECRET --body "${WEBHOOK_SECRET}"

echo "✅ GitHub Secrets configured successfully!"
```

Usage:
```bash
# Set environment variables first
export SUPABASE_URL="your-url"
export SUPABASE_ANON_KEY="your-key"
# ... set other variables

# Run script
bash scripts/setup-github-secrets.sh
```

---

## Setting Secrets in Netlify

### Method 1: Netlify Web UI

1. **Navigate to Site Settings**
   - Open Netlify dashboard
   - Select your site
   - Go to Site Settings → Environment Variables

2. **Add Variables**
   - Click "Add a variable"
   - Select scope (Production, Deploy Previews, Branch Deploys)
   - Enter key and value
   - Click "Create variable"

3. **Environment-Specific Variables**
   - Set different values for production vs staging
   - Use context-specific variables in netlify.toml

### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Authenticate
netlify login

# Link to your site
netlify link

# Set environment variable
netlify env:set SUPABASE_URL "your-value"

# Set multiple variables
netlify env:set SUPABASE_URL "url" SUPABASE_ANON_KEY "key"

# Import from .env file
netlify env:import .env.production

# List all environment variables
netlify env:list
```

### Method 3: netlify.toml Configuration

For **non-secret** environment variables only:

```toml
[build.environment]
  NODE_VERSION = "22"
  VITE_APP_VERSION = "1.0.0"

[context.production.environment]
  NODE_ENV = "production"

[context.staging.environment]
  NODE_ENV = "staging"
```

⚠️ **Never put secrets in netlify.toml** - it's committed to git!

---

## Secret Validation Script

Create a script to validate that all required secrets are set:

```bash
#!/bin/bash
# scripts/validate-secrets.sh

echo "🔍 Validating GitHub Secrets..."

REQUIRED_SECRETS=(
    "NETLIFY_AUTH_TOKEN"
    "NETLIFY_SITE_ID"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

OPTIONAL_SECRETS=(
    "CODECOV_TOKEN"
    "GITLEAKS_LICENSE"
    "VITE_SENTRY_DSN"
    "MAILCHIMP_API_KEY"
    "AIRTABLE_API_KEY"
    "WEBHOOK_SECRET"
)

MISSING=0

# Check required secrets
echo ""
echo "Required Secrets:"
for secret in "${REQUIRED_SECRETS[@]}"; do
    if gh secret list | grep -q "^${secret}"; then
        echo "  ✅ ${secret}"
    else
        echo "  ❌ ${secret} - MISSING"
        ((MISSING++))
    fi
done

# Check optional secrets
echo ""
echo "Optional Secrets:"
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if gh secret list | grep -q "^${secret}"; then
        echo "  ✅ ${secret}"
    else
        echo "  ⚠️  ${secret} - Not set (optional)"
    fi
done

echo ""
if [ $MISSING -eq 0 ]; then
    echo "✅ All required secrets are configured!"
    exit 0
else
    echo "❌ ${MISSING} required secret(s) missing!"
    echo ""
    echo "Add missing secrets with:"
    echo "  gh secret set SECRET_NAME --body 'value'"
    exit 1
fi
```

Usage:
```bash
bash scripts/validate-secrets.sh
```

---

## Security Best Practices

### 1. Secret Rotation Policy

Rotate secrets regularly:

- **API Keys**: Every 90 days
- **Database Credentials**: Every 180 days  
- **Webhook Secrets**: Every 90 days
- **Access Tokens**: Every 30 days

Create a rotation schedule and use the provided `scripts/rotate-secrets.sh`.

### 2. Access Control

- Limit who can view/modify secrets
- Use GitHub Teams for access management
- Enable 2FA for all team members
- Review secret access logs regularly

### 3. Secret Management

- Never commit secrets to git
- Use `.env.example` for documentation only
- Always use placeholder values in examples
- Scan for leaked secrets with Gitleaks

### 4. Monitoring

- Enable GitHub Advanced Security
- Set up alerts for secret exposure
- Monitor API usage for anomalies
- Review audit logs monthly

### 5. Development vs Production

- Use separate secrets for each environment
- Never use production secrets in development
- Test with demo mode before using real APIs
- Validate secrets before deployment

---

## Troubleshooting

### Secret Not Available in Workflow

**Problem**: Workflow can't access secret

**Solutions**:
1. Check secret name matches exactly (case-sensitive)
2. Verify secret is set in repository (not organization)
3. Check workflow permissions
4. Re-add secret if recently modified

### Secret Value Incorrect

**Problem**: Secret seems to have wrong value

**Solutions**:
1. Delete and re-add secret (can't view current value)
2. Check for trailing spaces or special characters
3. Verify correct base64 encoding if needed
4. Test secret value locally first

### Deployment Fails with Auth Error

**Problem**: Netlify deployment fails with authentication error

**Solutions**:
1. Verify NETLIFY_AUTH_TOKEN is valid
2. Check token permissions
3. Ensure NETLIFY_SITE_ID matches your site
4. Regenerate token if expired

### Webhook Signature Verification Fails

**Problem**: Webhook requests rejected

**Solutions**:
1. Verify WEBHOOK_SECRET matches sender configuration
2. Check HMAC algorithm (SHA-256)
3. Ensure secret is hex-encoded
4. Test signature generation locally

---

## Testing Secrets Locally

### Create .env.local for Testing

```bash
# .env.local (never commit this file!)

# Copy from GitHub Secrets for local testing
SUPABASE_URL=your-test-url
SUPABASE_ANON_KEY=your-test-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key

# Use test/sandbox accounts
MAILCHIMP_API_KEY=your-test-key
AIRTABLE_API_KEY=your-test-key

# Local development
NODE_ENV=development
```

### Load Secrets in Development

The platform automatically loads `.env.local` in development:

```bash
# Start development server
npm run dev

# Secrets from .env.local are available
```

### Test Secret Connectivity

```bash
# Test database connection
curl -X GET "https://your-project.supabase.co/rest/v1/leads" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Test webhook endpoint
curl -X POST "http://localhost:8888/.netlify/functions/webhook-inbound" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}'
```

---

## Quick Reference

### Common Commands

```bash
# GitHub Secrets
gh secret set SECRET_NAME             # Set secret
gh secret list                        # List all secrets
gh secret delete SECRET_NAME          # Delete secret

# Netlify Environment
netlify env:set KEY "value"           # Set variable
netlify env:list                      # List variables
netlify env:unset KEY                 # Delete variable

# Validation
bash scripts/validate-secrets.sh      # Check GitHub secrets
bash scripts/validate-env.sh          # Check environment variables
```

### Secret Name Conventions

- Use UPPER_SNAKE_CASE
- Prefix with service name (e.g., SUPABASE_URL)
- Add _KEY suffix for API keys
- Add _TOKEN suffix for access tokens
- Add _SECRET suffix for signing secrets

---

## Checklist

Use this checklist to ensure all secrets are properly configured:

### GitHub Secrets Setup
- [ ] NETLIFY_AUTH_TOKEN configured
- [ ] NETLIFY_SITE_ID configured
- [ ] SUPABASE_URL configured
- [ ] SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] VITE_SENTRY_DSN configured (optional)
- [ ] CODECOV_TOKEN configured (optional)
- [ ] WEBHOOK_SECRET generated and set

### Netlify Environment Variables
- [ ] All production secrets set in Netlify
- [ ] Staging environment configured separately
- [ ] Preview deploy variables configured
- [ ] Environment-specific overrides set

### Security Review
- [ ] All secrets use strong, unique values
- [ ] No secrets committed to git
- [ ] Secret rotation schedule created
- [ ] Access controls configured
- [ ] Monitoring alerts set up

### Testing
- [ ] Local development with .env.local works
- [ ] CI/CD pipeline passes with secrets
- [ ] Production deployment succeeds
- [ ] Webhook verification works
- [ ] Error tracking active

---

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Sentry DSN Configuration](https://docs.sentry.io/product/sentry-basics/dsn-explainer/)

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review validation script output
3. Consult documentation for each service
4. Test secrets locally before production
5. Contact service support if needed

**Remember**: Security is not optional. Protect your secrets!
