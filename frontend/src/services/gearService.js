// frontend/services/gearService.js
import { useState, useCallback } from 'react';
import { auth } from '../config/firebase.js';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'hiking-logbook.web.app'
    ? 'https://hiking-logbook-hezw.onrender.com/api'
    : 'http://localhost:3001/api');

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
        errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`
      );
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Gear Checklist API Service
export const gearApiService = {
  // Get user's gear checklist
  async getGearChecklist() {
    const result = await makeAuthenticatedRequest('/gear/checklist');
    return result.data || result;
  },

  // Update entire gear checklist
  async updateGearChecklist(gearItems) {
    const result = await makeAuthenticatedRequest('/gear/checklist', {
      method: 'PUT',
      body: JSON.stringify({ gearItems }),
    });
    return result.data || result;
  },

  // Add a new gear item
  async addGearItem(itemName) {
    const result = await makeAuthenticatedRequest('/gear/checklist/items', {
      method: 'POST',
      body: JSON.stringify({ itemName }),
    });
    return result.data || result;
  },

  // Remove a gear item
  async removeGearItem(itemIndex) {
    const result = await makeAuthenticatedRequest(
      `/gear/checklist/items/${itemIndex}`,
      {
        method: 'DELETE',
      }
    );
    return result.data || result;
  },

  // Toggle gear item checked status
  async toggleGearItem(itemIndex) {
    const result = await makeAuthenticatedRequest(
      `/gear/checklist/items/${itemIndex}/toggle`,
      {
        method: 'POST',
      }
    );
    return result.data || result;
  },

  // Reset all items to unchecked
  async resetGearChecklist() {
    const result = await makeAuthenticatedRequest('/gear/checklist/reset', {
      method: 'POST',
    });
    return result.data || result;
  },

  // Get gear statistics
  async getGearStats() {
    const result = await makeAuthenticatedRequest('/gear/checklist/stats');
    return result.data || result;
  },
};

// Gear Checklist Hook for React
export const useGearChecklist = () => {
  const [gearChecklist, setGearChecklist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load gear checklist from API
  const loadGearChecklist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const checklist = await gearApiService.getGearChecklist();
      setGearChecklist(checklist);
    } catch (err) {
      console.error('Failed to load gear checklist:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add gear item with optimistic update
  const addGearItem = async (itemName) => {
    if (!itemName || itemName.trim() === '') return;

    const trimmedName = itemName.trim();

    // Check for duplicates
    if (
      gearChecklist.some(
        (item) => item.item.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      throw new Error('Item already exists in checklist');
    }

    // Optimistic update
    const newItem = { item: trimmedName, checked: false };
    setGearChecklist((prev) => [...prev, newItem]);

    try {
      const result = await gearApiService.addGearItem(trimmedName);
      // Update with server response
      setGearChecklist(result.checklist || [...gearChecklist, newItem]);
    } catch (error) {
      // Revert optimistic update
      setGearChecklist((prev) => prev.slice(0, -1));
      throw error;
    }
  };

  // Remove gear item with optimistic update
  const removeGearItem = async (index) => {
    const originalChecklist = [...gearChecklist];

    // Optimistic update
    setGearChecklist((prev) => prev.filter((_, i) => i !== index));

    try {
      const result = await gearApiService.removeGearItem(index);
      // Update with server response
      setGearChecklist(
        result.checklist || gearChecklist.filter((_, i) => i !== index)
      );
    } catch (error) {
      // Revert optimistic update
      setGearChecklist(originalChecklist);
      throw error;
    }
  };

  // Toggle gear item with optimistic update
  const toggleGearItem = async (index) => {
    const originalChecklist = [...gearChecklist];

    // Optimistic update
    setGearChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );

    try {
      const result = await gearApiService.toggleGearItem(index);
      // Update with server response
      setGearChecklist(
        result.checklist ||
          gearChecklist.map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item
          )
      );
    } catch (error) {
      // Revert optimistic update
      setGearChecklist(originalChecklist);
      throw error;
    }
  };

  // Reset all items to unchecked
  const resetGearChecklist = async () => {
    const originalChecklist = [...gearChecklist];

    // Optimistic update
    setGearChecklist((prev) =>
      prev.map((item) => ({ ...item, checked: false }))
    );

    try {
      const result = await gearApiService.resetGearChecklist();
      setGearChecklist(
        result.checklist ||
          gearChecklist.map((item) => ({ ...item, checked: false }))
      );
    } catch (error) {
      // Revert optimistic update
      setGearChecklist(originalChecklist);
      throw error;
    }
  };

  // Update entire checklist
  const updateGearChecklist = async (newChecklist) => {
    const originalChecklist = [...gearChecklist];

    // Optimistic update
    setGearChecklist(newChecklist);

    try {
      await gearApiService.updateGearChecklist(newChecklist);
    } catch (error) {
      // Revert optimistic update
      setGearChecklist(originalChecklist);
      throw error;
    }
  };

  return {
    gearChecklist,
    isLoading,
    error,
    loadGearChecklist,
    addGearItem,
    removeGearItem,
    toggleGearItem,
    resetGearChecklist,
    updateGearChecklist,
    // Computed values
    totalItems: gearChecklist.length,
    checkedItems: gearChecklist.filter((item) => item.checked).length,
    uncheckedItems: gearChecklist.filter((item) => !item.checked).length,
    completionPercentage:
      gearChecklist.length > 0
        ? Math.round(
            (gearChecklist.filter((item) => item.checked).length /
              gearChecklist.length) *
              100
          )
        : 0,
  };
};

// Utility functions for gear management
export const gearUtils = {
  // Validate gear item name
  validateItemName(itemName) {
    if (!itemName || typeof itemName !== 'string') {
      return { isValid: false, error: 'Item name is required' };
    }

    const trimmedName = itemName.trim();
    if (trimmedName === '') {
      return { isValid: false, error: 'Item name cannot be empty' };
    }

    if (trimmedName.length > 50) {
      return {
        isValid: false,
        error: 'Item name must be 50 characters or less',
      };
    }

    return { isValid: true };
  },

  // Get default gear items for different hike types
  getDefaultGearItems(hikeType = 'day') {
    const gearSets = {
      day: [
        { item: 'Hiking Boots', checked: false },
        { item: 'Water (3L)', checked: false },
        { item: 'Trail Snacks', checked: false },
        { item: 'First Aid Kit', checked: false },
        { item: 'Map & Compass', checked: false },
        { item: 'Sunscreen', checked: false },
      ],
      overnight: [
        { item: 'Hiking Boots', checked: false },
        { item: 'Water (4L)', checked: false },
        { item: 'Camping Food', checked: false },
        { item: 'First Aid Kit', checked: false },
        { item: 'Tent', checked: false },
        { item: 'Sleeping Bag', checked: false },
        { item: 'Sleeping Pad', checked: false },
        { item: 'Cooking Gear', checked: false },
      ],
      winter: [
        { item: 'Winter Boots', checked: false },
        { item: 'Insulated Water Bottles', checked: false },
        { item: 'High-Energy Snacks', checked: false },
        { item: 'First Aid Kit', checked: false },
        { item: 'Winter Layers', checked: false },
        { item: 'Hand/Foot Warmers', checked: false },
        { item: 'Emergency Shelter', checked: false },
      ],
    };

    return gearSets[hikeType] || gearSets.day;
  },

  // Sort gear items
  sortGearItems(items, sortBy = 'alphabetical') {
    switch (sortBy) {
      case 'alphabetical':
        return [...items].sort((a, b) => a.item.localeCompare(b.item));
      case 'checked-first':
        return [...items].sort(
          (a, b) => b.checked - a.checked || a.item.localeCompare(b.item)
        );
      case 'unchecked-first':
        return [...items].sort(
          (a, b) => a.checked - b.checked || a.item.localeCompare(b.item)
        );
      default:
        return items;
    }
  },

  // Export gear checklist as text
  exportAsText(items) {
    const checkedItems = items.filter((item) => item.checked);
    const uncheckedItems = items.filter((item) => !item.checked);

    let text = 'GEAR CHECKLIST\n';
    text += '==============\n\n';

    if (checkedItems.length > 0) {
      text += '✅ CHECKED ITEMS:\n';
      checkedItems.forEach((item) => {
        text += `• ${item.item}\n`;
      });
      text += '\n';
    }

    if (uncheckedItems.length > 0) {
      text += '⬜ UNCHECKED ITEMS:\n';
      uncheckedItems.forEach((item) => {
        text += `• ${item.item}\n`;
      });
    }

    return text;
  },
};

export default gearApiService;
