// src/services/hikeInviteService.js
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
 * Send a hike invitation to a friend
 */
export const sendHikeInvitation = async (hikeId, friendId, hikeDetails) => {
  try {
    const headers = await getAuthHeaders();
    
    console.log('Sending invitation:', { hikeId, friendId, hikeDetails }); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/hike-invites/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        friendId, // ✅ Backend expects this as "friendId" which gets mapped to "toUserId"
        hikeId,
        hikeDetails: {
          title: hikeDetails.title || 'Untitled Hike',
          location: hikeDetails.location || 'Unknown Location',
          date: hikeDetails.date || new Date().toISOString(),
          distance: hikeDetails.distance || '0 km',
          difficulty: hikeDetails.difficulty || 'Easy',
          description: hikeDetails.description || '',
          notes: hikeDetails.notes || '',
          startTime: hikeDetails.startTime || ''
        }
      })
    });

    const data = await response.json();
    
    console.log('Invitation response:', data); // Debug log
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to send invitation');
    }

    return data.data;
  } catch (error) {
    console.error('Error sending hike invitation:', error);
    throw error;
  }
};

/**
 * Get all pending hike invitations for current user
 */
export const getPendingInvitations = async () => {
  try {
    const headers = await getAuthHeaders();
    
    console.log('Fetching pending invitations...'); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/hike-invites/pending`, {
      headers
    });

    const data = await response.json();
    
    console.log('Pending invitations response:', data); // Debug log
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch invitations');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

/**
 * Accept a hike invitation
 */
export const acceptInvitation = async (invitationId) => {
  try {
    const headers = await getAuthHeaders();
    
    console.log('Accepting invitation:', invitationId); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/hike-invites/${invitationId}/accept`, {
      method: 'POST',
      headers
    });

    const data = await response.json();
    
    console.log('Accept invitation response:', data); // Debug log
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to accept invitation');
    }

    return data.data;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

/**
 * Reject a hike invitation
 */
export const rejectInvitation = async (invitationId) => {
  try {
    const headers = await getAuthHeaders();
    
    console.log('Rejecting invitation:', invitationId); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/hike-invites/${invitationId}/reject`, {
      method: 'POST',
      headers
    });

    const data = await response.json();
    
    console.log('Reject invitation response:', data); // Debug log
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to reject invitation');
    }

    return data.data;
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    throw error;
  }
};

/**
 * Get count of pending invitations
 */
export const getPendingInvitationsCount = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/hike-invites/pending/count`, {
      headers
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to get invitation count');
    }

    return data.data?.count || 0;
  } catch (error) {
    console.error('Error getting invitation count:', error);
    return 0; // Return 0 instead of throwing
  }
};

export const hikeInviteService = {
  sendHikeInvitation,
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
  getPendingInvitationsCount
};

export default hikeInviteService;