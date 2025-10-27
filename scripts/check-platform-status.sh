#!/bin/bash

# Platform Status Checker
# Checks all critical components and provides actionable next steps

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 Hidden Key Investments - Platform Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "  ℹ $1"
}

section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 1. Check repository structure
section "1️⃣  Repository Structure"

if [ -f "package.json" ]; then
    pass "package.json exists"
else
    fail "package.json missing"
fi

if [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
    pass "Vite configuration found"
else
    fail "Vite configuration missing"
fi

if [ -d "netlify/functions" ]; then
    pass "Netlify functions directory exists"
    FUNC_COUNT=$(find netlify/functions -name "*.js" -o -name "*.cjs" -o -name "*.mjs" 2>/dev/null | wc -l)
    info "Found $FUNC_COUNT function files"
else
    fail "Netlify functions directory missing"
fi

if [ -f "netlify.toml" ]; then
    pass "Netlify configuration exists"
else
    warn "netlify.toml missing - needed for deployment"
fi

if [ -d "src" ]; then
    pass "Source directory exists"
else
    fail "Source directory missing"
fi

# 2. Check dependencies
section "2️⃣  Dependencies"

if [ -d "node_modules" ]; then
    pass "Dependencies installed"
else
    warn "Dependencies not installed - run: npm install"
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    pass "Node.js installed ($NODE_VERSION)"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        pass "Node.js version is compatible (>= 18)"
    else
        warn "Node.js version should be >= 18 (current: $NODE_VERSION)"
    fi
else
    fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    pass "npm installed ($NPM_VERSION)"
else
    fail "npm not installed"
fi

# 3. Check build capability
section "3️⃣  Build System"

if [ -d "node_modules" ]; then
    echo "Testing build..."
    if npm run build > /tmp/build-test.log 2>&1; then
        pass "Build successful"
        if [ -d "dist" ]; then
            DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
            info "Build output: $DIST_SIZE in dist/"
        fi
    else
        fail "Build failed - check logs: /tmp/build-test.log"
    fi
else
    warn "Cannot test build - dependencies not installed"
fi

# 4. Check tests
section "4️⃣  Testing"

if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    pass "Test configuration found"
    
    if [ -d "node_modules" ]; then
        echo "Running tests..."
        if npm test > /tmp/test.log 2>&1; then
            TEST_COUNT=$(grep -o "[0-9]* passed" /tmp/test.log | head -1 | cut -d' ' -f1)
            pass "Tests passed ($TEST_COUNT tests)"
        else
            fail "Tests failed - check logs: /tmp/test.log"
        fi
    else
        warn "Cannot run tests - dependencies not installed"
    fi
else
    warn "Test configuration missing"
fi

# 5. Check CI/CD
section "5️⃣  CI/CD Configuration"

if [ -d ".github/workflows" ]; then
    pass ".github/workflows directory exists"
    WORKFLOW_COUNT=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
    info "Found $WORKFLOW_COUNT workflow files"
    
    if [ -f ".github/workflows/ci.yml" ]; then
        pass "CI workflow configured (ci.yml)"
    else
        warn "No ci.yml workflow found"
    fi
else
    warn "No GitHub Actions workflows found"
fi

# 6. Check documentation
section "6️⃣  Documentation"

REQUIRED_DOCS=(
    "README.md"
    "START-HERE.md"
    "IMPLEMENTATION-ROADMAP.md"
    "QUICK-ACTIONS.md"
)

DOC_COUNT=0
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        ((DOC_COUNT++))
    fi
done

if [ $DOC_COUNT -eq ${#REQUIRED_DOCS[@]} ]; then
    pass "All key documentation files present ($DOC_COUNT/${#REQUIRED_DOCS[@]})"
else
    warn "Some documentation missing ($DOC_COUNT/${#REQUIRED_DOCS[@]} found)"
fi

if [ -d "docs" ]; then
    ADDITIONAL_DOCS=$(find docs -name "*.md" 2>/dev/null | wc -l)
    info "Additional documentation: $ADDITIONAL_DOCS files in docs/"
fi

# 7. Check environment configuration
section "7️⃣  Environment Configuration"

if [ -f ".env.example" ]; then
    pass ".env.example exists"
else
    warn ".env.example missing - should document required variables"
fi

if [ -f ".env" ]; then
    warn ".env file exists - make sure it's in .gitignore"
    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        pass ".env is in .gitignore"
    else
        fail ".env is NOT in .gitignore - security risk!"
    fi
else
    info "No .env file (using environment variables or demo mode)"
fi

# 8. Check database setup
section "8️⃣  Database Configuration"

if [ -d "supabase-sql" ]; then
    pass "Database schema directory exists"
    SQL_FILES=$(find supabase-sql -name "*.sql" 2>/dev/null | wc -l)
    info "Found $SQL_FILES SQL schema files"
else
    warn "No database schema directory found"
fi

# 9. Check Git status
section "9️⃣  Git Repository"

if [ -d ".git" ]; then
    pass "Git repository initialized"
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    info "Current branch: $CURRENT_BRANCH"
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        pass "Working directory clean"
    else
        warn "Uncommitted changes detected"
        info "Run: git status"
    fi
    
    # Check remote
    if git remote -v &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "none")
        pass "Remote configured: $REMOTE_URL"
    else
        warn "No git remote configured"
    fi
else
    fail "Not a git repository"
fi

# 10. Summary and recommendations
section "📊 Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))
SCORE=$((PASSED * 100 / TOTAL))

echo ""
echo "Results:"
echo "  ✓ Passed:   $PASSED"
echo "  ⚠ Warnings: $WARNINGS"
echo "  ✗ Failed:   $FAILED"
echo "  Score:     $SCORE%"
echo ""

# Determine status
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🎉 Platform is in excellent condition!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✅ Ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy to Netlify: See START-HERE.md Path 1"
    echo "  2. Add monitoring: See START-HERE.md Path 2"
    echo "  3. Build features: See START-HERE.md Path 3"
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  ⚠️  Platform is good but has some warnings${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Platform is functional but consider addressing warnings above."
    echo ""
    echo "Next steps:"
    echo "  1. Review warnings above"
    echo "  2. See START-HERE.md for guidance"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ❌ Platform has issues that need attention${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Critical issues detected. Address failed checks above."
    echo ""
    echo "Quick fixes:"
    if [ ! -d "node_modules" ]; then
        echo "  • Install dependencies: npm install"
    fi
    echo "  • See LOCAL-DEVELOPMENT.md for setup instructions"
    echo "  • See START-HERE.md for getting started"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Return appropriate exit code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
