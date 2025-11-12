# Guardrails & Failsafes Bundle

This document consolidates all guardrails, smoke tests, CI workflows, rollback procedures, and deployment readiness information for the Hidden Key Investments platform.

## Table of Contents

1. [Readiness Checklist](#readiness-checklist)
2. [Smoke Test Usage](#smoke-test-usage)
3. [CI Workflows](#ci-workflows)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [Correlation IDs & Tracing](#correlation-ids--tracing)
6. [Rollback Procedures](#rollback-procedures)
7. [Next Steps](#next-steps)

---

## Readiness Checklist

### Pre-Deployment Requirements

Before deploying to staging or production, ensure the following are configured:

- [ ] **Environment Variables**: All required secrets are set in GitHub Actions and Netlify
- [ ] **Smoke Tests**: Local smoke run passes (`npm run smoke`)
- [ ] **CI Pipeline**: All CI checks pass (linting, tests, builds)
- [ ] **Mautic Integration**: Mautic credentials are valid and campaign IDs are correct
- [ ] **Supabase Connection**: Database connection is verified
- [ ] **CORS Configuration**: CORS headers are properly set for all origins
- [ ] **Monitoring**: Sentry is configured and receiving events
- [ ] **Rollback Plan**: Previous deploy is identified and rollback procedure is documented

### Deployment Checklist

- [ ] Run smoke tests against staging before promoting to production
- [ ] Verify all workflows pass in GitHub Actions
- [ ] Check Netlify deploy logs for warnings or errors
- [ ] Monitor Sentry for new errors post-deployment
- [ ] Verify investor onboarding flow end-to-end
- [ ] Confirm Mautic sync is working correctly

---

## Smoke Test Usage

The smoke test runner (`scripts/smoke-run.mjs`) is a self-contained Node 22+ script that validates critical endpoints without external dependencies.

### What It Tests

1. **CORS OPTIONS**: Validates CORS headers on investor-onboard endpoint
2. **Mautic Ping**: Confirms mautic-sync endpoint is responsive
3. **Investor Upsert**: Creates a test investor contact and validates response
4. **Add to Campaign** (optional): Adds test contact to a Mautic campaign if campaign ID is provided

### Running Locally

```bash
# Using npm script (recommended)
npm run smoke

# With environment variables
SMOKE_BASE=https://staging-example.netlify.app \
SMOKE_ORIGIN=https://app-example.netlify.app \
MAUTIC_CAMPAIGN_INVESTOR_WELCOME=123 \
npm run smoke

# Or directly
node scripts/smoke-run.mjs --base=https://staging.example.com --origin=https://app.example.com --campaign=123
```

### Running Against Staging

```bash
npm run smoke:staging
```

**Prerequisites**: Set the following environment variables:
- `SMOKE_BASE`: Staging deployment URL
- `SMOKE_ORIGIN`: Origin for CORS validation
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME`: Campaign ID for staging

### Running Against Production

```bash
npm run smoke:prod
```

**Prerequisites**: Set the following environment variables with production values:
- `SMOKE_BASE`: Production deployment URL
- `SMOKE_ORIGIN`: Production origin
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME`: Campaign ID for production

### Exit Codes

- `0`: All required tests passed
- `1`: One or more required tests failed

### Log Output

Smoke test results are written to `smoke.log` in the current directory. This file is uploaded as an artifact in CI workflows for debugging.

---

## CI Workflows

### smoke-staging.yml

**Trigger**: Pull requests to `staging` branch and pushes to `staging`

**Purpose**: Runs smoke tests against staging deployment before merging or after deployment

**Actions**:
1. Checks out code
2. Sets up Node 22
3. Runs smoke test with staging environment variables
4. Posts/updates PR comment with PASS/FAIL status and log tail
5. Uploads `smoke.log` as artifact

**Required Secrets**:
- `SMOKE_BASE_STAGING`
- `SMOKE_ORIGIN_STAGING`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`
- `MAUTIC_BASE_URL`
- `MAUTIC_CLIENT_ID`
- `MAUTIC_CLIENT_SECRET`
- `MAUTIC_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### smoke-prod.yml

**Trigger**: Pushes to `main` branch and manual workflow dispatch

**Purpose**: Runs smoke tests against production deployment after merging

**Actions**:
1. Checks out code
2. Sets up Node 22
3. Runs smoke test with production environment variables
4. Sets commit status context `smoke/prod` with pass/fail
5. Uploads `smoke-prod-log` artifact
6. **Auto-rollback** (optional): If smoke fails and `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID_PROD` are set, automatically restores previous ready deploy

**Required Secrets**:
- `SMOKE_BASE_PROD`
- `SMOKE_ORIGIN_PROD`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`
- `MAUTIC_BASE_URL`
- `MAUTIC_CLIENT_ID`
- `MAUTIC_CLIENT_SECRET`
- `MAUTIC_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID_PROD` (for auto-rollback)

### rollback-staging.yml

**Trigger**: Manual workflow dispatch

**Purpose**: Restore a previous staging deployment (last ready deploy or specific deploy ID)

**Actions**:
1. Fetches previous ready deploy or uses provided `deploy_id`
2. Restores the deploy via Netlify API
3. Announces rollback to Slack #all-hands channel with **Heroic Ceremony** Block Kit message (if `SLACK_WEBHOOK_ALL_HANDS` is configured)

**Required Secrets**:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_STAGING`
- Optional: `SLACK_WEBHOOK_ALL_HANDS` (for Slack notifications)

**Variables**:
- `NETLIFY_SITE_NAME` (for deploy link in Slack message)

**Inputs**:
- `deploy_id` (optional): Specific deploy ID to restore. If not provided, restores the most recent ready deploy before the current one.

---

## Environment Variables & Secrets

### GitHub Actions Secrets

Add these secrets in **Settings > Secrets and variables > Actions**:

#### Smoke Test Secrets (Staging)
- `SMOKE_BASE_STAGING`: Base URL of staging deployment (e.g., `https://staging-hki.netlify.app`)
- `SMOKE_ORIGIN_STAGING`: Origin for CORS validation (e.g., `https://hki-staging.netlify.app`)
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`: Mautic campaign ID for staging

#### Smoke Test Secrets (Production)
- `SMOKE_BASE_PROD`: Base URL of production deployment
- `SMOKE_ORIGIN_PROD`: Origin for CORS validation
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`: Mautic campaign ID for production

#### Mautic Integration
- `MAUTIC_BASE_URL`: Mautic instance URL
- `MAUTIC_CLIENT_ID`: OAuth client ID
- `MAUTIC_CLIENT_SECRET`: OAuth client secret
- `MAUTIC_WEBHOOK_SECRET`: Webhook verification secret

#### Supabase
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations

#### Netlify (for auto-rollback and manual rollback)
- `NETLIFY_AUTH_TOKEN`: Personal access token or deploy token
- `NETLIFY_SITE_ID_STAGING`: Site ID for staging environment
- `NETLIFY_SITE_ID_PROD`: Site ID for production environment

#### Slack Notifications
- `SLACK_WEBHOOK_ALL_HANDS`: Webhook URL for #all-hands channel (for rollback announcements)

### GitHub Actions Variables

Add these variables in **Settings > Secrets and variables > Actions > Variables**:

- `NETLIFY_SITE_NAME`: Human-readable site name for Slack messages and logs

### Netlify Environment Variables

Set these in **Netlify > Site settings > Environment variables** for each environment:

- `MAUTIC_BASE_URL`
- `MAUTIC_CLIENT_ID`
- `MAUTIC_CLIENT_SECRET`
- `MAUTIC_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_DSN` (optional, for error tracking)

---

## Correlation IDs & Tracing

For production debugging and request tracing:

### Request Correlation

All API requests should include a `X-Correlation-ID` header:

```javascript
const correlationId = crypto.randomUUID();
fetch('/api/endpoint', {
  headers: {
    'X-Correlation-ID': correlationId
  }
});
```

### Log Aggregation

- **Netlify Functions**: Correlation IDs are logged automatically in function responses
- **Sentry**: Set `correlationId` as a tag or context for error tracking
- **Mautic Sync**: Include correlation ID in payload for traceability

### Debugging Failed Requests

1. Find the `X-Correlation-ID` from the client or error logs
2. Search Netlify function logs for the correlation ID
3. Check Sentry events with the same correlation ID
4. Review Mautic logs if sync operation was involved

---

## Rollback Procedures

### Automatic Rollback (Production Only)

If `smoke-prod.yml` detects a smoke test failure **and** `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID_PROD` are configured:

1. Workflow automatically fetches the previous ready deploy
2. Restores that deploy via Netlify API
3. Sets commit status to indicate rollback occurred
4. Uploads logs for investigation

### Manual Rollback (Staging or Production)

#### Via GitHub Actions (Recommended)

1. Navigate to **Actions > Rollback Staging Deployment** (or create a similar workflow for production)
2. Click **Run workflow**
3. Optionally provide a specific `deploy_id` to restore
4. Workflow will:
   - Restore the specified or previous deploy
   - Announce to Slack with **Heroic Ceremony** message (if configured)

#### Via Netlify Dashboard

1. Go to **Netlify > Site > Deploys**
2. Find the deploy to restore (marked as "Published" or "Ready")
3. Click **Publish deploy** to restore it
4. Manually notify team via Slack

#### Via Netlify CLI

```bash
# List recent deploys
netlify api listSiteDeploys --data='{"site_id":"YOUR_SITE_ID"}'

# Restore specific deploy
netlify api restoreSiteDeploy --data='{"site_id":"YOUR_SITE_ID","deploy_id":"DEPLOY_ID"}'
```

### Rollback Communication (Heroic Ceremony Tone)

When using the `rollback-staging.yml` workflow with Slack integration, the team receives a **Heroic Ceremony** announcement:

> 🚀 **Staging Deploy Restored**
>
> The staging environment has been heroically restored to a previous state.
>
> **Deploy:** `<deploy_id>`
> **Restored by:** GitHub Actions
> **View deploy:** [Netlify Deploy Link]

---

## Next Steps

### Immediate Actions

1. **Configure Secrets**: Add all required secrets to GitHub Actions and Netlify
2. **Test Locally**: Run `npm run smoke` to verify smoke test works
3. **Validate Staging Workflow**: Push to staging branch and verify `smoke-staging.yml` runs
4. **Test Rollback**: Run manual rollback workflow to ensure it works

### Future Enhancements

- [ ] Add end-to-end Playwright tests for investor journey
- [ ] Implement canary deployments for gradual rollout
- [ ] Set up automated performance benchmarks
- [ ] Add database migration smoke tests
- [ ] Create dashboard for smoke test history
- [ ] Integrate smoke results with Slack for real-time notifications
- [ ] Add load testing for high-traffic scenarios
- [ ] Implement automated security scanning in CI

### Monitoring & Alerting

- [ ] Set up Sentry alerts for critical errors
- [ ] Configure Netlify deploy notifications in Slack
- [ ] Create uptime monitoring with external service (e.g., UptimeRobot, Pingdom)
- [ ] Set up log aggregation and analysis (e.g., Datadog, Logtail)

---

## Additional Resources

- [Netlify Deploy Contexts](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Mautic API Documentation](https://developer.mautic.org/#rest-api)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

---

**Last Updated**: November 2025

For questions or issues, contact the development team or file an issue in the repository.
