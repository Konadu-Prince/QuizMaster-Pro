const logger = require('../utils/logger');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override res.send
  res.send = function(data) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    // Calculate memory delta
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };
    
    // Log performance metrics
    const performanceData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      memoryDelta: {
        rss: `${Math.round(memoryDelta.rss / 1024)}KB`,
        heapUsed: `${Math.round(memoryDelta.heapUsed / 1024)}KB`,
      },
      contentLength: res.get('Content-Length') || 0,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user ? req.user._id : null,
    };
    
    // Log slow requests
    if (duration > 1000) {
      logger.logPerformance('Slow Request', duration, performanceData);
    }
    
    // Log high memory usage
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // 10MB
      logger.logPerformance('High Memory Usage', duration, {
        ...performanceData,
        memoryDelta: {
          rss: `${Math.round(memoryDelta.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`,
        },
      });
    }
    
    // Add performance headers
    res.set('X-Response-Time', duration.toString());
    res.set('X-Memory-Usage', `${Math.round(memoryDelta.heapUsed / 1024)}KB`);
    
    // Call original send
    originalSend.call(this, data);
  };
  
  // Override res.json
  res.json = function(data) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    // Calculate memory delta
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };
    
    // Log performance metrics
    const performanceData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      memoryDelta: {
        rss: `${Math.round(memoryDelta.rss / 1024)}KB`,
        heapUsed: `${Math.round(memoryDelta.heapUsed / 1024)}KB`,
      },
      contentLength: JSON.stringify(data).length,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user ? req.user._id : null,
    };
    
    // Log slow requests
    if (duration > 1000) {
      logger.logPerformance('Slow Request', duration, performanceData);
    }
    
    // Log high memory usage
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // 10MB
      logger.logPerformance('High Memory Usage', duration, {
        ...performanceData,
        memoryDelta: {
          rss: `${Math.round(memoryDelta.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`,
        },
      });
    }
    
    // Add performance headers
    res.set('X-Response-Time', duration.toString());
    res.set('X-Memory-Usage', `${Math.round(memoryDelta.heapUsed / 1024)}KB`);
    
    // Call original json
    originalJson.call(this, data);
  };
  
  next();
};

// Database query performance monitoring
const dbPerformanceMonitor = (req, res, next) => {
  const mongoose = require('mongoose');
  const originalExec = mongoose.Query.prototype.exec;
  
  mongoose.Query.prototype.exec = function() {
    const startTime = Date.now();
    const query = this;
    
    return originalExec.apply(this, arguments).then((result) => {
      const duration = Date.now() - startTime;
      
      // Log slow database queries
      if (duration > 100) { // Log queries taking more than 100ms
        logger.logPerformance('Slow Database Query', duration, {
          collection: query.mongooseCollection.name,
          operation: query.op,
          filter: query.getFilter(),
          options: query.getOptions(),
          duration: `${duration}ms`,
        });
      }
      
      return result;
    }).catch((error) => {
      const duration = Date.now() - startTime;
      
      logger.logPerformance('Database Query Error', duration, {
        collection: query.mongooseCollection.name,
        operation: query.op,
        filter: query.getFilter(),
        error: error.message,
        duration: `${duration}ms`,
      });
      
      throw error;
    });
  };
  
  next();
};

// Memory usage monitoring
const memoryMonitor = () => {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };
    
    // Log high memory usage
    if (memoryUsageMB.heapUsed > 100) { // 100MB
      logger.logPerformance('High Memory Usage', 0, {
        memoryUsage: memoryUsageMB,
        timestamp: new Date().toISOString(),
      });
    }
  }, 30000); // Check every 30 seconds
};

// CPU usage monitoring
const cpuMonitor = () => {
  let lastCpuUsage = process.cpuUsage();
  
  setInterval(() => {
    const currentCpuUsage = process.cpuUsage(lastCpuUsage);
    const cpuPercent = (currentCpuUsage.user + currentCpuUsage.system) / 1000000; // Convert to seconds
    
    // Log high CPU usage
    if (cpuPercent > 0.8) { // 80% CPU usage
      logger.logPerformance('High CPU Usage', cpuPercent * 1000, {
        cpuUsage: {
          user: currentCpuUsage.user,
          system: currentCpuUsage.system,
          percent: Math.round(cpuPercent * 100),
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    lastCpuUsage = process.cpuUsage();
  }, 30000); // Check every 30 seconds
};

module.exports = {
  performanceMonitor,
  dbPerformanceMonitor,
  memoryMonitor,
  cpuMonitor
};


