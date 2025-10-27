#!/bin/bash
# Setup Verification Script for Hidden Key Investments
# Verifies environment and configuration for development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Hidden Key Investments - Setup Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Track issues
WARNINGS=0
ERRORS=0
PASS=0

# Function to check command exists
check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $2"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $2"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

# Function to check version
check_version() {
  local cmd=$1
  local min_version=$2
  local name=$3
  
  if command -v "$cmd" &> /dev/null; then
    local version=$($cmd --version 2>&1 | head -n1 | grep -oE '[0-9]+\.[0-9]+' | head -n1)
    if [ -n "$version" ]; then
      echo -e "${GREEN}✓${NC} ${name}: v${version}"
      PASS=$((PASS + 1))
    else
      echo -e "${YELLOW}⚠${NC} ${name}: version unknown"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
}

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${YELLOW}⚠${NC} $2 (not found)"
    WARNINGS=$((WARNINGS + 1))
    return 1
  fi
}

echo -e "${BLUE}=== System Requirements ===${NC}"
check_command "node" "Node.js installed"
check_version "node" "22.0.0" "Node.js"
check_command "npm" "npm installed"
check_version "npm" "10.0.0" "npm"
check_command "git" "Git installed"
echo ""

echo -e "${BLUE}=== Project Files ===${NC}"
check_file "package.json" "package.json exists"
check_file "package-lock.json" "package-lock.json exists (dependencies locked)"
check_file "tsconfig.json" "tsconfig.json exists"
check_file "vite.config.ts" "vite.config.ts exists"
check_file "vitest.config.ts" "vitest.config.ts exists"
check_file "eslint.config.js" "eslint.config.js exists"
check_file "tailwind.config.js" "tailwind.config.js exists"
echo ""

echo -e "${BLUE}=== Dependencies ===${NC}"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules directory exists"
  PASS=$((PASS + 1))
  
  # Check key dependencies
  if [ -d "node_modules/react" ]; then
    echo -e "${GREEN}✓${NC} React installed"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} React not found"
    ERRORS=$((ERRORS + 1))
  fi
  
  if [ -d "node_modules/vite" ]; then
    echo -e "${GREEN}✓${NC} Vite installed"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} Vite not found"
    ERRORS=$((ERRORS + 1))
  fi
  
  if [ -d "node_modules/vitest" ]; then
    echo -e "${GREEN}✓${NC} Vitest installed"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} Vitest not found"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗${NC} node_modules not found - run 'npm install'"
  ERRORS=$((ERRORS + 1))
fi
echo ""

echo -e "${BLUE}=== Environment Configuration ===${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} .env file exists"
  PASS=$((PASS + 1))
else
  echo -e "${YELLOW}⚠${NC} .env file not found (optional - demo mode will work)"
  WARNINGS=$((WARNINGS + 1))
fi

if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓${NC} .env.example exists (reference available)"
  PASS=$((PASS + 1))
fi

# Check for key environment variables
ENV_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_MAILCHIMP_API_KEY" "VITE_AIRTABLE_API_KEY")
CONFIGURED=0
for var in "${ENV_VARS[@]}"; do
  if [ -n "${!var}" ]; then
    CONFIGURED=$((CONFIGURED + 1))
  fi
done

if [ $CONFIGURED -eq 0 ]; then
  echo -e "${YELLOW}⚠${NC} No environment variables configured (running in demo mode)"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓${NC} ${CONFIGURED}/${#ENV_VARS[@]} environment variables configured"
  PASS=$((PASS + 1))
fi
echo ""

echo -e "${BLUE}=== Git Repository ===${NC}"
if [ -d ".git" ]; then
  echo -e "${GREEN}✓${NC} Git repository initialized"
  PASS=$((PASS + 1))
  
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✓${NC} Current branch: ${BRANCH}"
  PASS=$((PASS + 1))
  
  # Check for uncommitted changes
  if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Working directory clean"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}⚠${NC} Working directory has uncommitted changes"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}✗${NC} Not a git repository"
  ERRORS=$((ERRORS + 1))
fi
echo ""

echo -e "${BLUE}=== Documentation ===${NC}"
check_file "README.md" "README.md"
check_file "CONTRIBUTING.md" "CONTRIBUTING.md"
check_file "docs/QUICK-START.md" "Quick Start Guide"
check_file "docs/ARCHITECTURE.md" "Architecture Documentation"
check_file "docs/IMPLEMENTATION-ROADMAP.md" "Implementation Roadmap"
check_file "docs/CURRENT-STATUS.md" "Current Status"
echo ""

echo -e "${BLUE}=== Running Quality Checks ===${NC}"

# Run lint
echo -n "Running lint... "
if npm run lint > /tmp/lint.log 2>&1; then
  ERRORS_COUNT=$(grep -c "error" /tmp/lint.log || echo 0)
  WARNINGS_COUNT=$(grep -c "warning" /tmp/lint.log || echo 0)
  
  if [ "$ERRORS_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Passed (${WARNINGS_COUNT} warnings)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗${NC} Failed (${ERRORS_COUNT} errors, ${WARNINGS_COUNT} warnings)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗${NC} Lint command failed"
  ERRORS=$((ERRORS + 1))
fi

# Run tests
echo -n "Running tests... "
if npm test > /tmp/test.log 2>&1; then
  TEST_COUNT=$(grep -c "✓" /tmp/test.log || echo 0)
  echo -e "${GREEN}✓${NC} Passed (${TEST_COUNT} tests)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}✗${NC} Tests failed"
  ERRORS=$((ERRORS + 1))
  echo "  Check /tmp/test.log for details"
fi

# Run build
echo -n "Running build... "
if npm run build > /tmp/build.log 2>&1; then
  BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
  echo -e "${GREEN}✓${NC} Build successful (${BUILD_SIZE})"
  PASS=$((PASS + 1))
else
  echo -e "${RED}✗${NC} Build failed"
  ERRORS=$((ERRORS + 1))
  echo "  Check /tmp/build.log for details"
fi
echo ""

# Calculate build metrics
if [ -d "dist" ]; then
  echo -e "${BLUE}=== Build Metrics ===${NC}"
  echo "  Build output: dist/"
  echo "  Size: $(du -sh dist | cut -f1)"
  echo "  Files: $(find dist -type f | wc -l)"
  echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Verification Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✓ Passed:${NC} ${PASS} checks"
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠ Warnings:${NC} ${WARNINGS} issues"
fi
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}✗ Errors:${NC} ${ERRORS} issues"
fi
echo ""

# Recommendations
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Setup has critical issues that need to be resolved${NC}"
  echo ""
  echo "Recommended actions:"
  echo "  1. Run 'npm install' to install dependencies"
  echo "  2. Fix any lint errors with 'npm run lint:fix'"
  echo "  3. Check test failures with 'npm test'"
  echo ""
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Setup is functional but has some warnings${NC}"
  echo ""
  echo "Everything works, but consider:"
  echo "  • Setting up environment variables (copy .env.example to .env)"
  echo "  • Committing any uncommitted changes"
  echo "  • Reviewing documentation in docs/"
  echo ""
  echo -e "${GREEN}You can proceed with development!${NC}"
  echo ""
  exit 0
else
  echo -e "${GREEN}✅ Perfect! Setup is complete and ready for development${NC}"
  echo ""
  echo "Next steps:"
  echo "  • Start dev server: npm run dev"
  echo "  • Run tests: npm test"
  echo "  • Read docs: docs/QUICK-START.md"
  echo ""
  exit 0
fi
