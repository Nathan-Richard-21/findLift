import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerificationIntro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-xl font-semibold">Verification</h2>
          <h1 className="text-2xl font-bold mt-4">Verify your identity</h1>
          <p className="text-gray-600 mt-4">
            Due to legal and security requirements, we need to verify your identity before you can offer rides.
          </p>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => navigate('/verify/choose')}
              className="btn-primary"
            >
              Start Verification
            </button>
            <button
              onClick={() => navigate('/support')}
              className="btn-secondary"
            >
              Get Help
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What you'll need:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Government-issued ID (ID card, passport, or driver's license)</li>
              <li>• Good lighting and a clear camera</li>
              <li>• About 5 minutes to complete</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            By continuing, you agree to the processing of your data for verification purposes. Learn more in our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerificationIntro;
