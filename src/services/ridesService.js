import api from './api';

export const ridesService = {
  // Search rides
  searchRides: async (searchParams) => {
    const response = await api.get('/rides/search', { params: searchParams });
    
    // Check if response has the expected structure
    if (response.data && response.data.data && response.data.data.rides) {
      // Transform the rides array
      const transformedRides = response.data.data.rides.map(ride => ({
        ...ride,
        departure_city: ride.origin ? ride.origin.split(',')[0]?.trim() : '',
        departure_address: ride.origin ? ride.origin.split(',').slice(1).join(',').trim() : '',
        destination_city: ride.destination ? ride.destination.split(',')[0]?.trim() : '',
        destination_address: ride.destination ? ride.destination.split(',').slice(1).join(',').trim() : '',
        departure_date: ride.date,
        departure_time: ride.time,
        available_seats: ride.seats_total || ride.seats_available,
        description: ride.notes
      }));
      
      // Return in the same structure
      return {
        ...response.data,
        data: {
          ...response.data.data,
          rides: transformedRides
        }
      };
    }
    
    // Fallback: return original data
    return response.data;
  },

  // Get all rides
  getAllRides: async () => {
    const response = await api.get('/rides');
    
    // Extract rides from the response structure
    let rides = [];
    if (response.data.data && response.data.data.rides) {
      rides = response.data.data.rides;
    } else if (Array.isArray(response.data.data)) {
      rides = response.data.data;
    } else if (Array.isArray(response.data)) {
      rides = response.data;
    }
    
    // Transform backend field names to frontend field names
    return rides.map(ride => ({
      ...ride,
      departure_city: ride.origin ? ride.origin.split(',')[0]?.trim() : '',
      departure_address: ride.origin ? ride.origin.split(',').slice(1).join(',').trim() : '',
      destination_city: ride.destination ? ride.destination.split(',')[0]?.trim() : '',
      destination_address: ride.destination ? ride.destination.split(',').slice(1).join(',').trim() : '',
      departure_date: ride.date,
      departure_time: ride.time,
      available_seats: ride.seats_total || ride.seats_available || ride.seats_remaining,
      description: ride.notes
    }));
  },

  // Get ride by ID
  getRideById: async (id) => {
    const response = await api.get(`/rides/${id}`);
    const ride = response.data.data || response.data;
    
    // Transform backend field names to frontend field names
    return {
      ...ride,
      departure_city: ride.origin ? ride.origin.split(',')[0]?.trim() : '',
      departure_address: ride.origin ? ride.origin.split(',').slice(1).join(',').trim() : '',
      destination_city: ride.destination ? ride.destination.split(',')[0]?.trim() : '',
      destination_address: ride.destination ? ride.destination.split(',').slice(1).join(',').trim() : '',
      departure_date: ride.date,
      departure_time: ride.time,
      available_seats: ride.seats_total || ride.seats_available,
      description: ride.notes
    };
  },

  // Create new ride
  createRide: async (rideData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      origin: `${rideData.departure_city}, ${rideData.departure_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
      destination: `${rideData.destination_city}, ${rideData.destination_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
      date: rideData.departure_date,
      time: rideData.departure_time,
      price_per_seat: parseFloat(rideData.price_per_seat),
      seats_total: parseInt(rideData.available_seats),
      luggage_allowed: rideData.luggage_size || 'medium',
      notes: rideData.description || '',
      vehicle_id: rideData.vehicle_id,
      // Include preferences if they exist
      preferences: rideData.preferences
    };
    
    const response = await api.post('/rides', backendData);
    return response.data;
  },

  // Update ride
  updateRide: async (id, rideData) => {
    // Transform frontend field names to backend field names
    const backendData = {
      origin: `${rideData.departure_city}, ${rideData.departure_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
      destination: `${rideData.destination_city}, ${rideData.destination_address}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
      date: rideData.departure_date,
      time: rideData.departure_time,
      price_per_seat: parseFloat(rideData.price_per_seat),
      seats_total: parseInt(rideData.available_seats),
      luggage_allowed: rideData.luggage_size || 'medium',
      notes: rideData.description || '',
      vehicle_id: rideData.vehicle_id,
      // Include preferences if they exist
      preferences: rideData.preferences
    };
    
    const response = await api.put(`/rides/${id}`, backendData);
    return response.data;
  },

  // Delete ride
  deleteRide: async (id) => {
    const response = await api.delete(`/rides/${id}`);
    return response.data;
  },

  // Get driver's rides
  getDriverRides: async () => {
    const response = await api.get('/rides/mine');
    console.log('Driver rides response:', response.data);
    const rides = response.data.data?.rides || response.data.data || response.data || [];
    console.log('Parsed rides:', rides);
    
    // Transform backend field names to frontend field names
    return rides.map(ride => ({
      ...ride,
      departure_city: ride.origin ? ride.origin.split(',')[0]?.trim() : '',
      departure_address: ride.origin ? ride.origin.split(',').slice(1).join(',').trim() : '',
      destination_city: ride.destination ? ride.destination.split(',')[0]?.trim() : '',
      destination_address: ride.destination ? ride.destination.split(',').slice(1).join(',').trim() : '',
      departure_date: ride.date,
      departure_time: ride.time,
      available_seats: ride.seats_total || ride.seats_available,
      description: ride.notes
    }));
  },

  // Get driver stats
  getDriverStats: async () => {
    const response = await api.get('/rides/driver/stats');
    console.log('Driver stats response:', response.data);
    const stats = response.data.data || response.data || {};
    
    // Map backend field names to frontend field names
    return {
      totalRides: stats.totalRides || 0,
      totalEarnings: stats.totalRevenue || 0,
      averageRating: stats.averageRating || 0,
      completedRides: stats.completedRides || 0,
      activeRides: stats.activeRides || 0,
      totalBookings: stats.totalBookings || 0
    };
  },

  // Book a ride
  bookRide: async (rideId, bookingData) => {
    const response = await api.post(`/rides/${rideId}/book`, bookingData);
    return response.data;
  }
};