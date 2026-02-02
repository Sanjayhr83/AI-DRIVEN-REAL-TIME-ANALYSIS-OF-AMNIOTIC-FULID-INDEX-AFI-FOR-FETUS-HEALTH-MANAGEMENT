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
      // Don't set Content-Type for FormData - browser will set it with boundary
    }
  };
};

const getAuthHeaderJson = () => {
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

export const healthRecordsService = {
  // Upload a health record
  uploadRecord: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', metadata.category);
    formData.append('title', metadata.title);
    formData.append('date', metadata.date);
    formData.append('notes', metadata.notes || '');

    const response = await axios.post(
      `${API_URL}/api/health-records/upload`,
      formData,
      getAuthHeader()
    );
    
    // Dispatch event to notify dashboard of new health record
    window.dispatchEvent(new CustomEvent('healthRecordUploaded', { 
      detail: response.data 
    }));
    
    return response.data;
  },

  // Get all health records
  getRecords: async (category = null) => {
    const url = category 
      ? `${API_URL}/api/health-records?category=${category}`
      : `${API_URL}/api/health-records`;
    
    const response = await axios.get(url, getAuthHeaderJson());
    return response.data;
  },

  // Delete a record
  deleteRecord: async (recordId) => {
    const response = await axios.delete(
      `${API_URL}/api/health-records/${recordId}`,
      getAuthHeaderJson()
    );
    return response.data;
  },

  // Download a record
  downloadRecord: async (recordId) => {
    const response = await axios.get(
      `${API_URL}/api/health-records/${recordId}/download`,
      {
        ...getAuthHeaderJson(),
        responseType: 'blob'
      }
    );
    return response.data;
  },
};

export default healthRecordsService;

