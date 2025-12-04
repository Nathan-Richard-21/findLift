import api from './api';

export const usersService = {
  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get current user profile
  getCurrentProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (formData) => {
    const response = await api.post('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  }
};