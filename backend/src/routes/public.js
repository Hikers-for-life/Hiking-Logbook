import express from 'express';
import { dbUtils } from '../config/database.js';
import { BADGE_RULES } from '../services/badgeService.js';
import { ApiKeyManager } from '../config/apiKeys.js';

const router = express.Router();

/**
 * @swagger
 * /api/public/health:
 *   get:
 *     summary: API Health Check
 *     description: Check if the API is operational and get basic service information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: "Hiking Logbook Public API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "operational"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["GET /api/public/health", "GET /api/public/stats"]
 */

// Middleware to add CORS headers for public API
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-API-Key, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API key validation middleware (for POST endpoints)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  const validation = ApiKeyManager.validateKey(apiKey);

  if (!validation.valid) {
    return res.status(401).json({
      success: false,
      error: validation.error,
      message:
        'Please include a valid X-API-Key header. Contact support for an API key.',
      demoKeys: {
        fullAccess: 'demo-key-12345',
        readOnly: 'readonly-key-67890',
      },
    });
  }

  // Check if key has write permission for POST endpoints
  if (req.method === 'POST' && !ApiKeyManager.hasPermission(apiKey, 'write')) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      message: 'This API key does not have write permissions',
    });
  }

  // Attach key info to request for logging
  req.apiKey = validation.keyData;
  next();
};

// 1. GET /api/public/health - API Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Hiking Logbook Public API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/public/health',
      'GET /api/public/stats',
      'GET /api/public/badges',
      'GET /api/public/locations',
      'POST /api/public/hikes',
      'GET /api/public/key-info',
    ],
  });
});

/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Global Hiking Statistics
 *     description: Get aggregated hiking statistics across all users
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Global statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GlobalStats'
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                 note:
 *                   type: string
 *                   example: "Statistics updated every 24 hours"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// 2. GET /api/public/stats - Global Hiking Statistics
router.get('/stats', async (req, res) => {
  try {
    // Get real global statistics from database
    const globalStats = await dbUtils.getGlobalStats();

    res.json({
      success: true,
      data: globalStats,
      lastUpdated: new Date().toISOString(),
      note: 'Statistics updated in real-time from user data',
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global statistics',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/public/badges:
 *   get:
 *     summary: Available Achievement Badges
 *     description: Get list of all available badges and their requirements
 *     tags: [Badges]
 *     responses:
 *       200:
 *         description: Badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Badge'
 *                 totalBadges:
 *                   type: number
 *                   example: 6
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["achievement"]
 *                 note:
 *                   type: string
 *                   example: "Badges are awarded automatically based on hiking activity"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// 3. GET /api/public/badges - Available Badges/Achievements
router.get('/badges', (req, res) => {
  try {
    const badges = BADGE_RULES.map((badge) => ({
      name: badge.name,
      description: badge.description,
      category: 'achievement', // You could categorize badges
      difficulty: 'standard', // You could add difficulty levels
    }));

    res.json({
      success: true,
      data: badges,
      totalBadges: badges.length,
      categories: ['achievement'], // Could expand this
      note: 'Badges are awarded automatically based on hiking activity',
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch badges',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/public/locations:
 *   get:
 *     summary: Popular Hiking Locations
 *     description: Get list of most popular hiking locations based on logged hikes
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *                 totalLocations:
 *                   type: number
 *                   example: 25
 *                 note:
 *                   type: string
 *                   example: "Locations ranked by number of hikes logged"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// 4. GET /api/public/locations - Popular Hiking Locations
router.get('/locations', async (req, res) => {
  try {
    // Get real popular locations from database
    const popularLocations = await dbUtils.getPopularLocations();

    res.json({
      success: true,
      data: popularLocations,
      totalLocations: popularLocations.length,
      note: 'Locations ranked by number of hikes logged',
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular locations',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/public/hikes:
 *   post:
 *     summary: Submit Hike Data
 *     description: Submit hike data from external systems (requires API key)
 *     tags: [Data Submission]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HikeData'
 *           examples:
 *             basic_hike:
 *               summary: Basic hike submission
 *               value:
 *                 externalUserId: "user123"
 *                 title: "Morning Mountain Trail"
 *                 location: "Table Mountain, Cape Town"
 *                 distance: 12.5
 *                 elevation: 800
 *                 difficulty: "Moderate"
 *                 date: "2024-01-15T08:00:00Z"
 *                 duration: 4.5
 *                 weather: "Sunny, 22°C"
 *                 notes: "Beautiful views at the summit!"
 *     responses:
 *       201:
 *         description: Hike data submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Hike data received successfully"
 *                 hikeId:
 *                   type: string
 *                   example: "external_1642234567890"
 *                 data:
 *                   $ref: '#/components/schemas/HikeData'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *                 required:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["externalUserId", "title", "location"]
 *       401:
 *         description: API key required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "API key required"
 *                 message:
 *                   type: string
 *                   example: "Please include X-API-Key header"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// 5. POST /api/public/hikes - Submit Hike Data (External Integration)
router.post('/hikes', validateApiKey, async (req, res) => {
  try {
    const {
      externalUserId,
      title,
      location,
      distance,
      elevation,
      difficulty,
      date,
      duration,
      weather,
      notes,
    } = req.body;

    // Validate required fields
    if (!externalUserId || !title || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['externalUserId', 'title', 'location'],
      });
    }

    // Prepare hike data for external storage
    const hikeData = {
      title,
      location,
      distance: distance || 0,
      elevation: elevation || 0,
      difficulty: difficulty || 'Easy',
      date: date || new Date().toISOString(),
      duration: duration || 0,
      weather: weather || '',
      notes: notes || '',
      externalUserId: externalUserId,
    };

    // Store the external hike data
    const result = await dbUtils.addExternalHike(hikeData);

    res.status(201).json({
      success: true,
      message: 'Hike data received and stored successfully',
      hikeId: result.id,
      data: hikeData,
      note: 'External hike submissions are stored separately and may be reviewed before inclusion in public statistics',
    });
  } catch (error) {
    console.error('Error submitting external hike:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit hike data',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/public/key-info:
 *   get:
 *     summary: API Key Information
 *     description: Get information about your API key (requires API key)
 *     tags: [Data Submission]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: API key information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Demo API Key"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["read", "write"]
 *                     usageCount:
 *                       type: number
 *                       example: 42
 *                     lastUsed:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// GET /api/public/key-info - API Key Information
router.get('/key-info', validateApiKey, (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const keyStats = ApiKeyManager.getKeyStats(apiKey);

    if (!keyStats) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
      });
    }

    res.json({
      success: true,
      data: keyStats,
      message: 'API key is valid and active',
    });
  } catch (error) {
    console.error('Error fetching API key info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API key information',
      message: error.message,
    });
  }
});

export default router;
