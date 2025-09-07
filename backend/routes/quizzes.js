const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getMyQuizzes,
  togglePublishQuiz
} = require('../controllers/quizController');

const router = express.Router();

// Validation middleware for quiz creation/update
const quizValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'science', 'history', 'math', 'language', 'technology', 'sports', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('timeLimit')
    .optional()
    .isInt({ min: 30, max: 3600 })
    .withMessage('Time limit must be between 30 and 3600 seconds'),
  body('passPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Pass percentage must be between 0 and 100'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.question')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Question text is required and must be less than 500 characters'),
  body('questions.*.type')
    .isIn(['multiple-choice', 'true-false', 'fill-in-the-blank'])
    .withMessage('Invalid question type'),
  body('questions.*.answers')
    .isArray({ min: 2 })
    .withMessage('At least 2 answers are required'),
  body('questions.*.answers.*.text')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Answer text is required and must be less than 200 characters'),
  body('questions.*.answers.*.correct')
    .isBoolean()
    .withMessage('Answer correctness must be specified'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

// Public routes
router.get('/', getQuizzes);

// Protected routes
router.use(protect);

router.get('/my-quizzes', getMyQuizzes);
router.get('/:id', getQuiz);
router.post('/', quizValidation, createQuiz);
router.put('/:id', quizValidation, updateQuiz);
router.delete('/:id', deleteQuiz);
router.patch('/:id/publish', togglePublishQuiz);

module.exports = router;
