const admin = require('firebase-admin');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

let db, auth, storage;
let usesMockDatabase = false;

// Check if Firebase credentials are available
const hasFirebaseCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                               process.env.FIREBASE_PRIVATE_KEY ||
                               admin.apps.length > 0;

if (!hasFirebaseCredentials) {
  // No Firebase credentials, use mock database immediately
  logger.warn('⚠️  No Firebase credentials found, using mock database');
  useMockDatabase();
} else {
  try {
    // Try to initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();

    // Test Firebase connection
    db.collection('_test').limit(1).get()
      .then(() => {
        logger.info('✅ Firebase connected successfully');
      })
      .catch(err => {
        logger.warn('⚠️  Firebase test failed (already using mock)');
      });

  } catch (error) {
    logger.warn('⚠️  Firebase initialization failed, using mock database', { error: error.message });
    useMockDatabase();
  }
}

/**
 * Switch to mock in-memory database
 */
function useMockDatabase() {
  const mockDb = require('./mockDatabase');
  db = mockDb;
  usesMockDatabase = true;

  // Mock auth (not needed for development)
  auth = {
    createUser: async (data) => ({ uid: 'mock-' + Date.now(), ...data }),
    verifyIdToken: async (token) => ({ uid: token }),
    getUser: async (uid) => ({ uid }),
  };

  // Mock storage (not needed for development)
  storage = {
    bucket: () => ({
      file: () => ({
        save: async () => {},
        getSignedUrl: async () => ['https://example.com/mock-file.mp3'],
      }),
    }),
  };

  logger.info('🔧 Development Mode: Using in-memory mock database');
}

module.exports = {
  admin,
  db,
  auth,
  storage,
  firestore: db,
  usesMockDatabase: () => usesMockDatabase,
};
