const express = require('express');
const {
  startQuiz,
  submitAnswer,
  completeQuiz,
  getMyAttempts,
  getQuizAttempt,
  getQuizResults
} = require('../controllers/quizAttemptController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/start', startQuiz);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeQuiz);
router.get('/my-attempts', getMyAttempts);
router.get('/:id', getQuizAttempt);
router.get('/quiz/:quizId/results', getQuizResults);

module.exports = router;