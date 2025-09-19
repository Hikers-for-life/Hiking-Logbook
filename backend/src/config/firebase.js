// firebase.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let authInstance = null;

//export const db = getDatabase();
//export const auth = getAuth();


/**
 * Initialize Firebase Admin SDK
 */
export async function initializeFirebase() {
  if (admin.apps.length > 0) {
    console.log('Firebase already initialized');
    db = admin.firestore();
    authInstance = admin.auth();
    return db;
  }

  try {
    // Build service account from .env
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

    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    //Initialize instances 
    db = admin.firestore();
    authInstance = admin.auth();

    // Quick health check (optional)
    await db.collection('_health_check').limit(1).get();

    console.log('Firebase initialized');
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    throw error;
  }
}

/**
 * Get Firestore and Auth instances after initialization
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeFirebase() first.');
  }
  return db;
}

export function getAuth() {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeFirebase() first.');
  }
  return authInstance;
}

/**
 * Convenience: predefined collection references
 */
export function getCollections() {
  const database = getDatabase();
  return {
    hikes: database.collection('hikes'),
    users: database.collection('users'),
    feeds: database.collection('feed_items'),
    // add more collections here
  };
}

// Exports for easy usage
export { admin};

