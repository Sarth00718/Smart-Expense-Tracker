import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const COLOR_SCHEMES = {
  blue: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    accent: '#10B981'
  },
  green: {
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    accent: '#3B82F6'
  },
  purple: {
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    primaryLight: '#A78BFA',
    accent: '#EC4899'
  },
  orange: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FBBF24',
    accent: '#EF4444'
  },
  pink: {
    primary: '#EC4899',
    primaryDark: '#DB2777',
    primaryLight: '#F472B6',
    accent: '#8B5CF6'
  }
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('auto'); // 'light', 'dark', 'auto'
  const [colorScheme, setColorScheme] = useState('blue');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or user preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedColorScheme = localStorage.getItem('colorScheme');

    if (savedTheme) setTheme(savedTheme);
    if (savedColorScheme) setColorScheme(savedColorScheme);

    // Load user preferences from server if logged in
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  // Apply theme based on mode
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'auto') {
        // Auto mode: check system preference and time
        const hour = new Date().getHours();
        const isNightTime = hour >= 18 || hour < 6;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        shouldBeDark = isNightTime || prefersDark;
      }

      setIsDark(shouldBeDark);

      // Apply to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Re-check every minute for auto mode
    if (theme === 'auto') {
      const interval = setInterval(applyTheme, 60000);
      return () => clearInterval(interval);
    }
  }, [theme]);

  // Apply color scheme
  useEffect(() => {
    const colors = COLOR_SCHEMES[colorScheme];
    const root = document.documentElement;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-accent', colors.accent);
  }, [colorScheme]);

  const loadUserPreferences = async () => {
    try {
      const response = await api.get('/users/preferences');
      if (response.data.preferences) {
        const { theme: userTheme, colorScheme: userColorScheme } = response.data.preferences;
        if (userTheme) setTheme(userTheme);
        if (userColorScheme) setColorScheme(userColorScheme);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (user) {
      try {
        await api.patch('/users/preferences', {
          theme: newTheme
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  const updateColorScheme = async (newColorScheme) => {
    setColorScheme(newColorScheme);
    localStorage.setItem('colorScheme', newColorScheme);

    if (user) {
      try {
        await api.patch('/users/preferences', {
          colorScheme: newColorScheme
        });
      } catch (error) {
        console.error('Failed to save color scheme preference:', error);
      }
    }
  };

  const toggleTheme = () => {
    const modes = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    updateTheme(modes[nextIndex]);
  };

  const value = {
    theme,
    colorScheme,
    isDark,
    updateTheme,
    updateColorScheme,
    toggleTheme,
    colorSchemes: COLOR_SCHEMES
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
