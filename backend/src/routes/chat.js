import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';

const router = express.Router();


router.get('/conversations', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = dbUtils.getDb();

    // Get all conversations where user is a participant
    const conversationsRef = db.collection('conversations');
    const snapshot = await conversationsRef
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageTime', 'desc')
      .get();

    const conversations = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Get the other participant's info
      const otherUserId = data.participants.find(id => id !== userId);
      const userDoc = await db.collection('users').doc(otherUserId).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      conversations.push({
        id: doc.id,
        ...data,
        otherUser: {
          uid: otherUserId,
          displayName: userData.displayName || 'Unknown User',
          email: userData.email || '',
          location: userData.location || ''
        },
        lastMessageTime: data.lastMessageTime?.toDate?.() || data.lastMessageTime
      });
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


router.get('/conversation/:userId', verifyAuth, async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const otherUserId = req.params.userId;
    const db = dbUtils.getDb();

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create conversation with yourself'
      });
    }

    // Create a consistent conversation ID
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    let conversationData;

    if (!conversationDoc.exists) {
      // Create new conversation
      conversationData = {
        participants: [currentUserId, otherUserId],
        lastMessage: '',
        lastMessageTime: new Date(),
        lastMessageSender: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await conversationRef.set(conversationData);
    } else {
      conversationData = conversationDoc.data();
    }

    // Get other user's info
    const userDoc = await db.collection('users').doc(otherUserId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      success: true,
      data: {
        id: conversationId,
        ...conversationData,
        otherUser: {
          uid: otherUserId,
          displayName: userData.displayName || 'Unknown User',
          email: userData.email || '',
          location: userData.location || ''
        }
      }
    });
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


router.get('/messages/:conversationId', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const conversationId = req.params.conversationId;
    const limit = parseInt(req.query.limit) || 50;
    const db = dbUtils.getDb();

    // Verify user is participant
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this conversation'
      });
    }

    // Get messages
    const messagesRef = db.collection('messages').doc(conversationId).collection('messages');
    const snapshot = await messagesRef
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    })).reverse(); // Reverse to show oldest first

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


router.post('/send', verifyAuth, async (req, res) => {
  try {
    const senderId = req.user.uid;
    const { conversationId, recipientId, content } = req.body;

    if (!conversationId || !recipientId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const db = dbUtils.getDb();

    // Verify conversation exists and user is participant
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const messageData = {
      senderId,
      recipientId,
      content: content.trim(),
      createdAt: new Date(),
      read: false
    };

    const messagesRef = db.collection('messages').doc(conversationId).collection('messages');
    const messageDoc = await messagesRef.add(messageData);

    // Update conversation last message
    await conversationRef.update({
      lastMessage: content.trim().substring(0, 100), // Store first 100 chars
      lastMessageTime: new Date(),
      lastMessageSender: senderId,
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        id: messageDoc.id,
        ...messageData
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


router.put('/mark-read/:conversationId', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const conversationId = req.params.conversationId;
    const db = dbUtils.getDb();

    // Get unread messages sent to this user
    const messagesRef = db.collection('messages').doc(conversationId).collection('messages');
    const unreadSnapshot = await messagesRef
      .where('recipientId', '==', userId)
      .where('read', '==', false)
      .get();

    // Batch update
    const batch = db.batch();
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    res.json({
      success: true,
      data: {
        markedCount: unreadSnapshot.size
      }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


router.get('/unread-count', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = dbUtils.getDb();

    // Get all conversations where user is a participant
    const conversationsSnapshot = await db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .get();

    let totalUnread = 0;

    // For each conversation, count unread messages
    for (const convDoc of conversationsSnapshot.docs) {
      const messagesRef = db.collection('messages').doc(convDoc.id).collection('messages');
      const unreadSnapshot = await messagesRef
        .where('recipientId', '==', userId)
        .where('read', '==', false)
        .get();

      totalUnread += unreadSnapshot.size;
    }

    res.json({
      success: true,
      data: {
        unreadCount: totalUnread
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
