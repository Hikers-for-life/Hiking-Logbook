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
    const friendsSet = new Set(currentUserData.friends || []);

    const suggestions = snapshot.docs
    .filter(doc => doc.id !== req.user.uid && !(currentUserData.friends || []).includes(doc.id))
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

    const userRef = db.collection("users").doc(userId);
    const friendRef = db.collection("users").doc(friendId);

    await userRef.update({ friends: FieldValue.arrayUnion(friendId) });
    await friendRef.update({ friends: FieldValue.arrayUnion(userId) });

    res.json({ success: true });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Failed to add friend" });
  }
});

export default router;
