import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUser, FaIdCard, FaCheck, FaSpinner } from 'react-icons/fa';
import { kycService } from '../../services/kycService';

// Helper function to ensure image has proper data URI format
const ensureDataUri = (imageData) => {
  if (!imageData) return null;
  // If it already starts with data:, return as is
  if (imageData.startsWith('data:')) return imageData;
  // Otherwise, add the data URI prefix
  return `data:image/jpeg;base64,${imageData}`;
};

const ReviewConsent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [consented, setConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else {
      setError('No session found. Please start verification again.');
      setIsLoading(false);
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const data = await kycService.getStatus(sessionId);
      setSessionData(data);
    } catch (error) {
      console.error('Failed to load session data:', error);
      setError('Failed to load verification data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!consented || !sessionId) return;
    
    // MANDATORY: Check for ALL required documents
    const hasSelfie = sessionData?.documents?.selfie?.image;
    const hasIdFront = sessionData?.documents?.idDocument?.frontImage;
    const hasDriverLicense = sessionData?.documents?.driverLicense?.frontImage;
    const hasVehicle = sessionData?.documents?.vehicle?.frontImage;
    
    if (!hasSelfie || !hasIdFront || !hasDriverLicense || !hasVehicle) {
      const missing = [];
      if (!hasSelfie) missing.push('Live Selfie');
      if (!hasIdFront) missing.push('ID Document');
      if (!hasDriverLicense) missing.push('Driver License');
      if (!hasVehicle) missing.push('Vehicle Photos');
      
      alert(`⚠️ Missing Required Documents\n\nThe following documents are mandatory for driver verification:\n• ${missing.join('\n• ')}\n\nPlease go back and complete all required steps.`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await kycService.submit(sessionId);
      
      // Navigate to status page with session ID
      navigate(`/verify/status?sessionId=${sessionId}`, { 
        state: { status: result.status } 
      });
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading verification data...</p>
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
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Review & Consent</h1>
          
          {/* Preview Section */}
          <div className="space-y-6 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Document previews</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Selfie Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {sessionData?.documents?.selfie?.image ? (
                    <img 
                      src={ensureDataUri(sessionData.documents.selfie.image)}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load selfie image');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FaUser className="text-2xl text-gray-400" />
                      <span className="text-xs text-gray-500 mt-2">No Selfie</span>
                    </div>
                  )}
                </div>
                
                {/* Document Front Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {sessionData?.documents?.idDocument?.frontImage ? (
                    <img 
                      src={ensureDataUri(sessionData.documents.idDocument.frontImage)}
                      alt="Document front"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load ID front image');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FaIdCard className="text-2xl text-gray-400" />
                      <span className="text-xs text-gray-500 mt-2">No Front</span>
                    </div>
                  )}
                </div>
                
                {/* Document Back Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {sessionData?.documents?.idDocument?.backImage ? (
                    <img 
                      src={ensureDataUri(sessionData.documents.idDocument.backImage)}
                      alt="Document back"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load ID back image');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : sessionData?.documents?.idDocument?.type !== 'passport' ? (
                    <div className="flex flex-col items-center justify-center">
                      <FaIdCard className="text-2xl text-gray-400" />
                      <span className="text-xs text-gray-500 mt-2">No Back</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs text-gray-500">Not required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Information Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Type:</span>
                  <span className="capitalize">
                    {sessionData?.documents?.idDocument?.type?.replace('_', ' ') || 'SA ID'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-mono text-xs">
                    {sessionId?.slice(-8) || 'Unknown'}
                  </span>
                </div>
                {sessionData?.documents?.driverLicense?.licenseNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Licence Number:</span>
                    <span>****{sessionData.documents.driverLicense.licenseNumber.slice(-4)}</span>
                  </div>
                )}
                {sessionData?.documents?.driverLicense?.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span>{sessionData.documents.driverLicense.expiryDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Selfie:</span>
                  <span className={sessionData?.documents?.selfie?.image ? 'text-green-600' : 'text-red-600'}>
                    {sessionData?.documents?.selfie?.image ? '✓ Uploaded' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Front:</span>
                  <span className={sessionData?.documents?.idDocument?.frontImage ? 'text-green-600' : 'text-red-600'}>
                    {sessionData?.documents?.idDocument?.frontImage ? '✓ Uploaded' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Back:</span>
                  <span className={sessionData?.documents?.idDocument?.backImage ? 'text-green-600' : 'text-red-600'}>
                    {sessionData?.documents?.idDocument?.backImage ? '✓ Uploaded' : '✗ Missing'}
                  </span>
                </div>
                {sessionData?.documents?.driverLicense && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver License:</span>
                    <span className={sessionData?.documents?.driverLicense?.frontImage ? 'text-green-600' : 'text-red-600'}>
                      {sessionData?.documents?.driverLicense?.frontImage ? '✓ Uploaded' : '✗ Missing'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Missing Documents Warning */}
          {(!sessionData?.documents?.selfie?.image || !sessionData?.documents?.driverLicense?.frontImage) && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-red-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Required Documents Missing</h3>
                  <p className="text-sm text-red-700 mb-2">
                    The following documents are MANDATORY for driver verification:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {!sessionData?.documents?.selfie?.image && (
                      <li>• <strong>Live Selfie</strong> - Required for identity verification</li>
                    )}
                    {!sessionData?.documents?.driverLicense?.frontImage && (
                      <li>• <strong>Driver License</strong> - Required to verify driving authorization</li>
                    )}
                  </ul>
                  <p className="text-sm text-red-700 mt-3 font-medium">
                    You cannot proceed without these documents. Please go back and complete all steps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mr-3 mt-1"
              />
              <span className="text-sm">
                I confirm the information is mine, accurate, and I consent to verification.
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!consented || isSubmitting || !sessionData?.documents?.selfie?.image || !sessionData?.documents?.driverLicense?.frontImage}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for verification'}
          </button>
          
          {(!sessionData?.documents?.selfie?.image || !sessionData?.documents?.driverLicense?.frontImage) && (
            <p className="text-sm text-red-600 text-center mt-3">
              ⚠️ Complete all required documents to enable submission
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewConsent;