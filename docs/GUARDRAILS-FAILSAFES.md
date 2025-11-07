# Go-Live Guardrails & Failsafes

This document consolidates all pre-deployment checks, smoke testing procedures, CI/CD workflows, environment configuration, and rollback strategies for Hidden Key Investments.

## Table of Contents

1. [Quick Pre-Deployment Checklist](#quick-pre-deployment-checklist)
2. [Smoke Test Script](#smoke-test-script)
3. [CI/CD Workflows](#cicd-workflows)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [CORS & Correlation ID](#cors--correlation-id)
6. [Rollback Plan](#rollback-plan)
7. [Next Steps](#next-steps)

---

## Quick Pre-Deployment Checklist

Before deploying to staging or production, ensure the following:

### Infrastructure
- [ ] All environment variables are configured in GitHub Secrets
- [ ] Netlify site IDs are correct for staging and production
- [ ] Supabase connection strings are valid
- [ ] Mautic API credentials are set and tested

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build completes successfully (`npm run build`)
- [ ] No security vulnerabilities in dependencies

### API Endpoints
- [ ] `/.netlify/functions/investor-onboard` responds correctly
- [ ] `/.netlify/functions/mautic-sync` responds correctly
- [ ] CORS headers are properly configured
- [ ] Correlation IDs are being generated and tracked

### Smoke Tests
- [ ] Local smoke test passes (`npm run smoke`)
- [ ] Staging smoke test passes in CI
- [ ] Production smoke test ready to run post-deploy

### Rollback Readiness
- [ ] Previous Netlify deploy is identified and accessible
- [ ] Rollback workflow is tested and ready
- [ ] Team is notified of deployment window

---

## Smoke Test Script

The smoke test script (`scripts/smoke-run.mjs`) validates critical API endpoints after deployment.

### Usage

**Local testing:**
```bash
node scripts/smoke-run.mjs --base=https://staging.app.hiddenkeyinvestments.com --origin=https://hiddenkeyinvestments.com --campaign=7
```

**With environment variables:**
```bash
export SMOKE_BASE=https://staging.app.hiddenkeyinvestments.com
export SMOKE_ORIGIN=https://hiddenkeyinvestments.com
export MAUTIC_CAMPAIGN_INVESTOR_WELCOME=7
npm run smoke
```

**Using npm scripts:**
```bash
# Staging
npm run smoke:staging

# Production
npm run smoke:prod
```

### What the Smoke Test Does

1. **CORS Preflight Check**: Validates OPTIONS request to `/.netlify/functions/investor-onboard`
2. **Ping Test**: Sends POST to `/.netlify/functions/mautic-sync` with `action=ping`
3. **Investor Onboard**: Creates/updates investor with stable UUID
4. **Campaign Assignment** (optional): Adds investor to welcome campaign if `MAUTIC_CAMPAIGN_INVESTOR_WELCOME` is set

### Expected Behavior

- **Success**: Exits with code 0, logs summary
- **Failure**: Exits with non-zero code, logs detailed error information
- **Artifacts**: Creates `smoke.log` with full execution details

### CLI Arguments

- `--base=<url>`: Base URL of the deployment (required)
- `--origin=<url>`: Origin header for CORS validation (required)
- `--campaign=<id>`: Mautic campaign ID for investor welcome (optional)

### Environment Variables

Alternatively, you can set:
- `SMOKE_BASE`: Base URL
- `SMOKE_ORIGIN`: Origin header
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME`: Campaign ID

---

## CI/CD Workflows

### Smoke Staging Workflow

**File**: `.github/workflows/smoke-staging.yml`

**Triggers**:
- Pull requests to `staging` branch
- Pushes to `staging` branch
- Manual workflow dispatch

**Actions**:
1. Checks out code
2. Sets up Node.js 22
3. Installs dependencies (`npm ci`)
4. Runs smoke test with staging secrets
5. Uploads `smoke.log` artifact
6. Posts/updates PR comment with results
7. Writes job summary

**Required Secrets**:
- `SMOKE_BASE_STAGING`
- `SMOKE_ORIGIN_STAGING`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`

### Smoke Production Workflow

**File**: `.github/workflows/smoke-prod.yml`

**Triggers**:
- Pushes to `main` branch
- Manual workflow dispatch

**Actions**:
1. Checks out code
2. Sets up Node.js 22
3. Installs dependencies (`npm ci`)
4. Runs smoke test with production secrets
5. Sets commit status context `smoke/prod`
6. Uploads artifacts
7. **Auto-rollback** on failure (if Netlify tokens configured)

**Required Secrets**:
- `SMOKE_BASE_PROD`
- `SMOKE_ORIGIN_PROD`
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`
- `NETLIFY_AUTH_TOKEN` (optional, for rollback)
- `NETLIFY_SITE_ID_PROD` (optional, for rollback)

**Auto-Rollback**:
When smoke tests fail and Netlify credentials are available, the workflow automatically:
1. Fetches the previous ready deploy
2. Restores it via Netlify API
3. Logs the rollback action

### Rollback Staging Workflow

**File**: `.github/workflows/rollback-staging.yml`

**Triggers**:
- Manual workflow dispatch only

**Inputs**:
- `deploy_id` (optional): Specific deploy ID to restore

**Actions**:
1. Fetches previous ready deploy (or uses provided ID)
2. Restores deploy via Netlify API
3. Announces to Slack #all-hands (if webhook configured)

**Required Secrets**:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID_STAGING`
- `SLACK_WEBHOOK_ALL_HANDS` (optional)

---

## Environment Variables & Secrets

### Staging Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `SMOKE_BASE_STAGING` | Staging deployment URL | `https://staging.app.hiddenkeyinvestments.com` |
| `SMOKE_ORIGIN_STAGING` | Allowed origin for CORS | `https://hiddenkeyinvestments.com` |
| `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING` | Staging campaign ID | `7` |
| `NETLIFY_SITE_ID_STAGING` | Netlify staging site ID | `abc123...` |

### Production Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `SMOKE_BASE_PROD` | Production deployment URL | `https://app.hiddenkeyinvestments.com` |
| `SMOKE_ORIGIN_PROD` | Allowed origin for CORS | `https://hiddenkeyinvestments.com` |
| `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD` | Production campaign ID | `1` |
| `NETLIFY_SITE_ID_PROD` | Netlify production site ID | `xyz789...` |

### Shared Secrets

| Secret | Description | Required For |
|--------|-------------|--------------|
| `MAUTIC_BASE_URL` | Mautic instance URL | Mautic sync functions |
| `MAUTIC_CLIENT_ID` | Mautic OAuth client ID | Mautic authentication |
| `MAUTIC_CLIENT_SECRET` | Mautic OAuth secret | Mautic authentication |
| `MAUTIC_WEBHOOK_SECRET` | Webhook validation secret | Mautic webhooks |
| `SUPABASE_URL` | Supabase project URL | Database operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Admin database access |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token | Auto-rollback |
| `SLACK_WEBHOOK_ALL_HANDS` | Slack webhook URL | Rollback notifications |

### Variables (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `NETLIFY_SITE_NAME` | Human-readable site name | `hidden-key-investments-staging` |

### Setting Up Secrets

**Via GitHub UI:**
1. Navigate to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from the tables above

**Via GitHub CLI:**
```bash
gh secret set SMOKE_BASE_STAGING --body "https://staging.app.hiddenkeyinvestments.com"
gh secret set SMOKE_ORIGIN_STAGING --body "https://hiddenkeyinvestments.com"
# ... continue for all secrets
```

---

## CORS & Correlation ID

### CORS Configuration

All serverless functions must respond to OPTIONS requests with proper CORS headers:

```javascript
{
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-Id',
  'Access-Control-Max-Age': '86400'
}
```

**Validation**: The smoke test verifies CORS headers on the investor-onboard endpoint.

### Correlation ID

Every API request should generate or accept a correlation ID for distributed tracing:

**Request Header**: `X-Correlation-Id: <uuid>`

**Response Header**: `X-Correlation-Id: <same-uuid>`

**Benefits**:
- End-to-end request tracking
- Easier debugging across services
- Mautic webhook correlation

**Implementation**: Functions should:
1. Accept `X-Correlation-Id` from request headers
2. Generate a new UUID if not provided
3. Include the ID in all logs
4. Return the ID in response headers

---

## Rollback Plan

### When to Rollback

Rollback if any of the following occur post-deployment:

1. **Smoke tests fail** in production
2. **Critical bugs** are reported by users
3. **Performance degradation** exceeds 20% baseline
4. **Error rate** spikes above 5%
5. **Database connection** issues
6. **Third-party integration** failures (Mautic, Supabase)

### Automated Rollback (Production)

The `smoke-prod.yml` workflow automatically rolls back on smoke test failure when configured.

**Prerequisites**:
- `NETLIFY_AUTH_TOKEN` secret set
- `NETLIFY_SITE_ID_PROD` secret set

**Process**:
1. Smoke test runs post-deployment
2. On failure, workflow fetches previous ready deploy
3. Restores previous deploy via Netlify API
4. Logs rollback action

### Manual Rollback (Staging)

**Via GitHub Actions**:
1. Navigate to Actions → Rollback Staging Workflow
2. Click "Run workflow"
3. Optionally provide specific `deploy_id`
4. Confirm execution

**Via Netlify CLI**:
```bash
# List recent deploys
netlify api listSiteDeploys --data '{"site_id": "YOUR_SITE_ID"}'

# Restore specific deploy
netlify api restoreSiteDeploy --data '{"site_id": "YOUR_SITE_ID", "deploy_id": "DEPLOY_ID"}'
```

**Via Netlify UI**:
1. Log in to Netlify dashboard
2. Navigate to site → Deploys
3. Find the last working deploy
4. Click "Publish deploy"

### Post-Rollback Actions

After rolling back:

1. **Notify Team**: Post in Slack #all-hands (automated if configured)
2. **Investigate**: Review logs from failed deployment
3. **Document**: Record incident in incident log
4. **Fix**: Address root cause in code
5. **Test**: Verify fix in staging before re-deploying
6. **Deploy**: Re-attempt deployment with fix

---

## Next Steps

### Immediate Actions

1. **Configure Secrets**: Add all required secrets to GitHub repository
2. **Test Locally**: Run smoke tests against staging environment
3. **Validate Workflows**: Trigger staging workflow manually to verify setup
4. **Document Incidents**: Create incident response runbook

### Short-term Improvements (1-4 weeks)

1. **Monitoring**: Set up Sentry alerts for smoke test failures
2. **Metrics Dashboard**: Create dashboard for deployment success rates
3. **Extended Smoke Tests**: Add more endpoints to smoke test suite
4. **Load Testing**: Implement basic load tests for critical paths
5. **Blue-Green Deploys**: Explore Netlify branch deploys for zero-downtime

### Medium-term Enhancements (1-3 months)

1. **Canary Releases**: Roll out changes to subset of users first
2. **Feature Flags**: Implement LaunchDarkly or similar
3. **Automated Performance Tests**: Add Lighthouse CI for performance regression
4. **End-to-End Tests**: Implement Playwright tests for critical user flows
5. **Chaos Engineering**: Test system resilience with controlled failures

### Long-term Roadmap (3-6 months)

1. **Multi-region Deployments**: Expand to multiple geographic regions
2. **Advanced Observability**: Implement distributed tracing with OpenTelemetry
3. **Self-healing Systems**: Automated incident response and recovery
4. **Progressive Delivery**: Sophisticated rollout strategies
5. **Cost Optimization**: Automated resource scaling and optimization

---

## Questions or Issues?

If you encounter problems with the guardrails or smoke tests:

1. **Check Logs**: Review `smoke.log` artifact in GitHub Actions
2. **Verify Secrets**: Ensure all required secrets are configured
3. **Test Locally**: Run smoke script with `--verbose` flag (when implemented)
4. **Review Documentation**: Check function-specific README files
5. **Contact Team**: Reach out in Slack #dev-team

---

**Last Updated**: 2025-11-07  
**Maintained By**: DevOps Team  
**Related Docs**: [CI-CD-PIPELINE.md](./CI-CD-PIPELINE.md), [DEPLOYMENT-RUNBOOK.md](./DEPLOYMENT-RUNBOOK.md)
