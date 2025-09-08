const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
require('dotenv').config();

const achievements = [
  // Quiz Creation Achievements
  {
    name: 'First Quiz',
    description: 'Create your first quiz',
    icon: '🎯',
    category: 'quiz_creation',
    type: 'count',
    criteria: { count: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    name: 'Quiz Creator',
    description: 'Create 5 quizzes',
    icon: '📝',
    category: 'quiz_creation',
    type: 'count',
    criteria: { count: 5 },
    points: 25,
    rarity: 'uncommon'
  },
  {
    name: 'Quiz Master',
    description: 'Create 25 quizzes',
    icon: '🏆',
    category: 'quiz_creation',
    type: 'count',
    criteria: { count: 25 },
    points: 100,
    rarity: 'rare'
  },
  {
    name: 'Quiz Legend',
    description: 'Create 100 quizzes',
    icon: '👑',
    category: 'quiz_creation',
    type: 'count',
    criteria: { count: 100 },
    points: 500,
    rarity: 'legendary'
  },

  // Quiz Taking Achievements
  {
    name: 'First Attempt',
    description: 'Take your first quiz',
    icon: '🎯',
    category: 'quiz_taking',
    type: 'count',
    criteria: { count: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    name: 'Quiz Taker',
    description: 'Take 10 quizzes',
    icon: '📚',
    category: 'quiz_taking',
    type: 'count',
    criteria: { count: 10 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    name: 'Quiz Enthusiast',
    description: 'Take 50 quizzes',
    icon: '🔥',
    category: 'quiz_taking',
    type: 'count',
    criteria: { count: 50 },
    points: 200,
    rarity: 'rare'
  },
  {
    name: 'Quiz Addict',
    description: 'Take 200 quizzes',
    icon: '⚡',
    category: 'quiz_taking',
    type: 'count',
    criteria: { count: 200 },
    points: 1000,
    rarity: 'epic'
  },

  // Streak Achievements
  {
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    type: 'streak',
    criteria: { streak: 3 },
    points: 25,
    rarity: 'common'
  },
  {
    name: 'Consistent',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    type: 'streak',
    criteria: { streak: 7 },
    points: 75,
    rarity: 'uncommon'
  },
  {
    name: 'Dedicated',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    category: 'streak',
    type: 'streak',
    criteria: { streak: 30 },
    points: 300,
    rarity: 'rare'
  },
  {
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '🔥',
    category: 'streak',
    type: 'streak',
    criteria: { streak: 100 },
    points: 1000,
    rarity: 'legendary'
  },

  // Score Achievements
  {
    name: 'Perfect Score',
    description: 'Get a perfect score (100%) on a quiz',
    icon: '💯',
    category: 'milestone',
    type: 'score',
    criteria: { score: 100 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    name: 'High Achiever',
    description: 'Get a score of 90% or higher on a quiz',
    icon: '⭐',
    category: 'milestone',
    type: 'score',
    criteria: { score: 90 },
    points: 25,
    rarity: 'common'
  },
  {
    name: 'Speed Demon',
    description: 'Complete a quiz in under 2 minutes',
    icon: '⚡',
    category: 'milestone',
    type: 'time',
    criteria: { timeLimit: 120 },
    points: 75,
    rarity: 'rare'
  },
  {
    name: 'Lightning Fast',
    description: 'Complete a quiz in under 1 minute',
    icon: '⚡',
    category: 'milestone',
    type: 'time',
    criteria: { timeLimit: 60 },
    points: 150,
    rarity: 'epic'
  },

  // Social Achievements
  {
    name: 'Popular',
    description: 'Get 10 likes on your quizzes',
    icon: '👍',
    category: 'social',
    type: 'social',
    criteria: { count: 10 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    name: 'Viral',
    description: 'Get 100 likes on your quizzes',
    icon: '🔥',
    category: 'social',
    type: 'social',
    criteria: { count: 100 },
    points: 250,
    rarity: 'rare'
  },

  // Special Achievements
  {
    name: 'Early Adopter',
    description: 'Join QuizMaster Pro in the first month',
    icon: '🚀',
    category: 'special',
    type: 'custom',
    criteria: { customCondition: 'early_user' },
    points: 100,
    rarity: 'epic',
    isHidden: true
  },
  {
    name: 'Beta Tester',
    description: 'Help test new features',
    icon: '🧪',
    category: 'special',
    type: 'custom',
    criteria: { customCondition: 'beta_tester' },
    points: 200,
    rarity: 'legendary',
    isHidden: true
  }
];

const seedAchievements = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizmaster-pro');
    console.log('Connected to MongoDB');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');

    // Insert new achievements
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`Created ${createdAchievements.length} achievements`);

    // Display summary
    const categories = {};
    const rarities = {};
    
    createdAchievements.forEach(achievement => {
      categories[achievement.category] = (categories[achievement.category] || 0) + 1;
      rarities[achievement.rarity] = (rarities[achievement.rarity] || 0) + 1;
    });

    console.log('\nAchievements by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    console.log('\nAchievements by Rarity:');
    Object.entries(rarities).forEach(([rarity, count]) => {
      console.log(`  ${rarity}: ${count}`);
    });

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  }
};

seedAchievements();


