#!/bin/bash

# ==========================================
# BABYSU - COMPLETE GITHUB DEPLOYMENT
# ==========================================
# 100% GitHub-based, fully automatic!

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           🚀 GITHUB-BASED AUTOMATIC DEPLOYMENT 🚀                   ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==========================================
# STEP 1: BUILD WEBAPP
# ==========================================
echo -e "${BLUE}📦 Building webapp for GitHub Pages...${NC}"
cd webapp

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""

# ==========================================
# STEP 2: DEPLOY TO GITHUB PAGES
# ==========================================
echo -e "${BLUE}🚀 Deploying to GitHub Pages...${NC}"

# Configure git
git config --global user.email "github-actions[bot]@users.noreply.github.com" || true
git config --global user.name "GitHub Actions" || true

# Create gh-pages branch if it doesn't exist
cd ..
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout --orphan gh-pages
    git reset --hard
    git commit --allow-empty -m "Initialize gh-pages branch"
    git push origin gh-pages
    git checkout main
fi

# Deploy using subtree
git subtree push --prefix webapp/dist origin gh-pages || \
    (git push origin `git subtree split --prefix webapp/dist main`:gh-pages --force)

echo -e "${GREEN}✅ Deployed to GitHub Pages!${NC}"
echo ""

# ==========================================
# STEP 3: ENABLE GITHUB PAGES
# ==========================================
echo -e "${BLUE}⚙️  Enabling GitHub Pages...${NC}"

# Use GitHub CLI to enable Pages
gh api -X POST /repos/amirchason/babysu/pages \
  -f source[branch]=gh-pages \
  -f source[path]=/ || echo "Pages may already be enabled"

echo ""

# ==========================================
# SUCCESS!
# ==========================================
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  🎉 DEPLOYMENT COMPLETE! 🎉                         ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 YOUR LIVE URL:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🚀 Web App: ${GREEN}https://amirchason.github.io/babysu/${NC}"
echo ""
echo -e "${YELLOW}⏱️  Note: GitHub Pages may take 1-2 minutes to activate${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 NEXT STEPS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. Wait 1-2 minutes for GitHub Pages to activate"
echo -e "  2. Visit: ${GREEN}https://amirchason.github.io/babysu/${NC}"
echo -e "  3. For backend API, see RAILWAY_DEPLOY.md"
echo ""
echo -e "${GREEN}✅ Frontend is live on GitHub Pages!${NC}"
echo ""
