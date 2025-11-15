#!/bin/bash
# Deployment Validation Script
# Validates that a deployed environment is working correctly
# Usage: ./scripts/validate-deployment.sh <environment_url>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
#!/bin/bash

# Validate deployment
URL="${1:-http://localhost:3000}"

echo "Validating deployment at: $URL"
TIMEOUT=10
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [options] <environment_url>"
      echo "Options:"
      echo "  -v, --verbose    Enable verbose output"
      echo "  -t, --timeout    Set timeout in seconds (default: 10)"
      echo "  -h, --help       Show this help message"
      exit 0
      ;;
    *)
      URL="$1"
      shift
      ;;
  esac
done

echo "========================================"
echo "  Deployment Validation"
echo "========================================"
echo "Environment: $URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check HTTP endpoint
check_endpoint() {
  local endpoint="$1"
  local expected_status="${2:-200}"
  local description="$3"
  
  echo -n "Testing $description... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$URL$endpoint" 2>&1)
  
  if [ "$response" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    ((TESTS_PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $response)"
    ((TESTS_FAILED++))
    return 1
  fi
}

# Function to check if content exists
check_content() {
  local endpoint="$1"
  local search_string="$2"
  local description="$3"
  
  echo -n "Testing $description... "
  
  response=$(curl -s --max-time "$TIMEOUT" "$URL$endpoint" 2>&1)
  
  if echo "$response" | grep -q "$search_string"; then
    echo -e "${GREEN}✓ PASS${NC} (Content found)"
    ((TESTS_PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Content not found)"
    if [ "$VERBOSE" = true ]; then
      echo "Response: $response"
    fi
    ((TESTS_FAILED++))
    return 1
  fi
}

# Function to check function endpoint
check_function() {
  local function_name="$1"
  local method="${2:-POST}"
  local payload="$3"
  local description="$4"
  
  echo -n "Testing $description... "
  
  if [ -z "$payload" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" --max-time "$TIMEOUT" "$URL/.netlify/functions/$function_name" 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$payload" --max-time "$TIMEOUT" "$URL/.netlify/functions/$function_name" 2>&1)
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 500 ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
    if [ "$VERBOSE" = true ]; then
      echo "Response: $body"
    fi
    ((TESTS_PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $status_code)"
    if [ "$VERBOSE" = true ]; then
      echo "Response: $body"
    fi
    ((TESTS_FAILED++))
    return 1
  fi
}

echo "Running smoke tests..."
echo ""

# Test 1: Check if the site is up
check_endpoint "/" "200" "Site availability"

# Test 2: Check if static assets load
check_content "/" "<!doctype html>" "HTML document structure"

# Test 3: Check for React app root
check_content "/" "root" "React app root element"

# Test 4: Check if CSS is loading
check_content "/" "stylesheet" "CSS stylesheet loading"

# Test 5: Test lead ingestion function (demo mode)
check_function "lead-ingest-enhanced" "POST" '{"source":"website"}' "Lead ingestion API (demo mode)"

# Test 6: Test webhook function (demo mode)
check_function "webhook-inbound" "POST" '{"email":"test@example.com","first_name":"Test"}' "Webhook ingestion API (demo mode)"

# Test 7: Check security headers
echo -n "Testing security headers... "
headers=$(curl -s -I --max-time "$TIMEOUT" "$URL/" 2>&1)
has_xframe=$(echo "$headers" | grep -i "X-Frame-Options")
has_xss=$(echo "$headers" | grep -i "X-XSS-Protection" || echo "$headers" | grep -i "X-Content-Type-Options")

if [ -n "$has_xframe" ] || [ -n "$has_xss" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Security headers present)"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠ WARN${NC} (Some security headers missing)"
  if [ "$VERBOSE" = true ]; then
    echo "$headers"
  fi
fi

# Test 8: Check if gzip compression is enabled
echo -n "Testing gzip compression... "
gzip_check=$(curl -s -I -H "Accept-Encoding: gzip" --max-time "$TIMEOUT" "$URL/" 2>&1)
if echo "$gzip_check" | grep -qi "Content-Encoding.*gzip"; then
  echo -e "${GREEN}✓ PASS${NC} (Gzip enabled)"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠ INFO${NC} (Gzip not detected, may not be needed)"
fi

# Summary
echo ""
echo "========================================"
echo "  Validation Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All critical tests passed!${NC}"
  echo "Environment is ready for use."
  exit 0
else
  echo -e "${RED}✗ Some tests failed.${NC}"
  echo "Please review the failures above."
  exit 1
fi
