/**
 * Breadcrumb Component - Shows navigation path
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

const Breadcrumb = () => {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumb for home page
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index === 0 ? (
            <Link
              to={breadcrumb.path}
              className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to={breadcrumb.path}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                breadcrumb.isLast 
                  ? 'text-gray-900 dark:text-white font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="mr-1">{breadcrumb.icon}</span>
              {breadcrumb.label}
            </Link>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
