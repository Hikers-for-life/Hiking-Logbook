// routes/hikeInvites.js
import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import * as hikeInviteService from '../services/hikeInviteService.js';

const router = express.Router();

/**
 * Send a hike invitation
 * POST /api/hike-invites/send
 */
router.post('/send', verifyAuth, async (req, res) => {
  try {
    const fromUserId = req.user.uid;
    const { friendId, hikeId, hikeDetails } = req.body;

    console.log('📨 Received invitation request:', {
      fromUserId,
      friendId,
      hikeId,
      hikeDetails
    });

    if (!friendId || !hikeId || !hikeDetails) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: friendId, hikeId, and hikeDetails are required'
      });
    }

    const result = await hikeInviteService.sendHikeInvitation(
      fromUserId,
      friendId, // ✅ This gets passed as toUserId to the service
      hikeId,
      hikeDetails
    );

    console.log('✅ Invitation sent successfully:', result);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending hike invitation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pending invitations for current user
 * GET /api/hike-invites/pending
 */
router.get('/pending', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('📥 Fetching pending invitations for user:', userId);
    
    const invitations = await hikeInviteService.getPendingInvitations(userId);
    
    console.log('✅ Found invitations:', invitations.length);

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('❌ Error fetching pending invitations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get count of pending invitations
 * GET /api/hike-invites/pending/count
 */
router.get('/pending/count', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const count = await hikeInviteService.getPendingInvitationsCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting invitation count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Accept a hike invitation
 * POST /api/hike-invites/:invitationId/accept
 */
router.post('/:invitationId/accept', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { invitationId } = req.params;

    console.log('✅ Accepting invitation:', invitationId, 'for user:', userId);

    const result = await hikeInviteService.acceptInvitation(invitationId, userId);

    res.json({
      success: true,
      data: result,
      message: 'Invitation accepted and hike added to your planner'
    });
  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                       error.message.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Reject a hike invitation
 * POST /api/hike-invites/:invitationId/reject
 */
router.post('/:invitationId/reject', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { invitationId } = req.params;

    console.log('❌ Rejecting invitation:', invitationId, 'for user:', userId);

    const result = await hikeInviteService.rejectInvitation(invitationId, userId);

    res.json({
      success: true,
      data: result,
      message: 'Invitation rejected'
    });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                       error.message.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get a specific invitation
 * GET /api/hike-invites/:invitationId
 */
router.get('/:invitationId', verifyAuth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation = await hikeInviteService.getInvitation(invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get invitations sent by current user
 * GET /api/hike-invites/sent/all
 */
router.get('/sent/all', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const invitations = await hikeInviteService.getSentInvitations(userId);

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel a pending invitation (sender only)
 * DELETE /api/hike-invites/:invitationId
 */
router.delete('/:invitationId', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { invitationId } = req.params;

    const result = await hikeInviteService.cancelInvitation(invitationId, userId);

    res.json({
      success: true,
      data: result,
      message: 'Invitation cancelled'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    const statusCode = error.message.includes('not found') ? 404 :
                       error.message.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

export default router;