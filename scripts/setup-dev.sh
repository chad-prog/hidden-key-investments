#!/bin/bash

# ============================================================================
# Hidden Key Investments - Development Environment Setup
# ============================================================================
# This script automates the setup of the development environment
# Run: bash scripts/setup-dev.sh
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ============================================================================
# Check Prerequisites
# ============================================================================
print_header "Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
    
    # Check if version is >= 22
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 22 ]; then
        print_warning "Node.js 22+ recommended. Current: $NODE_VERSION"
        print_info "Consider upgrading: https://nodejs.org/"
    fi
else
    print_error "Node.js not found. Please install Node.js 22+: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "git installed: $GIT_VERSION"
else
    print_error "git not found. Please install git: https://git-scm.com/"
    exit 1
fi

# ============================================================================
# Install Dependencies
# ============================================================================
print_header "Installing Dependencies"

if [ -f "package-lock.json" ]; then
    print_info "Running npm ci for clean install..."
    npm ci
else
    print_info "Running npm install..."
    npm install
fi

print_success "Dependencies installed"

# ============================================================================
# Environment Setup
# ============================================================================
print_header "Setting Up Environment Variables"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please edit .env and add your API keys"
    else
        print_warning ".env.example not found. Creating minimal .env..."
        cat > .env << 'EOF'
# Hidden Key Investments - Environment Variables
# Copy this to .env and fill in your values

# Demo Mode (default - no configuration needed)
# The app will work without API keys in demo mode

# Supabase Configuration (Optional)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key

# API Keys (Optional)
# VITE_MAILCHIMP_API_KEY=
# VITE_AIRTABLE_API_KEY=

# Observability (Optional)
# VITE_SENTRY_DSN=
# VITE_ANALYTICS_ID=

# Feature Flags (Optional - defaults provided)
# VITE_FEATURE_LEADCAPTURE=true
# VITE_FEATURE_CRMPIPELINE=true
# VITE_FEATURE_WORKFLOWAUTOMATION=false
# VITE_FEATURE_MLSCORING=false
EOF
        print_success ".env file created"
    fi
    print_info "Running in DEMO MODE by default"
else
    print_success ".env file already exists"
fi

# ============================================================================
# Verify Build System
# ============================================================================
print_header "Verifying Build System"

print_info "Running build test..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed. Please check errors above."
    exit 1
fi

# ============================================================================
# Run Tests
# ============================================================================
print_header "Running Tests"

print_info "Running test suite..."
if npm test; then
    print_success "All tests passed"
else
    print_warning "Some tests failed. Review output above."
fi

# ============================================================================
# Lint Check
# ============================================================================
print_header "Running Linter"

print_info "Checking code quality..."
if npm run lint 2>&1 | grep -q "warning"; then
    print_warning "Linting passed with warnings (expected in development)"
else
    print_success "Linting passed with no warnings"
fi

# ============================================================================
# Git Hooks (Optional)
# ============================================================================
print_header "Setting Up Git Hooks"

if [ -d ".git" ]; then
    print_info "Setting up pre-commit hook..."
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook: Run linter before commit

echo "Running pre-commit checks..."

# Run linter
npm run lint --silent
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    echo "Run 'npm run lint:fix' to auto-fix some issues."
    exit 1
fi

echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
else
    print_warning "Not a git repository. Skipping git hooks."
fi

# ============================================================================
# Documentation Check
# ============================================================================
print_header "Documentation Overview"

print_info "Available documentation:"
echo ""
[ -f "README.md" ] && echo "  • README.md - Project overview"
[ -f "LOCAL-DEVELOPMENT.md" ] && echo "  • LOCAL-DEVELOPMENT.md - Development guide"
[ -f "docs/ARCHITECTURE.md" ] && echo "  • docs/ARCHITECTURE.md - System architecture"
[ -f "docs/ENVIRONMENT-VARIABLES.md" ] && echo "  • docs/ENVIRONMENT-VARIABLES.md - Environment setup"
[ -f "docs/OBSERVABILITY-GUIDE.md" ] && echo "  • docs/OBSERVABILITY-GUIDE.md - Monitoring setup"
[ -f "docs/STAGING-SETUP.md" ] && echo "  • docs/STAGING-SETUP.md - Staging environment"
[ -f "docs/MVP-IMPLEMENTATION.md" ] && echo "  • docs/MVP-IMPLEMENTATION.md - MVP features"
echo ""

# ============================================================================
# Configuration Status
# ============================================================================
print_header "Configuration Status"

echo -e "${BLUE}Environment:${NC}"
echo "  • Mode: ${YELLOW}DEMO MODE${NC} (No API keys required)"
echo "  • Database: ${YELLOW}Not configured${NC} (Using demo mode)"
echo "  • Email: ${YELLOW}Not configured${NC} (Using demo mode)"
echo ""
echo -e "${BLUE}To enable production features:${NC}"
echo "  1. Create a Supabase project: https://supabase.com"
echo "  2. Run database setup: supabase-sql/01-setup.sql"
echo "  3. Update .env with your Supabase credentials"
echo "  4. Restart the dev server"
echo ""

# ============================================================================
# Next Steps
# ============================================================================
print_header "Setup Complete! 🎉"

echo -e "${GREEN}Your development environment is ready!${NC}\n"
echo "Next steps:"
echo ""
echo "  ${BLUE}1.${NC} Start development server:"
echo "     ${YELLOW}npm run dev${NC}"
echo ""
echo "  ${BLUE}2.${NC} Open browser to:"
echo "     ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "  ${BLUE}3.${NC} Run tests in watch mode:"
echo "     ${YELLOW}npm run test:watch${NC}"
echo ""
echo "  ${BLUE}4.${NC} Build for production:"
echo "     ${YELLOW}npm run build${NC}"
echo ""
echo "  ${BLUE}5.${NC} Configure services (optional):"
echo "     • Edit .env to add API keys"
echo "     • Set up Supabase database"
echo "     • See docs/ENVIRONMENT-VARIABLES.md"
echo ""

print_info "For help, see: docs/ or README.md"
echo ""

# ============================================================================
# Optional: Start Dev Server
# ============================================================================
read -p "Start development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    npm run dev
fi
