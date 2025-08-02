import api from './api';

export const userService = {
  // Get current user profile
  getProfile: () => {
    return api.get('/users/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      if (key === 'preferences') {
        formData.append('preferences', JSON.stringify(profileData[key]));
      } else if (key !== 'profilePicture') {
        formData.append(key, profileData[key]);
      }
    });
    
    if (profileData.profilePicture) {
      formData.append('profilePicture', profileData.profilePicture);
    }
    
    return api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put('/users/change-password', passwordData);
  },

  // Delete account
  deleteAccount: () => {
    return api.delete('/users/profile');
  },

  // Admin functions
  getAllUsers: (params = {}) => {
    return api.get('/users', { params });
  },

  getUser: (id) => {
    return api.get(`/users/${id}`);
  },

  updateUserRole: (id, role) => {
    return api.put(`/users/${id}/role`, { role });
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};
