import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../../services/workoutService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDuration, formatCalories } from '../../utils/formatUtils';
import { formatDate, getRelativeDate } from '../../utils/dateUtils';
import { useDebounce } from '../../hooks/useCommon';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  FireIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalWorkouts: 0,
    hasNext: false,
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchWorkouts();
  }, [debouncedSearch, filters]);

  const fetchWorkouts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(debouncedSearch && { exerciseName: debouncedSearch }),
        ...filters,
      };

      const response = await workoutService.getWorkouts(params);
      const data = response.data.data;
      
      if (page === 1) {
        setWorkouts(data.workouts);
      } else {
        setWorkouts(prev => [...prev, ...data.workouts]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchWorkouts(pagination.currentPage + 1);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await workoutService.deleteWorkout(workoutId);
      setWorkouts(prev => prev.filter(workout => workout._id !== workoutId));
      toast.success('Workout deleted successfully');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      cardio: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      strength: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      flexibility: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      sports: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Workouts
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Track and manage your fitness journey
          </p>
        </div>
        <Link to="/app/workouts/new">
          <Button variant="primary" className="mt-4 sm:mt-0">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Workout
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <Input.Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </Input.Select>

            {/* Date Range */}
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Workout List */}
      {loading && workouts.length === 0 ? (
        <LoadingSpinner.Page message="Loading workouts..." />
      ) : workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <Card key={workout._id} hover>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {workout.exerciseName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(workout.category)}`}>
                            {workout.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                            {getRelativeDate(workout.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDuration(workout.duration)}
                      </div>
                      {workout.caloriesBurned && (
                        <div className="flex items-center">
                          <FireIcon className="w-4 h-4 mr-1" />
                          {formatCalories(workout.caloriesBurned)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                        <span className="capitalize">{workout.intensity}</span>
                      </div>
                    </div>

                    {workout.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {workout.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link to={`/app/workouts/edit/${workout._id}`}>
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(workout._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                loading={loading}
                disabled={loading}
              >
                Load More Workouts
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No workouts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery || Object.values(filters).some(v => v) 
                  ? "Try adjusting your search or filters"
                  : "Start your fitness journey by logging your first workout"
                }
              </p>
              <Link to="/app/workouts/new">
                <Button variant="primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Workout
                </Button>
              </Link>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Workouts;
