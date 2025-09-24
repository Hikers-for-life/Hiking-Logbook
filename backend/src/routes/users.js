import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Users router is working!' });
});

// Create user profile (for Google sign-in users)
router.post('/create-profile', verifyAuth, async (req, res) => {
  try {
    const { uid, email, displayName, bio, location, photoURL } = req.body;
    
    // Verify the authenticated user matches the requested UID
    if (req.user.uid !== uid) {
      return res.status(403).json({
        error: 'Unauthorized: Cannot create profile for another user',
      });
    }

    // Check if profile already exists
    const existingProfile = await dbUtils.getUserProfile(uid);
    if (existingProfile) {
      return res.status(409).json({
        message: 'User profile already exists',
        profile: existingProfile,
      });
    }

    // Create the user profile
    const profileData = {
      uid,
      email,
      displayName,
      bio: bio || '',
      location: location || null,
      photoURL: photoURL || '',
      preferences: {
        difficulty: 'beginner',
        terrain: 'mixed',
        distance: 'short',
      },
      stats: {
        totalHikes: 0,
        totalDistance: 0,
        totalElevation: 0,
        achievements: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dbUtils.createUserProfile(uid, profileData);

    res.status(201).json({
      message: 'User profile created successfully',
      profile: profileData,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      error: 'Failed to create user profile',
      details: error.message,
    });
  }
});

// Get user by ID (public route, but with optional auth for additional info)
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const profile = await AuthService.getUserProfile(uid);

    // Remove sensitive information for public profiles
    const publicProfile = {
      uid: profile.uid,
      displayName: profile.displayName,
      bio: profile.bio,
      location: profile.location,
      photoURL: profile.photoURL,
      preferences: profile.preferences,
      stats: profile.stats,
      createdAt: profile.createdAt,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(404).json({
      error: 'User not found',
    });
  }
});



// Get user hiking history (public route)
router.get('/:uid/hikes', async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Query hikes for this user
    const hikes = await dbUtils.getUserHikes(uid);

    // Sort by date and apply pagination
    const sortedHikes = hikes
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      hikes: sortedHikes,
      total: hikes.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get hikes error:', error);
    res.status(500).json({
      error: 'Failed to get hiking history',
      details: error.message,
    });
  }
});


export default router;
