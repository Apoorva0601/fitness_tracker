import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { useDebounce } from '../../hooks/useCommon';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    sort: 'newest',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, filters]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...filters,
      };

      const response = await adminService.getUsers(params);
      const data = response.data.data;
      
      if (page === 1) {
        setUsers(data.users);
      } else {
        setUsers(prev => [...prev, ...data.users]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      setActionLoading(true);
      let response;
      
      switch (action) {
        case 'toggle-role':
          response = await adminService.updateUserRole(userId, data.role);
          toast.success(`User role updated to ${data.role}`);
          break;
        case 'toggle-status':
          if (data.isActive) {
            response = await adminService.activateUser(userId);
            toast.success('User activated');
          } else {
            response = await adminService.deactivateUser(userId);
            toast.success('User deactivated');
          }
          break;
        case 'delete':
          await adminService.deleteUser(userId);
          toast.success('User deleted');
          setUsers(prev => prev.filter(user => user._id !== userId));
          setShowDeleteModal(false);
          return;
        default:
          return;
      }

      // Update user in the list
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, ...response.data.data } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, ...response.data.data });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !loading) {
      fetchUsers(pagination.currentPage + 1);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  const formatUserStats = (stats) => {
    if (!stats) return 'No activity';
    return `${stats.totalWorkouts || 0} workouts • ${Math.round(stats.totalDuration / 60) || 0}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage users, roles, and permissions
        </p>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <Input.Select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </Input.Select>

            {/* Status Filter */}
            <Input.Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Input.Select>

            {/* Sort */}
            <Input.Select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="activity">Most Active</option>
            </Input.Select>
          </div>
        </Card.Content>
      </Card>

      {/* Users List */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>
              Users ({pagination.totalUsers})
            </Card.Title>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.values(filters).filter(v => v && v !== 'newest').length} filters applied
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {loading && users.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSpinner.Card key={index} />
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden flex-shrink-0">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-full h-full text-gray-400" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? (
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                          ) : null}
                          {user.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                          {user.isActive ? (
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <XMarkIcon className="w-3 h-3 mr-1" />
                          )}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Joined {formatDate(user.createdAt, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{formatUserStats(user.stats)}</span>
                        {user.lastLoginAt && (
                          <>
                            <span>•</span>
                            <span>Last seen {formatDate(user.lastLoginAt, 'MMM d')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUserModal(user)}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserAction(user._id, 'toggle-role', {
                        role: user.role === 'admin' ? 'user' : 'admin'
                      })}
                      disabled={actionLoading}
                    >
                      {user.role === 'admin' ? (
                        <ShieldExclamationIcon className="w-4 h-4" />
                      ) : (
                        <ShieldCheckIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserAction(user._id, 'toggle-status', {
                        isActive: !user.isActive
                      })}
                      disabled={actionLoading}
                    >
                      {user.isActive ? (
                        <NoSymbolIcon className="w-4 h-4" />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {pagination.hasNext && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    loading={loading}
                    disabled={loading}
                  >
                    Load More Users
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <UserCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery || Object.values(filters).some(v => v && v !== 'newest') 
                  ? "Try adjusting your search or filters"
                  : "No users have registered yet"
                }
              </p>
              {(searchQuery || Object.values(filters).some(v => v && v !== 'newest')) && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ role: '', status: '', sort: 'newest' });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedUser.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.isActive)}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.stats?.totalWorkouts || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((selectedUser.stats?.totalDuration || 0) / 60)}h
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.stats?.caloriesBurned || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.stats?.currentStreak || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
              </div>
            </div>

            {/* Profile Information */}
            {selectedUser.profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Profile Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedUser.profile.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Age:</span>
                        <span className="text-gray-900 dark:text-white">{selectedUser.profile.age}</span>
                      </div>
                    )}
                    {selectedUser.profile.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                        <span className="text-gray-900 dark:text-white capitalize">{selectedUser.profile.gender}</span>
                      </div>
                    )}
                    {selectedUser.profile.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Height:</span>
                        <span className="text-gray-900 dark:text-white">{selectedUser.profile.height} cm</span>
                      </div>
                    )}
                    {selectedUser.profile.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                        <span className="text-gray-900 dark:text-white">{selectedUser.profile.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Fitness Goals
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedUser.profile.fitnessGoal && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Goal:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {selectedUser.profile.fitnessGoal.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    {selectedUser.profile.activityLevel && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Activity:</span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {selectedUser.profile.activityLevel.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(selectedUser.createdAt, 'MMMM d, yyyy')}
                  </span>
                </div>
                {selectedUser.lastLoginAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedUser.lastLoginAt, 'MMMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
              This action cannot be undone and will permanently delete all their data.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleUserAction(selectedUser._id, 'delete')}
                loading={actionLoading}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
