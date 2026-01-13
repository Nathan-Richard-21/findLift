import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaCheck, FaTimes, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { kycService } from '../../services/kycService';

const AdminKYCReview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [sessionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);
      const data = await kycService.getVerificationDetails(sessionId);
      console.log('Loaded verification payload:', JSON.stringify(data, null, 2));

      // New backend shape returns { verification, driverProfile }
      const verification = data?.verification || data;
      const driverProfile = data?.driverProfile || null;

      console.log('Verification object:', verification);
      console.log('Driver profile:', driverProfile);

      // Check if verification has minimum required structure
      if (!verification || !verification.sessionId) {
        throw new Error('Invalid verification data structure');
      }

      // Attach driverProfile as a fallback source for ID/license display
      const merged = { ...verification, driverProfile };
      setSubmission(merged);
    } catch (error) {
      console.error('Failed to load submission:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.message?.includes('401')) {
        setIsUnauthorized(true);
        setError('You must be logged in as an admin to access this page.');
      } else if (error.response?.status === 403) {
        setIsUnauthorized(true);
        setError('You do not have permission to access this page. Admin access required.');
      } else {
        setError(error.message || 'Failed to load verification details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async () => {
    if (!decision || processing) return;

    // Validate inputs
    if (decision === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    // Validate custom reason if "other" is selected
    if (decision === 'reject' && reason === 'other' && !customReason.trim()) {
      alert('Please specify the reason for rejection.');
      return;
    }

    setProcessing(true);
    try {
      // Use custom reason if "other" is selected
      const finalReason = reason === 'other' ? customReason : reason;
      
      if (decision === 'approve') {
        await kycService.approve(sessionId, adminNotes);
      } else if (decision === 'reject') {
        await kycService.reject(sessionId, finalReason, adminNotes);
      }
      
      alert(`Verification ${decision}d successfully`);
      navigate('/admin/kyc');
    } catch (error) {
      console.error('Decision failed:', error);
      alert('Failed to process decision: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getRiskColor = (flag) => {
    const highRiskFlags = ['face_mismatch', 'document_tampered', 'duplicate_detected'];
    return highRiskFlags.includes(flag) ? 'text-red-600' : 'text-yellow-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading verification details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className={`text-4xl mb-4 ${isUnauthorized ? 'text-yellow-500' : 'text-red-500'}`}>
              {isUnauthorized ? '🔒' : '⚠️'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isUnauthorized ? 'Authentication Required' : (error || 'Verification Not Found')}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'The requested verification could not be found.'}
            </p>
            <div className="space-y-3">
              {isUnauthorized ? (
                <>
                  <button 
                    onClick={() => navigate(`/auth?mode=login&redirect=/admin/kyc/${sessionId}`)} 
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Login as Admin
                  </button>
                  <p className="text-sm text-gray-500">
                    Need admin access? Contact your system administrator.
                  </p>
                </>
              ) : (
                <button onClick={loadSubmission} className="w-full btn-primary">
                  Try Again
                </button>
              )}
              <button 
                onClick={() => navigate('/admin/kyc')} 
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button onClick={() => navigate('/admin/kyc')} className="text-gray-600 hover:text-gray-800">
            ← Back to KYC List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Review Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">User Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {submission.userId?.first_name && submission.userId?.last_name 
                      ? `${submission.userId.first_name} ${submission.userId.last_name}`
                      : submission.personalInfo?.fullName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {submission.personalInfo?.dateOfBirth 
                      ? new Date(submission.personalInfo.dateOfBirth).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-medium">
                    {submission.documents?.idDocument?.documentNumber || 
                     submission.personalInfo?.idNumber || 
                     submission.driverProfile?.id_number || 
                     'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Licence Number</p>
                  <p className="font-medium">
                    {submission.documents?.driverLicense?.licenseNumber || 
                     submission.personalInfo?.licenseNumber || 
                     submission.driverProfile?.driving_license_no || 
                     'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Document Type</p>
                  <p className="font-medium">
                    {submission.documents?.idDocument?.type === 'sa_id' ? 'SA ID Book/Card' :
                     submission.documents?.idDocument?.type === 'passport' ? 'Passport' :
                     submission.documents?.idDocument?.type === 'drivers_license' ? 'Driver\'s License' :
                     submission.documents?.idDocument?.type || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License Class</p>
                  <p className="font-medium">
                    {submission.documents?.driverLicense?.licenseClass || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {submission.userId?.email || submission.personalInfo?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">
                    {submission.userId?.phone || submission.personalInfo?.phoneNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Images */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Document Images</h2>
              
              {/* Check if any images exist */}
              {(!submission.documents?.selfie?.image && 
                !submission.documents?.idDocument?.frontImage && 
                !submission.documents?.idDocument?.backImage && 
                !submission.documents?.driverLicense?.frontImage) ? (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                  <div className="text-yellow-600 text-4xl mb-3">📸</div>
                  <h3 className="font-semibold text-yellow-900 mb-2">No Images Found</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    This verification was submitted without document images. 
                    The driver may not have completed the full verification flow.
                  </p>
                  <div className="bg-white rounded-lg p-4 text-left">
                    <p className="text-xs text-gray-600 mb-2"><strong>Possible reasons:</strong></p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Verification process was interrupted</li>
                      <li>• Camera permissions were not granted</li>
                      <li>• Document upload failed</li>
                      <li>• Test/incomplete submission</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {submission.documents?.selfie?.image && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Live Selfie</p>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={submission.documents.selfie.image} 
                            alt="Selfie" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(submission.documents.selfie.image, '_blank')}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {submission.documents?.idDocument?.frontImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Document Front</p>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={submission.documents.idDocument.frontImage} 
                            alt="ID Front" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(submission.documents.idDocument.frontImage, '_blank')}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {submission.documents?.idDocument?.backImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Document Back</p>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={submission.documents.idDocument.backImage} 
                            alt="ID Back" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(submission.documents.idDocument.backImage, '_blank')}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {submission.documents?.driverLicense?.frontImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Driver License</p>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={submission.documents.driverLicense.frontImage} 
                            alt="License" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(submission.documents.driverLicense.frontImage, '_blank')}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Click on images to view full size
                  </p>
                </>
              )}
            </div>

            {/* Vehicle Photos Section */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaIdCard className="mr-2 text-blue-600" />
                Vehicle Information
              </h2>
              
              {submission.documents?.vehicle ? (
                <>
                  {/* Vehicle Details */}
                  {(submission.documents.vehicle.make || submission.documents.vehicle.model) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {submission.documents.vehicle.make && (
                          <div>
                            <p className="text-gray-600">Make</p>
                            <p className="font-medium">{submission.documents.vehicle.make}</p>
                          </div>
                        )}
                        {submission.documents.vehicle.model && (
                          <div>
                            <p className="text-gray-600">Model</p>
                            <p className="font-medium">{submission.documents.vehicle.model}</p>
                          </div>
                        )}
                        {submission.documents.vehicle.year && (
                          <div>
                            <p className="text-gray-600">Year</p>
                            <p className="font-medium">{submission.documents.vehicle.year}</p>
                          </div>
                        )}
                        {submission.documents.vehicle.color && (
                          <div>
                            <p className="text-gray-600">Color</p>
                            <p className="font-medium">{submission.documents.vehicle.color}</p>
                          </div>
                        )}
                        {submission.documents.vehicle.licensePlate && (
                          <div>
                            <p className="text-gray-600">License Plate</p>
                            <p className="font-medium">{submission.documents.vehicle.licensePlate}</p>
                          </div>
                        )}
                        {submission.documents.vehicle.licenseDiskExpiryDate && (
                          <div>
                            <p className="text-gray-600">License Disk Expiry</p>
                            <p className="font-medium">
                              {new Date(submission.documents.vehicle.licenseDiskExpiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Vehicle Photos */}
                  {(submission.documents.vehicle.frontImage || 
                    submission.documents.vehicle.backImage || 
                    submission.documents.vehicle.leftImage || 
                    submission.documents.vehicle.rightImage ||
                    submission.documents.vehicle.licenseDiskImage) ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {submission.documents.vehicle.frontImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Front View</p>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={submission.documents.vehicle.frontImage} 
                              alt="Vehicle Front" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(submission.documents.vehicle.frontImage, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {submission.documents.vehicle.backImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Back View</p>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={submission.documents.vehicle.backImage} 
                              alt="Vehicle Back" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(submission.documents.vehicle.backImage, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {submission.documents.vehicle.leftImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Left Side</p>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={submission.documents.vehicle.leftImage} 
                              alt="Vehicle Left" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(submission.documents.vehicle.leftImage, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {submission.documents.vehicle.rightImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Right Side</p>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={submission.documents.vehicle.rightImage} 
                              alt="Vehicle Right" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(submission.documents.vehicle.rightImage, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {submission.documents.vehicle.licenseDiskImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">License Disk</p>
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={submission.documents.vehicle.licenseDiskImage} 
                              alt="License Disk" 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(submission.documents.vehicle.licenseDiskImage, '_blank')}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Error</text></svg>';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Click on images to view full size
                    </p>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-700 text-sm">⚠️ No vehicle photos were uploaded during verification</p>
                  </div>
                )}
              </>
              ) : (
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">ℹ️ Vehicle information was not provided during this verification</p>
                </div>
              )}
            </div>

            {/* Scores & Analysis */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Verification Details</h2>
              <div className="space-y-4">
                {/* Liveness Detection */}
                {submission.documents?.selfie?.livenessScore !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Liveness Score</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${submission.documents.selfie.livenessScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{(submission.documents.selfie.livenessScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
                
                {/* Liveness Checks */}
                {submission.documents?.selfie?.livenessData && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Liveness Checks:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        {submission.documents.selfie.livenessData.blinkDetected ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaTimes className="text-red-600 mr-2" />
                        }
                        <span>Blink Detected</span>
                      </div>
                      <div className="flex items-center">
                        {submission.documents.selfie.livenessData.headTurnLeft ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaTimes className="text-red-600 mr-2" />
                        }
                        <span>Head Turn Left</span>
                      </div>
                      <div className="flex items-center">
                        {submission.documents.selfie.livenessData.headTurnRight ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaTimes className="text-red-600 mr-2" />
                        }
                        <span>Head Turn Right</span>
                      </div>
                      <div className="flex items-center">
                        {submission.documents.selfie.livenessData.smileDetected ? 
                          <FaCheck className="text-green-600 mr-2" /> : 
                          <FaTimes className="text-red-600 mr-2" />
                        }
                        <span>Smile Detected</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Quality Scores */}
                {submission.metadata?.qualityScores && (
                  <>
                    {submission.metadata.qualityScores.documentClarity !== undefined && (
                      <div className="flex justify-between items-center">
                        <span>Document Clarity</span>
                        <span className="font-medium">{(submission.metadata.qualityScores.documentClarity * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {submission.metadata.qualityScores.faceMatch !== undefined && (
                      <div className="flex justify-between items-center">
                        <span>Face Match</span>
                        <span className="font-medium">{(submission.metadata.qualityScores.faceMatch * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Submission Info */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Submission Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{submission.verification?.status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted At</p>
                  <p className="font-medium">
                    {submission.verification?.submittedAt 
                      ? new Date(submission.verification.submittedAt).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                {submission.verification?.reviewedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Reviewed At</p>
                    <p className="font-medium">
                      {new Date(submission.verification.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Make Decision</h2>
              
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setDecision('approve')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                    decision === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaCheck className="text-green-600 mr-3" />
                    <div>
                      <p className="font-semibold">Approve</p>
                      <p className="text-sm text-gray-600">Verification passed</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDecision('reject')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                    decision === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaTimes className="text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold">Reject</p>
                      <p className="text-sm text-gray-600">Verification failed</p>
                    </div>
                  </div>
                </button>
              </div>

              {decision === 'reject' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">Select reason...</option>
                      <option value="document_unreadable">Document unreadable</option>
                      <option value="face_mismatch">Face mismatch</option>
                      <option value="expired_document">Expired document</option>
                      <option value="suspected_fraud">Suspected fraud</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {reason === 'other' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specify Rejection Reason *
                      </label>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                        rows="3"
                        className="input-field w-full resize-none"
                        maxLength="500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {customReason.length}/500 characters
                      </p>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleDecision}
                disabled={!decision || (decision === 'reject' && (!reason || (reason === 'other' && !customReason.trim()))) || processing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `${decision.charAt(0).toUpperCase() + decision.slice(1)} Verification`}
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Audit Trail:</strong> All decisions are logged with timestamps and reviewer information for compliance purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminKYCReview;