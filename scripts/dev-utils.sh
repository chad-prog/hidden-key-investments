#!/bin/bash

# Developer Utilities Script
# Provides common development tasks and quality checks
#
# Usage: bash scripts/dev-utils.sh <command>
#
# Commands:
#   check-all     - Run all quality checks (build, test, lint)
#   test-all      - Run all tests (main + functions)
#   clean         - Clean build artifacts and caches
#   setup-env     - Set up environment files from examples
#   check-deps    - Check for outdated dependencies
#   pre-commit    - Run pre-commit checks
#   help          - Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Command implementations
check_all() {
    info "Running comprehensive quality checks..."
    echo ""
    
    info "Step 1/5: Installing dependencies..."
    npm ci --silent
    success "Dependencies installed"
    echo ""
    
    info "Step 2/5: Running linter..."
    if npm run lint; then
        success "Linting passed"
    else
        error "Linting failed"
        exit 1
    fi
    echo ""
    
    info "Step 3/5: Running main tests..."
    if npm test; then
        success "Main tests passed"
    else
        error "Main tests failed"
        exit 1
    fi
    echo ""
    
    info "Step 4/5: Running function tests..."
    if npm run test:functions; then
        success "Function tests passed"
    else
        error "Function tests failed"
        exit 1
    fi
    echo ""
    
    info "Step 5/5: Building project..."
    if npm run build; then
        success "Build successful"
    else
        error "Build failed"
        exit 1
    fi
    echo ""
    
    success "All quality checks passed! 🎉"
}

test_all() {
    info "Running all test suites..."
    echo ""
    
    info "Main tests:"
    npm test
    echo ""
    
    info "Function tests:"
    npm run test:functions
    echo ""
    
    success "All tests completed"
}

clean() {
    info "Cleaning build artifacts and caches..."
    
    # Remove build outputs
    if [ -d "dist" ]; then
        rm -rf dist
        success "Removed dist/"
    fi
    
    # Remove test coverage
    if [ -d "coverage" ]; then
        rm -rf coverage
        success "Removed coverage/"
    fi
    
    # Remove TypeScript build info
    if [ -f "tsconfig.tsbuildinfo" ]; then
        rm tsconfig.tsbuildinfo
        success "Removed tsconfig.tsbuildinfo"
    fi
    
    # Remove node_modules (optional - only if specifically requested)
    read -p "Remove node_modules? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -d "node_modules" ]; then
            rm -rf node_modules
            success "Removed node_modules/"
            warning "Run 'npm install' to reinstall dependencies"
        fi
        
        if [ -d "netlify/functions/node_modules" ]; then
            rm -rf netlify/functions/node_modules
            success "Removed netlify/functions/node_modules/"
        fi
    fi
    
    success "Clean completed"
}

setup_env() {
    info "Setting up environment files from examples..."
    
    # Main .env.local
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            success "Created .env.local from example"
            warning "Please update .env.local with your actual values"
        else
            warning ".env.local.example not found"
        fi
    else
        warning ".env.local already exists, skipping"
    fi
    
    # .env for Netlify dev
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            success "Created .env from example"
            warning "Please update .env with your actual values"
        else
            warning ".env.example not found"
        fi
    else
        warning ".env already exists, skipping"
    fi
    
    success "Environment setup completed"
    info "Next steps:"
    echo "  1. Edit .env.local with your configuration"
    echo "  2. Edit .env with your Netlify configuration"
    echo "  3. See docs/ENVIRONMENT-VARIABLES.md for details"
}

check_deps() {
    info "Checking for outdated dependencies..."
    echo ""
    
    info "Outdated packages:"
    npm outdated || true
    echo ""
    
    info "Security audit:"
    npm audit --audit-level=moderate || true
    echo ""
    
    success "Dependency check completed"
}

pre_commit() {
    info "Running pre-commit checks..."
    echo ""
    
    # Check for secrets
    info "Checking for potential secrets..."
    if git diff --cached --name-only | xargs grep -i "api[_-]key\|secret\|password\|token" 2>/dev/null; then
        error "Potential secrets detected in staged files!"
        warning "Please review and remove any sensitive data before committing"
        exit 1
    fi
    success "No obvious secrets detected"
    echo ""
    
    # Run linter on staged files
    info "Linting staged files..."
    STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' || true)
    if [ -n "$STAGED_FILES" ]; then
        echo "$STAGED_FILES" | xargs npx eslint --max-warnings 0 || {
            error "Linting failed on staged files"
            exit 1
        }
        success "Linting passed"
    else
        info "No JavaScript/TypeScript files staged"
    fi
    echo ""
    
    # Run tests
    info "Running tests..."
    if ! npm test -- --run; then
        error "Tests failed"
        exit 1
    fi
    success "Tests passed"
    echo ""
    
    success "Pre-commit checks passed! Ready to commit. 🚀"
}

show_help() {
    cat << EOF
Developer Utilities Script

Usage: bash scripts/dev-utils.sh <command>

Commands:
  check-all     Run all quality checks (build, test, lint)
  test-all      Run all tests (main + functions)
  clean         Clean build artifacts and caches
  setup-env     Set up environment files from examples
  check-deps    Check for outdated dependencies
  pre-commit    Run pre-commit checks
  help          Show this help message

Examples:
  bash scripts/dev-utils.sh check-all
  bash scripts/dev-utils.sh test-all
  bash scripts/dev-utils.sh clean
  bash scripts/dev-utils.sh pre-commit

For more information, see docs/CONTRIBUTING.md
EOF
}

# Main command dispatcher
case "${1:-help}" in
    check-all)
        check_all
        ;;
    test-all)
        test_all
        ;;
    clean)
        clean
        ;;
    setup-env)
        setup_env
        ;;
    check-deps)
        check_deps
        ;;
    pre-commit)
        pre_commit
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
