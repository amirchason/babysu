#!/bin/bash

# ==========================================
# BABYSU - AUTOMATED GITHUB PAGES DEPLOYMENT
# ==========================================
# Deploy webapp to GitHub Pages (100% automatic, no login needed!)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}           🚀 DEPLOYING TO GITHUB PAGES (AUTOMATIC) 🚀              ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if in git repo
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Not a git repository. Initializing...${NC}"
    git init
    git remote add origin https://github.com/amirchason/babysu.git || true
fi

# Build webapp
echo -e "${BLUE}📦 Building webapp...${NC}"
cd webapp
npm install
npm run build

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""

# Create gh-pages branch and deploy
echo -e "${BLUE}🚀 Deploying to GitHub Pages...${NC}"

# Install gh-pages if not available
if ! npm list -g gh-pages &>/dev/null; then
    echo "Installing gh-pages..."
    npm install -g gh-pages
fi

# Deploy
npx gh-pages -d dist -m "Deploy to GitHub Pages"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  🎉 DEPLOYMENT COMPLETE! 🎉                         ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Your app will be live at:${NC}"
echo -e "${GREEN}   https://amirchason.github.io/babysu/${NC}"
echo ""
echo -e "${YELLOW}⏱️  Note: GitHub Pages may take 1-2 minutes to activate${NC}"
echo ""
