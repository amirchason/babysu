# PiAPI Udio API Implementation Reference

**Date**: 2025-10-25
**Source**: https://piapi.ai/docs/llms.txt

---

## CRITICAL INFORMATION

### API Structure
PiAPI uses a **Unified API schema** with just TWO endpoints for ALL AI models:
1. **Create Task** - Submit generation requests
2. **Get Task** - Retrieve results and status

### Authentication
- Method: API Key via header
- Header: `X-API-Key: your_api_key_here`
- Get key from: https://piapi.ai/dashboard

---

## UDIO (MUSIC GENERATION) API

### Endpoints

#### 1. Create Music Task
```
POST https://api.piapi.ai/api/v1/task
```

#### 2. Get Task Status
```
GET https://api.piapi.ai/api/v1/task/{task_id}
```

### Request Structure

**Headers:**
```
X-API-Key: your_api_key_here
Content-Type: application/json
Accept: application/json
```

**Body (Text Description Mode):**
```json
{
  "model": "music-u",
  "task_type": "generate_music",
  "input": {
    "gpt_description_prompt": "night breeze, piano, gentle lullaby",
    "lyrics_type": "generate",
    "negative_tags": "rock,metal",
    "seed": -1
  },
  "config": {
    "service_mode": "public"
  }
}
```

**Body (Custom Lyrics Mode):**
```json
{
  "model": "music-u",
  "task_type": "generate_music",
  "input": {
    "gpt_description_prompt": "jazz, pop, upbeat",
    "lyrics_type": "user",
    "lyrics": "[Verse]\\nEmma closes her eyes so tight...\\n[Chorus]\\nDreams of stars...",
    "title": "Emma's Bedtime Song",
    "negative_tags": "",
    "seed": -1
  },
  "config": {
    "service_mode": "public"
  }
}
```

**Body (Instrumental Mode):**
```json
{
  "model": "music-u",
  "task_type": "generate_music",
  "input": {
    "gpt_description_prompt": "calm piano, ambient, relaxing",
    "lyrics_type": "instrumental",
    "negative_tags": "",
    "seed": -1
  },
  "config": {
    "service_mode": "public"
  }
}
```

### Parameters Explained

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Must be `"music-u"` for Udio |
| `task_type` | string | Yes | Must be `"generate_music"` |
| `gpt_description_prompt` | string | Yes | Musical style description (e.g., "piano, lullaby, soft") |
| `lyrics_type` | string | Yes | `"generate"` (AI lyrics), `"user"` (custom lyrics), `"instrumental"` (no lyrics) |
| `lyrics` | string | Conditional | Required when `lyrics_type: "user"`. Full song lyrics with verse markers |
| `title` | string | No | Song title (optional) |
| `negative_tags` | string | No | Comma-separated styles to avoid (e.g., "rock,metal") |
| `seed` | number | No | Use `-1` for random, or specific number for reproducible results |
| `service_mode` | string | No | Use `"public"` (default) |

### Response Format

**Create Task Response:**
```json
{
  "code": 200,
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "success"
}
```

**Get Task Response (Processing):**
```json
{
  "code": 200,
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Processing",
    "input": { ... },
    "output": null
  },
  "message": "success"
}
```

**Get Task Response (Completed):**
```json
{
  "code": 200,
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Completed",
    "input": { ... },
    "output": {
      "audio_url": "https://...",
      "title": "Emma's Bedtime Song",
      "lyrics": "...",
      "duration": 120,
      "metadata": { ... }
    }
  },
  "message": "success"
}
```

### Task Status Values

- `"Pending"` - Task queued, not started
- `"Processing"` - Task in progress
- `"Completed"` - Task finished successfully
- `"Failed"` - Task failed (check error field)
- `"Staged"` - Task staged for processing

### Pricing

**Cost**: $0.05 per generation (music-u model)

### Generation Time

Typical: 30-90 seconds depending on complexity

---

## IMPLEMENTATION GUIDELINES FOR BABYSU

### Service Structure

**File**: `backend/src/services/udioService.js`

```javascript
const axios = require('axios');
const logger = require('../utils/logger');

class UdioService {
  constructor() {
    this.apiKey = process.env.PIAPI_API_KEY;
    this.baseUrl = 'https://api.piapi.ai';
  }

  async generateSong(prompt, lyrics = null, style = 'lullaby') {
    try {
      const requestBody = {
        model: "music-u",
        task_type: "generate_music",
        input: {
          gpt_description_prompt: prompt,
          lyrics_type: lyrics ? "user" : "generate",
          negative_tags: "",
          seed: -1
        },
        config: {
          service_mode: "public"
        }
      };

      if (lyrics) {
        requestBody.input.lyrics = lyrics;
      }

      const response = await axios.post(
        `${this.baseUrl}/api/v1/task`,
        requestBody,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      logger.info('Udio song generation initiated', {
        taskId: response.data.data?.task_id
      });

      return {
        taskId: response.data.data?.task_id,
        status: 'generating'
      };
    } catch (error) {
      logger.error('Udio API Error', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Udio API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async checkStatus(taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/task/${taskId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      const data = response.data.data;

      return {
        status: data.status.toLowerCase(), // 'pending', 'processing', 'completed', 'failed'
        audioUrl: data.output?.audio_url || null,
        lyrics: data.output?.lyrics || '',
        duration: data.output?.duration || 0,
        metadata: data.output?.metadata || {}
      };
    } catch (error) {
      logger.error('Udio status check error', {
        taskId,
        error: error.message
      });
      throw new Error(`Udio Status Check Error: ${error.message}`);
    }
  }
}

module.exports = new UdioService();
```

### Environment Variables

**File**: `backend/.env`

```bash
# PiAPI Configuration
PIAPI_API_KEY=your_piapi_key_here
PIAPI_BASE_URL=https://api.piapi.ai

# Gemini (for prompt generation)
GEMINI_API_KEY=your_gemini_key_here
```

### Integration with BabySu

1. **Prompt Service** (Gemini) generates song concept and lyrics
2. **Udio Service** (PiAPI) generates actual music with lyrics
3. **Firebase Storage** stores the audio file
4. **Firestore** stores song metadata

---

## DIFFERENCES FROM SUNO

| Feature | Suno | Udio (PiAPI) |
|---------|------|--------------|
| Endpoint | `/api/suno/v1/music` | `/api/v1/task` (unified) |
| Model | `chirp-v3-5` | `music-u` |
| Task Type | Implicit | Explicit `generate_music` |
| Status Endpoint | `/api/suno/v1/music/{id}` | `/api/v1/task/{id}` |
| Pricing | $0.01-0.02 | $0.05 |
| Auth Header | `X-API-Key` or `Authorization: Bearer` | `X-API-Key` only |

---

## TESTING

### Test Script

**File**: `backend/test_udio.js`

```javascript
require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.PIAPI_API_KEY;
const BASE_URL = 'https://api.piapi.ai';

async function testUdio() {
  // Create task
  const createResponse = await axios.post(
    `${BASE_URL}/api/v1/task`,
    {
      model: "music-u",
      task_type: "generate_music",
      input: {
        gpt_description_prompt: "gentle bedtime lullaby for child named Emma, soft piano, calm",
        lyrics_type: "generate",
        seed: -1
      },
      config: {
        service_mode: "public"
      }
    },
    {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );

  console.log('Task created:', createResponse.data);

  const taskId = createResponse.data.data.task_id;

  // Check status
  const statusResponse = await axios.get(
    `${BASE_URL}/api/v1/task/${taskId}`,
    {
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
      }
    }
  );

  console.log('Task status:', statusResponse.data);
}

testUdio();
```

---

## WEBHOOK SUPPORT (Optional)

PiAPI supports webhooks for async notifications:

```json
{
  "model": "music-u",
  "task_type": "generate_music",
  "input": { ... },
  "config": {
    "service_mode": "public",
    "webhook_config": {
      "endpoint": "https://yourapp.com/webhook/piapi",
      "secret": "your_webhook_secret"
    }
  }
}
```

---

## ERROR HANDLING

Common error codes:
- `400` - Invalid request body
- `401` - Invalid API key
- `402` - Insufficient credits
- `404` - Task not found
- `500` - Server error

Always check `response.data.code` and `response.data.message` for details.

---

## COST OPTIMIZATION

1. **Use `seed`** for reproducible results (avoid regenerating same song)
2. **Negative tags** to avoid unwanted styles (saves iterations)
3. **Custom lyrics mode** for precise control (less regeneration needed)
4. **Instrumental mode** when lyrics not needed (same cost but simpler)

---

## BEST PRACTICES FOR BABYSU

1. **Generate lyrics with Gemini first** (free/cheap)
2. **Use Udio for music generation** ($0.05/song)
3. **Store audio URLs in Firestore** (don't regenerate)
4. **Poll status every 5-10 seconds** (don't spam)
5. **Implement retry logic** (network failures happen)
6. **Cache completed songs** (save API costs)

---

## LIMITATIONS

- Maximum lyrics length: ~1000 characters
- Generation time: 30-90 seconds
- One song per request (no bulk endpoint)
- Audio format: MP3 or WAV (check output)
- Storage: PiAPI stores outputs temporarily (download and save to Firebase)

---

## SUPPORT

- Dashboard: https://piapi.ai/dashboard
- Docs: https://piapi.ai/docs/overview
- Discord: Check website for link
- Email: contact@piapi.ai

---

**Last Updated**: 2025-10-25
**API Version**: v1
**Document Version**: 1.0
