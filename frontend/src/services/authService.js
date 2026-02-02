import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  
  if (response.data.access_token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await axios.post(API_URL + 'token', formData);
  
  if (response.data.access_token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getUserProfile = async () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const response = await axios.get(API_URL + 'me', {
    headers: {
      Authorization: `Bearer ${user.access_token}`
    }
  });
  
  // Update stored user data with profile info
  const updatedUser = { ...user, ...response.data };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  return updatedUser;
};

const updateProfile = async (profileData) => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
  const response = await axios.put(API_URL + 'profile', profileData, {
    headers: {
      Authorization: `Bearer ${user.access_token}`
    }
  });
  
  // Update stored user data with new profile info
  const updatedUser = { ...user, ...response.data };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  // Dispatch event to notify dashboard of profile update
  window.dispatchEvent(new CustomEvent('profileUpdated', { 
    detail: updatedUser 
  }));
  
  return updatedUser;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserProfile,
  updateProfile,
};

export default authService;