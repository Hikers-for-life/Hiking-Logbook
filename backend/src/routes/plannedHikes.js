import express from 'express';
import { PlannedHikesService } from '../services/plannedHikesService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();
const plannedHikesService = new PlannedHikesService();

// Middleware to authenticate all routes
router.use(verifyAuth);

/**
 * @route   POST /api/planned-hikes
 * @desc    Create a new planned hike
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeData = req.body;

    // Validate required fields with updated schema
    const requiredFields = ['title', 'date', 'location', 'startTime'];
    const missingFields = requiredFields.filter(
      (field) => !plannedHikeData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const result = await plannedHikesService.createPlannedHike(
      userId,
      plannedHikeData
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error creating planned hike:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/planned-hikes
 * @desc    Get all planned hikes for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const filters = req.query;

    const plannedHikes = await plannedHikesService.getUserPlannedHikes(
      userId,
      filters
    );

    res.json({
      success: true,
      data: plannedHikes,
    });
  } catch (error) {
    console.error('Error getting planned hikes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/planned-hikes/:id
 * @desc    Get a specific planned hike by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;

    const plannedHike = await plannedHikesService.getPlannedHike(
      userId,
      plannedHikeId
    );

    if (!plannedHike) {
      return res.status(404).json({
        success: false,
        error: 'Planned hike not found',
      });
    }

    res.json({
      success: true,
      data: plannedHike,
    });
  } catch (error) {
    console.error('Error getting planned hike:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/planned-hikes/:id
 * @desc    Update a planned hike
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;
    const updateData = req.body;

    // Check if planned hike exists first
    const existingHike = await plannedHikesService.getPlannedHike(
      userId,
      plannedHikeId
    );
    if (!existingHike) {
      return res.status(404).json({
        success: false,
        error: 'Planned hike not found',
      });
    }

    const result = await plannedHikesService.updatePlannedHike(
      userId,
      plannedHikeId,
      updateData
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating planned hike:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/planned-hikes/:id
 * @desc    Delete a planned hike (hard delete)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;

    const result = await plannedHikesService.deletePlannedHike(
      userId,
      plannedHikeId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error deleting planned hike:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/planned-hikes/:id/cancel
 * @desc    Cancel a planned hike (soft delete)
 * @access  Private
 */
router.put('/:id/cancel', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;

    const result = await plannedHikesService.cancelPlannedHike(
      userId,
      plannedHikeId
    );

    res.json({
      success: true,
      data: result,
      message: 'Planned hike cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling planned hike:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/planned-hikes/:id/participants
 * @desc    Join a planned hike
 * @access  Private
 */
router.post('/:id/participants', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;
    const { participantId } = req.body;

    // If no participantId provided, use the authenticated user
    const targetParticipantId = participantId || userId;

    const result = await plannedHikesService.joinPlannedHike(
      userId,
      plannedHikeId,
      targetParticipantId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error joining planned hike:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/planned-hikes/:id/participants/:participantId
 * @desc    Leave a planned hike
 * @access  Private
 */
router.delete('/:id/participants/:participantId', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;
    const participantId = req.params.participantId;

    const result = await plannedHikesService.leavePlannedHike(
      userId,
      plannedHikeId,
      participantId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error leaving planned hike:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/planned-hikes/:id/start
 * @desc    Start a planned hike (convert to active hike)
 * @access  Private
 */
router.post('/:id/start', async (req, res) => {
  try {
    const userId = req.user.uid;
    const plannedHikeId = req.params.id;

    const result = await plannedHikesService.startPlannedHike(
      userId,
      plannedHikeId
    );

    res.json({
      success: true,
      data: result,
      message: 'Planned hike started successfully',
    });
  } catch (error) {
    console.error('Error starting planned hike:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
