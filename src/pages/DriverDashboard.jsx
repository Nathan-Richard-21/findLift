import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../App';
import { ridesService } from '../services/ridesService';
import { bookingsService } from '../services/bookingsService';
import { kycService } from '../services/kycService';
import { 
  FaCar, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaDollarSign,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const DriverDashboard = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('rides');

  // Fetch driver's rides
  const { data: rides = [], isLoading: ridesLoading } = useQuery({
    queryKey: ['rides', 'driver'],
    queryFn: ridesService.getDriverRides,
    enabled: isAuthenticated && !authLoading
  });

  // Fetch driver's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'driver'],
    queryFn: bookingsService.getDriverBookings,
    enabled: isAuthenticated && !authLoading
  });

  // Fetch driver stats
  const { data: stats } = useQuery({
    queryKey: ['stats', 'driver'],
    queryFn: ridesService.getDriverStats,
    enabled: isAuthenticated && !authLoading,
    initialData: {
      totalRides: 0,
      totalEarnings: 0,
      averageRating: 0,
      completedRides: 0
    }
  });

  // Fetch driver verification (for vehicle details)
  const { data: verification, isLoading: verificationLoading } = useQuery({
    queryKey: ['verification'],
    queryFn: kycService.getVerificationStatus,
    enabled: isAuthenticated && !authLoading
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, status }) => bookingsService.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (error) => {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  });

  // Delete ride mutation
  const deleteRideMutation = useMutation({
    mutationFn: ridesService.deleteRide,
    onSuccess: () => {
      queryClient.invalidateQueries(['rides']);
    },
    onError: (error) => {
      console.error('Failed to delete ride:', error);
      alert('Failed to delete ride. Please try again.');
    }
  });

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    updateBookingMutation.mutate({ bookingId, status: newStatus });
  };

  const handleDeleteRide = async (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      deleteRideMutation.mutate(rideId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Don't render if not authenticated (will be redirected by useEffect)
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Manage your rides and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl mb-2 md:mb-0 self-start">
                <FaCar className="text-blue-600 text-base md:text-xl" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Total Rides</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalRides}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="p-2 md:p-3 bg-green-100 rounded-lg md:rounded-xl mb-2 md:mb-0 self-start">
                <FaDollarSign className="text-green-600 text-base md:text-xl" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">R{stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-lg md:rounded-xl mb-2 md:mb-0 self-start">
                <FaCheck className="text-yellow-600 text-base md:text-xl" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Completed</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.completedRides}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg md:rounded-xl mb-2 md:mb-0 self-start">
                <FaUsers className="text-purple-600 text-base md:text-xl" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Rating</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max md:min-w-0">
              <button
                onClick={() => setActiveTab('rides')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'rides'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Rides
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('vehicle')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'vehicle'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Vehicle
              </button>
            </nav>
          </div>

          <div className="p-4 md:p-6">
            {/* My Rides Tab */}
            {activeTab === 'rides' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                  <h2 className="text-lg md:text-xl font-semibold">My Rides</h2>
                  <button
                    onClick={() => navigate('/offer-ride')}
                    className="btn-primary flex items-center justify-center text-sm md:text-base"
                  >
                    <FaPlus className="mr-2" />
                    Offer New Ride
                  </button>
                </div>

                <div className="space-y-4">
                  {rides.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No rides offered</h3>
                      <p className="text-gray-600 mb-4">Start offering rides to earn money</p>
                      <button
                        onClick={() => navigate('/offer-ride')}
                        className="btn-primary"
                      >
                        Offer Your First Ride
                      </button>
                    </div>
                  ) : (
                    rides.map((ride) => (
                      <div key={ride._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-4">
                              <FaMapMarkerAlt className="text-green-600 mr-2" />
                              <span className="font-semibold text-lg">
                                {ride.departure_city} → {ride.destination_city}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center text-gray-600">
                                <FaCalendarAlt className="mr-2" />
                                <span>{ride.departure_date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaUsers className="mr-2" />
                                <span>{ride.available_seats} seats</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                    
                                <span>R{ride.price_per_seat}/seat</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  ride.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {ride.status}
                                </span>
                              </div>
                            </div>

                            <div className="text-sm text-gray-600">
                              {ride.bookings_count} booking(s) • Departure: {ride.departure_time}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => navigate(`/ride/${ride._id}`)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => navigate(`/edit-ride/${ride._id}`)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Ride"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteRide(ride._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Ride"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Passenger Bookings</h2>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600">Passengers will appear here when they book your rides</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-lg">{booking.passenger_name}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{booking.passenger_phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Seats</p>
                                <p className="font-medium">{booking.seats_booked}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="font-medium">R{booking.total_price}</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600">
                              {booking.createdAt || booking.created_at ? (
                                <>Booked on {new Date(booking.createdAt || booking.created_at).toLocaleDateString()}</>
                              ) : (
                                'Booking date not available'
                              )}
                            </p>
                          </div>

                          {booking.status === 'pending' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                className="btn-primary text-sm py-2"
                              >
                                <FaCheck className="mr-1" />
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                className="btn-secondary text-sm py-2"
                              >
                                <FaTimes className="mr-1" />
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Tab */}
            {activeTab === 'vehicle' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">My Vehicle</h2>

                {verificationLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading vehicle details...</p>
                  </div>
                ) : verification?.data?.documents?.vehicle ? (
                  <div className="space-y-6">
                    {/* Vehicle Details Card */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <FaCar className="text-green-600 text-2xl mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Make</p>
                          <p className="font-semibold text-gray-900">{verification.data.documents.vehicle.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Model</p>
                          <p className="font-semibold text-gray-900">{verification.data.documents.vehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Year</p>
                          <p className="font-semibold text-gray-900">{verification.data.documents.vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Color</p>
                          <p className="font-semibold text-gray-900">{verification.data.documents.vehicle.color}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">License Plate</p>
                          <p className="font-semibold text-gray-900">{verification.data.documents.vehicle.licensePlate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Photos */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Vehicle Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {verification.data.documents.vehicle.frontImage && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Front View</p>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img 
                                src={verification.data.documents.vehicle.frontImage} 
                                alt="Vehicle Front" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(verification.data.documents.vehicle.frontImage, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {verification.data.documents.vehicle.backImage && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Back View</p>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img 
                                src={verification.data.documents.vehicle.backImage} 
                                alt="Vehicle Back" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(verification.data.documents.vehicle.backImage, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {verification.data.documents.vehicle.leftImage && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Left Side</p>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img 
                                src={verification.data.documents.vehicle.leftImage} 
                                alt="Vehicle Left" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(verification.data.documents.vehicle.leftImage, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                        {verification.data.documents.vehicle.rightImage && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Right Side</p>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img 
                                src={verification.data.documents.vehicle.rightImage} 
                                alt="Vehicle Right" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(verification.data.documents.vehicle.rightImage, '_blank')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        Click on any image to view full size
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Information</h3>
                    <p className="text-gray-600 mb-4">Complete your driver verification to add vehicle details</p>
                    <button
                      onClick={() => navigate('/verify')}
                      className="btn-primary"
                    >
                      Complete Verification
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;