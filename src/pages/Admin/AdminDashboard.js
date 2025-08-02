import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      newThisMonth: 0,
      activeToday: 0,
      growth: 0,
    },
    workouts: {
      total: 0,
      thisMonth: 0,
      avgPerUser: 0,
      growth: 0,
    },
    resources: {
      total: 0,
      published: 0,
      views: 0,
      growth: 0,
    },
    system: {
      totalStorage: 0,
      bandwidth: 0,
      uptime: 99.9,
      errors: 0,
    },
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, workoutsRes, resourcesRes, alertsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentUsers({ limit: 5 }),
        adminService.getRecentWorkouts({ limit: 5 }),
        adminService.getRecentResources({ limit: 5 }),
        adminService.getSystemAlerts(),
      ]);

      setStats(statsRes.data.data);
      setRecentUsers(usersRes.data.data.users);
      setRecentWorkouts(workoutsRes.data.data.workouts);
      setRecentResources(resourcesRes.data.data.resources);
      setAlerts(alertsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatStorage = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSpinner.Card key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSpinner.Card key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Monitor and manage your fitness tracking application
        </p>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <Card.Header>
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <Card.Title className="text-yellow-800 dark:text-yellow-200">
                System Alerts ({alerts.length})
              </Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {alert.title}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {alert.message}
                    </p>
                  </div>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    {formatDate(alert.createdAt, 'MMM d, HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.users.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{stats.users.newThisMonth} this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.users.growth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.users.growth)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          </Card.Content>
        </Card>

        {/* Workouts */}
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Workouts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.workouts.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.workouts.thisMonth} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FireIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.workouts.growth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.workouts.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.workouts.growth)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          </Card.Content>
        </Card>

        {/* Resources */}
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resources
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.resources.published}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(stats.resources.views)} views
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.resources.growth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stats.resources.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.resources.growth)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                engagement
              </span>
            </div>
          </Card.Content>
        </Card>

        {/* System Health */}
        <Card>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  System Health
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.system.uptime}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.system.errors} errors today
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Storage: {formatStorage(stats.system.totalStorage)}</span>
                <span>Bandwidth: {formatStorage(stats.system.bandwidth)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/app/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <UsersIcon className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/app/admin/resources">
              <Button variant="outline" className="w-full justify-start">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Manage Resources
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Recent Users</Card.Title>
              <Link to="/app/admin/users">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt, 'MMM d')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent users
              </p>
            )}
          </Card.Content>
        </Card>

        {/* Recent Resources */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Recent Resources</Card.Title>
              <Link to="/app/admin/resources">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {recentResources.length > 0 ? (
              <div className="space-y-3">
                {recentResources.map((resource) => (
                  <div key={resource._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {resource.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {resource.type} • {resource.category}
                        </span>
                        <div className="flex items-center ml-4 text-xs text-gray-500 dark:text-gray-400">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          {resource.views}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(resource.createdAt, 'MMM d')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        resource.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {resource.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent resources
              </p>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
