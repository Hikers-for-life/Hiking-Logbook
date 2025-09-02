import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { dbUtils } from '../config/database.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyAuth);

// GET /api/hikes - Get all hikes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { status, difficulty, dateFrom, dateTo } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (difficulty) filters.difficulty = difficulty;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    
    const hikes = await dbUtils.getUserHikes(userId, filters);
    
    res.json({
      success: true,
      data: hikes,
      count: hikes.length
    });
  } catch (error) {
    console.error('Error fetching hikes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hikes',
      message: error.message
    });
  }
});

// POST /api/hikes/start - Start tracking a new hike
router.post('/start', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeData = req.body;
    
    if (!hikeData.title || !hikeData.location) {
      return res.status(400).json({
        success: false,
        error: 'Title and location are required'
      });
    }
    
    const result = await dbUtils.startHike(userId, hikeData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Hike started successfully'
    });
  } catch (error) {
    console.error('Error starting hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start hike',
      message: error.message
    });
  }
});

// GET /api/hikes/stats/overview - Get user hike statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const stats = await dbUtils.getUserHikeStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching hike stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hike statistics',
      message: error.message
    });
  }
});

// GET /api/hikes/:id - Get a specific hike by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeId = req.params.id;
    
    const hike = await dbUtils.getHike(userId, hikeId);
    
    if (!hike) {
      return res.status(404).json({
        success: false,
        error: 'Hike not found'
      });
    }
    
    res.json({
      success: true,
      data: hike
    });
  } catch (error) {
    console.error('Error fetching hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hike',
      message: error.message
    });
  }
});

// POST /api/hikes - Create a new hike
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeData = req.body;
    
    // Validate required fields
    if (!hikeData.title || !hikeData.location) {
      return res.status(400).json({
        success: false,
        error: 'Title and location are required'
      });
    }
    
    const result = await dbUtils.addHike(userId, hikeData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Hike created successfully'
    });
  } catch (error) {
    console.error('Error creating hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create hike',
      message: error.message
    });
  }
});

// PUT /api/hikes/:id - Update a hike
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeId = req.params.id;
    const updateData = req.body;
    
    // Check if hike exists
    const existingHike = await dbUtils.getHike(userId, hikeId);
    if (!existingHike) {
      return res.status(404).json({
        success: false,
        error: 'Hike not found'
      });
    }
    
    const result = await dbUtils.updateHike(userId, hikeId, updateData);
    
    res.json({
      success: true,
      data: result,
      message: 'Hike updated successfully'
    });
  } catch (error) {
    console.error('Error updating hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update hike',
      message: error.message
    });
  }
});

// DELETE /api/hikes/:id - Delete a hike
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeId = req.params.id;
    


    
    // Check if hike exists
    const existingHike = await dbUtils.getHike(userId, hikeId);

    

    
    if (!existingHike) {

      

      
      return res.status(404).json({
        success: false,
        error: 'Hike not found'
      });
    }
    
    const result = await dbUtils.deleteHike(userId, hikeId);
    
    res.json({
      success: true,
      data: result,
      message: 'Hike deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hike',
      message: error.message
    });
  }
});

// POST /api/hikes/:id/complete - Complete a hike
router.post('/:id/complete', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeId = req.params.id;
    const endData = req.body;
    
    const result = await dbUtils.completeHike(userId, hikeId, endData);
    
    res.json({
      success: true,
      data: result,
      message: 'Hike completed successfully'
    });
  } catch (error) {
    console.error('Error completing hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete hike',
      message: error.message
    });
  }
});

// POST /api/hikes/:id/waypoint - Add a GPS waypoint to a hike
router.post('/:id/waypoint', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikeId = req.params.id;
    const waypoint = req.body;
    
    if (!waypoint.latitude || !waypoint.longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const result = await dbUtils.addWaypoint(userId, hikeId, waypoint);
    
    res.json({
      success: true,
      data: result,
      message: 'Waypoint added successfully'
    });
  } catch (error) {
    console.error('Error adding waypoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add waypoint',
      message: error.message
    });
  }
});

export default router;
