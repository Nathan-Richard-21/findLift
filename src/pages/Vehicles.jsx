import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../App';
import { vehiclesService } from '../services/vehiclesService';
import { FaCar, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaCamera } from 'react-icons/fa';
import VehiclePhotoCapture from '../components/VehiclePhotoCapture';

const Vehicles = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [currentAngle, setCurrentAngle] = useState(null);
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });
  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    left: null,
    right: null
  });
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
    seats: 4,
    vehicle_type: 'sedan'
  });

  const angles = [
    { id: 'front', label: 'Front View', required: true },
    { id: 'back', label: 'Back View (License Plate)', required: true },
    { id: 'left', label: 'Left Side View', required: true },
    { id: 'right', label: 'Right Side View', required: true }
  ];

  // Fetch user's vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesService.getUserVehicles,
    enabled: isAuthenticated && !authLoading
  });

  // Add vehicle mutation
  const addVehicleMutation = useMutation({
    mutationFn: vehiclesService.addVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      setShowAddForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to add vehicle:', error);
      alert('Failed to add vehicle. Please try again.');
    }
  });

  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, data }) => vehiclesService.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
      setEditingVehicle(null);
      setShowAddForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Failed to update vehicle:', error);
      alert('Failed to update vehicle. Please try again.');
    }
  });

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: vehiclesService.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicles']);
    },
    onError: (error) => {
      console.error('Failed to delete vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    }
  });

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      color: '',
      license_plate: '',
      seats: 4,
      vehicle_type: 'sedan'
    });
    setPhotos({
      front: null,
      back: null,
      left: null,
      right: null
    });
    setPreviews({
      front: null,
      back: null,
      left: null,
      right: null
    });
    setCurrentAngle(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoCapture = (angle, file, preview) => {
    setPhotos(prev => ({ ...prev, [angle]: file }));
    setPreviews(prev => ({ ...prev, [angle]: preview }));
    setCurrentAngle(null);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all photos are captured
    const allPhotos = angles.every(angle => photos[angle.id]);
    if (!allPhotos) {
      alert('Please capture all 4 vehicle photos before submitting');
      return;
    }
    
    try {
      // Convert all photos to base64
      const frontImage = await convertToBase64(photos.front);
      const backImage = await convertToBase64(photos.back);
      const leftImage = await convertToBase64(photos.left);
      const rightImage = await convertToBase64(photos.right);
      
      // Combine form data with photos
      const vehicleData = {
        ...formData,
        frontImage,
        backImage,
        leftImage,
        rightImage
      };
      
      if (editingVehicle) {
        updateVehicleMutation.mutate({ id: editingVehicle._id, data: vehicleData });
      } else {
        addVehicleMutation.mutate(vehicleData);
      }
    } catch (error) {
      console.error('Error converting photos:', error);
      alert('Failed to process vehicle photos. Please try again.');
    }
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingVehicle(null);
    setCurrentAngle(null);
    resetForm();
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600 mt-2">Manage your registered vehicles for ride sharing</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
            disabled={showAddForm}
          >
            <FaPlus className="mr-2" />
            Add Vehicle
          </button>
        </div>

        {/* Add/Edit Vehicle Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Camry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="2000"
                    max="2025"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Silver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., ABC123"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must match the license plate visible in your back view photo
                  </p>
                </div>
              </div>

              {/* Vehicle Photos */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Vehicle Photos *</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Capture photos of your vehicle from all 4 angles. Click each button to take a photo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {angles.map((angle) => (
                    <div key={angle.id} className="border-2 border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{angle.label}</h4>
                          {angle.required && <span className="text-xs text-red-600">Required</span>}
                        </div>
                        {photos[angle.id] && (
                          <FaCheck className="text-green-600 text-xl" />
                        )}
                      </div>

                      {previews[angle.id] ? (
                        <div className="space-y-2">
                          <img
                            src={previews[angle.id]}
                            alt={`Vehicle ${angle.label}`}
                            className="w-full h-40 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setCurrentAngle(angle.id)}
                            className="text-sm text-blue-600 hover:underline w-full text-center"
                          >
                            Retake Photo
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentAngle(angle.id)}
                          className="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <div className="text-center">
                            <FaCamera className="text-3xl text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">Capture {angle.label}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Seats and Vehicle Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats *
                  </label>
                  <select
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={2}>2 seats</option>
                    <option value={4}>4 seats</option>
                    <option value={5}>5 seats</option>
                    <option value={7}>7 seats</option>
                    <option value={8}>8 seats</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <FaCheck className="mr-2" />
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
              <p className="text-gray-600 mb-4">Add your first vehicle to start offering rides</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FaCar className="text-2xl text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-gray-600">
                        {vehicle.color} • {vehicle.license_plate} • {vehicle.seats} seats
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vehicle.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <span className="ml-3 text-sm text-gray-600 capitalize">
                          {vehicle.vehicle_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Camera Modal */}
      {currentAngle && (
        <VehiclePhotoCapture
          angle={currentAngle}
          onCapture={(file, preview) => handlePhotoCapture(currentAngle, file, preview)}
          onClose={() => setCurrentAngle(null)}
        />
      )}
    </div>
  );
};

export default Vehicles;