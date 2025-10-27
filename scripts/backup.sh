#!/bin/bash
# Backup Script for Hidden Key Investments Repository
# Creates a complete backup with timestamp

set -e  # Exit on error

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="hidden-key-investments-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    Hidden Key Investments - Repository Backup Utility${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if git repo
if [ ! -d .git ]; then
  echo -e "${RED}❌ Error: Not a git repository${NC}"
  exit 1
fi

# Get current branch and commit
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")

echo -e "${BLUE}Repository:${NC} ${REPO_NAME}"
echo -e "${BLUE}Branch:${NC} ${CURRENT_BRANCH}"
echo -e "${BLUE}Commit:${NC} ${CURRENT_COMMIT}"
echo -e "${BLUE}Timestamp:${NC} ${TIMESTAMP}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo -e "${YELLOW}📦 Creating backup...${NC}"

# Create archive including .git
echo "  • Archiving repository..."
tar -czf "${BACKUP_PATH}.tar.gz" \
  --exclude="node_modules" \
  --exclude="dist" \
  --exclude=".cache" \
  --exclude="coverage" \
  --exclude="*.log" \
  --exclude="${BACKUP_DIR}" \
  .

ARCHIVE_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)

# Create metadata file
echo "  • Creating metadata..."
cat > "${BACKUP_PATH}.json" <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "repository": "${REPO_NAME}",
  "branch": "${CURRENT_BRANCH}",
  "commit": "${CURRENT_COMMIT}",
  "commit_full": "$(git rev-parse HEAD)",
  "commit_message": "$(git log -1 --pretty=%B | head -n1)",
  "author": "$(git config user.name) <$(git config user.email)>",
  "archive": "${BACKUP_NAME}.tar.gz",
  "archive_size": "${ARCHIVE_SIZE}",
  "git_status": {
    "clean": $(git diff-index --quiet HEAD -- && echo true || echo false),
    "untracked_files": $(git ls-files --others --exclude-standard | wc -l),
    "modified_files": $(git diff --name-only | wc -l)
  },
  "branches": $(git branch -a | wc -l),
  "tags": $(git tag | wc -l),
  "total_commits": $(git rev-list --all --count)
}
EOF

# Create human-readable info file
echo "  • Creating backup info..."
cat > "${BACKUP_PATH}.txt" <<EOF
═══════════════════════════════════════════════════════════
    BACKUP INFORMATION
═══════════════════════════════════════════════════════════

Backup Date: $(date)
Repository: ${REPO_NAME}
Branch: ${CURRENT_BRANCH}
Commit: ${CURRENT_COMMIT}
Commit Message: $(git log -1 --pretty=%B | head -n1)

═══════════════════════════════════════════════════════════
    ARCHIVE CONTENTS
═══════════════════════════════════════════════════════════

Archive File: ${BACKUP_NAME}.tar.gz
Archive Size: ${ARCHIVE_SIZE}

This archive includes:
  ✓ All source code
  ✓ Git history and metadata
  ✓ Configuration files
  ✓ Documentation
  ✓ Database schemas
  ✓ Scripts and utilities

Excluded from backup:
  ✗ node_modules (dependencies)
  ✗ dist (build output)
  ✗ coverage (test reports)
  ✗ .cache (temporary files)
  ✗ *.log (log files)

═══════════════════════════════════════════════════════════
    RESTORE INSTRUCTIONS
═══════════════════════════════════════════════════════════

To restore this backup:

1. Extract the archive:
   tar -xzf ${BACKUP_NAME}.tar.gz -C /path/to/restore

2. Navigate to extracted directory:
   cd /path/to/restore

3. Install dependencies:
   npm install

4. Verify restoration:
   git log -1
   npm test
   npm run build

═══════════════════════════════════════════════════════════
    GIT STATUS AT BACKUP TIME
═══════════════════════════════════════════════════════════

$(git status)

═══════════════════════════════════════════════════════════
    RECENT COMMITS
═══════════════════════════════════════════════════════════

$(git log -5 --oneline --decorate)

═══════════════════════════════════════════════════════════
    BRANCHES
═══════════════════════════════════════════════════════════

$(git branch -a)

═══════════════════════════════════════════════════════════
    FILE STATISTICS
═══════════════════════════════════════════════════════════

Total Files: $(find . -type f \( ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.git/*" \) | wc -l)
TypeScript Files: $(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
JavaScript Files: $(find . -name "*.js" -path "*/functions/*" 2>/dev/null | wc -l)
Documentation: $(find docs -name "*.md" 2>/dev/null | wc -l) files

═══════════════════════════════════════════════════════════
    PACKAGE INFORMATION
═══════════════════════════════════════════════════════════

$(cat package.json | grep -A 2 "\"name\"\|\"version\"")

═══════════════════════════════════════════════════════════

Backup created with scripts/backup.sh
For questions or issues, consult the repository maintainer
EOF

# List all backups
echo ""
echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo ""
echo -e "${BLUE}Backup Details:${NC}"
echo "  Location: ${BACKUP_PATH}.tar.gz"
echo "  Size: ${ARCHIVE_SIZE}"
echo "  Metadata: ${BACKUP_PATH}.json"
echo "  Info: ${BACKUP_PATH}.txt"
echo ""

# Show existing backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l || echo 0)
if [ "${BACKUP_COUNT}" -gt 0 ]; then
  echo -e "${BLUE}Existing Backups (${BACKUP_COUNT}):${NC}"
  ls -lh "${BACKUP_DIR}"/*.tar.gz | tail -5 | awk '{print "  " $9 " (" $5 ")"}'
  
  # Calculate total backup size
  TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
  echo ""
  echo -e "${BLUE}Total Backup Storage:${NC} ${TOTAL_SIZE}"
fi

echo ""
echo -e "${YELLOW}💡 Tip: Keep backups in a separate location for safety${NC}"
echo ""

# Offer to create git tag
echo -e "${BLUE}Would you like to create a Git tag for this backup? (y/n)${NC}"
read -r -p "> " CREATE_TAG

if [[ "${CREATE_TAG}" =~ ^[Yy]$ ]]; then
  TAG_NAME="backup-${TIMESTAMP}"
  git tag -a "${TAG_NAME}" -m "Backup created on ${TIMESTAMP}"
  echo -e "${GREEN}✅ Git tag created: ${TAG_NAME}${NC}"
  echo -e "${YELLOW}💡 Push tag with: git push origin ${TAG_NAME}${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    Backup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
