import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';
import { db } from '../config/firebase.js';
import admin from "firebase-admin";
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
  //  const achievementsSnap = await db.collection('users').doc(uid).collection('achievements').get();
  //  const goalsSnap = await db.collection('users').doc(uid).collection('goals').get();
    const hikesSnap = await db.collection('users').doc(uid).collection('hikes').get();

  //  const achievements = achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //  const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      friends: userData.friends || null,
      stats: userData.stats || null,
      createdAt: userData.createdAt || null,

     // achievements,
     // goals,
      hikes,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

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

    // Note: This search functionality needs to be implemented
    // For now, return empty array until we implement proper user search
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



// Get user hiking history (public route)


router.get("/:uid/hikes", async (req, res) => {
  try {
    const { uid } = req.params;
    const limit = parseInt(req.query.limit || "2", 10);

    const hikesRef = admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("hikes");

    const snap = await hikesRef.orderBy("createdAt", "desc").limit(limit).get();
    const hikes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: hikes });
  } catch (err) {
   console.error("Error fetching user hikes:", err.message, err.stack);
  res.status(500).json({ success: false, error: err.message });
  }
});

// Get hike count for a user
router.get("/:uid/hikes/count", async (req, res) => {
  try {
    const { uid } = req.params;
    const hikesRef = admin
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("hikes");

    // simple (works fine for small/medium collections)
    const snap = await hikesRef.get();
    const count = snap.size;

    // If you have very large collections, consider maintaining count on user doc instead.
    res.json({ success: true, count });
  } catch (err) {
    console.error("Error fetching hike count:", err);
    res.status(500).json({ success: false, error: "Failed to fetch hike count" });
  }
});

router.patch('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, bio, location, latitude, longitude, password } = req.body;

    // Build update object
    const updateData = {
      displayName,
      bio,
      location,
    };

    // Only include latitude and longitude if provided
    if (latitude !== undefined && longitude !== undefined) {
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    }

    const updatedProfile = await AuthService.updateUserProfile(uid, updateData);

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update profile" });
  }
});



export default router;
