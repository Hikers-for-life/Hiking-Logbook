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
    

    let suggestions = snapshot.docs
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
