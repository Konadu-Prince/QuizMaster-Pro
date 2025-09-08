const express = require('express');
const { getAchievements, getMyAchievements, unlockAchievement } = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAchievements);

// Protected routes
router.use(protect);
router.get('/my-achievements', getMyAchievements);
router.post('/unlock', unlockAchievement);

module.exports = router;