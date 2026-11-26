import axios from 'axios';

/**
 * Resolve API Base URL.
 * Automatically aligns with the current window hostname in local development
 * (i.e. 'localhost' vs '127.0.0.1') to avoid Windows IPv4/IPv6 loopback mismatches.
 */
export const getBaseUrl = () => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
    'http://localhost:8000/api/v1';

  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname === '127.0.0.1' && envUrl.includes('localhost:8000')) {
      return envUrl.replace('localhost:8000', '127.0.0.1:8000');
    }
    if (hostname === 'localhost' && envUrl.includes('127.0.0.1:8000')) {
      return envUrl.replace('127.0.0.1:8000', 'localhost:8000');
    }
  }
  return envUrl;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Ensure dynamic baseURL alignment per request
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
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
      originalError: error,
    };

    if (error.response?.data?.error) {
      normalizedError = {
        message: error.response.data.error.message || normalizedError.message,
        status: error.response.status,
        details: error.response.data.error.details || null,
        code: error.response.data.error.code,
        originalError: error,
      };
    } else if (error.code === 'ECONNABORTED') {
      normalizedError.message = 'The server took too long to respond (timeout).';
    } else if (!error.response) {
      normalizedError.message = `Network error connecting to ${error.config?.baseURL || 'API'}: Backend server might be sleeping or unreachable.`;
    }

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
