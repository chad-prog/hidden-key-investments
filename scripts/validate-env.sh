#!/bin/bash
# Environment Validation Script
# Validates that required environment variables are set for CI/CD

set -e

echo "🔍 Validating CI/CD Environment..."
echo "=================================="

# Track validation status
ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check if variable is set and not a placeholder
check_env_var() {
    local var_name=$1
    local required=$2
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ ERROR: $var_name is not set${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️  WARNING: $var_name is not set (optional)${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
    
    # Check for placeholder values
    if [[ "$var_value" == *"your_"* ]] || [[ "$var_value" == *"placeholder"* ]] || [[ "$var_value" == *"your-"* ]]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ ERROR: $var_name contains a placeholder value${NC}"
            ((ERRORS++))
        else
            echo -e "${YELLOW}⚠️  WARNING: $var_name appears to contain a placeholder value${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
    
    echo -e "${GREEN}✅ $var_name is set${NC}"
    return 0
}

echo ""
echo "Node Environment:"
check_env_var "NODE_VERSION" "false" || true
echo "NODE_VERSION: ${NODE_VERSION:-22}"

echo ""
echo "Optional CI/CD Secrets:"
check_env_var "CODECOV_TOKEN" "false" || true

echo ""
echo "Netlify Configuration:"
check_env_var "NETLIFY_AUTH_TOKEN" "false" || true
check_env_var "NETLIFY_SITE_ID" "false" || true

echo ""
echo "=================================="
echo "Validation Summary:"
echo "  Errors: $ERRORS"
echo "  Warnings: $WARNINGS"
echo "=================================="

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    echo ""
    echo "Note: Some errors may be expected in CI environments."
    echo "The application supports demo mode for missing API keys."
    exit 0  # Don't fail CI - just informational
else
    echo -e "${GREEN}✅ Environment validation passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    fi
fi

echo ""
echo "Demo Mode Status:"
if [ -z "$SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_URL" ]; then
    echo "  - Application will run in DEMO MODE (no database)"
else
    echo "  - Database configured"
fi

if [ -z "$VITE_MAILCHIMP_API_KEY" ]; then
    echo "  - Email features will use DEMO MODE"
else
    echo "  - Email features configured"
fi

if [ -z "$VITE_AIRTABLE_API_KEY" ]; then
    echo "  - Airtable sync will use DEMO MODE"
else
    echo "  - Airtable sync configured"
fi

echo ""
echo "✅ Environment validation complete"
exit 0
