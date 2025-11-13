/**
 * Serverless Function: Generate Song Prompt with Gemini
 * Hides Gemini API key from frontend
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const { childName, childAge, topic, category, style, customDetails } = req.body;

    // Validate input
    if (!childName || !topic) {
      return res.status(400).json({ error: 'childName and topic are required' });
    }

    // Initialize Gemini with hidden API key
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Generate prompt
    const prompt = `Create a personalized children's song for ${childName} (age ${childAge || 3}).

Topic: ${topic}
Category: ${category || 'general'}
Style: ${style || 'playful'}
${customDetails ? `Additional details: ${customDetails}` : ''}

Generate:
1. Song title (max 50 characters)
2. Lyrics (2-3 verses with chorus, suitable for children age ${childAge || 3})
3. Style description for Udio AI (genre, mood, instruments)

Format as JSON:
{
  "title": "...",
  "lyrics": "...",
  "styleDescription": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const songData = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      success: true,
      data: {
        title: songData.title || `${childName}'s ${topic}`,
        lyrics: songData.lyrics,
        styleDescription: songData.styleDescription || `children's music, ${style || 'playful'}`,
      },
    });

  } catch (error) {
    console.error('Generate prompt error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate prompt',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
