import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { formatDate } from '../../utils/dateUtils';
import { validatePassword } from '../../utils/validation';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  KeyIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: '',
    activityLevel: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    caloriesBurned: 0,
    streak: 0,
    joinDate: null,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        age: user.profile?.age || '',
        gender: user.profile?.gender || '',
        height: user.profile?.height || '',
        weight: user.profile?.weight || '',
        fitnessGoal: user.profile?.fitnessGoal || '',
        activityLevel: user.profile?.activityLevel || '',
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data.data;
      setStats({
        totalWorkouts: userData.stats?.totalWorkouts || 0,
        totalDuration: userData.stats?.totalDuration || 0,
        caloriesBurned: userData.stats?.caloriesBurned || 0,
        streak: userData.stats?.currentStreak || 0,
        joinDate: userData.createdAt,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key]) {
          formData.append(key, profileForm[key]);
        }
      });

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await userService.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success('Account deleted successfully');
      // User will be automatically logged out by the auth context
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: UserCircleIcon },
    { id: 'stats', label: 'Statistics', icon: TrophyIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-dark-600">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <Card>
          <Card.Header>
            <Card.Title>Profile Information</Card.Title>
            <Card.Description>
              Update your personal information and fitness profile
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    {imagePreview || user?.profileImage ? (
                      <img
                        src={imagePreview || user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700">
                    <CameraIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload a new profile photo (max 5MB)
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  label="Age"
                  type="number"
                  min="13"
                  max="120"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                />
                <Input.Select
                  label="Gender"
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Input.Select>
              </div>

              {/* Physical Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Height (cm)"
                  type="number"
                  min="100"
                  max="250"
                  value={profileForm.height}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={profileForm.weight}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>

              {/* Fitness Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input.Select
                  label="Fitness Goal"
                  value={profileForm.fitnessGoal}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                >
                  <option value="">Select Goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="strength">Strength</option>
                  <option value="general-fitness">General Fitness</option>
                  <option value="maintenance">Maintenance</option>
                </Input.Select>
                <Input.Select
                  label="Activity Level"
                  value={profileForm.activityLevel}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, activityLevel: e.target.value }))}
                >
                  <option value="">Select Level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly-active">Lightly Active</option>
                  <option value="moderately-active">Moderately Active</option>
                  <option value="very-active">Very Active</option>
                  <option value="extremely-active">Extremely Active</option>
                </Input.Select>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <Card.Content>
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrophyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Workouts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalWorkouts}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Duration
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDuration(stats.totalDuration)}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <FireIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Calories Burned
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.caloriesBurned.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content>
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <HeartIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.streak} days
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Profile Stats */}
          <Card>
            <Card.Header>
              <Card.Title>Profile Stats</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user?.profile?.height && (
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.profile.height} cm
                      </p>
                    </div>
                  </div>
                )}
                
                {user?.profile?.weight && (
                  <div className="flex items-center">
                    <ScaleIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.profile.weight} kg
                      </p>
                    </div>
                  </div>
                )}
                
                {user?.profile?.fitnessGoal && (
                  <div className="flex items-center">
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fitness Goal</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {user.profile.fitnessGoal.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.joinDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(stats.joinDate, 'MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <Card.Header>
              <Card.Title>Change Password</Card.Title>
              <Card.Description>
                Update your password to keep your account secure
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200 dark:border-red-800">
            <Card.Header>
              <Card.Title className="text-red-600 dark:text-red-400">
                Delete Account
              </Card.Title>
              <Card.Description>
                Permanently delete your account and all associated data
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This action cannot be undone. This will permanently delete your account,
                workouts, and all associated data.
              </p>
              <Button
                variant="danger"
                onClick={() => setDeleteModalOpen(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
