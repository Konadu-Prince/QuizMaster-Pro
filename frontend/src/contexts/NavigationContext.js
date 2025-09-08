/**
 * Navigation Context - Manages navigation state and breadcrumbs
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Route to breadcrumb mapping
  const routeMap = {
    '/': { label: 'Home', icon: '🏠' },
    '/quizzes': { label: 'Quizzes', icon: '📚' },
    '/quizzes/:id': { label: 'Quiz Details', icon: '📖' },
    '/quiz/create': { label: 'Create Quiz', icon: '➕' },
    '/quiz/:id/take': { label: 'Take Quiz', icon: '✏️' },
    '/quiz/:id/results/:attemptId': { label: 'Quiz Results', icon: '📊' },
    '/dashboard': { label: 'Dashboard', icon: '📈' },
    '/my-quizzes': { label: 'My Quizzes', icon: '📝' },
    '/profile': { label: 'Profile', icon: '👤' },
    '/settings': { label: 'Settings', icon: '⚙️' },
    '/leaderboard': { label: 'Leaderboard', icon: '🏆' },
    '/pricing': { label: 'Pricing', icon: '💳' },
    '/help': { label: 'Help & Support', icon: '❓' },
    '/about': { label: 'About', icon: 'ℹ️' },
    '/contact': { label: 'Contact', icon: '📧' },
    '/login': { label: 'Login', icon: '🔐' },
    '/register': { label: 'Register', icon: '📝' }
  };

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = useCallback((pathname) => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbList = [{ label: 'Home', path: '/', icon: '🏠' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check if this is a dynamic route (contains :id, etc.)
      const routeKey = Object.keys(routeMap).find(key => {
        const keySegments = key.split('/').filter(s => s);
        const currentSegments = currentPath.split('/').filter(s => s);
        
        if (keySegments.length !== currentSegments.length) return false;
        
        return keySegments.every((keySegment, i) => {
          return keySegment.startsWith(':') || keySegment === currentSegments[i];
        });
      });

      if (routeKey) {
        const routeInfo = routeMap[routeKey];
        breadcrumbList.push({
          label: routeInfo.label,
          path: currentPath,
          icon: routeInfo.icon,
          isLast: index === pathSegments.length - 1
        });
      } else {
        // Fallback for unknown routes
        breadcrumbList.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          icon: '📄',
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbList;
  }, []);

  // Update breadcrumbs when route changes
  useEffect(() => {
    const newBreadcrumbs = generateBreadcrumbs(location.pathname);
    setBreadcrumbs(newBreadcrumbs);

    // Add to navigation history
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== location.pathname) {
        newHistory.push(location.pathname);
        // Keep only last 10 navigation items
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      return newHistory;
    });
  }, [location.pathname, generateBreadcrumbs]);

  // Navigation helper functions
  const goBack = () => {
    if (navigationHistory.length > 1) {
      window.history.back();
    }
  };

  const canGoBack = navigationHistory.length > 1;

  // Get current page info
  const getCurrentPageInfo = () => {
    const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    return currentBreadcrumb || { label: 'Page', icon: '📄' };
  };

  // Get navigation suggestions based on current route
  const getNavigationSuggestions = () => {
    const suggestions = [];
    const currentPath = location.pathname;

    // Add contextual navigation suggestions
    if (currentPath.startsWith('/quiz/') && currentPath.includes('/take')) {
      suggestions.push({
        label: 'View All Quizzes',
        path: '/quizzes',
        icon: '📚',
        description: 'Browse more quizzes'
      });
    }

    if (currentPath === '/dashboard') {
      suggestions.push(
        {
          label: 'Create Quiz',
          path: '/quiz/create',
          icon: '➕',
          description: 'Create a new quiz'
        },
        {
          label: 'My Quizzes',
          path: '/my-quizzes',
          icon: '📝',
          description: 'Manage your quizzes'
        }
      );
    }

    if (currentPath === '/quizzes') {
      suggestions.push(
        {
          label: 'Create Quiz',
          path: '/quiz/create',
          icon: '➕',
          description: 'Create your own quiz'
        },
        {
          label: 'Leaderboard',
          path: '/leaderboard',
          icon: '🏆',
          description: 'See top performers'
        }
      );
    }

    return suggestions;
  };

  const value = {
    breadcrumbs,
    navigationHistory,
    currentPage: getCurrentPageInfo(),
    goBack,
    canGoBack,
    getNavigationSuggestions,
    isCurrentRoute: (path) => location.pathname === path,
    isActiveRoute: (path) => location.pathname.startsWith(path)
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationContext;
