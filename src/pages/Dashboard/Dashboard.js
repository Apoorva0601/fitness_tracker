import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/workoutService';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDuration, formatCalories } from '../../utils/formatUtils';
import { getRelativeDate } from '../../utils/dateUtils';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch workout stats
      const statsResponse = await workoutService.getStats(30);
      setStats(statsResponse.data.data);
      
      // Fetch recent workouts
      const workoutsResponse = await workoutService.getWorkouts({ limit: 5 });
      setRecentWorkouts(workoutsResponse.data.data.workouts);
      
      // Fetch popular resources
      const resourcesResponse = await resourceService.getPopularResources(4);
      setPopularResources(resourcesResponse.data.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner.Page message="Loading your dashboard..." />;
  }

  const quickStats = [
    {
      name: 'Total Workouts',
      value: user?.stats?.totalWorkouts || 0,
      icon: ClipboardDocumentListIcon,
      color: 'blue',
    },
    {
      name: 'Total Duration',
      value: formatDuration(user?.stats?.totalDuration || 0),
      icon: ClockIcon,
      color: 'green',
    },
    {
      name: 'Current Streak',
      value: `${user?.stats?.currentStreak || 0} days`,
      icon: TrophyIcon,
      color: 'yellow',
    },
    {
      name: 'This Month',
      value: stats?.overview?.totalWorkouts || 0,
      icon: CalendarDaysIcon,
      color: 'purple',
    },
  ];

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to crush your fitness goals today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                Recent Workouts
              </h2>
              <Link
                to="/app/workouts/new"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Workout
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {workout.exerciseName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getRelativeDate(workout.date)} • {formatDuration(workout.duration)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {workout.category}
                      </p>
                      {workout.caloriesBurned && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCalories(workout.caloriesBurned)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Link
                  to="/app/workouts"
                  className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                >
                  View all workouts →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No workouts logged yet
                </p>
                <Link
                  to="/app/workouts/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Log your first workout
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Popular Resources */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2" />
              Popular Resources
            </h2>
          </Card.Header>
          <Card.Content>
            {popularResources.length > 0 ? (
              <div className="space-y-4">
                {popularResources.map((resource) => (
                  <Link
                    key={resource._id}
                    to={`/app/resources/${resource._id}`}
                    className="block p-3 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {resource.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{resource.type} • {resource.category}</span>
                      <span>{resource.readTime} min read</span>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/app/resources"
                  className="block text-center text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                >
                  Browse all resources →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No resources available
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/app/workouts/new"
              className="flex items-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors group"
            >
              <PlusIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Log Workout</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add a new workout session</p>
              </div>
            </Link>
            
            <Link
              to="/app/workouts"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
            >
              <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">View Progress</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check your workout history</p>
              </div>
            </Link>
            
            <Link
              to="/app/resources"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
            >
              <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Browse Resources</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find fitness tips and guides</p>
              </div>
            </Link>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;
