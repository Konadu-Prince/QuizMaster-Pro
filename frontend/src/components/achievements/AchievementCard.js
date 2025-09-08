import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Clock, 
  Users,
  Lock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import achievementService from '../../services/achievementService';

const AchievementCard = ({ 
  achievement, 
  userStats, 
  isUnlocked = false, 
  progress = 0,
  onClick 
}) => {
  const getCategoryIcon = (category) => {
    const icons = {
      quiz_creation: Target,
      quiz_taking: Zap,
      streak: TrendingUp,
      social: Users,
      milestone: Trophy,
      special: Star
    };
    return icons[category] || Trophy;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-300 bg-green-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      common: '🥉',
      uncommon: '🥈',
      rare: '🥇',
      epic: '💎',
      legendary: '👑'
    };
    return icons[rarity] || '🥉';
  };

  const CategoryIcon = getCategoryIcon(achievement.category);
  const rarityInfo = achievementService.getRarityInfo(achievement.rarity);
  const progressPercentage = achievementService.getAchievementProgress(achievement, userStats);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isUnlocked 
          ? 'border-green-400 bg-green-50 shadow-lg' 
          : getRarityColor(achievement.rarity)
        }
        ${onClick ? 'hover:shadow-md' : ''}
      `}
      onClick={onClick}
    >
      {/* Rarity Badge */}
      <div className="absolute -top-2 -right-2">
        <span className="text-2xl">{getRarityIcon(achievement.rarity)}</span>
      </div>

      {/* Achievement Icon */}
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-md">
        {isUnlocked ? (
          <CheckCircle className="w-8 h-8 text-green-500" />
        ) : (
          <CategoryIcon className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Achievement Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {achievement.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {achievement.description}
        </p>

        {/* Points */}
        <div className="flex items-center justify-center mb-4">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium text-gray-700">
            {achievement.points} points
          </span>
        </div>

        {/* Progress Bar */}
        {!isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Category and Rarity */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{achievement.category.replace('_', ' ')}</span>
          <span className="capitalize font-medium" style={{ color: rarityInfo.color }}>
            {achievement.rarity}
          </span>
        </div>
      </div>

      {/* Unlocked Badge */}
      {isUnlocked && (
        <div className="absolute top-2 left-2">
          <div className="flex items-center px-2 py-1 bg-green-500 text-white text-xs rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            Unlocked
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementCard;


