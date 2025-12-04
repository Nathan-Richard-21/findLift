import api from './api';

export const bookingsService = {
  // Get user's bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/mine');
    console.log('User bookings response:', response.data);
    const bookings = response.data.data?.bookings || response.data.data || response.data || [];
    console.log('Parsed bookings:', bookings);
    
    // Transform backend field names to frontend field names
    return bookings.map(booking => ({
      ...booking,
      // Preserve total_amount for payment calculations
      total_amount: booking.total_amount,
      // Map ride_offer_id to ride_offer for consistency
      ride_offer: booking.ride_offer_id || booking.ride_offer,
      // Map driver info properly
      ride_offer: {
        ...booking.ride_offer_id,
        driver: booking.ride_offer_id?.driver_user_id
      },
      // Ensure proper field mapping for consistent display
      passenger_name: booking.rider_user_id ? `${booking.rider_user_id.first_name} ${booking.rider_user_id.last_name}` : 'Unknown',
      passenger_phone: booking.rider_user_id?.phone || 'N/A',
      total_price: booking.total_amount || (booking.seats_booked * (booking.ride_offer_id?.price_per_seat || 0))
    }));
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id) => {
    const response = await api.patch(`/bookings/${id}`, { 
      status: 'cancelled',
      cancellation_reason: 'Cancelled by user'
    });
    return response.data;
  },

  // Get driver's bookings
  getDriverBookings: async () => {
    const response = await api.get('/bookings/driver');
    console.log('Driver bookings response:', response.data);
    const bookings = response.data.data?.bookings || response.data.data || response.data || [];
    console.log('Parsed bookings:', bookings);
    
    // Transform backend field names to frontend field names
    return bookings.map(booking => ({
      ...booking,
      passenger_name: booking.rider ? `${booking.rider.first_name} ${booking.rider.last_name}` : 'Unknown',
      passenger_phone: booking.rider?.phone || 'N/A',
      total_price: booking.seats_booked * (booking.ride_offer?.price_per_seat || 0)
    }));
  },

  // Confirm booking
  confirmBooking: async (id) => {
    return this.updateBookingStatus(id, 'confirmed');
  },

  // Reject booking
  rejectBooking: async (id) => {
    return this.updateBookingStatus(id, 'cancelled');
  }
};