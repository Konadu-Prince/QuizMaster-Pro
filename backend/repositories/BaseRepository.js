/**
 * Repository Pattern Implementation
 * Provides a consistent interface for data access operations
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  // Create operations
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Failed to create ${this.model.modelName}: ${error.message}`);
    }
  }

  async createMany(dataArray) {
    try {
      return await this.model.insertMany(dataArray);
    } catch (error) {
      throw new Error(`Failed to create multiple ${this.model.modelName}: ${error.message}`);
    }
  }

  // Read operations
  async findById(id, populate = []) {
    try {
      let query = this.model.findById(id);
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }
      return await query;
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName} by ID: ${error.message}`);
    }
  }

  async findOne(filter, populate = []) {
    try {
      let query = this.model.findOne(filter);
      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }
      return await query;
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName}: ${error.message}`);
    }
  }

  async find(filter = {}, options = {}) {
    try {
      const {
        populate = [],
        sort = {},
        limit = null,
        skip = 0,
        select = null
      } = options;

      let query = this.model.find(filter);

      if (populate.length > 0) {
        populate.forEach(field => {
          query = query.populate(field);
        });
      }

      if (select) {
        query = query.select(select);
      }

      if (Object.keys(sort).length > 0) {
        query = query.sort(sort);
      }

      if (skip > 0) {
        query = query.skip(skip);
      }

      if (limit) {
        query = query.limit(limit);
      }

      return await query;
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName} documents: ${error.message}`);
    }
  }

  async findWithPagination(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        populate = [],
        sort = {},
        select = null
      } = options;

      const skip = (page - 1) * limit;

      const [documents, totalCount] = await Promise.all([
        this.find(filter, { populate, sort, limit, skip, select }),
        this.count(filter)
      ]);

      return {
        data: documents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName} with pagination: ${error.message}`);
    }
  }

  // Update operations
  async updateById(id, data, options = {}) {
    try {
      const { new: returnNew = true, runValidators = true } = options;
      return await this.model.findByIdAndUpdate(
        id,
        data,
        { new: returnNew, runValidators }
      );
    } catch (error) {
      throw new Error(`Failed to update ${this.model.modelName} by ID: ${error.message}`);
    }
  }

  async updateOne(filter, data, options = {}) {
    try {
      const { new: returnNew = true, runValidators = true } = options;
      return await this.model.findOneAndUpdate(
        filter,
        data,
        { new: returnNew, runValidators }
      );
    } catch (error) {
      throw new Error(`Failed to update ${this.model.modelName}: ${error.message}`);
    }
  }

  async updateMany(filter, data, options = {}) {
    try {
      const { runValidators = true } = options;
      return await this.model.updateMany(filter, data, { runValidators });
    } catch (error) {
      throw new Error(`Failed to update multiple ${this.model.modelName}: ${error.message}`);
    }
  }

  // Delete operations
  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete ${this.model.modelName} by ID: ${error.message}`);
    }
  }

  async deleteOne(filter) {
    try {
      return await this.model.findOneAndDelete(filter);
    } catch (error) {
      throw new Error(`Failed to delete ${this.model.modelName}: ${error.message}`);
    }
  }

  async deleteMany(filter) {
    try {
      return await this.model.deleteMany(filter);
    } catch (error) {
      throw new Error(`Failed to delete multiple ${this.model.modelName}: ${error.message}`);
    }
  }

  // Count operations
  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to count ${this.model.modelName}: ${error.message}`);
    }
  }

  // Aggregation operations
  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Failed to aggregate ${this.model.modelName}: ${error.message}`);
    }
  }

  // Search operations
  async search(searchTerm, searchFields = [], options = {}) {
    try {
      if (!searchTerm || searchFields.length === 0) {
        return this.find({}, options);
      }

      const searchConditions = searchFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }));

      const filter = { $or: searchConditions };
      return this.find(filter, options);
    } catch (error) {
      throw new Error(`Failed to search ${this.model.modelName}: ${error.message}`);
    }
  }

  // Bulk operations
  async bulkWrite(operations) {
    try {
      return await this.model.bulkWrite(operations);
    } catch (error) {
      throw new Error(`Failed to bulk write ${this.model.modelName}: ${error.message}`);
    }
  }

  // Index operations
  async createIndex(indexSpec, options = {}) {
    try {
      return await this.model.createIndex(indexSpec, options);
    } catch (error) {
      throw new Error(`Failed to create index for ${this.model.modelName}: ${error.message}`);
    }
  }

  async ensureIndexes() {
    try {
      return await this.model.ensureIndexes();
    } catch (error) {
      throw new Error(`Failed to ensure indexes for ${this.model.modelName}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
