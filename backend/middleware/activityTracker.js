const UserActivity = require('../models/UserActivity');
const logger = require('../utils/logger');

// Activity tracking middleware
const trackActivity = (activityType, category = 'system', action = 'request') => {
  return async (req, res, next) => {
    try {
      // Skip tracking for certain routes
      const skipRoutes = ['/health', '/api/analytics/track', '/api/rate-limit-status'];
      if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
      }

      // Only track for authenticated users
      if (!req.user) {
        return next();
      }

      // Extract metadata
      const metadata = {
        page: req.path,
        route: req.route?.path || req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        responseTime: res.get('X-Response-Time'),
        statusCode: res.statusCode,
      };

      // Add quiz-specific metadata
      if (req.params.quizId) {
        metadata.quizId = req.params.quizId;
      }

      // Add user-specific metadata
      if (req.user) {
        metadata.userId = req.user._id;
        metadata.userRole = req.user.role;
      }

      // Create activity record
      const activityData = {
        user: req.user._id,
        sessionId: req.sessionID || req.headers['x-session-id'],
        activity: {
          type: activityType,
          category,
          action,
          description: `${req.method} ${req.path}`,
        },
        metadata,
        ip: req.ip,
      };

      // Track activity asynchronously (don't block the request)
      setImmediate(async () => {
        try {
          await UserActivity.create(activityData);
        } catch (error) {
          logger.error('Activity tracking error', { error: error.message, activityData });
        }
      });

      next();
    } catch (error) {
      logger.error('Activity tracking middleware error', error);
      next();
    }
  };
};

// Specific activity trackers
const trackers = {
  // Page view tracking
  pageView: trackActivity('page_view', 'navigation', 'view'),
  
  // Quiz activity tracking
  quizStart: trackActivity('quiz_start', 'quiz', 'start'),
  quizComplete: trackActivity('quiz_complete', 'quiz', 'complete'),
  quizAbandon: trackActivity('quiz_abandon', 'quiz', 'abandon'),
  
  // User activity tracking
  login: trackActivity('login', 'user', 'login'),
  logout: trackActivity('logout', 'user', 'logout'),
  register: trackActivity('register', 'user', 'register'),
  profileUpdate: trackActivity('profile_update', 'user', 'update'),
  
  // System activity tracking
  apiCall: trackActivity('api_call', 'system', 'call'),
  error: trackActivity('error', 'system', 'error'),
  
  // Engagement tracking
  share: trackActivity('share', 'engagement', 'share'),
  download: trackActivity('download', 'engagement', 'download'),
  search: trackActivity('search', 'engagement', 'search'),
  filter: trackActivity('filter', 'engagement', 'filter'),
};

// Business event tracking
const trackBusinessEvent = (eventType, eventData = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next();
      }

      const activityData = {
        user: req.user._id,
        sessionId: req.sessionID || req.headers['x-session-id'],
        activity: {
          type: 'custom',
          category: 'business',
          action: eventType,
          description: `Business event: ${eventType}`,
        },
        metadata: {
          ...eventData,
          page: req.path,
          method: req.method,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        },
        ip: req.ip,
      };

      // Track business event asynchronously
      setImmediate(async () => {
        try {
          await UserActivity.create(activityData);
          logger.logBusiness(`Business Event: ${eventType}`, {
            userId: req.user._id,
            eventData,
          });
        } catch (error) {
          logger.error('Business event tracking error', { error: error.message, activityData });
        }
      });

      next();
    } catch (error) {
      logger.error('Business event tracking middleware error', error);
      next();
    }
  };
};

// Performance tracking middleware
const trackPerformance = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Track slow requests
    if (duration > 1000) {
      setImmediate(async () => {
        try {
          if (req.user) {
            await UserActivity.create({
              user: req.user._id,
              sessionId: req.sessionID || req.headers['x-session-id'],
              activity: {
                type: 'custom',
                category: 'system',
                action: 'slow_request',
                description: `Slow request: ${req.method} ${req.path}`,
              },
              metadata: {
                page: req.path,
                method: req.method,
                duration,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
              },
              ip: req.ip,
            });
          }
        } catch (error) {
          logger.error('Performance tracking error', { error: error.message });
        }
      });
    }
  });
  
  next();
};

// Error tracking middleware
const trackError = (error, req, res, next) => {
  if (req.user) {
    setImmediate(async () => {
      try {
        await UserActivity.create({
          user: req.user._id,
          sessionId: req.sessionID || req.headers['x-session-id'],
          activity: {
            type: 'error',
            category: 'system',
            action: 'error_occurred',
            description: `Error: ${error.message}`,
          },
          metadata: {
            page: req.path,
            method: req.method,
            errorCode: error.code,
            errorMessage: error.message,
            stackTrace: error.stack,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          },
          ip: req.ip,
        });
      } catch (trackingError) {
        logger.error('Error tracking error', { error: trackingError.message });
      }
    });
  }
  
  next(error);
};

module.exports = {
  trackActivity,
  trackers,
  trackBusinessEvent,
  trackPerformance,
  trackError,
};


