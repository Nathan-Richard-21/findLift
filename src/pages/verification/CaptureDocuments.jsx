import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCamera, FaUpload, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../App';
import { kycService } from '../../services/kycService';
import CameraCapture from '../../components/CameraCapture';
import FileUpload from '../../components/FileUpload';
import LivenessDetection from '../../components/LivenessDetection';

// Helper function to convert base64 to blob URL for preview
const base64ToBlob = (base64String, mimeType = 'image/jpeg') => {
  try {
    const byteCharacters = atob(base64String.split(',')[1] || base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
};

const CaptureDocuments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const docType = searchParams.get('docType') || 'sa_id';
  
  const [sessionId, setSessionId] = useState(null);
  const [selfieCompleted, setSelfieCompleted] = useState(false);
  const [docFrontCompleted, setDocFrontCompleted] = useState(false);
  const [docBackCompleted, setDocBackCompleted] = useState(false);
  const [licenceCompleted, setLicenceCompleted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showLivenessDetection, setShowLivenessDetection] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.firstName + ' ' + user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    address: '',
    idNumber: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseClass: '',
    expiryDate: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize KYC session with personal info
  useEffect(() => {
    const initSession = async () => {
      if (user?._id) {
        try {
          setIsInitializing(true);
          
          // Check if there's an existing session
          const existingSessionId = kycService.getCurrentSessionId();
          if (existingSessionId) {
            try {
              const status = await kycService.getStatus(existingSessionId);
              if (status && status.status === 'pending') {
                setSessionId(existingSessionId);
                
                // Load existing data and images
                const loadedFiles = {};
                
                // Load selfie if exists
                if (status.documents?.selfie?.image) {
                  const preview = base64ToBlob(status.documents.selfie.image);
                  if (preview) {
                    loadedFiles.selfie = { preview };
                    setSelfieCompleted(true);
                  }
                }
                
                // Load ID document front image if exists
                if (status.documents?.idDocument?.frontImage) {
                  const preview = base64ToBlob(status.documents.idDocument.frontImage);
                  if (preview) {
                    loadedFiles.docFront = { preview };
                    setDocFrontCompleted(true);
                  }
                }
                
                // Load ID document back image if exists
                if (status.documents?.idDocument?.backImage) {
                  const preview = base64ToBlob(status.documents.idDocument.backImage);
                  if (preview) {
                    loadedFiles.docBack = { preview };
                    setDocBackCompleted(true);
                  }
                }
                
                // Load driver license if exists
                if (status.documents?.driverLicense?.frontImage) {
                  const preview = base64ToBlob(status.documents.driverLicense.frontImage);
                  if (preview) {
                    loadedFiles.licence = { preview };
                    setLicenceCompleted(true);
                  }
                }
                
                setUploadedFiles(loadedFiles);
                setIsInitializing(false);
                return;
              }
            } catch (error) {
              // Session might be invalid, create a new one
              kycService.clearCurrentSession();
            }
          }

          // Create new session with personal info
          const requiredPersonalInfo = {
            fullName: personalInfo.fullName,
            email: personalInfo.email,
            phoneNumber: personalInfo.phoneNumber,
            address: personalInfo.address || 'TBD',
            idNumber: personalInfo.idNumber || 'TBD',
            dateOfBirth: personalInfo.dateOfBirth || new Date().toISOString()
          };

          const session = await kycService.start(requiredPersonalInfo);
          setSessionId(session.sessionId);
        } catch (error) {
          console.error('Failed to initialize KYC session:', error);
          // Silently handle the error if verification already exists
          // User can continue with existing session
        } finally {
          setIsInitializing(false);
        }
      }
    };
    
    initSession();
  }, [user]);

  const handleLivenessComplete = async (file, preview, livenessData) => {
    if (!sessionId) return;
    
    setIsUploading(true);
    try {
      await kycService.uploadSelfie(sessionId, file, livenessData);
      
      setUploadedFiles(prev => ({ ...prev, selfie: { file, preview } }));
      setSelfieCompleted(true);
      setShowLivenessDetection(false);
    } catch (error) {
      console.error('Failed to upload selfie:', error);
      alert('Failed to save selfie. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentCapture = async (type, file, preview) => {
    if (!sessionId) return;
    
    setIsUploading(true);
    try {
      const metadata = {
        documentType: docType,
        captureMethod: 'camera',
        ...personalInfo
      };

      // Map the type to backend expected format
      let uploadType = type;
      if (type === 'docFront') uploadType = 'id_front';
      if (type === 'docBack') uploadType = 'id_back';
      if (type === 'licence') uploadType = 'driver_license_front';
      
      await kycService.uploadDocument(sessionId, uploadType, file, metadata);
      
      setUploadedFiles(prev => ({ ...prev, [type]: { file, preview } }));
      
      if (type === 'docFront') setDocFrontCompleted(true);
      if (type === 'docBack') setDocBackCompleted(true);
      if (type === 'licence') setLicenceCompleted(true);
      
      setShowCameraCapture(null);
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      alert(`Failed to save document. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploadComplete = async (type, file, preview) => {
    if (!sessionId) return;
    
    setIsUploading(true);
    try {
      const metadata = {
        documentType: docType,
        captureMethod: 'upload',
        ...personalInfo
      };

      // Map the type to backend expected format
      let uploadType = type;
      if (type === 'docFront') uploadType = 'id_front';
      if (type === 'docBack') uploadType = 'id_back';
      if (type === 'licence') uploadType = 'driver_license_front';
      
      await kycService.uploadDocument(sessionId, uploadType, file, metadata);
      
      setUploadedFiles(prev => ({ ...prev, [type]: { file, preview } }));
      
      if (type === 'docFront') setDocFrontCompleted(true);
      if (type === 'docBack') setDocBackCompleted(true);
      if (type === 'licence') setLicenceCompleted(true);
      
      setShowFileUpload(null);
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      alert(`Failed to save document. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate ID number (must be 13 digits)
  const validateIdNumber = (idNumber) => {
    if (!idNumber) return true; // Optional during typing
    const cleanId = idNumber.replace(/\D/g, '');
    return /^\d{13}$/.test(cleanId);
  };

  // Validate license number (must be numeric)
  const validateLicenseNumber = (licenseNumber) => {
    if (!licenseNumber) return true; // Optional during typing
    // SA driving license numbers are typically numeric
    return /^\d+$/.test(licenseNumber.replace(/\s/g, ''));
  };

  const canProceed = () => {
    const basicRequirements = selfieCompleted && docFrontCompleted && 
                             (docType === 'passport' || docBackCompleted);
    
    // Validate ID number is 13 digits
    if (personalInfo.idNumber && !validateIdNumber(personalInfo.idNumber)) {
      return false;
    }
    
    if (docType === 'drivers_license') {
      // Validate license number is numeric
      if (!personalInfo.licenseNumber || !validateLicenseNumber(personalInfo.licenseNumber)) {
        return false;
      }
      return basicRequirements && licenceCompleted && 
             personalInfo.licenseNumber && personalInfo.expiryDate;
    }
    
    return basicRequirements;
  };

  const handleNext = async () => {
    if (!canProceed() || !sessionId) return;
    
    try {
      // Navigate to vehicle capture page
      navigate(`/verify/vehicle?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Failed to proceed to vehicle capture:', error);
      alert('Failed to proceed. Please try again.');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing verification session...</p>
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

        <div className="bg-white rounded-2xl shadow p-8 space-y-8">
          {/* Selfie Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Selfie (Live)</h3>
            <p className="text-gray-600 mb-4">
              We'll ask you to blink and turn your head to prove you're a real person.
            </p>
            
            {selfieCompleted && uploadedFiles.selfie ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img 
                    src={uploadedFiles.selfie.preview} 
                    alt="Captured selfie" 
                    className="w-24 h-24 object-cover rounded-full border-2 border-green-500"
                  />
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <FaCheck className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <p className="text-green-700 font-medium">✓ Liveness verification completed</p>
                  <button
                    onClick={() => setShowLivenessDetection(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Retake selfie
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLivenessDetection(true)}
                disabled={isUploading}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  isUploading
                    ? 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {isUploading ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : (
                  <FaCamera className="mr-2" />
                )}
                {isUploading ? 'Processing...' : 'Take a live selfie'}
              </button>
            )}
          </div>

          {/* Document Photos */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Identity document</h3>
            <p className="text-gray-600 mb-4">
              Take a clear photo of the front and back of your document.
            </p>
            
            <div className="space-y-4">
              {/* Front Document */}
              <div>
                {docFrontCompleted && uploadedFiles.docFront ? (
                  <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCheck className="mr-3 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Front of Document ✓</p>
                          <p className="text-sm text-green-600">Successfully captured</p>
                        </div>
                      </div>
                      <img 
                        src={uploadedFiles.docFront.preview} 
                        alt="Document front" 
                        className="w-12 h-8 object-cover rounded border"
                      />
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => setShowCameraCapture('docFront')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Retake with camera
                      </button>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => setShowFileUpload('docFront')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Upload new file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Front of Document</p>
                        <p className="text-sm text-gray-600">Take a photo or upload an image</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowCameraCapture('docFront')}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FaCamera className="mr-2" />
                        Camera
                      </button>
                      <button
                        onClick={() => setShowFileUpload('docFront')}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FaUpload className="mr-2" />
                        Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Back Document (if not passport) */}
              {docType !== 'passport' && (
                <div>
                  {docBackCompleted && uploadedFiles.docBack ? (
                    <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaCheck className="mr-3 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700">Back of Document ✓</p>
                            <p className="text-sm text-green-600">Successfully captured</p>
                          </div>
                        </div>
                        <img 
                          src={uploadedFiles.docBack.preview} 
                          alt="Document back" 
                          className="w-12 h-8 object-cover rounded border"
                        />
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => setShowCameraCapture('docBack')}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Retake with camera
                        </button>
                        <span className="text-gray-400">•</span>
                        <button
                          onClick={() => setShowFileUpload('docBack')}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Upload new file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Back of Document</p>
                          <p className="text-sm text-gray-600">Take a photo or upload an image</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowCameraCapture('docBack')}
                          disabled={isUploading}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <FaCamera className="mr-2" />
                          Camera
                        </button>
                        <button
                          onClick={() => setShowFileUpload('docBack')}
                          disabled={isUploading}
                          className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <FaUpload className="mr-2" />
                          Upload
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>Real-time quality hints: No glare • All corners visible • Text readable • Original colors</p>
            </div>
          </div>

          {/* Driver's License - ALWAYS REQUIRED (regardless of ID document type) */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mr-2">REQUIRED</span>
              Driver's Licence
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your driver's licence is required in addition to your ID document. This verifies your authorization to drive.
            </p>

            <div>
                {licenceCompleted && uploadedFiles.licence ? (
                  <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCheck className="mr-3 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Driver's Licence ✓</p>
                          <p className="text-sm text-green-600">Successfully captured</p>
                        </div>
                      </div>
                      <img 
                        src={uploadedFiles.licence.preview} 
                        alt="Driver's licence" 
                        className="w-12 h-8 object-cover rounded border"
                      />
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => setShowCameraCapture('licence')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Retake with camera
                      </button>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => setShowFileUpload('licence')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Upload new file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Front of Driver's Licence</p>
                        <p className="text-sm text-gray-600">This is in addition to your ID document</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowCameraCapture('licence')}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FaCamera className="mr-2" />
                        Camera
                      </button>
                      <button
                        onClick={() => setShowFileUpload('licence')}
                        disabled={isUploading}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <FaUpload className="mr-2" />
                        Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Licence Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={personalInfo.licenseNumber}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      personalInfo.licenseNumber && !validateLicenseNumber(personalInfo.licenseNumber)
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    placeholder="Enter licence number (numbers only)"
                  />
                  {personalInfo.licenseNumber && !validateLicenseNumber(personalInfo.licenseNumber) && (
                    <p className="text-xs text-red-500 mt-1">
                      Licence number must contain only numbers
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Class
                  </label>
                  <select
                    name="licenseClass"
                    value={personalInfo.licenseClass}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">Select license class</option>
                    <option value="B">B - Light motor vehicles</option>
                    <option value="C">C - Heavy motor vehicles</option>
                    <option value="EB">EB - Light motor vehicle with trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={personalInfo.expiryDate}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Number (for verification) *
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={personalInfo.idNumber}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      personalInfo.idNumber && !validateIdNumber(personalInfo.idNumber)
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    placeholder="Enter SA ID number (13 digits)"
                    maxLength="13"
                  />
                  {personalInfo.idNumber && !validateIdNumber(personalInfo.idNumber) ? (
                    <p className="text-xs text-red-500 mt-1">
                      SA ID number must be exactly 13 digits
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      This helps us verify your identity and ensure document authenticity.
                    </p>
                  )}
                </div>
              </div>
            </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isUploading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showLivenessDetection && (
        <LivenessDetection
          onComplete={handleLivenessComplete}
          onClose={() => setShowLivenessDetection(false)}
        />
      )}

      {showCameraCapture && (
        <CameraCapture
          type={showCameraCapture === 'selfie' ? 'selfie' : 'document'}
          onCapture={(file, preview) => handleDocumentCapture(showCameraCapture, file, preview)}
          onClose={() => setShowCameraCapture(null)}
        />
      )}

      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <button
                  onClick={() => setShowFileUpload(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <FileUpload
                type={showFileUpload === 'selfie' ? 'selfie' : 'document'}
                onFileSelect={(file, preview) => handleFileUploadComplete(showFileUpload, file, preview)}
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaptureDocuments;