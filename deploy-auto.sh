#!/bin/bash

# ==========================================
# BABYSU - AUTOMATED VERCEL DEPLOYMENT
# ==========================================
# This script automatically deploys your app to Vercel

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
ROCKET="🚀"
WARNING="⚠️"
INFO="ℹ️"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                  ${ROCKET} BABYSU AUTOMATED DEPLOYMENT ${ROCKET}                  ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if vercel is logged in
echo -e "${INFO} Checking Vercel authentication..."
if ! vercel whoami &>/dev/null; then
    echo -e "${YELLOW}${WARNING} Not logged in to Vercel${NC}"
    echo -e "${INFO} Opening browser for login..."
    vercel login
    echo ""
fi

echo -e "${GREEN}${CHECK} Logged in to Vercel!${NC}"
echo ""

# ==========================================
# DEPLOY BACKEND
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      ${ROCKET} DEPLOYING BACKEND API                        ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd backend

echo -e "${INFO} Deploying backend to Vercel..."
BACKEND_OUTPUT=$(vercel --prod --yes 2>&1)
BACKEND_URL=$(echo "$BACKEND_OUTPUT" | grep -oP 'https://[^\s]+\.vercel\.app' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend deployment failed!${NC}"
    echo "$BACKEND_OUTPUT"
    exit 1
fi

echo -e "${GREEN}${CHECK} Backend deployed successfully!${NC}"
echo -e "${GREEN}   URL: ${BACKEND_URL}${NC}"
echo ""

# Save backend URL for later
echo "$BACKEND_URL" > /tmp/babysu_backend_url.txt

# ==========================================
# ADD ENVIRONMENT VARIABLES TO BACKEND
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              ${INFO} CONFIGURING BACKEND ENVIRONMENT VARIABLES             ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env from backend/.env.example first${NC}"
    exit 1
fi

# Function to add env var if it exists in .env
add_env_var() {
    local var_name=$1
    local value=$(grep "^${var_name}=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

    if [ -n "$value" ] && [ "$value" != "your_"* ] && [ "$value" != "sk_test_"* ]; then
        echo -e "${INFO} Adding ${var_name}..."
        echo "$value" | vercel env add "$var_name" production --yes &>/dev/null || echo -e "${YELLOW}   (already exists or skipped)${NC}"
    else
        echo -e "${YELLOW}${WARNING} Skipping ${var_name} (not configured or placeholder)${NC}"
    fi
}

# Add critical environment variables
add_env_var "OPENAI_API_KEY"
add_env_var "GEMINI_API_KEY"
add_env_var "SUNO_API_KEY"
add_env_var "JWT_SECRET"
add_env_var "FIREBASE_PROJECT_ID"
add_env_var "FIREBASE_STORAGE_BUCKET"
add_env_var "NODE_ENV"

# Set CORS to allow all (can restrict later)
echo "*" | vercel env add CORS_ORIGIN production --yes &>/dev/null || true

echo -e "${GREEN}${CHECK} Environment variables configured!${NC}"
echo ""

# Redeploy backend with environment variables
echo -e "${INFO} Redeploying backend with environment variables..."
vercel --prod --yes &>/dev/null
echo -e "${GREEN}${CHECK} Backend redeployed with configuration!${NC}"
echo ""

# ==========================================
# DEPLOY WEBAPP
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      ${ROCKET} DEPLOYING WEB APP                            ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd ../webapp

echo -e "${INFO} Deploying webapp to Vercel..."
WEBAPP_OUTPUT=$(vercel --prod --yes 2>&1)
WEBAPP_URL=$(echo "$WEBAPP_OUTPUT" | grep -oP 'https://[^\s]+\.vercel\.app' | head -1)

if [ -z "$WEBAPP_URL" ]; then
    echo -e "${RED}❌ Webapp deployment failed!${NC}"
    echo "$WEBAPP_OUTPUT"
    exit 1
fi

echo -e "${GREEN}${CHECK} Webapp deployed successfully!${NC}"
echo -e "${GREEN}   URL: ${WEBAPP_URL}${NC}"
echo ""

# ==========================================
# ADD ENVIRONMENT VARIABLES TO WEBAPP
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              ${INFO} CONFIGURING WEBAPP ENVIRONMENT VARIABLES              ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Add backend URL
echo -e "${INFO} Adding VITE_API_URL..."
echo "${BACKEND_URL}/api" | vercel env add VITE_API_URL production --yes &>/dev/null || true

# Function to add webapp env var
add_webapp_env_var() {
    local var_name=$1
    local value=$(grep "^${var_name}=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")

    if [ -n "$value" ]; then
        echo -e "${INFO} Adding ${var_name}..."
        echo "$value" | vercel env add "$var_name" production --yes &>/dev/null || echo -e "${YELLOW}   (already exists or skipped)${NC}"
    else
        echo -e "${YELLOW}${WARNING} Skipping ${var_name} (not found in .env)${NC}"
    fi
}

# Add Firebase config
add_webapp_env_var "VITE_FIREBASE_API_KEY"
add_webapp_env_var "VITE_FIREBASE_AUTH_DOMAIN"
add_webapp_env_var "VITE_FIREBASE_PROJECT_ID"
add_webapp_env_var "VITE_FIREBASE_STORAGE_BUCKET"
add_webapp_env_var "VITE_FIREBASE_MESSAGING_SENDER_ID"
add_webapp_env_var "VITE_FIREBASE_APP_ID"

echo -e "${GREEN}${CHECK} Environment variables configured!${NC}"
echo ""

# Redeploy webapp with environment variables
echo -e "${INFO} Redeploying webapp with environment variables..."
vercel --prod --yes &>/dev/null
echo -e "${GREEN}${CHECK} Webapp redeployed with configuration!${NC}"
echo ""

# ==========================================
# TEST DEPLOYMENTS
# ==========================================
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                      ${INFO} TESTING DEPLOYMENTS                             ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test backend health
echo -e "${INFO} Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health" || echo "error")

if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}${CHECK} Backend is healthy!${NC}"
    echo -e "   Response: ${HEALTH_RESPONSE}"
else
    echo -e "${YELLOW}${WARNING} Backend health check returned unexpected response${NC}"
    echo -e "   Response: ${HEALTH_RESPONSE}"
fi
echo ""

# Test webapp
echo -e "${INFO} Testing webapp accessibility..."
WEBAPP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL" || echo "000")

if [ "$WEBAPP_STATUS" = "200" ]; then
    echo -e "${GREEN}${CHECK} Webapp is accessible!${NC}"
else
    echo -e "${YELLOW}${WARNING} Webapp returned status code: ${WEBAPP_STATUS}${NC}"
fi
echo ""

# ==========================================
# DEPLOYMENT SUMMARY
# ==========================================
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  ${ROCKET} DEPLOYMENT COMPLETE! ${ROCKET}                           ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}${CHECK} Your BabySu app is now live!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 LIVE URLS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${ROCKET} Web App:    ${GREEN}${WEBAPP_URL}${NC}"
echo -e "  ${INFO} Backend API: ${GREEN}${BACKEND_URL}${NC}"
echo -e "  ${INFO} Health Check: ${GREEN}${BACKEND_URL}/health${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📱 NEXT STEPS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. ${INFO} Open webapp URL in your browser"
echo -e "  2. ${INFO} Test creating an account and child profile"
echo -e "  3. ${INFO} Try generating a song"
echo -e "  4. ${INFO} Share the URL with friends/family!"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔧 MANAGE YOUR DEPLOYMENT:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${INFO} View logs:        vercel logs ${WEBAPP_URL}"
echo -e "  ${INFO} List deployments: vercel ls"
echo -e "  ${INFO} Update app:       ./deploy-auto.sh (run again)"
echo -e "  ${INFO} Remove deployment: vercel rm [deployment-url]"
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                     ${CHECK} Deployment successful! ${CHECK}                       ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Save URLs to file
cd ..
echo "BACKEND_URL=${BACKEND_URL}" > DEPLOYMENT_URLS.txt
echo "WEBAPP_URL=${WEBAPP_URL}" >> DEPLOYMENT_URLS.txt
echo -e "${INFO} URLs saved to: ${PWD}/DEPLOYMENT_URLS.txt"
echo ""
