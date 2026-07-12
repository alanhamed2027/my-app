import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  // Point to our future Node.js/Express backend
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token to every request if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid/expired, automatically logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('fakeUser');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
