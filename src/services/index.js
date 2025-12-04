// Export individual services
export { authService } from './api';
export { ridesService } from './ridesService';
export { usersService } from './usersService';
export { vehiclesService } from './vehiclesService';
export { bookingsService } from './bookingsService';
export { kycService } from './kycService';
export { paymentService } from './paymentService';

// Legacy services - keeping for backward compatibility
import api from './api';

// Driver Profile service
export const driverProfileService = {
  getProfile: () => api.get('/driver-profile'),
  createProfile: (profileData) => api.post('/driver-profile', profileData),
};

// Reviews service
export const reviewsService = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
};

// Support service
export const supportService = {
  getTickets: () => api.get('/support'),
  createTicket: (ticketData) => api.post('/support', ticketData),
};

// Admin service
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
};