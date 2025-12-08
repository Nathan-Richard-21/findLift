import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../App';
import { useToast } from '../contexts/ToastContext';
import { ridesService } from '../services/ridesService';
import { bookingsService } from '../services/bookingsService';
import { paymentService } from '../services/paymentService';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaDollarSign, 
  FaUsers, 
  FaCar, 
  FaSuitcase, 
  FaPhone, 
  FaEnvelope,
  FaStar,
  FaArrowLeft,
  FaUser,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [seats, setSeats] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingData, setBookingData] = useState({
    passenger_name: '',
    passenger_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    special_requests: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch ride details
  const { data: ride, isLoading, error } = useQuery({
    queryKey: ['ride', id],
    queryFn: () => ridesService.getRideById(id),
    retry: false
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      setBookingData(prev => ({
        ...prev,
        passenger_name: `${user.first_name} ${user.last_name}`,
        passenger_phone: user.phone || ''
      }));
    }
  }, [user, isAuthenticated]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.warning('Please log in to book a ride');
      navigate('/auth');
      return;
    }

    if (isProcessing) return; // Prevent double submission
    
    setIsProcessing(true);
    toast.info('Processing your booking...');

    try {
      // Step 1: Create the booking first (status will be 'pending')
      const bookingPayload = {
        ride_offer_id: id,
        seats_booked: seats,
        pickup_notes: bookingData.special_requests
      };

      // Only include contact_phone if it's not empty
      if (bookingData.passenger_phone && bookingData.passenger_phone.trim()) {
        bookingPayload.contact_phone = bookingData.passenger_phone.trim();
      }

      // Include emergency contact fields if they exist
      if (bookingData.emergency_contact_name && bookingData.emergency_contact_name.trim()) {
        bookingPayload.emergency_contact_name = bookingData.emergency_contact_name.trim();
      }

      if (bookingData.emergency_contact_phone && bookingData.emergency_contact_phone.trim()) {
        bookingPayload.emergency_contact_phone = bookingData.emergency_contact_phone.trim();
      }
      
      // Create booking
      const bookingResponse = await bookingsService.createBooking(bookingPayload);
      
      if (!bookingResponse.success) {
        throw new Error(bookingResponse.error || 'Failed to create booking');
      }

      const bookingId = bookingResponse.data._id;
      toast.success('Booking created! Redirecting to payment...');

      // Step 2: Create payment link immediately
      const paymentResponse = await paymentService.createPaymentLink(bookingId);
      
      if (paymentResponse.success && paymentResponse.data.payment_link_url) {
        // Redirect to Yoco payment page
        window.location.href = paymentResponse.data.payment_link_url;
      } else {
        throw new Error(paymentResponse.error || 'Failed to create payment link');
      }
    } catch (error) {
      console.error('Booking/Payment error:', error);
      setIsProcessing(false);
      
      // Handle validation errors
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errors = {};
        error.response.data.details.forEach(detail => {
          errors[detail.field] = detail.message;
        });
        setValidationErrors(errors);
        
        // Show summary toast
        toast.error('Please fix the validation errors in the form');
      } else {
        // Show the actual error message from the backend
        const errorMsg = error.response?.data?.error || 
                        error.response?.data?.details || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to process booking. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Helper component to display field errors
  const FieldError = ({ fieldName }) => {
    const error = validationErrors[fieldName];
    if (!error) return null;
    return (
      <div className="text-red-500 text-sm mt-1 flex items-center">
        <FaExclamationTriangle className="mr-1" />
        {error}
      </div>
    );
  };

  const isOwnRide = user && ride && ride.driver_user_id === user._id;
  const totalPrice = seats * (ride?.price_per_seat || 0);
  const canBook = ride && ride.available_seats >= seats && !isOwnRide;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ride Not Found</h2>
          <p className="text-gray-600 mb-4">The ride you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-2xl mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold">
                      {ride.departure_city} → {ride.destination_city}
                    </h1>
                    <p className="text-green-100 text-sm">
                      {ride.departure_address} to {ride.destination_address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>{new Date(ride.departure_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>{ride.departure_time}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold mb-2">
                  R{ride.price_per_seat}
                </div>
                <p className="text-green-100">per seat</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Driver Info - Hidden for Privacy */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaCar className="mr-2 text-green-600" />
                    Verified Driver
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      <FaCar className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        Verified Professional Driver
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center mr-4">
                          {ride.driver?.rating_avg ? (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={`text-sm ${i < Math.round(ride.driver.rating_avg) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-2 text-gray-600">
                                {ride.driver.rating_avg.toFixed(1)} ({ride.driver.rating_count || 0} reviews)
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">New driver - No reviews yet</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          ✓ Identity Verified
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium ml-2">
                          ✓ Background Checked
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Driver contact information will be shared after booking confirmation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaCar className="mr-2 text-green-600" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Make & Model</p>
                      <p className="font-semibold">
                        {ride.vehicle?.make} {ride.vehicle?.model} {ride.vehicle?.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Color</p>
                      <p className="font-semibold">{ride.vehicle?.color}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Year</p>
                      <p className="font-semibold">{ride.vehicle?.year || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Luggage</p>
                      <div className="flex items-center">
                        <FaSuitcase className="mr-2 text-gray-600" />
                        <span className="font-semibold capitalize">{ride.luggage_allowed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available Seats</span>
                      <div className="flex items-center">
                        <FaUsers className="mr-2 text-green-600" />
                        <span className="font-semibold">{ride.available_seats} seats</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price per Seat</span>
                      <div className="flex items-center">
                        <FaDollarSign className="mr-1 text-green-600" />
                        <span className="font-semibold">R{ride.price_per_seat}</span>
                      </div>
                    </div>
                    {ride.description && (
                      <div>
                        <p className="text-gray-600 mb-2">Notes</p>
                        <p className="bg-white p-4 rounded-lg border">{ride.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-8">
                  {isOwnRide ? (
                    <div className="text-center">
                      <FaCheck className="text-4xl text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Your Ride</h3>
                      <p className="text-gray-600 mb-4">This is your ride offer</p>
                      <button
                        onClick={() => navigate('/driver-dashboard')}
                        className="btn-primary w-full"
                      >
                        Manage Ride
                      </button>
                    </div>
                  ) : ride.available_seats === 0 ? (
                    <div className="text-center">
                      <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Fully Booked</h3>
                      <p className="text-gray-600">No seats available</p>
                    </div>
                  ) : !showBookingForm ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Book This Ride</h3>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Seats
                          </label>
                          <select
                            value={seats}
                            onChange={(e) => setSeats(parseInt(e.target.value))}
                            className="input-field w-full"
                          >
                            {[...Array(Math.min(ride.available_seats, 6))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} seat{i > 0 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span>Price per seat:</span>
                            <span>R{ride.price_per_seat}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span>Seats:</span>
                            <span>{seats}</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total:</span>
                            <span>R{totalPrice}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => isAuthenticated ? setShowBookingForm(true) : navigate('/auth')}
                        className="btn-primary w-full"
                        disabled={!canBook}
                      >
                        {!isAuthenticated ? 'Login to Book' : 'Book Now'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit}>
                      <h3 className="text-xl font-bold mb-4">Booking Details</h3>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="passenger_name"
                            value={bookingData.passenger_name}
                            onChange={handleInputChange}
                            required
                            className={`input-field w-full ${validationErrors.passenger_name ? 'border-red-500' : ''}`}
                          />
                          <FieldError fieldName="passenger_name" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="passenger_phone"
                            value={bookingData.passenger_phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+27123456789"
                            className={`input-field w-full ${validationErrors.contact_phone ? 'border-red-500' : ''}`}
                          />
                          <p className="text-xs text-gray-500 mt-1">Format: +27123456789 (country code + number)</p>
                          <FieldError fieldName="contact_phone" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Contact Name (Optional)
                          </label>
                          <input
                            type="text"
                            name="emergency_contact_name"
                            value={bookingData.emergency_contact_name}
                            onChange={handleInputChange}
                            className={`input-field w-full ${validationErrors.emergency_contact_name ? 'border-red-500' : ''}`}
                            placeholder="Enter emergency contact name"
                          />
                          <FieldError fieldName="emergency_contact_name" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Contact Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            name="emergency_contact_phone"
                            value={bookingData.emergency_contact_phone}
                            onChange={handleInputChange}
                            className={`input-field w-full ${validationErrors.emergency_contact_phone ? 'border-red-500' : ''}`}
                            placeholder="+27123456789"
                          />
                          <p className="text-xs text-gray-500 mt-1">Format: +27123456789 (country code + number)</p>
                          <FieldError fieldName="emergency_contact_phone" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Requests (Optional)
                          </label>
                          <textarea
                            name="special_requests"
                            value={bookingData.special_requests}
                            onChange={handleInputChange}
                            rows="3"
                            className={`input-field w-full ${validationErrors.pickup_notes ? 'border-red-500' : ''}`}
                            placeholder="Any special requests or notes..."
                            maxLength="200"
                          />
                          <p className="text-xs text-gray-500 mt-1">Max 200 characters</p>
                          <FieldError fieldName="pickup_notes" />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Driver's Price ({seats} seat{seats > 1 ? 's' : ''}):</span>
                            <span className="font-semibold">R{totalPrice}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Platform Fee (15%):</span>
                            <span className="font-semibold text-green-600">R{Math.round(totalPrice * 0.15 * 100) / 100}</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Pay at Pickup:</span>
                              <span className="font-bold text-lg">R{Math.round(totalPrice * 0.85 * 100) / 100}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            You'll pay the platform fee now via card. The remaining amount will be paid to the driver in person.
                          </p>
                        </div>
                      </div>

                      {/* Commission Notice */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">Note:</span> The service commission is non-refundable, even if the ride is cancelled.
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowBookingForm(false)}
                          className="btn-secondary flex-1"
                          disabled={isProcessing}
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="btn-primary flex-1 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Pay & Book Now'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetails;