import axios from 'axios';

// The base URL for our Express API dynamically resolves the host
const API_URL = `http://${window.location.hostname}:5000/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  // SUPER IMPORTANT: This tells Axios to ALWAYS send the HTTP-Only cookie (token) with every request
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the system type header
axiosInstance.interceptors.request.use((config) => {
  const systemType = localStorage.getItem('systemType') || 'INTERNAL';
  config.headers['x-system-type'] = systemType;
  return config;
});

// Intercept responses to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.data?.error && typeof error.response.data.error === 'object') {
      // Normalize the error message if the backend returned an object (e.g. { message: "..." })
      // This prevents React from crashing with "Objects are not valid as a React child"
      error.response.data.error = error.response.data.error.message || 'An unexpected error occurred';
    }
    
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized globally: Force redirect to login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('fakeUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
