import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Metadata/Logging
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & errors
apiClient.interceptors.response.use(
  (response) => {
    // Unpack standard envelope if present: { success: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    let normalizedError = {
      message: 'An unexpected error occurred while connecting to the server.',
      status: error.response?.status || 500,
      details: null,
    };

    if (error.response?.data?.error) {
      normalizedError = {
        message: error.response.data.error.message || normalizedError.message,
        status: error.response.status,
        details: error.response.data.error.details || null,
        code: error.response.data.error.code,
      };
    } else if (error.code === 'ECONNABORTED') {
      normalizedError.message = 'The server took too long to respond (timeout).';
    } else if (!error.response) {
      normalizedError.message = 'Network error: Backend server might be sleeping or unreachable.';
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
