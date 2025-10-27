#!/bin/bash

# Infrastructure Validation Script
# Validates that all infrastructure components are properly configured
# Usage: bash scripts/validate-infrastructure.sh

# Don't exit on errors - we want to collect all results
set +e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

echo ""
echo "🔍 Validating Hidden Key Investments Infrastructure..."
echo "======================================================"
echo ""

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS_COUNT++))
}

# Function to print failure
print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL_COUNT++))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN_COUNT++))
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "📦 Checking Dependencies..."
echo "----------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_failure "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_failure "npm not installed"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_success "Dependencies installed (node_modules exists)"
else
    print_failure "Dependencies not installed (run: npm install)"
fi

echo ""
echo "🧪 Running Tests..."
echo "----------------------------"

# Run main tests
if npm run test --silent > /tmp/test-output.txt 2>&1; then
    TEST_COUNT=$(grep -o "Tests.*passed" /tmp/test-output.txt | head -1 || echo "Tests passed")
    print_success "Main tests passed: $TEST_COUNT"
else
    print_failure "Main tests failed"
    print_info "Run 'npm test' for details"
fi

# Run function tests
if npm run test:functions --silent > /tmp/test-functions-output.txt 2>&1; then
    FUNC_TEST_COUNT=$(grep -o "Tests.*passed" /tmp/test-functions-output.txt | head -1 || echo "Tests passed")
    print_success "Function tests passed: $FUNC_TEST_COUNT"
else
    print_failure "Function tests failed"
    print_info "Run 'npm run test:functions' for details"
fi

echo ""
echo "🏗️  Checking Build..."
echo "----------------------------"

# Check build
if npm run build > /tmp/build-output.txt 2>&1; then
    BUILD_TIME=$(grep "built in" /tmp/build-output.txt | awk '{print $3}')
    print_success "Build successful: ${BUILD_TIME}"
else
    print_failure "Build failed"
    print_info "Run 'npm run build' for details"
fi

echo ""
echo "🔍 Checking Linting..."
echo "----------------------------"

# Check linting (non-fatal)
if npm run lint > /tmp/lint-output.txt 2>&1; then
    print_success "Linting passed with no errors"
else
    # Check for actual errors vs warnings
    # ESLint exit code 1 can mean warnings OR errors
    # Parse the summary line to determine actual errors
    SUMMARY_LINE=$(grep "✖.*problems" /tmp/lint-output.txt | tail -1)
    
    if echo "$SUMMARY_LINE" | grep -q "0 errors"; then
        WARNING_COUNT=$(echo "$SUMMARY_LINE" | grep -o "[0-9]* warnings" | cut -d' ' -f1 || echo "0")
        print_warning "Linting has $WARNING_COUNT warnings but no errors (acceptable)"
    else
        ERROR_COUNT=$(echo "$SUMMARY_LINE" | grep -o "[0-9]* errors" | cut -d' ' -f1 || echo "0")
        WARNING_COUNT=$(echo "$SUMMARY_LINE" | grep -o "[0-9]* warnings" | cut -d' ' -f1 || echo "0")
        print_failure "Linting failed with $ERROR_COUNT errors and $WARNING_COUNT warnings"
    fi
fi

echo ""
echo "📁 Checking File Structure..."
echo "----------------------------"

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "netlify.toml"
    ".github/workflows/ci.yml"
    "src/main.tsx"
    "netlify/functions/lead-ingest-enhanced.js"
    "supabase-sql/01-setup.sql"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_failure "$file missing"
    fi
done

echo ""
echo "🔐 Checking Environment Configuration..."
echo "----------------------------"

# Check .env.example
if [ -f ".env.example" ]; then
    print_success ".env.example exists"
else
    print_warning ".env.example missing"
fi

# Check for .env (should not be committed)
if [ -f ".env" ]; then
    print_success ".env exists (local development)"
    # Verify it's in .gitignore
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        print_success ".env is in .gitignore (secure)"
    else
        print_failure ".env NOT in .gitignore (security risk!)"
    fi
else
    print_info ".env not found (will use demo mode)"
fi

# Check for Sentry DSN (in .env or environment)
if [ -f ".env" ]; then
    if grep -q "VITE_SENTRY_DSN=.*[^_here]" .env 2>/dev/null; then
        print_success "Sentry DSN configured locally"
    else
        print_warning "Sentry DSN not configured (add to Netlify for production)"
    fi
fi

echo ""
echo "🚀 Checking CI/CD Configuration..."
echo "----------------------------"

# Check GitHub Actions workflow
if [ -f ".github/workflows/ci.yml" ]; then
    print_success "CI/CD workflow configured"
    
    # Check workflow components
    if grep -q "security-scan:" .github/workflows/ci.yml; then
        print_success "Security scanning enabled"
    fi
    
    if grep -q "test:" .github/workflows/ci.yml; then
        print_success "Automated testing enabled"
    fi
    
    if grep -q "build:" .github/workflows/ci.yml; then
        print_success "Build verification enabled"
    fi
else
    print_failure "CI/CD workflow not configured"
fi

# Check Netlify configuration
if [ -f "netlify.toml" ]; then
    print_success "Netlify configuration exists"
    
    # Check deploy contexts
    if grep -q "\[context.staging\]" netlify.toml; then
        print_success "Staging deploy context configured"
    else
        print_warning "Staging deploy context not configured"
    fi
    
    if grep -q "\[context.production\]" netlify.toml; then
        print_success "Production deploy context configured"
    else
        print_warning "Production deploy context not configured"
    fi
else
    print_failure "Netlify configuration missing"
fi

echo ""
echo "📊 Checking Database Schema..."
echo "----------------------------"

# Check SQL files
if [ -f "supabase-sql/01-setup.sql" ]; then
    print_success "Database schema file exists"
    
    # Check for critical tables
    TABLES=("leads" "opportunities" "investors" "activities" "workflows")
    for table in "${TABLES[@]}"; do
        if grep -q "CREATE TABLE.*$table" supabase-sql/01-setup.sql; then
            print_success "Table '$table' defined in schema"
        else
            print_warning "Table '$table' not found in schema"
        fi
    done
else
    print_failure "Database schema file missing"
fi

echo ""
echo "📚 Checking Documentation..."
echo "----------------------------"

# Check key documentation files
DOC_FILES=(
    "README.md"
    "docs/QUICK-START.md"
    "docs/ARCHITECTURE.md"
    "docs/STAGING-SETUP.md"
    "docs/OBSERVABILITY-GUIDE.md"
    "docs/ENVIRONMENT-VARIABLES.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc exists"
    else
        print_warning "$doc missing"
    fi
done

echo ""
echo "🔧 Checking Utility Scripts..."
echo "----------------------------"

# Check utility scripts
SCRIPTS=(
    "scripts/setup-dev.sh"
    "scripts/validate-env.sh"
    "scripts/dev-utils.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            print_success "$script exists and is executable"
        else
            print_warning "$script exists but is not executable (run: chmod +x $script)"
        fi
    else
        print_warning "$script missing"
    fi
done

echo ""
echo "======================================================"
echo "📊 Summary"
echo "======================================================"
echo ""

TOTAL_CHECKS=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
COMPLETION_PERCENT=$((PASS_COUNT * 100 / TOTAL_CHECKS))

echo -e "${GREEN}✅ Passed: $PASS_COUNT${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN_COUNT${NC}"
echo -e "${RED}❌ Failed: $FAIL_COUNT${NC}"
echo ""
echo -e "${BLUE}📈 Infrastructure Completion: ${COMPLETION_PERCENT}%${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    if [ $WARN_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 Perfect! Infrastructure is 100% complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review docs/MVP-IMPLEMENTATION.md for Phase 2"
        echo "2. Start building core features"
        echo "3. Deploy to staging for testing"
    else
        echo -e "${GREEN}✅ Infrastructure is functional!${NC}"
        echo -e "${YELLOW}⚠️  Some optional components need attention.${NC}"
        echo ""
        echo "To reach 100%:"
        echo "1. Review warnings above"
        echo "2. Follow docs/COMPLETE-INFRASTRUCTURE-GUIDE.md"
        echo "3. Configure Sentry and staging environment"
    fi
else
    echo -e "${RED}❌ Infrastructure has issues that need fixing.${NC}"
    echo ""
    echo "Fix the failed checks above, then run this script again."
fi

echo ""
echo "For detailed setup instructions, see:"
echo "📖 docs/COMPLETE-INFRASTRUCTURE-GUIDE.md"
echo ""

# Exit with appropriate code
if [ $FAIL_COUNT -gt 0 ]; then
    exit 1
else
    exit 0
fi
