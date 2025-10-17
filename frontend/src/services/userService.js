import { auth } from '../config/firebase.js';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper function for public API calls (no authentication required)
const makePublicRequest = async (endpoint, options = {}) => {
  try {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const fullUrl = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// User API Service
export const userApiService = {
  // Get current user's profile (authenticated)
  async getCurrentProfile() {
    return makeAuthenticatedRequest('/users/profile');
  },

  // Get any user's profile by ID (public)
  async getUserProfile(userId) {
    return makePublicRequest(`/users/${userId}`);
  },

  // Create user profile (authenticated)
  async createProfile(profileData) {
    return makeAuthenticatedRequest('/users/create-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update user profile (authenticated)
  async updateProfile(userId, updateData) {
    return makeAuthenticatedRequest(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Delete user account (authenticated)
  async deleteAccount(userId) {
    return makeAuthenticatedRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Get user's hikes (public)
  async getUserHikes(userId, options = {}) {
    const queryParams = new URLSearchParams();

    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.status) queryParams.append('status', options.status);
    if (options.difficulty)
      queryParams.append('difficulty', options.difficulty);

    const queryString = queryParams.toString();
    const endpoint = `/users/${userId}/hikes${queryString ? `?${queryString}` : ''}`;

    return makePublicRequest(endpoint);
  },

  // Get user's planned hikes (public)
  async getUserPlannedHikes(userId, options = {}) {
    const queryParams = new URLSearchParams();

    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.status) queryParams.append('status', options.status);
    if (options.difficulty)
      queryParams.append('difficulty', options.difficulty);

    const queryString = queryParams.toString();
    const endpoint = `/users/${userId}/planned-hikes${queryString ? `?${queryString}` : ''}`;

    return makePublicRequest(endpoint);
  },

  // Get user statistics (public)
  async getUserStats(userId) {
    return makePublicRequest(`/users/${userId}/stats`);
  },

  // Get user achievements (public)
  async getUserAchievements(userId) {
    return makePublicRequest(`/users/${userId}/achievements`);
  },

  // Search users (public)
  async searchUsers(query = '', filters = {}) {
    const queryParams = new URLSearchParams();

    if (query) queryParams.append('q', query);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.difficulty)
      queryParams.append('difficulty', filters.difficulty);

    const queryString = queryParams.toString();
    const endpoint = `/users/search${queryString ? `?${queryString}` : ''}`;

    return makePublicRequest(endpoint);
  },

  // Follow user (authenticated)
  async followUser(userId) {
    return makeAuthenticatedRequest(`/users/${userId}/follow`, {
      method: 'POST',
    });
  },

  // Unfollow user (authenticated)
  async unfollowUser(userId) {
    return makeAuthenticatedRequest(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  },
};

// Geocoding service for location coordinates
export const locationService = {
  async getLocationCoordinates(location) {
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

      // Debug logging
      console.log('API Key exists:', !!apiKey);
      console.log('Searching for location:', location);

      if (!apiKey) {
        throw new Error('OpenWeather API key is not configured');
      }

      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=5&appid=${apiKey}`;
      console.log('Geocoding URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

      const response = await fetch(url);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(
          `Geocoding API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('Geocoding response data:', data);

      if (!data || data.length === 0) {
        // Try alternative search terms for South African cities
        const alternativeSearches = [
          `${location}, ZA`,
          `${location}, South Africa`,
          location.split(',')[0].trim(), // Just the city name
        ];

        for (const altLocation of alternativeSearches) {
          if (altLocation !== location) {
            console.log('Trying alternative search:', altLocation);
            try {
              const altUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(altLocation)}&limit=5&appid=${apiKey}`;
              const altResponse = await fetch(altUrl);

              if (altResponse.ok) {
                const altData = await altResponse.json();
                console.log('Alternative search result:', altData);

                if (altData && altData.length > 0) {
                  return {
                    latitude: altData[0].lat,
                    longitude: altData[0].lon,
                    name: altData[0].name,
                    country: altData[0].country,
                    state: altData[0].state,
                  };
                }
              }
            } catch (altError) {
              console.log('Alternative search failed:', altError);
              // Continue to next alternative
            }
          }
        }

        throw new Error(
          `Location "${location}" not found. Try formats like "Johannesburg, South Africa" or "Pretoria, ZA"`
        );
      }

      return {
        latitude: data[0].lat,
        longitude: data[0].lon,
        name: data[0].name,
        country: data[0].country,
        state: data[0].state,
      };
    } catch (error) {
      console.error('Error getting location coordinates:', error);
      throw new Error(`Unable to get coordinates: ${error.message}`);
    }
  },
};

export default userApiService;
