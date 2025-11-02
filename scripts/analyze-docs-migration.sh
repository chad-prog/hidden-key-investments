#!/bin/bash

# Documentation Migration Script
# Purpose: Migrate documentation files into organized category folders
# This script analyzes file content and suggests appropriate categories

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="${REPO_ROOT}/docs"

echo "🔍 Documentation Migration Tool"
echo "================================"
echo ""
echo "This script helps organize documentation into category folders:"
echo "  00-START-HERE     - Essential starting documents"
echo "  01-GETTING-STARTED - Setup and installation guides"
echo "  02-ARCHITECTURE   - System design and architecture"
echo "  03-FEATURES       - Feature specs and capabilities"
echo "  04-DEVELOPMENT    - Development and testing guides"
echo "  05-DEPLOYMENT     - Deployment and operations"
echo "  06-VISION-ROADMAP - Planning and roadmaps"
echo "  07-REFERENCE      - Quick reference materials"
echo ""

# Ensure category folders exist
mkdir -p "$DOCS_DIR/00-START-HERE"
mkdir -p "$DOCS_DIR/01-GETTING-STARTED"
mkdir -p "$DOCS_DIR/02-ARCHITECTURE"
mkdir -p "$DOCS_DIR/03-FEATURES"
mkdir -p "$DOCS_DIR/04-DEVELOPMENT"
mkdir -p "$DOCS_DIR/05-DEPLOYMENT"
mkdir -p "$DOCS_DIR/06-VISION-ROADMAP"
mkdir -p "$DOCS_DIR/07-REFERENCE"

# Function to suggest category based on filename and content
suggest_category() {
  local file="$1"
  local basename=$(basename "$file")
  local content=$(head -50 "$file" 2>/dev/null || echo "")
  
  # START-HERE documents
  if [[ "$basename" == "README.md" ]] || 
     [[ "$basename" == "START-HERE"* ]] ||
     [[ "$basename" == "NAVIGATION-GUIDE.md" ]]; then
    echo "00-START-HERE"
    return
  fi
  
  # GETTING-STARTED
  if [[ "$basename" =~ (SETUP|QUICK-START|GETTING-STARTED|INSTALLATION|ENVIRONMENT) ]] ||
     echo "$content" | grep -qi "setup\|installation\|getting started"; then
    echo "01-GETTING-STARTED"
    return
  fi
  
  # ARCHITECTURE
  if [[ "$basename" =~ (ARCHITECTURE|API-REFERENCE|DESIGN|ML-ARCHITECTURE) ]] ||
     echo "$content" | grep -qi "architecture\|system design\|api reference"; then
    echo "02-ARCHITECTURE"
    return
  fi
  
  # FEATURES
  if [[ "$basename" =~ (CAPABILITIES|FEATURES|WEBHOOK|INTEGRATION) ]] ||
     echo "$content" | grep -qi "capabilities\|features\|integration"; then
    echo "03-FEATURES"
    return
  fi
  
  # DEVELOPMENT
  if [[ "$basename" =~ (TESTING|CONTRIBUTING|DEVELOPMENT|DEV-) ]] ||
     echo "$content" | grep -qi "testing\|development\|contributing"; then
    echo "04-DEVELOPMENT"
    return
  fi
  
  # DEPLOYMENT
  if [[ "$basename" =~ (DEPLOYMENT|DEPLOY|STAGING|OBSERVABILITY|CICD|PIPELINE) ]] ||
     echo "$content" | grep -qi "deployment\|deploy\|staging\|production\|observability"; then
    echo "05-DEPLOYMENT"
    return
  fi
  
  # VISION-ROADMAP
  if [[ "$basename" =~ (ROADMAP|VISION|STATUS|PHASE|IMPLEMENTATION) ]] ||
     echo "$content" | grep -qi "roadmap\|vision\|phase\|implementation status"; then
    echo "06-VISION-ROADMAP"
    return
  fi
  
  # REFERENCE
  if [[ "$basename" =~ (REFERENCE|QUICK-REF) ]] ||
     echo "$content" | grep -qi "quick reference\|cheat sheet"; then
    echo "07-REFERENCE"
    return
  fi
  
  # Default to REFERENCE for miscellaneous docs
  echo "07-REFERENCE"
}

# Create mapping file
MAPPING_FILE="$REPO_ROOT/docs/DOCUMENTATION-MIGRATION-MAP.md"
cat > "$MAPPING_FILE" << 'EOF'
# Documentation Migration Map

This file maps documentation files to their suggested categories for organization.

**Generated:** $(date)

## Migration Guide

Use this map to understand where each documentation file should be placed.
Files can be moved manually or using the migration script.

---

EOF

echo "📋 Analyzing documentation files..."
echo ""

# Track statistics
total_files=0
docs_root_files=0
already_organized=0

# Analyze docs/ root level files
if [ -d "$DOCS_DIR" ]; then
  for file in "$DOCS_DIR"/*.md; do
    if [ -f "$file" ]; then
      basename=$(basename "$file")
      ((total_files++))
      ((docs_root_files++))
      
      suggested_category=$(suggest_category "$file")
      
      echo "  📄 $basename → $suggested_category"
      
      # Add to mapping file
      echo "- **$basename** → \`$suggested_category\`" >> "$MAPPING_FILE"
    fi
  done
fi

# Check already organized files
for category_dir in "$DOCS_DIR"/[0-9][0-9]-*; do
  if [ -d "$category_dir" ]; then
    category_name=$(basename "$category_dir")
    file_count=$(find "$category_dir" -maxdepth 1 -name "*.md" ! -name "README.md" | wc -l)
    ((already_organized += file_count))
  fi
done

echo ""
echo "📊 Statistics:"
echo "  Total documentation files found: $total_files"
echo "  Files in docs/ root: $docs_root_files"
echo "  Files already organized: $already_organized"
echo ""

# Add summary to mapping file
cat >> "$MAPPING_FILE" << EOF

---

## Summary

- **Total files analyzed:** $total_files
- **Files to migrate:** $docs_root_files
- **Files already organized:** $already_organized

## Categories

1. **00-START-HERE** - Essential starting documents
2. **01-GETTING-STARTED** - Setup and installation guides
3. **02-ARCHITECTURE** - System design and architecture
4. **03-FEATURES** - Feature specs and capabilities
5. **04-DEVELOPMENT** - Development and testing guides
6. **05-DEPLOYMENT** - Deployment and operations
7. **06-VISION-ROADMAP** - Planning and roadmaps
8. **07-REFERENCE** - Quick reference materials

## Next Steps

To migrate files, review the suggestions above and either:
1. Move files manually to the suggested categories
2. Run \`bash scripts/migrate-docs-execute.sh\` to auto-migrate (with confirmation)

**Note:** Always review links in moved files and update paths accordingly.
EOF

echo "✅ Migration map created: docs/DOCUMENTATION-MIGRATION-MAP.md"
echo ""
echo "Next steps:"
echo "  1. Review the migration map"
echo "  2. Manually move files or run migration script"
echo "  3. Update internal links in moved files"
echo "  4. Update indexes and navigation guides"
