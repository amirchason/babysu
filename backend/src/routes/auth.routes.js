const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Login with email/password (development mode - bypasses Firebase)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Development mode: Accept hardcoded credentials
    const DEV_EMAIL = process.env.AUTO_LOGIN_EMAIL || 'earthiaone@gmail.com';
    const DEV_PASSWORD = process.env.AUTO_LOGIN_PASSWORD || 'Ahava1977!';

    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      // Development mode: Return user without Firebase
      const userId = 'dev-user-123';
      const userData = {
        userId: userId,
        email: email,
        displayName: 'Development User',
        provider: 'dev',
        subscriptionTier: 'premium', // Give premium for testing
        subscriptionStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          notifications: true,
          autoDownload: false,
          theme: 'light'
        },
        usage: {
          songsGenerated: 0,
          songsThisMonth: 0,
          lastResetDate: new Date()
        }
      };

      // Try to save to Firebase if available (optional)
      try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          await userRef.set(userData);
          logger.info('Development user created in Firebase', { userId, email });
        }
      } catch (firebaseError) {
        logger.warn('Firebase unavailable, using in-memory user', { error: firebaseError.message });
      }

      // Return success with mock token
      return res.json({
        success: true,
        token: 'dev-token-' + Date.now(),
        user: {
          id: userId,
          userId: userId,
          email: userData.email,
          displayName: userData.displayName,
          subscriptionTier: userData.subscriptionTier
        },
        message: 'Login successful (development mode)'
      });
    }

    // Invalid credentials
    res.status(401).json({ error: 'Invalid email or password' });

  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

/**
 * POST /api/auth/register
 * Register new user with email/password
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      provider: 'email',
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        notifications: true,
        autoDownload: false,
        theme: 'light'
      },
      usage: {
        songsGenerated: 0,
        songsThisMonth: 0,
        lastResetDate: new Date()
      }
    });

    logger.info('User registered successfully', { userId: userRecord.uid, email });

    res.status(201).json({
      success: true,
      data: {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    logger.error('Registration error', { error: error.message });

    res.status(error.code === 'auth/email-already-exists' ? 409 : 500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify Firebase ID token
 */
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Get user data
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        userId: decodedToken.uid,
        ...userDoc.data()
      }
    });

  } catch (error) {
    logger.error('Token verification error', { error: error.message });

    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.replace('Bearer ', '');

    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Development mode: Accept dev tokens and guest tokens
    if (idToken.startsWith('dev-token-') || idToken.startsWith('guest-token-')) {
      const userId = idToken.startsWith('guest-token-') ?
        req.headers['x-user-id'] || 'guest-user-' + Date.now() :
        'dev-user-123';

      const userData = {
        userId: userId,
        email: idToken.startsWith('guest-token-') ? 'guest@babysu.app' : (process.env.AUTO_LOGIN_EMAIL || 'earthiaone@gmail.com'),
        displayName: idToken.startsWith('guest-token-') ? 'Guest User' : 'Development User',
        provider: idToken.startsWith('guest-token-') ? 'guest' : 'dev',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: {
          songsGenerated: 0,
          songsThisMonth: 0,
          lastResetDate: new Date()
        }
      };

      // Create or update user in mock DB
      try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          await userRef.set(userData);
          logger.info('Guest/dev user created in DB', { userId });
        }
      } catch (err) {
        logger.warn('Could not create user in DB', { error: err.message });
      }

      return res.json({
        success: true,
        user: userData,
        data: userData
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: userDoc.data()
    });

  } catch (error) {
    logger.error('Get current user error', { error: error.message });

    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
