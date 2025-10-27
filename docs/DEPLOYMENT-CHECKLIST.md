# Deployment Checklist

**Purpose**: Ensure safe, reliable deployments to all environments  
**Last Updated**: 2025-10-27  
**Review**: Before each production deployment

## Pre-Deployment Checklist

### Code Quality ✅
- [ ] All tests passing locally (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Test coverage meets threshold (>70%)
- [ ] Code reviewed and approved
- [ ] No merge conflicts

### Security 🔒
- [ ] No secrets in code
- [ ] Dependencies up to date
- [ ] Security scan passed (Trivy)
- [ ] No critical vulnerabilities
- [ ] Environment variables validated
- [ ] API keys rotated (if needed)

### Documentation 📚
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] API documentation current
- [ ] Migration guides created (if needed)
- [ ] Runbooks updated

### Database 🗄️
- [ ] Backup created
- [ ] Migration scripts tested
- [ ] Rollback plan documented
- [ ] No breaking schema changes (or properly handled)
- [ ] Indexes optimized

## Environment-Specific Checklists

### Development Environment
- [ ] Local build succeeds
- [ ] All tests pass
- [ ] Demo mode works
- [ ] Hot reload functional

### Staging Environment
- [ ] Deploy to staging
- [ ] Smoke tests pass
- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] API endpoints responsive
- [ ] UI loads properly
- [ ] Key user flows work
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Logs accessible

### Production Environment
- [ ] **STOP**: Staging tests all passed?
- [ ] **STOP**: Change window approved?
- [ ] **STOP**: Team notified?
- [ ] **STOP**: Rollback plan ready?

#### Pre-Deploy
- [ ] Create database backup
- [ ] Document current version
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders
- [ ] Prepare rollback commands
- [ ] Check system health

#### Deploy
- [ ] Merge to main branch
- [ ] Wait for CI/CD to pass
- [ ] Monitor deployment progress
- [ ] Verify deployment completes
- [ ] Check Netlify build logs

#### Post-Deploy Verification
- [ ] Application loads successfully
- [ ] Health check endpoint responds (200 OK)
- [ ] Database connections work
- [ ] API endpoints accessible
- [ ] Authentication works
- [ ] Key features functional
- [ ] No error spikes in logs
- [ ] Performance within SLOs
- [ ] Monitoring shows green
- [ ] No alerts triggered

#### Smoke Tests (Production)
- [ ] Homepage loads
- [ ] Lead capture form works
- [ ] CRM pages load
- [ ] API returns data
- [ ] Authentication flows work
- [ ] Search functionality works
- [ ] Navigation works
- [ ] Mobile view works

## Rollback Plan

### When to Rollback
- Critical errors in production
- Data corruption detected
- Performance degradation >50%
- Security vulnerability exposed
- Core features broken
- High error rate (>5%)

### Rollback Steps
```bash
# 1. Notify team
# Post to Slack: "Rolling back production deploy due to [issue]"

# 2. Revert in Netlify (if needed)
# Netlify UI → Deploys → Previous deploy → Publish

# 3. Revert database migrations (if needed)
# Run rollback scripts prepared in pre-deploy

# 4. Verify rollback
# Run post-deploy verification steps

# 5. Document incident
# Create post-mortem in docs/incidents/
```

## Feature Flag Checklist

### Before Enabling Feature
- [ ] Feature tested in staging
- [ ] User documentation ready
- [ ] Support team trained
- [ ] Analytics tracking configured
- [ ] Rollback plan documented

### Gradual Rollout
- [ ] Enable for internal users (0-1%)
- [ ] Monitor for 24 hours
- [ ] Enable for 5% of users
- [ ] Monitor for 48 hours
- [ ] Enable for 25% of users
- [ ] Monitor for 1 week
- [ ] Enable for 100% of users

### Monitoring Post-Enablement
- [ ] Error rate stable
- [ ] Performance within SLOs
- [ ] User feedback positive
- [ ] No support tickets spike
- [ ] Analytics show expected behavior

## Database Migration Checklist

### Pre-Migration
- [ ] Backup database
- [ ] Test migration on staging
- [ ] Write rollback migration
- [ ] Document migration steps
- [ ] Estimate migration time
- [ ] Schedule maintenance window (if needed)

### Migration Execution
- [ ] Put app in maintenance mode (if needed)
- [ ] Run migration
- [ ] Verify data integrity
- [ ] Run post-migration tests
- [ ] Check application logs
- [ ] Restore normal operation

### Post-Migration
- [ ] Verify all features work
- [ ] Monitor performance
- [ ] Check for errors
- [ ] Document completion
- [ ] Update schema documentation

## API Deployment Checklist

### API Changes
- [ ] Backward compatible
- [ ] Version number updated
- [ ] Deprecation notices added (if needed)
- [ ] API documentation updated
- [ ] Client libraries updated
- [ ] Breaking changes communicated
- [ ] Migration guide provided

### API Testing
- [ ] Integration tests pass
- [ ] Postman/Insomnia collection updated
- [ ] Response times acceptable
- [ ] Error handling works
- [ ] Rate limiting works
- [ ] Authentication works

## Third-Party Integration Checklist

### New Integration
- [ ] API keys secured in environment
- [ ] Error handling implemented
- [ ] Retry logic configured
- [ ] Rate limiting handled
- [ ] Monitoring configured
- [ ] Fallback behavior defined
- [ ] Documentation created

### Integration Changes
- [ ] Staging tested
- [ ] Error scenarios handled
- [ ] No breaking changes (or handled)
- [ ] Logs configured
- [ ] Alerts set up

## Monitoring & Alerts Checklist

### Post-Deploy Monitoring
**First 15 minutes**:
- [ ] Check error rate (should be <0.1%)
- [ ] Check response times (should be <200ms p95)
- [ ] Check deployment logs
- [ ] Check application logs

**First hour**:
- [ ] Monitor Sentry for new errors
- [ ] Check API response times
- [ ] Verify database performance
- [ ] Check server resources

**First 24 hours**:
- [ ] Review error trends
- [ ] Check performance trends
- [ ] Monitor user behavior
- [ ] Review support tickets

### Alert Thresholds
- [ ] Error rate >1% → PagerDuty alert
- [ ] Response time >500ms → Warning
- [ ] Response time >1s → Alert
- [ ] CPU >80% → Warning
- [ ] Memory >90% → Alert
- [ ] Disk >85% → Warning

## Communication Checklist

### Pre-Deploy Communication
- [ ] Notify development team
- [ ] Notify product team
- [ ] Notify support team
- [ ] Post to Slack #deploys channel
- [ ] Update status page (if maintenance)

### Deploy Communication
- [ ] Post deploy start notification
- [ ] Update progress
- [ ] Post deploy completion
- [ ] Share verification results

### Post-Deploy Communication
- [ ] Announce new features
- [ ] Update documentation
- [ ] Send release notes
- [ ] Schedule retrospective (if issues)

## Compliance Checklist

### Data Privacy
- [ ] No PII in logs
- [ ] Data encryption enabled
- [ ] Access controls verified
- [ ] Audit logging active
- [ ] Privacy policy updated (if needed)

### Security
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validation active
- [ ] Output sanitization enabled

## Release Notes Template

```markdown
# Release vX.Y.Z - YYYY-MM-DD

## New Features
- Feature 1 description
- Feature 2 description

## Improvements
- Improvement 1
- Improvement 2

## Bug Fixes
- Bug fix 1
- Bug fix 2

## Breaking Changes
⚠️ **BREAKING**: Description of breaking change
Migration guide: [link]

## Database Migrations
- Migration description
- Rollback instructions: [link]

## Configuration Changes
- New environment variables
- Changed settings

## Known Issues
- Issue 1 (workaround: ...)
- Issue 2 (fix planned: ...)

## Deployment Notes
- Special deployment considerations
- Rollback procedure: [link]
```

## Emergency Procedures

### Production Down
1. **Assess** severity (how many users affected?)
2. **Communicate** (post to status page, notify team)
3. **Investigate** (check logs, monitoring, recent changes)
4. **Fix or Rollback** (choose fastest path to recovery)
5. **Verify** (run smoke tests)
6. **Document** (create incident report)

### Data Loss Incident
1. **Stop writes** (prevent further damage)
2. **Assess scope** (what data affected?)
3. **Restore from backup** (most recent clean backup)
4. **Verify integrity** (check restored data)
5. **Resume operations** (enable writes)
6. **Post-mortem** (prevent recurrence)

### Security Incident
1. **Contain** (isolate affected systems)
2. **Assess** (scope of breach)
3. **Eradicate** (remove threat)
4. **Recover** (restore services)
5. **Notify** (affected users, authorities if required)
6. **Post-incident review** (improve security)

## Sign-Off

### Deployment Approval
- [ ] **Developer**: Code ready, tests pass
  - Name: _________________ Date: _______
  
- [ ] **QA**: Testing complete, no blockers
  - Name: _________________ Date: _______
  
- [ ] **Product**: Features approved
  - Name: _________________ Date: _______
  
- [ ] **DevOps**: Infrastructure ready
  - Name: _________________ Date: _______

### Post-Deploy Sign-Off
- [ ] **DevOps**: Deployment successful, monitoring green
  - Name: _________________ Date: _______
  
- [ ] **QA**: Smoke tests pass
  - Name: _________________ Date: _______

---

## Quick Reference Commands

```bash
# Local testing
npm test
npm run lint
npm run build

# Deploy to staging (automatic on branch push)
git push origin staging

# Check deployment status
netlify status

# View logs
netlify functions:log

# Rollback in Netlify
# Use UI: Deploys → Previous → Publish

# Database backup (Supabase)
# Use UI: Database → Backups → Download

# Emergency kill switch
# Update .env: MAINTENANCE_MODE=true
```

---

**Remember**: It's better to postpone a deploy than to deploy with uncertainty. When in doubt, test more!

**Last Updated**: 2025-10-27  
**Next Review**: After each major deploy
