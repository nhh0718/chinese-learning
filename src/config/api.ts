// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URLS = {
  auth: `${API_BASE_URL}/api/v1/auth`,
  topics: `${API_BASE_URL}/api/v1/topics`,
  lessons: `${API_BASE_URL}/api/v1/lessons`,
  progress: `${API_BASE_URL}/api/v1/progress`,
  telegram: `${API_BASE_URL}/api/v1/telegram`,
};

export default API_BASE_URL;
