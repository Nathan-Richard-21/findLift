import React, { useState } from 'react';
import { FaEnvelope, FaExclamationTriangle, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EmailVerificationBanner = ({ user, onVerificationSent }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Only show for drivers who haven't verified their email
  if (!user || user.role !== 'driver' || user.isEmailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setSending(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        if (onVerificationSent) {
          onVerificationSent();
        }
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-amber-600 text-lg" />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-amber-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Please verify your email address to access all driver features and start offering rides.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {sent ? (
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <FaCheckCircle className="mr-2" />
              <span className="text-sm font-medium">Email Sent!</span>
            </div>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <FaEnvelope className="mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {sent && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
          <strong>Check your inbox!</strong> We've sent a verification link to <span className="font-medium">{user.email}</span>. 
          The link expires in 24 hours.
        </div>
      )}
    </div>
  );
};

export default EmailVerificationBanner;
