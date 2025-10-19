import { getAuth } from 'firebase/auth';
import { API_BASE } from '../api/api.js';

const API_URL = `${API_BASE}/discover`;

// Get Firebase ID token for authentication
async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
}

// Fetch suggested friends (with cache busting)
export async function discoverFriends(forceRefresh = false) {
  const token = await getToken();
  const url = forceRefresh ? `${API_URL}?t=${Date.now()}` : `${API_URL}`;
  
  const res = await fetch(url, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: forceRefresh ? 'no-cache' : 'default'
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch suggestions: ${res.status} ${error}`);
  }
  
  return res.json();
}

// Send friend request and return updated suggestions
export async function sendFriendRequest(friendId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendId }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send request: ${res.status} ${error}`);
  }
  
  const result = await res.json();
  
  // Return both the request result and fresh suggestions
  const updatedSuggestions = await discoverFriends(true);
  return {
    ...result,
    updatedSuggestions
  };
}

// Get incoming friend requests
export async function getIncomingRequests() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/requests/incoming`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch incoming requests: ${res.status} ${error}`);
  }
  
  return res.json();
}

// Respond to friend request (accept/decline)
export async function respondToRequest(requestId, action) {
  if (!['accept', 'decline'].includes(action)) {
    throw new Error('Invalid action. Must be "accept" or "decline"');
  }

  const token = await getToken();
  const res = await fetch(`${API_URL}/requests/${requestId}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to respond: ${res.status} ${error}`);
  }
  
  return res.json();
}

// Get user details with friend status
export const getUserDetails = async (userId) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/${userId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch user details: ${res.status} ${error}`);
  }
  
  return res.json();
};

// Check friend status between current user and target user
export async function checkFriendStatus(targetUserId) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/status/${targetUserId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to check friend status: ${res.status} ${error}`);
  }
  
  return res.json();
}