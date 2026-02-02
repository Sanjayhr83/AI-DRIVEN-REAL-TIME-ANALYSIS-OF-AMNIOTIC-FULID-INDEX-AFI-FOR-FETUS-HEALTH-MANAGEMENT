import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user.access_token || '';
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const settingsService = {
  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axios.put(
      `${API_URL}/api/auth/profile`,
      profileData,
      getAuthHeader()
    );
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings) => {
    const response = await axios.put(
      `${API_URL}/api/auth/settings`,
      settings,
      getAuthHeader()
    );
    return response.data;
  },

  // Get user settings
  getSettings: async () => {
    const response = await axios.get(
      `${API_URL}/api/auth/settings`,
      getAuthHeader()
    );
    return response.data;
  },
};

export default settingsService;

