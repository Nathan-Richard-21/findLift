import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authService } from '../services/api';
import { FaUserShield, FaSpinner, FaLock } from 'react-icons/fa';

const ADMIN_PASSWORD = 'FindLift2025'; // Single password for admin settings access

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, refetch, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsPasswordVerified(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleMakeAdmin = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to perform this action.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.makeAdmin();
      
      if (response.success) {
        setMessage('✓ Admin privileges granted! Refreshing your session...');
        
        // Wait a moment to show the success message
        setTimeout(async () => {
          // Refetch user data to get updated role
          await refetch();
          
          // Redirect to admin dashboard
          setTimeout(() => {
            navigate('/admin/kyc');
          }, 1000);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to grant admin access:', err);
      setError(err.response?.data?.error || 'Failed to grant admin access. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Password protection screen
  if (!isPasswordVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FaLock className="text-3xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Settings Access
            </h1>
            <p className="text-gray-600">
              Enter the password to continue
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  passwordError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Access Admin Settings
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You must be logged in to access admin settings.
            </p>
            <button
              onClick={() => navigate('/auth?mode=login&redirect=admin-settings')}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <FaUserShield className="text-4xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Settings
            </h1>
            <p className="text-gray-600">
              Development utility to grant admin privileges
            </p>
          </div>

          {/* Current User Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Current User</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Role:</span>
                <span className={`font-medium px-2 py-1 rounded ${
                  user?.role === 'admin' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {user?.role || 'rider'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Warning Message */}
          {user?.role !== 'admin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Development Tool</p>
                  <p>
                    This is a development utility to grant yourself admin privileges. 
                    In production, admin access should be managed through proper authentication 
                    and authorization systems.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {user?.role === 'admin' ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="text-green-600 text-3xl mb-2">✓</div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  You already have admin access!
                </h3>
                <p className="text-green-700 text-sm">
                  You can now access the admin dashboard and manage verifications and rides.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/kyc')}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Admin KYC Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin/rides')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Rides Management
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleMakeAdmin}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaUserShield className="mr-2" />
                  Grant Admin Access
                </>
              )}
            </button>
          )}

          {/* Additional Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure you're logged in before granting admin access</li>
            <li>• After granting access, your session will be refreshed automatically</li>
            <li>• You'll be redirected to the admin dashboard after a few seconds</li>
            <li>• If something goes wrong, try logging out and back in</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
