const rateLimit = require('express-rate-limit');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Custom rate limit store using Redis
const createCustomStore = () => {
  return {
    async increment(key, cb) {
      try {
        const count = await cache.incr(key, 3600); // 1 hour TTL
        const ttl = await cache.redis.ttl(key);
        if (cb) {
          cb(null, count, new Date(Date.now() + ttl * 1000));
        }
        return { count, resetTime: new Date(Date.now() + ttl * 1000) };
      } catch (error) {
        logger.error('Rate limit store error', { key, error: error.message });
        if (cb) {
          cb(error, 0, new Date());
        }
        return { count: 0, resetTime: new Date() };
      }
    },

    async decrement(key) {
      try {
        await cache.redis.decr(key);
      } catch (error) {
        logger.error('Rate limit decrement error', { key, error: error.message });
      }
    },

    async resetKey(key) {
      try {
        await cache.del(key);
      } catch (error) {
        logger.error('Rate limit reset error', { key, error: error.message });
      }
    }
  };
};

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createCustomStore(),
  keyGenerator: (req) => {
    return `rate:general:${req.ip}`;
  },
  handler: (req, res) => {
    logger.logSecurity('Rate Limit Exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user ? req.user._id : null,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createCustomStore(),
  keyGenerator: (req) => {
    return `rate:auth:${req.ip}`;
  },
  handler: (req, res) => {
    logger.logSecurity('Auth Rate Limit Exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Quiz creation rate limiter
const quizCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 quiz creations per hour
  message: {
    success: false,
    message: 'Quiz creation limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createCustomStore(),
  keyGenerator: (req) => {
    return `rate:quiz:create:${req.user ? req.user._id : req.ip}`;
  },
  handler: (req, res) => {
    logger.logSecurity('Quiz Creation Rate Limit Exceeded', {
      ip: req.ip,
      userId: req.user ? req.user._id : null,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      success: false,
      message: 'Quiz creation limit exceeded, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// Quiz taking rate limiter
const quizTakingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each user to 5 quiz attempts per minute
  message: {
    success: false,
    message: 'Too many quiz attempts, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createCustomStore(),
  keyGenerator: (req) => {
    return `rate:quiz:take:${req.user ? req.user._id : req.ip}`;
  },
  handler: (req, res) => {
    logger.logSecurity('Quiz Taking Rate Limit Exceeded', {
      ip: req.ip,
      userId: req.user ? req.user._id : null,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many quiz attempts, please slow down.',
      retryAfter: '1 minute'
    });
  }
});

// API key rate limiter (for future API access)
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each API key to 100 requests per minute
  message: {
    success: false,
    message: 'API rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createCustomStore(),
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    return `rate:api:${apiKey || req.ip}`;
  },
  handler: (req, res) => {
    logger.logSecurity('API Rate Limit Exceeded', {
      ip: req.ip,
      apiKey: req.headers['x-api-key'] || 'none',
      userAgent: req.get('User-Agent'),
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'API rate limit exceeded.',
      retryAfter: '1 minute'
    });
  }
});

// Dynamic rate limiter based on user subscription
const subscriptionBasedLimiter = (baseLimit, multiplier = 1) => {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: async (req) => {
      if (!req.user) return baseLimit;
      
      try {
        // Get user subscription from cache or database
        const subscription = await cache.get(`subscription:${req.user._id}`);
        if (subscription) {
          switch (subscription.plan) {
            case 'free':
              return baseLimit;
            case 'pro':
              return baseLimit * 5;
            case 'enterprise':
              return baseLimit * 20;
            default:
              return baseLimit;
          }
        }
        return baseLimit;
      } catch (error) {
        logger.error('Subscription rate limit error', { error: error.message });
        return baseLimit;
      }
    },
    message: {
      success: false,
      message: 'Rate limit exceeded for your subscription plan.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createCustomStore(),
    keyGenerator: (req) => {
      return `rate:subscription:${req.user ? req.user._id : req.ip}`;
    }
  });
};

// Rate limit status endpoint
const getRateLimitStatus = async (req, res) => {
  try {
    const ip = req.ip;
    const userId = req.user ? req.user._id : null;
    
    const status = {
      ip: ip,
      userId: userId,
      limits: {
        general: await cache.get(`rate:general:${ip}`) || 0,
        auth: await cache.get(`rate:auth:${ip}`) || 0,
        quizCreation: await cache.get(`rate:quiz:create:${userId || ip}`) || 0,
        quizTaking: await cache.get(`rate:quiz:take:${userId || ip}`) || 0,
      }
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Rate limit status error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching rate limit status'
    });
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  quizCreationLimiter,
  quizTakingLimiter,
  apiKeyLimiter,
  subscriptionBasedLimiter,
  getRateLimitStatus
};
