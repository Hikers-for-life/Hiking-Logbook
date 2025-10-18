// services/hikeInviteService.js
import { dbUtils } from '../config/database.js';

/**
 * Send a hike invitation to a friend
 */
export async function sendHikeInvitation(fromUserId, toUserId, hikeId, hikeDetails) {
  if (!fromUserId || !toUserId || !hikeId || !hikeDetails) {
    throw new Error('Missing required fields for hike invitation');
  }

  if (fromUserId === toUserId) {
    throw new Error('Cannot invite yourself to a hike');
  }

  return dbUtils.sendHikeInvitation(fromUserId, toUserId, hikeId, hikeDetails);
}

/**
 * Get pending invitations for a user
 */
export async function getPendingInvitations(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return dbUtils.getPendingHikeInvitations(userId);
}

/**
 * Get count of pending invitations
 */
export async function getPendingInvitationsCount(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return dbUtils.getPendingInvitationsCount(userId);
}

/**
 * Accept a hike invitation
 */
export async function acceptInvitation(invitationId, userId) {
  if (!invitationId || !userId) {
    throw new Error('Invitation ID and User ID are required');
  }

  return dbUtils.acceptHikeInvitation(invitationId, userId);
}

/**
 * Reject a hike invitation
 */
export async function rejectInvitation(invitationId, userId) {
  if (!invitationId || !userId) {
    throw new Error('Invitation ID and User ID are required');
  }

  return dbUtils.rejectHikeInvitation(invitationId, userId);
}

/**
 * Get invitation by ID
 */
export async function getInvitation(invitationId) {
  if (!invitationId) {
    throw new Error('Invitation ID is required');
  }

  return dbUtils.getHikeInvitation(invitationId);
}

/**
 * Get all invitations sent by a user
 */
export async function getSentInvitations(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return dbUtils.getSentHikeInvitations(userId);
}

/**
 * Cancel a pending invitation (sender only)
 */
export async function cancelInvitation(invitationId, userId) {
  if (!invitationId || !userId) {
    throw new Error('Invitation ID and User ID are required');
  }

  return dbUtils.cancelHikeInvitation(invitationId, userId);
}