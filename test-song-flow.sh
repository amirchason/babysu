#!/bin/bash

# Complete song generation flow test
echo "🧪 Testing Complete Song Generation Flow"
echo "=========================================="

USER_ID="test-flow-user-$(date +%s)"
echo "User ID: $USER_ID"

# Step 1: Create child profile
echo -e "\n📝 Step 1: Creating child profile..."
CHILD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/children \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{"name":"Sophie","age":3,"birthDate":"2022-01-01"}')

CHILD_ID=$(echo $CHILD_RESPONSE | grep -o '"childId":"[^"]*"' | cut -d'"' -f4)
echo "✅ Child created: $CHILD_ID"

# Step 2: Generate song
echo -e "\n🎵 Step 2: Generating song..."
SONG_RESPONSE=$(curl -s -X POST http://localhost:5000/api/songs/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{\"childIds\":[\"$CHILD_ID\"],\"topic\":\"bedtime adventure\",\"category\":\"lullaby\",\"style\":\"acoustic\"}")

SONG_ID=$(echo $SONG_RESPONSE | grep -o '"songId":"[^"]*"' | cut -d'"' -f4)
echo "✅ Song initiated: $SONG_ID"
echo "Response: $SONG_RESPONSE"

# Step 3: Check status multiple times
echo -e "\n⏳ Step 3: Monitoring song status..."
for i in {1..10}; do
  echo -e "\n--- Check #$i ($(date +%H:%M:%S)) ---"
  STATUS_RESPONSE=$(curl -s http://localhost:5000/api/songs/$SONG_ID/status \
    -H "x-user-id: $USER_ID")
  echo "$STATUS_RESPONSE"

  # Check if completed
  if echo "$STATUS_RESPONSE" | grep -q '"status":"completed"'; then
    echo "🎉 Song generation completed!"
    break
  fi

  # Check if failed
  if echo "$STATUS_RESPONSE" | grep -q '"status":"failed"'; then
    echo "❌ Song generation failed!"
    break
  fi

  echo "Status: generating... waiting 10 seconds"
  sleep 10
done

# Step 4: Get final song details
echo -e "\n📊 Step 4: Final song details..."
FINAL_SONG=$(curl -s http://localhost:5000/api/songs/$SONG_ID \
  -H "x-user-id: $USER_ID")
echo "$FINAL_SONG" | head -20

# Step 5: Get all songs for user
echo -e "\n📚 Step 5: All songs in library..."
ALL_SONGS=$(curl -s http://localhost:5000/api/songs \
  -H "x-user-id: $USER_ID")
echo "$ALL_SONGS"

echo -e "\n=========================================="
echo "✅ Test complete!"
