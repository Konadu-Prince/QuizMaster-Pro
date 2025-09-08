const express = require('express');
const { getMyQuizzes } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/my-quizzes', getMyQuizzes);

module.exports = router;

