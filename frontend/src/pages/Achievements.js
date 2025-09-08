import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  TrendingUp, 
  Users,
  Filter,
  Search,
  Award,
  CheckCircle
} from 'lucide-react';
import { 
  fetchAchievements, 
  fetchMyAchievements, 
  fetchAchievementProgress,
  clearError 
} from '../store/slices/achievementSlice';
import AchievementCard from '../components/achievements/AchievementCard';
import Leaderboard from '../components/achievements/Leaderboard';
import achievementService from '../services/achievementService';

const Achievements = () => {
  const dispatch = useDispatch();
  const { 
    achievements, 
    myAchievements, 
    progress, 
    isLoading, 
    error 
  } = useSelector((state) => state.achievements);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchAchievements());
    if (user) {
      dispatch(fetchMyAchievements());
      dispatch(fetchAchievementProgress());
    }
  }, [dispatch, user]);

  const categories = achievementService.getCategories();
  const rarities = achievementService.getRarities();

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesRarity && matchesSearch;
  });

  const unlockedAchievementIds = myAchievements
    .filter(ua => ua.isUnlocked)
    .map(ua => ua.achievement._id);

  const getProgressStats = () => {
    if (!progress.length) return { total: 0, unlocked: 0, percentage: 0 };
    
    const total = progress.reduce((sum, cat) => sum + cat.total, 0);
    const unlocked = progress.reduce((sum, cat) => sum + cat.unlocked, 0);
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    
    return { total, unlocked, percentage };
  };

  const getTotalPoints = () => {
    if (!progress.length) return 0;
    return progress.reduce((sum, cat) => sum + cat.points, 0);
  };

  const progressStats = getProgressStats();
  const totalPoints = getTotalPoints();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Achievements - QuizMaster Pro</title>
        <meta name="description" content="Track your progress and unlock achievements in QuizMaster Pro." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Achievements
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Track your progress and unlock rewards
            </p>
          </div>

          {/* Progress Overview */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Points
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {totalPoints.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center">
                  <Award className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Achievements
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {progressStats.unlocked}/{progressStats.total}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Progress
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      {progressStats.percentage}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {activeTab === 'achievements' && (
            <>
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search achievements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>

                  {/* Rarity Filter */}
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Rarities</option>
                    {rarities.map(rarity => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.icon} {rarity.label}
                      </option>
                    ))}
                  </select>

                  {/* Unlocked Only Toggle */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showUnlockedOnly}
                      onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Unlocked only</span>
                  </label>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAchievements.map((achievement, index) => {
                  const isUnlocked = unlockedAchievementIds.includes(achievement._id);
                  
                  if (showUnlockedOnly && !isUnlocked) return null;
                  
                  return (
                    <motion.div
                      key={achievement._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AchievementCard
                        achievement={achievement}
                        isUnlocked={isUnlocked}
                        progress={0} // TODO: Calculate progress
                      />
                    </motion.div>
                  );
                })}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No achievements found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}
        </div>
      </div>
    </>
  );
};

export default Achievements;


