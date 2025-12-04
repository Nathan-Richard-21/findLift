import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [action, setAction] = useState(null); // 'success' or 'cancel'

  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (action && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    if (action && countdown === 0) {
      if (action === 'success') {
        navigate(`/payment/success?payment_id=${paymentId}`);
      } else {
        navigate(`/payment/cancel?payment_id=${paymentId}`);
      }
    }
  }, [action, countdown, navigate, paymentId]);

  const handleSuccess = () => {
    setAction('success');
  };

  const handleCancel = () => {
    setAction('cancel');
  };

  if (action) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {action === 'success' ? (
            <>
              <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                Redirecting in {countdown} seconds...
              </p>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-600 text-6xl mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-600 mb-4">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mock Payment Gateway
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            (Testing Mode - No Real Payment)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Amount:</span>
            <span className="text-2xl font-bold text-gray-900">
              R{amount}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-1">Payment ID: {paymentId}</p>
            <p className="text-xs italic">This is a simulated payment for testing purposes</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSuccess}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaCheckCircle />
            Simulate Successful Payment
          </button>
          
          <button
            onClick={handleCancel}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaTimesCircle />
            Simulate Cancelled Payment
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> This is a mock payment page for development testing. 
            In production, users will be redirected to the real Yoco payment gateway.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
