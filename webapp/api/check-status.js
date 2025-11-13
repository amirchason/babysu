/**
 * Serverless Function: Check Song Generation Status
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // PiAPI endpoint with hidden API key
    const PIAPI_API_KEY = process.env.VITE_PIAPI_API_KEY || process.env.PIAPI_API_KEY;
    const PIAPI_BASE_URL = 'https://api.piapi.ai';

    console.log('🔍 Checking status for task:', taskId);

    const response = await axios.get(
      `${PIAPI_BASE_URL}/api/v1/task/${taskId}`,
      {
        headers: {
          'X-API-Key': PIAPI_API_KEY,
        },
        timeout: 10000,
      }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Status check failed');
    }

    const taskData = response.data.data;
    const status = taskData.status.toLowerCase(); // pending, processing, completed, failed

    // Parse response based on status
    let result = {
      status: status,
      taskId: taskId,
    };

    if (status === 'completed' && taskData.output?.songs?.length > 0) {
      const song = taskData.output.songs[0];
      result = {
        ...result,
        audioUrl: song.song_path,
        lyrics: song.lyrics,
        duration: song.duration,
        coverUrl: song.image_path,
        metadata: {
          generationId: taskData.output.generation_id,
          finishedAt: taskData.meta?.ended_at,
        },
      };
      console.log('✅ Song completed:', song.song_path);
    } else if (status === 'failed') {
      result.error = taskData.error?.message || 'Generation failed';
      console.log('❌ Song generation failed');
    } else {
      console.log('⏳ Song still generating...', status);
    }

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Check status error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to check status',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined,
    });
  }
};
