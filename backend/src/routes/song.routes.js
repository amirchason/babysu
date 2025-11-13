const express = require('express');
const router = express.Router();
const songService = require('../services/songService');
const knowledgeService = require('../services/knowledgeService');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

// Middleware to verify auth (placeholder - will implement in Phase 1)
const requireAuth = (req, res, next) => {
  // TODO: Implement Firebase auth verification
  // For now, pass through with mock userId
  req.userId = req.headers['x-user-id'] || 'test-user-123';
  next();
};

/**
 * GET /api/songs/suggestions/:childId
 * Get age-appropriate smart suggestions for song creation
 * Returns topics, categories, affirmations, and templates based on child's age
 */
router.get('/suggestions/:childId', requireAuth, async (req, res) => {
  try {
    const { childId } = req.params;

    // Get child data from Firebase
    const childDoc = await db.collection('children')
      .where('userId', '==', req.userId)
      .where('childId', '==', childId)
      .limit(1)
      .get();

    if (childDoc.empty) {
      return res.status(404).json({
        error: 'Child not found or unauthorized access'
      });
    }

    const childData = childDoc.docs[0].data();
    const childAge = childData.age || 3; // Default to 3 if age not set
    const childName = childData.name || 'Child';

    // Get age-appropriate suggestions from knowledge base
    const suggestions = knowledgeService.getSuggestionsForAge(childAge);

    // Add child-specific context
    const response = {
      ...suggestions,
      childId: childId,
      childName: childName,
      childAge: childAge
    };

    res.json({
      success: true,
      data: response
    });

    logger.info('Smart suggestions generated', {
      userId: req.userId,
      childId,
      childAge,
      topicsCount: suggestions.recommendations.topics.length,
      categoriesCount: suggestions.recommendations.categories.length
    });

  } catch (error) {
    logger.error('Suggestions endpoint error', {
      userId: req.userId,
      childId: req.params.childId,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: error.message
    });
  }
});

/**
 * POST /api/songs/generate
 * Generate a new personalized song
 */
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { childIds, topic, category, style, customDetails } = req.body;

    // Validation
    if (!childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return res.status(400).json({ error: 'childIds array is required' });
    }

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const result = await songService.initiateSongGeneration(req.userId, {
      childIds,
      topic,
      category,
      style: style || 'pop',
      customDetails: customDetails || ''
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Song generation started! Check status with /api/songs/:songId'
    });

  } catch (error) {
    logger.error('Song generation endpoint error', {
      userId: req.userId,
      error: error.message
    });

    res.status(error.message.includes('Usage limit') ? 403 : 500).json({
      error: error.message
    });
  }
});

/**
 * GET /api/songs
 * Get all songs for authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, childId, isFavorite, status, limit } = req.query;

    const songs = await songService.getUserSongs(req.userId, {
      category,
      childId,
      isFavorite: isFavorite === 'true',
      status,
      limit: parseInt(limit) || 50
    });

    res.json({
      success: true,
      data: songs,
      count: songs.length
    });

  } catch (error) {
    logger.error('Get songs endpoint error', {
      userId: req.userId,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/songs/:songId
 * Get specific song by ID
 */
router.get('/:songId', requireAuth, async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.songId);

    // Verify ownership
    if (song.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: song
    });

  } catch (error) {
    logger.error('Get song endpoint error', {
      songId: req.params.songId,
      error: error.message
    });

    res.status(error.message === 'Song not found' ? 404 : 500).json({
      error: error.message
    });
  }
});

/**
 * GET /api/songs/:songId/status
 * Check song generation status
 */
router.get('/:songId/status', requireAuth, async (req, res) => {
  try {
    const status = await songService.checkSongStatus(req.params.songId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('Check status endpoint error', {
      songId: req.params.songId,
      error: error.message
    });

    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/songs/:songId/favorite
 * Toggle favorite status
 */
router.patch('/:songId/favorite', requireAuth, async (req, res) => {
  try {
    const isFavorite = await songService.toggleFavorite(req.params.songId, req.userId);

    res.json({
      success: true,
      data: { isFavorite },
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites'
    });

  } catch (error) {
    logger.error('Toggle favorite endpoint error', {
      songId: req.params.songId,
      error: error.message
    });

    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      error: error.message
    });
  }
});

/**
 * DELETE /api/songs/:songId
 * Delete a song
 */
router.delete('/:songId', requireAuth, async (req, res) => {
  try {
    await songService.deleteSong(req.params.songId, req.userId);

    res.json({
      success: true,
      message: 'Song deleted successfully'
    });

  } catch (error) {
    logger.error('Delete song endpoint error', {
      songId: req.params.songId,
      error: error.message
    });

    res.status(error.message === 'Unauthorized' ? 403 : 500).json({
      error: error.message
    });
  }
});

module.exports = router;
