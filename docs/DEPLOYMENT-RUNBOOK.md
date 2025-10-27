# Deployment Runbook

## Overview

This runbook provides step-by-step procedures for deploying the Hidden Key Investments platform to various environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Deployment Procedures](#deployment-procedures)
4. [Rollback Procedures](#rollback-procedures)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing locally (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code review approved
- [ ] No console.errors or console.warns in production code
- [ ] Security scan completed (CodeQL, Trivy)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation updated (if API changes)
- [ ] Environment variables documented
- [ ] Breaking changes noted
- [ ] Migration guide created (if needed)

### Database

- [ ] Migrations tested in staging
- [ ] Backup created before migration
- [ ] Rollback migration prepared
- [ ] Data validation scripts ready

### Dependencies

- [ ] No critical vulnerabilities in dependencies
- [ ] New dependencies security-scanned
- [ ] Package-lock.json committed
- [ ] License compliance verified

### Infrastructure

- [ ] Resource limits reviewed
- [ ] Scaling policies configured
- [ ] Monitoring alerts configured
- [ ] Rate limits appropriate

### Communication

- [ ] Stakeholders notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Status page updated
- [ ] Support team briefed

## Environment Setup

### Development Environment

**Purpose**: Local development and testing

**Setup**:
```bash
# Clone repository
git clone https://github.com/chad-prog/hidden-key-investments.git
cd hidden-key-investments

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with development keys
nano .env

# Start development server
npm run dev
```

**Access**: http://localhost:3000

**Database**: Local Supabase instance or development database

---

### Staging Environment

**Purpose**: Pre-production testing and QA

**Branch**: `staging`

**URL**: https://staging--hidden-key-investments.netlify.app

**Setup**:

1. **Create Staging Branch** (one-time):
```bash
git checkout -b staging main
git push -u origin staging
```

2. **Configure Netlify**:
   - Go to Netlify Dashboard
   - Site Settings → Build & Deploy → Continuous Deployment
   - Add branch deploy: `staging`
   - Configure environment variables (staging scope)

3. **Environment Variables**:
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
# Scope: Branch deploys

SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=staging_service_key
VITE_SENTRY_DSN=https://staging-dsn@sentry.io/project
VITE_APP_VERSION=staging
```

4. **Database Setup**:
```bash
# Connect to staging database
psql "postgresql://postgres:[password]@[staging-host]:5432/postgres"

# Run migrations
\i supabase-sql/01-setup.sql

# Seed test data
\i supabase-sql/02-seed-staging.sql
```

**Deployment**:
```bash
# Merge feature to staging
git checkout staging
git merge feature-branch
git push origin staging

# Netlify automatically deploys
```

**Verification**:
- Check Netlify deploy logs
- Verify staging site loads
- Run smoke tests
- Check error tracking (Sentry)

---

### Production Environment

**Purpose**: Live production system

**Branch**: `main`

**URL**: https://hidden-key-investments.netlify.app

**Setup**:

1. **Configure Netlify**:
   - Production branch: `main`
   - Auto-publish: Enabled
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

2. **Environment Variables**:
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
# Scope: Production

SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
VITE_SENTRY_DSN=https://prod-dsn@sentry.io/project
VITE_APP_VERSION=1.0.0
VITE_FEATURE_ERRORTRACKING=true
VITE_FEATURE_PERFORMANCEMONITORING=true
```

3. **Custom Domain** (if applicable):
```bash
# In Netlify Dashboard
# Domain Settings → Add custom domain
# Configure DNS records (CNAME or A record)
# Enable HTTPS (automatic with Let's Encrypt)
```

## Deployment Procedures

### Automatic Deployment (Recommended)

**For Staging**:
```bash
# 1. Create feature branch
git checkout -b feature/new-feature main

# 2. Develop and test locally
npm test
npm run build

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push to GitHub
git push origin feature/new-feature

# 5. Create PR to staging
# GitHub → New Pull Request → base: staging

# 6. Review and merge
# Netlify automatically deploys to staging preview
# After approval, merge to staging
# Staging environment automatically updates
```

**For Production**:
```bash
# 1. Ensure staging is stable
# Run full QA on staging

# 2. Create PR from staging to main
git checkout main
git pull origin main
# GitHub → New Pull Request → base: main, compare: staging

# 3. Final review
# Review all changes
# Check deployment preview
# Verify all checks pass

# 4. Merge to main
# Production automatically deploys

# 5. Monitor deployment
# Watch Netlify deploy logs
# Check Sentry for errors
# Verify metrics in dashboard
```

---

### Manual Deployment (Emergency Only)

**If automatic deployment fails**:

1. **Build Locally**:
```bash
# Ensure you're on the correct branch
git checkout main
git pull origin main

# Install dependencies
npm ci

# Build
NODE_ENV=production npm run build

# Verify build
ls -lh dist/
```

2. **Deploy via Netlify CLI**:
```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Deploy to production
netlify deploy --prod --dir=dist

# Or deploy to staging
netlify deploy --alias=staging --dir=dist
```

3. **Verify Deployment**:
```bash
# Check deployment status
netlify status

# View live site
netlify open:site
```

---

### Database Migration

**Process**:

1. **Prepare Migration**:
```sql
-- migrations/001_add_column.sql
ALTER TABLE leads ADD COLUMN source_campaign VARCHAR(255);
CREATE INDEX idx_leads_source_campaign ON leads(source_campaign);

-- migrations/001_rollback.sql
DROP INDEX IF EXISTS idx_leads_source_campaign;
ALTER TABLE leads DROP COLUMN IF EXISTS source_campaign;
```

2. **Test in Staging**:
```bash
# Connect to staging database
psql "postgresql://postgres:[password]@[staging-host]:5432/postgres"

# Run migration
\i migrations/001_add_column.sql

# Verify
\d leads

# Test rollback (optional)
\i migrations/001_rollback.sql
\i migrations/001_add_column.sql
```

3. **Schedule Production Migration**:
```bash
# During low-traffic window (recommended: 2-4 AM UTC)

# 1. Create backup
pg_dump -h [prod-host] -U postgres -d postgres -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# 2. Run migration
psql "postgresql://postgres:[password]@[prod-host]:5432/postgres" -f migrations/001_add_column.sql

# 3. Verify
psql "postgresql://postgres:[password]@[prod-host]:5432/postgres" -c "\d leads"

# 4. Monitor application
# Check Sentry for errors
# Monitor API response times
```

---

### Serverless Function Deployment

**Netlify Functions** are automatically deployed with the site, but you can test them first:

1. **Local Testing**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start dev server with functions
netlify dev

# Test function
curl http://localhost:8888/.netlify/functions/lead-ingest-enhanced \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"source": "website", "contact": {"email": "test@example.com"}}'
```

2. **Deploy Functions**:
```bash
# Functions deploy with site automatically
git push origin main

# Or deploy just functions
netlify deploy --functions
```

## Rollback Procedures

### Code Rollback

**Automatic (Netlify)**:
```bash
# 1. Go to Netlify Dashboard
# 2. Deploys tab
# 3. Find last good deployment
# 4. Click "Publish deploy"
# 5. Confirm rollback
```

**Manual (Git)**:
```bash
# 1. Identify last good commit
git log --oneline -10

# 2. Revert to that commit
git revert HEAD  # Reverts last commit
# Or
git revert <bad-commit-hash>

# 3. Push revert
git push origin main

# 4. Netlify auto-deploys the revert
```

### Database Rollback

**Process**:
```bash
# 1. Stop application (if needed)
netlify build:stop

# 2. Restore from backup
pg_restore -h [host] -U postgres -d postgres -c backup.dump

# 3. Run rollback migration (if applicable)
psql "postgresql://..." -f migrations/001_rollback.sql

# 4. Verify data integrity
psql "postgresql://..." -c "SELECT COUNT(*) FROM leads;"

# 5. Resume application
netlify deploy
```

### Emergency Rollback

**If production is completely broken**:

```bash
# 1. Immediate rollback in Netlify Dashboard
# (takes 30 seconds)

# 2. Or via CLI
netlify rollback

# 3. Communicate to stakeholders
# Post to status page
# Notify team in Slack

# 4. Investigate root cause
# Check Sentry errors
# Review deploy logs
# Examine recent changes

# 5. Fix and redeploy
# Create hotfix branch
# Fix issue
# Test locally
# Deploy to staging
# Deploy to production
```

## Post-Deployment Verification

### Automated Checks

**Health Check Endpoint** (create this):
```bash
# Test health endpoint
curl https://hidden-key-investments.netlify.app/api/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-27T07:46:34.325Z",
  "services": {
    "database": "connected",
    "cache": "connected",
    "api": "operational"
  }
}
```

### Manual Checks

**Critical User Flows** (test in order):

1. **Homepage Loads**:
   - [ ] Site loads within 3 seconds
   - [ ] No console errors
   - [ ] All assets load (images, CSS, JS)

2. **Lead Capture**:
   - [ ] Form loads correctly
   - [ ] Validation works
   - [ ] Submission succeeds
   - [ ] Confirmation displayed
   - [ ] Data appears in database

3. **CRM Functions**:
   - [ ] Lead list loads
   - [ ] Lead details display
   - [ ] Update lead works
   - [ ] Create opportunity works

4. **Authentication** (when implemented):
   - [ ] Login works
   - [ ] Logout works
   - [ ] Session persists
   - [ ] Protected routes work

5. **API Endpoints**:
```bash
# Test each critical endpoint
curl -X POST https://hidden-key-investments.netlify.app/.netlify/functions/lead-ingest-enhanced \
  -H "Content-Type: application/json" \
  -d '{"source":"test","contact":{"email":"test@example.com"}}'
```

### Monitoring Checks

**Verify in Dashboards**:

1. **Netlify**:
   - [ ] Build succeeded
   - [ ] No function errors
   - [ ] Bandwidth normal
   - [ ] Response times < 200ms

2. **Sentry** (if configured):
   - [ ] No new error spikes
   - [ ] Error rate < 1%
   - [ ] No performance regressions

3. **Database** (Supabase):
   - [ ] Connection pool healthy
   - [ ] Query performance normal
   - [ ] No deadlocks
   - [ ] Storage within limits

4. **Business Metrics**:
   - [ ] Leads being created
   - [ ] Workflows executing
   - [ ] No data anomalies

### Smoke Test Script

```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://hidden-key-investments.netlify.app"

echo "🔍 Running smoke tests..."

# Test 1: Homepage
echo "Testing homepage..."
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $response -eq 200 ]; then
  echo "✅ Homepage: PASS"
else
  echo "❌ Homepage: FAIL (HTTP $response)"
  exit 1
fi

# Test 2: Health endpoint (when implemented)
# echo "Testing health endpoint..."
# response=$(curl -s $BASE_URL/api/health)
# if echo $response | grep -q '"status":"healthy"'; then
#   echo "✅ Health check: PASS"
# else
#   echo "❌ Health check: FAIL"
#   exit 1
# fi

# Test 3: API function
echo "Testing lead ingestion..."
response=$(curl -s -X POST $BASE_URL/.netlify/functions/lead-ingest-enhanced \
  -H "Content-Type: application/json" \
  -d '{"source":"test","contact":{"email":"smoketest@example.com","firstName":"Test","lastName":"User"}}' \
  -w "%{http_code}" -o /tmp/response.json)

if [ $response -eq 201 ]; then
  echo "✅ Lead ingestion: PASS"
else
  echo "❌ Lead ingestion: FAIL (HTTP $response)"
  cat /tmp/response.json
  exit 1
fi

echo "✅ All smoke tests passed!"
```

## Troubleshooting

### Common Issues

**1. Build Fails**

**Symptoms**: Netlify build fails, site doesn't update

**Diagnosis**:
```bash
# Check build logs in Netlify Dashboard
# Or locally
npm run build
```

**Solutions**:
- Check for TypeScript errors
- Verify all dependencies installed
- Check environment variables
- Review recent changes

**2. Function Timeout**

**Symptoms**: API requests timeout after 10 seconds

**Diagnosis**:
```bash
# Check function logs in Netlify Dashboard
netlify functions:log lead-ingest-enhanced
```

**Solutions**:
- Optimize database queries
- Add indexes
- Implement caching
- Increase function timeout (Netlify settings)

**3. Database Connection Issues**

**Symptoms**: "Could not connect to database" errors

**Diagnosis**:
```bash
# Test connection
psql "postgresql://postgres:[password]@[host]:5432/postgres" -c "SELECT 1;"
```

**Solutions**:
- Check Supabase service status
- Verify connection string
- Check firewall rules
- Verify credentials haven't expired

**4. High Error Rate**

**Symptoms**: Sentry shows spike in errors

**Diagnosis**:
- Check Sentry dashboard for error patterns
- Review error messages
- Check recent deployments

**Solutions**:
- Rollback if recent deployment
- Fix critical errors immediately
- Schedule fix for low-priority errors

### Emergency Contacts

- **On-Call Engineer**: See on-call rotation at https://[your-pagerduty-or-opsgenie].com
- **DevOps**: devops@hiddenkey.io
- **Security**: security@hiddenkey.io
- **Netlify Support**: https://answers.netlify.com/
- **Supabase Support**: support@supabase.io

### Escalation Path

1. **Level 1**: Developer who made change
2. **Level 2**: Team lead / Senior engineer
3. **Level 3**: Engineering manager
4. **Level 4**: CTO / Executive team

## Deployment Schedule

### Recommended Schedule

**Development**: Continuous (any time)

**Staging**: 
- Feature deployments: Any time during business hours
- Major changes: After QA approval

**Production**:
- Regular releases: Tuesdays and Thursdays, 10 AM PST
- Hotfixes: Any time (with approval)
- Database migrations: Tuesdays, 2 AM UTC (low traffic)
- Major releases: First Tuesday of month

### Blackout Periods

**No deployments during**:
- Friday afternoons (3 PM - 5 PM PST)
- Weekends (except emergency hotfixes)
- Major holidays
- Tax season peaks (Jan 15 - Apr 15)
- End of quarter (last 3 days)

## Changelog Template

```markdown
# Changelog

## [1.0.1] - 2025-10-27

### Added
- New lead capture form with enhanced validation
- Sentry error tracking integration

### Changed
- Updated CI/CD pipeline with security scanning
- Improved observability logging

### Fixed
- Fixed validation error on phone number format
- Corrected date formatting in reports

### Security
- Added Trivy vulnerability scanning
- Updated security headers
```

## Version History

- v1.0 (2025-10-27): Initial deployment runbook
- Updates: After major deployments or incidents
