import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ridesService } from '../../services/ridesService';
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';

const AdminRides = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingRide, setEditingRide] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, cancelled, completed

  // Fetch all rides
  const { data: rides = [], isLoading } = useQuery({
    queryKey: ['admin-rides', filter],
    queryFn: async () => {
      const response = await ridesService.getAllRides();
      let filteredRides = response;
      
      if (filter !== 'all') {
        filteredRides = response.filter(ride => ride.status === filter);
      }
      
      return filteredRides;
    }
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

  const handleDelete = (rideId) => {
    if (window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      deleteMutation.mutate(rideId);
    }
  };

  const handleEdit = (ride) => {
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

  const handleCancelEdit = () => {
    setEditingRide(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rides Management</h1>
            <p className="text-gray-600">View and manage all posted rides</p>
          </div>
          <button
            onClick={() => navigate('/admin/kyc')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Back to KYC
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
        {rides.length === 0 ? (
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                        onClick={handleCancelEdit}
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
                          onClick={() => handleEdit(ride)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ride._id)}
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
      </div>
    </div>
  );
};

export default AdminRides;
