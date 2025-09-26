import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';
import { getDatabase } from '../config/firebase.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Users router is working!' });
});

// Create user profile (for Google sign-in users)
router.post('/create-profile', verifyAuth, async (req, res) => {
  try {
    const { uid, email, displayName, bio, location, latitude, longitude, photoURL } = req.body;
    
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
      latitude: latitude || null,
      longitude: longitude || null,
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

// Get current user profile (protected route)
router.get("/profile", verifyAuth, async (req, res) => {
  try {
    const profile = await AuthService.getUserProfile(req.user.uid); 
    res.json(profile); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (public route)
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Get user document using dbUtils
    const userData = await dbUtils.getUserProfile(uid);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch subcollections using direct database access
    const db = getDatabase();
    const hikesSnap = await db.collection('users').doc(uid).collection('hikes').get();
    const hikes = hikesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Construct response
    const publicProfile = {
      uid: uid,
      displayName: userData.displayName || null,
      bio: userData.bio || null,
      location: userData.location || null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null,
      photoURL: userData.photoURL || null,
      preferences: userData.preferences || null,
      stats: userData.stats || null,
      createdAt: userData.createdAt || null,
      hikes,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Search users (public route) - Basic implementation
router.get('/search', async (req, res) => {
  try {
    const { q, location, difficulty } = req.query;

    // Get database instance
    const db = getDatabase();
    let query = db.collection('users');

    // Apply basic filters (Note: Firestore has limitations with text search)
    if (location) {
      query = query.where('location', '==', location);
    }

    if (difficulty) {
      query = query.where('preferences.difficulty', '==', difficulty);
    }

    // Execute query
    const snapshot = await query.limit(50).get(); // Limit results for performance
    let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side filtering for display name if query provided
    if (q) {
      const searchTerm = q.toLowerCase();
      users = users.filter(user => 
        user.displayName && user.displayName.toLowerCase().includes(searchTerm)
      );
    }

    // Remove sensitive information
    const publicUsers = users.map((user) => ({
      uid: user.uid,
      displayName: user.displayName,
      bio: user.bio,
      location: user.location,
      photoURL: user.photoURL,
      preferences: user.preferences,
      stats: user.stats,
    }));

    res.json(publicUsers);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Failed to search users',
      details: error.message,
    });
  }
});

// Get user achievements (public route)
router.get('/:uid/achievements', async (req, res) => {
  try {
    const { uid } = req.params;
    const profile = await AuthService.getUserProfile(uid);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: profile.uid,
      displayName: profile.displayName,
      achievements: profile.stats.achievements || [],
      totalHikes: profile.stats.totalHikes || 0,
      totalDistance: profile.stats.totalDistance || 0,
      totalElevation: profile.stats.totalElevation || 0,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(404).json({
      error: 'User not found',
    });
  }
});

// Get user hiking history (public route)
router.get('/:uid/hikes', async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 10, offset = 0, status, difficulty } = req.query;

    // Build filters object
    const filters = {};
    if (status) filters.status = status;
    if (difficulty) filters.difficulty = difficulty;

    // Query hikes for this user using dbUtils
    const hikes = await dbUtils.getUserHikes(uid, filters);

    // Apply pagination (hikes are already sorted by createdAt desc in dbUtils)
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHikes = hikes.slice(startIndex, endIndex);

    res.json({
      hikes: paginatedHikes,
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

// Get user planned hikes (public route)
router.get('/:uid/planned-hikes', async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 10, offset = 0, status, difficulty } = req.query;

    // Build filters object
    const filters = {};
    if (status) filters.status = status;
    if (difficulty) filters.difficulty = difficulty;

    // Query planned hikes for this user
    const plannedHikes = await dbUtils.getUserPlannedHikes(uid, filters);

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHikes = plannedHikes.slice(startIndex, endIndex);

    res.json({
      plannedHikes: paginatedHikes,
      total: plannedHikes.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get planned hikes error:', error);
    res.status(500).json({
      error: 'Failed to get planned hikes',
      details: error.message,
    });
  }
});

// Get user statistics (public route)
router.get('/:uid/stats', async (req, res) => {
  try {
    const { uid } = req.params;
    const stats = await dbUtils.getUserHikeStats(uid);
    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      details: error.message,
    });
  }
});

// Update user profile (protected route)
router.patch('/:uid', verifyAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, bio, location, latitude, longitude } = req.body;

    // Verify the authenticated user matches the requested UID
    if (req.user.uid !== uid) {
      return res.status(403).json({
        error: 'Unauthorized: Cannot update another user\'s profile',
      });
    }

    // Build update object
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    // Update profile
    await AuthService.updateUserProfile(uid, updateData);

    // Get updated profile
    const updatedProfile = await AuthService.getUserProfile(uid);

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ 
      error: "Failed to update profile",
      details: error.message 
    });
  }
});

// Delete user account (protected route)
router.delete('/:uid', verifyAuth, async (req, res) => {
  try {
    const { uid } = req.params;

    // Verify the authenticated user matches the requested UID
    if (req.user.uid !== uid) {
      return res.status(403).json({
        error: 'Unauthorized: Cannot delete another user\'s account',
      });
    }

    await AuthService.deleteUser(uid);

    res.json({
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user account',
      details: error.message,
    });
  }
});

// Follow user (protected route) - Placeholder implementation
router.post('/:uid/follow', verifyAuth, async (req, res) => {
  try {
    const { uid: targetUid } = req.params;
    const { uid: followerUid } = req.user;

    if (targetUid === followerUid) {
      return res.status(400).json({
        error: 'Cannot follow yourself',
      });
    }

    // Check if target user exists
    const targetProfile = await AuthService.getUserProfile(targetUid);
    if (!targetProfile) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // TODO: Implement actual following logic
    // This would typically involve:
    // 1. Adding to a followers subcollection
    // 2. Adding to a following subcollection
    // 3. Updating follower counts

    res.json({
      message: 'User followed successfully',
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      error: 'Failed to follow user',
      details: error.message,
    });
  }
});

// Unfollow user (protected route) - Placeholder implementation
router.delete('/:uid/follow', verifyAuth, async (req, res) => {
  try {
    const { uid: targetUid } = req.params;
    const { uid: followerUid } = req.user;

    if (targetUid === followerUid) {
      return res.status(400).json({
        error: 'Cannot unfollow yourself',
      });
    }

    // TODO: Implement actual unfollowing logic
    // This would typically involve:
    // 1. Removing from followers subcollection
    // 2. Removing from following subcollection
    // 3. Updating follower counts

    res.json({
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      error: 'Failed to unfollow user',
      details: error.message,
    });
  }
});

export default router;