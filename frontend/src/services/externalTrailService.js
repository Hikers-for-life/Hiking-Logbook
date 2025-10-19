import { useState, useEffect } from 'react';

const API_BASE = 'https://orion-api-qeyv.onrender.com';

// Read-only API Service for external trails API
export const trailsAPI = {
  // Get all trails with pagination and filtering
  getAllTrails: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters
      });
      const response = await fetch(`${API_BASE}/api/trails?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trails');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trails:', error);
      throw error;
    }
  },

  // Search trails by text
  searchTrails: async (query) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/trails/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      console.log('Search API Response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error searching trails:', error);
      throw error;
    }
  },

  // Find trails near a location (latitude, longitude, radius in km)
  findNearbyTrails: async (latitude, longitude, radius = 10) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/trails/near?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      if (!response.ok) throw new Error('Failed to fetch nearby trails');
      return await response.json();
    } catch (error) {
      console.error('Error finding nearby trails:', error);
      throw error;
    }
  },

  // Get a single trail by ID
  getTrailById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/trails/${id}`);
      if (!response.ok) throw new Error('Trail not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trail:', error);
      throw error;
    }
  },
};

// Custom hook for fetching trails
export const useTrails = (options = {}) => {
  const { page = 1, limit = 20, filters = {}, autoFetch = true } = options;
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trailsAPI.getAllTrails(page, limit, filters);
      console.log('API Response:', data); // Debug log
      // Handle different response formats (might be array or object with trails property)
      const allTrails = Array.isArray(data) ? data : data.trails || data.data || [];
      console.log('Processed trails:', allTrails); // Debug log
      setTrails(allTrails);
    } catch (err) {
      console.error('Fetch error:', err); // Debug log
      setError(err.message);
      setTrails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTrails();
    }
  }, [page, limit, JSON.stringify(filters)]);

  return { 
    trails, 
    loading, 
    error, 
    refetch: fetchTrails,
  };
};

// Helper to get random trails from array
export const getRandomTrails = (trails, count = 3) => {
  if (trails.length <= count) return trails;
  
  const shuffled = [...trails].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Custom hook for searching trails
export const useTrailSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await trailsAPI.searchTrails(query);
      setResults(Array.isArray(data) ? data : data.trails || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
};

// Custom hook for finding nearby trails
export const useNearbyTrails = () => {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findNearby = async (latitude, longitude, radius = 10) => {
    try {
      setLoading(true);
      setError(null);
      const data = await trailsAPI.findNearbyTrails(latitude, longitude, radius);
      setTrails(Array.isArray(data) ? data : data.trails || []);
    } catch (err) {
      setError(err.message);
      setTrails([]);
    } finally {
      setLoading(false);
    }
  };

  const findNearbyUsingGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          findNearby(latitude, longitude);
        },
        (err) => {
          setError('Unable to get your location');
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation not supported by your browser');
    }
  };

  return { 
    trails, 
    loading, 
    error, 
    findNearby,
    findNearbyUsingGeolocation
  };
};

// Helper to convert API data to your display format
export const formatTrailForDisplay = (trail) => {
  const distanceInMiles = (trail.distance * 0.621371).toFixed(1);
  const elevationInFeet = Math.round(trail.elevationGain * 3.28084);
  
  // Safely handle date conversion
  let dateString = 'N/A';
  try {
    if (trail.createdAt) {
      const date = new Date(trail.createdAt);
      if (!isNaN(date.getTime())) {
        dateString = date.toISOString().split('T')[0];
      }
    }
  } catch (e) {
    console.warn('Invalid date for trail:', trail.name);
  }
  
  return {
    id: trail._id || trail.id,
    name: trail.name,
    location: trail.tags?.[0] || 'Unknown Location',
    date: dateString,
    distance: `${distanceInMiles} mi`,
    difficulty: trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1),
    elevation: `${elevationInFeet} ft`,
    notes: trail.description || 'No notes available',
  };
};