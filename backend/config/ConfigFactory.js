/**
 * Configuration Factory Pattern
 * Centralizes all configuration management and environment-specific settings
 */

class ConfigFactory {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.buildConfig();
  }

  buildConfig() {
    const baseConfig = {
      server: {
        port: parseInt(process.env.PORT) || 5002,
        host: process.env.HOST || 'localhost',
        environment: this.environment
      },
      database: {
        mongodb: {
          uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizmaster_pro',
          testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/quizmaster_pro_test',
          options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false
          }
        }
      },
      security: {
        jwt: {
          secret: process.env.JWT_SECRET,
          expire: process.env.JWT_EXPIRE || '7d',
          refreshSecret: process.env.JWT_REFRESH_SECRET,
          refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
        },
        bcrypt: {
          saltRounds: 12
        },
        cors: {
          origin: this.getCorsOrigins(),
          credentials: true
        }
      },
      services: {
        email: {
          from: process.env.EMAIL_FROM || 'noreply@quizmasterpro.com',
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          username: process.env.EMAIL_USERNAME,
          password: process.env.EMAIL_PASSWORD,
          secure: this.environment === 'production'
        },
        stripe: {
          secretKey: process.env.STRIPE_SECRET_KEY,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          proPriceId: process.env.STRIPE_PRO_PRICE_ID,
          enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID
        },
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY,
          apiSecret: process.env.CLOUDINARY_API_SECRET
        },
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB) || 0,
          url: process.env.REDIS_URL
        }
      },
      limits: {
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
        },
        fileUpload: {
          maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
          allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',')
        }
      },
      monitoring: {
        sentry: {
          dsn: process.env.SENTRY_DSN
        },
        analytics: {
          googleAnalytics: process.env.GOOGLE_ANALYTICS_ID,
          mixpanel: process.env.MIXPANEL_TOKEN
        },
        logging: {
          level: process.env.LOG_LEVEL || 'info'
        }
      }
    };

    // Environment-specific overrides
    return this.applyEnvironmentOverrides(baseConfig);
  }

  getCorsOrigins() {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    
    if (this.environment === 'production') {
      return [frontendUrl, 'https://quizmasterpro.com', 'https://www.quizmasterpro.com'];
    } else if (this.environment === 'staging') {
      return [frontendUrl, 'https://staging.quizmasterpro.com'];
    } else {
      return [frontendUrl, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
    }
  }

  applyEnvironmentOverrides(config) {
    switch (this.environment) {
      case 'production':
        return {
          ...config,
          server: {
            ...config.server,
            host: '0.0.0.0'
          },
          database: {
            ...config.database,
            mongodb: {
              ...config.database.mongodb,
              options: {
                ...config.database.mongodb.options,
                maxPoolSize: 20,
                serverSelectionTimeoutMS: 10000
              }
            }
          },
          limits: {
            ...config.limits,
            rateLimit: {
              windowMs: 900000, // 15 minutes
              maxRequests: 1000
            }
          }
        };

      case 'staging':
        return {
          ...config,
          limits: {
            ...config.limits,
            rateLimit: {
              windowMs: 900000, // 15 minutes
              maxRequests: 500
            }
          }
        };

      case 'test':
        return {
          ...config,
          database: {
            ...config.database,
            mongodb: {
              ...config.database.mongodb,
              uri: config.database.mongodb.testUri
            }
          },
          services: {
            ...config.services,
            email: {
              ...config.services.email,
              // Use test email service in test environment
              host: 'localhost',
              port: 1025
            }
          }
        };

      default: // development
        return config;
    }
  }

  // Validation methods
  validateRequiredConfig() {
    const required = [
      'security.jwt.secret',
      'services.stripe.secretKey',
      'services.email.host',
      'services.email.username',
      'services.email.password'
    ];

    const missing = [];
    
    required.forEach(path => {
      const value = this.getNestedValue(this.config, path);
      if (!value || value.includes('your-') || value.includes('test_') || value.includes('placeholder')) {
        missing.push(path);
      }
    });

    if (missing.length > 0) {
      throw new Error(`Missing or invalid configuration for: ${missing.join(', ')}`);
    }

    return true;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Getters for specific configurations
  getServerConfig() {
    return this.config.server;
  }

  getDatabaseConfig() {
    return this.config.database;
  }

  getSecurityConfig() {
    return this.config.security;
  }

  getServicesConfig() {
    return this.config.services;
  }

  getLimitsConfig() {
    return this.config.limits;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  // Environment checks
  isProduction() {
    return this.environment === 'production';
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isTest() {
    return this.environment === 'test';
  }

  isStaging() {
    return this.environment === 'staging';
  }
}

// Singleton instance
const configFactory = new ConfigFactory();

module.exports = configFactory;
