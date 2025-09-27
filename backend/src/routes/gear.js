// routes/gear.js
import express from 'express';
import { GearChecklistService } from '../services/gearChecklistService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();
const gearChecklistService = new GearChecklistService();

// Middleware to authenticate all routes
router.use(verifyAuth);

/**
 * @route   GET /api/gear/checklist
 * @desc    Get user's gear checklist
 * @access  Private
 */
router.get('/checklist', async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const gearChecklist = await gearChecklistService.getUserGearChecklist(userId);
    
    res.json({
      success: true,
      data: gearChecklist,
      count: gearChecklist.length
    });

  } catch (error) {
    console.error('Error getting gear checklist:', error);
    next(error);
  }
});

/**
 * @route   PUT /api/gear/checklist
 * @desc    Update entire gear checklist
 * @access  Private
 */
router.put('/checklist', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { gearItems } = req.body;

    if (!Array.isArray(gearItems)) {
      return res.status(400).json({
        success: false,
        error: 'gearItems must be an array'
      });
    }

    const result = await gearChecklistService.updateGearChecklist(userId, gearItems);
    
    res.json({
      success: true,
      data: result,
      message: 'Gear checklist updated successfully'
    });

  } catch (error) {
    console.error('Error updating gear checklist:', error);
    next(error);
  }
});

/**
 * @route   POST /api/gear/checklist/items
 * @desc    Add a new gear item
 * @access  Private
 */
router.post('/checklist/items', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { itemName } = req.body;

    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Item name is required'
      });
    }

    const result = await gearChecklistService.addGearItem(userId, itemName.trim());
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Gear item added successfully'
    });

  } catch (error) {
    console.error('Error adding gear item:', error);
    if (error.message === 'Item already exists in checklist') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
});

/**
 * @route   DELETE /api/gear/checklist/items/:index
 * @desc    Remove a gear item by index
 * @access  Private
 */
router.delete('/checklist/items/:index', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const itemIndex = parseInt(req.params.index);

    if (isNaN(itemIndex) || itemIndex < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item index'
      });
    }

    const result = await gearChecklistService.removeGearItem(userId, itemIndex);
    
    res.json({
      success: true,
      data: result,
      message: 'Gear item removed successfully'
    });

  } catch (error) {
    console.error('Error removing gear item:', error);
    next(error);
  }
});

/**
 * @route   POST /api/gear/checklist/items/:index/toggle
 * @desc    Toggle checked status of a gear item
 * @access  Private
 */
router.post('/checklist/items/:index/toggle', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const itemIndex = parseInt(req.params.index);

    if (isNaN(itemIndex) || itemIndex < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item index'
      });
    }

    const result = await gearChecklistService.toggleGearItem(userId, itemIndex);
    
    res.json({
      success: true,
      data: result,
      message: 'Gear item toggled successfully'
    });

  } catch (error) {
    console.error('Error toggling gear item:', error);
    next(error);
  }
});

/**
 * @route   POST /api/gear/checklist/reset
 * @desc    Reset all gear items to unchecked
 * @access  Private
 */
router.post('/checklist/reset', async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const result = await gearChecklistService.resetGearChecklist(userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Gear checklist reset successfully'
    });

  } catch (error) {
    console.error('Error resetting gear checklist:', error);
    next(error);
  }
});

/**
 * @route   GET /api/gear/checklist/stats
 * @desc    Get gear checklist statistics
 * @access  Private
 */
router.get('/checklist/stats', async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const stats = await gearChecklistService.getGearStats(userId);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting gear stats:', error);
    next(error);
  }
});

export default router;