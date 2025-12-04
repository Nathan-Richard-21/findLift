import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { paymentService } from '../services/paymentService';

const PaymentButton = ({ booking, onPaymentInitiated, disabled = false }) => {
  const navigate = useNavigate();
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [error, setError] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    loadPaymentConfig();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      const config = await paymentService.getConfig();
      setPaymentConfig(config.data);
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
  };

  const handlePayNow = async () => {
    if (!booking || !booking._id) {
      setError('Invalid booking details');
      return;
    }

    setIsCreatingLink(true);
    setError('');

    try {
      const response = await paymentService.createPaymentLink(booking._id);

      if (response.success) {
        // Notify parent component
        if (onPaymentInitiated) {
          onPaymentInitiated(response.data);
        }

        // Redirect to Yoco payment page
        window.location.href = response.data.payment_link_url;
      } else {
        setError(response.error || 'Failed to create payment link');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Calculate amounts
  const driverPrice = booking?.total_amount || 0;
  const riderAmount = paymentConfig 
    ? paymentService.calculateRiderAmount(driverPrice, paymentConfig.platform_commission)
    : 0;
  const commissionPercent = paymentConfig 
    ? Math.round(paymentConfig.platform_commission * 100)
    : 15;

  return (
    <div className="space-y-4">
      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">How Payment Works</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>You pay only {commissionPercent}% of the ride price</li>
              <li>The driver receives the full amount at pickup</li>
              <li>Your payment secures your booking</li>
              <li>Secure payment powered by Yoco</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Driver's price:</span>
            <span className="font-medium">{paymentService.formatPrice(driverPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your payment ({commissionPercent}%):</span>
            <span className="font-medium text-green-600">{paymentService.formatPrice(riderAmount)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining (pay at pickup):</span>
              <span className="font-semibold">{paymentService.formatPrice(driverPrice - riderAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayNow}
        disabled={disabled || isCreatingLink || !paymentConfig}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
      >
        {isCreatingLink ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FaCreditCard />
            <span>Pay {paymentService.formatPrice(riderAmount)} Now</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By clicking "Pay Now", you'll be redirected to Yoco's secure payment page
      </p>
    </div>
  );
};

export default PaymentButton;
