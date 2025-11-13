#!/usr/bin/env bash
#
# 🎵 BabySU Demo - No Firebase Required!
# ==========================================
# This script demonstrates using BabySU backend WITHOUT Firebase Admin SDK
# All data is stored in-memory (mock database)
#

set -e

echo "🎵 BabySU Demo - No Firebase Required!"
echo "========================================"
echo ""

# Configuration
BASE_URL="http://localhost:5000"
USER_ID="demo-$(date +%s)"

echo "📝 Using User ID: $USER_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check server health
echo -e "${BLUE}Step 1: Checking server health...${NC}"
HEALTH=$(curl -s "$BASE_URL/health")
STATUS=$(echo $HEALTH | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "ok" ]; then
    echo -e "${GREEN}✅ Server is healthy!${NC}"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    echo -e "${YELLOW}❌ Server not responding. Start it with:${NC}"
    echo "   cd backend && node src/server.js"
    exit 1
fi
echo ""

# Step 2: Create a user profile (mock)
echo -e "${BLUE}Step 2: Creating mock user profile...${NC}"
USER_DATA='{
  "email": "parent@example.com",
  "displayName": "Demo Parent",
  "uid": "'$USER_ID'"
}'

# Note: In mock mode, user is auto-created when needed
echo -e "${GREEN}✅ User will be auto-created: $USER_ID${NC}"
echo ""

# Step 3: Create child profile
echo -e "${BLUE}Step 3: Creating child profile...${NC}"
CHILD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/children" \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{
    "name": "Emma",
    "age": 2,
    "gender": "female",
    "preferences": {
      "favoriteColors": ["blue", "green"],
      "favoriteAnimals": ["owl", "bunny"],
      "interests": ["nature", "music", "stories"]
    }
  }')

echo "$CHILD_RESPONSE" | jq '.' 2>/dev/null || echo "$CHILD_RESPONSE"

# Extract child ID
CHILD_ID=$(echo "$CHILD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CHILD_ID" ]; then
    echo -e "${YELLOW}❌ Failed to create child profile${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Child created with ID: $CHILD_ID${NC}"
echo ""

# Step 4: View all children
echo -e "${BLUE}Step 4: Viewing all children for this user...${NC}"
CHILDREN=$(curl -s "$BASE_URL/api/children" \
  -H "x-user-id: $USER_ID")

echo "$CHILDREN" | jq '.' 2>/dev/null || echo "$CHILDREN"
echo ""

# Step 5: Explain song generation (without calling the API)
echo -e "${BLUE}Step 5: About Song Generation${NC}"
echo -e "${YELLOW}ℹ️  Song generation requires:${NC}"
echo "   1. Valid PiAPI (Udio) API key in .env"
echo "   2. User profile in database"
echo "   3. API call takes 60-120 seconds"
echo ""
echo -e "${BLUE}To generate a song, run:${NC}"
echo "curl -X POST $BASE_URL/api/songs/generate \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"x-user-id: $USER_ID\" \\"
echo "  -d '{"
echo "    \"childIds\": [\"$CHILD_ID\"],"
echo "    \"topic\": \"bedtime forest adventure\","
echo "    \"category\": \"lullaby\","
echo "    \"style\": \"gentle piano\","
echo "    \"customDetails\": \"Include forest sounds and friendly animals\""
echo "  }'"
echo ""

# Step 6: View current songs
echo -e "${BLUE}Step 6: Viewing song library...${NC}"
SONGS=$(curl -s "$BASE_URL/api/songs" \
  -H "x-user-id: $USER_ID")

echo "$SONGS" | jq '.' 2>/dev/null || echo "$SONGS"
SONG_COUNT=$(echo "$SONGS" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}Current songs: $SONG_COUNT${NC}"
echo ""

# Summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Demo Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "📊 Summary:"
echo "   User ID: $USER_ID"
echo "   Child ID: $CHILD_ID"
echo "   Child Name: Emma"
echo "   Songs: $SONG_COUNT"
echo ""
echo "🎯 What Works WITHOUT Firebase:"
echo "   ✅ Health check"
echo "   ✅ Child profile creation"
echo "   ✅ Child profile listing"
echo "   ✅ Child profile updates"
echo "   ✅ Song generation (with PiAPI key)"
echo "   ✅ Song library management"
echo "   ✅ Mock authentication"
echo ""
echo "⚠️  Limitations (Mock Database):"
echo "   ⚠️  Data resets on server restart"
echo "   ⚠️  No audio file storage (but Udio URLs work)"
echo "   ⚠️  No real user authentication"
echo ""
echo "📚 For more info, see: QUICK_START_WITHOUT_FIREBASE.md"
echo ""
