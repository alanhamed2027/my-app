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
      // Fake check auth: If there's a fake user in localStorage
      const fakeUser = localStorage.getItem('fakeUser');
      if (fakeUser) {
        setUser(JSON.parse(fakeUser));
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
    // Fake login
    const fakeUserData = {
      id: 1,
      username: username || 'admin',
      fullName: 'Admin (Demo Mode)',
      role: 'ADMIN'
    };
    setUser(fakeUserData);
    localStorage.setItem('fakeUser', JSON.stringify(fakeUserData));
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('fakeUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {/* Do not render the app until we know if the user is logged in or not */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
