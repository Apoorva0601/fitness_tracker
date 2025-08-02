import api from './api';

export const adminService = {
  // Dashboard & Stats
  getStats: () => api.get('/admin/stats'),
  getRecentUsers: (params) => api.get('/admin/users/recent', { params }),
  getRecentWorkouts: (params) => api.get('/admin/workouts/recent', { params }),
  getRecentResources: (params) => api.get('/admin/resources/recent', { params }),
  getSystemAlerts: () => api.get('/admin/alerts'),

  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  activateUser: (userId) => api.patch(`/admin/users/${userId}/activate`),
  deactivateUser: (userId) => api.patch(`/admin/users/${userId}/deactivate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Resource Management
  getResources: (params) => api.get('/admin/resources', { params }),
  getResource: (resourceId) => api.get(`/admin/resources/${resourceId}`),
  createResource: (data) => api.post('/admin/resources', data),
  updateResource: (resourceId, data) => api.patch(`/admin/resources/${resourceId}`, data),
  publishResource: (resourceId) => api.patch(`/admin/resources/${resourceId}/publish`),
  unpublishResource: (resourceId) => api.patch(`/admin/resources/${resourceId}/unpublish`),
  deleteResource: (resourceId) => api.delete(`/admin/resources/${resourceId}`),

  // Workout Management
  getWorkouts: (params) => api.get('/admin/workouts', { params }),
  getWorkout: (workoutId) => api.get(`/admin/workouts/${workoutId}`),
  deleteWorkout: (workoutId) => api.delete(`/admin/workouts/${workoutId}`),

  // System Management
  getSystemInfo: () => api.get('/admin/system'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  exportData: (type, params) => api.get(`/admin/export/${type}`, { 
    params,
    responseType: 'blob'
  }),
  
  // Content Moderation
  moderateContent: (contentId, action) => api.post(`/admin/moderate/${contentId}`, { action }),
  getFlaggedContent: (params) => api.get('/admin/flagged-content', { params }),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.patch('/admin/settings', settings),
};
