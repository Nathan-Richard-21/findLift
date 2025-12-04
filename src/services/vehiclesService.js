import api from './api';

export const vehiclesService = {
  // Get user's vehicles
  getUserVehicles: async () => {
    const response = await api.get('/vehicles');
    const vehicles = response.data.data || []; // Extract the data array from the response
    
    // Map backend field names to frontend field names
    return vehicles.map(vehicle => ({
      ...vehicle,
      license_plate: vehicle.registration_plate, // backend uses registration_plate, frontend expects license_plate
      seats: vehicle.seats_available_default || 4 // backend uses seats_available_default, frontend expects seats
    }));
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    const vehicle = response.data.data;
    
    // Map backend field names to frontend field names
    return {
      ...vehicle,
      license_plate: vehicle.registration_plate, // backend uses registration_plate, frontend expects license_plate
      seats: vehicle.seats_available_default || 4 // backend uses seats_available_default, frontend expects seats
    };
  },

  // Add new vehicle
  addVehicle: async (vehicleData) => {
    // Map frontend field names to backend field names
    const backendData = {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year ? parseInt(vehicleData.year) : undefined,
      color: vehicleData.color,
      registration_plate: vehicleData.license_plate, // frontend uses license_plate, backend uses registration_plate
      seats_available_default: vehicleData.seats ? parseInt(vehicleData.seats) : 4 // frontend uses seats, backend uses seats_available_default
    };
    
    const response = await api.post('/vehicles', backendData);
    return response.data;
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    // Map frontend field names to backend field names
    const backendData = {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year ? parseInt(vehicleData.year) : undefined,
      color: vehicleData.color,
      registration_plate: vehicleData.license_plate, // frontend uses license_plate, backend uses registration_plate
      seats_available_default: vehicleData.seats ? parseInt(vehicleData.seats) : 4 // frontend uses seats, backend uses seats_available_default
    };
    
    const response = await api.put(`/vehicles/${id}`, backendData);
    return response.data;
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Upload vehicle photos
  uploadVehiclePhotos: async (id, formData) => {
    const response = await api.post(`/vehicles/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Set vehicle as primary
  setPrimaryVehicle: async (id) => {
    const response = await api.put(`/vehicles/${id}/primary`);
    return response.data;
  }
};