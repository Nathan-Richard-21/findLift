import { useEffect } from 'react';
import { useAuth } from '../App';
import { useToast } from '../contexts/ToastContext';

/**
 * SessionExpiredToast component - Shows toast notification when user is logged out
 * due to inactivity or session expiration
 */
const SessionExpiredToast = () => {
  const { logoutReason, clearLogoutReason } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (logoutReason) {
      let message = '';
      
      switch (logoutReason) {
        case 'inactivity':
          message = 'You have been logged out due to inactivity. Please sign in again.';
          break;
        case 'session_expired':
          message = 'Your session has expired. Please sign in again.';
          break;
        default:
          message = 'You have been logged out. Please sign in again.';
      }

      // Show warning toast
      toast.warning(message, 6000);
      
      // Clear the logout reason after showing toast
      setTimeout(() => {
        clearLogoutReason();
      }, 100);
    }
  }, [logoutReason, toast, clearLogoutReason]);

  return null;
};

export default SessionExpiredToast;
