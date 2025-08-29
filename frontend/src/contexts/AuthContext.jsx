import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// Firebase configuration - you'll need to add this to your .env file
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let auth;

// Initialize Google Auth Provider
let googleProvider;

if (process.env.NODE_ENV !== "test") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}
export { app, auth, googleProvider };

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(result.user, { displayName });

      // Note: Backend profile creation is handled separately
      // The user is now authenticated and can access the dashboard

      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Google Sign-In function
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Create user profile in backend
  /* const createUserProfile = async (uid, userData) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid,
            ...userData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }; */

  // Get user profile from backend
  const getUserProfile = async () => {
    if (!currentUser) return null;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // If profile doesn't exist, return null (will use fallback in Dashboard)
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (updateData) => {
    if (!currentUser) return null;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    error,
    setError,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
