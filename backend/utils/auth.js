const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  console.log('sendTokenResponse called with:', { user: user._id, statusCode });
  // Create token
  const token = generateToken(user._id);

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: user,
    });
};

module.exports = {
  generateToken,
  sendTokenResponse,
};