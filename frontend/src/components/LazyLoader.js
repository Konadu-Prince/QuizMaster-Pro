/**
 * Lazy Loader Component - Optimized loading with suspense
 */

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Lazy load components
export const LazyHome = lazy(() => import('../pages/Home'));
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyQuizList = lazy(() => import('../pages/quiz/QuizList'));
export const LazyQuizCreate = lazy(() => import('../pages/quiz/QuizCreate'));
export const LazyQuizTake = lazy(() => import('../pages/quiz/QuizTake'));
export const LazyQuizResults = lazy(() => import('../pages/quiz/QuizResults'));
export const LazyQuizDetail = lazy(() => import('../pages/quiz/QuizDetail'));
export const LazyMyQuizzes = lazy(() => import('../pages/MyQuizzes'));
export const LazySettings = lazy(() => import('../pages/Settings'));
export const LazyProfile = lazy(() => import('../pages/Profile'));
export const LazyLeaderboard = lazy(() => import('../pages/Leaderboard'));
export const LazyPricing = lazy(() => import('../pages/Pricing'));
export const LazyHelp = lazy(() => import('../pages/Help'));
export const LazyAbout = lazy(() => import('../pages/About'));
export const LazyContact = lazy(() => import('../pages/Contact'));
export const LazyLogin = lazy(() => import('../pages/auth/Login'));
export const LazyRegister = lazy(() => import('../pages/auth/Register'));

// Lazy wrapper component
export const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Specific loading components for different pages
export const QuizLoadingSpinner = () => (
  <LoadingSpinner message="Loading quiz..." />
);

export const DashboardLoadingSpinner = () => (
  <LoadingSpinner message="Loading dashboard..." />
);

export const SettingsLoadingSpinner = () => (
  <LoadingSpinner message="Loading settings..." />
);

export default LazyWrapper;
