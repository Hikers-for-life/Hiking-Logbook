import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getTestToken() {
  try {
    // You'll need to replace these with your actual test user credentials
    const email = 'test@example.com'; // Replace with your test user email
    const password = 'testpassword';   // Replace with your test user password
    
    console.log('Signing in to get token...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const token = await user.getIdToken();
    
    console.log('✅ Successfully obtained token!');
    console.log('User ID:', user.uid);
    console.log('Email:', user.email);
    console.log('\n🔑 Your Bearer Token:');
    console.log(token);
    console.log('\n📋 Use this in Postman:');
    console.log('Authorization: Bearer ' + token);
    
  } catch (error) {
    console.error('❌ Error getting token:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. A test user created in Firebase Auth');
    console.log('2. Correct email/password in this script');
    console.log('3. Firebase environment variables set correctly');
  }
}

getTestToken();
