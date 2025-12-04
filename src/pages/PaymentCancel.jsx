import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <FaTimesCircle className="text-4xl text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your booking request is still pending. To confirm your ride, you'll need to complete the payment.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/bookings')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Find Another Ride
          </button>
          <button
            onClick={() => navigate('/support')}
            className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
          >
            Need help? Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
