import api from './api';

export const workoutService = {
  // Get all workouts with pagination and filters
  getWorkouts: (params = {}) => {
    return api.get('/workouts', { params });
  },

  // Get single workout
  getWorkout: (id) => {
    return api.get(`/workouts/${id}`);
  },

  // Create new workout
  createWorkout: (workoutData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(workoutData).forEach(key => {
      if (key !== 'progressPhotos') {
        formData.append(key, workoutData[key]);
      }
    });
    
    // Append files
    if (workoutData.progressPhotos) {
      workoutData.progressPhotos.forEach(file => {
        formData.append('progressPhotos', file);
      });
    }
    
    return api.post('/workouts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update workout
  updateWorkout: (id, workoutData) => {
    const formData = new FormData();
    
    Object.keys(workoutData).forEach(key => {
      if (key !== 'progressPhotos') {
        formData.append(key, workoutData[key]);
      }
    });
    
    if (workoutData.progressPhotos) {
      workoutData.progressPhotos.forEach(file => {
        formData.append('progressPhotos', file);
      });
    }
    
    return api.put(`/workouts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete workout
  deleteWorkout: (id) => {
    return api.delete(`/workouts/${id}`);
  },

  // Get workout statistics
  getStats: (period = '30') => {
    return api.get('/workouts/stats', { params: { period } });
  },
};
