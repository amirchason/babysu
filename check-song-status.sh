#!/bin/bash

SONG_ID="${1:-mhol92b1f1jmwj3jq}"
USER_ID="${2:-demo-test-1762503786}"

echo "🎵 Checking song status: $SONG_ID"
echo "=========================================="

for i in {1..10}; do
  echo -e "\n--- Check #$i ($(date +%H:%M:%S)) ---"
  
  STATUS_RESPONSE=$(curl -s http://localhost:5000/api/songs/$SONG_ID/status \
    -H "x-user-id: $USER_ID")
  
  echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"
  
  # Check if completed
  if echo "$STATUS_RESPONSE" | grep -q '"status":"completed"'; then
    echo -e "\n🎉 Song generation completed!"
    
    # Get full song details
    echo -e "\n📊 Full song details:"
    curl -s http://localhost:5000/api/songs/$SONG_ID \
      -H "x-user-id: $USER_ID" | python3 -m json.tool | grep -E "(title|audioUrl|status|duration)"
    
    exit 0
  fi
  
  # Check if failed
  if echo "$STATUS_RESPONSE" | grep -q '"status":"failed"'; then
    echo -e "\n❌ Song generation failed!"
    exit 1
  fi
  
  echo "⏳ Status: generating... waiting 10 seconds"
  sleep 10
done

echo -e "\n⏰ Timeout: Song still generating after 100 seconds"
