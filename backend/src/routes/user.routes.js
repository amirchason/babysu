const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

// Temp auth middleware
const requireAuth = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || 'test-user-123';
  next();
};

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    let userDoc = await db.collection('users').doc(req.userId).get();
    let userData;

    // If user doesn't exist, create a default user
    if (!userDoc.exists) {
      userData = {
        id: req.userId,
        name: 'Guest User',
        email: `${req.userId}@guest.babysu.app`,
        subscriptionTier: 'free',
        usage: {
          songsGenerated: 0,
          songsThisMonth: 0
        },
        createdAt: new Date().toISOString()
      };

      // Save to database
      await db.collection('users').doc(req.userId).set(userData);
      logger.info('Created default user profile', { userId: req.userId });
    } else {
      userData = userDoc.data();
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/usage
 * Get user usage stats
 */
router.get('/usage', requireAuth, async (req, res) => {
  try {
    let userDoc = await db.collection('users').doc(req.userId).get();
    let userData;

    // If user doesn't exist, create a default user
    if (!userDoc.exists) {
      userData = {
        id: req.userId,
        subscriptionTier: 'free',
        usage: {
          songsGenerated: 0,
          songsThisMonth: 0
        },
        createdAt: new Date().toISOString()
      };

      // Save to database
      await db.collection('users').doc(req.userId).set(userData);
      logger.info('Created default user', { userId: req.userId });
    } else {
      userData = userDoc.data();
    }

    const limits = {
      free: 3,
      basic: 20,
      family: 50,
      premium: 999999
    };

    const limit = limits[userData.subscriptionTier || 'free'];
    const used = userData.usage?.songsThisMonth || 0;

    res.json({
      success: true,
      data: {
        subscriptionTier: userData.subscriptionTier || 'free',
        limit,
        used,
        remaining: limit - used,
        songsGenerated: userData.usage?.songsGenerated || 0
      }
    });

  } catch (error) {
    logger.error('Get usage error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
