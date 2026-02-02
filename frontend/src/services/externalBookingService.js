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

export const externalBookingService = {
  // Search doctors with filters
  searchDoctors: async (filters) => {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.name) params.append('name', filters.name);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.rating) params.append('min_rating', filters.rating);
    
    const response = await axios.get(
      `${API_URL}/api/external/search-doctors?${params}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Get doctor details
  getDoctorDetails: async (doctorId) => {
    const response = await axios.get(
      `${API_URL}/api/external/doctors/${doctorId}`,
      getAuthHeader()
    );
    return response.data;
  },

  // Get specialties list
  getSpecialties: async () => {
    const response = await axios.get(
      `${API_URL}/api/external/specialties`,
      getAuthHeader()
    );
    return response.data;
  },
};

export default externalBookingService;

