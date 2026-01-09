 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../App';
import { usersService } from '../services/usersService';
import { bookingsService } from '../services/bookingsService';
import { FaUser, FaEdit, FaCar, FaStar, FaHistory, FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => usersService.getProfile(user.id),
    enabled: isAuthenticated && !authLoading && !!user?.id
  });

  // Fetch user's ride history
  const { data: rideHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['bookings', 'history'],
    queryFn: bookingsService.getUserBookings,
    enabled: isAuthenticated && !authLoading
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  });

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || ''
      });
    }
  }, [authLoading, isAuthenticated, userProfile, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'driver', label: 'Driver Settings', icon: FaCar },
    { id: 'reviews', label: 'Reviews', icon: FaStar },
    { id: 'history', label: 'Ride History', icon: FaHistory }
  ];

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
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-xl md:text-2xl text-gray-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-sm md:text-base text-gray-600 truncate">{user.email}</p>
                <div className="flex items-center mt-1 md:mt-2">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1 text-sm md:text-base" />
                    <span className="text-xs md:text-sm font-medium">
                      {userProfile?.average_rating || 'N/A'}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm ml-1">
                      ({userProfile?.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 md:px-4 py-2 text-sm md:text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-max md:min-w-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 md:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-3">
                  <h2 className="text-lg md:text-xl font-semibold">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center justify-center px-3 md:px-4 py-2 text-sm md:text-base text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="0712345678"
                        maxLength={10}
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">10 digits starting with 0</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 md:mt-6">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="btn-primary w-full sm:w-auto text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Driver Tab */}
            {activeTab === 'driver' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Driver Settings</h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl">
                    <h3 className="text-sm md:text-base font-medium mb-2">Driver Status</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Enable to accept ride requests</p>
                    <label className="flex items-center">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-xs md:text-sm font-medium text-gray-900">Available for rides</span>
                    </label>
                  </div>

                  <div className="p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl">
                    <h3 className="text-sm md:text-base font-medium mb-2">Vehicle Information</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Manage your registered vehicles</p>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="btn-secondary w-full sm:w-auto text-sm md:text-base"
                    >
                      Manage Vehicles
                    </button>
                  </div>

                  <div className="p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl">
                    <h3 className="text-sm md:text-base font-medium mb-2">Driver Documents</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Upload and verify your driver documents</p>
                    <button className="btn-secondary w-full sm:w-auto text-sm md:text-base">
                      Upload Documents
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Reviews & Ratings</h2>
                <div className="space-y-3 md:space-y-4">
                  {/* Sample reviews */}
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full mr-2 md:mr-3 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm md:text-base font-medium">John Doe</p>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar key={star} className="text-yellow-400 text-xs md:text-sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs md:text-sm text-gray-500 self-start sm:self-auto">2 days ago</span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        Great driver! Very punctual and friendly. The car was clean and comfortable.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Ride History</h2>
                <div className="space-y-3 md:space-y-4">
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm md:text-base text-gray-600 mt-2">Loading ride history...</p>
                    </div>
                  ) : rideHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm md:text-base text-gray-600">No ride history found.</p>
                    </div>
                  ) : (
                    rideHistory.map((booking) => (
                      <div key={booking._id} className="p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm md:text-base font-medium truncate">
                              {booking.ride?.departure_city} → {booking.ride?.destination_city}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {new Date(booking.ride?.departure_datetime).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded-full whitespace-nowrap ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                          <span className="text-xs md:text-sm text-gray-600 truncate">
                            Driver: {booking.ride?.driver?.first_name} {booking.ride?.driver?.last_name}
                          </span>
                          <span className="text-sm md:text-base font-medium">
                            R{booking.total_amount}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;