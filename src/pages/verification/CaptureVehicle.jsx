import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { kycService } from '../../services/kycService';
import VehiclePhotoCapture from '../../components/VehiclePhotoCapture';
import { FaCamera, FaCheck, FaSpinner } from 'react-icons/fa';

const CaptureVehicle = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: ''
  });

  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });

  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });

  const [currentAngle, setCurrentAngle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const angles = [
    { id: 'front', label: 'Front View', required: true },
    { id: 'back', label: 'Back View (License Plate)', required: true },
    { id: 'left', label: 'Left Side View', required: true },
    { id: 'right', label: 'Right Side View', required: true }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (angle, file, preview) => {
    setPhotos(prev => ({ ...prev, [angle]: file }));
    setPreviews(prev => ({ ...prev, [angle]: preview }));
    setCurrentAngle(null);
  };

  const canProceed = () => {
    const allPhotos = angles.every(angle => photos[angle.id]);
    const allFields = vehicleData.make && vehicleData.model && vehicleData.year && 
                      vehicleData.color && vehicleData.licensePlate;
    return allPhotos && allFields;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      setError('Please complete all vehicle information and capture all required photos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Convert all photos to base64
      const frontImage = await convertToBase64(photos.front);
      const backImage = await convertToBase64(photos.back);
      const leftImage = await convertToBase64(photos.left);
      const rightImage = await convertToBase64(photos.right);

      // Update verification with vehicle data
      await kycService.updateVerification(sessionId, {
        vehicle: {
          frontImage,
          backImage,
          leftImage,
          rightImage,
          make: vehicleData.make,
          model: vehicleData.model,
          year: parseInt(vehicleData.year),
          color: vehicleData.color,
          licensePlate: vehicleData.licensePlate.toUpperCase()
        }
      });

      // Navigate to review page
      navigate(`/verify/review?sessionId=${sessionId}`);
    } catch (err) {
      console.error('Vehicle submission error:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId) {
    navigate('/verify');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Information</h2>
          <p className="text-gray-600 mb-6">
            Provide your vehicle details and capture photos from all 4 angles
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Vehicle Details Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={vehicleData.make}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., Toyota"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={vehicleData.model}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., Corolla"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={vehicleData.year}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., 2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={vehicleData.color}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., Silver"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate Number *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={vehicleData.licensePlate}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="e.g., ABC123GP"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must match the license plate visible in your back view photo
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Photos */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Vehicle Photos</h3>
            <p className="text-sm text-gray-600 mb-4">
              Capture photos of your vehicle from all 4 angles. Each photo will be taken automatically after 5 seconds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {angles.map((angle) => (
                <div key={angle.id} className="border-2 border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{angle.label}</h4>
                      {angle.required && <span className="text-xs text-red-600">Required</span>}
                    </div>
                    {photos[angle.id] && (
                      <FaCheck className="text-green-600 text-xl" />
                    )}
                  </div>

                  {previews[angle.id] ? (
                    <div className="space-y-2">
                      <img
                        src={previews[angle.id]}
                        alt={`Vehicle ${angle.label}`}
                        className="w-full h-40 object-cover rounded border"
                      />
                      <button
                        onClick={() => setCurrentAngle(angle.id)}
                        className="text-sm text-blue-600 hover:underline w-full text-center"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCurrentAngle(angle.id)}
                      className="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <FaCamera className="text-3xl text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Capture {angle.label}</span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="mr-2 animate-spin inline" />
                Saving Vehicle Information...
              </>
            ) : (
              'Continue to Review'
            )}
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {currentAngle && (
        <VehiclePhotoCapture
          angle={currentAngle}
          onCapture={(file, preview) => handlePhotoCapture(currentAngle, file, preview)}
          onClose={() => setCurrentAngle(null)}
        />
      )}
    </div>
  );
};

export default CaptureVehicle;
