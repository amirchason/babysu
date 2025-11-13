# 🎵 Suno AI Integration - Complete Documentation

## Overview

BabySu now supports **BOTH Suno AI and Udio AI** for music generation via PiAPI. You can switch between engines using an environment variable.

### Why Suno?

| Feature | **Suno V5** | Udio |
|---------|------------|------|
| **Price** | $0.02/song (60% cheaper!) | $0.05/song |
| **Quality** | ELO Score: 1,293 | ELO Score: ~1,200 |
| **Model** | chirp-v3-5 (latest) | music-u |
| **Speed** | 30-60 seconds | 30-120 seconds |

---

## Configuration

### Environment Variables (`.env`)

```bash
# PiAPI Credentials
PIAPI_API_KEY=your_key_here
PIAPI_BASE_URL=https://api.piapi.ai

# Music Engine Selection
MUSIC_ENGINE=suno   # Options: "suno" or "udio"

# Demo Mode (for testing without credits)
DEMO_MODE=false
```

### Switch Between Engines

Change `MUSIC_ENGINE` in `.env`:
- **`suno`** = Suno V5 (chirp-v3-5) - RECOMMENDED
- **`udio`** = Udio (music-u)

Then restart the backend.

---

## API Endpoints

All endpoints remain the same - the engine is selected server-side based on `MUSIC_ENGINE` env var.

### 1. Generate Song

**Endpoint:** `POST /api/songs/generate`

**Headers:**
```
Content-Type: application/json
x-user-id: {userId}
```

**Request Body:**
```json
{
  "title": "Emma's Dreamy Night",
  "category": "bedtime",
  "topic": "stars and dreams",
  "style": "lullaby",
  "childrenIds": ["child-id-123"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "song-id-456",
    "title": "Emma's Dreamy Night",
    "status": "generating",
    "udioTaskId": "task-789",
    "createdAt": "2025-11-07T10:00:00Z"
  }
}
```

---

### 2. Check Song Status

**Endpoint:** `GET /api/songs/{songId}/status`

**Headers:**
```
x-user-id: {userId}
```

**Response (Generating):**
```json
{
  "status": "generating",
  "progress": "processing"
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "audioUrl": "https://storage.googleapis.com/.../song.mp3",
  "lyrics": "...",
  "duration": 130,
  "metadata": {
    "engine": "suno",
    "imageUrl": "...",
    "tags": "lullaby, soft, gentle"
  }
}
```

---

### 3. Get Song Details

**Endpoint:** `GET /api/songs/{songId}`

**Headers:**
```
x-user-id: {userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "song-id-456",
    "title": "Emma's Dreamy Night",
    "status": "completed",
    "audioUrl": "https://...",
    "lyrics": "...",
    "duration": 130,
    "category": "bedtime",
    "createdAt": "2025-11-07T10:00:00Z"
  }
}
```

---

## Suno API Technical Details

### Generation Request (Suno)

**Internal API Call:**
```
POST https://api.piapi.ai/api/suno/v1/music
```

**Request Body:**
```json
{
  "custom_mode": true,
  "mv": "chirp-v3-5",
  "input": {
    "prompt": "Gentle lullaby with soft piano...",
    "title": "Emma's Dreamy Night",
    "tags": "lullaby, soft, gentle, piano, soothing"
  }
}
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "task_id": "607ed8d0-2183-46ca-8f8e-314d98955656"
  },
  "message": "success"
}
```

---

### Status Check (Suno)

**Internal API Call:**
```
GET https://api.piapi.ai/api/v1/task/{task_id}
```

**Note:** Both Suno and Udio use the SAME unified endpoint for status checking.

**Headers:**
```
x-api-key: {apiKey}
Accept: application/json
```

**Response (Completed):**
```json
{
  "code": 200,
  "data": {
    "task_id": "607ed8d0-2183-46ca-8f8e-314d98955656",
    "status": "completed",
    "output": {
      "clips": [
        {
          "id": "clip-123",
          "audio_url": "https://cdn.piapi.ai/audio/song.mp3",
          "image_url": "https://cdn.piapi.ai/images/cover.jpg",
          "title": "Emma's Dreamy Night",
          "metadata": {
            "prompt": "Lyrics here...",
            "tags": "lullaby, soft, gentle",
            "duration": 130
          }
        }
      ]
    },
    "meta": {
      "created_at": "2025-11-07T08:23:13Z",
      "ended_at": "2025-11-07T08:23:45Z",
      "usage": {
        "type": "point",
        "frozen": 500000,
        "consume": 2000
      }
    }
  },
  "message": "success"
}
```

---

## Udio API Technical Details (Fallback)

### Generation Request (Udio)

**Internal API Call:**
```
POST https://api.piapi.ai/api/v1/task
```

**Request Body:**
```json
{
  "model": "music-u",
  "task_type": "generate_music",
  "input": {
    "gpt_description_prompt": "A gentle lullaby in a soothing piano style...",
    "lyrics_type": "user",
    "lyrics": "Verse 1 lyrics...",
    "title": "Emma's Dreamy Night",
    "negative_tags": "",
    "seed": -1
  },
  "config": {
    "service_mode": "public"
  }
}
```

### Status Check (Udio)

**Internal API Call:**
```
GET https://api.piapi.ai/api/v1/task/{task_id}
```

---

## Code Implementation

### Music Service (`musicService.js`)

**Key Features:**
- Unified interface for both Suno and Udio
- Automatic engine selection based on `MUSIC_ENGINE`
- Demo mode support
- Comprehensive error handling
- Proper response parsing for both APIs

**Core Methods:**
```javascript
// Generate song (auto-detects engine)
await musicService.generateSong(prompt, lyrics, title, style)

// Check status (works for both engines)
await musicService.checkStatus(taskId)

// Get engine info
musicService.getEngineInfo()
```

---

## Testing

### Test Script

Create `/backend/test-suno.js`:

```javascript
const musicService = require('./src/services/musicService');

async function testSuno() {
  console.log('🧪 Testing Suno AI Music Generation\n');

  // Get engine info
  console.log('Engine:', musicService.getEngineInfo());

  // Generate song
  const result = await musicService.generateSong(
    'A gentle lullaby with soft piano, slow tempo, calming mood',
    null,
    'Test Lullaby',
    'lullaby'
  );

  console.log('\n✅ Generation started:', result);
  console.log('⏳ Task ID:', result.taskId);
  console.log('🎵 Engine:', result.engine);

  // Poll for completion
  console.log('\n🔄 Checking status every 10 seconds...\n');

  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 10000));

    const status = await musicService.checkStatus(result.taskId);
    console.log(`Check ${i+1}:`, status.status);

    if (status.status === 'completed') {
      console.log('\n🎉 Song completed!');
      console.log('🎵 Audio URL:', status.audioUrl);
      console.log('📝 Lyrics:', status.lyrics.substring(0, 100) + '...');
      console.log('⏱️  Duration:', status.duration, 'seconds');
      break;
    }
  }
}

testSuno().catch(console.error);
```

**Run:**
```bash
cd backend
node test-suno.js
```

---

## Migration Notes

### From Udio to Suno

1. **No API Changes Required** - All endpoints remain the same
2. **Update `.env`** - Set `MUSIC_ENGINE=suno`
3. **Restart Backend** - Kill and restart Node.js server
4. **Test** - Generate a song and verify it uses Suno
5. **Cost Savings** - You'll now pay $0.02 instead of $0.05 per song

### Switching Back to Udio

If you want to switch back to Udio:

```bash
# In .env
MUSIC_ENGINE=udio
```

Then restart backend.

---

## Pricing Comparison

### Suno AI (Current)
- **Price:** $0.02 per generation
- **What you get:** 1 song clip (~2 minutes)
- **Example:** 100 songs = $2.00

### Udio AI (Alternative)
- **Price:** $0.05 per generation
- **What you get:** 1 song clip (~2 minutes)
- **Example:** 100 songs = $5.00

**Savings with Suno:** 60% cheaper! ($3.00 saved per 100 songs)

---

## Troubleshooting

### Issue: Still getting Udio songs

**Solution:**
1. Check `.env`: `MUSIC_ENGINE=suno`
2. Restart backend completely
3. Check logs for: `🎵 Music Service initialized {"engine":"suno"}`

### Issue: PiAPI API Error

**Common causes:**
- Invalid API key
- Insufficient credits
- Rate limit exceeded

**Check your credits:**
Visit https://piapi.ai/dashboard

### Issue: Songs not completing

**Possible causes:**
- PiAPI service temporary issue
- Network problems
- Task queue backup

**Solution:** Wait and retry. Suno typically completes in 30-60 seconds.

---

## Monitoring

### Backend Logs

Watch for these log messages:

```
🎵 Music Service initialized {"engine":"suno","demoMode":false}
🎵 Generating song with Suno AI (PiAPI) ...
🎶 Suno song generation initiated {"taskId":"..."}
```

### Frontend Logs

The frontend polls every 10 seconds:

```
🔄 Polling 1 generating songs...
🔍 Checking status for song: {songId}
✅ Song completed: {title}
```

---

## Additional Resources

- **PiAPI Suno Docs:** https://piapi.ai/suno-api
- **Suno API GitHub:** https://github.com/PiAPI-1/Suno-API
- **PiAPI Dashboard:** https://piapi.ai/dashboard
- **Support:** Contact PiAPI support or check documentation

---

## Summary

🎉 **Suno AI is now your default music engine!**

✅ **60% cost savings** compared to Udio
✅ **Better quality** (ELO 1,293 vs 1,200)
✅ **Faster generation** (30-60 seconds)
✅ **Latest model** (chirp-v3-5)
✅ **Easy switching** between engines

**Next Steps:**
1. Generate a test song
2. Verify it uses Suno (check logs)
3. Enjoy cheaper, better quality music! 🎵
