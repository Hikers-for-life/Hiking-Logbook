import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import { getDatabase } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const router = express.Router();

// GET /api/discover - suggested friends with mutual friends priority
router.get("/", verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.uid;

    // Get current user data
    const currentUserDoc = await db.collection("users").doc(userId).get();
    if (!currentUserDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUserData = currentUserDoc.data();
    const currentUserFriends = new Set(currentUserData.friends || []);

    // Get ALL pending friend requests involving current user (both sent and received)
    const requestsRef = db.collection('friend_requests');
    const pendingRequestsQuery = await requestsRef
      .where('status', '==', 'pending')
      .get();

    // Create sets for users to exclude
    const excludedUsers = new Set([userId]); // Always exclude self

    // Add users who have pending requests with current user in ANY direction
    pendingRequestsQuery.forEach(doc => {
      const data = doc.data();
      // If current user sent request to someone, exclude that someone
      if (data.from === userId) {
        excludedUsers.add(data.to);
      }
      // If someone sent request to current user, exclude that someone
      if (data.to === userId) {
        excludedUsers.add(data.from);
      }
    });

    // Get all users except excluded ones
    const usersRef = db.collection("users");
    const allUsersSnapshot = await usersRef.get();

    const suggestions = [];

    for (const doc of allUsersSnapshot.docs) {
      const userData = doc.data();
      const targetUserId = doc.id;

      // Skip if user should be excluded (self, friends, or anyone with pending requests)
      if (excludedUsers.has(targetUserId)) {
        continue;
      }

      // Calculate mutual friends
      const targetUserFriends = userData.friends || [];
      const mutualFriends = targetUserFriends.filter(friendId =>
        currentUserFriends.has(friendId)
      ).length;

      suggestions.push({
        id: targetUserId,
        name: userData.displayName || userData.name || "Unknown",
        avatar: userData.avatar || (userData.displayName?.[0] ?? "?"),
        mutualFriends: mutualFriends,
        commonTrails: userData.trails || [],
      });

      // Early exit if we have enough suggestions for sorting
      if (suggestions.length >= 40) {
        break;
      }
    }

    // Sort by mutual friends (descending) and limit to 20
    const sortedSuggestions = suggestions
      .sort((a, b) => b.mutualFriends - a.mutualFriends)
      .slice(0, 20);

    res.json(sortedSuggestions);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GET /api/discover/status/:userId - check friend status between users
router.get('/status/:userId', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const currentUserId = req.user.uid;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.json({ status: 'self' });
    }

    // Check if already friends
    const currentUserDoc = await db.collection('users').doc(currentUserId).get();
    if (!currentUserDoc.exists) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    const currentUserData = currentUserDoc.data();
    const isFriend = currentUserData.friends && currentUserData.friends.includes(targetUserId);

    if (isFriend) {
      return res.json({ status: 'friends' });
    }

    // Check for pending friend requests in both directions
    const requestsRef = db.collection('friend_requests');
    const pendingRequest = await requestsRef
      .where('from', 'in', [currentUserId, targetUserId])
      .where('to', 'in', [currentUserId, targetUserId])
      .where('status', '==', 'pending')
      .get();

    if (!pendingRequest.empty) {
      const requestData = pendingRequest.docs[0].data();
      if (requestData.from === currentUserId) {
        return res.json({
          status: 'request_sent',
          requestId: pendingRequest.docs[0].id
        });
      } else if (requestData.to === currentUserId) {
        return res.json({
          status: 'request_received',
          requestId: pendingRequest.docs[0].id
        });
      }
    }

    // No relationship
    return res.json({ status: 'none' });
  } catch (err) {
    console.error('Error checking friend status:', err);
    res.status(500).json({ error: 'Failed to check friend status' });
  }
});

// POST /api/discover/add - send friend request
router.post('/add', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { friendId } = req.body;
    const userId = req.user.uid;

    if (!friendId) {
      return res.status(400).json({ error: 'Missing friendId' });
    }

    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if users exist
    const [userDoc, friendDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get()
    ]);

    if (!userDoc.exists || !friendDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const userData = userDoc.data();
    if (userData.friends && userData.friends.includes(friendId)) {
      return res.status(409).json({ error: 'Already friends' });
    }

    // Check for existing pending request in ANY direction
    const requestsRef = db.collection('friend_requests');
    const existingRequest = await requestsRef
      .where('from', 'in', [userId, friendId])
      .where('to', 'in', [userId, friendId])
      .where('status', '==', 'pending')
      .get();

    if (!existingRequest.empty) {
      const existingData = existingRequest.docs[0].data();
      if (existingData.from === userId) {
        return res.status(409).json({ error: 'Friend request already sent' });
      } else {
        return res.status(409).json({ error: 'This user has already sent you a friend request' });
      }
    }

    // Create new friend request
    const requestDoc = await requestsRef.add({
      from: userId,
      to: friendId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      requestId: requestDoc.id,
      message: 'Friend request sent successfully'
    });
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// GET incoming friend requests for current user
router.get('/requests/incoming', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const requestsRef = db.collection('friend_requests');
    const snapshot = await requestsRef
      .where('to', '==', req.user.uid)
      .where('status', '==', 'pending')
      .get();

    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.from).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        return {
          id: doc.id,
          from: data.from,
          fromName: userData.displayName || userData.name || 'Unknown',
          fromAvatar: userData.avatar || (userData.displayName?.[0] ?? '?'),
          createdAt: data.createdAt,
        };
      })
    );

    res.json(requests);
  } catch (err) {
    console.error('Error fetching incoming requests', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET outgoing friend requests for current user
router.get('/requests/outgoing', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const requestsRef = db.collection('friend_requests');
    const snapshot = await requestsRef
      .where('from', '==', req.user.uid)
      .where('status', '==', 'pending')
      .get();

    const requests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.to).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        return {
          id: doc.id,
          to: data.to,
          toName: userData.displayName || userData.name || 'Unknown',
          toAvatar: userData.avatar || (userData.displayName?.[0] ?? '?'),
          createdAt: data.createdAt,
        };
      })
    );

    res.json(requests);
  } catch (err) {
    console.error('Error fetching outgoing requests', err);
    res.status(500).json({ error: 'Failed to fetch outgoing requests' });
  }
});

// POST respond to a friend request: accept or decline
router.post('/requests/:id/respond', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { action } = req.body;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const requestDoc = await db.collection('friend_requests').doc(id).get();

    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const requestData = requestDoc.data();

    if (requestData.to !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (requestData.status !== 'pending') {
      return res.status(409).json({ error: 'Request already processed' });
    }

    const batch = db.batch();
    const requestRef = db.collection('friend_requests').doc(id);

    if (action === 'accept') {
      // Add to both users' friends lists
      batch.update(db.collection('users').doc(requestData.from), {
        friends: FieldValue.arrayUnion(requestData.to)
      });
      batch.update(db.collection('users').doc(requestData.to), {
        friends: FieldValue.arrayUnion(requestData.from)
      });
    }

    // Update request status
    batch.update(requestRef, {
      status: action === 'accept' ? 'accepted' : 'declined',
      respondedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    res.json({ success: true, action: action });
  } catch (err) {
    console.error('Error responding to request', err);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

// GET user details
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      id: userId,
      name: userData.displayName || userData.name,
      avatar: userData.avatar,
      friends: userData.friends || [],
      trails: userData.trails || []
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

export default router;