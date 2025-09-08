const mongoose = require('mongoose');

// @desc    Health check
// @route   GET /api/health
// @access  Public
const healthCheck = async (req, res, next) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      version: '1.0.0'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  healthCheck
};