// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
const getAchievements = async (req, res, next) => {
  try {
    const achievements = [
      {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        points: 10,
        category: 'beginner'
      },
      {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes',
        icon: '🏆',
        points: 50,
        category: 'achievement'
      },
      {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: '💯',
        points: 25,
        category: 'performance'
      },
      {
        id: 'creator',
        name: 'Creator',
        description: 'Create your first quiz',
        icon: '✏️',
        points: 20,
        category: 'creation'
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day quiz streak',
        icon: '🔥',
        points: 100,
        category: 'streak'
      }
    ];

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my achievements
// @route   GET /api/achievements/my-achievements
// @access  Private
const getMyAchievements = async (req, res, next) => {
  try {
    // For now, return empty array
    // In a real app, this would check the user's unlocked achievements
    const myAchievements = [];

    res.json({
      success: true,
      data: myAchievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock achievement
// @route   POST /api/achievements/unlock
// @access  Private
const unlockAchievement = async (req, res, next) => {
  try {
    const { achievementId } = req.body;

    // For now, just return success
    // In a real app, this would check conditions and unlock the achievement
    res.json({
      success: true,
      message: 'Achievement unlocked!',
      data: {
        achievementId,
        unlockedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAchievements,
  getMyAchievements,
  unlockAchievement
};