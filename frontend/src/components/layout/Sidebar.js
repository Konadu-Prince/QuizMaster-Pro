/**
 * Sidebar Navigation Component - For dashboard and settings pages
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  BookOpen, 
  User, 
  Settings, 
  Trophy, 
  Plus,
  HelpCircle,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Palette
} from 'lucide-react';

const Sidebar = ({ type = 'dashboard' }) => {
  const location = useLocation();
  const { user } = useAuth();

  const dashboardItems = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: BarChart3,
      description: 'Your quiz statistics and activity'
    },
    {
      label: 'My Quizzes',
      path: '/my-quizzes',
      icon: BookOpen,
      description: 'Manage your created quizzes'
    },
    {
      label: 'Create Quiz',
      path: '/quiz/create',
      icon: Plus,
      description: 'Create a new quiz'
    },
    {
      label: 'Leaderboard',
      path: '/leaderboard',
      icon: Trophy,
      description: 'See top performers'
    }
  ];

  const settingsItems = [
    {
      label: 'Profile',
      path: '/settings',
      icon: User,
      description: 'Manage your profile information'
    },
    {
      label: 'Security',
      path: '/settings',
      icon: Shield,
      description: 'Password and security settings'
    },
    {
      label: 'Notifications',
      path: '/settings',
      icon: Bell,
      description: 'Email and notification preferences'
    },
    {
      label: 'Privacy',
      path: '/settings',
      icon: Globe,
      description: 'Privacy and visibility settings'
    },
    {
      label: 'Appearance',
      path: '/settings',
      icon: Palette,
      description: 'Theme and display preferences'
    }
  ];

  const generalItems = [
    {
      label: 'Pricing',
      path: '/pricing',
      icon: CreditCard,
      description: 'View subscription plans'
    },
    {
      label: 'Help & Support',
      path: '/help',
      icon: HelpCircle,
      description: 'Get help and support'
    }
  ];

  const getItems = () => {
    switch (type) {
      case 'dashboard':
        return dashboardItems;
      case 'settings':
        return settingsItems;
      default:
        return [...dashboardItems, ...generalItems];
    }
  };

  const isActive = (path) => {
    if (type === 'settings') {
      return location.pathname === '/settings';
    }
    return location.pathname === path;
  };

  const items = getItems();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-full">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
            {type === 'dashboard' ? 'Dashboard' : 'Settings'}
          </span>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="flex-1">
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {type === 'dashboard' && user && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
