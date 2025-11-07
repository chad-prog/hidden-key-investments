# Go-Live Guardrails & Failsafes

This document consolidates all readiness checks, smoke tests, CI workflows, environment configuration, CORS handling, rollback procedures, and next steps for deploying the Hidden Key Investments platform safely to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Readiness Checklist](#readiness-checklist)
3. [Smoke Test Usage](#smoke-test-usage)
4. [CI/CD Workflows](#cicd-workflows)
5. [Environment Variables & Secrets](#environment-variables--secrets)
6. [CORS & Correlation ID Notes](#cors--correlation-id-notes)
7. [Rollback Procedures](#rollback-procedures)
8. [Next Steps](#next-steps)

---

## Overview

The guardrails and failsafes bundle provides automated smoke testing, deployment validation, and rollback capabilities for staging and production environments. This ensures that:

- **Smoke tests** validate critical API endpoints before and after deployments
- **Staging workflows** run smoke tests on PRs and pushes to staging branch
- **Production workflows** run smoke tests after deployment to main, with automatic rollback on failure
- **Manual rollback workflows** allow quick restoration of previous deployments
- **PR comments** provide immediate feedback on smoke test results

---

## Readiness Checklist

Before deploying to production, ensure the following are complete:

### Infrastructure
- [ ] Netlify sites created for staging and production
- [ ] Supabase project configured with investor schema
- [ ] Mautic instance accessible with API credentials
- [ ] DNS configured (if using custom domains)

### Secrets & Environment Variables
- [ ] All GitHub secrets configured (see [Environment Variables & Secrets](#environment-variables--secrets))
- [ ] Netlify environment variables set for both staging and production
- [ ] Secret rotation policy documented and calendar set

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Smoke tests passing locally
- [ ] Smoke tests passing in staging

### Documentation
- [ ] API documentation reviewed
- [ ] Deployment runbook reviewed
- [ ] Rollback procedures understood by team

### Monitoring
- [ ] Error tracking configured (Sentry or similar)
- [ ] Log aggregation set up
- [ ] Uptime monitoring configured
- [ ] Alert channels configured (Slack, email, etc.)

---

## Smoke Test Usage

The smoke test runner (`scripts/smoke-run.mjs`) validates critical API endpoints and workflows.

### Local Usage

```bash
# Set environment variables
export SMOKE_BASE=https://your-staging-site.netlify.app
export SMOKE_ORIGIN=https://your-frontend-origin.com
export MAUTIC_CAMPAIGN_INVESTOR_WELCOME=123  # Optional

# Run smoke tests
npm run smoke
```

### Available Scripts

```bash
# Basic smoke test (requires env vars)
npm run smoke

# Staging smoke test
npm run smoke:staging

# Production smoke test
npm run smoke:prod
```

### What the Smoke Test Does

1. **CORS Preflight Check**: Validates OPTIONS request to `/.netlify/functions/investor-onboard`
2. **Health Check**: POSTs ping to `/.netlify/functions/mautic-sync`
3. **Investor Onboarding**: POSTs test payload to investor-onboard endpoint with stable UUID
4. **Contact ID Extraction**: Captures contactId from response
5. **Campaign Addition** (if campaign ID provided): POSTs add_to_campaign to mautic-sync
6. **Exit Code**: Returns non-zero if any required step fails

### Smoke Test Output

The smoke test generates a `smoke.log` file with detailed results and timing information. In CI, this log is uploaded as an artifact and a summary is posted as a PR comment.

---

## CI/CD Workflows

### Staging Smoke Tests (`.github/workflows/smoke-staging.yml`)

**Triggers:**
- Pull requests to `staging` branch
- Pushes to `staging` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js 22
3. Install dependencies
4. Run smoke tests with staging environment variables
5. Upload smoke.log as artifact
6. Post/update PR comment with PASS/FAIL status and log tail
7. Write job summary

**Required Secrets:**
- `SMOKE_BASE_STAGING`
- `SMOKE_ORIGIN_STAGING`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`

### Production Smoke Tests (`.github/workflows/smoke-prod.yml`)

**Triggers:**
- Pushes to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Node.js 22
3. Install dependencies
4. Run smoke tests with production environment variables
5. Set commit status context `smoke/prod`
6. Upload smoke-prod-log as artifact
7. On failure with Netlify secrets present: Attempt to restore previous ready deploy

**Required Secrets:**
- `SMOKE_BASE_PROD`
- `SMOKE_ORIGIN_PROD`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`
- `NETLIFY_AUTH_TOKEN` (optional, for rollback)
- `NETLIFY_SITE_ID_PROD` (optional, for rollback)

### Manual Staging Rollback (`.github/workflows/rollback-staging.yml`)

**Triggers:**
- Manual workflow dispatch

**Inputs:**
- `deploy_id` (optional): Specific Netlify deploy ID to restore
- If not provided, restores the previous ready deploy

**Steps:**
1. Fetch Netlify deployments
2. Identify target deployment (specified or previous ready)
3. Restore the deployment
4. Announce to Slack if `SLACK_WEBHOOK_ALL_HANDS` is configured

**Required Secrets:**
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_STAGING`
- `SLACK_WEBHOOK_ALL_HANDS` (optional)

---

## Environment Variables & Secrets

### GitHub Secrets to Configure

#### Staging Environment
- `SMOKE_BASE_STAGING`: Base URL of staging site (e.g., `https://staging--site.netlify.app`)
- `SMOKE_ORIGIN_STAGING`: Frontend origin for CORS (e.g., `https://staging.example.com`)
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`: Mautic campaign ID for investor welcome

#### Production Environment
- `SMOKE_BASE_PROD`: Base URL of production site
- `SMOKE_ORIGIN_PROD`: Frontend origin for CORS
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`: Mautic campaign ID for investor welcome

#### Shared/General Secrets
- `MAUTIC_BASE_URL`: Mautic instance base URL
- `MAUTIC_CLIENT_ID`: OAuth2 client ID
- `MAUTIC_CLIENT_SECRET`: OAuth2 client secret
- `MAUTIC_WEBHOOK_SECRET`: Webhook verification secret
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

#### Optional Secrets (for Rollback)
- `NETLIFY_AUTH_TOKEN`: Personal access token for Netlify API
- `NETLIFY_SITE_ID_STAGING`: Netlify site ID for staging
- `NETLIFY_SITE_ID_PROD`: Netlify site ID for production
- `SLACK_WEBHOOK_ALL_HANDS`: Slack webhook URL for deployment announcements

#### Repository Variables
- `NETLIFY_SITE_NAME`: Netlify site name (if applicable)

### Local Development

Copy `.env.smoke.example` to `.env.smoke` and fill in your values:

```bash
cp .env.smoke.example .env.smoke
# Edit .env.smoke with your values
source .env.smoke
npm run smoke
```

---

## CORS & Correlation ID Notes

### CORS Preflight Handling

The smoke test begins with an OPTIONS request to validate CORS configuration. Your Netlify functions should return appropriate CORS headers:

```javascript
// Example CORS headers
const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
  'Access-Control-Max-Age': '86400'
};
```

### Correlation ID

The smoke test includes an `X-Correlation-ID` header in all requests for tracing and debugging. Your functions should:

1. Accept the correlation ID from the request
2. Include it in logs
3. Return it in the response headers
4. Pass it to downstream services (Mautic, Supabase)

This enables end-to-end request tracing across all services.

---

## Rollback Procedures

### Automatic Rollback (Production)

If the production smoke test fails and Netlify credentials are configured, the workflow automatically attempts to restore the previous ready deployment.

**Requirements:**
- `NETLIFY_AUTH_TOKEN` secret configured
- `NETLIFY_SITE_ID_PROD` secret configured
- Previous deployment exists and is in "ready" state

### Manual Rollback (Staging)

Use the manual rollback workflow to restore a previous staging deployment:

1. Go to Actions → Rollback Staging Deployment
2. Click "Run workflow"
3. (Optional) Enter specific `deploy_id` to restore
4. Click "Run workflow"

The workflow will:
- Fetch recent deployments
- Restore the target deployment
- Announce to Slack (if webhook configured)

### Manual Rollback (Production)

For production rollbacks:

1. **Via Netlify Dashboard:**
   - Go to Deploys
   - Find the previous successful deployment
   - Click "Publish deploy"

2. **Via Netlify CLI:**
   ```bash
   netlify deploy --prod --restore <deploy-id>
   ```

3. **Create a production rollback workflow** (similar to staging) if needed

### Post-Rollback Steps

After any rollback:

1. Verify smoke tests pass on restored deployment
2. Investigate root cause of failure
3. Document incident and resolution
4. Update monitoring/alerts if needed
5. Plan fix and re-deployment

---

## Next Steps

### Immediate Actions

1. **Configure GitHub Secrets**: Add all required secrets to GitHub repository settings
2. **Test Smoke Script Locally**: Run `npm run smoke` against staging environment
3. **Verify Staging Workflow**: Create a test PR to staging branch and verify smoke tests run
4. **Review Logs**: Check smoke.log artifact and PR comments for any issues

### Before Production Deployment

1. **Final Smoke Test**: Run production smoke tests manually via workflow dispatch
2. **Review Monitoring**: Ensure all monitoring tools are configured and working
3. **Communication Plan**: Notify stakeholders of deployment window
4. **Rollback Rehearsal**: Practice rollback procedure with team

### Post-Deployment

1. **Monitor Logs**: Watch for errors in first 30 minutes
2. **Verify Smoke Tests**: Ensure automated production smoke tests pass
3. **User Acceptance**: Conduct spot checks of critical user flows
4. **Document Issues**: Log any unexpected behavior for follow-up

### Continuous Improvement

1. **Expand Smoke Tests**: Add more endpoints and workflows as needed
2. **Refine Alerts**: Adjust alert thresholds based on actual usage
3. **Update Documentation**: Keep guardrails docs current with changes
4. **Secret Rotation**: Follow rotation schedule for all credentials

---

## Support & Resources

- **Repository**: https://github.com/chad-prog/hidden-key-investments
- **Deployment Documentation**: See `docs/DEPLOYMENT-CHECKLIST.md`
- **Architecture**: See `docs/02-ARCHITECTURE/`
- **API Reference**: See `docs/07-REFERENCE/API-REFERENCE.md`

For questions or issues, open a GitHub issue or contact the development team.
