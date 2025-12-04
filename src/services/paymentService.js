import api from './api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */
export const paymentService = {
  /**
   * Get payment configuration (public key, etc.)
   */
  getConfig: async () => {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get payment config:', error);
      throw error;
    }
  },

  /**
   * Create payment link for a booking
   * @param {String} bookingId - Booking ID
   * @returns {Promise<Object>} Payment link details
   */
  createPaymentLink: async (bookingId) => {
    try {
      console.log('💳 Creating payment link for booking:', bookingId);
      
      const response = await api.post('/payments/create-payment-link', {
        booking_id: bookingId
      });
      
      console.log('💳 Payment link response:', response.data);
      return response.data;
    } catch (error) {
      console.error('💳 Failed to create payment link:', error);
      console.error('💳 Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Get payment status
   * @param {String} paymentId - Payment ID
   * @returns {Promise<Object>} Payment status
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  },

  /**
   * Get user's payments
   * @param {Object} params - Query parameters {status, type}
   * @returns {Promise<Object>} List of payments
   */
  getMyPayments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/payments/my-payments${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payments:', error);
      throw error;
    }
  },

  /**
   * Calculate rider payment amount (15% of driver price)
   * @param {Number} driverPrice - Price set by driver
   * @param {Number} commission - Platform commission (default 0.15)
   * @returns {Number} Amount rider needs to pay
   */
  calculateRiderAmount: (driverPrice, commission = 0.15) => {
    return Math.round(driverPrice * commission * 100) / 100;
  },

  /**
   * Format price for display
   * @param {Number} amount - Amount in ZAR
   * @returns {String} Formatted price string
   */
  formatPrice: (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  }
};

export default paymentService;
