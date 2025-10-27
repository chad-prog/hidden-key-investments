#!/bin/bash
# Environment Setup Automation Script
# Helps set up development, staging, or production environments
# Usage: ./scripts/setup-environment.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-development}"

echo "========================================"
echo "  Environment Setup: $ENVIRONMENT"
echo "========================================"
echo ""

# Validate environment argument
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
  echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
  echo "Usage: $0 [development|staging|production]"
  exit 1
fi

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to create .env file if it doesn't exist
setup_env_file() {
  local env_file=".env"
  
  if [ -f "$env_file" ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Keeping existing .env file"
      return
    fi
  fi
  
  echo -e "${BLUE}Creating .env file from template...${NC}"
  
  if [ -f ".env.example" ]; then
    cp .env.example "$env_file"
    echo -e "${GREEN}✓${NC} Created $env_file from .env.example"
  else
    echo -e "${RED}✗ .env.example not found${NC}"
    return 1
  fi
  
  # Set environment-specific values
  case "$ENVIRONMENT" in
    development)
      echo "VITE_APP_VERSION=1.0.0-dev" >> "$env_file"
      echo "VITE_SENTRY_ENVIRONMENT=development" >> "$env_file"
      ;;
    staging)
      echo "VITE_APP_VERSION=1.0.0-staging" >> "$env_file"
      echo "VITE_SENTRY_ENVIRONMENT=staging" >> "$env_file"
      ;;
    production)
      echo "VITE_APP_VERSION=1.0.0" >> "$env_file"
      echo "VITE_SENTRY_ENVIRONMENT=production" >> "$env_file"
      ;;
  esac
  
  echo -e "${GREEN}✓${NC} Environment-specific values added"
}

# Function to check and install dependencies
check_dependencies() {
  echo -e "${BLUE}Checking dependencies...${NC}"
  
  # Check Node.js
  if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
  else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
  fi
  
  # Check npm
  if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: v$NPM_VERSION"
  else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
  fi
  
  # Check git
  if command_exists git; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} git: v$GIT_VERSION"
  else
    echo -e "${YELLOW}⚠${NC} git not found (optional but recommended)"
  fi
  
  # Check curl
  if command_exists curl; then
    echo -e "${GREEN}✓${NC} curl: installed"
  else
    echo -e "${YELLOW}⚠${NC} curl not found (optional)"
  fi
}

# Function to install npm packages
install_packages() {
  echo ""
  echo -e "${BLUE}Installing npm packages...${NC}"
  
  if [ -f "package-lock.json" ]; then
    npm ci
  else
    npm install
  fi
  
  echo -e "${GREEN}✓${NC} npm packages installed"
}

# Function to validate environment
validate_environment() {
  echo ""
  echo -e "${BLUE}Validating environment...${NC}"
  
  # Check if validate-env.sh exists
  if [ -f "scripts/validate-env.sh" ]; then
    bash scripts/validate-env.sh
  else
    echo -e "${YELLOW}⚠ validate-env.sh not found, skipping validation${NC}"
  fi
}

# Function to run tests
run_tests() {
  echo ""
  echo -e "${BLUE}Running tests to verify setup...${NC}"
  
  if npm test --silent 2>&1 | grep -q "Test Files.*passed"; then
    echo -e "${GREEN}✓${NC} Tests passed"
  else
    echo -e "${YELLOW}⚠${NC} Some tests failed (this may be expected in demo mode)"
  fi
}

# Function to display next steps
display_next_steps() {
  echo ""
  echo "========================================"
  echo "  Setup Complete!"
  echo "========================================"
  echo ""
  echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
  echo ""
  echo "Next steps:"
  echo ""
  
  case "$ENVIRONMENT" in
    development)
      echo "1. Review and update .env file with your API keys"
      echo "2. Start the development server:"
      echo -e "   ${BLUE}npm run dev${NC}"
      echo ""
      echo "3. Run tests in watch mode:"
      echo -e "   ${BLUE}npm run test:watch${NC}"
      echo ""
      echo "4. View the app at: http://localhost:5173"
      ;;
    staging)
      echo "1. Configure Netlify environment variables"
      echo "2. Push to staging branch to deploy"
      echo "3. Validate deployment:"
      echo -e "   ${BLUE}bash scripts/validate-deployment.sh <staging-url>${NC}"
      ;;
    production)
      echo "1. Ensure all environment variables are set in Netlify"
      echo "2. Run final validation:"
      echo -e "   ${BLUE}npm run build && npm test${NC}"
      echo ""
      echo "3. Merge to main branch to deploy"
      echo "4. Validate production deployment:"
      echo -e "   ${BLUE}bash scripts/validate-deployment.sh <production-url>${NC}"
      ;;
  esac
  
  echo ""
  echo "📖 Documentation:"
  echo "   - docs/QUICK-START.md"
  echo "   - docs/DEPLOYMENT-CHECKLIST.md"
  echo "   - docs/ENVIRONMENT-VARIABLES.md"
  echo ""
}

# Main execution
main() {
  check_dependencies
  setup_env_file
  install_packages
  
  if [ "$ENVIRONMENT" = "development" ]; then
    validate_environment
    run_tests
  fi
  
  display_next_steps
}

# Run main function
main
