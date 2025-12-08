import api from './api';

export const reviewsService = {
  // Create a review for a completed booking
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a specific user (as reviewee)
  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  // Check if user has already reviewed a booking
  checkReviewExists: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}/exists`);
    return response.data;
  },

  // Get review for a specific booking
  getBookingReview: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  }
};

export default reviewsService;
