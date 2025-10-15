import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { getDatabase } from '../config/firebase.js';

const router = express.Router();

// GET /feed - fetch latest activities
// GET /feed - fetch latest activities
router.get('/', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const snapshot = await db
      .collection('feed_items')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const activities = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // ✅ Ensure safe fallbacks for missing fields
        const safeName = data.name || "Unknown Hiker";
        const safeAvatar = data.avatar || safeName[0]?.toUpperCase() || "U";

        // Fetch comments with user names
        const commentsSnapshot = await doc.ref
          .collection('comments')
          .orderBy('created_at', 'asc')
          .get();

        const comments = commentsSnapshot.docs.map((c) => ({
          id: c.id,
          ...c.data(),
        }));

        // ensure top-level time exists (fallback to created_at)
        const activityTime = data.time || data.created_at || null;

        // recursively ensure nested originals (for shares) have a time field
        const ensureNestedTimes = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (!obj.time && obj.created_at) obj.time = obj.created_at;
          if (obj.original) ensureNestedTimes(obj.original);
        };

        if (data.type === 'share' && data.original) {
          ensureNestedTimes(data.original);
        }

        return {
          id: doc.id,
          ...data,
          time: activityTime,
          name: safeName,
          avatar: safeAvatar,
          comments: comments || [],
        };
      })
    );

    // ✅ Return the array directly instead of { activities }
    res.json(activities);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});


// POST /feed - create a new activity
// POST /feed - create a new activity
router.post('/', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { action, hike, description, stats, photo } = req.body;

    if (!action || !hike) {
      return res.status(400).json({ error: 'Action and hike are required' });
    }

    // 🔍 Fetch user profile to get display name
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const fallbackName =
      req.body.name ||
      userData.name ||
      userData.displayName ||
      req.user?.displayName ||
      req.user?.email?.split("@")[0] ||
      "Anonymous";

    const fallbackAvatar = fallbackName[0]?.toUpperCase() || "U";

    const newActivity = {
      type: 'original',
      userId: req.user.uid,
      name: fallbackName,
      avatar: fallbackAvatar,
      action,
      hike,
      description: description || '',
      stats: stats || '',
      photo: photo || null,
      time: new Date().toISOString(),
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
      likes = likes.filter((u) => u !== uid);
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
// POST /feed/:feedId/share - share an existing activity
router.post('/:feedId/share', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { sharerId, sharerName, sharerAvatar, original } = req.body;
    const caption = req.body.caption || '';

    // ✅ Fallbacks for sharer info
    const safeSharerName =
      sharerName ||
      req.user?.name ||
      req.user?.displayName ||
      req.user?.email?.split("@")[0] ||
      "Anonymous";

    const safeSharerAvatar = sharerAvatar || safeSharerName[0]?.toUpperCase() || "U";

    // ✅ Safely handle original activity data
    const safeOriginal = original || {};

    // Store the provided original object verbatim so share-chains are preserved.
    const nowIso = new Date().toISOString();

    const newActivity = {
      type: 'share',
      created_at: nowIso,
      time: nowIso,
      likes: [],
      userId: req.user.uid,
      name: safeSharerName,
      avatar: safeSharerAvatar,
      sharer: {
        id: sharerId || req.user?.uid,
        name: safeSharerName,
        avatar: safeSharerAvatar,
      },
      shareCaption: caption,
      original: safeOriginal, // keep the full object including nested originals
    };

    const docRef = await db.collection('feed_items').add(newActivity);

    // ✅ Return full new activity so frontend can immediately render it
    res.json({ id: docRef.id, ...newActivity });
  } catch (err) {
    console.error('Error sharing activity:', err);
    res.status(500).json({ error: 'Failed to share activity' });
  }
});


// PUT /feed/:id - update a feed post (description, caption for shares, stats, etc.)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const updateData = req.body || {};

    const docRef = db.collection('feed_items').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: 'Feed item not found' });

    const postData = docSnap.data() || {};
    const ownerId = postData.userId || postData.sharer?.id;
    const uid = req.user?.uid;

    if (ownerId !== uid) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    // Only allow updating a whitelist of fields
    const allowed = ['description', 'action', 'hike', 'stats', 'photo', 'shareCaption'];
    const toUpdate = {};
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updateData, k)) toUpdate[k] = updateData[k];
    });

    if (Object.keys(toUpdate).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    await docRef.update(toUpdate);

    // Return the updated document
    const updatedSnap = await docRef.get();
    const updatedData = { id: updatedSnap.id, ...updatedSnap.data() };
    res.json(updatedData);
  } catch (err) {
    console.error('Error updating feed item:', err);
    res.status(500).json({ error: 'Failed to update feed item' });
  }
});

// DELETE /feed/:id - delete a feed post
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const docRef = db.collection('feed_items').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Feed item not found' });
    }

    const postData = docSnap.data() || {};

    // ✅ Match frontend logic for ownership
    const ownerId = postData.userId || postData.sharer?.id;

    if (ownerId !== uid) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // ✅ Delete all comments first (optional but clean)
    const commentsRef = docRef.collection('comments');
    const commentsSnap = await commentsRef.get();
    const batch = db.batch();
    commentsSnap.forEach((comment) => batch.delete(comment.ref));
    await batch.commit();

    // ✅ Delete the feed post itself
    await docRef.delete();

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('🔥 Failed to delete post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});


// GET /feed/:id - fetch a single activity by id
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const docRef = db.collection('feed_items').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return res.status(404).json({ error: 'Feed item not found' });

    const data = docSnap.data() || {};

    // Fetch comments
    const commentsSnapshot = await docRef.collection('comments').orderBy('created_at', 'asc').get();
    const comments = commentsSnapshot.docs.map((c) => ({ id: c.id, ...c.data() }));

    const safeName = data.name || 'Unknown Hiker';
    const safeAvatar = data.avatar || safeName[0]?.toUpperCase() || 'U';

    // ensure nested original times
    const ensureNestedTimes = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (!obj.time && obj.created_at) obj.time = obj.created_at;
      if (obj.original) ensureNestedTimes(obj.original);
    };

    if (data.type === 'share' && data.original) ensureNestedTimes(data.original);

    const activityTime = data.time || data.created_at || null;

    res.json({ id: docSnap.id, ...data, time: activityTime, name: safeName, avatar: safeAvatar, comments });
  } catch (err) {
    console.error('Error fetching feed item:', err);
    res.status(500).json({ error: 'Failed to fetch feed item' });
  }
});


export default router;

