# Phase 1: Infrastructure Activation Guide

**Status**: 95% Complete - Ready for Activation  
**Timeline**: 0-2 weeks  
**ROI**: EXTREMELY HIGH 🎯  
**Last Updated**: 2025-10-27

## Overview

Phase 1 infrastructure is nearly complete. This guide provides step-by-step instructions to activate the remaining 5% and achieve 100% production readiness.

## What's Already Complete ✅

### 1. CI/CD Pipeline (100%)
- ✅ GitHub Actions workflow configured
- ✅ Automated testing on PRs
- ✅ Security scanning (Trivy, Gitleaks, TruffleHog)
- ✅ Build validation
- ✅ Codecov integration
- ✅ Multi-environment support
- ✅ Automated deployments to Netlify

### 2. Testing Infrastructure (100%)
- ✅ Vitest configured and working
- ✅ 72 tests passing (19 main + 53 functions)
- ✅ Coverage reporting setup
- ✅ Test fixtures and utilities
- ✅ Integration test patterns established

### 3. Database Schema (100%)
- ✅ Production-ready PostgreSQL schema
- ✅ 7 tables with proper relationships
- ✅ Indexes and constraints
- ✅ Migration scripts ready
- ✅ Audit logging tables

### 4. Documentation (100%)
- ✅ 38+ comprehensive guides
- ✅ API reference documentation
- ✅ Architecture documentation
- ✅ Security policies
- ✅ Deployment runbooks

## What Needs Activation (5%)

### Task 1: Activate Sentry Error Tracking (15 minutes)

**Why**: Essential for production error monitoring and debugging

**Current Status**: Code is ready but commented out in `src/main.tsx`

**Steps**:

1. **Create Sentry Account** (5 minutes)
   ```bash
   # Go to https://sentry.io
   # Sign up for free account
   # Create new project: "Hidden Key Investments"
   # Framework: React
   # Copy the DSN (looks like: https://xxxx@xxxx.ingest.sentry.io/xxxx)
   ```

2. **Set Environment Variables** (5 minutes)
   ```bash
   # In Netlify UI: Site settings → Environment variables
   # Add these variables for all deploy contexts (Production, Preview, Branch):
   
   VITE_SENTRY_DSN=your_sentry_dsn_here
   VITE_APP_VERSION=1.0.0
   VITE_SENTRY_ENVIRONMENT=production  # or staging/preview
   ```

3. **Uncomment Sentry Code** (2 minutes)
   ```typescript
   // File: src/main.tsx
   // Uncomment lines 36-58 (Sentry initialization)
   
   import * as Sentry from "@sentry/react";
   
   if (import.meta.env.VITE_SENTRY_DSN) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
       release: import.meta.env.VITE_APP_VERSION,
       // ... rest of config
     });
   }
   ```

4. **Deploy and Test** (3 minutes)
   ```bash
   git add src/main.tsx
   git commit -m "feat(observability): activate Sentry error tracking"
   git push
   
   # Wait for deployment
   # Visit your site and trigger an error
   # Check Sentry dashboard for the error event
   ```

**Success Criteria**:
- [ ] Sentry dashboard shows incoming events
- [ ] Errors are captured with full stack traces
- [ ] Performance monitoring is active
- [ ] Source maps are uploaded for better debugging

**Resources**:
- Sentry React Docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Environment variable guide: `docs/ENVIRONMENT-VARIABLES.md`

---

### Task 2: Create Staging Environment (30 minutes)

**Why**: Safe environment for testing before production deployment

**Current Status**: Netlify configured, needs database setup

**Steps**:

1. **Create Staging Database** (10 minutes)
   ```bash
   # Go to https://supabase.com
   # Create new project: "hidden-key-staging"
   # Region: Choose closest to your users
   # Database Password: Generate strong password (save securely!)
   # Wait for project creation (~2 minutes)
   ```

2. **Run Database Migrations** (5 minutes)
   ```bash
   # Get connection string from Supabase dashboard
   # Settings → Database → Connection string (URI)
   
   # Run setup script
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
     -f supabase-sql/01-setup.sql
   
   # Verify tables created
   psql "your-connection-string" -c "\dt"
   # Should show: leads, opportunities, investors, activities, 
   #              workflows, workflow_executions, audit_log
   ```

3. **Configure Netlify Environment** (10 minutes)
   ```bash
   # In Netlify UI: Site settings → Environment variables
   # Set "Scope" to "staging" for these variables:
   
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   
   # Get keys from Supabase: Settings → API
   ```

4. **Create Staging Branch** (5 minutes)
   ```bash
   git checkout -b staging
   git push origin staging
   
   # In Netlify: Site settings → Build & deploy → Deploy contexts
   # Enable "Deploy branch deploys" for "staging" branch
   ```

**Success Criteria**:
- [ ] Staging database has all tables
- [ ] Staging environment variables configured
- [ ] Staging branch auto-deploys to separate URL
- [ ] Can create a test lead in staging
- [ ] Data isolated from production

**Resources**:
- Full staging setup guide: `docs/STAGING-SETUP.md`
- Supabase documentation: https://supabase.com/docs

---

### Task 3: Set Up Secret Rotation Schedule (15 minutes)

**Why**: Security best practice and compliance requirement

**Current Status**: Policy documented, needs activation

**Steps**:

1. **Inventory All Secrets** (5 minutes)
   ```bash
   # Review and document:
   - Supabase API keys (anon, service role)
   - Netlify deploy tokens
   - GitHub personal access tokens
   - Any third-party API keys (when added)
   
   # Create a secure document (password manager or encrypted file)
   # For each secret, note:
   - Name
   - Where it's used
   - Last rotated date
   - Next rotation date (90 days)
   ```

2. **Schedule Rotation Reminders** (5 minutes)
   ```bash
   # Use your calendar app or project management tool
   # Set recurring reminders:
   
   - Quarterly (every 90 days): Rotate all API keys
   - Monthly: Review access logs
   - Weekly: Check Sentry for security alerts
   ```

3. **Test Rotation Process** (5 minutes)
   ```bash
   # In staging environment:
   
   # 1. Generate new Supabase anon key
   # 2. Update Netlify environment variable
   # 3. Redeploy staging
   # 4. Test that application still works
   # 5. Document any issues or steps needed
   ```

**Success Criteria**:
- [ ] All secrets documented
- [ ] Rotation schedule established
- [ ] Calendar reminders set
- [ ] Rotation procedure tested in staging
- [ ] Team trained on process

**Resources**:
- Secret rotation policy: `docs/SECRET-ROTATION-POLICY.md`
- Security best practices: `docs/SECURITY-POLICY.md`

---

## Additional Infrastructure Enhancements

### Optional Task 4: Enhanced Environment Validation (30 minutes)

**Why**: Catch configuration issues before deployment

**Status**: Basic validation exists, can be enhanced

**Implementation**:

```bash
# Create enhanced validation script
cat > scripts/validate-deployment.sh << 'EOF'
#!/bin/bash
set -e

echo "🔍 Validating deployment environment..."

# Check required environment variables
required_vars=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_SENTRY_DSN"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
  echo "✅ $var is set"
done

# Test Supabase connection
echo "Testing Supabase connection..."
curl -f "${VITE_SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  > /dev/null 2>&1
echo "✅ Supabase connection successful"

# Test Sentry DSN format
if [[ ! $VITE_SENTRY_DSN =~ ^https://.*@.*\.ingest\.sentry\.io/.* ]]; then
  echo "❌ Invalid Sentry DSN format"
  exit 1
fi
echo "✅ Sentry DSN format valid"

echo "✨ All validations passed!"
EOF

chmod +x scripts/validate-deployment.sh
```

**Add to CI/CD**:
```yaml
# .github/workflows/ci.yml
# Add this step before deployment:

- name: Validate Deployment Environment
  run: bash scripts/validate-deployment.sh
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

---

## Verification Checklist

After completing all activation tasks, verify:

### System Health
- [ ] CI/CD pipeline runs successfully on new commits
- [ ] All tests passing (72/72)
- [ ] Linting shows 0 errors
- [ ] Build completes in <5 seconds
- [ ] Security scans show no critical issues

### Observability
- [ ] Sentry dashboard receiving events
- [ ] Error tracking working
- [ ] Performance monitoring active
- [ ] Alerts configured for critical errors

### Environments
- [ ] Production environment configured
- [ ] Staging environment configured
- [ ] Preview deployments working
- [ ] Environment variables set correctly
- [ ] Database migrations applied

### Security
- [ ] All secrets documented
- [ ] Rotation schedule established
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Vulnerability scanning active

### Documentation
- [ ] All activation steps documented
- [ ] Team trained on new tools
- [ ] Runbooks updated
- [ ] On-call procedures defined

---

## Post-Activation Next Steps

Once Phase 1 is 100% complete:

1. **Immediate** (Week 1-2): Begin Phase 2 Core MVP development
   - Start with Lead Management UI
   - High operational value
   - Clear requirements
   
2. **Short-term** (Week 3-4): Continue CRM UI development
   - Opportunity Pipeline
   - Investor Management
   - Workflow Builder UI

3. **Medium-term** (Week 5-8): Add integrations
   - Communication tools (SendGrid/Twilio)
   - Data enrichment APIs
   - Analytics dashboard

See `docs/WHAT-I-CAN-BUILD-NOW.md` for detailed implementation plans.

---

## Troubleshooting

### Sentry Not Receiving Events

**Problem**: Sentry dashboard shows no events
**Solution**:
```bash
# 1. Check DSN is set correctly
echo $VITE_SENTRY_DSN

# 2. Check Sentry is initialized
# Look in browser console for: "[Sentry] SDK initialized"

# 3. Trigger a test error
# Add this temporarily to your app:
throw new Error("Sentry test error");

# 4. Check source maps are uploaded
# In sentry.io: Settings → Projects → Source Maps
```

### Staging Database Connection Issues

**Problem**: Cannot connect to Supabase staging database
**Solution**:
```bash
# 1. Verify connection string
# Supabase dashboard → Settings → Database

# 2. Check IP whitelist (if using)
# Supabase dashboard → Settings → Database → IP Restrictions

# 3. Test connection
psql "your-connection-string" -c "SELECT 1;"

# 4. Check Supabase project status
# Dashboard should show "Healthy"
```

### Environment Variable Not Applied

**Problem**: Environment variable changes not taking effect
**Solution**:
```bash
# 1. Clear Netlify cache
# Site settings → Build & deploy → Clear cache and retry deploy

# 2. Verify variable scope
# Make sure variables are set for correct deploy context

# 3. Redeploy
git commit --allow-empty -m "trigger deploy"
git push

# 4. Check build logs
# Netlify dashboard → Deploys → [latest] → Deploy log
```

---

## Success Metrics

### Technical Metrics
- Build time: <5s ✅
- Test coverage: >70% ✅
- Error rate: <0.1% (after Sentry activation)
- Uptime: >99.9% (after staging setup)
- Security score: A+ (after all activations)

### Team Metrics
- Developer onboarding: <1 hour
- Time to deploy: <5 minutes
- Incident response: <15 minutes
- Mean time to recovery: <30 minutes

---

## Resources

### Internal Documentation
- `docs/CURRENT-STATUS.md` - Platform status
- `docs/STAGING-SETUP.md` - Detailed staging guide
- `docs/ENVIRONMENT-VARIABLES.md` - Configuration reference
- `docs/SECURITY-POLICY.md` - Security guidelines
- `docs/DEPLOYMENT-RUNBOOK.md` - Deployment procedures

### External Resources
- Sentry React: https://docs.sentry.io/platforms/javascript/guides/react/
- Supabase: https://supabase.com/docs
- Netlify: https://docs.netlify.com
- Vitest: https://vitest.dev

---

**Once complete, Phase 1 will be 100% operational. Your platform will be production-ready with world-class infrastructure.** 🚀
