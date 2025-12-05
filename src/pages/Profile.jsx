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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <FaUser className="text-2xl text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">
                      {userProfile?.average_rating || 'N/A'}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({userProfile?.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h2 className="text-xl font-semibold mb-6">Driver Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h3 className="font-medium mb-2">Driver Status</h3>
                    <p className="text-gray-600 mb-4">Enable to accept ride requests</p>
                    <label className="flex items-center">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">Available for rides</span>
                    </label>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h3 className="font-medium mb-2">Vehicle Information</h3>
                    <p className="text-gray-600 mb-4">Manage your registered vehicles</p>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="btn-secondary"
                    >
                      Manage Vehicles
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h3 className="font-medium mb-2">Driver Documents</h3>
                    <p className="text-gray-600 mb-4">Upload and verify your driver documents</p>
                    <button className="btn-secondary">
                      Upload Documents
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Reviews & Ratings</h2>
                <div className="space-y-4">
                  {/* Sample reviews */}
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar key={star} className="text-yellow-400 text-sm" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-600">
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
                <h2 className="text-xl font-semibold mb-6">Ride History</h2>
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading ride history...</p>
                    </div>
                  ) : rideHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No ride history found.</p>
                    </div>
                  ) : (
                    rideHistory.map((booking) => (
                      <div key={booking._id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              {booking.ride?.departure_city} → {booking.ride?.destination_city}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.ride?.departure_datetime).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Driver: {booking.ride?.driver?.first_name} {booking.ride?.driver?.last_name}
                          </span>
                          <span className="font-medium">
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