import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { fetchLeaderboard, fetchUserRank } from '../../store/slices/achievementSlice';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { leaderboard, userRank, isLoading } = useSelector((state) => state.achievements);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedType, setSelectedType] = useState('totalPoints');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchLeaderboard({ type: selectedType, limit }));
    if (user) {
      dispatch(fetchUserRank(selectedType));
    }
  }, [dispatch, selectedType, limit, user]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      totalPoints: Trophy,
      currentStreak: TrendingUp,
      quizzesCreated: Target,
      quizzesTaken: Zap
    };
    return icons[type] || Trophy;
  };

  const getTypeLabel = (type) => {
    const labels = {
      totalPoints: 'Total Points',
      currentStreak: 'Current Streak',
      quizzesCreated: 'Quizzes Created',
      quizzesTaken: 'Quizzes Taken'
    };
    return labels[type] || type;
  };

  const formatValue = (type, value) => {
    switch (type) {
      case 'totalPoints':
        return value.toLocaleString();
      case 'currentStreak':
        return `${value} days`;
      default:
        return value.toString();
    }
  };

  const TypeIcon = getTypeIcon(selectedType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Leaderboard
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="totalPoints">Total Points</option>
            <option value="currentStreak">Current Streak</option>
            <option value="quizzesCreated">Quizzes Created</option>
            <option value="quizzesTaken">Quizzes Taken</option>
          </select>
          
          {/* Limit Selector */}
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* User Rank */}
      {userRank && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TypeIcon className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">
                Your {getTypeLabel(selectedType)} Rank
              </span>
            </div>
            <span className="text-lg font-bold text-blue-900">
              #{userRank.rank || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = user && entry.user._id === user._id;
          
          return (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${getRankColor(rank)}
                ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {entry.user.avatar ? (
                      <img 
                        src={entry.user.avatar} 
                        alt={entry.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {entry.user.firstName} {entry.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">@{entry.user.username}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(selectedType, entry[selectedType])}
                </div>
                <div className="text-sm text-gray-600">
                  Level {entry.level}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No leaderboard data available</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;


