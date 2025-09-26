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
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Hike API Service
export const hikeApiService = {
  // Get all hikes for the current user
  async getHikes(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.pinned !== undefined) queryParams.append('pinned', filters.pinned);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/hikes${queryString ? `?${queryString}` : ''}`;
    
    return makeAuthenticatedRequest(endpoint);
  },

  // Get user hiking statistics
  async getStats() {
    return makeAuthenticatedRequest('/hikes/stats');
  },

  // Get a specific hike by ID
  async getHike(hikeId) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}`);
  },

  // Create a new hike
  async createHike(hikeData) {
    return makeAuthenticatedRequest('/hikes', {
      method: 'POST',
      body: JSON.stringify(hikeData),
    });
  },

  // Update an existing hike
  async updateHike(hikeId, updateData) {

    const result = await makeAuthenticatedRequest(`/hikes/${hikeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return result;
  },

  // Delete a hike
  async deleteHike(hikeId) {


    
    const result = await makeAuthenticatedRequest(`/hikes/${hikeId}`, {
      method: 'DELETE',
    });

    return result;
  },

  // Start tracking a new hike
  async startHike(hikeData) {
    return makeAuthenticatedRequest('/hikes/start', {
      method: 'POST',
      body: JSON.stringify(hikeData),
    });
  },

  // Complete a hike
  async completeHike(hikeId, endData) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/complete`, {
      method: 'POST',
      body: JSON.stringify(endData),
    });
  },

  // Add a GPS waypoint to a hike
  async addWaypoint(hikeId, waypoint) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/waypoint`, {
      method: 'POST',
      body: JSON.stringify(waypoint),
    });
  },

  // Get user hike statistics
  async getHikeStats() {
    return makeAuthenticatedRequest('/hikes/stats/overview');
  },

  // Get user hike progress (for charts)
  async getHikeProgress() {
    return makeAuthenticatedRequest('/hikes/progress');
  },

  // Pin a hike
  async pinHike(hikeId) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/pin`, {
      method: 'PATCH',
    });
  },

  // Unpin a hike
  async unpinHike(hikeId) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/unpin`, {
      method: 'PATCH',
    });
  },

  // Share a hike with friends
  async shareHike(hikeId) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/share`, {
      method: 'PATCH',
    });
  },

  // Unshare a hike with friends
  async unshareHike(hikeId) {
    return makeAuthenticatedRequest(`/hikes/${hikeId}/unshare`, {
      method: 'PATCH',
    });
  },
};

export default hikeApiService;

