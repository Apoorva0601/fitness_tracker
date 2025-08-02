import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutService } from '../../services/workoutService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDateForInput } from '../../utils/dateUtils';
import { validateDuration, validateCalories } from '../../utils/validationUtils';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const WorkoutForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    exerciseName: '',
    duration: '',
    date: formatDateForInput(new Date()),
    caloriesBurned: '',
    category: 'other',
    intensity: 'moderate',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchWorkout();
    }
  }, [id, isEditing]);

  const fetchWorkout = async () => {
    try {
      setInitialLoading(true);
      const response = await workoutService.getWorkout(id);
      const workout = response.data.data;
      
      setFormData({
        exerciseName: workout.exerciseName,
        duration: workout.duration.toString(),
        date: formatDateForInput(workout.date),
        caloriesBurned: workout.caloriesBurned?.toString() || '',
        category: workout.category,
        intensity: workout.intensity,
        notes: workout.notes || '',
      });
      
      setExistingPhotos(workout.progressPhotos || []);
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Failed to load workout');
      navigate('/app/workouts');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    setProgressPhotos(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removePhoto = (index) => {
    setProgressPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.exerciseName.trim()) {
      newErrors.exerciseName = 'Exercise name is required';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (!validateDuration(formData.duration)) {
      newErrors.duration = 'Duration must be between 1 and 600 minutes';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.caloriesBurned && !validateCalories(formData.caloriesBurned)) {
      newErrors.caloriesBurned = 'Calories must be between 0 and 5000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        duration: parseInt(formData.duration),
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
        progressPhotos: progressPhotos,
      };

      if (isEditing) {
        await workoutService.updateWorkout(id, submitData);
        toast.success('Workout updated successfully');
      } else {
        await workoutService.createWorkout(submitData);
        toast.success('Workout created successfully');
      }
      
      navigate('/app/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      const message = error.response?.data?.message || 'Failed to save workout';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner.Page message="Loading workout..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/app/workouts')}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Workout' : 'Add New Workout'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditing ? 'Update your workout details' : 'Log your fitness activity'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exercise Name */}
            <Input
              label="Exercise Name"
              name="exerciseName"
              value={formData.exerciseName}
              onChange={handleChange}
              error={errors.exerciseName}
              placeholder="e.g., Morning Run, Push-ups, Yoga Session"
              required
            />

            {/* Duration and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Duration (minutes)"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                error={errors.duration}
                placeholder="30"
                min="1"
                max="600"
                required
              />
              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                error={errors.date}
                required
              />
            </div>

            {/* Category and Intensity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input.Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </Input.Select>

              <Input.Select
                label="Intensity"
                name="intensity"
                value={formData.intensity}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </Input.Select>
            </div>

            {/* Calories Burned */}
            <Input
              label="Calories Burned (optional)"
              type="number"
              name="caloriesBurned"
              value={formData.caloriesBurned}
              onChange={handleChange}
              error={errors.caloriesBurned}
              placeholder="300"
              min="0"
              max="5000"
            />

            {/* Notes */}
            <Input.Textarea
              label="Notes (optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="How did the workout feel? Any observations or achievements..."
              rows={4}
            />

            {/* Progress Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Progress Photos (optional)
              </label>
              
              {/* Existing Photos */}
              {existingPhotos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current photos:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {existingPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${photo}`}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <label htmlFor="photo-upload" className="cursor-pointer text-primary-600 hover:text-primary-500">
                    Upload photos
                  </label>
                  {' '}or drag and drop
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 5MB each (max 5 photos)
                </p>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Selected Photos Preview */}
              {progressPhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Selected photos ({progressPhotos.length}/5):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {progressPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-dark-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/workouts')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {isEditing ? 'Update Workout' : 'Save Workout'}
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default WorkoutForm;
