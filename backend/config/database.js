const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
  retryWrites: true,
  retryReads: true,
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster-pro', dbConfig);

    logger.info('MongoDB Connected', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
      readyState: conn.connection.readyState
    });

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
      // Create indexes after connection is established
      optimizeDatabase.createIndexes();
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('Database connection error', error);
    console.log('Running without database connection...');
    // Don't exit the process, just log the error
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const stats = await mongoose.connection.db.stats();
    
    return {
      status: state === 1 ? 'connected' : 'disconnected',
      readyState: state,
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      }
    };
  } catch (error) {
    logger.error('Database health check error', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Database optimization functions
const optimizeDatabase = {
  // Create indexes for better performance
  async createIndexes() {
    try {
      const User = require('../models/User');
      const Quiz = require('../models/Quiz');
      const QuizAttempt = require('../models/QuizAttempt');
      const Subscription = require('../models/Subscription');
      const Achievement = require('../models/Achievement');
      const UserAchievement = require('../models/UserAchievement');
      const UserStats = require('../models/UserStats');

      // User indexes
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
      await User.collection.createIndex({ createdAt: -1 });

      // Quiz indexes
      await Quiz.collection.createIndex({ author: 1, createdAt: -1 });
      await Quiz.collection.createIndex({ isPublished: 1, createdAt: -1 });
      await Quiz.collection.createIndex({ title: 'text', description: 'text' });
      await Quiz.collection.createIndex({ tags: 1 });
      await Quiz.collection.createIndex({ difficulty: 1 });

      // QuizAttempt indexes
      await QuizAttempt.collection.createIndex({ user: 1, createdAt: -1 });
      await QuizAttempt.collection.createIndex({ quiz: 1, createdAt: -1 });
      await QuizAttempt.collection.createIndex({ score: -1 });
      await QuizAttempt.collection.createIndex({ completedAt: -1 });

      // Subscription indexes
      await Subscription.collection.createIndex({ user: 1 }, { unique: true });
      await Subscription.collection.createIndex({ plan: 1 });
      await Subscription.collection.createIndex({ status: 1 });

      // Achievement indexes
      await Achievement.collection.createIndex({ category: 1 });
      await Achievement.collection.createIndex({ type: 1 });
      await Achievement.collection.createIndex({ rarity: 1 });

      // UserAchievement indexes
      await UserAchievement.collection.createIndex({ user: 1, achievement: 1 }, { unique: true });
      await UserAchievement.collection.createIndex({ user: 1, isUnlocked: 1 });
      await UserAchievement.collection.createIndex({ unlockedAt: -1 });

      // UserStats indexes
      await UserStats.collection.createIndex({ user: 1 }, { unique: true });
      await UserStats.collection.createIndex({ totalScore: -1 });
      await UserStats.collection.createIndex({ level: -1 });
      await UserStats.collection.createIndex({ experiencePoints: -1 });

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes', error);
    }
  },

  // Analyze query performance
  async analyzePerformance() {
    try {
      const stats = await mongoose.connection.db.stats();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      const analysis = {
        database: {
          size: stats.dataSize,
          collections: stats.collections,
          indexes: stats.indexes,
          objects: stats.objects
        },
        collections: collections.map(col => ({
          name: col.name,
          type: col.type,
          options: col.options
        }))
      };

      logger.info('Database performance analysis', analysis);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing database performance', error);
      return null;
    }
  }
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  optimizeDatabase
};
