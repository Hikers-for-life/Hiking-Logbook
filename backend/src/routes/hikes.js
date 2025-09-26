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
    const { status, difficulty, dateFrom, dateTo, pinned, search } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (difficulty) filters.difficulty = difficulty;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (pinned !== undefined) filters.pinned = pinned === 'true';
    if (search) filters.search = search;
    
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

// GET /api/hikes/stats - Get user hiking statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.uid;
    const stats = await dbUtils.getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// GET /api/hikes/progress - Get progress data for charts
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.uid;
    const hikes = await dbUtils.getUserHikes(userId);
    
    // Group hikes by month for chart data
    const hikesPerMonth = {};
    const distanceOverTime = [];
    
    hikes.forEach(hike => {
      // Use hike.date if available, otherwise use createdAt
      const hikeDate = hike.date || hike.createdAt;
      
      if (hikeDate) {
        const date = hikeDate.toDate ? hikeDate.toDate() : new Date(hikeDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!hikesPerMonth[monthKey]) {
          hikesPerMonth[monthKey] = { month: monthKey, count: 0, distance: 0 };
        }
        hikesPerMonth[monthKey].count += 1;
        hikesPerMonth[monthKey].distance += hike.distance || 0;
        
        distanceOverTime.push({
          date: date.toISOString().split('T')[0],
          distance: hike.distance || 0,
          elevation: hike.elevation || 0
        });
      }
    });
    
    // Convert to arrays and sort
    const monthlyData = Object.values(hikesPerMonth).sort((a, b) => a.month.localeCompare(b.month));
    const distanceData = distanceOverTime.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate streak history (simplified - just current streak for now)
    const { currentStreak, longestStreak } = dbUtils.calculateStreaks(hikes);
    
    res.json({
      success: true,
      data: {
        hikesPerMonth: monthlyData,
        distanceOverTime: distanceData,
        streakHistory: [
          { date: new Date().toISOString().split('T')[0], streak: currentStreak }
        ],
        currentStreak,
        longestStreak
      }
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress data',
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



// PATCH /api/hikes/:id/pin - Pin a hike
router.patch('/:id/pin', async (req, res) => {
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

    const result = await dbUtils.updateHike(userId, hikeId, { pinned: true });

    res.json({
      success: true,
      data: result,
      message: 'Hike pinned successfully'
    });
  } catch (error) {
    console.error('Error pinning hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pin hike',
      message: error.message
    });
  }
});

// PATCH /api/hikes/:id/unpin - Unpin a hike
router.patch('/:id/unpin', async (req, res) => {
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

    const result = await dbUtils.updateHike(userId, hikeId, { pinned: false });

    res.json({
      success: true,
      data: result,
      message: 'Hike unpinned successfully'
    });
  } catch (error) {
    console.error('Error unpinning hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unpin hike',
      message: error.message
    });
  }
});

// PATCH /api/hikes/:id/share - Share a hike with friends
router.patch('/:id/share', async (req, res) => {
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

    const result = await dbUtils.updateHike(userId, hikeId, { shared: true });

    res.json({
      success: true,
      data: result,
      message: 'Hike shared with friends successfully'
    });
  } catch (error) {
    console.error('Error sharing hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share hike',
      message: error.message
    });
  }
});

// PATCH /api/hikes/:id/unshare - Unshare a hike with friends
router.patch('/:id/unshare', async (req, res) => {
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

    const result = await dbUtils.updateHike(userId, hikeId, { shared: false });

    res.json({
      success: true,
      data: result,
      message: 'Hike unshared successfully'
    });
  } catch (error) {
    console.error('Error unsharing hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unshare hike',
      message: error.message
    });
  }
});


export default router;
