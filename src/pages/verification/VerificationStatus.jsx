import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaClock, FaCheck, FaTimes, FaRedo, FaQuestionCircle, FaSpinner } from 'react-icons/fa';
import { kycService } from '../../services/kycService';

const VerificationStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [status, setStatus] = useState(location.state?.status || 'under_review');
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadStatus();
      // Poll for status updates every 5 seconds
      const interval = setInterval(loadStatus, 5000);
      return () => clearInterval(interval);
    } else {
      setError('No session found');
      setIsLoading(false);
    }
  }, [sessionId]);

  const loadStatus = async () => {
    try {
      const statusData = await kycService.getStatus(sessionId);
      setStatus(statusData.status);
      setSessionData(statusData);
      setError(null);
    } catch (error) {
      console.error('Failed to load status:', error);
      setError('Failed to load verification status');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-red-500 text-3xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/verify')}
              className="btn-primary"
            >
              Start New Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (status) {
      case 'pending':
      case 'under_review':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-2xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">We're reviewing your information</h1>
            <p className="text-gray-600 mb-8">
              This typically takes a short time. You'll get a notification when it's done. 
              You can continue browsing, but you can't offer rides until you're verified.
            </p>
            <div className="mb-6 text-sm text-gray-500">
              <p>Submitted: {sessionData?.submittedAt ? new Date(sessionData.submittedAt).toLocaleString() : 'Recently'}</p>
            </div>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Home
            </button>
          </div>
        );

      case 'approved':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-2xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">You're verified</h1>
            <p className="text-gray-600 mb-8">
              Thanks! You can now offer rides on Find Lift.
            </p>
            <button onClick={() => navigate('/offer')} className="btn-primary">
              Post a ride
            </button>
          </div>
        );

      case 'rejected':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-2xl text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">We couldn't verify you</h1>
            <p className="text-gray-600 mb-4">
              {sessionData?.rejectionReason || 'Document quality insufficient or information mismatch'}
            </p>
            {sessionData?.adminNotes && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-700"><strong>Admin Notes:</strong> {sessionData.adminNotes}</p>
              </div>
            )}
            {sessionData?.reviewedAt && (
              <p className="text-sm text-gray-500 mb-8">
                Reviewed on {new Date(sessionData.reviewedAt).toLocaleDateString()}
              </p>
            )}
            <div className="flex space-x-4 justify-center">
              <button onClick={() => navigate('/verify')} className="btn-primary flex items-center">
                <FaRedo className="mr-2" />
                Try again
              </button>
              <button onClick={() => navigate('/support')} className="btn-secondary flex items-center">
                <FaQuestionCircle className="mr-2" />
                Contact support
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p>Unknown status</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default VerificationStatus;