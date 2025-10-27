# Secret Rotation Log

**Last Updated**: 2025-10-27  
**Rotation Policy**: Every 90 days

## Active Secrets

| Secret Name | Last Rotated | Next Rotation | Status | Notes |
|-------------|--------------|---------------|--------|-------|
| SUPABASE_KEY | 2025-10-27 | 2026-01-25 | ✅ Current | Production database access |
| SUPABASE_URL | 2025-10-27 | 2026-01-25 | ✅ Current | Database endpoint |
| MAILCHIMP_API_KEY | - | 2026-01-25 | ⚠️ Not Set | Email marketing |
| AIRTABLE_API_KEY | - | 2026-01-25 | ⚠️ Not Set | CRM sync |
| SENTRY_DSN | - | 2026-01-25 | ⚠️ Not Set | Error tracking |
| GITHUB_TOKEN | - | 2026-01-25 | ⚠️ Not Set | CI/CD access |

## Rotation History

| Date | Secret | Action | Performed By |
|------|--------|--------|--------------|
| 2025-10-27 | Initial | Setup rotation tracking | Automated |

## Rotation Checklist

When rotating secrets:
- [ ] Generate new secret in service dashboard
- [ ] Update Netlify environment variables
- [ ] Update GitHub Secrets (if applicable)
- [ ] Update local .env.local for testing
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Verify functionality
- [ ] Revoke old secret after 24 hours
- [ ] Update this log file

## Emergency Contacts

If a secret is compromised:
1. Immediately revoke the compromised secret
2. Generate and deploy a new secret
3. Review audit logs for unauthorized access
4. Document the incident
5. Notify relevant stakeholders
