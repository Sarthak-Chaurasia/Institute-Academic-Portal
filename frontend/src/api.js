import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Utility functions
export const isRegistered = () => {
  return !!sessionStorage.getItem('token');  // checks if access token exists
};

export const isUser = () => {
  return !!sessionStorage.getItem('token');
};

// Warn against using default axios methods
['get', 'post', 'put', 'delete'].forEach(method => {
  const original = axios[method];
  axios[method] = function (...args) {
    console.warn(`⚠️ WARNING: axios.${method}() used directly. Use api.${method}() to preserve interceptors.`);
    return original.apply(this, args);
  };
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      console.log('Sending token in header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not yet retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Call refresh endpoint
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        // Store new access token
        sessionStorage.setItem('token', data.access_token);

        // Update original request header
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Clear tokens and redirect to login
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
