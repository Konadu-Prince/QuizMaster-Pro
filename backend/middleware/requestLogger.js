const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom morgan token for response time
morgan.token('response-time', (req, res) => {
  return res.get('X-Response-Time');
});

// Custom morgan token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : '-';
});

// Custom morgan token for request body (for POST/PUT requests)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    // Don't log sensitive data
    const sensitiveFields = ['password', 'token', 'secret'];
    const body = { ...req.body };
    
    sensitiveFields.forEach(field => {
      if (body[field]) {
        body[field] = '[REDACTED]';
      }
    });
    
    return JSON.stringify(body);
  }
  return '-';
});

// Custom morgan token for query parameters
morgan.token('query', (req) => {
  return Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '-';
});

// Create custom format
const customFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :query :body';

// Create morgan middleware
const requestLogger = morgan(customFormat, {
  stream: {
    write: (message) => {
      // Parse the morgan log message
      const logData = parseMorganMessage(message);
      
      // Log to winston
      if (logData.status >= 400) {
        logger.warn('HTTP Request', logData);
      } else {
        logger.http('HTTP Request', logData);
      }
    }
  }
});

// Function to parse morgan message
function parseMorganMessage(message) {
  // Remove trailing newline
  const cleanMessage = message.trim();
  
  // Parse the log format
  const regex = /^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) HTTP\/(\S+)" (\d+) (\S+) "([^"]*)" "([^"]*)" (\d+) ms (\S+) (\S+)$/;
  const match = cleanMessage.match(regex);
  
  if (!match) {
    return { raw: cleanMessage };
  }
  
  const [
    ,
    remoteAddr,
    userId,
    date,
    method,
    url,
    httpVersion,
    status,
    contentLength,
    referrer,
    userAgent,
    responseTime,
    query,
    body
  ] = match;
  
  return {
    remoteAddr,
    userId: userId === '-' ? null : userId,
    date,
    method,
    url,
    httpVersion,
    status: parseInt(status),
    contentLength: contentLength === '-' ? 0 : parseInt(contentLength),
    referrer: referrer === '-' ? null : referrer,
    userAgent,
    responseTime: parseInt(responseTime),
    query: query === '-' ? null : JSON.parse(query),
    body: body === '-' ? null : JSON.parse(body)
  };
}

// Middleware to add response time header
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Override the end method to set response time header before sending
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    res.set('X-Response-Time', duration.toString());
    
    // Log performance metrics for slow requests
    if (duration > 1000) { // Log requests taking more than 1 second
      logger.logPerformance('Slow Request', duration, {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        userId: req.user ? req.user._id : null,
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware to log business events
const businessEventLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log business events based on successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const businessEvents = {
        'POST /api/auth/register': 'User Registration',
        'POST /api/auth/login': 'User Login',
        'POST /api/quizzes': 'Quiz Created',
        'POST /api/quiz-attempts': 'Quiz Attempt Started',
        'PATCH /api/quiz-attempts/:id/complete': 'Quiz Completed',
        'POST /api/subscriptions/create': 'Subscription Created',
        'POST /api/subscriptions/cancel': 'Subscription Cancelled',
      };
      
      const eventKey = `${req.method} ${req.route?.path || req.path}`;
      const eventName = businessEvents[eventKey];
      
      if (eventName) {
        logger.logBusiness(eventName, {
          method: req.method,
          url: req.url,
          userId: req.user ? req.user._id : null,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  requestLogger,
  responseTimeMiddleware,
  businessEventLogger
};
