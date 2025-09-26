import express from 'express';
import { AuthService } from '../services/authService.js';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';
import { BADGE_RULES } from '../services/badgeService.js';
import { db } from '../config/firebase.js';
import admin from "firebase-admin";
const router = express.Router();


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
    res.status(500).json({
      error: 'Failed to create user profile',
      details: error.message,
    });
  }
});

// Get user stats (must be before /:uid route to avoid conflicts)
router.get('/stats', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get basic hike stats (with fallback to empty stats)
    let hikeStats;
    try {
      hikeStats = await dbUtils.getUserHikeStats(userId);
    } catch (error) {
      hikeStats = {
        totalHikes: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevation: 0
      };
    }
    
    // Try to get user profile, create one if it doesn't exist
    let profile;
    try {
      profile = await dbUtils.getUserProfile(userId);
      if (!profile) {
        const profileData = {
          displayName: req.user.name || 'Hiker',
          email: req.user.email || '',
          bio: '',
          location: '',
          joinDate: new Date().toISOString(),
          badges: [],
          goals: [],
          preferences: {
            units: 'metric',
            privacy: 'friends'
          }
        };
        await dbUtils.createUserProfile(userId, profileData);
        profile = profileData;
      }
    } catch (error) {
      console.error(`Error with user profile for stats for ${userId}:`, error);
      profile = { badges: [], goals: [] };
    }
    
    // Combine hike stats with profile data
    const stats = {
      ...hikeStats,
      badgesEarned: (profile?.badges || []).length,
      goalsCompleted: (profile?.goals || []).filter(goal => goal.completed).length,
      goalsInProgress: (profile?.goals || []).filter(goal => !goal.completed).length,
      joinDate: profile?.joinDate || new Date().toISOString()
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats', details: error.message });
  }
});

// Get user badges (must be before /:uid route to avoid conflicts)
router.get('/badges', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user stats for progress calculation (with fallback to empty stats)
    let stats;
    try {
      stats = await dbUtils.getUserHikeStats(userId);
    } catch (error) {
      console.error(`Error getting hike stats for badges for ${userId}:`, error);
      stats = {
        totalHikes: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalPeaks: 0,
        uniqueTrails: 0,
        hasEarlyBird: false,
        hasEndurance: false
      };
    }
    
    // Try to get user profile, create one if it doesn't exist
    let profile;
    try {
      profile = await dbUtils.getUserProfile(userId);
      if (!profile) {
        console.log(`Creating user profile for badges for ${userId}`);
        const profileData = {
          displayName: req.user.name || 'Hiker',
          email: req.user.email || '',
          bio: '',
          location: '',
          joinDate: new Date().toISOString(),
          badges: [],
          goals: [],
          preferences: {
            units: 'metric',
            privacy: 'friends'
          }
        };
        await dbUtils.createUserProfile(userId, profileData);
        profile = profileData;
      }
    } catch (error) {
      console.error(`Error with user profile for badges for ${userId}:`, error);
      profile = { badges: [] };
    }
    
    const earnedBadges = profile?.badges || [];
    const allBadges = BADGE_RULES.map(rule => {
      const isEarned = earnedBadges.some(badge => badge.name === rule.name);
      
      // Calculate progress and progress text based on rule type
      let progress = 0;
      let progressText = "Not started";
      
      if (isEarned) {
        progress = 100;
        progressText = "Completed";
      } else {
        // Calculate progress based on current stats
        if (rule.name === "First Steps") {
          progress = Math.min((stats.totalHikes || 0) * 100, 100);
          progressText = `${stats.totalHikes || 0}/1 hikes`;
        } else if (rule.name === "Distance Walker") {
          progress = Math.min(((stats.totalDistance || 0) / 100) * 100, 100);
          progressText = `${stats.totalDistance || 0}/100 km`;
        } else if (rule.name === "Peak Collector") {
          progress = Math.min(((stats.totalPeaks || 0) / 10) * 100, 100);
          progressText = `${stats.totalPeaks || 0}/10 peaks`;
        } else if (rule.name === "Trail Explorer") {
          progress = Math.min(((stats.uniqueTrails || 0) / 25) * 100, 100);
          progressText = `${stats.uniqueTrails || 0}/25 trails`;
        } else {
          // For binary badges (Early Bird, Endurance Master)
          progress = rule.check(stats) ? 100 : 0;
          progressText = rule.check(stats) ? "Completed" : "Not achieved";
        }
      }
      
      return {
        id: rule.name.toLowerCase().replace(/\s+/g, '-'),
        name: rule.name,
        description: rule.description,
        icon: rule.icon || "🏆",
        category: rule.category || "achievement",
        earned: isEarned,
        progress: progress,
        progressText: progressText,
        earnedDate: isEarned ? (() => {
          const badge = earnedBadges.find(badge => badge.name === rule.name);
          if (!badge?.earnedDate) return null;
          
          // Convert Firestore Timestamp to ISO string
          if (badge.earnedDate.toDate && typeof badge.earnedDate.toDate === 'function') {
            return badge.earnedDate.toDate().toISOString();
          }
          // If it's already a Date object
          else if (badge.earnedDate instanceof Date) {
            return badge.earnedDate.toISOString();
          }
          // If it has seconds property (Firestore Timestamp)
          else if (badge.earnedDate.seconds) {
            return new Date(badge.earnedDate.seconds * 1000).toISOString();
          }
          // Return as is if it's already a string or other format
          else {
            return badge.earnedDate;
          }
        })() : null
      };
    });
    
    res.json({ success: true, data: allBadges, count: allBadges.length });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges', details: error.message });
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
