import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import { getDatabase } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

const router = express.Router();

// GET /api/discover - suggested friends
router.get("/", verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    const currentUserDoc = snapshot.docs.find(doc => doc.id === req.user.uid);
    const currentUserData = currentUserDoc?.data() || {};
    

    // Exclude users that are already friends or have a pending friend request
    const requestsRef = db.collection('friend_requests');
    const pendingSnapshot = await requestsRef.where('status', '==', 'pending').get();
    const involved = new Set();
    pendingSnapshot.forEach(doc => {
      const d = doc.data();
      if (d.from) involved.add(d.from);
      if (d.to) involved.add(d.to);
    });

    let suggestions = snapshot.docs
      .filter(doc => doc.id !== req.user.uid && !(currentUserData.friends || []).includes(doc.id) && !involved.has(doc.id) )
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName || data.name || "Unknown",
          avatar: data.avatar || (data.displayName?.[0] ?? "?"),
          mutualFriends: (data.friends || []).filter(f => (currentUserData.friends || []).includes(f)).length,
          commonTrails: data.trails || [],
        };
      });

    // Only return suggestions that have at least one mutual friend
    suggestions = suggestions.filter(s => s.mutualFriends > 0);

    // Sort by mutual friends descending to show best matches first
    suggestions.sort((a, b) => b.mutualFriends - a.mutualFriends);

    res.json(suggestions);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// POST /api/discover/add - add friend
router.post("/add", verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { friendId } = req.body;
    const userId = req.user.uid;

    if (!friendId) return res.status(400).json({ error: "Missing friendId" });

    // Create a friend request document instead of auto-adding
    const requestsRef = db.collection('friend_requests');
    const existing = await requestsRef.where('from', '==', userId).where('to', '==', friendId).where('status', '==', 'pending').get();
    if (!existing.empty) return res.status(409).json({ error: 'Request already sent' });

    const reqDoc = await requestsRef.add({ from: userId, to: friendId, status: 'pending', createdAt: FieldValue.serverTimestamp() });
    res.json({ success: true, requestId: reqDoc.id });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Failed to add friend" });
  }
});

// GET incoming friend requests for current user
router.get('/requests/incoming', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const requestsRef = db.collection('friend_requests');
    const snapshot = await requestsRef.where('to', '==', req.user.uid).where('status', '==', 'pending').get();
    const results = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      // fetch minimal user info for the requester
      const userDoc = await db.collection('users').doc(data.from).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      results.push({ id: doc.id, from: data.from, fromName: userData.displayName || userData.name || '', fromAvatar: userData.avatar || (userData.displayName?.[0] ?? '?'), createdAt: data.createdAt });
    }
    res.json(results);
  } catch (err) {
    console.error('Error fetching incoming requests', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST respond to a friend request: accept or decline
router.post('/requests/:id/respond', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const reqDoc = await db.collection('friend_requests').doc(id).get();
    if (!reqDoc.exists) return res.status(404).json({ error: 'Request not found' });
    const data = reqDoc.data();
    if (data.to !== req.user.uid) return res.status(403).json({ error: 'Not authorized' });

    if (action === 'accept') {
      // update both users' friends lists
      await db.collection('users').doc(data.from).update({ friends: FieldValue.arrayUnion(data.to) });
      await db.collection('users').doc(data.to).update({ friends: FieldValue.arrayUnion(data.from) });
      await db.collection('friend_requests').doc(id).update({ status: 'accepted', respondedAt: FieldValue.serverTimestamp() });
      return res.json({ success: true });
    }

    if (action === 'decline') {
      await db.collection('friend_requests').doc(id).update({ status: 'declined', respondedAt: FieldValue.serverTimestamp() });
      return res.json({ success: true });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Error responding to request', err);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

router.get("/:id", verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({ id: userId, ...userData });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

export default router;
