import { db } from '../config/firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  doc,
  getDoc,
} from 'firebase/firestore';

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return 'Unknown';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';

  return `${month} ${day}${suffix}, ${year}`;
}

export const searchUsers = async (name) => {
  const q = query(collection(db, 'users'), where('displayName', '==', name));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getUserHikeCount = async (userId) => {
  try {
    const coll = collection(db, 'users', userId, 'hikes');
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (err) {
    console.error('Failed to fetch hike count:', err);
    return 0;
  }
};
export const getUserProfile = async (userId) => {
  let userName = '';
  let bio = '';
  let location = '';
  let joinDate = '';

  try {
    // reference the user document
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('User Profile:', data);

      userName = data.displayName || '';
      bio = data.bio || '';
      location = data.location || '';

      if (data?.createdAt) {
        const createdAt = data.createdAt;

        if (createdAt.toDate) {
          joinDate = formatDate(createdAt.toDate());
        } else if (createdAt._seconds) {
          joinDate = formatDate(new Date(createdAt._seconds * 1000));
        } else {
          joinDate = formatDate(new Date(createdAt));
        }
      }
    } else {
      console.warn(`No user profile found for ID: ${userId}`);
    }
  } catch (err) {
    console.error('Failed to fetch Profile please check your code:', err);
  }

  return { userName, location, joinDate, bio };
};

// Simple client-side validation helpers
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string')
    return { valid: false, message: 'Email is required' };
  const trimmed = email.trim();
  // Basic RFC-like email regex (not perfect but good enough for client-side)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(trimmed))
    return { valid: false, message: 'Please enter a valid email address' };
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string')
    return { valid: false, message: 'Password is required' };
  if (password.length < 8)
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must include at least one letter and one number',
    };
  }
  return { valid: true };
};
