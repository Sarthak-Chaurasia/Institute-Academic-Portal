import axios from 'axios';

const api = axios.create({ baseURL: '/api' });
axios.defaults.withCredentials = true;

// const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const isRegistered = () => {
  return !!localStorage.getItem('registered');  // true if token exists
};

export const isUser = () => {
  return !!localStorage.getItem('token');
}

['get', 'post', 'put', 'delete'].forEach(method => {
  const original = axios[method];
  axios[method] = function (...args) {
    console.warn(`⚠️ WARNING: axios.${method}() used directly. Use api.${method}() to preserve interceptors.`);
    return original.apply(this, args);
  };
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      config.headers.Authorization = `Bearer ${token}`;
      // Authorization: `Bearer ${token}`;
      console.log('Sending token in header:', config.headers.Authorization);
      console.log('Request URL:', config.url);
      console.log('Headers being sent:', config.headers);

    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token'); // clear any old token
//       window.location.href = '/login'; // or use React Router's navigate
//     }
//     return Promise.reject(error);
//   }
// );

export default api;