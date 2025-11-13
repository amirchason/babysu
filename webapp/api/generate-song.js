/**
 * Serverless Function: Generate Song with PiAPI (Udio)
 * Hides PiAPI API key from frontend
 */

const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { styleDescription, lyrics, title } = req.body;

    // Validate input
    if (!styleDescription || !lyrics || !title) {
      return res.status(400).json({
        error: 'styleDescription, lyrics, and title are required'
      });
    }

    // PiAPI endpoint with hidden API key
    const PIAPI_API_KEY = process.env.VITE_PIAPI_API_KEY || process.env.PIAPI_API_KEY;
    const PIAPI_BASE_URL = 'https://api.piapi.ai';

    const payload = {
      model: 'music-u',
      task_type: 'generate_music',
      input: {
        gpt_description_prompt: styleDescription,
        lyrics_type: 'user',
        lyrics: lyrics,
        title: title,
        negative_tags: '',
        seed: -1,
      },
      config: {
        service_mode: 'public',
      },
    };

    console.log('🎵 Calling PiAPI to generate song:', title);

    const response = await axios.post(
      `${PIAPI_BASE_URL}/api/v1/task`,
      payload,
      {
        headers: {
          'X-API-Key': PIAPI_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'PiAPI request failed');
    }

    const taskId = response.data.data.task_id;
    console.log('✅ Song generation started. Task ID:', taskId);

    res.status(200).json({
      success: true,
      data: {
        taskId: taskId,
        status: 'pending',
        estimatedTime: 60, // seconds
      },
    });

  } catch (error) {
    console.error('Generate song error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to generate song',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined,
    });
  }
};
