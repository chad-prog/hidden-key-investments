#!/bin/bash
# Secret rotation automation script
# Helps manage and rotate API keys and secrets

set -e

SECRETS_FILE="docs/SECRET-ROTATION-LOG.md"
ROTATION_DAYS=90  # Rotate secrets every 90 days

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Secret Rotation Manager"
echo "=========================================="
echo ""

# Function to calculate days since a date
days_since() {
    local date=$1
    local now=$(date +%s)
    local then=$(date -d "$date" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$date" +%s 2>/dev/null)
    echo $(( ($now - $then) / 86400 ))
}

# Function to add days to current date
add_days() {
    local days=$1
    date -d "+${days} days" +%Y-%m-%d 2>/dev/null || date -v+${days}d +%Y-%m-%d 2>/dev/null
}

# Create secrets log file if it doesn't exist
if [ ! -f "$SECRETS_FILE" ]; then
    echo "Creating secret rotation log file..."
    cat > "$SECRETS_FILE" <<EOF
# Secret Rotation Log

**Last Updated**: $(date +%Y-%m-%d)  
**Rotation Policy**: Every $ROTATION_DAYS days

## Active Secrets

| Secret Name | Last Rotated | Next Rotation | Status | Notes |
|-------------|--------------|---------------|--------|-------|
| SUPABASE_KEY | $(date +%Y-%m-%d) | $(add_days $ROTATION_DAYS) | ✅ Current | Production database access |
| SUPABASE_URL | $(date +%Y-%m-%d) | $(add_days $ROTATION_DAYS) | ✅ Current | Database endpoint |
| MAILCHIMP_API_KEY | - | $(add_days $ROTATION_DAYS) | ⚠️ Not Set | Email marketing |
| AIRTABLE_API_KEY | - | $(add_days $ROTATION_DAYS) | ⚠️ Not Set | CRM sync |
| SENTRY_DSN | - | $(add_days $ROTATION_DAYS) | ⚠️ Not Set | Error tracking |
| GITHUB_TOKEN | - | $(add_days $ROTATION_DAYS) | ⚠️ Not Set | CI/CD access |

## Rotation History

| Date | Secret | Action | Performed By |
|------|--------|--------|--------------|
| $(date +%Y-%m-%d) | Initial | Setup rotation tracking | Automated |

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
EOF
    echo -e "${GREEN}✓ Created $SECRETS_FILE${NC}"
fi

echo ""
echo "=========================================="
echo "Checking Secret Status"
echo "=========================================="
echo ""

# Define secrets to check
declare -a secrets=(
    "SUPABASE_KEY:Production database access"
    "SUPABASE_URL:Database endpoint"
    "MAILCHIMP_API_KEY:Email marketing"
    "AIRTABLE_API_KEY:CRM sync"
    "SENTRY_DSN:Error tracking"
    "GITHUB_TOKEN:CI/CD access"
)

NEED_ROTATION=()

# Check each secret (simulated - actual dates should come from the log file)
for secret_info in "${secrets[@]}"; do
    IFS=: read -r secret_name description <<< "$secret_info"
    
    # Check if secret is set in environment
    if [ -z "${!secret_name}" ]; then
        echo -e "${YELLOW}⚠ ${secret_name}${NC} - Not set in current environment"
        echo "   Description: $description"
    else
        echo -e "${GREEN}✓ ${secret_name}${NC} - Set in current environment"
        echo "   Description: $description"
    fi
    echo ""
done

echo "=========================================="
echo "Rotation Recommendations"
echo "=========================================="
echo ""
echo "Based on the $ROTATION_DAYS-day rotation policy:"
echo ""
echo "1. Review $SECRETS_FILE for secrets needing rotation"
echo "2. Rotate secrets that are older than $ROTATION_DAYS days"
echo "3. Update the log file after each rotation"
echo ""
echo -e "${BLUE}Recommended rotation schedule:${NC}"
echo "  → Quarterly (every 90 days) for low-risk secrets"
echo "  → Monthly (every 30 days) for high-risk secrets (API keys with write access)"
echo "  → Weekly (every 7 days) for temporary access tokens"
echo ""

echo "=========================================="
echo "How to Rotate a Secret"
echo "=========================================="
echo ""
echo "1. Supabase Keys:"
echo "   → Visit: https://app.supabase.com/project/_/settings/api"
echo "   → Generate new service role key"
echo "   → Update SUPABASE_KEY in Netlify environment"
echo ""
echo "2. Mailchimp API Key:"
echo "   → Visit: https://us1.admin.mailchimp.com/account/api/"
echo "   → Create new API key"
echo "   → Update MAILCHIMP_API_KEY in Netlify environment"
echo ""
echo "3. Airtable API Key:"
echo "   → Visit: https://airtable.com/account"
echo "   → Generate new API key"
echo "   → Update AIRTABLE_API_KEY in Netlify environment"
echo ""
echo "4. Sentry DSN:"
echo "   → Visit: https://sentry.io/settings/projects/"
echo "   → Regenerate DSN if needed (rarely required)"
echo "   → Update VITE_SENTRY_DSN in Netlify environment"
echo ""
echo "5. GitHub Token:"
echo "   → Visit: https://github.com/settings/tokens"
echo "   → Generate new token with same permissions"
echo "   → Update in GitHub Secrets: Settings → Secrets → Actions"
echo ""

echo "=========================================="
echo "After Rotation"
echo "=========================================="
echo ""
echo "1. Test in staging environment first"
echo "2. Deploy to production"
echo "3. Monitor error logs for 24 hours"
echo "4. Update $SECRETS_FILE with new rotation date"
echo "5. Revoke old secrets after confirming new ones work"
echo ""

echo -e "${GREEN}Secret rotation check completed!${NC}"
echo ""
echo "For detailed procedures, see:"
echo "  → docs/SECRET-ROTATION-POLICY.md"
echo "  → $SECRETS_FILE"
