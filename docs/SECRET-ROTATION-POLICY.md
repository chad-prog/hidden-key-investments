# Secret Rotation Policy

**Last Updated**: 2025-10-27  
**Review Frequency**: Quarterly  
**Owner**: DevOps Team

## Overview

This document defines the policy and procedures for rotating secrets and credentials used in the Hidden Key Investments platform to maintain security and compliance.

## Rotation Schedule

### Critical Secrets (Rotate Quarterly)

#### 1. Database Credentials
- **What**: Supabase service role keys, connection strings
- **When**: Every 3 months or immediately after team member departure
- **Impact**: High - Requires downtime coordination
- **Procedure**: See [Database Credential Rotation](#database-credential-rotation)

#### 2. API Keys (External Services)
- **What**: Mailchimp, Airtable, SendGrid, Twilio, DocuSign
- **When**: Every 3 months or on security advisory
- **Impact**: Medium - Can be done with zero downtime
- **Procedure**: See [API Key Rotation](#api-key-rotation)

#### 3. OAuth Client Secrets
- **What**: OAuth application secrets for third-party integrations
- **When**: Every 6 months or on security event
- **Impact**: Medium - May require user re-authentication
- **Procedure**: See [OAuth Secret Rotation](#oauth-secret-rotation)

### Standard Secrets (Rotate Semi-Annually)

#### 4. Webhook Signing Secrets
- **What**: Secrets used to validate webhook payloads
- **When**: Every 6 months
- **Impact**: Low - Can support dual keys during transition
- **Procedure**: See [Webhook Secret Rotation](#webhook-secret-rotation)

#### 5. Encryption Keys
- **What**: Keys used for data encryption at rest
- **When**: Every 6 months
- **Impact**: High - Requires data re-encryption
- **Procedure**: Contact security team

### Low-Priority Secrets (Rotate Annually)

#### 6. CI/CD Tokens
- **What**: GitHub Actions secrets, deployment tokens
- **When**: Annually or on exposure
- **Impact**: Low - Automated deployments only
- **Procedure**: See [CI/CD Token Rotation](#cicd-token-rotation)

## Emergency Rotation

Immediately rotate secrets if:
1. A team member with access leaves the organization
2. A secret is accidentally committed to version control
3. A security breach is suspected or confirmed
4. A vendor reports a security incident
5. A secret appears in logs or monitoring systems

## Rotation Procedures

### Database Credential Rotation

**Preparation (1 week before)**:
1. Schedule maintenance window (Sunday 2-4 AM EST)
2. Notify team and stakeholders
3. Create runbook for rollback
4. Test rotation in staging environment

**Rotation Steps**:
```bash
# 1. Create new credentials in Supabase
# Supabase Dashboard → Settings → Database → Create new service key

# 2. Update Netlify environment variables
# Netlify Dashboard → Site settings → Environment variables
# Add new: SUPABASE_SERVICE_ROLE_KEY_NEW=<new_key>

# 3. Deploy application with dual credential support
git checkout -b secret-rotation/db-$(date +%Y%m%d)
# Update functions to try NEW key first, fallback to old
git commit -am "feat: add dual db credential support"
git push origin secret-rotation/db-$(date +%Y%m%d)
# Deploy via Netlify

# 4. Monitor for 24 hours - ensure no errors

# 5. Remove old credentials
# Netlify Dashboard → Remove SUPABASE_SERVICE_ROLE_KEY (old)
# Rename SUPABASE_SERVICE_ROLE_KEY_NEW to SUPABASE_SERVICE_ROLE_KEY

# 6. Revoke old key in Supabase
# Supabase Dashboard → Settings → Database → Revoke old key

# 7. Remove dual support from code
git commit -am "chore: remove old db credential fallback"
git push
```

**Rollback Plan**:
- Keep old credentials active for 7 days
- Document known issues and resolutions
- Have direct database access ready

### API Key Rotation

**Zero-Downtime Rotation**:
```bash
# 1. Generate new API keys from service providers
# Mailchimp: Account → Extras → API keys → Create Key
# Airtable: Account → API → Generate new token
# SendGrid: Settings → API Keys → Create API Key
# Twilio: Console → Settings → API Credentials

# 2. Add new keys to Netlify (keep old ones)
VITE_MAILCHIMP_API_KEY_NEW=<new_key>
MAILCHIMP_API_KEY_NEW=<new_key>

# 3. Update application to try new keys first
# Edit netlify/functions/mailchimp-sync.js
const API_KEY = process.env.MAILCHIMP_API_KEY_NEW || process.env.MAILCHIMP_API_KEY;

# 4. Deploy and monitor for 48 hours

# 5. Remove old keys from environment and code
# Revoke old keys in service provider dashboards
```

### OAuth Secret Rotation

**Preparation**:
1. Review OAuth applications using the secret
2. Plan user communication strategy
3. Test new credentials in staging

**Steps**:
```bash
# 1. Generate new client secret in OAuth provider
# Google: Cloud Console → Credentials → Edit OAuth Client
# GitHub: Settings → Developer settings → OAuth Apps → Edit

# 2. Update both old and new in Netlify
OAUTH_CLIENT_SECRET=<old_secret>
OAUTH_CLIENT_SECRET_NEW=<new_secret>

# 3. Update code to support both secrets during transition

# 4. Force re-authentication for users over 7 days
# Set session expiry, clear refresh tokens

# 5. After all users migrated, remove old secret
```

### Webhook Secret Rotation

**Dual-Secret Period**:
```bash
# 1. Generate new webhook secret
WEBHOOK_SECRET_PRIMARY=<current>
WEBHOOK_SECRET_SECONDARY=<new>

# 2. Update validation to accept both
function validateWebhook(signature, payload) {
  return (
    verifySignature(signature, payload, PRIMARY_SECRET) ||
    verifySignature(signature, payload, SECONDARY_SECRET)
  );
}

# 3. Update webhook configuration in provider
# Gradually migrate webhooks to new secret

# 4. After 30 days, remove old secret
```

### CI/CD Token Rotation

```bash
# 1. Generate new GitHub token
# GitHub → Settings → Developer settings → Personal access tokens

# 2. Update in GitHub Secrets
# Repository → Settings → Secrets and variables → Actions
# Update: NETLIFY_AUTH_TOKEN, CODECOV_TOKEN, etc.

# 3. Test by triggering CI/CD pipeline

# 4. Revoke old token in GitHub
```

## Secret Inventory

### Production Environment

| Secret Name | Type | Rotation Schedule | Last Rotated | Next Rotation | Owner |
|-------------|------|-------------------|--------------|---------------|-------|
| SUPABASE_SERVICE_ROLE_KEY | Database | Quarterly | - | - | DevOps |
| MAILCHIMP_API_KEY | API Key | Quarterly | - | - | Marketing |
| AIRTABLE_API_KEY | API Key | Quarterly | - | - | DevOps |
| SENDGRID_API_KEY | API Key | Quarterly | - | - | DevOps |
| TWILIO_AUTH_TOKEN | API Key | Quarterly | - | - | DevOps |
| SENTRY_DSN | API Key | Semi-Annual | - | - | DevOps |
| GITHUB_TOKEN | CI/CD | Annual | - | - | DevOps |
| NETLIFY_AUTH_TOKEN | CI/CD | Annual | - | - | DevOps |
| CODECOV_TOKEN | CI/CD | Annual | - | - | DevOps |

### Staging Environment

Staging secrets should be rotated on the same schedule but can use the same credentials as production in some cases (observability, monitoring).

## Compliance Requirements

### GDPR
- Maintain audit log of all secret rotations
- Document who has access to each secret
- Revoke access within 24 hours of employee departure

### SOC 2
- Rotate secrets on defined schedule
- Log all secret access and modifications
- Maintain separation of duties (no single person has all secrets)

### PCI DSS (if applicable)
- Rotate payment processing secrets quarterly
- Never store secrets in code or version control
- Encrypt secrets at rest and in transit

## Audit Logging

All secret rotations must be logged:

```json
{
  "timestamp": "2025-10-27T10:00:00Z",
  "action": "SECRET_ROTATED",
  "secretName": "SUPABASE_SERVICE_ROLE_KEY",
  "environment": "production",
  "performedBy": "john.doe@company.com",
  "previousKeyHash": "sha256:abc123...",
  "newKeyHash": "sha256:def456...",
  "reason": "scheduled_quarterly_rotation",
  "approvedBy": "jane.smith@company.com"
}
```

Store logs in:
- `docs/audit-logs/secret-rotations.log`
- Centralized logging system (if available)

## Team Responsibilities

### DevOps Team
- Execute scheduled rotations
- Respond to emergency rotations
- Maintain this document
- Train team members

### Security Team
- Review rotation procedures
- Audit rotation logs quarterly
- Approve emergency rotations
- Update security policies

### Development Team
- Design applications for secret rotation support
- Test rotation procedures in staging
- Report suspected secret exposure immediately

## Tools & Resources

### Secret Management
- **Netlify Environment Variables**: For production/staging secrets
- **GitHub Secrets**: For CI/CD pipeline
- **1Password/LastPass**: For team secret sharing (if needed)
- **HashiCorp Vault**: For advanced secret management (future)

### Monitoring
- **Sentry**: Alert on authentication failures
- **Netlify Analytics**: Monitor function error rates
- **GitHub Actions**: Track CI/CD failures

### Documentation
- **Netlify Dashboard**: Current environment variables
- **GitHub Repository**: Secret names (not values!)
- **This Document**: Rotation procedures

## Checklist: Quarterly Secret Rotation

```markdown
### Q1 2025 Secret Rotation
- [ ] Review secret inventory
- [ ] Schedule maintenance windows
- [ ] Rotate database credentials
- [ ] Rotate API keys (Mailchimp, Airtable, SendGrid, Twilio)
- [ ] Test all integrations in staging
- [ ] Monitor production for 48 hours
- [ ] Update audit log
- [ ] Revoke old secrets
- [ ] Document lessons learned
- [ ] Update next rotation dates
```

## Emergency Contact

**Security Incident**: security@hiddenkey.io  
**On-Call DevOps**: See `docs/DEPLOYMENT-RUNBOOK.md`  
**Management Escalation**: CTO

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-27 | Initial policy created | DevOps Team |

---

**Next Review Date**: 2026-01-27  
**Document Owner**: DevOps Team  
**Approval Status**: Active
