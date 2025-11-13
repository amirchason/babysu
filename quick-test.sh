#!/bin/bash

USER_ID="demo-test-$(date +%s)"
echo "Testing with user: $USER_ID"

# Create child
echo "Creating child..."
CHILD_JSON=$(curl -s -X POST http://localhost:5000/api/children \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{"name":"TestKid","age":3,"birthDate":"2022-01-01"}')
CHILD_ID=$(echo $CHILD_JSON | grep -o '"childId":"[^"]*"' | cut -d'"' -f4)
echo "Child ID: $CHILD_ID"

# Generate song
echo "Generating song..."
SONG_JSON=$(curl -s -X POST http://localhost:5000/api/songs/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{\"childIds\":[\"$CHILD_ID\"],\"topic\":\"demo test\",\"category\":\"lullaby\",\"style\":\"piano\"}")
echo "Song response: $SONG_JSON"

SONG_ID=$(echo $SONG_JSON | grep -o '"songId":"[^"]*"' | cut -d'"' -f4)
echo "Song ID: $SONG_ID"

# Get song details
echo "Getting song..."
curl -s http://localhost:5000/api/songs/$SONG_ID -H "x-user-id: $USER_ID" | head -50

# Get all songs
echo -e "\nAll songs:"
curl -s http://localhost:5000/api/songs -H "x-user-id: $USER_ID" | head -50
