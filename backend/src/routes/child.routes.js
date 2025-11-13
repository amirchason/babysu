const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

// Temp auth middleware (TODO: replace with proper Firebase auth)
const requireAuth = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || 'test-user-123';
  next();
};

/**
 * POST /api/children
 * Create new child profile
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, age, gender, birthday, photoURL, preferences } = req.body;

    // Validation
    if (!name || age === null || age === undefined) {
      return res.status(400).json({ error: 'Name and age are required' });
    }

    const parsedAge = parseFloat(age);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 18) {
      return res.status(400).json({ error: 'Age must be between 0.1 and 18' });
    }

    // Create child document
    const childRef = db.collection('children').doc();
    const childData = {
      id: childRef.id,
      childId: childRef.id,
      userId: req.userId,
      name,
      age: parsedAge,
      gender: gender || null,
      birthday: birthday ? new Date(birthday) : null,
      photoURL: photoURL || null,
      preferences: preferences || {
        favoriteColors: [],
        favoriteAnimals: [],
        interests: []
      },
      createdAt: new Date(),
      siblings: []
    };

    await childRef.set(childData);

    logger.info('Child profile created', { childId: childRef.id, name, userId: req.userId });

    res.status(201).json({
      success: true,
      data: childData,
      message: 'Child profile created successfully'
    });

  } catch (error) {
    logger.error('Create child error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/children
 * Get all children for authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('children')
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const children = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: children,
      count: children.length
    });

  } catch (error) {
    logger.error('Get children error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/children/:childId
 * Get specific child by ID
 */
router.get('/:childId', requireAuth, async (req, res) => {
  try {
    const childDoc = await db.collection('children').doc(req.params.childId).get();

    if (!childDoc.exists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();

    // Verify ownership
    if (childData.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: { id: childDoc.id, ...childData }
    });

  } catch (error) {
    logger.error('Get child error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/children/:childId
 * Update child profile
 */
router.patch('/:childId', requireAuth, async (req, res) => {
  try {
    const childRef = db.collection('children').doc(req.params.childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();

    // Verify ownership
    if (childData.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'age', 'gender', 'birthday', 'photoURL', 'preferences', 'siblings'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = key === 'age' ? parseFloat(req.body[key]) : req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updatedAt = new Date();

    await childRef.update(updates);

    logger.info('Child profile updated', { childId: req.params.childId });

    res.json({
      success: true,
      data: { id: req.params.childId, ...childData, ...updates },
      message: 'Child profile updated successfully'
    });

  } catch (error) {
    logger.error('Update child error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/children/:childId
 * Delete child profile
 */
router.delete('/:childId', requireAuth, async (req, res) => {
  try {
    const childRef = db.collection('children').doc(req.params.childId);
    const childDoc = await childRef.get();

    if (!childDoc.exists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();

    // Verify ownership
    if (childData.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await childRef.delete();

    logger.info('Child profile deleted', { childId: req.params.childId });

    res.json({
      success: true,
      message: 'Child profile deleted successfully'
    });

  } catch (error) {
    logger.error('Delete child error', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
