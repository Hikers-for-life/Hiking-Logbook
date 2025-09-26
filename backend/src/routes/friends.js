
import express from "express";
import admin from "firebase-admin";

const router = express.Router();

// Get current user's friends
// Get current user's friends
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, error: "User not found" });

    let { friends = [] } = userDoc.data();

    // ✅ Filter out invalid IDs
    friends = friends.filter(fid => typeof fid === "string" && fid.trim() !== "");

    if (friends.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch valid friend profiles
    const friendDocs = await Promise.all(
      friends.map(fid => admin.firestore().collection("users").doc(fid).get())
    );

    const friendProfiles = friendDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, data: friendProfiles });
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Block/remove friend (mutual delete)
router.delete("/:uid/block/:fid", async (req, res) => {
  try {
    const { uid, fid } = req.params;

    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const friendRef = db.collection("users").doc(fid);

    await Promise.all([
      userRef.update({ friends: admin.firestore.FieldValue.arrayRemove(fid) }),
      friendRef.update({ friends: admin.firestore.FieldValue.arrayRemove(uid) }),
    ]);

    res.json({ success: true, message: "Friendship removed successfully" });
  } catch (err) {
    console.error("Error blocking friend:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
