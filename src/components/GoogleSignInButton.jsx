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
        if (result.data.token) {
          // Store in both cookie AND localStorage as fallback
          const isSecure = window.location.protocol === 'https:';
          const cookieString = `token=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}${
            isSecure ? '; secure; samesite=none' : '; samesite=lax'
          }`;
          document.cookie = cookieString;
          
          // Also store in localStorage
          localStorage.setItem('token', result.data.token);
          
          // Verify cookie was set
          const cookieSet = document.cookie.includes('token=');
          console.log('✅ Token cookie set manually:', cookieSet);
          console.log('✅ Token stored in localStorage');
          
          if (!cookieSet) {
            console.error('❌ Failed to set cookie!');
            console.error('   Cookie string:', cookieString);
            console.error('   Current cookies:', document.cookie);
          }
        } else {
          console.warn('⚠️ No token in response:', result.data);
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
