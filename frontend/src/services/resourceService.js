import api from './api';

export const resourceService = {
  // Get all resources with pagination and filters
  getResources: (params = {}) => {
    return api.get('/resources', { params });
  },

  // Get single resource
  getResource: (id) => {
    return api.get(`/resources/${id}`);
  },

  // Get popular resources
  getPopularResources: (limit = 6) => {
    return api.get('/resources/popular', { params: { limit } });
  },

  // Get categories and types
  getCategories: () => {
    return api.get('/resources/categories');
  },

  // Like a resource
  likeResource: (id) => {
    return api.post(`/resources/${id}/like`);
  },

  // Admin functions
  createResource: (resourceData) => {
    return api.post('/resources', resourceData);
  },

  updateResource: (id, resourceData) => {
    return api.put(`/resources/${id}`, resourceData);
  },

  deleteResource: (id) => {
    return api.delete(`/resources/${id}`);
  },
};
