#!/bin/bash
# scripts/setup-github-secrets.sh
# Automated GitHub Secrets setup script

set -e

echo "🔐 GitHub Secrets Setup Wizard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not installed${NC}"
    echo ""
    echo "Install from: https://cli.github.com/"
    echo ""
    echo "On macOS:"
    echo "  brew install gh"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "  echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "  sudo apt update"
    echo "  sudo apt install gh"
    exit 1
fi

# Authenticate with GitHub
echo "🔑 Checking GitHub authentication..."
if ! gh auth status &>/dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
    echo ""
    echo "Authenticating..."
    gh auth login
fi

echo -e "${GREEN}✅ Authenticated with GitHub${NC}"
echo ""

# Function to prompt for secret
prompt_secret() {
    local name=$1
    local description=$2
    local optional=$3
    local current_value=""
    
    # Check if secret already exists
    if gh secret list 2>/dev/null | grep -q "^${name}"; then
        current_value="[Already set]"
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}${name}${NC}"
    echo "Description: ${description}"
    
    if [ -n "$current_value" ]; then
        echo -e "Current: ${GREEN}${current_value}${NC}"
    fi
    
    if [ "$optional" = "true" ]; then
        echo -e "Status: ${YELLOW}Optional${NC}"
    else
        echo -e "Status: ${RED}Required${NC}"
    fi
    
    echo ""
    
    # Prompt for value
    read -sp "Enter value (or press Enter to skip): " value
    echo ""
    
    if [ -n "$value" ]; then
        echo "Setting secret..."
        if gh secret set "$name" --body "$value" 2>/dev/null; then
            echo -e "${GREEN}✅ ${name} set successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to set ${name}${NC}"
            return 1
        fi
    else
        if [ "$optional" = "true" ]; then
            echo -e "${YELLOW}⏭️  Skipped (optional)${NC}"
        elif [ -n "$current_value" ]; then
            echo -e "${GREEN}⏭️  Keeping existing value${NC}"
        else
            echo -e "${YELLOW}⏭️  Skipped (you can set this later)${NC}"
        fi
    fi
}

# Function to generate random secret
generate_random_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    else
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Required Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "These secrets are required for the platform to function."
echo ""

# Netlify Secrets
prompt_secret "NETLIFY_AUTH_TOKEN" \
    "Netlify authentication token for deployments" \
    "false"

prompt_secret "NETLIFY_SITE_ID" \
    "Netlify site ID (API ID from site settings)" \
    "false"

# Database Secrets
prompt_secret "SUPABASE_URL" \
    "Supabase project URL (e.g., https://xxx.supabase.co)" \
    "false"

prompt_secret "SUPABASE_ANON_KEY" \
    "Supabase anonymous/public key (anon public from API settings)" \
    "false"

prompt_secret "SUPABASE_SERVICE_ROLE_KEY" \
    "Supabase service role key (service_role secret - NEVER expose in client!)" \
    "false"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Optional Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "These secrets enhance functionality but are not required."
echo "The platform will work in demo mode without them."
echo ""

# Monitoring
prompt_secret "VITE_SENTRY_DSN" \
    "Sentry DSN for error tracking and monitoring" \
    "true"

# Code Coverage
prompt_secret "CODECOV_TOKEN" \
    "Codecov token for coverage reporting" \
    "true"

# Secret Scanning
prompt_secret "GITLEAKS_LICENSE" \
    "Gitleaks Pro license (optional, free tier works without)" \
    "true"

# Integrations
prompt_secret "MAILCHIMP_API_KEY" \
    "Mailchimp API key for email marketing" \
    "true"

prompt_secret "AIRTABLE_API_KEY" \
    "Airtable API key for data sync" \
    "true"

# Webhook Security
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Webhook Secret"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if gh secret list 2>/dev/null | grep -q "^WEBHOOK_SECRET"; then
    echo -e "${GREEN}✅ WEBHOOK_SECRET already set${NC}"
    echo ""
    read -p "Generate new webhook secret? (y/N): " generate_new
    if [ "$generate_new" = "y" ] || [ "$generate_new" = "Y" ]; then
        webhook_secret=$(generate_random_secret)
        echo "Generated: ${webhook_secret}"
        if gh secret set WEBHOOK_SECRET --body "$webhook_secret"; then
            echo -e "${GREEN}✅ WEBHOOK_SECRET updated${NC}"
        fi
    fi
else
    echo "Webhook secret is used to verify webhook authenticity."
    echo ""
    read -p "Generate random webhook secret? (Y/n): " generate_webhook
    if [ "$generate_webhook" != "n" ] && [ "$generate_webhook" != "N" ]; then
        webhook_secret=$(generate_random_secret)
        echo ""
        echo "Generated webhook secret: ${webhook_secret}"
        echo ""
        echo "Save this value - you'll need it when configuring webhook senders!"
        echo ""
        read -p "Press Enter to continue..."
        if gh secret set WEBHOOK_SECRET --body "$webhook_secret"; then
            echo -e "${GREEN}✅ WEBHOOK_SECRET set${NC}"
        fi
    else
        prompt_secret "WEBHOOK_SECRET" \
            "Secret for webhook signature verification" \
            "true"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Validate secrets
echo "Validating configuration..."
bash scripts/validate-secrets.sh

echo ""
echo "Next steps:"
echo "  1. Set the same secrets in Netlify environment variables"
echo "     netlify env:set SECRET_NAME 'value'"
echo ""
echo "  2. Create staging environment in Supabase"
echo "     See: docs/STAGING-SETUP.md"
echo ""
echo "  3. Test deployment"
echo "     git push origin staging"
echo ""
echo "  4. Validate staging deployment"
echo "     bash scripts/validate-staging.sh <staging-url>"
echo ""
echo "For detailed instructions, see:"
echo "  - docs/GITHUB-SECRETS-SETUP.md"
echo "  - docs/STAGING-SETUP.md"
echo ""
