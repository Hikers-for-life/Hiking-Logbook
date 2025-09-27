// services/plannedHikesService.js
import { dbUtils } from '../config/database.js';
import { initializeFirebase } from '../config/firebase.js';

export class PlannedHikesService {
  constructor() {
    this.initializeService();
  }

  async initializeService() {
    try {
      await initializeFirebase();
      console.log('PlannedHikesService initialized');
    } catch (error) {
      console.error('Failed to initialize PlannedHikesService:', error);
    }
  }

  /**
   * Create a new planned hike
   * @param {string} userId - The user's ID
   * @param {Object} plannedHikeData - The planned hike data
   * @returns {Object} Result with success status and planned hike ID
   */
  async createPlannedHike(userId, plannedHikeData) {
    try {
      // Validate input data
      this.validatePlannedHikeData(plannedHikeData);

      // Process and sanitize the data
      const processedData = this.processPlannedHikeData(plannedHikeData);

      // Add the planned hike to the database
      const result = await dbUtils.addPlannedHike(userId, processedData);

      if (result.success) {
        console.log(`Planned hike created successfully for user ${userId}:`, result.id);
        return {
          id: result.id,
          ...processedData
        };
      }

      throw new Error('Failed to create planned hike');

    } catch (error) {
      console.error('PlannedHikesService.createPlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Get all planned hikes for a user
   * @param {string} userId - The user's ID
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of planned hikes
   */
  async getUserPlannedHikes(userId, filters = {}) {
    try {
      // Use the simple query method to avoid Firestore indexing issues
      const plannedHikes = await dbUtils.getUserPlannedHikes(userId, filters);

      // Enhance the data with computed fields
      const enhancedPlannedHikes = plannedHikes.map(hike => this.enhancePlannedHikeData(hike));

      console.log(`Retrieved ${enhancedPlannedHikes.length} planned hikes for user ${userId}`);
      return enhancedPlannedHikes;

    } catch (error) {
      console.error('PlannedHikesService.getUserPlannedHikes error:', error);
      throw error;
    }
  }

  /**
   * Get a specific planned hike by ID
   * @param {string} userId - The user's ID
   * @param {string} plannedHikeId - The planned hike's ID
   * @returns {Object|null} The planned hike data or null if not found
   */
  async getPlannedHike(userId, plannedHikeId) {
    try {
      const plannedHike = await dbUtils.getPlannedHike(userId, plannedHikeId);

      if (!plannedHike) {
        console.log(`Planned hike ${plannedHikeId} not found for user ${userId}`);
        return null;
      }

      // Enhance the data with computed fields
      const enhancedPlannedHike = this.enhancePlannedHikeData(plannedHike);

      console.log(`Retrieved planned hike ${plannedHikeId} for user ${userId}`);
      return enhancedPlannedHike;

    } catch (error) {
      console.error('PlannedHikesService.getPlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Update a planned hike
   * @param {string} userId - The user's ID
   * @param {string} plannedHikeId - The planned hike's ID
   * @param {Object} updateData - The data to update
   * @returns {Object} Result with success status
   */
  async updatePlannedHike(userId, plannedHikeId, updateData) {
    try {
      // Process and sanitize the update data
      const processedUpdateData = this.processPlannedHikeUpdateData(updateData);

      const result = await dbUtils.updatePlannedHike(userId, plannedHikeId, processedUpdateData);

      if (result.success) {
        console.log(`Planned hike ${plannedHikeId} updated successfully for user ${userId}`);
        return result;
      }

      throw new Error('Failed to update planned hike');

    } catch (error) {
      console.error('PlannedHikesService.updatePlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Cancel a planned hike (update status to cancelled)
   * @param {string} userId - The user's ID
   * @param {string} plannedHikeId - The planned hike's ID
   * @returns {Object} Result with success status
   */
  async cancelPlannedHike(userId, plannedHikeId) {
    try {
      const result = await dbUtils.updatePlannedHike(userId, plannedHikeId, { 
        status: 'cancelled',
        updatedAt: new Date()
      });

      if (result.success) {
        console.log(`Planned hike ${plannedHikeId} cancelled successfully for user ${userId}`);
        return result;
      }

      throw new Error('Failed to cancel planned hike');

    } catch (error) {
      console.error('PlannedHikesService.cancelPlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Delete a planned hike (hard delete - kept for legacy support)
   * @param {string} userId - The user's ID
   * @param {string} plannedHikeId - The planned hike's ID
   * @returns {Object} Result with success status
   */
  async deletePlannedHike(userId, plannedHikeId) {
    try {
      const result = await dbUtils.deletePlannedHike(userId, plannedHikeId);

      if (result.success) {
        console.log(`Planned hike ${plannedHikeId} deleted successfully for user ${userId}`);
        return result;
      }

      throw new Error('Failed to delete planned hike');

    } catch (error) {
      console.error('PlannedHikesService.deletePlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Join a planned hike
   * @param {string} userId - The user's ID (hike owner)
   * @param {string} plannedHikeId - The planned hike's ID
   * @param {string} participantId - The participant's ID
   * @returns {Object} Result with success status
   */
  async joinPlannedHike(userId, plannedHikeId, participantId) {
    try {
      const result = await dbUtils.joinPlannedHike(userId, plannedHikeId, participantId);

      if (result.success) {
        console.log(`User ${participantId} joined planned hike ${plannedHikeId}`);
        return result;
      }

      throw new Error('Failed to join planned hike');

    } catch (error) {
      console.error('PlannedHikesService.joinPlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Leave a planned hike
   * @param {string} userId - The user's ID (hike owner)
   * @param {string} plannedHikeId - The planned hike's ID
   * @param {string} participantId - The participant's ID
   * @returns {Object} Result with success status
   */
  async leavePlannedHike(userId, plannedHikeId, participantId) {
    try {
      const result = await dbUtils.leavePlannedHike(userId, plannedHikeId, participantId);

      if (result.success) {
        console.log(`User ${participantId} left planned hike ${plannedHikeId}`);
        return result;
      }

      throw new Error('Failed to leave planned hike');

    } catch (error) {
      console.error('PlannedHikesService.leavePlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Start a planned hike (convert to active hike)
   * @param {string} userId - The user's ID
   * @param {string} plannedHikeId - The planned hike's ID
   * @returns {Object} Result with success status and active hike ID
   */
  async startPlannedHike(userId, plannedHikeId) {
    try {
      const result = await dbUtils.startPlannedHike(userId, plannedHikeId);

      if (result.success) {
        console.log(`Planned hike ${plannedHikeId} started as active hike ${result.id} for user ${userId}`);
        return result;
      }

      throw new Error('Failed to start planned hike');

    } catch (error) {
      console.error('PlannedHikesService.startPlannedHike error:', error);
      throw error;
    }
  }

  /**
   * Get statistics for planned hikes
   * @param {string} userId - The user's ID
   * @returns {Object} Statistics object
   */
  async getPlannedHikeStats(userId) {
    try {
      const plannedHikes = await this.getUserPlannedHikes(userId, { includeCancelled: true });

      const stats = {
        totalPlannedHikes: plannedHikes.length,
        upcomingHikes: plannedHikes.filter(h => new Date(h.date) >= new Date() && h.status !== 'cancelled').length,
        pastHikes: plannedHikes.filter(h => new Date(h.date) < new Date()).length,
        totalEstimatedDistance: plannedHikes.reduce((sum, hike) => sum + (parseFloat(hike.distance) || 0), 0),
        byDifficulty: {
          Easy: plannedHikes.filter(h => h.difficulty === 'Easy').length,
          Moderate: plannedHikes.filter(h => h.difficulty === 'Moderate').length,
          Hard: plannedHikes.filter(h => h.difficulty === 'Hard').length,
          Extreme: plannedHikes.filter(h => h.difficulty === 'Extreme').length
        },
        byStatus: {
          planning: plannedHikes.filter(h => h.status === 'planning').length,
          started: plannedHikes.filter(h => h.status === 'started').length,
          cancelled: plannedHikes.filter(h => h.status === 'cancelled').length
        },
        averageParticipants: plannedHikes.length > 0 
          ? plannedHikes.reduce((sum, hike) => sum + (hike.participants?.length || 0), 0) / plannedHikes.length 
          : 0
      };

      return stats;

    } catch (error) {
      console.error('PlannedHikesService.getPlannedHikeStats error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Validate planned hike data
   * @param {Object} data - The planned hike data to validate
   * @throws {Error} If validation fails
   */
  validatePlannedHikeData(data) {
    const requiredFields = ['title', 'date', 'location', 'startTime'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate date
    const hikeDate = new Date(data.date);
    if (isNaN(hikeDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // Validate start time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime)) {
      throw new Error('Invalid start time format. Use HH:MM format');
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Moderate', 'Hard', 'Extreme'];
    if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
      throw new Error(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }
  }

  /**
   * Process and sanitize planned hike data
   * @param {Object} data - The raw planned hike data
   * @returns {Object} Processed data
   */
  processPlannedHikeData(data) {
    return {
      title: String(data.title || '').trim(),
      date: new Date(data.date),
      startTime: String(data.startTime || '').trim(),
      location: String(data.location || '').trim(),
      distance: String(data.distance || '').trim(),
      difficulty: data.difficulty || 'Easy',
      description: String(data.description || '').trim(),
      notes: String(data.notes || '').trim()
    };
  }

  /**
   * Process update data
   * @param {Object} data - The raw update data
   * @returns {Object} Processed update data
   */
  processPlannedHikeUpdateData(data) {
    const processed = {};

    if (data.title !== undefined) processed.title = String(data.title).trim();
    if (data.date !== undefined) processed.date = new Date(data.date);
    if (data.startTime !== undefined) processed.startTime = String(data.startTime).trim();
    if (data.location !== undefined) processed.location = String(data.location).trim();
    if (data.distance !== undefined) processed.distance = String(data.distance).trim();
    if (data.difficulty !== undefined) processed.difficulty = data.difficulty;
    if (data.description !== undefined) processed.description = String(data.description).trim();
    if (data.notes !== undefined) processed.notes = String(data.notes).trim();
    if (data.status !== undefined) processed.status = data.status;

    return processed;
  }

  /**
   * Process filters for querying
   * @param {Object} filters - Raw filters
   * @returns {Object} Processed filters
   */
  processFilters(filters) {
    const processed = {};

    if (filters.status) processed.status = filters.status;
    if (filters.difficulty) processed.difficulty = filters.difficulty;
    if (filters.dateFrom) processed.dateFrom = new Date(filters.dateFrom);
    if (filters.dateTo) processed.dateTo = new Date(filters.dateTo);
    if (filters.includeCancelled !== undefined) processed.includeCancelled = filters.includeCancelled;

    return processed;
  }

  /**
   * Enhance planned hike data with computed fields
   * @param {Object} hike - The raw hike data
   * @returns {Object} Enhanced hike data
   */
  enhancePlannedHikeData(hike) {
    const now = new Date();
    const hikeDate = new Date(hike.date);

    return {
      ...hike,
      isUpcoming: hikeDate >= now && hike.status !== 'cancelled',
      isPast: hikeDate < now,
      daysUntilHike: Math.ceil((hikeDate - now) / (1000 * 60 * 60 * 24)),
      participantCount: hike.participants?.length || 0,
      isCancelled: hike.status === 'cancelled',
      isStarted: hike.status === 'started',
      formattedDate: hikeDate.toLocaleDateString(),
      formattedTime: hikeDate.toLocaleTimeString(),
      formattedStartTime: hike.startTime || 'Not specified'
    };
  }
}