import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../App';
import { useToast } from '../contexts/ToastContext';
import { bookingsService } from '../services/bookingsService';
import { reviewsService } from '../services/reviewsService';
import PaymentButton from '../components/PaymentButton';
import RatingModal from '../components/RatingModal';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaDollarSign, 
  FaUsers, 
  FaCar,
  FaPhone,
  FaUser,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaSpinner,
  FaTicketAlt,
  FaHourglassHalf,
  FaStar
} from 'react-icons/fa';

const Bookings = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, booking: null });

  // Fetch user's bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: bookingsService.getUserBookings,
    enabled: isAuthenticated && !authLoading
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingsService.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: reviewsService.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setRatingModal({ isOpen: false, booking: null });
      toast.success('Thank you for your rating!');
    },
    onError: (error) => {
      console.error('Failed to submit rating:', error);
      toast.error(error.response?.data?.error || 'Failed to submit rating. Please try again.');
    }
  });

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const handleRateDriver = (booking) => {
    setRatingModal({ isOpen: true, booking });
  };

  const handleSubmitRating = async (ratingData) => {
    if (!ratingModal.booking) return;
    
    const booking = ratingModal.booking;
    const driverId = booking.ride_offer?.driver_user_id?._id || 
                     booking.ride_offer?.driver_user_id ||
                     booking.ride_offer?.driver?._id;

    if (!driverId) {
      toast.error('Driver information not available');
      return;
    }

    createReviewMutation.mutate({
      booking_id: booking._id,
      reviewee_user_id: driverId,
      rating: ratingData.rating,
      comment: ratingData.comment,
      review_type: 'rider_to_driver'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <FaCheck className="text-green-600" />;
      case 'pending':
      case 'requested':
        return <FaClock className="text-yellow-600" />;
      case 'cancelled':
        return <FaTimes className="text-red-600" />;
      case 'completed':
        return <FaTicketAlt className="text-blue-600" />;
      default:
        return <FaSpinner className="text-gray-600" />;
    }
  };

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'requested') return booking.status === 'requested' || booking.status === 'pending';
    return booking.status?.toLowerCase() === filterStatus;
  });

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">Failed to load your bookings. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your ride bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'all', label: 'All Bookings', count: bookings.length },
                { key: 'requested', label: 'Pending', count: bookings.filter(b => b.status === 'requested' || b.status === 'pending').length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    filterStatus === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FaTicketAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterStatus === 'all' ? 'No bookings yet' : `No ${filterStatus} bookings`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? "You haven't booked any rides yet. Start by searching for available rides."
                  : `You don't have any ${filterStatus} bookings at the moment.`
                }
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/search')}
                  className="btn-primary"
                >
                  Search for Rides
                </button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Route and Status */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold">
                          {booking.ride_offer?.origin?.split(',')[0] || 'Unknown'} → {booking.ride_offer?.destination?.split(',')[0] || 'Unknown'}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {booking.ride_offer?.origin} to {booking.ride_offer?.destination}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-2 capitalize">{booking.status}</span>
                    </div>
                  </div>

                  {/* Trip Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{new Date(booking.ride_offer?.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">{booking.ride_offer?.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Seats</p>
                        <p className="font-medium">{booking.seats_booked}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaDollarSign className="mr-2 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-medium">R{booking.seats_booked * (booking.ride_offer?.price_per_seat || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {booking.ride_offer?.driver?.first_name?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.ride_offer?.driver?.first_name} {booking.ride_offer?.driver?.last_name}
                          </p>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-1" />
                            {booking.ride_offer?.driver?.phone || 'Not provided'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Vehicle Info */}
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCar className="mr-1" />
                          <span>
                            {booking.ride_offer?.vehicle?.make} {booking.ride_offer?.vehicle?.model}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {booking.ride_offer?.vehicle?.color}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.special_requests && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 font-medium mb-1">Special Requests:</p>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="text-xs text-gray-500 mb-4">
                    {booking.createdAt || booking.created_at ? (
                      <>
                        Booked on {new Date(booking.createdAt || booking.created_at).toLocaleDateString()} at {new Date(booking.createdAt || booking.created_at).toLocaleTimeString()}
                      </>
                    ) : (
                      'Booking date not available'
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    {/* Show Payment Button for Confirmed Bookings with Pending Payment */}
                    {booking.status === 'confirmed' && booking.payment_status === 'pending' && (
                      <div className="mb-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start">
                            <FaExclamationTriangle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-semibold">Payment Required</p>
                              <p>Your booking has been confirmed by the driver. Please complete your payment to secure your seat.</p>
                            </div>
                          </div>
                        </div>
                        <PaymentButton 
                          booking={booking} 
                          onPaymentInitiated={() => {
                            console.log('Payment initiated for booking:', booking._id);
                          }}
                        />
                      </div>
                    )}

                    {/* Show Payment Completed Message */}
                    {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <FaCheck className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm text-green-800">
                            <p className="font-semibold">Payment Complete</p>
                            <p>Your booking is confirmed and paid. Contact the driver for pickup details.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/ride/${booking.ride_offer_id?._id || booking.ride_offer_id}`)}
                          className="flex items-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FaEye className="mr-2" />
                          View Ride
                        </button>
                        
                        {(booking.status === 'pending' || booking.status === 'requested') && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancelBookingMutation.isLoading}
                            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <FaTimes className="mr-2" />
                            {cancelBookingMutation.isLoading ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}

                        {/* Rate Driver Button for Completed Rides */}
                        {booking.status === 'completed' && !booking.hasReviewed && (
                          <button
                            onClick={() => handleRateDriver(booking)}
                            className="flex items-center px-4 py-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors border border-yellow-200"
                          >
                            <FaStar className="mr-2" />
                            Rate Driver
                          </button>
                        )}

                        {/* Already Rated Message */}
                        {booking.status === 'completed' && booking.hasReviewed && (
                          <div className="flex items-center px-4 py-2 text-green-600 bg-green-50 rounded-lg">
                            <FaCheck className="mr-2" />
                            <span className="text-sm font-medium">Rated</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center">
                            <FaUser className="mr-1" />
                            Contact driver for pickup details
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, booking: null })}
        onSubmit={handleSubmitRating}
        driverName={
          ratingModal.booking?.ride_offer?.driver
            ? `${ratingModal.booking.ride_offer.driver.first_name} ${ratingModal.booking.ride_offer.driver.last_name}`
            : 'the driver'
        }
        isSubmitting={createReviewMutation.isLoading}
      />
    </div>
  );
};

export default Bookings;