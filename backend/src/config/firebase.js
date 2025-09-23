// firebase.js
// firebase.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let authInstance = null;

/**
 * Initialize Firebase Admin SDK (only once)
 */
export function initializeFirebase() {
  if (admin.apps.length > 0) {
    console.log('Firebase already initialized');
    db = admin.firestore();
    authInstance = admin.auth();
    return db;
  }

  try {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri:
        process.env.FIREBASE_AUTH_URI ||
        'https://accounts.google.com/o/oauth2/auth',
      token_uri:
        process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
        'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    db = admin.firestore();
    authInstance = admin.auth();

    console.log('Firebase initialized');
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    throw error;
  }
}

/**
 * Helper getters
 */
export function getDatabase() {
  if (!db) throw new Error('Database not initialized. Call initializeFirebase() first.');
  return db;
}

export function getAuth() {
  if (!authInstance) throw new Error('Auth not initialized. Call initializeFirebase() first.');
  return authInstance;
}

export function getCollections() {
  const database = getDatabase();
  return {
    hikes: database.collection('hikes'),
    users: database.collection('users'),
    // add more collections here
  };
}

/**
 * Direct exports (for convenience in routes like users.js)
 * ⚠️ Make sure you call initializeFirebase() ONCE at app startup
 */
export { db, authInstance as auth, admin };
