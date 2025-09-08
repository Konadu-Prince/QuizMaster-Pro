/**
 * Service Layer Pattern Implementation
 * Provides business logic abstraction and transaction management
 */

const BaseRepository = require('../repositories/BaseRepository');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  // Validation methods
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
    }
  }

  // Data sanitization
  sanitizeInput(data) {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Business logic methods
  async create(data) {
    try {
      const sanitizedData = this.sanitizeInput(data);
      return await this.repository.create(sanitizedData);
    } catch (error) {
      throw new Error(`Failed to create: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      return await this.repository.findById(id);
    } catch (error) {
      throw new Error(`Failed to find by ID: ${error.message}`);
    }
  }

  async findOne(filter) {
    try {
      return await this.repository.findOne(filter);
    } catch (error) {
      throw new Error(`Failed to find: ${error.message}`);
    }
  }

  async find(filter = {}, options = {}) {
    try {
      return await this.repository.find(filter, options);
    } catch (error) {
      throw new Error(`Failed to find: ${error.message}`);
    }
  }

  async findWithPagination(filter = {}, options = {}) {
    try {
      return await this.repository.findWithPagination(filter, options);
    } catch (error) {
      throw new Error(`Failed to find with pagination: ${error.message}`);
    }
  }

  async updateById(id, data) {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      const sanitizedData = this.sanitizeInput(data);
      return await this.repository.updateById(id, sanitizedData);
    } catch (error) {
      throw new Error(`Failed to update: ${error.message}`);
    }
  }

  async updateOne(filter, data) {
    try {
      const sanitizedData = this.sanitizeInput(data);
      return await this.repository.updateOne(filter, sanitizedData);
    } catch (error) {
      throw new Error(`Failed to update: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      return await this.repository.deleteById(id);
    } catch (error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }
  }

  async deleteOne(filter) {
    try {
      return await this.repository.deleteOne(filter);
    } catch (error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await this.repository.count(filter);
    } catch (error) {
      throw new Error(`Failed to count: ${error.message}`);
    }
  }

  async search(searchTerm, searchFields = [], options = {}) {
    try {
      return await this.repository.search(searchTerm, searchFields, options);
    } catch (error) {
      throw new Error(`Failed to search: ${error.message}`);
    }
  }

  // Transaction support
  async withTransaction(operations) {
    const session = await this.repository.model.db.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const operation of operations) {
          await operation(session);
        }
      });
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  // Audit logging
  async logAudit(action, entityId, userId, details = {}) {
    try {
      const auditLog = {
        action,
        entityId,
        userId,
        details,
        timestamp: new Date(),
        ip: details.ip || 'unknown'
      };
      
      // In a real implementation, you would save this to an audit log collection
      console.log('Audit Log:', auditLog);
    } catch (error) {
      console.error('Failed to log audit:', error.message);
    }
  }

  // Cache management
  async getCached(key) {
    // Implement caching logic here
    return null;
  }

  async setCache(key, value, ttl = 3600) {
    // Implement caching logic here
  }

  async invalidateCache(pattern) {
    // Implement cache invalidation logic here
  }

  // Error handling
  handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return new Error(`Validation failed: ${messages.join(', ')}`);
    }
    
    if (error.name === 'CastError') {
      return new Error(`Invalid ID format: ${error.value}`);
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new Error(`${field} already exists`);
    }
    
    return error;
  }

  // Utility methods
  generateId() {
    return require('crypto').randomBytes(12).toString('hex');
  }

  formatDate(date) {
    return new Date(date).toISOString();
  }

  calculatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      currentPage: page,
      totalPages,
      totalCount: total,
      hasNextPage,
      hasPrevPage,
      limit
    };
  }
}

module.exports = BaseService;
