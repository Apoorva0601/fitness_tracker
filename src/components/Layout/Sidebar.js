import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useCommon';
import {
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UserIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },
    { name: 'Workouts', href: '/app/workouts', icon: ClipboardDocumentListIcon },
    { name: 'Resources', href: '/app/resources', icon: BookOpenIcon },
    { name: 'Profile', href: '/app/profile', icon: UserIcon },
  ];

  const adminMenuItems = [
    { name: 'Admin Dashboard', href: '/app/admin', icon: ChartBarIcon },
    { name: 'Manage Users', href: '/app/admin/users', icon: UserGroupIcon },
    { name: 'Manage Resources', href: '/app/admin/resources', icon: DocumentTextIcon },
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 
        transform transition-transform duration-300 ease-in-out
        ${isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'}
        ${isMobile ? 'shadow-xl' : ''}
      `}>
        {/* Logo/Brand */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FitTrack</span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Administration
                </p>
              </div>
              {adminMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
