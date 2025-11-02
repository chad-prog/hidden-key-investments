#!/bin/bash

# Documentation Organization Script
# Purpose: Create organized folder structure for documentation

set -e

DOCS_DIR="/home/runner/work/hidden-key-investments/hidden-key-investments/docs"

echo "Creating organized documentation structure..."

# Create category folders
mkdir -p "$DOCS_DIR/00-START-HERE"
mkdir -p "$DOCS_DIR/01-GETTING-STARTED"
mkdir -p "$DOCS_DIR/02-ARCHITECTURE"
mkdir -p "$DOCS_DIR/03-FEATURES"
mkdir -p "$DOCS_DIR/04-DEVELOPMENT"
mkdir -p "$DOCS_DIR/05-DEPLOYMENT"
mkdir -p "$DOCS_DIR/06-VISION-ROADMAP"
mkdir -p "$DOCS_DIR/07-REFERENCE"
mkdir -p "$DOCS_DIR/archive"

echo "✅ Created category folders in docs/"

# Create README files for each category
cat > "$DOCS_DIR/00-START-HERE/README.md" << 'EOF'
# 🏁 Start Here

**Essential documentation for getting oriented with the project**

## Files in this category:
- Entry points
- Quick start guides
- Navigation helpers
- Decision trees

## Recommended Reading Order:
1. QUICK-START.md - Get up and running fast
2. GETTING-STARTED.md - Comprehensive setup guide
3. NAVIGATION-GUIDE.md - Find what you need

**Estimated Time:** 20-30 minutes
EOF

cat > "$DOCS_DIR/01-GETTING-STARTED/README.md" << 'EOF'
# 🚀 Getting Started

**Setup guides and initial configuration**

## Files in this category:
- Installation instructions
- Environment setup
- Configuration guides
- Common workflows

## Recommended Reading Order:
1. Setup and configuration docs
2. Environment variable guides
3. Quick reference materials

**Estimated Time:** 45-60 minutes
EOF

cat > "$DOCS_DIR/02-ARCHITECTURE/README.md" << 'EOF'
# 🏗️ Architecture & Design

**System architecture and technical design**

## Files in this category:
- Architecture overviews
- System design documents
- API references
- ML architecture

## Recommended Reading Order:
1. ARCHITECTURE.md - System overview
2. API-REFERENCE.md - API documentation
3. ML-ARCHITECTURE.md - ML system design

**Estimated Time:** 90-120 minutes
EOF

cat > "$DOCS_DIR/03-FEATURES/README.md" << 'EOF'
# ✨ Features & Capabilities

**Feature specifications and capabilities**

## Files in this category:
- Feature documentation
- Capability matrices
- Integration guides
- Webhook documentation

## Recommended Reading Order:
1. CAPABILITIES.md - Complete feature list
2. Integration-specific guides
3. Capability matrices

**Estimated Time:** 60-90 minutes
EOF

cat > "$DOCS_DIR/04-DEVELOPMENT/README.md" << 'EOF'
# 👨‍💻 Development

**Development guides and workflows**

## Files in this category:
- Testing guides
- Development workflows
- Code standards
- Contribution guidelines

## Recommended Reading Order:
1. TESTING-GUIDE.md - Testing practices
2. Development workflow docs
3. Code quality guides

**Estimated Time:** 60-90 minutes
EOF

cat > "$DOCS_DIR/05-DEPLOYMENT/README.md" << 'EOF'
# 🚀 Deployment & Operations

**Deployment procedures and operational guides**

## Files in this category:
- Deployment guides
- Runbooks
- Staging setup
- Environment configuration
- Observability

## Recommended Reading Order:
1. DEPLOYMENT-RUNBOOK.md - Deployment procedures
2. STAGING-SETUP.md - Staging environment
3. OBSERVABILITY-GUIDE.md - Monitoring

**Estimated Time:** 90-120 minutes
EOF

cat > "$DOCS_DIR/06-VISION-ROADMAP/README.md" << 'EOF'
# 🗺️ Vision & Roadmap

**Strategic planning and roadmaps**

## Files in this category:
- Enterprise vision documents
- Implementation roadmaps
- Phase guides
- Action plans

## Recommended Reading Order:
1. Enterprise vision documents
2. Master roadmap
3. Phase-specific guides

**Estimated Time:** 90-120 minutes
EOF

cat > "$DOCS_DIR/07-REFERENCE/README.md" << 'EOF'
# 📚 Reference

**Quick reference materials and cheat sheets**

## Files in this category:
- Quick reference guides
- Command cheat sheets
- Troubleshooting guides
- FAQs

## Recommended Reading Order:
Reference as needed during development

**Estimated Time:** As needed
EOF

cat > "$DOCS_DIR/archive/README.md" << 'EOF'
# 📦 Archive

**Historical and superseded documentation**

## Purpose:
This folder contains:
- Outdated documentation that has been replaced
- Historical session summaries
- Superseded implementation guides
- Old versions of documents

These files are kept for historical reference but should not be used for current development.

**⚠️ Use current documentation in the main folders instead**
EOF

echo "✅ Created README files for each category"
echo ""
echo "Documentation structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Review the category structure"
echo "2. Optionally move files into categories (done via separate script)"
echo "3. Update links in documentation files"
