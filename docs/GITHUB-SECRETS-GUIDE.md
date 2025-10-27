# GitHub Secrets & CI/CD Configuration Guide

## Overview

This guide explains how to configure GitHub Secrets for the CI/CD pipeline and manage secrets across different environments.

## GitHub Secrets Configuration

### Required Secrets for CI/CD

Navigate to your repository → **Settings** → **Secrets and variables** → **Actions**

#### 1. Code Coverage
```
CODECOV_TOKEN=<your-codecov-token>
```
**Purpose**: Upload test coverage reports to Codecov  
**How to get**: Sign up at https://codecov.io and link your repository

**Note**: This secret is optional. The CI pipeline will continue even if this is not set (fail_ci_if_error: false).

### Environment-Specific Secrets

For deployment previews and CI testing, you may need:

#### 2. Supabase (Optional for Integration Tests)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-key>
```
**Purpose**: Run integration tests against a test database  
**Best Practice**: Use a separate Supabase project for CI testing

#### 3. Netlify Deploy Hook (Optional)
```
NETLIFY_AUTH_TOKEN=<your-netlify-token>
NETLIFY_SITE_ID=<your-site-id>
```
**Purpose**: Trigger deployments from GitHub Actions  
**How to get**: Netlify Dashboard → User Settings → Applications → Personal Access Tokens

## Secret Management Best Practices

### 1. Separation of Environments

| Environment | Secret Storage | Purpose |
|-------------|---------------|---------|
| **Local Dev** | `.env` file (gitignored) | Developer machine |
| **CI/CD** | GitHub Secrets | Automated testing |
| **Staging** | Netlify Environment Variables | Staging deployment |
| **Production** | Netlify Environment Variables | Production deployment |

### 2. Secret Rotation Schedule

- **Quarterly**: Rotate all API keys and tokens
- **Immediately**: Rotate if suspected compromise
- **After Team Changes**: When developers leave

### 3. Access Control

- Limit who can view/edit GitHub Secrets (repository admins only)
- Use environment-specific secrets when possible
- Audit secret access regularly

### 4. Secret Scanning

The repository has GitHub's secret scanning enabled. If you accidentally commit a secret:

1. **Immediately rotate** the compromised secret
2. Remove from Git history:
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (⚠️ coordinate with team)
4. Update secret in all environments

## GitHub Actions Configuration

### Current CI/CD Workflow

Located at `.github/workflows/ci.yml`

#### Jobs

1. **security-scan** - Trivy vulnerability scanning
2. **lint** - ESLint code quality checks
3. **test** - Vitest unit and function tests with coverage
4. **build** - Vite production build
5. **deploy-preview** - Comment on PRs with deployment info

#### Environment Variables in CI

```yaml
env:
  NODE_VERSION: '22'
```

#### Permissions

The workflow uses minimal permissions for security:
- `contents: read` - Most jobs
- `security-events: write` - Security scanning
- `pull-requests: write` - PR comments

### Using Secrets in GitHub Actions

```yaml
- name: Example secret usage
  run: |
    echo "Using secret..."
  env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
```

**Never**: Log secrets or expose them in outputs

## CI/CD Triggers

### Automatic Triggers

- **Push to `main`** → Full CI + Production deploy (via Netlify)
- **Push to `staging`** → Full CI + Staging deploy (via Netlify)
- **Pull Request** → Full CI + Deploy preview (via Netlify)

### Manual Triggers

Currently not configured. To add:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

## Adding New Secrets

### Step 1: Identify Secret Type

- **Client-side?** → Use `VITE_` prefix, add to Netlify ENV
- **Server-side?** → No `VITE_` prefix, add to Netlify ENV
- **CI/CD only?** → Add to GitHub Secrets

### Step 2: Document

Add to:
- `.env.example` (with placeholder)
- `docs/ENVIRONMENT-VARIABLES.md`
- This document (if for CI/CD)

### Step 3: Configure

1. **GitHub Secrets**:
   - Repository Settings → Secrets → New repository secret
   - Name: `SECRET_NAME`
   - Value: `actual-secret-value`

2. **Netlify Environment Variables**:
   - Site Settings → Environment variables → Add variable
   - Scope: Production/Staging/All
   - Visibility: Sensitive (recommended for secrets)

3. **Update CI Workflow** (if needed):
   ```yaml
   env:
     NEW_SECRET: ${{ secrets.NEW_SECRET }}
   ```

## Troubleshooting

### CI Failing Due to Missing Secret

**Symptom**: GitHub Actions workflow fails with "secret not found"

**Solution**:
1. Check if secret is added to GitHub Secrets
2. Verify secret name matches exactly (case-sensitive)
3. Ensure secret is accessible to the repository

### Netlify Build Failing

**Symptom**: Netlify deployment fails with missing environment variable

**Solution**:
1. Check Netlify Site Settings → Environment variables
2. Ensure variable is in correct scope (Production/Staging/All)
3. Check if variable name has `VITE_` prefix if needed in client code

### Demo Mode Activating Unexpectedly

**Symptom**: Application runs in demo mode even with secrets configured

**Solution**:
1. Check environment variable names match exactly
2. Verify no placeholder values (e.g., "your_key_here")
3. Check browser console for environment validation warnings
4. For Netlify: Ensure rebuild was triggered after adding variables

## Secret Rotation Checklist

Use this checklist when rotating secrets:

- [ ] Generate new secret/API key from service provider
- [ ] Update in local `.env` file (for testing)
- [ ] Test locally that everything works
- [ ] Update in GitHub Secrets (if applicable)
- [ ] Update in Netlify Environment Variables (Production)
- [ ] Update in Netlify Environment Variables (Staging)
- [ ] Trigger redeployment on Netlify
- [ ] Verify production/staging still works
- [ ] Revoke/delete old secret from service provider
- [ ] Document rotation in security log
- [ ] Notify team of rotation

## Security Incident Response

If a secret is compromised:

1. **Immediately**: Revoke the compromised secret at the service provider
2. **Generate**: Create a new secret
3. **Update**: All environments with new secret
4. **Investigate**: How the secret was exposed
5. **Prevent**: Implement controls to prevent recurrence
6. **Document**: Incident in security log

## Additional Resources

- [GitHub Encrypted Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Support

For questions about secrets management:
- Check existing documentation first
- Create a GitHub Issue for questions
- For security concerns: Email security@hiddenkey.io (if configured)

---

**Last Updated**: 2025-10-27  
**Version**: 1.0  
**Owner**: DevOps/Security Team
