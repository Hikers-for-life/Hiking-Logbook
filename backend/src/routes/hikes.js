import express from "express";
import { verifyAuth } from "../middleware/auth.js";
import { dbUtils } from "../config/database.js";

const router = express.Router();

/**
 * Add a new hike for a user
 * POST /api/users/:userId/hikes
 */
router.post("/:userId/hikes", verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const hikeData = req.body;

    // Ensure only the logged-in user can write to their own hikes
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: "Not authorized to add hikes for this user" });
    }

    const hikeRef = dbUtils
      .collection("users")
      .doc(userId)
      .collection("hikes")
      .doc();

    await hikeRef.set({
      ...hikeData,
      userId,
      createdAt: dbUtils.FieldValue.serverTimestamp(),
      updatedAt: dbUtils.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: hikeRef.id, message: "Hike created" });
  } catch (error) {
    console.error("Error adding hike:", error);
    res.status(500).json({ error: "Failed to add hike" });
  }
});

/**
 * Get all hikes for a user
 * GET /api/users/:userId/hikes
 */
router.get("/:userId/hikes", verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: "Not authorized to view these hikes" });
    }

    const hikesSnapshot = await dbUtils
      .collection("users")
      .doc(userId)
      .collection("hikes")
      .get();

    const hikes = hikesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(hikes);
  } catch (error) {
    console.error("Error fetching hikes:", error);
    res.status(500).json({ error: "Failed to fetch hikes" });
  }
});

/**
 * Get a single hike
 * GET /api/users/:userId/hikes/:hikeId
 */
router.get("/:userId/hikes/:hikeId", verifyAuth, async (req, res) => {
  try {
    const { userId, hikeId } = req.params;

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: "Not authorized to view this hike" });
    }

    const hikeRef = dbUtils
      .collection("users")
      .doc(userId)
      .collection("hikes")
      .doc(hikeId);

    const hikeDoc = await hikeRef.get();

    if (!hikeDoc.exists) {
      return res.status(404).json({ error: "Hike not found" });
    }

    res.json({ id: hikeDoc.id, ...hikeDoc.data() });
  } catch (error) {
    console.error("Error fetching hike:", error);
    res.status(500).json({ error: "Failed to fetch hike" });
  }
});

/**
 * Update a hike
 * PUT /api/users/:userId/hikes/:hikeId
 */
router.put("/:userId/hikes/:hikeId", verifyAuth, async (req, res) => {
  try {
    const { userId, hikeId } = req.params;

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: "Not authorized to update this hike" });
    }

    const hikeRef = dbUtils
      .collection("users")
      .doc(userId)
      .collection("hikes")
      .doc(hikeId);

    await hikeRef.update({
      ...req.body,
      updatedAt: dbUtils.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Hike updated" });
  } catch (error) {
    console.error("Error updating hike:", error);
    res.status(500).json({ error: "Failed to update hike" });
  }
});

/**
 * Delete a hike
 * DELETE /api/users/:userId/hikes/:hikeId
 */
router.delete("/:userId/hikes/:hikeId", verifyAuth, async (req, res) => {
  try {
    const { userId, hikeId } = req.params;

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this hike" });
    }

    const hikeRef = dbUtils
      .collection("users")
      .doc(userId)
      .collection("hikes")
      .doc(hikeId);

    await hikeRef.delete();

    res.json({ message: "Hike deleted" });
  } catch (error) {
    console.error("Error deleting hike:", error);
    res.status(500).json({ error: "Failed to delete hike" });
  }
});

export default router;
