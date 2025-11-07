# Go-Live Guardrails & Failsafes

Comprehensive documentation for production readiness, smoke testing, rollback procedures, and observability.

## Table of Contents
- [Readiness Checklist](#readiness-checklist)
- [Smoke Testing](#smoke-testing)
- [Required Environment Variables](#required-environment-variables)
- [CORS and Correlation ID](#cors-and-correlation-id)
- [Rollback Procedures](#rollback-procedures)
- [Observability and Monitoring](#observability-and-monitoring)

## Readiness Checklist

Before deploying to production, ensure all items are completed:

### Infrastructure
- [ ] All required GitHub secrets configured (see [Required Environment Variables](#required-environment-variables))
- [ ] Netlify site configured with environment variables
- [ ] Supabase database tables created and migrations applied
- [ ] Mautic CRM instance configured with OAuth2 credentials
- [ ] Sentry configured for error tracking

### Testing
- [ ] All unit tests passing (`npm test`)
- [ ] Function tests passing (`npm run test:functions`)
- [ ] Smoke tests passing locally (`npm run smoke`)
- [ ] Smoke tests passing in staging environment
- [ ] Load testing completed for expected traffic

### Security
- [ ] Security audit completed
- [ ] Dependencies up to date with no high-severity vulnerabilities
- [ ] CORS origins properly configured for production
- [ ] API keys rotated and stored securely
- [ ] Rate limiting configured

### Observability
- [ ] Sentry error tracking enabled
- [ ] Log aggregation configured
- [ ] Health check endpoints responding
- [ ] Alerts configured for critical failures
- [ ] Runbook documented for incident response

### Documentation
- [ ] API documentation up to date
- [ ] Environment setup guide current
- [ ] Rollback procedures tested
- [ ] Team trained on operational procedures

## Smoke Testing

Smoke tests validate critical user flows and integration points.

### Running Smoke Tests Locally

1. Copy the example environment file:
   ```bash
   cp .env.smoke.example .env.smoke
   ```

2. Configure the environment variables in `.env.smoke`:
   - `SMOKE_BASE`: Base URL for your environment (e.g., `https://staging.hiddenkeyinvestments.com`)
   - `SMOKE_ORIGIN`: Origin for CORS validation (e.g., `https://staging.hiddenkeyinvestments.com`)
   - `MAUTIC_CAMPAIGN_INVESTOR_WELCOME`: Campaign ID for investor welcome flow

3. Run the smoke tests:
   ```bash
   npm run smoke
   ```

### Smoke Test Coverage

The smoke test script validates:

1. **Investor Onboard Function**
   - OPTIONS preflight request (CORS)
   - POST with valid payload
   - Email validation
   - Mautic sync integration

2. **Mautic Sync Function**
   - OPTIONS preflight request (CORS)
   - Ping action (health check)
   - Upsert contact action
   - Add to campaign action (optional)

3. **Response Validation**
   - Proper HTTP status codes
   - CORS headers present
   - Response structure matches expected schema
   - Correlation IDs tracked

### Automated Smoke Tests

Smoke tests run automatically in CI/CD:

- **Staging**: On every PR to `staging` and push to `staging` branch
- **Production**: On every push to `main` branch

See workflow files:
- `.github/workflows/smoke-staging.yml`
- `.github/workflows/smoke-prod.yml`

### Interpreting Smoke Test Results

**PASS**: All critical flows validated successfully
- Proceed with deployment
- Monitor initial traffic

**FAIL**: One or more critical flows failed
- Review logs in workflow artifacts
- Check PR comment for specific failures
- Do not proceed until issues resolved
- Production failures trigger automatic rollback (if configured)

## Required Environment Variables

### GitHub Secrets

Configure these in GitHub repository settings → Secrets and variables → Actions:

#### Staging Environment
- `SMOKE_BASE_STAGING`: Base URL for staging (e.g., `https://staging.hiddenkeyinvestments.com`)
- `SMOKE_ORIGIN_STAGING`: Origin for CORS testing (e.g., `https://staging.hiddenkeyinvestments.com`)
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_STAGING`: Mautic campaign ID for staging investor welcome
- `NETLIFY_SITE_ID_STAGING`: Netlify site ID for staging

#### Production Environment
- `SMOKE_BASE_PROD`: Base URL for production (e.g., `https://hiddenkeyinvestments.com`)
- `SMOKE_ORIGIN_PROD`: Origin for CORS testing (e.g., `https://hiddenkeyinvestments.com`)
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME_PROD`: Mautic campaign ID for production investor welcome
- `NETLIFY_SITE_ID_PROD`: Netlify site ID for production

#### Shared Secrets
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for admin operations
- `MAUTIC_BASE_URL`: Mautic instance base URL (e.g., `https://mautic.example.com`)
- `MAUTIC_CLIENT_ID`: Mautic OAuth2 client ID
- `MAUTIC_CLIENT_SECRET`: Mautic OAuth2 client secret
- `NETLIFY_AUTH_TOKEN`: Netlify personal access token (optional, for rollback)
- `SLACK_WEBHOOK_ALL_HANDS`: Slack webhook URL for notifications (optional)

#### Repository Variables
- `NETLIFY_SITE_NAME`: Human-readable site name for display

### Netlify Environment Variables

Configure these in Netlify site settings → Environment variables:

#### All Environments
- `NODE_ENV`: Environment name (`production`, `staging`, `development`)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `MAUTIC_BASE_URL`: Mautic instance base URL
- `MAUTIC_CLIENT_ID`: Mautic OAuth2 client ID
- `MAUTIC_CLIENT_SECRET`: Mautic OAuth2 client secret
- `MAUTIC_CAMPAIGN_INVESTOR_WELCOME`: Default campaign ID for investor welcome
- `ALLOWED_ORIGIN`: Allowed origin for CORS (production URL)
- `SENDGRID_API_KEY`: SendGrid API key for email
- `SENDGRID_FROM_EMAIL`: From email address
- `SENDGRID_FROM_NAME`: From name
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

## CORS and Correlation ID

### CORS Configuration

Our serverless functions implement CORS to allow browser-based requests:

**Development/Staging**: 
- `Access-Control-Allow-Origin: *` (permissive)

**Production**:
- `Access-Control-Allow-Origin: https://hiddenkeyinvestments.com` (restricted)
- Set via `ALLOWED_ORIGIN` environment variable

**Preflight Requests**:
All functions handle OPTIONS requests for CORS preflight:
```
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Correlation-ID
```

### Correlation ID

Correlation IDs track requests across services:

**Client-Side**:
- Generate UUID for each request
- Send in `X-Correlation-ID` header

**Server-Side**:
- Accept correlation ID from header
- Generate new UUID if not provided
- Include in all logs and responses
- Pass to downstream services

**Benefits**:
- Trace requests across multiple services
- Debug issues with specific request flows
- Aggregate logs by correlation ID
- Support customer inquiries

**Example**:
```javascript
const correlationId = crypto.randomUUID();
const response = await fetch('/api/investor-onboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
  },
  body: JSON.stringify(payload),
});
```

## Rollback Procedures

### Automatic Rollback

Production smoke test failures trigger automatic rollback if:
- `NETLIFY_AUTH_TOKEN` is configured
- `NETLIFY_SITE_ID_PROD` is configured
- Previous deploy is in "ready" state

The workflow:
1. Runs smoke tests against new deployment
2. On failure, fetches previous "ready" deploy
3. Restores previous deploy via Netlify API
4. Posts notification to Slack (if configured)
5. Fails the workflow with clear error message

### Manual Rollback

#### Staging Rollback

Use the manual workflow dispatch:

1. Go to Actions → Rollback Staging Deploy
2. Click "Run workflow"
3. Optional: Provide specific deploy ID to restore
4. Optional: Customize Slack notification tone
5. Click "Run workflow"

The workflow will:
- Fetch previous "ready" deploy (or use provided ID)
- Restore the deploy via Netlify API
- Send Slack notification (if webhook configured)
- Report success/failure

#### Production Rollback

**Option 1: Via Netlify Dashboard**
1. Log into Netlify dashboard
2. Navigate to Deploys
3. Find previous working deploy
4. Click "Publish deploy"

**Option 2: Via Netlify CLI**
```bash
netlify sites:list
netlify api listSiteDeploys --data '{ "site_id": "YOUR_SITE_ID" }'
netlify api restoreSiteDeploy --data '{ "deploy_id": "DEPLOY_ID" }'
```

**Option 3: Via Git**
```bash
git log --oneline
git revert <commit-sha>
git push origin main
```

### Rollback Verification

After rollback:
1. Run smoke tests against restored deployment
2. Verify health check endpoints
3. Check error rates in Sentry
4. Monitor user traffic patterns
5. Review logs for anomalies

### Post-Rollback

1. Document incident in runbook
2. Create post-mortem document
3. Identify root cause
4. Implement fixes in feature branch
5. Re-test before next deployment

## Observability and Monitoring

### Health Checks

**Endpoint**: `/.netlify/functions/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T08:00:00Z",
  "version": "1.0.0",
  "services": {
    "supabase": "healthy",
    "mautic": "healthy"
  }
}
```

**Monitoring**:
- Uptime monitoring via external service
- Alert on non-200 status
- Alert on service degradation

### Error Tracking

**Sentry Configuration**:
- Production DSN: Configured via `VITE_SENTRY_DSN`
- Staging DSN: Separate project for staging
- Error sampling: 100% in staging, configurable in production
- Performance tracing: Enabled

**What to Monitor**:
- Error rate trends
- Unique error count
- User impact (affected users)
- Performance degradation

### Logging

**Log Levels**:
- `ERROR`: Critical failures requiring immediate attention
- `WARN`: Potential issues or degraded performance
- `INFO`: Normal operations and flow
- `DEBUG`: Detailed diagnostic information

**Log Aggregation**:
- Netlify function logs
- Browser console errors (via Sentry)
- Network request logs
- Correlation IDs for tracing

**Key Metrics**:
- Request latency (p50, p95, p99)
- Error rate (errors per minute)
- Throughput (requests per second)
- Database query performance

### Alerts

Configure alerts for:

**Critical** (immediate page):
- Error rate > 5% for 5 minutes
- All health checks failing
- Database connection failures
- Zero successful requests for 10 minutes

**Warning** (email/Slack):
- Error rate > 1% for 15 minutes
- Latency p95 > 2 seconds
- Dependency degradation
- Elevated error counts

**Informational**:
- Deployment notifications
- Smoke test results
- Daily summary reports

### Dashboards

Create dashboards for:

1. **System Health**
   - Request volume
   - Error rate
   - Response time
   - Service status

2. **Business Metrics**
   - Lead submissions
   - Investor onboarding
   - Campaign enrollments
   - Conversion rates

3. **Infrastructure**
   - Function invocations
   - Database connections
   - API quota usage
   - Cost tracking

### Incident Response

**On-Call Rotation**:
- Define on-call schedule
- Escalation procedures
- Contact information

**Runbook**:
1. Receive alert
2. Check dashboards for context
3. Review recent deployments
4. Check error logs and traces
5. Execute rollback if needed
6. Communicate status to team
7. Document incident
8. Schedule post-mortem

**Communication Channels**:
- Slack: Real-time team coordination
- Email: Stakeholder updates
- Status page: Customer communication

## Additional Resources

- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
- [Environment Setup](./ENVIRONMENT-SETUP.md)
- [API Reference](./API-REFERENCE.md)
- [Security Policy](./SECURITY-POLICY.md)
- [GitHub Secrets Setup](./GITHUB-SECRETS-SETUP.md)

## Support

For questions or issues:
- Review this documentation
- Check existing GitHub issues
- Contact the development team
- Escalate to on-call engineer for production incidents
