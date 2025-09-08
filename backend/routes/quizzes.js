const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getMyQuizzes,
  publishQuiz,
  unpublishQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getQuizzes);

// Protected routes
router.use(protect);

router.get('/user/my-quizzes', getMyQuizzes);
router.get('/:id', getQuiz);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);
router.patch('/:id/publish', publishQuiz);
router.patch('/:id/unpublish', unpublishQuiz);

module.exports = router;