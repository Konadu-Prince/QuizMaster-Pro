/**
 * Analytics Provider - Track user interactions and performance
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children, location }) => {
  const [analytics, setAnalytics] = useState({
    pageViews: [],
    userInteractions: [],
    performance: [],
    errors: [],
    sessionStart: Date.now()
  });

  // Safety check for location prop
  const safeLocation = location || { pathname: window.location.pathname || '/' };

  // Track page views
  useEffect(() => {
    const pageView = {
      path: safeLocation.pathname,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    setAnalytics(prev => ({
      ...prev,
      pageViews: [...prev.pageViews, pageView]
    }));

    // Track performance metrics
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        const performanceMetrics = {
          page: safeLocation.pathname,
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          timestamp: Date.now()
        };

        setAnalytics(prev => ({
          ...prev,
          performance: [...prev.performance, performanceMetrics]
        }));
      }
    }
  }, [safeLocation.pathname]);

  // Track user interactions
  const trackEvent = (eventName, properties = {}) => {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      page: safeLocation.pathname
    };

    setAnalytics(prev => ({
      ...prev,
      userInteractions: [...prev.userInteractions, event]
    }));

    // Send to analytics service (in production)
    if (process.env.NODE_ENV === 'production') {
      // Example: gtag('event', eventName, properties);
      // Example: analytics.track(eventName, properties);
    }
  };

  // Track errors
  const trackError = (error, context = {}) => {
    const errorEvent = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      page: safeLocation.pathname,
      userAgent: navigator.userAgent
    };

    setAnalytics(prev => ({
      ...prev,
      errors: [...prev.errors, errorEvent]
    }));

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: context });
    }
  };

  // Track quiz interactions
  const trackQuizEvent = (eventType, quizId, data = {}) => {
    trackEvent(`quiz_${eventType}`, {
      quizId,
      ...data
    });
  };

  // Track user engagement
  const trackEngagement = (action, details = {}) => {
    trackEvent('user_engagement', {
      action,
      ...details
    });
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    const sessionDuration = Date.now() - analytics.sessionStart;
    const totalPageViews = analytics.pageViews.length;
    const totalInteractions = analytics.userInteractions.length;
    const totalErrors = analytics.errors.length;

    return {
      sessionDuration,
      totalPageViews,
      totalInteractions,
      totalErrors,
      averagePageLoadTime: analytics.performance.length > 0 
        ? analytics.performance.reduce((sum, p) => sum + p.loadTime, 0) / analytics.performance.length 
        : 0,
      mostVisitedPage: analytics.pageViews.length > 0
        ? analytics.pageViews.reduce((acc, pv) => {
            acc[pv.path] = (acc[pv.path] || 0) + 1;
            return acc;
          }, {})
        : {}
    };
  };

  // Export analytics data
  const exportAnalytics = () => {
    const data = {
      ...analytics,
      summary: getAnalyticsSummary(),
      exportTimestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const value = {
    analytics,
    trackEvent,
    trackError,
    trackQuizEvent,
    trackEngagement,
    getAnalyticsSummary,
    exportAnalytics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
