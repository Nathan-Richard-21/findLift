import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useInactivityTimeout from '../hooks/useInactivityTimeout';

const AuthContext = createContext();

// Inactivity timeout in minutes
const INACTIVITY_TIMEOUT_MINUTES = 15;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [logoutReason, setLogoutReason] = useState(null);
  const isLoggingOut = useRef(false);

  // Handle inactivity logout
  const handleInactivityLogout = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    
    console.log('🔐 Auto-logout due to inactivity');
    setLogoutReason('inactivity');
    
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('kycSession');
    localStorage.removeItem('lastActivity');
    document.cookie = 'token=; path=/; max-age=0';
    
    // Notify other tabs about logout
    localStorage.setItem('logout-event', Date.now().toString());
    
    setUser(null);
    setShowInactivityWarning(false);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 100);
  }, []);

  // Initialize inactivity timeout tracker
  const { resetTimer } = useInactivityTimeout(
    handleInactivityLogout,
    INACTIVITY_TIMEOUT_MINUTES,
    !!user
  );

  // Listen for inactivity warning
  useEffect(() => {
    const handleWarning = (event) => {
      if (user) {
        setShowInactivityWarning(true);
        console.log(`⚠️ Inactivity warning: ${event.detail.minutesRemaining} minutes until logout`);
      }
    };

    window.addEventListener('inactivity-warning', handleWarning);
    return () => window.removeEventListener('inactivity-warning', handleWarning);
  }, [user]);

  // Dismiss warning and reset timer when user interacts
  const dismissInactivityWarning = useCallback(() => {
    setShowInactivityWarning(false);
    resetTimer();
  }, [resetTimer]);

  // Clear logout reason after displaying
  const clearLogoutReason = useCallback(() => {
    setLogoutReason(null);
  }, []);

  useEffect(() => {
    // Check if user is logged in (simulate with localStorage)
    const checkAuth = () => {
      try {
        // First check if session expired during inactivity
        const lastActivity = localStorage.getItem('lastActivity');
        const timeoutMs = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;
        
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          if (timeSinceLastActivity > timeoutMs) {
            console.log('⏰ Session expired during browser close - clearing auth data');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('kycSession');
            localStorage.removeItem('lastActivity');
            document.cookie = 'token=; path=/; max-age=0';
            setLogoutReason('session_expired');
            setLoading(false);
            return;
          }
        }
        
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
          // Initialize last activity time for new session
          localStorage.setItem('lastActivity', Date.now().toString());
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Simulate login API call
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: credentials.name || 'User',
        role: 'driver', // or 'admin'
        isVerified: false
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      // Initialize activity tracking on login
      localStorage.setItem('lastActivity', Date.now().toString());
      setUser(mockUser);
      setLogoutReason(null); // Clear any previous logout reason
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback((reason = 'manual') => {
    console.log(`🔐 Logging out user. Reason: ${reason}`);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('kycSession');
    localStorage.removeItem('lastActivity');
    document.cookie = 'token=; path=/; max-age=0';
    
    // Notify other tabs about logout
    localStorage.setItem('logout-event', Date.now().toString());
    
    setUser(null);
    setShowInactivityWarning(false);
    
    if (reason !== 'manual') {
      setLogoutReason(reason);
    }
  }, []);

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    // Reset activity timer on user update
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    // Inactivity related values
    showInactivityWarning,
    dismissInactivityWarning,
    logoutReason,
    clearLogoutReason,
    resetActivityTimer: resetTimer,
    inactivityTimeoutMinutes: INACTIVITY_TIMEOUT_MINUTES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;