#!/bin/bash

# ==========================================
# BabySu - Secure Environment Update Script
# ==========================================
# This script helps you securely update your .env files
# after API key rotation

set -e  # Exit on error

echo "🔒 BabySu Secure Environment Update Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate new JWT secret
echo "📝 Generating secure JWT secret..."
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo -e "${GREEN}✅ JWT Secret generated: ${NEW_JWT_SECRET:0:20}...${NC}"
echo ""

# Function to update JWT secret in .env file
update_jwt_secret() {
    local env_file=$1
    if [ -f "$env_file" ]; then
        if grep -q "^JWT_SECRET=" "$env_file"; then
            # Backup original
            cp "$env_file" "$env_file.backup.$(date +%Y%m%d_%H%M%S)"
            # Update JWT_SECRET
            sed -i.tmp "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|g" "$env_file"
            rm -f "$env_file.tmp"
            echo -e "${GREEN}✅ Updated JWT_SECRET in $env_file${NC}"
        else
            echo -e "${YELLOW}⚠️  JWT_SECRET not found in $env_file${NC}"
        fi
    else
        echo -e "${RED}❌ File not found: $env_file${NC}"
    fi
}

# Update JWT secret in backend/.env
echo "🔄 Updating backend/.env..."
update_jwt_secret "backend/.env"
echo ""

# Check for weak/default values
echo "🔍 Checking for weak credentials..."
echo ""

# Check backend/.env
if [ -f "backend/.env" ]; then
    echo "Checking backend/.env:"

    # Check for default JWT
    if grep -q "JWT_SECRET=your_super_secret_jwt_key_change_this_in_production" "backend/.env"; then
        echo -e "${RED}  ❌ Default JWT secret found (FIXED by this script)${NC}"
    else
        echo -e "${GREEN}  ✅ JWT secret is not default${NC}"
    fi

    # Check for test Stripe keys
    if grep -q "STRIPE_SECRET_KEY=sk_test_your_stripe_key_here" "backend/.env"; then
        echo -e "${YELLOW}  ⚠️  Stripe keys are still placeholders${NC}"
    fi

    # Check for weak password
    if grep -q "AUTO_LOGIN_PASSWORD=.*" "backend/.env"; then
        PASSWORD=$(grep "^AUTO_LOGIN_PASSWORD=" "backend/.env" | cut -d'=' -f2)
        if [ ${#PASSWORD} -lt 12 ]; then
            echo -e "${RED}  ❌ Weak AUTO_LOGIN_PASSWORD (less than 12 chars)${NC}"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "📋 NEXT STEPS:"
echo "=========================================="
echo ""
echo "1. 🔑 Regenerate OpenAI API Key:"
echo "   → https://platform.openai.com/api-keys"
echo "   → Update: backend/.env → OPENAI_API_KEY"
echo ""
echo "2. 🔑 Regenerate Gemini API Key:"
echo "   → https://aistudio.google.com/app/apikey"
echo "   → Update: backend/.env + webapp/.env → GEMINI_API_KEY"
echo ""
echo "3. 🔑 Regenerate Suno API Key:"
echo "   → Your Suno API dashboard"
echo "   → Update: backend/.env → SUNO_API_KEY"
echo ""
echo "4. 🔐 Change User Password:"
echo "   → Firebase Console → Authentication"
echo "   → Update: backend/.env + mobile/.env → AUTO_LOGIN_PASSWORD"
echo ""
echo "5. 🧹 Remove commented PiAPI key:"
echo "   → Edit backend/.env"
echo "   → Delete line with: # PIAPI_API_KEY=..."
echo ""
echo "6. ✅ Test all integrations:"
echo "   → cd backend && npm run dev"
echo "   → Check logs for connection confirmations"
echo ""
echo "=========================================="
echo "📖 Full Guide: SECURITY_SETUP_GUIDE.md"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ JWT secret has been updated!${NC}"
echo -e "${YELLOW}⚠️  Remember to regenerate ALL API keys that were exposed${NC}"
echo ""
