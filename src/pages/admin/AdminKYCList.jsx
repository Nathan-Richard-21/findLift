import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaExclamationTriangle, FaUser, FaFilter, FaSpinner, FaCar, FaClipboardCheck, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
import { kycService } from '../../services/kycService';
import { ridesService } from '../../services/ridesService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminKYCList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc' or 'rides'
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  
  // Rides management state
  const [editingRide, setEditingRide] = useState(null);
  const [rideFilter, setRideFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [pagination.current]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      // Load both submissions and stats
      const [submissionsData, statsData] = await Promise.all([
        kycService.listPending(pagination.current, 10),
        kycService.getStats()
      ]);

      setSubmissions(submissionsData.verifications || []);
      setPagination(submissionsData.pagination || { current: 1, pages: 1, total: 0 });
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || error.message?.includes('401')) {
        setIsUnauthorized(true);
        setError('You must be logged in as an admin to access this page.');
      } else if (error.response?.status === 403) {
        setIsUnauthorized(true);
        setError('You do not have permission to access this page. Admin access required.');
      } else {
        setError('Failed to load verification data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all rides for rides tab
  const { data: rides = [], isLoading: ridesLoading, refetch: refetchRides } = useQuery({
    queryKey: ['admin-rides', rideFilter],
    queryFn: async () => {
      const response = await ridesService.getAllRides();
      let filteredRides = response;
      
      if (rideFilter !== 'all') {
        filteredRides = response.filter(ride => ride.status === rideFilter);
      }
      
      return filteredRides;
    },
    enabled: activeTab === 'rides'
  });

  // Delete ride mutation
  const deleteMutation = useMutation({
    mutationFn: (rideId) => ridesService.deleteRide(rideId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rides']);
      alert('Ride deleted successfully');
    },
    onError: (error) => {
      alert('Failed to delete ride: ' + (error.response?.data?.message || error.message));
    }
  });

  // Update ride mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ridesService.updateRide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-rides']);
      setEditingRide(null);
      alert('Ride updated successfully');
    },
    onError: (error) => {
      alert('Failed to update ride: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleDeleteRide = (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      deleteMutation.mutate(rideId);
    }
  };

  const handleEditRide = (ride) => {
    setEditingRide({
      ...ride,
      departure_date: ride.departure_date?.split('T')[0] || ride.date?.split('T')[0] || '',
      departure_time: ride.departure_time || ride.time || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingRide) return;
    
    updateMutation.mutate({
      id: editingRide._id,
      data: {
        departure_city: editingRide.departure_city,
        departure_address: editingRide.departure_address,
        destination_city: editingRide.destination_city,
        destination_address: editingRide.destination_address,
        departure_date: editingRide.departure_date,
        departure_time: editingRide.departure_time,
        price_per_seat: parseFloat(editingRide.price_per_seat),
        available_seats: parseInt(editingRide.available_seats),
        description: editingRide.description
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-blue-600" />;
      case 'under_review':
        return <FaClock className="text-yellow-600" />;
      case 'high_risk':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading verification submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className={`text-4xl mb-4 ${isUnauthorized ? 'text-yellow-500' : 'text-red-500'}`}>
              {isUnauthorized ? '🔒' : '⚠️'}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isUnauthorized ? 'Authentication Required' : 'Error Loading Data'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              {isUnauthorized ? (
                <>
                  <button 
                    onClick={() => navigate('/auth?mode=login&redirect=/admin/kyc')} 
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Login as Admin
                  </button>
                  <p className="text-sm text-gray-500">
                    Need admin access? Contact your system administrator.
                  </p>
                </>
              ) : (
                <button onClick={loadData} className="w-full btn-primary">
                  Try Again
                </button>
              )}
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage driver verifications and rides</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('kyc')}
              className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                activeTab === 'kyc'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaClipboardCheck className="mr-2" />
              KYC Reviews
            </button>
            <button
              onClick={() => setActiveTab('rides')}
              className={`flex items-center px-6 py-4 font-semibold transition-colors ${
                activeTab === 'rides'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCar className="mr-2" />
              Rides Management
            </button>
          </div>
        </div>

        {/* KYC Tab Content */}
        {activeTab === 'kyc' && (
          <>
            {/* Statistics */}
            {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaClock className="text-xl text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaUser className="text-xl text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="text-xl text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayVerifications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaExclamationTriangle className="text-xl text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.rejected}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-600" />
            <div className="flex space-x-2">
              {['pending', 'high-risk', 'expiring', 'duplicates'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">No pending verifications to review at the moment.</p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div key={submission.sessionId} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(submission.verification?.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {submission.userId?.first_name} {submission.userId?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {submission.userId?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Submitted {new Date(submission.verification?.submittedAt || submission.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.verification?.status)}`}>
                            {submission.verification?.status?.replace('_', ' ')?.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Session: {submission.sessionId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/admin/kyc/${submission.sessionId}`)}
                        className="btn-primary"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Rides Tab Content */}
        {activeTab === 'rides' && (
          <>
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-700">Filter:</label>
                <select
                  value={rideFilter}
                  onChange={(e) => setRideFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Rides</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-gray-600">Total: {rides.length} rides</span>
              </div>
            </div>

            {/* Rides List */}
            {ridesLoading ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading rides...</p>
              </div>
            ) : rides.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No rides found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => (
                  <div key={ride._id} className="bg-white rounded-lg shadow p-6">
                    {editingRide && editingRide._id === ride._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Edit Ride</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departure City</label>
                            <input
                              type="text"
                              value={editingRide.departure_city}
                              onChange={(e) => setEditingRide({...editingRide, departure_city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Address</label>
                            <input
                              type="text"
                              value={editingRide.departure_address}
                              onChange={(e) => setEditingRide({...editingRide, departure_address: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
                            <input
                              type="text"
                              value={editingRide.destination_city}
                              onChange={(e) => setEditingRide({...editingRide, destination_city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Address</label>
                            <input
                              type="text"
                              value={editingRide.destination_address}
                              onChange={(e) => setEditingRide({...editingRide, destination_address: e.target.value})}
                              className="w-full px-3 py-2 border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              value={editingRide.departure_date}
                              onChange={(e) => setEditingRide({...editingRide, departure_date: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                              type="time"
                              value={editingRide.departure_time}
                              onChange={(e) => setEditingRide({...editingRide, departure_time: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Seat (R)</label>
                            <input
                              type="number"
                              value={editingRide.price_per_seat}
                              onChange={(e) => setEditingRide({...editingRide, price_per_seat: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                            <input
                              type="number"
                              value={editingRide.available_seats}
                              onChange={(e) => setEditingRide({...editingRide, available_seats: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={editingRide.description || ''}
                            onChange={(e) => setEditingRide({...editingRide, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows="3"
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleSaveEdit}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <FaCheck className="mr-2" /> Save Changes
                          </button>
                          <button
                            onClick={() => setEditingRide(null)}
                            className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <FaTimes className="mr-2" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <FaMapMarkerAlt className="text-green-600 mr-2" />
                              <span className="font-semibold text-lg">
                                {ride.departure_city} → {ride.destination_city}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              <div>From: {ride.departure_address}</div>
                              <div>To: {ride.destination_address}</div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditRide(ride)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRide(ride._id)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                            >
                              <FaTrash className="mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>{new Date(ride.departure_date || ride.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2" />
                            <span>{ride.departure_time || ride.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaUsers className="mr-2" />
                            <span>{ride.available_seats || ride.seats_remaining} seats</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaDollarSign className="mr-2" />
                            <span>R{ride.price_per_seat}/seat</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                ride.status === 'active' ? 'bg-green-100 text-green-800' :
                                ride.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {ride.status}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Driver:</span>
                              <span className="ml-2 text-gray-600">
                                {ride.driver?.first_name} {ride.driver?.last_name}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Vehicle:</span>
                              <span className="ml-2 text-gray-600">
                                {ride.vehicle?.make} {ride.vehicle?.model}
                              </span>
                            </div>
                          </div>
                          
                          {ride.description && (
                            <div className="mt-3">
                              <span className="font-medium text-gray-700">Description:</span>
                              <p className="text-gray-600 mt-1">{ride.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminKYCList;