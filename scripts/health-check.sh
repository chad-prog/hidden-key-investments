#!/bin/bash

# Health Check Endpoint Validator
# Validates that health check endpoints are responsive and returning correct data
# Usage: bash scripts/health-check.sh [environment_url]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment URL from argument or use localhost
ENV_URL="${1:-http://localhost:5173}"

echo ""
echo "🏥 Health Check Validation"
echo "Environment: $ENV_URL"
echo "======================================"
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Checking $description... "
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$ENV_URL$endpoint" || echo "000")
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (Status: $http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (Expected: $expected_status, Got: $http_code)${NC}"
        return 1
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    response=$(curl -s "$ENV_URL$endpoint" || echo "{}")
    
    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK (Valid JSON)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (Invalid JSON response)${NC}"
        return 1
    fi
}

# Check frontend
check_endpoint "/" "200" "Frontend"

# Check API endpoints (if serverless functions are running)
if [ "$ENV_URL" != "http://localhost:5173" ]; then
    echo ""
    echo "📡 Checking API Endpoints..."
    echo "------------------------------"
    
    check_json_endpoint "/.netlify/functions/lead-ingest-enhanced" "Lead Ingest API"
    check_json_endpoint "/.netlify/functions/webhook-inbound" "Webhook API"
    check_json_endpoint "/.netlify/functions/investor" "Investor API"
    check_json_endpoint "/.netlify/functions/opportunity" "Opportunity API"
fi

echo ""
echo "📊 Environment Validation"
echo "------------------------------"

# Check if Sentry is configured
if [ "$ENV_URL" != "http://localhost:5173" ]; then
    echo -n "Checking Sentry configuration... "
    if curl -s "$ENV_URL" | grep -q "sentry.io"; then
        echo -e "${GREEN}✅ Sentry configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Sentry not detected (may be in demo mode)${NC}"
    fi
fi

echo ""
echo "✅ Health check complete!"
echo ""
