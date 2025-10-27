#!/bin/bash

# Git Sync Helper Script
# Helps resolve common git sync issues like the one mentioned:
# "Your branch is behind 'origin/main' by 94 commits"

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔄 Git Sync Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    HAS_CHANGES=true
    echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
else
    HAS_CHANGES=false
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
    echo ""
fi

# Fetch latest from remote
echo "Fetching latest from remote..."
git fetch origin
echo ""

# Check how many commits behind
BEHIND=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..HEAD 2>/dev/null || echo "0")

echo -e "${BLUE}Status:${NC}"
echo "  Commits behind: $BEHIND"
echo "  Commits ahead: $AHEAD"
echo ""

if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
    echo -e "${GREEN}✓ Your branch is up to date!${NC}"
    exit 0
fi

# Show sync options
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 Sync Options"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HAS_CHANGES" = true ]; then
    echo -e "${YELLOW}You have uncommitted changes. Choose option 1 or 2.${NC}"
    echo ""
    echo "1. Stash changes, pull, then restore changes (RECOMMENDED)"
    echo "   - Temporarily saves your changes"
    echo "   - Gets latest from remote"
    echo "   - Restores your changes"
    echo "   - May require resolving conflicts"
    echo ""
    echo "2. Commit changes, then pull"
    echo "   - Creates a commit with your changes"
    echo "   - Gets latest from remote"
    echo "   - May create a merge commit"
    echo ""
    echo "3. Discard local changes and sync (⚠️ DELETES YOUR CHANGES)"
    echo "   - Permanently removes your uncommitted changes"
    echo "   - Syncs with remote"
    echo ""
else
    echo "No uncommitted changes detected."
    echo ""
    echo "1. Pull and merge (RECOMMENDED)"
    echo "   - Gets latest from remote"
    echo "   - Creates merge commit if needed"
    echo ""
    echo "2. Pull and rebase"
    echo "   - Gets latest from remote"
    echo "   - Replays your commits on top"
    echo "   - Cleaner history"
    echo ""
fi

echo "0. Cancel (do nothing)"
echo ""

read -p "Choose an option (0-3): " choice

case $choice in
    1)
        if [ "$HAS_CHANGES" = true ]; then
            echo ""
            echo "Executing: Stash → Pull → Pop"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            echo "Step 1: Stashing changes..."
            git stash push -m "Auto-stash before sync ($(date +%Y-%m-%d-%H:%M:%S))"
            echo -e "${GREEN}✓ Changes stashed${NC}"
            echo ""
            
            echo "Step 2: Pulling from origin/$CURRENT_BRANCH..."
            if git pull origin $CURRENT_BRANCH; then
                echo -e "${GREEN}✓ Pull successful${NC}"
            else
                echo -e "${RED}✗ Pull failed${NC}"
                echo "Your changes are still stashed. Run 'git stash pop' manually when ready."
                exit 1
            fi
            echo ""
            
            echo "Step 3: Restoring your changes..."
            if git stash pop; then
                echo -e "${GREEN}✓ Changes restored successfully${NC}"
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "${GREEN}✓ Sync complete!${NC}"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                git status
            else
                echo -e "${YELLOW}⚠ Conflicts detected${NC}"
                echo ""
                echo "Please resolve conflicts in the files marked by git."
                echo "After resolving:"
                echo "  1. git add <resolved-files>"
                echo "  2. git stash drop  # Remove the stash"
                echo ""
                echo "Or to abort:"
                echo "  git reset --merge"
                exit 1
            fi
        else
            echo ""
            echo "Executing: Pull with merge"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            if git pull origin $CURRENT_BRANCH; then
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "${GREEN}✓ Sync complete!${NC}"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                git status
            else
                echo -e "${RED}✗ Pull failed${NC}"
                exit 1
            fi
        fi
        ;;
        
    2)
        if [ "$HAS_CHANGES" = true ]; then
            echo ""
            echo "Executing: Commit → Pull"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            read -p "Enter commit message: " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="Local changes before sync ($(date +%Y-%m-%d))"
            fi
            
            echo "Step 1: Committing changes..."
            git add .
            git commit -m "$commit_msg"
            echo -e "${GREEN}✓ Changes committed${NC}"
            echo ""
            
            echo "Step 2: Pulling from origin/$CURRENT_BRANCH..."
            if git pull origin $CURRENT_BRANCH; then
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "${GREEN}✓ Sync complete!${NC}"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                git status
            else
                echo -e "${RED}✗ Pull failed - conflicts detected${NC}"
                echo ""
                echo "Please resolve conflicts and then:"
                echo "  git add <resolved-files>"
                echo "  git commit"
                exit 1
            fi
        else
            echo ""
            echo "Executing: Pull with rebase"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            if git pull --rebase origin $CURRENT_BRANCH; then
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "${GREEN}✓ Sync complete!${NC}"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                git status
            else
                echo -e "${RED}✗ Rebase failed${NC}"
                echo ""
                echo "To abort: git rebase --abort"
                exit 1
            fi
        fi
        ;;
        
    3)
        if [ "$HAS_CHANGES" = true ]; then
            echo ""
            echo -e "${RED}⚠️  WARNING: This will PERMANENTLY DELETE your uncommitted changes!${NC}"
            echo ""
            git status --short
            echo ""
            read -p "Are you SURE you want to discard these changes? (type 'yes' to confirm): " confirm
            
            if [ "$confirm" = "yes" ]; then
                echo ""
                echo "Executing: Reset and sync"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                
                git fetch origin
                git reset --hard origin/$CURRENT_BRANCH
                
                echo ""
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "${GREEN}✓ Reset complete - synced with remote${NC}"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo ""
                git status
            else
                echo "Cancelled - no changes made"
                exit 0
            fi
        else
            echo "Option not available (no uncommitted changes)"
        fi
        ;;
        
    0)
        echo "Cancelled - no changes made"
        exit 0
        ;;
        
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your branch is now synced with remote."
echo ""
echo "To push your changes:"
echo "  git push origin $CURRENT_BRANCH"
echo ""
echo "To check status:"
echo "  git status"
echo ""
