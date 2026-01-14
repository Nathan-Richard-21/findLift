import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';

/**
 * InactivityWarning component - Shows a warning modal when user is about to be logged out
 * due to inactivity. Allows user to dismiss and continue session.
 */
const InactivityWarning = () => {
  const { showInactivityWarning, dismissInactivityWarning, inactivityTimeoutMinutes } = useAuth();
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (!showInactivityWarning) {
      setCountdown(120);
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showInactivityWarning]);

  if (!showInactivityWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-fade-in">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Session Timeout Warning
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-4">
          You've been inactive for a while. For your security, you'll be automatically 
          logged out in:
        </p>

        {/* Countdown */}
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-red-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Info text */}
        <p className="text-sm text-gray-500 text-center mb-6">
          Click the button below or move your mouse to stay logged in.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={dismissInactivityWarning}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 transition-colors
                     shadow-md hover:shadow-lg"
          >
            I'm Still Here - Keep Me Logged In
          </button>
        </div>

        {/* Footer info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Sessions automatically expire after {inactivityTimeoutMinutes} minutes of inactivity
        </p>
      </div>
    </div>
  );
};

export default InactivityWarning;
