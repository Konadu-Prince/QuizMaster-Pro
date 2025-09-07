const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  getUserAttempts,
  getUserQuizzes,
  deleteUserAccount,
  getPublicUserProfile
} = require('../controllers/userController');

const router = express.Router();

// Validation middleware for profile updates
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Public routes
router.get('/:username', getPublicUserProfile);

// Protected routes
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, updateUserProfile);
router.get('/dashboard', getUserDashboard);
router.get('/attempts', getUserAttempts);
router.get('/quizzes', getUserQuizzes);
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], deleteUserAccount);

module.exports = router;
