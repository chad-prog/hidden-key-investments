#!/bin/bash
# scripts/validate-secrets.sh
# Validates that all required GitHub secrets and environment variables are configured

set -e

echo "🔍 Validating Secrets and Environment Configuration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
GITHUB_REQUIRED_MISSING=0
GITHUB_OPTIONAL_MISSING=0
ENV_REQUIRED_MISSING=0
ENV_OPTIONAL_MISSING=0

# Required GitHub Secrets
REQUIRED_GITHUB_SECRETS=(
    "NETLIFY_AUTH_TOKEN"
    "NETLIFY_SITE_ID"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# Optional GitHub Secrets
OPTIONAL_GITHUB_SECRETS=(
    "CODECOV_TOKEN"
    "GITLEAKS_LICENSE"
    "VITE_SENTRY_DSN"
    "MAILCHIMP_API_KEY"
    "AIRTABLE_API_KEY"
    "WEBHOOK_SECRET"
)

# Required Environment Variables (for local development)
REQUIRED_ENV_VARS=(
    "NODE_VERSION"
)

# Optional Environment Variables
OPTIONAL_ENV_VARS=(
    "VITE_SENTRY_DSN"
    "VITE_MAILCHIMP_API_KEY"
    "VITE_AIRTABLE_API_KEY"
    "VITE_FORMSPREE_FORM_ID"
    "VITE_APP_VERSION"
    "VITE_FEATURE_ERRORTRACKING"
    "VITE_FEATURE_PERFORMANCEMONITORING"
)

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    GH_AVAILABLE=true
    echo -e "${BLUE}📦 GitHub CLI detected - checking GitHub Secrets${NC}"
else
    GH_AVAILABLE=false
    echo -e "${YELLOW}⚠️  GitHub CLI not found - skipping GitHub Secrets check${NC}"
    echo "   Install from: https://cli.github.com/"
fi
echo ""

# Function to check GitHub secret
check_github_secret() {
    local secret_name=$1
    if gh secret list 2>/dev/null | grep -q "^${secret_name}"; then
        return 0
    else
        return 1
    fi
}

# Check GitHub Secrets
if [ "$GH_AVAILABLE" = true ]; then
    # Authenticate if needed
    if ! gh auth status &>/dev/null; then
        echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
        echo "   Run: gh auth login"
        echo ""
        GH_AVAILABLE=false
    fi
fi

if [ "$GH_AVAILABLE" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 GitHub Secrets (Required)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for secret in "${REQUIRED_GITHUB_SECRETS[@]}"; do
        if check_github_secret "$secret"; then
            echo -e "  ${GREEN}✅${NC} ${secret}"
        else
            echo -e "  ${RED}❌${NC} ${secret} - MISSING"
            ((GITHUB_REQUIRED_MISSING++))
        fi
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 GitHub Secrets (Optional)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for secret in "${OPTIONAL_GITHUB_SECRETS[@]}"; do
        if check_github_secret "$secret"; then
            echo -e "  ${GREEN}✅${NC} ${secret}"
        else
            echo -e "  ${YELLOW}⚠️ ${NC} ${secret} - Not set (optional)"
            ((GITHUB_OPTIONAL_MISSING++))
        fi
    done
    
    echo ""
fi

# Check Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Environment Variables (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "  ${GREEN}✅${NC} ${var}=${!var}"
    else
        echo -e "  ${RED}❌${NC} ${var} - NOT SET"
        ((ENV_REQUIRED_MISSING++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Environment Variables (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for var in "${OPTIONAL_ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        # Mask the value for security
        value="${!var}"
        if [[ ${#value} -gt 20 ]]; then
            masked="${value:0:10}...${value: -5}"
        else
            masked="${value:0:5}..."
        fi
        echo -e "  ${GREEN}✅${NC} ${var}=${masked}"
    else
        echo -e "  ${YELLOW}⚠️ ${NC} ${var} - Not set (optional)"
        ((ENV_OPTIONAL_MISSING++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Configuration Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for configuration files
files=(
    ".env.example:Example environment variables"
    ".env.local:Local development environment"
    "netlify.toml:Netlify configuration"
    "package.json:Package configuration"
    ".github/workflows/ci.yml:CI/CD pipeline"
)

for file_entry in "${files[@]}"; do
    IFS=':' read -r file desc <<< "$file_entry"
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} ${file} - ${desc}"
    else
        if [ "$file" = ".env.local" ]; then
            echo -e "  ${YELLOW}⚠️ ${NC} ${file} - ${desc} (optional for demo mode)"
        else
            echo -e "  ${RED}❌${NC} ${file} - ${desc}"
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$GH_AVAILABLE" = true ]; then
    GITHUB_REQUIRED_TOTAL=${#REQUIRED_GITHUB_SECRETS[@]}
    GITHUB_REQUIRED_SET=$((GITHUB_REQUIRED_TOTAL - GITHUB_REQUIRED_MISSING))
    GITHUB_OPTIONAL_TOTAL=${#OPTIONAL_GITHUB_SECRETS[@]}
    GITHUB_OPTIONAL_SET=$((GITHUB_OPTIONAL_TOTAL - GITHUB_OPTIONAL_MISSING))
    
    echo "GitHub Secrets:"
    echo "  Required: ${GITHUB_REQUIRED_SET}/${GITHUB_REQUIRED_TOTAL} configured"
    echo "  Optional: ${GITHUB_OPTIONAL_SET}/${GITHUB_OPTIONAL_TOTAL} configured"
fi

ENV_REQUIRED_TOTAL=${#REQUIRED_ENV_VARS[@]}
ENV_REQUIRED_SET=$((ENV_REQUIRED_TOTAL - ENV_REQUIRED_MISSING))
ENV_OPTIONAL_TOTAL=${#OPTIONAL_ENV_VARS[@]}
ENV_OPTIONAL_SET=$((ENV_OPTIONAL_TOTAL - ENV_OPTIONAL_MISSING))

echo "Environment Variables:"
echo "  Required: ${ENV_REQUIRED_SET}/${ENV_REQUIRED_TOTAL} set"
echo "  Optional: ${ENV_OPTIONAL_SET}/${ENV_OPTIONAL_TOTAL} set"

echo ""

# Determine exit status
TOTAL_MISSING=$((GITHUB_REQUIRED_MISSING + ENV_REQUIRED_MISSING))

if [ $TOTAL_MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ All required configuration is complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy to staging: git push origin staging"
    echo "  2. Validate deployment: bash scripts/validate-staging.sh <url>"
    echo "  3. Deploy to production: git push origin main"
    exit 0
else
    echo -e "${RED}❌ ${TOTAL_MISSING} required item(s) missing!${NC}"
    echo ""
    echo "To fix:"
    
    if [ $GITHUB_REQUIRED_MISSING -gt 0 ]; then
        echo "  1. Add missing GitHub Secrets:"
        echo "     gh secret set SECRET_NAME --body 'value'"
        echo "     See: docs/GITHUB-SECRETS-SETUP.md"
    fi
    
    if [ $ENV_REQUIRED_MISSING -gt 0 ]; then
        echo "  2. Set missing environment variables:"
        echo "     export VAR_NAME='value'"
        echo "     Or add to .env.local for development"
    fi
    
    echo ""
    echo "For detailed setup instructions, see:"
    echo "  - docs/GITHUB-SECRETS-SETUP.md"
    echo "  - docs/ENVIRONMENT-VARIABLES.md"
    echo "  - .env.example"
    exit 1
fi
