import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authorization headers with Firebase token
 */
const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch conversations');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get or create a conversation with a specific user
 */
export const getConversation = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/conversation/${userId}`, {
      headers
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to get conversation');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Get all messages in a conversation
 */
export const getMessages = async (conversationId, limit = 50) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/chat/messages/${conversationId}?limit=${limit}`,
      { headers }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch messages');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, recipientId, content) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        conversationId,
        recipientId,
        content
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark all messages in a conversation as read
 */
export const markMessagesAsRead = async (conversationId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/mark-read/${conversationId}`, {
      method: 'PUT',
      headers
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark messages as read');
    }

    return data.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get count of unread messages
 */
export const getUnreadCount = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/chat/unread-count`, {
      headers
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to get unread count');
    }

    return data.data.unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

export const chatService = {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount
};

export default chatService;
