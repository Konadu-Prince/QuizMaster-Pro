const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client with error handling
let redis;
try {
  redis = new Redis(redisConfig);
} catch (error) {
  logger.warn('Redis not available, running without caching', { error: error.message });
  redis = null;
}

// Redis event handlers (only if redis is available)
if (redis) {
  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('ready', () => {
    logger.info('Redis is ready to accept commands');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error', error);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });
}

// Cache utility functions
const cache = {
  // Set cache with TTL
  async set(key, value, ttl = 3600) {
    if (!redis) return;
    try {
      const serializedValue = JSON.stringify(value);
      await redis.setex(key, ttl, serializedValue);
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  },

  // Get cache
  async get(key) {
    if (!redis) return null;
    try {
      const value = await redis.get(key);
      if (value) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  },

  // Delete cache
  async del(key) {
    if (!redis) return;
    try {
      await redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  },

  // Delete multiple keys
  async delPattern(pattern) {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`Cache deleted pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
    }
  },

  // Check if key exists
  async exists(key) {
    if (!redis) return false;
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  },

  // Set cache with expiration
  async setex(key, value, ttl) {
    return this.set(key, value, ttl);
  },

  // Increment counter
  async incr(key, ttl = 3600) {
    if (!redis) return 0;
    try {
      const value = await redis.incr(key);
      if (value === 1) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Cache increment error', { key, error: error.message });
      return 0;
    }
  },

  // Get cache statistics
  async getStats() {
    if (!redis) return { connected: false };
    try {
      const info = await redis.info('memory');
      const keyspace = await redis.info('keyspace');
      return {
        memory: info,
        keyspace: keyspace,
        connected: redis.status === 'ready'
      };
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return { connected: false };
    }
  }
};

// Cache key generators
const cacheKeys = {
  user: (id) => `user:${id}`,
  quiz: (id) => `quiz:${id}`,
  quizList: (page, limit, filters) => `quiz:list:${page}:${limit}:${JSON.stringify(filters)}`,
  userQuizzes: (userId, page, limit) => `user:${userId}:quizzes:${page}:${limit}`,
  quizAttempts: (userId, page, limit) => `user:${userId}:attempts:${page}:${limit}`,
  leaderboard: (type, limit) => `leaderboard:${type}:${limit}`,
  achievements: (userId) => `achievements:${userId}`,
  subscription: (userId) => `subscription:${userId}`,
  analytics: (type, period) => `analytics:${type}:${period}`,
  rateLimit: (ip, endpoint) => `rate:${ip}:${endpoint}`,
};

// Cache middleware
const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const cachedData = await cache.get(key);
      
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }
      
      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        cache.set(key, data, ttl);
        res.set('X-Cache', 'MISS');
        
        // Call original json method
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error.message });
      next();
    }
  };
};

// Cache invalidation helpers
const cacheInvalidation = {
  // Invalidate user-related caches
  async invalidateUser(userId) {
    await cache.del(cacheKeys.user(userId));
    await cache.delPattern(`user:${userId}:*`);
  },

  // Invalidate quiz-related caches
  async invalidateQuiz(quizId) {
    await cache.del(cacheKeys.quiz(quizId));
    await cache.delPattern('quiz:list:*');
    await cache.delPattern('leaderboard:*');
  },

  // Invalidate achievement caches
  async invalidateAchievements(userId) {
    await cache.del(cacheKeys.achievements(userId));
    await cache.delPattern('leaderboard:*');
  },

  // Invalidate subscription caches
  async invalidateSubscription(userId) {
    await cache.del(cacheKeys.subscription(userId));
  },

  // Invalidate analytics caches
  async invalidateAnalytics() {
    await cache.delPattern('analytics:*');
  }
};

module.exports = {
  redis,
  cache,
  cacheKeys,
  cacheMiddleware,
  cacheInvalidation
};
