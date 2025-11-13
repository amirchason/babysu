const sunoMusicService = require('./sunoMusicService');
const promptService = require('./promptService');
const { db } = require('../config/firebase');
const logger = require('../utils/logger');

class SongService {
  /**
   * Initiate song generation process
   * @param {string} userId - User ID
   * @param {Object} songData - Song creation data
   * @returns {Promise<{songId: string, status: string, estimatedTime: number}>}
   */
  async initiateSongGeneration(userId, songData) {
    try {
      // 1. Validate user subscription & usage limits
      let userDoc = await db.collection('users').doc(userId).get();
      let userData;

      // Auto-create user if doesn't exist (guest mode)
      if (!userDoc.exists) {
        userData = {
          id: userId,
          subscriptionTier: 'free',
          usage: {
            songsGenerated: 0,
            songsThisMonth: 0
          },
          createdAt: new Date().toISOString()
        };
        await db.collection('users').doc(userId).set(userData);
        logger.info('Auto-created user for song generation', { userId });
      } else {
        userData = userDoc.data();
      }

      if (!this.canGenerateSong(userData)) {
        throw new Error(
          `Usage limit reached. You've generated ${userData.usage.songsThisMonth} songs this month. ` +
          `Please upgrade your subscription to generate more.`
        );
      }

      // 2. Get child data
      const childDocs = await db.collection('children')
        .where('userId', '==', userId)
        .get();

      const allChildren = childDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const selectedChildren = allChildren.filter(child =>
        songData.childIds.includes(child.childId)
      );

      if (selectedChildren.length === 0) {
        throw new Error('No valid children found for the provided IDs');
      }

      // 3. Generate prompt using Gemini
      logger.info('Generating Suno prompt', {
        userId,
        childName: selectedChildren[0].name,
        topic: songData.topic
      });

      const sunoPrompt = await promptService.generateSunoPrompt({
        childName: selectedChildren[0].name,
        childAge: selectedChildren[0].age,
        topic: songData.topic,
        category: songData.category,
        style: songData.style || 'lullaby',
        customDetails: songData.customDetails,
        siblingName: selectedChildren[1]?.name
      });

      // 4. Create song document (status: pending)
      const songRef = db.collection('songs').doc();
      const timestamp = new Date();

      const songDoc = {
        songId: songRef.id,
        userId: userId,
        childIds: songData.childIds,
        title: `${selectedChildren[0].name}'s ${songData.topic}`,
        category: songData.category,
        topic: songData.topic,
        customDetails: songData.customDetails || '',
        style: songData.style || 'lullaby',
        status: 'pending',
        isFavorite: false,
        playCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          geminiPrompt: songData.customDetails || '',
          prompt: sunoPrompt,
          childNames: selectedChildren.map(c => c.name),
          childAges: selectedChildren.map(c => c.age)
        }
      };

      await songRef.set(songDoc);

      logger.info('Song document created', { songId: songRef.id });

      // 5. Start Suno generation (with error handling and knowledge-based parameters)
      let sunoResult;
      try {
        sunoResult = await sunoMusicService.generateSong(
          sunoPrompt.styleDescription,
          sunoPrompt.lyrics,
          songDoc.title,
          songData.style,
          sunoPrompt.musicParameters // NEW: Pass knowledge base music parameters
        );
      } catch (sunoError) {
        // Update song to failed status
        await songRef.update({
          status: 'failed',
          error: sunoError.message,
          updatedAt: new Date()
        });

        logger.error('Suno generation failed, song marked as failed', {
          songId: songRef.id,
          error: sunoError.message
        });

        throw sunoError; // Re-throw to return error to client
      }

      // Update song with taskId and status
      const updateData = {
        sunoTaskId: sunoResult.taskId,
        status: sunoResult.status === 'SUCCESS' ? 'completed' : 'generating',
        updatedAt: new Date()
      };

      // If demo mode completed instantly, add audio URL
      if (sunoResult.status === 'SUCCESS' && sunoResult.audioUrl) {
        updateData.audioUrl = sunoResult.audioUrl;
        updateData.duration = sunoResult.duration || 60;
        updateData.lyrics = sunoResult.lyrics || sunoPrompt.lyrics;
      }

      await songRef.update(updateData);

      // 6. Update user usage
      await db.collection('users').doc(userId).update({
        'usage.songsGenerated': (userData.usage?.songsGenerated || 0) + 1,
        'usage.songsThisMonth': (userData.usage?.songsThisMonth || 0) + 1,
        'usage.lastGeneratedAt': timestamp
      });

      logger.info('Song generation initiated successfully', {
        songId: songRef.id,
        taskId: sunoResult.taskId,
        status: updateData.status,
        userId
      });

      return {
        songId: songRef.id,
        status: updateData.status,
        estimatedTime: updateData.status === 'completed' ? 0 : 60 // seconds
      };

    } catch (error) {
      logger.error('Song generation initiation failed', {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Check if user can generate more songs based on subscription
   * @param {Object} userData - User document data
   * @returns {boolean}
   */
  canGenerateSong(userData) {
    const limits = {
      free: parseInt(process.env.LIMIT_FREE) || 3,
      basic: parseInt(process.env.LIMIT_BASIC) || 20,
      family: parseInt(process.env.LIMIT_FAMILY) || 50,
      premium: parseInt(process.env.LIMIT_PREMIUM) || 999999
    };

    const tier = userData.subscriptionTier || 'free';
    const userLimit = limits[tier];
    const currentUsage = userData.usage?.songsThisMonth || 0;

    return currentUsage < userLimit;
  }

  /**
   * Get song by ID
   * @param {string} songId
   * @returns {Promise<Object>}
   */
  async getSongById(songId) {
    const songDoc = await db.collection('songs').doc(songId).get();

    if (!songDoc.exists) {
      throw new Error('Song not found');
    }

    return { id: songDoc.id, ...songDoc.data() };
  }

  /**
   * Get all songs for a user with optional filters
   * @param {string} userId
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async getUserSongs(userId, filters = {}) {
    let query = db.collection('songs').where('userId', '==', userId);

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.childId) {
      query = query.where('childIds', 'array-contains', filters.childId);
    }

    if (filters.isFavorite) {
      query = query.where('isFavorite', '==', true);
    }

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    query = query.orderBy('createdAt', 'desc').limit(filters.limit || 50);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Toggle favorite status for a song
   * @param {string} songId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async toggleFavorite(songId, userId) {
    const songRef = db.collection('songs').doc(songId);
    const songDoc = await songRef.get();

    if (!songDoc.exists) {
      throw new Error('Song not found');
    }

    const songData = songDoc.data();

    // Verify ownership
    if (songData.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const newFavoriteStatus = !songData.isFavorite;

    await songRef.update({
      isFavorite: newFavoriteStatus,
      updatedAt: new Date()
    });

    return newFavoriteStatus;
  }

  /**
   * Delete a song
   * @param {string} songId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteSong(songId, userId) {
    const songRef = db.collection('songs').doc(songId);
    const songDoc = await songRef.get();

    if (!songDoc.exists) {
      throw new Error('Song not found');
    }

    const songData = songDoc.data();

    // Verify ownership
    if (songData.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // TODO: Delete audio file from Firebase Storage

    await songRef.delete();
    logger.info('Song deleted', { songId, userId });
  }

  /**
   * Check song generation status via Suno API
   * @param {string} songId
   * @returns {Promise<Object>}
   */
  async checkSongStatus(songId) {
    const songDoc = await db.collection('songs').doc(songId).get();

    if (!songDoc.exists) {
      throw new Error('Song not found');
    }

    const songData = songDoc.data();

    if (!songData.sunoTaskId) {
      return { status: songData.status };
    }

    // Check Suno API for status
    const sunoStatus = await sunoMusicService.checkStatus(songData.sunoTaskId);

    // Update song document if status changed
    if (sunoStatus.status === 'SUCCESS' && songData.status !== 'completed') {
      await db.collection('songs').doc(songId).update({
        status: 'completed',
        audioUrl: sunoStatus.audioUrl,
        lyrics: sunoStatus.lyrics,
        duration: sunoStatus.duration,
        updatedAt: new Date()
      });

      // Return normalized status for frontend
      return {
        ...sunoStatus,
        status: 'completed' // Convert SUCCESS to completed for frontend
      };
    } else if (sunoStatus.status === 'FAILED') {
      await db.collection('songs').doc(songId).update({
        status: 'failed',
        error: 'Song generation failed',
        updatedAt: new Date()
      });

      // Return normalized status
      return {
        ...sunoStatus,
        status: 'failed'
      };
    } else if (sunoStatus.status === 'PENDING' || sunoStatus.status === 'GENERATING') {
      // Normalize in-progress statuses
      return {
        ...sunoStatus,
        status: sunoStatus.status === 'PENDING' ? 'pending' : 'generating'
      };
    }

    return sunoStatus;
  }
}

module.exports = new SongService();
