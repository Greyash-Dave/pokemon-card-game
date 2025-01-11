import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 10 * 1000; // 10 seconds

if (import.meta.env.NODE_ENV === 'production') { 
  var API_URL = import.meta.env.VITE_API_URL;
}else{
  var API_URL = 'http://localhost:5000'
}

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError('Expected JSON response but got ' + contentType);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  };

  // Check authentication status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchWithAuth('/check-auth');
        setIsLoggedIn(data.isLoggedIn);
        setUser(data.user || null);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const data = await fetchWithAuth('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      setIsLoggedIn(true);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during login'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetchWithAuth('/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
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
        isLoading 
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