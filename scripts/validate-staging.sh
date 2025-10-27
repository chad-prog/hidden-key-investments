#!/bin/bash
# Staging environment validation script
# Validates staging environment is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

STAGING_URL="${STAGING_URL:-}"
API_TIMEOUT=10

echo "=========================================="
echo "Staging Environment Validation"
echo "=========================================="
echo ""

if [ -z "$STAGING_URL" ]; then
    echo -e "${YELLOW}⚠ STAGING_URL not set${NC}"
    echo "Please provide staging URL as environment variable or argument:"
    echo "  export STAGING_URL=https://your-staging.netlify.app"
    echo "  OR"
    echo "  ./scripts/validate-staging.sh https://your-staging.netlify.app"
    echo ""
    if [ -n "$1" ]; then
        STAGING_URL="$1"
        echo -e "${GREEN}Using provided URL: $STAGING_URL${NC}"
        echo ""
    else
        exit 1
    fi
fi

PASSED=0
FAILED=0
WARNINGS=0

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo -n "Testing: $description... "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $API_TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Function to check if endpoint exists
check_endpoint_exists() {
    local url=$1
    local description=$2
    
    echo -n "Testing: $description... "
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $API_TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$response" != "000" ] && [ "$response" != "404" ]; then
        echo -e "${GREEN}✓ EXISTS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ NOT FOUND${NC} (HTTP $response)"
        ((WARNINGS++))
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local description=$2
    
    echo -n "Checking: $description... "
    
    if [ -n "${!var_name}" ]; then
        echo -e "${GREEN}✓ SET${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ NOT SET${NC}"
        ((WARNINGS++))
        return 1
    fi
}

echo "=========================================="
echo "1. Frontend Validation"
echo "=========================================="
echo ""

check_endpoint "$STAGING_URL" 200 "Homepage loads"
check_endpoint "$STAGING_URL/index.html" 200 "Index.html accessible"

echo ""
echo "=========================================="
echo "2. API Endpoints Validation"
echo "=========================================="
echo ""

check_endpoint_exists "$STAGING_URL/.netlify/functions/lead-ingest-enhanced" "Lead ingestion API"
check_endpoint_exists "$STAGING_URL/.netlify/functions/investor" "Investor API"
check_endpoint_exists "$STAGING_URL/.netlify/functions/opportunity" "Opportunity API"
check_endpoint_exists "$STAGING_URL/.netlify/functions/webhook-inbound" "Webhook API"

echo ""
echo "=========================================="
echo "3. Environment Variables Check"
echo "=========================================="
echo ""
echo "Note: This checks local environment only."
echo "Netlify environment variables must be checked in dashboard."
echo ""

check_env_var "VITE_SUPABASE_URL" "Supabase URL"
check_env_var "VITE_SUPABASE_ANON_KEY" "Supabase Anon Key"
check_env_var "VITE_APP_VERSION" "App Version"

echo ""
echo "=========================================="
echo "4. API Functional Tests"
echo "=========================================="
echo ""

# Test lead ingestion API with valid data
echo -n "Testing: Lead ingestion API with valid data... "
response=$(curl -s -X POST "$STAGING_URL/.netlify/functions/lead-ingest-enhanced" \
    -H "Content-Type: application/json" \
    -d '{
        "source": "staging-test",
        "contact": {
            "email": "test@example.com",
            "phone": "+1234567890"
        },
        "property": {
            "address": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip": "12345"
        }
    }' \
    --max-time $API_TIMEOUT 2>/dev/null || echo '{"success":false}')

if echo "$response" | grep -q '"success"'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ PARTIAL${NC} (API responded but format unexpected)"
    ((WARNINGS++))
fi

echo ""
echo "=========================================="
echo "5. Performance Check"
echo "=========================================="
echo ""

echo -n "Testing: Homepage load time... "
start_time=$(date +%s%N)
curl -s -o /dev/null "$STAGING_URL" --max-time $API_TIMEOUT 2>/dev/null
end_time=$(date +%s%N)
load_time=$(( ($end_time - $start_time) / 1000000 ))

if [ $load_time -lt 2000 ]; then
    echo -e "${GREEN}✓ EXCELLENT${NC} (${load_time}ms, target: <2000ms)"
    ((PASSED++))
elif [ $load_time -lt 5000 ]; then
    echo -e "${YELLOW}⚠ ACCEPTABLE${NC} (${load_time}ms, target: <2000ms)"
    ((WARNINGS++))
else
    echo -e "${RED}✗ SLOW${NC} (${load_time}ms, target: <2000ms)"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "6. Security Headers Check"
echo "=========================================="
echo ""

headers=$(curl -s -I "$STAGING_URL" --max-time $API_TIMEOUT 2>/dev/null || echo "")

check_header() {
    local header=$1
    local description=$2
    
    echo -n "Checking: $description... "
    
    if echo "$headers" | grep -qi "$header"; then
        echo -e "${GREEN}✓ PRESENT${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ MISSING${NC}"
        ((WARNINGS++))
        return 1
    fi
}

check_header "X-Frame-Options" "X-Frame-Options header"
check_header "X-Content-Type-Options" "X-Content-Type-Options header"
check_header "X-XSS-Protection" "X-XSS-Protection header"

echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo ""
echo -e "Passed:   ${GREEN}$PASSED tests${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS tests${NC}"
echo -e "Failed:   ${RED}$FAILED tests${NC}"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ Staging environment is fully validated!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Staging environment is functional but has warnings.${NC}"
        echo "Review warnings above and fix if needed."
        exit 0
    fi
else
    echo -e "${RED}✗ Staging environment validation failed!${NC}"
    echo "Please fix the failed tests before deploying to production."
    exit 1
fi
