import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ orgName: 'ناوی فەرمانگە', orgLogo: null });
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/settings');
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateLocalSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, loadingSettings, updateLocalSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
