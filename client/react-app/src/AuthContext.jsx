// AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 10 * 1000; // 10 seconds

if (process.env.NODE_ENV === 'production' || import.meta.env.NODE_ENV === 'production') {
  var API_URL = import.meta.env.VITE_API_URL;
} else {
  var API_URL = 'http://localhost:5000';
}

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutError, setLogoutError] = useState(null);

  // Generic fetch handler with error handling
  const fetchWithAuth = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred'
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true }; // For endpoints that don't return JSON
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  };

  // Enhanced logout function with better error handling
  const logout = useCallback(async () => {
    setLogoutError(null);
    try {
      setIsLoading(true);
      await fetchWithAuth('/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear all auth-related state
      setIsLoggedIn(false);
      setUser(null);
      
      // Clear any auth-related items from localStorage if you're using any
      localStorage.removeItem('lastActivity');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to logout. Please try again.';
      setLogoutError(errorMessage);
      console.error('Logout error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inactivity timer with debouncing
  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer;
    let debounceTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Inactivity timeout reached, logging out...');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const handleActivity = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('Activity detected, resetting timer...');
        resetTimer();
      }, 1000); // Debounce for 1 second
    };

    console.log('Setting up inactivity timer...');
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      console.log('Cleaning up inactivity timer...');
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [isLoggedIn, logout]);

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        user, 
        setIsLoggedIn, 
        setUser, 
        login, 
        logout,
        isLoading,
        logoutError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;