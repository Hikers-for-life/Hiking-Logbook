import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// User registration
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName, bio, location } = req.body;

    // Basic validation
    if (!email || !password || !displayName) {
      return res.status(400).json({
        error:
          'Missing required fields: email, password, and displayName are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    if (displayName.length < 2) {
      return res.status(400).json({
        error: 'Display name must be at least 2 characters long',
      });
    }

    const result = await AuthService.createUser({
      email,
      password,
      displayName,
      bio,
      location,
    });

    res.status(201).json({
      message: 'User created successfully',
      uid: result.uid,
      user: result.user,
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message.includes('email already exists')) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      error: 'Failed to create user account',
      details: error.message,
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', verifyAuth, async (req, res) => {
  try {
    const profile = await AuthService.getUserProfile(req.user.uid);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      details: error.message,
    });
  }
});

// Update user profile (protected route)
router.put('/profile', verifyAuth, async (req, res) => {
  try {
    const { displayName, bio, location, preferences, photoURL } = req.body;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      });
    }

    await AuthService.updateUserProfile(req.user.uid, updateData);

    res.json({
      message: 'Profile updated successfully',
      updatedFields: Object.keys(updateData),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      details: error.message,
    });
  }
});

// Delete user account (protected route)
router.delete('/profile', verifyAuth, async (req, res) => {
  try {
    await AuthService.deleteUser(req.user.uid);
    res.json({
      message: 'User account deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      error: 'Failed to delete user account',
      details: error.message,
    });
  }
});


// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Authentication Service',
  });
});

export default router;
