import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to check if user is already logged in (when page refreshes)
  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth Check Failed', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      if (response.data.success) {
        setUser(response.data.data); // Save user to state
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'object' && errorData !== null ? errorData.message : errorData;
      return {
        success: false,
        message: errorMessage || 'Login failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {/* Do not render the app until we know if the user is logged in or not */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
