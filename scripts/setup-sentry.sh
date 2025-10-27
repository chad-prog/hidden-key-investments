#!/bin/bash
# Setup Sentry for error tracking and monitoring
# This script helps activate Sentry integration

set -e

echo "=========================================="
echo "Sentry Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Sentry package is installed
echo "Checking Sentry package installation..."
if ! npm list @sentry/react &>/dev/null; then
    echo -e "${YELLOW}Installing @sentry/react package...${NC}"
    npm install @sentry/react
    echo -e "${GREEN}✓ Sentry package installed${NC}"
else
    echo -e "${GREEN}✓ Sentry package already installed${NC}"
fi

echo ""
echo "=========================================="
echo "Next Steps to Activate Sentry:"
echo "=========================================="
echo ""
echo "1. Create a Sentry account (if you haven't already)"
echo "   → Visit: https://sentry.io/signup/"
echo ""
echo "2. Create a new project"
echo "   → Name: Hidden Key Investments"
echo "   → Platform: React"
echo ""
echo "3. Get your DSN from Sentry dashboard"
echo "   → Settings → Projects → Client Keys (DSN)"
echo "   → Format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
echo ""
echo "4. Add environment variables:"
echo ""
echo "   For Netlify (Production):"
echo "   → Netlify Dashboard → Site Settings → Environment Variables"
echo "   → Add the following variables:"
echo ""
echo "     VITE_SENTRY_DSN=<your-sentry-dsn>"
echo "     VITE_APP_VERSION=1.0.0"
echo "     VITE_SENTRY_ENVIRONMENT=production"
echo ""
echo "   For local development:"
echo "   → Copy .env.example to .env.local"
echo "   → Add the same variables to .env.local"
echo ""
echo "5. The Sentry code in src/main.tsx is already configured"
echo "   Just ensure the environment variables are set"
echo ""
echo "6. Deploy and test"
echo "   → Push to your repository"
echo "   → Netlify will deploy automatically"
echo "   → Trigger a test error to verify Sentry is working"
echo ""
echo "=========================================="
echo "Testing Sentry Integration"
echo "=========================================="
echo ""
echo "After deployment, test by adding this to any component:"
echo ""
echo "  <button onClick={() => { throw new Error('Sentry test error'); }}>"
echo "    Test Sentry"
echo "  </button>"
echo ""
echo "Then check your Sentry dashboard for the error."
echo ""
echo "=========================================="
echo "Documentation"
echo "=========================================="
echo ""
echo "For more details, see:"
echo "  → docs/OBSERVABILITY-GUIDE.md"
echo "  → https://docs.sentry.io/platforms/javascript/guides/react/"
echo ""
echo -e "${GREEN}Setup script completed!${NC}"
