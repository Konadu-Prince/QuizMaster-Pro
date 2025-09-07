const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  getQuizAttempt,
  getUserQuizAttempts,
  getQuizAttemptStats
} = require('../controllers/quizAttemptController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation middleware
const startAttemptValidation = [
  body('quizId')
    .isMongoId()
    .withMessage('Valid quiz ID is required')
];

const submitAnswerValidation = [
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('selectedAnswer')
    .isMongoId()
    .withMessage('Valid answer ID is required'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
];

// Routes
router.post('/start', startAttemptValidation, startQuizAttempt);
router.post('/:id/answer', submitAnswerValidation, submitAnswer);
router.post('/:id/complete', completeQuizAttempt);
router.get('/stats', getQuizAttemptStats);
router.get('/', getUserQuizAttempts);
router.get('/:id', getQuizAttempt);

module.exports = router;
