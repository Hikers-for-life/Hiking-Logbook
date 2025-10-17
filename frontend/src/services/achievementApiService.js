// Frontend service for achievement-related API calls
import { auth } from '../config/firebase.js';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'hiking-logbook.web.app'
    ? 'https://hiking-logbook-hezw.onrender.com/api'
    : 'http://localhost:3001/api');

class AchievementApiService {
  // Get auth token from Firebase
  async getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('No authenticated user');
    }
    const token = await user.getIdToken();
    return token;
  }

  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    try {
      const token = await this.getAuthToken();
      const url = `${API_BASE_URL}${endpoint}`;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Get user badges
  async getBadges() {
    try {
      const response = await this.makeRequest('/users/badges');
      return response;
    } catch (error) {
      console.error('Error fetching badges:', error);
      throw error;
    }
  }

  // Evaluate and award new badges
  async evaluateBadges() {
    try {
      const response = await this.makeRequest('/users/badges/evaluate', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error evaluating badges:', error);
      throw error;
    }
  }

  // Get comprehensive user stats
  async getStats() {
    try {
      const response = await this.makeRequest('/users/stats');
      return response;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Get progress data for charts
  async getProgress() {
    try {
      const response = await this.makeRequest('/hikes/progress');
      return response;
    } catch (error) {
      console.error('Error fetching progress data:', error);
      throw error;
    }
  }

  // Get hike stats (from existing hikeApiService)
  async getHikeStats() {
    try {
      const response = await this.makeRequest('/hikes/stats');
      return response;
    } catch (error) {
      console.error('Error fetching hike stats:', error);
      throw error;
    }
  }
}

export const achievementApiService = new AchievementApiService();
export default achievementApiService;
