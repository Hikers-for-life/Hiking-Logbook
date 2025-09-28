const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'hiking-logbook.web.app' 
    ? 'https://hiking-logbook-hezw.onrender.com'
    : 'http://localhost:3001');

// Helper function to get auth token 
const getAuthToken = async () => {
  // Import Firebase auth
  const { auth } = await import('../contexts/AuthContext.jsx');
  
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  return await auth.currentUser.getIdToken();
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(fullUrl, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Goals API functions
export const goalsApi = {
  // Create a new goal
  async createGoal(goalData) {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  // Get all goals for the current user
  async getGoals() {
    return apiRequest('/goals');
  },

  // Get a specific goal by ID
  async getGoal(goalId) {
    return apiRequest(`/goals/${goalId}`);
  },

  // Update a goal
  async updateGoal(goalId, goalData) {
    return apiRequest(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  // Delete a goal
  async deleteGoal(goalId) {
    return apiRequest(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  },
};

export default goalsApi;
