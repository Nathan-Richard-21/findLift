import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaIdCard, FaPassport, FaCar } from 'react-icons/fa';

const ChooseDocument = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');

  const documentTypes = [
    {
      id: 'sa_id',
      label: 'South African ID',
      icon: FaIdCard,
      description: 'Government-issued South African identity document'
    },
    {
      id: 'passport',
      label: 'Passport',
      icon: FaPassport,
      description: 'Valid passport'
    },
    {
      id: 'drivers_license',
      label: "Driver's License",
      icon: FaCar,
      description: 'Driver\'s license with photo'
    }
  ];

  const handleContinue = () => {
    if (selected) {
      navigate(`/verify/capture?docType=${selected}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-2">Choose your document type</h1>
          <p className="text-gray-600 mb-6">
            This will be used to verify your identity. Make sure your face is visible on the document.
          </p>

          <div className="space-y-4">
            {documentTypes.map((doc) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                    selected === doc.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="text-2xl text-green-600 mr-4" />
                    <div>
                      <h3 className="font-semibold">{doc.label}</h3>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selected}
            className="btn-primary w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseDocument;