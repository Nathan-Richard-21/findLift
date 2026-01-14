import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to track user inactivity and trigger logout after specified timeout
 * @param {Function} onTimeout - Callback function to execute when timeout is reached (typically logout)
 * @param {number} timeoutMinutes - Inactivity timeout in minutes (default: 15)
 * @param {boolean} isAuthenticated - Whether the user is currently authenticated
 */
const useInactivityTimeout = (onTimeout, timeoutMinutes = 15, isAuthenticated = false) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  // Warning 2 minutes before logout
  const warningMs = (timeoutMinutes - 2) * 60 * 1000;

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    // Update last activity timestamp
    lastActivityRef.current = Date.now();
    
    // Store last activity in localStorage for cross-tab synchronization
    localStorage.setItem('lastActivity', Date.now().toString());
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Only set timers if user is authenticated
    if (isAuthenticated) {
      // Set warning timer (2 minutes before logout)
      if (timeoutMinutes > 2) {
        warningTimeoutRef.current = setTimeout(() => {
          // Dispatch custom event for warning notification
          window.dispatchEvent(new CustomEvent('inactivity-warning', {
            detail: { minutesRemaining: 2 }
          }));
        }, warningMs);
      }
      
      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Inactivity timeout reached - logging out user');
        onTimeout();
      }, timeoutMs);
    }
  }, [isAuthenticated, onTimeout, timeoutMs, warningMs, timeoutMinutes]);

  // Check if session has expired (useful for page refresh)
  const checkSessionValidity = useCallback(() => {
    if (!isAuthenticated) return;
    
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
      if (timeSinceLastActivity > timeoutMs) {
        console.log('⏰ Session expired during inactivity - logging out');
        onTimeout();
        return false;
      }
    }
    return true;
  }, [isAuthenticated, onTimeout, timeoutMs]);

  // Handle activity from other tabs
  const handleStorageChange = useCallback((event) => {
    if (event.key === 'lastActivity' && event.newValue) {
      // Another tab was active, reset our timer
      resetTimer();
    }
    // Handle logout from another tab
    if (event.key === 'logout-event') {
      onTimeout();
    }
  }, [resetTimer, onTimeout]);

  // Handle visibility change (tab becomes visible)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Check if session is still valid when tab becomes visible
      if (checkSessionValidity()) {
        resetTimer();
      }
    }
  }, [checkSessionValidity, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers when not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      return;
    }

    // Check session validity on mount
    if (!checkSessionValidity()) {
      return;
    }

    // Events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
      'wheel'
    ];

    // Throttle the reset function to avoid excessive calls
    let throttleTimeout = null;
    const throttledReset = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        resetTimer();
      }, 1000); // Only process activity events every 1 second
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [isAuthenticated, resetTimer, handleStorageChange, handleVisibilityChange, checkSessionValidity]);

  // Return function to manually reset timer (useful after API calls)
  return { resetTimer, checkSessionValidity };
};

export default useInactivityTimeout;
