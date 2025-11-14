#!/bin/bash

# ==========================================
# BABYSU - FULLY AUTOMATED NETLIFY DEPLOYMENT
# ==========================================
# 100% Automatic - No manual steps needed!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              🚀 BABYSU AUTOMATED NETLIFY DEPLOYMENT 🚀              ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==========================================
# DEPLOY BACKEND
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      🚀 DEPLOYING BACKEND API                        ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd backend

echo -e "${BLUE}ℹ️  Deploying backend to Netlify...${NC}"

# Deploy backend (Netlify will auto-detect settings)
BACKEND_OUTPUT=$(netlify deploy --prod --dir=. 2>&1 || netlify deploy --prod --site-name=babysu-backend --dir=. 2>&1)

# Extract URL from output
BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -oP 'https://[^\s]+\.netlify\.app' | head -1)

if [ -z "$BACKEND_URL" ]; then
    # Try alternative URL format
    BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -oP 'Website Draft URL: \K.*' | head -1)
fi

if [ -z "$BACKEND_URL" ]; then
    # Create new site
    echo -e "${YELLOW}ℹ️  Creating new Netlify site for backend...${NC}"
    netlify sites:create --name babysu-backend --manual
    BACKEND_OUTPUT=$(netlify deploy --prod --dir=. 2>&1)
    BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -oP 'https://[^\s]+\.netlify\.app' | head -1)
fi

echo -e "${GREEN}✅ Backend deployed!${NC}"
echo -e "${GREEN}   URL: ${BACKEND_URL}${NC}"
echo ""

# Save backend URL
echo "$BACKEND_URL" > /tmp/babysu_backend_url.txt

# ==========================================
# BUILD WEBAPP
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      📦 BUILDING WEB APP                             ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd ../webapp

# Update API URL in .env for build
if [ -f ".env" ]; then
    # Backup original
    cp .env .env.backup
    # Update API URL
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=${BACKEND_URL}/api|g" .env
fi

echo -e "${BLUE}ℹ️  Installing dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${BLUE}ℹ️  Building webapp...${NC}"
npm run build

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""

# ==========================================
# DEPLOY WEBAPP
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      🚀 DEPLOYING WEB APP                            ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}ℹ️  Deploying webapp to Netlify...${NC}"

# Deploy webapp
WEBAPP_OUTPUT=$(netlify deploy --prod --dir=dist 2>&1 || netlify deploy --prod --site-name=babysu-webapp --dir=dist 2>&1)

# Extract URL
WEBAPP_URL=$(echo "$WEBAPP_OUTPUT" | grep -oP 'https://[^\s]+\.netlify\.app' | head -1)

if [ -z "$WEBAPP_URL" ]; then
    WEBAPP_URL=$(echo "$WEBAPP_OUTPUT" | grep -oP 'Website URL: \K.*' | head -1)
fi

if [ -z "$WEBAPP_URL" ]; then
    # Create new site
    echo -e "${YELLOW}ℹ️  Creating new Netlify site for webapp...${NC}"
    netlify sites:create --name babysu-webapp --manual
    WEBAPP_OUTPUT=$(netlify deploy --prod --dir=dist 2>&1)
    WEBAPP_URL=$(echo "$WEBAPP_OUTPUT" | grep -oP 'https://[^\s]+\.netlify\.app' | head -1)
fi

# Restore original .env
if [ -f ".env.backup" ]; then
    mv .env.backup .env
fi

echo -e "${GREEN}✅ Webapp deployed!${NC}"
echo -e "${GREEN}   URL: ${WEBAPP_URL}${NC}"
echo ""

# ==========================================
# TEST DEPLOYMENTS
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      ✅ TESTING DEPLOYMENTS                          ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test backend
echo -e "${BLUE}ℹ️  Testing backend...${NC}"
HEALTH_CHECK=$(curl -s "${BACKEND_URL}/health" || echo "error")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check returned: ${HEALTH_CHECK}${NC}"
fi

# Test webapp
echo -e "${BLUE}ℹ️  Testing webapp...${NC}"
WEBAPP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL" || echo "000")
if [ "$WEBAPP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Webapp is accessible!${NC}"
else
    echo -e "${YELLOW}⚠️  Webapp status: ${WEBAPP_STATUS}${NC}"
fi

echo ""

# ==========================================
# SUCCESS!
# ==========================================
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  🎉 DEPLOYMENT COMPLETE! 🎉                         ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 YOUR LIVE URLS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🚀 Web App:    ${GREEN}${WEBAPP_URL}${NC}"
echo -e "  ℹ️  Backend API: ${GREEN}${BACKEND_URL}${NC}"
echo -e "  ℹ️  Health Check: ${GREEN}${BACKEND_URL}/health${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 NEXT STEPS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. Open ${GREEN}${WEBAPP_URL}${NC} in your browser"
echo -e "  2. Test creating an account"
echo -e "  3. Share the URL with friends!"
echo ""

# Save URLs
cd ..
echo "BACKEND_URL=${BACKEND_URL}" > DEPLOYMENT_URLS.txt
echo "WEBAPP_URL=${WEBAPP_URL}" >> DEPLOYMENT_URLS.txt
echo ""
echo -e "${GREEN}✅ URLs saved to: DEPLOYMENT_URLS.txt${NC}"
echo ""
