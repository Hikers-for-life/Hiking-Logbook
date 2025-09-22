// frontend/services/plannedHikesService.js
import { auth } from '../config/firebase.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  const token = await user.getIdToken();
  return token;
};

// Helper function to make authenticated API calls
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Planned Hike API Service
export const plannedHikeApiService = {
  // Get all planned hikes for the current user
  async getPlannedHikes(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    const queryString = queryParams.toString();
    const endpoint = `/planned-hikes${queryString ? `?${queryString}` : ''}`;
    
    const result = await makeAuthenticatedRequest(endpoint);
    return result.data || result;
  },

  // Get a specific planned hike by ID
  async getPlannedHike(plannedHikeId) {
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}`);
    return result.data || result;
  },

  // Create a new planned hike
  async createPlannedHike(plannedHikeData) {
    const result = await makeAuthenticatedRequest('/planned-hikes', {
      method: 'POST',
      body: JSON.stringify(plannedHikeData),
    });
    return result.data || result;
  },

  // Update an existing planned hike
  async updatePlannedHike(plannedHikeId, updateData) {
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return result.data || result;
  },

  // Delete a planned hike
  async deletePlannedHike(plannedHikeId) {
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}`, {
      method: 'DELETE',
    });
    return result.data || result;
  },

  // Join a planned hike
  async joinPlannedHike(plannedHikeId, participantId = null) {
    const body = participantId ? { participantId } : {};
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}/participants`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return result.data || result;
  },

  // Leave a planned hike
  async leavePlannedHike(plannedHikeId, participantId) {
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}/participants/${participantId}`, {
      method: 'DELETE',
    });
    return result.data || result;
  },

  // Start a planned hike (convert to active hike)
  async startPlannedHike(plannedHikeId) {
    const result = await makeAuthenticatedRequest(`/planned-hikes/${plannedHikeId}/start`, {
      method: 'POST',
    });
    return result.data || result;
  },

  // Get planned hike statistics
  async getPlannedHikeStats() {
    const plannedHikes = await this.getPlannedHikes();
    
    const stats = {
      totalPlannedHikes: plannedHikes.length,
      upcomingHikes: plannedHikes.filter(h => new Date(h.date) >= new Date()).length,
      pastHikes: plannedHikes.filter(h => new Date(h.date) < new Date()).length,
      totalEstimatedDistance: plannedHikes.reduce((sum, hike) => sum + (parseFloat(hike.distance) || 0), 0),
      byDifficulty: {
        Easy: plannedHikes.filter(h => h.difficulty === 'Easy').length,
        Moderate: plannedHikes.filter(h => h.difficulty === 'Moderate').length,
        Hard: plannedHikes.filter(h => h.difficulty === 'Hard').length,
        Extreme: plannedHikes.filter(h => h.difficulty === 'Extreme').length
      },
      byStatus: {
        planned: plannedHikes.filter(h => h.status === 'planned').length,
        started: plannedHikes.filter(h => h.status === 'started').length,
        cancelled: plannedHikes.filter(h => h.status === 'cancelled').length
      },
      averageParticipants: plannedHikes.length > 0 
        ? plannedHikes.reduce((sum, hike) => sum + (hike.participants?.length || 0), 0) / plannedHikes.length 
        : 0
    };

    return stats;
  },

  // Get upcoming planned hikes
  async getUpcomingPlannedHikes() {
    const today = new Date().toISOString().split('T')[0];
    const filters = {
      dateFrom: today,
      status: 'planned'
    };
    
    return await this.getPlannedHikes(filters);
  },

  // Get past planned hikes
  async getPastPlannedHikes() {
    const today = new Date().toISOString().split('T')[0];
    const filters = {
      dateTo: today
    };
    
    return await this.getPlannedHikes(filters);
  },

  // Get planned hikes by difficulty
  async getPlannedHikesByDifficulty(difficulty) {
    const filters = { difficulty };
    return await this.getPlannedHikes(filters);
  },

  // Search planned hikes by location or title
  async searchPlannedHikes(searchTerm) {
    const allHikes = await this.getPlannedHikes();
    const searchLower = searchTerm.toLowerCase();
    
    return allHikes.filter(hike => 
      hike.title.toLowerCase().includes(searchLower) ||
      hike.location.toLowerCase().includes(searchLower) ||
      hike.description?.toLowerCase().includes(searchLower)
    );
  }
};

// Utility functions for planned hikes
export const plannedHikeUtils = {
  /**
   * Validate planned hike data before sending to API
   * @param {Object} data - The planned hike data to validate
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validatePlannedHikeData(data) {
    const errors = [];

    // Required fields validation
    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!data.date) {
      errors.push('Date is required');
    } else {
      const hikeDate = new Date(data.date);
      if (isNaN(hikeDate.getTime())) {
        errors.push('Invalid date format');
      } else if (hikeDate < new Date().setHours(0, 0, 0, 0)) {
        errors.push('Hike date cannot be in the past');
      }
    }

    if (!data.location || data.location.trim() === '') {
      errors.push('Location is required');
    }

    // Optional field validations
    if (data.distance && (isNaN(parseFloat(data.distance)) || parseFloat(data.distance) < 0)) {
      errors.push('Distance must be a positive number');
    }

    if (data.maxParticipants) {
      const maxParticipants = parseInt(data.maxParticipants);
      if (isNaN(maxParticipants) || maxParticipants < 1 || maxParticipants > 50) {
        errors.push('Maximum participants must be between 1 and 50');
      }
    }

    const validDifficulties = ['Easy', 'Moderate', 'Hard', 'Extreme'];
    if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
      errors.push('Invalid difficulty level');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format planned hike data for API submission
   * @param {Object} formData - Raw form data
   * @returns {Object} Formatted data for API
   */
  formatPlannedHikeData(formData) {
    return {
      title: formData.title?.trim() || '',
      date: formData.date || '',
      location: formData.location?.trim() || '',
      distance: formData.distance ? parseFloat(formData.distance) : 0,
      estimatedDuration: formData.estimatedDuration?.trim() || '',
      difficulty: formData.difficulty || 'Easy',
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 8,
      description: formData.description?.trim() || '',
      meetingPoint: formData.meetingPoint?.trim() || '',
      notes: formData.notes?.trim() || ''
    };
  },

  /**
   * Check if user can join a planned hike
   * @param {Object} plannedHike - The planned hike data
   * @param {string} userId - The user ID (optional)
   * @returns {Object} Object with canJoin boolean and reason if can't join
   */
  canJoinPlannedHike(plannedHike, userId = null) {
    // Check if hike is in the past
    if (new Date(plannedHike.date) < new Date()) {
      return { canJoin: false, reason: 'This hike is in the past' };
    }

    // Check if hike is full
    if (plannedHike.isFull) {
      return { canJoin: false, reason: 'This hike is full' };
    }

    // Check if user is already a participant
    if (userId && plannedHike.participants?.includes(userId)) {
      return { canJoin: false, reason: 'You are already participating in this hike' };
    }

    // Check if hike is cancelled
    if (plannedHike.status === 'cancelled') {
      return { canJoin: false, reason: 'This hike has been cancelled' };
    }

    // Check if hike has already started
    if (plannedHike.status === 'started') {
      return { canJoin: false, reason: 'This hike has already started' };
    }

    return { canJoin: true };
  },

  /**
   * Get formatted date and time for display
   * @param {string} dateString - ISO date string
   * @returns {Object} Object with formatted date and time
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      dateTime: date.toLocaleString(),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      shortDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    };
  },

  /**
   * Calculate days until hike
   * @param {string} dateString - ISO date string
   * @returns {number} Days until hike (negative if in past)
   */
  getDaysUntilHike(dateString) {
    const hikeDate = new Date(dateString);
    const now = new Date();
    const diffTime = hikeDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Get hike status with color coding
   * @param {Object} plannedHike - The planned hike data
   * @returns {Object} Status object with text, color, and icon
   */
  getHikeStatus(plannedHike) {
    const now = new Date();
    const hikeDate = new Date(plannedHike.date);
    const daysUntil = this.getDaysUntilHike(plannedHike.date);

    if (plannedHike.status === 'cancelled') {
      return { text: 'Cancelled', color: 'red', icon: '❌' };
    }

    if (plannedHike.status === 'started') {
      return { text: 'Started', color: 'green', icon: '🥾' };
    }

    if (hikeDate < now) {
      return { text: 'Past', color: 'gray', icon: '📅' };
    }

    if (daysUntil === 0) {
      return { text: 'Today', color: 'orange', icon: '🌟' };
    }

    if (daysUntil === 1) {
      return { text: 'Tomorrow', color: 'blue', icon: '⏰' };
    }

    if (daysUntil <= 7) {
      return { text: 'This week', color: 'purple', icon: '📆' };
    }

    return { text: 'Upcoming', color: 'green', icon: '📋' };
  }
};

export default plannedHikeApiService;