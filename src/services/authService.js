import api from './api';

export const authService = {
  // Register new user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Verify token (for auto-login)
  verifyToken: () => {
    return api.get('/users/profile');
  },

  // Forgot password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },
};
