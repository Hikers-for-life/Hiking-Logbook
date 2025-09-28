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


// Firebase configuration
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

export { AuthContext };

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

  // Get the correct API URL
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'hiking-logbook.web.app' 
        ? 'https://hiking-logbook-hezw.onrender.com'
        : 'http://localhost:3001');
  };



  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      
      // Call backend signup route to create both Auth user and Firestore document
      const response = await fetch(`${getApiUrl()}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          bio: '',
          location: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const result = await response.json();
      
      // Sign in the user after successful signup
      await signInWithEmailAndPassword(auth, email, password);
      
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
      
      // After successful Google sign-in, ensure user profile exists in Firestore
      try {
        await createUserProfileIfNeeded(result.user);
      } catch (profileError) {
        console.warn('Profile creation warning:', profileError.message);
        // Don't fail the sign-in if profile creation fails
      }
      
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

  // Create user profile in backend if it doesn't exist
  const createUserProfileIfNeeded = async (user) => {
    try {
      const token = await user.getIdToken();
      
      // For Google sign-in, directly create the profile
      // This avoids the 500 error when profile doesn't exist
      const apiUrl = `${getApiUrl()}/users/create-profile`;
      
      const createResponse = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Google User',
            bio: '',
            location: null,
            photoURL: user.photoURL || '',
          }),
        }
      );

      if (!createResponse.ok) {
        // Log the response details for debugging
        
        // If profile already exists, that's fine
        if (createResponse.status === 409) {
          return { message: 'Profile already exists' };
        }
        
        // Try to get error details
        try {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create user profile: ${createResponse.status} ${createResponse.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to create user profile: ${createResponse.status} ${createResponse.statusText}`);
        }
      }

      return await createResponse.json();
    } catch (error) {
      console.error('Error handling user profile:', error);
      throw error;
    }
  };

  // Get user profile from backend
  const getUserProfile = async () => {
    if (!currentUser) return null;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `${getApiUrl()}/auth/profile`,
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
        `${getApiUrl()}/auth/profile`,
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
