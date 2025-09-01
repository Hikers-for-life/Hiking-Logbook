import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils, collections } from '../config/database.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Get user by ID (public route, but with optional auth for additional info)
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Get user document
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = userDoc.data();

    // Fetch subcollections
    const achievementsSnap = await db.collection('users').doc(uid).collection('achievements').get();
    const goalsSnap = await db.collection('users').doc(uid).collection('goals').get();
    const hikesSnap = await db.collection('users').doc(uid).collection('hikes').get();

    const achievements = achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const hikes = hikesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Construct response
    const publicProfile = {
      uid: uid,
      displayName: userData.displayName || null,
      bio: userData.bio || null,
      location: userData.location || null,
      photoURL: userData.photoURL || null,
      preferences: userData.preferences || null,
     
      stats: userData.stats || null,
      createdAt: userData.createdAt || null,

      achievements,
      goals,
      hikes,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Example Express route
router.get("/profile", async (req, res) => {
  try {
    const profile = await AuthService.getUserProfile(req.user.uid); 
    res.json(profile); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Search users (public route)
router.get('/search', async (req, res) => {
  try {
    const { q, location, difficulty } = req.query;

    let conditions = [];

    if (q) {
      // Note: Firestore doesn't support full-text search, so we search by displayName
      // In production, you might want to use Algolia or similar service
      conditions.push({ field: 'displayName', operator: '>=', value: q });
      conditions.push({
        field: 'displayName',
        operator: '<=',
        value: q + '\uf8ff',
      });
    }

    if (location) {
      conditions.push({ field: 'location', operator: '==', value: location });
    }

    if (difficulty) {
      conditions.push({
        field: 'preferences.difficulty',
        operator: '==',
        value: difficulty,
      });
    }

    const users = await dbUtils.query(collections.USERS, conditions);

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
  router.get('/:userId/achievements', async (req, res) => {
    const data = await AuthService.getUserAchievements(req.params.userId);
    res.json(data);
  });

  router.get('/:userId/hikes', async (req, res) => {
    const data = await AuthService.getUserHikes(req.params.userId);
    res.json(data);
  });

  router.get('/:userId/goals', async (req, res) => {
    const data = await AuthService.getUserGoals(req.params.userId);
    res.json(data);
  });

// Follow user (protected route)
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

    // Add to followers collection (you might want to create a separate collection for this)
    // For now, we'll just return success
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

// Unfollow user (protected route)
router.delete('/:uid/follow', verifyAuth, async (req, res) => {
  try {
    const { uid: targetUid } = req.params;
    const { uid: followerUid } = req.user;

    if (targetUid === followerUid) {
      return res.status(400).json({
        error: 'Cannot unfollow yourself',
      });
    }

    // Remove from followers collection
    // For now, we'll just return success
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
