import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { getDatabase } from '../config/firebase.js';

const router = express.Router();

// GET /feed - fetch latest activities
router.get('/', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const snapshot = await db.collection('feed_items')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const activities = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();

      // Fetch comments with user names
      const commentsSnapshot = await doc.ref.collection('comments').orderBy('created_at', 'asc').get();
      const comments = commentsSnapshot.docs.map(c => ({
        id: c.id,    
        ...c.data()
      }));

      return {
        id: doc.id,
        ...data,
        comments
      };
    }));

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// POST /feed - create a new activity
router.post('/', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { action, hike, description, stats, photo } = req.body;

    if (!action || !hike) {
      return res.status(400).json({ error: 'Action and hike are required' });
    }

    const newActivity = {
      userId: req.user.uid,
      name: req.user.name || req.user.displayName || req.user.email, // will show your name
      action,           // e.g., "completed", "reached milestone"
      hike,             // e.g., "Mount Rainier Trail"
      description: description || "",
      stats: stats || "",
      photo: photo || null,
      time:new Date().toISOString(),
      likes: [],
      created_at: new Date().toISOString(),
    };

    const docRef = await db.collection('feed_items').add(newActivity);
    res.json({ id: docRef.id, ...newActivity });
  } catch (error) {
    console.error('Error creating feed item:', error);
    res.status(500).json({ error: 'Failed to create feed item' });
  }
});


// POST /feed/:id/like
router.post('/:id/like', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const uid = req.user.uid;

    const ref = db.collection('feed_items').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Feed item not found' });

    let likes = doc.data().likes || [];
    if (likes.includes(uid)) {
      likes = likes.filter(u => u !== uid);
    } else {
      likes.push(uid);
    }

    await ref.update({ likes });
    res.json({ likes, likedByUser: likes.includes(uid) });
  } catch (error) {
    console.error('Error liking/unliking feed item:', error);
    res.status(500).json({ error: 'Failed to like/unlike' });
  }
});

// POST /feed/:id/comment
router.post('/:id/comment', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const db = getDatabase();

    // 🔍 Fetch user's profile from Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const comment = {
      userId: req.user.uid,
      name: userData.name || userData.displayName || req.user.email, // ✅ prefer profile name
      email: req.user.email,
      content,
      created_at: new Date().toISOString(),
    };

    const commentRef = await db
      .collection('feed_items')
      .doc(id)
      .collection('comments')
      .add(comment);

    res.json({ comment: { id: commentRef.id, ...comment } });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE /feed/:feedId/comments/:commentId - delete a comment on feed item
router.delete('/:feedId/comments/:commentId', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { feedId, commentId } = req.params;

    const commentRef = db
      .collection('feed_items')
      .doc(feedId)
      .collection('comments')
      .doc(commentId);

    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Allow delete only if comment belongs to current user
    if (commentData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await commentRef.delete();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});



// POST /feed/:id/share
// Share an activity
router.post('/:feedId/share', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { sharerId, sharerName, sharerAvatar, original } = req.body;

    const newActivity = {
      type: "share",
      original, // embed full original activity
      userId: sharerId,
      name: sharerName,
      avatar: sharerAvatar,
      created_at: new Date().toISOString(),
      likes: [],
    };

    const docRef = await db.collection('feed_items').add(newActivity);

    res.json({ newActivityId: docRef.id });
  } catch (err) {
    console.error("Error sharing activity:", err);
    res.status(500).json({ error: "Failed to share activity" });
  }
});

// DELETE /feed/:id
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const docRef = db.collection('feed_items').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: 'Feed item not found' });

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await docRef.delete();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Failed to delete post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});



export default router;
