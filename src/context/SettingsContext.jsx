// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    currency_format: 'coins',
    date_format: 'US',
    timezone: 'UTC',
    // ... other defaults
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSettings(response.data);
      // Apply theme immediately
      applyTheme(response.data.theme);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    
    switch (settings.currency_format) {
      case 'k':
        return amount >= 1000 ? `${(amount / 1000).toFixed(1)}K` : amount.toLocaleString();
      case 'm':
        return amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}M` : 
               amount >= 1000 ? `${(amount / 1000).toFixed(1)}K` : amount.toLocaleString();
      default:
        return amount.toLocaleString();
    }
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    if (settings.date_format === 'EU') {
      return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
    }
    return dateObj.toLocaleDateString('en-US'); // MM/DD/YYYY
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      setSettings,
      fetchSettings,
      formatCurrency,
      formatDate,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
