import React, { useEffect } from 'react';
import api from '../services/api';

const GoogleSignInButton = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            width: 400, // Fixed width in pixels instead of percentage
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      // Send credential to backend
      const result = await api.post('/auth/google', {
        credential: response.credential
      });

      if (result.data.success) {
        // Backend returns token in response body
        // Since backend is on different domain, we need to manually set cookie
        if (result.data.token) {
          // Set cookie manually on frontend domain
          document.cookie = `token=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; ${
            window.location.protocol === 'https:' ? 'secure; samesite=strict' : ''
          }`;
          console.log('✅ Token cookie set manually from response');
        }
        onSuccess(result.data);
      } else {
        onError(result.data.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError(error.response?.data?.error || 'Google sign-in failed');
    }
  };

  return (
    <div className="w-full">
      <div id="googleSignInButton" className="flex justify-center"></div>
    </div>
  );
};

export default GoogleSignInButton;
